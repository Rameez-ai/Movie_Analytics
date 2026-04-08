require('dotenv').config();
const mongoose = require('mongoose');
const { extractData, transformData, loadData } = require('./services/etlService');

const MOVIE_TITLES = [
    // Action & Adventure
    "Inception", "The Dark Knight", "The Matrix", "Gladiator", "The Avengers", "Iron Man",
    "Black Panther", "Spider-Man: Into the Spider-Verse", "Mad Max: Fury Road", "Die Hard",
    "Indiana Jones and the Raiders of the Lost Ark", "Terminator 2: Judgment Day",
    "The Lord of the Rings: The Fellowship of the Ring", "Star Wars: Episode IV - A New Hope",

    // Drama
    "The Shawshank Redemption", "The Godfather", "Fight Club", "Forrest Gump", "Pulp Fiction",
    "Goodfellas", "Schindler's List", "12 Angry Men", "Parasite", "Whiplash", "Joker",
    "The Green Mile", "Saving Private Ryan", "A Beautiful Mind", "Slumdog Millionaire",

    // Sci-Fi
    "Interstellar", "Blade Runner 2049", "Arrival", "The Martian", "Avatar", "Jurassic Park",
    "Back to the Future", "Aliens", "Dune", "Eternal Sunshine of the Spotless Mind",

    // Animation
    "Toy Story", "The Lion King", "Spirited Away", "Coco", "Up", "WALL-E", "Finding Nemo",
    "Shrek", "The Incredibles", "Frozen", "Moana", "Zootopia",

    // Thriller/Mystery
    "Se7en", "The Silence of the Lambs", "Gone Girl", "Shutter Island", "Prisoners",
    "The Usual Suspects", "Memento", "The Prestige", "Zodiac",

    // Comedy
    "Superbad", "The Hangover", "Mean Girls", "The Grand Budapest Hotel", "Knives Out",
    "Groundhog Day", "Monty Python and the Holy Grail", "Truman Show",

    // Romance/Other
    "Titanic", "La La Land", "The Notebook", "Pride & Prejudice", "Casablanca"
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for ETL');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const runETL = async () => {
    await connectDB();

    console.log('--- Starting Batch ETL Pipeline ---');
    console.log(`Targeting ${MOVIE_TITLES.length} movies...`);

    // Optional: Drop collection for fresh start if needed, but upsert handles updates.
    // We keep it accumulative here unless user wants a wipe.

    let successCount = 0;

    for (const title of MOVIE_TITLES) {
        // console.log(`Processing: ${title}`);
        const rawData = await extractData(title);

        if (rawData) {
            const transformedData = transformData(rawData);
            await loadData(transformedData);
            successCount++;
            process.stdout.write('.'); // Simple progress bar
        } else {
            process.stdout.write('x');
        }
        // Respect API rate limits
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\n--- ETL Pipeline Completed ---`);
    console.log(`Successfully loaded: ${successCount} movies`);
    mongoose.connection.close();
};

runETL();
