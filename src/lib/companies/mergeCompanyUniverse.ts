import allCompaniesJson from "../../../data/taiwan-companies/all-companies.json";
import summaryJson from "../../../data/taiwan-companies/summary.json";
import { curatedTagByTicker } from "@/src/data/curatedCompanyTags";
import type {
  CompanyUniverseSummary,
  TaiwanListedCompany
} from "@/src/lib/companies/companyTypes";

export function mergeCompanyUniverse(
  rawCompanies: TaiwanListedCompany[] = allCompaniesJson as TaiwanListedCompany[]
): TaiwanListedCompany[] {
  const curated = curatedTagByTicker();

  return rawCompanies.map((company) => {
    const tag = curated.get(company.ticker);
    if (!tag) {
      return {
        ...company,
        aliases: company.aliases ?? [],
        keywords: company.keywords ?? [],
        sensitivityTags: company.sensitivityTags ?? [],
        thematicExposures: company.thematicExposures ?? [],
        supplyChainRole: company.supplyChainRole || inferRoleFromIndustry(company.industry),
        isCurated: false
      };
    }

    return {
      ...company,
      companyName: company.companyName || tag.companyName,
      aliases: unique([...(company.aliases ?? []), ...tag.aliases]),
      keywords: unique([...(company.keywords ?? []), ...tag.keywords]),
      sensitivityTags: unique([...(company.sensitivityTags ?? []), ...tag.sensitivityTags]),
      thematicExposures: unique([...(company.thematicExposures ?? []), ...tag.thematicExposures]),
      supplyChainRole: tag.supplyChainRole || company.supplyChainRole,
      isCurated: true
    };
  });
}

export function getMergedCompanyUniverse() {
  return mergeCompanyUniverse();
}

export function getCompanyUniverseSummary() {
  return summaryJson as CompanyUniverseSummary;
}

export function inferRoleFromIndustry(industry: string) {
  const normalized = industry.toLowerCase();
  if (industry.includes("半導體")) return "半導體相關公司，可能受晶片景氣、先進製程或終端需求影響";
  if (industry.includes("電子零組件")) return "電子零組件供應商，可能受伺服器、車用或消費電子需求影響";
  if (industry.includes("電腦") || normalized.includes("computer")) return "電腦與伺服器相關硬體供應商";
  if (industry.includes("通信") || industry.includes("通訊")) return "網通與通訊設備供應商";
  if (industry.includes("航運")) return "航運物流公司，受運價、航線與燃油成本影響";
  if (industry.includes("金融")) return "金融公司，受利率、匯率與資本市場變化影響";
  if (industry.includes("塑膠") || industry.includes("化學")) return "原物料或化工公司，受油價、需求與利差影響";
  if (industry.includes("電機") || industry.includes("電器")) return "工業與電力設備公司，受基礎建設與電力需求影響";
  return `${industry || "台灣上市上櫃"}公司，需依最新事件判斷關聯`;
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}
