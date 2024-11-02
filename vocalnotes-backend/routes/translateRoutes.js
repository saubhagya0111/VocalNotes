const express = require('express');
const axios = require('axios');
const Transcription = require('../models/Transcription'); // Ensure this model exists and points correctly
const router = express.Router();

// Route to translate transcription
router.post('/translate-transcription/:id', async (req, res) => {
    const { id } = req.params;
    const { targetLang } = req.body;

    if (!targetLang) {
        return res.status(400).json({ message: 'Target language is required' });
    }

    try {
        const transcription = await Transcription.findById(id);
        if (!transcription) {
            return res.status(404).json({ message: 'Transcription not found' });
        }

        // Translation API request (replace with your actual API details)
        const apiKey = process.env.TRANSLATION_API_KEY;
        const response = await axios.post(`https://translation-api-url?key=${apiKey}`, {
            q: transcription.text, // Make sure this field matches your transcription structure
            target: targetLang,
        });

        const translatedText = response.data.translations[0].translatedText;

        res.status(200).json({ originalText: transcription.text, translatedText });
    } catch (error) {
        res.status(500).json({ message: 'Error translating transcription', error: error.message });
    }
});

module.exports = router;
