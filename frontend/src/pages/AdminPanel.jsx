import { useState, useEffect } from 'react';
import api from '../api';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import iplSquads from '../data/iplSquads';

function AdminPanel({ user }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New match form
    const [newMatch, setNewMatch] = useState({ team1: '', team2: '', match_date: '', match_time: '19:30' });

    // Result form
    const [resultForm, setResultForm] = useState({});
    const [activeResultId, setActiveResultId] = useState(null);

    const teamCodes = Object.keys(iplSquads);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/api/matches');
            setMatches(res.data || []);
        } catch (err) {
            setError('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const token = Cookies.get('token');
            const timeValue = newMatch.match_time === 'custom' ? newMatch.custom_time : newMatch.match_time;
            await api.post('/api/admin/matches', {
                team1: newMatch.team1,
                team2: newMatch.team2,
                match_date: new Date(`${newMatch.match_date}T${timeValue}:00`).toISOString()
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess('Match created successfully!');
            setNewMatch({ team1: '', team2: '', match_date: '', match_time: '19:30' });
            fetchMatches();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create match');
        }
    };

    const handleUpdateResult = async (matchId) => {
        setError('');
        setSuccess('');
        try {
            const token = Cookies.get('token');
            await api.put(`/api/admin/matches/${matchId}/result`, resultForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(`Match #${matchId} result updated and points calculated!`);
            setActiveResultId(null);
            setResultForm({});
            fetchMatches();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update result');
        }
    };

    const renderPlayerDropdown = (match, field, label) => (
        <select className="form-control"
            onChange={e => setResultForm(prev => ({ ...prev, [field]: e.target.value }))}
            defaultValue="">
            <option value="" disabled>{label}</option>
            {iplSquads[match.team1] && (
                <optgroup label={match.team1}>
                    {iplSquads[match.team1].map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
            )}
            {iplSquads[match.team2] && (
                <optgroup label={match.team2}>
                    {iplSquads[match.team2].map(p => <option key={p} value={p}>{p}</option>)}
                </optgroup>
            )}
        </select>
    );

    if (user?.role !== 'admin') {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <h2 style={{ color: '#ef4444' }}>⛔ Access Denied</h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                    You do not have admin privileges to access this page.
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>Admin Panel</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Create matches, update results, and manage the IPL 2026 season.
            </p>

            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}
            {success && <div style={{ color: '#10b981', marginBottom: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '8px' }}>{success}</div>}

            {/* CREATE MATCH */}
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                <h3>Create New Match</h3>
                <form onSubmit={handleCreateMatch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginTop: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Team 1</label>
                        <select className="form-control" value={newMatch.team1}
                            onChange={e => setNewMatch({ ...newMatch, team1: e.target.value })} required>
                            <option value="">Select Team...</option>
                            {teamCodes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Team 2</label>
                        <select className="form-control" value={newMatch.team2}
                            onChange={e => setNewMatch({ ...newMatch, team2: e.target.value })} required>
                            <option value="">Select Team...</option>
                            {teamCodes.filter(t => t !== newMatch.team1).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Match Date</label>
                        <input className="form-control" type="date" value={newMatch.match_date}
                            onChange={e => setNewMatch({ ...newMatch, match_date: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label>Time Slot</label>
                        <select className="form-control" value={newMatch.match_time}
                            onChange={e => setNewMatch({ ...newMatch, match_time: e.target.value })} required>
                            <option value="15:30">3:30 PM (Afternoon)</option>
                            <option value="19:30">7:30 PM (Evening)</option>
                            <option value="custom">Custom Time</option>
                        </select>
                    </div>
                    {newMatch.match_time === 'custom' && (
                        <div className="form-group" style={{ margin: 0 }}>
                            <label>Custom Time</label>
                            <input className="form-control" type="time" value={newMatch.custom_time || ''}
                                onChange={e => setNewMatch({ ...newMatch, custom_time: e.target.value })} required />
                        </div>
                    )}
                    <button type="submit" className="btn" style={{ height: '48px' }}>+ Add Match</button>
                </form>
            </div>

            {/* MATCHES LIST */}
            <div className="glass-panel">
                <h3>All Matches</h3>
                {loading ? <p>Loading...</p> : matches.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No matches yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {matches.map(match => (
                            <div key={match.id} style={{
                                background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px',
                                border: match.status === 'completed' ? '1px solid #10b981' : '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ fontSize: '1.2rem' }}>{match.team1} vs {match.team2}</strong>
                                        <span style={{
                                            marginLeft: '1rem', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem',
                                            fontWeight: 'bold', textTransform: 'uppercase',
                                            background: match.status === 'completed' ? '#10b981' : match.status === 'active' ? '#ef4444' : '#3b82f6',
                                            color: 'white'
                                        }}>{match.status}</span>
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {format(new Date(match.match_date), 'MMM dd, yyyy - hh:mm a')}
                                    </span>
                                </div>

                                {match.status === 'completed' && (
                                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Winner: <strong style={{ color: 'white' }}>{match.actual_winner}</strong> |
                                        Runs: <strong style={{ color: 'white' }}>{match.actual_run_scorer}</strong> |
                                        Wickets: <strong style={{ color: 'white' }}>{match.actual_wicket_taker}</strong> |
                                        POTM: <strong style={{ color: 'white' }}>{match.actual_potm}</strong>
                                    </div>
                                )}

                                {match.status !== 'completed' && (
                                    <div style={{ marginTop: '1rem' }}>
                                        {activeResultId === match.id ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                                <select className="form-control"
                                                    onChange={e => setResultForm(prev => ({ ...prev, status: 'completed', actual_winner: e.target.value }))}
                                                    defaultValue="">
                                                    <option value="" disabled>Select Winner</option>
                                                    <option value={match.team1}>{match.team1}</option>
                                                    <option value={match.team2}>{match.team2}</option>
                                                </select>
                                                {renderPlayerDropdown(match, 'actual_run_scorer', 'Top Run Scorer')}
                                                {renderPlayerDropdown(match, 'actual_wicket_taker', 'Top Wicket Taker')}
                                                {renderPlayerDropdown(match, 'actual_potm', 'Player of the Match')}
                                                <button className="btn" onClick={() => handleUpdateResult(match.id)}>Save Result & Calculate Points</button>
                                                <button className="btn btn-secondary" onClick={() => setActiveResultId(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}
                                                onClick={() => { setActiveResultId(match.id); setResultForm({ status: 'completed' }); }}>
                                                Update Result
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
