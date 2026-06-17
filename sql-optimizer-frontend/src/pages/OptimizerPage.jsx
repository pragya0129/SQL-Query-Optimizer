import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Sparkles, ArrowLeft, Database, AlertTriangle,
    CheckCircle2, Terminal, Cpu, Clock, BarChart3, HelpCircle, LayoutTemplate, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
};

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
            ? 'bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-md font-semibold shadow-[0_0_10px_rgba(239,68,68,0.1)]'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]';

        return (
            <span className="text-slate-300">
                {parts[0]}
                <span className={colorClasses}>{target}</span>
                {parts[1]}
            </span>
        );
    };

    const calculateGain = (original, optimized) => {
        if (!original) return 0;
        return Math.round(((original - optimized) / original) * 100);
    };

    return (
        <div className="h-screen flex flex-col bg-[#060B19] text-slate-100 font-sans selection:bg-blue-500/30 selection:text-blue-200 antialiased relative overflow-hidden">
            {/* Expressive Tonal Backgrounds */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Navbar - Fixed height constraint */}
            <nav className="shrink-0 border-b border-white/5 bg-[#060B19]/60 backdrop-blur-xl z-50 px-6 py-3">
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Launchpad
                    </button>
                    <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        Optimizer Core Active
                    </div>
                </div>
            </nav>

            {/* Main Workspace - Takes remaining height */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 w-full max-w-[1600px] mx-auto relative z-10">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT PANEL: Sticky Input Area */}
                    <div className="lg:col-span-4 h-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col bg-[#0A1128]/80 border border-white/10 backdrop-blur-md rounded-3xl p-5 shadow-2xl"
                        >
                            <div className="shrink-0 flex items-center gap-2 mb-4">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300">Editor Console</h2>
                            </div>

                            <form onSubmit={handleOptimize} className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 flex flex-col min-h-0 mb-4">
                                    <label className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2">Database Schema (Optional)</label>
                                    <textarea
                                        className="flex-1 h-full bg-[#040814] border border-white/5 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none placeholder-slate-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
                                        placeholder="CREATE TABLE users ( id INT PRIMARY KEY );"
                                        value={schema}
                                        onChange={(e) => setSchema(e.target.value)}
                                    />
                                </div>

                                <div className="flex-[1.2] flex flex-col min-h-0 mb-4">
                                    <label className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1 mb-2">Raw SQL Query</label>
                                    <textarea
                                        className="flex-1 h-full bg-[#040814] border border-white/5 rounded-2xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none placeholder-slate-700 leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full"
                                        placeholder="SELECT * FROM users;"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isOptimizing || !query.trim()}
                                    className="shrink-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all cursor-pointer text-sm"
                                >
                                    {isOptimizing ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                                <Sparkles className="w-4 h-4 text-blue-300" />
                                            </motion.div>
                                            Analyzing Architecture...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 fill-current text-blue-200" />
                                            Compile Pipeline
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: Scrollable Dashboard */}
                    <div className="lg:col-span-8 h-full overflow-y-auto pr-2 pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full min-h-[500px] border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-[#0A1128]/30"
                                >
                                    <div className="p-6 bg-white/5 rounded-full mb-4">
                                        <Database className="w-12 h-12 text-slate-600 animate-pulse" />
                                    </div>
                                    <h3 className="text-slate-300 font-semibold text-lg">Awaiting Instructions</h3>
                                    <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
                                        Enter your schema and SQL query to generate a complete architectural teardown and execution plan.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="results"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="flex flex-col gap-6"
                                >
                                    {/* ROW 1: Code Comparisons */}
                                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col h-[280px] bg-[#0A1128]/80 border border-red-500/20 rounded-3xl overflow-hidden shadow-lg shadow-red-900/5">
                                            <div className="shrink-0 bg-red-500/10 px-4 py-3 border-b border-red-500/10 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-red-400">Bottleneck Detected</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                                                {renderHighlightedText(query, result.originalHighlight, 'danger')}
                                            </div>
                                        </div>

                                        <div className="flex flex-col h-[280px] bg-[#0A1128]/80 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-lg shadow-emerald-900/10">
                                            <div className="shrink-0 bg-emerald-500/10 px-4 py-3 border-b border-emerald-500/10 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Optimized Rewrite</span>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                                                {renderHighlightedText(result.optimizedQuery, result.optimizedHighlight, 'success')}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ROW 2: Commentary Card (Full Width) */}
                                    <motion.div variants={itemVariants} className="w-full">
                                        {/* Reasoning */}
                                        <div className="h-full flex flex-col bg-zinc-950/50 border border-white/[0.05] backdrop-blur-xl rounded-2xl p-5 overflow-hidden">
                                            <div className="shrink-0 flex items-center gap-2 mb-3 pb-3 border-b border-white/[0.05]">
                                                <Info className="w-4 h-4 text-indigo-400" />
                                                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Architectural Logic</h4>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                {Array.isArray(result.explanation) ? (
                                                    <ul className="space-y-2.5">
                                                        {result.explanation.map((point, i) => (
                                                            <li key={i} className="text-[13px] text-zinc-400 leading-relaxed font-medium flex items-start gap-2.5">
                                                                <span className="text-indigo-500 mt-1 shrink-0">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-[13px] text-zinc-400 leading-relaxed font-medium">
                                                        {result.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* ROW 3: Stacked Cards + Chart Side-by-Side */}
                                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                        {/* Left Col: 3 Stacked Telemetry Cards */}
                                        <div className="lg:col-span-4 flex flex-col gap-4">
                                            {result.chartData?.map((item, idx) => {
                                                const icons = [<Cpu className="w-5 h-5" />, <Database className="w-5 h-5" />, <Clock className="w-5 h-5" />];
                                                const colors = ["text-blue-400", "text-indigo-400", "text-emerald-400"];
                                                const bgColors = ["bg-blue-500/10 border-blue-500/20", "bg-indigo-500/10 border-indigo-500/20", "bg-emerald-500/10 border-emerald-500/20"];
                                                const gain = calculateGain(item.Original, item.Optimized);

                                                return (
                                                    <div key={idx} className={`border rounded-3xl p-5 flex flex-col justify-between ${bgColors[idx]} backdrop-blur-sm h-[100px]`}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-xl bg-white/5 ${colors[idx]}`}>{icons[idx]}</div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-200">{item.metric}</p>
                                                                    <p className="text-[9px] uppercase font-mono tracking-wider text-slate-500">Efficiency Gain</p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-2xl font-black ${colors[idx]}`}>{gain > 0 ? `+${gain}%` : `${gain}%`}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Right Col: Chart */}
                                        <div className="lg:col-span-8 flex flex-col bg-[#0A1128]/80 border border-white/10 rounded-3xl p-6 shadow-xl h-[332px]">
                                            <div className="shrink-0 flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                                                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wide">Cost Analysis Matrix</h3>
                                            </div>
                                            <div className="flex-1 min-h-0 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                                        <XAxis dataKey="metric" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                        <Tooltip
                                                            cursor={{ fill: '#ffffff05' }}
                                                            contentStyle={{ backgroundColor: '#060B19', borderColor: '#ffffff1a', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.1)' }}
                                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                                        />
                                                        <Bar dataKey="Original" radius={[6, 6, 6, 6]}>
                                                            {result.chartData.map((entry, index) => (
                                                                <Cell key={`cell-legacy-${index}`} fill="#f87171" opacity={0.8} />
                                                            ))}
                                                        </Bar>
                                                        <Bar dataKey="Optimized" radius={[6, 6, 6, 6]}>
                                                            {result.chartData.map((entry, index) => (
                                                                <Cell key={`cell-opt-${index}`} fill="#34d399" />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </motion.div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}