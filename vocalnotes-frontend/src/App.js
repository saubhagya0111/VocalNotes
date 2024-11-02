import React from "react";
import AudioRecorder from "./components/AudioRecorder";
import AudioTranscriber from "./components/AudioTranscriber";
import SearchTranscriptions from "./components/SearchTranscriptions";

function App() {
  return (
    <div className="App">
      <h1>Vocal Notes Recording</h1>
      <Router>
        <Routes>
          <Route path="/" element={<AudioRecorder />} />
          <Route path="/multi-lang-support" element={<MultiLangSupport />} />
        </Routes>
      </Router>
      {/* <AudioRecorder /> */}
      <AudioTranscriber />
      <SearchTranscriptions />
    </div>
  );
}

export default App;
