require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models
        .filter(m => m.name.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent"))
        .slice(0, 20)
        .forEach(m => console.log(m.name));
    } else {
      console.log("ERROR:", data);
    }
  } catch (e) {
    console.log("FETCH ERROR:", e.message);
  }
}
list();
