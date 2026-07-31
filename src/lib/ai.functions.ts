import { createServerFn } from "@tanstack/react-start";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, CTO_MODEL } from "@/lib/ai-gateway.server";

const briefSchema = z.object({
  summary: z.string(),
  difficulty: z.string(),
  estimatedCompletion: z.string(),
  techStack: z.array(z.string()),
  functionalRequirements: z.array(z.string()),
  nonFunctionalRequirements: z.array(z.string()),
  risks: z.array(z.string()),
  clientExpectations: z.array(z.string()),
  deliverables: z.array(z.string()),
  milestones: z.array(z.object({ title: z.string(), outcome: z.string(), days: z.number() })),
  tasks: z.array(z.object({ title: z.string(), milestone: z.string(), tool: z.string() })),
});

export type BriefAnalysis = z.infer<typeof briefSchema>;

const conversationSchema = z.object({
  summary: z.string(),
  actionItems: z.array(z.string()),
  outstandingQuestions: z.array(z.string()),
  suggestedReply: z.string(),
  sentiment: z.string(),
});

export type ConversationAnalysis = z.infer<typeof conversationSchema>;

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key, { structuredOutputs: true })(CTO_MODEL);
}

export const analyseBrief = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ text: z.string().min(20) }).parse(data))
  .handler(async ({ data }): Promise<BriefAnalysis> => {
    try {
      const { output } = await generateText({
        model: gateway(),
        output: Output.object({ schema: briefSchema }),
        providerOptions: { lovable: { reasoningEffort: "none" } },
        prompt: `You are a senior software architect and delivery lead for a solo AI agency working on Freelancer.com.
Analyse this project description and produce a delivery plan. Recommend only Lovable, Claude, GitHub Desktop, Visual Studio Code and Node.js as tools. Keep every list to at most 8 concise items, milestones to at most 6, tasks to at most 12. Difficulty must be one of Easy, Moderate, Hard, Expert.

PROJECT DESCRIPTION:
${data.text}`,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        try {
          return briefSchema.parse(JSON.parse(error.text));
        } catch {
          /* fall through */
        }
      }
      throw error;
    }
  });

export const analyseConversation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ text: z.string().min(20) }).parse(data))
  .handler(async ({ data }): Promise<ConversationAnalysis> => {
    try {
      const { output } = await generateText({
        model: gateway(),
        output: Output.object({ schema: conversationSchema }),
        providerOptions: { lovable: { reasoningEffort: "none" } },
        prompt: `Analyse this client conversation from a Freelancer.com software project.
Return a short summary, action items, outstanding questions and a ready-to-send reply written in a warm, professional, confident freelancer voice. Keep lists to at most 8 items and the reply under 150 words.

CONVERSATION:
${data.text}`,
      });
      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        try {
          return conversationSchema.parse(JSON.parse(error.text));
        } catch {
          /* fall through */
        }
      }
      throw error;
    }
  });
