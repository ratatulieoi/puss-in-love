import { useState, useEffect, useMemo } from 'react';
import '../styles/Browse.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';
const SELECTED_CAT_KEY = 'lastSwipeOwnerCatId';

function Browse({ token }) {
    const savedOwnerCatId = localStorage.getItem(SELECTED_CAT_KEY) || '';
    const [cats, setCats] = useState([]);
    const [myCats, setMyCats] = useState([]);
    const [ownerCatId, setOwnerCatId] = useState(savedOwnerCatId);
    const [breeds, setBreeds] = useState([]);
    const [filters, setFilters] = useState({ search: '', breed_id: '', gender: '', location: '' });
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [likingId, setLikingId] = useState(null);
    const [reportingId, setReportingId] = useState(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);
    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

    const fetchMyCats = async () => {
        try {
            const res = await fetch(`${API}/cats`, { headers });
            const data = await res.json();
            if (!res.ok) return setError(data.error);

            const list = data.data || [];
            setMyCats(list);

            const savedCat = list.find(cat => String(cat.id) === String(savedOwnerCatId));
            if (savedCat) {
                setOwnerCatId(savedCat.id);
            } else if (list.length > 0) {
                setOwnerCatId(list[0].id);
                localStorage.setItem(SELECTED_CAT_KEY, list[0].id);
            } else {
                setOwnerCatId('');
                localStorage.removeItem(SELECTED_CAT_KEY);
            }
        } catch {
            setError('Failed to fetch your cats');
        }
    };

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers });
        const data = await res.json();
        if (data.data) setBreeds(data.data);
    };

    useEffect(() => { fetchBreeds(); fetchMyCats(); }, []);

    const fetchCats = async (e, selectedOwnerCatId = ownerCatId) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const params = new URLSearchParams();
        if (selectedOwnerCatId) params.append('owner_cat_id', selectedOwnerCatId);
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

    const handleOwnerCatChange = (value) => {
        setOwnerCatId(value);
        if (value) {
            localStorage.setItem(SELECTED_CAT_KEY, value);
        } else {
            localStorage.removeItem(SELECTED_CAT_KEY);
        }
        if (searched) fetchCats(null, value);
    };

    const reportCat = async (cat) => {
        if (!confirm(`Report ${cat.name}?`)) return;

        setMsg('');
        setError('');
        setReportingId(cat.id);

        try {
            const res = await fetch(`${API}/reports`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ target_cat_id: cat.id })
            });
            const data = await res.json();

            if (!res.ok) return setError(data.error);

            setCats(prev => prev.map(item => (
                item.id === cat.id ? { ...item, has_reported: 1 } : item
            )));
            setMsg(`${cat.name} reported`);
        } catch {
            setError('Failed to report cat');
        } finally {
            setReportingId(null);
        }
    };

    const likeCat = async (cat) => {
        if (!ownerCatId || likingId) return;

        setMsg('');
        setError('');
        setLikingId(cat.id);

        try {
            const res = await fetch(`${API}/swipes`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    owner_cat_id: Number(ownerCatId),
                    target_cat_id: cat.id,
                    direction: 'like'
                })
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setCats(prev => prev.map(item => (
                        item.id === cat.id ? { ...item, swipe_direction: 'like' } : item
                    )));
                }
                return setError(data.error);
            }

            setCats(prev => prev.map(item => (
                item.id === cat.id
                    ? { ...item, swipe_direction: 'like', active_match_id: data.isMatch ? data.matchId : item.active_match_id }
                    : item
            )));
            setMsg(data.isMatch ? `It's a Match with ${cat.name}!` : `${cat.name} liked`);
        } catch {
            setError('Failed to like cat');
        } finally {
            setLikingId(null);
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
            {msg && <div className="app-toast app-toast--success">{msg}</div>}
            {error && <div className="app-toast app-toast--error">{error}</div>}

            <div className="browse-shell">
                <aside className="browse-sidebar">
                    <h1 className="browse-title">Browse Cats</h1>
                    <p className="browse-subtitle">Search cats and owners by name, breed, gender, or location.</p>

                    <label className="browse-field browse-owner-field">
                        <span>Like as</span>
                        {myCats.length > 0 ? (
                            <select value={ownerCatId} onChange={e => handleOwnerCatChange(e.target.value)}>
                                {myCats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        ) : (
                            <div className="browse-owner-empty">Add a cat before liking others.</div>
                        )}
                    </label>

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
                                    {!!cat.active_match_id && <span className="browse-badge browse-badge--match">Matched</span>}
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
                                        <div className="browse-card-actions">
                                            <button
                                                type="button"
                                                className={`browse-like-btn${cat.active_match_id ? ' is-matched' : ''}${cat.swipe_direction ? ' is-used' : ''}`}
                                                disabled={!!cat.is_owner || !ownerCatId || likingId === cat.id || !!cat.swipe_direction || !!cat.active_match_id}
                                                onClick={() => likeCat(cat)}
                                            >
                                                {cat.is_owner
                                                    ? 'Your cat'
                                                    : cat.active_match_id
                                                        ? 'Matched'
                                                        : cat.swipe_direction === 'like'
                                                            ? 'Liked'
                                                            : cat.swipe_direction === 'pass'
                                                                ? 'Passed'
                                                                : likingId === cat.id
                                                                    ? 'Liking...'
                                                                    : 'Like'}
                                            </button>
                                            {!cat.is_owner && (
                                                <button
                                                    type="button"
                                                    className={`browse-report-btn${cat.has_reported ? ' is-reported' : ''}`}
                                                    disabled={!!cat.has_reported || reportingId === cat.id}
                                                    onClick={() => reportCat(cat)}
                                                >
                                                    {cat.has_reported ? 'Reported' : reportingId === cat.id ? '…' : 'Report'}
                                                </button>
                                            )}
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
