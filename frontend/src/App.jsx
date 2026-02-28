import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MatchDetails from './pages/MatchDetails';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const refreshUser = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:8081/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      Cookies.set('user', JSON.stringify(res.data), { expires: 7 });
    } catch (err) {
      // token expired or invalid
    }
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      refreshUser(); // fetch latest from server
    }
  }, [refreshUser]);

  const login = (userData, token) => {
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} />

        <main className="content">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register login={login} /> : <Navigate to="/" />} />

            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/match/:id" element={isAuthenticated ? <MatchDetails user={user} /> : <Navigate to="/login" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={isAuthenticated ? <AdminPanel user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
