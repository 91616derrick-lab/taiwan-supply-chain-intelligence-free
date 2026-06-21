import latestJson from "@/data/intelligence/latest.json";
import statusJson from "@/data/system/status.json";
import companySummaryJson from "@/data/taiwan-companies/summary.json";
import { Badge, Metric, Panel } from "@/components/ui";
import { intelligenceSchema, updaterStatusSchema } from "@/src/lib/schemas/intelligenceSchema";
import type { CompanyUniverseSummary } from "@/src/lib/companies/companyTypes";

const latest = intelligenceSchema.parse(latestJson);
const status = updaterStatusSchema.parse(statusJson);
const companySummary = companySummaryJson as CompanyUniverseSummary;

export default function DoctorPage() {
  return (
    <div className="space-y-4">
      <section className="border border-terminal-blue/60 bg-terminal-panel p-4">
        <h1 className="text-xl font-semibold text-terminal-text">Doctor 診斷中心</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-terminal-muted">
          這裡用白話告訴你：哪一步壞了、會影響網站哪個功能、下一步要怎麼修。不是只有工程狀態，也包含公司清單是否完整。
        </p>
      </section>

      <div className="grid gap-2 md:grid-cols-5">
        <Metric label="Latest run" value={new Date(status.generatedAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })} tone="blue" />
        <Metric label="Companies" value={companySummary.totalCompanies} tone={companySummary.totalCompanies >= 1000 ? "green" : "red"} />
        <Metric label="TWSE" value={companySummary.twseCount} />
        <Metric label="TPEx" value={companySummary.tpexCount} />
        <Metric label="Events" value={latest.events.length} />
      </div>

      <Panel title="逐項診斷" kicker="pass / warning / fail">
        <div className="grid gap-2">
          {status.diagnostics.map((check) => (
            <div key={check.id} className="grid gap-3 border border-terminal-line bg-terminal-panel2 p-3 lg:grid-cols-[180px_1fr_1fr_90px]">
              <div className="font-semibold text-terminal-text">{check.label}</div>
              <div className="text-sm leading-6 text-terminal-muted">
                <span className="text-terminal-text">發生什麼事：</span>
                {check.description}
              </div>
              <div className="text-sm leading-6 text-terminal-muted">
                <span className="text-terminal-text">怎麼修：</span>
                {check.nextAction}
              </div>
              <div className="lg:text-right">
                <Badge tone={check.status === "pass" ? "green" : check.status === "warning" ? "amber" : "red"}>{check.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="公司 universe 狀態" kicker="TWSE / TPEx ISIN">
          <dl className="grid gap-2 text-sm">
            <StatusLine label="all-companies.json exists" value="pass" />
            <StatusLine label="company universe count" value={String(companySummary.totalCompanies)} />
            <StatusLine label="TWSE count" value={String(companySummary.twseCount)} />
            <StatusLine label="TPEx count" value={String(companySummary.tpexCount)} />
            <StatusLine label="last updated" value={companySummary.updatedAt} />
            <StatusLine label="source URLs" value={companySummary.sourceUrls.join(" / ")} />
          </dl>
        </Panel>

        <Panel title="來源警訊" kicker="what may be incomplete">
          {latest.systemStatus.errors.length || companySummary.parseErrors.length ? (
            <div className="space-y-2">
              {companySummary.parseErrors.map((error) => (
                <Warning key={error} scope="company universe" message={error} />
              ))}
              {latest.systemStatus.errors.map((error, index) => (
                <Warning key={`${error.scope}-${index}`} scope={error.sourceId ?? error.scope} message={error.message} />
              ))}
            </div>
          ) : (
            <div className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">目前沒有記錄來源錯誤。</div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-terminal-line/70 pb-2 md:grid-cols-[190px_1fr]">
      <dt className="text-terminal-muted">{label}</dt>
      <dd className="break-all font-mono text-terminal-text">{value}</dd>
    </div>
  );
}

function Warning({ scope, message }: { scope: string; message: string }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-mono text-[10px] uppercase text-terminal-amber">{scope}</div>
      <p className="mt-2 text-sm leading-6 text-terminal-muted">{message}</p>
      <p className="mt-2 text-xs leading-5 text-terminal-muted">
        這可能讓某些來源較不完整，但系統會使用 fallback 或既有 JSON，避免首頁整個壞掉。
      </p>
    </div>
  );
}
