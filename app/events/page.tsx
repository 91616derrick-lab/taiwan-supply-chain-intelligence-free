import latestJson from "@/data/intelligence/latest.json";
import { EventsExplorer } from "@/components/EventsExplorer";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";

const latest = intelligenceSchema.parse(latestJson);

export default function EventsPage() {
  return <EventsExplorer events={latest.events} />;
}
