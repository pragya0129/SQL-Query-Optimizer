import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import initSqlJs from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import {
    Play, Sparkles, ArrowLeft, Database, AlertCircle,
    CheckCircle2, TerminalSquare, Cpu, Clock, BarChart3, Info, FileCode2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: "spring", stiffness: 250, damping: 25 }
    }
};

// Premium Tooltip for the Chart
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#09090b] border border-white/10 rounded-xl p-4 shadow-2xl">
                <p className="text-zinc-200 font-bold text-xs mb-3">{label}</p>
                <div className="flex flex-col gap-2 text-[11px]">
                    {payload.map((entry, index) => {
                        const valueColor = entry.name === 'Original' ? '#a1a1aa' : '#818cf8';
                        return (
                            <div key={index} className="flex items-center justify-between gap-6">
                                <span className="text-zinc-500 uppercase tracking-wider font-semibold">{entry.name}</span>
                                <span className="font-mono font-bold text-[13px]" style={{ color: valueColor }}>
                                    {entry.value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function OptimizerPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [schema, setSchema] = useState('');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState(null);
    const [db, setDb] = useState(null);
    const [dbFileName, setDbFileName] = useState('');

    // Toast State Management
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToast(current => current?.message === message ? null : current);
        }, 4000);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
            const buffer = await file.arrayBuffer();
            const database = new SQL.Database(new Uint8Array(buffer));

            setDb(database);
            setDbFileName(file.name);

            const res = database.exec("SELECT sql FROM sqlite_master WHERE type='table';");
            if (res.length > 0) {
                const extractedSchema = res[0].values.map(v => v[0]).join('\n');
                setSchema(extractedSchema);
            }
        } catch (error) {
            console.error("Failed to load database:", error);
            showToast("Could not initialize the local SQLite database.");
        }
    };

    const handleOptimize = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        if (!db) {
            showToast("Please upload a SQLite database file first.", "warning");
            return;
        }

        setIsOptimizing(true);
        setResult(null);

        let originalLatency = 0;

        // 1. Catch specific SQL errors from the user's query
        try {
            const startOriginal = performance.now();
            db.exec(query);
            originalLatency = performance.now() - startOriginal;
        } catch (dbError) {
            showToast(`SQL Error: ${dbError.message}`);
            setIsOptimizing(false);
            return; // Stop execution if the initial query is invalid
        }

        // 2. Proceed with API Optimization
        try {
            const response = await fetch('http://localhost:5000/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, schema }),
            });

            if (!response.ok) throw new Error('Failed to fetch optimization data');
            const data = await response.json();

            let optimizedLatency = 0;
            try {
                const startOptimized = performance.now();
                db.exec(data.optimizedQuery);
                optimizedLatency = performance.now() - startOptimized;
            } catch (execError) {
                console.warn("AI generated an invalid query or index creation command.", execError);
                optimizedLatency = originalLatency;
            }

            data.chartData = data.chartData.map(item => {
                if (item.metric === 'Latency (ms)') {
                    return {
                        metric: 'Latency (ms)',
                        Original: Number(originalLatency.toFixed(2)),
                        Optimized: Number(optimizedLatency.toFixed(2))
                    };
                }
                return item;
            });

            setResult(data);
        } catch (error) {
            console.error("Error optimizing query:", error);
            showToast("Pipeline failed. Ensure the backend engine is running.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const renderHighlightedText = (text, target, type) => {
        if (!target || !text.includes(target)) return <span className="text-zinc-300">{text}</span>;

        const parts = text.split(target);
        const colorClasses = type === 'danger'
            ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 px-1.5 py-0.5 rounded-md font-semibold'
            : 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 px-1.5 py-0.5 rounded-md font-semibold';

        return (
            <span className="text-zinc-400">
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
        <div className="h-screen flex flex-col bg-black text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 antialiased relative overflow-hidden">

            {/* Premium Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(0,0,0,0))] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>

            {/* Navbar */}
            <nav className="shrink-0 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl z-50 px-6 py-3">
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group cursor-pointer font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Launchpad
                    </button>
                    <div className="flex items-center gap-2.5 text-[11px] font-mono tracking-widest uppercase px-3 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-full text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                        Optimizer Engine
                    </div>
                </div>
            </nav>

            {/* Main Workspace */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 w-full max-w-[1600px] mx-auto relative z-10">
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT PANEL: Sticky Input Area */}
                    <div className="lg:col-span-4 h-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col bg-zinc-950/40 border border-white/[0.06] backdrop-blur-xl rounded-3xl p-5 shadow-2xl relative overflow-hidden"
                        >
                            <div className="shrink-0 flex items-center gap-2.5 mb-5 border-b border-white/[0.05] pb-4">
                                <TerminalSquare className="w-4 h-4 text-indigo-400" />
                                <h2 className="text-[11px] font-bold tracking-widest uppercase text-zinc-300">Editor Console</h2>
                            </div>

                            <form onSubmit={handleOptimize} className="flex-1 flex flex-col min-h-0">
                                {/* File Upload Dropzone */}
                                <div className="flex-1 flex flex-col min-h-0 mb-5 group">
                                    <label className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-indigo-400 transition-colors">Local SQLite Database (WASM)</label>
                                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-[#030303] hover:bg-white/[0.02] hover:border-indigo-500/30 transition-all relative overflow-hidden">
                                        <input
                                            type="file"
                                            accept=".db,.sqlite,.sqlite3"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <Database className={`w-5 h-5 mb-2 transition-colors ${db ? 'text-emerald-500' : 'text-zinc-600 group-hover:text-indigo-400'}`} />
                                        <p className="text-xs text-zinc-300 font-medium">
                                            {dbFileName ? dbFileName : "Drop .sqlite file here"}
                                        </p>
                                        {!dbFileName && <p className="text-[10px] text-zinc-600 mt-1 font-mono">Edge Compute Node</p>}
                                    </div>
                                </div>

                                {/* Query Input */}
                                <div className="flex-[1.4] flex flex-col min-h-0 mb-5 group">
                                    <label className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 group-focus-within:text-indigo-400 transition-colors">Target SQL Query</label>
                                    <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/[0.05] bg-[#030303] focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
                                        <textarea
                                            className="absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-[13px] text-zinc-200 focus:outline-none resize-none placeholder-zinc-700 leading-relaxed custom-scrollbar"
                                            placeholder="SELECT * FROM users;"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            spellCheck="false"
                                        />
                                    </div>
                                </div>

                                {/* Premium Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isOptimizing || !query.trim()}
                                    className="shrink-0 w-full relative group overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]"></div>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_50%)]"></div>

                                    <div className="relative px-4 py-4 flex items-center justify-center gap-2 text-sm font-semibold text-white tracking-wide">
                                        {isOptimizing ? (
                                            <>
                                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                                                    <Cpu className="w-4 h-4 text-indigo-200" />
                                                </motion.div>
                                                Compiling Architecture...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 fill-white/20" />
                                                Execute Pipeline
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: Scrollable Dashboard */}
                    <div className="lg:col-span-8 h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {!result ? (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-full min-h-[500px] border border-dashed border-white/[0.08] rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-zinc-950/20 backdrop-blur-sm"
                                >
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="p-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl mb-5 shadow-2xl"
                                    >
                                        <FileCode2 className="w-10 h-10 text-zinc-600" />
                                    </motion.div>
                                    <h3 className="text-zinc-200 font-semibold text-lg tracking-tight">System Idle</h3>
                                    <p className="text-[13px] text-zinc-500 max-w-sm mt-2 leading-relaxed">
                                        Provide a local database and a target SQL query to generate a complete architectural teardown.
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

                                        <div className="flex flex-col h-[280px] bg-[#030303] border border-white/[0.06] rounded-3xl overflow-hidden relative group">
                                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/50"></div>
                                            <div className="shrink-0 bg-white/[0.02] px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bottleneck Detected</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed custom-scrollbar">
                                                {renderHighlightedText(query, result.originalHighlight, 'danger')}
                                            </div>
                                        </div>

                                        <div className="flex flex-col h-[280px] bg-[#030303] border border-white/[0.06] rounded-3xl overflow-hidden relative group">
                                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/50"></div>
                                            <div className="shrink-0 bg-white/[0.02] px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Optimal Rewrite</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-5 font-mono text-[13px] leading-relaxed custom-scrollbar">
                                                {renderHighlightedText(result.optimizedQuery, result.optimizedHighlight, 'success')}
                                            </div>
                                        </div>

                                    </motion.div>

                                    {/* ROW 2: Commentary Card */}
                                    <motion.div variants={itemVariants} className="w-full">
                                        <div className="w-full flex flex-col bg-zinc-950/40 border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 overflow-hidden">
                                            <div className="shrink-0 flex items-center gap-2 mb-4 border-b border-white/[0.05] pb-4">
                                                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                                    <Info className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Architectural Logic</h4>
                                            </div>
                                            <div className="pl-1">
                                                {Array.isArray(result.explanation) ? (
                                                    <ul className="space-y-3">
                                                        {result.explanation.map((point, i) => (
                                                            <li key={i} className="text-[13px] text-zinc-400 leading-relaxed font-medium flex items-start gap-3">
                                                                <span className="text-indigo-500/80 mt-1 shrink-0 text-lg leading-none">•</span>
                                                                <span className="pt-0.5">{point}</span>
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
                                                const icons = [<Cpu className="w-4 h-4" />, <Database className="w-4 h-4" />, <Clock className="w-4 h-4" />];

                                                const gain = calculateGain(item.Original, item.Optimized);
                                                const isDegradation = gain < 0;

                                                // Dynamic Colors: Turn Red if efficiency drops
                                                const colorClass = isDegradation ? "text-rose-500" : ["text-indigo-400", "text-violet-400", "text-emerald-400"][idx];
                                                const borderClass = isDegradation ? "border-rose-500/20" : ["border-indigo-500/20", "border-violet-500/20", "border-emerald-500/20"][idx];
                                                const bgIconClass = isDegradation ? "bg-rose-500/10 text-rose-500" : `bg-white/[0.03] ${colorClass}`;

                                                return (
                                                    <div key={idx} className={`bg-[#030303] border ${borderClass} rounded-3xl p-5 flex flex-col justify-between h-[100px] relative overflow-hidden group transition-colors`}>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-xl border border-white/[0.05] ${bgIconClass}`}>
                                                                    {icons[idx]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[13px] font-semibold text-zinc-200">{item.metric}</p>
                                                                    <p className="text-[9px] uppercase font-mono tracking-widest text-zinc-500 mt-0.5">
                                                                        {isDegradation ? "Efficiency Loss" : "Efficiency Gain"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-xl font-bold tracking-tight ${colorClass}`}>
                                                                {gain > 0 ? `+${gain}%` : `${gain}%`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Right Col: Chart */}
                                        <div className="lg:col-span-8 flex flex-col bg-zinc-950/40 border border-white/[0.06] backdrop-blur-xl rounded-3xl p-6 h-[332px]">
                                            <div className="shrink-0 flex items-center gap-2 mb-5 border-b border-white/[0.05] pb-4">
                                                <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <h3 className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Cost Delta Matrix</h3>
                                            </div>
                                            <div className="flex-1 min-h-0 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={result.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={16} barGap={4}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                                        <XAxis dataKey="metric" stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                        <YAxis stroke="#52525b" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                        <Tooltip
                                                            content={<CustomTooltip />}
                                                            cursor={{ fill: '#ffffff03' }}
                                                        />
                                                        <Bar dataKey="Original" radius={[4, 4, 0, 0]}>
                                                            {result.chartData.map((entry, index) => (
                                                                <Cell key={`cell-legacy-${index}`} fill="#3f3f46" />
                                                            ))}
                                                        </Bar>
                                                        <Bar dataKey="Optimized" radius={[4, 4, 0, 0]}>
                                                            {result.chartData.map((entry, index) => (
                                                                <Cell key={`cell-opt-${index}`} fill="#6366f1" />
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

            {/* Premium Toast Notification System */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-[100] flex items-start gap-3 pl-4 pr-5 py-4 bg-[#09090b] border rounded-xl shadow-2xl overflow-hidden max-w-sm"
                        style={{
                            borderColor: toast.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)',
                            boxShadow: toast.type === 'warning' ? '0 10px 40px -10px rgba(245, 158, 11, 0.15)' : '0 10px 40px -10px rgba(244, 63, 94, 0.15)'
                        }}
                    >
                        {/* Subtle background glow */}
                        <div
                            className="absolute inset-0 opacity-10 pointer-events-none"
                            style={{ backgroundColor: toast.type === 'warning' ? '#f59e0b' : '#f43f5e' }}
                        />

                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${toast.type === 'warning' ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}>
                            <AlertCircle className={`w-4 h-4 ${toast.type === 'warning' ? 'text-amber-500' : 'text-rose-500'}`} />
                        </div>
                        <div className="flex flex-col gap-1 pr-2 relative z-10">
                            <span className={`text-xs font-bold uppercase tracking-widest ${toast.type === 'warning' ? 'text-amber-500' : 'text-rose-500'}`}>
                                {toast.type === 'warning' ? 'Action Required' : 'Engine Error'}
                            </span>
                            <p className="text-sm font-medium text-zinc-300 leading-relaxed">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="absolute top-3 right-3 p-1 rounded-md text-zinc-500 hover:bg-white/5 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Global Scrollbar targeted precisely to this UI */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}} />
        </div>
    );
}