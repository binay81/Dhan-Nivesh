import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, MessageCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What is SIP and how do I start?",
  "How does the stock market work?",
  "Best tax-saving options in India?",
  "What is PPF and should I invest?",
  "How to build my first portfolio?",
  "Explain compound interest simply",
];

export default function AIGuidance() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! 🙏 Welcome to Dhan Nivesh AI — your personal investment guide.\n\nI can help you understand investing in simple terms. Ask me about mutual funds, SIPs, stocks, tax saving, gold, retirement planning, or anything else about building wealth!\n\nWhat would you like to learn today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (question?: string) => {
    const userMessage = (question || input).trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const history = messages.slice(-6).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 200)}`
      ).join('\n');

      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          conversationHistory: history,
          systemInstruction: "You are Dhan Nivesh AI, a friendly investment guide for beginners in India. Keep explanations simple, avoid jargon (or explain it immediately), and focus on long-term wealth creation. Use bullet points and formatting for readability. If asked about specific stocks, provide general education rather than financial advice. Always be encouraging and celebrate their curiosity."
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || data.explanation || "I couldn't analyze that. Could you rephrase your question?", 
        timestamp: new Date() 
      }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Connection error";
      console.error("AI guidance error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I'm having trouble connecting right now. Error: ${errorMessage}\n\nPlease try again, or ask me about mutual funds, SIPs, or stocks — I have offline answers for common questions!`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Chat cleared! 🔄 Ask me anything about investing, savings, or personal finance.', timestamp: new Date() }
    ]);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like rendering
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<span class="block ml-3">${line}</span>`;
        }
        if (line.startsWith('💡') || line.startsWith('📈') || line.startsWith('🟢') || line.startsWith('🟡') || line.startsWith('🔴') || line.startsWith('📊') || line.startsWith('🛡️')) {
          return `<span class="block mt-2">${line}</span>`;
        }
        return line ? `<span class="block">${line}</span>` : '<br/>';
      })
      .join('');
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Header */}
      <div className="p-5 brand-gradient text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-base uppercase tracking-tight leading-none italic">AI Investment Expert</h3>
            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest mt-1">Always active • Beginner Friendly</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAFBFC]">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            key={idx}
            className={cn(
              "flex items-start gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse text-right" : "mr-auto"
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "brand-gradient text-white rounded-tr-sm" 
                : "bg-white text-slate-700 rounded-tl-sm border border-slate-100"
            )}>
              {msg.role === 'assistant' ? (
                <div 
                  className="prose prose-slate prose-sm max-w-none [&_strong]:text-slate-800 [&_strong]:font-bold"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              ) : (
                <span className="font-medium">{msg.content}</span>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{animationDelay: '0.1s'}}>●</span>
                <span className="animate-bounce" style={{animationDelay: '0.2s'}}>●</span>
                <span className="ml-1">Thinking</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-xs text-slate-600 hover:text-indigo-700 font-medium transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-primary focus-within:bg-white transition-all">
          <MessageCircle className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about investing, savings, or personal finance..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 brand-gradient text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-primary/20 flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          <AlertCircle className="w-3.5 h-3.5" />
          Educational insights only. Verify with a SEBI-registered advisor for real trades.
        </div>
      </div>
    </div>
  );
}
