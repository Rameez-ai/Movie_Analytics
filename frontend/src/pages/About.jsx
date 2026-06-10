const About = () => {
  return (
    <div>
      <header>
        <h1>About The Project</h1>
        <p className="subtitle">Movie Analytics System using OMDb API and MongoDB</p>
      </header>

      <main className="content-wrapper">
        <section className="info-card">
          <h2>Project Overview</h2>
          <p>This project demonstrates a complete <strong>ETL (Extract, Transform, Load)</strong> pipeline for
            movie data analytics. It extracts raw data from the OMDb API, cleans and transforms it into a
            structured format, and loads it into a MongoDB database for persistence and analysis.</p>
        </section>

        <section className="info-card">
          <h2>Architecture & Technologies</h2>
          <div className="tech-grid">
            <div className="tech-item">
              <h3>Extract</h3>
              <p>Node.js & Axios fetching from OMDb API.</p>
            </div>
            <div className="tech-item">
              <h3>Transform</h3>
              <p>Data cleaning, normalization, metric calculation.</p>
            </div>
            <div className="tech-item">
              <h3>Load</h3>
              <p>MongoDB (NoSQL) for flexible document storage.</p>
            </div>
            <div className="tech-item">
              <h3>Analyze</h3>
              <p>Express.js Aggregation Pipelines & Chart.js.</p>
            </div>
          </div>
        </section>

        <section className="info-card">
          <h2>Features</h2>
          <ul>
            <li>Real-time ETL via Search Interface</li>
            <li>Automated Dashboard with Dynamic Charts</li>
            <li>Scalable Document-Based Storage</li>
            <li>Premium Responsible Web Design</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Academic Project | Department of Computer Science</p>
      </footer>
    </div>
  );
};

export default About;