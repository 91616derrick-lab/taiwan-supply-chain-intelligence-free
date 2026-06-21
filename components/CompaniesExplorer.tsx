"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TaiwanListedCompany } from "@/src/lib/companies/companyTypes";
import type { CompanyImpact } from "@/src/lib/schemas/intelligenceSchema";
import {
  companyPressureReason,
  companyWatchItems,
  directionText,
  whyCompanyRelated
} from "@/src/lib/beginner/beginnerCopy";
import { Badge, DirectionChip, PriorityBadge, ScoreBar } from "@/components/ui";

const pageSize = 50;

export function CompaniesExplorer({
  companies,
  impacts
}: {
  companies: TaiwanListedCompany[];
  impacts: CompanyImpact[];
}) {
  const [query, setQuery] = useState("");
  const [exchange, setExchange] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [curatedOnly, setCuratedOnly] = useState(false);
  const [impactedOnly, setImpactedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const impactByTicker = useMemo(() => new Map(impacts.map((impact) => [impact.ticker, impact])), [impacts]);
  const industries = useMemo(
    () => [...new Set(companies.map((company) => company.industry).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant")),
    [companies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((company) => {
      const impact = impactByTicker.get(company.ticker);
      const searchable = [company.ticker, company.companyName, company.industry, company.supplyChainRole, ...company.aliases, ...company.keywords]
        .join(" ")
        .toLowerCase();
      return (
        (!q || searchable.includes(q)) &&
        (exchange === "all" || company.exchange === exchange) &&
        (industry === "all" || company.industry === industry) &&
        (!curatedOnly || company.isCurated) &&
        (!impactedOnly || Boolean(impact))
      );
    });
  }, [companies, curatedOnly, exchange, impactByTicker, impactedOnly, industry, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function resetPage(action: () => void) {
    action();
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <section className="border border-terminal-line bg-terminal-panel p-4">
        <h1 className="text-xl font-semibold text-terminal-text">台灣上市上櫃公司總表</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-terminal-muted">
          這裡不是推薦買賣，而是整理哪些公司可能受到事件影響。你可以用公司代號、名稱、產業或供應鏈角色搜尋，也可以只看已被最新事件影響的公司。
        </p>
      </section>

      <section className="border border-terminal-line bg-terminal-panel p-3">
        <div className="grid gap-3 lg:grid-cols-[1fr_170px_220px_120px_120px]">
          <input
            value={query}
            onChange={(event) => resetPage(() => setQuery(event.target.value))}
            className="border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text outline-none focus:border-terminal-blue"
            placeholder="搜尋 ticker / 公司名稱 / 產業 / 供應鏈角色"
          />
          <select value={exchange} onChange={(event) => resetPage(() => setExchange(event.target.value))} className="border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text">
            <option value="all">全部市場</option>
            <option value="TWSE">TWSE 上市</option>
            <option value="TPEx">TPEx 上櫃</option>
          </select>
          <select value={industry} onChange={(event) => resetPage(() => setIndustry(event.target.value))} className="border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text">
            <option value="all">全部產業</option>
            {industries.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 border border-terminal-line px-2 text-sm text-terminal-muted">
            <input type="checkbox" checked={curatedOnly} onChange={(event) => resetPage(() => setCuratedOnly(event.target.checked))} />
            curated
          </label>
          <label className="flex items-center gap-2 border border-terminal-line px-2 text-sm text-terminal-muted">
            <input type="checkbox" checked={impactedOnly} onChange={(event) => resetPage(() => setImpactedOnly(event.target.checked))} />
            impacted
          </label>
        </div>
      </section>

      <section className="border border-terminal-line bg-terminal-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-line px-3 py-2">
          <div className="text-sm text-terminal-muted">顯示 {rows.length} / {filtered.length} 家，每頁 {pageSize} 筆</div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="border border-terminal-line px-2 py-1 text-xs text-terminal-muted disabled:opacity-40">上一頁</button>
            <span className="font-mono text-xs text-terminal-muted">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="border border-terminal-line px-2 py-1 text-xs text-terminal-muted disabled:opacity-40">下一頁</button>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-terminal-panel font-mono uppercase text-terminal-muted">
              <tr className="border-b border-terminal-line">
                <th className="py-2 pl-3 pr-3">ticker</th>
                <th className="py-2 pr-3">company</th>
                <th className="py-2 pr-3">market</th>
                <th className="py-2 pr-3">industry</th>
                <th className="py-2 pr-3">白話業務描述</th>
                <th className="py-2 pr-3">curated</th>
                <th className="py-2 pr-3">latest impact</th>
                <th className="py-2 pr-3">priority</th>
                <th className="py-2 pr-3">confidence</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((company) => {
                const impact = impactByTicker.get(company.ticker);
                return (
                  <tr key={company.ticker} className="border-b border-terminal-line/70 align-top">
                    <td className="py-3 pl-3 pr-3 font-mono text-terminal-text">
                      <Link href={`/companies/${company.ticker}`} className="hover:text-terminal-blue">{company.ticker}</Link>
                    </td>
                    <td className="py-3 pr-3 text-terminal-text">{company.companyName}</td>
                    <td className="py-3 pr-3 text-terminal-muted">{company.market}</td>
                    <td className="py-3 pr-3 text-terminal-muted">{company.industry}</td>
                    <td className="max-w-md py-3 pr-3 text-terminal-muted">
                      <div>{company.supplyChainRole}</div>
                      {impact ? (
                        <div className="mt-2 border-l border-terminal-blue pl-2 text-terminal-muted">
                          {whyCompanyRelated(impact)} 需要追蹤：{companyWatchItems(impact).slice(0, 3).join("、")}。
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3">{company.isCurated ? <Badge tone="purple">重點標籤</Badge> : <Badge>一般公司</Badge>}</td>
                    <td className="py-3 pr-3">{impact ? <DirectionChip direction={impact.impactDirection} /> : <Badge>先觀察</Badge>}</td>
                    <td className="py-3 pr-3">{impact ? <PriorityBadge priority={impact.researchPriority} /> : <span className="text-terminal-muted">-</span>}</td>
                    <td className="w-32 py-3 pr-3">{impact ? <ScoreBar value={impact.confidenceScore} /> : <span className="text-terminal-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function CompanyDetailReadable({
  company,
  impact,
  relatedEventTitles
}: {
  company: TaiwanListedCompany;
  impact?: CompanyImpact;
  relatedEventTitles: string[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <InfoBlock title="白話業務描述">{company.supplyChainRole}</InfoBlock>
      <InfoBlock title="供應鏈角色">{company.isCurated ? "這家公司有 curated 重點供應鏈標籤，系統會給較高關聯信心。" : "這家公司保留在完整上市上櫃 universe 中，若產業或關鍵字相關就會被納入觀察。"}</InfoBlock>
      <InfoBlock title="相關事件">{relatedEventTitles.length ? relatedEventTitles.join(" / ") : "目前最新情報尚未把這家公司列為主要受影響公司。"}</InfoBlock>
      <InfoBlock title="可能受惠原因">{impact ? companyPressureReason({ ...impact, impactDirection: impact.impactDirection === "negative" ? "uncertain" : impact.impactDirection }) : "需要等待與公司業務直接相關的事件。"}</InfoBlock>
      <InfoBlock title="可能承壓原因">{impact ? companyPressureReason({ ...impact, impactDirection: impact.impactDirection === "positive" ? "mixed" : impact.impactDirection }) : "若產業需求轉弱、成本上升或政策不利，仍可能承壓。"}</InfoBlock>
      <InfoBlock title="需要追蹤指標">{impact ? companyWatchItems(impact).join("、") : "月營收、毛利率、法說會展望、產業需求。"}</InfoBlock>
      {impact ? <InfoBlock title="最新影響方向">{directionText(impact.impactDirection)}，研究優先級 {impact.researchPriority}，信心分數 {impact.confidenceScore}。</InfoBlock> : null}
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-semibold text-terminal-text">{title}</div>
      <div className="mt-2 text-sm leading-6 text-terminal-muted">{children}</div>
    </div>
  );
}
