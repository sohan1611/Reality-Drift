require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.5-flash-latest"];
  
  for (const m of models) {
    console.log("Testing:", m);
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say 'hello'");
      console.log("SUCCESS:", m, result.response.text());
    } catch (e) {
      console.log("FAILED:", m, e.message);
    }
  }
}
check();
