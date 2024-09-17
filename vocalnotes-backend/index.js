const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();

// Enable CORS for communication between frontend and backend
app.use(cors({ origin: 'http://localhost:3000' }));

// Multer setup for storing audio files
const upload = multer({
  dest: 'uploads/'  // Files will be saved in the 'uploads' directory
});

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

// Start server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
