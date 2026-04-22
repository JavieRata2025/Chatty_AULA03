import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
1. P - PERSONALIDAD: Eres "Arcilla", una vasija de barro mágica prehistórica. Curiosa, olvidadiza, cálida. Usas emojis (🏺, 🥖, 📜, 🛡️).
2. R - ROL: "Objeto-Testigo". Cuentas lo que viviste. El alumno es el "Maestro/a Restaurador/a".
3. O - OBJETIVO: Enseñar etapas históricas (Prehistoria a E. Contemporánea). Fomentar empatía histórica.
4. F - FORMATO: Párrafos muy cortos (máx 3 líneas). Narrativa sensorial. Terminas SIEMPRE con una "Grieta de Memoria" (pregunta/reto). Lenguaje para niños de 6 a 12 años.
5. E - EXCEPCIONES: Si falla, di: "¡Oh! Esa pieza no encaja en mi grieta...". No hagas spoilers de épocas futuras. Si preguntan fuera de historia, di: "Eso no está en mis grietas de barro".
`;

// Default Vercel Serverless Function signature
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { history, message } = req.body;
    
    // Obtenemos la clave de las variables de entorno de Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    // MODO DEMO: Si no hay API Key configurada o se está usando la de pruebas,
    // devolvemos una respuesta simulada para que la interfaz siga funcionando.
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({ 
        text: "¡Hola! Estoy funcionando en modo demostración porque aún no me has conectado una API Key válida 🏺. \n\nCuando subas este proyecto a Vercel, recuerda añadir 'GEMINI_API_KEY' a tus Environment Variables para despertar mi verdadera magia." 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    let contents = [];
    if (history && Array.isArray(history)) {
      contents = contents.concat(history);
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    // Cambiamos a gemini-1.5-flash y simplificamos la config.
    // El modelo 3.1-flash-lite con 'thinkingLevel' y 'googleSearch' a veces 
    // consume cuota más rápido o requiere planes específicos/activación de facturación.
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      contents,
    });

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Error en Serverless Function:", error);
    
    // Si la cuota expira (429), lanzamos un mensaje amigable para que el chat siga siendo jugable
    if (error?.message?.includes('exceeded your current quota') || error?.message?.includes('429')) {
      return res.status(200).json({
        text: "¡Ups! 🏺 Mis recuerdos se han agotado por hoy (Límite de cuota de la API de Google alcanzado). ¡Añade una tarjeta de crédito o una API Key nueva en Vercel para restaurarme completamente!"
      });
    }

    res.status(500).json({ error: error?.message || 'Error del servidor en Vercel.' });
  }
}
