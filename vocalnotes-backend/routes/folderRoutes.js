const express = require("express");
const router = express.Router();
const Folder = require("../models/Folder"); // Assuming Folder model is defined in models/Folder.js
const Transcription = require("../models/Transcription"); // Assuming Transcription model is defined in models/Transcription.js

// Create folder route
router.post("/create-folder", async (req, res) => {
  const { name } = req.body || {};
  console.log("body",req.body);
  if (!name) {
      console.log("Request body:", req.body);
    return res.status(400).json({ message: "Folder name is required" });
  }

  try {
    const folder = new Folder({ name });
    await folder.save();
    res.status(201).json({ folder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating folder", error: error.message });
  }
});

// Fetch all folders route
router.get("/folders", async (req, res) => {
  try {
    const folders = await Folder.find({});
    res.status(200).json(folders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching folders", error: error.message });
  }
});

// Map note to folder route
router.post("/add-note-to-folder", async (req, res) => {
  const { transcriptionId, folderId } = req.body;

  if (!transcriptionId || !folderId) {
    return res
      .status(400)
      .json({ message: "Transcription ID and Folder ID are required" });
  }

  try {
    const transcription = await Transcription.findById(transcriptionId);
    if (!transcription) {
      return res.status(404).json({ message: "Transcription not found" });
    }

    transcription.folder = folderId;
    await transcription.save();

    res
      .status(200)
      .json({ message: "Note added to folder successfully", transcription });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding note to folder", error: error.message });
  }
});

// Fetch notes in a folder route
router.get("/notes-in-folder/:folderId", async (req, res) => {
  const { folderId } = req.params;

  try {
    const notes = await Transcription.find({ folder: folderId });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching notes in folder",
        error: error.message,
      });
  }
});

module.exports = router;
