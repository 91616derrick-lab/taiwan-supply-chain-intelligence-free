"use client";

import { useEffect, useMemo, useState } from "react";
import type { EnhancedAnalysis } from "@/src/lib/import/parseEnhancedAnalysis";

const storageKey = "tsci-enhanced-analysis";

export function ManualEnhancementPanel() {
  const [items, setItems] = useState<EnhancedAnalysis[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as EnhancedAnalysis[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  const latest = useMemo(() => items.at(-1), [items]);

  if (!latest) {
    return (
      <div className="border border-terminal-line bg-terminal-panel2 p-3 text-sm text-terminal-muted">
        尚未匯入 ChatGPT 手動加強分析。到 Settings 產生 prompt、貼回 JSON 後，這裡會顯示 enhanced manager view。
      </div>
    );
  }

  return (
    <div className="space-y-3 border border-terminal-blue/60 bg-terminal-panel2 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal-blue">Manual ChatGPT Enhancement</div>
        <div className="font-mono text-[10px] text-terminal-muted">{items.length} saved</div>
      </div>
      <p className="text-sm leading-6 text-terminal-text">{latest.managerView}</p>
      <div className="grid gap-2 md:grid-cols-3">
        <Mini title="Bull" text={latest.bullCase} />
        <Mini title="Base" text={latest.baseCase} />
        <Mini title="Bear" text={latest.bearCase} />
      </div>
    </div>
  );
}

function Mini({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-terminal-line p-2">
      <div className="font-mono text-[10px] uppercase text-terminal-muted">{title}</div>
      <p className="mt-1 text-xs leading-5 text-terminal-muted">{text}</p>
    </div>
  );
}
