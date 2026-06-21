import type {
  CompanyEvidenceLevel,
  TaiwanListedCompany
} from "@/src/lib/companies/companyTypes";
import { getMergedCompanyUniverse } from "@/src/lib/companies/mergeCompanyUniverse";
import type { EventCategory } from "./keywordClassifier";

export type MappedCompany = TaiwanListedCompany & {
  evidenceLevel: CompanyEvidenceLevel;
};

export type SupplyChainMapping = {
  affectedIndustries: string[];
  supplyChainNodes: string[];
  likelyAffectedCompanies: MappedCompany[];
};

const categoryMap: Record<
  EventCategory,
  {
    affectedIndustries: string[];
    supplyChainNodes: string[];
    tickers: string[];
    tagFallbacks: string[];
    keywordHints: string[];
    industryHints: string[];
  }
> = {
  AI_SERVER_DEMAND: {
    affectedIndustries: ["AI 伺服器", "伺服器代工", "電源", "散熱", "PCB", "光通訊與網通"],
    supplyChainNodes: ["伺服器組裝", "電源供應", "液冷與散熱", "高速 PCB", "資料中心交換器"],
    tickers: ["2382", "3231", "6669", "2317", "2308", "3017", "3324", "2383", "3037", "2345"],
    tagFallbacks: ["AI_SERVER_DEMAND"],
    keywordHints: ["AI server", "伺服器", "data center", "power", "thermal", "PCB", "networking"],
    industryHints: ["電腦及週邊設備", "電子零組件", "通信網路", "半導體"]
  },
  NVIDIA_SUPPLY_CHAIN: {
    affectedIndustries: ["AI 晶片", "先進封裝", "伺服器代工", "PCB", "網通"],
    supplyChainNodes: ["AI 加速器平台", "CoWoS 先進封裝", "GPU 伺服器板卡", "高速網路交換"],
    tickers: ["2330", "3711", "2449", "2382", "3231", "6669", "2368", "2383", "2345", "3324"],
    tagFallbacks: ["NVIDIA_SUPPLY_CHAIN", "AI_SERVER_DEMAND"],
    keywordHints: ["Nvidia", "GPU", "AI accelerator", "CoWoS", "GB200", "networking"],
    industryHints: ["半導體", "電腦及週邊設備", "電子零組件", "通信網路"]
  },
  SEMI_EXPORT_CONTROL: {
    affectedIndustries: ["半導體", "設備材料", "先進製程", "IC 設計"],
    supplyChainNodes: ["先進邏輯晶片", "ASIC 與 IC 設計", "半導體設備", "特殊材料"],
    tickers: ["2330", "2454", "3661", "3443", "3680", "6196", "3583", "5434"],
    tagFallbacks: ["SEMI_EXPORT_CONTROL"],
    keywordHints: ["export control", "advanced process", "foundry", "IC design", "equipment"],
    industryHints: ["半導體", "電子通路", "其他電子"]
  },
  TSMC_CAPEX: {
    affectedIndustries: ["晶圓代工", "半導體設備", "材料", "先進封裝"],
    supplyChainNodes: ["新廠建置", "EUV 與製程支援", "無塵室工程", "晶圓與化學品", "CoWoS 產能"],
    tickers: ["2330", "6488", "3680", "6196", "2404", "6139", "1560", "4755", "6640", "3131"],
    tagFallbacks: ["TSMC_CAPEX"],
    keywordHints: ["TSMC", "capex", "fab", "CoWoS", "EUV", "wafer", "cleanroom"],
    industryHints: ["半導體", "其他電子", "電子零組件", "化學工業"]
  },
  HBM_MEMORY: {
    affectedIndustries: ["記憶體", "先進封裝", "測試", "AI 伺服器"],
    supplyChainNodes: ["HBM 堆疊", "DRAM 供給", "邏輯與記憶體整合", "燒機測試"],
    tickers: ["2344", "2408", "2337", "6531", "3711", "2449", "6669", "2382"],
    tagFallbacks: ["HBM_MEMORY"],
    keywordHints: ["HBM", "DRAM", "memory", "advanced packaging", "testing"],
    industryHints: ["半導體", "電腦及週邊設備"]
  },
  DATA_CENTER_POWER: {
    affectedIndustries: ["電源供應", "散熱", "電網設備", "資料中心基礎建設"],
    supplyChainNodes: ["電源轉換", "UPS", "變壓器", "液冷", "電網接入"],
    tickers: ["2308", "6282", "6412", "3017", "3324", "1513", "1503", "1514", "1519", "1609"],
    tagFallbacks: ["DATA_CENTER_POWER"],
    keywordHints: ["power", "UPS", "grid", "thermal", "liquid cooling", "data center"],
    industryHints: ["電子零組件", "電機機械", "電器電纜", "電腦及週邊設備"]
  },
  SHIPPING_DISRUPTION: {
    affectedIndustries: ["貨櫃航運", "物流", "出口供應鏈", "航空貨運"],
    supplyChainNodes: ["貨櫃航線", "港口處理", "貨運承攬", "航空貨運"],
    tickers: ["2603", "2609", "2615", "2610", "2618", "2636", "2608"],
    tagFallbacks: ["SHIPPING_DISRUPTION"],
    keywordHints: ["shipping", "freight", "container", "logistics", "air cargo"],
    industryHints: ["航運業"]
  },
  ENERGY_PRICE: {
    affectedIndustries: ["石化", "航空", "航運", "製造成本", "電力設備"],
    supplyChainNodes: ["燃油成本", "石化原料", "電價", "工廠能源成本"],
    tickers: ["6505", "1301", "1303", "1326", "2610", "2618", "2308", "1513", "1519"],
    tagFallbacks: ["ENERGY_PRICE"],
    keywordHints: ["energy", "oil", "fuel", "electricity", "petrochemical"],
    industryHints: ["油電燃氣", "塑膠工業", "化學工業", "航運業", "電機機械"]
  },
  FED_RATE: {
    affectedIndustries: ["金融", "出口公司", "高估值成長股", "資本設備"],
    supplyChainNodes: ["折現率", "銀行利差", "美元資金", "資本支出門檻"],
    tickers: ["2882", "2881", "2891", "2885", "2884", "2886", "2330", "2382"],
    tagFallbacks: ["FED_RATE"],
    keywordHints: ["interest rate", "Fed", "bank", "insurance", "yield"],
    industryHints: ["金融保險", "半導體", "電腦及週邊設備"]
  },
  FX_USD_TWD: {
    affectedIndustries: ["出口硬體", "金融", "進口成本", "航空燃油"],
    supplyChainNodes: ["美元營收換算", "台幣成本", "匯率避險", "燃油進口"],
    tickers: ["2330", "2317", "2382", "3231", "2886", "2882", "2610", "2618"],
    tagFallbacks: ["FX_USD_TWD"],
    keywordHints: ["exchange rate", "USD", "TWD", "FX", "export"],
    industryHints: ["半導體", "電腦及週邊設備", "金融保險", "航運業"]
  },
  CHINA_STIMULUS: {
    affectedIndustries: ["消費電子", "工業自動化", "石化", "面板"],
    supplyChainNodes: ["中國需求", "工廠自動化", "面板循環", "化工利差"],
    tickers: ["2454", "3034", "2409", "3481", "2049", "1504", "1301", "1303", "1326"],
    tagFallbacks: ["CHINA_STIMULUS"],
    keywordHints: ["China", "stimulus", "consumer", "automation", "panel"],
    industryHints: ["半導體", "光電業", "電機機械", "塑膠工業", "化學工業"]
  },
  TAIWAN_GEOPOLITICS: {
    affectedIndustries: ["半導體", "航運", "金融", "出口供應鏈"],
    supplyChainNodes: ["風險溢價", "保險成本", "航線安全", "庫存緩衝"],
    tickers: ["2330", "2303", "2454", "2603", "2609", "2881", "2882", "2891"],
    tagFallbacks: ["TAIWAN_GEOPOLITICS"],
    keywordHints: ["Taiwan", "geopolitical", "risk", "sanction", "strait"],
    industryHints: ["半導體", "航運業", "金融保險"]
  },
  EV_BATTERY: {
    affectedIndustries: ["電動車", "車用電子", "電源零組件", "工業自動化"],
    supplyChainNodes: ["電池測試", "連接器", "線束", "充電", "車用電子"],
    tickers: ["3023", "6279", "2360", "3552", "2231", "1536", "1522", "2497", "3665"],
    tagFallbacks: ["EV_BATTERY"],
    keywordHints: ["EV", "battery", "automotive", "charging", "connector"],
    industryHints: ["汽車工業", "電子零組件", "電機機械", "其他電子"]
  },
  COMPANY_EARNINGS: {
    affectedIndustries: ["公司基本面", "產業同業比較", "獲利品質"],
    supplyChainNodes: ["營收", "毛利率", "展望", "庫存", "訂單能見度"],
    tickers: ["2330", "2454", "2382", "3231", "6669", "2308", "3037", "2345", "2882"],
    tagFallbacks: ["COMPANY_EARNINGS"],
    keywordHints: ["revenue", "earnings", "guidance", "margin", "inventory"],
    industryHints: ["半導體", "電腦及週邊設備", "電子零組件", "金融保險"]
  },
  TRADE_TARIFF: {
    affectedIndustries: ["出口供應鏈", "硬體組裝", "航運", "中國曝險"],
    supplyChainNodes: ["關稅轉嫁", "產地調整", "轉運成本", "庫存緩衝"],
    tickers: ["2317", "2382", "3231", "4938", "2603", "2609", "2615", "2454"],
    tagFallbacks: ["TRADE_TARIFF"],
    keywordHints: ["tariff", "trade", "export", "China", "customs"],
    industryHints: ["電腦及週邊設備", "半導體", "航運業"]
  },
  UNKNOWN: {
    affectedIndustries: ["跨產業訊號"],
    supplyChainNodes: ["訊號確認"],
    tickers: ["2330", "2382", "2308", "2882"],
    tagFallbacks: [],
    keywordHints: [],
    industryHints: ["半導體", "電腦及週邊設備", "電子零組件", "金融保險"]
  }
};

export function mapSupplyChain(category: EventCategory): SupplyChainMapping {
  const rule = categoryMap[category];
  const universe = getMergedCompanyUniverse();
  const byTicker = new Map(universe.map((company) => [company.ticker, company]));
  const candidates = new Map<string, MappedCompany>();

  for (const ticker of rule.tickers) {
    const company = byTicker.get(ticker);
    if (company) addCandidate(candidates, company, "curated_match");
  }

  for (const company of universe) {
    if (company.sensitivityTags.some((tag) => rule.tagFallbacks.includes(tag))) {
      addCandidate(candidates, company, "curated_match");
    }
  }

  for (const company of universe) {
    const searchable = [
      company.companyName,
      company.industry,
      company.supplyChainRole,
      ...company.aliases,
      ...company.keywords,
      ...(company.thematicExposures ?? [])
    ]
      .join(" ")
      .toLowerCase();

    if (rule.keywordHints.some((hint) => searchable.includes(hint.toLowerCase()))) {
      addCandidate(candidates, company, company.isCurated ? "curated_match" : "keyword_match");
    }
  }

  for (const company of universe) {
    if (rule.industryHints.some((hint) => company.industry.includes(hint))) {
      addCandidate(candidates, company, "industry_match");
    }
  }

  return {
    affectedIndustries: rule.affectedIndustries,
    supplyChainNodes: rule.supplyChainNodes,
    likelyAffectedCompanies: [...candidates.values()]
      .sort((a, b) => evidenceRank(b.evidenceLevel) - evidenceRank(a.evidenceLevel) || Number(b.isCurated) - Number(a.isCurated))
      .slice(0, 14)
  };
}

function addCandidate(
  candidates: Map<string, MappedCompany>,
  company: TaiwanListedCompany,
  evidenceLevel: CompanyEvidenceLevel
) {
  const existing = candidates.get(company.ticker);
  if (!existing || evidenceRank(evidenceLevel) > evidenceRank(existing.evidenceLevel)) {
    candidates.set(company.ticker, {
      ...company,
      evidenceLevel
    });
  }
}

function evidenceRank(level: CompanyEvidenceLevel) {
  return level === "curated_match" ? 3 : level === "keyword_match" ? 2 : 1;
}
