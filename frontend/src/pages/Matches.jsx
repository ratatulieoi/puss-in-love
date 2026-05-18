import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Matches({ token }) {
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchMatches = async () => {
        const res = await fetch(`${API}/matches`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMatches(data.data);
    };

    useEffect(() => { fetchMatches(); }, []);

    const handleUnmatch = async (id) => {
        if (!confirm('Unmatch this cat? Chat will be hidden.')) return;
        const res = await fetch(`${API}/matches/${id}/unmatch`, { method: 'PUT', headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Unmatched');
        fetchMatches();
    };

    return (
        <div>
            <h2>My Matches</h2>
            {msg && <p className="success">{msg}</p>}
            {error && <p className="error">{error}</p>}
            {matches.length === 0 && <p className="card">No matches yet.</p>}

            {matches.map(match => (
                <div className="card" key={match.id}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {match.cat_a_photo && <img src={`${SERVER}${match.cat_a_photo}`} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 4 }} />}
                        {match.cat_b_photo && <img src={`${SERVER}${match.cat_b_photo}`} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 4 }} />}
                    </div>
                    <h3>{match.cat_a_name} and {match.cat_b_name}</h3>
                    <p><strong>Owners:</strong> {match.user_a_name} and {match.user_b_name}</p>
                    <p><strong>Matched at:</strong> {new Date(match.matched_at).toLocaleString()}</p>
                    <div className="actions">
                        <Link to={`/chat/${match.id}`}><button className="btn-primary">Open Chat</button></Link>
                        <button className="btn-danger" onClick={() => handleUnmatch(match.id)}>Unmatch</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Matches;
