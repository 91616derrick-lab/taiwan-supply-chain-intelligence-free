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
    managerView: `規則引擎推論：這件事目前最值得追蹤的是 ${event.affectedIndustries.slice(0, 3).join("、")}。台灣相關分數 ${event.taiwanRelevanceScore}/100，代表它可能牽動 ${companies || "相關台灣公司"}，但仍需要用公司營收、法說會和訂單訊號確認。`,
    bullCase: `如果後續資料證明需求真的增加，${event.supplyChainNodes.slice(0, 3).join("、")} 的公司可能受惠。`,
    bearCase: "如果需求只是短期新聞、客戶延後拉貨，或成本上升無法轉嫁，相關公司可能承壓。",
    baseCase: `先把它當成研究優先級 ${event.researchPriority} 的觀察題，不要直接解讀成投資結論。`,
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
