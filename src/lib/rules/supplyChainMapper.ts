import { taiwanCompanies, type TaiwanCompany } from "@/src/data/taiwanCompanies";
import type { EventCategory } from "./keywordClassifier";

export type SupplyChainMapping = {
  affectedIndustries: string[];
  supplyChainNodes: string[];
  likelyAffectedCompanies: TaiwanCompany[];
};

const categoryMap: Record<
  EventCategory,
  {
    affectedIndustries: string[];
    supplyChainNodes: string[];
    tickers: string[];
    tagFallbacks: string[];
  }
> = {
  AI_SERVER_DEMAND: {
    affectedIndustries: ["AI server", "ODM/EMS", "power supply", "thermal", "PCB", "optical networking"],
    supplyChainNodes: ["GPU server assembly", "power shelf", "liquid cooling", "high-speed PCB", "data-center switch"],
    tickers: ["2382", "3231", "6669", "2317", "2308", "3017", "3324", "2383", "3037", "2345"],
    tagFallbacks: ["AI_SERVER_DEMAND"]
  },
  NVIDIA_SUPPLY_CHAIN: {
    affectedIndustries: ["AI accelerator", "advanced packaging", "server ODM", "PCB", "networking"],
    supplyChainNodes: ["accelerator platform", "CoWoS packaging", "GPU server board", "switching fabric"],
    tickers: ["2330", "3711", "2449", "2382", "3231", "6669", "2368", "2383", "2345", "3324"],
    tagFallbacks: ["NVIDIA_SUPPLY_CHAIN", "AI_SERVER_DEMAND"]
  },
  SEMI_EXPORT_CONTROL: {
    affectedIndustries: ["semiconductor", "equipment", "advanced process", "IC design"],
    supplyChainNodes: ["advanced logic", "EDA and ASIC", "fab equipment", "specialty materials"],
    tickers: ["2330", "2454", "3661", "3443", "3680", "6196", "3583", "5434"],
    tagFallbacks: ["SEMI_EXPORT_CONTROL"]
  },
  TSMC_CAPEX: {
    affectedIndustries: ["foundry", "equipment", "materials", "advanced packaging"],
    supplyChainNodes: ["fab construction", "EUV support", "cleanroom", "wafer and chemicals", "CoWoS capacity"],
    tickers: ["2330", "6488", "3680", "6196", "2404", "6139", "1560", "4755", "6640", "3131"],
    tagFallbacks: ["TSMC_CAPEX"]
  },
  HBM_MEMORY: {
    affectedIndustries: ["memory", "advanced packaging", "testing", "AI server"],
    supplyChainNodes: ["HBM stack", "DRAM supply", "logic-memory integration", "burn-in testing"],
    tickers: ["2344", "2408", "2337", "6531", "3711", "2449", "6669", "2382"],
    tagFallbacks: ["HBM_MEMORY"]
  },
  DATA_CENTER_POWER: {
    affectedIndustries: ["power supply", "thermal", "grid equipment", "data-center infrastructure"],
    supplyChainNodes: ["power conversion", "UPS", "transformer", "liquid cooling", "grid interconnect"],
    tickers: ["2308", "6282", "6412", "3017", "3324", "1513", "1503", "1514", "1519", "1609"],
    tagFallbacks: ["DATA_CENTER_POWER"]
  },
  SHIPPING_DISRUPTION: {
    affectedIndustries: ["container shipping", "logistics", "export supply chain", "air cargo"],
    supplyChainNodes: ["container route", "port handling", "freight forwarding", "air cargo"],
    tickers: ["2603", "2609", "2615", "2610", "2618", "2636", "2608"],
    tagFallbacks: ["SHIPPING_DISRUPTION"]
  },
  ENERGY_PRICE: {
    affectedIndustries: ["petrochemical", "airline", "shipping", "manufacturing cost", "power equipment"],
    supplyChainNodes: ["fuel cost", "feedstock", "electricity tariff", "factory utility"],
    tickers: ["6505", "1301", "1303", "1326", "2610", "2618", "2308", "1513", "1519"],
    tagFallbacks: ["ENERGY_PRICE"]
  },
  FED_RATE: {
    affectedIndustries: ["finance", "exporters", "valuation-sensitive growth", "capital equipment"],
    supplyChainNodes: ["discount rate", "bank NIM", "USD funding", "capex hurdle rate"],
    tickers: ["2882", "2881", "2891", "2885", "2884", "2886", "2330", "2382"],
    tagFallbacks: ["FED_RATE"]
  },
  FX_USD_TWD: {
    affectedIndustries: ["export hardware", "finance", "import cost", "airline fuel"],
    supplyChainNodes: ["USD revenue translation", "TWD cost base", "FX hedging", "fuel import"],
    tickers: ["2330", "2317", "2382", "3231", "2886", "2882", "2610", "2618"],
    tagFallbacks: ["FX_USD_TWD"]
  },
  CHINA_STIMULUS: {
    affectedIndustries: ["consumer electronics", "industrial automation", "petrochemical", "display"],
    supplyChainNodes: ["China demand", "factory automation", "panel cycle", "chemical spread"],
    tickers: ["2454", "3034", "2409", "3481", "2049", "1504", "1301", "1303", "1326"],
    tagFallbacks: ["CHINA_STIMULUS"]
  },
  TAIWAN_GEOPOLITICS: {
    affectedIndustries: ["semiconductor", "shipping", "finance", "export supply chain"],
    supplyChainNodes: ["risk premium", "insurance", "shipping route", "inventory buffer"],
    tickers: ["2330", "2303", "2454", "2603", "2609", "2881", "2882", "2891"],
    tagFallbacks: ["TAIWAN_GEOPOLITICS"]
  },
  EV_BATTERY: {
    affectedIndustries: ["EV", "auto electronics", "power components", "industrial automation"],
    supplyChainNodes: ["battery test", "connector", "wire harness", "charging", "vehicle electronics"],
    tickers: ["3023", "6279", "2360", "3552", "2231", "1536", "1522", "2497", "3665"],
    tagFallbacks: ["EV_BATTERY"]
  },
  COMPANY_EARNINGS: {
    affectedIndustries: ["company fundamentals", "sector read-through", "earnings quality"],
    supplyChainNodes: ["revenue", "margin", "guidance", "inventory", "order visibility"],
    tickers: ["2330", "2454", "2382", "3231", "6669", "2308", "3037", "2345", "2882"],
    tagFallbacks: ["COMPANY_EARNINGS"]
  },
  TRADE_TARIFF: {
    affectedIndustries: ["export supply chain", "hardware assembly", "shipping", "China exposure"],
    supplyChainNodes: ["tariff pass-through", "country-of-origin", "rerouting", "inventory buffer"],
    tickers: ["2317", "2382", "3231", "4938", "2603", "2609", "2615", "2454"],
    tagFallbacks: ["TRADE_TARIFF"]
  },
  UNKNOWN: {
    affectedIndustries: ["cross-sector"],
    supplyChainNodes: ["signal verification"],
    tickers: ["2330", "2382", "2308", "2882"],
    tagFallbacks: []
  }
};

export function mapSupplyChain(category: EventCategory): SupplyChainMapping {
  const rule = categoryMap[category];
  const byTicker = new Map(taiwanCompanies.map((company) => [company.ticker, company]));
  const selected = rule.tickers.flatMap((ticker) => {
    const company = byTicker.get(ticker);
    return company ? [company] : [];
  });

  const fallbackMatches = taiwanCompanies
    .filter((company) => company.sensitivityTags.some((tag) => rule.tagFallbacks.includes(tag)))
    .slice(0, 12);

  const unique = new Map<string, TaiwanCompany>();
  for (const company of [...selected, ...fallbackMatches]) {
    unique.set(company.ticker, company);
  }

  return {
    affectedIndustries: rule.affectedIndustries,
    supplyChainNodes: rule.supplyChainNodes,
    likelyAffectedCompanies: [...unique.values()].slice(0, 12)
  };
}
