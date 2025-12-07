import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useParams } from "react-router-dom";

export default function PdfDetailsPage() {
  const { pdf_id } = useParams();
  const [tables, setTables] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function load() {
      // Fetch all table names
      const allTables = await api.get("/tables");
      const tableNames = allTables.data.tables;

      // Filter tables related to this PDF
      const match = tableNames.filter(t => t.includes(`_${pdf_id}`));
      setTables(match);

      // Fetch full text
      const t = await api.get(`/text/${pdf_id}`);
      setText(t.data.text.full_text || "");
    }
    load();
  }, [pdf_id]);

  return (
    <div className="page">
      <h2>PDF #{pdf_id} Details</h2>

      <h3>Extracted Tables</h3>
      {tables.length === 0 && <p>No tables found.</p>}

      {tables.map((tbl) => (
        <TableBox key={tbl} tbl={tbl} />
      ))}

      <h3>Full Extracted Text</h3>
      <pre className="text-box">{text}</pre>
    </div>
  );
}

function TableBox({ tbl }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get(`/table/${tbl}`).then((res) => setRows(res.data));
  }, [tbl]);

  if (rows.length === 0) return null;

  const cols = Object.keys(rows[0]);

  return (
    <div className="table-box">
      <h4>{tbl}</h4>
      <table>
        <thead>
          <tr>
            {cols.map((c) => <th key={c}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => <td key={c}>{r[c]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
