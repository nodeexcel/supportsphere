import { OpenAIAgent } from 'openai-agent-sdk';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis();

const openaiAgent = new OpenAIAgent({
  apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeCustomerInteraction = async (interactionData) => {
  try {
    // Validate interaction data
    if (!interactionData || typeof interactionData !== 'object') {
      throw new Error('Invalid interaction data');
    }

    // Check if the interaction is already analyzed
    const cachedResult = await redis.get(interactionData.id);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    // Prepare the prompt for the AI model
    const prompt = `Analyze the following customer interaction: ${interactionData.text}`;

    // Call the OpenAI agent to analyze the interaction
    const response = await openaiAgent.generate(prompt);
    
    // Save the analysis result to the database
    const analysisResult = await prisma.analysis.create({
      data: {
        interactionId: interactionData.id,
        analysis: response,
      },
    });

    // Cache the result in Redis
    await redis.set(interactionData.id, JSON.stringify(analysisResult), 'EX', 3600); // Cache for 1 hour

    return analysisResult;
  } catch (error) {
    console.error('Error analyzing customer interaction:', error);
    throw new Error('Failed to analyze customer interaction');
  }
};