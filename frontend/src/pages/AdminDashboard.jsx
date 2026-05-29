import { useEffect, useState } from 'react';

const API = 'http://localhost:3100/api';

function AdminDashboard({ token }) {
    const [tab, setTab] = useState('dashboard');
    const [statistics, setStatistics] = useState(null);
    const [breeds, setBreeds] = useState([]);
    const [users, setUsers] = useState([]);
    const [cats, setCats] = useState([]);
    const [breedForm, setBreedForm] = useState({ id: '', name: '', description: '', origin: '' });
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchAll = async () => {
        setError('');

        const statsRes = await fetch(`${API}/admin/statistics`, { headers });
        const statsData = await statsRes.json();
        if (!statsRes.ok) return setError(statsData.error);
        setStatistics(statsData.data);

        const breedsRes = await fetch(`${API}/breeds`, { headers });
        const breedsData = await breedsRes.json();
        if (!breedsRes.ok) return setError(breedsData.error);
        setBreeds(breedsData.data);

        const usersRes = await fetch(`${API}/admin/users`, { headers });
        const usersData = await usersRes.json();
        if (!usersRes.ok) return setError(usersData.error);
        setUsers(usersData.data);

        const catsRes = await fetch(`${API}/admin/cats`, { headers });
        const catsData = await catsRes.json();
        if (!catsRes.ok) return setError(catsData.error);
        setCats(catsData.data);
    };

    useEffect(() => { fetchAll(); }, []);

    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

    const resetBreedForm = () => setBreedForm({ id: '', name: '', description: '', origin: '' });

    const saveBreed = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');

        const isEdit = !!breedForm.id;
        const url = isEdit ? `${API}/breeds/${breedForm.id}` : `${API}/breeds`;
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers,
            body: JSON.stringify({
                name: breedForm.name,
                description: breedForm.description,
                origin: breedForm.origin
            })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setMsg(isEdit ? 'Breed updated' : 'Breed added');
        resetBreedForm();
        fetchAll();
    };

    const editBreed = (breed) => {
        setBreedForm({
            id: breed.id,
            name: breed.name || '',
            description: breed.description || '',
            origin: breed.origin || ''
        });
    };

    const deleteBreed = async (id) => {
        if (!confirm('Delete this breed? Cats with this breed will become unassigned.')) return;

        const res = await fetch(`${API}/breeds/${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setMsg('Breed deleted');
        fetchAll();
    };

    const updateUserStatus = async (id, isActive) => {
        const res = await fetch(`${API}/admin/users/${id}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ is_active: isActive })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('User status updated');
        fetchAll();
    };

    const updateCatStatus = async (id, isActive) => {
        const res = await fetch(`${API}/admin/cats/${id}/status`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ is_active: isActive })
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Cat status updated');
        fetchAll();
    };

    const navItems = [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'breeds', label: 'Breeds' },
        { key: 'users', label: 'Users' },
        { key: 'cats', label: 'Cats' }
    ];

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">Admin Panel</div>
                <nav className="admin-sidebar-nav">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            className={`admin-sidebar-link${tab === item.key ? ' is-active' : ''}`}
                            onClick={() => setTab(item.key)}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="admin-main">
                {(msg || error) && (
                    <div className="admin-toast-bar">
                        {msg && <span className="admin-toast admin-toast--ok">{msg}</span>}
                        {error && <span className="admin-toast admin-toast--err">{error}</span>}
                    </div>
                )}

                {tab === 'dashboard' && (
                    <section>
                        <h2 className="admin-section-title">Dashboard</h2>
                        {statistics && (
                            <div className="admin-stats">
                                <div className="card admin-stat-card"><span>Users</span><h3>{statistics.users}</h3><p>Registered accounts</p></div>
                                <div className="card admin-stat-card"><span>Cats</span><h3>{statistics.cats}</h3><p>Cat profiles</p></div>
                                <div className="card admin-stat-card"><span>Matches</span><h3>{statistics.matches}</h3><p>Love connections</p></div>
                                <div className="card admin-stat-card"><span>Messages</span><h3>{statistics.messages}</h3><p>Chat activity</p></div>
                            </div>
                        )}
                    </section>
                )}

                {tab === 'breeds' && (
                    <section>
                        <h2 className="admin-section-title">Breeds</h2>

                        <div className="card admin-panel">
                            <h3 className="admin-panel-heading">{breedForm.id ? 'Edit Breed' : 'Add Breed'}</h3>
                            <form className="admin-form-grid" onSubmit={saveBreed}>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input value={breedForm.name} onChange={e => setBreedForm({ ...breedForm, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Origin</label>
                                    <input value={breedForm.origin} onChange={e => setBreedForm({ ...breedForm, origin: e.target.value })} />
                                </div>
                                <div className="form-group admin-field-full">
                                    <label>Description</label>
                                    <textarea value={breedForm.description} onChange={e => setBreedForm({ ...breedForm, description: e.target.value })} />
                                </div>
                                <div className="actions admin-actions">
                                    <button className="btn-primary" type="submit">{breedForm.id ? 'Update Breed' : 'Add Breed'}</button>
                                    {breedForm.id && <button className="btn-secondary" type="button" onClick={resetBreedForm}>Cancel</button>}
                                </div>
                            </form>
                        </div>

                        <div className="admin-section">
                            <div className="admin-section-header">
                                <span className="admin-count">{breeds.length} records</span>
                            </div>
                            <div className="admin-grid admin-grid--breeds">
                                {breeds.map(breed => (
                                    <article className="card admin-list-card" key={breed.id}>
                                        <h3>{breed.name}</h3>
                                        <dl className="admin-meta">
                                            <div><dt>Description</dt><dd>{breed.description || '-'}</dd></div>
                                            <div><dt>Origin</dt><dd>{breed.origin || '-'}</dd></div>
                                        </dl>
                                        <div className="actions admin-actions">
                                            <button className="btn-primary" onClick={() => editBreed(breed)}>Edit</button>
                                            <button className="btn-danger" onClick={() => deleteBreed(breed.id)}>Delete</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {tab === 'users' && (
                    <section>
                        <div className="admin-section-header">
                            <h2 className="admin-section-title">Users</h2>
                            <span className="admin-count">{users.length} users</span>
                        </div>
                        <div className="admin-grid">
                            {users.map(user => (
                                <article className="card admin-list-card" key={user.id}>
                                    <div className="admin-card-title">
                                        <h3>{user.full_name}</h3>
                                        <span className={user.is_active ? 'admin-status is-active' : 'admin-status is-muted'}>
                                            {user.is_active ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                    <dl className="admin-meta">
                                        <div><dt>Email</dt><dd>{user.email}</dd></div>
                                        <div><dt>Role</dt><dd>{user.role}</dd></div>
                                        <div><dt>Reports</dt><dd>{Number(user.report_count) || 0}</dd></div>
                                    </dl>
                                    <div className="actions admin-actions">
                                        {user.is_active ? (
                                            <button className="btn-danger" onClick={() => updateUserStatus(user.id, false)}>Suspend</button>
                                        ) : (
                                            <button className="btn-primary" onClick={() => updateUserStatus(user.id, true)}>Activate</button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {tab === 'cats' && (
                    <section>
                        <div className="admin-section-header">
                            <h2 className="admin-section-title">Cats</h2>
                            <span className="admin-count">{cats.length} cats</span>
                        </div>
                        <div className="admin-grid">
                            {cats.map(cat => (
                                <article className="card admin-list-card" key={cat.id}>
                                    <div className="admin-card-title">
                                        <h3>{cat.name}</h3>
                                        <span className={cat.is_active ? 'admin-status is-active' : 'admin-status is-muted'}>
                                            {cat.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                    <dl className="admin-meta">
                                        <div><dt>Owner</dt><dd>{cat.owner_name} ({cat.owner_email})</dd></div>
                                        <div><dt>Breed</dt><dd>{cat.breed_name || '-'}</dd></div>
                                        <div><dt>Gender</dt><dd>{cat.gender}</dd></div>
                                        <div><dt>Reports</dt><dd>{Number(cat.report_count) || 0}</dd></div>
                                    </dl>
                                    <div className="actions admin-actions">
                                        {cat.is_active ? (
                                            <button className="btn-danger" onClick={() => updateCatStatus(cat.id, false)}>Hide</button>
                                        ) : (
                                            <button className="btn-primary" onClick={() => updateCatStatus(cat.id, true)}>Activate</button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
