/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';

type Message = {
  id: string;
  sender: 'user' | 'bot';
  text: string;
};

type HistoryMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<HistoryMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial bot message
    setMessages([
      {
        id: 'initial',
        sender: 'bot',
        text: "¡Hola, Maestro/a Restaurador/a! Soy Arcilla 🏺. Mis grietas guardan miles de años de historias, pero mi memoria está un poco desordenada. ¿En qué época histórica quieres que empecemos a excavar?",
      },
    ]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages or isTyping changes
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMsgId = Date.now().toString();
    const newMessages = [...messages, { id: userMsgId, sender: 'user' as const, text }];
    
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: chatHistory,
          message: text,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Network response was not ok');
      }

      const data = await response.json();

      setChatHistory([
        ...chatHistory,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: data.text }] },
      ]);

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'bot', text: data.text },
      ]);
    } catch (error) {
      console.error('Error communicando con el oráculo:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `¡Ay! 🌪️ Parece que hay una avería: **${error.message}**`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-fondo text-texto font-body overflow-hidden">
      <header className="bg-white border-b-[3px] border-borde py-6 px-8 shadow-sm z-10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#fff9f0] border-[3px] border-primario rounded-full flex items-center justify-center text-3xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
            🏺
          </div>
          <div>
            <h1 className="font-titulo text-2xl text-primario tracking-[0.05em] uppercase">
              Arcilla
            </h1>
            <p className="text-[0.7rem] text-secundario font-bold uppercase tracking-[0.2em] mt-1">
              Memoria de Barro
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-4 text-[0.8rem] font-bold items-center">
          <span className="text-primario uppercase">Maestro Restaurador</span>
          <span className="opacity-30">•</span>
          <span className="uppercase">Museo Virtual</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block border-r-2 border-borde p-8 bg-[#e6ccb233] overflow-y-auto">
          <div className="text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-secundario mb-6">
            Línea del Tiempo
          </div>
          <div className="bg-[#fffaf5] p-4 rounded-xl border-2 border-primario mb-4 cursor-pointer transition-transform">
            <h3 className="text-[0.9rem] mb-1 font-bold">Prehistoria</h3>
            <p className="text-[0.75rem] opacity-70">El despertar del fuego</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-borde mb-4 cursor-pointer hover:border-primario transition-transform">
            <h3 className="text-[0.9rem] mb-1 font-bold">Egipto Antiguo</h3>
            <p className="text-[0.75rem] opacity-70">Las sombras del Nilo</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-2 border-borde mb-4 cursor-pointer hover:border-primario transition-transform">
            <h3 className="text-[0.9rem] mb-1 font-bold">Roma Imperial</h3>
            <p className="text-[0.75rem] opacity-70">Mármol y legiones</p>
          </div>
        </aside>

        <main
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col relative scroll-smooth"
          style={{
            backgroundImage: 'radial-gradient(var(--color-borde) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            } animate-fade-in`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] p-5 text-[1.05rem] leading-[1.5] rounded-[1.5rem] relative ${
                msg.sender === 'user' 
                  ? 'bg-primario text-white rounded-br-sm shadow-[-6px_6px_0px_var(--color-secundario)]' 
                  : 'bg-white border-2 border-borde rounded-bl-sm shadow-[6px_6px_0px_var(--color-borde)]'
              }`}
            >
              {msg.sender === 'user' ? (
                // Keep user messages plain text as they shouldn't contain markdown formatting typically, or it's fine.
                <div className="whitespace-pre-wrap">{msg.text}</div>
              ) : (
                <div className="max-w-none text-current">
                   <Markdown components={{
                     p: ({node, ...props}) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                     strong: ({node, ...props}) => <strong className="font-bold font-titulo" {...props} />,
                     br: ({node, ...props}) => <br {...props} />
                   }}>{msg.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="mb-2 transition-all duration-300 animate-fade-in pl-2">
            <div className="flex items-center gap-2 text-secundario text-[0.9rem] italic font-semibold">
              <span>🏺 Arcilla está recordando...</span>
              <span className="dot-typing">.</span>
              <span className="dot-typing delay-200">.</span>
              <span className="dot-typing delay-400">.</span>
            </div>
          </div>
        )}
        </main>
      </div>

      <footer className="bg-white border-t-[3px] border-borde px-8 py-6 z-10 shrink-0">
        <div className="max-w-[800px] mx-auto flex gap-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Responde a Arcilla o hazle una pregunta..."
            className="flex-1 px-6 py-4 rounded-2xl border-2 border-[#eee] bg-[#fafafa] focus:bg-white focus:border-primario outline-none transition-colors duration-300 text-base disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            className="bg-primario text-white px-8 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:bg-orange-700 transition-colors"
          >
            ENVIAR 🏺
          </button>
        </div>
        <div className="text-center text-[0.7rem] text-secundario mt-3 font-bold uppercase tracking-[0.1em]">
          Conexión Segura vía Vercel Edge Functions • Beta 1.0.4
        </div>
      </footer>
    </div>
  );
}
