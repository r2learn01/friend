
import React, { useState, useRef, useEffect } from 'react';
import { CharacterId, Message } from "./types';
import { CHARACTERS } from "./constants';

interface ChatWindowProps {
  characterId: CharacterId;
  messages: Message[];
  onSendMessage: (text: string) => void;
  language: 'ar' | 'en';
}

const ChatWindow: React.FC<ChatWindowProps> = ({ characterId, messages, onSendMessage, language }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const char = CHARACTERS[characterId];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            <div 
              className={`max-w-[80%] md:max-w-[60%] p-4 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-white text-zinc-950 rounded-tr-none' 
                  : 'glass text-zinc-100 rounded-tl-none border-l-2'
              }`}
              style={msg.sender !== 'user' ? { borderColor: char.accentColor } : {}}
            >
              <p className={`text-lg leading-relaxed ${language === 'ar' ? 'arabic-text' : ''}`}>
                {(language === 'en' && msg.translatedText) ? msg.translatedText : msg.text}
              </p>
              <div className="mt-2 flex items-center justify-between opacity-40 text-[10px] font-medium tracking-widest uppercase">
                <span>{msg.sender === 'user' ? 'YOU' : char.name}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6">
        <form 
          onSubmit={handleSubmit}
          className="relative glass rounded-2xl p-2 flex items-center focus-within:ring-1 ring-white/20 transition-all"
        >
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'ar' ? 'اكتب حاجة...' : 'Say something...'}
            className={`flex-1 bg-transparent px-4 py-3 outline-none text-zinc-100 placeholder:text-zinc-600 ${language === 'ar' ? 'arabic-text' : ''}`}
          />
          <button 
            type="submit"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
