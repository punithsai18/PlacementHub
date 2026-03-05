import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';

const styles = {
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#0078d4' },
  search: { display: 'flex', gap: '8px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
  btn: { padding: '10px 20px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  jobTitle: { fontSize: '18px', fontWeight: '600', color: '#0078d4', marginBottom: '4px' },
  company: { fontSize: '14px', color: '#666', marginBottom: '8px' },
  detail: { fontSize: '13px', color: '#555', marginBottom: '4px' },
  skillTag: { display: 'inline-block', background: '#f0f6ff', color: '#0078d4', border: '1px solid #0078d4', padding: '2px 8px', borderRadius: '12px', margin: '2px', fontSize: '12px' },
  applyBtn: { padding: '8px 20px', background: '#107c10', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  appliedBadge: { padding: '8px 20px', background: '#dff6dd', color: '#107c10', borderRadius: '4px', fontWeight: '600', fontSize: '13px' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  empty: { textAlign: 'center', padding: '40px', color: '#666', background: '#fff', borderRadius: '8px' }
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState({});
  const [applied, setApplied] = useState({});
  const [error, setError] = useState('');

  async function loadJobs(searchText = '') {
    setLoading(true);
    try {
      const { data } = await studentApi.getJobs(searchText ? { search: searchText } : {});
      setJobs(data);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, []);

  async function handleApply(jobId) {
    setApplying(prev => ({ ...prev, [jobId]: true }));
    try {
      await studentApi.applyJob(jobId);
      setApplied(prev => ({ ...prev, [jobId]: true }));
    } catch (err) {
      const msg = err.response?.data?.error || 'Application failed.';
      if (msg.includes('Already applied')) {
        setApplied(prev => ({ ...prev, [jobId]: true }));
      } else {
        alert(msg);
      }
    } finally {
      setApplying(prev => ({ ...prev, [jobId]: false }));
    }
  }

  return (
    <div>
      <h2 style={styles.title}>🔍 Browse Jobs</h2>
      <div style={styles.search}>
        <input style={styles.input} placeholder="Search by title, skills, company..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadJobs(search)} />
        <button style={styles.btn} onClick={() => loadJobs(search)}>Search</button>
        <button style={{ ...styles.btn, background: '#666' }} onClick={() => { setSearch(''); loadJobs(); }}>Clear</button>
      </div>
      {error && <div style={{ color: '#d13438', marginBottom: '12px' }}>{error}</div>}
      {loading ? (
        <div style={styles.loading}>Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div style={styles.empty}>No jobs found. Try a different search term.</div>
      ) : (
        jobs.map(job => (
          <div key={job.id} style={styles.card}>
            <div style={{ flex: 1 }}>
              <div style={styles.jobTitle}>{job.title}</div>
              <div style={styles.company}>🏢 {job.companyName}</div>
              {job.location && <div style={styles.detail}>📍 {job.location}</div>}
              {job.salary && <div style={styles.detail}>💰 {job.salary}</div>}
              {job.deadline && <div style={styles.detail}>⏰ Deadline: {new Date(job.deadline).toLocaleDateString()}</div>}
              <div style={{ margin: '8px 0', fontSize: '13px', color: '#555' }}>{job.description?.substring(0, 150)}{job.description?.length > 150 ? '...' : ''}</div>
              {job.skills && (
                <div>
                  {job.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                    <span key={s} style={styles.skillTag}>{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginLeft: '16px' }}>
              {applied[job.id] ? (
                <span style={styles.appliedBadge}>✅ Applied</span>
              ) : (
                <button style={styles.applyBtn} onClick={() => handleApply(job.id)} disabled={applying[job.id]}>
                  {applying[job.id] ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
