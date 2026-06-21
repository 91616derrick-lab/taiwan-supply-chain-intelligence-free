export type LocalAiResult =
  | {
      ok: true;
      provider: "ollama";
      model: string;
      text: string;
    }
  | {
      ok: false;
      provider: "ollama" | "lm_studio" | "none";
      status: "disabled" | "not_configured" | "failed";
      message: string;
    };

export type LocalAiInput = {
  eventTitle: string;
  summary: string;
  affectedIndustries: string[];
  companies: string[];
};

export function localAiEnabled() {
  return process.env.LOCAL_AI_ENABLED === "true";
}

export async function enhanceWithOllama(input: LocalAiInput): Promise<LocalAiResult> {
  if (!localAiEnabled()) {
    return {
      ok: false,
      provider: "none",
      status: "disabled",
      message: "LOCAL_AI_ENABLED is not true; rule-based manager view is used."
    };
  }

  const baseUrl = process.env.OLLAMA_BASE_URL;
  const model = process.env.LOCAL_AI_MODEL ?? "qwen2.5:7b";

  if (!baseUrl) {
    return {
      ok: false,
      provider: "ollama",
      status: "not_configured",
      message: "LOCAL_AI_ENABLED=true but OLLAMA_BASE_URL is not configured."
    };
  }

  try {
    const prompt = [
      "你是投資研究助理。請只用研究假設語氣，不給買賣建議、目標價或保證報酬。",
      "根據下列事件，用繁體中文產生 120 字內的經理人觀點，並列出要驗證的資料。",
      `事件：${input.eventTitle}`,
      `摘要：${input.summary}`,
      `受影響產業：${input.affectedIndustries.join("、")}`,
      `相關公司：${input.companies.join("、")}`
    ].join("\n");

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.2
        }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return {
        ok: false,
        provider: "ollama",
        status: "failed",
        message: `Ollama returned HTTP ${response.status}.`
      };
    }

    const payload = (await response.json()) as { response?: string };
    const text = payload.response?.trim();

    if (!text) {
      return {
        ok: false,
        provider: "ollama",
        status: "failed",
        message: "Ollama returned an empty response."
      };
    }

    return {
      ok: true,
      provider: "ollama",
      model,
      text
    };
  } catch (error) {
    return {
      ok: false,
      provider: "ollama",
      status: "failed",
      message: error instanceof Error ? error.message : "Ollama request failed."
    };
  }
}

export async function inspectLmStudioStatus() {
  const baseUrl = process.env.LOCAL_AI_BASE_URL;

  if (!localAiEnabled()) {
    return {
      provider: "lm_studio" as const,
      status: "disabled" as const,
      message: "LOCAL_AI_ENABLED is not true."
    };
  }

  if (!baseUrl) {
    return {
      provider: "lm_studio" as const,
      status: "not_configured" as const,
      message: "LOCAL_AI_BASE_URL is not configured."
    };
  }

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/models`, {
      signal: AbortSignal.timeout(5000)
    });

    return {
      provider: "lm_studio" as const,
      status: response.ok ? ("reachable" as const) : ("failed" as const),
      message: response.ok ? "LM Studio local server is reachable." : `LM Studio returned HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      provider: "lm_studio" as const,
      status: "failed" as const,
      message: error instanceof Error ? error.message : "LM Studio local server request failed."
    };
  }
}
