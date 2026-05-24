<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📊 Dhan Nivesh - AI-Powered Investment Platform

An intelligent investment learning platform for beginners in India, combining virtual trading, AI guidance, and educational modules.


## ✨ Features

- 🤖 **AI Investment Expert** - Get personalized financial advice powered by Google Gemini AI
- 💰 **Virtual Trading Simulator** - Practice with ₹1 Lakh demo capital, zero real risk
- 📚 **Financial Academy** - Step-by-step learning modules for investment basics
- 📊 **Smart Portfolio Dashboard** - Real-time portfolio tracking with risk analysis
- 🔐 **Secure Authentication** - Google Sign-In with encrypted Firestore backend
- ⚠️ **Risk Management System** - Stop-loss alerts and portfolio risk assessment
- 🎓 **Beginner-Friendly** - Explains financial jargon in simple Hindi/English

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ and npm (download from [nodejs.org](https://nodejs.org))
- **Gemini API Key** (free) from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Firebase Account** (optional - already configured)

### Installation & Setup

#### Step 1: Clone or extract the project
```bash
cd dhan-nivesh
```

#### Step 2: Install dependencies
```bash
npm install
```
This installs all required packages (React, Express, Firebase, Tailwind CSS, etc.)

#### Step 3: Configure environment variables
Create/update `.env.local` with your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
APP_URL=http://localhost:3000
NODE_ENV=development
```

**How to get your Gemini API Key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and paste it in `.env.local`

#### Step 4: Run the development server
```bash
npm run dev
```

Your app will be live at: **http://localhost:3000** ✅

---

## 📖 How to Use Dhan Nivesh

### 1. **Dashboard** - Portfolio Overview
- View your total portfolio value
- Track asset allocation (Stocks, Crypto, Commodities)
- See real-time risk analysis
- Get AI explanations of your portfolio

### 2. **Virtual Trading Simulator**
- Buy/sell 6+ virtual assets (Reliance, TCS, Bitcoin, etc.)
- Practice risk management
- Understand market volatility
- Track average purchase price

### 3. **Learning Center**
- Module 1: Investment Basics
- Module 2: Building Your Portfolio
- Module 3: Advanced Strategies (locked until you complete basics)
- Each lesson takes 5-15 minutes

### 4. **AI Expert Guide**
- Ask questions in natural language
- Get beginner-friendly answers
- Learn financial concepts
- No question is too basic!

---

## 📦 Available Commands

```bash
npm run dev      # Start development server (Vite + Express)
npm run build    # Build for production
npm start        # Run production build
npm run clean    # Clean build artifacts
npm run lint     # Check for TypeScript errors
```

---

## 🏗️ Project Architecture

```
Dhan-Nivesh/
├── src/                          # Frontend React code
│   ├── components/
│   │   ├── Dashboard.tsx         # Portfolio overview & charts
│   │   ├── Simulator.tsx         # Virtual trading interface
│   │   ├── AIGuidance.tsx        # AI chatbot component
│   │   ├── LearningCenter.tsx    # Educational modules
│   │   ├── Login.tsx             # Authentication page
│   │   ├── Navbar.tsx            # Navigation sidebar
│   │   ├── Header.tsx            # Top navigation
│   │   └── ErrorBoundary.tsx     # Error handling
│   ├── lib/
│   │   ├── AuthContext.tsx       # Global auth state
│   │   ├── firebase.ts           # Firebase initialization
│   │   ├── firestore-errors.ts   # Error handling utilities
│   │   └── utils.ts              # Helper functions
│   ├── App.tsx                   # Main React app
│   ├── main.tsx                  # React DOM mount
│   └── index.css                 # Global styles (Tailwind)
├── server.ts                      # Express backend + Gemini API
├── firestore.rules                # Database security rules
├── firebase-applet-config.json    # Firebase credentials
├── vite.config.ts                # Vite bundler config
├── tsconfig.json                 # TypeScript config
├── index.html                    # HTML entry point
└── package.json                  # Dependencies & scripts
```

---

## 🔐 Security & Privacy

✅ **Firebase Firestore Rules** - Your data is only accessible to you
✅ **API Validation** - All inputs are validated server-side
✅ **Environment Variables** - Sensitive keys never committed to git
✅ **Google Authentication** - Secure OAuth 2.0 sign-in
✅ **HTTPS Ready** - Can be deployed to production-grade hosting

---

## 🎯 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | Node.js, Express, Gemini AI API |
| **Database** | Firebase Firestore, Authentication |
| **Deployment** | Cloud Run (or any Node.js host) |
| **Styling** | Tailwind CSS + Custom themes |
| **Charts** | Recharts for portfolio visualization |
| **Icons** | Lucide React, Heroicons |

---

## 📝 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `GEMINI_API_KEY` | Google AI API access | `AIza...` |
| `APP_URL` | Application base URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

---

## 🐛 Troubleshooting

### Problem: "Cannot find module 'react'"
**Solution:** Run `npm install` to install dependencies

### Problem: "GEMINI_API_KEY is not set"
**Solution:** Make sure `.env.local` has your API key (not `.env.example`)

### Problem: "Port 3000 already in use"
**Solution:** Change port with: `PORT=3001 npm run dev`

### Problem: "Firebase auth fails"
**Solution:** Check `firebase-applet-config.json` is not corrupted

### Problem: "npm run lint shows errors"
**Solution:** Run `npm install` first, then fix TypeScript errors

---

## 📚 Learning Resources

- **Google Gemini API Docs:** https://ai.google.dev
- **Firebase Docs:** https://firebase.google.com/docs
- **Tailwind CSS:** https://tailwindcss.com
- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs

---

## 📞 Support & Feedback

- 📧 Report bugs or suggest features via issues
- 💡 Questions? Check the Learning Center in the app
- 🚀 Want to contribute? Pull requests welcome!

---

## 📄 License

This project is open source and available under the MIT License.

---

**Made with ❤️ for Indian Investors** | *Start your wealth journey today with Dhan Nivesh!*
