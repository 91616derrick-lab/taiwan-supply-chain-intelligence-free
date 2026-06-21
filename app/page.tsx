import Link from "next/link";
import latestJson from "@/data/intelligence/latest.json";
import statusJson from "@/data/system/status.json";
import { ManualEnhancementPanel } from "@/components/ManualEnhancementPanel";
import {
  Badge,
  DirectionChip,
  MagnitudeBadge,
  Metric,
  OpenDoctorButton,
  Panel,
  PriorityBadge,
  ScoreBar
} from "@/components/ui";
import { intelligenceSchema, updaterStatusSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);
const status = updaterStatusSchema.parse(statusJson);

export default function HomePage() {
  const topEvents = [...latest.events]
    .sort((a, b) => b.taiwanRelevanceScore + b.marketRelevanceScore - (a.taiwanRelevanceScore + a.marketRelevanceScore))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="border border-terminal-line bg-terminal-panel">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge tone="green">No paid API</Badge>
              <Badge tone="blue">No OpenAI API</Badge>
              <Badge tone="blue">No Supabase</Badge>
              <Badge tone={latest.systemStatus.ok ? "green" : "red"}>{latest.systemStatus.ok ? "System OK" : "Needs attention"}</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-terminal-text md:text-3xl">Taiwan Supply Chain Intelligence</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-terminal-muted">{latest.executiveSummary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <OpenDoctorButton />
              <Link href="/methodology" className="border border-terminal-line px-2.5 py-1 font-mono text-[11px] uppercase text-terminal-muted hover:border-terminal-blue hover:text-terminal-blue">
                Methodology
              </Link>
            </div>
          </div>
          <div className="border-t border-terminal-line p-4 lg:border-l lg:border-t-0">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Last updated" value={new Date(latest.generatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} tone="blue" />
              <Metric label="Engine mode" value={latest.engine.mode === "local_ai_enhanced" ? "Local AI" : "Rule"} tone={latest.engine.mode === "local_ai_enhanced" ? "green" : "amber"} />
              <Metric label="Events" value={latest.events.length} />
              <Metric label="Companies" value={latest.companyImpacts.length} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Morning / Evening Brief" kicker={latest.runType}>
          <div className="space-y-3">
            {topEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-[10px] uppercase text-terminal-muted">{event.category}</div>
                  <div className="flex gap-2">
                    <DirectionChip direction={event.impactDirection} />
                    <PriorityBadge priority={event.researchPriority} />
                  </div>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-terminal-text">{event.title}</h3>
                <p className="mt-2 text-xs leading-5 text-terminal-muted">{event.whyItMatters}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <ScoreBar label="Taiwan relevance" value={event.taiwanRelevanceScore} />
                  <ScoreBar label="Confidence" value={event.confidenceScore} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {event.affectedIndustries.slice(0, 5).map((industry) => (
                    <Badge key={industry}>{industry}</Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Diagnostic Mini Panel" kicker="doctor preview" action={<OpenDoctorButton />}>
          <div className="space-y-2 text-sm">
            {status.diagnostics.slice(0, 8).map((check) => (
              <div key={check.id} className="flex items-start justify-between gap-3 border-b border-terminal-line/70 pb-2 last:border-0">
                <div>
                  <div className="font-medium text-terminal-text">{check.label}</div>
                  <div className="text-xs text-terminal-muted">{check.description}</div>
                </div>
                <Badge tone={check.status === "pass" ? "green" : check.status === "warning" ? "amber" : "red"}>{check.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Taiwan Supply Chain Matrix" kicker="event to company map">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="font-mono uppercase text-terminal-muted">
              <tr className="border-b border-terminal-line">
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">Industry</th>
                <th className="py-2 pr-3">Node</th>
                <th className="py-2 pr-3">Companies</th>
                <th className="py-2 pr-3">Direction</th>
                <th className="py-2 pr-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {latest.events.slice(0, 10).map((event) => (
                <tr key={event.id} className="border-b border-terminal-line/70 align-top">
                  <td className="max-w-xs py-2 pr-3 text-terminal-text">
                    <Link href={`/events/${event.id}`} className="hover:text-terminal-blue">{event.title}</Link>
                  </td>
                  <td className="py-2 pr-3 text-terminal-muted">{event.affectedIndustries.slice(0, 2).join(" / ")}</td>
                  <td className="py-2 pr-3 text-terminal-muted">{event.supplyChainNodes.slice(0, 2).join(" / ")}</td>
                  <td className="py-2 pr-3 text-terminal-muted">{event.likelyAffectedCompanies.slice(0, 4).map((company) => company.companyName).join("、")}</td>
                  <td className="py-2 pr-3"><DirectionChip direction={event.impactDirection} /></td>
                  <td className="py-2 pr-3"><PriorityBadge priority={event.researchPriority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Panel title="Portfolio Manager Desk" kicker="rule-based manager view">
          <div className="space-y-3">
            {latest.managerObservations.slice(0, 3).map((observation) => (
              <div key={observation.eventId} className="border border-terminal-line bg-terminal-panel2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/events/${observation.eventId}`} className="text-sm font-semibold text-terminal-text hover:text-terminal-blue">
                    {observation.eventTitle}
                  </Link>
                  <Badge tone={observation.engine === "local_ai_enhanced" ? "green" : "amber"}>
                    {observation.engine === "local_ai_enhanced" ? "local AI enhanced" : "rule engine"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-terminal-muted">{observation.enhancedManagerView ?? observation.managerView}</p>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <DeskMini title="Bull" text={observation.bullCase} />
                  <DeskMini title="Base" text={observation.baseCase} />
                  <DeskMini title="Bear" text={observation.bearCase} />
                </div>
              </div>
            ))}
            <ManualEnhancementPanel />
          </div>
        </Panel>

        <Panel title="Company Impact Table" kicker="priority sorted">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="font-mono uppercase text-terminal-muted">
                <tr className="border-b border-terminal-line">
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Industry</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Direction</th>
                  <th className="py-2 pr-3">Magnitude</th>
                  <th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {latest.companyImpacts.slice(0, 16).map((impact) => (
                  <tr key={impact.ticker} className="border-b border-terminal-line/70 align-top">
                    <td className="py-2 pr-3 text-terminal-text">
                      <Link href={`/companies/${impact.ticker}`} className="hover:text-terminal-blue">{impact.companyName} {impact.ticker}</Link>
                    </td>
                    <td className="py-2 pr-3 text-terminal-muted">{impact.industry}</td>
                    <td className="py-2 pr-3 text-terminal-muted">{impact.supplyChainRole}</td>
                    <td className="py-2 pr-3"><DirectionChip direction={impact.impactDirection} /></td>
                    <td className="py-2 pr-3"><MagnitudeBadge magnitude={impact.impactMagnitude} /></td>
                    <td className="py-2 pr-3"><PriorityBadge priority={impact.researchPriority} /></td>
                    <td className="w-32 py-2 pr-3"><ScoreBar value={impact.confidenceScore} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Evidence Panel" kicker="source quality">
        <div className="grid gap-4 lg:grid-cols-[0.3fr_0.7fr]">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Source records" value={latest.sources.length} tone="blue" />
            <Metric label="Errors" value={latest.systemStatus.errors.length} tone={latest.systemStatus.errors.length ? "amber" : "green"} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {latest.sources.slice(0, 8).map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="border border-terminal-line p-2 hover:border-terminal-blue">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-terminal-muted">{source.publisher}</span>
                  <Badge tone={source.quality === "fallback" ? "amber" : source.quality === "official" ? "green" : "neutral"}>{source.quality}</Badge>
                </div>
                <div className="mt-1 text-xs text-terminal-text">{source.title}</div>
              </a>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function DeskMini({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-terminal-line p-2">
      <div className="font-mono text-[10px] uppercase text-terminal-muted">{title}</div>
      <p className="mt-1 text-xs leading-5 text-terminal-muted">{text}</p>
    </div>
  );
}
