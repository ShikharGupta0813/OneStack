import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { api } from "../api/api";
import { useState } from "react";

export default function Upload() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);

    const form = new FormData();
    form.append("file", file);

    const uploadRes = await api.post("/upload", form);
    const pdfId = uploadRes.data.pdf_id;

    navigate(`/pdf/${pdfId}/tables`);
  };

  return (
    <FileUpload
      onFileUpload={handleFileUpload}
      onBack={() => navigate("/")}
    />
  );
}
