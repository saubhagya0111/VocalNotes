const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transcriptionSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to user
  file: { type: String, required: true },  // Filename of the uploaded file
  transcription: { type: String, required: true },  // Transcribed text
  createdAt: { type: Date, default: Date.now }  // Automatically add creation date
});

const Transcription = mongoose.model('Transcription', transcriptionSchema);
module.exports = Transcription;
