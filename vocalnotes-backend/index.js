const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
require('dotenv').config();
const path=require('path');
const axios = require('axios');
const FormData = require('form-data');
const mongoose=require('mongoose');
const folderRoutes = require('./routes/folderRoutes');
const bodyParser = require('body-parser')
const i18nMiddleware = require('i18next-http-middleware');
const i18n = require('./i18n'); // Import the i18n configuration
// Replace this with your MongoDB connection string
const dbURI = 'mongodb://127.0.0.1:27017/audionotes';
const exportRoutes = require('./routes/exportRoutes');  // Import the export routes
const translateRoute = require('./routes/translateRoutes');



mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log('MongoDB connection error:', err));

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
app.post('/upload-audio',upload,function(req, res,next) {
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
app.post('/transcribe-audio',upload, async (req, res) => {
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
    
    const newTranscription = new Transcription({
      file: req.file.filename,
      transcription: response.data.text
    });
    await newTranscription.save();

    res.status(200).json({
      message: 'Transcription successful',
      transcription: transcription,
      id: newTranscription._id
    });
  } catch (error) {
    console.error('Transcription failed:', error.message);
    res.status(500).json({ message: 'Transcription failed', error: error.message });
  }
});

const Transcription = require('./models/Transcription');  // Import the transcription model

// Search route for transcriptions
app.get('/search-transcriptions', async (req, res) => {
  const searchQuery = req.query.q?.trim();  // Get the search query from URL query string and trim it
  const page = parseInt(req.query.page) || 1;  // Default to page 1
  const limit = parseInt(req.query.limit) || 10;  // Default to 10 results per page
  const skip = (page - 1) * limit;  // Calculate how many documents to skip for pagination

  // Validate that the search query is provided
  if (!searchQuery || searchQuery.length === 0) {
    return res.status(400).json({ message: 'Search failed', error: 'Search text must be a valid, non-empty string' });
  }
  
  try {
    // Perform a partial search using regex (case-sensitive by default)
    const query = {
      $text: { $search: searchQuery }  // full text search
    };
    
    // Fetch the results with pagination
    const results = await Transcription.find(query)
    .skip(skip)  // Skip results based on the current page
    .limit(limit);  // Limit the number of results returned
    
    // Count total documents that match the search query for pagination
    const total = await Transcription.countDocuments(query);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'No transcriptions found' });
    }

    res.status(200).json({
      message: 'Search results',
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit)  // Calculate the total number of pages
    });
  } catch (error) {
    console.error('Search failed:', error.message);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});
app.use(express.json());
app.use(i18nMiddleware.handle(i18n)); // Add this line for i18n support
app.use(express.urlencoded({ extended: true }));

//Route to get translation for the transcriptions
app.get('/greet', (req, res) => {
  res.send({ message: req.t('welcomeMessage') }); // Use `req.t()` for translations
});

app.use('/api', translateRoute);
// Route to retrieve all transcriptions
app.get('/transcriptions', async (req, res) => {
  try {
    const transcriptions = await Transcription.find();  // Find all transcriptions in the database
    res.status(200).json({
      message: 'Transcriptions fetched successfully',
      transcriptions: transcriptions
    });
  } catch (error) {
    console.error('Error fetching transcriptions:', error.message);
    res.status(500).json({ message: 'Error fetching transcriptions', error: error.message });
  }
});

const path1 = '/Users/saubhagyachopra/Dev/VocalNotes/vocalnotes-backend/exports';  // Adjust with the correct path

fs.access(path1, fs.constants.W_OK, (err) => {
  if (err) {
    console.error(`No write permission for the directory: ${path1}`);
  } else {
    console.log(`Write permission granted for the directory: ${path1}`);
  }
});

app.use('/api/folders', folderRoutes);

// app.use(bodyParser.urlencoded({ extended: true }));  // Also, add URL encoding parser for form data
app.use(express.urlencoded({ extended: true }));
app.use('/exports', exportRoutes);

// app.post('/test', (req, res) => {
//   console.log('Body:', req.body);
//   res.send('Test complete');
// });
app.use((req, res, next) => {
  console.log(`Request to ${req.path} with body:`, req.body);
  next();
});
// Start server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
