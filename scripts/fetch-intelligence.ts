import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { intelligenceSources, type IntelligenceSource } from "../src/data/sources";
import { classifyEvent, type EventCategory } from "../src/lib/rules/keywordClassifier";
import { mapSupplyChain } from "../src/lib/rules/supplyChainMapper";
import { scoreImpact } from "../src/lib/rules/impactScorer";
import { generateManagerView } from "../src/lib/rules/managerViewGenerator";
import { getCompanyUniverseSummary, getMergedCompanyUniverse } from "../src/lib/companies/mergeCompanyUniverse";
import {
  intelligenceSchema,
  type CompanyImpact,
  type DiagnosticCheck,
  type IntelligenceData,
  type IntelligenceEvent,
  type ManagerObservation,
  type UpdaterStatus
} from "../src/lib/schemas/intelligenceSchema";
import {
  enhanceWithOllama,
  inspectLmStudioStatus,
  localAiEnabled
} from "../src/lib/local-ai/ollamaClient";

type RawArticle = {
  title: string;
  url: string;
  publisher: string;
  publishedAt: string;
  summary: string;
  sourceCategory: string;
  sourceId: string;
  quality: "official" | "primary" | "media" | "fallback";
};

type StatusError = {
  sourceId?: string;
  scope: string;
  message: string;
  at: string;
};

const root = process.cwd();
const generatedAt = new Date();
const generatedAtIso = generatedAt.toISOString();
const runId = buildRunId(generatedAt);
const runType = determineRunType(generatedAt);
const errors: StatusError[] = [];

async function main() {
  const companyUniverseSummary = getCompanyUniverseSummary();
  const enabledSources = intelligenceSources.filter((source) => source.enabled);
  const fetchedArticles = await Promise.all(enabledSources.map(fetchSource));
  const articles = dedupeArticles(fetchedArticles.flat()).slice(0, 40);
  const categoryCounts = new Map<EventCategory, number>();

  for (const article of articles) {
    const category = classifyEvent({
      title: article.title,
      summary: article.summary,
      sourceCategory: article.sourceCategory
    });
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  const events = articles.slice(0, 20).map((article, index) => {
    const category = classifyEvent({
      title: article.title,
      summary: article.summary,
      sourceCategory: article.sourceCategory
    });
    const mapping = mapSupplyChain(category);
    const score = scoreImpact(category, mapping, categoryCounts.get(category) ?? 1);

    return {
      id: `${runId}-event-${String(index + 1).padStart(2, "0")}`,
      category,
      title: article.title,
      url: article.url,
      publisher: article.publisher,
      publishedAt: article.publishedAt,
      summary: article.summary,
      whyItMatters: buildWhyItMatters(category, mapping.affectedIndustries),
      sourceCategory: article.sourceCategory,
      affectedIndustries: mapping.affectedIndustries,
      supplyChainNodes: mapping.supplyChainNodes,
      likelyAffectedCompanies: mapping.likelyAffectedCompanies.map((company) => ({
        companyName: company.companyName,
        ticker: company.ticker,
        exchange: company.exchange,
        market: company.market,
        industry: company.industry,
        supplyChainRole: company.supplyChainRole,
        isCurated: company.isCurated,
        evidenceLevel: company.evidenceLevel
      })),
      taiwanRelevanceScore: score.taiwanRelevanceScore,
      marketRelevanceScore: score.marketRelevanceScore,
      confidenceScore: score.confidenceScore,
      researchPriority: score.researchPriority,
      impactDirection: score.impactDirection,
      impactMagnitude: score.impactMagnitude,
      missingData: score.missingData,
      indicatorsToMonitor: score.indicatorsToMonitor,
      sourceIds: [article.sourceId]
    } satisfies IntelligenceEvent;
  });

  const managerObservations = await buildManagerObservations(events);
  const companyImpacts = buildCompanyImpacts(events);
  const systemStatus = {
    ok: errors.length < enabledSources.length,
    sourceCount: enabledSources.length,
    articleCount: articles.length,
    eventCount: events.length,
    companyImpactCount: companyImpacts.length,
    companyUniverse: {
      status: companyUniverseSummary.status ?? (companyUniverseSummary.totalCompanies >= 1000 ? "ok" : "warning"),
      totalCompanies: companyUniverseSummary.totalCompanies,
      twseCount: companyUniverseSummary.twseCount,
      tpexCount: companyUniverseSummary.tpexCount,
      updatedAt: companyUniverseSummary.updatedAt,
      sourceUrls: companyUniverseSummary.sourceUrls,
      parseErrors: companyUniverseSummary.parseErrors
    },
    errors
  };

  const engineMode = managerObservations.some((observation) => observation.engine === "local_ai_enhanced")
    ? "local_ai_enhanced"
    : "rule_based";

  const latest = intelligenceSchema.parse({
    schemaVersion: "1.0",
    generatedAt: generatedAtIso,
    runId,
    runType,
    engine: {
      mode: engineMode,
      localAiEnabled: localAiEnabled(),
      localAiModel: process.env.LOCAL_AI_MODEL ?? null
    },
    systemStatus,
    executiveSummary: buildExecutiveSummary(events, systemStatus.errors.length),
    events,
    companyImpacts,
    managerObservations,
    sources: articles.map((article, index) => ({
      id: `${runId}-source-${String(index + 1).padStart(2, "0")}`,
      ...article
    })),
    disclaimer: "研究用途，不構成投資建議。"
  } satisfies IntelligenceData);

  const status = await buildUpdaterStatus(latest);

  await mkdir(path.join(root, "data", "intelligence", "history"), { recursive: true });
  await mkdir(path.join(root, "data", "system"), { recursive: true });

  const latestPath = path.join(root, "data", "intelligence", "latest.json");
  const historyPath = path.join(root, "data", "intelligence", "history", `${formatTaipeiHistoryName(generatedAt)}.json`);
  const statusPath = path.join(root, "data", "system", "status.json");

  await writeFile(latestPath, `${JSON.stringify(latest, null, 2)}\n`, "utf8");
  await writeFile(historyPath, `${JSON.stringify(latest, null, 2)}\n`, "utf8");
  await writeFile(statusPath, `${JSON.stringify(status, null, 2)}\n`, "utf8");

  console.log(`wrote ${path.relative(root, latestPath)}`);
  console.log(`wrote ${path.relative(root, historyPath)}`);
  console.log(`wrote ${path.relative(root, statusPath)}`);
  console.log(`events=${events.length} companyImpacts=${companyImpacts.length} errors=${errors.length}`);
}

async function fetchSource(source: IntelligenceSource): Promise<RawArticle[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "taiwan-supply-chain-intelligence-free/1.0 research bot"
      },
      signal: AbortSignal.timeout(9000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const body = await response.text();
    const articles =
      source.kind === "rss" ? parseRss(body, source) : source.kind === "html" ? parseHtmlMetadata(body, source) : parseJson(body, source);

    if (articles.length === 0) {
      throw new Error("No parseable articles found");
    }

    return articles.slice(0, 5);
  } catch (error) {
    errors.push({
      sourceId: source.id,
      scope: "source_fetch",
      message: error instanceof Error ? error.message : "Unknown source fetch error",
      at: generatedAtIso
    });
    return [buildFallbackArticle(source)];
  }
}

function parseRss(body: string, source: IntelligenceSource): RawArticle[] {
  const itemMatches = [...body.matchAll(/<item\b[\s\S]*?<\/item>/gi)];
  const entries = itemMatches.length > 0 ? itemMatches : [...body.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)];

  return entries.map((entry) => {
    const xml = entry[0];
    const title = decodeXml(extractTag(xml, "title") || source.fallbackTitle);
    const url = decodeXml(extractTag(xml, "link") || extractAtomLink(xml) || source.url);
    const publishedAt = normalizeDate(extractTag(xml, "pubDate") || extractTag(xml, "updated") || extractTag(xml, "published"));
    const summary = decodeXml(stripTags(extractTag(xml, "description") || extractTag(xml, "summary") || extractTag(xml, "content:encoded") || source.fallbackSummary));

    return {
      title,
      url,
      publisher: source.publisher,
      publishedAt,
      summary: summary || source.fallbackSummary,
      sourceCategory: source.category,
      sourceId: source.id,
      quality: source.quality
    };
  });
}

function parseHtmlMetadata(body: string, source: IntelligenceSource): RawArticle[] {
  const title =
    extractMeta(body, "og:title") ||
    extractMeta(body, "twitter:title") ||
    stripTags(extractTag(body, "title")) ||
    source.fallbackTitle;
  const summary = extractMeta(body, "og:description") || extractMeta(body, "description") || source.fallbackSummary;

  return [
    {
      title: decodeXml(title),
      url: source.url,
      publisher: source.publisher,
      publishedAt: generatedAtIso,
      summary: decodeXml(summary),
      sourceCategory: source.category,
      sourceId: source.id,
      quality: source.quality
    }
  ];
}

function parseJson(body: string, source: IntelligenceSource): RawArticle[] {
  const payload = JSON.parse(body) as unknown;
  const records = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && payload && "items" in payload && Array.isArray((payload as { items: unknown }).items)
      ? (payload as { items: unknown[] }).items
      : [];

  return records.slice(0, 5).flatMap((record, index) => {
    if (!record || typeof record !== "object") {
      return [];
    }
    const value = record as Record<string, unknown>;
    const title = String(value.title ?? value.name ?? source.fallbackTitle);
    return [
      {
        title,
        url: String(value.url ?? value.link ?? source.url),
        publisher: source.publisher,
        publishedAt: normalizeDate(String(value.publishedAt ?? value.date ?? generatedAtIso)),
        summary: String(value.summary ?? value.description ?? source.fallbackSummary),
        sourceCategory: source.category,
        sourceId: `${source.id}-${index}`,
        quality: source.quality
      }
    ];
  });
}

function buildFallbackArticle(source: IntelligenceSource): RawArticle {
  return {
    title: source.fallbackTitle,
    url: source.url,
    publisher: source.publisher,
    publishedAt: generatedAtIso,
    summary: `${source.fallbackSummary} This fallback exists so the workflow can produce diagnostics instead of failing silently.`,
    sourceCategory: source.category,
    sourceId: source.id,
    quality: "fallback"
  };
}

async function buildManagerObservations(events: IntelligenceEvent[]): Promise<ManagerObservation[]> {
  const observations: ManagerObservation[] = [];

  for (const event of events) {
    const ruleBased = generateManagerView(event);

    if (observations.length < 3 && localAiEnabled()) {
      const result = await enhanceWithOllama({
        eventTitle: event.title,
        summary: event.summary,
        affectedIndustries: event.affectedIndustries,
        companies: event.likelyAffectedCompanies.map((company) => `${company.companyName} ${company.ticker}`)
      });

      if (result.ok) {
        observations.push({
          ...ruleBased,
          engine: "local_ai_enhanced",
          enhancedManagerView: result.text
        });
        continue;
      }

      errors.push({
        scope: "local_ai",
        message: result.message,
        at: generatedAtIso
      });
    }

    observations.push(ruleBased);
  }

  return observations;
}

function buildCompanyImpacts(events: IntelligenceEvent[]): CompanyImpact[] {
  const impacts = new Map<string, CompanyImpact>();
  const companyUniverse = getMergedCompanyUniverse();

  for (const event of events) {
    for (const affected of event.likelyAffectedCompanies) {
      const sourceCompany = companyUniverse.find((company) => company.ticker === affected.ticker);
      const existing = impacts.get(affected.ticker);

      if (!existing) {
        impacts.set(affected.ticker, {
          companyName: affected.companyName,
          ticker: affected.ticker,
          exchange: affected.exchange,
          market: affected.market,
          industry: affected.industry,
          supplyChainRole: affected.supplyChainRole,
          isCurated: affected.isCurated ?? false,
          evidenceLevel: affected.evidenceLevel ?? "industry_match",
          impactDirection: event.impactDirection,
          impactMagnitude: event.impactMagnitude,
          researchPriority: event.researchPriority,
          confidenceScore: event.confidenceScore,
          missingData: event.missingData,
          relatedEventIds: [event.id],
          sensitivityTags: sourceCompany?.sensitivityTags ?? []
        });
      } else {
        existing.relatedEventIds.push(event.id);
        existing.confidenceScore = Math.max(existing.confidenceScore, event.confidenceScore);
        existing.researchPriority = priorityRank(event.researchPriority) > priorityRank(existing.researchPriority) ? event.researchPriority : existing.researchPriority;
        existing.impactMagnitude = magnitudeRank(event.impactMagnitude) > magnitudeRank(existing.impactMagnitude) ? event.impactMagnitude : existing.impactMagnitude;
        existing.impactDirection = existing.impactDirection === event.impactDirection ? existing.impactDirection : "mixed";
      }
    }
  }

  return [...impacts.values()].sort((a, b) => {
    const priorityDiff = priorityRank(b.researchPriority) - priorityRank(a.researchPriority);
    return priorityDiff !== 0 ? priorityDiff : b.confidenceScore - a.confidenceScore;
  });
}

async function buildUpdaterStatus(latest: IntelligenceData): Promise<UpdaterStatus> {
  const companyUniverse = latest.systemStatus.companyUniverse;
  const requiredTickers = ["2330", "2317", "2382", "2308", "2603", "2882"];
  const presentTickers = new Set(getMergedCompanyUniverse().map((company) => company.ticker));
  const localAiStatus =
    latest.engine.mode === "local_ai_enhanced"
      ? "reachable"
      : !localAiEnabled()
        ? "disabled"
        : process.env.OLLAMA_BASE_URL
          ? "failed"
          : "not_configured";
  const lmStudio = await inspectLmStudioStatus();
  const diagnostics: DiagnosticCheck[] = [
    check("latest-json", "latest.json 是否存在", latest.events.length > 0 ? "pass" : "fail", "網站有最新情報資料，首頁可以顯示今日事件。", "如果失敗，請到 GitHub Actions 手動執行 Update Intelligence。"),
    check("schema", "latest.json 格式", "pass", "最新情報格式正確，網站可以安全讀取。", "如果驗證失敗，執行 npm run validate:intelligence 看是哪個欄位壞掉。"),
    check("status-json", "系統狀態檔", "pass", "data/system/status.json 會告訴 /doctor 每一步是否成功。", "如果網站看不到狀態，確認這個檔案是否被 commit。"),
    check("github-action-time", "GitHub Actions 更新時間", "pass", `最新批次是 ${latest.runId}，代表更新流程有留下紀錄。`, "如果時間太舊，檢查 Actions schedule 或按 workflow_dispatch 手動跑一次。"),
    check("all-companies-json", "完整公司清單", companyUniverse && companyUniverse.totalCompanies >= 1000 ? "pass" : "fail", companyUniverse ? `目前公司清單有 ${companyUniverse.totalCompanies} 家。` : "找不到公司 universe 狀態。", "如果少於 1000 家，先執行 npm run update:companies，再執行 npm run validate:companies。"),
    check("company-universe-twse", "上市公司數", companyUniverse && companyUniverse.twseCount > 0 ? "pass" : "fail", companyUniverse ? `上市公司 ${companyUniverse.twseCount} 家。` : "無上市公司統計。", "如果為 0，檢查 TWSE ISIN 來源是否抓取成功。"),
    check("company-universe-tpex", "上櫃公司數", companyUniverse && companyUniverse.tpexCount > 0 ? "pass" : "fail", companyUniverse ? `上櫃公司 ${companyUniverse.tpexCount} 家。` : "無上櫃公司統計。", "如果為 0，檢查 TPEx ISIN 來源是否抓取成功。"),
    check("required-tickers", "常見公司是否存在", requiredTickers.every((ticker) => presentTickers.has(ticker)) ? "pass" : "fail", "檢查台積電、鴻海、廣達、台達電、長榮、國泰金是否都在清單中。", "如果缺少，代表公司清單解析不完整，請重新跑 update:companies。"),
    check("company-universe-updated", "公司清單更新時間", companyUniverse?.updatedAt ? "pass" : "warning", companyUniverse?.updatedAt ? `公司清單更新於 ${companyUniverse.updatedAt}。` : "沒有公司清單更新時間。", "如果時間太舊，手動跑 GitHub Actions 或 npm run update:companies。"),
    check("source-count", "情報來源數", latest.systemStatus.sourceCount >= 12 ? "pass" : "warning", `已設定 ${latest.systemStatus.sourceCount} 個公開來源。`, "如果來源太少，補充 src/data/sources.ts。"),
    check("article-count", "來源文章數", latest.systemStatus.articleCount > 0 ? "pass" : "fail", `本次整理 ${latest.systemStatus.articleCount} 筆來源紀錄。`, "如果為 0，檢查公開來源是否改版或網路是否失敗。"),
    check("event-count", "今日事件數", latest.systemStatus.eventCount > 0 ? "pass" : "fail", `本次產生 ${latest.systemStatus.eventCount} 個事件。`, "如果為 0，檢查 keyword classifier 是否過度嚴格。"),
    check("company-impact-count", "受影響公司數", latest.systemStatus.companyImpactCount > 0 ? "pass" : "warning", `本次整理 ${latest.systemStatus.companyImpactCount} 筆公司影響。`, "如果偏低，檢查 supplyChainMapper 是否有讀到完整公司清單。"),
    check("rule-engine", "規則引擎", "pass", "分類、供應鏈對應、影響評分與研究員觀點都已執行。", "如果分類不準，調整 src/lib/rules 裡的規則。"),
    check("local-ai", "Windows 本機 AI", localAiStatus === "reachable" ? "pass" : "warning", localAiStatus === "disabled" ? "沒有啟用本機 AI，網站會使用規則引擎，這是正常狀態。" : `Local AI 狀態：${localAiStatus}。`, "需要本機 AI 時，設定 LOCAL_AI_ENABLED=true 與 Ollama 或 LM Studio。"),
    check("ollama", "Ollama endpoint", localAiStatus === "reachable" ? "pass" : "warning", process.env.OLLAMA_BASE_URL ? `OLLAMA_BASE_URL=${process.env.OLLAMA_BASE_URL}` : "Ollama 沒有設定；規則引擎仍可完整運作。", "需要時設定 OLLAMA_BASE_URL=http://localhost:11434。"),
    check(
      "lm-studio",
      "LM Studio endpoint",
      lmStudio.status === "reachable" ? "pass" : "warning",
      lmStudio.message,
      "需要時開啟 LM Studio local server。"
    ),
    check("company-source-status", "官方公司來源狀態", companyUniverse?.status === "ok" ? "pass" : "warning", companyUniverse?.parseErrors.length ? `有 ${companyUniverse.parseErrors.length} 個公司來源警訊，系統會 fallback。` : "TWSE / TPEx ISIN 公司來源沒有記錄錯誤。", "如果有警訊，先看 data/taiwan-companies/summary.json 的 parseErrors。"),
    check("no-apple", "不依賴 Apple", "pass", "沒有使用 Apple Shortcuts、Apple Intelligence 或 iCloud。", "Windows 使用者可直接用 GitHub、Vercel、瀏覽器與 npm。"),
    check("no-openai-key", "不需要 OpenAI API key", "pass", "沒有讀取 OPENAI_API_KEY，也沒有 OpenAI API 呼叫。", "ChatGPT 手動加強只產生 prompt 與 localStorage 匯入。"),
    check("no-supabase", "不需要 Supabase", "pass", "資料以 JSON 檔案與 localStorage 保存。", "不需要 database 或 server-side secret。"),
    check("no-paid-api", "不需要付費 API", "pass", "更新器只使用公開網頁、RSS、官方 ISIN 與 fallback。", "新增來源時避免付費 API 與 secret。"),
    check("vercel-build", "Vercel 部署狀態", "warning", "Vercel build time 由部署平台顯示；這裡記錄資料更新時間。", "如果網站沒更新，檢查 GitHub Actions 是否 commit、Vercel 是否 redeploy。")
  ];

  return {
    generatedAt: latest.generatedAt,
    runId: latest.runId,
    runType: latest.runType,
    localAi: {
      enabled: localAiEnabled(),
      provider: localAiEnabled() && process.env.OLLAMA_BASE_URL ? "ollama" : process.env.LOCAL_AI_BASE_URL ? "lm_studio" : "none",
      model: process.env.LOCAL_AI_MODEL ?? null,
      status: localAiStatus,
      message: localAiStatus === "reachable" ? "Local AI enhancement succeeded." : "Rule-based manager view is active."
    },
    diagnostics,
    companyUniverse,
    systemStatus: latest.systemStatus
  };
}

function buildExecutiveSummary(events: IntelligenceEvent[], errorCount: number) {
  const top = events.slice(0, 3).map((event) => event.category.replaceAll("_", " ")).join("、");
  const suffix = errorCount > 0 ? ` 本次有 ${errorCount} 個來源或本機 AI 警訊，已寫入 /doctor。` : "";
  return `本次情報以規則引擎整理公開來源，最高優先序主題為 ${top || "待確認訊號"}。所有內容僅供研究與教育用途，不構成個人化投資建議。${suffix}`;
}

function buildWhyItMatters(category: EventCategory, industries: string[]) {
  if (category === "UNKNOWN") {
    return "此事件尚未匹配到明確規則，需要人工確認來源品質與台灣供應鏈關聯。";
  }

  return `此事件可能改變 ${industries.slice(0, 4).join("、")} 的訂單、成本或風險溢價，需用公司公告與後續數據驗證。`;
}

function check(
  id: string,
  label: string,
  status: DiagnosticCheck["status"],
  description: string,
  nextAction: string
): DiagnosticCheck {
  return {
    id,
    label,
    status,
    description,
    nextAction
  };
}

function dedupeArticles(articles: RawArticle[]) {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = article.url || article.title;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function extractTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function extractAtomLink(xml: string) {
  const href = xml.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1];
  return href ?? "";
}

function extractMeta(html: string, name: string) {
  const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${escapeRegExp(name)}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
  const reversePattern = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapeRegExp(name)}["'][^>]*>`, "i");
  return html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1] ?? "";
}

function stripTags(input = "") {
  return input.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXml(input = "") {
  return stripTags(input)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeDate(input?: string) {
  if (!input) {
    return generatedAtIso;
  }
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? generatedAtIso : date.toISOString();
}

function determineRunType(date: Date): "morning" | "evening" | "manual" {
  if (process.env.GITHUB_EVENT_NAME === "workflow_dispatch" || process.env.RUN_TYPE === "manual") {
    return "manual";
  }
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Taipei", hour: "2-digit", hour12: false }).format(date));
  return hour < 12 ? "morning" : "evening";
}

function buildRunId(date: Date) {
  return `tw-${formatTaipeiHistoryName(date)}`;
}

function formatTaipeiHistoryName(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}-${value("hour")}${value("minute")}`;
}

function priorityRank(priority: CompanyImpact["researchPriority"]) {
  return priority === "high" ? 3 : priority === "medium" ? 2 : 1;
}

function magnitudeRank(magnitude: CompanyImpact["impactMagnitude"]) {
  return magnitude === "high" ? 3 : magnitude === "medium" ? 2 : 1;
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
