
import React from 'react';
import { CHARACTERS } from './constants';
import { CharacterId } from './types';

interface CharacterListProps {
  activeId: CharacterId;
  onSelect: (id: CharacterId) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ activeId, onSelect }) => {
  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full custom-scrollbar">
      {Object.values(CHARACTERS).map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          className={`relative group flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${
            activeId === char.id 
              ? 'bg-white/10 ring-1 ring-white/20 shadow-lg shadow-white/5' 
              : 'hover:bg-white/5 opacity-60 hover:opacity-100'
          }`}
        >
          <div className="relative w-14 h-14 flex-shrink-0">
            <img 
              src={char.avatar} 
              alt={char.name} 
              className="w-full h-full object-cover rounded-2xl transition-all"
            />
            {activeId === char.id && (
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#09090b] shadow-xl" 
                style={{ backgroundColor: char.accentColor }}
              />
            )}
          </div>
          <div className="text-left overflow-hidden">
            <h3 className={`font-bold text-lg tracking-tight ${activeId === char.id ? 'text-white' : 'text-zinc-400'}`}>
              {char.name}
            </h3>
            <p className="text-xs text-zinc-500 truncate font-light arabic-text">{char.bio}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CharacterList;
