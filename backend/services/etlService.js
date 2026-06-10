const axios = require('axios');
const Movie = require('../models/Movie');

// Extract
const extractData = async (title) => {
    try {
        const apiKey = process.env.OMDB_API_KEY;
        const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.Response === 'True') {
            return response.data;
        } else {
            // console.warn(`Movie not found: ${title} - ${response.data.Error}`);
            return null;
        }
    } catch (err) {
        console.error(`Error fetching ${title}:`, err.message);
        return null;
    }
};

// Transform
const transformData = (rawData) => {
    // Clean Year "2010" or "2010–" -> 2010
    const year = parseInt(rawData.Year.replace(/[^0-9]/g, ''), 10);

    // Clean Rating "8.8" -> 8.8
    const imdbRating = rawData.imdbRating && rawData.imdbRating !== "N/A"
        ? parseFloat(rawData.imdbRating)
        : 0;

    // Clean Votes "2,000,000" -> 2000000
    const imdbVotes = rawData.imdbVotes && rawData.imdbVotes !== "N/A"
        ? parseInt(rawData.imdbVotes.replace(/,/g, ''), 10)
        : 0;

    // Split Genre "Action, Sci-Fi" -> ["Action", "Sci-Fi"]
    const genre = rawData.Genre
        ? rawData.Genre.split(',').map(g => g.trim())
        : [];

    return {
        title: rawData.Title,
        year,
        genre,
        imdbRating,
        imdbVotes,
        languages: rawData.Language, // Maps to 'languages' in Schema
        awards: rawData.Awards,
        poster: rawData.Poster,
        plot: rawData.Plot // Added plot for details view
    };
};

// Load
const loadData = async (movieData) => {
    try {
        // Upsert: Update if exists, Insert if new
        const movie = await Movie.findOneAndUpdate(
            { title: movieData.title },
            movieData,
            { upsert: true, new: true }
        );
        // console.log(`Loaded: ${movieData.title}`);
        return movie;
    } catch (err) {
        console.error(`Error loading ${movieData.title}:`, err.message);
        throw err;
    }
};

// Suggestions
const getSuggestions = async (query) => {
    try {
        const apiKey = process.env.OMDB_API_KEY;
        const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.Response === 'True') {
            return response.data.Search;
        } else {
            return [];
        }
    } catch (err) {
        console.error(`Error searching suggestions for ${query}:`, err.message);
        return [];
    }
};

module.exports = {
    extractData,
    transformData,
    loadData,
    getSuggestions
};
