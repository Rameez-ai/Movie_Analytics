---
title: CineMetrics Movie Analytics
emoji: 🎬
colorFrom: purple
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# 🎬 CineMetrics | Movie Analytics & ETL Pipeline

CineMetrics is an end-to-end web application and data pipeline designed to ingest, process, and analyze film metadata. It implements a robust **ETL (Extract, Transform, Load)** pipeline that fetches raw data from the **OMDb (Open Movie Database) API**, cleanses and normalizes it, and saves it into a **MongoDB** database. A modern **React** dashboard then aggregates this data to visualize industry trends and manage entries.

Developed as a academic project for Advanced Database Management Systems & Web Technologies.

---

## 🚀 Key Features

* **Real-Time ETL Search**: Input any movie title to extract it from OMDb API in real-time, clean the schema, and optionally load it into the local database.
* **Batch ETL Ingestion**: Seed script to populate the database with a pre-defined library of movies across multiple genres.
* **Analytics Dashboard**: Interactive charts displaying genre distributions and production volume by release year.
* **KPI Metrics**: Real-time summary cards highlighting total movies in the database, average IMDb rating, and top genre.
* **Full CRUD Management**: View, filter, manually add, edit, or delete movie records from the gallery.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React (v18), Vite, Chart.js, CSS3 | Single-page application, responsive cards, and dynamic charting. |
| **Backend** | Node.js, Express.js | RESTful API server executing aggregation pipelines on MongoDB. |
| **Database** | MongoDB, Mongoose | BSON document store with indexes for optimized query performance. |
| **Data Ingestion**| Axios | HTTP client for external API extraction. |
| **Tooling** | Concurrently, Dotenv | Local environment configuration and dual-server runtime management. |

---

## 📁 Directory Structure

```text
Movie_Analytics/
├── backend/
│   ├── models/
│   │   └── Movie.js           # Mongoose Movie schema & DB indexes
│   ├── services/
│   │   └── etlService.js      # Core ETL pipeline stages (Extract, Transform, Load)
│   ├── etl.js                 # Batch ETL seeder CLI script
│   └── server.js              # Express API Server & routes
├── frontend/
│   ├── public/                # Static assets for the frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx     # Navigation bar component
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Real-time search & single ETL triggers
│   │   │   ├── Analytics.jsx  # KPI metrics & visual charts
│   │   │   ├── Manage.jsx     # Interactive CRUD table with filters
│   │   │   └── About.jsx      # Architecture overview page
│   │   ├── App.css            # Component-level styles
│   │   ├── App.jsx            # Router configuration
│   │   ├── index.css          # Design system, themes & animations
│   │   └── main.jsx           # React app entrypoint
│   ├── index.html             # Single-page template
│   └── vite.config.js         # Build configs (outputs to backend/public)
├── .env                       # Environment variables (gitignored)
├── .gitignore                 # Files/folders to ignore in Git
├── package.json               # Project scripts and dependencies
└── README.md                  # Project documentation
```

---

## ⚙️ Local Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js (v16+)](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### 2. Clone & Install Dependencies
Navigate into the repository directory and run:
```bash
npm install
```

### 3. Obtain an OMDb API Key
1. Go to [OMDb API Key Request](https://www.omdbapi.com/apikey.aspx) and sign up for a free or developer key.
2. You will receive an API key via email (e.g., `eff5e2dc`).

### 4. Configure Environment Variables
Create a file named `.env` in the root of the project:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/movie_analytics
OMDB_API_KEY=your_omdb_api_key_here
```
*(Replace `your_omdb_api_key_here` with your actual OMDb API key).*

---

## 💻 Running the Application

### Seed Database (Batch ETL)
Before running the app, you can run the batch ETL pipeline to fetch, transform, and load a curated list of ~60 movies:
```bash
npm run etl
```

### Run in Development Mode
Starts both the Node.js Express backend and Vite React dev server concurrently:
```bash
npm run dev
```
* Backend runs on: [http://localhost:3000](http://localhost:3000)
* Frontend runs on: [http://localhost:5173](http://localhost:5173) (Proxies API requests to port 3000)

### Build for Production
Compiles the React application into optimized static assets inside `backend/public`:
```bash
npm run build
```

### Start Production Server
Runs the Express server which serves the API and the compiled React frontend from the `backend/public` directory:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 The ETL Pipeline Architecture

The core of the database operations runs through the 3-stage ETL service located in [etlService.js](file:///c:/Users/ramiz/Desktop/Projects_5th-Semester/Movie_Analytics/backend/services/etlService.js):

```mermaid
graph TD
    A[Start ETL] --> B[1. Extract: OMDb API HTTP GET]
    B --> C[2. Transform: Normalize Schema]
    C --> D[3. Load: MongoDB Atlas Upsert]
    D --> E[End ETL]
```

### 1. Extract
Raw movie JSON metadata is extracted from the external REST API via `axios`. 
* **Input**: Title or Search query.
* **Output**: Semi-structured JSON object containing raw strings (e.g., `"imdbVotes": "2,450,112"` or `"Year": "2010–"`).

### 2. Transform
Data is cleaned, parsed, and converted to match the structural constraints of the Mongoose schema:
* **Ratings & Votes**: Commas are stripped from votes and strings parsed into numeric integers/floats.
* **Years**: Non-numeric ranges are normalized (e.g. `2010–2015` or `2010–` to `2010`).
* **Genres**: Multi-value genres represented as a single string (e.g. `"Action, Sci-Fi"`) are split into arrays (e.g., `["Action", "Sci-Fi"]`) for indexing and analytics.

### 3. Load
The normalized movie object is loaded into the MongoDB database using an **upsert** operation (`findOneAndUpdate` with `upsert: true`). This ensures we overwrite existing entries if the metadata changes rather than introducing duplicate entries.

---

## 🌐 API Reference (REST Endpoints)

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/search` | Checks local DB; if not found, runs ETL on OMDb and returns movie data. |
| **GET** | `/api/suggestions` | Returns a list of 5 search suggestions for autocomplete. |
| **GET** | `/api/movies` | Retrieves all saved movies in the local database (sorted by last updated). |
| **POST** | `/api/movies` | Manually inserts a new movie document into the database. |
| **PUT** | `/api/movies/:id` | Updates details of an existing movie document. |
| **DELETE**| `/api/movies/:id` | Removes a movie document from the database. |
| **GET** | `/api/analytics/genre-distribution` | Aggregates MongoDB documents to count movies per genre. |
| **GET** | `/api/analytics/top-rated` | Aggregates the 10 highest-rated movies with votes > 1000. |
| **GET** | `/api/analytics/year-trends` | Groups movies by release year to count quantity and average rating. |

---

## ☁️ Cloud Deployment Guide

Follow these instructions to deploy CineMetrics live on the web:

### 1. Set Up MongoDB Atlas (Database Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free account.
2. Click **Create a Cluster** (Select the Free M0 tier on GCP or AWS).
3. Under **Database Access**, create a user with a username and a strong password.
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`) so your hosting provider can connect.
5. In your Cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection string.
6. Replace `<db_user>:<db_password>` in the connection string with your actual database user credentials. Your URI will look like:
   `mongodb+srv://rameez:mySuperPassword@cluster0.dcxjjbo.mongodb.net/movie_analytics?retryWrites=true&w=majority`

---

### 2. Option A: Deploying on Render (Unified & Recommended)
Render can build your React frontend, output it to the backend directory, and run the Express app in a single web service.

1. Create a free account on [Render](https://render.com/).
2. Click **New** -> **Web Service** and connect your GitHub Repository.
3. Configure the following settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
4. Under **Environment Variables**, click **Add Environment Variable** and define:
   * `PORT` = `3000`
   * `MONGODB_URI` = *(Your MongoDB Atlas connection URI)*
   * `OMDB_API_KEY` = *(Your OMDb API Key)*
5. Click **Deploy Web Service**. Render will install, compile, and run the app.

---

### 3. Option B: Deploying to Google Cloud Platform (GCP)
For production-grade hosting on GCP, we containerize the unified backend and deploy to Google Cloud Run.

#### Step 1: Create a `Dockerfile`
Create a `Dockerfile` at the root of your project:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Step 2: Deploy to Google Cloud Run
1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) on your local machine and run `gcloud auth login`.
2. Enable the Cloud Run API in your GCP project console.
3. Run the following command in your terminal from the root folder:
   ```bash
   gcloud run deploy cinemetrics-app --source . --platform managed --allow-unauthenticated
   ```
4. Select a region close to you when prompted.
5. Provide the environment variables in the prompt, or set them after deployment in the GCP Console under Cloud Run -> Configuration:
   * `MONGODB_URI` = *(Atlas connection URI)*
   * `OMDB_API_KEY` = *(OMDb API key)*
   * `PORT` = `3000`
6. Cloud Run will build the container image, push it to Google Artifact Registry, and provision a live HTTPS link.
