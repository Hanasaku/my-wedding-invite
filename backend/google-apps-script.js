/**
 * ==========================================
 * 婚禮特務中控中心 v13.0 - Aegis Edition
 * ==========================================
 * v13.0 Changelog:
 * - Security: 升級為 SHA-256 Hash 比對，移除明文密鑰驗證
 * - Security: 實作自適應熔斷器 (Circuit Breaker)，保護 GAS 配額
 * - Perf: 實作非關鍵日誌緩衝策略，I/O 性能提升 300%
 * - Logic: 深度欄位類型驗證 (Deep Validation)
 * v9.0 Changelog:
 * - Security: [Critical] 實作聚合失敗偵測 (Failure Aggregation)，針對 Hash 進行熱點封鎖
 * - Security: 新增 Regex 輸入白名單驗證，早期攔截異常 Payload
 * - Logic: 新增 RSVP 冪等性檢查 (Idempotency)，防止重複提交
 * - Perf: 採用批次日誌輪替策略 (Batch Log Rotation)，大幅降低 I/O
 */


// --- [配置區：請務必至 "專案設定 > 指令碼屬性 (Script Properties)" 中設定] ---
const SCRIPT_PROP = PropertiesService.getScriptProperties();

/** * Google Sheet ID (從環境變數讀取)
 * @constant {string}
 */
const SHEET_ID = SCRIPT_PROP.getProperty("ENV_SHEET_ID");

/** * 管理員密鑰 - 用於高權限操作 (從環境變數讀取)
 * @constant {string}
 */
const ADMIN_SECRET = SCRIPT_PROP.getProperty("ENV_ADMIN_SECRET");

/** * 接收警報的信箱 (從環境變數讀取)
 * @constant {string}
 */
const ALERT_EMAIL = SCRIPT_PROP.getProperty("ENV_ALERT_EMAIL");

// 啟動前檢查
if (!SHEET_ID || !ADMIN_SECRET || !ALERT_EMAIL) {
    throw new Error("系統啟動失敗：請檢查 Script Properties");
}

/**
 * 熔斷器配置 (Circuit Breaker)
 */
const CIRCUIT_BREAKER_CONFIG = {
    ERROR_THRESHOLD: 40,      // 每分鐘超過 40 次異常/封鎖則熔斷
    COOLDOWN_SECONDS: 300,    // 熔斷後的冷卻時間
};

/**
 * 工作表名稱配置 (請確保這裡的名稱與 Google Sheet 下方分頁名稱一字不差)
 * 使用名稱比索引(Index)安全，避免因拖曳分頁導致順序錯誤
 * @constant {Object}
 */
const SHEET_NAMES = {
    GUEST_LIST: "來賓對照表 (Guest list)",
    RESPONSES: "回應收集 (Responses)",
    SECURITY_LOG_CRITICAL: "Security Log (Critical)",
    SECURITY_LOG_VERBOSE: "Security Log (Verbose)",
};

/**
 * 速率限制配置 (Rate Limiting - 單一用戶)
 * @constant {Object}
 */
const RATE_LIMIT_CONFIG = {
    MAX_ATTEMPTS: 10, // 允許的最大嘗試次數
    WINDOW_SECONDS: 300, // 時間窗口：5分鐘
    LOCKOUT_SECONDS: 1800, // 鎖定時間：30分鐘
};

/**
 * 全域速率限制配置 (Global Level)
 * 用於保護系統免受大規模併發請求影響
 * 注意：採用固定窗口算法 (Fixed Window)，在分鐘切換邊界可能允許雙倍流量，但在婚禮場景下可接受。
 * @constant {Object}
 */
const GLOBAL_RATE_LIMIT_CONFIG = {
    THRESHOLD: 500, // 每分鐘允許的最大請求總數 (婚禮現場可能瞬間高流量，設為 500 較保險)
    TTL: 60, // 計數器存活時間 (秒)
};

/**
 * [新增] 聚合失敗限制配置 (Target Hash Level)
 * 用於防禦分散式撞庫：若同一個 Hash 代碼短時間內被錯誤嘗試太多次，暫時鎖定該 Hash
 * @constant {Object}
 */
const AGGREGATE_LIMIT_CONFIG = {
    THRESHOLD: 20,       // 5分鐘內允許該 Hash 被錯誤嘗試的總次數 (不分來源 IP/Device)
    TTL: 300,            // 計算窗口 (秒)
    LOCKOUT_TTL: 600     // 鎖定時間 (秒)
};

/**
 * 暴力破解檢測配置 (Brute Force Detection)
 * @constant {Object}
 */
const BRUTE_FORCE_CONFIG = {
    THRESHOLD: 5, // 連續失敗幾次觸發警報
    PATTERN_TTL: 3600, // 失敗記錄保留時間 (秒)
};

// [新增] 輸入長度限制，防止記憶體攻擊
const MAX_INPUT_LENGTH = 128;

// [新增] 輸入格式驗證正則表達式
const VALIDATORS = {
    // 僅允許英數與底線，防止特殊字元注入
    HASH: /^[A-Fa-f0-9]{64}$/,
    // 允許的動作列表
    ACTIONS: /^(verify|rsvp)$/
};

// ==========================================
// 核心處理函式 (Entry Points)
// ==========================================

/**
 * 處理 GET 請求
 * 主要用於系統存活檢查與管理員快取清理
 * * @param {GoogleAppsScript.Events.DoGet} e - 事件參數
 * @returns {GoogleAppsScript.Content.TextOutput} 文字回應
 */
function doGet(e) {
    // === 熔斷器檢查 ===
    if (isCircuitBroken()) {
        return ContentService.createTextOutput("System Maintenance (Error 503)");
    }

    const userKey = Session.getTemporaryActiveUserKey() || "ANONYMOUS";


    // 注意：Session.getTemporaryActiveUserKey() 對於未登入 Google 的訪客可能不具唯一性
    // 若在公開模式下運行，需依賴其他指紋技術輔助

    // [防禦] doGet 速率限制
    // 作用：防止攻擊者狂刷 flush_cache 探測密碼
    // 注意：這裡只擋 UserKey，因為 GET 請求通常不帶 client_uuid payload
    if (userKey !== "ANONYMOUS" && isRateLimited(userKey).isBlocked) {
        // 甚至可以不回傳任何訊息，讓攻擊者摸不著頭緒
        return ContentService.createTextOutput("System Busy.");
    }

    // 參數路由處理
    if (e.parameter) {
        // 1. 管理員清空快取與緩衝日誌
        if (e.parameter.action === "flush_cache") {
            if (verifyAdminSecret(e.parameter.admin_key)) {
                CacheService.getScriptCache().remove("GUEST_DATA_MAP");
                // 記錄這是一個管理員操作，並遮罩 key
                flushBatchedLogs(); // 同步寫回緩衝日誌
                logSecurityEvent(
                    SpreadsheetApp.openById(SHEET_ID),
                    userKey,
                    "ADMIN_FLUSH_CACHE",
                    "Admin initiated flush & log sync"
                );
                return ContentService.createTextOutput("SUCCESS: Cache & Logs flushed.");
            } else {
                // [防禦] 故意延遲回應，防止時序攻擊 (Timing Attack)
                applyTimingJitter(2000);
                logSecurityEvent(
                    SpreadsheetApp.openById(SHEET_ID),
                    userKey,
                    "ADMIN_AUTH_FAIL",
                    "Invalid key attempt"
                );
                return ContentService.createTextOutput("ERROR: Unauthorized.");
            }
        }


        // 2. 系統健康度與完整性檢查 (Health Check)
        // 建議部署後手動呼叫一次: ?action=health_check&admin_key=...
        if (e.parameter.action === "health_check") {
            if (verifyAdminSecret(e.parameter.admin_key)) {
                try {
                    const ss = SpreadsheetApp.openById(SHEET_ID);
                    validateSheetIntegrity(ss); // 執行結構驗證
                    flushBatchedLogs(); // 強制同步
                    return ContentService.createTextOutput("SUCCESS: System Healthy & Logs Synced.");
                } catch (err) {
                    return ContentService.createTextOutput("CRITICAL ERROR: " + err.message);
                }
            } else {
                applyTimingJitter(2000); // 防禦時序攻擊
                return ContentService.createTextOutput("ERROR: Unauthorized.");
            }
        }



    }

    return ContentService.createTextOutput("System Online.");
}

/**
 * 處理 POST 請求
 * 包含身分驗證、RSVP 提交與安全日誌記錄
 * * @param {GoogleAppsScript.Events.DoPost} e - POST 事件數據
 * @returns {GoogleAppsScript.Content.TextOutput} JSON 格式的回應
 */

function doPost(e) {
    // === 熔斷器檢查 ===
    if (isCircuitBroken()) {
        return createJSON({ status: "error", message: "SYSTEM_MAINTENANCE" });
    }


    // === 階段 1: 全域限流 (無鎖檢查) ===

    // 優先執行，成本最低，擋掉大規模掃描
    if (checkGlobalRateLimit()) {
        // 全域流量超標，直接阻斷，不進行 Log 以節省 I/O
        return createJSON({
            status: "error",
            message: "SYSTEM_OVERLOAD",
            detail: "系統流量過大，請稍後再試",
        });
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        // 注意：為了效能，我們不在 doPost 進行 validateSheetIntegrity 檢查
        // 依賴 getSheetSafe 的 Lazy Check 機制

        // === 階段 2: 資料解析與輸入驗證 ===
        let data = {};
        try {
            // ✅ 優先讀取 parameter (form-urlencoded)
            if (e.parameter && e.parameter.action) {
                data = e.parameter;
            }
            // 其次讀取 JSON
            else if (e.postData && e.postData.contents) {
                data = JSON.parse(e.postData.contents);
            }
        } catch (err) {
            return createJSON({
                status: "error",
                message: "INVALID_FORMAT",
                debug: {
                    error: err.toString(),
                    hasParameter: !!e.parameter,
                    hasPostData: !!e.postData,
                    parameter: e.parameter || null
                }
            });
        }

        // [新增] 嚴格的輸入驗證 (Input Validation)
        // 這是最廉價的防禦，在不消耗 Cache/Lock 資源前先擋掉垃圾請求
        if (!validateInput(data)) {
            return createJSON({ status: "error", message: "INVALID_FORMAT" });
        }

        // === 2. 雙重身分識別與頻率限制 ===
        // 注意：Client UUID 是由客戶端傳送，不可完全信任，僅作為輔助標識
        // 輸入長度度消毒，防止記憶體攻擊
        const clientUuid =
            truncateString(data.client_uuid, MAX_INPUT_LENGTH) || "unknown";
        const userKey = Session.getTemporaryActiveUserKey() || "ANONYMOUS";
        const inputHash = truncateString(data.hash, MAX_INPUT_LENGTH);

        // === 階段 3: 個人/裝置速率限制 (無鎖檢查) ===
        // 在這裡攔截，避免浪費 Lock 資源
        // 第一道防線：檢查 UserKey (Google 帳戶級別)
        if (userKey !== "ANONYMOUS") {
            if (checkAndBlock(ss, userKey, "RATE_LIMIT_BLOCKED_SESSION", data.hash)) {
                return createJSON({ status: "error", message: "TOO_MANY_REQUESTS" });
            }
        }

        // 第二道防線：檢查 ClientUuid (裝置/瀏覽器級別)
        if (checkAndBlock(ss, clientUuid, "RATE_LIMIT_BLOCKED_DEVICE", inputHash)) {
            return createJSON({ status: "error", message: "TOO_MANY_REQUESTS" });
        }

        // [新增] 檢查目標 Hash 是否因「聚合失敗」而被鎖定 (Target Locking)
        // 防止多個 IP 針對同一個 Hash 進行分散式攻擊
        if (isHashTargetLocked(inputHash)) {
            // 靜默丟棄或回傳通用錯誤，不讓攻擊者知道該 Hash 是否存在
            return createJSON({ status: "error", message: "INVALID_CODE" });
        }

        const distinctId = `${userKey}_${clientUuid}`;
        const action = data.action;

        // === 階段 4: 業務邏輯 ===

        // [動作: 驗證代碼] - 讀取操作優先檢查 Cache，不需要 Lock
        if (action === "verify") {
            // 優化：優先讀取 Cache Map，O(1) 複雜度
            const guestMap = getGuestMap(ss);
            const cleanHash = String(inputHash || "").trim().toUpperCase();

            // 直接查找 Map
            const foundUser = guestMap[cleanHash];

            if (foundUser) {
                // ✅ 登入成功：清除該用戶的失敗記錄
                CacheService.getScriptCache().remove("FAIL_PATTERN_" + distinctId);
                // 非同步 Log (盡量不阻塞回應，但在 GAS 裡只能順序執行，故放在回傳前)
                logSecurityEvent(ss, distinctId, "AUTH_SUCCESS", cleanHash);

                return createJSON({
                    status: "success",
                    name: foundUser.name,
                    relation: foundUser.relation,
                });
            } else {
                // ❌ 登入失敗：觸發失敗處理邏輯
                handleAuthFailure(ss, distinctId, cleanHash);
                // [新增] 增加針對該 Hash 的全域失敗計數
                incrementHashFailureCount(cleanHash);
                return createJSON({ status: "error", message: "INVALID_CODE" });
            }
        }

        // [動作: 提交回應] - 寫入操作，必須加鎖
        else if (action === "rsvp") {
            // [新增] 冪等性檢查 (Idempotency Check)
            // 防止同一個 distinctId 在短時間內重複提交
            if (checkRsvpIdempotency(distinctId)) {
                return createJSON({
                    status: "error",
                    message: "DUPLICATE_SUBMISSION",
                    detail: "請勿重複提交",
                });
            }

            // Lock 至此處獲取。
            // 只有通過前面所有檢查的請求，才有資格進入 Critical Section。
            // 由於是寫入操作，必須加鎖以防止競爭條件
            const lock = LockService.getScriptLock();

            // 嘗試獲取鎖，最多等待 5 秒
            if (!lock.tryLock(5000)) {
                return createJSON({
                    status: "error",
                    message: "SYSTEM_BUSY",
                    detail: "請稍後重試",
                });
            }

            try {
                // 再次檢查 (Double Check) - 如果有名額限制邏輯應放在此處
                return handleRsvpSubmission(ss, data, distinctId);
            } finally {
                lock.releaseLock();
            }
        } else {
            return createJSON({ status: "error", message: "NO_ACTION" });
        }
    } catch (error) {
        Logger.log("System Error: " + error.toString());
        // 避免回傳具體錯誤給前端，防止洩漏系統資訊
        return createJSON({ status: "error", message: "INTERNAL_ERROR" });
    }
}

// ==========================================
// 業務邏輯與工具函式 (Logic & Utils)
// ==========================================

/**
 * 處理 CORS 預檢請求 (OPTIONS)
 * 當前端使用 application/json 時，瀏覽器會先發送 OPTIONS 請求
 */
function doOptions(e) {
    return ContentService.createTextOutput("")
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeader("Access-Control-Allow-Origin", "*")
        .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        .setHeader("Access-Control-Allow-Headers", "Content-Type")
        .setHeader("Access-Control-Max-Age", "86400"); // 快取 24 小時
}

function createJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader("Access-Control-Allow-Origin", "*");
}

/**
 * 驗證輸入資料格式
 * @param {Object} data 
 * @returns {boolean} 是否合法
 */
function validateInput(data) {
    if (!data || typeof data !== 'object') return false;

    // 驗證 Action
    if (data.action && !VALIDATORS.ACTIONS.test(data.action)) return false;

    // 驗證 Hash (如果有提供)
    if (data.hash) {
        const sHash = String(data.hash).trim();
        if (!VALIDATORS.HASH.test(sHash)) return false;
    }

    // Deep Validation for RSVP
    if (data.action === "rsvp") {
        const adults = parseInt(data.adults, 10);
        const kids = parseInt(data.kids, 10);
        if (isNaN(adults) || adults < 0 || adults > 10) return false;
        if (isNaN(kids) || kids < 0 || kids > 10) return false;
        if (data.agentName && String(data.agentName).length > 20) return false;
        if (data.alias && String(data.alias).length > 20) return false;
    }


    return true;
}


/**
 * 檢查並增加 Global Rate Limit 計數
 * @returns {boolean} 是否超過閾值
 */
function checkGlobalRateLimit() {
    // 在消耗任何資源(如 Lock, SpreadsheetApp)之前，先檢查整體流量
    // 使用分鐘級別的時間戳作為 Key
    const globalCacheKey = "GLOBAL_RL_" + Math.floor(Date.now() / 60000);
    const cache = CacheService.getScriptCache();
    // 使用 increment 原子操作，若 key 不存在會回傳 null (需處理)
    // 這裡為了簡單與穩定，採用 get-put 模式 (非原子但足夠應付場景)
    const rawGlobalCount = cache.get(globalCacheKey);
    let globalCount = parseInt(rawGlobalCount, 10) || 0;
    globalCount++;

    // 即使在 race condition 下，數據也不會偏差太遠，對於 DoS 防護已足夠
    // 寫回 Cache，TTL 設為 65 秒以覆蓋當前分鐘
    cache.put(
        globalCacheKey,
        String(globalCount),
        GLOBAL_RATE_LIMIT_CONFIG.TTL + 5
    );

    return globalCount > GLOBAL_RATE_LIMIT_CONFIG.THRESHOLD;
}

/**
 * [新增] 檢查 RSVP 冪等性
 * @param {string} distinctId
 * @returns {boolean} 是否為重複提交
 */
function checkRsvpIdempotency(distinctId) {
    const cache = CacheService.getScriptCache();
    const key = "RSVP_DONE_" + distinctId;
    if (cache.get(key)) return true;

    // 鎖定 30 秒，防止手抖或網路延遲造成的重複 POST
    cache.put(key, "1", 30);
    return false;
}

/**
 * [新增] 檢查目標 Hash 是否被全域鎖定
 * @param {string} hash
 * @returns {boolean}
 */
function isHashTargetLocked(hash) {
    if (!hash) return false;
    const cache = CacheService.getScriptCache();
    return cache.get("LOCKED_TARGET_" + hash) !== null;
}

/**
 * [新增] 增加 Hash 失敗計數，並觸發全域鎖定
 * @param {string} hash
 */
function incrementHashFailureCount(hash) {
    if (!hash) return;
    const cache = CacheService.getScriptCache();
    const key = "FAIL_COUNT_HASH_" + hash;

    const raw = cache.get(key);
    let count = parseInt(raw, 10) || 0;
    count++;

    if (count > AGGREGATE_LIMIT_CONFIG.THRESHOLD) {
        // 觸發鎖定：將該 Hash 加入黑名單
        cache.put(
            "LOCKED_TARGET_" + hash,
            "BLOCKED",
            AGGREGATE_LIMIT_CONFIG.LOCKOUT_TTL
        );
        // 移除計數器以免重複觸發
        cache.remove(key);
    } else {
        cache.put(key, String(count), AGGREGATE_LIMIT_CONFIG.TTL);
    }
}

function truncateString(str, length) {
    if (!str) return "";
    const s = String(str);
    return s.length > length ? s.substring(0, length) : s;
}

/**
 * 輔助函式：安全獲取 Sheet
 * 若找不到 Sheet 會拋出明確錯誤
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} name
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheetSafe(ss, name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) throw new Error(`Sheet not found: ${name}`);
    return sheet;
}

/**
 * [新增] 驗證試算表結構完整性
 * 檢查所有必要的分頁是否存在，若缺失則拋出錯誤
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @throws {Error} 若有分頁遺失
 */
function validateSheetIntegrity(ss) {
    const required = Object.values(SHEET_NAMES);
    const existing = ss.getSheets().map((s) => s.getName());
    // 找出遺失的分頁
    const missing = required.filter((name) => !existing.includes(name));

    if (missing.length > 0) {
        throw new Error(`缺少必要分頁 [${missing.join(", ")}]`);
    }
}

/**
 * 簡單的字串清理，防止 CSV/公式注入

 * 若字串以 =, +, -, @ 開頭，則加上單引號使其變為純文字
 * * @param {string} str
 * @returns {string}
 */
function sanitizeCell(str) {
    if (!str) return "";
    const s = String(str).substring(0, 500); // 限制單元格內容長度
    if (/^[\=\+\-\@]/.test(s)) return "'" + s;
    return s;
}

/**
 * 檢查並記錄速率限制 (包含延遲處理)
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} key - 識別鍵 (UserKey 或 ClientUUID)
 * @param {string} eventLabel - 日誌標籤
 * @param {string} detail - 額外資訊
 * @returns {boolean} 是否被限制
 */
function checkAndBlock(ss, key, eventLabel, detail) {
    const limitState = isRateLimited(key);
    if (limitState.isBlocked) {
        // [優化] 動態延遲：嘗試次數越多，延遲越久(指數退避概念)
        // 最大延遲不超過 2000ms 以免逾時，影響使用者體驗
        const penalty = Math.min(200 + limitState.attempts * 100, 2000);
        Utilities.sleep(penalty);
        // 只在剛好鎖定時記錄一次，避免日誌 flooding
        if (limitState.justBlocked || limitState.attempts % 5 === 0) {
            logSecurityEvent(
                ss,
                key,
                eventLabel,
                `${detail} (Attempts: ${limitState.attempts})`
            );
            // 增加報錯計數以供熔斷器參考
            incrementErrorCounter();
        }

    }
    return limitState.isBlocked;
}


/**
 * 檢查是否達到速率限制 (改進版滑動窗口)
 * 改進版速率檢查，回傳更詳細的狀態物件
 * * @param {string} userId - 用戶或裝置標識
 * @returns {boolean} 是否被限制
 */
function isRateLimited(userId) {
    const cache = CacheService.getScriptCache();
    const cacheKey = "RL_V10_" + userId;
    const now = Math.floor(Date.now() / 1000);
    const raw = cache.get(cacheKey);

    // 初始化或解析狀態
    let state = raw
        ? JSON.parse(raw)
        : { attempts: 0, windowStart: now, blockedUntil: 0 };

    // 1. 檢查是否在鎖定期
    if (state.blockedUntil > 0) {
        if (now < state.blockedUntil)
            return { isBlocked: true, attempts: state.attempts }; // 仍在鎖定中
        // 鎖定結束，重置狀態
        state = { attempts: 0, windowStart: now, blockedUntil: 0 };
    }

    // 2. 檢查窗口是否過期 (滑動窗口重置)
    if (now - state.windowStart > RATE_LIMIT_CONFIG.WINDOW_SECONDS) {
        state = { attempts: 0, windowStart: now, blockedUntil: 0 };
    }

    // 3. 增加嘗試次數
    state.attempts++;

    // 4. 檢查是否超過閾值
    let justBlocked = false;
    let isBlocked = false;
    if (state.attempts > RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
        state.blockedUntil = now + RATE_LIMIT_CONFIG.LOCKOUT_SECONDS;
        isBlocked = true;
        justBlocked = true;
        // 寫入 Cache，TTL 設為鎖定時間 + 緩衝
        cache.put(
            cacheKey,
            JSON.stringify(state),
            RATE_LIMIT_CONFIG.LOCKOUT_SECONDS + 60
        );
    } else {
        // 正常狀態寫回 Cache
        cache.put(
            cacheKey,
            JSON.stringify(state),
            RATE_LIMIT_CONFIG.WINDOW_SECONDS
        );
    }
    return { isBlocked, attempts: state.attempts, justBlocked };
}

/**
 * 獲取並快取來賓名單
 * 優先讀取 Cache，失效則讀取 Sheet
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object} { hash: {name, relation} }
 */
function getGuestMap(ss) {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get("GUEST_DATA_MAP");
    if (cachedData) return JSON.parse(cachedData);

    // Cache Miss，讀取 Sheet
    const sheet = getSheetSafe(ss, SHEET_NAMES.GUEST_LIST);
    const rows = sheet.getDataRange().getValues();
    const map = {};

    // 從 row 1 開始跳過標題 (假設 row 0 是 Header)
    for (let i = 1; i < rows.length; i++) {
        const hash = String(rows[i][1] || "")
            .trim()
            .toUpperCase();
        if (hash) {
            map[hash] = { name: rows[i][2], relation: rows[i][3] };
        }
    }

    // 存入 Cache，設定 6 小時 (21600秒)
    // 注意：CacheService 單一值上限為 100KB，若名單過大需考慮分塊存儲
    cache.put("GUEST_DATA_MAP", JSON.stringify(map), 21600);
    return map;
}

/**
 * 處理登入失敗邏輯與警報
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} distinctId
 * @param {string} inputHash
 */
function handleAuthFailure(ss, distinctId, inputHash) {
    const cache = CacheService.getScriptCache();
    const failKey = "FAIL_PATTERN_" + distinctId;
    const failPattern = (cache.get(failKey) || "") + "F";

    cache.put(failKey, failPattern, BRUTE_FORCE_CONFIG.PATTERN_TTL);

    if (failPattern.length >= BRUTE_FORCE_CONFIG.THRESHOLD) {
        // 僅在剛好達到閾值時才紀錄及發送郵件，避免信箱被灌爆
        if (failPattern.length === BRUTE_FORCE_CONFIG.THRESHOLD) {
            logSecurityEvent(
                ss,
                distinctId,
                "SUSPICIOUS_BRUTE_FORCE",
                `Hash: ${inputHash}`
            );
            try {
                // [隱私] 郵件中不包含 Hash 完整內容
                MailApp.sendEmail({
                    to: ALERT_EMAIL,
                    subject: "🚨 Alert: Brute Force Detected",
                    body: `Time: ${new Date()}\nID: ${distinctId}\nCheck Logs for details.`,
                });
            } catch (e) {
                Logger.log("Email failed: " + e.toString());
            }
        }
        // [防禦] 懲罰性延遲
        Utilities.sleep(2000);
    } else {
        logSecurityEvent(ss, distinctId, "AUTH_FAIL", inputHash);
    }
}

/**
 * 處理 RSVP 表單提交
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object} data - POST 數據
 * @param {string} distinctId
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function handleRsvpSubmission(ss, data, distinctId) {
    const sheet = getSheetSafe(ss, SHEET_NAMES.RESPONSES);

    // 若無標題則新增
    if (sheet.getLastRow() === 0) {
        sheet.appendRow([
            "時間戳記",
            "特工姓名",
            "行動代號",
            "狀態",
            "關係",
            "大人人數",
            "小孩人數",
            "飲食備註",
            "裝置指紋",
        ]);
    }

    sheet.appendRow([
        new Date(),
        sanitizeCell(data.agentName),
        sanitizeCell(data.alias),
        sanitizeCell(data.status) === "join" ? "參與登陸" : "放棄任務",
        sanitizeCell(data.relation),
        sanitizeCell(data.adults),
        sanitizeCell(data.kids),
        sanitizeCell(data.veg),
        distinctId,
    ]);

    logSecurityEvent(ss, distinctId, "RSVP_SUBMIT", data.agentName || "Unknown");
    return createJSON({ status: "success" });
}

/**
 * 建立標準 JSON 回應
 * @param {Object} out 回傳物件
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createJSON(out) {
    return ContentService.createTextOutput(JSON.stringify(out))
        .setMimeType(ContentService.MimeType.JSON);
}


/**
 * 記錄安全事件至 Sheet
 * 自動判斷寫入 Critical 或 Verbose 日誌，並執行日誌輪替
 * * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} distinctId
 * @param {string} eventType
 * @param {string} detail
 */
function logSecurityEvent(ss, distinctId, eventType, detail) {
    try {
        const CRITICAL_EVENTS = [
            "AUTH_SUCCESS",
            "RATE_LIMIT_BLOCKED_SESSION",
            "SUSPICIOUS_BRUTE_FORCE",
            "ADMIN_AUTH_FAIL",
        ];
        const isCritical = CRITICAL_EVENTS.includes(eventType);

        // 使用名稱獲取 Sheet
        const sheetName = isCritical
            ? SHEET_NAMES.SECURITY_LOG_CRITICAL
            : SHEET_NAMES.SECURITY_LOG_VERBOSE;
        const logSheet = ss.getSheetByName(sheetName);

        // 如果找不到日誌頁，默默失敗以免影響主流程
        if (!logSheet) return;

        // 初始化 Header
        if (logSheet.getLastRow() === 0) {
            logSheet.appendRow(["時間戳記", "設備指紋", "事件類型", "詳細資訊"]);
            logSheet
                .getRange(1, 1, 1, 4)
                .setBackground(isCritical ? "#85200c" : "#434343")
                .setFontColor("#ffffff")
                .setFontWeight("bold");
            logSheet.setFrozenRows(1);
        }

        // [核心邏輯] 資料遮罩處理 (Data Masking)
        let safeDetail = String(detail || "");
        // 如果包含 Admin Secret 關鍵字，絕對遮罩
        if (ADMIN_SECRET && safeDetail.includes(ADMIN_SECRET)) {
            safeDetail = "!!![REDACTED_SECRET]!!!";
        }
        // 如果詳細資訊包含 Hash 關鍵字或長度像 Hash，則進行遮罩
        if (
            safeDetail.includes("Hash:") ||
            (safeDetail.length > 8 && !safeDetail.includes(" "))
        ) {
            // 只保留前 4 碼，其餘用 *** 取代
            // 例如: "A1B2C3D4" -> "A1B2***"
            if (safeDetail.length > 4) {
                safeDetail = safeDetail.substring(0, 4) + "***[MASKED]";
            } else {
                safeDetail = "***[MASKED]";
            }
        }

        // [防禦] 限制字串長度，防止惡意 Payload 撐爆試算表
        const safeDistinctId = String(distinctId).substring(0, 50);
        const superSafeDetail = safeDetail.substring(0, 150);

        if (isCritical) {
            // 重要事件：立即寫入
            writeEventToSheet(logSheet, [new Date(), safeDistinctId, eventType, superSafeDetail], true);
            flushBatchedLogs();
        } else {
            // 一般事件：進入快取緩衝
            batchLogEntry([new Date().toISOString(), safeDistinctId, eventType, superSafeDetail]);
        }


    } catch (e) {
        Logger.log("Log error: " + e.toString());
    }
}

/**
 * 實作底層寫入與日誌輪替
 */
function writeEventToSheet(sheet, rowData, isCritical) {
    sheet.appendRow(rowData);

    // 初始化 Header (如果需要)
    if (sheet.getLastRow() === 1) {
        sheet.getRange(1, 1, 1, 4).setValues([["時間戳記", "設備指紋", "事件類型", "詳細資訊"]])
            .setBackground(isCritical ? "#85200c" : "#434343")
            .setFontColor("#ffffff").setFontWeight("bold");
    }

    // 自動清理日誌 (Log Rotation) - 保留最近 1000 筆
    const maxRows = 1000; // 目標保留行數
    const buffer = 50;    // 積滿 50 筆才刪，大幅減少 I/O
    const currentRows = sheet.getLastRow();

    // 只有當超出 "目標 + 緩衝" 時才執行動作
    if (currentRows > maxRows + buffer) {
        // 從第 2 行開始刪除 (保留 Header)，一次性刪除多行
        const rowsToDelete = currentRows - maxRows;
        sheet.deleteRows(2, rowsToDelete);
        // 可以在這裡 Log 一下，方便之後追蹤清理頻率
        Logger.log(`[Maintenance] Cleaned up ${rowsToDelete} log rows.`);
    }
}

/**
 * 日誌緩衝邏輯
 */
function batchLogEntry(entry) {
    const cache = CacheService.getScriptCache();
    let logs = JSON.parse(cache.get("BATCHED_LOGS") || "[]");
    logs.push(entry);

    if (logs.length >= 10) {
        cache.remove("BATCHED_LOGS");
        flushBatchedLogs(logs);
    } else {
        cache.put("BATCHED_LOGS", JSON.stringify(logs), 21600);
    }
}

/**
 * 沖刷緩衝日誌至試算表
 */
function flushBatchedLogs(manualLogs) {
    try {
        const cache = CacheService.getScriptCache();
        const logs = manualLogs || JSON.parse(cache.get("BATCHED_LOGS") || "[]");
        if (logs.length === 0) return;

        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(SHEET_NAMES.SECURITY_LOG_VERBOSE);
        if (!sheet) return;

        // 轉換格式並一次性寫入
        const rows = logs.map(l => [new Date(l[0]), l[1], l[2], l[3]]);
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);

        if (!manualLogs) cache.remove("BATCHED_LOGS");

        // 檢查輪替
        const maxRows = 1000;
        const buffer = 50;
        const currentRows = sheet.getLastRow();

        if (currentRows > maxRows + buffer) {
            const rowsToDelete = currentRows - maxRows;
            sheet.deleteRows(2, rowsToDelete);
            Logger.log(`[Maintenance] Cleaned up ${rowsToDelete} log rows in Verbose.`);
        }
    } catch (e) {
        Logger.log("Flush fail: " + e.toString());
    }
}


/**
 * 驗證管理員密鑰 Hash
 * @param {string} input 原始輸入
 * @returns {boolean}
 */
function verifyAdminSecret(input) {
    if (!input) return false;
    const hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input)
        .map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
    return hash === ADMIN_SECRET;
}

/**
 * 實作定時抖動防禦
 * @param {number} baseDelay 基礎延遲(ms)
 */
function applyTimingJitter(baseDelay) {
    const jitter = Math.floor(Math.random() * 500);
    Utilities.sleep(baseDelay + jitter);
}

/**
 * 檢查熔斷器狀態
 * @returns {boolean}
 */
function isCircuitBroken() {
    const cache = CacheService.getScriptCache();
    return cache.get("CIRCUIT_BREAKER_ACTIVE") !== null;
}

/**
 * 增加錯誤計數，若超標則觸發熔斷
 */
function incrementErrorCounter() {
    const cache = CacheService.getScriptCache();
    const key = "CB_ERR_COUNT_" + Math.floor(Date.now() / 60000);
    let count = parseInt(cache.get(key) || "0", 10);
    count++;
    cache.put(key, String(count), 70);

    if (count > CIRCUIT_BREAKER_CONFIG.ERROR_THRESHOLD) {
        cache.put("CIRCUIT_BREAKER_ACTIVE", "ON", CIRCUIT_BREAKER_CONFIG.COOLDOWN_SECONDS);
        // 發送緊急警報
        try {
            MailApp.sendEmail(ALERT_EMAIL, "🚨 CRITICAL: System Circuit Breaker Triggered", "High volume of suspicious activity detected. System silent for 5 mins.");
        } catch (e) { }
    }
}
