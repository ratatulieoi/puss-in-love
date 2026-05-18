import { useState, useEffect } from 'react';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Swipe({ token }) {
    const [myCats, setMyCats] = useState([]);
    const [ownerCatId, setOwnerCatId] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [index, setIndex] = useState(0);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchMyCats = async () => {
        const res = await fetch(`${API}/cats`, { headers });
        const data = await res.json();
        setMyCats(data.data);
        if (data.data.length > 0) setOwnerCatId(data.data[0].id);
    };

    const fetchCandidates = async (catId) => {
        if (!catId) return;
        setMsg('');
        setError('');
        setIndex(0);

        const res = await fetch(`${API}/swipes/browse?owner_cat_id=${catId}`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setCandidates(data.data);
    };

    useEffect(() => { fetchMyCats(); }, []);

    useEffect(() => {
        if (ownerCatId) fetchCandidates(ownerCatId);
    }, [ownerCatId]);

    const swipe = async (direction) => {
        const target = candidates[index];
        if (!target) return;

        const res = await fetch(`${API}/swipes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                owner_cat_id: Number(ownerCatId),
                target_cat_id: target.id,
                direction
            })
        });

        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setMsg(data.isMatch ? "It's a Match!" : `Swipe ${direction} saved`);
        setIndex(index + 1);
    };

    const current = candidates[index];

    return (
        <div>
            <h2>Swipe Cats</h2>
            {msg && <p className="success">{msg}</p>}
            {error && <p className="error">{error}</p>}

            {myCats.length === 0 ? (
                <p className="card">Add your own cat first before swiping.</p>
            ) : (
                <div className="card">
                    <div className="form-group">
                        <label>Swipe as</label>
                        <select value={ownerCatId} onChange={e => setOwnerCatId(e.target.value)}>
                            {myCats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <button className="btn-secondary" onClick={() => fetchCandidates(ownerCatId)}>Refresh Swipe Candidates</button>
                </div>
            )}

            {myCats.length > 0 && !current && (
                <p className="card">No more cats to swipe.</p>
            )}

            {current && (
                <div className="card">
                    {current.primary_photo && (
                        <img src={`${SERVER}${current.primary_photo}`} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                    )}
                    <h3>{current.name}</h3>
                    <p><strong>Breed:</strong> {current.breed_name || '-'}</p>
                    <p><strong>Gender:</strong> {current.gender}</p>
                    <p><strong>Color:</strong> {current.color || '-'}</p>
                    <p><strong>Owner:</strong> {current.owner_name || '-'}</p>
                    <p><strong>Location:</strong> {current.location || '-'}</p>
                    {current.description && <p><strong>Description:</strong> {current.description}</p>}
                    <div className="actions">
                        <button className="btn-secondary" onClick={() => swipe('pass')}>Pass</button>
                        <button className="btn-primary" onClick={() => swipe('like')}>Like</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Swipe;
