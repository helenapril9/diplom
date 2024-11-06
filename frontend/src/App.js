import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminAuth from './components/Admin/AdminAuth';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminUserDetails from './components/Admin/AdminUserDetails';
import Welcome from './components/Welcome';
import './App.css';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/auth" element={<AdminAuth />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
                    <Route path="/" element={<Welcome />} />
                </Routes>
            </div>
        </Router>
    );
}
export default App;
