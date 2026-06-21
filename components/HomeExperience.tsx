"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BeginnerExplanationCard } from "@/components/BeginnerExplanationCard";
import { BeginnerSupplyChainFlow } from "@/components/BeginnerSupplyChainFlow";
import {
  Badge,
  DirectionChip,
  Metric,
  OpenDoctorButton,
  Panel,
  PriorityBadge,
  ScoreBar
} from "@/components/ui";
import type {
  CompanyImpact,
  IntelligenceData,
  ManagerObservation,
  UpdaterStatus
} from "@/src/lib/schemas/intelligenceSchema";
import type { CompanyUniverseSummary } from "@/src/lib/companies/companyTypes";
import {
  beginnerWhyTaiwan,
  companyBusinessDescription,
  companyPressureReason,
  companyWatchItems,
  confidenceText,
  directionText,
  managerBeginnerView,
  oneLineEvent,
  plainCategory,
  plainIndustries,
  priorityText,
  whyCompanyRelated
} from "@/src/lib/beginner/beginnerCopy";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

export function HomeExperience({
  latest,
  status,
  companySummary
}: {
  latest: IntelligenceData;
  status: UpdaterStatus;
  companySummary: CompanyUniverseSummary;
}) {
  const [mode, setMode] = useState<"beginner" | "advanced">("beginner");
  const topEvents = useMemo(
    () =>
      [...latest.events]
        .sort((a, b) => b.taiwanRelevanceScore + b.marketRelevanceScore - (a.taiwanRelevanceScore + a.marketRelevanceScore))
        .slice(0, 3),
    [latest.events]
  );
  const topEvent = topEvents[0];
  const topCompanies = latest.companyImpacts.slice(0, 6);
  const highPriority = latest.events.filter((event) => event.researchPriority === "high").length;
  const firstObservation = topEvent
    ? latest.managerObservations.find((observation) => observation.eventId === topEvent.id)
    : latest.managerObservations[0];

  return (
    <div className="space-y-4">
      <section className="border border-terminal-line bg-terminal-panel">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="green">免費公開資料</Badge>
              <Badge tone="blue">No OpenAI API</Badge>
              <Badge tone="blue">No Supabase</Badge>
              <Badge tone={companySummary.status === "ok" ? "green" : "amber"}>公司清單 {companySummary.status ?? "ok"}</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-terminal-text">投資小白的台灣供應鏈早報</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-terminal-muted">
              先看白話結論，再逐層展開進階資料。這不是買賣建議，而是幫你理解全球事件可能怎麼影響台灣公司。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ModeButton active={mode === "beginner"} onClick={() => setMode("beginner")}>Beginner</ModeButton>
            <ModeButton active={mode === "advanced"} onClick={() => setMode("advanced")}>Advanced</ModeButton>
            <OpenDoctorButton />
          </div>
        </div>
        <div className="grid gap-2 border-t border-terminal-line p-3 md:grid-cols-5">
          <Metric label="Last updated" value={new Date(latest.generatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} tone="blue" />
          <Metric label="Universe" value={companySummary.totalCompanies} />
          <Metric label="TWSE" value={companySummary.twseCount} />
          <Metric label="TPEx" value={companySummary.tpexCount} />
          <Metric label="Data freshness" value={latest.systemStatus.ok ? "OK" : "Check"} tone={latest.systemStatus.ok ? "green" : "amber"} />
        </div>
      </section>

      <section className="border border-terminal-blue/60 bg-terminal-panel p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-blue">今日一句話總結</div>
        <h2 className="mt-1 text-xl font-semibold text-terminal-text">今天市場最重要的是什麼？</h2>
        <p className="mt-3 max-w-4xl text-base leading-7 text-terminal-text">
          {topEvent
            ? `今天的重點是 ${plainCategory(topEvent.category)}。白話說，這可能影響 ${plainIndustries(topEvent.affectedIndustries).slice(0, 4).join("、")}，也可能牽動 ${topEvent.likelyAffectedCompanies.slice(0, 5).map((company) => company.companyName).join("、")} 等台灣公司。不過目前仍要觀察後續公司營收、毛利率與客戶支出是否真的跟上。`
            : "今天尚未產生可讀事件，請到 Doctor 檢查資料更新流程。"}
        </p>
        <p className="mt-3 text-sm leading-6 text-terminal-muted">
          看不懂術語可以點：<GlossaryTooltip term="AI server">AI server</GlossaryTooltip>、{" "}
          <GlossaryTooltip term="hyperscaler">hyperscaler</GlossaryTooltip>、{" "}
          <GlossaryTooltip term="capex">capex</GlossaryTooltip>、{" "}
          <GlossaryTooltip term="supply chain">supply chain</GlossaryTooltip>。
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <Metric label="今日重要事件數" value={latest.events.length} tone="blue" />
          <Metric label="可能影響公司數" value={latest.companyImpacts.length} tone="green" />
          <Metric label="高研究優先級" value={highPriority} tone="amber" />
          <Metric label="資料來源紀錄" value={latest.sources.length} />
        </div>
      </section>

      <Panel title="今天你只需要先看這 3 件事" kicker="Beginner brief">
        <div className="grid gap-3 lg:grid-cols-3">
          {topEvents.map((event) => (
            <article key={event.id} className="flex flex-col border border-terminal-line bg-terminal-panel2 p-4">
              <div className="flex items-start justify-between gap-2">
                <Badge tone="blue">{plainCategory(event.category)}</Badge>
                <DirectionChip direction={event.impactDirection} />
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-terminal-text">{event.title}</h3>
              <p className="mt-3 text-sm leading-6 text-terminal-text">{oneLineEvent(event)}</p>
              <p className="mt-3 text-sm leading-6 text-terminal-muted">{beginnerWhyTaiwan(event)}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {plainIndustries(event.affectedIndustries).slice(0, 4).map((industry) => (
                  <Badge key={industry}>{industry}</Badge>
                ))}
              </div>
              <div className="mt-3 text-xs leading-5 text-terminal-muted">
                可能受影響公司：{event.likelyAffectedCompanies.slice(0, 5).map((company) => company.companyName).join("、")}
              </div>
              <div className="mt-3 border border-terminal-line p-2 text-xs leading-5 text-terminal-muted">
                信心程度：{confidenceText(event.confidenceScore)}
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/events/${event.id}`} className="border border-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg">
                  看白話解釋
                </Link>
                <Link href={`/events/${event.id}#advanced`} className="border border-terminal-purple px-3 py-1.5 font-mono text-xs uppercase text-terminal-purple hover:bg-terminal-purple hover:text-terminal-bg">
                  看進階分析
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      {mode === "beginner" && topEvent ? (
        <>
          <BeginnerExplanationCard event={topEvent} />
          <BeginnerSupplyChainFlow event={topEvent} />
        </>
      ) : null}

      <Panel title="哪些台灣公司可能被影響？" kicker="company cards first">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topCompanies.map((company) => (
            <CompanyBeginnerCard key={company.ticker} company={company} />
          ))}
        </div>
        <div className="mt-4">
          <Link href="/companies" className="border border-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg">
            查看全部上市上櫃公司
          </Link>
        </div>
      </Panel>

      {firstObservation ? <ResearcherDesk observation={firstObservation} mode={mode} /> : null}

      <details open={mode === "advanced"} className="border border-terminal-purple/60 bg-terminal-panel">
        <summary className="cursor-pointer border-b border-terminal-line px-3 py-2 font-semibold text-terminal-text">
          進階資料：展開完整矩陣與表格
        </summary>
        <div className="space-y-4 p-3">
          <AdvancedMatrix latest={latest} />
          <AdvancedCompanyTable impacts={latest.companyImpacts.slice(0, mode === "advanced" ? 30 : 10)} />
        </div>
      </details>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="資料來源與可信度" kicker="evidence quality">
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="sources" value={latest.sources.length} tone="blue" />
            <Metric label="official / primary" value={latest.sources.filter((source) => source.quality === "official" || source.quality === "primary").length} tone="green" />
            <Metric label="warnings" value={latest.systemStatus.errors.length} tone={latest.systemStatus.errors.length ? "amber" : "green"} />
          </div>
          <div className="mt-3 grid gap-2">
            {latest.sources.slice(0, 5).map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="border border-terminal-line p-2 text-sm hover:border-terminal-blue">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-terminal-text">{source.title}</span>
                  <Badge tone={source.quality === "fallback" ? "amber" : source.quality === "official" ? "green" : "neutral"}>{source.quality}</Badge>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase text-terminal-muted">{source.publisher}</div>
              </a>
            ))}
          </div>
        </Panel>

        <Panel title="Company Universe" kicker="TWSE / TPEx official ISIN">
          <div className="grid gap-2 md:grid-cols-3">
            <Metric label="total" value={companySummary.totalCompanies} tone="blue" />
            <Metric label="TWSE" value={companySummary.twseCount} />
            <Metric label="TPEx" value={companySummary.tpexCount} />
          </div>
          <div className="mt-3 text-sm leading-6 text-terminal-muted">
            公司清單從 TWSE / TPEx ISIN 官方公開頁面更新，不再只靠人工列舉。更新時間：{new Date(companySummary.updatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {Object.entries(companySummary.industryCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([industry, count]) => (
                <Badge key={industry}>{industry} {count}</Badge>
              ))}
          </div>
        </Panel>
      </div>

      <Panel title="Doctor 診斷狀態" kicker="plain language checks" action={<OpenDoctorButton />}>
        <div className="grid gap-2 md:grid-cols-2">
          {status.diagnostics.slice(0, 6).map((check) => (
            <div key={check.id} className="border border-terminal-line bg-terminal-panel2 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-terminal-text">{check.label}</div>
                <Badge tone={check.status === "pass" ? "green" : check.status === "warning" ? "amber" : "red"}>{check.status}</Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-terminal-muted">{check.description}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "border border-terminal-blue bg-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-bg" : "border border-terminal-line px-3 py-1.5 font-mono text-xs uppercase text-terminal-muted hover:border-terminal-blue hover:text-terminal-blue"}
    >
      {children}
    </button>
  );
}

function CompanyBeginnerCard({ company }: { company: CompanyImpact }) {
  return (
    <article className="border border-terminal-line bg-terminal-panel2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-terminal-text">{company.companyName} {company.ticker}</h3>
          <div className="mt-1 font-mono text-[10px] uppercase text-terminal-muted">{company.industry}</div>
        </div>
        <Badge tone={company.impactDirection === "positive" ? "green" : company.impactDirection === "negative" ? "red" : company.impactDirection === "mixed" ? "amber" : "neutral"}>
          {directionText(company.impactDirection)}
        </Badge>
      </div>
      <div className="mt-3 space-y-3 text-sm leading-6 text-terminal-muted">
        <p><span className="text-terminal-text">它是做什麼的：</span>{companyBusinessDescription(company)}</p>
        <p><span className="text-terminal-text">為什麼相關：</span>{whyCompanyRelated(company)}</p>
        <p><span className="text-terminal-text">需要觀察：</span>{companyWatchItems(company).join("、")}</p>
        <p><span className="text-terminal-text">提醒：</span>{companyPressureReason(company)}</p>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <ScoreBar label="信心" value={company.confidenceScore} />
        <div className="flex items-end justify-start">
          <PriorityBadge priority={company.researchPriority} />
        </div>
      </div>
    </article>
  );
}

function ResearcherDesk({ observation, mode }: { observation: ManagerObservation; mode: "beginner" | "advanced" }) {
  const beginner = managerBeginnerView(observation);
  return (
    <Panel title="如果我是研究員，我會怎麼看？" kicker="researcher desk">
      <div className="grid gap-3 lg:grid-cols-5">
        <DeskBlock title="我的初步看法" text={beginner.initialView} />
        <DeskBlock title="支持理由" text={beginner.support} />
        <DeskBlock title="可能錯在哪" text={beginner.wrongIf} />
        <DeskList title="接下來看什麼數字" items={beginner.nextNumbers.slice(0, 4)} />
        <DeskBlock title="不要急著下結論" text={beginner.whyWait} />
      </div>
      <details open={mode === "advanced"} className="mt-4 border border-terminal-purple/50">
        <summary className="cursor-pointer px-3 py-2 font-mono text-xs uppercase text-terminal-purple">進階版：Base / Bull / Bear / Risk Controls</summary>
        <div className="grid gap-3 border-t border-terminal-line p-3 md:grid-cols-3">
          <DeskBlock title="Base case" text={observation.baseCase} />
          <DeskBlock title="Bull case" text={observation.bullCase} />
          <DeskBlock title="Bear case" text={observation.bearCase} />
          <DeskList title="Disconfirming evidence" items={observation.disconfirmingEvidence} />
          <DeskList title="Research actions" items={observation.suggestedResearchActions} />
          <DeskList title="Risk controls" items={observation.riskControls} />
        </div>
      </details>
    </Panel>
  );
}

function DeskBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-semibold text-terminal-text">{title}</div>
      <p className="mt-2 text-sm leading-6 text-terminal-muted">{text}</p>
    </div>
  );
}

function DeskList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-semibold text-terminal-text">{title}</div>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-terminal-muted">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function AdvancedMatrix({ latest }: { latest: IntelligenceData }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-terminal-panel font-mono uppercase text-terminal-muted">
          <tr className="border-b border-terminal-line">
            <th className="py-2 pr-3">Event</th>
            <th className="py-2 pr-3">Category</th>
            <th className="py-2 pr-3">Supply Chain Node</th>
            <th className="py-2 pr-3">Taiwan Companies</th>
            <th className="py-2 pr-3">Direction</th>
            <th className="py-2 pr-3">Priority</th>
            <th className="py-2 pr-3">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {latest.events.slice(0, 12).map((event) => (
            <tr key={event.id} className="border-b border-terminal-line/70 align-top">
              <td className="max-w-xs py-2 pr-3 text-terminal-text"><Link href={`/events/${event.id}`} className="hover:text-terminal-blue">{event.title}</Link></td>
              <td className="py-2 pr-3 text-terminal-muted">{plainCategory(event.category)}</td>
              <td className="py-2 pr-3 text-terminal-muted">{event.supplyChainNodes.slice(0, 2).join(" / ")}</td>
              <td className="py-2 pr-3 text-terminal-muted">{event.likelyAffectedCompanies.slice(0, 5).map((company) => company.companyName).join("、")}</td>
              <td className="py-2 pr-3"><DirectionChip direction={event.impactDirection} /></td>
              <td className="py-2 pr-3"><PriorityBadge priority={event.researchPriority} /></td>
              <td className="w-32 py-2 pr-3"><ScoreBar value={event.confidenceScore} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdvancedCompanyTable({ impacts }: { impacts: CompanyImpact[] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="sticky top-0 bg-terminal-panel font-mono uppercase text-terminal-muted">
          <tr className="border-b border-terminal-line">
            <th className="py-2 pr-3">公司</th>
            <th className="py-2 pr-3">做什麼</th>
            <th className="py-2 pr-3">可能影響</th>
            <th className="py-2 pr-3">研究優先級</th>
            <th className="py-2 pr-3">信心</th>
          </tr>
        </thead>
        <tbody>
          {impacts.map((company) => (
            <tr key={company.ticker} className="border-b border-terminal-line/70 align-top">
              <td className="py-2 pr-3 text-terminal-text"><Link href={`/companies/${company.ticker}`} className="hover:text-terminal-blue">{company.companyName} {company.ticker}</Link></td>
              <td className="max-w-sm py-2 pr-3 text-terminal-muted">{company.supplyChainRole}</td>
              <td className="py-2 pr-3"><DirectionChip direction={company.impactDirection} /></td>
              <td className="py-2 pr-3"><PriorityBadge priority={company.researchPriority} /></td>
              <td className="w-32 py-2 pr-3"><ScoreBar value={company.confidenceScore} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-terminal-muted">
        進階欄位與完整清單請到 <Link href="/companies" className="text-terminal-blue">Companies</Link> 查看。
      </p>
    </div>
  );
}
