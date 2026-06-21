export type SourceCategory =
  | "semiconductor"
  | "AI server"
  | "hyperscaler capex"
  | "Nvidia / AMD / Broadcom"
  | "TSMC / ASML / semiconductor equipment"
  | "memory / HBM / DRAM"
  | "shipping"
  | "energy"
  | "macro / Fed / rates / FX"
  | "geopolitics / trade policy"
  | "Taiwan market / MOPS / TWSE"
  | "company IR / press release";

export type IntelligenceSource = {
  id: string;
  name: string;
  publisher: string;
  category: SourceCategory;
  url: string;
  kind: "rss" | "json" | "html";
  quality: "official" | "primary" | "media";
  enabled: boolean;
  keywords: string[];
  fallbackTitle: string;
  fallbackSummary: string;
  note?: string;
};

export const intelligenceSources: IntelligenceSource[] = [
  {
    id: "reuters-tech",
    name: "Reuters Technology RSS",
    publisher: "Reuters",
    category: "semiconductor",
    url: "https://feeds.reuters.com/reuters/technologyNews",
    kind: "rss",
    quality: "media",
    enabled: true,
    keywords: ["semiconductor", "chip", "AI", "Nvidia", "TSMC", "export control"],
    fallbackTitle: "Semiconductor news source temporarily unavailable",
    fallbackSummary:
      "Reuters technology feed could not be parsed. Keep monitoring chip demand, export controls, and supplier commentary through primary filings."
  },
  {
    id: "semiconductor-digest",
    name: "Semiconductor Digest",
    publisher: "Semiconductor Digest",
    category: "TSMC / ASML / semiconductor equipment",
    url: "https://www.semiconductor-digest.com/feed/",
    kind: "rss",
    quality: "media",
    enabled: true,
    keywords: ["fab", "equipment", "wafer", "ASML", "TSMC", "capacity"],
    fallbackTitle: "Semiconductor equipment feed unavailable",
    fallbackSummary:
      "Equipment and materials RSS did not respond. Validate capex, tool lead time, and materials signals through company releases."
  },
  {
    id: "nvidia-news",
    name: "NVIDIA Newsroom",
    publisher: "NVIDIA",
    category: "Nvidia / AMD / Broadcom",
    url: "https://nvidianews.nvidia.com/news?pagetemplate=rss",
    kind: "rss",
    quality: "primary",
    enabled: true,
    keywords: ["GPU", "Blackwell", "AI server", "networking", "accelerator"],
    fallbackTitle: "NVIDIA newsroom feed unavailable",
    fallbackSummary:
      "NVIDIA primary feed could not be parsed. Watch accelerator launches, networking updates, and supply-chain references."
  },
  {
    id: "amd-news",
    name: "AMD Newsroom",
    publisher: "AMD",
    category: "Nvidia / AMD / Broadcom",
    url: "https://www.amd.com/en/newsroom/rss.xml",
    kind: "rss",
    quality: "primary",
    enabled: true,
    keywords: ["GPU", "MI300", "MI350", "AI", "server", "accelerator"],
    fallbackTitle: "AMD newsroom feed unavailable",
    fallbackSummary:
      "AMD primary feed could not be parsed. Monitor AI accelerator cadence, hyperscaler adoption, and server CPU demand."
  },
  {
    id: "tsmc-pr",
    name: "TSMC Press Releases",
    publisher: "TSMC",
    category: "TSMC / ASML / semiconductor equipment",
    url: "https://pr.tsmc.com/english/news?type=press",
    kind: "html",
    quality: "primary",
    enabled: true,
    keywords: ["TSMC", "capex", "advanced process", "CoWoS", "packaging"],
    fallbackTitle: "TSMC press page metadata unavailable",
    fallbackSummary:
      "TSMC press page metadata could not be retrieved. Check official monthly revenue, investor materials, and capex commentary."
  },
  {
    id: "twse-news",
    name: "TWSE Market News",
    publisher: "TWSE",
    category: "Taiwan market / MOPS / TWSE",
    url: "https://www.twse.com.tw/en/news/newsList",
    kind: "html",
    quality: "official",
    enabled: true,
    keywords: ["Taiwan", "listed", "market", "disclosure", "trading"],
    fallbackTitle: "TWSE public news metadata unavailable",
    fallbackSummary:
      "TWSE public page could not be parsed. Use MOPS and TWSE announcements to confirm exchange-level changes."
  },
  {
    id: "fed-rss",
    name: "Federal Reserve Press Releases",
    publisher: "Federal Reserve",
    category: "macro / Fed / rates / FX",
    url: "https://www.federalreserve.gov/feeds/press_all.xml",
    kind: "rss",
    quality: "official",
    enabled: true,
    keywords: ["Fed", "rate", "inflation", "USD", "Treasury", "liquidity"],
    fallbackTitle: "Federal Reserve RSS unavailable",
    fallbackSummary:
      "Federal Reserve RSS did not respond. Recheck FOMC statements, rate path, USD/TWD impact, and liquidity conditions."
  },
  {
    id: "ustr-press",
    name: "USTR Press Releases",
    publisher: "USTR",
    category: "geopolitics / trade policy",
    url: "https://ustr.gov/about-us/policy-offices/press-office/press-releases",
    kind: "html",
    quality: "official",
    enabled: true,
    keywords: ["tariff", "trade", "China", "export", "policy", "Section 301"],
    fallbackTitle: "USTR press page metadata unavailable",
    fallbackSummary:
      "USTR press page could not be parsed. Watch tariff, trade-policy, and export-control developments affecting Taiwan hardware supply chains."
  },
  {
    id: "eia-today",
    name: "EIA Today in Energy",
    publisher: "U.S. Energy Information Administration",
    category: "energy",
    url: "https://www.eia.gov/todayinenergy/rss.php",
    kind: "rss",
    quality: "official",
    enabled: true,
    keywords: ["energy", "oil", "gas", "electricity", "power", "fuel"],
    fallbackTitle: "EIA energy feed unavailable",
    fallbackSummary:
      "EIA feed could not be parsed. Monitor energy prices and power availability for data-center and manufacturing cost pressure."
  },
  {
    id: "freightwaves",
    name: "FreightWaves",
    publisher: "FreightWaves",
    category: "shipping",
    url: "https://www.freightwaves.com/news/feed",
    kind: "rss",
    quality: "media",
    enabled: true,
    keywords: ["shipping", "freight", "container", "port", "Red Sea", "logistics"],
    fallbackTitle: "Shipping logistics feed unavailable",
    fallbackSummary:
      "Freight and logistics RSS did not respond. Monitor container rates, port congestion, and disruption risk for export supply chains."
  },
  {
    id: "trendforce",
    name: "TrendForce Press Center",
    publisher: "TrendForce",
    category: "memory / HBM / DRAM",
    url: "https://www.trendforce.com/presscenter/rss",
    kind: "rss",
    quality: "media",
    enabled: true,
    keywords: ["HBM", "DRAM", "NAND", "memory", "server", "AI"],
    fallbackTitle: "Memory market feed unavailable",
    fallbackSummary:
      "Memory market RSS could not be parsed. Track HBM pricing, DRAM cycle, and server memory demand through supplier reports."
  },
  {
    id: "mops",
    name: "MOPS Public Disclosures",
    publisher: "MOPS",
    category: "company IR / press release",
    url: "https://mops.twse.com.tw/mops/web/index",
    kind: "html",
    quality: "official",
    enabled: true,
    keywords: ["material information", "earnings", "revenue", "guidance", "Taiwan"],
    fallbackTitle: "MOPS metadata unavailable",
    fallbackSummary:
      "MOPS public website metadata could not be parsed. Company material information remains the primary verification source.",
    note:
      "MOPS pages can be difficult to scrape reliably. The updater treats this as best-effort and records failures in system status."
  },
  {
    id: "datacenter-dynamics",
    name: "Data Center Dynamics",
    publisher: "Data Center Dynamics",
    category: "hyperscaler capex",
    url: "https://www.datacenterdynamics.com/en/rss/",
    kind: "rss",
    quality: "media",
    enabled: true,
    keywords: ["data center", "capex", "hyperscaler", "power", "AI infrastructure"],
    fallbackTitle: "Data-center infrastructure feed unavailable",
    fallbackSummary:
      "Data-center infrastructure feed could not be parsed. Monitor hyperscaler capex, power constraints, and AI cluster deployment signals."
  }
];
