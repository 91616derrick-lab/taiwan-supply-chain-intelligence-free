import type { IntelligenceEvent } from "@/src/lib/schemas/intelligenceSchema";
import { directionText, plainIndustries } from "@/src/lib/beginner/beginnerCopy";

export function BeginnerSupplyChainFlow({ event }: { event: IntelligenceEvent }) {
  const companies = event.likelyAffectedCompanies.slice(0, 7).map((company) => company.companyName).join("、");
  const steps = [
    { label: "全球事件", value: event.title },
    { label: "產業變化", value: plainIndustries(event.affectedIndustries).slice(0, 3).join("、") },
    { label: "供應鏈環節", value: event.supplyChainNodes.slice(0, 4).join("、") },
    { label: "台灣公司", value: companies || "待確認公司" },
    { label: "可能影響", value: `${directionText(event.impactDirection)}，但仍要觀察毛利率、訂單能見度與公司公告。` }
  ];

  return (
    <section className="border border-terminal-line bg-terminal-panel p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-muted">傳導路徑</div>
      <h3 className="mt-1 text-lg font-semibold text-terminal-text">事件如何傳導到台灣公司？</h3>
      <div className="mt-4 grid gap-2">
        {steps.map((step, index) => (
          <div key={step.label}>
            <div className="grid gap-3 border border-terminal-line bg-terminal-panel2 p-3 md:grid-cols-[120px_1fr]">
              <div className="font-mono text-[11px] uppercase text-terminal-blue">{step.label}</div>
              <div className="text-sm leading-6 text-terminal-text">{step.value}</div>
            </div>
            {index < steps.length - 1 ? <div className="mx-6 h-4 border-l border-terminal-blue/70" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
