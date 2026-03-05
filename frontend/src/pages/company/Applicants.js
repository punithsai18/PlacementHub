import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyApi } from '../../services/api';

const STATUS_OPTIONS = ['shortlisted', 'interview', 'offered', 'rejected', 'placed'];

const STATUS_COLORS = {
  applied:     '#0078d4',
  shortlisted: '#797700',
  interview:   '#107c10',
  offered:     '#038387',
  rejected:    '#d13438',
  placed:      '#107c10'
};

const styles = {
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  name: { fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '2px' },
  detail: { fontSize: '13px', color: '#666', marginBottom: '2px' },
  skillTag: { display: 'inline-block', background: '#f0f6ff', color: '#0078d4', border: '1px solid #c7dfff', padding: '2px 8px', borderRadius: '12px', margin: '2px', fontSize: '12px' },
  select: { padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', marginRight: '8px' },
  btn: { padding: '6px 14px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
  resumeLink: { fontSize: '13px', color: '#0078d4', textDecoration: 'none' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  empty: { textAlign: 'center', padding: '40px', color: '#666', background: '#fff', borderRadius: '8px' },
  backBtn: { padding: '8px 16px', background: '#605e5c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }
};

export default function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const { data } = await companyApi.getApplicants(jobId);
        setApplicants(data);
        const initStatus = {};
        data.forEach(a => { initStatus[a.applicationId] = a.status; });
        setSelectedStatus(initStatus);
      } catch (err) {
        console.error('Load applicants error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId]);

  async function handleUpdateStatus(appId) {
    const newStatus = selectedStatus[appId];
    setUpdating(prev => ({ ...prev, [appId]: true }));
    try {
      await companyApi.updateApplication(appId, { status: newStatus });
      setApplicants(prev => prev.map(a =>
        a.applicationId === appId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed.');
    } finally {
      setUpdating(prev => ({ ...prev, [appId]: false }));
    }
  }

  if (loading) return <div style={styles.loading}>Loading applicants...</div>;

  return (
    <div>
      <button style={styles.backBtn} onClick={() => navigate('/company/dashboard')}>← Back to Dashboard</button>
      <h2 style={styles.title}>👥 Applicants ({applicants.length})</h2>
      {applicants.length === 0 ? (
        <div style={styles.empty}>No applicants yet for this job.</div>
      ) : (
        applicants.map(app => (
          <div key={app.applicationId} style={styles.card}>
            <div style={styles.header}>
              <div>
                <div style={styles.name}>{app.name}</div>
                <div style={styles.detail}>📧 {app.email}</div>
                {app.phone && <div style={styles.detail}>📞 {app.phone}</div>}
                {app.course && <div style={styles.detail}>🎓 {app.course} {app.graduationYear && `(${app.graduationYear})`}</div>}
                <div style={styles.detail}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: STATUS_COLORS[app.status] || '#333', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </div>
                {app.resumeUrl && (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={styles.resumeLink}>📄 View Resume</a>
                )}
              </div>
            </div>
            {app.skills && (
              <div style={{ marginBottom: '12px' }}>
                {app.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} style={styles.skillTag}>{s}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                style={styles.select}
                value={selectedStatus[app.applicationId] || app.status}
                onChange={e => setSelectedStatus(prev => ({ ...prev, [app.applicationId]: e.target.value }))}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              <button
                style={styles.btn}
                onClick={() => handleUpdateStatus(app.applicationId)}
                disabled={updating[app.applicationId]}
              >
                {updating[app.applicationId] ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
