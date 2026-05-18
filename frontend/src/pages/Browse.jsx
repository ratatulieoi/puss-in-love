import { useState, useEffect } from 'react';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Browse({ token }) {
    const [cats, setCats] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [filters, setFilters] = useState({ search: '', breed_id: '', gender: '', location: '' });
    const [error, setError] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers });
        const data = await res.json();
        setBreeds(data.data);
    };

    const fetchCats = async () => {
        setError('');
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.breed_id) params.append('breed_id', filters.breed_id);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.location) params.append('location', filters.location);

        const res = await fetch(`${API}/cats/browse?${params.toString()}`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setCats(data.data);
    };

    useEffect(() => {
        fetchBreeds();
        fetchCats();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchCats();
    };

    const clearFilters = () => {
        setFilters({ search: '', breed_id: '', gender: '', location: '' });
        setTimeout(fetchCats, 0);
    };

    return (
        <div>
            <h2>Browse Cats and Owners</h2>
            {error && <p className="error">{error}</p>}

            <form className="card" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Search cat or owner name</label>
                    <input value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Breed</label>
                    <select value={filters.breed_id} onChange={e => setFilters({ ...filters, breed_id: e.target.value })}>
                        <option value="">All breeds</option>
                        {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <select value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
                        <option value="">Any gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Owner Location</label>
                    <input value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
                </div>
                <div className="actions">
                    <button className="btn-primary" type="submit">Search</button>
                    <button className="btn-secondary" type="button" onClick={clearFilters}>Clear</button>
                </div>
            </form>

            {cats.length === 0 && <p className="card">No cats found.</p>}

            {cats.map(cat => (
                <div className="card" key={cat.id}>
                    {cat.primary_photo && (
                        <img src={`${SERVER}${cat.primary_photo}`} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    )}
                    <h3>{cat.name}</h3>
                    <p><strong>Breed:</strong> {cat.breed_name || '-'}</p>
                    <p><strong>Gender:</strong> {cat.gender}</p>
                    <p><strong>Color:</strong> {cat.color || '-'}</p>
                    <p><strong>Owner:</strong> {cat.owner_name || '-'}</p>
                    <p><strong>Location:</strong> {cat.location || '-'}</p>
                    {cat.description && <p><strong>Description:</strong> {cat.description}</p>}
                </div>
            ))}
        </div>
    );
}

export default Browse;
