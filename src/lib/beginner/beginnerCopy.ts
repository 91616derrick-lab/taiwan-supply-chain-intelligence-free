import type {
  CompanyImpact,
  ImpactDirection,
  IntelligenceEvent,
  ManagerObservation,
  ResearchPriority
} from "@/src/lib/schemas/intelligenceSchema";

export function directionText(direction: ImpactDirection) {
  if (direction === "positive") return "可能受惠";
  if (direction === "negative") return "可能承壓";
  if (direction === "mixed") return "正負混合";
  return "影響不明";
}

export function directionTone(direction: ImpactDirection) {
  if (direction === "positive") return "green" as const;
  if (direction === "negative") return "red" as const;
  if (direction === "mixed") return "amber" as const;
  return "neutral" as const;
}

export function priorityText(priority: ResearchPriority) {
  if (priority === "high") return "高";
  if (priority === "medium") return "中";
  return "低";
}

export function confidenceText(score: number) {
  if (score >= 75) return "高：有直接新聞或公司資料支持";
  if (score >= 55) return "中：產業邏輯合理，但仍需驗證";
  return "低：目前只是初步推測";
}

export function oneLineEvent(event: IntelligenceEvent) {
  const industries = plainIndustries(event.affectedIndustries).slice(0, 3).join("、");
  return `${event.title}。白話說，就是這件事可能影響 ${industries || "台灣供應鏈"}，目前研究優先級是${priorityText(event.researchPriority)}。`;
}

export function beginnerWhatHappened(event: IntelligenceEvent) {
  return `這是一則和「${plainCategory(event.category)}」有關的公開資訊。先不用急著看所有數字，你可以先把它理解成：全球產業出現一個變化，市場正在判斷它會不會傳導到台灣供應鏈。`;
}

export function beginnerWhyTaiwan(event: IntelligenceEvent) {
  const companies = event.likelyAffectedCompanies.slice(0, 5).map((company) => company.companyName).join("、");
  return `台灣公司常位在晶片、伺服器、零組件、航運或金融等關鍵位置，所以全球事件不一定只影響國外公司。這次系統先抓出 ${companies || "相關台灣公司"}，但仍要用公司公告和營收資料確認。`;
}

export function supplyChainImpact(event: IntelligenceEvent) {
  return `可能的傳導路徑是：全球事件先影響 ${plainIndustries(event.affectedIndustries).slice(0, 2).join("、")}，再影響 ${event.supplyChainNodes.slice(0, 3).join("、")}，最後才可能反映到公司營收、毛利率或訂單能見度。`;
}

export function factsAndInferences(event: IntelligenceEvent) {
  return {
    facts: [
      `來源：${event.publisher}`,
      `事件分類：${plainCategory(event.category)}`,
      `系統已記錄來源連結與發布時間`
    ],
    inferences: [
      "哪些台灣公司會被影響，是規則引擎依產業與供應鏈位置推估",
      "影響方向不是投資建議，需要後續營收、法說會與公司公告驗證",
      `目前信心程度：${confidenceText(event.confidenceScore)}`
    ]
  };
}

export function whatToWatch(event: IntelligenceEvent) {
  return event.indicatorsToMonitor.length > 0
    ? event.indicatorsToMonitor
    : ["公司月營收", "毛利率變化", "客戶資本支出", "訂單能見度"];
}

export function plainCategory(category: string) {
  const labels: Record<string, string> = {
    AI_SERVER_DEMAND: "AI 伺服器需求",
    NVIDIA_SUPPLY_CHAIN: "Nvidia 相關供應鏈",
    SEMI_EXPORT_CONTROL: "半導體出口管制",
    TSMC_CAPEX: "台積電與半導體資本支出",
    HBM_MEMORY: "HBM 與記憶體",
    DATA_CENTER_POWER: "資料中心電力與散熱",
    SHIPPING_DISRUPTION: "航運與物流變化",
    ENERGY_PRICE: "能源價格",
    FED_RATE: "美國利率",
    FX_USD_TWD: "美元台幣匯率",
    CHINA_STIMULUS: "中國需求與刺激政策",
    TAIWAN_GEOPOLITICS: "台灣地緣政治",
    EV_BATTERY: "電動車與電池",
    COMPANY_EARNINGS: "公司營收與獲利",
    TRADE_TARIFF: "關稅與貿易政策",
    UNKNOWN: "尚待確認的訊號"
  };
  return labels[category] ?? category;
}

export function plainIndustries(industries: string[]) {
  return industries.map((industry) => {
    const map: Record<string, string> = {
      "AI server": "AI 伺服器",
      "ODM/EMS": "伺服器代工與組裝",
      "power supply": "電源供應",
      thermal: "散熱",
      PCB: "PCB 電路板",
      "optical networking": "光通訊與網通",
      foundry: "晶圓代工",
      equipment: "半導體設備",
      materials: "半導體材料",
      "advanced packaging": "先進封裝",
      finance: "金融",
      shipping: "航運"
    };
    return map[industry] ?? industry;
  });
}

export function companyBusinessDescription(company: Pick<CompanyImpact, "industry" | "supplyChainRole">) {
  return company.supplyChainRole || `${company.industry} 公司`;
}

export function whyCompanyRelated(company: CompanyImpact) {
  if (company.evidenceLevel === "curated_match") {
    return "這家公司在重點供應鏈標籤中被明確標記，和本次事件的關聯較直接。";
  }
  if (company.evidenceLevel === "keyword_match") {
    return "這家公司名稱、角色或關鍵字和事件主題有交集，屬於需要進一步確認的關聯。";
  }
  return "這家公司是依產業分類推估可能相關，屬於較低信心的觀察名單。";
}

export function companyPressureReason(company: CompanyImpact) {
  if (company.impactDirection === "negative") return "如果成本上升、需求減弱或政策限制擴大，公司可能承壓。";
  if (company.impactDirection === "mixed") return "可能同時有需求增加與成本、供應或政策風險，需要拆開看。";
  if (company.impactDirection === "positive") return "如果事件真的帶動需求，這家公司可能受惠，但仍要看毛利率和訂單品質。";
  return "目前資訊不足，先觀察後續公司資料。";
}

export function companyWatchItems(company: CompanyImpact) {
  const items = ["月營收變化", "毛利率", "法說會展望"];
  if (company.industry.includes("航運")) items.push("運價與燃油成本");
  if (company.industry.includes("金融")) items.push("利率、匯率與金融市場波動");
  if (company.industry.includes("半導體")) items.push("客戶拉貨與先進製程需求");
  if (company.industry.includes("電腦") || company.industry.includes("電子")) items.push("訂單能見度與庫存");
  return items;
}

export function managerBeginnerView(observation: ManagerObservation) {
  return {
    initialView: observation.managerView,
    support: observation.bullCase,
    wrongIf: observation.bearCase,
    nextNumbers: observation.indicatorsToMonitor,
    whyWait: "現在只是研究假設，不是投資結論。要等更多公司資料、營收與法說會內容確認。"
  };
}
