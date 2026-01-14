
import React, { useEffect, useState } from 'react';
import { ThemeVariant } from '../types';

interface IntroScreenProps {
  onComplete: () => void;
  theme: ThemeVariant;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, theme }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: Logo enters
    const t1 = setTimeout(() => setStage(1), 100);
    // Stage 2: Text enters
    const t2 = setTimeout(() => setStage(2), 800);
    // Stage 3: Fade out
    const t3 = setTimeout(() => setStage(3), 2800);
    // Complete
    const t4 = setTimeout(onComplete, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Fix: Removed reference to ThemeVariant.GLASSMORPHISM
  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-700 ${
      stage === 3 ? 'opacity-0' : 'opacity-100'
    } ${isDark ? 'bg-[#0B0F1A]' : 'bg-[#F7F9FC]'}`}>
      
      {/* Jet Background Glow */}
      <div className={`absolute w-[400px] h-[400px] rounded-full blur-[120px] transition-all duration-1000 ${
        stage >= 1 ? 'opacity-40 scale-100' : 'opacity-0 scale-50'
      } ${theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500' : 'bg-blue-500'}`} />

      {/* Animated Logo */}
      <div className={`relative transition-all duration-700 ease-out transform ${
        stage >= 1 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'
      }`}>
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden ${
          theme === ThemeVariant.DARK_FUTURISTIC 
            ? 'bg-cyan-500 shadow-cyan-500/40' 
            : 'bg-blue-600 shadow-blue-600/30'
        }`}>
          <svg className={`w-14 h-14 text-white transition-transform duration-1000 ${stage >= 2 ? 'rotate-[360deg]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full animate-[shine_2s_infinite]" />
        </div>
      </div>

      {/* Typography */}
      <div className={`mt-8 flex flex-col items-center transition-all duration-700 delay-300 transform ${
        stage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <h1 className={`text-5xl font-black tracking-tighter transition-colors ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          JET <span className="text-blue-500 italic">SWAP</span>
        </h1>
        <div className="mt-2 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div 
              key={i} 
              className={`w-1 h-1 rounded-full bg-blue-500 transition-all duration-500 delay-[${i * 200}ms] ${
                stage >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`} 
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          20%, 100% { transform: translateX(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;
