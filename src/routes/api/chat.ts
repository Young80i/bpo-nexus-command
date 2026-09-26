import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createAIProvider, CTO_MODEL, CTO_SYSTEM_PROMPT } from "@/lib/ai-provider.server";

type ChatBody = { messages?: unknown; snapshot?: unknown; focus?: string };

export const Route = createFileRoute("/api/chat")({
server: {
handlers: {
POST: async ({ request }) => {
const body = (await request.json()) as ChatBody;
if (!Array.isArray(body.messages)) {
return new Response("Messages are required", { status: 400 });
}

    try {
      const provider = createAIProvider();

      const system = [
        CTO_SYSTEM_PROMPT,
        body.focus ? `The user is currently focused on project id: ${body.focus}.` : "",
        "Live workspace snapshot (JSON):",
        JSON.stringify(body.snapshot ?? {}).slice(0, 90_000),
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const result = streamText({
          model: provider.languageModel(CTO_MODEL),
          system,
          messages: await convertToModelMessages(body.messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed";
      return new Response(message, { status: 500 });
    }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Configuration error";
      return new Response(message, { status: 500 });
    }
  },
},


},
});