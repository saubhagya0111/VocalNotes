import React, { useState } from 'react';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
    // Handle file upload selection
    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
        console.log('Selected file:', event.target.files[0]);
      };

  // Upload the audio file to the backend
  const uploadAudio = async () => {
    const formData = new FormData();

    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.mp3');  // If recording exists, use it
      console.log('Uploading recorded audio...');
    } else if (selectedFile) {
      formData.append('audio', selectedFile);  // If file is selected, use it
      console.log('Uploading selected file...');
    } else {
      console.log('No audio or file selected for upload');
      return;
    }

    const response = await fetch('http://localhost:5000/upload-audio', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Server response:', result);
  };


  return (
    <div>
    <div>
        <h2>Upload or Record Audio</h2>
        <label htmlFor="fileUpload">Upload Audio: </label>
        <input type="file" id="fileUpload" accept="audio/*" onChange={handleFileSelect} />
      </div>
    <div>
      {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
            <button onClick={stopRecording}>Stop Recording</button>
        )}
      {(audioBlob || selectedFile) && <button onClick={uploadAudio}>Upload Recording</button>}
     </div>
    </div>
  );
};

export default AudioRecorder;
