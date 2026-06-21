import type {
  ImpactDirection,
  ImpactMagnitude,
  ResearchPriority
} from "@/src/lib/schemas/intelligenceSchema";
import type { EventCategory } from "./keywordClassifier";
import type { SupplyChainMapping } from "./supplyChainMapper";

export type ImpactScore = {
  impactDirection: ImpactDirection;
  impactMagnitude: ImpactMagnitude;
  taiwanRelevanceScore: number;
  marketRelevanceScore: number;
  confidenceScore: number;
  researchPriority: ResearchPriority;
  missingData: string[];
  indicatorsToMonitor: string[];
};

const baseScores: Record<
  EventCategory,
  {
    direction: ImpactDirection;
    magnitude: ImpactMagnitude;
    taiwan: number;
    market: number;
    confidence: number;
    indicators: string[];
  }
> = {
  AI_SERVER_DEMAND: {
    direction: "positive",
    magnitude: "high",
    taiwan: 92,
    market: 90,
    confidence: 74,
    indicators: ["GPU allocation", "ODM backlog", "liquid-cooling attach rate", "server PCB lead time"]
  },
  NVIDIA_SUPPLY_CHAIN: {
    direction: "positive",
    magnitude: "high",
    taiwan: 90,
    market: 88,
    confidence: 72,
    indicators: ["NVIDIA platform timing", "CoWoS capacity", "networking mix", "rack-scale power draw"]
  },
  SEMI_EXPORT_CONTROL: {
    direction: "mixed",
    magnitude: "high",
    taiwan: 86,
    market: 83,
    confidence: 68,
    indicators: ["license scope", "China revenue exposure", "advanced-node restrictions", "customer inventory"]
  },
  TSMC_CAPEX: {
    direction: "positive",
    magnitude: "high",
    taiwan: 94,
    market: 86,
    confidence: 77,
    indicators: ["capex guidance", "tool delivery", "CoWoS expansion", "cleanroom orders"]
  },
  HBM_MEMORY: {
    direction: "positive",
    magnitude: "medium",
    taiwan: 78,
    market: 80,
    confidence: 66,
    indicators: ["HBM contract pricing", "DRAM supply growth", "advanced packaging bottleneck", "server memory BOM"]
  },
  DATA_CENTER_POWER: {
    direction: "positive",
    magnitude: "medium",
    taiwan: 82,
    market: 77,
    confidence: 70,
    indicators: ["power capex", "UPS orders", "thermal design wins", "grid constraints"]
  },
  SHIPPING_DISRUPTION: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 70,
    market: 68,
    confidence: 65,
    indicators: ["spot freight rates", "port congestion", "air cargo demand", "exporter inventory buffer"]
  },
  ENERGY_PRICE: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 64,
    market: 70,
    confidence: 66,
    indicators: ["Brent crude", "electricity tariffs", "petrochemical spreads", "airline fuel surcharge"]
  },
  FED_RATE: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 60,
    market: 82,
    confidence: 72,
    indicators: ["US 10Y yield", "DXY", "foreign flows", "bank NIM"]
  },
  FX_USD_TWD: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 78,
    market: 76,
    confidence: 67,
    indicators: ["USD/TWD", "hedging ratio", "exporter gross margin", "foreign equity flow"]
  },
  CHINA_STIMULUS: {
    direction: "positive",
    magnitude: "medium",
    taiwan: 62,
    market: 69,
    confidence: 58,
    indicators: ["China PMI", "consumer subsidies", "industrial orders", "petrochemical spread"]
  },
  TAIWAN_GEOPOLITICS: {
    direction: "negative",
    magnitude: "high",
    taiwan: 95,
    market: 90,
    confidence: 61,
    indicators: ["risk premium", "insurance cost", "foreign flows", "inventory behavior"]
  },
  EV_BATTERY: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 58,
    market: 63,
    confidence: 59,
    indicators: ["EV sales", "battery material prices", "connector orders", "charging capex"]
  },
  COMPANY_EARNINGS: {
    direction: "mixed",
    magnitude: "medium",
    taiwan: 72,
    market: 74,
    confidence: 64,
    indicators: ["monthly revenue", "gross margin", "inventory days", "order visibility"]
  },
  TRADE_TARIFF: {
    direction: "negative",
    magnitude: "medium",
    taiwan: 74,
    market: 73,
    confidence: 62,
    indicators: ["tariff list", "country-of-origin mix", "rerouting cost", "customer pass-through"]
  },
  UNKNOWN: {
    direction: "uncertain",
    magnitude: "low",
    taiwan: 35,
    market: 35,
    confidence: 35,
    indicators: ["source verification", "company disclosure", "price reaction"]
  }
};

export function scoreImpact(
  category: EventCategory,
  mapping: SupplyChainMapping,
  articleCountForTheme = 1
): ImpactScore {
  const base = baseScores[category];
  const sourceBoost = Math.min(8, Math.max(0, articleCountForTheme - 1) * 2);
  const breadthBoost = Math.min(8, Math.floor(mapping.likelyAffectedCompanies.length / 3));
  const confidenceScore = clamp(base.confidence + sourceBoost + breadthBoost, 0, 100);
  const marketRelevanceScore = clamp(base.market + sourceBoost, 0, 100);
  const taiwanRelevanceScore = clamp(base.taiwan + breadthBoost, 0, 100);
  const average = (marketRelevanceScore + taiwanRelevanceScore + confidenceScore) / 3;

  return {
    impactDirection: base.direction,
    impactMagnitude: base.magnitude,
    taiwanRelevanceScore,
    marketRelevanceScore,
    confidenceScore,
    researchPriority: average >= 78 ? "high" : average >= 58 ? "medium" : "low",
    missingData: [
      "未納入即時股價與估值資料",
      "需用公司公告或法說會內容二次確認",
      "規則引擎不代表個人化投資建議"
    ],
    indicatorsToMonitor: base.indicators
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
