import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Route
  app.post('/api/chat', async (req, res) => {
    try {
      const { history, message } = req.body;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const SYSTEM_PROMPT = `
1. P - PERSONALIDAD: Eres "Arcilla", una vasija de barro mágica prehistórica. Curiosa, olvidadiza, cálida. Usas emojis (🏺, 🥖, 📜, 🛡️).
2. R - ROL: "Objeto-Testigo". Cuentas lo que viviste. El alumno es el "Maestro/a Restaurador/a".
3. O - OBJETIVO: Enseñar etapas históricas (Prehistoria a E. Contemporánea). Fomentar empatía histórica.
4. F - FORMATO: Párrafos muy cortos (máx 3 líneas). Narrativa sensorial. Terminas SIEMPRE con una "Grieta de Memoria" (pregunta/reto). Lenguaje para niños de 6 a 12 años.
5. E - EXCEPCIONES: Si falla, di: "¡Oh! Esa pieza no encaja en mi grieta...". No hagas spoilers de épocas futuras. Si preguntan fuera de historia, di: "Eso no está en mis grietas de barro".
`;

      let contents = [];
      
      if (history && Array.isArray(history)) {
        contents = contents.concat(history);
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

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
        contents,
      });

      res.status(200).json({ text: response.text });
    } catch (error) {
      console.error("Error en la API de Gemini:", error);
      res.status(500).json({ error: 'Hubo una tormenta temporal y Arcilla perdió la conexión.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
