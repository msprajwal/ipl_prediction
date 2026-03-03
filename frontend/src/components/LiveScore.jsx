import { useState, useEffect, useRef } from 'react';
import api from '../api';

// Map our short team codes to possible CricAPI team names/shortnames
const TEAM_ALIASES = {
    IND: ['India', 'IND'],
    WI: ['West Indies', 'WI', 'Windies'],
    AUS: ['Australia', 'AUS'],
    ENG: ['England', 'ENG'],
    SA: ['South Africa', 'SA', 'RSA'],
    NZ: ['New Zealand', 'NZ'],
    PAK: ['Pakistan', 'PAK'],
    SL: ['Sri Lanka', 'SL', 'SLK'],
    BAN: ['Bangladesh', 'BAN'],
    AFG: ['Afghanistan', 'AFG'],
    CSK: ['Chennai Super Kings', 'CSK'],
    MI: ['Mumbai Indians', 'MI'],
    RCB: ['Royal Challengers', 'RCB'],
    KKR: ['Kolkata Knight Riders', 'KKR'],
    DC: ['Delhi Capitals', 'DC'],
    SRH: ['Sunrisers Hyderabad', 'SRH'],
    GT: ['Gujarat Titans', 'GT'],
    LSG: ['Lucknow Super Giants', 'LSG'],
    PBKS: ['Punjab Kings', 'PBKS'],
    RR: ['Rajasthan Royals', 'RR'],
};

function teamMatches(ourTeamCode, cricApiTeamName) {
    const aliases = TEAM_ALIASES[ourTeamCode] || [ourTeamCode];
    const lower = cricApiTeamName.toLowerCase();
    return aliases.some(alias => lower.includes(alias.toLowerCase()));
}

function LiveScore({ team1, team2, matchStatus }) {
    const [scoreData, setScoreData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    const isOngoing = matchStatus === 'upcoming'
        ? new Date() >= new Date() // will be checked in parent
        : matchStatus !== 'completed';

    useEffect(() => {
        fetchScore();

        // Auto-refresh every 30s for live matches
        if (isOngoing) {
            intervalRef.current = setInterval(fetchScore, 30000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [team1, team2]);

    const fetchScore = async () => {
        try {
            const res = await api.get('/api/live-scores');
            const data = res.data;

            if (data.status !== 'success' || !data.data) {
                setError('No live data available');
                setLoading(false);
                return;
            }

            // Find the match that contains both our teams
            const match = data.data.find(m => {
                if (!m.teams || m.teams.length < 2) return false;
                const allTeamText = m.teams.join(' ') + ' ' + m.name;
                return teamMatches(team1, allTeamText) && teamMatches(team2, allTeamText);
            });

            if (match) {
                setScoreData(match);
                setError('');
            } else {
                setError('Match not found in live data');
            }
        } catch (err) {
            setError('Failed to fetch live score');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                Fetching live score...
            </div>
        );
    }

    if (error || !scoreData) {
        return (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {error || 'Live score not available for this match yet.'}
                </p>
                <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(team1 + ' vs ' + team2 + ' live score today')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.85rem' }}
                >
                    🏏 Check on Google
                </a>
            </div>
        );
    }

    const { score, status, venue } = scoreData;

    return (
        <div>
            {/* Status line */}
            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#f59e0b', fontWeight: '600' }}>
                {status}
            </div>

            {/* Score cards */}
            {score && score.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {score.map((s, i) => (
                        <div key={i} style={{
                            background: 'rgba(0,0,0,0.25)',
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: i === score.length - 1 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)'
                        }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }}>
                                {s.inning}
                            </span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white' }}>
                                {s.r}/{s.w}
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                    ({s.o} ov)
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Match started — score data will appear shortly.
                </p>
            )}

            {/* Venue */}
            {venue && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📍 {venue}
                </div>
            )}

            {/* Auto-refresh indicator */}
            {isOngoing && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                    Auto-refreshes every 30 seconds
                </div>
            )}
        </div>
    );
}

export default LiveScore;
