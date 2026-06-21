import latestJson from "@/data/intelligence/latest.json";
import statusJson from "@/data/system/status.json";
import companySummaryJson from "@/data/taiwan-companies/summary.json";
import { HomeExperience } from "@/components/HomeExperience";
import {
  intelligenceSchema,
  updaterStatusSchema
} from "@/src/lib/schemas/intelligenceSchema";
import type { CompanyUniverseSummary } from "@/src/lib/companies/companyTypes";

const latest = intelligenceSchema.parse(latestJson);
const status = updaterStatusSchema.parse(statusJson);
const companySummary = companySummaryJson as CompanyUniverseSummary;

export default function HomePage() {
  return <HomeExperience latest={latest} status={status} companySummary={companySummary} />;
}
