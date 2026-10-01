import { OpenCodeSettings } from "@t3tools/contracts";
import * as Schema from "effect/Schema";
import { describe, expect, it } from "@effect/vitest";

import {
  buildOpenCodeApiConfigContent,
  resolveOpenCodeApiProvider,
} from "./openCodeApiProvider.ts";

const decodeSettings = Schema.decodeSync(OpenCodeSettings);

describe("OpenCode API provider profiles", () => {
  it("resolves the Z.ai Coding Plan Global preset", () => {
    const provider = resolveOpenCodeApiProvider(
      decodeSettings({ apiProvider: "zai-coding-global" }),
    );

    expect(provider).toMatchObject({
      id: "zai-coding-global",
      baseUrl: "https://api.z.ai/api/coding/paas/v4",
      model: "glm-4.5",
      apiKeyEnvironmentVariable: "ZAI_API_KEY",
    });
  });

  it("resolves the DeepSeek preset and allows a model override", () => {
    const provider = resolveOpenCodeApiProvider(
      decodeSettings({ apiProvider: "deepseek", apiModel: "deepseek-reasoner" }),
    );

    expect(provider).toMatchObject({
      id: "deepseek",
      baseUrl: "https://api.deepseek.com",
      model: "deepseek-reasoner",
      apiKeyEnvironmentVariable: "DEEPSEEK_API_KEY",
    });
  });

  it("adds a provider without discarding inherited OpenCode configuration", () => {
    const settings = decodeSettings({
      apiProvider: "custom",
      apiBaseUrl: "https://example.test/v1",
      apiModel: "example-model",
    });
    const content = buildOpenCodeApiConfigContent(
      settings,
      JSON.stringify({ permission: { edit: "deny" }, provider: { existing: { models: {} } } }),
    );
    const parsed = JSON.parse(content) as {
      permission?: unknown;
      provider: Record<string, { options?: Record<string, string> } | undefined>;
      model?: string;
    };

    expect(parsed.permission).toEqual({ edit: "deny" });
    expect(parsed.provider.existing).toEqual({ models: {} });
    expect(parsed.provider["custom-api"]?.options?.apiKey).toBe("{env:API_KEY}");
    expect(parsed.model).toBe("custom-api/example-model");
  });

  it("does not synthesize config when the API profile is disabled", () => {
    const existing = JSON.stringify({ model: "existing/model" });
    expect(buildOpenCodeApiConfigContent(decodeSettings({}), existing)).toBe(existing);
  });

  it("rejects an invalid API key environment variable", () => {
    expect(
      resolveOpenCodeApiProvider(
        decodeSettings({
          apiProvider: "custom",
          apiBaseUrl: "https://example.test/v1",
          apiModel: "example-model",
          apiKeyEnvironmentVariable: "NOT-A-VARIABLE",
        }),
      ),
    ).toBeUndefined();
  });
});
