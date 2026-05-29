import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'http://localhost:3100/api';

function AdminLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${API}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            onLogin(data.token);
        } catch {
            setError('Failed to connect to server');
        }
    };

    return (
        <main className="auth-page auth-page--login">
            <section className="auth-card auth-card--login">
                <Link className="auth-brand" to="/">Puss In Love</Link>
                <p className="auth-kicker">Admin area</p>
                <h2>Admin Login</h2>
                <p className="auth-copy">Manage breeds, moderation, and statistics.</p>
                {error && <p className="error auth-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group auth-field">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group auth-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="auth-button">Login as Admin</button>
                </form>
                <p className="auth-switch">
                    User login? <Link to="/login">Login here</Link>
                </p>
            </section>
        </main>
    );
}

export default AdminLogin;
