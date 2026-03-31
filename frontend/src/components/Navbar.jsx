import { Link, useLocation } from 'react-router-dom';

function Navbar({ isAuthenticated, user, logout }) {
    const location = useLocation();

    // Home Icon
    const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
    // Trophy Icon (Leaderboard)
    const TrophyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>);
    // Chart Icon (Stats)
    const ChartIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/><path d="m14 14 3 3"/></svg>);
    // Archive Icon (Past)
    const ArchiveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>);
    // Log Out Icon
    const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>);

    return (
        <nav className="navbar">
            <Link to="/" className="logo">IPL Predictor '26</Link>

            <div className="nav-links">
                {isAuthenticated ? (
                    <>
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}><span className="nav-icon"><HomeIcon /></span><span className="nav-text">Dashboard</span></Link>
                        <Link to="/leaderboard" className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}><span className="nav-icon"><TrophyIcon /></span><span className="nav-text">Leaderboard</span></Link>
                        <Link to="/stats" className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}><span className="nav-icon"><ChartIcon /></span><span className="nav-text">Stats</span></Link>
                        <Link to="/past-matches" className={`nav-link ${location.pathname === '/past-matches' ? 'active' : ''}`}><span className="nav-icon"><ArchiveIcon /></span><span className="nav-text">Matches</span></Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`nav-link hide-mobile ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: '#f59e0b' }}>⚙ Admin</Link>
                        )}
                        <span className="nav-link hide-mobile" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                            {user?.username} ({user?.total_points || 0} pts)
                        </span>
                        <button onClick={logout} className="nav-link btn-logout">
                            <span className="nav-icon"><LogOutIcon /></span>
                            <span className="nav-text hide-mobile">Logout</span>
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
