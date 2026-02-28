import { useState, useEffect } from 'react';
import axios from 'axios';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axios.get('http://localhost:8081/api/leaderboard');
                setLeaderboard(response.data || []);
            } catch (error) {
                console.error("Error fetching leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Global Leaderboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Top IPL Predictors of 2026</p>
            </div>

            <div className="glass-panel" style={{ padding: '0' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No points recorded yet. Predict a match to get on the board!
                    </div>
                ) : (
                    <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'center', width: '80px', color: 'var(--text-muted)' }}>RANK</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-muted)' }}>USER</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>TOTAL POINTS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((user, index) => (
                                    <tr key={index} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        background: index === 0 ? 'rgba(250, 204, 21, 0.1)' : index === 1 ? 'rgba(148, 163, 184, 0.1)' : index === 2 ? 'rgba(180, 83, 9, 0.1)' : 'transparent'
                                    }}>
                                        <td style={{
                                            padding: '1rem',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: index === 0 ? '#facc15' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : 'white'
                                        }}>
                                            {index === 0 ? '🏆 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : (index + 1)}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                                            {user.username}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {user.total_points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
