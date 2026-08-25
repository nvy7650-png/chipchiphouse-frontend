import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminGroups from './pages/AdminGroups';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* CLIENT */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/groups" element={<AdminGroups />} />

      </Routes>
    </BrowserRouter>
  );
}