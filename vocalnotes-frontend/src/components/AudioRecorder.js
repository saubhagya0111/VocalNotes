import React, { useState } from "react";
import { useTranslation } from 'react-i18next'; // Add this line
import { useNavigate } from 'react-router-dom'; // Add this line

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState(""); // For storing transcription
  const [loading, setLoading] = useState(false); // For loading state
  const [exporting, setExporting] = useState(false); // For export state
  const { t } = useTranslation();
  const navigate = useNavigate();

  // const goToMultiLangSupport = () => {
  //   navigate('/multi-lang-support'); // Navigate to the multi-language support screen
  // };

  // Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      console.log("Audio blob captured", event.data);
      setAudioBlob(event.data); // Capture the audio blob
    };

    recorder.start();
    setRecording(true);
    setMediaRecorder(recorder);
    console.log("Recording started");
  };

  // Stop recording and transcribe audio
  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
    console.log("Recording stopped");
    transcribeAudio(); // Send to transcription route
  };

  // Send audio for transcription
  const transcribeAudio = async () => {
    if (!audioBlob) {
      console.log("No audio data to upload");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.mp3");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/transcribe-audio", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setTranscription(result.transcription); // Set the transcription result
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export the transcription
  const handleExport = async (format) => {
    if (!transcription) {
      alert("No transcription available to export");
      return;
    }

    setExporting(true);
    try {
      const response = await fetch(`http://localhost:5000/exports/export-${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: transcription }),
      });

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;

      // Set the appropriate file name and type based on the format
      if (format === "pdf") {
        link.setAttribute("download", "transcription.pdf");
      } else if (format === "csv") {
        link.setAttribute("download", "transcription.csv");
      } else if (format === "word") {
        link.setAttribute("download", "transcription.docx");
      }

      // Append to the document and trigger download
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
      <h2>Record Audio</h2>
      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      {/* Show the transcription result */}
      {loading && <p>Transcribing...</p>}
      {transcription && (
        <div>
          <p>Transcription: {transcription}</p>

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
          <button onClick={() => navigate('/translate')}>Go to Multi-Lang Translation</button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
