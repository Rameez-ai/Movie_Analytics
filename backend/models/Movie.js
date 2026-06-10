const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number },
  genre: [{ type: String }],
  imdbRating: { type: Number },
  imdbVotes: { type: Number },
  languages: { type: String },
  awards: { type: String },
  poster: { type: String },
  plot: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

// Index for efficient querying
movieSchema.index({ imdbRating: -1 });
movieSchema.index({ year: 1 });

module.exports = mongoose.model('Movie', movieSchema);
