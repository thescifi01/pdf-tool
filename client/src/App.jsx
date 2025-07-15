import { useState } from "react";
import "./App.css";

const tools = [
  { name: "Image to PDF", api: "/api/image-to-pdf", accept: "image/*" },
  { name: "Combine PDFs", api: "/api/combine-pdf", accept: "application/pdf", multiple: true },
  { name: "Split PDF", api: "/api/split-pdf", accept: "application/pdf" },
  { name: "Compress PDF", api: "/api/compress-pdf", accept: "application/pdf" },
  { name: "Compress Image", api: "/api/compress-image", accept: "image/*" },
];

const API_BASE = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [outputURL, setOutputURL] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const input = e.target;
    if (input.multiple) setFiles([...input.files]);
    else setFile(input.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedTool) return alert("Select a tool");
    const formData = new FormData();
    if (selectedTool.multiple) {
      files.forEach((f) => formData.append("files", f));
    } else {
      formData.append("file", file);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${selectedTool.api}`, {
        method: "POST",
        body: formData,
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setOutputURL(url);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>📄 PDF Tool</h1>
      <p>Select a tool:</p>
      {tools.map((tool, i) => (
        <button
          key={i}
          onClick={() => {
            setSelectedTool(tool);
            setFile(null);
            setFiles([]);
            setOutputURL(null);
          }}
          style={{
            margin: "0.25rem",
            padding: "0.5rem 1rem",
            backgroundColor: selectedTool?.name === tool.name ? "#2d89ef" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          ✅ {tool.name}
        </button>
      ))}

      {selectedTool && (
        <>
          <hr />
          <h3>Upload file for: {selectedTool.name}</h3>
          <input
            type="file"
            onChange={handleFileChange}
            accept={selectedTool.accept}
            multiple={selectedTool.multiple}
          />
          <br />
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
          >
            {loading ? "Processing..." : "Convert"}
          </button>
        </>
      )}

      {outputURL && (
        <>
          <hr />
          <a href={outputURL} download style={{ color: "green", fontWeight: "bold" }}>
            📥 Download Result
          </a>
        </>
      )}
    </div>
  );
}

export default App;
