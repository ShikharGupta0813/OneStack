import { useState } from "react";
import { api } from "../api/api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const upload = async () => {
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/upload", form);
      setMsg(`Uploaded! PDF ID: ${res.data.pdf_id}`);
    } catch (err) {
      setMsg("Error uploading file");
    }
  };

  return (
    <div className="page">
      <h2>Upload PDF</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="input"
      />
      <button onClick={upload} className="btn">Upload</button>
      <p>{msg}</p>
    </div>
  );
}
