import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { getOrCreateSessionUserId } from "@/lib/session/anonymous";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "chatId is required" }, { status: 400 });
  }

  const userId = await getOrCreateSessionUserId();
  const chat = await getChatById(chatId);

  if (!chat) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  const isOwner = chat.user_id === userId;
  const messages = await getMessagesByChatId(chatId);

  // Convert DB messages to the UIMessage-like format the client expects
  const uiMessages = messages.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: "text" as const, text: m.content }],
    createdAt: m.created_at,
  }));

  return Response.json({
    messages: uiMessages,
    visibility: "private",
    isReadonly: !isOwner,
  });
}
