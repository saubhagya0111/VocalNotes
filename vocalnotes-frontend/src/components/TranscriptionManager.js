import React, { useState } from 'react';
import LanguageSelector from './LanguageSelector';

const TranscriptionManager = ({ transcriptionId }) => {
    const [transcription, setTranscription] = useState('');
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');

    const handleLanguageSelect = (lang) => {
        setTargetLang(lang);
    };

    const handleTranslate = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/translate-transcription/${transcriptionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ targetLang }),
            });
            const result = await response.json();
            setTranslatedText(result.translatedText);
        } catch (error) {
            console.error('Error translating transcription:', error);
        }
    };

    return (
        <div>
            <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            <button onClick={handleTranslate}>Translate</button>
            {translatedText && <p>Translated Text: {translatedText}</p>}
        </div>
    );
};

export default TranscriptionManager;
