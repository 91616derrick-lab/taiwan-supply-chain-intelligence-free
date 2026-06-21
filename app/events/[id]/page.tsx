import Link from "next/link";
import { notFound } from "next/navigation";
import latestJson from "@/data/intelligence/latest.json";
import { BeginnerExplanationCard } from "@/components/BeginnerExplanationCard";
import { BeginnerSupplyChainFlow } from "@/components/BeginnerSupplyChainFlow";
import {
  Badge,
  DirectionChip,
  Panel,
  PriorityBadge,
  ScoreBar
} from "@/components/ui";
import {
  confidenceText,
  oneLineEvent,
  plainCategory
} from "@/src/lib/beginner/beginnerCopy";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export function generateStaticParams() {
  return latest.events.map((event) => ({ id: event.id }));
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = latest.events.find((item) => item.id === params.id);
  if (!event) {
    notFound();
  }

  const observation = latest.managerObservations.find((item) => item.eventId === event.id);
  const sources = latest.sources.filter((source) => event.sourceIds.includes(source.sourceId));

  return (
    <div className="space-y-4">
      <section className="border border-terminal-blue/60 bg-terminal-panel p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge tone="blue">{plainCategory(event.category)}</Badge>
          <DirectionChip direction={event.impactDirection} />
          <PriorityBadge priority={event.researchPriority} />
        </div>
        <h1 className="text-2xl font-semibold leading-8 text-terminal-text">{event.title}</h1>
        <p className="mt-3 text-base leading-7 text-terminal-text">{oneLineEvent(event)}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ScoreBar label="台灣相關" value={event.taiwanRelevanceScore} />
          <ScoreBar label="市場相關" value={event.marketRelevanceScore} />
          <ScoreBar label="信心" value={event.confidenceScore} />
        </div>
        <p className="mt-3 text-sm text-terminal-muted">信心程度：{confidenceText(event.confidenceScore)}</p>
      </section>

      <BeginnerExplanationCard event={event} />
      <BeginnerSupplyChainFlow event={event} />

      <Panel title="可能受影響公司" kicker="not recommendations">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {event.likelyAffectedCompanies.map((company) => (
            <Link key={company.ticker} href={`/companies/${company.ticker}`} className="border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-terminal-text">{company.companyName} {company.ticker}</div>
                  <div className="mt-1 text-xs text-terminal-muted">{company.industry}</div>
                </div>
                <Badge tone={company.evidenceLevel === "curated_match" ? "purple" : company.evidenceLevel === "keyword_match" ? "blue" : "neutral"}>
                  {company.evidenceLevel === "curated_match" ? "高信心" : company.evidenceLevel === "keyword_match" ? "關鍵字" : "產業推估"}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-terminal-muted">{company.supplyChainRole}</p>
            </Link>
          ))}
        </div>
      </Panel>

      {observation ? (
        <Panel title="投資研究觀點" kicker="plain language first">
          <div className="grid gap-3 md:grid-cols-2">
            <ViewBlock title="我的初步看法">{observation.managerView}</ViewBlock>
            <ViewBlock title="支持這個看法的理由">{observation.bullCase}</ViewBlock>
            <ViewBlock title="反方觀點：這個推論可能錯在哪？">{observation.bearCase}</ViewBlock>
            <ViewBlock title="不要急著下結論的原因">這是規則引擎推論，不是個人化投資建議。要等公司公告、月營收、毛利率與客戶支出確認。</ViewBlock>
          </div>
        </Panel>
      ) : null}

      <Panel title="下一步追蹤指標" kicker="what to watch">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {event.indicatorsToMonitor.map((item) => (
            <div key={item} className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">{item}</div>
          ))}
        </div>
      </Panel>

      <section id="advanced" className="border border-terminal-purple/60 bg-terminal-panel">
        <div className="border-b border-terminal-line px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-purple">advanced analysis</div>
          <h2 className="text-sm font-semibold text-terminal-text">進階資料表</h2>
        </div>
        <div className="grid gap-4 p-3 lg:grid-cols-2">
          <div className="space-y-2">
            <ViewBlock title="Base case">{observation?.baseCase ?? "無資料"}</ViewBlock>
            <ViewBlock title="Bull case">{observation?.bullCase ?? "無資料"}</ViewBlock>
            <ViewBlock title="Bear case">{observation?.bearCase ?? "無資料"}</ViewBlock>
          </div>
          <div className="space-y-2">
            <ListBlock title="Disconfirming evidence" items={observation?.disconfirmingEvidence ?? []} />
            <ListBlock title="Research actions" items={observation?.suggestedResearchActions ?? []} />
            <ListBlock title="Risk controls" items={observation?.riskControls ?? []} />
          </div>
        </div>
      </section>

      <Panel title="資料來源" kicker="evidence links">
        <div className="space-y-2">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[10px] uppercase text-terminal-muted">{source.publisher}</div>
                <Badge tone={source.quality === "fallback" ? "amber" : source.quality === "official" ? "green" : "neutral"}>{source.quality}</Badge>
              </div>
              <div className="mt-1 text-sm text-terminal-text">{source.title}</div>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ViewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-semibold text-terminal-text">{title}</div>
      <div className="mt-2 text-sm leading-6 text-terminal-muted">{children}</div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
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
