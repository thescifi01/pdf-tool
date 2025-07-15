import { useState } from "react";
import ToolCard from "./components/ToolCard";
import "./index.css";

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
    if (e.target.multiple) setFiles([...e.target.files]);
    else setFile(e.target.files[0]);
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
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-center font-sans">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">📄 PDF Tool</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {tools.map((tool, i) => (
          <ToolCard
            key={i}
            tool={tool}
            active={selectedTool?.name === tool.name}
            onClick={() => {
              setSelectedTool(tool);
              setFile(null);
              setFiles([]);
              setOutputURL(null);
            }}
          />
        ))}
      </div>

      {selectedTool && (
        <div className="mt-6 p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{selectedTool.name}</h2>
          <input
            type="file"
            onChange={handleFileChange}
            accept={selectedTool.accept}
            multiple={selectedTool.multiple}
            className="mb-4 block mx-auto"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Upload & Convert"}
          </button>

          {outputURL && (
            <div className="mt-4">
              <a
                href={outputURL}
                download
                className="text-green-600 font-bold underline"
              >
                📥 Download Result
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
