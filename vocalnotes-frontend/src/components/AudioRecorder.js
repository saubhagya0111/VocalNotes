import React, { useState } from 'react';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');  // For storing transcription
  const [loading, setLoading] = useState(false);  // For loading state

  // Start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      console.log("Audio blob captured",event.data);
      setAudioBlob(event.data);  // Capture the audio blob
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
    transcribeAudio();  // Send to transcription route
  };

  // Send audio for transcription
  const transcribeAudio = async () => {
    if (!audioBlob) {
      console.log("No audio data to upload");
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3');

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTranscription(result.transcription);  // Set the transcription result
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setLoading(false);
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
<div>
  {/* {(audioBlob || selectedFile)} */}
</div>
      {/* Show the transcription result */}
      {loading && <p>Transcribing...</p>}
      {transcription && <p>Transcription: {transcription}</p>}
    </div>
  );
};

export default AudioRecorder;