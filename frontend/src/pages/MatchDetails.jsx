import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import iplSquads from '../data/iplSquads';
import { getTeamLogo } from '../utils/logos';

function MatchDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState(null);
    const [myPrediction, setMyPrediction] = useState(null);
    const [publicPredictions, setPublicPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timeLeft, setTimeLeft] = useState(null); // seconds until match starts

    const [formData, setFormData] = useState({
        predicted_winner: '',
        predicted_run_scorer: '',
        predicted_wicket_taker: '',
        predicted_potm: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    // Countdown timer — ticks every second
    useEffect(() => {
        if (!match || match.status !== 'upcoming') return;

        const updateCountdown = () => {
            const now = new Date();
            const matchTime = new Date(match.match_date);
            const diffSeconds = Math.floor((matchTime - now) / 1000);
            setTimeLeft(diffSeconds);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [match]);

    const isLockedByCountdown = timeLeft !== null && timeLeft <= 300 && timeLeft > 0; // 300s = 5 min

    const formatCountdown = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Fetch match details
            const matchRes = await api.get(`/api/matches/${id}`);
            setMatch(matchRes.data);

            // 2. Fetch my prediction
            const myPredRes = await api.get('/api/user/predictions/me');
            const predictionForThisMatch = myPredRes.data.find(p => p.match_id === parseInt(id));

            if (predictionForThisMatch) {
                setMyPrediction(predictionForThisMatch);
                setFormData({
                    predicted_winner: predictionForThisMatch.predicted_winner,
                    predicted_run_scorer: predictionForThisMatch.predicted_run_scorer,
                    predicted_wicket_taker: predictionForThisMatch.predicted_wicket_taker,
                    predicted_potm: predictionForThisMatch.predicted_potm
                });
            }

            // 3. Fetch public predictions if match is completed or match time has passed
            const matchTimePassed = new Date() >= new Date(matchRes.data.match_date);
            if (matchRes.data.status === 'completed' || matchTimePassed) {
                try {
                    const publicRes = await api.get(`/api/user/matches/${id}/predictions`);
                    setPublicPredictions(publicRes.data || []);
                } catch (e) {
                    // 403 = not all users predicted yet and match hasn't started, ignore
                }
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load match details');
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                match_id: parseInt(id),
                ...formData
            };
            await api.post('/api/user/predictions', payload);
            setSuccess('Prediction saved successfully!');
            fetchData(); // Refresh to update view
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save prediction');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Match Data...</div>;
    if (!match) return <div style={{ textAlign: 'center', padding: '3rem' }}>Match not found.</div>;

    return (
        <div>
            <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}
            >
                ← Back to Schedule
            </button>

            {/* MATCH HEADER */}
            {(() => {
                const isFinal = (
                    (match.team1 === 'IND' && match.team2 === 'NZ') ||
                    (match.team1 === 'NZ' && match.team2 === 'IND')
                ) && new Date(match.match_date).toDateString() === new Date('2026-03-08').toDateString();

                return (
                    <div className="glass-panel" style={{
                        marginBottom: '2rem',
                        textAlign: 'center',
                        ...(isFinal ? {
                            border: '2px solid #fbbf24',
                            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(217,119,6,0.1) 50%, rgba(251,191,36,0.15) 100%)',
                            boxShadow: '0 0 30px rgba(251,191,36,0.2), inset 0 0 30px rgba(251,191,36,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                        } : {})
                    }}>
                        {isFinal && (
                            <>
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: '-100%',
                                    width: '200%', height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.1), transparent)',
                                    animation: 'shimmer 3s infinite',
                                    pointerEvents: 'none'
                                }} />
                                <style>{`@keyframes shimmer { 0% { transform: translateX(-50%); } 100% { transform: translateX(50%); } }`}</style>
                                <div style={{
                                    background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
                                    color: '#000',
                                    padding: '8px 24px',
                                    borderRadius: '0 0 12px 12px',
                                    display: 'inline-block',
                                    fontWeight: '900',
                                    fontSize: '0.85rem',
                                    letterSpacing: '3px',
                                    textTransform: 'uppercase',
                                    marginBottom: '1rem'
                                }}>
                                    🏆 ICC T20 WORLD CUP 2026 — FINAL 🏆
                                </div>
                            </>
                        )}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            margin: '1.5rem 0',
                            gap: '1rem',
                            ...(isFinal ? {
                                background: 'linear-gradient(90deg, #fbbf24, #fff, #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '900'
                            } : {})
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                                {getTeamLogo(match.team1) ? (
                                    <img src={getTeamLogo(match.team1)} alt={match.team1} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
                                ) : (
                                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{match.team1}</div>
                                )}
                            </div>
                            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>VS</div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                                {getTeamLogo(match.team2) ? (
                                    <img src={getTeamLogo(match.team2)} alt={match.team2} style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
                                ) : (
                                    <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{match.team2}</div>
                                )}
                            </div>
                        </div>
                        {isFinal && (
                            <p style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '1rem', margin: '0.5rem 0' }}>
                                ✨ The Grand Finale — Who lifts the trophy? ✨
                            </p>
                        )}
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                            {format(new Date(match.match_date), 'MMMM do, yyyy - hh:mm a')}
                        </p>
                        <div style={{ marginTop: '1rem' }}>
                            <span style={{
                                background: isFinal
                                    ? 'linear-gradient(90deg, #fbbf24, #d97706)'
                                    : match.status === 'completed' ? '#10b981' : (match.status === 'upcoming' && new Date() >= new Date(match.match_date)) ? '#f59e0b' : match.status === 'active' ? '#ef4444' : '#3b82f6',
                                padding: isFinal ? '8px 24px' : '6px 16px',
                                borderRadius: '20px',
                                fontSize: isFinal ? '1rem' : '0.9rem',
                                color: isFinal ? '#000' : 'white',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {isFinal ? '🏆 FINAL' : (match.status === 'upcoming' && new Date() >= new Date(match.match_date) ? 'ongoing' : match.status)}
                            </span>
                        </div>
                    </div>
                );
            })()}

            <div className="grid grid-2">
                {/* PREDICTION FORM OR RESULTS */}
                <div className="glass-panel">
                    {match.status === 'upcoming' && new Date() < new Date(match.match_date) ? (
                        <>
                            <h3>Your Predictions</h3>

                            {/* Countdown Timer Banner — shows when < 5 min remain */}
                            {isLockedByCountdown && (
                                <div style={{
                                    background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
                                    border: '1px solid rgba(239,68,68,0.5)',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    marginBottom: '1.5rem',
                                    textAlign: 'center',
                                    animation: 'pulse-border 2s ease-in-out infinite'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                        ⏱️ Predictions Locking In
                                    </div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: '900',
                                        fontFamily: 'monospace',
                                        color: '#ef4444',
                                        letterSpacing: '4px',
                                        textShadow: '0 0 20px rgba(239,68,68,0.4)'
                                    }}>
                                        {formatCountdown(timeLeft)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        ⚡ Hurry up! Predictions lock when the match starts
                                    </div>
                                    <style>{`@keyframes pulse-border { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 15px 3px rgba(239,68,68,0.15); } }`}</style>
                                </div>
                            )}

                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Predict before the match starts. You can change it until then.
                            </p>

                            {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
                            {success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>{success}</div>}

                            <form onSubmit={handlePredict}>
                                <div className="form-group">
                                    <label>Predicted Winner (2 pts)</label>
                                    <select
                                        className="form-control"
                                        value={formData.predicted_winner}
                                        onChange={e => setFormData({ ...formData, predicted_winner: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Team...</option>
                                        <option value={match.team1}>{match.team1}</option>
                                        <option value={match.team2}>{match.team2}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Highest Runs (5 pts)</label>
                                    <select
                                        className="form-control"
                                        value={formData.predicted_run_scorer}
                                        onChange={e => setFormData({ ...formData, predicted_run_scorer: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Player...</option>
                                        {match && iplSquads[match.team1] && (
                                            <optgroup label={match.team1}>
                                                {iplSquads[match.team1].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                        {match && iplSquads[match.team2] && (
                                            <optgroup label={match.team2}>
                                                {iplSquads[match.team2].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Highest Wickets (3 pts)</label>
                                    <select
                                        className="form-control"
                                        value={formData.predicted_wicket_taker}
                                        onChange={e => setFormData({ ...formData, predicted_wicket_taker: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Player...</option>
                                        {match && iplSquads[match.team1] && (
                                            <optgroup label={match.team1}>
                                                {iplSquads[match.team1].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                        {match && iplSquads[match.team2] && (
                                            <optgroup label={match.team2}>
                                                {iplSquads[match.team2].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Player of the Match (10 pts)</label>
                                    <select
                                        className="form-control"
                                        value={formData.predicted_potm}
                                        onChange={e => setFormData({ ...formData, predicted_potm: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Player...</option>
                                        {match && iplSquads[match.team1] && (
                                            <optgroup label={match.team1}>
                                                {iplSquads[match.team1].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                        {match && iplSquads[match.team2] && (
                                            <optgroup label={match.team2}>
                                                {iplSquads[match.team2].map(p => <option key={p} value={p}>{p}</option>)}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>

                                <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }} disabled={saving}>
                                    {saving ? 'Saving...' : (myPrediction ? 'Update Prediction' : 'Submit Prediction')}
                                </button>
                            </form>
                        </>
                    ) : match.status === 'upcoming' && new Date() >= new Date(match.match_date) ? (
                        <>
                            <h3>🔒 Predictions Locked</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                The match has started — predictions are now locked.
                            </p>
                            {myPrediction && (
                                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Your prediction:</p>
                                    <p><strong>Winner:</strong> {myPrediction.predicted_winner}</p>
                                    <p><strong>Highest Runs:</strong> {myPrediction.predicted_run_scorer}</p>
                                    <p><strong>Highest Wickets:</strong> {myPrediction.predicted_wicket_taker}</p>
                                    <p><strong>POTM:</strong> {myPrediction.predicted_potm}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <h3>Actual Results</h3>
                            {match.status === 'active' ? (
                                <p style={{ color: 'var(--text-muted)' }}>Match is currently live. Results will be updated once finished.</p>
                            ) : (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Winner</span>
                                        <strong>{match.actual_winner}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Highest Runs</span>
                                        <strong>{match.actual_run_scorer}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Highest Wickets</span>
                                        <strong>{match.actual_wicket_taker}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Player of the Match</span>
                                        <strong>{match.actual_potm}</strong>
                                    </div>

                                    {myPrediction && (
                                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
                                            <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Your Points Earned</h4>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>+{myPrediction.points_earned} pts</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* PUBLIC PREDICTIONS / MY LOCKED PREDICTION */}
                <div className="glass-panel">
                    {match.status === 'upcoming' && new Date() < new Date(match.match_date) && publicPredictions.length === 0 ? (
                        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
                            <h3>Other Users' Predictions</h3>
                            <div style={{ padding: '3rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginTop: '1rem' }}>
                                <span style={{ fontSize: '2rem' }}>🔒</span>
                                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                                    Hidden until everyone has predicted or the match starts.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3>Community Predictions</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                See what everyone else predicted and how many points they earned.
                            </p>

                            {publicPredictions.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>No predictions found for this match.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {publicPredictions.map((p, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: p.username === user.username ? '1px solid var(--primary)' : '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                <strong style={{ color: p.username === user.username ? 'var(--primary)' : 'white' }}>
                                                    {p.username} {p.username === user.username && '(You)'}
                                                </strong>
                                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>+{p.points_earned} pts</span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                                                <div><span style={{ color: 'var(--text-muted)' }}>Winner:</span> {p.predicted_winner}</div>
                                                <div><span style={{ color: 'var(--text-muted)' }}>POTM:</span> {p.predicted_potm}</div>
                                                <div><span style={{ color: 'var(--text-muted)' }}>Runs:</span> {p.predicted_run_scorer}</div>
                                                <div><span style={{ color: 'var(--text-muted)' }}>Wickets:</span> {p.predicted_wicket_taker}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MatchDetails;
