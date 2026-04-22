import { GoogleGenAI } from '@google/genai';

async function test() {
  console.log("Key:", process.env.GEMINI_API_KEY);
  try {
    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    console.log(response.text);
  } catch(e) {
    console.log("Error:", e);
  }
}
test();
