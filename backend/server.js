require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Movie = require('./models/Movie');
const { extractData, transformData, loadData, getSuggestions } = require('./services/etlService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes

// 0. Search & ETL (Real-time Extract-Transform-Load)
app.post('/api/search', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        // 1. Check DB first (Optimization)
        let movie = await Movie.findOne({ title: new RegExp(`^${title}$`, 'i') });

        if (movie) {
            return res.json({ source: 'database', movie });
        }

        // 2. Perform ETL if not in DB
        const rawData = await extractData(title);
        if (!rawData) {
            return res.status(404).json({ error: 'Movie not found on OMDb' });
        }

        const transformedData = transformData(rawData);
        // movie = await loadData(transformedData); // REMOVED: Saving is now manual/optional via POST /api/movies

        // Return transformed data directly
        res.json({ source: 'omdb-api', movie: transformedData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 0.1 Search Suggestions
app.get('/api/suggestions', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const suggestions = await getSuggestions(q);
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get All Movies (with pagination support optional for future)
app.get('/api/movies', async (req, res) => {
    try {
        const movies = await Movie.find().sort({ lastUpdated: -1 }); // Sort by latest updates/added
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1.1 Create Movie (Manual Entry)
app.post('/api/movies', async (req, res) => {
    try {
        const newMovie = new Movie(req.body);
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 1.2 Update Movie
app.put('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatedMovie) return res.status(404).json({ error: 'Movie not found' });
        res.json(updatedMovie);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 1.3 Delete Movie
app.delete('/api/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMovie = await Movie.findByIdAndDelete(id);
        if (!deletedMovie) return res.status(404).json({ error: 'Movie not found' });
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Analytics: Genre Distribution
app.get('/api/analytics/genre-distribution', async (req, res) => {
    try {
        const distribution = await Movie.aggregate([
            { $unwind: "$genre" },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(distribution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Analytics: Top Rated Movies
app.get('/api/analytics/top-rated', async (req, res) => {
    try {
        const topMovies = await Movie.find({ imdbVotes: { $gt: 1000 } }) // Filter out low vote counts
            .sort({ imdbRating: -1 })
            .limit(10)
            .select('title imdbRating year imdbVotes');
        res.json(topMovies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Analytics: Movies per Year
app.get('/api/analytics/year-trends', async (req, res) => {
    try {
        const trends = await Movie.aggregate([
            { $group: { _id: "$year", count: { $sum: 1 }, avgRating: { $avg: "$imdbRating" } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Catch-all handler: send back index.html for React Router
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
