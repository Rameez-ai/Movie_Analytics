import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [movies, setMovies] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    avgRating: 0,
    topGenre: ''
  });

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    calculateKPIs();
  }, [movies]);

  const loadMovies = async () => {
    try {
      const res = await axios.get('/api/movies');
      setMovies(res.data);
    } catch (err) {
      console.error('Error loading movies:', err);
    }
  };

  const calculateKPIs = () => {
    if (movies.length === 0) {
      setKpis({ total: 0, avgRating: 0, topGenre: '' });
      return;
    }

    const total = movies.length;
    const avgRating = (movies.reduce((sum, m) => sum + (parseFloat(m.imdbRating) || 0), 0) / total).toFixed(1);

    const genreCount = {};
    movies.forEach(m => {
      const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
      genres.forEach(g => {
        if (g) genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });
    const topGenre = Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b, '');

    setKpis({ total, avgRating, topGenre });
  };

  const chartColors = ['#8b5cf6', '#06b6d4', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#22c55e', '#38bdf8', '#f97316', '#a855f7'];

  const getGenreData = () => {
    const genreCount = {};
    movies.forEach(m => {
      const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
      genres.forEach(g => {
        if (g) genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });
    const labels = Object.keys(genreCount);
    return {
      labels,
      datasets: [{
        data: Object.values(genreCount),
        backgroundColor: labels.map((_, index) => chartColors[index % chartColors.length]),
        borderWidth: 0,
      }]
    };
  };

  const getYearData = () => {
    const yearCount = {};
    movies.forEach(m => {
      const year = m.year;
      if (year) yearCount[year] = (yearCount[year] || 0) + 1;
    });
    const sortedYears = Object.keys(yearCount).sort();
    return {
      labels: sortedYears,
      datasets: [{
        label: 'Movies per Year',
        data: sortedYears.map(y => yearCount[y]),
        backgroundColor: chartColors[0],
        borderRadius: 12,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          boxWidth: 12,
          padding: 16,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 12,
      }
    },
    scales: {
      x: {
        ticks: { color: '#e2e8f0' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#e2e8f0' },
        grid: { color: 'rgba(255,255,255,0.08)' }
      }
    }
  };

  return (
    <div>
      <header>
        <h1>Analytics Dashboard</h1>
        <p className="subtitle">Data derived from MongoDB ETL Pipeline</p>
      </header>

      <main>
        <section className="kpi-grid">
          <div className="kpi-card">
            <h3>Total Analyzed</h3>
            <p>{kpis.total}</p>
            <span className="label">Movies</span>
          </div>
          <div className="kpi-card">
            <h3>Avg Rating</h3>
            <p>{kpis.avgRating}</p>
            <span className="label">IMDb Score</span>
          </div>
          <div className="kpi-card">
            <h3>Top Genre</h3>
            <p>{kpis.topGenre}</p>
            <span className="label">Most Popular</span>
          </div>
        </section>

        <section className="charts-grid">
          <div className="chart-card">
            <h3>Genre Distribution</h3>
            <div className="chart-wrapper">
              <Pie data={getGenreData()} options={chartOptions} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Movies by Year</h3>
            <div className="chart-wrapper">
              <Bar data={getYearData()} options={chartOptions} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Analytics;