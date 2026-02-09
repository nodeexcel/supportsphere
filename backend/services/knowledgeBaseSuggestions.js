const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const redis = new Redis();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getKnowledgeBaseSuggestions(query) {
  try {
    // Check Redis cache first
    const cachedSuggestions = await redis.get(`kb_suggestions:${query}`);
    if (cachedSuggestions) {
      return JSON.parse(cachedSuggestions);
    }

    // Analyze the query using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Suggest knowledge base articles for: ${query}` }],
    });

    const suggestions = response.choices[0].message.content.split('\n').filter(Boolean);

    // Fetch articles from the database based on suggestions
    const articles = await prisma.article.findMany({
      where: {
        title: {
          in: suggestions,
        },
      },
    });

    // Cache the results in Redis
    await redis.set(`kb_suggestions:${query}`, JSON.stringify(articles), 'EX', 3600); // Cache for 1 hour

    return articles;
  } catch (error) {
    console.error('Error fetching knowledge base suggestions:', error);
    throw new Error('Could not fetch knowledge base suggestions');
  }
}

module.exports = {
  getKnowledgeBaseSuggestions,
};