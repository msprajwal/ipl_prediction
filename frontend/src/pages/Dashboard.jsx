import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { format } from 'date-fns';

function Dashboard() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await api.get('/api/matches');
                setMatches(response.data || []);
            } catch (error) {
                console.error("Error fetching matches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, []);

    const getDisplayStatus = (match) => {
        if (match.status === 'upcoming' && new Date() >= new Date(match.match_date)) return 'ongoing';
        return match.status;
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'upcoming': return '#3b82f6'; // Blue
            case 'ongoing': return '#f59e0b'; // Amber
            case 'active': return '#ef4444'; // Red
            case 'completed': return '#10b981'; // Green
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>IPL 2026 Schedule</h1>
                <p style={{ color: 'var(--text-muted)' }}>Make your predictions before the match starts to earn points!</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading matches...</div>
            ) : matches.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h3>No matches scheduled yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Check back later closer to the tournament start.</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {[...matches].sort((a, b) => {
                        const order = { ongoing: 0, upcoming: 1, active: 2, completed: 3 };
                        return (order[getDisplayStatus(a)] ?? 9) - (order[getDisplayStatus(b)] ?? 9);
                    }).map((match) => (
                        <div key={match.id} className={`glass-panel ${getDisplayStatus(match) === 'ongoing' ? 'match-ongoing' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    color: getStatusBadgeColor(getDisplayStatus(match)),
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {getDisplayStatus(match) === 'ongoing' && <span className="live-dot"></span>}
                                    {getDisplayStatus(match)}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(match.match_date), 'MMM dd, yyyy - hh:mm a')}
                                </span>
                            </div>

                            <div style={{ textAlign: 'center', margin: '1rem 0', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{match.team1}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>vs</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{match.team2}</div>
                                </div>
                            </div>

                            <Link
                                to={`/match/${match.id}`}
                                className="btn btn-secondary"
                                style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}
                            >
                                {match.status === 'completed' ? 'View Results & Predictions' : getDisplayStatus(match) === 'ongoing' ? 'View Predictions' : 'Make Prediction'}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;
