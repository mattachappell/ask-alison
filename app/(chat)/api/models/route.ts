import { chatModels } from "@/lib/ai/models";

export function GET() {
  return Response.json({
    models: chatModels.map((m) => ({
      ...m,
      capabilities: { vision: false, reasoning: false, tools: false },
    })),
  });
}
