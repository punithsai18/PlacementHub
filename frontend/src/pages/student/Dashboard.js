import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentApi, placementApi } from '../../services/api';

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#0078d4' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' },
  card: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textDecoration: 'none', color: 'inherit', display: 'block', border: '2px solid transparent', transition: 'border-color 0.2s' },
  cardTitle: { fontSize: '14px', color: '#666', marginBottom: '8px' },
  cardValue: { fontSize: '28px', fontWeight: 'bold', color: '#0078d4' },
  section: { background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#333' },
  profileGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  profileItem: { fontSize: '14px', color: '#555' },
  profileLabel: { fontWeight: '600', display: 'block', marginBottom: '2px', color: '#333' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' }
};

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = localStorage.getItem('userName') || 'Student';

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, statsRes] = await Promise.all([
          studentApi.getProfile(),
          placementApi.getStats()
        ]);
        setProfile(profileRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Welcome back, {profile?.name || name}! 👋</h2>
      </div>

      {stats && (
        <div style={styles.cards}>
          <Link to="/student/jobs" style={styles.card}>
            <div style={styles.cardTitle}>Active Jobs Available</div>
            <div style={styles.cardValue}>{stats.activeJobs ?? '-'}</div>
          </Link>
          <Link to="/student/applications" style={styles.card}>
            <div style={styles.cardTitle}>Your Applications</div>
            <div style={styles.cardValue}>{stats.totalApplications ?? '-'}</div>
          </Link>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Total Placements</div>
            <div style={styles.cardValue}>{stats.totalPlacements ?? '-'}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Companies Hiring</div>
            <div style={styles.cardValue}>{stats.totalCompanies ?? '-'}</div>
          </div>
        </div>
      )}

      {profile && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Your Profile</div>
          <div style={styles.profileGrid}>
            {[
              { label: 'Name', value: profile.name },
              { label: 'Email', value: profile.email },
              { label: 'Phone', value: profile.phone || 'Not provided' },
              { label: 'Course', value: profile.course || 'Not provided' },
              { label: 'Graduation Year', value: profile.graduationYear || 'Not provided' },
              { label: 'Skills', value: profile.skills || 'Upload your resume to auto-detect skills' }
            ].map(({ label, value }) => (
              <div key={label} style={styles.profileItem}>
                <span style={styles.profileLabel}>{label}</span>
                {value}
              </div>
            ))}
          </div>
          {!profile.resumeUrl && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#fff4ce', borderRadius: '4px', fontSize: '14px' }}>
              💡 <strong>Tip:</strong> <Link to="/student/resume">Upload your resume</Link> to enable AI-powered skill extraction and improve job matching.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
