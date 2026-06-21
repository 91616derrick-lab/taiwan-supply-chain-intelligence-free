export type GlossaryTerm = {
  term: string;
  plain: string;
};

export const glossaryTerms: GlossaryTerm[] = [
  { term: "AI server", plain: "AI 伺服器。用來訓練或執行 AI 模型的高效能伺服器，通常需要 GPU、散熱、電源和高速網路。" },
  { term: "ODM", plain: "代工設計製造商。客戶提出需求，ODM 幫忙設計、製造產品，例如伺服器或筆電。" },
  { term: "EMS", plain: "電子製造服務。幫品牌客戶組裝、測試、量產電子產品的製造服務。" },
  { term: "PCB", plain: "印刷電路板。電子零件要連在一起，通常都需要 PCB 當作底板。" },
  { term: "ABF substrate", plain: "ABF 載板。高階晶片封裝用的關鍵材料，AI 晶片需求強時常被市場關注。" },
  { term: "CCL", plain: "銅箔基板。做 PCB 的重要材料，高速伺服器需要品質更高、損耗更低的 CCL。" },
  { term: "HBM", plain: "高頻寬記憶體。AI 晶片旁邊常用的高速記憶體，影響 AI 伺服器效能。" },
  { term: "CoWoS", plain: "台積電先進封裝技術之一。常被用在 AI 晶片，產能是否足夠會影響供應鏈。" },
  { term: "hyperscaler", plain: "大型雲端公司，例如 Amazon、Microsoft、Google、Meta。它們大量建資料中心，是 AI 伺服器需求的重要來源。" },
  { term: "capex", plain: "資本支出。公司花錢買設備、蓋廠、建資料中心，通常代表未來產能或基礎建設投資。" },
  { term: "gross margin", plain: "毛利率。賣產品扣掉直接成本後剩下的比例，用來看公司賺錢品質。" },
  { term: "guidance", plain: "公司展望。公司管理層對未來營收、毛利或需求的說法。" },
  { term: "supply chain", plain: "供應鏈。從原料、零組件、製造、組裝到出貨的一整串公司與流程。" },
  { term: "foundry", plain: "晶圓代工。幫晶片設計公司製造晶片的公司，例如台積電、聯電。" },
  { term: "IC design", plain: "IC 設計。負責設計晶片，不一定自己製造，例如聯發科、瑞昱。" },
  { term: "packaging and testing", plain: "封裝測試。晶片做好後還要封裝、測試，確認能放進電子產品使用。" },
  { term: "memory", plain: "記憶體。用來儲存資料的晶片，例如 DRAM、NAND、HBM。" },
  { term: "data center", plain: "資料中心。放大量伺服器的機房，是雲端服務和 AI 運算的基礎建設。" },
  { term: "freight rate", plain: "運價。貨物運輸價格，會影響航運公司營收，也會影響出口公司的物流成本。" },
  { term: "exchange rate", plain: "匯率。例如美元兌台幣。台灣出口公司常有美元收入，匯率會影響換算後營收與毛利。" },
  { term: "interest rate", plain: "利率。利率變化會影響資金成本、金融業利差，也會影響市場估值。" }
];

export const glossaryByTerm = new Map(glossaryTerms.map((item) => [item.term.toLowerCase(), item]));
