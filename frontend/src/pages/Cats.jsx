import { useState, useEffect } from 'react';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Cats({ token }) {
    const [cats, setCats] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [photos, setPhotos] = useState({});
    const [vaccinations, setVaccinations] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', breed_id: '', gender: 'unknown', birth_date: '', color: '', description: '' });
    const [vaccineForm, setVaccineForm] = useState({ vaccine_name: '', date_given: '', certificate: null });
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const jsonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const authHeaders = { Authorization: `Bearer ${token}` };

    const fetchCats = async () => {
        const res = await fetch(`${API}/cats`, { headers: jsonHeaders });
        const data = await res.json();
        setCats(data.data);
    };

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers: jsonHeaders });
        const data = await res.json();
        setBreeds(data.data);
    };

    const fetchPhotos = async (catId) => {
        const res = await fetch(`${API}/cats/${catId}/photos`, { headers: jsonHeaders });
        const data = await res.json();
        setPhotos(prev => ({ ...prev, [catId]: data.data }));
    };

    const fetchVaccinations = async (catId) => {
        const res = await fetch(`${API}/cats/${catId}/vaccinations`, { headers: jsonHeaders });
        const data = await res.json();
        setVaccinations(prev => ({ ...prev, [catId]: data.data }));
    };

    useEffect(() => { fetchCats(); fetchBreeds(); }, []);

    useEffect(() => {
        cats.forEach(cat => {
            fetchPhotos(cat.id);
            fetchVaccinations(cat.id);
        });
    }, [cats.length]);

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

        const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(payload) });
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
        if (!confirm('Delete this cat? Related photos, vaccinations, swipes, matches, and messages will also be deleted.')) return;
        const res = await fetch(`${API}/cats/${id}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Cat deleted!');
        fetchCats();
    };

    const handlePhotoUpload = async (catId, file) => {
        if (!file) return;
        setMsg(''); setError('');

        const data = new FormData();
        data.append('photo', file);

        const res = await fetch(`${API}/cats/${catId}/photos`, { method: 'POST', headers: authHeaders, body: data });
        const result = await res.json();
        if (!res.ok) return setError(result.error);

        setMsg('Photo uploaded!');
        fetchPhotos(catId);
    };

    const handleDeletePhoto = async (catId, photoId) => {
        const res = await fetch(`${API}/photos/${photoId}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Photo deleted!');
        fetchPhotos(catId);
    };

    const handleSetPrimary = async (catId, photoId) => {
        const res = await fetch(`${API}/photos/${photoId}/primary`, { method: 'PUT', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Primary photo updated!');
        fetchPhotos(catId);
    };

    const handleAddVaccination = async (e, catId) => {
        e.preventDefault();
        setMsg(''); setError('');

        const data = new FormData();
        data.append('vaccine_name', vaccineForm.vaccine_name);
        data.append('date_given', vaccineForm.date_given);
        if (vaccineForm.certificate) data.append('certificate', vaccineForm.certificate);

        const res = await fetch(`${API}/cats/${catId}/vaccinations`, { method: 'POST', headers: authHeaders, body: data });
        const result = await res.json();
        if (!res.ok) return setError(result.error);

        setVaccineForm({ vaccine_name: '', date_given: '', certificate: null });
        setMsg('Vaccination added!');
        fetchVaccinations(catId);
    };

    const handleDeleteVaccination = async (catId, vaccinationId) => {
        const res = await fetch(`${API}/vaccinations/${vaccinationId}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Vaccination deleted!');
        fetchVaccinations(catId);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Cats</h2>
                {!showForm && <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>Add Cat</button>}
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
                            <option value="">Select breed</option>
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

            {cats.length === 0 && !showForm && <p className="card">No cats yet. Add your first cat.</p>}

            {cats.map(cat => (
                <div className="card" key={cat.id}>
                    <h3>{cat.name}</h3>
                    <p><strong>Breed:</strong> {cat.breed_name || '-'}</p>
                    <p><strong>Gender:</strong> {cat.gender}</p>
                    <p><strong>Birth Date:</strong> {cat.birth_date ? cat.birth_date.split('T')[0] : '-'}</p>
                    <p><strong>Color:</strong> {cat.color || '-'}</p>
                    {cat.description && <p><strong>Description:</strong> {cat.description}</p>}
                    <div className="actions">
                        <button className="btn-primary" onClick={() => handleEdit(cat)}>Edit</button>
                        <button className="btn-danger" onClick={() => handleDelete(cat.id)}>Delete</button>
                    </div>

                    <hr style={{ margin: '16px 0' }} />
                    <h4>Photos</h4>
                    <input type="file" accept="image/jpeg,image/png" onChange={e => handlePhotoUpload(cat.id, e.target.files[0])} />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        {(photos[cat.id] || []).map(photo => (
                            <div key={photo.id} style={{ width: 120 }}>
                                <img src={`${SERVER}${photo.photo_url}`} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 4 }} />
                                {photo.is_primary ? <p className="success">Primary</p> : <button className="btn-secondary" onClick={() => handleSetPrimary(cat.id, photo.id)}>Set Primary</button>}
                                <button className="btn-danger" onClick={() => handleDeletePhoto(cat.id, photo.id)} style={{ marginTop: 4 }}>Delete</button>
                            </div>
                        ))}
                    </div>

                    <hr style={{ margin: '16px 0' }} />
                    <h4>Vaccinations</h4>
                    <form onSubmit={e => handleAddVaccination(e, cat.id)}>
                        <div className="form-group">
                            <label>Vaccine Name</label>
                            <input value={vaccineForm.vaccine_name} onChange={e => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Date Given</label>
                            <input type="date" value={vaccineForm.date_given} onChange={e => setVaccineForm({ ...vaccineForm, date_given: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Certificate (JPG, PNG, PDF)</label>
                            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setVaccineForm({ ...vaccineForm, certificate: e.target.files[0] })} />
                        </div>
                        <button className="btn-primary" type="submit">Add Vaccination</button>
                    </form>
                    {(vaccinations[cat.id] || []).map(v => (
                        <div key={v.id} style={{ marginTop: 8 }}>
                            <p><strong>{v.vaccine_name}</strong> {v.date_given ? v.date_given.split('T')[0] : ''}</p>
                            {v.certificate_url && <a href={`${SERVER}${v.certificate_url}`} target="_blank">View certificate</a>}
                            <div><button className="btn-danger" onClick={() => handleDeleteVaccination(cat.id, v.id)}>Delete</button></div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Cats;
