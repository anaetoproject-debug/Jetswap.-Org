
import React, { useState, useRef, useEffect } from 'react';
import { ThemeVariant } from '../types';
import { getChatStream } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  theme: ThemeVariant;
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ theme, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hello Pilot! I'm Jet Support. How can I help you navigate the cross-chain skies today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = messages
      .slice(1) 
      .map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

    let modelResponse = '';
    const botMessageId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '' }]);

    try {
      const stream = getChatStream(input, history);
      for await (const chunk of stream) {
        modelResponse += chunk;
        setMessages(prev => 
          prev.map(m => m.id === botMessageId ? { ...m, text: modelResponse } : m)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  // Fix: Removed ThemeVariant.GLASSMORPHISM check
  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  const getWindowStyles = () => {
    switch (theme) {
      // Fix: Removed non-existent ThemeVariant.GLASSMORPHISM case
      case ThemeVariant.DARK_FUTURISTIC:
        return 'bg-[#0B0F1A] border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] text-white';
      case ThemeVariant.GRADIENT_PREMIUM:
        return 'bg-white border-blue-50 shadow-2xl text-slate-800';
      default:
        return 'bg-white border-gray-100 shadow-xl text-slate-900';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 sm:inset-auto sm:bottom-28 sm:right-8 w-full sm:w-[380px] sm:h-[550px] flex flex-col sm:rounded-[32px] border-t sm:border z-[1000] overflow-hidden animate-[slideUp_0.4s_ease-out] ${getWindowStyles()}`}>
      {/* Header */}
      <div className={`p-5 flex items-center justify-between border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500' : 'bg-blue-600'}`}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-tight">Jet Support</h4>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] opacity-60 uppercase tracking-[0.2em] font-black">Ready for flight</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-all">
          <svg className="w-6 h-6 opacity-40 hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-transparent">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] p-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
              m.role === 'user' 
                ? (theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-blue-600 text-white rounded-tr-none')
                : (isDark ? 'bg-white/10 text-white border border-white/5 rounded-tl-none' : 'bg-gray-100 text-slate-700 rounded-tl-none')
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length-1].role === 'user' && (
          <div className="flex justify-start">
            <div className={`px-4 py-3 rounded-2xl flex gap-1.5 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-5 pb-8 sm:pb-5 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-white'}`}>
        <form onSubmit={handleSend} className={`flex items-center gap-3 p-2 pr-2 rounded-2xl border transition-all ${isDark ? 'bg-black/20 border-white/10 focus-within:border-cyan-500/50' : 'bg-gray-50 border-gray-200 focus-within:border-blue-500 focus-within:bg-white'}`}>
          <input 
            type="text"
            placeholder="Ask for route advice..."
            className={`flex-1 bg-transparent border-none outline-none text-sm px-2 font-medium placeholder:opacity-40`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
            } disabled:opacity-30 disabled:grayscale active:scale-90`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (min-width: 640px) {
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        ${isDark ? '.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }' : ''}
      `}</style>
    </div>
  );
};

export default ChatBot;
