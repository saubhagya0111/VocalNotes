const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();  // This loads variables from .env into process.env

const app = express();
const port = 3000;

// Replace this with your MongoDB connection string
const dbURI = 'mongodb://localhost:27017/audionotes';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get('/test', (req, res) => {
  res.send('Server is running fine!');
});

const User = require('./models/User');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
});


const bcrypt = require('bcrypt');

// User registration route
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create and save the new user
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});


const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// User login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },  // Limit file size to 10MB
}).single('audio');

// Audio file upload route
app.post('/upload', upload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.status(200).json({
    message: 'File uploaded successfully',
    file: req.file.filename
  });
});


// transcribing the file
const fs = require('fs');
const OpenAI = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure your OpenAI API key is in .env
});

// Audio transcription route
app.post('/transcribe', upload, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Path to the uploaded file
    const audioFilePath = `./uploads/${req.file.filename}`;
    const audioFile = fs.createReadStream(audioFilePath);

    // Send file to OpenAI's Whisper API for transcription
    const response = await openai.audio.transcriptions.create({
      model: 'whisper-1', // OpenAI Whisper model for transcription
      file: audioFile,
    });

    // Extract transcription text from the response
    const transcription = response.text;

    // Return the transcription to the client
    res.status(200).json({
      message: 'Transcription successful',
      transcription
    });
  } catch (error) {
    res.status(500).json({ message: 'Transcription failed', error: error.message });
  }
});

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);


//testing the open-ai api key
app.get('/test-openai', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // Use GPT-3.5 model
      messages: [{ role: "user", content: "Hello, OpenAI!" }],
    });

    res.status(200).json({ message: 'Connection successful', response });
  } catch (error) {
    console.error('OpenAI connection error:', error);
    res.status(500).json({ message: 'OpenAI connection failed', error: error.message });
  }
});


//testing the open ai models
app.get('/models', async (req, res) => {
  try {
    const response = await openai.models.list();
    res.status(200).json({ models: response.data });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Failed to fetch models', error: error.message });
  }
});
