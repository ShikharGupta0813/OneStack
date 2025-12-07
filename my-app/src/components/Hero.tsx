import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden bg-slate-950">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-6 text-center z-10 pt-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wide mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Live Extraction Engine
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6"
        >
          Data, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Unleashed.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-light"
        >
          Turn static PDF Balance Sheets and Invoices into actionable 
          <span className="text-white font-medium"> JSON data</span> instantly.
        </motion.p>

        <motion.button 
          onClick={()=>onStart()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-white text-slate-950 rounded-full font-bold text-lg shadow-[0_0_50px_-10px_rgba(129,140,248,0.5)] hover:shadow-[0_0_80px_-10px_rgba(129,140,248,0.7)] transition-all"
        >
          Start Extraction
        </motion.button>
      </div>
    </div>
  );
};