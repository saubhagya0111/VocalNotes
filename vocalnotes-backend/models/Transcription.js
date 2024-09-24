const { text } = require('express');
const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file: { type: String, required: true },
  transcription: { type: String, required: true },
  text: String,
  createdAt: { type: Date, default: Date.now },
});

// Create a text index on the "transcription" field for searchability
transcriptionSchema.index({ transcription: 'text' });
transcriptionSchema.index({ text: 'text' });

const Transcription = mongoose.model('Transcription', transcriptionSchema);
module.exports = Transcription;