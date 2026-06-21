import latestJson from "@/data/intelligence/latest.json";
import statusJson from "@/data/system/status.json";
import { taiwanCompanies } from "@/src/data/taiwanCompanies";
import { Badge, Metric, Panel } from "@/components/ui";
import { intelligenceSchema, updaterStatusSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);
const status = updaterStatusSchema.parse(statusJson);

export default function DoctorPage() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-4">
        <Metric label="Latest run" value={new Date(status.generatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} tone="blue" />
        <Metric label="Sources" value={status.systemStatus.sourceCount} />
        <Metric label="Events" value={status.systemStatus.eventCount} tone="green" />
        <Metric label="Universe" value={taiwanCompanies.length} />
      </div>

      <Panel title="Doctor Diagnostic Center" kicker="pass / warning / fail">
        <div className="grid gap-2">
          {status.diagnostics.map((check) => (
            <div key={check.id} className="grid gap-3 border border-terminal-line bg-terminal-panel2 p-3 md:grid-cols-[160px_1fr_1fr_90px]">
              <div className="font-semibold text-terminal-text">{check.label}</div>
              <div className="text-sm leading-6 text-terminal-muted">{check.description}</div>
              <div className="text-sm leading-6 text-terminal-muted">{check.nextAction}</div>
              <div className="md:text-right">
                <Badge tone={check.status === "pass" ? "green" : check.status === "warning" ? "amber" : "red"}>{check.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="System Status" kicker={latest.runId}>
          <dl className="grid gap-2 text-sm">
            <StatusLine label="latest.json exists" value="pass" />
            <StatusLine label="latest.json schema valid" value="pass" />
            <StatusLine label="data/system/status.json exists" value="pass" />
            <StatusLine label="source count" value={String(latest.systemStatus.sourceCount)} />
            <StatusLine label="article count" value={String(latest.systemStatus.articleCount)} />
            <StatusLine label="event count" value={String(latest.systemStatus.eventCount)} />
            <StatusLine label="company impact count" value={String(latest.systemStatus.companyImpactCount)} />
            <StatusLine label="local AI" value={status.localAi.status} />
          </dl>
        </Panel>

        <Panel title="Errors And Warnings" kicker="source status">
          {latest.systemStatus.errors.length > 0 ? (
            <div className="space-y-2">
              {latest.systemStatus.errors.map((error, index) => (
                <div key={`${error.scope}-${index}`} className="border border-terminal-line bg-terminal-panel2 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase text-terminal-muted">{error.scope}</span>
                    <Badge tone="amber">{error.sourceId ?? "system"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-terminal-muted">{error.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">No source errors recorded in this run.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-terminal-line/70 pb-2">
      <dt className="text-terminal-muted">{label}</dt>
      <dd className="font-mono text-terminal-text">{value}</dd>
    </div>
  );
}
