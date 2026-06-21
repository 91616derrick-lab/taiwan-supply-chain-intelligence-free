import Link from "next/link";
import { notFound } from "next/navigation";
import latestJson from "@/data/intelligence/latest.json";
import { taiwanCompanies } from "@/src/data/taiwanCompanies";
import { Badge, DirectionChip, MagnitudeBadge, Panel, PriorityBadge, ScoreBar } from "@/components/ui";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export function generateStaticParams() {
  return taiwanCompanies.map((company) => ({ ticker: company.ticker }));
}

export default function CompanyPage({ params }: { params: { ticker: string } }) {
  const company = taiwanCompanies.find((item) => item.ticker === params.ticker);
  if (!company) {
    notFound();
  }

  const impact = latest.companyImpacts.find((item) => item.ticker === company.ticker);
  const relatedEvents = latest.events.filter((event) => impact?.relatedEventIds.includes(event.id));

  return (
    <div className="space-y-4">
      <Panel title={`${company.companyName} ${company.ticker}`} kicker={`${company.exchange} / ${company.industry}`}>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="text-sm leading-6 text-terminal-muted">{company.supplyChainRole}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {company.sensitivityTags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <div className="mt-3 text-xs text-terminal-muted">Aliases: {company.aliases.join(" / ")}</div>
          </div>
          {impact ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <DirectionChip direction={impact.impactDirection} />
                <MagnitudeBadge magnitude={impact.impactMagnitude} />
                <PriorityBadge priority={impact.researchPriority} />
              </div>
              <ScoreBar label="Confidence" value={impact.confidenceScore} />
            </div>
          ) : (
            <div className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">No current impact record in latest.json.</div>
          )}
        </div>
      </Panel>

      <Panel title="Related Events" kicker="latest run">
        {relatedEvents.length > 0 ? (
          <div className="space-y-2">
            {relatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
                <div className="font-mono text-[10px] uppercase text-terminal-muted">{event.category}</div>
                <div className="mt-1 text-sm font-semibold text-terminal-text">{event.title}</div>
                <p className="mt-2 text-xs leading-5 text-terminal-muted">{event.whyItMatters}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-terminal-line p-4 text-sm text-terminal-muted">No related events in the current generated dataset.</div>
        )}
      </Panel>

      <Panel title="Research Notes" kicker="guardrails">
        <ul className="grid gap-2 text-sm text-terminal-muted md:grid-cols-2">
          <li className="border border-terminal-line bg-terminal-panel2 p-3">確認公司月營收、法說會與 MOPS 重大訊息。</li>
          <li className="border border-terminal-line bg-terminal-panel2 p-3">檢查同業是否出現一致的訂單、毛利或庫存訊號。</li>
          <li className="border border-terminal-line bg-terminal-panel2 p-3">避免把事件分類直接解讀為買賣建議。</li>
          <li className="border border-terminal-line bg-terminal-panel2 p-3">所有推論僅供研究用途，不構成投資建議。</li>
        </ul>
      </Panel>
    </div>
  );
}
