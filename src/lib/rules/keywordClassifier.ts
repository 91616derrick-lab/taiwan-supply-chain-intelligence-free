import type { SourceCategory } from "@/src/data/sources";

export const eventCategories = [
  "AI_SERVER_DEMAND",
  "NVIDIA_SUPPLY_CHAIN",
  "SEMI_EXPORT_CONTROL",
  "TSMC_CAPEX",
  "HBM_MEMORY",
  "DATA_CENTER_POWER",
  "SHIPPING_DISRUPTION",
  "ENERGY_PRICE",
  "FED_RATE",
  "FX_USD_TWD",
  "CHINA_STIMULUS",
  "TAIWAN_GEOPOLITICS",
  "EV_BATTERY",
  "COMPANY_EARNINGS",
  "TRADE_TARIFF",
  "UNKNOWN"
] as const;

export type EventCategory = (typeof eventCategories)[number];

export type ClassifierInput = {
  title: string;
  summary: string;
  sourceCategory: SourceCategory | string;
  keywords?: string[];
};

const rules: Record<Exclude<EventCategory, "UNKNOWN">, string[]> = {
  AI_SERVER_DEMAND: [
    "ai server",
    "gpu server",
    "rack",
    "blackwell",
    "gb200",
    "gb300",
    "accelerator",
    "hyperscaler",
    "data center",
    "cloud capex"
  ],
  NVIDIA_SUPPLY_CHAIN: [
    "nvidia",
    "blackwell",
    "cuda",
    "gpu",
    "broadcom",
    "amd",
    "mi300",
    "mi350",
    "networking"
  ],
  SEMI_EXPORT_CONTROL: [
    "export control",
    "restriction",
    "blacklist",
    "entity list",
    "china chip",
    "advanced chip",
    "trade curb"
  ],
  TSMC_CAPEX: [
    "tsmc",
    "capex",
    "fab",
    "cowos",
    "advanced packaging",
    "euv",
    "asml",
    "wafer",
    "capacity"
  ],
  HBM_MEMORY: ["hbm", "dram", "memory", "nand", "ddr5", "server memory"],
  DATA_CENTER_POWER: [
    "power",
    "electricity",
    "grid",
    "ups",
    "cooling",
    "liquid cooling",
    "thermal",
    "energy demand"
  ],
  SHIPPING_DISRUPTION: [
    "shipping",
    "freight",
    "container",
    "port",
    "red sea",
    "suez",
    "logistics",
    "route"
  ],
  ENERGY_PRICE: ["oil", "gas", "energy", "fuel", "electricity", "power price", "crude"],
  FED_RATE: ["fed", "fomc", "rate", "inflation", "yield", "treasury", "liquidity"],
  FX_USD_TWD: ["usd", "twd", "currency", "fx", "dollar", "foreign exchange"],
  CHINA_STIMULUS: ["china stimulus", "policy support", "property support", "china demand", "beijing"],
  TAIWAN_GEOPOLITICS: ["taiwan", "strait", "geopolitical", "military drill", "election", "sanction"],
  EV_BATTERY: ["ev", "battery", "vehicle", "automotive", "charging", "lithium"],
  COMPANY_EARNINGS: ["earnings", "revenue", "guidance", "margin", "profit", "monthly sales"],
  TRADE_TARIFF: ["tariff", "trade", "section 301", "customs", "import duty", "export ban"]
};

const categoryHints: Partial<Record<SourceCategory, EventCategory[]>> = {
  "AI server": ["AI_SERVER_DEMAND", "NVIDIA_SUPPLY_CHAIN"],
  "hyperscaler capex": ["AI_SERVER_DEMAND", "DATA_CENTER_POWER"],
  "Nvidia / AMD / Broadcom": ["NVIDIA_SUPPLY_CHAIN", "AI_SERVER_DEMAND"],
  "TSMC / ASML / semiconductor equipment": ["TSMC_CAPEX", "SEMI_EXPORT_CONTROL"],
  "memory / HBM / DRAM": ["HBM_MEMORY", "AI_SERVER_DEMAND"],
  shipping: ["SHIPPING_DISRUPTION"],
  energy: ["ENERGY_PRICE", "DATA_CENTER_POWER"],
  "macro / Fed / rates / FX": ["FED_RATE", "FX_USD_TWD"],
  "geopolitics / trade policy": ["TRADE_TARIFF", "SEMI_EXPORT_CONTROL", "TAIWAN_GEOPOLITICS"],
  "Taiwan market / MOPS / TWSE": ["COMPANY_EARNINGS", "TAIWAN_GEOPOLITICS"],
  "company IR / press release": ["COMPANY_EARNINGS"],
  semiconductor: ["TSMC_CAPEX", "SEMI_EXPORT_CONTROL"]
};

export function classifyEvent(input: ClassifierInput): EventCategory {
  const text = [input.title, input.summary, input.sourceCategory, ...(input.keywords ?? [])]
    .join(" ")
    .toLowerCase();

  const scores = new Map<EventCategory, number>();

  for (const [category, terms] of Object.entries(rules) as [
    Exclude<EventCategory, "UNKNOWN">,
    string[]
  ][]) {
    const score = terms.reduce((total, term) => {
      return text.includes(term.toLowerCase()) ? total + (term.includes(" ") ? 3 : 1) : total;
    }, 0);

    if (score > 0) {
      scores.set(category, score);
    }
  }

  const hints = categoryHints[input.sourceCategory as SourceCategory] ?? [];
  for (const hint of hints) {
    scores.set(hint, (scores.get(hint) ?? 0) + 2);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] ?? "UNKNOWN";
}

export function categoryLabel(category: EventCategory): string {
  return category
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}
