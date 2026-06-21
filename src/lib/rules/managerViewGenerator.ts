import type {
  IntelligenceEvent,
  ManagerObservation
} from "@/src/lib/schemas/intelligenceSchema";
import { categoryLabel, type EventCategory } from "./keywordClassifier";

export function generateManagerView(event: IntelligenceEvent): ManagerObservation {
  const category = categoryLabel(event.category as EventCategory);
  const companies = event.likelyAffectedCompanies
    .slice(0, 5)
    .map((company) => `${company.companyName} ${company.ticker}`)
    .join("、");

  return {
    eventId: event.id,
    eventTitle: event.title,
    engine: "rule_based",
    managerView: `規則引擎推論：此事件被歸類為 ${category}，台灣相關分數 ${event.taiwanRelevanceScore}/100。初步影響集中在 ${event.affectedIndustries.join("、")}，優先檢查 ${companies || "相關供應鏈公司"} 的訂單、毛利與產能訊號。`,
    bullCase: `若事件延續且被公司公告或法說會驗證，${event.supplyChainNodes.slice(0, 3).join("、")} 可能形成營收或議價能力支撐。`,
    bearCase: `若需求遞延、政策限制擴大或成本無法轉嫁，事件可能只帶來短期題材，並壓縮供應鏈毛利。`,
    baseCase: `在尚未取得完整公司指引前，將此事件視為研究優先序 ${event.researchPriority} 的監控項，而不是交易結論。`,
    disconfirmingEvidence: [
      "公司月營收或接單未跟上事件敘事",
      "主要客戶延後拉貨或降低資本支出",
      "同業說法與此事件方向不一致",
      "價格反應已大幅提前反映且基本面未驗證"
    ],
    indicatorsToMonitor: event.indicatorsToMonitor,
    suggestedResearchActions: [
      "回查 MOPS 重大訊息、月營收與法說會簡報",
      "比較同產業公司是否出現一致性營收或毛利訊號",
      "追蹤上游價格、交期、庫存與客戶資本支出變化",
      "把事件與 watchlist 公司逐一建立可驗證假設"
    ],
    riskControls: [
      "不輸出買進、賣出、持有或目標價",
      "任何推論都需用公開公告與多來源交叉驗證",
      "避免把單一新聞直接等同於公司獲利改善",
      "標記缺失資料，等資料補齊後再提高信心分數"
    ]
  };
}
