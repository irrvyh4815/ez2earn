# Ez2Earn 工程請款系統

一套針對工程請款的靜態網頁工具。支援 Email 註冊登入、會員編碼、個人加密請款資料庫、帳號管理、管理員帳號管理、邀請通知，以及工程請款表單維護。

- 匯出自留存表單 PDF
- 匯出請款表單 PDF
- Supabase 資料庫銜接骨架

## 使用方式

直接用瀏覽器開啟 `index.html` 即可使用，不需要安裝套件。請款單會以登入密碼派生的 AES-GCM 金鑰加密後儲存在瀏覽器的 `localStorage`。

匯出格式為正式排版 PDF。對外請款 PDF 會隱藏成本、利潤、毛利率等內部欄位。

最高權限管理員 Email 已保留：

- Email: `irrvyh4815@gmail.com`
- Email: `r3nault1999@gmail.com`

第一次以此 Email 註冊時會自動成為最高權限管理員。密碼不會寫入程式碼或 GitHub，請在註冊時設定符合規則的強密碼。

## Supabase 設定

目前版本已建立 Supabase schema 與 Vercel API 骨架，前端仍預設使用本機加密儲存，避免尚未設定資料庫時影響正式操作。

1. 到 Supabase 建立專案。
2. 開啟 Supabase SQL Editor，執行 `supabase/schema.sql`。
3. 到 Vercel 專案的 Environment Variables 新增：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EZ2EARN_ENABLE_REMOTE_SYNC`：正式切換遠端同步前先保持空白或 `false`
4. 重新部署 Vercel。
5. 部署後可開啟 `/api/health`，確認 `configured` 是否為 `true`。

`SUPABASE_SERVICE_ROLE_KEY` 只能放在 Vercel 環境變數，不能寫進前端檔案或提交到 GitHub。
