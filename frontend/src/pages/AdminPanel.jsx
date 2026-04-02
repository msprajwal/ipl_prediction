import { useState, useEffect } from 'react';
import api from '../api';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import iplSquads from '../data/iplSquads';

function AdminPanel({ user }) {
    const [matches, setMatches] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New match form
    const [newMatch, setNewMatch] = useState({ team1: '', team2: '', match_date: '', match_time: '19:30' });

    const [editTimeId, setEditTimeId] = useState(null);
    const [editTimeValue, setEditTimeValue] = useState('');

    const handleUpdateMatchTime = async (matchId) => {
        if (!editTimeValue) return;
        try {
            // Convert local datetime-local value to UTC ISO string
            const localDate = new Date(editTimeValue);
            await api.patch(`/api/admin/matches/${matchId}/time`, {
                match_date: localDate.toISOString()
            });
            setSuccess('Match time updated successfully!');
            setEditTimeId(null);
            fetchMatches();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update match time');
        }
    };

    // Result form
    const [resultForm, setResultForm] = useState({});
    const [activeResultId, setActiveResultId] = useState(null);

    const teamCodes = Object.keys(iplSquads);

    const fetchMatches = async () => {
        try {
            const res = await api.get('/api/matches');
            setMatches(res.data || []);
        } catch (err) {
            setError('Failed to load matches');
        }
    };

    const fetchUsers = async () => {
        if (user?.role !== 'admin') return;
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data || []);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
        fetchUsers();
    }, []);

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const timeValue = newMatch.match_time === 'custom' ? newMatch.custom_time : newMatch.match_time;
            await api.post('/api/admin/matches', {
                team1: newMatch.team1,
                team2: newMatch.team2,
                match_date: new Date(`${newMatch.match_date}T${timeValue}:00`).toISOString()
            });
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
            await api.put(`/api/admin/matches/${matchId}/result`, resultForm);
            setSuccess(`Match #${matchId} result updated and points calculated!`);
            setActiveResultId(null);
            setResultForm({});
            fetchMatches();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update result');
        }
    };

    const handleUpdateUserGroup = async (userId, newGroup) => {
        setError('');
        setSuccess('');
        try {
            await api.patch(`/api/admin/users/${userId}/group`, { group: newGroup });
            setSuccess(`User group updated to ${newGroup}!`);
            fetchUsers(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user group');
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
                                        {match.status !== 'completed' && (
                                            <button
                                                onClick={() => {
                                                    setEditTimeId(editTimeId === match.id ? null : match.id);
                                                    // Pre-fill with current match time in local format
                                                    const d = new Date(match.match_date);
                                                    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                                                        .toISOString().slice(0, 16);
                                                    setEditTimeValue(local);
                                                }}
                                                style={{ marginLeft: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </span>
                                </div>

                                {/* EDIT MATCH TIME */}
                                {editTimeId === match.id && (
                                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            style={{ flex: 1, minWidth: '200px' }}
                                            value={editTimeValue}
                                            onChange={e => setEditTimeValue(e.target.value)}
                                        />
                                        <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                            onClick={() => handleUpdateMatchTime(match.id)}>
                                            Save
                                        </button>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                            onClick={() => setEditTimeId(null)}>
                                            Cancel
                                        </button>
                                    </div>
                                )}

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

            {/* USER MANAGEMENT */}
            <div className="glass-panel" style={{ marginTop: '2rem' }}>
                <h3>User Management</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Assign users to either the **Family** or **Friends** groups to separate their point totals.
                </p>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <th style={{ padding: '0.75rem' }}>Username</th>
                                <th style={{ padding: '0.75rem' }}>Email</th>
                                <th style={{ padding: '0.75rem' }}>Group</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        {u.username} {u.username === user.username && <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>YOU</span>}
                                    </td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.email}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ 
                                            textTransform: 'capitalize', 
                                            padding: '4px 8px', 
                                            borderRadius: '12px', 
                                            fontSize: '0.75rem',
                                            background: u.group === 'friends' ? 'rgba(168,85,247,0.2)' : 'rgba(16,185,129,0.2)',
                                            color: u.group === 'friends' ? '#a855f7' : '#10b981'
                                        }}>
                                            {u.group}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        {u.group === 'family' ? (
                                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                                                onClick={() => handleUpdateUserGroup(u.id, 'friends')}>
                                                Move to Friends
                                            </button>
                                        ) : (
                                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
                                                onClick={() => handleUpdateUserGroup(u.id, 'family')}>
                                                Move to Family
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DANGER ZONE - RESET DB */}
            <div className="glass-panel" style={{ marginTop: '2rem', border: '1px solid #ef4444' }}>
                <h3 style={{ color: '#ef4444' }}>⚠️ Danger Zone</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    This will delete ALL users (except admin), matches, and predictions. Everyone will need to re-register.
                </p>
                <button
                    className="btn"
                    style={{ background: '#ef4444', border: 'none' }}
                    onClick={async () => {
                        if (window.confirm('⚠️ Are you sure? This will DELETE all users, matches, and predictions. This cannot be undone!')) {
                            try {
                                const res = await api.post('/api/admin/reset-db');
                                setSuccess(res.data.message);
                                setMatches([]);
                            } catch (err) {
                                setError(err.response?.data?.error || 'Failed to reset database');
                            }
                        }
                    }}
                >
                    🗑️ Reset Entire Database
                </button>
            </div>
        </div>
    );
}

export default AdminPanel;
