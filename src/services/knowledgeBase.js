import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { OpenAIApi, Configuration } from 'openai';

const prisma = new PrismaClient();
const redis = new Redis();
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

const KNOWLEDGE_BASE_KEY = 'knowledge_base';

async function updateKnowledgeBase(interaction) {
  try {
    // Save interaction to the database
    const savedInteraction = await prisma.interaction.create({
      data: {
        userInput: interaction.userInput,
        response: interaction.response,
      },
    });

    // Update Redis cache
    const currentKnowledgeBase = await redis.get(KNOWLEDGE_BASE_KEY);
    const updatedKnowledgeBase = currentKnowledgeBase ? JSON.parse(currentKnowledgeBase) : [];
    updatedKnowledgeBase.push(savedInteraction);
    await redis.set(KNOWLEDGE_BASE_KEY, JSON.stringify(updatedKnowledgeBase));

    // Optionally, generate new knowledge from the interaction
    const newKnowledge = await generateKnowledge(interaction);
    await prisma.knowledge.create({
      data: {
        content: newKnowledge,
      },
    });

  } catch (error) {
    console.error('Error updating knowledge base:', error);
    throw new Error('Failed to update knowledge base');
  }
}

async function generateKnowledge(interaction) {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Based on the following interaction, generate new knowledge: ${interaction.userInput}`,
      max_tokens: 150,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating knowledge:', error);
    throw new Error('Failed to generate knowledge');
  }
}

async function getKnowledgeBase() {
  try {
    const cachedKnowledgeBase = await redis.get(KNOWLEDGE_BASE_KEY);
    if (cachedKnowledgeBase) {
      return JSON.parse(cachedKnowledgeBase);
    }

    const knowledgeBase = await prisma.knowledge.findMany();
    await redis.set(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
    return knowledgeBase;
  } catch (error) {
    console.error('Error retrieving knowledge base:', error);
    throw new Error('Failed to retrieve knowledge base');
  }
}

export { updateKnowledgeBase, getKnowledgeBase };