import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Matches.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Matches({ token }) {
    const [matches, setMatches] = useState([]);
    const [liked, setLiked] = useState([]);
    const [tab, setTab] = useState('matches');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

    const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

    const fetchMatches = async () => {
        const res = await fetch(`${API}/matches`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMatches(data.data);
        setLiked(data.liked || []);
    };

    useEffect(() => { fetchMatches(); }, []);

    const handleUnmatch = async (id) => {
        if (!confirm('Unmatch? Chat history will be hidden.')) return;
        const res = await fetch(`${API}/matches/${id}/unmatch`, { method: 'PUT', headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Unmatched');
        fetchMatches();
    };

    const handleUnlike = async (id) => {
        if (!confirm('Remove this pending like?')) return;
        const res = await fetch(`${API}/swipes/${id}/unlike`, { method: 'DELETE', headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Like removed');
        fetchMatches();
    };

    const formatMeta = (cat) => {
        const parts = [];
        if (cat.breed_name) parts.push(cat.breed_name);
        if (cat.gender && cat.gender !== 'unknown') parts.push(cat.gender);
        return parts.join(' · ');
    };

    return (
        <main className="matches-page">
            {msg && <div className="app-toast app-toast--success">{msg}</div>}
            {error && <div className="app-toast app-toast--error">{error}</div>}

            <div className="matches-tabs">
                <button className={`matches-tab${tab === 'matches' ? ' is-active' : ''}`} onClick={() => setTab('matches')}>
                    Matches{matches.length > 0 ? ` (${matches.length})` : ''}
                </button>
                <button className={`matches-tab${tab === 'liked' ? ' is-active' : ''}`} onClick={() => setTab('liked')}>
                    Sent Likes{liked.length > 0 ? ` (${liked.length})` : ''}
                </button>
            </div>

            {tab === 'matches' && (
                <section className="matches-section">
                    {matches.length === 0 ? (
                        <div className="matches-empty">

                            <h2>No matches yet</h2>
                            <p>When both cats like each other, they'll appear here.</p>
                        </div>
                    ) : (
                        <div className="matches-grid">
                            {matches.map(match => (
                                <article key={match.id} className="matches-card">
                                    <div className="matches-pair">
                                        <div className="matches-pair-cat">
                                            {match.cat_a_photo ? (
                                                <img src={`${SERVER}${match.cat_a_photo}`} alt={match.cat_a_name} />
                                            ) : (
                                                <div className="matches-pair-empty">{match.cat_a_name.charAt(0)}</div>
                                            )}
                                            <span className="matches-pair-name">{match.cat_a_name}</span>
                                        </div>
                                        <span className="matches-pair-heart">♥</span>
                                        <div className="matches-pair-cat">
                                            {match.cat_b_photo ? (
                                                <img src={`${SERVER}${match.cat_b_photo}`} alt={match.cat_b_name} />
                                            ) : (
                                                <div className="matches-pair-empty">{match.cat_b_name.charAt(0)}</div>
                                            )}
                                            <span className="matches-pair-name">{match.cat_b_name}</span>
                                        </div>
                                    </div>
                                    <div className="matches-card-info">
                                        <span className="matches-card-owners">{match.user_a_name} & {match.user_b_name}</span>
                                        <span className="matches-card-date">{new Date(match.matched_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="matches-card-actions">
                                        <Link to={`/chat/${match.id}`} className="matches-btn matches-btn--chat">Chat</Link>
                                        <button className="matches-btn matches-btn--unmatch" onClick={() => handleUnmatch(match.id)}>Unmatch</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {tab === 'liked' && (
                <section className="matches-section">
                    {liked.length === 0 ? (
                        <div className="matches-empty">

                            <h2>No sent likes</h2>
                            <p>Cats you've liked that haven't liked you back yet.</p>
                        </div>
                    ) : (
                        <div className="matches-grid">
                            {liked.map(item => (
                                <article key={item.id} className="matches-card">
                                    <div className="matches-liked-photo">
                                        {item.target_photo ? (
                                            <img src={`${SERVER}${item.target_photo}`} alt={item.target_cat_name} />
                                        ) : (
                                            <div className="matches-pair-empty">{item.target_cat_name.charAt(0)}</div>
                                        )}
                                    </div>
                                    <div className="matches-card-body">
                                        <h3 className="matches-card-name">{item.target_cat_name}</h3>
                                        <div className="matches-card-meta">
                                            {item.target_breed_name || 'Unknown breed'}
                                        </div>
                                        <div className="matches-card-owner">
                                            by {item.target_owner_name}{item.target_owner_location ? ` · ${item.target_owner_location}` : ''}
                                        </div>
                                        <div className="matches-card-from">
                                            Liked by {item.owner_cat_name} · {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="matches-card-actions matches-card-actions--liked">
                                        <button className="matches-btn matches-btn--unlike" onClick={() => handleUnlike(item.id)}>Unlike</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default Matches;