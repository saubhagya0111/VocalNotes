import React, { useState } from "react";

const AudioTranscriber = () => {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);

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
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber;
