import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  History, 
  Play, 
  ChevronRight, 
  Bug, 
  Zap, 
  Clock, 
  Star,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Terminal
} from 'lucide-react';
import { analyzeCode } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface AnalysisResult {
  detectedLanguage?: string;
  detectedIssues: {
    type: 'bug' | 'security' | 'style' | 'performance';
    description: string;
    line: number;
    severity: 'low' | 'medium' | 'high';
  }[];
  timeComplexity: string;
  optimizationSuggestions: string[];
  codeQualityScore: number;
  seniorFeedback: string;
  timestamp: number;
  code: string;
  language: string;
}

// --- Components ---

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn("bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden", className, onClick && "cursor-pointer")}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  loading
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const variants = {
    primary: "bg-black text-white hover:bg-zinc-800",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    ghost: "bg-transparent text-zinc-600 hover:bg-zinc-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        className
      )}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<'home' | 'input' | 'results' | 'history'>('home');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('code_review_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (result: AnalysisResult) => {
    const newHistory = [result, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('code_review_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Call Gemini directly from frontend to ensure API key is handled correctly by the platform
      const data = await analyzeCode(code, language);
      
      const result = { ...data, timestamp: Date.now(), code, language };
      setCurrentResult(result);
      saveToHistory(result);
      setScreen('results');
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteHistoryItem = (timestamp: number) => {
    const newHistory = history.filter(item => item.timestamp !== timestamp);
    setHistory(newHistory);
    localStorage.setItem('code_review_history', JSON.stringify(newHistory));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-black selection:text-white">
      {/* Mobile Frame Simulation */}
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-bottom border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {screen !== 'home' && (
              <button onClick={() => setScreen('home')} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="font-bold text-xl tracking-tight">CodeReviewer</h1>
          </div>
          <button 
            onClick={() => setScreen('history')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <History className="w-5 h-5 text-zinc-600" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {screen === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 flex flex-col items-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-lg shadow-black/20">
                  <Code2 className="w-12 h-12 text-white" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight">AI Powered Code Review</h2>
                  <p className="text-zinc-500 leading-relaxed">
                    Get instant feedback on your code like a senior developer. Detect bugs, optimize performance, and improve quality.
                  </p>
                </div>
                <div className="w-full space-y-4 pt-8">
                  <Button onClick={() => setScreen('input')} className="w-full py-4 text-lg">
                    Start Reviewing <ChevronRight className="w-5 h-5" />
                  </Button>
                  <div className="grid grid-cols-3 gap-4">
                    {['Python', 'Java', 'C++'].map(lang => (
                      <div key={lang} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-xs font-medium text-zinc-600">
                        {lang}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {screen === 'input' && (
              <motion.div 
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Select Language</label>
                  <div className="flex gap-2 flex-wrap">
                    {['auto', 'python', 'java', 'cpp', 'javascript'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                          language === lang 
                            ? "bg-zinc-900 border-zinc-900 text-white" 
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                        )}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Paste Your Code</label>
                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste your code snippet here..."
                      className="w-full h-80 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-zinc-400 font-mono">
                      {code.length} chars
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  loading={isAnalyzing}
                  disabled={!code.trim()}
                  className="w-full py-4"
                >
                  Analyze Code <Play className="w-4 h-4 fill-current" />
                </Button>
              </motion.div>
            )}

            {screen === 'results' && currentResult && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 space-y-6 pb-20"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between bg-black text-white p-6 rounded-3xl shadow-xl shadow-black/10">
                  <div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Quality Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black">{currentResult.codeQualityScore ?? '-'}</span>
                      <span className="text-zinc-500 font-bold">/10</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Language</p>
                    <div className="flex items-center justify-end gap-2 text-sm font-mono font-bold">
                      {currentResult.detectedLanguage?.toUpperCase() || currentResult.language.toUpperCase()}
                    </div>
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-1">Complexity</p>
                    <div className="flex items-center justify-end gap-2 text-sm font-mono font-bold">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      {currentResult.timeComplexity || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Senior Feedback */}
                <Card className="p-5 bg-zinc-50 border-none">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Senior Feedback</p>
                      <p className="text-sm text-zinc-700 leading-relaxed italic">
                        "{currentResult.seniorFeedback || 'Analysis complete. Review the specific issues below for detailed feedback.'}"
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Issues */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">Detected Issues</h3>
                  {(!currentResult.detectedIssues || currentResult.detectedIssues.length === 0) ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm font-medium">No critical issues found! Great job.</span>
                    </div>
                  ) : (
                    currentResult.detectedIssues.map((issue, idx) => (
                      <Card key={idx} className="p-4 flex gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          issue.severity === 'high' ? "bg-red-100 text-red-600" :
                          issue.severity === 'medium' ? "bg-amber-100 text-amber-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <Bug className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-tight opacity-50">{issue.type}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 font-mono">Line {issue.line}</span>
                          </div>
                          <p className="text-sm font-medium leading-tight">{issue.description}</p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {/* Suggestions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">Optimization Tips</h3>
                  <div className="space-y-2">
                    {(currentResult.optimizationSuggestions || []).map((tip, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-zinc-600">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setScreen('input')} variant="secondary" className="w-full">
                  Analyze Another Snippet
                </Button>
              </motion.div>
            )}

            {screen === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Review History</h3>
                  <span className="text-xs text-zinc-400">{history.length} items</span>
                </div>

                {history.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                      <Terminal className="w-8 h-8 text-zinc-300" />
                    </div>
                    <p className="text-zinc-400 text-sm">No analysis history yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div 
                        key={item.timestamp}
                        className="group relative"
                      >
                        <Card 
                          className="p-4 cursor-pointer hover:border-black/20 transition-all active:scale-[0.98] border-zinc-100"
                          onClick={() => {
                            setCurrentResult(item);
                            setScreen('results');
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md border border-zinc-200">
                                {item.detectedLanguage?.toUpperCase() || item.language.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-medium">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold">{item.codeQualityScore}/10</span>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-200 rounded-full" />
                            <pre className="text-[11px] font-mono text-zinc-600 line-clamp-3 bg-zinc-50/50 pl-4 py-2 rounded-r-lg overflow-hidden leading-relaxed">
                              {item.code}
                            </pre>
                          </div>
                        </Card>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.timestamp);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Nav Simulation */}
        <nav className="px-8 py-4 bg-white border-t border-zinc-100 flex justify-around items-center">
          <button onClick={() => setScreen('home')} className={cn("p-2 transition-colors", screen === 'home' ? "text-black" : "text-zinc-300")}>
            <Code2 className="w-6 h-6" />
          </button>
          <button onClick={() => setScreen('input')} className={cn("p-2 transition-colors", screen === 'input' ? "text-black" : "text-zinc-300")}>
            <Play className="w-6 h-6" />
          </button>
          <button onClick={() => setScreen('history')} className={cn("p-2 transition-colors", screen === 'history' ? "text-black" : "text-zinc-300")}>
            <History className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
