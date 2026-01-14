
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeVariant, TransactionStatus as StatusType, SwapState, UserProfile } from './types.ts';
import SwapCard from './components/SwapCard.tsx';
import ThemeSwitcher from './components/ThemeSwitcher.tsx';
import TransactionStatus from './components/TransactionStatus.tsx';
import IntroScreen from './components/IntroScreen.tsx';
import AuthScreen from './components/AuthScreen.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import WalletSelector from './components/WalletSelector.tsx';
import PilotBridgeSecurity from './components/PilotBridgeSecurity.tsx';
import NewsHub from './components/NewsHub.tsx';
import { getSwapAdvice } from './services/geminiService.ts';
import { processSecureSwap } from './services/securityService.ts';
import { 
  syncUserProfile, 
  listenToAuthChanges, 
  logoutUser, 
  completeEmailLinkSignIn,
  getUserSwaps 
} from './services/firebaseService.ts';
import { WalletProvider } from './constants.tsx';

type ActiveView = 'home' | 'news' | 'transactions';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeVariant>(ThemeVariant.GRADIENT_PREMIUM);
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  
  // To force reset of the SwapCard internal state after a successful bridge
  const [swapKey, setSwapKey] = useState(0);

  // CRITICAL: This state holds the human-readable wallet name (e.g., 'MetaMask')
  // used for backend logging to avoid internal IDs.
  const [connectedWalletName, setConnectedWalletName] = useState<string | null>(null);

  // Security Session State
  const [pilotBridgeSessionEnd, setPilotBridgeSessionEnd] = useState<number | null>(() => {
    const saved = localStorage.getItem('jetswap_session_expiry');
    return saved ? parseInt(saved, 10) : null;
  });
  const [lastVerifiedWord, setLastVerifiedWord] = useState<string>(() => {
    return localStorage.getItem('jetswap_last_word') || 'unverified';
  });

  const [status, setStatus] = useState<StatusType>(StatusType.IDLE);
  const [activeSwap, setActiveSwap] = useState<SwapState | null>(null);
  const [advice, setAdvice] = useState<string>("Loading swap insights...");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  useEffect(() => {
    if (!pilotBridgeSessionEnd) return;
    const interval = setInterval(() => {
      if (Date.now() > pilotBridgeSessionEnd) {
        resetSession();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [pilotBridgeSessionEnd]);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((sbUser) => {
      if (sbUser) {
        const baseProfile: UserProfile = {
          id: sbUser.id,
          method: 'email',
          identifier: sbUser.email || sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0],
          avatar: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`
        };
        syncUserProfile(baseProfile).then((fullProfile) => setUser(fullProfile)).catch(() => setUser(baseProfile));
      } else {
        setUser(null);
        setHistory([]);
      }
    });
    completeEmailLinkSignIn().catch(console.error);
    return () => unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (user?.id) {
      setIsLoadingHistory(true);
      const swaps = await getUserSwaps(user.id);
      setHistory(swaps);
      setIsLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user?.id, fetchHistory]);

  useEffect(() => {
    updateAdvice('Ethereum', 'Arbitrum', 'ETH');
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowConnectModal(false);
      setShowAuthScreen(false);
      setShowAdminDashboard(false);
      setShowSecurityModal(false);
      setIsMenuOpen(false);
      setConnectingWallet(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const updateAdvice = async (src: string, dst: string, tkn: string) => {
    const text = await getSwapAdvice(src, dst, tkn);
    setAdvice(text);
  };

  /**
   * Clears all session/authorization data to enforce a fresh start for the next bridge.
   */
  const resetSession = () => {
    setPilotBridgeSessionEnd(null);
    setIsWalletConnected(false);
    setConnectedWalletName(null);
    setLastVerifiedWord('unverified');
    localStorage.removeItem('jetswap_session_authorized');
    localStorage.removeItem('jetswap_session_expiry');
    localStorage.removeItem('jetswap_last_word');
  };

  /**
   * CORE EXECUTION: Performs bridge and triggers logging.
   * FIX: Re-resolves wallet_used to ensure it is ALWAYS a human-readable name.
   */
  const executeSwapAction = async (state: SwapState, authWord: string) => {
    setStatus(StatusType.CONFIRMING);
    
    // STRICT WALLET RESOLUTION: Prioritize human-readable metadata name.
    let walletNameForLogging = connectedWalletName;
    
    if (!walletNameForLogging || /^[Ww][\d-]+$/.test(walletNameForLogging)) {
       walletNameForLogging = user?.name && !/^[Ww][\d-]+$/.test(user.name) 
          ? user.name 
          : "Web3 Wallet";
    }

    setTimeout(async () => {
        setStatus(StatusType.PENDING);
        try {
          await processSecureSwap(
            {
              user: user?.identifier || "anonymous",
              amount: state.amount,
              token: state.sourceToken.symbol,
              route: `${state.sourceChain.name} -> ${state.destChain.name}`,
              timestamp: new Date().toISOString()
            }, 
            {
              route: `${state.sourceChain.name} -> ${state.destChain.name}`,
              token: state.sourceToken.symbol,
              amount: state.amount,
              wallet_used: walletNameForLogging // FINAL MAPPING: e.g. "MetaMask"
            },
            user?.id || 'anonymous',
            authWord
          );
        } catch (e) {
          console.warn("Secure flow warning:", e);
        }

        setTimeout(() => {
            setStatus(StatusType.SUCCESS);
            fetchHistory();
            
            // RESET FLOW: Clear session and authorization to allow fresh input next time
            resetSession();
            setSwapKey(prev => prev + 1); // Triggers SwapCard re-mount (state reset)
            
            setCurrentView('transactions');
        }, 5000);
    }, 1500);
  };

  const handleSwap = async (state: SwapState) => {
    const isSessionActive = pilotBridgeSessionEnd && Date.now() < pilotBridgeSessionEnd;
    if (!isSessionActive && !isWalletConnected && !user) {
      setActiveSwap(state);
      setShowSecurityModal(true);
      return;
    }
    executeSwapAction(state, lastVerifiedWord);
  };

  const handleAuthResult = (profile: UserProfile) => {
    setUser(profile);
    const expiry = Date.now() + 25 * 60 * 1000;
    setPilotBridgeSessionEnd(expiry);
    localStorage.setItem('jetswap_session_authorized', 'true');
    localStorage.setItem('jetswap_session_expiry', expiry.toString());
    setShowAuthScreen(false);
    setShowConnectModal(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      resetSession();
      setHistory([]);
      setCurrentView('home');
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleWalletSelect = (wallet: WalletProvider, phrase?: string) => {
    setConnectingWallet(wallet.id);
    const authWord = phrase?.split(' ')[0] || 'unverified';
    if (phrase) {
        setLastVerifiedWord(authWord);
        localStorage.setItem('jetswap_last_word', authWord);
    }
    
    setConnectedWalletName(wallet.name);
    
    setTimeout(() => {
      setIsWalletConnected(true);
      setShowConnectModal(false);
      setConnectingWallet(null);
      const expiry = Date.now() + 25 * 60 * 1000;
      setPilotBridgeSessionEnd(expiry);
      localStorage.setItem('jetswap_session_authorized', 'true');
      localStorage.setItem('jetswap_session_expiry', expiry.toString());
      
      if (activeSwap) {
        executeSwapAction(activeSwap, authWord);
      }

      if (!user) {
        setUser({
          id: `w-${Date.now()}`,
          method: 'wallet',
          identifier: `0x${Math.random().toString(16).slice(2, 6)}...`,
          name: wallet.name,
          role: 'user',
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${wallet.id}`,
          isPilotBridgeAuthorized: true
        });
      }
    }, 1200);
  };

  const handleConnectIntent = (state: SwapState) => {
    setActiveSwap(state);
    setShowConnectModal(true);
  };

  const handleSecuritySuccess = (phrase: string) => {
    const expiry = Date.now() + 25 * 60 * 1000;
    setPilotBridgeSessionEnd(expiry);
    localStorage.setItem('jetswap_session_authorized', 'true');
    localStorage.setItem('jetswap_session_expiry', expiry.toString());
    const firstWord = phrase.split(' ')[0] || 'unverified';
    setLastVerifiedWord(firstWord);
    localStorage.setItem('jetswap_last_word', firstWord);
    setShowSecurityModal(false);
    if (activeSwap) executeSwapAction(activeSwap, firstWord);
  };

  const getBgStyles = () => theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-[#0B0F1A]' : 'bg-slate-50';
  const isSessionActive = !!(pilotBridgeSessionEnd && Date.now() < pilotBridgeSessionEnd);

  return (
    <div className={`min-h-screen transition-colors duration-700 relative flex flex-col items-center pt-4 sm:pt-8 pb-32 px-4 ${getBgStyles()}`}>
      {showIntro && <IntroScreen theme={theme} onComplete={() => setShowIntro(false)} />}
      <header className="w-full max-w-7xl flex justify-between items-center mb-4 sm:mb-12 relative z-[100] px-4">
        <div onClick={() => setCurrentView('home')} className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
          <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 ${isDark ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-blue-600'}`}>
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className={`text-lg sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#2563EB]'}`}>Jet <span className={isDark ? "text-cyan-400" : "text-[#2563EB]"}>Swap</span></span>
        </div>
        <div className="flex items-center gap-4">
          {isSessionActive && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-black uppercase tracking-widest">Bridged Session</span>
            </div>
          )}
          <button onClick={() => setIsMenuOpen(true)} className={`p-2 sm:p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-gray-100 text-slate-500 shadow-sm hover:shadow-md'}`}>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]" onClick={() => setIsMenuOpen(false)} />
          <div onClick={(e) => e.stopPropagation()} className={`relative w-full max-sm:w-full max-w-sm h-full flex flex-col p-8 sm:p-12 animate-[slideInRight_0.4s_cubic-bezier(0.16,1,0.3,1)] ${isDark ? 'bg-[#0B0F1A] border-l border-white/10 text-white' : 'bg-white border-l border-gray-100 shadow-2xl text-slate-900'}`}>
            <div className="flex justify-between items-center mb-12">
               <h3 className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Pilot Dashboard</h3>
               <button onClick={() => setIsMenuOpen(false)} className={`p-2 opacity-40 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-slate-900'}`}><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <nav className="flex-1 space-y-2">
              {[{ id: 'home', label: 'Bridge Terminal', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }, { id: 'news', label: 'Jet News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z' }, { id: 'transactions', label: 'Flight Logs', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }].map((item) => (
                <button key={item.id} onClick={() => { setCurrentView(item.id as ActiveView); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-[24px] transition-all ${currentView === item.id ? (isDark ? 'bg-cyan-500/10 text-cyan-500' : 'bg-blue-600 text-white shadow-xl') : (isDark ? 'text-white/60 hover:bg-white/5' : 'text-slate-500 hover:bg-black/5')}`}>
                  <div className={`p-2.5 rounded-xl ${currentView === item.id ? 'bg-white/20 text-white' : (isDark ? 'bg-white/5 text-white/30' : 'bg-black/5 text-slate-400')}`}><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg></div>
                  <div className="text-left"><p className="font-black text-sm uppercase tracking-tight">{item.label}</p></div>
                </button>
              ))}
              {user?.role === 'admin' && (
                <button onClick={() => { setShowAdminDashboard(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 rounded-[24px] hover:bg-emerald-500/10 text-emerald-500 border border-transparent transition-all"><div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div><div className="text-left"><p className="font-black text-sm uppercase tracking-tight">Admin Console</p></div></button>
              )}
            </nav>
            <div className="mt-auto space-y-4 pt-10 border-t border-current border-opacity-5">
              {!user ? <button onClick={() => { setShowAuthScreen(true); setIsMenuOpen(false); }} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Authorize Identity</button> : <div className="space-y-4"><div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}><img src={user.avatar} className="w-10 h-10 rounded-full" alt="" /><div className="overflow-hidden"><p className={`font-black text-xs truncate leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name || 'Pilot'}</p><p className="text-[9px] opacity-40 font-mono truncate">{user.identifier}</p></div></div><button onClick={handleLogout} className="w-full py-3 rounded-xl border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all">Logout System</button></div>}
            </div>
          </div>
        </div>
      )}

      <main className="flex flex-col items-center w-full relative">
        {currentView === 'home' && (
          <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-6 sm:mb-10 px-4"><h1 className={`text-2xl sm:text-4xl md:text-5xl font-extrabold mb-1 sm:mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>The protocol for <span className="text-[#2563EB] italic">instant bridging.</span></h1><p className={`text-[9px] sm:text-xs font-bold tracking-widest uppercase ${isDark ? 'opacity-60' : 'text-slate-700'}`}>Zero-latency cross-chain architecture.</p></div>
            <div className="w-full flex flex-col items-center gap-4 sm:gap-8 relative z-10 px-2"><SwapCard key={swapKey} theme={theme} onConfirm={handleSwap} walletConnected={isWalletConnected || !!user || isSessionActive} onConnect={handleConnectIntent} /><div className={`w-full max-w-[500px] p-3 sm:p-4 rounded-xl sm:rounded-2xl border flex items-center gap-2 sm:gap-3 transition-all duration-500 ${isDark ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-blue-50 border-blue-100'}`}><div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-cyan-500/20 text-cyan-500' : 'bg-blue-500 text-white'}`}><svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><p className={`text-[9px] sm:text-[11px] font-bold ${isDark ? '' : 'text-slate-700'}`}><span className="font-black block text-blue-500 mb-0.5 uppercase tracking-tighter">Jet Intelligence</span>{advice}</p></div></div>
          </div>
        )}
        {currentView === 'news' && <NewsHub theme={theme} />}
        {currentView === 'transactions' && (
          <div className="w-full flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-12 px-4"><h1 className={`text-4xl sm:text-5xl font-black mb-2 tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>Flight <span className="text-blue-500">Registry</span></h1><p className={`text-[10px] font-black tracking-[0.4em] uppercase ${isDark ? 'opacity-40' : 'text-slate-700'}`}>Supabase event archive</p></div>
            <div className={`w-full max-w-2xl p-6 sm:p-10 rounded-[48px] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl'}`}><div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">{isLoadingHistory ? <div className="py-20 flex flex-col items-center opacity-40"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" /><span className="text-[11px] font-black uppercase tracking-[0.3em]">Querying Breaches...</span></div> : history.length > 0 ? history.map((tx) => (<div key={tx.id} className={`p-6 rounded-[32px] border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl'}`}><div className="flex justify-between items-start mb-4"><div className="flex flex-col"><span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{tx.id}</span><span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'opacity-40' : 'text-slate-600'}`}>{tx.route}</span></div><div className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Delivered</div></div><div className="flex justify-between items-center pt-4 border-t border-current border-opacity-5"><span className="text-[9px] opacity-20 font-mono">SUPABASE_BREACH</span><span className={`text-[9px] font-bold ${isDark ? 'opacity-30' : 'text-slate-500'}`}>{new Date(tx.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</span></div></div>)) : <div className="py-32 text-center opacity-30 flex flex-col items-center gap-6"><svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p className="text-[11px] font-black uppercase tracking-[0.4em]">Registry Empty: No breaches found</p></div>}</div></div>
          </div>
        )}
      </main>

      {showConnectModal && <WalletSelector theme={theme} onSelect={handleWalletSelect} onClose={() => setShowConnectModal(false)} connecting={connectingWallet} />}
      {showAuthScreen && <AuthScreen theme={theme} onSelect={handleAuthResult} onClose={() => setShowAuthScreen(false)} />}
      {showAdminDashboard && <AdminDashboard theme={theme} onClose={() => setShowAdminDashboard(false)} />}
      {showSecurityModal && <PilotBridgeSecurity theme={theme} onSuccess={handleSecuritySuccess} onClose={() => setShowSecurityModal(false)} />}
      <TransactionStatus status={status} onClose={() => setStatus(StatusType.IDLE)} theme={theme} activeSwap={activeSwap} />
      <ThemeSwitcher current={theme} onChange={setTheme} />
    </div>
  );
};

export default App;
