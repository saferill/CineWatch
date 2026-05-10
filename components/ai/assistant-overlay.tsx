"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { IconRobot, IconSend, IconX, IconVideo, IconPlayerPlay } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAssistantOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Halo! Aku CineWatch AI. Mau cari tontonan apa hari ini? Tanyakan apa saja, misal: "film horor yang gak terlalu seram" atau "series tentang politik".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Create a temporary message for the assistant
    const assistantMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages,
          pageContext: {
            url: window.location.href,
            title: document.title
          }
        }),
      });
      
      if (!res.ok) throw new Error('AI Error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices[0].delta?.content || '';
                fullContent += delta;
                
                // Update the last message
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[assistantMsgIndex].content = fullContent;
                  return newMsgs;
                });
              } catch (e) {
                // Ignore parse errors for partial chunks
              }
            }
          }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[assistantMsgIndex].content = 'Gagal terhubung ke AI.';
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] p-4 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20 group-hover:hidden" />
        <IconRobot className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-[9999] w-[90vw] sm:w-[400px] h-[500px] glass rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-accent/10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                   <IconVideo className="w-4 h-4 text-white" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-white">CineWatch Assistant</h3>
                   <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] text-zinc-500 font-medium">Online & Smart</span>
                   </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500">
                <IconX className="w-5 h-5" />
              </button>
            </div>

             {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-black/20">
               {messages.map((m, idx) => {
                 // Smart Parser for Recommendation Cards
                 const cleanContent = m.content.replace(/\[\[REK:.*?\]\]/g, '');
                 const rekMatches = Array.from(m.content.matchAll(/\[\[REK:(.*?):(.*?):(.*?):(.*?)\]\]/g));

                 return (
                   <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {cleanContent && (
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          m.role === 'user' 
                            ? 'bg-accent text-accent-foreground rounded-tr-none' 
                            : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-white/5 backdrop-blur-md'
                        }`}>
                           {cleanContent}
                        </div>
                      )}
                      
                      {rekMatches.length > 0 && (
                        <div className="flex flex-col gap-3 mt-3 w-full max-w-[280px]">
                           {rekMatches.map((match, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                              >
                                 <Link href={`/${match[2] === 'movie' ? 'movie' : 'series'}/${match[1]}`} className="block">
                                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-zinc-800">
                                       <img 
                                         src={`https://image.tmdb.org/t/p/w500${match[4]}`} 
                                         alt={match[3]}
                                         className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                         onError={(e) => {
                                           (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500'
                                         }}
                                       />
                                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                       <div className="absolute bottom-0 left-0 p-3">
                                          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Recommended</p>
                                          <p className="text-xs font-bold text-white truncate">{match[3]}</p>
                                       </div>
                                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                                             <IconPlayerPlay className="w-5 h-5 text-accent-foreground" fill="currentColor" />
                                          </div>
                                       </div>
                                    </div>
                                 </Link>
                              </motion.div>
                           ))}
                        </div>
                      )}
                   </div>
                 );
               })}
               {loading && (
                  <div className="flex justify-start">
                     <div className="bg-zinc-900/50 p-4 rounded-2xl rounded-tl-none border border-white/5 backdrop-blur-xl w-full max-w-[280px]">
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-accent">Collaboration in Progress</p>
                           </div>
                           
                           <div className="space-y-2">
                              {[
                                { agent: 'Scout', task: 'Scanning TMDB Global 2026...', delay: 0 },
                                { agent: 'Critic', task: 'Evaluating Mood & Narrative...', delay: 0.8 },
                                { agent: 'Stream', task: 'Checking Ultra-Fast Nodes...', delay: 1.6 },
                                { agent: 'Manager', task: 'Finalizing Smart Choice...', delay: 2.4 }
                              ].map((item, i) => (
                                <motion.div 
                                  key={i}
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: item.delay }}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">
                                    <span className="text-accent/70">[{item.agent}]</span> {item.task}
                                  </p>
                                </motion.div>
                              ))}
                           </div>

                           <div className="flex gap-1 pt-2">
                              <span className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                              <span className="w-1 h-1 bg-accent rounded-full animate-bounce delay-100" />
                              <span className="w-1 h-1 bg-accent rounded-full animate-bounce delay-200" />
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Input */}
            <div className="p-4 bg-black/40 border-t border-white/5">
               <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Tanya CineWatch..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-hidden focus:border-accent transition-colors"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="p-2 rounded-xl bg-accent text-accent-foreground disabled:opacity-50 disabled:scale-100 active:scale-90 transition-all"
                  >
                    <IconSend className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
