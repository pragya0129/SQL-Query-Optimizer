import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Database, Zap, ArrowRight, Code2 } from 'lucide-react';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">

            {/* Background visual flair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

            <main className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-6"
                >
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                        <Database className="w-12 h-12 text-blue-500" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white">
                        Optimize SQL Queries <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                            in Milliseconds.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Stop guessing why your database is slow. Paste your raw queries and let our AI engine instantly identify bottlenecks, rewrite your SQL, and visualize the performance gains.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate('/optimizer')}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] cursor-pointer"
                    >
                        <Zap className="w-5 h-5" />
                        Launch Optimizer
                        <ArrowRight className="w-5 h-5 ml-1" />
                    </button>

                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                        <Code2 className="w-5 h-5" />
                        View Source
                    </a>
                </motion.div>
            </main>
        </div>
    );
}