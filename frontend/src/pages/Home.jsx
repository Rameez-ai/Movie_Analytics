import { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [movie, setMovie] = useState(null);
  const [source, setSource] = useState('');
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [etlStatus, setEtlStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async () => {
    try {
      const res = await axios.get(`/api/suggestions?q=${searchTerm}`);
      setSuggestions(res.data);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setEtlStatus('active');
    setMovie(null);
    setSource('');
    setSaved(false);
    setMessage('');

    try {
      const res = await axios.post('/api/search', { title: searchTerm });
      setMovie(res.data.movie);
      setSource(res.data.source);
      setSaved(res.data.source === 'database');
      setMessage(res.data.source === 'database'
        ? 'This movie is already saved in your gallery.'
        : 'Loaded from OMDb. You can save it to your gallery.'
      );
    } catch (err) {
      console.error('Error searching movie:', err);
      setMessage('Unable to find that movie. Try a different title.');
    } finally {
      setLoading(false);
      setEtlStatus('');
    }
  };

  const handleSaveMovie = async () => {
    if (!movie) return;
    setIsSaving(true);
    setMessage('Saving movie...');

    try {
      const payload = {
        ...movie,
        genre: Array.isArray(movie.genre) ? movie.genre : movie.genre?.split(',').map(g => g.trim()) || []
      };
      await axios.post('/api/movies', payload);
      setSaved(true);
      setSource('database');
      setMessage('Movie saved successfully to gallery!');
    } catch (err) {
      console.error('Error saving movie:', err);
      setMessage('Failed to save movie. It may already exist or there was a network problem.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectSuggestion = (title) => {
    setSearchTerm(title);
    setSuggestions([]);
  };

  return (
    <div>
      <header className="hero">
        <h1>Movie Analytics and Management System</h1>
        <p>Perform real-time ETL (Extract-Transform-Load) operations on any movie.</p>
      </header>

      <main>
        <section className="search-section">
          <div className="suggestions-container">
            <div className="search-box">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter movie title (e.g. The Godfather)..."
                autoComplete="off"
              />
              <button onClick={handleSearch} disabled={loading}>
                <i className="fas fa-search"></i> Extract Data
              </button>
            </div>
            {suggestions.length > 0 && (
              <ul id="suggestions-list" style={{ display: 'block' }}>
                {suggestions.map((suggestion) => (
                  <li key={suggestion.imdbID} onClick={() => selectSuggestion(suggestion.Title)}>
                    <span>{suggestion.Title}</span>
                    <span className="year">({suggestion.Year})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className={`etl-status ${etlStatus}`}>
          <div className="step" id="step-extract">
            <i className="fas fa-network-wired"></i> Extracting from OMDb...
          </div>
          <div className="step" id="step-transform">
            <i className="fas fa-cogs"></i> Transforming Data...
          </div>
          <div className="step" id="step-load">
            <i className="fas fa-database"></i> Loading to MongoDB...
          </div>
        </div>

        {movie && (
          <div className="movie-card">
            <img
              src={movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/200'}
              alt="poster"
              className="movie-poster"
            />
            <div className="movie-info">
              <h2>{movie.title}</h2>
              <div className="movie-meta">
                <span>{movie.year}</span>
                <span>{movie.runtime}</span>
                <span className="rating-badge">★ {movie.imdbRating}</span>
              </div>
              <p className="movie-plot">{movie.plot}</p>
              <div className="tags">
                {Array.isArray(movie.genre) ? movie.genre.map((g, i) => (
                  <span key={i}>{g}</span>
                )) : movie.genre && <span>{movie.genre}</span>}
              </div>
              <div className="movie-actions">
                {source === 'omdb-api' && (
                  <button
                    className="btn-secondary"
                    onClick={handleSaveMovie}
                    disabled={saved || isSaving}
                  >
                    <i className="fas fa-save"></i>
                    {saved ? 'Saved to Gallery' : isSaving ? 'Saving...' : 'Save to Gallery'}
                  </button>
                )}
                {source === 'database' && (
                  <span className="status-chip saved">Already saved in gallery</span>
                )}
              </div>
              {message && <p className="info-text">{message}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;