const express = require('express');
const mongoose = require('mongoose');

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
