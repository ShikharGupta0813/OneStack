import { Loader2 } from "lucide-react";

export const LoadingScreen = ({ fileName }: { fileName: string }) => (
  <div className="min-h-screen flex flex-col items-center justify-center animate-fade-in">
    <div className="relative">
      <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 animate-pulse" />
      <Loader2 className="w-24 h-24 text-cyan-400 animate-spin relative z-10 drop-shadow-[0_0_32px_cyan]" />
    </div>

    <h3 className="mt-8 text-3xl md:text-4xl font-extrabold text-white tracking-tight text-shadow-cyan">
      Analyzing Document
    </h3>

    <p className="text-slate-300 mt-2">
      Extracting data from <span className="text-cyan-400 font-mono">{fileName}</span>
    </p>
  </div>
);
