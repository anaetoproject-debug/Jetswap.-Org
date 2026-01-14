
import React, { useState, useMemo } from 'react';
import { Token, ThemeVariant } from '../types';
import { TOKENS } from '../constants';

interface TokenSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selected: Token;
  onSelect: (token: Token) => void;
  theme: ThemeVariant;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ isOpen, onClose, selected, onSelect, theme }) => {
  const [search, setSearch] = useState('');
  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  const filteredTokens = useMemo(() => {
    return TOKENS.filter(t => 
      t.symbol.toLowerCase().includes(search.toLowerCase()) || 
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const popularTokens = TOKENS.slice(0, 8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[450] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md h-[90vh] sm:h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-[40px] border transition-all overflow-hidden ${
        isDark ? 'bg-[#0B0F1A] border-white/10 text-white shadow-2xl' : 'bg-white border-gray-100 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Absolute Top Header - Search bar repositioned to occupy header space */}
        <div className="px-4 sm:px-6 pt-4 pb-2 shrink-0 z-20">
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex-1 flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition-all ${
              isDark ? 'bg-white/5 border-white/5 focus-within:border-blue-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-blue-500 shadow-inner'
            }`}>
              <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2.5}/>
              </svg>
              <input 
                autoFocus
                type="text" 
                placeholder="Search by name or paste address" 
                className="bg-transparent border-none outline-none w-full text-sm font-bold placeholder:opacity-40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={onClose} className={`p-2 rounded-xl transition-all border ${
              isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
            }`}>
              <svg className="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!search && (
            <div className="animate-[fadeIn_0.2s_ease-out]">
              <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] mb-2 px-1">Popular Assets</p>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {popularTokens.map(token => (
                  <button
                    key={token.symbol}
                    onClick={() => { onSelect(token); onClose(); }}
                    className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl border transition-all ${
                      selected.symbol === token.symbol 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                        : (isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-gray-300')
                    }`}
                  >
                    <img src={token.icon} className="w-3.5 h-3.5 rounded-full bg-white p-0.5 shrink-0" alt="" />
                    <span className="text-[10px] font-black">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Asset List - Tightened vertical padding and row spacing */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-0 custom-scrollbar overscroll-contain">
          <div className="space-y-1">
            {filteredTokens.map((token) => (
              <button
                key={token.symbol}
                onClick={() => { onSelect(token); onClose(); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all group ${
                  selected.symbol === token.symbol 
                    ? (isDark ? 'bg-blue-600/10 border border-blue-500/20 shadow-sm' : 'bg-blue-50 border border-blue-100')
                    : 'hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                    <img src={token.icon} alt={token.name} className="w-6 h-6 object-contain" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm tracking-tight leading-none mb-0.5">{token.symbol}</p>
                    <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest leading-none">{token.name}</p>
                  </div>
                </div>
                {selected.symbol === token.symbol && (
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            {filteredTokens.length === 0 && (
              <div className="py-20 text-center opacity-20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scanner: Zero Assets Found</p>
              </div>
            )}
          </div>
        </div>

        {/* Minimized Footer */}
        <div className={`px-4 py-3 border-t shrink-0 ${isDark ? 'bg-[#0F1420] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-[8px] font-bold opacity-30 text-center uppercase tracking-widest leading-relaxed">
            Decentralized Pricing Feeds Active.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default TokenSelector;
