import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateEstimate from './components/CreateEstimate';
import Profile from './components/Profile';
import History from './components/History';
import Layout from './components/Layout';
import Clients from './components/Clients';
import ClientDetails from './components/ClientDetails';

function AuthenticatedApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-estimate" element={<CreateEstimate />} />
        <Route path="/edit-estimate/:id" element={<CreateEstimate isEdit={true} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:name" element={<ClientDetails />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      {currentUser ? (
        <AuthenticatedApp />
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
