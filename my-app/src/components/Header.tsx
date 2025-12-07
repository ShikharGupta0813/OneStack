import React from 'react';
import { Layers, BookOpen, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-cyan-400/10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 animate-float">
          <div className="p-2 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-cyan-400/20 animate-gradient-move">
            <Layers className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white text-shadow-cyan">
            OneStack <span className="text-cyan-400 animate-gradient-move">Extractor</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-cyan-300 hover:text-white transition-colors text-sm font-semibold px-4 py-2 rounded-lg border-2 border-transparent hover:border-cyan-400/40 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <BookOpen size={16} /> Docs
          </button>
          <div className="h-4 w-[1px] bg-cyan-400/10 hidden md:block"></div>
          <button className="text-cyan-300 hover:text-white transition-colors p-2 hover:bg-cyan-400/10 rounded-full animate-fade-in">
            <Github size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};