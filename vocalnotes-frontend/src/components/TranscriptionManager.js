import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';

const TranscriptionManager = ({ transcriptionId }) => {
    const [transcription, setTranscription] = useState('');
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');

    const handleLanguageSelect = (lang) => {
        setTargetLang(lang);
    };

    const handleTranslateLatest = async (selectedLanguage) => {
        try {
          const response = await fetch('http://localhost:5000/api/translate-latest-transcription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ targetLang: selectedLanguage }),
          });
      
          const result = await response.json();
          if (result.translatedText) {
            console.log('Translated Text:', result.translatedText);
            setTranslatedText(result.translatedText);
          }
        } catch (error) {
          console.error('Error translating the latest transcription:', error);
        }
      };

    return (
        <div>
            <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            <button onClick={handleTranslateLatest}>Translate</button>
            {translatedText && <p>Translated Text: {translatedText}</p>}
        </div>
    );
};

export default TranscriptionManager;
