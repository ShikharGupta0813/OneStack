import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
interface PdfEntry {
  pdf_id: number;
  filename: string;
}

export const HistoryPage: React.FC = () => {
  const [list, setList] = useState<PdfEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/pdf_ids");
      setList(res.data);
    } catch (err) {
      console.error("History Fetch Error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 px-6 max-w-5xl mx-auto text-white">
        <Header/>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-4xl font-bold mb-6">Uploaded PDFs</h2>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-slate-400">No PDFs uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((pdf) => (
            <button
              key={pdf.pdf_id}
              onClick={() => navigate(`/pdf/${pdf.pdf_id}/tables`)}
              className="w-full text-left px-6 py-4 bg-slate-800 rounded-xl 
                         border border-cyan-400/20 hover:bg-slate-700 transition"
            >
              <h3 className="text-xl font-bold text-cyan-300">PDF #{pdf.pdf_id}</h3>
              <p className="text-slate-400 text-sm">{pdf.filename}</p>
            </button>
          ))}
        </div>
      )}
      <Footer/>
    </div>
  );
};
