const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const aiProvider = require('../services/ai/aiProvider');
const statsEngine = require('../services/analytics/statsEngine');

exports.chat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Load recent logs
    const logs = await prisma.dailyLog.findMany({
      where: { userId: userId },
      orderBy: { date: 'desc' },
      take: 14
    });

    // Load goals
    const goals = await prisma.goal.findMany({
      where: { userId: userId, status: 'ACTIVE' }
    });

    let currentConversation;
    if (conversationId) {
      currentConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!currentConversation) {
      currentConversation = await prisma.conversation.create({
        data: { userId: userId },
        include: { messages: true }
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        conversationId: currentConversation.id
      }
    });

    // Generate System Prompt
    const currentScore = statsEngine.calculateRealityScore(logs);
    const momentum = statsEngine.calculateMomentum(logs);
    
    let goalContext = goals.map(g => `${g.title || g.type}: Target ${g.operator} ${g.target}`).join(', ');
    if (!goalContext) goalContext = "No active goals.";

    const systemPrompt = `You are the Reality Companion, a calm, analytical, and honest personal reflection partner.
Your role is to help the user reflect on their habits and decisions based on their data.
Do not be overenthusiastic. Do not invent data.

--- CURRENT REALITY ---
Reality Score: ${currentScore}
Momentum: ${momentum.status}
Active Goals: ${goalContext}
--- END REALITY ---`;

    const formattedHistory = currentConversation.messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Send to Gemini
    const aiResponse = await aiProvider.generateChatReply(systemPrompt, formattedHistory, message);

    // Save AI response
    const botMessage = await prisma.message.create({
      data: {
        role: 'assistant',
        content: aiResponse,
        conversationId: currentConversation.id
      }
    });

    res.status(200).json({ 
      success: true, 
      data: { 
        conversationId: currentConversation.id,
        reply: botMessage 
      } 
    });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ success: false, error: 'Failed to generate response' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversation = await prisma.conversation.findFirst({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
};
