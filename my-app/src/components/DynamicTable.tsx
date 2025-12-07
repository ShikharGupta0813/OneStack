
import React, { useState, useRef } from 'react';
import { CheckCircle, Table as TableIcon, Code, Download } from 'lucide-react';
import type { ExtractedData } from '../types';

interface DynamicTableProps {
  data: ExtractedData[];
  fileName: string;
}


export const DynamicTable: React.FC<DynamicTableProps> = ({ data, fileName }) => {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const rippleRef = useRef<HTMLSpanElement>(null);

  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  // Export as JSON
  const handleExport = (e: React.MouseEvent) => {
    // Ripple effect
    const btn = e.currentTarget as HTMLButtonElement;
    const ripple = rippleRef.current;
    if (ripple) {
      const rect = btn.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      ripple.classList.remove('animate-ripple');
      void ripple.offsetWidth; // force reflow
      ripple.classList.add('animate-ripple');
    }
    // Download JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, '') + '_extracted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto px-1 pb-1 pt-1 animate-fade-in"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-cyan-400/10 pb-6">
        {/* <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-2 text-sm font-medium animate-fade-in">
            <CheckCircle size={18} />
            <span className="tracking-wide">Analysis Complete</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-cyan mb-1 animate-fade-in">Extraction Results</h2>
          <div className="text-slate-400 text-xs md:text-sm font-mono animate-fade-in">{fileName}</div>
        </div> */}
        <div className="flex gap-3 items-center">
          {/* Toggle Buttons */}
          <div className="bg-slate-900/80 backdrop-blur-xl p-1 rounded-xl border border-cyan-400/10 flex shadow shadow-cyan-400/10 animate-float">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 border-2 ${viewMode === 'table' ? 'bg-gradient-to-r from-cyan-400/20 to-indigo-500/20 text-cyan-300 border-cyan-400 shadow shadow-cyan-400/10' : 'text-slate-400 border-transparent hover:text-cyan-300 hover:border-cyan-400/40'}`}
              style={{ boxShadow: viewMode === 'table' ? '0 2px 16px 0 rgba(34,212,255,0.10)' : undefined }}
            >
              <TableIcon size={16} /> Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 border-2 ${viewMode === 'json' ? 'bg-gradient-to-r from-cyan-400/20 to-indigo-500/20 text-cyan-300 border-cyan-400 shadow shadow-cyan-400/10' : 'text-slate-400 border-transparent hover:text-cyan-300 hover:border-cyan-400/40'}`}
              style={{ boxShadow: viewMode === 'json' ? '0 2px 16px 0 rgba(34,212,255,0.10)' : undefined }}
            >
              <Code size={16} /> JSON
            </button>
          </div>
          {/* Export Button with Glow, Ripple, and Gradient Border */}
          <button
            className="relative flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-cyan-400/20 border-2 border-transparent hover:border-cyan-400/60 transition-all duration-300 overflow-hidden group animate-fade-in"
            style={{ WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)' }}
            onClick={handleExport}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-indigo-500/10 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-sm" />
            <span ref={rippleRef} className="pointer-events-none absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-full bg-cyan-400/30 opacity-0 animate-none" />
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Table/JSON Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-cyan-400/10 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-400/10 animate-float" style={{
        boxShadow: '0 8px 48px 0 rgba(34,212,255,0.10), 0 1.5px 0 0 rgba(34,212,255,0.08)',
      }}>
        {/* Animated Gradient Border */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-transparent animate-gradient-move" style={{
          background: 'linear-gradient(120deg,rgba(34,212,255,0.18),rgba(99,102,241,0.12),rgba(168,85,247,0.10))',
          zIndex: 1,
          opacity: 0.7,
        }} />
        {/* Table or JSON */}
        <div className="relative z-10">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse ">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-cyan-400/10 animate-fade-in">
                    {headers.map((header) => (
                      <th key={header} className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-cyan-300 whitespace-nowrap text-shadow-cyan">
                        {header.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-400/10 text-slate-200 text-sm">
                  {data.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-cyan-400/5 transition-colors animate-fade-in"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      {headers.map((key) => (
                        <td key={`${idx}-${key}`} className="px-6 py-4 whitespace-nowrap font-mono text-white text-cyan-200">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/80 animate-fade-in">
              <pre className="font-mono text-xs md:text-sm text-cyan-300 overflow-x-auto p-4 rounded-xl bg-slate-900/80 border border-cyan-400/10 shadow-inner shadow-cyan-400/5 animate-fade-in">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Ripple animation keyframes */}
      <style>{`
        .animate-ripple {
          animation: ripple-effect 0.5s linear;
        }
        @keyframes ripple-effect {
          0% { opacity: 0.5; transform: scale(0); }
          80% { opacity: 0.2; transform: scale(2.2); }
          100% { opacity: 0; transform: scale(2.8); }
        }
      `}</style>
    </div>
  );
};