import React, { useState, useCallback } from "react";
import { ArrowLeft, Upload } from "lucide-react";
import { Footer } from "./Footer";
import { Header } from "./Header";

import { useNavigate } from "react-router-dom";


interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onBack?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onBack,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  console.log(isDragging);
  const navigate = useNavigate();
  // Drag–Drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type === "application/pdf") {
        onFileUpload(file); // <-- FIXED: call parent directly
      }
    },
    [onFileUpload]
  );

  // File Input
  const handleFileInput = (file: File | null) => {
    if (file && file.type === "application/pdf") {
      onFileUpload(file); // <-- FIXED
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-20 bg-slate-950">
      <Header />
      {onBack && (
        <div className="absolute top-24 left-4 flex items-center gap-4 z-20">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-cyan-300 hover:text-white transition-colors px-4 py-2"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          {/* History Button */}
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors px-4 py-2"
          >
            📄 History
          </button>
        </div>
      )}

      <div
        className={`relative group cursor-pointer`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="p-20 mt-20 bg-slate-900/90 rounded-3xl text-center">
          {/* <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mb-10">
            <Zap className="w-20 h-10 text-cyan-400" />
          </div> */}

          <h3 className="text-4xl font-bold text-white mb-4">Drop PDF File</h3>
          <p className="text-cyan-200 mb-6">Drag & drop or upload manually.</p>

          <button
            onClick={() => document.getElementById("file-input")?.click()}
            className="px-12 py-4 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-bold rounded-xl"
          >
            <Upload className="w-5 h-5 inline mr-2" /> Upload PDF
          </button>

          <input
            id="file-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileInput(e.target.files?.[0] || null)}
          />
        </div>
        <div className="mt-10 pt-20">
          <Footer />
        </div>
      </div>
    </section>
  );
};
