
import React, { useState } from 'react';
import { ThemeVariant, UserProfile } from '../types';
import { loginWithGoogle, loginUserWithEmail, sendMagicLink, registerUser } from '../services/firebaseService';

interface AuthScreenProps {
  theme: ThemeVariant;
  onSelect: (user: UserProfile) => void;
  onClose: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ theme, onSelect, onClose }) => {
  const [view, setView] = useState<'login' | 'register' | 'email-link'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      // Supabase OAuth uses redirects, App.tsx listener handles the return
    } catch (error: any) {
      setAuthError(error.message || "Failed to sign in with Google.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { data, error } = await loginUserWithEmail(formData.email, formData.password);
      if (error) throw error;
      onSelect({
        id: data.user.id,
        method: 'email',
        identifier: data.user.email!,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        avatar: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`
      });
    } catch (error: any) {
      setAuthError("Invalid email or password. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      setAuthError("All fields are required.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const user = await registerUser(formData.email, formData.password, formData.name);
      onSelect({
        id: user.id,
        method: 'email',
        identifier: user.email!,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`
      });
    } catch (error: any) {
      setAuthError(error.message || "Failed to create account.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getAccentColor = () => theme === ThemeVariant.DARK_FUTURISTIC ? 'bg-cyan-500' : 'bg-blue-600';
  const getInputStyles = () => isDark 
    ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-cyan-500' 
    : 'bg-gray-50 border-gray-200 text-slate-900 placeholder-slate-400 focus:border-blue-500';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] px-4 animate-[fadeInOverlay_0.3s_ease-out]">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-md p-8 rounded-[32px] border transition-all duration-500 transform scale-100 ${isDark ? 'bg-[#151926] border-white/10 text-white' : 'bg-white border-gray-100 text-slate-900'}`}>
        <button onClick={onClose} className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${getAccentColor()} shadow-lg`}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Supabase Auth</h2>
        </div>

        {authError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] leading-relaxed">
            {authError}
          </div>
        )}

        {isAuthenticating ? (
          <div className="py-12 flex flex-col items-center">
            <div className={`w-12 h-12 border-4 ${theme === ThemeVariant.DARK_FUTURISTIC ? 'border-cyan-500' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mb-4`} />
            <p className="text-sm font-medium animate-pulse">Establishing secure connection...</p>
          </div>
        ) : view === 'login' ? (
          <div className="space-y-6">
            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-100 hover:bg-white shadow-sm'}`}>
              <span className="font-bold">Continue with Google</span>
            </button>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none ${getInputStyles()}`} required />
              <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none ${getInputStyles()}`} required />
              <button type="submit" className={`w-full py-4 rounded-2xl font-bold text-white ${getAccentColor()} shadow-lg`}>Sign In</button>
            </form>
            <button onClick={() => setView('register')} className="w-full text-sm font-medium opacity-60">Sign Up</button>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none ${getInputStyles()}`} required />
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none ${getInputStyles()}`} required />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full p-4 rounded-2xl border outline-none ${getInputStyles()}`} required />
            <button type="submit" className={`w-full py-4 rounded-2xl font-bold text-white ${getAccentColor()} shadow-lg`}>Create Account</button>
            <button type="button" onClick={() => setView('login')} className="w-full text-sm font-medium opacity-50">Back to Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
