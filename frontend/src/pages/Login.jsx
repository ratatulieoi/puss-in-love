import { useState } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:3100/api';

function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API}/auth/login`, {
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
                <p className="auth-kicker">Welcome back</p>
                <h2>Login</h2>
                <p className="auth-copy">Continue finding lovely matches for your cat.</p>
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
                    <button type="submit" className="auth-button">Login</button>
                </form>
                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;
