import React from 'react';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 py-14 border-t border-cyan-400/10 relative z-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 animate-float">
          <div className="p-2 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 rounded-lg animate-gradient-move">
            <Layers className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold text-cyan-200 text-lg text-shadow-cyan">OneStack</span>
        </div>
        <div className="text-cyan-300 text-sm animate-fade-in">
          © 2024 OneStack Inc. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm font-semibold text-cyan-300 animate-fade-in">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
};