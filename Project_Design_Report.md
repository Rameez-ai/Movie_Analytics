# Project Design and Explanation: Movie Analytics System using OMDb API, MongoDB, and Web Technologies

**Project Title:** Movie Analytics System using OMDb API, MongoDB, and Web Technologies
**Domain:** Advanced Database Management Systems & Web Technologies
**Architecture:** ETL (Extract, Transform, Load) Pipeline with MERN-stack integration (MongoDB, Express, React/Node) and Cloud Deployment.

---

## 1. Introduction

The **Movie Analytics System** is a data-driven web application designed to harvest, process, and visualize extensive metadata about motion pictures. In the era of big data, the ability to derive actionable insights from unstructured or semi-structured data sources is paramount. This project demonstrates a complete **ETL (Extract, Transform, Load)** pipeline that ingests data from the **OMDb (Open Movie Database) API**, normalizes and aggregates it for analytical purposes, and serves it through a modern web interface. The system concludes with a robust deployment strategy on **Google Cloud Platform (GCP)**, ensuring high availability and scalability.

This report details the architectural phases: Extraction of raw data, Transformation for analytical readiness, Loading into a NoSQL document store, Visualization via a web frontend, and Deployment to a public cloud environment.

---

## 2. Extract Phase: Data Acquisition

The **Extract** phase is the genesis of the pipeline, responsible for communicating with external data sources to retrieve raw information.

### 2.1 Methodology
We utilize the **OMDb API**, a RESTful web service, to fetch movie metadata. A backend service, implemented in **Node.js** (or Python), acts as the extraction agent. This choice is driven by Node.js's non-blocking I/O model, which is highly efficient for handling multiple concurrent API requests.

### 2.2 Extraction Process
1.  **API Key Configuration**: Secure storage of the OMDb API key using environment variables.
2.  **Request Construction**: The script iterates through a pre-defined list of movie titles or ID ranges. It constructs HTTP GET requests to the OMDb endpoint (e.g., `http://www.omdbapi.com/?t=Inception&apikey=YOUR_KEY`).
3.  **Data Retrieval**: The API responds with a JSON object containing fields such as:
    -   `Title` (String)
    -   `Year` (String)
    -   `Genre` (String)
    -   `imdbRating` (String)
    -   `imdbVotes` (String)
    -   `Language` (String)
    -   `Awards` (String)
4.  **Error Handling**: The extractor implements retry logic for network timeouts and validates the presence of the `Response: "True"` flag in the returned JSON to ensure data integrity before passing it to the transformation stage.

---

## 3. Transform Phase: Data Cleaning and Preparation

Data received from APIs often contains inconsistencies, missing values, or formats unsuitable for direct numerical analysis. The **Transform** phase addresses these issues.

### 3.1 Data Cleaning
-   **Missing Values**: Fields with values like "N/A" are converted to `null` or imputed with median values depending on the analysis requirement.
-   **Type Conversion**:
    -   `Year`: Parsed from strings (e.g., "2010–") to integers (2010), stripping non-numeric characters.
    -   `imdbRating`: Converted from string "8.8" to float `8.8`.
    -   `imdbVotes`: Commas are removed (e.g., "2,000,000" becomes `2000000`) and cast to integers.

### 3.2 Analytical Computing
-   **Genre Splitting**: A movie categorized as "Action, Sci-Fi" is normalized into an array `["Action", "Sci-Fi"]`, enabling granular genre-wise aggregation.
-   **derived Metrics**: Calculations are performed to identify:
    -   **Top-Rated Movies**: Sorting by `imdbRating` weighted by `imdbVotes` to avoid skew from low-vote entries.
    -   **Genre Distribution**: Aggregating counts of movies per genre.
    -   **Year-wise Trends**: Grouping movies by release year to analyze production volume over decades.

This transformed dataset is structured to optimize read-heavy operations in the subsequent database layer.

---

## 4. Load Phase: Persistent Storage with MongoDB

The **Load** phase commits the clean, transformed data into a storage system.

### 4.1 Database Selection: MongoDB
**MongoDB** is chosen for this project due to its **document-oriented** nature. Unlike relational databases (RDBMS) that require rigid schema definitions, MongoDB stores data in **BSON (Binary JSON)** format.
-   **Justification**: API data is inherently semi-structured. The flexibility of MongoDB allows for easy insertion of nested arrays (like `Ratings` or `Genre`) without complex normalization tables.
-   **Scalability**: MongoDB's support for horizontal scaling (sharding) aligns with the project's potential for collecting vast datasets.

### 4.2 Storage & Access
-   The backend script uses the MongoDB Node.js driver (or `mongoose` ODM) to insert the transformed JSON objects into a collection named `movies`.
-   **MongoDB Compass** is utilized as the GUI client to verify data integrity, run ad-hoc aggregation queries, and visualize the schema structure visually.

---

## 5. Web-Based Analytics: Frontend Visualization

The utility of data lies in its presentation. The "Web-Based Analytics" component is a dashboard designed to communicate insights to the user.

### 5.1 Architecture
The architecture follows a standard **Client-Server** model:
-   **Backend API**: An Express.js server exposing RESTful endpoints (e.g., `/api/analytics/genre-distribution`, `/api/analytics/top-movies`). These endpoints execute aggregation pipelines on MongoDB and return JSON responses.
-   **Frontend**: Built with **HTML5, CSS3, and JavaScript** (or a library like React.js).

### 5.2 User Interface features
-   **Dashboard View**: The landing page presents high-level summaries (Total Movies, Average Rating).
-   **Visualizations**:
    -   **Bar Charts**: To display the number of movies produced per year.
    -   **Pie Charts**: To show the percentage distribution of different genres.
    -   **Data Tables**: Interactive tables listing top-rated movies with sortable columns for Year and Rating.
-   **Purpose**: The interface is strictly analytical, providing a retrospective view of film history, rather than a recommendation engine.

---

## 6. Cloud Deployment: Google Cloud Platform (GCP)

To transition from a local development environment to a publicly accessible service, the system is deployed on **Google Cloud Platform**.

### 6.1 Step-by-Step Deployment Strategy

#### Step 1: Backend Hosting (Google App Engine or Cloud Run)
1.  **Containerization**: A `Dockerfile` is created for the Node.js backend to define the runtime environment.
2.  **Deployment**: The container is deployed to **Google Cloud Run**, a fully managed compute platform that automatically scales stateless containers. This ensures the API is accessible via a secured HTTPS URL.

#### Step 2: Database Hosting (MongoDB Atlas)
1.  **Cluster Setup**: Instead of a local instance, a cloud-hosted logic cluster is provisioned on **MongoDB Atlas** (integrated via GCP marketplace or VPC peering).
2.  **Connection**: The connection string in the backend environment variables is updated to point to the secure Atlas cluster. IP whitelisting is configured to allow traffic from the Cloud Run service.

#### Step 3: Frontend Hosting (Firebase Hosting or Cloud Storage)
1.  **Build**: The frontend application is compiled/built for production (if using React/Vue).
2.  **Hosting**: The static assets (HTML, CSS, JS) are deployed to **Firebase Hosting** or a **GCP Cloud Storage bucket** configured as a static website.
3.  **Integration**: The frontend code is updated to fetch data from the live Cloud Run API URL instead of `localhost`.

### 6.2 Conclusion
The final deployed system represents a production-grade analytics platform where users worldwide can access real-time insights derived from OMDb data, processed through a rigorous ETL pipeline, and hosted on enterprise-grade cloud infrastructure.
