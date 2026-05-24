import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Check, Crown, Gem, Sparkles, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Plan {
  id: string;
  name: string;
  icon: React.ElementType;
  price: string;
  period: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'silver',
    name: 'Silver',
    icon: Star,
    price: '₹0',
    period: 'Forever Free',
    description: 'Perfect for beginners exploring investing basics.',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    iconBg: 'bg-slate-100',
    features: [
      '₹1,00,000 virtual trading capital',
      'Basic market simulator access',
      '3 beginner learning modules',
      'AI chatbot (limited queries/day)',
      'Portfolio risk analysis',
      'Community forum access',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    price: '₹499',
    period: '/month',
    description: 'For serious learners building real confidence.',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconBg: 'bg-amber-100',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      '₹5,00,000 virtual trading capital',
      'Full market simulator with 50+ stocks',
      'All learning modules + quizzes',
      'Unlimited AI chatbot access',
      'Advanced portfolio analytics',
      'Real-time market data feeds',
      'Custom watchlists & alerts',
      'Priority email support',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: Gem,
    price: '₹699',
    period: '/month',
    description: 'For aspiring pros who want the full experience.',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    iconBg: 'bg-violet-100',
    badge: 'Best Value',
    features: [
      '₹10,00,000 virtual trading capital',
      'Full simulator + options & futures',
      'All modules + certification',
      'Unlimited AI with personalized advice',
      'Advanced analytics + tax planning',
      'Real-time data + research reports',
      '1-on-1 mentor sessions (2/month)',
      'Priority 24/7 support',
      'Early access to new features',
      'Investment certificate on completion',
    ],
  },
];

const COMPARISON_FEATURES = [
  { name: 'Virtual Capital', silver: '₹1 Lakh', gold: '₹5 Lakhs', platinum: '₹10 Lakhs' },
  { name: 'Market Simulator', silver: 'Basic', gold: 'Advanced', platinum: 'Full Suite' },
  { name: 'Learning Modules', silver: '3 Modules', gold: 'All Modules', platinum: 'All + Certificate' },
  { name: 'AI Chatbot', silver: '10 queries/day', gold: 'Unlimited', platinum: 'Unlimited + Personal' },
  { name: 'Portfolio Analytics', silver: 'Basic', gold: 'Advanced', platinum: 'Advanced + Tax' },
  { name: 'Real-time Data', silver: '—', gold: '✓', platinum: '✓ + Research' },
  { name: 'Watchlists & Alerts', silver: '—', gold: '✓', platinum: '✓' },
  { name: 'Mentor Sessions', silver: '—', gold: '—', platinum: '2/month' },
  { name: 'Support', silver: 'Community', gold: 'Email', platinum: '24/7 Priority' },
  { name: 'Certification', silver: '—', gold: '—', platinum: '✓' },
];

export default function Plans() {
  const { userData } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>(userData?.plan || 'silver');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (plan: Plan) => {
    if (plan.id === 'silver') return plan.price;
    if (billingCycle === 'yearly') {
      const monthly = parseInt(plan.price.replace(/[₹,]/g, ''));
      const yearlyDiscount = Math.round(monthly * 12 * 0.8); // 20% off yearly
      return `₹${yearlyDiscount.toLocaleString('en-IN')}`;
    }
    return plan.price;
  };

  const getPeriod = (plan: Plan) => {
    if (plan.id === 'silver') return plan.period;
    return billingCycle === 'yearly' ? '/year' : plan.period;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-brand-accent" />
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Choose Your Plan</h2>
        </div>
        <p className="text-slate-500 max-w-lg mx-auto">Invest in your financial education. Every plan includes our core simulator and learning platform.</p>
      </header>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={cn("text-sm font-bold", billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400')}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors",
            billingCycle === 'yearly' ? 'bg-brand-primary' : 'bg-slate-300'
          )}
        >
          <div className={cn(
            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform",
            billingCycle === 'yearly' ? 'left-7' : 'left-0.5'
          )} />
        </button>
        <span className={cn("text-sm font-bold", billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400')}>
          Yearly <span className="text-emerald-600 text-xs font-black">SAVE 20%</span>
        </span>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const isSelected = selectedPlan === plan.id;
          const Icon = plan.icon;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border-2 p-6 transition-all",
                plan.highlighted ? 'border-amber-400 shadow-xl shadow-amber-100' :
                isSelected ? 'border-brand-primary shadow-lg' : `${plan.borderColor} shadow-sm`,
                plan.highlighted && 'ring-2 ring-amber-400/30'
              )}
            >
              {plan.badge && (
                <div className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  plan.highlighted ? 'bg-amber-400 text-amber-900' : 'bg-violet-500 text-white'
                )}>
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.iconBg)}>
                    <Icon className={cn("w-6 h-6", plan.color)} />
                  </div>
                  <div>
                    <h3 className={cn("text-xl font-black", plan.color)}>{plan.name}</h3>
                    <p className="text-xs text-slate-500">{plan.description}</p>
                  </div>
                </div>

                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-slate-900">{getPrice(plan)}</span>
                  <span className="text-sm text-slate-500 font-bold mb-1">{getPeriod(plan)}</span>
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all",
                    plan.highlighted 
                      ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200'
                      : plan.id === 'platinum'
                      ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                      : isSelected
                      ? 'bg-brand-primary text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  )}
                >
                  {plan.id === 'silver' ? 'Current Plan' : `Choose ${plan.name}`}
                </button>

                <div className="space-y-3 pt-2">
                  {plan.features.map((feature, fi) => (
                    <div key={fi} className="flex items-start gap-2.5">
                      <Check className={cn("w-4 h-4 flex-shrink-0 mt-0.5", plan.color)} />
                      <span className="text-xs text-slate-600 font-medium leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Feature</th>
                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-wider">
                  <Star className="w-4 h-4 mx-auto mb-1 text-slate-400" />Silver
                </th>
                <th className="px-6 py-4 text-center text-xs font-black text-amber-600 uppercase tracking-wider">
                  <Crown className="w-4 h-4 mx-auto mb-1 text-amber-500" />Gold
                </th>
                <th className="px-6 py-4 text-center text-xs font-black text-violet-600 uppercase tracking-wider">
                  <Gem className="w-4 h-4 mx-auto mb-1 text-violet-500" />Platinum
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {COMPARISON_FEATURES.map((feature, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">{feature.name}</td>
                  <td className="px-6 py-3 text-center text-sm text-slate-500">{feature.silver}</td>
                  <td className="px-6 py-3 text-center text-sm font-medium text-amber-700">{feature.gold}</td>
                  <td className="px-6 py-3 text-center text-sm font-medium text-violet-700">{feature.platinum}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-2xl text-white">
        <h3 className="font-black text-lg uppercase tracking-widest mb-6">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { q: 'Is this real money?', a: 'No! Dhan Nivesh uses virtual money only. You practice investing with zero financial risk.' },
            { q: 'Can I switch plans anytime?', a: 'Yes, upgrade or downgrade your plan at any time. Changes take effect immediately.' },
            { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay.' },
            { q: 'Is there a free trial?', a: 'Silver plan is free forever. Gold and Platinum come with a 7-day free trial.' },
          ].map((faq, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/10">
              <h4 className="font-bold text-sm mb-2">{faq.q}</h4>
              <p className="text-xs text-emerald-100/80 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
