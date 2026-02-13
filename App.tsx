
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, CharacterId, Message, User } from './types';
import { CHARACTERS } from './constants';
import { getCharacterResponse, translateMessage } from './geminiService';
import CharacterList from './CharacterList';
import ChatWindow from './ChatWindow';
import CharacterProfile from './CharacterProfile';
import Auth from './Auth';
import Dashboard from './Dashboard';

const STORAGE_KEY = 'my_friend_app_state_v2';

const INITIAL_STATE: AppState = {
  currentUser: null,
  activeCharacterId: 'omar',
  chats: {
    omar: { history: [], memory: '', lastDailyMessageTime: 0 },
    salma: { history: [], memory: '', lastDailyMessageTime: 0 },
    youssef: { history: [], memory: '', lastDailyMessageTime: 0 },
    layla: { history: [], memory: '', lastDailyMessageTime: 0 },
  },
  language: 'ar',
  isProfileOpen: false,
  isAdminDashboardOpen: false,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const triggerCharacterResponse = async (
    charId: CharacterId, 
    userInput: string, 
    isProactive: boolean = false
  ) => {
    if (isLoading) return; 
    setIsLoading(true);
    try {
      const charState = state.chats[charId];
      const aiText = await getCharacterResponse(charId, charState.history, userInput, isProactive);
      
      let translatedText: string | undefined;
      if (state.language === 'en') {
        await new Promise(r => setTimeout(r, 500));
        translatedText = await translateMessage(aiText, 'en');
      }

      const newMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        sender: charId,
        text: aiText,
        translatedText,
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [charId]: {
            ...prev.chats[charId],
            history: [...prev.chats[charId].history, newMessage],
            lastDailyMessageTime: Date.now()
          }
        }
      }));
    } catch (error: any) {
      console.error("AI Error:", error);
      const isQuota = error.message?.includes('429') || error.status === 429 || error.message?.includes('quota');
      setErrorToast(isQuota ? "Daily limit reached. Please wait a few minutes." : "Network error. Re-trying...");
      setTimeout(() => setErrorToast(null), 6000);
    } finally {
      setIsLoading(false);
    }
  };

  // Proactive Messaging Logic
  useEffect(() => {
    if (!state.currentUser || isLoading) return;

    const checkDailyMessage = async () => {
      const now = Date.now();
      const chars = Object.keys(CHARACTERS) as CharacterId[];
      
      // Look for any character that needs a daily message
      const charIdToPoke = chars.find(charId => {
        const charState = state.chats[charId];
        // Condition: No history OR 24 hours passed since last AI response or proactive message
        return charState.history.length === 0 || (now - charState.lastDailyMessageTime > 86400000);
      });

      if (charIdToPoke) {
        await triggerCharacterResponse(charIdToPoke, '', true);
      }
    };

    const interval = setInterval(checkDailyMessage, 60000); // Check once a minute
    checkDailyMessage(); // Check on mount
    return () => clearInterval(interval);
  }, [state.currentUser, isLoading, state.chats]); // Re-run when chats update to catch the next char

  const handleSendMessage = async (text: string) => {
    if (!state.currentUser || isLoading) return;
    const charId = state.activeCharacterId;
    
    let originalInput = text;
    let translatedInput: string | undefined;

    if (state.language === 'en') {
      translatedInput = text;
      try {
        originalInput = await translateMessage(text, 'ar');
      } catch (e) {
        console.warn("Translation failed, using original English");
      }
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: originalInput,
      translatedText: translatedInput,
      timestamp: Date.now(),
    };

    const savedUsers = JSON.parse(localStorage.getItem('my_friend_users') || '[]');
    const userIdx = savedUsers.findIndex((u: User) => u.username === state.currentUser?.username);
    if (userIdx !== -1) {
      savedUsers[userIdx].messageCount = (savedUsers[userIdx].messageCount || 0) + 1;
      localStorage.setItem('my_friend_users', JSON.stringify(savedUsers));
    }

    setState(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [charId]: {
          ...prev.chats[charId],
          history: [...prev.chats[charId].history, userMessage]
        }
      }
    }));

    await triggerCharacterResponse(charId, originalInput);
  };

  const handleToggleLanguage = async () => {
    const newLang = state.language === 'ar' ? 'en' : 'ar';
    if (isLoading) return;
    setIsLoading(true);
    
    let updatedChats = { ...state.chats };
    if (newLang === 'en') {
      const charId = state.activeCharacterId;
      const history = [...state.chats[charId].history];
      const newHistory: Message[] = [];
      
      for (const m of history) {
        if (!m.translatedText) {
          try {
            await new Promise(r => setTimeout(r, 800)); 
            const trans = await translateMessage(m.text, 'en');
            newHistory.push({ ...m, translatedText: trans });
          } catch (e) {
            newHistory.push(m);
          }
        } else {
          newHistory.push(m);
        }
      }
      
      updatedChats[charId] = { ...state.chats[charId], history: newHistory };
    }

    setState(prev => ({ 
      ...prev, 
      language: newLang,
      chats: updatedChats
    }));
    setIsLoading(false);
  };

  const activeChar = CHARACTERS[state.activeCharacterId];

  if (!state.currentUser) {
    return <Auth onLogin={(user) => setState(prev => ({ ...prev, currentUser: user }))} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-white selection:text-zinc-950">
      {state.isAdminDashboardOpen && <Dashboard onClose={() => setState(prev => ({ ...prev, isAdminDashboardOpen: false }))} />}
      
      <aside className="w-20 md:w-80 border-r border-white/5 flex flex-col glass z-10 transition-all duration-500">
        <div className="p-6 border-b border-white/5 flex items-center justify-center md:justify-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
            <div className="w-5 h-5 rounded-lg bg-zinc-950" />
          </div>
          <div className="hidden md:block">
            <h1 className="font-black text-2xl tracking-tighter">My Friend</h1>
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] -mt-1">Free Chat With Friends</p>
          </div>
        </div>
        
        <CharacterList 
          activeId={state.activeCharacterId}
          onSelect={(id) => setState(prev => ({ ...prev, activeCharacterId: id }))}
        />

        <div className="mt-auto p-4 border-t border-white/5 space-y-3">
          <div className="flex gap-2">
            <button 
              onClick={handleToggleLanguage}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center md:justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group disabled:opacity-50"
            >
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">Language</span>
              <span className="text-xs font-black text-white uppercase">{state.language}</span>
            </button>
            {state.currentUser.role === 'admin' && (
              <button 
                onClick={() => setState(prev => ({ ...prev, isAdminDashboardOpen: true }))}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 border border-violet-600/20 transition-all"
                title="Admin Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              </button>
            )}
          </div>
          <button 
             onClick={() => setState(prev => ({ ...prev, currentUser: null }))}
             className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="hidden md:block">Logout ({state.currentUser.username})</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {errorToast && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-600/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 font-bold text-sm border border-white/10">
            {errorToast}
          </div>
        )}

        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 glass z-10 transition-all">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => setState(prev => ({ ...prev, isProfileOpen: true }))}>
                <img src={activeChar.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-white/20 transition-all shadow-xl" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950" style={{ backgroundColor: activeChar.accentColor }} />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-2xl tracking-tighter leading-none">{activeChar.name}</h2>
              <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold arabic-text">{activeChar.bio}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setState(prev => ({ ...prev, isProfileOpen: true }))}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-[10px] font-black tracking-widest uppercase shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="hidden sm:inline">Profile</span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <ChatWindow 
            characterId={state.activeCharacterId}
            messages={state.chats[state.activeCharacterId].history}
            onSendMessage={handleSendMessage}
            language={state.language}
          />
          {isLoading && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full glass flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Typing</span>
            </div>
          )}
        </div>
      </main>

      <CharacterProfile 
        characterId={state.activeCharacterId}
        isOpen={state.isProfileOpen}
        onClose={() => setState(prev => ({ ...prev, isProfileOpen: false }))}
      />
    </div>
  );
};

export default App;
