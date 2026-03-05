import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentApi } from '../../services/api';

const styles = {
  container: { maxWidth: '420px', margin: '60px auto', background: '#fff', borderRadius: '8px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4', textAlign: 'center' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  error: { background: '#fde7e9', color: '#d13438', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', course: '', graduationYear: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await studentApi.register({
        ...form,
        graduationYear: form.graduationYear ? parseInt(form.graduationYear) : undefined
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('userId', data.studentId);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Student Registration</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {[
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', required: true },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'course', label: 'Course / Degree', type: 'text' },
          { name: 'graduationYear', label: 'Graduation Year', type: 'number' }
        ].map(({ name, label, type, required }) => (
          <div key={name} style={styles.field}>
            <label style={styles.label}>{label}{required && ' *'}</label>
            <input
              style={styles.input}
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required={required}
              placeholder={label}
            />
          </div>
        ))}
        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div style={styles.link}>
        Already have an account? <Link to="/student/login">Login</Link>
      </div>
    </div>
  );
}
