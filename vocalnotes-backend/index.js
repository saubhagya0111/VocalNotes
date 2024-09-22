const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
require('dotenv').config();
const path=require('path');
const axios = require('axios');
const FormData = require('form-data');

// Enable CORS for communication between frontend and backend
app.use(cors({ origin: 'http://localhost:3000' }));

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const fileext=path.extname(file.originalname);
    const fileName = 'recording-' + Date.now() + fileext;  // Use .mp3 extension
    cb(null, fileName);
  }
});
// Multer setup for storing audio files
const upload = multer({
  storage:storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /mp3|mpeg|wav|webm|ogg/;  // Allowed file types
    const mimetype = filetypes.test(file.mimetype);  // Check MIME type
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());  // Check file extension

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('File type not supported'));
  },
  dest: 'uploads/'  // Files will be saved in the 'uploads' directory
}).single('audio');

// Ensure 'uploads/' directory exists
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// API endpoint for handling audio uploads
app.post('/upload-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Return a response indicating a successful upload
  res.status(200).json({
    message: 'Audio uploaded successfully',
    file: req.file
  });
});
const OpenAI = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure your OpenAI API key is in .env
});

// Transcription route
app.post('/transcribe-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const audioFilePath = `./uploads/${req.file.filename}`;
    const formData = new FormData();

    // Append the file and model to FormData
    formData.append('file', fs.createReadStream(audioFilePath));
    formData.append('model', 'whisper-1');

    // Send file to OpenAI's Whisper API for transcription
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
    });

    const transcription = response.data.text;  // Extract transcription text
    res.status(200).json({
      message: 'Transcription successful',
      transcription: transcription,
    });
  } catch (error) {
    console.error('Transcription failed:', error.message);
    res.status(500).json({ message: 'Transcription failed', error: error.message });
  }
});

// Start server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
