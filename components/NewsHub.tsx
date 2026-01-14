
import React, { useState, useEffect } from 'react';
import { ThemeVariant, NewsItem, NewsCategory } from '../types';
import { getNewsHubPulse, fetchLiveIntelligenceNews } from '../services/geminiService';
import { MOCK_NEWS } from '../constants';

interface NewsHubProps {
  theme: ThemeVariant;
}

const NewsHub: React.FC<NewsHubProps> = ({ theme }) => {
  const [activeCategory, setActiveCategory] = useState<NewsCategory | 'All'>('All');
  const [marketPulse, setMarketPulse] = useState('Syncing protocol frequencies...');
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isDark = theme === ThemeVariant.DARK_FUTURISTIC;
  const categories: (NewsCategory | 'All')[] = ['All', 'Headline', 'Market News', 'Announcements'];

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        const pulsePromise = getNewsHubPulse();
        const aiNewsPromise = fetchLiveIntelligenceNews();
        
        const [pulse, aiNews] = await Promise.all([pulsePromise, aiNewsPromise]);
        
        setMarketPulse(pulse);
        if (aiNews && aiNews.length > 0) {
          setNewsList(aiNews);
        } else {
          // Fallback if AI fails or search returns empty
          setNewsList(MOCK_NEWS.map(n => ({ ...n, source: 'Jet Internal Feed' })));
        }
      } catch (err) {
        setNewsList(MOCK_NEWS.map(n => ({ ...n, source: 'Jet Internal Feed' })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 900000); // Refresh every 15 mins
    return () => clearInterval(interval);
  }, []);

  const filteredNews = activeCategory === 'All' 
    ? newsList 
    : newsList.filter(n => n.category === activeCategory);

  const headline: NewsItem = newsList[0] || {
    id: 'placeholder',
    title: 'Acquiring Global Signals...',
    summary: 'Jet Intelligence is currently scanning decentralized frequencies for high-impact market shifts.',
    fullText: '',
    category: 'Headline',
    timestamp: 'Initializing...',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000',
    source: 'Jet Protocol AI',
    url: '#'
  };

  const getContainerStyles = () => isDark ? 'bg-[#0B0F1A] border-cyan-500/20' : 'bg-white border-blue-50';
  const getCardStyles = () => isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 shadow-lg' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-xl';

  return (
    <section className="w-full max-w-7xl px-4 py-20 mt-10">
      <div className="flex flex-col gap-10">
        
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex-1">
            <h2 className={`text-3xl sm:text-5xl font-black italic uppercase tracking-tighter mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Protocol <span className="text-blue-500">Intelligence</span>
            </h2>
            <div className={`flex items-center gap-3 py-2 px-4 rounded-full border w-fit ${isDark ? 'bg-white/5 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Jet Intelligence Pulse: <span className={`font-medium normal-case ${isDark ? 'opacity-70' : 'text-slate-700'}`}>{marketPulse}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'opacity-30' : 'text-slate-500 opacity-60'}`}>Live AI Feed Grounding</span>
            <div className="flex -space-x-1">
               <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
               <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 rounded-[40px] border overflow-hidden relative group transition-all duration-500 ${getContainerStyles()}`}>
            <div className="aspect-[21/9] w-full relative overflow-hidden bg-slate-900">
               {isLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Searching Google News...</span>
                    </div>
                 </div>
               ) : (
                 <img src={headline.image} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="" />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="p-8 sm:p-10 relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{headline.category}</p>
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                   <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
                   <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Verified Grounding</span>
                </div>
              </div>
              <h3 className={`text-2xl sm:text-4xl font-black tracking-tighter mb-4 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {headline.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-8 max-w-2xl ${isDark ? 'text-gray-300 opacity-60' : 'text-slate-700 font-medium'}`}>
                {headline.summary}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{headline.source}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'opacity-40' : 'text-slate-500'}`}>{headline.timestamp}</span>
                   </div>
                </div>
                {headline.url && (
                  <a href={headline.url} target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                    View Report
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`p-8 rounded-[40px] border flex-1 ${getContainerStyles()}`}>
               <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2 ${isDark ? 'opacity-40' : 'text-slate-700 opacity-80'}`}>
                 <span className="w-1 h-1 rounded-full bg-emerald-500" />
                 Market intelligence
               </h3>
               <div className="space-y-8">
                  {newsList.slice(1, 4).map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 group cursor-pointer" onClick={() => item.url && window.open(item.url, '_blank')}>
                       <div className="flex justify-between items-center">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.source}</p>
                          <span className={`text-[8px] uppercase font-black ${isDark ? 'opacity-30' : 'text-slate-500'}`}>{item.timestamp}</span>
                       </div>
                       <h4 className={`text-sm font-bold tracking-tight group-hover:text-blue-500 transition-colors line-clamp-2 leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="space-y-6 opacity-20 animate-pulse">
                       {[1,2].map(n => <div key={n} className="h-16 bg-current rounded-2xl" />)}
                    </div>
                  )}
               </div>
            </div>

            <div className={`p-8 rounded-[40px] border bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl group overflow-hidden relative`}>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-white/40 relative z-10">Jet Core Intelligence</p>
               <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4 leading-tight relative z-10">AI Search Engine Synced.</h4>
               <p className="text-xs font-bold text-white/80 mb-8 leading-relaxed italic relative z-10">
                 Our neural network actively scrapes global crypto outlets to bring you verified, timestamped data directly from the decentralized web.
               </p>
               <div className="flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">Frequency Established</span>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-current border-opacity-5 pb-6">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${activeCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-slate-500 hover:border-gray-300'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.slice(4, 10).map((news) => (
              <div key={news.id} className={`p-8 rounded-[40px] border transition-all duration-300 group flex flex-col justify-between ${getCardStyles()}`}>
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{news.source}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'opacity-30' : 'text-slate-500'}`}>{news.timestamp}</span>
                  </div>
                  <h4 className={`text-xl font-black tracking-tight mb-4 leading-tight group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {news.title}
                  </h4>
                  <p className={`text-xs font-medium leading-relaxed line-clamp-3 ${isDark ? 'text-gray-400' : 'text-slate-700'}`}>
                    {news.summary}
                  </p>
                </div>
                <div className="pt-8 mt-8 border-t border-current border-opacity-5 flex justify-between items-center">
                   <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'opacity-30' : 'text-slate-500'}`}>{news.category}</span>
                   {news.url && (
                     <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-2">
                       Source 
                       <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={3}/></svg>
                     </a>
                   )}
                </div>
              </div>
            ))}
            {isLoading && newsList.length === 0 && (
               [1,2,3].map(n => <div key={n} className="h-64 rounded-[40px] bg-white/5 border border-white/5 animate-pulse" />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsHub;
