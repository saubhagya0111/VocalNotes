const express = require("express");
const OpenAI = require("openai");
const Transcription = require("../models/Transcription");
const router = express.Router();
require("dotenv").config(); // Load environment variables

// Set up OpenAI configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to translate the most recent transcription
router.post("/translate-latest-transcription", async (req, res) => {
  const { targetLang } = req.body;

  console.log("Received request to translate the latest transcription");
  console.log("Target language specified:", targetLang);

  if (!targetLang) {
    console.log("Target language not provided");
    return res.status(400).json({ message: "Target language is required" });
  }

  try {
    console.log("Fetching the most recent transcription from the database...");
    const latestTranscription = await Transcription.findOne().sort({ createdAt: -1 });

    if (!latestTranscription) {
      console.log("No transcriptions found in the database");
      return res.status(404).json({ message: "No transcriptions found" });
    }

    console.log("Latest transcription found:", latestTranscription.text);

    // Request translation using OpenAI API
    const prompt = `Translate the following text to ${targetLang}:

${latestTranscription.text}`;
    console.log("Generated prompt for OpenAI:", prompt);

    console.log("Sending request to OpenAI API...");
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Replace with "gpt-4" if available
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    console.log("Received response from OpenAI API");
    console.log("OpenAI response data:", response);

    // Check if the response contains the choices property
    if (response && response.choices && response.choices.length > 0) {
      const translatedText = response.choices[0].message.content.trim();
      console.log("Translated text:", translatedText);

      res.status(200).json({ originalText: latestTranscription.text, translatedText, id: latestTranscription._id });
    } else {
      console.error("Unexpected response structure from OpenAI API:", response);
      res.status(500).json({ message: "Unexpected response from OpenAI API" });
    }
  } catch (error) {
    console.error("Error during translation process:", error);
    res.status(500).json({ message: "Error translating transcription", error: error.message });
  }
});

module.exports = router;
