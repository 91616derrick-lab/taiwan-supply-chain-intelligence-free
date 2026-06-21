import Link from "next/link";
import latestJson from "@/data/intelligence/latest.json";
import { taiwanCompanies } from "@/src/data/taiwanCompanies";
import {
  DirectionChip,
  MagnitudeBadge,
  Metric,
  Panel,
  PriorityBadge,
  ScoreBar
} from "@/components/ui";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export default function CompaniesPage() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-4">
        <Metric label="Universe" value={taiwanCompanies.length} tone="blue" />
        <Metric label="Impacted" value={latest.companyImpacts.length} tone="green" />
        <Metric label="High priority" value={latest.companyImpacts.filter((item) => item.researchPriority === "high").length} tone="amber" />
        <Metric label="No DB required" value="JSON" />
      </div>
      <Panel title="Company Impact Table" kicker="research queue">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead className="font-mono uppercase text-terminal-muted">
              <tr className="border-b border-terminal-line">
                <th className="py-2 pr-3">Company</th>
                <th className="py-2 pr-3">Ticker</th>
                <th className="py-2 pr-3">Industry</th>
                <th className="py-2 pr-3">Supply chain role</th>
                <th className="py-2 pr-3">Direction</th>
                <th className="py-2 pr-3">Magnitude</th>
                <th className="py-2 pr-3">Priority</th>
                <th className="py-2 pr-3">Confidence</th>
                <th className="py-2 pr-3">Missing data</th>
              </tr>
            </thead>
            <tbody>
              {latest.companyImpacts.map((impact) => (
                <tr key={impact.ticker} className="border-b border-terminal-line/70 align-top">
                  <td className="py-2 pr-3 text-terminal-text">
                    <Link href={`/companies/${impact.ticker}`} className="hover:text-terminal-blue">{impact.companyName}</Link>
                  </td>
                  <td className="py-2 pr-3 font-mono text-terminal-muted">{impact.ticker}</td>
                  <td className="py-2 pr-3 text-terminal-muted">{impact.industry}</td>
                  <td className="py-2 pr-3 text-terminal-muted">{impact.supplyChainRole}</td>
                  <td className="py-2 pr-3"><DirectionChip direction={impact.impactDirection} /></td>
                  <td className="py-2 pr-3"><MagnitudeBadge magnitude={impact.impactMagnitude} /></td>
                  <td className="py-2 pr-3"><PriorityBadge priority={impact.researchPriority} /></td>
                  <td className="w-32 py-2 pr-3"><ScoreBar value={impact.confidenceScore} /></td>
                  <td className="max-w-xs py-2 pr-3 text-terminal-muted">{impact.missingData.join(" / ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
