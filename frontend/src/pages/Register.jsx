import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const API = 'http://localhost:3100/api';

function Register() {
    const [form, setForm] = useState({ email: '', password: '', full_name: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await fetch(`${API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch {
            setError('Failed to connect to server');
        }
    };

    return (
        <main className="auth-page auth-page--register">
            <section className="auth-card auth-card--register">
                <Link className="auth-brand" to="/">Puss In Love</Link>
                <p className="auth-kicker">Start matching</p>
                <h2>Register</h2>
                <p className="auth-copy">Create an account and give your cat a sweeter way to meet.</p>
                {error && <p className="error auth-message">{error}</p>}
                {success && <p className="success auth-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group auth-field">
                        <label>Full Name</label>
                        <input name="full_name" value={form.full_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group auth-field">
                        <label>Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group auth-field">
                        <label>Password</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <button type="submit" className="auth-button">Register</button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
