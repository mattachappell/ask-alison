export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const DEFAULT_CHAT_MODEL_ID = "anthropic/claude-haiku-4.5";

export const chatModels: ChatModel[] = [
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku",
    description: "Fast, cost-efficient responses for etiquette questions",
  },
];
