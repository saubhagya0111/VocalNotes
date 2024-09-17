import React, { useState } from 'react';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  // Start recording using the MediaRecorder API
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      setAudioBlob(event.data);  // Store the recorded audio blob
      console.log('Audio Blob captured:', event.data);  // Log the blob to verify
    };

    recorder.start();
    console.log('Recording started');
    setRecording(true);
    setMediaRecorder(recorder);
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorder.stop();
    console.log('Recording stopped');
    setRecording(false);
  };

  // Upload the audio file to the backend
  const uploadAudio = async () => {
    if (!audioBlob) {
      console.log('No audio data to upload');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.mp3');

    console.log('Uploading audio to server...');
    const response = await fetch('http://localhost:5000/upload-audio', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Server response:', result);
  };

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
      {audioBlob && <button onClick={uploadAudio}>Upload Recording</button>}
    </div>
  );
};

export default AudioRecorder;
