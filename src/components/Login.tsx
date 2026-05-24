import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { TrendingUp, Sparkles, Shield, GraduationCap, AlertCircle, Loader, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

type AuthMode = 'login' | 'signup';

export default function Login() {
  const { login, loginAsDemo, loginWithEmail, signupWithEmail, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const features = [
    { icon: Shield, title: 'Risk-Free Practice', desc: 'Invest ₹1 Lakh virtual money without any real risk.' },
    { icon: Sparkles, title: 'AI Guidance', desc: 'Get personalized insights and jargon-free explanations.' },
    { icon: GraduationCap, title: 'Smart Learning', desc: 'Master personal finance with beginner modules.' },
  ];

  const clearErrors = () => {
    setLoginError(null);
    clearError();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    setName('');
    setPassword('');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await login();
    } catch (err) {
      setLoginError("Google login failed. Try Email or Demo Login instead.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setLoginError(null);
    try {
      await loginWithEmail(email.trim(), password);
    } catch (err) {
      setLoginError(null); // AuthContext sets the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);
    setLoginError(null);
    try {
      await signupWithEmail(name.trim(), email.trim(), password);
    } catch (err) {
      setLoginError(null); // AuthContext sets the error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setLoginError(null);
    try {
      await loginAsDemo();
    } catch (err) {
      setLoginError("Demo login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row w-full">
      {/* Left Section */}
      <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-20 flex flex-col justify-center space-y-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <TrendingUp className="text-white w-7 h-7" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Dhan <span className="text-brand-primary">Nivesh</span></span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-brand-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Premier Investment Academy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              HAR SAPNA,
              <br />
              <span className="text-transparent bg-clip-text" style={{backgroundImage: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)'}}>SMART NIVESH.</span>
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl font-medium leading-relaxed italic border-l-4 border-brand-accent/50 pl-6">
            "The AI-powered investing platform designed for your first wealth journey. Bridge the gap from confusion to confidence."
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {(loginError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900">{loginError || error}</p>
            </div>
          </motion.div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignup} className="space-y-3">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 brand-gradient text-white rounded-xl font-black uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <><Loader className="w-5 h-5 animate-spin" />{mode === 'login' ? 'Signing in...' : 'Creating Account...'}</>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Social + Demo Buttons */}
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-3 border border-slate-300 shadow-sm w-full"
          >
            <div className="bg-white rounded-full p-0.5">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            </div>
            Continue with Google
          </button>

          <button 
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-3 w-full"
          >
            {isLoading ? (
              <><Loader className="w-5 h-5 animate-spin" />Loading...</>
            ) : (
              <><Sparkles className="w-5 h-5" />Quick Demo Login</>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center font-medium">Demo Mode: Explore all features with mock data instantly</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex w-1/2 brand-gradient p-20 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent rounded-full blur-3xl opacity-50" />
        </div>
        <div className="grid grid-cols-1 gap-8 max-w-lg relative z-10">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.3 }}
              key={i} 
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex gap-6 items-start group hover:bg-white/20 transition-all cursor-default"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
                <f.icon className="w-8 h-8 text-brand-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-emerald-100/70 font-medium leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
