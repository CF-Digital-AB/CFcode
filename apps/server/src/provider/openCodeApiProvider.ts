import type { OpenCodeSettings } from "@t3tools/contracts";

export const OPEN_CODE_API_PROVIDER_PRESETS = {
  "zai-coding-global": {
    id: "zai-coding-global",
    name: "Z.ai Coding Plan Global",
    baseUrl: "https://api.z.ai/api/coding/paas/v4",
    model: "glm-4.5",
    apiKeyEnvironmentVariable: "ZAI_API_KEY",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    apiKeyEnvironmentVariable: "DEEPSEEK_API_KEY",
  },
} as const;

type HostedApiProvider = keyof typeof OPEN_CODE_API_PROVIDER_PRESETS;
const ENVIRONMENT_VARIABLE_NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function resolveOpenCodeApiProvider(settings: OpenCodeSettings) {
  if (settings.apiProvider === "none") return undefined;

  const preset =
    settings.apiProvider === "custom"
      ? undefined
      : OPEN_CODE_API_PROVIDER_PRESETS[settings.apiProvider as HostedApiProvider];
  const baseUrl = settings.apiBaseUrl.trim() || preset?.baseUrl || "";
  const model = settings.apiModel.trim() || preset?.model || "";
  const apiKeyEnvironmentVariable =
    settings.apiKeyEnvironmentVariable.trim() || preset?.apiKeyEnvironmentVariable || "API_KEY";

  if (
    baseUrl.length === 0 ||
    model.length === 0 ||
    !ENVIRONMENT_VARIABLE_NAME_PATTERN.test(apiKeyEnvironmentVariable)
  ) {
    return undefined;
  }

  const id = preset?.id ?? "custom-api";
  const name = preset?.name ?? "Custom OpenAI-compatible API";
  return { id, name, baseUrl, model, apiKeyEnvironmentVariable };
}

/**
 * Adds one API provider to OpenCode's virtual config. The API key is referenced
 * through an environment variable so it never needs to be embedded in JSON.
 * Existing OPENCODE_CONFIG_CONTENT is preserved and receives the provider as
 * an additive override.
 */
export function buildOpenCodeApiConfigContent(
  settings: OpenCodeSettings,
  existingContent: string | undefined,
): string {
  const provider = resolveOpenCodeApiProvider(settings);
  if (!provider) return existingContent?.trim() || "{}";

  let existing: Record<string, unknown> = {};
  if (existingContent?.trim()) {
    try {
      const parsed: unknown = JSON.parse(existingContent);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        existing = { ...(parsed as Record<string, unknown>) };
      }
    } catch {
      // A malformed inherited config should not prevent the configured API
      // provider from starting; OpenCode will report the original issue when
      // the user uses the config directly.
    }
  }

  const existingProviders =
    existing.provider !== null &&
    typeof existing.provider === "object" &&
    !Array.isArray(existing.provider)
      ? (existing.provider as Record<string, unknown>)
      : {};

  return JSON.stringify({
    ...existing,
    provider: {
      ...existingProviders,
      [provider.id]: {
        npm: "@ai-sdk/openai-compatible",
        name: provider.name,
        options: {
          baseURL: provider.baseUrl,
          apiKey: `{env:${provider.apiKeyEnvironmentVariable}}`,
        },
        models: {
          [provider.model]: { name: provider.model },
        },
      },
    },
    model: `${provider.id}/${provider.model}`,
  });
}
