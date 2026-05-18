import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Cats from './pages/Cats.jsx';
import Browse from './pages/Browse.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    const handleLogin = (t) => {
        localStorage.setItem('token', t);
        setToken(t);
        navigate('/cats');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
    };

    return (
        <>
            <nav>
                <div>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>PussInLove</span>
                    {token && (
                        <>
                            <Link to="/profile">Profile</Link>
                            <Link to="/cats">My Cats</Link>
                            <Link to="/browse">Browse</Link>
                            <Link to="/matches">Matches</Link>
                        </>
                    )}
                </div>
                <div>
                    {token ? (
                        <button onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>
            <div className="container" style={{ marginTop: 20 }}>
                <Routes>
                    <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/cats" />} />
                    <Route path="/register" element={!token ? <Register /> : <Navigate to="/cats" />} />
                    <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
                    <Route path="/cats" element={token ? <Cats token={token} /> : <Navigate to="/login" />} />
                    <Route path="/browse" element={token ? <Browse token={token} /> : <Navigate to="/login" />} />
                    <Route path="/matches" element={token ? <Matches token={token} /> : <Navigate to="/login" />} />
                    <Route path="/chat/:matchId" element={token ? <Chat token={token} /> : <Navigate to="/login" />} />
                    <Route path="*" element={<Navigate to={token ? '/cats' : '/login'} />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
