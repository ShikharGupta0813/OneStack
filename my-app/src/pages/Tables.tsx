import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { DynamicTable } from "../components/DynamicTable";
import { CheckCircle } from "lucide-react";

interface TableMap {
  name: string;
  data: any[];
}

interface ColumnStats {
  min: number | null;
  max: number | null;
  avg: number | null;
}

interface AnalyticsMap {
  [tableName: string]: {
    [column: string]: ColumnStats;
  };
}

export default function Tables() {
  const { pdfId } = useParams();
  const [tables, setTables] = useState<TableMap[]>([]);
  const [fullText, setFullText] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsMap>({});

  useEffect(() => {
    async function load() {
      try {
        const tableRes = await api.get(`/pdf/${pdfId}/tables`);
        const tableNames: string[] = tableRes.data.tables;

        const finalTables: TableMap[] = [];
        const tableAnalytics: AnalyticsMap = {};

        for (const t of tableNames) {
          // Fetch table rows
          const d = await api.get(`/table/${t}`);
          finalTables.push({ name: t, data: d.data });

          // Fetch analytics
          const a = await api.get(`/analytics/${t}`);
          tableAnalytics[t] = a.data.analytics; // <-- CORRECT FOR YOUR RESPONSE
        }

        setTables(finalTables);
        setAnalytics(tableAnalytics);

        // Fetch full text
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
          {/* --- Analytics Section --- */}
          {analytics[table.name] && (
            <div className="mt-6 p-4 bg-slate-800/80 border border-cyan-400/20 rounded-xl">
              <h3 className="text-xl font-semibold text-cyan-300 mb-3">
                Analytics for {table.name}
              </h3>

              <table className="w-full text-left border-collapse text-slate-200">
                <thead>
                  <tr className="border-b border-cyan-400/20">
                    <th className="px-3 py-2">Column</th>
                    <th className="px-3 py-2">Min</th>
                    <th className="px-3 py-2">Max</th>
                    <th className="px-3 py-2">Avg</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(analytics[table.name]).map(([col, stats]) => (
                    <tr key={col} className="border-b border-cyan-400/10">
                      <td className="px-3 py-2">{col}</td>
                      <td className="px-3 py-2">{stats.min ?? "—"}</td>
                      <td className="px-3 py-2">{stats.max ?? "—"}</td>
                      <td className="px-3 py-2">{stats.avg ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
