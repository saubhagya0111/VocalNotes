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
