import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const SYSTEM_PROMPT = `Test prompt`;

    const config: any = {
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: {
        thinkingLevel: 'LOW',
      },
      tools: [
        {
          googleSearch: {}
        }
      ],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      config,
      contents: [{ role: 'user', parts: [{ text: "hola" }] }],
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("SDK Error:", e);
  }
}

test();
