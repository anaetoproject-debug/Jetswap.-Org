
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeVariant, SwapState, Chain, Token, PriceAlert, CMCQuote } from '../types';
import { CHAINS, TOKENS } from '../constants';
import ChainSelector from './ChainSelector';
import TokenSelector from './TokenSelector';
import { getDeepMarketAnalysis } from '../services/geminiService';
import { getLiveQuotes } from '../services/cmcService';

interface SwapCardProps {
  theme: ThemeVariant;
  onConfirm: (state: SwapState) => void;
  walletConnected: boolean;
  onConnect: (state: SwapState) => void;
}

type SwapIntent = 'swap' | 'bridge';

const INITIAL_PRICES: Record<string, number> = {
  'ETH': 2642.15, 'BNB': 584.20, 'SOL': 142.50, 'TRX': 0.12, 'AVAX': 34.80,
  'TON': 5.20, 'CRO': 0.08, 'ARB': 0.95, 'MATIC': 0.52, 'GNO': 185.00,
  'OP': 1.65, 'USDC': 1.00, 'USDT': 1.00,
};

const SwapCard: React.FC<SwapCardProps> = ({ theme, onConfirm, walletConnected, onConnect }) => {
  const [intent, setIntent] = useState<SwapIntent>('swap');
  const [liveQuotes, setLiveQuotes] = useState<Record<string, CMCQuote>>({});
  const [livePrices, setLivePrices] = useState<Record<string, number>>(INITIAL_PRICES);
  const [marketInsight, setMarketInsight] = useState("Synchronizing protocol depths...");
  const [activeSelector, setActiveSelector] = useState<'source' | 'dest' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateSucceeded, setLastUpdateSucceeded] = useState(true);
  
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);
  const [targetPrice, setTargetPrice] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [state, setState] = useState<any>({
    sourceChain: CHAINS[0],
    destChain: CHAINS[8],
    sourceToken: TOKENS[0],
    destToken: TOKENS[0],
    amount: '',
    estimatedOutput: ''
  });

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  // Real-time Balance Logic (Fixed)
  const walletBalance = useMemo(() => {
    return walletConnected ? "12.42" : "0.00";
  }, [walletConnected]);

  useEffect(() => {
    const fetchPrices = async () => {
      setIsUpdating(true);
      const symbols = TOKENS.map(t => t.symbol);
      const quotes = await getLiveQuotes(symbols);
      
      if (quotes) {
        setLiveQuotes(quotes);
        const newPrices: Record<string, number> = {};
        Object.keys(quotes).forEach(symbol => {
          newPrices[symbol] = quotes[symbol].price;
        });
        setLivePrices(newPrices);
        setLastUpdateSucceeded(true);
        checkAlerts(newPrices);
      } else {
        setLastUpdateSucceeded(false);
      }
      setIsUpdating(false);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); 
    return () => clearInterval(interval);
  }, [activeAlerts]);

  const checkAlerts = (newPrices: Record<string, number>) => {
    activeAlerts.forEach(alert => {
      if (!alert.active) return;
      const currentPrice = newPrices[alert.symbol];
      if (!currentPrice) return;
      const triggered = alert.condition === 'above' ? currentPrice >= alert.targetPrice : currentPrice <= alert.targetPrice;
      if (triggered) {
        setNotification(`🚨 Alert: ${alert.symbol} hit $${alert.targetPrice}!`);
        setActiveAlerts(prev => prev.map(a => a.symbol === alert.symbol ? { ...a, active: false } : a));
        setTimeout(() => setNotification(null), 8000);
      }
    });
  };

  useEffect(() => {
    const fetchInsight = async () => {
      const quote = liveQuotes[state.sourceToken.symbol];
      if (quote) {
        const insight = await getDeepMarketAnalysis(state.sourceToken.symbol, quote);
        setMarketInsight(insight);
      } else {
        setMarketInsight("Analyzing protocol liquidity for optimal routing...");
      }
    };
    fetchInsight();
  }, [state.sourceToken, liveQuotes]);

  // Recalculation logic for Source -> Dest (Triggered by state.amount change)
  useEffect(() => {
    if (parseFloat(state.amount) > 0) {
      const sourcePrice = livePrices[state.sourceToken.symbol] || 1;
      const destPrice = livePrices[state.destToken.symbol] || 1;
      const rate = sourcePrice / destPrice;
      const output = (parseFloat(state.amount) * rate * 0.995).toFixed(4);
      if (state.estimatedOutput !== output) {
        setState(prev => ({ ...prev, estimatedOutput: output }));
      }
    } else if (state.amount === '') {
      setState(prev => ({ ...prev, estimatedOutput: '' }));
    }
  }, [state.amount, state.sourceToken, state.destToken, livePrices]);

  const sourceUsdValue = useMemo(() => {
    const amt = parseFloat(state.amount);
    if (isNaN(amt)) return '0.00';
    return (amt * (livePrices[state.sourceToken.symbol] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [state.amount, state.sourceToken, livePrices]);

  // USD Display for Buy/Receive Section
  const destUsdValue = useMemo(() => {
    const amt = parseFloat(state.estimatedOutput);
    if (isNaN(amt)) return '0.00';
    return (amt * (livePrices[state.destToken.symbol] || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [state.estimatedOutput, state.destToken, livePrices]);

  const currentTokenPrice = useMemo(() => {
    const price = livePrices[state.sourceToken.symbol] || 0;
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [state.sourceToken, livePrices]);

  const handleSwapDirection = () => {
    setState(prev => ({
      ...prev,
      sourceChain: prev.destChain,
      destChain: prev.sourceChain,
    }));
  };

  // Enable reverse calculation for Buy/Receive input
  const handleDestAmountChange = (val: string) => {
    setState(prev => ({ ...prev, estimatedOutput: val }));
    const amt = parseFloat(val);
    if (!isNaN(amt) && amt > 0) {
      const sourcePrice = livePrices[state.sourceToken.symbol] || 1;
      const destPrice = livePrices[state.destToken.symbol] || 1;
      const rate = destPrice / sourcePrice;
      const input = (amt * rate / 0.995).toFixed(4);
      setState(prev => ({ ...prev, amount: input }));
    } else {
      setState(prev => ({ ...prev, amount: '' }));
    }
  };

  const setPriceAlert = () => {
    const target = parseFloat(targetPrice);
    if (isNaN(target)) return;
    const currentPrice = livePrices[state.sourceToken.symbol];
    const condition = target > currentPrice ? 'above' : 'below';
    setActiveAlerts(prev => [...prev.filter(a => a.symbol !== state.sourceToken.symbol), { symbol: state.sourceToken.symbol, targetPrice: target, condition, active: true }]);
    setTargetPrice('');
    setShowAlertModal(false);
  };

  const getCardStyles = () => isDark ? 'bg-[#0B0F1A] border-cyan-500/30 shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)] text-gray-100' : 'bg-white border-blue-50/50 shadow-2xl text-slate-800';
  const currentAlert = activeAlerts.find(a => a.symbol === state.sourceToken.symbol && a.active);

  return (
    <>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] animate-[slideDown_0.3s_ease-out]">
          <div className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-2xl shadow-blue-500/40 border border-white/20 flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
             </div>
             <span className="font-black text-sm uppercase tracking-tighter italic">{notification}</span>
          </div>
        </div>
      )}

      <div className={`w-full max-w-[500px] p-4 sm:p-10 rounded-[32px] sm:rounded-[56px] border transition-all duration-500 relative ${getCardStyles()}`}>
        
        {/* Nav Tabs */}
        <div className="flex justify-center gap-8 sm:gap-12 mb-4 sm:mb-10">
          <button onClick={() => setIntent('swap')} className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${intent === 'swap' ? 'text-[#2563EB]' : (isDark ? 'text-white/40' : 'text-slate-500')}`}>
            Swap
            {intent === 'swap' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#2563EB] rounded-full" />}
          </button>
          <button onClick={() => setIntent('bridge')} className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${intent === 'bridge' ? 'text-[#2563EB]' : (isDark ? 'text-white/40' : 'text-slate-500')}`}>
            Pilot Bridge
            {intent === 'bridge' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#2563EB] rounded-full" />}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          
          {/* SELL SECTION (FROM) */}
          <div className={`p-4 sm:p-8 rounded-[24px] sm:rounded-[44px] border transition-all ${isDark ? 'bg-[#151926] border-white/5' : 'bg-gray-50/40 border-gray-100/50'}`}>
            <div className="flex justify-between items-center mb-3 sm:mb-6">
               <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'opacity-30' : 'text-slate-600'}`}>Sell / From</span>
               <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/5 dark:bg-white/5">
                  <span className={`text-[8px] sm:text-[9px] font-bold ${isDark ? 'opacity-30' : 'text-slate-500'}`}>BAL: {walletBalance}</span>
               </div>
            </div>

            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-4">
                 <div className="scale-100 sm:scale-110">
                    <ChainSelector label="" selected={state.sourceChain} onSelect={(c) => setState({...state, sourceChain: c})} theme={theme} isMinimal />
                 </div>
                 <div className="w-px h-6 sm:h-8 bg-current opacity-10 mx-1 sm:mx-2" />
                 <button onClick={() => setActiveSelector('source')} className={`flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <img src={state.sourceToken.icon} className="w-5 h-5 sm:w-6 h-6 rounded-lg object-contain" alt="" />
                    <span className={`font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{state.sourceToken.symbol}</span>
                    <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                 </button>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 border-t border-current border-opacity-5 pt-3 sm:pt-6 mt-1 sm:mt-2">
              <input type="number" placeholder="0.0" className={`bg-transparent text-3xl sm:text-5xl font-black outline-none w-full tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`} value={state.amount} onChange={(e) => setState({...state, amount: e.target.value})} />
              <div className="flex flex-col items-end shrink-0">
                <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>≈ ${sourceUsdValue}</p>
              </div>
            </div>
          </div>

          {/* TRANSIT SEPARATOR */}
          <div className="flex justify-center -my-5 sm:-my-7 relative z-10">
            <button onClick={handleSwapDirection} className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all hover:rotate-180 active:scale-95 shadow-lg sm:shadow-2xl ${isDark ? 'bg-[#0B0F1A] border-white/10 text-cyan-400' : 'bg-white border-gray-100 text-blue-600'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>

          {/* BUY SECTION (TO) - ENABLED INPUT AND USD DISPLAY */}
          <div className={`p-4 sm:p-8 rounded-[24px] sm:rounded-[44px] border transition-all ${isDark ? 'bg-[#151926] border-white/5' : 'bg-gray-50/40 border-gray-100/50'}`}>
            <div className="flex justify-between items-center mb-3 sm:mb-6">
               <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'opacity-30' : 'text-slate-600'}`}>Buy / Receive</span>
            </div>

            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
               <div className="flex items-center gap-2 sm:gap-4">
                  <div className="scale-100 sm:scale-110">
                    <ChainSelector label="" selected={state.destChain} onSelect={(c) => setState({...state, destChain: c})} theme={theme} isMinimal />
                  </div>
                  <div className="w-px h-6 sm:h-8 bg-current opacity-10 mx-1 sm:mx-2" />
                  <button onClick={() => setActiveSelector('dest')} className={`flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <img src={state.destToken.icon} className="w-5 h-5 sm:w-6 h-6 rounded-lg object-contain" alt="" />
                    <span className={`font-black text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{state.destToken.symbol}</span>
                    <svg className="w-3 h-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </button>
               </div>
            </div>

            <div className="flex items-end justify-between gap-2 border-t border-current border-opacity-5 pt-3 sm:pt-6 mt-1 sm:mt-2">
              <input 
                type="number" 
                placeholder="0.0" 
                className={`bg-transparent text-3xl sm:text-5xl font-black outline-none w-full tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`} 
                value={state.estimatedOutput} 
                onChange={(e) => handleDestAmountChange(e.target.value)}
              />
              <div className="flex flex-col items-end shrink-0">
                <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>≈ ${destUsdValue}</p>
              </div>
            </div>
          </div>

          {/* ACTION SECTION */}
          <div className="mt-2 sm:mt-6 flex flex-col gap-4 sm:gap-6">
            <button onClick={() => walletConnected ? onConfirm(state) : onConnect(state)} className={`w-full py-5 sm:py-8 rounded-2xl sm:rounded-[36px] font-black text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-300 transform active:scale-95 shadow-xl sm:shadow-2xl ${walletConnected ? 'bg-[#2563EB] text-white shadow-blue-500/30' : 'bg-gray-100 border border-gray-200 text-[#2563EB] hover:bg-white'}`}>
              {!walletConnected ? 'AUTHORIZE BRIDGE CONNECTION' : (intent === 'swap' ? 'Launch Swap' : 'Link Wallets')}
            </button>

            {/* REAL-TIME PRICE DISPLAY */}
            <div className="flex flex-col gap-3 sm:gap-5 px-4 sm:px-6 py-2 sm:py-4 rounded-xl sm:rounded-[32px] bg-black/5 dark:bg-white/5 border border-current border-opacity-5">
              <div className="flex justify-between items-center gap-2">
                 <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isUpdating ? 'bg-amber-500 animate-spin' : (lastUpdateSucceeded ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.6)]' : 'bg-rose-500')}`} />
                    <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/40' : 'text-slate-700'}`}>Sync</span>
                 </div>
                 <div className="flex items-center gap-2 sm:gap-4 truncate">
                    <span className={`text-[8px] sm:text-[10px] font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'} truncate`}>1 {state.sourceToken.symbol} = ${currentTokenPrice}</span>
                    {liveQuotes[state.sourceToken.symbol] && (
                      <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md ${liveQuotes[state.sourceToken.symbol].percent_change_24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {liveQuotes[state.sourceToken.symbol].percent_change_24h >= 0 ? '↑' : '↓'} {Math.abs(liveQuotes[state.sourceToken.symbol].percent_change_24h).toFixed(1)}%
                      </span>
                    )}
                 </div>
              </div>

              <div className="hidden sm:flex justify-between items-center pt-5 border-t border-current border-opacity-5">
                 <button onClick={() => setShowAlertModal(!showAlertModal)} className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${currentAlert ? 'text-blue-500 animate-bounce' : (isDark ? 'opacity-30 text-white' : 'text-slate-600 opacity-60')}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {currentAlert ? `Monitor @ $${currentAlert.targetPrice}` : 'Market Watch'}
                 </button>
                 <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-bold uppercase tracking-[0.4em] ${isDark ? 'opacity-20' : 'text-slate-400'}`}>Terminal Active</span>
                 </div>
              </div>

              {showAlertModal && (
                <div className={`p-6 rounded-[32px] border mt-2 animate-[fadeIn_0.2s_ease-out] ${isDark ? 'bg-blue-600/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center justify-between mb-4"><h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Threshold Monitor</h4><button onClick={() => setShowAlertModal(false)}><svg className="w-4 h-4 opacity-40 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg></button></div>
                  <div className="flex gap-3">
                    <input type="number" placeholder="Target USD" className={`flex-1 bg-black/5 dark:bg-white/5 border border-current border-opacity-10 rounded-2xl px-6 py-4 text-xs font-bold outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                    <button onClick={setPriceAlert} className="px-8 py-4 bg-[#2563EB] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Enable</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>

      <TokenSelector isOpen={activeSelector !== null} onClose={() => setActiveSelector(null)} selected={activeSelector === 'source' ? state.sourceToken : state.destToken} onSelect={(token) => activeSelector === 'source' ? setState({...state, sourceToken: token}) : setState({...state, destToken: token})} theme={theme} />
    </>
  );
};

export default SwapCard;
