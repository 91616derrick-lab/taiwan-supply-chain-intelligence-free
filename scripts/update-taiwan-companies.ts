import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fallbackCuratedCompanies } from "../src/data/curatedCompanyTags";
import { mergeCompanyUniverse, inferRoleFromIndustry } from "../src/lib/companies/mergeCompanyUniverse";
import type {
  CompanyExchange,
  CompanyMarket,
  CompanyUniverseSummary,
  TaiwanListedCompany
} from "../src/lib/companies/companyTypes";

const sources = [
  {
    url: "https://isin.twse.com.tw/isin/C_public.jsp?strMode=2",
    exchange: "TWSE" as CompanyExchange,
    market: "上市" as CompanyMarket
  },
  {
    url: "https://isin.twse.com.tw/isin/C_public.jsp?strMode=4",
    exchange: "TPEx" as CompanyExchange,
    market: "上櫃" as CompanyMarket
  }
];

const root = process.cwd();
const outputDir = path.join(root, "data", "taiwan-companies");
const allCompaniesPath = path.join(outputDir, "all-companies.json");
const summaryPath = path.join(outputDir, "summary.json");
const updatedAt = new Date().toISOString();

async function main() {
  const parseErrors: string[] = [];
  const fetched = await Promise.all(
    sources.map(async (source) => {
      try {
        return await fetchIsinCompanies(source.url, source.exchange, source.market);
      } catch (error) {
        parseErrors.push(`${source.market} ${source.url}: ${error instanceof Error ? error.message : "unknown error"}`);
        return [] as TaiwanListedCompany[];
      }
    })
  );

  let companies = dedupeByTicker(fetched.flat());
  let status: CompanyUniverseSummary["status"] = "ok";

  if (companies.length < 1000 || companies.every((company) => company.exchange !== "TWSE") || companies.every((company) => company.exchange !== "TPEx")) {
    const fallback = await readPreviousCompanies();
    if (fallback.length > companies.length) {
      companies = fallback;
      status = "warning";
      parseErrors.push("Official source parse incomplete; reused previous all-companies.json.");
    } else {
      companies = fallbackCuratedCompanies(updatedAt);
      status = "failed";
      parseErrors.push("Official source parse failed and no usable previous file existed; used built-in curated fallback.");
    }
  }

  const merged = mergeCompanyUniverse(
    companies.map((company) => ({
      ...company,
      updatedAt,
      supplyChainRole: company.supplyChainRole || inferRoleFromIndustry(company.industry)
    }))
  ).sort((a, b) => a.ticker.localeCompare(b.ticker, "en"));

  const summary = buildSummary(merged, parseErrors, status);

  await mkdir(outputDir, { recursive: true });
  await writeFile(allCompaniesPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`updated company universe: total=${summary.totalCompanies} TWSE=${summary.twseCount} TPEx=${summary.tpexCount} status=${summary.status}`);
  if (summary.parseErrors.length > 0) {
    console.log(`parse warnings=${summary.parseErrors.length}`);
  }
}

async function fetchIsinCompanies(url: string, exchange: CompanyExchange, market: CompanyMarket) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 taiwan-supply-chain-intelligence-free/1.0",
      accept: "text/html,application/xhtml+xml"
    },
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const html = decodeIsinHtml(buffer);
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((match) => match[1]);
  const companies: TaiwanListedCompany[] = [];

  for (const row of rows) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => cleanCell(match[1]));
    if (cells.length < 5) continue;

    const parsedName = parseTickerAndName(cells[0]);
    if (!parsedName) continue;

    const [ticker, companyName] = parsedName;
    const isin = cells[1] || "";
    const listedDate = normalizeListedDate(cells[2]);
    const rowMarket = cells[3];
    const industry = cells[4];

    if (!isCommonStock(ticker, companyName, rowMarket, industry, market)) continue;

    companies.push({
      companyName,
      ticker,
      exchange,
      market,
      isin,
      listedDate,
      industry,
      supplyChainRole: inferRoleFromIndustry(industry),
      aliases: [],
      keywords: [companyName, ticker, industry],
      sensitivityTags: [],
      thematicExposures: [],
      isCurated: false,
      source: url,
      updatedAt
    });
  }

  if (companies.length === 0) {
    throw new Error("No common-stock company rows parsed.");
  }

  return companies;
}

function decodeIsinHtml(buffer: ArrayBuffer) {
  try {
    return new TextDecoder("big5").decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

function cleanCell(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTickerAndName(input: string): [string, string] | null {
  const normalized = input.replace(/\u3000/g, " ").replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(\d{4})(?:\s+)(.+)$/);
  if (!match) return null;
  return [match[1], match[2].trim()];
}

function normalizeListedDate(input: string) {
  const normalized = input.trim();
  if (!normalized || normalized === "-") return null;
  const match = normalized.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : normalized;
}

function isCommonStock(ticker: string, companyName: string, rowMarket: string, industry: string, expectedMarket: CompanyMarket) {
  const excludedText = `${companyName} ${rowMarket} ${industry}`;
  const excludedTerms = ["ETF", "ETN", "權證", "債", "受益", "特別股", "興櫃", "創櫃", "存託", "指數投資", "期貨"];
  return (
    /^\d{4}$/.test(ticker) &&
    rowMarket === expectedMarket &&
    Boolean(industry && industry !== "-") &&
    !excludedTerms.some((term) => excludedText.includes(term))
  );
}

async function readPreviousCompanies() {
  try {
    const raw = await readFile(allCompaniesPath, "utf8");
    const parsed = JSON.parse(raw) as TaiwanListedCompany[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function dedupeByTicker(companies: TaiwanListedCompany[]) {
  const seen = new Map<string, TaiwanListedCompany>();
  for (const company of companies) {
    seen.set(company.ticker, company);
  }
  return [...seen.values()];
}

function buildSummary(
  companies: TaiwanListedCompany[],
  parseErrors: string[],
  status: CompanyUniverseSummary["status"]
): CompanyUniverseSummary {
  const industryCounts = companies.reduce<Record<string, number>>((counts, company) => {
    counts[company.industry] = (counts[company.industry] ?? 0) + 1;
    return counts;
  }, {});

  return {
    totalCompanies: companies.length,
    twseCount: companies.filter((company) => company.exchange === "TWSE").length,
    tpexCount: companies.filter((company) => company.exchange === "TPEx").length,
    industryCounts,
    updatedAt,
    sourceUrls: sources.map((source) => source.url),
    parseErrors,
    status
  };
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
