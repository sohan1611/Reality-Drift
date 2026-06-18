const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI services will fail over to defaults.");
    }
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    
    // Model fallback chain: primary flash, secondary flash, emergency pro
    this.modelChain = [
      "gemini-3.5-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest",
      "gemini-pro-latest"
    ];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateChatReply(systemPrompt, history, currentMessage) {
    try {
      if (!this.genAI) throw new Error("AIProvider: API key missing.");
      const model = this.genAI.getGenerativeModel({ model: this.modelChain[0] || "gemini-3.5-flash" });
      
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt + "\n\nAcknowledge these instructions and reply only with 'Ready.' if this is the start of the conversation, otherwise ignore this." }] },
          { role: 'model', parts: [{ text: 'Ready.' }] },
          ...history
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      const result = await chat.sendMessage(currentMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Provider Chat Error:", error);
      return "I am having trouble connecting to my cognitive cores right now. Let's try again in a moment.";
    }
  }

  async generateWithRetry(prompt, isJson = true) {
    if (!this.genAI) {
      throw new Error("AIProvider: API key missing.");
    }

    const maxRetries = 2; // For transient network errors like 429
    let allErrors = [];

    for (const modelName of this.modelChain) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: modelName,
          ...(isJson && { generationConfig: { responseMimeType: "application/json" } })
        });

        // Try the current model up to maxRetries times with exponential backoff
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            const result = await Promise.race([
              model.generateContent(prompt),
              new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), 9000))
            ]);
            return result.response.text();
          } catch (error) {
            console.error(`AIProvider Error on ${modelName} (attempt ${attempt + 1}):`, error.message);
            
            if (attempt === maxRetries) {
              allErrors.push(`[${modelName}]: ${error.message}`);
            }

            // If it's a 404 (model not found) or 400 (bad request), don't retry the same model
            if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('400')) {
              if (attempt < maxRetries) allErrors.push(`[${modelName}]: ${error.message}`);
              break; 
            }

            // Retry for timeouts, 429 rate limits, 500, 503
            if (attempt < maxRetries) {
              const backoff = Math.pow(2, attempt) * 1000;
              await this.sleep(backoff);
            }
          }
        }
      } catch (modelError) {
        allErrors.push(`[${modelName} Setup]: ${modelError.message}`);
        console.error(`AIProvider Setup Error on ${modelName}:`, modelError.message);
      }
      console.warn(`Falling back from ${modelName} to next model in chain...`);
    }

    // If we exhaust the entire chain, throw the accumulated errors
    const errorLog = allErrors.join(' | ');
    throw new Error(`All fallback models exhausted. Errors: ${errorLog}`);
  }
}

module.exports = new AIProvider();
