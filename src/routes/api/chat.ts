import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, CTO_MODEL, CTO_SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown; snapshot?: unknown; focus?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

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
            model: gateway(CTO_MODEL),
            system,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
            providerOptions: { lovable: { reasoningEffort: "none" } },
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI request failed";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
