export type CompanyExchange = "TWSE" | "TPEx";
export type CompanyMarket = "上市" | "上櫃";
export type CompanyEvidenceLevel = "curated_match" | "keyword_match" | "industry_match";

export type TaiwanListedCompany = {
  companyName: string;
  ticker: string;
  exchange: CompanyExchange;
  market: CompanyMarket;
  isin: string;
  listedDate: string | null;
  industry: string;
  supplyChainRole: string;
  aliases: string[];
  keywords: string[];
  sensitivityTags: string[];
  thematicExposures?: string[];
  isCurated: boolean;
  source: string;
  updatedAt: string;
};

export type CompanyUniverseSummary = {
  totalCompanies: number;
  twseCount: number;
  tpexCount: number;
  industryCounts: Record<string, number>;
  updatedAt: string;
  sourceUrls: string[];
  parseErrors: string[];
  status?: "ok" | "warning" | "failed";
};
