import latestJson from "@/data/intelligence/latest.json";
import { CompaniesExplorer } from "@/components/CompaniesExplorer";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";
import { getMergedCompanyUniverse } from "@/src/lib/companies/mergeCompanyUniverse";

const latest = intelligenceSchema.parse(latestJson);
const companies = getMergedCompanyUniverse();

export default function CompaniesPage() {
  return <CompaniesExplorer companies={companies} impacts={latest.companyImpacts} />;
}
