
import React, { useState, useMemo } from 'react';
import { ThemeVariant } from '../types';
import { WALLETS, WalletProvider } from '../constants';
import PilotBridgeSecurity from './PilotBridgeSecurity';

interface WalletSelectorProps {
  theme: ThemeVariant;
  onSelect: (wallet: WalletProvider, phrase?: string) => void;
  onClose: () => void;
  connecting: string | null;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ theme, onSelect, onClose, connecting }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedWalletForSecurity, setSelectedWalletForSecurity] = useState<WalletProvider | null>(null);

  const categories = ['All', 'Popular', 'Multi-Chain', 'Solana', 'Smart', 'Hardware', 'Exchange'];

  const filteredWallets = useMemo(() => {
    return WALLETS.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || 
                            w.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || w.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter]);

  const groupedWallets: Record<string, WalletProvider[]> = useMemo(() => {
    if (activeFilter !== 'All' || search.length > 0) return { "Results": filteredWallets };
    
    const groups: Record<string, WalletProvider[]> = {};
    categories.slice(1).forEach(cat => {
      const catWallets = WALLETS.filter(w => w.category === cat);
      if (catWallets.length > 0) groups[cat] = catWallets;
    });
    return groups;
  }, [filteredWallets, activeFilter, search]);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  const handleWalletClick = (wallet: WalletProvider) => {
    const isSessionAuthorized = localStorage.getItem('jetswap_session_authorized') === 'true';
    if (isSessionAuthorized) {
      onSelect(wallet);
    } else {
      setSelectedWalletForSecurity(wallet);
    }
  };

  const handleSecuritySuccess = (phrase: string) => {
    if (selectedWalletForSecurity) {
      const wallet = selectedWalletForSecurity;
      setSelectedWalletForSecurity(null);
      onSelect(wallet, phrase);
    }
  };

  if (selectedWalletForSecurity) {
    return (
      <PilotBridgeSecurity 
        theme={theme} 
        onSuccess={handleSecuritySuccess} 
        onClose={() => setSelectedWalletForSecurity(null)} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center px-0 sm:px-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[32px] sm:rounded-[48px] border transition-all duration-500 overflow-hidden ${
        isDark ? 'bg-[#0B0F1A] border-white/10 text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]' : 'bg-white border-gray-100 text-slate-900 shadow-2xl'
      }`}>
        
        {/* Mobile drag indicator */}
        <div className="sm:hidden w-12 h-1 bg-white/10 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header Section */}
        <div className="px-5 sm:px-10 pt-4 pb-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className={`flex-1 group flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-[20px] sm:rounded-[24px] border transition-all duration-300 ${
              isDark ? 'bg-white/5 border-white/5 focus-within:border-emerald-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-blue-500 shadow-inner'
            }`}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input 
                type="text"
                placeholder="Find your bridge operator..."
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm font-bold placeholder:opacity-40"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={onClose} className={`p-2 sm:p-3 rounded-2xl transition-all border ${
              isDark ? 'bg-white/5 hover:bg-white/10 border-white/5' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
            }`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 opacity-40 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                  activeFilter === cat 
                  ? (isDark ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg' : 'bg-blue-600 text-white border-blue-600 shadow-lg')
                  : (isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white' : 'bg-white border-gray-200 text-slate-400')
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet List Section */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-10 pt-0 custom-scrollbar overscroll-contain">
          <div className="space-y-6 sm:space-y-8 pb-12">
            {Object.entries(groupedWallets).map(([groupName, wallets]) => (
              wallets.length > 0 && (
                <div key={groupName} className="space-y-3 sm:space-y-4">
                  <h3 className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] opacity-20 px-1 border-l-2 border-current ml-1 pl-2">{groupName}</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {wallets.map(wallet => (
                      <button
                        key={wallet.id}
                        disabled={!!connecting}
                        onClick={() => handleWalletClick(wallet)}
                        className={`group p-2.5 sm:p-5 rounded-[20px] sm:rounded-[32px] border text-left transition-all relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-5 ${
                          connecting === wallet.id 
                          ? 'border-emerald-500/50 bg-emerald-500/10' 
                          : isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' : 'bg-white border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {wallet.recommended && (
                          <div className="absolute top-1.5 right-1.5 sm:top-4 sm:right-4 flex items-center gap-1 px-1 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[5px] sm:text-[7px] font-black uppercase tracking-widest text-emerald-500">Fast</span>
                          </div>
                        )}

                        <div className="relative shrink-0 p-1 bg-white rounded-[14px] sm:rounded-[20px] shadow-sm">
                          <img 
                            src={wallet.icon} 
                            alt={wallet.name} 
                            className="w-8 h-8 sm:w-14 sm:h-14 object-contain rounded-lg" 
                          />
                        </div>
                        
                        <div className="flex flex-col min-w-0 text-center sm:text-left w-full">
                          <span className={`text-xs sm:text-sm font-black truncate uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{wallet.name}</span>
                          <span className={`text-[8px] sm:text-[10px] font-bold opacity-40 uppercase tracking-widest truncate ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{wallet.description}</span>
                        </div>

                        {connecting === wallet.id && (
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 border-4 ${isDark ? 'border-emerald-500' : 'border-blue-600'} border-t-transparent rounded-full animate-spin`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
          {filteredWallets.length === 0 && (
            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Signal Lost: Zero Operators</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 sm:p-6 border-t shrink-0 ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
           <p className="text-[8px] sm:text-[10px] font-bold opacity-40 leading-relaxed text-center uppercase tracking-[0.2em] max-w-sm mx-auto">
             Secure bridging infrastructure active. End-to-end encryption engaged.
           </p>
        </div>
      </div>
    </div>
  );
};

export default WalletSelector;
