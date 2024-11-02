import React, { useState, useEffect } from 'react';

const MultiLangTranslation = () => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');

  const handleTranslate = async () => {
    try {
      console.log('Translating transcription...');
      const response = await fetch('http://localhost:5000/api/translate-latest-transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetLang: selectedLang }),
      });
  
      const result = await response.json();
      console.log('Response:', result); // Log the response
      {originalText && <div>
        <h3>Original Transcription</h3>
        <p>{originalText}</p>
      </div>}
      {translatedText && <div>
        <h3>Translated Output</h3>
        <p>{translatedText}</p>
      </div>}
      if (result.translatedText) {
        setOriginalText(result.originalText);
        setTranslatedText(result.translatedText);
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('Error translating transcription:', error);
    }
  };
  

  return (
    <div>
      <h2>Multi-Lang Translation</h2>
      <label htmlFor="language">Select Language:</label>
      <select id="language" value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
        <option value="en">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="hi">Hindi</option>
      </select>
      <button onClick={handleTranslate}>Translate</button>
      {originalText && (
        <div>
          <h3>Original Transcription</h3>
          <p>{originalText}</p>
        </div>
      )}
      {translatedText && (
        <div>
          <h3>Translated Output</h3>
          <p>{translatedText}</p>
        </div>
      )}
    </div>
  );
};

export default MultiLangTranslation;