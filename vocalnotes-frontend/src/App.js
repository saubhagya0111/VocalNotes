import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Add this line
import AudioRecorder from "./components/AudioRecorder";
import AudioTranscriber from "./components/AudioTranscriber";
import SearchTranscriptions from "./components/SearchTranscriptions";
import MultiLangSupport from './components/MultiLangSupport'; // Import the component correctly
import TranscriptionManager from './components/TranscriptionManager'; // Import new component
import MultiLangTranslation from "./components/MultiLangTranslation";


function App() {
  return (
    <div className="App">
      <h1>Vocal Notes Recording</h1>
      <Router>
        <Routes>
          <Route path="/" element={<AudioRecorder />} />
          {/* <Route path="/multi-lang-support" element={<MultiLangSupport />} /> */}
          <Route path="/translate" element={<MultiLangTranslation />} />
        </Routes>
      </Router>
      {/* <AudioRecorder /> */}
      <AudioTranscriber />
      <SearchTranscriptions />
    </div>
  );
}

export default App;
