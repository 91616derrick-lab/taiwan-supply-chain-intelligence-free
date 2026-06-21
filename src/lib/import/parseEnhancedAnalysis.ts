import { z } from "zod";

export const enhancedAnalysisSchema = z.object({
  eventId: z.string(),
  managerView: z.string(),
  bullCase: z.string(),
  bearCase: z.string(),
  baseCase: z.string(),
  disconfirmingEvidence: z.array(z.string()),
  indicatorsToMonitor: z.array(z.string()),
  suggestedResearchActions: z.array(z.string()),
  riskControls: z.array(z.string()),
  disclaimer: z.literal("研究用途，不構成投資建議。")
});

export type EnhancedAnalysis = z.infer<typeof enhancedAnalysisSchema>;

export function parseEnhancedAnalysis(input: string): EnhancedAnalysis {
  const cleaned = input
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;
  return enhancedAnalysisSchema.parse(parsed);
}
