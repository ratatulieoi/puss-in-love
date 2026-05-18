import { useState, useEffect } from 'react';

const API = 'http://localhost:3100/api';

function Profile({ token }) {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ full_name: '', phone: '', location: '' });
    const [editing, setEditing] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchProfile = async () => {
        const res = await fetch(`${API}/users/me`, { headers });
        const data = await res.json();
        setProfile(data.data);
        setForm({ full_name: data.data.full_name, phone: data.data.phone || '', location: data.data.location || '' });
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');
        const res = await fetch(`${API}/users/me`, { method: 'PUT', headers, body: JSON.stringify(form) });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setProfile(data.data);
        setMsg('Profile updated!');
        setEditing(false);
    };

    if (!profile) return <p>Loading...</p>;

    return (
        <div>
            <h2>My Profile</h2>
            {msg && <p className="success">{msg}</p>}
            {error && <p className="error">{error}</p>}

            {!editing ? (
                <div className="card">
                    <p><strong>Name:</strong> {profile.full_name}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone || '—'}</p>
                    <p><strong>Location:</strong> {profile.location || '—'}</p>
                    <p><strong>Role:</strong> <span className="badge">{profile.role}</span></p>
                    <div className="actions">
                        <button className="btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                    </div>
                </div>
            ) : (
                <form className="card" onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default Profile;
