import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { companyApi } from '../../services/api';

const styles = {
  container: { maxWidth: '420px', margin: '80px auto', background: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4', textAlign: 'center' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  btn: { width: '100%', padding: '12px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  error: { background: '#fde7e9', color: '#d13438', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }
};

export default function CompanyLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await companyApi.login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'company');
      localStorage.setItem('userId', data.company.id);
      localStorage.setItem('userName', data.company.name);
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🏢 Company Login</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.field}>
          <label style={styles.label}>Email *</label>
          <input style={styles.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="company@example.com" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password *</label>
          <input style={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
        </div>
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <div style={styles.link}>
        New company? <Link to="/company/register">Register here</Link>
      </div>
      <div style={{ ...styles.link, marginTop: '8px' }}>
        Are you a student? <Link to="/student/login">Student Login</Link>
      </div>
    </div>
  );
}
