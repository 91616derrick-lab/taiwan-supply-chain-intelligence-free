import { Panel } from "@/components/ui";

const categories = [
  "AI_SERVER_DEMAND",
  "NVIDIA_SUPPLY_CHAIN",
  "SEMI_EXPORT_CONTROL",
  "TSMC_CAPEX",
  "HBM_MEMORY",
  "DATA_CENTER_POWER",
  "SHIPPING_DISRUPTION",
  "ENERGY_PRICE",
  "FED_RATE",
  "FX_USD_TWD",
  "CHINA_STIMULUS",
  "TAIWAN_GEOPOLITICS",
  "EV_BATTERY",
  "COMPANY_EARNINGS",
  "TRADE_TARIFF",
  "UNKNOWN"
];

export default function MethodologyPage() {
  return (
    <div className="space-y-4">
      <Panel title="Rule Engine Methodology" kicker="transparent, not black box">
        <div className="space-y-4 text-sm leading-6 text-terminal-muted">
          <p>
            The system is rule-based. It does not pretend to be AI. The updater reads public RSS, JSON, or HTML metadata, extracts article fields, classifies each item with keyword rules, maps the category to Taiwan supply-chain nodes, scores relevance and confidence, then generates a manager view with explicit missing data and disconfirming evidence.
          </p>
          <p>
            Scores are research-priority heuristics only. They do not include real-time valuation, price, holdings, suitability, or personalized constraints. The app never outputs buy, sell, hold, target price, or guaranteed return language.
          </p>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Classifier" kicker="keywordClassifier">
          <p className="text-sm leading-6 text-terminal-muted">
            Titles, summaries, source category, and source keywords are scored against transparent keyword groups. Source category adds a small hint, but article text can override it.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {categories.map((category) => (
              <span key={category} className="border border-terminal-line px-2 py-0.5 font-mono text-[10px] text-terminal-muted">{category}</span>
            ))}
          </div>
        </Panel>

        <Panel title="Mapper" kicker="supplyChainMapper">
          <p className="text-sm leading-6 text-terminal-muted">
            Each category maps to affected industries, supply-chain nodes, and likely affected Taiwan companies. The mapper uses explicit ticker lists plus sensitivity tags from the 120+ company universe.
          </p>
        </Panel>

        <Panel title="Scorer" kicker="impactScorer">
          <p className="text-sm leading-6 text-terminal-muted">
            The scorer assigns direction, magnitude, Taiwan relevance, market relevance, confidence, and research priority. Source breadth and company breadth can raise confidence, but missing data is always preserved.
          </p>
        </Panel>
      </div>

      <Panel title="Manager View Guardrails" kicker="managerViewGenerator">
        <div className="grid gap-2 md:grid-cols-2">
          {[
            "Always labels output as rule-engine inference.",
            "Includes bull, bear, and base cases.",
            "Requires disconfirming evidence.",
            "Lists indicators to monitor.",
            "Suggests research actions instead of trades.",
            "Repeats that this is research, not investment advice."
          ].map((item) => (
            <div key={item} className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">{item}</div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
