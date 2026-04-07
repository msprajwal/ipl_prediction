import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { format } from 'date-fns';
import { getTeamLogo } from '../utils/logos';

function PastMatches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompleted = async () => {
            try {
                const response = await api.get('/api/matches/completed');
                setMatches(response.data || []);
            } catch (error) {
                console.error("Error fetching completed matches", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompleted();
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem' }}>Past Matches</h1>
                <p style={{ color: 'var(--text-muted)' }}>View results and predictions from completed matches.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading matches...</div>
            ) : matches.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h3>No completed matches yet</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Matches will appear here once the admin updates the final results.</p>
                </div>
            ) : (
                <div className="grid grid-2">
                    {matches.map((match) => (
                        <div key={match.id} className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <span style={{
                                    background: match.status === 'cancelled' ? 'rgba(107, 114, 128, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    color: match.status === 'cancelled' ? '#9ca3af' : '#10b981',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {match.status === 'cancelled' ? '🌧️ Cancelled' : '✓ Completed'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {format(new Date(match.match_date), 'MMM dd, yyyy')}
                                </span>
                            </div>

                            <div style={{ textAlign: 'center', margin: '1rem 0', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        {getTeamLogo(match.team1) ? (
                                            <img src={getTeamLogo(match.team1)} alt={match.team1} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${match.team1}&background=1e293b&color=fff&rounded=true&bold=true`; e.target.onerror = null; }} />
                                        ) : (
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: match.actual_winner === match.team1 ? '#10b981' : 'var(--text-main)' }}>{match.team1}</div>
                                        )}
                                        {match.status !== 'cancelled' && match.actual_winner === match.team1 && <span style={{ fontSize: '0.8rem', display: 'block', color: '#10b981', marginTop: '4px', fontWeight: 'bold' }}>🏆 Winner</span>}
                                    </div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>VS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        {getTeamLogo(match.team2) ? (
                                            <img src={getTeamLogo(match.team2)} alt={match.team2} style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }} onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${match.team2}&background=1e293b&color=fff&rounded=true&bold=true`; e.target.onerror = null; }} />
                                        ) : (
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: match.actual_winner === match.team2 ? '#10b981' : 'var(--text-main)' }}>{match.team2}</div>
                                        )}
                                        {match.status !== 'cancelled' && match.actual_winner === match.team2 && <span style={{ fontSize: '0.8rem', display: 'block', color: '#10b981', marginTop: '4px', fontWeight: 'bold' }}>🏆 Winner</span>}
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/match/${match.id}`}
                                className="btn btn-secondary"
                                style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}
                            >
                                {match.status === 'cancelled' ? 'View Predictions' : 'View Results & Predictions'}
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PastMatches;
