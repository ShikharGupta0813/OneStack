import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Link } from "react-router-dom";

export default function PdfListPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get("/pdf_ids")
      .then((res) => {
        if (Array.isArray(res.data)) setList(res.data);
      })
      .catch(() => setList([]));
  }, []);

  return (
    <div className="page">
      <h2>Uploaded PDFs</h2>
      <Link to="/upload" className="btn">Upload New PDF</Link>

      {list.map((pdf) => (
        <div key={pdf.pdf_id} className="card">
          <Link to={`/pdf/${pdf.pdf_id}`} className="link">
            {pdf.filename} (ID: {pdf.pdf_id})
          </Link>
        </div>
      ))}
    </div>
  );
}
