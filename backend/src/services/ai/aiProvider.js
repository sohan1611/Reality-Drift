const { GoogleGenerativeAI } = require("@google/generative-ai");

class AIProvider {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI services will fail over to defaults.");
    }
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    
    // Model fallback chain: primary, secondary, emergency
    this.modelChain = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-pro-latest"
    ];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateWithRetry(prompt, isJson = true) {
    if (!this.genAI) {
      throw new Error("AIProvider: API key missing.");
    }

    const maxRetries = 2; // For transient network errors like 429
    let lastError = null;

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
              new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), 9000)) // 9s timeout to prevent Vercel 10s kill
            ]);
            return result.response.text();
          } catch (error) {
            lastError = error;
            console.error(`AIProvider Error on ${modelName} (attempt ${attempt + 1}):`, error.message);
            
            // If it's a 404 (model not found) or 400 (bad request), don't retry the same model, jump to next model
            if (error.message.includes('404') || error.message.includes('not found') || error.message.includes('400')) {
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
        lastError = modelError;
        console.error(`AIProvider Setup Error on ${modelName}:`, modelError.message);
      }
      console.warn(`Falling back from ${modelName} to next model in chain...`);
    }

    // If we exhaust the entire chain, throw the final error
    throw new Error(`All models failed. Last error: ${lastError ? lastError.message : "Unknown"}`);
  }
}

module.exports = new AIProvider();
