import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const styles = {
  nav: { backgroundColor: '#0078d4', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' },
  brand: { color: '#fff', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' },
  links: { display: 'flex', gap: '16px', alignItems: 'center' },
  link: { color: '#fff', textDecoration: 'none', fontSize: '14px', padding: '6px 12px', borderRadius: '4px', transition: 'background 0.2s' },
  btn: { color: '#0078d4', background: '#fff', textDecoration: 'none', fontSize: '14px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', border: 'none', fontWeight: '600' }
};

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  function handleLogout() {
    localStorage.clear();
    navigate('/student/login');
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🎓 PlacementHub</Link>
      <div style={styles.links}>
        {!token && (
          <>
            <Link to="/student/login" style={styles.link}>Student Login</Link>
            <Link to="/student/register" style={styles.link}>Register</Link>
            <Link to="/company/login" style={styles.link}>Company Login</Link>
          </>
        )}
        {token && role === 'student' && (
          <>
            <Link to="/student/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/student/jobs" style={styles.link}>Jobs</Link>
            <Link to="/student/applications" style={styles.link}>Applications</Link>
            <Link to="/student/resume" style={styles.link}>Resume</Link>
            <Link to="/chat" style={styles.link}>Chat</Link>
          </>
        )}
        {token && role === 'company' && (
          <>
            <Link to="/company/dashboard" style={styles.link}>Dashboard</Link>
            <Link to="/company/post-job" style={styles.link}>Post Job</Link>
            <Link to="/chat" style={styles.link}>Chat</Link>
          </>
        )}
        {token && (
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        )}
      </div>
    </nav>
  );
}
