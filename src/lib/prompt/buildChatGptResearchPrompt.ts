import type { IntelligenceEvent } from "@/src/lib/schemas/intelligenceSchema";

export function buildChatGptResearchPrompt(event: IntelligenceEvent) {
  const companies = event.likelyAffectedCompanies
    .slice(0, 10)
    .map((company) => `${company.companyName} ${company.ticker}`)
    .join("、");

  return `請扮演謹慎的投資研究分析師，只做研究用途，不提供買進、賣出、持有、目標價或保證報酬。

請根據以下事件，回傳 JSON，不要包 markdown code fence：

事件標題：${event.title}
事件摘要：${event.summary}
事件分類：${event.category}
台灣相關分數：${event.taiwanRelevanceScore}
市場相關分數：${event.marketRelevanceScore}
受影響產業：${event.affectedIndustries.join("、")}
供應鏈節點：${event.supplyChainNodes.join("、")}
可能受影響公司：${companies}
來源：${event.url}

請輸出以下 JSON schema：
{
  "eventId": "${event.id}",
  "managerView": "繁體中文，150-250 字，明確標示研究假設",
  "bullCase": "正向情境，但不能是買進建議",
  "bearCase": "負向情境",
  "baseCase": "中性基準情境",
  "disconfirmingEvidence": ["可推翻此假設的證據"],
  "indicatorsToMonitor": ["應追蹤指標"],
  "suggestedResearchActions": ["下一步研究動作"],
  "riskControls": ["風險控管與避免誤判方式"],
  "disclaimer": "研究用途，不構成投資建議。"
}`;
}
