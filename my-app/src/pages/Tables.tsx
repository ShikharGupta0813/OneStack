import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { DynamicTable } from "../components/DynamicTable";
import { CheckCircle } from "lucide-react";

interface TableMap {
  name: string;
  data: any[];
}

export default function Tables() {
  const { pdfId } = useParams();
  const [tables, setTables] = useState<TableMap[]>([]);
  const [fullText, setFullText] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Fetch list of table names
        const tableRes = await api.get(`/pdf/${pdfId}/tables`);
        const tableNames: string[] = tableRes.data.tables;

        const finalTables: TableMap[] = [];

        // Fetch each table's data and push to array
        for (const t of tableNames) {
          const d = await api.get(`/table/${t}`);
          finalTables.push({ name: t, data: d.data });
        }

        setTables(finalTables);

        // Fetch full text from PDF
        const textRes = await api.get(`/text/${pdfId}`);
        setFullText(textRes.data.full_text);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, [pdfId]);

  return (
    <div className="pt-10 px-6 max-w-7xl mx-auto text-white">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-cyan mb-1 animate-fade-in">
        Extracted Data (PDF #{pdfId})
      </h2>
      <div>
        <div className="flex items-center gap-2 text-cyan-400 mb-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} />
          <span className="tracking-wide">Analysis Complete</span>
        </div>
        {/* <h2 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-cyan mb-1 animate-fade-in">Extraction Results</h2> */}
        {/* <div className="text-slate-400 text-xs md:text-sm font-mono animate-fade-in">{fileName}</div> */}
      </div>
      {/* ================================
           SHOW TABLES — ONE BELOW ANOTHER
         ================================ */}
      {tables.map((table, idx) => (
        <div
          key={idx}
          className="mb-16 p-6 rounded-2xl bg-slate-900/70 border border-cyan-400/20 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">
            {table.name}
          </h2>

          <DynamicTable data={table.data} fileName={table.name} />
        </div>
      ))}

      {/* ================================
           TEXT SECTION
         ================================ */}
      <div className="mt-20 p-6 bg-slate-900/80 border border-indigo-400/20 rounded-2xl shadow-xl">
        <h2 className="text-3xl text-indigo-300 font-bold mb-4">
          Extracted Text
        </h2>

        <p className="text-slate-200 text-lg leading-8 whitespace-pre-line">
          {fullText}
        </p>
      </div>
    </div>
  );
}
