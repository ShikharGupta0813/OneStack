import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { DynamicTable } from "../components/DynamicTable";

export default function TableView() {
  const { tableName } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await api.get(`/table/${tableName}`);
      setData(res.data);
    }
    load();
  }, [tableName]);

  return (
    <div className="pt-32 px-6">
      <DynamicTable data={data} fileName={tableName || ""} />
    </div>
  );
}
