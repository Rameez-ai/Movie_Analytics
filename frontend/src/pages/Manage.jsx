import { useState, useEffect } from 'react';
import axios from 'axios';

const Manage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    year: '',
    genre: '',
    rating: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    genre: '',
    director: '',
    plot: '',
    imdbRating: '',
    poster: ''
  });
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('Fill the form and save the movie to your gallery.');

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movies, filters]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/movies');
      setMovies(res.data);
    } catch (err) {
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = movies.filter(m => {
      const matchTitle = m.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchYear = filters.year ? m.year?.toString().includes(filters.year) : true;
      const matchGenre = filters.genre ? (Array.isArray(m.genre) ? m.genre.join(' ') : m.genre).toLowerCase().includes(filters.genre.toLowerCase()) : true;
      const matchRating = filters.rating ? (m.imdbRating || 0) >= parseFloat(filters.rating) : true;
      return matchTitle && matchYear && matchGenre && matchRating;
    });
    setFilteredMovies(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const openModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title || '',
        year: movie.year || '',
        genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '',
        director: movie.director || '',
        plot: movie.plot || '',
        imdbRating: movie.imdbRating || '',
        poster: movie.poster || ''
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: '',
        year: '',
        genre: '',
        director: '',
        plot: '',
        imdbRating: '',
        poster: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMovie(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        genre: formData.genre.split(',').map(g => g.trim())
      };
      if (editingMovie) {
        await axios.put(`/api/movies/${editingMovie._id}`, data);
      } else {
        await axios.post('/api/movies', data);
      }
      loadMovies();
      closeModal();
    } catch (err) {
      console.error('Error saving movie:', err);
    }
  };

  const deleteMovie = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/api/movies/${id}`);
        loadMovies();
      } catch (err) {
        console.error('Error deleting movie:', err);
      }
    }
  };

  return (
    <div>
      <header className="manage-header">
        <div>
          <h1>Manage Movie Database</h1>
          <p className="subtitle">Use filters to quickly find movies and add new entries with the form below.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary btn-large">
          <i className="fas fa-plus"></i> Add New Movie
        </button>
      </header>

      <main>
        <div className="actions-bar">
          <div className="filters">
            <input
              type="text"
              name="title"
              value={filters.title}
              onChange={handleFilterChange}
              placeholder="Search by Title..."
              className="filter-input"
            />
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              placeholder="Year"
              className="filter-input filter-year"
            />
            <input
              type="text"
              name="genre"
              value={filters.genre}
              onChange={handleFilterChange}
              placeholder="Genre"
              className="filter-input"
            />
            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="filter-input"
            >
              <option value="">Min Rating</option>
              <option value="9">9+</option>
              <option value="8">8+</option>
              <option value="7">7+</option>
              <option value="6">6+</option>
            </select>
          </div>
        </div>

        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Title</th>
                <th>Year</th>
                <th>Rating</th>
                <th>Genre</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.length > 0 ? filteredMovies.map(movie => (
                <tr key={movie._id}>
                  <td>
                    <img
                      src={movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/50'}
                      alt="poster"
                      className="table-poster"
                    />
                  </td>
                  <td><strong>{movie.title}</strong></td>
                  <td>{movie.year || 'N/A'}</td>
                  <td><span style={{ color: '#f59e0b' }}>★</span> {movie.imdbRating || 'N/A'}</td>
                  <td>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</td>
                  <td className="actions-cell">
                    <button onClick={() => openModal(movie)} className="btn-icon edit-btn">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => deleteMovie(movie._id)} className="btn-icon delete-btn">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="no-results">No movies match the filters. Clear filters or add a new movie.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {modalOpen && (
        <div className="modal flex">
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <h2 id="modalTitle">{editingMovie ? 'Edit Movie' : 'Add Movie'}</h2>
            <form id="movieForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Movie title"
                />
              </div>
              <p className="modal-note">This form supports manual entry or editing existing records.</p>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="year">Year</label>
                  <input
                    type="number"
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2010"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imdbRating">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    id="imdbRating"
                    value={formData.imdbRating}
                    onChange={(e) => setFormData({ ...formData, imdbRating: e.target.value })}
                    placeholder="8.5"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="genre">Genre (comma-separated)</label>
                <input
                  type="text"
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="Action, Drama, Crime"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="director">Director</label>
                  <input
                    type="text"
                    id="director"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Director name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="poster">Poster URL</label>
                  <input
                    type="url"
                    id="poster"
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="plot">Plot</label>
                <textarea
                  id="plot"
                  value={formData.plot}
                  onChange={(e) => setFormData({ ...formData, plot: e.target.value })}
                  rows="4"
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">
                {editingMovie ? 'Update Movie' : 'Save Movie'}
              </button>
              {modalMessage && <p className="modal-note modal-help">{modalMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage;