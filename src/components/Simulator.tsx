import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { saveLocalUserData } from '../lib/localAuth';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Search, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2850, type: 'stock', volatility: 'low' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3450, type: 'stock', volatility: 'low' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 160, type: 'stock', volatility: 'high' },
  { symbol: 'BITCOIN', name: 'Bitcoin (Virtual)', price: 5400000, type: 'crypto', volatility: 'extra_high' },
  { symbol: 'ETH', name: 'Ethereum (Virtual)', price: 320000, type: 'crypto', volatility: 'extra_high' },
  { symbol: 'GOLD', name: 'Digital Gold', price: 6500, type: 'commodity', volatility: 'low' },
];

export default function Simulator() {
  const { user, userData, isLocalMode } = useAuth();
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [portfolio, setPortfolio] = useState<any>({});
  const [currentBalance, setCurrentBalance] = useState<number>(userData?.balance || 100000);

  // Load portfolio and balance from localStorage on mount
  useEffect(() => {
    const isDemoMode = localStorage.getItem('dhanNiveshDemoMode') === 'true';
    if (isDemoMode || isLocalMode) {
      const savedPortfolio = JSON.parse(localStorage.getItem('dhanNiveshPortfolio') || '{}');
      setPortfolio(savedPortfolio);

      if (isDemoMode) {
        const demoUser = JSON.parse(localStorage.getItem('dhanNiveshUser') || '{}');
        setCurrentBalance(demoUser.balance || 100000);
      } else if (isLocalMode && userData) {
        setCurrentBalance(userData.balance || 100000);
      }
    }
  }, [isLocalMode, userData]);

  const checkRisk = async () => {
    if (!selectedStock || amount <= 0) return true;
    
    // "Stop Me System" Logic
    const percentageOfBalance = (amount * selectedStock.price) / (currentBalance || 1);
    
    if (percentageOfBalance > 0.5) {
      setWarning(`This trade represents ${Math.round(percentageOfBalance * 100)}% of your balance. Putting too much in one asset is risky for beginners!`);
      return false;
    }
    
    if (selectedStock.volatility === 'extra_high' && (userData?.riskProfile === 'conservative')) {
      setWarning(`You have a conservative profile, but you're buying a very high-risk crypto asset. Are you sure?`);
      return false;
    }

    return true;
  };

  const handleBuy = async (confirmed = false) => {
    if (!user || !selectedStock || amount <= 0) return;
    
    if (!confirmed) {
      const isSafe = await checkRisk();
      if (!isSafe) return;
    }

    setIsProcessing(true);
    setWarning(null);

    try {
      const cost = amount * selectedStock.price;
      if (cost > currentBalance) {
        setWarning("Insufficient virtual balance.");
        setIsProcessing(false);
        return;
      }

      // Check if in demo or local mode
      const isDemoMode = localStorage.getItem('dhanNiveshDemoMode') === 'true';

      if (isDemoMode || isLocalMode) {
        // Use localStorage for demo/local mode
        const updatedPortfolio = JSON.parse(localStorage.getItem('dhanNiveshPortfolio') || '{}');

        if (updatedPortfolio[selectedStock.symbol]) {
          const existing = updatedPortfolio[selectedStock.symbol];
          existing.quantity += amount;
          existing.avgPrice = (existing.avgPrice * (existing.quantity - amount) + amount * selectedStock.price) / existing.quantity;
          existing.updatedAt = new Date().toISOString();
        } else {
          updatedPortfolio[selectedStock.symbol] = {
            userId: user.uid,
            assetName: selectedStock.name,
            symbol: selectedStock.symbol,
            assetType: selectedStock.type,
            quantity: amount,
            avgPrice: selectedStock.price,
            createdAt: new Date().toISOString()
          };
        }

        localStorage.setItem('dhanNiveshPortfolio', JSON.stringify(updatedPortfolio));
        setPortfolio(updatedPortfolio);

        // Update balance
        const newBalance = currentBalance - cost;
        if (isLocalMode) {
          saveLocalUserData(user.uid, { ...userData, balance: newBalance });
        } else {
          const demoUser = JSON.parse(localStorage.getItem('dhanNiveshUser') || '{}');
          demoUser.balance = newBalance;
          localStorage.setItem('dhanNiveshUser', JSON.stringify(demoUser));
        }
        setCurrentBalance(newBalance);
      } else {
        // Use Firestore for authenticated users
        const portfolioRef = doc(db, `users/${user.uid}/portfolio`, selectedStock.symbol);
        const portfolioDoc = await getDoc(portfolioRef);

        if (portfolioDoc.exists()) {
          const existingData = portfolioDoc.data();
          await updateDoc(portfolioRef, {
            quantity: existingData.quantity + amount,
            avgPrice: (existingData.avgPrice * existingData.quantity + amount * selectedStock.price) / (existingData.quantity + amount),
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(portfolioRef, {
            userId: user.uid,
            assetName: selectedStock.name,
            symbol: selectedStock.symbol,
            assetType: selectedStock.type,
            quantity: amount,
            avgPrice: selectedStock.price,
            createdAt: serverTimestamp()
          });
        }

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          balance: userData.balance - cost
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedStock(null);
      }, 3000);
      setAmount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to complete trade";
      console.error("Trade error:", err);
      setWarning(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate portfolio value
  const calculatePortfolioValue = () => {
    return Object.values(portfolio).reduce((total: number, holding: any) => {
      return total + (holding.quantity * holding.avgPrice);
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="text-center space-y-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Virtual Market</h2>
        <p className="text-gray-500">Practice investing with zero risk. Your demo capital is waiting.</p>
      </header>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">Available Capital</p>
          <h3 className="text-3xl font-black text-blue-900 mt-1">₹{currentBalance.toLocaleString()}</h3>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
          <p className="text-green-600 font-bold text-sm uppercase tracking-wider">Portfolio Value</p>
          <h3 className="text-3xl font-black text-green-900 mt-1">₹{portfolioValue.toLocaleString()}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {STOCKS.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock)}
                className={`w-full p-4 flex items-center justify-between hover:bg-indigo-50/50 transition-colors ${selectedStock?.symbol === stock.symbol ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-bold text-gray-900">{stock.symbol}</span>
                  <span className="text-xs text-gray-500">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{stock.price.toLocaleString()}</div>
                  <div className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    stock.volatility === 'low' ? 'bg-green-100 text-green-700' : 
                    stock.volatility === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {stock.volatility.replace('_', ' ')} risk
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trade Panel */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedStock ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{selectedStock.symbol}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{selectedStock.name}</p>
                  </div>
                  <div className="text-2xl font-black text-brand-primary">₹{selectedStock.price.toLocaleString()}</div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity to Acquire</label>
                  <input 
                    type="number" 
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full text-5xl font-black p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-primary transition-all text-center tracking-tighter"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">
                    <span>Est. Cost: ₹{(amount * selectedStock.price).toLocaleString()}</span>
                    <span>Available: ₹{currentBalance.toLocaleString()}</span>
                  </div>
                </div>

                {warning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-orange-50 border border-orange-200 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-2 text-orange-900">
                      <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-[10px] text-white font-black italic">!</div>
                      <h4 className="font-black text-xs uppercase tracking-widest leading-none mt-0.5">STOP ME SYSTEM</h4>
                    </div>
                    <p className="text-xs text-orange-800 font-medium leading-relaxed">{warning}</p>
                    <div className="pt-2 flex gap-2">
                       <button 
                        onClick={() => handleBuy(true)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-orange-700"
                      >
                        Override & Confirm
                      </button>
                      <button 
                        onClick={() => setWarning(null)}
                        className="bg-white text-orange-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-200 hover:bg-orange-50"
                      >
                        Risk Adjustment
                      </button>
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={() => handleBuy()}
                  disabled={isProcessing || !amount}
                  className="w-full brand-gradient text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-primary/20"
                >
                  {isProcessing ? "Executing Order..." : `Initiate Purchase`}
                </button>

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-green-600 font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Successfully bought {selectedStock.symbol}!
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-gray-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900">Select an Asset</h3>
                  <p className="text-sm text-gray-500 max-w-[200px]">Choose a stock or crypto from the left to start a virtual trade.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Holdings Section */}
      {Object.keys(portfolio).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-black text-lg text-gray-900">Your Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-black text-gray-600 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-3 text-right text-xs font-black text-gray-600 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(portfolio).map(([symbol, holding]: any) => (
                  <tr key={symbol} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{symbol}</p>
                        <p className="text-xs text-gray-500">{holding.assetName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{holding.quantity}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">₹{holding.avgPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-green-600">₹{(holding.quantity * holding.avgPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
