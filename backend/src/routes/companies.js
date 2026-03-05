const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware, authorize, generateToken } = require('../middleware/auth');
const { getSqlPool, sql } = require('../config/db');
const { searchCandidates } = require('../services/searchService');

const router = express.Router();

// POST /api/companies/login
<<<<<<< HEAD
// Company login endpoint - Exchanges email/password for a JWT
=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
<<<<<<< HEAD
    const pool = await getSqlPool(); // Connect to Azure SQL

    // Find company by email
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, name, email, passwordHash FROM Companies WHERE email = @email');

    if (result.recordset.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const company = result.recordset[0];

    // Verify password hash
    const valid = await bcrypt.compare(password, company.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate secure token passing company role
=======
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id, name, email, passwordHash FROM Companies WHERE email = @email');
    if (result.recordset.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const company = result.recordset[0];
    const valid = await bcrypt.compare(password, company.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    const token = generateToken({ id: company.id, email: company.email, role: 'company' });
    res.json({ token, company: { id: company.id, name: company.name, email: company.email } });
  } catch (err) {
    console.error('Company login error:', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// POST /api/companies/register
<<<<<<< HEAD
// Registers a new company via Azure SQL
=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, website, industry } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const pool = await getSqlPool();
<<<<<<< HEAD

    // Ensure email is unique
=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT id FROM Companies WHERE email = @email');
    if (existing.recordset.length > 0) return res.status(409).json({ error: 'Email already registered' });
<<<<<<< HEAD

    // Hash plain text password before storing
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert new company and return the inserted ID
=======
    const passwordHash = await bcrypt.hash(password, 12);
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('website', sql.NVarChar, website || null)
      .input('industry', sql.NVarChar, industry || null)
      .query(`INSERT INTO Companies (name, email, passwordHash, website, industry, createdAt)
              OUTPUT INSERTED.id
              VALUES (@name, @email, @passwordHash, @website, @industry, GETUTCDATE())`);
<<<<<<< HEAD

    const companyId = result.recordset[0].id; // Extract newly generated ID

    // Automatically log them in post-registration
=======
    const companyId = result.recordset[0].id;
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    const token = generateToken({ id: companyId, email, role: 'company' });
    res.status(201).json({ message: 'Company registered successfully', token, companyId });
  } catch (err) {
    console.error('Company register error:', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/companies/jobs
router.post('/jobs', authMiddleware, authorize('company'), async (req, res) => {
  try {
    const { title, description, location, salary, skills, deadline, openings } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('companyId', sql.Int, req.user.id)
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description)
      .input('location', sql.NVarChar, location || null)
      .input('salary', sql.NVarChar, salary || null)
      .input('skills', sql.NVarChar, skills || null)
      .input('deadline', sql.DateTime, deadline ? new Date(deadline) : null)
      .input('openings', sql.Int, openings || 1)
      .query(`INSERT INTO Jobs (companyId, title, description, location, salary, skills, deadline, openings, isActive, postedAt)
              OUTPUT INSERTED.id
              VALUES (@companyId, @title, @description, @location, @salary, @skills, @deadline, @openings, 1, GETUTCDATE())`);
    res.status(201).json({ message: 'Job posted successfully', jobId: result.recordset[0].id });
  } catch (err) {
    console.error('Post job error:', err.message);
    res.status(500).json({ error: 'Failed to post job', details: err.message });
  }
});

// GET /api/companies/jobs
router.get('/jobs', authMiddleware, authorize('company'), async (req, res) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('companyId', sql.Int, req.user.id)
      .query(`SELECT id, title, description, location, salary, skills, deadline, openings, isActive, postedAt
              FROM Jobs WHERE companyId = @companyId ORDER BY postedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get jobs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs', details: err.message });
  }
});

// GET /api/companies/jobs/:jobId/applicants
router.get('/jobs/:jobId/applicants', authMiddleware, authorize('company'), async (req, res) => {
  try {
    const pool = await getSqlPool();
    // Verify job belongs to company
    const jobCheck = await pool.request()
      .input('jobId', sql.Int, req.params.jobId)
      .input('companyId', sql.Int, req.user.id)
      .query('SELECT id FROM Jobs WHERE id=@jobId AND companyId=@companyId');
    if (jobCheck.recordset.length === 0) return res.status(403).json({ error: 'Access denied' });

    const result = await pool.request()
      .input('jobId', sql.Int, req.params.jobId)
      .query(`SELECT a.id as applicationId, a.status, a.appliedAt,
                     s.id as studentId, s.name, s.email, s.phone, s.course, s.graduationYear, s.skills, s.resumeUrl
              FROM Applications a
              JOIN Students s ON a.studentId = s.id
              WHERE a.jobId = @jobId
              ORDER BY a.appliedAt DESC`);
    res.json(result.recordset);
  } catch (err) {
    console.error('Get applicants error:', err.message);
    res.status(500).json({ error: 'Failed to fetch applicants', details: err.message });
  }
});

// PUT /api/companies/applications/:appId
router.put('/applications/:appId', authMiddleware, authorize('company'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'placed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const pool = await getSqlPool();
<<<<<<< HEAD
    // Verify the application belongs to this company's job and get student/job details for email
    const check = await pool.request()
      .input('appId', sql.Int, req.params.appId)
      .input('companyId', sql.Int, req.user.id)
      .query(`SELECT a.id, s.email, s.name as studentName, j.title as jobTitle, c.name as companyName
              FROM Applications a
              JOIN Students s ON a.studentId = s.id
              JOIN Jobs j ON a.jobId = j.id
              JOIN Companies c ON j.companyId = c.id
              WHERE a.id = @appId AND j.companyId = @companyId`);
    if (check.recordset.length === 0) return res.status(403).json({ error: 'Access denied' });

    const { email, studentName, jobTitle, companyName } = check.recordset[0];

=======
    // Verify the application belongs to this company's job
    const check = await pool.request()
      .input('appId', sql.Int, req.params.appId)
      .input('companyId', sql.Int, req.user.id)
      .query(`SELECT a.id FROM Applications a
              JOIN Jobs j ON a.jobId = j.id
              WHERE a.id = @appId AND j.companyId = @companyId`);
    if (check.recordset.length === 0) return res.status(403).json({ error: 'Access denied' });

>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    await pool.request()
      .input('appId', sql.Int, req.params.appId)
      .input('status', sql.NVarChar, status)
      .query('UPDATE Applications SET status=@status, updatedAt=GETUTCDATE() WHERE id=@appId');

<<<<<<< HEAD
    // Send Email Notification to student
    try {
      const { notifyStudentOfStatusUpdate } = require('../services/emailService');
      await notifyStudentOfStatusUpdate(email, studentName, jobTitle, companyName, status);
    } catch (emailErr) {
      console.error('Failed to send status update email:', emailErr.message);
      // We don't fail the request if email fails, but we log it
    }

=======
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    // If placed, insert into Placements table
    if (status === 'placed') {
      const appData = await pool.request()
        .input('appId', sql.Int, req.params.appId)
        .query('SELECT studentId, jobId FROM Applications WHERE id=@appId');
      const { studentId, jobId } = appData.recordset[0];
      await pool.request()
        .input('studentId', sql.Int, studentId)
        .input('jobId', sql.Int, jobId)
        .input('companyId', sql.Int, req.user.id)
        .query(`MERGE Placements AS target
                USING (SELECT @studentId AS studentId, @jobId AS jobId) AS source
                ON target.studentId = source.studentId AND target.jobId = source.jobId
                WHEN NOT MATCHED THEN
                  INSERT (studentId, jobId, companyId, placedAt)
                  VALUES (@studentId, @jobId, @companyId, GETUTCDATE());`);
    }

<<<<<<< HEAD
    res.json({ message: `Application status updated to '${status}' and student notified via email.` });
=======
    res.json({ message: `Application status updated to '${status}'` });
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
  } catch (err) {
    console.error('Update application error:', err.message);
    res.status(500).json({ error: 'Failed to update application', details: err.message });
  }
});

// GET /api/companies/search?skills=react,node
router.get('/search', authMiddleware, authorize('company'), async (req, res) => {
  try {
    const { skills, query } = req.query;
    const searchQuery = query || skills || '*';
    const candidates = await searchCandidates(searchQuery);
    res.json(candidates);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
