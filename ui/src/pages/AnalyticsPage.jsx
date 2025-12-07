import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function AnalyticsPage() {
  const [tables, setTables] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get("/tables").then((res) => setTables(res.data.tables));
  }, []);

  const loadAnalytics = async (tbl) => {
    const res = await api.get(`/analytics/${tbl}`);
    setResult(res.data);
  };

  return (
    <div className="page">
      <h2>Analytics</h2>

      {tables.map((t) => (
        <button key={t} onClick={() => loadAnalytics(t)} className="btn small">
          {t}
        </button>
      ))}

      {result && (
        <pre className="text-box">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
