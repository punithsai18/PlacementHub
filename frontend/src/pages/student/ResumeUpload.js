import React, { useState } from 'react';
import { studentApi } from '../../services/api';

const styles = {
  container: { maxWidth: '600px', margin: '0 auto' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0078d4' },
  card: { background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  dropzone: { border: '2px dashed #0078d4', borderRadius: '8px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#f0f6ff', marginBottom: '16px' },
  btn: { padding: '12px 24px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  success: { background: '#dff6dd', color: '#107c10', padding: '12px', borderRadius: '4px', marginTop: '16px' },
  error: { background: '#fde7e9', color: '#d13438', padding: '12px', borderRadius: '4px', marginTop: '16px' },
  skillTag: { display: 'inline-block', background: '#0078d4', color: '#fff', padding: '4px 10px', borderRadius: '12px', margin: '4px', fontSize: '13px' },
  scanning: { background: '#fff4ce', padding: '12px', borderRadius: '4px', marginTop: '16px', textAlign: 'center' }
};

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(selected.type)) {
        setError('Only PDF and Word documents are accepted.');
        return;
      }
      setFile(selected);
      setError('');
      setResult(null);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setScanning(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const { data } = await studentApi.uploadResume(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 Resume Upload & AI Analysis</h2>
      <div style={styles.card}>
        <p style={{ marginBottom: '16px', color: '#555' }}>
          Upload your resume (PDF or Word) to have our AI automatically extract your skills and experience using Azure AI Document Intelligence.
        </p>

        <div style={styles.dropzone} onClick={() => document.getElementById('resumeInput').click()}>
          {file ? (
            <div>
              <strong>📎 {file.name}</strong>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>☁️</div>
              <strong>Click to select your resume</strong>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>PDF or Word document (max 10MB)</div>
            </div>
          )}
        </div>
        <input id="resumeInput" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />

        <button style={styles.btn} onClick={handleUpload} disabled={!file || loading}>
          {loading ? '⏳ Uploading & Scanning...' : '🚀 Upload & Analyze Resume'}
        </button>

        {scanning && (
          <div style={styles.scanning}>
            🤖 <strong>AI is analyzing your resume...</strong> This may take a few seconds.
          </div>
        )}

        {error && <div style={styles.error}>❌ {error}</div>}

        {result && (
          <div style={styles.success}>
            <strong>✅ Resume uploaded and analyzed successfully!</strong>
            {result.extractedData?.skills?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>Detected Skills:</strong>
                <div style={{ marginTop: '8px' }}>
                  {result.extractedData.skills.map(skill => (
                    <span key={skill} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {result.extractedData?.email && (
              <div style={{ marginTop: '8px', fontSize: '14px' }}>📧 Email detected: {result.extractedData.email}</div>
            )}
            {result.extractedData?.phone && (
              <div style={{ fontSize: '14px' }}>📞 Phone detected: {result.extractedData.phone}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
