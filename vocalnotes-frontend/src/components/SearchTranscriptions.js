import React, { useState } from 'react';

const SearchTranscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/search-transcriptions?q=${searchQuery}`);
      const result = await response.json();
      setSearchResults(result.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search transcriptions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {searchResults.length > 0 ? (
          searchResults.map((transcription) => (
            <li key={transcription._id}>
              <h4>File: {transcription.file}</h4>
              <p>{transcription.transcription}</p>
            </li>
          ))
        ) : (
          <p>No results found</p>
        )}
      </ul>
    </div>
  );
};

export default SearchTranscriptions;
