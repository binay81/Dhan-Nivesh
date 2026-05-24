import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// CORS and security middleware
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize Gemini
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY not set. AI features will use fallback responses.');
}

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

const SYSTEM_PROMPT = `You are Dhan Nivesh AI, a warm, knowledgeable, and beginner-friendly investment advisor for people in India. Your personality is encouraging, patient, and clear.

Rules:
1. Always explain financial concepts in simple, everyday language. Avoid jargon or explain it immediately.
2. Give practical, actionable advice suitable for Indian investors (mention Indian instruments like Nifty 50, PPF, ELSS, SIPs, etc. when relevant).
3. Use rupees (₹) for monetary examples.
4. If asked about specific stock recommendations, provide general education instead: explain HOW to evaluate stocks, not WHICH to buy.
5. Keep answers concise but thorough - aim for 2-4 paragraphs max.
6. Use bullet points or numbered lists for steps.
7. Always remind users that this is educational content, not personalized financial advice.
8. Be conversational and encouraging - celebrate their curiosity about investing!
9. If a question is not about finance/investing, politely redirect to investing topics.
10. Use relatable analogies when possible (e.g., "Think of diversification like not putting all your eggs in one basket").

Topics you should be knowledgeable about:
- Stock market basics (NSE, BSE, Nifty, Sensex)
- Mutual funds (SIP, lumpsum, ELSS, index funds)
- Fixed deposits, PPF, NPS
- Gold investment (digital gold, sovereign gold bonds)
- Cryptocurrency basics
- Insurance (term, health)
- Tax planning (Section 80C, 80D, LTCG, STCG)
- Budgeting and saving
- Retirement planning
- Real estate investment
- Portfolio diversification
- Risk management
- Beginner trading concepts`;

// Comprehensive fallback knowledge base for when Gemini is unavailable
const knowledgeBase: { keywords: string[]; response: string }[] = [
  {
    keywords: ['mutual', 'fund', 'mf'],
    response: "Mutual Funds pool money from many investors to invest in stocks, bonds, or other assets. A professional fund manager decides where to invest.\n\n**Types for Beginners:**\n• **Index Funds** — Track Nifty 50/Sensex, lowest fees (0.1-0.5%), best for beginners\n• **ELSS** — Tax-saving under Section 80C, 3-year lock-in\n• **Debt Funds** — Invest in bonds, lower risk, 6-8% returns\n\n**How to Start:** Open a SIP (Systematic Investment Plan) with just ₹500/month. It automatically invests a fixed amount regularly, building discipline and reducing market timing risk. Think of it as a recurring deposit for wealth building!\n\n💡 *Pro tip: Start with a Nifty 50 Index Fund via SIP — it's the simplest way to begin investing.*"
  },
  {
    keywords: ['sip', 'systematic'],
    response: "**SIP (Systematic Investment Plan)** is the easiest way to start investing! You invest a fixed amount regularly (monthly/quarterly) into a mutual fund.\n\n**Why SIP is perfect for beginners:**\n• Start with just ₹500/month\n• No need to time the market — rupee cost averaging works automatically\n• Builds investing discipline like a habit\n• Compounds dramatically over time\n\n**Real Example:** ₹5,000/month SIP in Nifty 50 Index Fund (12% avg return):\n• 5 years → ₹4.1 lakhs\n• 10 years → ₹11.6 lakhs\n• 20 years → ₹50 lakhs\n• 30 years → ₹1.76 crores!\n\nThat's the magic of compound interest! Start small, stay consistent.\n\n💡 *The best time to start a SIP was yesterday. The second best time is today.*"
  },
  {
    keywords: ['stock', 'share', 'equity'],
    response: "**Stocks (Shares)** represent partial ownership in a company. When you buy a Reliance share, you literally own a tiny piece of Reliance!\n\n**How Stock Prices Work:**\n• Prices move based on supply & demand\n• If more people want to buy → price goes up\n• If more people want to sell → price goes down\n\n**Key Terms to Know:**\n• **P/E Ratio** — How expensive a stock is relative to earnings (lower = potentially undervalued)\n• **Market Cap** — Total value of all shares (large cap = safer, small cap = riskier)\n• **Dividend** — Cash a company pays you from profits\n\n**For Beginners:** Start with index funds instead of individual stocks. They give you a basket of top companies with lower risk. Once you understand the market better, explore individual stocks.\n\n💡 *Never invest money in stocks that you might need within 5 years.*"
  },
  {
    keywords: ['crypto', 'bitcoin', 'ethereum'],
    response: "**Cryptocurrency** is digital money that uses blockchain technology for secure transactions.\n\n**The Reality:**\n• Extremely volatile — can drop 50% in a week\n• Not regulated by RBI in India\n• 30% tax on profits + 1% TDS on transactions\n\n**If You're Curious:**\n• Only invest 1-2% of your portfolio maximum\n• Never invest emergency funds or borrowed money\n• Bitcoin and Ethereum are the most established\n\n**Honest Take:** For beginners, crypto should NOT be your first investment. Build a solid foundation with index funds, PPF, and FDs first. Once you have a stable portfolio, you can explore crypto with money you can afford to lose.\n\n💡 *Crypto is like the dessert of investing — exciting but not the main course.*"
  },
  {
    keywords: ['etf', 'exchange traded'],
    response: "**ETFs (Exchange Traded Funds)** are like mutual funds that trade on stock exchanges, just like individual shares.\n\n**ETF vs Mutual Fund:**\n• ETFs trade throughout the day at live prices\n• Mutual funds are bought/sold only at end-of-day NAV\n• ETFs usually have lower fees (0.05-0.2%)\n• You need a Demat account for ETFs\n\n**Best ETFs for Beginners:**\n• **Nifty 50 ETF** — Tracks India's top 50 companies\n• **Nifty Next 50 ETF** — Next 50 large companies\n• **Gold ETF** — Invest in gold without buying physical gold\n• **Liquid ETF** — For short-term parking of funds\n\n💡 *If you have a Demat account, ETFs are the most cost-efficient way to invest in indices!*"
  },
  {
    keywords: ['tax', '80c', 'section', 'saving'],
    response: "**Tax-Saving Strategies for Indian Investors:**\n\n**Section 80C (Save up to ₹1.5 lakhs):**\n• PPF — 15 years, 7.1% tax-free returns\n• ELSS Mutual Funds — 3-year lock-in, market returns\n• NPS — Retirement, extra ₹50K deduction\n• 5-Year FD — Safe but locked\n\n**Capital Gains Tax:**\n• Equity (held 1+ year): 10% LTCG above ₹1 lakh/year\n• Equity (held <1 year): 15% STCG\n• Debt: Taxed at your income slab rate\n\n**Pro Tips:**\n1. Max out PPF first (safest tax-free returns)\n2. Use ELSS for 80C if you want equity exposure\n3. Hold stocks 1+ year for lower tax rate\n4. Use NPS for the extra ₹50K deduction\n\n💡 *Tax planning is not tax evasion — it's smart money management!*"
  },
  {
    keywords: ['ppf', 'public provident'],
    response: "**PPF (Public Provident Fund)** is one of India's best tax-saving investments!\n\n**Key Features:**\n• Interest: ~7.1% (government-backed, changes quarterly)\n• Tenure: 15 years (extendable in 5-year blocks)\n• Tax: Triple exempt — investment, interest, and maturity all tax-free!\n• Min investment: ₹500/year, Max: ₹1.5 lakhs/year\n\n**Why PPF is Great:**\n• Zero risk — backed by the Government of India\n• EEE (Exempt-Exempt-Exempt) tax status\n• Loan facility available after 3rd year\n• Partial withdrawal allowed from 7th year\n\n**Strategy:** Invest the full ₹1.5L before April 5th each year to maximize interest. Over 15 years at 7.1%, ₹1.5L/year becomes ₹40+ lakhs!\n\n💡 *PPF is the foundation of every smart Indian's portfolio.*"
  },
  {
    keywords: ['gold', 'sovereign', 'digital gold'],
    response: "**Gold Investment Options in India:**\n\n1. **Sovereign Gold Bonds (SGB)** — BEST option! Government-backed, 2.5% annual interest + gold appreciation, tax-free if held to maturity (8 years)\n\n2. **Digital Gold** — Buy gold online starting ₹1, stored in vaults, easy to sell\n\n3. **Gold ETFs** — Trade on stock exchange, need Demat account\n\n4. **Gold Mutual Funds** — No Demat needed, SIP available\n\n5. **Physical Gold** — Jewelry/coins (making charges, storage issues)\n\n**Recommended Allocation:** 5-10% of your portfolio in gold as a stability hedge.\n\n💡 *SGBs are the smartest way to invest in gold — you earn interest AND gold appreciation!*"
  },
  {
    keywords: ['risk', 'safe', 'conservative', 'aggressive'],
    response: "**Understanding Your Risk Profile:**\n\n🟢 **Conservative** — You can't sleep if markets drop 5%\n→ Portfolio: 70% debt + 20% equity + 10% gold\n→ Focus: PPF, FDs, Debt funds\n\n🟡 **Moderate** — You accept some dips for better returns\n→ Portfolio: 50% equity + 30% debt + 10% gold + 10% other\n→ Focus: Index funds, Balanced funds, PPF\n\n🔴 **Aggressive** — You're comfortable with volatility for higher returns\n→ Portfolio: 70% equity + 15% debt + 10% alternatives + 5% crypto\n→ Focus: Mid/small cap funds, Individual stocks\n\n**How to Decide:** Ask yourself — if your ₹1 lakh investment became ₹70,000 next month, would you:\n• Sell everything? → Conservative\n• Hold and wait? → Moderate  \n• Buy more? → Aggressive\n\n💡 *Your risk tolerance should match your personality, not your ambitions.*"
  },
  {
    keywords: ['portfolio', 'diversif', 'allocat', 'balance'],
    response: "**Portfolio Diversification — Don't put all eggs in one basket!**\n\n**Simple Beginner Portfolio (Moderate Risk):**\n• 40% — Equity Index Funds (Nifty 50/Sensex)\n• 25% — PPF/FD (Guaranteed returns)\n• 15% — Debt Mutual Funds (Stability)\n• 10% — Gold (SGB/Digital Gold)\n• 10% — Emergency Fund (Savings account)\n\n**Why Diversify?**\n• If stocks fall, gold/bonds may rise → reduces overall loss\n• Different assets perform well in different conditions\n• You sleep better knowing not everything is volatile\n\n**Golden Rules:**\n1. Never have more than 10% in a single stock\n2. Always maintain an emergency fund first\n3. Increase debt allocation as you age\n4. Review and rebalance once a year\n\n💡 *A diversified portfolio is like a balanced diet — variety keeps you healthy!*"
  },
  {
    keywords: ['budget', 'save', 'saving', '50-30-20', 'expense'],
    response: "**The 50-30-20 Budgeting Rule:**\n\n💰 **50% — Needs** (Rent, food, bills, EMIs, insurance)\n🎉 **30% — Wants** (Entertainment, dining out, shopping, travel)\n📈 **20% — Savings & Investments** (SIPs, PPF, emergency fund)\n\n**Example on ₹50,000/month salary:**\n• Needs: ₹25,000\n• Wants: ₹15,000\n• Savings: ₹10,000\n\n**Smart Saving Tips:**\n1. Pay yourself first — invest on the 1st, not at month-end\n2. Automate SIPs so you invest before you spend\n3. Build 6-month emergency fund before aggressive investing\n4. Track expenses for 2 months — you'll find ₹2-3K in waste\n5. Avoid lifestyle inflation when salary increases\n\n💡 *Saving isn't about spending less — it's about spending intentionally.*"
  },
  {
    keywords: ['retire', 'retirement', 'pension', 'nps'],
    response: "**Retirement Planning — Start Today, Thank Yourself Later:**\n\n**NPS (National Pension System):**\n• Invest up to ₹2L/year for tax benefits\n• 60% withdrawable at retirement (tax-free)\n• 40% must buy annuity (monthly pension)\n• Mix of equity, debt, and government bonds\n\n**Retirement Strategy by Age:**\n\n**20s-30s:** Aggressive — 70-80% equity SIPs, max PPF, start NPS\n**40s:** Balanced — 50-60% equity, increase debt allocation\n**50s+:** Conservative — Shift to bonds, FDs, keep 20-30% equity for growth\n\n**The Magic of Starting Early:**\n₹5,000/month SIP from age 25 → ₹3.5 crores at 60\n₹5,000/month SIP from age 35 → ₹1.1 crores at 60\nStarting 10 years late = losing ₹2.4 crores!\n\n💡 *The cost of delaying retirement planning is crores, not thousands.*"
  },
  {
    keywords: ['fd', 'fixed deposit', 'deposit'],
    response: "**Fixed Deposits (FDs)** — The safest investment in India!\n\n**Features:**\n• Guaranteed returns (currently 6-7.5% for 1-5 years)\n• Insured up to ₹5 lakhs by DICGC\n• Tenure: 7 days to 10 years\n• Premature withdrawal possible (with penalty)\n\n**Types:**\n• Regular FD — Standard interest rates\n• Senior Citizen FD — Extra 0.5% interest\n• Tax-Saving FD — 5-year lock-in, 80C deduction\n• Cumulative FD — Interest reinvested, paid at maturity\n\n**FD vs Debt Fund:**\n• FD: Fixed returns, taxed at your slab rate\n• Debt Fund: Variable returns, indexation benefit for 3+ years (lower tax)\n\n**Best Use:** Emergency fund parking, short-term goals, very conservative investors.\n\n💡 *FDs won't make you rich, but they'll never make you poor either.*"
  },
  {
    keywords: ['nifty', 'sensex', 'index', 'market'],
    response: "**Understanding Indian Stock Market Indices:**\n\n📈 **Nifty 50** — Top 50 companies on NSE (National Stock Exchange)\n• Covers 13 sectors, represents ~65% of market cap\n• Best way to invest: Nifty 50 Index Fund or ETF\n\n📈 **Sensex** — Top 30 companies on BSE (Bombay Stock Exchange)\n• Oldest index in India, started in 1986\n• Both indices move similarly most of the time\n\n**Historical Returns:**\n• Nifty 50 average: ~12-14% CAGR over 15+ years\n• Best decade: 2000-2010 (17% CAGR)\n• Worst decade: 2010-2020 (9% CAGR)\n\n**How to Invest:**\n1. Index Mutual Fund via SIP (easiest)\n2. ETF in Demat account (lowest fees)\n3. Direct stocks (not recommended for beginners)\n\n💡 *Index investing is the simplest path to wealth — no research needed, just consistency!*"
  },
  {
    keywords: ['insurance', 'term', 'health', 'life'],
    response: "**Insurance — Protect before you invest!**\n\n**Term Life Insurance (Must-Have):**\n• Pure protection — pays family if you die\n• ₹1 Crore cover for just ₹500-800/month (age 25-30)\n• Buy online for best rates\n• NEVER buy ULIPs or endowment plans (mix insurance + investment = bad at both)\n\n**Health Insurance (Must-Have):**\n• Minimum ₹5-10 lakh cover\n• Family floater covers spouse + kids\n• Buy before you have health issues\n• Cashless treatment at network hospitals\n\n**Priority Order:**\n1. Health insurance (medical emergencies can bankrupt you)\n2. Term life insurance (protect family income)\n3. Then start investing\n\n💡 *Insurance is not an investment — it's protection. Never mix the two!*"
  },
  {
    keywords: ['demat', 'account', 'open', 'start', 'begin', 'how'],
    response: "**How to Start Investing — Step by Step:**\n\n**Step 1: Get Your Documents Ready**\n• PAN Card, Aadhaar, Bank account, Mobile + Email\n\n**Step 2: Open a Demat + Trading Account**\n• Zerodha, Groww, Upstox — popular and beginner-friendly\n• Takes 10-15 minutes online\n• Zero account opening fees with most brokers\n\n**Step 3: Start Your First SIP**\n• Open: Nifty 50 Index Fund\n• Amount: ₹500-5,000/month (whatever you can afford)\n• Set up auto-debit from bank account\n\n**Step 4: Build Your Foundation**\n• Emergency fund (6 months expenses in FD/Savings)\n• Health + Term insurance\n• PPF for tax-saving\n\n**Step 5: Learn and Grow**\n• Read: 'The Psychology of Money' by Morgan Housel\n• Follow: SEBI-registered advisors only\n• Avoid: Tips from WhatsApp/Telegram groups!\n\n💡 *The best investment is the one you start today, not the perfect one tomorrow.*"
  },
  {
    keywords: ['compound', 'interest', 'power', 'magic'],
    response: "**Compound Interest — The 8th Wonder of the World:**\n\n**The Concept:** Your returns earn returns, which earn more returns — like a snowball rolling downhill!\n\n**Example: ₹1 Lakh at 12% annual return:**\n• 5 years → ₹1.76 lakhs (+₹76K)\n• 10 years → ₹3.10 lakhs (+₹2.1L)\n• 20 years → ₹9.65 lakhs (+₹8.65L)\n• 30 years → ₹29.96 lakhs (+₹28.96L)\n\n**The Rule of 72:** Divide 72 by your return rate to know when money doubles.\n• At 12%: 72÷12 = 6 years to double\n• At 8%: 72÷8 = 9 years to double\n\n**Key Insight:** The first 10 years feel slow. The next 10 years feel fast. The last 10 years feel magical. This is why STARTING EARLY matters more than INVESTING MORE.\n\n💡 *Time in the market beats timing the market. Every. Single. Time.*"
  },
  {
    keywords: ['emergency', 'fund', 'rainy'],
    response: "**Emergency Fund — Your Financial Safety Net:**\n\n**How Much?** 6 months of essential expenses (rent + food + EMIs + bills)\n\n**Example:** If monthly expenses = ₹30,000 → Emergency fund = ₹1,80,000\n\n**Where to Keep It:**\n1. **Savings Account** — Instant access, 3-4% interest\n2. **Liquid Mutual Fund** — Slightly better returns, 1-day withdrawal\n3. **Short-term FD** — Higher interest, small penalty for early exit\n\n**Split Strategy:** 2 months in savings account + 4 months in liquid fund\n\n**When to Use It:**\n✅ Job loss, medical emergency, urgent home repair\n❌ Sale shopping, vacation, investment opportunity\n\n**Rule:** Rebuild the fund ASAP after using it. This comes BEFORE any investing!\n\n💡 *An emergency fund isn't sexy, but neither is debt. Build it first.*"
  },
  {
    keywords: ['loan', 'emi', 'debt', 'borrow'],
    response: "**Managing Loans and Debt:**\n\n**Good Debt (Productive):**\n• Home loan — Asset appreciates, tax benefits\n• Education loan — Increases earning power\n\n**Bad Debt (Destructive):**\n• Credit card debt — 24-40% interest! Kill this first\n• Personal loans — High interest, no asset\n• EMI on depreciating items (phones, gadgets)\n\n**Debt Payoff Strategy:**\n1. List all debts with interest rates\n2. Pay minimum on all, attack highest-interest first (Avalanche method)\n3. Or attack smallest balance first for motivation (Snowball method)\n\n**Golden Rules:**\n• All EMIs combined should be <40% of income\n• Never take a loan to invest\n• Credit card: Pay full bill, never just minimum\n\n💡 *If you have credit card debt, paying it off gives a guaranteed 24-40% return — better than any investment!*"
  },
  {
    keywords: ['real estate', 'property', 'house', 'flat'],
    response: "**Real Estate Investment in India:**\n\n**Pros:**\n• Tangible asset you can see and use\n• Rental income (2-3% yield typically)\n• Leverage (bank finances 75-80%)\n• Emotional satisfaction of ownership\n\n**Cons:**\n• Huge upfront investment (₹30L-2Cr)\n• Low rental yield vs other investments\n• Illiquid — can't sell quickly\n• Maintenance, taxes, legal hassles\n\n**REITs (Real Estate Investment Trusts):**\n• Invest in commercial real estate from ₹500\n• Trade on stock exchange like shares\n• 6-7% dividend yield\n• No property management headaches\n\n**For Beginners:** Don't rush into buying property. Invest in REITs or financial assets first. Buy a home to LIVE in when you're ready, not as your primary investment.\n\n💡 *Your first home is for living, not investing. Don't confuse the two.*"
  },
];

// Smarter fallback matching
const getSmartFallback = (prompt: string): string | null => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Try keyword matching with score
  let bestMatch: { response: string; score: number } | null = null;
  
  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerPrompt.includes(keyword)) {
        score += keyword.length; // Longer keyword matches score higher
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { response: entry.response, score };
    }
  }
  
  return bestMatch?.response || null;
};

const getGenericFallback = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Greeting
  if (lowerPrompt.match(/^(hi|hello|hey|namaste|hola)/)) {
    return "Hello! 👋 Welcome to Dhan Nivesh! I'm your AI investment guide, here to help you understand the world of investing in simple terms.\n\nYou can ask me about:\n• **Mutual Funds & SIPs** — How to start investing\n• **Stock Market** — Nifty, Sensex, how it works\n• **Tax Saving** — PPF, ELSS, 80C deductions\n• **Gold** — Sovereign bonds, digital gold\n• **Budgeting** — 50-30-20 rule, saving tips\n• **Retirement** — NPS, planning strategies\n\nWhat would you like to learn about today?";
  }
  
  // Thank you
  if (lowerPrompt.match(/(thank|thanks|dhanyavad)/)) {
    return "You're welcome! 😊 Happy to help you on your investing journey. Remember, every expert was once a beginner. Keep asking questions — that's how you learn!\n\nFeel free to ask me anything else about investing, savings, or personal finance.";
  }
  
  // Default
  return "That's a great question! While I specialize in investment education for Indian investors, let me share a general insight:\n\n**Key Investing Principles:**\n1. Start early — time is your biggest asset\n2. Diversify — spread across stocks, bonds, gold\n3. Be consistent — SIPs build discipline\n4. Think long-term — wealth building takes years, not days\n5. Keep learning — knowledge is the best investment\n\nFor more specific guidance, try asking about mutual funds, SIPs, PPF, stock market, tax saving, or any other investment topic. I'm here to help! 🚀";
};

// API Routes
app.post("/api/gemini/analyze", async (req, res) => {
  try {
    const { prompt, systemInstruction, conversationHistory } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Prompt is required and must be a non-empty string" });
    }
    if (prompt.length > 5000) {
      return res.status(400).json({ error: "Prompt exceeds maximum length of 5000 characters" });
    }
    
    // Try Gemini API first
    if (ai) {
      try {
        const fullPrompt = conversationHistory 
          ? `Previous conversation:\n${conversationHistory}\n\nCurrent question: ${prompt}`
          : prompt;

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: fullPrompt,
          config: {
            systemInstruction: (systemInstruction || SYSTEM_PROMPT),
          },
        });
        
        if (response && response.text) {
          return res.json({ answer: response.text });
        }
      } catch (geminiError: any) {
        console.warn("Gemini API error, using fallback:", geminiError?.message?.substring(0, 100));
      }
    }
    
    // Fallback to smart knowledge base
    const smartFallback = getSmartFallback(prompt);
    if (smartFallback) {
      return res.json({ answer: smartFallback });
    }
    
    // Final generic fallback
    return res.json({ answer: getGenericFallback(prompt) });
  } catch (error) {
    console.error("Analyze Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate AI guidance";
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { investmentData } = req.body;
    
    if (!investmentData) {
      return res.status(400).json({ error: "investmentData is required" });
    }
    
    // Try Gemini API first
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `Analyze this investment portfolio for a beginner and explain it simply: ${JSON.stringify(investmentData)}. Include risk assessment, diversification analysis, and actionable suggestions. Keep it encouraging but honest.`,
          config: {
            systemInstruction: SYSTEM_PROMPT + "\n\nYou are analyzing a user's portfolio. Be specific about their holdings and give personalized advice.",
          },
        });
        
        if (response && response.text) {
          return res.json({ explanation: response.text });
        }
      } catch (geminiError: any) {
        console.warn("Gemini explain error, using fallback:", geminiError?.message?.substring(0, 100));
      }
    }
    
    // Fallback
    const mockExplanation = "Your investment portfolio shows a balanced approach! Here's my analysis:\n\n📊 **Diversification:** You're investing across different assets, which is smart. Spreading risk means no single failure can hurt you badly.\n\n🛡️ **Stability:** Your allocation includes stable assets, great for long-term wealth building. Markets go up and down, but diversified portfolios tend to recover faster.\n\n💡 **Suggestions:**\n• Consider adding an index fund for broad market exposure\n• Keep investing through SIPs to benefit from rupee cost averaging\n• Review your asset allocation every 6 months\n• As you learn more, you can adjust your risk level\n\nRemember: Investing is a marathon, not a sprint. Stay consistent and keep learning! 🚀";
    return res.json({ explanation: mockExplanation });
  } catch (error) {
    console.error("Explain Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to explain money";
    res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🤖 Gemini AI: ${ai ? 'Connected' : 'Fallback mode (no API key)'}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
