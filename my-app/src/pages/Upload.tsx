import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { api } from "../api/api";
import { LoadingScreen } from "../components/LoadingScreen";

export default function Upload() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleUpload = async (file: File) => {
    setLoading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await api.post("/upload", formData);
      const pdfId = uploadRes.data.pdf_id;

      navigate(`/pdf/${pdfId}/tables`);
    } catch (err) {
      console.error("Upload Error:", err);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen fileName={fileName} />;

  return <FileUpload onFileUpload={handleUpload} onBack={() => navigate("/")} />;
}
