"use client";

import { useState } from "react";
import { glossaryByTerm } from "@/src/data/glossary";

export function GlossaryTooltip({ term, children }: { term: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const item = glossaryByTerm.get(term.toLowerCase());

  if (!item) {
    return <>{children ?? term}</>;
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="border-b border-dotted border-terminal-blue text-terminal-blue"
      >
        {children ?? term}
      </button>
      {open ? (
        <span className="absolute left-0 top-6 z-40 w-72 border border-terminal-blue bg-terminal-panel p-3 text-left text-xs leading-5 text-terminal-text shadow-xl">
          <span className="mb-1 block font-mono text-[10px] uppercase text-terminal-blue">{item.term}</span>
          {item.plain}
        </span>
      ) : null}
    </span>
  );
}
