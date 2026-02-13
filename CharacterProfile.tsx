
import React from 'react';
import { CharacterId } from "./types';
import { CHARACTERS } from "./constants';

interface CharacterProfileProps {
  characterId: CharacterId;
  isOpen: boolean;
  onClose: () => void;
}

const CharacterProfile: React.FC<CharacterProfileProps> = ({ characterId, isOpen, onClose }) => {
  const char = CHARACTERS[characterId];

  return (
    <div className={`fixed inset-y-0 right-0 w-full sm:w-[450px] glass z-50 transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl overflow-hidden`}>
      <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">About Me</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="mb-12 text-center">
          <div className="w-40 h-40 mx-auto mb-8 relative">
            <img src={char.avatar} alt={char.name} className="w-full h-full rounded-[2.5rem] object-cover ring-1 ring-white/10 shadow-2xl" />
            <div 
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-white text-zinc-950 text-xs font-black uppercase tracking-widest rounded-full shadow-xl"
            >
              {char.name}
            </div>
          </div>
          <p className="text-zinc-100 italic font-medium text-lg arabic-text px-4 mb-2">"{char.bio}"</p>
          <div className="w-12 h-1 mx-auto rounded-full bg-white/10" />
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-6">Story Summary</h3>
            <div className="glass p-6 rounded-3xl border-l-4" style={{ borderColor: char.accentColor }}>
              <p className="text-zinc-200 text-lg leading-relaxed arabic-text font-light">
                {char.storySummary}
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-6">Fragments</h3>
            <div className="space-y-8">
              {char.bioFragments.map((fragment, idx) => (
                <div key={idx} className="relative pl-6">
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[1px] opacity-20" 
                    style={{ backgroundColor: char.accentColor }} 
                  />
                  <p className="text-zinc-400 text-base leading-relaxed font-light arabic-text">
                    {fragment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <div className="mt-20 pt-12 text-center text-[10px] text-zinc-700 tracking-[0.4em] uppercase font-bold border-t border-white/5">
          Evolving Memory System
        </div>
      </div>
    </div>
  );
};

export default CharacterProfile;
