import { useState, useEffect, useMemo, FormEvent } from "react";
import { Search, Filter, ArrowUpDown, Star, Clock, ShoppingBag, Zap, Award, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatBot from "./components/ChatBot";

interface Product {
  id: number;
  name: string;
  platform: string;
  price: number;
  deliveryTime: number;
  rating: number;
  score: number;
  savings: number;
  buyUrl: string;
  isBestChoice?: boolean;
  isSearchLink?: boolean;
  aiVerdict?: string;
  bestTimeToBuy?: string;
  isFakeDiscount?: boolean;
  originalPrice?: number;
  category?: string;
}

type UserProfile = "student" | "gamer" | "budget";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [userProfile, setUserProfile] = useState<UserProfile>("budget");
  
  // Filters & Sorting
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [maxDelivery, setMaxDelivery] = useState<number>(72);
  const [sortBy, setSortBy] = useState<"score" | "price" | "delivery" | "rating">("score");

  const handleSearch = async (e?: FormEvent, queryOverride?: string) => {
    if (e) e.preventDefault();

    const searchTerm = queryOverride !== undefined ? queryOverride : query;

    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&profile=${userProfile}`);
      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) setBackendStatus("connected");
        else setBackendStatus("disconnected");
      } catch {
        setBackendStatus("disconnected");
      }
    };
    checkBackend();
  }, []);

  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.filter(p => p.price <= maxPrice && p.deliveryTime <= maxDelivery);
    
    return [...filtered].sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "delivery") return a.deliveryTime - b.deliveryTime;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [results, maxPrice, maxDelivery, sortBy]);

  const bestChoice = useMemo(() => {
    return results.find(p => p.isBestChoice);
  }, [results]);

  return (
    <div className="min-h-screen font-sans text-slate-100 relative selection:bg-indigo-500/30">
      <div className="atmosphere">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      
      {/* Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SmartShop <span className="text-indigo-400 font-medium">AI</span></h1>
            <div className="flex items-center gap-1.5 ml-2">
              <div className={`w-2 h-2 rounded-full relative ${
                backendStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                backendStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`}>
                {backendStatus === 'connected' && (
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25"></div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {backendStatus}
              </span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products (e.g., iPhone 15, Milk, Bread...)"
              className="w-full pl-12 pr-24 py-3 glass-input rounded-2xl text-lg placeholder:text-slate-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button 
                  type="button"
                  onClick={() => { setQuery(""); setResults([]); }}
                  className="text-slate-400 hover:text-slate-200 text-sm font-medium px-2"
                >
                  Clear
                </button>
              )}
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Welcome */}
        {!results.length && !loading && (
          <div className="text-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">Compare & Save with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">AI</span></h2>
              <p className="text-xl text-slate-400 mb-12 leading-relaxed">Unified platform for E-commerce & Quick-commerce. Get the best prices, fastest delivery, and top ratings instantly.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  { icon: Zap, title: "Quick Commerce", desc: "Zepto, Blinkit & more" },
                  { icon: ShoppingBag, title: "E-commerce", desc: "Amazon, Flipkart & more" },
                  { icon: Award, title: "AI Powered", desc: "Smart recommendations" }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 rounded-3xl group hover:border-indigo-500/50 transition-all"
                  >
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      className="bg-indigo-600/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    >
                      <item.icon className="w-6 h-6 text-indigo-400" />
                    </motion.div>
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Results Area */}
        {(results.length > 0 || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-white">Your Profile</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(["budget", "student", "gamer"] as UserProfile[]).map((p) => (
                    <motion.button
                      key={p}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUserProfile(p)}
                      className={`capitalize px-4 py-2 rounded-xl text-sm font-medium transition-all ${userProfile === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-slate-500 leading-tight">AI adjusts recommendations based on your usage profile.</p>
              </div>

              <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-white">Filters</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Price: ₹{(maxPrice || 0).toLocaleString()}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100000" 
                      step="100"
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Delivery: {maxDelivery} hrs</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="72" 
                      step="1"
                      value={maxDelivery} 
                      onChange={(e) => setMaxDelivery(Number(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                  <ArrowUpDown className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-lg text-white">Sort By</h3>
                </div>
                
                <div className="flex flex-col gap-2">
                  {[
                    { id: "score", label: "AI Recommendation" },
                    { id: "price", label: "Lowest Price" },
                    { id: "delivery", label: "Fastest Delivery" },
                    { id: "rating", label: "Top Rated" }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSortBy(opt.id as any)}
                      className={`text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${sortBy === opt.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-400 font-medium">AI is analyzing platforms...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 text-red-400 p-6 rounded-3xl text-center font-medium border border-red-500/20">
                  {error}
                </div>
              ) : (
                <>
                  {/* AI Recommendation Highlight */}
                  {bestChoice && sortBy === "score" && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glow-border bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
                    >
                      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                              <Award className="w-5 h-5 text-yellow-400" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-100">AI Recommendation</span>
                          </div>
                          <h2 className="text-4xl font-black mb-2 tracking-tight leading-tight">{bestChoice.name}</h2>
                          <p className="text-indigo-100/80 text-lg">Best overall value on <span className="font-bold text-white underline decoration-indigo-400 underline-offset-4">{bestChoice.platform}</span></p>
                        </div>
                        <div className="text-center md:text-right">
                          <div className="text-5xl font-black mb-2 tracking-tighter">₹{(bestChoice.price || 0).toLocaleString()}</div>
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl inline-block text-sm font-bold">
                            You Save ₹{(bestChoice.savings || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                      {filteredAndSortedResults.map((product, i) => (
                        <motion.div
                          layout
                          key={product.id}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: i * 0.05,
                            type: "spring",
                            stiffness: 100
                          }}
                          className={`glass-card p-6 rounded-3xl transition-all hover:border-indigo-500/40 group ${product.isBestChoice ? 'ring-2 ring-indigo-500/30' : ''}`}
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block ${
                                  product.platform === 'Amazon' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                  product.platform === 'Flipkart' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                  {product.platform}
                                </span>
                                {product.bestTimeToBuy && (
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                                    product.bestTimeToBuy.includes('Wait') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  }`}>
                                    <Clock className="w-3 h-3" />
                                    {product.bestTimeToBuy}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{product.name}</h3>
                              {product.aiVerdict && (
                                <p className="text-xs text-slate-400 font-medium mt-2 italic leading-relaxed">“{product.aiVerdict}”</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-2xl font-black text-white">
                                {product.isSearchLink ? "View Results" : `₹${(product.price || 0).toLocaleString()}`}
                              </div>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <div className="text-xs text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</div>
                              )}
                              {product.savings > 0 && (
                                <div className="text-xs font-bold text-green-400 mt-0.5">Save ₹{(product.savings || 0).toLocaleString()}</div>
                              )}
                              {product.isFakeDiscount && (
                                <div className="mt-2 text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center justify-end gap-1">
                                  <Info className="w-2.5 h-2.5" />
                                  Fake Discount Alert
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                              <div className="bg-slate-900 p-1.5 rounded-lg">
                                <Clock className="w-4 h-4 text-slate-400" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Delivery</p>
                                <p className="text-sm font-bold text-slate-200">
                                  {product.isSearchLink ? "Varies" : (product.deliveryTime < 1 ? `${product.deliveryTime * 60}m` : `${product.deliveryTime}h`)}
                                </p>
                              </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                              <div className="bg-slate-900 p-1.5 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rating</p>
                                <p className="text-sm font-bold text-slate-200">{product.isSearchLink ? "Top" : `${product.rating}/5`}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-5 border-t border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                                  style={{ width: `${product.score * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">AI Score</span>
                            </div>
                            <a 
                              href={product.buyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                              {product.isSearchLink ? "Search Site" : "Get Deal"}
                            </a>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {filteredAndSortedResults.length === 0 && (
                    <div className="text-center py-20 glass-card rounded-[2.5rem] border-dashed border-white/10">
                      <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white">No products found</h3>
                      <p className="text-slate-400 mt-2">Try adjusting your filters or search query.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-medium">© 2026 SmartShop AI Aggregator. Real-time data from multiple platforms.</p>
        </div>
      </footer>
      <ChatBot />
    </div>
  );
}
