import React, { useState } from 'react';

const LanguageSelector = ({ onSelectLanguage }) => {
    const [selectedLang, setSelectedLang] = useState('en');

    const handleChange = (event) => {
        const lang = event.target.value;
        setSelectedLang(lang);
        onSelectLanguage(lang);
    };

    return (
        <div>
            <label htmlFor="language">Select Output Language:</label>
            <select id="language" value={selectedLang} onChange={handleChange}>
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                {/* Add more language options as needed */}
            </select>
        </div>
    );
};

export default LanguageSelector;
