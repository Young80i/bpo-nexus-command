import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import {
  createAIProvider,
  createFallbackAIProvider,
  CTO_MODEL,
  CTO_FALLBACK_MODEL,
} from "@/lib/ai-provider.server";

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
  milestones: z.array(
    z.object({
      title: z.string(),
      outcome: z.string(),
      days: z.number(),
    }),
  ),
  tasks: z.array(
    z.object({
      title: z.string(),
      milestone: z.string(),
      tool: z.string(),
    }),
  ),
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

/**
 * Primary AI provider:
 * NVIDIA Nemotron 3 Super through OpenRouter.
 */
function primaryModel() {
  return createAIProvider().languageModel(CTO_MODEL);
}

/**
 * Fallback AI provider:
 * Gemini through Google's AI SDK.
 */
function fallbackModel() {
  return createFallbackAIProvider().languageModel(CTO_FALLBACK_MODEL);
}

/**
 * Runs the primary model first.
 *
 * If OpenRouter/NVIDIA fails, automatically retries the
 * exact same request using the Gemini fallback model.
 */
async function generateWithFallback<T>({
  schema,
  prompt,
}: {
  schema: z.ZodType<T>;
  prompt: string;
}): Promise<T> {
  try {
    console.log(`[JARVIS] Primary model: ${CTO_MODEL}`);

    const { object } = await generateObject({
      model: primaryModel(),
      schema: schema,
      prompt,
    });

    console.log(`[JARVIS] Primary model succeeded.`);
    return object;
  } catch (primaryError) {
    const primaryMessage =
      primaryError instanceof Error
        ? primaryError.message
        : "Unknown primary model error";

    console.warn(
      `[JARVIS] Primary model failed. Switching to fallback Gemini.`,
      primaryMessage,
    );

    try {
      console.log(`[JARVIS] Fallback model: ${CTO_FALLBACK_MODEL}`);

      const { object } = await generateObject({
        model: fallbackModel(),
        schema: schema,
        prompt,
      });

      console.log(`[JARVIS] Fallback model succeeded.`);
      return object;
    } catch (fallbackError) {
      const fallbackMessage =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Unknown fallback model error";

      console.error(
        `[JARVIS] Both primary and fallback models failed.`,
        {
          primaryError: primaryMessage,
          fallbackError: fallbackMessage,
        },
      );

      throw fallbackError;
    }
  }
}

export const analyseBrief = async (data: { text: string }): Promise<BriefAnalysis> => {
  // Validate input
  z.object({ text: z.string().min(20) }).parse(data);

  const prompt = `You are a senior software architect and delivery lead for a solo AI agency working on Freelancer.com.

Analyse this project description and produce a delivery plan.

Recommend only these tools:
- Lovable
- Claude
- GitHub Desktop
- Visual Studio Code
- Node.js

Keep every list to at most 8 concise items.
Milestones must be at most 6.
Tasks must be at most 12.

Difficulty must be exactly one of:
- Easy
- Moderate
- Hard
- Expert

PROJECT DESCRIPTION:

${data.text}`;

  try {
    return await generateWithFallback({
      schema: briefSchema,
      prompt,
    });
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
};

export const analyseConversation = async (data: { text: string }): Promise<ConversationAnalysis> => {
  // Validate input
  z.object({ text: z.string().min(20) }).parse(data);

  const prompt = `Analyse this client conversation from a Freelancer.com software project.

Return:
- A short summary
- Action items
- Outstanding questions
- A ready-to-send reply
- Overall sentiment

Keep lists to at most 8 items.

The suggested reply must:
- Be warm
- Be professional
- Be confident
- Sound like an experienced freelancer
- Be ready to send directly to the client
- Stay under 150 words

CONVERSATION:

${data.text}`;

  try {
    return await generateWithFallback({
      schema: conversationSchema,
      prompt,
    });
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
};