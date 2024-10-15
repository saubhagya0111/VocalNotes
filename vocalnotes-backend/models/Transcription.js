const { text } = require("express");
const mongoose = require("mongoose");

const transcriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  file: { type: String, required: true },
  transcription: { type: String, required: true },
  text: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  // Reference to the Folder model to associate transcriptions with folders
  folder: {
    type: mongoose.Schema.Types.ObjectId, // This is the reference to a folder
    ref: "Folder", // Refers to the Folder model
    default: null, // Folder can be null if not categorized yet
  },
});

// Create a text index on the "transcription" field for searchability
transcriptionSchema.index({ transcription: "text" });
transcriptionSchema.index({ text: "text" });

const Transcription = mongoose.model("Transcription", transcriptionSchema);
module.exports = Transcription;
