const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { authMiddleware, authorize, generateToken } = require('../middleware/auth');
const { getSqlPool, sql } = require('../config/db');
const { uploadResume } = require('../services/blobService');
const { extractResumeData } = require('../services/resumeService');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/students/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, course, graduationYear } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const pool = await getSqlPool();
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Students WHERE email = @email');
    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('phone', sql.NVarChar, phone || null)
      .input('course', sql.NVarChar, course || null)
      .input('graduationYear', sql.Int, graduationYear || null)
      .query(`INSERT INTO Students (name, email, passwordHash, phone, course, graduationYear, createdAt)
              OUTPUT INSERTED.id
              VALUES (@name, @email, @passwordHash, @phone, @course, @graduationYear, GETUTCDATE())`);
    const studentId = result.recordset[0].id;
    const token = generateToken({ id: studentId, email, role: 'student' });
    res.status(201).json({ message: 'Student registered successfully', token, studentId });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/students/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, name, email, passwordHash FROM Students WHERE email = @email');
    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const student = result.recordset[0];
    const valid = await bcrypt.compare(password, student.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ id: student.id, email: student.email, role: 'student' });
    res.json({ token, student: { id: student.id, name: student.name, email: student.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/students/profile
router.get('/profile', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, name, email, phone, course, graduationYear, skills, resumeUrl, createdAt FROM Students WHERE id = @id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

<<<<<<< HEAD
// GET /api/students/all
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .query('SELECT id, name, email, course, skills, resumeUrl FROM Students ORDER BY name ASC');
    res.json(result.recordset);
  } catch (err) {
    console.error('All students fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch students', details: err.message });
  }
});

=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
// PUT /api/students/profile
router.put('/profile', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const { name, phone, course, graduationYear, skills } = req.body;
    const pool = await getSqlPool();
    await pool.request()
      .input('id', sql.Int, req.user.id)
      .input('name', sql.NVarChar, name)
      .input('phone', sql.NVarChar, phone || null)
      .input('course', sql.NVarChar, course || null)
      .input('graduationYear', sql.Int, graduationYear || null)
      .input('skills', sql.NVarChar, skills || null)
      .query(`UPDATE Students SET name=@name, phone=@phone, course=@course,
              graduationYear=@graduationYear, skills=@skills WHERE id=@id`);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
});

// POST /api/students/resume
router.post('/resume', authMiddleware, authorize('student'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No resume file uploaded' });

    const studentId = req.user.id;
    const blobName = `resumes/${studentId}/${Date.now()}-${req.file.originalname}`;

    // Upload to Azure Blob Storage
    const resumeUrl = await uploadResume(req.file.buffer, blobName, req.file.mimetype);

    // Extract data with Azure AI Document Intelligence
    const extractedData = await extractResumeData(req.file.buffer, req.file.mimetype);

    // Save resume URL and extracted skills to SQL
    const pool = await getSqlPool();
    await pool.request()
      .input('id', sql.Int, studentId)
      .input('resumeUrl', sql.NVarChar, resumeUrl)
      .input('skills', sql.NVarChar, extractedData.skills ? extractedData.skills.join(', ') : null)
      .query('UPDATE Students SET resumeUrl=@resumeUrl, skills=@skills WHERE id=@id');

    res.json({ message: 'Resume uploaded and analyzed', resumeUrl, extractedData });
  } catch (err) {
<<<<<<< HEAD
    console.error('Resume upload error:', err);
    res.status(500).json({ error: 'Resume upload failed', details: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined });
=======
    console.error('Resume upload error:', err.message);
    res.status(500).json({ error: 'Resume upload failed', details: err.message });
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
  }
});

// GET /api/students/jobs
router.get('/jobs', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const { search } = req.query;
    const pool = await getSqlPool();
    const request = pool.request();
    let query = `SELECT j.id, j.title, j.description, j.location, j.salary, j.skills,
                        j.deadline, j.postedAt, c.name as companyName
                 FROM Jobs j JOIN Companies c ON j.companyId = c.id
                 WHERE j.isActive = 1 AND (j.deadline IS NULL OR j.deadline >= GETUTCDATE())`;
    if (search) {
      request.input('search', sql.NVarChar, `%${search}%`);
      query += ' AND (j.title LIKE @search OR j.description LIKE @search)';
    }
    query += ' ORDER BY j.postedAt DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Jobs fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
  }
});

// POST /api/students/apply/:jobId
router.post('/apply/:jobId', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.user.id;
    const pool = await getSqlPool();

    // Check for duplicate application
    const existing = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('jobId', sql.Int, jobId)
      .query('SELECT id FROM Applications WHERE studentId=@studentId AND jobId=@jobId');
    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'Already applied for this job' });
    }

    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('jobId', sql.Int, jobId)
      .query(`INSERT INTO Applications (studentId, jobId, status, appliedAt)
              OUTPUT INSERTED.id
              VALUES (@studentId, @jobId, 'applied', GETUTCDATE())`);
    res.status(201).json({ message: 'Application submitted', applicationId: result.recordset[0].id });
  } catch (err) {
    console.error('Apply error:', err.message);
    res.status(500).json({ error: 'Application failed', details: err.message });
  }
});

// GET /api/students/applications
router.get('/applications', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('studentId', sql.Int, req.user.id)
      .query(`SELECT a.id, a.status, a.appliedAt, a.updatedAt,
                     j.title as jobTitle, j.location, j.salary,
                     c.name as companyName
              FROM Applications a
              JOIN Jobs j ON a.jobId = j.id
              JOIN Companies c ON j.companyId = c.id
              WHERE a.studentId = @studentId
              ORDER BY a.appliedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Applications fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
});

module.exports = router;
