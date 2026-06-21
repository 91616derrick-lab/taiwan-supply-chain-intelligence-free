import { z } from "zod";

export const impactDirectionSchema = z.enum([
  "positive",
  "negative",
  "mixed",
  "uncertain"
]);

export const impactMagnitudeSchema = z.enum(["low", "medium", "high"]);
export const researchPrioritySchema = z.enum(["low", "medium", "high"]);

export const engineSchema = z.object({
  mode: z.enum(["rule_based", "local_ai_enhanced"]),
  localAiEnabled: z.boolean(),
  localAiModel: z.string().nullable()
});

export const statusErrorSchema = z.object({
  sourceId: z.string().optional(),
  scope: z.string(),
  message: z.string(),
  at: z.string()
});

export const systemStatusSchema = z.object({
  ok: z.boolean(),
  sourceCount: z.number().int().nonnegative(),
  articleCount: z.number().int().nonnegative(),
  eventCount: z.number().int().nonnegative(),
  companyImpactCount: z.number().int().nonnegative(),
  errors: z.array(statusErrorSchema)
});

export const sourceArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  publisher: z.string(),
  publishedAt: z.string(),
  summary: z.string(),
  sourceCategory: z.string(),
  sourceId: z.string(),
  quality: z.enum(["official", "primary", "media", "fallback"])
});

export const eventSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  url: z.string(),
  publisher: z.string(),
  publishedAt: z.string(),
  summary: z.string(),
  whyItMatters: z.string(),
  sourceCategory: z.string(),
  affectedIndustries: z.array(z.string()),
  supplyChainNodes: z.array(z.string()),
  likelyAffectedCompanies: z.array(
    z.object({
      companyName: z.string(),
      ticker: z.string(),
      exchange: z.enum(["TWSE", "TPEx"]),
      industry: z.string(),
      supplyChainRole: z.string()
    })
  ),
  taiwanRelevanceScore: z.number().min(0).max(100),
  marketRelevanceScore: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  researchPriority: researchPrioritySchema,
  impactDirection: impactDirectionSchema,
  impactMagnitude: impactMagnitudeSchema,
  missingData: z.array(z.string()),
  indicatorsToMonitor: z.array(z.string()),
  sourceIds: z.array(z.string())
});

export const companyImpactSchema = z.object({
  companyName: z.string(),
  ticker: z.string(),
  exchange: z.enum(["TWSE", "TPEx"]),
  industry: z.string(),
  supplyChainRole: z.string(),
  impactDirection: impactDirectionSchema,
  impactMagnitude: impactMagnitudeSchema,
  researchPriority: researchPrioritySchema,
  confidenceScore: z.number().min(0).max(100),
  missingData: z.array(z.string()),
  relatedEventIds: z.array(z.string()),
  sensitivityTags: z.array(z.string())
});

export const managerObservationSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string(),
  engine: z.enum(["rule_based", "local_ai_enhanced"]),
  managerView: z.string(),
  bullCase: z.string(),
  bearCase: z.string(),
  baseCase: z.string(),
  disconfirmingEvidence: z.array(z.string()),
  indicatorsToMonitor: z.array(z.string()),
  suggestedResearchActions: z.array(z.string()),
  riskControls: z.array(z.string()),
  enhancedManagerView: z.string().optional()
});

export const diagnosticCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(["pass", "warning", "fail"]),
  description: z.string(),
  nextAction: z.string()
});

export const updaterStatusSchema = z.object({
  generatedAt: z.string(),
  runId: z.string(),
  runType: z.enum(["morning", "evening", "manual"]),
  localAi: z.object({
    enabled: z.boolean(),
    provider: z.enum(["ollama", "lm_studio", "none"]),
    model: z.string().nullable(),
    status: z.enum(["disabled", "not_configured", "reachable", "failed"]),
    message: z.string()
  }),
  diagnostics: z.array(diagnosticCheckSchema),
  systemStatus: systemStatusSchema
});

export const intelligenceSchema = z.object({
  schemaVersion: z.literal("1.0"),
  generatedAt: z.string(),
  runId: z.string(),
  runType: z.enum(["morning", "evening", "manual"]),
  engine: engineSchema,
  systemStatus: systemStatusSchema,
  executiveSummary: z.string(),
  events: z.array(eventSchema),
  companyImpacts: z.array(companyImpactSchema),
  managerObservations: z.array(managerObservationSchema),
  sources: z.array(sourceArticleSchema),
  disclaimer: z.literal("研究用途，不構成投資建議。")
});

export type ImpactDirection = z.infer<typeof impactDirectionSchema>;
export type ImpactMagnitude = z.infer<typeof impactMagnitudeSchema>;
export type ResearchPriority = z.infer<typeof researchPrioritySchema>;
export type IntelligenceData = z.infer<typeof intelligenceSchema>;
export type IntelligenceEvent = z.infer<typeof eventSchema>;
export type CompanyImpact = z.infer<typeof companyImpactSchema>;
export type ManagerObservation = z.infer<typeof managerObservationSchema>;
export type UpdaterStatus = z.infer<typeof updaterStatusSchema>;
export type DiagnosticCheck = z.infer<typeof diagnosticCheckSchema>;
