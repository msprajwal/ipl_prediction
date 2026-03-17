import { Link, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, user, logout }) {
    const location = useLocation();

    return (
        <nav className="navbar">
            <Link to="/" className="logo">IPL Predictor '26</Link>

            <div className="nav-links">
                {isAuthenticated ? (
                    <>
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
                        <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}>Leaderboard</Link>
                        <Link to="/stats" className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}>Stats</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: '#f59e0b' }}>⚙ Admin</Link>
                        )}
                        <span className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            {user?.username} ({user?.total_points || 0} pts)
                        </span>
                        <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Login</Link>
                        <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
