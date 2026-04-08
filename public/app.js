document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Simple routing based on filename
    if (path.includes('analytics.html')) {
        initAnalytics();
    } else if (path.includes('manage.html')) {
        initManage();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        initSearch();
    }
});

/**
 * LOGIC FOR MANAGE MOVIES PAGE (CRUD)
 */
async function initManage() {
    const tableBody = document.getElementById('moviesTableBody');
    const modal = document.getElementById('movieModal');
    const form = document.getElementById('movieForm');
    const addBtn = document.getElementById('addMovieBtn');
    const closeBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');

    // Filter Elements
    const filterTitle = document.getElementById('filterTitle');
    const filterYear = document.getElementById('filterYear');
    const filterGenre = document.getElementById('filterGenre');
    const filterRating = document.getElementById('filterRating');

    let allMovies = []; // Store local copy for filtering

    // Fetch and Display Movies
    async function loadMovies() {
        try {
            const res = await fetch('/api/movies');
            allMovies = await res.json();
            applyFilters(); // Render with current filters (or none)
        } catch (err) {
            console.error('Error loading movies:', err);
        }
    }

    function applyFilters() {
        const titleVal = filterTitle.value.toLowerCase();
        const yearVal = filterYear.value;
        const genreVal = filterGenre.value.toLowerCase();
        const ratingVal = parseFloat(filterRating.value) || 0;

        const filtered = allMovies.filter(m => {
            const matchTitle = m.title.toLowerCase().includes(titleVal);
            const matchYear = yearVal ? m.year.toString().includes(yearVal) : true;
            const matchGenre = genreVal ? (Array.isArray(m.genre) ? m.genre.join(' ') : m.genre).toLowerCase().includes(genreVal) : true;
            const matchRating = (m.imdbRating || 0) >= ratingVal;

            return matchTitle && matchYear && matchGenre && matchRating;
        });

        renderTable(filtered);
    }

    // Filter Event Listeners
    [filterTitle, filterYear, filterGenre, filterRating].forEach(input => {
        input.addEventListener('input', applyFilters);
    });

    function renderTable(movies) {
        tableBody.innerHTML = '';
        movies.forEach(movie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/50'}" class="table-poster" alt="poster"></td>
                <td><strong>${movie.title}</strong></td>
                <td>${movie.year || 'N/A'}</td>
                <td><span style="color: #f59e0b">★</span> ${movie.imdbRating || 'N/A'}</td>
                <td>${Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</td>
                <td class="actions-cell">
                    <button class="btn-icon edit-btn" data-id="${movie._id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-btn" data-id="${movie._id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Attach Event Listeners to dynamic buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
        });
    }

    // Modal Logic
    function openModal(title = 'Add Movie') {
        modalTitle.innerText = title;
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Use flex to center
    }

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        form.reset();
        document.getElementById('movieId').value = '';
    }

    addBtn.addEventListener('click', () => {
        openModal('Add New Movie');
    });

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Form Submit (Create & Update)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('movieId').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Handle Genre as array
        if (data.genre) data.genre = data.genre.split(',').map(g => g.trim());

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/movies/${id}` : '/api/movies';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save movie');

            closeModal();
            loadMovies(); // Refresh table
        } catch (err) {
            alert(err.message);
        }
    });

    // Edit Logic
    async function openEditModal(id) {
        try {
            // We can fetch details or just grab from existing list if we have it. 
            // For simplicity and accuracy, let's fetch list or find from DOM.
            // Since we don't have a "get single" API used here, we find it from the list if possible,
            // OR we can implement GET /api/movies/:id.
            // But wait, the Update endpoint needs an ID. 
            // Let's iterate the current table data? No, cleaner to fetch or just pass data.
            // Actually, we can just use the data we have if we store it.
            // Let's do a quick fetch of all movies again or find in current memory?
            // "Fetch all" is already cached in browser ideally, or fast enough.
            // But better: Let's assume we can get it.
            // Implementing GET /api/movies/:id would be standard, but I didn't promise it in the plan explicitly (just GET /movies).
            // I'll just find it from the full list for now.
            const res = await fetch('/api/movies');
            const movies = await res.json();
            const movie = movies.find(m => m._id === id);

            document.getElementById('movieId').value = movie._id;
            document.getElementById('title').value = movie.title;
            document.getElementById('year').value = movie.year;
            document.getElementById('imdbRating').value = movie.imdbRating;
            document.getElementById('genre').value = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
            document.getElementById('poster').value = movie.poster;
            document.getElementById('plot').value = movie.plot;

            openModal('Edit Movie');
        } catch (err) {
            console.error(err);
        }
    }

    // Delete Logic
    async function deleteMovie(id) {
        if (!confirm('Are you sure you want to delete this movie?')) return;

        try {
            const res = await fetch(`/api/movies/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            loadMovies();
        } catch (err) {
            alert(err.message);
        }
    }

    // Initial Load
    loadMovies();
}

/**
 * LOGIC FOR HOME PAGE (Search & ETL)
 */
function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const movieInput = document.getElementById('movieSearch');
    const resultCard = document.getElementById('movie-result');
    const etlStatus = document.getElementById('etl-status');

    searchBtn.addEventListener('click', () => performSearch(movieInput.value.trim()));
    movieInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch(movieInput.value.trim());
    });

    // --- Autocomplete Logic ---
    const suggestionsList = document.getElementById('suggestions-list');
    let debounceTimer;

    movieInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < 3) {
            suggestionsList.style.display = 'none';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
                const suggestions = await res.json();

                suggestionsList.innerHTML = '';
                if (suggestions && suggestions.length > 0) {
                    suggestions.slice(0, 5).forEach(movie => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <span>${movie.Title}</span>
                            <span class="year">${movie.Year}</span>
                        `;
                        li.addEventListener('click', () => {
                            movieInput.value = movie.Title;
                            suggestionsList.style.display = 'none';
                            performSearch(movie.Title);
                        });
                        suggestionsList.appendChild(li);
                    });
                    suggestionsList.style.display = 'block';
                } else {
                    suggestionsList.style.display = 'none';
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            }
        }, 300); // 300ms debounce
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            suggestionsList.style.display = 'none';
        }
    });

    async function performSearch(query) {
        if (!query) return;

        // Reset UI
        suggestionsList.style.display = 'none';
        resultCard.classList.add('hidden');
        etlStatus.classList.remove('hidden');
        etlStatus.classList.add('active'); // Start animation

        try {
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: query })
            });

            const data = await response.json();

            // Simulate ETL steps visualization
            await new Promise(r => setTimeout(r, 800)); // Extract phase delay

            if (data.error) throw new Error(data.error);

            renderMovieResult(data.movie, data.source);
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            etlStatus.classList.remove('active');
            etlStatus.classList.add('hidden');
        }
    }

    function renderMovieResult(movie, source) {
        resultCard.innerHTML = `
            <img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/200'}" 
                 class="movie-poster" alt="${movie.title}">
            <div class="movie-info">
                <h2>${movie.title} <span style="font-size: 0.6em; color: #94a3b8">(${movie.year})</span></h2>
                <div class="movie-meta">
                    <span class="rating-badge">IMDb ${movie.imdbRating}</span>
                    <span>${movie.genre.join(', ')}</span>
                    <span><i class="fas fa-clock"></i> ${movie.languages}</span>
                </div>
                <div class="movie-plot">
                    <p>${movie.plot || 'No plot available.'}</p>
                </div>
                <div class="tags">
                     <span>Source: ${source === 'database' ? 'Local DB' : 'OMDb API'}</span>
                     ${movie.awards && movie.awards !== 'N/A' ? `<span><i class="fas fa-trophy"></i> ${movie.awards}</span>` : ''}
                </div>
                ${source !== 'database' ? `
                    <button id="saveFromSearchBtn" class="btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-save"></i> Save to Database
                    </button>
                ` : '<div style="margin-top: 1rem; color: var(--success);"><i class="fas fa-check"></i> In Library</div>'}
            </div>
        `;
        resultCard.classList.remove('hidden');

        // Attach listener if button exists
        const saveBtn = document.getElementById('saveFromSearchBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                try {
                    const res = await fetch('/api/movies', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(movie)
                    });
                    if (!res.ok) throw new Error('Failed to save');

                    alert('Movie saved to library!');
                    // Refresh view to show it's now in DB
                    renderMovieResult(movie, 'database');
                } catch (err) {
                    alert(err.message);
                }
            });
        }
    }
}

/**
 * LOGIC FOR ANALYTICS PAGE (Dashboard)
 */
async function initAnalytics() {
    // Colors for charts
    const chartColors = {
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        accent: '#f43f5e',
        text: '#94a3b8',
        grid: 'rgba(255, 255, 255, 0.05)'
    };

    try {
        // Fetch Data
        const [genres, trends, topRated, allMovies] = await Promise.all([
            fetch('/api/analytics/genre-distribution').then(r => r.json()),
            fetch('/api/analytics/year-trends').then(r => r.json()),
            fetch('/api/analytics/top-rated').then(r => r.json()),
            fetch('/api/movies').then(r => r.json())
        ]);

        // 1. Update KPIs
        const totalRating = allMovies.reduce((acc, m) => acc + (m.imdbRating || 0), 0);
        const avgRating = allMovies.length ? (totalRating / allMovies.length).toFixed(1) : '0.0';

        document.getElementById('total-movies').innerText = allMovies.length;
        document.getElementById('avg-rating').innerText = avgRating;
        document.getElementById('top-genre').innerText = genres[0]?._id || '-';

        // 2. Genre Chart (Pie/Doughnut)
        const genreCtx = document.getElementById('genreChart').getContext('2d');
        new Chart(genreCtx, {
            type: 'doughnut',
            data: {
                labels: genres.slice(0, 6).map(g => g._id),
                datasets: [{
                    data: genres.slice(0, 6).map(g => g.count),
                    backgroundColor: [
                        '#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#6366f1'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: chartColors.text } }
                }
            }
        });

        // 3. Trends Chart (Bar)
        const trendsCtx = document.getElementById('yearChart').getContext('2d');
        new Chart(trendsCtx, {
            type: 'bar',
            data: {
                labels: trends.map(t => t._id),
                datasets: [{
                    label: 'Movies Released',
                    data: trends.map(t => t.count),
                    backgroundColor: chartColors.secondary,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: chartColors.grid },
                        ticks: { color: chartColors.text }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: chartColors.text }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // 4. Populate Table
        const tableBody = document.getElementById('top-movies-body');
        topRated.forEach((movie, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td><strong>${movie.title}</strong></td>
                <td>${movie.year}</td>
                <td><span style="color: #f59e0b">★</span> ${movie.imdbRating}</td>
                <td>${movie.imdbVotes.toLocaleString()}</td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (err) {
        console.error('Error fetching analytics:', err);
    }
}
