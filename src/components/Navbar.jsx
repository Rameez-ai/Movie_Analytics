import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <span className="icon">🎬</span> CineMetrics
      </div>
      <ul className="nav-links">
        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
        <li><Link to="/manage" className={location.pathname === '/manage' ? 'active' : ''}>Manage Movies</Link></li>
        <li><Link to="/analytics" className={location.pathname === '/analytics' ? 'active' : ''}>Analytics</Link></li>
        <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;