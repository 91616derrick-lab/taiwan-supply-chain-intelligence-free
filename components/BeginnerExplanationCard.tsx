import type { IntelligenceEvent } from "@/src/lib/schemas/intelligenceSchema";
import {
  beginnerWhatHappened,
  beginnerWhyTaiwan,
  factsAndInferences,
  supplyChainImpact,
  whatToWatch
} from "@/src/lib/beginner/beginnerCopy";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

export function BeginnerExplanationCard({ event }: { event: IntelligenceEvent }) {
  const split = factsAndInferences(event);

  return (
    <section className="border border-terminal-blue/50 bg-terminal-panel p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-blue">小白解釋</div>
      <h3 className="mt-1 text-lg font-semibold text-terminal-text">這件事到底在說什麼？</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ExplainBlock title="這件事是什麼？">{beginnerWhatHappened(event)}</ExplainBlock>
        <ExplainBlock title="它怎麼影響供應鏈？">
          {supplyChainImpact(event)} 這裡的 <GlossaryTooltip term="supply chain">供應鏈</GlossaryTooltip> 是指從零組件到組裝出貨的一整串公司。
        </ExplainBlock>
        <ExplainBlock title="為什麼台灣公司會被影響？">{beginnerWhyTaiwan(event)}</ExplainBlock>
        <ExplainBlock title="我接下來應該觀察什麼？">
          <ul className="space-y-1">
            {whatToWatch(event).slice(0, 5).map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </ExplainBlock>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ExplainBlock title="哪些部分是事實？">
          <ul className="space-y-1">
            {split.facts.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </ExplainBlock>
        <ExplainBlock title="哪些部分只是推論？">
          <ul className="space-y-1">
            {split.inferences.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </ExplainBlock>
      </div>
    </section>
  );
}

function ExplainBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-terminal-line bg-terminal-panel2 p-3">
      <div className="font-semibold text-terminal-text">{title}</div>
      <div className="mt-2 text-sm leading-6 text-terminal-muted">{children}</div>
    </div>
  );
}
