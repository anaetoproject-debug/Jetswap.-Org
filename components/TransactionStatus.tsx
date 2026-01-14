
import React, { useState, useEffect } from 'react';
import { TransactionStatus as StatusType, SwapState } from '../types';

interface TransactionStatusProps {
  status: StatusType;
  onClose: () => void;
  theme: string;
  activeSwap: SwapState | null;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, onClose, theme, activeSwap }) => {
  const [logIndex, setLogIndex] = useState(0);

  const logs = activeSwap ? [
    `Initiating bridge from ${activeSwap.sourceChain.name}...`,
    `Encrypting flight data (AES-256)...`,
    `Running Zero-Knowledge Security Audit...`,
    `Locking assets in protocol vault...`,
    `Verifying transaction on ${activeSwap.sourceChain.name}...`,
    `Relaying message through Jet Network...`,
    `Secure data transmission to Admin...`,
    `Releasing ${activeSwap.destToken.symbol} on ${activeSwap.destChain.name}...`,
    `Finishing transaction...`
  ] : [
    "Preparing transaction...",
    "Securing connection...",
    "Encrypting payload...",
    "Finalizing swap..."
  ];

  useEffect(() => {
    if (status === StatusType.PENDING) {
      const interval = setInterval(() => {
        setLogIndex((prev) => (prev + 1) % logs.length);
      }, 1600); // Slightly faster logs for more dynamic feel
      return () => clearInterval(interval);
    } else {
      setLogIndex(0);
    }
  }, [status, logs.length]);

  if (status === StatusType.IDLE) return null;

  const isDark = theme === 'DARK_FUTURISTIC' || theme === 'GLASSMORPHISM';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] px-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={status === StatusType.SUCCESS || status === StatusType.ERROR ? onClose : undefined}
      />
      <div className={`relative w-full max-w-sm p-8 rounded-[40px] border shadow-2xl transition-all duration-500 transform ${
        isDark ? 'bg-[#0B0F1A] border-white/10 text-white' : 'bg-white border-gray-100 text-slate-900'
      }`}>
        <div className="flex flex-col items-center text-center">
          
          {/* Enhanced PENDING Animation: The Jet Bridge + Security Shield */}
          {status === StatusType.PENDING && activeSwap && (
            <div className="w-full mb-10 mt-2 relative">
              {/* Security Badge overlay */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-white text-[8px] font-black uppercase py-1 px-2 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                 <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 .155 17.834 4.9a2 2 0 011.166 1.81V11c0 4.14-2.8 8.01-6.733 9.477l-.267.1a2 2 0 01-1.467 0l-.267-.1C6.3 19.01 3.5 15.14 3.5 11V6.71a2 2 0 011.166-1.81z" clipRule="evenodd" /></svg>
                 Encrypted Transit
              </div>

              <div className="flex items-center justify-between relative px-2">
                {/* Source Chain */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} animate-pulse`}>
                    <img src={activeSwap.sourceChain.icon} className="w-8 h-8 object-contain" alt="" />
                  </div>
                </div>

                {/* The Bridge Path with Security pulse */}
                <div className="absolute left-14 right-14 top-1/2 -translate-y-1/2 h-0.5 overflow-hidden">
                  <div className={`w-full h-full border-t-2 border-dashed ${isDark ? 'border-white/20' : 'border-slate-200'}`} />
                  <div className="absolute inset-0 animate-[bridgeFlow_2s_infinite_linear]">
                    <div className="relative">
                       <svg className="w-5 h-5 text-blue-500 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.22c-.16.09-.34.14-.5.14s-.34-.05-.5-.14l-7.97-4.22c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.22c.16-.09.34-.14.5-.14s.34.05.5.14l7.97 4.22c.32.17.53.5.53.88v9z" />
                       </svg>
                       <div className="absolute -inset-1 bg-cyan-400/20 blur-sm rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Dest Chain */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                    <img src={activeSwap.destChain.icon} className="w-8 h-8 object-contain" alt="" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple Spinner for Confirming */}
          {status === StatusType.CONFIRMING && (
            <div className="mb-6 relative">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          )}

          {status === StatusType.SUCCESS && (
            <div className="mb-6 w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 animate-[bounceIn_0.5s_ease-out]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {status === StatusType.ERROR && (
            <div className="mb-6 w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          <h3 className="text-2xl font-bold mb-2 tracking-tight">
            {status === StatusType.CONFIRMING && 'Establishing Security'}
            {status === StatusType.PENDING && 'Secure Bridging'}
            {status === StatusType.SUCCESS && 'Assets Delivered'}
            {status === StatusType.ERROR && 'Transit Interrupted'}
          </h3>
          
          <div className="min-h-[40px] flex flex-col items-center">
            <p className={`text-sm transition-all duration-500 ${status === StatusType.PENDING ? 'animate-pulse text-cyan-600 font-bold' : (isDark ? 'opacity-60 text-white' : 'text-slate-700 font-medium')}`}>
              {status === StatusType.PENDING ? logs[logIndex] : (
                status === StatusType.CONFIRMING ? 'Encrypting session and verifying wallet signatures...' :
                status === StatusType.SUCCESS ? `Success! Flight data archived and assets on ${activeSwap?.destChain.name}.` :
                'Security protocols blocked the transaction.'
              )}
            </p>
          </div>

          {(status === StatusType.SUCCESS || status === StatusType.ERROR) && (
            <button 
              onClick={onClose}
              className={`w-full mt-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Done
            </button>
          )}

          {status === StatusType.PENDING && (
            <div className="w-full mt-10 bg-gray-100 dark:bg-white/5 h-2 rounded-full overflow-hidden relative">
               <div className="h-full bg-cyan-500 animate-[loading_3s_ease-in-out_infinite] shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{width: '75%'}}>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
               </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bridgeFlow {
          0% { transform: translateX(-40px) translateY(-50%) rotate(90deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateX(180px) translateY(-50%) rotate(90deg); opacity: 0; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(20%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default TransactionStatus;
