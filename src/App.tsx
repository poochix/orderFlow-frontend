import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/lib/axios";
import { setCredentials, setLoading } from "@/features/auth/authSlice";

import { Toaster } from "sonner";

import LoginPage from "@/features/auth/LoginPage";
import ProtectedRoute from "@/features/auth/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminTeamPage from "./features/admin/AdminTeamPage";

export default function App() {
  const dispatch = useDispatch();

  // On initial load, verify if our HTTP-only cookie is still valid
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get("/auth/me"); // Assuming your backend has a route to return current user info
        dispatch(setCredentials(response.data.data));
      } catch (error) {
        // If it fails, the cookie is expired or missing. The ProtectedRoute will handle kicking them out.
        dispatch(setLoading(false));
      }
    };
    verifySession();
  }, [dispatch]);

  return (
      <>
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/team" element={<AdminTeamPage />} />

        {/* Protected Routes Wrapper */}
        <Route element={<ProtectedRoute />}>
          {/* Main Layout Wrapper */}
          <Route element={<DashboardLayout />}>
            
            {/* The individual pages rendered inside the Layout's <Outlet /> */}
            <Route path="/dashboard" element={<div>Analytics Dashboard (Coming Soon)</div>} />
            <Route path="/orders" element={<div>Shared Order Pool (Coming Soon)</div>} />
            <Route path="/ai-parse" element={<div>AI Ingestion Interface (Coming Soon)</div>} />
            
            {/* Default redirect for authenticated users */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
      <Toaster/>
      </>
  );
}