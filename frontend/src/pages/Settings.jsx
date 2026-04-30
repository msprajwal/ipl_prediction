import { useState } from 'react';
import api from '../api';

function Settings({ user, logout }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match');
            return;
        }

        if (currentPassword === newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/user/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });
            setSuccess('Password changed successfully! You will be logged out in a moment.');
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Settings</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Manage your account settings and security.
            </p>

            <div className="glass-panel" style={{ maxWidth: '500px' }}>
                <h3>Change Password</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    For your security, please enter your current password and a new password.
                </p>

                {error && (
                    <div style={{
                        color: '#ef4444',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: 'rgba(239,68,68,0.1)',
                        borderRadius: '8px'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        color: '#10b981',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: 'rgba(16,185,129,0.1)',
                        borderRadius: '8px'
                    }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter new password (min 6 characters)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                Passwords do not match
                            </p>
                        )}
                        {newPassword && confirmPassword && newPassword === confirmPassword && (
                            <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                Passwords match
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Change Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Settings;
