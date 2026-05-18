import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const API = 'http://localhost:3100/api';

function Chat({ token }) {
    const { matchId } = useParams();
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    const fetchMessages = async () => {
        const res = await fetch(`${API}/messages/${matchId}`, { headers });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMessages(data.data);
        await fetch(`${API}/messages/${matchId}/read`, { method: 'PUT', headers });
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [matchId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        setError('');

        const res = await fetch(`${API}/messages/${matchId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ content })
        });

        const data = await res.json();
        if (!res.ok) return setError(data.error);

        setContent('');
        fetchMessages();
    };

    return (
        <div>
            <p><Link to="/matches">Back to matches</Link></p>
            <h2>Chat</h2>
            {error && <p className="error">{error}</p>}

            <div className="card" style={{ minHeight: 300, maxHeight: 420, overflowY: 'auto' }}>
                {messages.length === 0 && <p>No messages yet.</p>}
                {messages.map(msg => (
                    <div key={msg.id} style={{ marginBottom: 12 }}>
                        <p><strong>{msg.sender_name}</strong> <span style={{ fontSize: 12, color: '#777' }}>{new Date(msg.created_at).toLocaleString()}</span></p>
                        <p>{msg.content}</p>
                    </div>
                ))}
            </div>

            <form className="card" onSubmit={sendMessage}>
                <div className="form-group">
                    <label>Message</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <button className="btn-primary" type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chat;
