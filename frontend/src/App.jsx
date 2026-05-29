import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Cats from './pages/Cats.jsx';
import Browse from './pages/Browse.jsx';
import Swipe from './pages/Swipe.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = (t) => {
        localStorage.setItem('token', t);
        setToken(t);
        navigate('/cats');
    };

    const handleAdminLogin = (t) => {
        localStorage.setItem('adminToken', t);
        setAdminToken(t);
        navigate('/admin');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        setToken(null);
        setAdminToken(null);
        navigate('/login');
    };

    const isLanding = location.pathname === '/';
    const isAuth = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin/login';
    const useLandingNav = isLanding || token || adminToken;
    const usesAppBackground = ['/browse', '/matches', '/admin'].includes(location.pathname);
    const isCatsPage = location.pathname === '/cats';
    const isSwipePage = location.pathname === '/swipe';
    const isFullPage = isCatsPage || isSwipePage;

    return (
        <>
            {!isAuth && <nav className={useLandingNav ? 'landing-nav' : ''}>
                <div>
                    <Link to="/" style={{ fontWeight: 700, fontSize: 18 }}>Puss In Love</Link>
                    {location.pathname === '/' && !token && (
                        <>
                            <a href="#how-it-works">How it works</a>
                            <a href="#features">Features</a>
                            <a href="#why">Why</a>
                        </>
                    )}
                    {token && (
                        <>
                            <Link to="/profile">Profile</Link>
                            <Link to="/cats">My Cats</Link>
                            <Link to="/browse">Browse</Link>
                            <Link to="/swipe">Swipe</Link>
                            <Link to="/matches">Matches</Link>
                        </>
                    )}
                    {adminToken && <Link to="/admin">Admin</Link>}
                </div>
                <div>
                    {token || adminToken ? (
                        <button onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>}
            <div className={isLanding ? 'landing-shell' : isAuth ? 'auth-shell' : isFullPage ? 'container' : usesAppBackground ? 'container app-bg-shell' : 'container'}>
                <Routes>
                    <Route path="/" element={<Landing isLoggedIn={!!token} />} />
                    <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/cats" />} />
                    <Route path="/register" element={!token ? <Register /> : <Navigate to="/cats" />} />
                    <Route path="/profile" element={token ? <Profile token={token} /> : <Navigate to="/login" />} />
                    <Route path="/cats" element={token ? <Cats token={token} /> : <Navigate to="/login" />} />
                    <Route path="/browse" element={token ? <Browse token={token} /> : <Navigate to="/login" />} />
                    <Route path="/swipe" element={token ? <Swipe token={token} /> : <Navigate to="/login" />} />
                    <Route path="/matches" element={token ? <Matches token={token} /> : <Navigate to="/login" />} />
                    <Route path="/chat/:matchId" element={token ? <Chat token={token} /> : <Navigate to="/login" />} />
                    <Route path="/admin/login" element={!adminToken ? <AdminLogin onLogin={handleAdminLogin} /> : <Navigate to="/admin" />} />
                    <Route path="/admin" element={adminToken ? <AdminDashboard token={adminToken} /> : <Navigate to="/admin/login" />} />
                    <Route path="*" element={<Navigate to={token ? '/cats' : '/'} />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
