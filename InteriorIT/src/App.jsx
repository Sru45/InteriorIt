import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateEstimate from './components/CreateEstimate';
import Profile from './components/Profile';
import History from './components/History';
import Layout from './components/Layout';

function AuthenticatedApp({ setAuth }) {
  return (
    <Layout setAuth={setAuth}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-estimate" element={<CreateEstimate />} />
        <Route path="/edit-estimate/:id" element={<CreateEstimate isEdit={true} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) setIsAuthenticated(true);
    setIsAuthLoaded(true);
  }, []);

  if (!isAuthLoaded) return null; // Hold frame visually until Auth is scanned

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <AuthenticatedApp setAuth={setIsAuthenticated} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
