import Link from "next/link";
import { notFound } from "next/navigation";
import latestJson from "@/data/intelligence/latest.json";
import { CompanyDetailReadable } from "@/components/CompaniesExplorer";
import { Badge, Panel } from "@/components/ui";
import { intelligenceSchema } from "@/src/lib/schemas/intelligenceSchema";
import { getMergedCompanyUniverse } from "@/src/lib/companies/mergeCompanyUniverse";

const latest = intelligenceSchema.parse(latestJson);
const companies = getMergedCompanyUniverse();

export function generateStaticParams() {
  return companies.map((company) => ({ ticker: company.ticker }));
}

export default function CompanyPage({ params }: { params: { ticker: string } }) {
  const company = companies.find((item) => item.ticker === params.ticker);
  if (!company) {
    notFound();
  }

  const impact = latest.companyImpacts.find((item) => item.ticker === company.ticker);
  const relatedEvents = latest.events.filter((event) => impact?.relatedEventIds.includes(event.id));

  return (
    <div className="space-y-4">
      <Panel title={`${company.companyName} ${company.ticker}`} kicker={`${company.market} / ${company.industry}`}>
        <div className="flex flex-wrap gap-2">
          <Badge tone={company.isCurated ? "purple" : "neutral"}>{company.isCurated ? "重點供應鏈標籤" : "完整 universe 公司"}</Badge>
          <Badge tone="blue">{company.exchange}</Badge>
          <Badge>{company.isin || "ISIN 待確認"}</Badge>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-terminal-muted">
          這裡不是推薦買賣，而是整理這家公司在最新事件中可能被影響的原因、限制與需要追蹤的數字。
        </p>
      </Panel>

      <CompanyDetailReadable
        company={company}
        impact={impact}
        relatedEventTitles={relatedEvents.map((event) => event.title)}
      />

      <Panel title="相關事件" kicker="latest intelligence">
        {relatedEvents.length > 0 ? (
          <div className="space-y-2">
            {relatedEvents.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`} className="block border border-terminal-line bg-terminal-panel2 p-3 hover:border-terminal-blue">
                <div className="font-mono text-[10px] uppercase text-terminal-muted">{event.category}</div>
                <div className="mt-1 text-sm font-semibold text-terminal-text">{event.title}</div>
                <p className="mt-2 text-xs leading-5 text-terminal-muted">{event.whyItMatters}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-terminal-line p-4 text-sm text-terminal-muted">
            最新情報尚未把這家公司列為主要受影響公司。仍可從公司月營收、法說會與產業新聞持續觀察。
          </div>
        )}
      </Panel>
    </div>
  );
}
