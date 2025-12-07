import { useEffect, useState } from "react";
import { api } from "../api/api";

export default function RawJsonPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/raw/data").then((res) => setData(res.data));
  }, []);

  return (
    <div className="page">
      <h2>Raw JSON Data</h2>
      <pre className="text-box">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
