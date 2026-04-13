import { gateway } from "ai";

export function getLanguageModel(modelId: string) {
  return gateway.languageModel(modelId);
}

export function getTitleModel() {
  return gateway.languageModel("anthropic/claude-haiku-4.5");
}
