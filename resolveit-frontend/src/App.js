import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ComplaintForm from "./pages/ComplaintForm";
import Success from "./pages/Success";
import ComplaintStatusPage from "./pages/ComplaintStatusPage";
import AuthProvider from "./context/AuthContext";
import TrackComplaint from "./pages/TrackComplaint";
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminRoute from './components/AdminRoute';
import UserDashboard from './pages/UserDashboard';
import RegisterSelect from './pages/RegisterSelect';
import EscalationPage from './pages/EscalationPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-select" element={<RegisterSelect />} />
        <Route path="/complaint" element={<ComplaintForm />} />
        <Route path="/success/:id" element={<Success />} />
        <Route path="/complaints/:id/status" element={<ComplaintStatusPage />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
        {/* USER DASHBOARD */}
        <Route path="/dashboard" element={<UserDashboard />} />
        {/* STAFF DASHBOARD */}
        <Route path="/staff" element={<StaffDashboard />} />
        {/* MANAGER DASHBOARD */}
        <Route path="/manager" element={<StaffDashboard />} />
        {/* ESCALATION PAGE - ADMIN ONLY */}
        <Route path="/escalations" element={
          <AdminRoute>
            <EscalationPage />
          </AdminRoute>
        } />
        {/* ADMIN DASHBOARD - ADMIN ONLY */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}
