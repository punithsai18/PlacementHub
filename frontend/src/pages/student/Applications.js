import React, { useState, useEffect } from 'react';
import { studentApi } from '../../services/api';

const STATUS_COLORS = {
  applied:     { bg: '#f0f6ff', text: '#0078d4' },
  shortlisted: { bg: '#fff4ce', text: '#797700' },
  interview:   { bg: '#e8f8e8', text: '#107c10' },
  offered:     { bg: '#dff6dd', text: '#107c10' },
  rejected:    { bg: '#fde7e9', text: '#d13438' },
  placed:      { bg: '#0078d4', text: '#fff' }
};

const styles = {
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  detail: { fontSize: '13px', color: '#666', marginBottom: '2px' },
  statusBadge: (status) => ({
    padding: '6px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
    background: STATUS_COLORS[status]?.bg || '#f5f5f5',
    color: STATUS_COLORS[status]?.text || '#333'
  }),
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  empty: { textAlign: 'center', padding: '40px', color: '#666', background: '#fff', borderRadius: '8px' }
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await studentApi.getApplications();
        setApplications(data);
      } catch (err) {
        setError('Failed to load applications.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading applications...</div>;

  return (
    <div>
      <h2 style={styles.title}>📋 My Applications ({applications.length})</h2>
      {error && <div style={{ color: '#d13438', marginBottom: '12px' }}>{error}</div>}
      {applications.length === 0 ? (
        <div style={styles.empty}>You haven't applied for any jobs yet. <a href="/student/jobs">Browse jobs</a> to get started!</div>
      ) : (
        applications.map(app => (
          <div key={app.id} style={styles.card}>
            <div>
              <div style={styles.jobTitle}>{app.jobTitle}</div>
              <div style={styles.detail}>🏢 {app.companyName}</div>
              {app.location && <div style={styles.detail}>📍 {app.location}</div>}
              {app.salary && <div style={styles.detail}>💰 {app.salary}</div>}
              <div style={styles.detail}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
              {app.updatedAt && <div style={styles.detail}>Updated: {new Date(app.updatedAt).toLocaleDateString()}</div>}
            </div>
            <div style={styles.statusBadge(app.status)}>
              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
