import Link from "next/link";
import { notFound } from "next/navigation";
import latestJson from "@/data/intelligence/latest.json";
import {
  Badge,
  DirectionChip,
  MagnitudeBadge,
  Panel,
  PriorityBadge,
  ScoreBar
} from "@/components/ui";
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
      <Panel title={event.title} kicker={event.category}>
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <DirectionChip direction={event.impactDirection} />
              <MagnitudeBadge magnitude={event.impactMagnitude} />
              <PriorityBadge priority={event.researchPriority} />
              <Badge tone="blue">{event.publisher}</Badge>
            </div>
            <p className="text-sm leading-6 text-terminal-muted">{event.summary}</p>
            <p className="mt-3 border-l border-terminal-blue pl-3 text-sm leading-6 text-terminal-text">{event.whyItMatters}</p>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Taiwan relevance" value={event.taiwanRelevanceScore} />
            <ScoreBar label="Market relevance" value={event.marketRelevanceScore} />
            <ScoreBar label="Confidence" value={event.confidenceScore} />
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Supply Chain Path" kicker="rule output">
          <div className="space-y-3">
            <div>
              <div className="font-mono text-[10px] uppercase text-terminal-muted">Affected industries</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {event.affectedIndustries.map((industry) => <Badge key={industry}>{industry}</Badge>)}
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase text-terminal-muted">Nodes</div>
              <div className="mt-2 grid gap-2">
                {event.supplyChainNodes.map((node, index) => (
                  <div key={node} className="border border-terminal-line bg-terminal-panel2 p-2 text-sm text-terminal-muted">
                    {index + 1}. {node}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Manager Desk" kicker={observation?.engine ?? "rule_based"}>
          {observation ? (
            <div className="space-y-3">
              <p className="text-sm leading-6 text-terminal-text">{observation.enhancedManagerView ?? observation.managerView}</p>
              <div className="grid gap-2 md:grid-cols-3">
                <Case title="Bull" text={observation.bullCase} />
                <Case title="Base" text={observation.baseCase} />
                <Case title="Bear" text={observation.bearCase} />
              </div>
              <Checklist title="Disconfirming evidence" items={observation.disconfirmingEvidence} />
              <Checklist title="Indicators to monitor" items={observation.indicatorsToMonitor} />
              <Checklist title="Research actions" items={observation.suggestedResearchActions} />
              <Checklist title="Risk controls" items={observation.riskControls} />
            </div>
          ) : (
            <p className="text-sm text-terminal-muted">No manager observation generated.</p>
          )}
        </Panel>
      </div>

      <Panel title="Likely Affected Companies" kicker="not recommendations">
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {event.likelyAffectedCompanies.map((company) => (
            <Link key={company.ticker} href={`/companies/${company.ticker}`} className="border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
              <div className="font-semibold text-terminal-text">{company.companyName} {company.ticker}</div>
              <div className="mt-1 text-xs text-terminal-muted">{company.industry}</div>
              <div className="mt-2 text-xs leading-5 text-terminal-muted">{company.supplyChainRole}</div>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel title="Evidence" kicker="source links">
        <div className="space-y-2">
          {sources.map((source) => (
            <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block border border-terminal-line p-3 hover:border-terminal-blue">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[10px] uppercase text-terminal-muted">{source.publisher}</div>
                <Badge tone={source.quality === "fallback" ? "amber" : "green"}>{source.quality}</Badge>
              </div>
              <div className="mt-1 text-sm text-terminal-text">{source.title}</div>
            </a>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Case({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-2">
      <div className="font-mono text-[10px] uppercase text-terminal-muted">{title}</div>
      <p className="mt-1 text-xs leading-5 text-terminal-muted">{text}</p>
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase text-terminal-muted">{title}</div>
      <ul className="mt-2 grid gap-1 text-xs text-terminal-muted">
        {items.map((item) => (
          <li key={item} className="border border-terminal-line bg-terminal-panel2 p-2">{item}</li>
        ))}
      </ul>
    </div>
  );
}
