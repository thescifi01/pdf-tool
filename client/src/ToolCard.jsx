function ToolCard({ tool, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 border rounded-lg shadow hover:shadow-lg transition ${
        active ? "bg-blue-500 text-white" : "bg-white"
      }`}
    >
      ✅ {tool.name}
    </button>
  );
}

export default ToolCard;
