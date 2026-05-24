import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  FileText, 
  CheckCircle, 
  Lock, 
  Trophy,
  HelpCircle,
  Lightbulb,
  X,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Lesson {
  id: string;
  title: string;
  type: 'text' | 'video';
  duration: string;
  content: string;
  keyTakeaways: string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  locked: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MODULES_DATA: Omit<Module, 'locked'>[] = [
  {
    id: 'm1',
    title: 'Investment Basics',
    description: 'Learn the core concepts of money and growth.',
    lessons: [
      { 
        id: 'l1', title: 'What is Investing?', type: 'text', duration: '5 min',
        content: `Investing is the act of allocating money with the expectation of generating income or profit over time. When you invest, you put your money to work so it can grow — instead of just sitting idle in a savings account.\n\nThere are many ways to invest: stocks, bonds, mutual funds, real estate, gold, and more. Each has its own risk and return profile.\n\nThe fundamental principle is simple: you sacrifice current spending power for the potential of greater future wealth. The earlier you start, the more time your money has to grow through the power of compounding.`,
        keyTakeaways: [
          'Investing means putting money to work for future growth',
          'There are many asset classes: stocks, bonds, mutual funds, gold, real estate',
          'Starting early gives your money more time to compound',
          'Every investment carries some level of risk'
        ]
      },
      { 
        id: 'l2', title: 'How Markets Work', type: 'video', duration: '8 min',
        content: `A stock market is a platform where buyers and sellers trade shares of publicly listed companies. Think of it like a farmer's market — but instead of vegetables, people trade ownership in businesses.\n\nHow are prices determined? Supply and demand. If many people want to buy a stock (high demand), its price goes up. If many want to sell (high supply), the price drops.\n\nKey participants include: retail investors (like you), institutional investors (mutual funds, banks), and market makers who ensure liquidity.\n\nIn India, the two major stock exchanges are NSE (National Stock Exchange) and BSE (Bombay Stock Exchange). The Sensex tracks 30 major BSE companies, while Nifty 50 tracks 50 major NSE companies.`,
        keyTakeaways: [
          'Stock markets connect buyers and sellers of company shares',
          'Prices move based on supply and demand',
          'India has two major exchanges: NSE and BSE',
          'Nifty 50 and Sensex are the main market indices'
        ]
      },
      { 
        id: 'l3', title: 'Power of Compound Interest', type: 'text', duration: '10 min',
        content: `Compound interest is often called the "eighth wonder of the world." It's when your investment returns start earning returns themselves — creating a snowball effect.\n\nExample: If you invest ₹1,00,000 at 12% annual return:\n• After 5 years: ₹1,76,234\n• After 10 years: ₹3,10,585\n• After 20 years: ₹9,64,629\n• After 30 years: ₹29,95,992\n\nYour money nearly triples every 10 years! The longer you stay invested, the more dramatic the growth — because returns compound on top of returns.\n\nThis is why starting early matters so much. Even small amounts invested consistently can grow to enormous sums over decades. A ₹5,000 monthly SIP in a 12% return fund can grow to over ₹1.7 crore in 25 years!`,
        keyTakeaways: [
          'Compound interest means earning returns on your returns',
          'The longer you invest, the more powerful compounding becomes',
          'A ₹5,000/month SIP can grow to ₹1.7+ crore in 25 years',
          'Time in the market matters more than timing the market'
        ]
      },
    ]
  },
  {
    id: 'm2',
    title: 'Building Your Portfolio',
    description: 'How to diversify and manage risk.',
    lessons: [
      { 
        id: 'l4', title: 'Asset Classes 101', type: 'text', duration: '6 min',
        content: `An asset class is a group of investments with similar characteristics. Understanding them is the first step to building a portfolio.\n\n📊 Equity (Stocks/Mutual Funds): Ownership in companies. High potential returns (12-15% avg), higher risk. Great for long-term wealth building.\n\n📜 Debt (Bonds/Fixed Deposits): Lending money to companies or governments. Lower returns (6-8%), much lower risk. Good for stability.\n\n🥇 Gold/Commodities: Physical or digital assets. Moderate returns, acts as inflation hedge. Good for diversification.\n\n🏠 Real Estate: Property investments. Steady rental income + appreciation. Requires large capital.\n\n💰 Cash/Savings: Safest but lowest returns (3-4%). Essential for emergencies.\n\nA smart portfolio combines multiple asset classes to balance risk and reward.`,
        keyTakeaways: [
          'Equity offers highest returns but with higher risk',
          'Debt provides stability and predictable returns',
          'Gold acts as an inflation hedge and diversifier',
          'A balanced portfolio uses multiple asset classes'
        ]
      },
      { 
        id: 'l5', title: 'Understanding Risk', type: 'text', duration: '10 min',
        content: `Risk and return are two sides of the same coin — you can't have high returns without accepting some risk. Understanding your risk tolerance is crucial.\n\nTypes of Risk:\n• Market Risk: Overall market downturns affect all investments\n• Company Risk: A specific company may underperform\n• Inflation Risk: Your returns may not keep up with rising prices\n• Liquidity Risk: Difficulty selling your investment quickly\n\nRisk Profiles:\n🟢 Conservative: Prefer safety, accept lower returns. Portfolio: 70% debt + 20% equity + 10% gold\n🟡 Moderate: Balance of growth and safety. Portfolio: 50% equity + 30% debt + 10% gold + 10% others\n🔴 Aggressive: Comfortable with volatility for higher returns. Portfolio: 70% equity + 15% debt + 10% alternatives + 5% crypto\n\nThe key insight: Diversification reduces risk without sacrificing all returns. Never put all eggs in one basket!`,
        keyTakeaways: [
          'Higher returns always come with higher risk',
          'Understand your risk tolerance before investing',
          'Diversification is the best free lunch in investing',
          'Your risk profile determines your ideal asset allocation'
        ]
      },
    ]
  },
  {
    id: 'm3',
    title: 'Advanced Strategies',
    description: 'Master technical and fundamental analysis.',
    lessons: [
      { 
        id: 'l6', title: 'Stock Selection Meta', type: 'video', duration: '15 min',
        content: `Selecting the right stocks requires understanding both fundamental and technical analysis.\n\n📈 Fundamental Analysis: Evaluating a company's intrinsic value by examining:\n• Revenue and profit growth trends\n• P/E Ratio (Price to Earnings) — lower can mean undervalued\n• Debt levels — lower debt is safer\n• Return on Equity (ROE) — higher means efficient use of capital\n• Management quality and corporate governance\n\n📉 Technical Analysis: Studying price charts and patterns:\n• Moving averages (50-day, 200-day)\n• Support and resistance levels\n• Volume trends\n• RSI (Relative Strength Index) — overbought/oversold signals\n\nThe best investors combine both approaches: Use fundamentals to pick quality companies and technicals for timing entry/exit points.\n\n⚠️ For beginners: Start with index funds and ETFs. Individual stock picking requires significant knowledge and constant monitoring.`,
        keyTakeaways: [
          'Fundamental analysis evaluates company value and health',
          'Technical analysis studies price patterns and trends',
          'Combining both approaches gives the best results',
          'Beginners should start with index funds before picking stocks'
        ]
      },
    ]
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What is diversification?',
    options: [
      'Buying only one high-growth stock',
      'Spreading money across different assets',
      'Hiding money in a physical vault',
    ],
    correctIndex: 1,
    explanation: 'Diversification means spreading your investments across different asset classes (stocks, bonds, gold, etc.) to reduce risk. If one investment performs poorly, others may still do well.'
  },
  {
    question: 'What does compound interest mean?',
    options: [
      'Earning simple interest on your principal only',
      'Earning returns on both your principal and previous returns',
      'Paying interest on a loan',
    ],
    correctIndex: 1,
    explanation: 'Compound interest is when your investment returns earn returns themselves, creating a snowball effect. This is why long-term investing is so powerful!'
  },
  {
    question: 'Which is generally the riskiest asset class?',
    options: [
      'Fixed Deposits',
      'Government Bonds',
      'Equity / Stocks',
    ],
    correctIndex: 2,
    explanation: 'Equity/stocks are generally the riskiest of these three because their prices fluctuate daily. However, they also offer the highest potential returns over the long term.'
  },
  {
    question: 'What does P/E ratio measure?',
    options: [
      'A company\'s total profit',
      'How much investors pay per rupee of earnings',
      'The company\'s debt level',
    ],
    correctIndex: 1,
    explanation: 'P/E (Price-to-Earnings) ratio tells you how much investors are willing to pay for each rupee of a company\'s earnings. A lower P/E may indicate an undervalued stock.'
  },
  {
    question: 'What is a SIP?',
    options: [
      'A one-time large investment',
      'A Systematic Investment Plan with regular contributions',
      'A type of insurance policy',
    ],
    correctIndex: 1,
    explanation: 'SIP (Systematic Investment Plan) allows you to invest a fixed amount regularly (monthly/quarterly) in mutual funds. It builds discipline and benefits from rupee cost averaging.'
  }
];

const STORAGE_KEY = 'dhanNiveshLearningProgress';

function loadProgress(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function LearningCenter() {
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(loadProgress);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // Derive modules with lock/unlock logic
  const modules: Module[] = MODULES_DATA.map((mod, idx) => {
    const allPreviousLessonsCompleted = idx === 0 
      ? true 
      : MODULES_DATA.slice(0, idx).every(m => 
          m.lessons.every(l => completedLessons[l.id])
        );
    return {
      ...mod,
      locked: idx > 0 && !allPreviousLessonsCompleted,
    };
  });

  // Count completed lessons
  const allLessonIds = MODULES_DATA.flatMap(m => m.lessons.map(l => l.id));
  const completedCount = allLessonIds.filter(id => completedLessons[id]).length;
  const totalLessons = allLessonIds.length;
  const weeklyGoalTarget = 3;

  // Persist progress
  useEffect(() => {
    saveProgress(completedLessons);
  }, [completedLessons]);

  const toggleComplete = useCallback((lessonId: string) => {
    setCompletedLessons(prev => {
      const next = { ...prev };
      if (next[lessonId]) {
        delete next[lessonId];
      } else {
        next[lessonId] = true;
      }
      return next;
    });
  }, []);

  const handleQuizAnswer = (answerIndex: number) => {
    if (quizAnswered) return;
    setSelectedAnswer(answerIndex);
    setQuizAnswered(true);
    if (answerIndex === QUIZ_QUESTIONS[currentQuizIndex].correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setQuizAnswered(false);
    } else {
      setShowQuizResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    setShowQuizResult(false);
    setQuizScore(0);
  };

  const currentQuiz = QUIZ_QUESTIONS[currentQuizIndex];

  // Lesson detail view
  if (selectedLesson) {
    const isCompleted = !!completedLessons[selectedLesson.id];
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <button 
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Lesson Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {selectedLesson.type === 'video' 
                    ? <Play className="w-7 h-7 fill-current" /> 
                    : <FileText className="w-7 h-7" />
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                      selectedLesson.type === 'video' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {selectedLesson.type === 'video' ? 'Video Lesson' : 'Reading Lesson'}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{selectedLesson.duration}</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedLesson.title}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="prose prose-slate max-w-none">
              {selectedLesson.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-4 text-sm">{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-2xl text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Lightbulb className="w-5 h-5 text-brand-accent" />
              </div>
              <h3 className="font-black uppercase text-xs tracking-widest">Key Takeaways</h3>
            </div>
            <div className="space-y-3">
              {selectedLesson.keyTakeaways.map((takeaway, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 bg-brand-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-brand-accent text-[10px] font-black">{i + 1}</span>
                  </div>
                  <p className="text-sm text-emerald-50 font-medium leading-relaxed">{takeaway}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mark Complete Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleComplete(selectedLesson.id)}
            className={cn(
              "w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex items-center justify-center gap-3",
              isCompleted 
                ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700"
                : "brand-gradient text-white shadow-brand-primary/20 hover:opacity-90"
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Completed! Click to Undo
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      <div className="lg:col-span-2 space-y-8">
        <header>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Financial Academy</h2>
          <p className="text-gray-500">Master the art of investing, one step at a time.</p>
        </header>

        <div className="space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className={cn("text-xl font-bold", module.locked ? "text-gray-400" : "text-gray-900")}>
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500">{module.description}</p>
                  {!module.locked && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                        <div 
                          className="h-full bg-brand-primary rounded-full transition-all duration-500"
                          style={{ width: `${(module.lessons.filter(l => completedLessons[l.id]).length / module.lessons.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {module.lessons.filter(l => completedLessons[l.id]).length}/{module.lessons.length}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {module.locked && <Lock className="text-gray-300" />}
                  {!module.locked && module.lessons.every(l => completedLessons[l.id]) && (
                    <Trophy className="text-yellow-500" />
                  )}
                  {!module.locked && !module.lessons.every(l => completedLessons[l.id]) && (
                    <BookOpen className="text-brand-primary" />
                  )}
                </div>
              </div>
              
              <div className="p-2">
                {module.lessons.map((lesson) => {
                  const isCompleted = !!completedLessons[lesson.id];
                  return (
                    <button
                      key={lesson.id}
                      disabled={module.locked}
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setSelectedModuleId(module.id);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl transition-all group",
                        module.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50",
                        isCompleted && !module.locked && "bg-emerald-50/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          isCompleted ? "bg-emerald-100 text-emerald-600" :
                          module.locked ? "bg-gray-50 text-gray-300" :
                          "bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-indigo-600"
                        )}>
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                           lesson.type === 'video' ? <Play className="w-5 h-5 fill-current" /> : 
                           <FileText className="w-5 h-5" />
                          }
                        </div>
                        <div className="text-left">
                          <p className={cn(
                            "font-bold",
                            isCompleted ? "text-emerald-700" : 
                            module.locked ? "text-gray-400" : "text-gray-900"
                          )}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500">{lesson.duration} • {lesson.type}</p>
                        </div>
                      </div>
                      {!module.locked && (
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Weekly Goal - Dynamic */}
        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-8 rounded-3xl text-white shadow-xl shadow-brand-primary/20">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md">
            <Trophy className="text-brand-accent w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black italic tracking-tight mb-2">Weekly Goal</h3>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-6 leading-relaxed">
            Complete {weeklyGoalTarget} lessons to unlock "Value Investor" badge and 5,000 extra credits!
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-emerald-200">
              <span>Progress</span>
              <span>{Math.min(completedCount, weeklyGoalTarget)}/{weeklyGoalTarget} Lessons</span>
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((completedCount / weeklyGoalTarget) * 100, 100)}%` }}
                className="h-full bg-brand-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
              />
            </div>
            {completedCount >= weeklyGoalTarget && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 mt-2"
              >
                <Star className="w-4 h-4 text-brand-accent fill-brand-accent" />
                <span className="text-brand-accent text-xs font-black uppercase tracking-widest">Goal Achieved!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Expert Insight */}
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Lightbulb className="w-5 h-5 text-brand-accent" />
            <h4 className="text-[10px] font-black uppercase tracking-widest">Expert Insight</h4>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed italic font-medium">
            "The stock market is a device for transferring money from the impatient to the patient." 
            <span className="block mt-2 font-black not-italic text-brand-secondary text-[10px] uppercase tracking-widest">— Warren Buffett</span>
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Your Progress
          </h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-gray-900">{completedCount}</span>
            <span className="text-sm text-gray-500 font-bold mb-1">/ {totalLessons} lessons completed</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalLessons) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {completedCount === 0 ? "Start your first lesson to begin your journey!" :
             completedCount < totalLessons ? "Keep going! Complete all modules to master investing." :
             "Congratulations! You've completed all lessons! 🎉"
            }
          </p>
        </div>

        {/* Functional Quiz */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Quick Quiz
            </h4>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {currentQuizIndex + 1}/{QUIZ_QUESTIONS.length}
            </span>
          </div>

          {!showQuizResult ? (
            <>
              <p className="text-sm text-gray-700 font-medium">{currentQuiz.question}</p>
              <div className="space-y-2">
                {currentQuiz.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={quizAnswered}
                    className={cn(
                      "w-full p-3 text-left text-xs rounded-lg border transition-all",
                      !quizAnswered && "bg-gray-50 hover:bg-indigo-50 border-gray-100 hover:border-indigo-200",
                      quizAnswered && i === currentQuiz.correctIndex && "bg-emerald-50 border-emerald-300 text-emerald-800",
                      quizAnswered && i === selectedAnswer && i !== currentQuiz.correctIndex && "bg-red-50 border-red-300 text-red-800",
                      quizAnswered && i !== selectedAnswer && i !== currentQuiz.correctIndex && "bg-gray-50 border-gray-100 text-gray-400"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {quizAnswered && i === currentQuiz.correctIndex && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                      {quizAnswered && i === selectedAnswer && i !== currentQuiz.correctIndex && <X className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      <span className="font-bold">{String.fromCharCode(65 + i)})</span> {option}
                    </div>
                  </button>
                ))}
              </div>

              {quizAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-3 rounded-lg text-xs font-medium leading-relaxed",
                    selectedAnswer === currentQuiz.correctIndex
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  )}
                >
                  {selectedAnswer === currentQuiz.correctIndex ? "✓ Correct! " : "Not quite. "}
                  {currentQuiz.explanation}
                </motion.div>
              )}

              {quizAnswered && (
                <button 
                  onClick={nextQuizQuestion}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                >
                  {currentQuizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                quizScore >= QUIZ_QUESTIONS.length * 0.6 ? "bg-emerald-100" : "bg-amber-100"
              )}>
                {quizScore >= QUIZ_QUESTIONS.length * 0.6 
                  ? <Trophy className="w-8 h-8 text-emerald-600" />
                  : <Star className="w-8 h-8 text-amber-500" />
                }
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{quizScore}/{QUIZ_QUESTIONS.length}</p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  {quizScore === QUIZ_QUESTIONS.length ? "Perfect Score!" :
                   quizScore >= QUIZ_QUESTIONS.length * 0.6 ? "Great Job!" :
                   "Keep Learning!"}
                </p>
              </div>
              <button 
                onClick={resetQuiz}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Quiz
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
