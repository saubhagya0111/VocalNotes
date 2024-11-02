const express = require("express");
const OpenAI = require("openai");
const Transcription = require("../models/Transcription");
const router = express.Router();
require("dotenv").config(); // Load environment variables

// Set up OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to translate transcription
router.post("/translate-transcription/:id", async (req, res) => {
  const { id } = req.params;
  const { targetLang } = req.body;

  console.log("Received request to translate transcription with ID:", id);
  console.log("Target language specified:", targetLang);

  if (!targetLang) {
    console.log("Target language not provided");
    return res.status(400).json({ message: "Target language is required" });
  }

  try {
    console.log("Fetching transcription from database...");
    const transcription = await Transcription.findById(id);

    if (!transcription) {
      console.log("Transcription not found for ID:", id);
      return res.status(404).json({ message: "Transcription not found" });
    }

    console.log("Transcription found:", transcription.text);

    // Request translation using OpenAI API
    const prompt = `Translate the following text to ${targetLang}:\n\n${transcription.text}`;
    console.log("Generated prompt for OpenAI:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Replace with "gpt-4" if available
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    console.log("Received response from OpenAI API");
    console.log("OpenAI response data:", response);

    const translatedText = response.choices[0].message.content.trim();
    console.log("Translated text:", translatedText);

    res.status(200).json({ originalText: transcription.text, translatedText });
  } catch (error) {
    console.error("Error during translation process:", error);
    res.status(500).json({
      message: "Error translating transcription",
      error: error.message,
    });
  }
});

module.exports = router;
