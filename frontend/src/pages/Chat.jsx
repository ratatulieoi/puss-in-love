import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/Chat.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';

function Chat({ token }) {
    const { matchId } = useParams();
    const [match, setMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const bottomRef = useRef(null);
    const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token]);

    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);

    const userId = useMemo(() => {
        try { return JSON.parse(atob(token.split('.')[1])).userId; } catch { return null; }
    }, [token]);

    const fetchMatch = async () => {
        const res = await fetch(`${API}/matches/${matchId}`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMatch(data.data);
    };

    const fetchMessages = async () => {
        const res = await fetch(`${API}/messages/${matchId}`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMessages(data.data);
        await fetch(`${API}/messages/${matchId}/read`, { method: 'PUT', headers });
    };

    useEffect(() => {
        fetchMatch();
        fetchMessages();
        const interval = setInterval(fetchMessages, 4000);
        return () => clearInterval(interval);
    }, [matchId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;

        const res = await fetch(`${API}/messages/${matchId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content: trimmed })
        });

        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setContent('');
        fetchMessages();
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 0) return time;
        if (diffDays === 1) return `Yesterday ${time}`;
        return d.toLocaleDateString([], { day: 'numeric', month: 'short' }) + ' ' + time;
    };

    const partner = useMemo(() => {
        if (!match || !userId) return null;
        const isUserA = String(match.user_a_id) === String(userId);
        return {
            name: isUserA ? match.user_b_name : match.user_a_name,
            catName: isUserA ? match.cat_b_name : match.cat_a_name,
            photo: isUserA ? match.cat_b_photo : match.cat_a_photo
        };
    }, [match, userId]);

    const myCatName = useMemo(() => {
        if (!match || !userId) return '';
        const isUserA = String(match.user_a_id) === String(userId);
        return isUserA ? match.cat_a_name : match.cat_b_name;
    }, [match, userId]);

    return (
        <main className="chat-page">
            {error && <div className="app-toast app-toast--error">{error}</div>}

            <header className="chat-header">
                <Link to="/matches" className="chat-back" aria-label="Back to matches"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg></Link>
                {partner && (
                    <div className="chat-header-info">
                        <div className="chat-avatar">
                            {partner.photo ? (
                                <img src={`${SERVER}${partner.photo}`} alt={partner.catName} />
                            ) : (
                                <span>{partner.catName.charAt(0)}</span>
                            )}
                        </div>
                        <div className="chat-header-text">
                            <span className="chat-header-name">{partner.catName}</span>
                            <span className="chat-header-owner">by {partner.name}</span>
                        </div>
                    </div>
                )}
            </header>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">

                        <p>Say hello to {partner?.catName || 'your match'}!</p>
                    </div>
                )}
                {messages.map(msg => {
                    const isMine = String(msg.sender_id) === String(userId);
                    return (
                        <div key={msg.id} className={`chat-bubble${isMine ? ' is-mine' : ''}`}>
                            {!isMine && <span className="chat-bubble-sender">{msg.sender_name}</span>}
                            <div className="chat-bubble-content">{msg.content}</div>
                            <span className="chat-bubble-time">{formatTime(msg.created_at)}</span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form className="chat-input-bar" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder={`Message as ${myCatName || '…'}…`}
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="chat-input"
                />
                <button type="submit" className="chat-send" disabled={!content.trim()}>Send</button>
            </form>
        </main>
    );
}

export default Chat;