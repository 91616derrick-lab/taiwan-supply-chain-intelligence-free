"use client";

import { useEffect, useMemo, useState } from "react";
import type { IntelligenceEvent } from "@/src/lib/schemas/intelligenceSchema";
import { buildChatGptResearchPrompt } from "@/src/lib/prompt/buildChatGptResearchPrompt";
import { parseEnhancedAnalysis, type EnhancedAnalysis } from "@/src/lib/import/parseEnhancedAnalysis";

const watchlistKey = "tsci-watchlist";
const notesKey = "tsci-notes";
const enhancedKey = "tsci-enhanced-analysis";

export function SettingsClient({ events }: { events: IntelligenceEvent[] }) {
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id ?? "");
  const [watchlist, setWatchlist] = useState("");
  const [notes, setNotes] = useState("");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setWatchlist(window.localStorage.getItem(watchlistKey) ?? "");
    setNotes(window.localStorage.getItem(notesKey) ?? "");
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0],
    [events, selectedEventId]
  );

  const prompt = selectedEvent ? buildChatGptResearchPrompt(selectedEvent) : "";

  function saveLocalPreferences() {
    window.localStorage.setItem(watchlistKey, watchlist);
    window.localStorage.setItem(notesKey, notes);
    setMessage("已儲存 watchlist 與 notes 到 localStorage。");
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setMessage("Prompt 已複製。這不會呼叫任何 OpenAI API。");
  }

  function importEnhancedAnalysis() {
    try {
      const parsed = parseEnhancedAnalysis(importText);
      const existingRaw = window.localStorage.getItem(enhancedKey);
      const existing = existingRaw ? (JSON.parse(existingRaw) as EnhancedAnalysis[]) : [];
      const next = [...existing.filter((item) => item.eventId !== parsed.eventId), parsed];
      window.localStorage.setItem(enhancedKey, JSON.stringify(next));
      setMessage("已匯入 enhanced analysis，Dashboard 會顯示手動加強觀點。");
    } catch (error) {
      setMessage(error instanceof Error ? `匯入失敗：${error.message}` : "匯入失敗。");
    }
  }

  function exportLocalData() {
    const payload = {
      watchlist,
      notes,
      enhancedAnalysis: JSON.parse(window.localStorage.getItem(enhancedKey) ?? "[]") as unknown
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tsci-local-settings.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="border border-terminal-line bg-terminal-panel">
        <div className="border-b border-terminal-line px-3 py-2">
          <h2 className="text-sm font-semibold">Watchlist & Notes</h2>
        </div>
        <div className="space-y-3 p-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-terminal-muted">Watchlist tickers</span>
            <textarea
              value={watchlist}
              onChange={(event) => setWatchlist(event.target.value)}
              className="mt-1 min-h-24 w-full border border-terminal-line bg-terminal-bg p-2 font-mono text-xs text-terminal-text outline-none focus:border-terminal-blue"
              placeholder="2330, 2382, 6669, 2308"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-terminal-muted">Research notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 min-h-36 w-full border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text outline-none focus:border-terminal-blue"
              placeholder="Write local research notes here. Stored only in this browser."
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveLocalPreferences} className="border border-terminal-green px-3 py-1.5 font-mono text-xs uppercase text-terminal-green hover:bg-terminal-green hover:text-terminal-bg">
              Save Local
            </button>
            <button onClick={exportLocalData} className="border border-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg">
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="border border-terminal-line bg-terminal-panel">
        <div className="border-b border-terminal-line px-3 py-2">
          <h2 className="text-sm font-semibold">ChatGPT Manual Enhancement</h2>
        </div>
        <div className="space-y-3 p-3">
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-terminal-muted">Event</span>
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              className="mt-1 w-full border border-terminal-line bg-terminal-bg p-2 text-sm text-terminal-text outline-none focus:border-terminal-blue"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-terminal-muted">Generated prompt</span>
            <textarea readOnly value={prompt} className="mt-1 min-h-56 w-full border border-terminal-line bg-terminal-bg p-2 font-mono text-xs text-terminal-muted outline-none" />
          </label>
          <button onClick={copyPrompt} className="border border-terminal-blue px-3 py-1.5 font-mono text-xs uppercase text-terminal-blue hover:bg-terminal-blue hover:text-terminal-bg">
            Copy Prompt
          </button>
          <label className="block">
            <span className="font-mono text-[10px] uppercase text-terminal-muted">Paste ChatGPT JSON</span>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="mt-1 min-h-40 w-full border border-terminal-line bg-terminal-bg p-2 font-mono text-xs text-terminal-text outline-none focus:border-terminal-blue"
              placeholder='{"eventId":"...","managerView":"...","disclaimer":"研究用途，不構成投資建議。"}'
            />
          </label>
          <button onClick={importEnhancedAnalysis} className="border border-terminal-green px-3 py-1.5 font-mono text-xs uppercase text-terminal-green hover:bg-terminal-green hover:text-terminal-bg">
            Import Enhanced Analysis
          </button>
          {message ? <div className="border border-terminal-line bg-terminal-panel2 p-2 text-xs text-terminal-muted">{message}</div> : null}
        </div>
      </section>
    </div>
  );
}
