import { useState, useEffect } from 'react';
import '../styles/Profile.css';

const API = 'http://localhost:3100/api';
const BASE_URL = 'http://localhost:3100';

function Profile({ token }) {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ full_name: '', phone: '', location: '' });
    const [editing, setEditing] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
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
    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

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

    const handleAvatarUpload = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');

        if (!avatarFile) {
            return setError('Please choose an avatar file.');
        }

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        const res = await fetch(`${API}/users/me/avatar`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setProfile(data.data);
        setAvatarFile(null);
        setMsg('Avatar updated!');
    };

    if (!profile) return <main className="profile-page"><p className="profile-loading">Loading...</p></main>;

    return (
        <main className="profile-page">
            <section className="profile-card">
                <span className="profile-kicker">Owner profile</span>
                <h1>My Profile</h1>
                <p className="profile-copy">Keep your owner details clear so other cat owners know who is behind each match.</p>

                {msg && <p className="app-toast app-toast--success">{msg}</p>}
                {error && <p className="app-toast app-toast--error">{error}</p>}

                <div className="profile-avatar-box">
                    {profile.avatar_url ? (
                        <img src={`${BASE_URL}${profile.avatar_url}`} alt="Owner avatar" className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar profile-avatar--empty">{profile.full_name.charAt(0)}</div>
                    )}
                    <form onSubmit={handleAvatarUpload} className="profile-avatar-form">
                        <label className="profile-file-button">
                            {avatarFile ? avatarFile.name : 'Choose Photo'}
                            <input type="file" accept="image/png,image/jpeg" onChange={e => setAvatarFile(e.target.files[0])} />
                        </label>
                        <button type="submit" className="profile-button">Upload</button>
                    </form>
                </div>

                {!editing ? (
                    <div className="profile-details">
                        <div>
                            <span>Name</span>
                            <strong>{profile.full_name}</strong>
                        </div>
                        <div>
                            <span>Email</span>
                            <strong>{profile.email}</strong>
                        </div>
                        <div>
                            <span>Phone</span>
                            <strong>{profile.phone || '—'}</strong>
                        </div>
                        <div>
                            <span>Location</span>
                            <strong>{profile.location || '—'}</strong>
                        </div>
                        <div>
                            <span>Role</span>
                            <strong>{profile.role}</strong>
                        </div>
                        <button className="profile-button" onClick={() => setEditing(true)}>Edit Profile</button>
                    </div>
                ) : (
                    <form className="profile-form" onSubmit={handleSave}>
                        <div className="profile-field">
                            <label>Full Name</label>
                            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                        </div>
                        <div className="profile-field">
                            <label>Phone</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Location</label>
                            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                        </div>
                        <div className="profile-actions">
                            <button type="submit" className="profile-button">Save</button>
                            <button type="button" className="profile-button profile-button--ghost" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    </form>
                )}
            </section>
        </main>
    );
}

export default Profile;
