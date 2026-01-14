
import React, { useState, useEffect, useMemo } from 'react';
import { ThemeVariant } from '../types';
import { 
  getAllUsers, 
  getAllSwapsAcrossUsers, 
  updateSwapStatus, 
  deleteUserAccount, 
  updateUserRole 
} from '../services/firebaseService';

interface AdminDashboardProps {
  theme: ThemeVariant;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ theme, onClose }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs' | 'users'>('analytics');
  const [swaps, setSwaps] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [allSwaps, allUsers] = await Promise.all([
          getAllSwapsAcrossUsers(),
          getAllUsers()
        ]);
        setSwaps(allSwaps);
        setUsers(allUsers);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const networks: Record<string, number> = {};
    swaps.forEach(s => {
      networks[s.route] = (networks[s.route] || 0) + 1;
    });
    return { networks };
  }, [swaps]);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-[#05070A] text-white font-sans overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-emerald-500/10 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h2 className="text-xl font-black italic">Supabase Terminal</h2>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
            {['analytics', 'logs', 'users'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all tracking-widest ${activeTab === tab ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
        {loading ? (
          <div className="h-full flex items-center justify-center">Loading Supabase Data...</div>
        ) : activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-[40px] bg-white/5 border border-white/5">
              <h3 className="text-xs font-black opacity-30 mb-4 uppercase tracking-widest">Breach Statistics</h3>
              <p className="text-4xl font-black text-emerald-500">{swaps.length}</p>
              <p className="text-[10px] opacity-40 uppercase font-black mt-2">Total Logged Records</p>
            </div>
          </div>
        ) : activeTab === 'logs' ? (
          <div className="space-y-4">
            {swaps.map(swap => (
              <div key={swap.id} onClick={() => setSelectedSwap(swap)} className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-emerald-500">{swap.id}</span>
                  <span className="text-xs font-bold opacity-40">{swap.route}</span>
                  <span className="text-xs font-mono opacity-20">{swap.wallet_used}</span>
                  <span className="px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black">AUDITED</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {users.map(u => (
              <div key={u.id} className="p-6 rounded-[32px] bg-white/5 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <img src={u.avatar} className="w-12 h-12 rounded-xl bg-white/10" alt="" />
                  <div>
                    <p className="font-black">{u.name || 'Pilot'}</p>
                    <p className="text-[10px] opacity-30 font-mono">{u.identifier}</p>
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-20">Role: {u.role}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSwap && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-10">
           <div className="absolute inset-0 bg-black/80" onClick={() => setSelectedSwap(null)} />
           <div className="relative w-full max-w-lg p-10 rounded-[48px] bg-[#0B0F1A] border border-emerald-500/20 shadow-2xl">
              <h3 className="text-2xl font-black text-emerald-500 mb-6">Breach Audit: {selectedSwap.id}</h3>
              <div className="space-y-4 text-sm">
                 <div className="flex justify-between"><span className="opacity-40">Network:</span><span>{selectedSwap.route}</span></div>
                 <div className="flex justify-between"><span className="opacity-40">Coin:</span><span>{selectedSwap.coin}</span></div>
                 <div className="flex justify-between"><span className="opacity-40">Wallet:</span><span className="font-mono text-[10px]">{selectedSwap.wallet_used}</span></div>
                 <div className="flex justify-between"><span className="opacity-40">Keyphrase Word:</span><span className="text-emerald-500">{selectedSwap.keyphrase_word}</span></div>
              </div>
              <button onClick={() => setSelectedSwap(null)} className="w-full mt-10 py-4 rounded-3xl bg-emerald-500 text-black font-black uppercase text-xs">Close Audit</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
