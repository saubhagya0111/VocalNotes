import React, { useState } from "react";

const AudioTranscriber = () => {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTranscribe = async () => {
    if (!file) {
      alert("Please upload an audio file first");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setTranscription(result.transcription || "Transcription failed");
    } catch (error) {
      console.error("Error during transcription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!transcription) {
      alert("No transcription available to export");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/exports/export-${format}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: transcription }), // Pass transcription as 'text'
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;

      if (format === "pdf") {
        link.setAttribute("download", "transcription.pdf");
      } else if (format === "csv") {
        link.setAttribute("download", "transcription.csv");
      } else if (format === "word") {
        link.setAttribute("download", "transcription.docx");
      }

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Error exporting transcription as ${format}:`, error);
      alert(`Failed to export transcription as ${format}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h2>Upload and Transcribe Audio</h2>

      <input type="file" accept="audio/*" onChange={handleFileUpload} />
      <button onClick={handleTranscribe} disabled={loading}>
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>

      {transcription && (
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>

          <h3>Export Transcription:</h3>
          <button onClick={() => handleExport("pdf")} disabled={exporting}>
            {exporting ? "Exporting PDF..." : "Export as PDF"}
          </button>
          <button onClick={() => handleExport("csv")} disabled={exporting}>
            {exporting ? "Exporting CSV..." : "Export as CSV"}
          </button>
          <button onClick={() => handleExport("word")} disabled={exporting}>
            {exporting ? "Exporting Word..." : "Export as Word"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber;
