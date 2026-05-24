import { useState, useEffect, useMemo } from 'react';
import '../styles/Browse.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Browse({ token }) {
    const [cats, setCats] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [filters, setFilters] = useState({ search: '', breed_id: '', gender: '', location: '' });
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers });
        const data = await res.json();
        if (data.data) setBreeds(data.data);
    };

    useEffect(() => { fetchBreeds(); }, []);

    const fetchCats = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.breed_id) params.append('breed_id', filters.breed_id);
        if (filters.gender) params.append('gender', filters.gender);
        if (filters.location) params.append('location', filters.location);

        try {
            const res = await fetch(`${API}/cats/browse?${params.toString()}`, { headers });
            const data = await res.json();
            if (!res.ok) return setError(data.error);
            setCats(data.data);
            setSearched(true);
        } catch {
            setError('Failed to fetch cats');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ search: '', breed_id: '', gender: '', location: '' });
        setCats([]);
        setSearched(false);
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <main className="browse-page">
            {error && <div className="app-toast app-toast--error">{error}</div>}

            <div className="browse-shell">
                <aside className="browse-sidebar">
                    <h1 className="browse-title">Browse Cats</h1>
                    <p className="browse-subtitle">Search cats and owners by name, breed, gender, or location.</p>

                    <form className="browse-filters" onSubmit={fetchCats}>
                        <label className="browse-field">
                            <span>Name or Owner</span>
                            <input
                                type="text"
                                placeholder="e.g. Luna, Jakarta…"
                                value={filters.search}
                                onChange={e => updateFilter('search', e.target.value)}
                            />
                        </label>

                        <label className="browse-field">
                            <span>Breed</span>
                            <select value={filters.breed_id} onChange={e => updateFilter('breed_id', e.target.value)}>
                                <option value="">All breeds</option>
                                {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </label>

                        <label className="browse-field">
                            <span>Gender</span>
                            <select value={filters.gender} onChange={e => updateFilter('gender', e.target.value)}>
                                <option value="">Any</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="unknown">Unknown</option>
                            </select>
                        </label>

                        <label className="browse-field">
                            <span>Location</span>
                            <input
                                type="text"
                                placeholder="e.g. Bandung…"
                                value={filters.location}
                                onChange={e => updateFilter('location', e.target.value)}
                            />
                        </label>

                        <div className="browse-actions">
                            <button className="browse-btn browse-btn--primary" type="submit" disabled={loading}>
                                {loading ? 'Searching…' : 'Search'}
                            </button>
                            {searched && (
                                <button className="browse-btn browse-btn--ghost" type="button" onClick={clearFilters}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>
                </aside>

                <section className="browse-results">
                    {!searched && (
                        <div className="browse-empty">

                            <h2>Find your match</h2>
                            <p>Use the filters to discover cats and their owners.</p>
                        </div>
                    )}

                    {searched && cats.length === 0 && !loading && (
                        <div className="browse-empty">

                            <h2>No cats found</h2>
                            <p>Try adjusting your search filters.</p>
                        </div>
                    )}

                    {searched && cats.length > 0 && (
                        <div className="browse-grid">
                            {cats.map(cat => (
                                <article key={cat.id} className={`browse-card${cat.is_owner ? ' browse-card--own' : ''}`}>
                                    {!!cat.is_owner && <span className="browse-badge">Your cat</span>}
                                    <div className="browse-card-photo">
                                        {cat.primary_photo ? (
                                            <img src={`${SERVER}${cat.primary_photo}`} alt={cat.name} />
                                        ) : (
                                            <div className="browse-card-photo-empty">{cat.name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="browse-card-body">
                                        <h3 className="browse-card-name">{cat.name}</h3>
                                        <div className="browse-card-meta">
                                            {[cat.breed_name, cat.gender, cat.location].filter(Boolean).join(' · ')}
                                        </div>
                                        {cat.description && (
                                            <p className="browse-card-desc">{cat.description}</p>
                                        )}
                                        <div className="browse-card-owner">
                                            <span>by {cat.owner_name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Browse;