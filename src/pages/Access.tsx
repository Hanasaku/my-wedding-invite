import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { palette, hexToRGBA } from '@/assets/styles/palette';
import StarBackground from '@/components/common/StarBackground';
import HackingTitle from '@/components/common/HackingTitle';
import MissionButton from '@/components/common/MissionButton';
import { useCrypto } from '@/hooks/useCrypto';
import Invitation from '@/pages/Invitation';
import MissionMusic from '@/components/common/MissionMusic';

// 動畫效果
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const flicker = keyframes`
  0%, 100% { 
    text-shadow: 0 0 8px ${palette.goldMain}, 0 0 12px ${hexToRGBA(palette.goldMain, 0.4)};
  }
  50% { 
    text-shadow: 0 0 2px ${palette.goldMain}, 0 0 4px ${hexToRGBA(palette.goldMain, 0.2)};
  }
`;

const particleFly = keyframes`
  0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(360deg); opacity: 0; }
`;

// 樣式元件
const Container = styled.div`
  background-color: transparent;
  color: ${palette.textPrimary};
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0;
  font-family: ${palette.fontTech};
  position: relative;
`;

const Scanlines = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom, 
    ${palette.transparent} 0%, 
    ${palette.transparent} 50%, 
    ${hexToRGBA(palette.black, 0.2)} 50%, 
    ${hexToRGBA(palette.black, 0.2)} 100%
  );
  background-size: 100% 4px;
  z-index: 5;
  pointer-events: none;
`;

const Card = styled.div<{ $isExiting?: boolean; $isSecretSuccess?: boolean }>`
  position: relative;
  z-index: 10;
  width: 90%;
  max-width: 440px;
  padding: 3rem 2rem;
  background: ${palette.bgCard};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid ${hexToRGBA(palette.goldMain, 0.2)};
  box-shadow: 0 0 40px ${hexToRGBA(palette.black, 0.8)};
  text-align: center;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  ${props => props.$isExiting && css`
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
    filter: blur(10px);
  `}

  ${props => props.$isSecretSuccess && css`
    border-color: ${palette.goldBright};
    box-shadow: 0 0 50px ${hexToRGBA(palette.goldMain, 0.6)}, 
                inset 0 0 30px ${hexToRGBA(palette.goldMain, 0.2)};
    transform: scale(1.02);
    
    &::before, &::after {
      width: 40px;
      height: 40px;
      border-width: 3px;
      border-color: ${palette.goldBright};
      box-shadow: 0 0 20px ${palette.goldMain};
    }
  `}

  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 2px solid ${palette.goldMain};
    transition: all 0.5s ease;
  }

  &::before {
    top: -5px;
    left: -5px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: -5px;
    right: -5px;
    border-left: none;
    border-top: none;
  }
`;

const TopLabel = styled.div`
  color: ${palette.goldMain};
  font-size: 0.8rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  opacity: 0.8;
  margin-bottom: 10px;
`;

const InputWrapper = styled.div<{ $active: boolean; $error: boolean }>`
  position: relative;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props =>
    props.$error ? palette.accentError :
      (props.$active ? palette.goldMain : hexToRGBA(palette.white, 0.3))
  };
  box-shadow: ${props => props.$active ? `0 5px 15px -10px ${hexToRGBA(palette.goldMain, 0.5)}` : 'none'};
  transition: 0.3s;
  animation: ${props => props.$error ? shake : 'none'} 0.3s ease-in-out;
`;

const StyledInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: ${palette.goldBright}; 
  font-family: ${palette.fontTech};
  font-size: 1.5rem;
  font-weight: 500;
  text-align: center;
  padding: 12px;
  outline: none;
  letter-spacing: 4px;
  text-transform: uppercase; // 自動轉換為大寫
  animation: ${flicker} 3s infinite ease-in-out;

  &::placeholder {
    color: ${hexToRGBA(palette.white, 0.2)};
    font-size: 0.9rem;
    letter-spacing: 1px;
    text-transform: none;
    text-shadow: none;
    animation: none;
    font-weight: 400;
  }
`;

const StatusMsg = styled.div<{ $visible: boolean; $isError?: boolean; $isReset?: boolean }>`
  margin-top: 1.5rem;
  height: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: ${props => props.$isReset ? palette.goldBright : (props.$isError ? palette.accentError : palette.goldBright)};
  text-shadow: ${props => props.$isReset ? `0 0 10px ${palette.goldMain}` : (props.$isError ? 'none' : `0 0 10px ${palette.goldMain}`)};
  opacity: ${props => props.$visible ? 1 : 0};
  transform: translateY(${props => props.$visible ? '0' : '10px'});
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  text-transform: uppercase;
  animation: ${props => props.$visible && !props.$isError ? flicker : 'none'} 2s infinite ease-in-out;
`;

// [FIX] Wrapper for the imported MissionButton to apply local styles
const StyledMissionButton = styled(MissionButton) <{ $isReset?: boolean }>`
  /* 
    您希望在 SYSTEM RESET 時，按鈕依然保持紅橘色的 RETRY (因為 hasError 仍為 true)，
    直到使用者修改內容。所以這裡不再強制覆蓋為金色。
    保留此 Wrapper 以備未來需要特殊樣式。
  */
`;

const Shutter = styled.div<{ $state: 'none' | 'closing' | 'opening' }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  pointer-events: ${props => props.$state === 'none' ? 'none' : 'auto'};
  display: flex;
  flex-direction: column;

  &::before, &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 100%;
    height: 50%;
    background: ${palette.black};
    transition: transform 0.8s cubic-bezier(0.7, 0, 0.3, 1);
  }

  &::before {
    top: 0;
    transform: translateY(${props => props.$state === 'none' ? '-100%' : (props.$state === 'closing' ? '0' : '-100%')});
    border-bottom: 1px solid ${palette.goldMain};
  }

  &::after {
    bottom: 0;
    transform: translateY(${props => props.$state === 'none' ? '100%' : (props.$state === 'closing' ? '0' : '100%')});
    border-top: 1px solid ${palette.goldMain};
  }
`;

const Particle = styled.div<{ $x: number; $y: number; $tx: string; $ty: string; $size: number; $color: string }>`
  position: absolute;
  left: calc(50% + ${props => props.$x}px);
  top: calc(50% + ${props => props.$y}px);
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background: ${props => props.$color};
  border-radius: 50%;
  pointer-events: none;
  z-index: 20;
  box-shadow: 0 0 10px ${props => props.$color};
  --tx: ${props => props.$tx};
  --ty: ${props => props.$ty};
  animation: ${particleFly} 1s ease-out forwards;
`;

// --- 客戶端指紋 (加入 Try-Catch 防止無痕模式 Crash) ---
const getClientUUID = (): string => {
  const STORAGE_KEY = 'client_device_uuid';
  try {
    let uuid = localStorage.getItem(STORAGE_KEY);
    if (!uuid) {
      // 產生一個簡單但足夠唯一的 UUID（基於時間戳 + 隨機數）
      uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem(STORAGE_KEY, uuid);
    }
    return uuid;
  } catch (e) {
    // 當無痕模式阻擋 LocalStorage 時，使用隨機 ID
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
  }
};

const Access: React.FC = () => {
  const navigate = useNavigate();
  const { sha256 } = useCrypto();
  const [view, setView] = useState<'login' | 'invitation'>('login');
  const [shutterState, setShutterState] = useState<'none' | 'closing' | 'opening'>('none');
  const [isExiting, setIsExiting] = useState(false);
  const [startMusic, setStartMusic] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState({ visible: false, text: '' });
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [guestName, setGuestName] = useState('DEBUG_AGENT');
  const [verifiedHash, setVerifiedHash] = useState(''); // Store the verified hash
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; tx: string; ty: string; size: number; color: string }[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initStage, setInitStage] = useState(0);

  // --- 隱藏路徑：連點標題 (Five Clicks Entry) ---
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [isSecretSuccess, setIsSecretSuccess] = useState(false);

  const handleTitleClick = () => {
    if (isSecretSuccess || isProcessing || isSuccess) return;

    const now = Date.now();
    let nextCount = 1;

    if (now - lastClickTime < 3000) {
      nextCount = clickCount + 1;
    }

    if (nextCount >= 5) {
      setIsSecretSuccess(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setTimeout(() => {
        navigate('/hasher');
      }, 1200);
    } else {
      setClickCount(nextCount);
      setLastClickTime(now);
      if (navigator.vibrate) navigator.vibrate(20);
    }
  };

  const initSteps = [
    "ESTABLISHING SECURE LINK...",
    "HANDSHAKING PROTOCOL...",
    "SYSTEM READY."
  ];

  useEffect(() => {
    // 初始化序列
    const timer = setInterval(() => {
      setInitStage(prev => {
        if (prev >= initSteps.length - 1) {
          clearInterval(timer);
          setTimeout(() => setIsInitializing(false), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, []);

  // 安全模擬狀態（持久化）
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      return parseInt(localStorage.getItem('access_attempts') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    const lockTime = localStorage.getItem('access_lockout_time');
    if (lockTime) {
      const remainingTime = parseInt(lockTime, 10) - Date.now();
      if (remainingTime > 0) {
        setIsLocked(true);
        setLockoutTimer(Math.ceil(remainingTime / 1000));
      } else {
        // 離開期間已過期
        localStorage.removeItem('access_attempts');
        localStorage.removeItem('access_lockout_time');
        setFailedAttempts(0);
      }
    }
  }, []);

  // 處理鎖定倒數
  useEffect(() => {
    if (lockoutTimer <= 0) {
      if (isLocked) {
        setIsLocked(false);
        setFailedAttempts(0);
        localStorage.removeItem('access_attempts');
        localStorage.removeItem('access_lockout_time');
        setStatus({ visible: true, text: 'SYSTEM RESET. READY FOR INPUT.' });
      }
      return;
    }

    const timer = setInterval(() => {
      setLockoutTimer(prev => prev - 1);
    }, 1000);

    const text = `SECURITY LOCKOUT: RETRY IN ${lockoutTimer}S.`;
    setStatus({ visible: true, text });

    return () => clearInterval(timer);
  }, [lockoutTimer, isLocked]);

  const handleEngage = async () => {
    if (!code.trim() || loading || isSuccess || isLocked) return;

    setLoading(true);
    setStatus({ visible: false, text: '' });

    if (navigator.vibrate) navigator.vibrate(50);

    setTimeout(async () => {
      setIsProcessing(true);

      try {
        // --- 安全升級：雲端驗證 ---
        // 1. 在客戶端對代碼進行雜湊（隱私保護）
        // 代碼已在 handleInputChange 中轉為大寫
        const hashCode = await sha256(code.trim().toUpperCase());
        const uuid = getClientUUID();

        // 2. 將雜湊值傳送至指揮中心
        const API_URL = 'https://script.google.com/macros/s/AKfycbyIw_gVH5-O7KXFbAaTA5t_XHLi4YwSoiusXr0qq__47KilzILOdbxH6o-VYWl2y8gm/exec';

        // 使用 URLSearchParams (避免 CORS 預檢請求)
        const params = new URLSearchParams();
        params.append('action', 'verify');
        params.append('hash', hashCode);
        params.append('client_uuid', uuid);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });

        // Google Apps Script 通常回傳 JSON 格式
        // 這裡預期會收到標準的 JSON 回應
        const result = await response.json();

        setTimeout(() => {
          setIsProcessing(false);
          setLoading(false);

          // 檢查驗證是否成功
          if (result.status === 'success' && result.name) {
            // === 成功路徑 ===
            setIsSuccess(true);
            setGuestName(result.name);
            // 將關係儲存至 Session Storage 或傳遞給 Invitation 元件（可選：之後實作 context）
            // 目前僅使用名稱進行歡迎
            setVerifiedHash(hashCode); // Store the hash after successful verification

            // 清除安全鎖定
            localStorage.removeItem('access_attempts');
            localStorage.removeItem('access_lockout_time');
            setFailedAttempts(0);

            setStatus({
              visible: true,
              text: `ACCESS GRANTED: WELCOME, ${result.name.toUpperCase()}.`
            });
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            // 轉場至邀請函
            setTimeout(() => {
              setIsExiting(true);
              setTimeout(() => {
                setShutterState('closing');
                setStartMusic(true);
                setTimeout(() => {
                  setView('invitation');
                  setShutterState('opening');
                  setTimeout(() => setShutterState('none'), 800);
                }, 800);
              }, 600);
            }, 2000);

          } else {
            // === 失敗路徑 ===
            // 增加失敗次數
            const newFailCount = failedAttempts + 1;
            setFailedAttempts(newFailCount);
            localStorage.setItem('access_attempts', newFailCount.toString());
            setHasError(true);

            if (newFailCount >= 3) {
              // 觸發鎖定
              const lockoutDuration = 10000; // 10 秒
              const lockoutExpiry = Date.now() + lockoutDuration;
              setIsLocked(true);
              setLockoutTimer(Math.ceil(lockoutDuration / 1000));
              localStorage.setItem('access_lockout_time', lockoutExpiry.toString());
            } else {
              setStatus({ visible: true, text: `ACCESS DENIED. REMAINING ATTEMPTS: ${3 - newFailCount}` });
            }
            if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100]);
          }
        }, 1000);

      } catch (error: any) {
        setIsProcessing(false);
        setLoading(false);

        // 如果是 Fetch 失敗，通常是 CORS 或無痕模式攔截
        if (error.message && (error.message.includes('fetch') || error.name === 'TypeError')) {
          setStatus({ visible: true, text: 'NETWORK INTERFERENCE DETECTED.' });
        } else {
          const newFailCount = failedAttempts + 1;
          setFailedAttempts(newFailCount);
          localStorage.setItem('access_attempts', newFailCount.toString());
          setHasError(true);

          if (newFailCount >= 3) {
            const lockoutDuration = 10000;
            const lockoutExpiry = Date.now() + lockoutDuration;
            setIsLocked(true);
            setLockoutTimer(Math.ceil(lockoutDuration / 1000));
            localStorage.setItem('access_lockout_time', lockoutExpiry.toString());
          } else {
            setStatus({ visible: true, text: `PROTOCOL ERROR. ATTEMPTS: ${3 - newFailCount}` });
          }
        }
        if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100]);
      }
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;

    // 安全性：白名單過濾 - 僅允許英數字與底線（半形英數字 + 底線）
    // 防止注入攻擊與 Unicode 漏洞
    const rawValue = e.target.value;
    const sanitized = rawValue.replace(/[^A-Za-z0-9_]/g, ''); // 移除白名單外的字元
    const val = sanitized.toUpperCase(); // 強制轉為大寫

    if (val.length < code.length) {
      const charWidth = 14;
      const xOffset = (code.length * charWidth / 2) - charWidth;
      createParticles(xOffset);
    }
    if (hasError) setHasError(false);
    setCode(val);
  };

  const createParticles = (xOffset: number) => {
    const newParticles = Array.from({ length: 8 }).map(() => ({
      id: Math.random(), x: xOffset, y: 0,
      tx: `${(Math.random() - 0.5) * 100}px`, ty: `${(Math.random() - 0.5) * 80 - 10}px`,
      size: Math.random() * 3 + 2, color: Math.random() > 0.4 ? palette.goldBright : palette.white
    }));
    setParticles(prev => [...prev.slice(-16), ...newParticles]);
  };

  return (
    <Container>
      <StarBackground showNebula={view === 'login'} />
      <Scanlines />
      <Shutter $state={shutterState} />
      {startMusic && <MissionMusic autoStart={true} />}

      {view === 'login' ? (
        <Card $isExiting={isExiting} $isSecretSuccess={isSecretSuccess}>
          {isInitializing ? (
            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <TopLabel style={{ marginBottom: '20px' }}>Loading Terminal...</TopLabel>
              <StatusMsg $visible={true} style={{ animation: 'none', margin: '0', fontSize: '1rem' }}>
                {'>'} {initSteps[initStage]}
              </StatusMsg>
            </div>
          ) : (
            <>
              <TopLabel onClick={handleTitleClick} style={{ cursor: 'default', userSelect: 'none' }}>
                Private Access Terminal
              </TopLabel>
              <HackingTitle finalTitle={"Mission:\nMemories with Us"} />

              <InputWrapper $active={isFocused} $error={hasError}>
                {particles.map(p => <Particle key={p.id} $x={p.x} $y={p.y} $tx={p.tx} $ty={p.ty} $size={p.size} $color={p.color} />)}
                <StyledInput
                  placeholder={isLocked ? "LOCKED" : "ENTER CODE"}
                  value={code}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEngage()}
                  maxLength={12}
                  autoFocus
                  disabled={isLocked || isProcessing || isSuccess}
                />
              </InputWrapper>

              <StyledMissionButton
                onClick={handleEngage}
                disabled={loading || isSuccess || hasError || !code.trim() || isLocked}
                isSuccess={isSuccess}
                isActive={(code.trim().length > 0 || loading) && !hasError && !isLocked}
                isError={hasError || isLocked}
                $isReset={status.text.includes("SYSTEM RESET")}
                isClicked={loading && !isSuccess && !hasError}
                isProcessing={isProcessing}
              >
                {isLocked ? 'LOCKOUT' : (isProcessing ? 'DECRYPTING...' : (isSuccess ? 'GRANTED' : (hasError ? 'RETRY' : 'ACCESS')))}
              </StyledMissionButton>

              <StatusMsg
                $visible={status.visible}
                $isError={hasError || isLocked || status.text.includes("INTERFERENCE")}
                $isReset={status.text.includes("SYSTEM RESET")}
              >
                {status.text}
              </StatusMsg>
            </>
          )}
        </Card>
      ) : (
        <Invitation guestName={guestName} guestHash={verifiedHash} />
      )}
    </Container>
  );
};

export default Access;
