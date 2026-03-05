const express = require('express');
const { authMiddleware, authorize } = require('../middleware/auth');
const { getSqlPool, sql } = require('../config/db');

const router = express.Router();

// GET /api/placements - list all placements (admin/company view)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pool = await getSqlPool();
    const request = pool.request();
    let query = `SELECT p.id, p.placedAt,
                        s.name as studentName, s.email as studentEmail, s.course,
                        j.title as jobTitle, j.location, j.salary,
                        c.name as companyName
                 FROM Placements p
                 JOIN Students s ON p.studentId = s.id
                 JOIN Jobs j ON p.jobId = j.id
                 JOIN Companies c ON p.companyId = c.id`;
    if (req.user.role === 'company') {
      request.input('companyId', sql.Int, req.user.id);
      query += ' WHERE p.companyId = @companyId';
    }
    query += ' ORDER BY p.placedAt DESC';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Placements fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch placements', details: err.message });
  }
});

// GET /api/placements/stats - placement statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const pool = await getSqlPool();
    const stats = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Students) as totalStudents,
        (SELECT COUNT(*) FROM Companies) as totalCompanies,
        (SELECT COUNT(*) FROM Jobs WHERE isActive = 1) as activeJobs,
        (SELECT COUNT(*) FROM Applications) as totalApplications,
        (SELECT COUNT(*) FROM Placements) as totalPlacements,
        (SELECT COUNT(DISTINCT companyId) FROM Placements) as companiesHired
    `);
    res.json(stats.recordset[0]);
  } catch (err) {
    console.error('Stats fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// GET /api/placements/my - student's own placement record
router.get('/my', authMiddleware, authorize('student'), async (req, res) => {
  try {
    const pool = await getSqlPool();
    const result = await pool.request()
      .input('studentId', sql.Int, req.user.id)
      .query(`SELECT p.id, p.placedAt,
                     j.title as jobTitle, j.location, j.salary,
                     c.name as companyName, c.website
              FROM Placements p
              JOIN Jobs j ON p.jobId = j.id
              JOIN Companies c ON p.companyId = c.id
              WHERE p.studentId = @studentId`);
    res.json(result.recordset);
  } catch (err) {
    console.error('My placement error:', err.message);
    res.status(500).json({ error: 'Failed to fetch placement record', details: err.message });
  }
});

module.exports = router;
