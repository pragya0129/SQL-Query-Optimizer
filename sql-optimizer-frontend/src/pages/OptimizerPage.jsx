import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Sparkles, ArrowLeft, Database, AlertTriangle,
    CheckCircle2, Terminal, Cpu, Zap, Clock, BarChart3, HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OptimizerPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [schema, setSchema] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState(null);

    const handleOptimize = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsOptimizing(true);
        setResult(null);

        try {
            const response = await fetch('http://localhost:5000/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, schema }),
            });

            if (!response.ok) throw new Error('Failed to fetch optimization data');

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error("Error optimizing query:", error);
            alert("There was an error processing your query. Ensure the backend is running.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const renderHighlightedText = (text, target, type) => {
        if (!target || !text.includes(target)) return <span className="text-slate-300">{text}</span>;

        const parts = text.split(target);
        const colorClasses = type === 'danger'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded font-semibold'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold';

        return (
            <span className="text-slate-300">
                {parts[0]}
                <span className={colorClasses}>{target}</span>
                {parts[1]}
            </span>
        );
    };

    // Helper to safely calculate improvement percentages for telemetry cards
    const calculateGain = (original, optimized) => {
        if (!original) return 0;
        return Math.round(((original - optimized) / original) * 100);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 antialiased relative overflow-x-hidden">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation Top Bar */}
            <nav className="border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to Launchpad
                    </button>
                    <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 bg-slate-900 border border-slate-800 rounded-md text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Engine Core Live
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-xl">
                            <Database className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                SQL Telemetry Studio
                            </h1>
                            <p className="text-sm text-slate-400 mt-1">
                                Analyze compiled query structures, isolate execution friction, and auto-refactor schema lookups.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Workspace Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Control Panel: Input Console */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 bg-slate-900/40 border border-slate-800/60 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal className="w-4 h-4 text-blue-400" />
                            <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">Input Editor Console</h2>
                        </div>

                        <form onSubmit={handleOptimize} className="space-y-4">
                            {/* Optional Schema Input */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database Schema (Optional)</label>
                                </div>
                                <textarea
                                    className="w-full h-32 bg-[#030712] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none placeholder-slate-700 shadow-inner"
                                    placeholder="CREATE TABLE users ( id INT PRIMARY KEY, status VARCHAR(20) );"
                                    value={schema}
                                    onChange={(e) => setSchema(e.target.value)}
                                />
                            </div>

                            {/* Raw SQL Input */}
                            <div className="relative">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Raw SQL Query</label>
                                </div>
                                <textarea
                                    className="w-full h-40 bg-[#030712] border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none placeholder-slate-600 leading-relaxed shadow-inner"
                                    placeholder="SELECT * FROM orders WHERE user_id IN (SELECT id FROM users WHERE status = 'active');"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isOptimizing || !query.trim()}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-900 disabled:to-slate-900 disabled:text-slate-600 border disabled:border-slate-800/80 border-blue-500/20 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer text-sm"
                            >
                                {isOptimizing ? (
                                    <>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Sparkles className="w-4 h-4 text-blue-300" />
                                        </motion.div>
                                        Compiling Dynamic Plan...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current text-blue-200" />
                                        Compile & Optimize Pipeline
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Right Control Panel: Output Engine Metrics & Code Viewer */}
                    <div className="lg:col-span-7">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[386px] border border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-950/20"
                                >
                                    <Cpu className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                                    <h3 className="text-slate-400 font-medium text-sm">Telemetry Feed Idle</h3>
                                    <p className="text-xs text-slate-600 max-w-xs mt-1">
                                        Submit an SQL instruction code block inside the console window to spark full-scale performance trace metrics.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Dynamic Telemetry Metric Cards */}
                                    <div className="grid grid-cols-3 gap-4">
                                        {result.chartData?.map((item, idx) => {
                                            const icons = [<Cpu className="w-4 h-4" />, <BarChart3 className="w-4 h-4" />, <Clock className="w-4 h-4" />];
                                            const colors = ["text-blue-400", "text-purple-400", "text-amber-400"];
                                            const bgColors = ["bg-blue-500/5 border-blue-500/10", "bg-purple-500/5 border-purple-500/10", "bg-amber-500/5 border-amber-500/10"];
                                            const gain = calculateGain(item.Original, item.Optimized);

                                            return (
                                                <div key={idx} className={`border rounded-xl p-4 flex flex-col justify-between ${bgColors[idx]} shadow-sm relative overflow-hidden`}>
                                                    <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                                                        <span className="truncate">{item.metric}</span>
                                                        <span className={colors[idx]}>{icons[idx]}</span>
                                                    </div>
                                                    <div className="mt-4">
                                                        <div className="text-lg font-bold tracking-tight text-white">{gain}%</div>
                                                        <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mt-0.5">Efficiency Gain</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Refactored Query Comparisons */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Source Container */}
                                        <div className="bg-slate-900/30 border border-slate-800/60 backdrop-blur-md rounded-xl overflow-hidden shadow-md">
                                            <div className="bg-slate-950/60 px-4 py-2.5 flex items-center justify-between border-b border-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                                    <span className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">Bottleneck Found</span>
                                                </div>
                                            </div>
                                            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-40 overflow-y-auto min-h-24">
                                                {renderHighlightedText(query, result.originalHighlight, 'danger')}
                                            </div>
                                        </div>

                                        {/* Target Container */}
                                        <div className="bg-slate-900/30 border border-emerald-950/30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg shadow-emerald-950/5">
                                            <div className="bg-emerald-950/20 px-4 py-2.5 flex items-center justify-between border-b border-emerald-900/20">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-xs font-semibold uppercase font-mono tracking-wider text-emerald-400">Refactored Rewrite</span>
                                                </div>
                                            </div>
                                            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-40 overflow-y-auto min-h-24">
                                                {renderHighlightedText(result.optimizedQuery, result.optimizedHighlight, 'success')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Operational Justification Block */}
                                    <div className="bg-gradient-to-r from-slate-900/60 to-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex gap-3 shadow-md">
                                        <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">Optimizer Commentary</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Lower Full-Width Telemetry: Data Engine Visual Charts */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/20 border border-slate-900/80 backdrop-blur-md rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-2 mb-6 border-b border-slate-900 pb-4">
                                <BarChart3 className="w-4.5 h-4.5 text-blue-400" />
                                <h3 className="font-semibold text-sm text-slate-200 uppercase font-mono tracking-wide">Comparative Execution Analytics</h3>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                                            itemStyle={{ color: '#cbd5e1' }}
                                            cursor={{ fill: '#0f172a', opacity: 0.4 }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', pt: 4 }} />
                                        <Bar dataKey="Original" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={45} name="Legacy Cost" />
                                        <Bar dataKey="Optimized" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={45} name="Refactored Cost" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}