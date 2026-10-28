# 創科站職員區 — Apps Script 寫入（龍虎榜＋進度）

靜態站（GitHub Pages）本身**唔可以**直接改 Google Sheet。呢個 Web App 用你嘅 Google 帳戶（Execute as: Me）代寫兩份 Sheet。

| 板 | Sheet | 前端設定 |
| --- | --- | --- |
| 龍虎榜 | `LONGHU_SHEET_ID` + `LONGHU_GID` | `leaderboard/longhu-config.js` → `APPS_SCRIPT_URL` / `WRITE_TOKEN` |
| 進度 | `PROGRESS_SHEET_ID` + `PROGRESS_GID` | `progress/progress-config.js` → 同上（共用同一個 Web App） |

## 一次過部署（點撳）

1. 開其中一份學校 Sheet（龍虎榜或進度都得）→ 選單 **擴充功能 → Apps Script**（英文：**Extensions → Apps Script**）。
2. 刪走預設 `myFunction`，將本資料夾嘅 `Code.gs` **全部貼上** → 儲存。
3. 左欄 **專案設定**（齒輪）→ **指令碼屬性** → 新增：

   | 屬性 | 值（範例／說明） |
   | --- | --- |
   | `WRITE_TOKEN` | 自訂長亂數（之後填入兩個 `*-config.js`；**唔好 commit 真實值**；唔好留 `REPLACE_ME`） |
   | `LONGHU_SHEET_ID` | `1rV9XoqPy8Py3U01z8UdilzE-j-VqYkR3i8Gluvtck64` |
   | `LONGHU_GID` | `255525742` |
   | `PROGRESS_SHEET_ID` | `1dDLJ5Gfi2n9v9m4ylofpfwSBSEhctOYLc0S5SxOwyVU` |
   | `PROGRESS_GID` | `915310866` |

4. 右上 **部署 → 新增部署作業**（**Deploy → New deployment**）。
5. 類型揀 **網頁應用程式**（**Web app**）。
6. 設定：
   - **說明**：例如 `創科站職員寫入`
   - **執行身分**：**我**（**Execute as: Me**）
   - **具有存取權的使用者**：**任何人**（**Who has access: Anyone**）  
     （要畀未登入 Google 嘅瀏覽器 `fetch`；真正寫入仍靠 `WRITE_TOKEN`＋職員頁 Google allowlist）
7. **部署** → 授權（學校帳戶）→ 複製 **網頁應用程式網址**（以 `/exec` 結尾）。
8. 將該網址貼去：
   - `leaderboard/longhu-config.js` 嘅 `APPS_SCRIPT_URL`
   - `progress/progress-config.js` 嘅 `APPS_SCRIPT_URL`
   - 兩邊 `WRITE_TOKEN` 填同 Script Properties 一樣嘅值  
   然後 bump `?v=` 並 push（或只喺本機改完再部署 Pages）。
9. 硬刷新職員頁：龍虎榜可加分寫入；進度格可編輯並寫回 Sheet。

## API（POST JSON，`Content-Type: text/plain`）

共用欄位：`token`、`board`（`longhu`｜`progress`）、`action`。

### 龍虎榜 `board:"longhu"`

- `award` — `{ studentNo?, name?, class, points, reason? }`：按學號或姓名+班別搵行，分數 += points  
- `setScore` — `{ studentNo?, name?, class, score }`：設絕對分數  
- `upsert` — `{ studentNo?, name, class, score? }`：有則改、無則加行  

欄位對應：`學號, 姓名, 班別, 分數`（班別僅 1A／1B／2A／2B／3B）。

### 進度 `board:"progress"`

- `setCell` — `{ week:1–18, class:"1A"…, text }`：寫入對應週×班格  

表頭預期：`週次,1A,1B,2A,2B,3B,1C`；列標 `W1`…`W18`。

### 健康檢查

`GET` 同一個 `/exec` → `{ ok:true, service:"innotech-staff-write", ... }`。

## 保安說明

- 職員頁已有 Google OAuth + email allowlist；`WRITE_TOKEN` 只係額外共用密鑰（會出現喺前端 JS，唔係真正秘密）。
- 部署選 **任何人** 係為 CORS／`fetch`；冇 token 嘅請求會被拒。
- **唔好**喺 git commit 放入真實 `WRITE_TOKEN`。

## 改 code 之後

Apps Script 改完要再 **部署 → 管理部署作業 → 編輯（筆）→ 版本：新版本 → 部署**，否則 `/exec` 仍跑舊版。
