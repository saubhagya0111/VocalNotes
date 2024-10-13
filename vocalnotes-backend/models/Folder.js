const mongoose = require('mongoose');

// Define the Folder schema
const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // The folder must have a name
    unique: true,    // Ensure that folder names are unique
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set the folder creation date
  },
});

// Export the Folder model
module.exports = mongoose.model('Folder', folderSchema);