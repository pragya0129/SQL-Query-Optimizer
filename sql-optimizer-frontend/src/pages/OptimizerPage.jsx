import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, ArrowLeft, Database, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OptimizerPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState(null);

    const handleOptimize = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsOptimizing(true);
        setResult(null);

        // Simulate an API call to Groq / your backend
        setTimeout(() => {
            setResult({
                originalHighlight: "IN (SELECT id FROM users WHERE status = 'active')",
                optimizedQuery: "SELECT o.* FROM orders o WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 'active');",
                optimizedHighlight: "EXISTS (SELECT 1 FROM users u WHERE u.id = o.user_id AND u.status = 'active')",
                explanation: "The original query uses an IN clause with a subquery, forcing the database engine to materialize the entire subquery result set first. Replacing this with an EXISTS clause allows the query planner to short-circuit, instantly halting the internal scan once a match is found.",
                chartData: [
                    { metric: 'Execution Cost', Original: 4500, Optimized: 120 },
                    { metric: 'Rows Scanned', Original: 15000, Optimized: 500 },
                    { metric: 'Latency (ms)', Original: 850, Optimized: 45 }
                ]
            });
            setIsOptimizing(false);
        }, 2000);
    };

    // Helper function to safely split and highlight strings
    const renderHighlightedText = (text, target, type) => {
        if (!target || !text.includes(target)) return text;

        const parts = text.split(target);
        const colorClasses = type === 'danger'
            ? 'bg-red-500/20 text-red-400 font-bold px-1 rounded border border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-400 font-bold px-1 rounded border border-emerald-500/30';

        return (
            <span>
                {parts[0]}
                <span className={colorClasses}>{target}</span>
                {parts[1]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Navigation & Header */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </button>

                <header className="flex items-center gap-3 border-b border-slate-800 pb-6">
                    <Database className="w-8 h-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Query Workspace</h1>
                        <p className="text-sm text-slate-400">Paste your SQL below to analyze execution bottlenecks.</p>
                    </div>
                </header>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                >
                    <form onSubmit={handleOptimize} className="space-y-4">
                        <textarea
                            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder-slate-600"
                            placeholder="SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active');"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isOptimizing || !query.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            {isOptimizing ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </motion.div>
                                    Running AI Planner...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Analyze & Optimize
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            {/* Query Comparison Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Original Query */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                                    <div className="bg-slate-800/50 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                        <h3 className="font-semibold text-slate-200 text-sm">Original Query</h3>
                                    </div>
                                    <div className="p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                                        {renderHighlightedText(query, result.originalHighlight, 'danger')}
                                    </div>
                                </div>

                                {/* Optimized Query */}
                                <div className="bg-slate-900 border border-emerald-900/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                    <div className="bg-emerald-900/20 px-4 py-3 flex items-center gap-2 border-b border-emerald-900/30">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <h3 className="font-semibold text-emerald-400 text-sm">Optimized Rewrite</h3>
                                    </div>
                                    <div className="p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                                        {renderHighlightedText(result.optimizedQuery, result.optimizedHighlight, 'success')}
                                    </div>
                                </div>

                            </div>

                            {/* Explanation Panel */}
                            <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-5">
                                <p className="text-blue-200 text-sm leading-relaxed">
                                    <span className="font-semibold text-blue-400 mr-2">Why this works:</span>
                                    {result.explanation}
                                </p>
                            </div>

                            {/* Analytics Section */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-semibold text-white">Execution Plan Comparison</h3>
                                </div>

                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={result.chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis dataKey="metric" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                                itemStyle={{ color: '#e2e8f0' }}
                                                cursor={{ fill: '#1e293b' }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Bar dataKey="Original" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                            <Bar dataKey="Optimized" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}