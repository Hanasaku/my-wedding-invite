# CHANGELOG

All notable changes to the "Operation Destiny" Wedding Invitation project will be documented in this file.

## [Unreleased]

## [v0.9.0] - 2026-01-21
### Feature: GAS v11.0 Aegis 後端整合與安全強化
**Branch:** `fix/security-backend-integration`
- **後端整合**: 與 Google Apps Script v11.0 - Aegis Edition 後端完全對接
- **安全性**: 改用 `form-urlencoded` 格式避免 CORS 預檢請求
- **防禦升級**: 支援後端 10 層安全防禦架構
  - 全域限流（500 req/min）
  - 聚合失敗偵測（針對 Hash 進行熱點封鎖）
  - 雙柵欄 Rate Limiting（UserKey + ClientUUID）
  - Brute Force 偵測（5 次連續失敗觸發 Email 警報）
  - HashMap O(1) 查詢（防止時序攻擊）
  - 輸入白名單驗證（Regex 早期攔截）
  - 公式注入防護
  - 分級日誌（Critical + Verbose）
  - 資料遮罩（Hash 顯示前 4 碼）
  - RSVP 冪等性檢查
- **隱私保護**: 保持客戶端 SHA-256 雜湊，密碼不以明文傳輸
- **文件**: 新增 `/backend` 目錄，包含完整 GAS 程式碼與繁體中文部署文件
- **在地化**: 所有程式碼註解統一為台灣繁體中文

## [v0.8.0] - 2026-01-17
### Feature: Backendless RSVP & Social Polish
**Branch:** `feature/backendless-rsvp-and-social-polish`
- **Backendless**: Integrated Google Apps Script for real-time RSVP data storage.
- **Social**: Added "Encrypted Mission" OG Tags and custom Hexagonal Favicon.
- **UX**: Added cinematic "Terminal Initialization" typing effect on Access load.
- **Perf**: Optimized StarBackground particles for mobile (A13 chip optimization).

## [v0.7.0] - 2026-01-16
### Feature: Cinematic UI Overhaul
**Branch:** `feature/cinematic-ui-overhaul`
- **Visuals**: Complete "Interstellar" aesthetic overhaul.
- **Animation**: Added cinematic shutter transitions (`Shutter.tsx`) and scanning line effects.
- **Components**: Polished `MissionButton` with industrial gold states.
- **Refactor**: Pruned unused components and redefined entry points.

## [v0.6.0] - 2026-01-16
### Feature: RSVP Mission Protocol
**Branch:** `feature/rsvp-form`
- **Feature**: Implemented full-screen cinematic RSVP form overlay.
- **Logic**: Built form validation and interactive status selection (Base Join/Retreat).
- **UI**: Designed glassmorphism form containers with futuristic borders.

## [v0.5.0] - 2026-01-15
### Feature: Guest Access Magic
**Branch:** `feature/guest-access-magic`
- **UX**: Fine-tuned interaction rhythm for the password entry.
- **Style**: Harmonized the "Industrial Gold" color palette across inputs and buttons.
- **Fix**: Resolved React DOM property warnings (`transient-props`).

## [v0.4.0] - 2026-01-15
### Feature: Cinematic Invitation Reveal
**Branch:** `feature/cinematic-invitation-reveal`
- **Core**: Implemented the first version of the 3D Starfield background.
- **Pages**: Completed the "Top Secret Dossier" layout for the invitation text.
- **Flow**: Integrated "Mission Music" auto-play logic upon access.

## [v0.3.0] - 2026-01-14
### Feature: Mobile RWD & Home Polish
**Branch:** `feature/home-polish`, `fix/mobile-rwd-issues`
- **RWD**: Fixed layout displacement on LINE's in-app browser.
- **Copy**: Refined mission text labels for better mystery themes.

## [v0.2.0] - 2026-01-14
### Feature: Component Architecture
**Branch:** `feature/ui-components`, `feature/pages`
- **Architecture**: Established reusable UI component library (`Card`, `Button`).
- **Pages**: Created placeholder pages for Access and Main view.

## [v0.1.0] - 2026-01-14
### Initial Commit
**Branch:** `main`
- **Setup**: Initial React + Vite + TypeScript project configuration.
- **Style**: Basic global styles and resets.
