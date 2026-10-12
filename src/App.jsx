import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AdminPage from './pages/AdminPage'
import ClientPage from './pages/ClientPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/client" element={<ClientPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
