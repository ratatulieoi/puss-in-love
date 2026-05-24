import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../styles/Swipe.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Swipe({ token }) {
    const savedOwnerCatId = localStorage.getItem('lastSwipeOwnerCatId') || '';
    const [myCats, setMyCats] = useState([]);
    const [ownerCatId, setOwnerCatId] = useState(savedOwnerCatId);
    const [candidates, setCandidates] = useState([]);
    const [index, setIndex] = useState(0);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [exitDir, setExitDir] = useState(null);
    const [enterDir, setEnterDir] = useState(null);
    const [undoDir, setUndoDir] = useState(null);
    const [isSwiping, setIsSwiping] = useState(false);
    const [lastPass, setLastPass] = useState(null);
    const [photoIndex, setPhotoIndex] = useState({});
    const [photoFlip, setPhotoFlip] = useState({});
    const photoFlipTimerRef = useRef(null);
    const selectedCatRef = useRef('');

    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);
    useEffect(() => () => {
        if (photoFlipTimerRef.current) clearTimeout(photoFlipTimerRef.current);
    }, []);

    const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

    const fetchMyCats = async () => {
        const res = await fetch(`${API}/cats`, { headers });
        const data = await res.json();
        setMyCats(data.data);
        const savedCat = data.data.find(cat => String(cat.id) === String(savedOwnerCatId));
        if (savedCat) {
            setOwnerCatId(savedCat.id);
        } else if (data.data.length > 0) {
            setOwnerCatId(data.data[0].id);
            localStorage.setItem('lastSwipeOwnerCatId', data.data[0].id);
        }
    };

    const fetchCandidates = async (catId) => {
        if (!catId) return;
        selectedCatRef.current = String(catId);
        setMsg('');
        setError('');
        setIndex(0);
        setExitDir(null);
        setEnterDir(null);
        setUndoDir(null);
        setIsSwiping(false);
        setLastPass(null);
        setPhotoIndex({});
        setPhotoFlip({});
        if (photoFlipTimerRef.current) clearTimeout(photoFlipTimerRef.current);
        setCandidates([]);

        const res = await fetch(`${API}/swipes/browse?owner_cat_id=${catId}`, { headers });
        const data = await res.json();
        if (selectedCatRef.current !== String(catId)) return;
        if (!res.ok) return setError(data.error);
        setCandidates(data.data);
    };

    useEffect(() => { fetchMyCats(); }, []);

    useEffect(() => {
        if (ownerCatId) fetchCandidates(ownerCatId);
    }, [ownerCatId]);

    const resetSwipeHistory = async () => {
        if (!ownerCatId) return;

        const res = await fetch(`${API}/swipes/owner/${ownerCatId}`, {
            method: 'DELETE',
            headers
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        fetchCandidates(ownerCatId);
    };

    const undoPass = async () => {
        if (!lastPass || isSwiping) return;

        const res = await fetch(`${API}/swipes/${lastPass.swipeId}`, {
            method: 'DELETE',
            headers
        });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setIndex(lastPass.index);
        setUndoDir('left');
        setLastPass(null);
        setTimeout(() => setUndoDir(null), 1000);
    };

    const swipe = useCallback(async (direction) => {
        const target = candidates[index];
        if (!target || isSwiping) return;

        setIsSwiping(true);
        setLastPass(null);

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
        if (!res.ok) {
            setIsSwiping(false);
            return setError(data.error);
        }

        if (data.isMatch) setMsg("It's a Match!");
        if (direction === 'pass') setLastPass({ swipeId: data.swipeId, cat: target, index });

        setExitDir(direction === 'like' ? 'right' : 'left');
        setTimeout(() => {
            setExitDir(null);
            setEnterDir('next');
            setIndex(prev => prev + 1);
            setIsSwiping(false);
            setTimeout(() => setEnterDir(null), 350);
        }, 400);
    }, [candidates, index, ownerCatId, headers, isSwiping]);

    const cyclePhoto = (catId, total) => {
        if (photoFlip[catId]) return;

        const nextIndex = ((photoIndex[catId] ?? 0) + 1) % total;
        setPhotoFlip(prev => ({ ...prev, [catId]: 'out' }));

        if (photoFlipTimerRef.current) clearTimeout(photoFlipTimerRef.current);
        photoFlipTimerRef.current = setTimeout(() => {
            setPhotoIndex(prev => ({
                ...prev,
                [catId]: nextIndex
            }));
            setPhotoFlip(prev => ({ ...prev, [catId]: 'in' }));

            photoFlipTimerRef.current = setTimeout(() => {
                setPhotoFlip(prev => {
                    const next = { ...prev };
                    delete next[catId];
                    return next;
                });
            }, 360);
        }, 360);
    };

    const current = candidates[index];
    const isMatch = msg.includes('Match');

    const buildMeta = (cat) => {
        const parts = [];
        if (cat.breed_name) parts.push(cat.breed_name);
        if (cat.gender && cat.gender !== 'unknown') parts.push(cat.gender);
        if (cat.location) parts.push(cat.location);
        return parts.join(' · ') || 'Unknown breed';
    };

    return (
        <main className="swipe-page">
            {msg && <div className={`swipe-toast ${isMatch ? 'swipe-toast--match' : 'swipe-toast--ok'}`}>{msg}</div>}
            {error && <div className="swipe-toast swipe-toast--err">{error}</div>}

            {myCats.length === 0 ? (
                <div className="swipe-empty">
                    <h2>No cats yet</h2>
                    <p>Add your own cat profile first before you can start swiping.</p>
                </div>
            ) : (
                <>
                    <div className="swipe-selector">
                        <label>Swiping as</label>
                        <select value={ownerCatId} onChange={e => {
                            setOwnerCatId(e.target.value);
                            localStorage.setItem('lastSwipeOwnerCatId', e.target.value);
                        }}>
                            {myCats.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>

                    {!current && (
                        <div className="swipe-empty">
                            <h2>No more cats</h2>
                            <p>You've seen all available cats for now. Refresh to swipe them again.</p>
                            <button disabled={!lastPass || isSwiping} onClick={undoPass}>↩</button>
                            <button onClick={resetSwipeHistory}>Refresh</button>
                        </div>
                    )}

                    {current && (
                        <>
                            <div className="swipe-card-wrap">
                                <div
                                    className={`swipe-card ${exitDir === 'left' ? 'exit-left' : exitDir === 'right' ? 'exit-right' : ''} ${enterDir === 'next' ? 'enter-next' : ''} ${undoDir === 'left' ? 'undo-left' : ''} ${photoFlip[current.id] === 'out' ? 'card-flip-out' : ''} ${photoFlip[current.id] === 'in' ? 'card-flip-in' : ''}`}
                                >
                                    <div
                                        className={`swipe-card-photo${current.photos && current.photos.length > 1 ? ' has-gallery-cue' : ''}`}
                                        onClick={() => {
                                            if (current.photos && current.photos.length > 1) cyclePhoto(current.id, current.photos.length);
                                        }}
                                    >
                                        {current.photos && current.photos.length > 0 ? (
                                            <div className="swipe-card-photo-frame">
                                                <img
                                                    src={`${SERVER}${current.photos[photoIndex[current.id] ?? 0] || current.photos[0]}`}
                                                    alt={current.name}
                                                />
                                            </div>
                                        ) : (
                                            <div className="swipe-card-photo-empty">{current.name.charAt(0)}</div>
                                        )}
                                        {current.photos && current.photos.length > 1 && (
                                            <div className="swipe-photo-dots">
                                                {current.photos.map((_, i) => (
                                                    <span key={i} className={`swipe-photo-dot ${(photoIndex[current.id] ?? 0) === i ? 'is-active' : ''}`} />
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                    <div className="swipe-card-info">
                                        <div className="swipe-card-name">{current.name}</div>
                                        <div className="swipe-card-meta">{buildMeta(current)}</div>
                                        {current.description && (
                                            <div className="swipe-card-desc">"{current.description}"</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="swipe-actions">
                                <button className="swipe-btn undo" disabled={!lastPass || isSwiping} onClick={undoPass}>↩</button>
                                <button className="swipe-btn pass" disabled={isSwiping} onClick={() => swipe('pass')}>✕</button>
                                <button className="swipe-btn like" disabled={isSwiping} onClick={() => swipe('like')}>♥</button>
                            </div>

                            <div className="swipe-counter">
                                {index + 1} of {candidates.length} cats
                            </div>
                        </>
                    )}
                </>
            )}
        </main>
    );
}

export default Swipe;