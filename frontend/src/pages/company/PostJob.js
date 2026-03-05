import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../services/api';

const styles = {
  container: { maxWidth: '640px', margin: '0 auto' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4' },
  card: { background: '#fff', borderRadius: '8px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  field: { marginBottom: '18px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '500', color: '#333' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', outline: 'none' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minHeight: '120px', resize: 'vertical', outline: 'none' },
  btn: { padding: '12px 28px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  success: { background: '#dff6dd', color: '#107c10', padding: '12px', borderRadius: '4px', marginBottom: '16px' },
  error: { background: '#fde7e9', color: '#d13438', padding: '12px', borderRadius: '4px', marginBottom: '16px' },
  hint: { fontSize: '12px', color: '#888', marginTop: '4px' }
};

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '', salary: '', skills: '', deadline: '', openings: 1
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = { ...form, openings: parseInt(form.openings) || 1 };
      await companyApi.postJob(payload);
      setSuccess('Job posted successfully!');
      setTimeout(() => navigate('/company/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post job.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📝 Post a New Job</h2>
      <div style={styles.card}>
        {success && <div style={styles.success}>✅ {success}</div>}
        {error && <div style={styles.error}>❌ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Job Title *</label>
            <input style={styles.input} name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Software Engineer - Full Stack" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Job Description *</label>
            <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} required placeholder="Describe the role, responsibilities, and requirements..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input style={styles.input} name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bangalore, Remote" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Salary / Package</label>
              <input style={styles.input} name="salary" value={form.salary} onChange={handleChange} placeholder="e.g. 8-12 LPA" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Number of Openings</label>
              <input style={styles.input} type="number" name="openings" value={form.openings} onChange={handleChange} min="1" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Application Deadline</label>
              <input style={styles.input} type="date" name="deadline" value={form.deadline} onChange={handleChange} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Required Skills</label>
            <input style={styles.input} name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. React, Node.js, SQL, Azure" />
            <div style={styles.hint}>Comma-separated list of skills</div>
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Posting...' : '🚀 Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
