import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentRegister from './pages/student/Register';
import StudentLogin from './pages/student/Login';
import StudentDashboard from './pages/student/Dashboard';
import ResumeUpload from './pages/student/ResumeUpload';
import Jobs from './pages/student/Jobs';
import Applications from './pages/student/Applications';
import CompanyLogin from './pages/company/Login';
import CompanyDashboard from './pages/company/Dashboard';
import PostJob from './pages/company/PostJob';
import Applicants from './pages/company/Applicants';
import Chat from './pages/Chat';

const styles = {
  app: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '20px' }
};

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  if (!token) return <Navigate to={role === 'company' ? '/company/login' : '/student/login'} replace />;
  if (role && userRole !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Navigate to="/student/login" replace />} />

            {/* Student routes */}
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route path="/student/dashboard" element={
              <PrivateRoute role="student"><StudentDashboard /></PrivateRoute>
            } />
            <Route path="/student/resume" element={
              <PrivateRoute role="student"><ResumeUpload /></PrivateRoute>
            } />
            <Route path="/student/jobs" element={
              <PrivateRoute role="student"><Jobs /></PrivateRoute>
            } />
            <Route path="/student/applications" element={
              <PrivateRoute role="student"><Applications /></PrivateRoute>
            } />

            {/* Company routes */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/company/dashboard" element={
              <PrivateRoute role="company"><CompanyDashboard /></PrivateRoute>
            } />
            <Route path="/company/post-job" element={
              <PrivateRoute role="company"><PostJob /></PrivateRoute>
            } />
            <Route path="/company/applicants/:jobId" element={
              <PrivateRoute role="company"><Applicants /></PrivateRoute>
            } />

            {/* Chat */}
            <Route path="/chat" element={
              <PrivateRoute><Chat /></PrivateRoute>
            } />

            <Route path="*" element={<div style={{ textAlign: 'center', padding: '40px' }}><h2>404 - Page Not Found</h2></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
