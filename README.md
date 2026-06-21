# Taiwan Supply Chain Intelligence Free

免費、全自動、規則引擎版的台灣供應鏈投資情報網站。這版專注在「投資小白也能看懂」：首頁先用白話說明今天發生什麼事、為什麼重要、可能影響哪些台灣公司，再把進階表格與分數收在 Advanced mode。

所有內容僅供研究與教育用途，不構成個人化投資建議。本專案不輸出買進、賣出、持有、目標價或保證報酬。

## 為什麼不會產生 OpenAI API 費用

網站不呼叫 OpenAI API，不讀取 `OPENAI_API_KEY`，也沒有 server-side AI endpoint。ChatGPT 手動加強功能只是在瀏覽器產生 prompt，使用者自行複製到 ChatGPT，再把 JSON 貼回網站並存到 localStorage。

## 為什麼不需要 Supabase

資料都存在本地 JSON：

- `data/intelligence/latest.json`
- `data/intelligence/history/*.json`
- `data/system/status.json`
- `data/taiwan-companies/all-companies.json`
- `data/taiwan-companies/summary.json`

使用者 watchlist、notes、手動加強分析存在瀏覽器 localStorage。

## 為什麼不需要 Apple

沒有 Apple Shortcuts、Apple Intelligence、iCloud 或 Apple-only workflow。Windows 使用者可以用 GitHub、Vercel、npm/pnpm 和瀏覽器完成所有流程。

## 公司清單不再人工列舉

舊版的 `src/data/taiwanCompanies.ts` 只是人工列出一批重要供應鏈公司，不是完整上市上櫃 universe。新版改成：

1. 從 TWSE / TPEx / ISIN 官方公開頁面抓完整公司清單。
2. 產出 `data/taiwan-companies/all-companies.json`。
3. 產出 `data/taiwan-companies/summary.json`。
4. 用 `src/data/curatedCompanyTags.ts` 補強重點供應鏈公司的 aliases、keywords、sensitivityTags、supplyChainRole。
5. 用 `src/lib/companies/mergeCompanyUniverse.ts` 合併完整 universe 與 curated tags。

官方來源：

- TWSE listed ISIN: `https://isin.twse.com.tw/isin/C_public.jsp?strMode=2`
- TPEx listed ISIN: `https://isin.twse.com.tw/isin/C_public.jsp?strMode=4`

## 如何確認公司清單完整

執行：

```powershell
npm run update:companies
npm run validate:companies
```

validation 會檢查：

- 公司數量不可小於 1000
- TWSE / TPEx count 都要大於 0
- ticker 不可大量重複
- 必須包含 2330 台積電、2317 鴻海、2382 廣達、2308 台達電、2603 長榮、2882 國泰金
- `summary.json` 必須存在

如果公司數量太少，先看 `/doctor`，再檢查 `data/taiwan-companies/summary.json` 的 `parseErrors`。

## 官方來源失敗時的 fallback

`scripts/update-taiwan-companies.ts` 不會因單一官方來源失敗就讓整個 workflow 崩潰：

1. 優先使用 TWSE / TPEx ISIN 官方資料。
2. 若解析不完整，fallback 使用上一版 `all-companies.json`。
3. 若上一版不存在，才使用內建 curated fallback list。
4. `/doctor` 會標示 company universe 狀態為 `warning` 或 `failed`。

## Rule Engine 如何使用完整公司清單

`supplyChainMapper` 現在不是只看人工清單：

- 先用 curated sensitivityTags / keywords 找高信心公司。
- 再用 keyword 找中信心公司。
- 再用 industry / companyName / aliases 做低信心補充。
- non-curated 公司仍會保留，並標示 `evidenceLevel = "industry_match"` 或較低 confidence。

## UI 使用方式

- 首頁：看「今天市場最重要的是什麼？」和三大事件白話早報。
- Beginner mode：顯示小白卡片、供應鏈 flow、術語解釋。
- Advanced mode：顯示完整矩陣、分數與更多欄位。
- `/companies`：查全部上市上櫃公司，支援搜尋、篩選、pagination。
- `/events`：看事件 tape，用左側 filter 篩選。
- `/events/[id]`：看單一事件的一句話、小白解釋、供應鏈傳導、研究觀點、反方觀點、追蹤指標與資料來源。
- `/doctor`：看資料更新、公司 universe、來源警訊與修復建議。

## GitHub Actions Daily Update

`.github/workflows/update-intelligence.yml` 每天跑兩次：

- 台灣時間 07:30：`30 23 * * *` UTC
- 台灣時間 21:00：`0 13 * * *` UTC

流程：

```powershell
npm install --no-audit --no-fund
npm run update:companies
npm run update:intelligence
npm run validate:intelligence
npm run validate:companies
```

自動 commit：

- `data/taiwan-companies/all-companies.json`
- `data/taiwan-companies/summary.json`
- `data/intelligence/latest.json`
- `data/intelligence/history/*.json`
- `data/system/status.json`

## Optional Windows Local AI

預設不需要本機 AI。若要使用 Ollama：

```powershell
$env:LOCAL_AI_ENABLED="true"
$env:OLLAMA_BASE_URL="http://localhost:11434"
$env:LOCAL_AI_MODEL="qwen2.5:7b"
npm run update:intelligence
```

如果 Ollama 沒開，更新仍會成功並 fallback 到 rule-based manager view。

## Local Commands

```powershell
npm install --no-audit --no-fund
npm run update:companies
npm run validate:companies
npm run update:intelligence
npm run validate:intelligence
npm run typecheck
npm run lint
npm run build
```
