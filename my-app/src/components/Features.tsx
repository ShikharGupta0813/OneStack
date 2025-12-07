import React from 'react';
import { Cpu, Code, Shield } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Cpu className="w-7 h-7 text-cyan-400 animate-float" />,
      title: "Neural OCR Engine",
      desc: "Advanced machine learning algorithms that understand document structure, not just text."
    },
    {
      icon: <Code className="w-7 h-7 text-indigo-400 animate-float-slow" />,
      title: "Instant JSON Conversion",
      desc: "Get structured, developer-ready JSON output immediately after upload. No manual entry."
    },
    {
      icon: <Shield className="w-7 h-7 text-purple-400 animate-float" />,
      title: "Bank-Grade Security",
      desc: "Your financial data is processed in ephemeral encrypted containers and never stored."
    }
  ];

  return (
    <section id="features-section" className="py-32 bg-slate-950 relative z-10 border-t border-cyan-400/10 animate-fade-in">
      {/* Parallax/floating glassmorphism elements */}
      <div className="absolute -top-24 left-1/3 w-60 h-60 bg-gradient-to-br from-cyan-400/20 via-indigo-400/10 to-purple-400/10 rounded-full blur-2xl opacity-40 animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-gradient-to-tr from-cyan-400/10 to-purple-400/10 rounded-full blur-2xl opacity-30 animate-float" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-shadow-cyan animate-gradient-move">Why OneStack?</h2>
          <p className="text-cyan-200 max-w-2xl mx-auto text-lg animate-fade-in">
            We bridge the gap between static documents and dynamic databases with precision and speed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-10 rounded-3xl bg-slate-900/80 border-2 border-cyan-400/10 hover:border-cyan-400/30 hover:bg-slate-900/90 transition-all duration-300 group shadow-xl shadow-cyan-400/10 animate-float"
              style={{ boxShadow: '0 4px 32px 0 rgba(34,212,255,0.10)' }}
            >
              <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-7 group-hover:scale-110 transition-transform duration-300 shadow shadow-cyan-400/10 animate-float">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 text-shadow-cyan animate-fade-in">{feature.title}</h3>
              <p className="text-cyan-200 leading-relaxed animate-fade-in">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};