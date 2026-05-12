import { useState, useEffect } from 'react';

const API = 'http://localhost:3000/api';

function Cats({ token }) {
    const [cats, setCats] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', breed_id: '', gender: 'unknown', birth_date: '', color: '', description: '' });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchCats = async () => {
        const res = await fetch(`${API}/cats`, { headers });
        const data = await res.json();
        setCats(data.data);
    };

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers });
        const data = await res.json();
        setBreeds(data.data);
    };

    useEffect(() => { fetchCats(); fetchBreeds(); }, []);

    const resetForm = () => {
        setForm({ name: '', breed_id: '', gender: 'unknown', birth_date: '', color: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');

        const payload = { ...form, breed_id: form.breed_id ? Number(form.breed_id) : null };
        const url = editingId ? `${API}/cats/${editingId}` : `${API}/cats`;
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setMsg(editingId ? 'Cat updated!' : 'Cat added!');
        resetForm();
        fetchCats();
    };

    const handleEdit = (cat) => {
        setForm({
            name: cat.name,
            breed_id: cat.breed_id || '',
            gender: cat.gender,
            birth_date: cat.birth_date ? cat.birth_date.split('T')[0] : '',
            color: cat.color || '',
            description: cat.description || ''
        });
        setEditingId(cat.id);
        setShowForm(true);
        setMsg('');
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this cat?')) return;
        const res = await fetch(`${API}/cats/${id}`, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Cat deleted!');
        fetchCats();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Cats</h2>
                {!showForm && <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Add Cat</button>}
            </div>

            {msg && <p className="success">{msg}</p>}
            {error && <p className="error">{error}</p>}

            {showForm && (
                <form className="card" onSubmit={handleSubmit}>
                    <h3 style={{ marginBottom: 12 }}>{editingId ? 'Edit Cat' : 'Add New Cat'}</h3>
                    <div className="form-group">
                        <label>Name *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Breed</label>
                        <select value={form.breed_id} onChange={e => setForm({ ...form, breed_id: e.target.value })}>
                            <option value="">— Select breed —</option>
                            {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                            <option value="unknown">Unknown</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Birth Date</label>
                        <input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Color</label>
                        <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="actions">
                        <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
                        <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                    </div>
                </form>
            )}

            {cats.length === 0 && !showForm && <p className="card">No cats yet. Add your first cat!</p>}

            {cats.map(cat => (
                <div className="card" key={cat.id}>
                    <h3>{cat.name}</h3>
                    <p><strong>Breed:</strong> {cat.breed_name || '—'}</p>
                    <p><strong>Gender:</strong> {cat.gender}</p>
                    <p><strong>Birth Date:</strong> {cat.birth_date ? cat.birth_date.split('T')[0] : '—'}</p>
                    <p><strong>Color:</strong> {cat.color || '—'}</p>
                    {cat.description && <p><strong>Description:</strong> {cat.description}</p>}
                    <div className="actions">
                        <button className="btn-primary" onClick={() => handleEdit(cat)}>Edit</button>
                        <button className="btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Cats;
