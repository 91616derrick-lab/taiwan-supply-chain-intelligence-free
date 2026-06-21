import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CompanyUniverseSummary, TaiwanListedCompany } from "../src/lib/companies/companyTypes";

const root = process.cwd();
const allCompaniesPath = path.join(root, "data", "taiwan-companies", "all-companies.json");
const summaryPath = path.join(root, "data", "taiwan-companies", "summary.json");

async function main() {
  const companies = JSON.parse(await readFile(allCompaniesPath, "utf8")) as TaiwanListedCompany[];
  const summary = JSON.parse(await readFile(summaryPath, "utf8")) as CompanyUniverseSummary;
  const errors: string[] = [];

  if (!Array.isArray(companies)) errors.push("all-companies.json must be an array.");
  if (companies.length < 1000) errors.push(`company count too low: ${companies.length}; expected at least 1000.`);
  if (summary.twseCount <= 0) errors.push("TWSE count must be greater than 0.");
  if (summary.tpexCount <= 0) errors.push("TPEx count must be greater than 0.");
  if (summary.totalCompanies !== companies.length) errors.push(`summary totalCompanies ${summary.totalCompanies} does not match all-companies length ${companies.length}.`);

  const tickerCounts = companies.reduce<Record<string, number>>((counts, company) => {
    counts[company.ticker] = (counts[company.ticker] ?? 0) + 1;
    return counts;
  }, {});
  const duplicateTickers = Object.entries(tickerCounts).filter(([, count]) => count > 1);
  if (duplicateTickers.length > Math.max(5, companies.length * 0.005)) {
    errors.push(`too many duplicate tickers: ${duplicateTickers.length}.`);
  }

  const excludedFundTickers = ["0050", "0051", "0052", "00878"];
  const leakedFunds = companies.filter((company) => excludedFundTickers.includes(company.ticker));
  if (leakedFunds.length > 0) {
    errors.push(`ETF/beneficiary securities should be excluded but were found: ${leakedFunds.map((company) => `${company.ticker} ${company.companyName}`).join(", ")}.`);
  }

  const required = [
    ["2330", "台積電"],
    ["2317", "鴻海"],
    ["2382", "廣達"],
    ["2308", "台達電"],
    ["2603", "長榮"],
    ["2882", "國泰金"]
  ];

  for (const [ticker, name] of required) {
    const found = companies.find((company) => company.ticker === ticker && company.companyName.includes(name));
    if (!found) {
      errors.push(`required company missing: ${ticker} ${name}.`);
    }
  }

  if (!summary.updatedAt) errors.push("summary.updatedAt is required.");
  if (!Array.isArray(summary.sourceUrls) || summary.sourceUrls.length < 2) errors.push("summary.sourceUrls must include TWSE and TPEx ISIN URLs.");

  if (errors.length > 0) {
    console.error("company validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`company validation passed: total=${companies.length}, TWSE=${summary.twseCount}, TPEx=${summary.tpexCount}, status=${summary.status ?? "ok"}`);
  if (summary.parseErrors.length > 0) {
    console.log(`company universe warnings: ${summary.parseErrors.length}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
