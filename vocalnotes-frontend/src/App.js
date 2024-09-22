import React from "react";
import AudioRecorder from "./AudioRecorder";
import AudioTranscriber from "./AudioTranscriber";

function App() {
  return (
    <div className="App">
      <h1>Vocal Notes Recording</h1>
      <AudioRecorder />
      <AudioTranscriber />
    </div>
  );
}

export default App;
