import type { TaiwanListedCompany } from "@/src/lib/companies/companyTypes";

export type CuratedCompanyTag = {
  ticker: string;
  companyName: string;
  aliases: string[];
  keywords: string[];
  sensitivityTags: string[];
  supplyChainRole: string;
  thematicExposures: string[];
};

export const curatedCompanyTags: CuratedCompanyTag[] = [
  {
    ticker: "2330",
    companyName: "台積電",
    aliases: ["TSMC", "Taiwan Semiconductor"],
    keywords: ["foundry", "advanced foundry", "CoWoS", "AI accelerator", "Nvidia supply chain", "advanced process"],
    sensitivityTags: ["TSMC_CAPEX", "AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "SEMI_EXPORT_CONTROL"],
    supplyChainRole: "先進製程晶圓代工與先進封裝核心供應商",
    thematicExposures: ["advanced foundry", "CoWoS", "AI accelerator", "Nvidia supply chain"]
  },
  {
    ticker: "2317",
    companyName: "鴻海",
    aliases: ["Foxconn", "Hon Hai"],
    keywords: ["AI server", "EMS", "rack", "GB200", "GB300"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "TRADE_TARIFF"],
    supplyChainRole: "電子製造服務與 AI 伺服器整機整合",
    thematicExposures: ["AI server EMS", "rack integration", "Nvidia supply chain"]
  },
  {
    ticker: "2382",
    companyName: "廣達",
    aliases: ["Quanta", "QCT"],
    keywords: ["AI server ODM", "hyperscaler", "GB200", "cloud server"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "COMPANY_EARNINGS"],
    supplyChainRole: "大型雲端客戶 AI 伺服器代工設計與製造",
    thematicExposures: ["AI server ODM", "hyperscaler", "GB200"]
  },
  {
    ticker: "3231",
    companyName: "緯創",
    aliases: ["Wistron"],
    keywords: ["AI server ODM", "Nvidia", "enterprise server", "GPU server"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "TRADE_TARIFF"],
    supplyChainRole: "AI 伺服器與企業伺服器代工",
    thematicExposures: ["AI server ODM", "Nvidia", "enterprise server"]
  },
  {
    ticker: "6669",
    companyName: "緯穎",
    aliases: ["Wiwynn"],
    keywords: ["AI server", "cloud server", "hyperscaler", "rack"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "COMPANY_EARNINGS"],
    supplyChainRole: "雲端資料中心與 AI 伺服器系統供應商",
    thematicExposures: ["AI server", "cloud server", "hyperscaler"]
  },
  {
    ticker: "2308",
    companyName: "台達電",
    aliases: ["Delta Electronics"],
    keywords: ["power supply", "data center power", "energy efficiency", "UPS", "thermal"],
    sensitivityTags: ["DATA_CENTER_POWER", "AI_SERVER_DEMAND", "ENERGY_PRICE"],
    supplyChainRole: "資料中心電源管理、電力設備與能源效率解決方案",
    thematicExposures: ["power supply", "data center power", "energy efficiency"]
  },
  {
    ticker: "3017",
    companyName: "奇鋐",
    aliases: ["AVC"],
    keywords: ["thermal solution", "liquid cooling", "fan", "heat sink"],
    sensitivityTags: ["AI_SERVER_DEMAND", "DATA_CENTER_POWER", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "伺服器散熱模組、風扇與液冷解決方案",
    thematicExposures: ["thermal solution", "liquid cooling"]
  },
  {
    ticker: "3324",
    companyName: "雙鴻",
    aliases: ["Auras"],
    keywords: ["thermal solution", "liquid cooling", "heat sink", "server cooling"],
    sensitivityTags: ["AI_SERVER_DEMAND", "DATA_CENTER_POWER", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "AI 伺服器散熱模組與液冷相關零組件",
    thematicExposures: ["thermal solution", "liquid cooling"]
  },
  {
    ticker: "2383",
    companyName: "台光電",
    aliases: ["ITEQ"],
    keywords: ["CCL", "high-speed PCB material", "low-loss material", "server PCB"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "高速 PCB 所需銅箔基板材料供應商",
    thematicExposures: ["CCL", "high-speed PCB material"]
  },
  {
    ticker: "6213",
    companyName: "聯茂",
    aliases: ["Elite Material"],
    keywords: ["CCL", "PCB material", "server", "high-speed material"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "伺服器與高速網通 PCB 材料供應商",
    thematicExposures: ["CCL", "high-speed PCB material"]
  },
  {
    ticker: "3037",
    companyName: "欣興",
    aliases: ["Unimicron"],
    keywords: ["ABF substrate", "PCB", "IC substrate", "AI chip"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN", "TSMC_CAPEX"],
    supplyChainRole: "ABF 載板、IC 載板與高階 PCB 供應商",
    thematicExposures: ["ABF substrate", "PCB"]
  },
  {
    ticker: "8046",
    companyName: "南電",
    aliases: ["Nan Ya PCB"],
    keywords: ["ABF substrate", "IC substrate", "PCB"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "ABF 載板與 IC 載板供應商",
    thematicExposures: ["ABF substrate", "PCB"]
  },
  {
    ticker: "3189",
    companyName: "景碩",
    aliases: ["Kinsus"],
    keywords: ["ABF substrate", "BT substrate", "IC substrate"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "IC 載板與 ABF/BT 載板供應商",
    thematicExposures: ["ABF substrate", "PCB"]
  },
  {
    ticker: "2345",
    companyName: "智邦",
    aliases: ["Accton"],
    keywords: ["networking", "switch", "data center switch", "optical networking"],
    sensitivityTags: ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
    supplyChainRole: "資料中心交換器與網通設備供應商",
    thematicExposures: ["networking", "switch", "optical networking"]
  },
  {
    ticker: "6285",
    companyName: "啟碁",
    aliases: ["WNC"],
    keywords: ["networking", "wireless", "satellite", "CPE"],
    sensitivityTags: ["AI_SERVER_DEMAND", "COMPANY_EARNINGS"],
    supplyChainRole: "無線通訊與網通設備供應商",
    thematicExposures: ["networking", "wireless communication"]
  },
  {
    ticker: "5388",
    companyName: "中磊",
    aliases: ["Sercomm"],
    keywords: ["networking", "broadband", "CPE", "gateway"],
    sensitivityTags: ["AI_SERVER_DEMAND", "COMPANY_EARNINGS"],
    supplyChainRole: "寬頻與網路通訊設備供應商",
    thematicExposures: ["networking", "broadband"]
  },
  {
    ticker: "2603",
    companyName: "長榮",
    aliases: ["Evergreen Marine"],
    keywords: ["container shipping", "freight rate", "shipping route", "logistics"],
    sensitivityTags: ["SHIPPING_DISRUPTION", "TRADE_TARIFF", "ENERGY_PRICE"],
    supplyChainRole: "貨櫃航運公司，受運價與航線變化影響",
    thematicExposures: ["container shipping", "freight rate"]
  },
  {
    ticker: "2609",
    companyName: "陽明",
    aliases: ["Yang Ming"],
    keywords: ["container shipping", "freight rate", "shipping route"],
    sensitivityTags: ["SHIPPING_DISRUPTION", "TRADE_TARIFF", "ENERGY_PRICE"],
    supplyChainRole: "貨櫃航運公司，受全球運價與航線變動影響",
    thematicExposures: ["container shipping", "freight rate"]
  },
  {
    ticker: "2615",
    companyName: "萬海",
    aliases: ["Wan Hai"],
    keywords: ["container shipping", "intra-Asia", "freight rate"],
    sensitivityTags: ["SHIPPING_DISRUPTION", "TRADE_TARIFF", "ENERGY_PRICE"],
    supplyChainRole: "亞洲線貨櫃航運公司",
    thematicExposures: ["container shipping", "freight rate"]
  },
  {
    ticker: "2882",
    companyName: "國泰金",
    aliases: ["Cathay Financial"],
    keywords: ["financial holding", "insurance", "interest rate", "exchange rate"],
    sensitivityTags: ["FED_RATE", "FX_USD_TWD", "TAIWAN_GEOPOLITICS"],
    supplyChainRole: "金融控股與保險公司，受利率、匯率與市場風險影響",
    thematicExposures: ["interest rate", "exchange rate", "financial holding"]
  }
];

export function curatedTagByTicker() {
  return new Map(curatedCompanyTags.map((tag) => [tag.ticker, tag]));
}

export function fallbackCuratedCompanies(updatedAt: string): TaiwanListedCompany[] {
  return curatedCompanyTags.map((tag) => ({
    companyName: tag.companyName,
    ticker: tag.ticker,
    exchange: tag.ticker === "5388" ? "TPEx" : "TWSE",
    market: tag.ticker === "5388" ? "上櫃" : "上市",
    isin: "",
    listedDate: null,
    industry: inferIndustryFromTags(tag.sensitivityTags),
    supplyChainRole: tag.supplyChainRole,
    aliases: tag.aliases,
    keywords: tag.keywords,
    sensitivityTags: tag.sensitivityTags,
    thematicExposures: tag.thematicExposures,
    isCurated: true,
    source: "built-in curated fallback",
    updatedAt
  }));
}

function inferIndustryFromTags(tags: string[]) {
  if (tags.includes("SHIPPING_DISRUPTION")) return "航運業";
  if (tags.includes("FED_RATE")) return "金融保險業";
  if (tags.includes("DATA_CENTER_POWER")) return "電子零組件業";
  if (tags.includes("AI_SERVER_DEMAND")) return "電腦及週邊設備業";
  return "半導體業";
}
