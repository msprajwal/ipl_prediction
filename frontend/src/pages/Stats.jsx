import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import api from '../api';
import Cookies from 'js-cookie';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Color palette for users
const COLORS = [
    '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
    '#06b6d4', '#ef4444', '#22c55e', '#eab308', '#a855f7',
    '#f43f5e', '#0ea5e9', '#84cc16', '#d946ef', '#64748b'
];

function Stats() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get current logged-in username
    const userData = Cookies.get('user');
    const currentUser = userData ? JSON.parse(userData).username : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/api/points-history');
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch points history', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = data ? {
        labels: data.matches,
        datasets: (data.users || []).map((user, i) => {
            const isMe = user.username === currentUser;
            return {
                label: user.username + (isMe ? ' (You)' : ''),
                data: user.points,
                borderColor: isMe ? '#fbbf24' : COLORS[i % COLORS.length],
                backgroundColor: isMe ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                borderWidth: isMe ? 3.5 : 1.5,
                pointRadius: isMe ? 6 : 3,
                pointHoverRadius: isMe ? 9 : 6,
                pointBackgroundColor: isMe ? '#fbbf24' : COLORS[i % COLORS.length],
                pointBorderColor: isMe ? '#fff' : COLORS[i % COLORS.length],
                pointBorderWidth: isMe ? 2 : 0,
                tension: 0.3,
                fill: isMe,
                order: isMe ? 0 : 1, // draw "You" on top
            };
        })
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    font: { size: 12 },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(99, 102, 241, 0.3)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y} pts`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    maxRotation: 45,
                    minRotation: 0
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.08)',
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    font: { size: 12 },
                    stepSize: 2,
                    callback: (val) => val + ' pts'
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.08)',
                },
                title: {
                    display: true,
                    text: 'Points Earned',
                    color: '#64748b',
                    font: { size: 13 }
                }
            }
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem' }}>📊 Points Tracker</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Rise & fall — see how everyone performed match by match
                </p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading chart...
                    </div>
                ) : !data || !data.matches || data.matches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        📭 No completed matches yet. Points will appear here after the admin updates match results!
                    </div>
                ) : (
                    <div style={{ height: '450px', position: 'relative' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>

            {/* Per-match breakdown table */}
            {data && data.matches && data.matches.length > 0 && (
                <div className="glass-panel" style={{ marginTop: '2rem', padding: 0 }}>
                    <h3 style={{ padding: '1.5rem 1.5rem 0.5rem', fontSize: '1.2rem' }}>
                        📋 Match-by-Match Breakdown
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem', position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 1 }}>
                                        USER
                                    </th>
                                    {data.matches.map((m, i) => (
                                        <th key={i} style={{ padding: '0.8rem 0.6rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            {m}
                                        </th>
                                    ))}
                                    <th style={{ padding: '0.8rem 1rem', textAlign: 'center', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        TOTAL
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.users || []).map((user, idx) => {
                                    const isMe = user.username === currentUser;
                                    const total = user.points.reduce((a, b) => a + b, 0);
                                    return (
                                        <tr key={idx} style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: isMe ? 'rgba(251, 191, 36, 0.08)' : 'transparent'
                                        }}>
                                            <td style={{
                                                padding: '0.8rem 1rem',
                                                fontWeight: isMe ? 'bold' : 'normal',
                                                color: isMe ? '#fbbf24' : 'white',
                                                position: 'sticky', left: 0,
                                                background: isMe ? 'rgba(251,191,36,0.1)' : 'var(--surface)',
                                                zIndex: 1,
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user.username} {isMe && '⭐'}
                                            </td>
                                            {user.points.map((pts, pIdx) => (
                                                <td key={pIdx} style={{
                                                    padding: '0.8rem 0.6rem',
                                                    textAlign: 'center',
                                                    fontWeight: pts > 0 ? 'bold' : 'normal',
                                                    color: pts >= 10 ? '#22c55e' : pts >= 5 ? '#fbbf24' : pts > 0 ? '#94a3b8' : 'rgba(148,163,184,0.3)'
                                                }}>
                                                    {pts}
                                                </td>
                                            ))}
                                            <td style={{
                                                padding: '0.8rem 1rem',
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                color: 'var(--primary)'
                                            }}>
                                                {total}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Stats;
