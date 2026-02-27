import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MatchDetails from './pages/MatchDetails';
import Leaderboard from './pages/Leaderboard';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const userData = Cookies.get('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
