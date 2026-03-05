import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyApi, placementApi } from '../../services/api';

const styles = {
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: '13px', color: '#666', marginBottom: '6px' },
  cardValue: { fontSize: '28px', fontWeight: 'bold', color: '#0078d4' },
  section: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#333' },
  btn: { padding: '8px 16px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px' },
  jobRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  jobTitle: { fontWeight: '600', color: '#333', marginBottom: '2px' },
  jobDetail: { fontSize: '13px', color: '#666' },
  badge: { background: '#0078d4', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' }
};

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem('userName') || 'Company';

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, statsRes] = await Promise.all([
          companyApi.getJobs(),
          placementApi.getStats()
        ]);
        setJobs(jobsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div>
      <h2 style={styles.title}>Welcome, {name}! 🏢</h2>
      {stats && (
        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Jobs Posted</div>
            <div style={styles.cardValue}>{jobs.length}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Active Jobs</div>
            <div style={styles.cardValue}>{jobs.filter(j => j.isActive).length}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Total Students</div>
            <div style={styles.cardValue}>{stats.totalStudents ?? '-'}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Total Placements</div>
            <div style={styles.cardValue}>{stats.totalPlacements ?? '-'}</div>
          </div>
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Your Job Listings</span>
          <Link to="/company/post-job" style={styles.btn}>+ Post New Job</Link>
        </div>
        {jobs.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No jobs posted yet. <Link to="/company/post-job">Post your first job!</Link></p>
        ) : (
          jobs.map(job => (
            <div key={job.id} style={styles.jobRow}>
              <div>
                <div style={styles.jobTitle}>{job.title}</div>
                <div style={styles.jobDetail}>
                  {job.location && `📍 ${job.location}`}
                  {job.location && job.openings && ' · '}
                  {job.openings && `${job.openings} opening(s)`}
                  {' · Posted: ' + new Date(job.postedAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ ...styles.badge, background: job.isActive ? '#107c10' : '#666' }}>
                  {job.isActive ? 'Active' : 'Inactive'}
                </span>
                <Link to={`/company/applicants/${job.id}`} style={{ ...styles.btn, background: '#605e5c' }}>
                  View Applicants
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
