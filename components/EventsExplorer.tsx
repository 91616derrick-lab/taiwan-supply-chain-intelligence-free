"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { IntelligenceEvent } from "@/src/lib/schemas/intelligenceSchema";
import {
  confidenceText,
  oneLineEvent,
  plainCategory,
  plainIndustries
} from "@/src/lib/beginner/beginnerCopy";
import { Badge, DirectionChip, PriorityBadge, ScoreBar } from "@/components/ui";

export function EventsExplorer({ events }: { events: IntelligenceEvent[] }) {
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [direction, setDirection] = useState("all");

  const categories = useMemo(() => [...new Set(events.map((event) => event.category))], [events]);
  const filtered = useMemo(
    () =>
      events.filter(
        (event) =>
          (category === "all" || event.category === category) &&
          (priority === "all" || event.researchPriority === priority) &&
          (direction === "all" || event.impactDirection === direction)
      ),
    [category, direction, events, priority]
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit border border-terminal-line bg-terminal-panel p-3 lg:sticky lg:top-20">
        <h2 className="font-semibold text-terminal-text">事件篩選</h2>
        <p className="mt-2 text-xs leading-5 text-terminal-muted">先用白話卡片看事件，進階資料在事件詳情頁。</p>
        <div className="mt-4 space-y-3">
          <Select label="事件類別" value={category} onChange={setCategory}>
            <option value="all">全部類別</option>
            {categories.map((item) => (
              <option key={item} value={item}>{plainCategory(item)}</option>
            ))}
          </Select>
          <Select label="研究優先級" value={priority} onChange={setPriority}>
            <option value="all">全部</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </Select>
          <Select label="可能影響" value={direction} onChange={setDirection}>
            <option value="all">全部</option>
            <option value="positive">可能受惠</option>
            <option value="negative">可能承壓</option>
            <option value="mixed">正負混合</option>
            <option value="uncertain">影響不明</option>
          </Select>
        </div>
      </aside>

      <section className="space-y-3">
        <div className="border border-terminal-line bg-terminal-panel p-4">
          <h1 className="text-xl font-semibold text-terminal-text">事件早報</h1>
          <p className="mt-2 text-sm leading-6 text-terminal-muted">
            每張卡片先回答：發生什麼事、為什麼重要、可能影響哪些台灣公司。
          </p>
        </div>
        {filtered.map((event) => (
          <article key={event.id} className="border border-terminal-line bg-terminal-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{plainCategory(event.category)}</Badge>
                <DirectionChip direction={event.impactDirection} />
                <PriorityBadge priority={event.researchPriority} />
              </div>
              <div className="font-mono text-[10px] uppercase text-terminal-muted">{event.publisher}</div>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-terminal-text">{event.title}</h2>
            <p className="mt-2 text-sm leading-6 text-terminal-text">{oneLineEvent(event)}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="text-sm leading-6 text-terminal-muted">
                <div>為什麼重要：{event.whyItMatters}</div>
                <div className="mt-2">可能影響公司：{event.likelyAffectedCompanies.slice(0, 6).map((company) => company.companyName).join("、")}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {plainIndustries(event.affectedIndustries).slice(0, 5).map((industry) => (
                    <Badge key={industry}>{industry}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <ScoreBar label="Taiwan relevance" value={event.taiwanRelevanceScore} />
                <ScoreBar label="Confidence" value={event.confidenceScore} />
                <div className="border border-terminal-line p-2 text-xs leading-5 text-terminal-muted">{confidenceText(event.confidenceScore)}</div>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/events/${event.id}`} className="border border-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg">
                View detail
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase text-terminal-muted">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text">
        {children}
      </select>
    </label>
  );
}
