import latestJson from "@/data/intelligence/latest.json";
import { Panel } from "@/components/ui";
import { SettingsClient } from "@/components/SettingsClient";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Settings" kicker="local browser storage">
        <p className="text-sm leading-6 text-terminal-muted">
          Watchlist, notes, and ChatGPT manual enhanced analysis are stored only in this browser with localStorage. This page does not call OpenAI API and does not require a server-side secret.
        </p>
      </Panel>
      <SettingsClient events={latest.events} />
    </div>
  );
}
