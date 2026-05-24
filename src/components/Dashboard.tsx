import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Sparkles, ShieldAlert, TrendingUp, ArrowUpRight, IndianRupee, BarChart3, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { user, userData, isDemoMode, isLocalMode } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    if (!user) return;
    
    if (isDemoMode || isLocalMode) {
      const savedPortfolio = JSON.parse(localStorage.getItem('dhanNiveshPortfolio') || '{}');
      const items = Object.entries(savedPortfolio).map(([id, data]: [string, any]) => ({ id, ...data }));
      setPortfolio(items);
      const value = items.reduce((acc, item: any) => acc + (item.quantity * item.avgPrice), 0);
      setTotalValue(value);
      return;
    }

    const q = query(collection(db, `users/${user.uid}/portfolio`));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPortfolio(items);
      const value = items.reduce((acc, item: any) => acc + (item.quantity * item.avgPrice), 0);
      setTotalValue(value);
    }, (error) => {
      console.warn('Firestore snapshot error:', error.message);
    });
  }, [user, isDemoMode, isLocalMode]);

  const explainMoney = async () => {
    setIsExplaining(true);
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investmentData: portfolio }),
      });
      
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setExplanation(data.explanation || "Unable to fetch explanation");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection error";
      setExplanation(`Error: ${errorMessage}. Please try again later.`);
    } finally {
      setIsExplaining(false);
    }
  };

  const assetDistribution = portfolio.reduce((acc: any[], item: any) => {
    const existing = acc.find(a => a.name === item.assetType);
    if (existing) {
      existing.value += (item.quantity * item.avgPrice);
    } else {
      acc.push({ name: item.assetType, value: (item.quantity * item.avgPrice) });
    }
    return acc;
  }, []);

  const riskScore = portfolio.reduce((acc, item) => {
    const weights: Record<string, number> = { 'stock': 3, 'crypto': 10, 'commodity': 1, 'mutual_fund': 2 };
    return acc + (weights[item.assetType] || 5);
  }, 0) / (portfolio.length || 1);

  const getRiskLevel = (score: number) => {
    if (score < 3) return { label: 'Conservative', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score < 7) return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Aggressive', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const risk = getRiskLevel(riskScore);
  const balance = userData?.balance || 100000;
  const totalWealth = balance + totalValue;

  // Dynamic chart data based on portfolio
  const chartData = portfolio.length > 0 
    ? Array.from({ length: 7 }, (_, i) => ({
        name: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        value: Math.round(totalValue * (0.85 + Math.random() * 0.05 * i))
      }))
    : [
        { name: 'Mon', value: 4000 },
        { name: 'Tue', value: 3000 },
        { name: 'Wed', value: 3500 },
        { name: 'Thu', value: 3200 },
        { name: 'Fri', value: 4100 },
        { name: 'Sat', value: 4500 },
        { name: 'Sun', value: totalValue || 4500 },
      ];

  // Stats cards
  const stats = [
    { 
      label: 'Total Wealth', 
      value: `₹${totalWealth.toLocaleString()}`, 
      icon: IndianRupee, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'Portfolio Value', 
      value: `₹${totalValue.toLocaleString()}`, 
      icon: BarChart3, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Available Cash', 
      value: `₹${balance.toLocaleString()}`, 
      icon: PiggyBank, 
      color: 'text-violet-600', 
      bg: 'bg-violet-50' 
    },
    { 
      label: 'Holdings', 
      value: `${portfolio.length} Asset${portfolio.length !== 1 ? 's' : ''}`, 
      icon: TrendingUp, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Portfolio Summary</h1>
        <p className="text-slate-500 font-medium text-sm">Monitoring your path to ₹1 Crore wealth.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{stat.label}</p>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("w-4 h-4", stat.color)} />
                </div>
              </div>
              <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Main Stats */}
        <div className="md:col-span-2 bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Current Portfolio Value</p>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">₹{totalValue.toLocaleString()}</h2>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                <TrendingUp size={14} />
                +2.49%
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Total Return</p>
            </div>
          </div>

          <div className="h-48 md:h-64 w-full" style={{ minHeight: '12rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#059669" 
                  strokeWidth={3} 
                  dot={{ r: 0 }} 
                  activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Distribution Pie Chart */}
        <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Asset Allocation</p>
          {assetDistribution.length > 0 ? (
            <div className="h-40 md:h-48 w-full" style={{ minHeight: '10rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-slate-300 py-8 flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-slate-50 rounded-full border-4 border-dashed border-slate-100" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Assets Yet</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
            {assetDistribution.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Risk Analysis */}
        <div className="lg:col-span-4 bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Risk Analysis</h3>
          </div>
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
            <div className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 shadow-sm", risk.bg, risk.color)}>
              {risk.label} Risk
            </div>
            <div className="text-xs text-slate-500 font-medium px-2">
              {risk.label === 'Aggressive' 
                ? "High-volatility assets detected. Expect sharp swings." 
                : risk.label === 'Moderate'
                ? "Balanced approach. Good for long-term growth."
                : "Focused on stability and security."}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Diversity Score</span>
              <span className="text-slate-900">{portfolio.length > 0 ? Math.min(10, 3 + assetDistribution.length * 2) : 0}/10</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-primary rounded-full transition-all duration-500"
                style={{ width: `${portfolio.length > 0 ? Math.min(100, (3 + assetDistribution.length * 2) * 10) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 italic">
              {assetDistribution.length < 3 ? "Adding different asset types can boost your score." : "Good diversification! Keep it up."}
            </p>
          </div>
        </div>

        {/* Goal Tracking */}
        <div className="lg:col-span-8 bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Goal-Based Progress</h3>
          </div>
          <div className="space-y-6 relative z-10">
            {[
              { label: "1. Emergency Fund", progress: `₹${Math.round(balance).toLocaleString()} / ₹2,00,000`, pct: Math.min(100, (balance / 200000) * 100) },
              { label: "2. First ₹1 Lakh Invested", progress: `₹${totalValue.toLocaleString()} / ₹1,00,000`, pct: Math.min(100, (totalValue / 100000) * 100) },
              { label: "3. Retirement Fund", progress: `₹${Math.round(totalValue * 0.1).toLocaleString()} / ₹50,00,000`, pct: Math.min(100, (totalValue * 0.1 / 5000000) * 100) },
            ].map((goal, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-800 text-xs md:text-sm">{goal.label}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{goal.progress}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.pct}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      goal.pct >= 100 ? "bg-emerald-500" : "bg-brand-primary"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl group-hover:bg-brand-accent/5 transition-colors duration-700" />
        </div>
      </div>

      {/* Explain My Money AI Section */}
      <div className="brand-gradient p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-brand-primary/30 flex flex-col lg:flex-row items-center gap-8 md:gap-12">
        <div className="lg:w-1/2 relative z-10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight italic">EXPLAIN MY MONEY</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">AI Deep-Dive Analysis</p>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {explanation ? (
              <motion.div 
                key="exp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-400/20 text-sm leading-relaxed font-bold text-emerald-50 shadow-inner italic"
              >
                "{explanation}"
              </motion.div>
            ) : (
              <p className="text-emerald-100 font-bold text-base md:text-lg leading-snug tracking-tight">
                Not sure where your money really is? Our AI Expert Guide will reveal exactly how your wealth is protected and where it's growing.
              </p>
            )}
          </AnimatePresence>

          <button 
            onClick={explainMoney}
            disabled={isExplaining}
            className="bg-white text-emerald-900 px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-accent hover:text-white transition-all disabled:opacity-50 shadow-xl shadow-black/10 active:scale-95"
          >
            {isExplaining ? "Expert is Analyzing..." : "Start AI Analysis"}
          </button>
        </div>

        <div className="lg:w-1/2 relative z-10 flex justify-center">
          <div className="relative">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-8 border-white/5 flex items-center justify-center p-4 relative">
              <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-2xl animate-pulse" />
              <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-brand-accent group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-[100%] h-[100%] bg-white rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
