import Link from "next/link";
import latestJson from "@/data/intelligence/latest.json";
import { DirectionChip, Panel, PriorityBadge, ScoreBar } from "@/components/ui";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Event Tape" kicker="classified public signals">
        <div className="space-y-2">
          {latest.events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="grid gap-3 border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue lg:grid-cols-[1fr_220px]">
              <div>
                <div className="font-mono text-[10px] uppercase text-terminal-muted">{event.category} / {event.publisher}</div>
                <h2 className="mt-1 text-sm font-semibold text-terminal-text">{event.title}</h2>
                <p className="mt-2 text-xs leading-5 text-terminal-muted">{event.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {event.supplyChainNodes.slice(0, 4).map((node) => (
                    <span key={node} className="border border-terminal-line px-2 py-0.5 font-mono text-[10px] text-terminal-muted">{node}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <DirectionChip direction={event.impactDirection} />
                  <PriorityBadge priority={event.researchPriority} />
                </div>
                <ScoreBar label="Taiwan" value={event.taiwanRelevanceScore} />
                <ScoreBar label="Confidence" value={event.confidenceScore} />
              </div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
