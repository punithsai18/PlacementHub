require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');
const { getSqlPool, sql } = require('./src/config/db');

const companies = [
    {
        name: 'Google', email: 'hr@google.com', pass: 'Google@123', web: 'https://google.com', industry: 'Technology',
        jobs: [
            { title: 'Software Engineer', desc: 'Develop scalable systems.', loc: 'Remote', salary: '$120k', skills: 'Python, Java, React' },
            { title: 'Data Scientist', desc: 'Build ML models.', loc: 'US/Remote', salary: '$140k', skills: 'Python, SQL, Machine Learning' }
        ]
    },
    {
        name: 'Microsoft', email: 'jobs@microsoft.com', pass: 'Microsoft@123', web: 'https://microsoft.com', industry: 'Technology',
        jobs: [
            { title: 'Cloud Engineer (Azure)', desc: 'Deploy cloud apps.', loc: 'Seattle', salary: '$110k', skills: 'Azure, C#, Cloud' },
            { title: 'Frontend Developer', desc: 'Build UIs.', loc: 'Remote', salary: '$100k', skills: 'JavaScript, React, CSS' }
        ]
    },
    {
        name: 'Amazon', email: 'recruit@amazon.com', pass: 'Amazon@123', web: 'https://amazon.com', industry: 'E-commerce',
        jobs: [
            { title: 'Backend Developer', desc: 'Build robust APIs.', loc: 'Seattle', salary: '$130k', skills: 'Java, Node.js, AWS' }
        ]
    },
    {
        name: 'Tesla', email: 'careers@tesla.com', pass: 'Tesla@123', web: 'https://tesla.com', industry: 'Automotive',
        jobs: [
            { title: 'Embedded Systems Engineer', desc: 'Develop car firmware.', loc: 'Palo Alto', salary: '$150k', skills: 'C++, C, Embedded' }
        ]
    },
    {
        name: 'Netflix', email: 'talent@netflix.com', pass: 'Netflix@123', web: 'https://netflix.com', industry: 'Entertainment',
        jobs: [
            { title: 'Video Processing Engineer', desc: 'Optimize video formats.', loc: 'Los Gatos', salary: '$160k', skills: 'C++, Python, Video Compression' }
        ]
    },
    {
        name: 'Meta', email: 'careers@meta.com', pass: 'Meta@123', web: 'https://meta.com', industry: 'Social Media',
        jobs: [
            { title: 'React Native Developer', desc: 'Build mobile apps.', loc: 'Menlo Park', salary: '$135k', skills: 'React Native, JavaScript' }
        ]
    },
    {
        name: 'Apple', email: 'jobs@apple.com', pass: 'Apple@123', web: 'https://apple.com', industry: 'Consumer Electronics',
        jobs: [
            { title: 'iOS Developer', desc: 'Develop iOS apps.', loc: 'Cupertino', salary: '$145k', skills: 'Swift, Objective-C, iOS' }
        ]
    },
    {
        name: 'Oracle', email: 'hr@oracle.com', pass: 'Oracle@123', web: 'https://oracle.com', industry: 'Enterprise Software',
        jobs: [
            { title: 'Database Administrator', desc: 'Manage large databases.', loc: 'Austin', salary: '$115k', skills: 'SQL, Database Design, Oracle' }
        ]
    },
    {
        name: 'Adobe', email: 'careers@adobe.com', pass: 'Adobe@123', web: 'https://adobe.com', industry: 'Software',
        jobs: [
            { title: 'UI/UX Designer', desc: 'Design creative tools.', loc: 'San Jose', salary: '$120k', skills: 'UI/UX, Figma, Design' }
        ]
    },
    {
        name: 'IBM', email: 'jobs@ibm.com', pass: 'IBM@123', web: 'https://ibm.com', industry: 'IT Services',
        jobs: [
            { title: 'AI Researcher', desc: 'Research quantum & AI.', loc: 'New York', salary: '$140k', skills: 'AI, Python, Research' }
        ]
    }
];

async function seed() {
    try {
        const pool = await getSqlPool();
        for (const c of companies) {
            // Check if exists
            const existing = await pool.request().input('email', sql.NVarChar, c.email).query('SELECT id FROM Companies WHERE email=@email');
            let cid;
            if (existing.recordset.length === 0) {
                const passwordHash = await bcrypt.hash(c.pass, 12);
                const res = await pool.request()
                    .input('name', sql.NVarChar, c.name)
                    .input('email', sql.NVarChar, c.email)
                    .input('pass', sql.NVarChar, passwordHash)
                    .input('web', sql.NVarChar, c.web)
                    .input('ind', sql.NVarChar, c.industry)
                    .query(`INSERT INTO Companies (name, email, passwordHash, website, industry) OUTPUT INSERTED.id VALUES (@name, @email, @pass, @web, @ind)`);
                cid = res.recordset[0].id;
                console.log(`Created company ${c.name} with ID ${cid}`);
            } else {
                cid = existing.recordset[0].id;
            }

            for (const j of c.jobs) {
                const jExisting = await pool.request().input('cid', sql.Int, cid).input('title', sql.NVarChar, j.title).query('SELECT id FROM Jobs WHERE companyId=@cid AND title=@title');
                if (jExisting.recordset.length === 0) {
                    await pool.request()
                        .input('cid', sql.Int, cid)
                        .input('title', sql.NVarChar, j.title)
                        .input('desc', sql.NVarChar, j.desc)
                        .input('loc', sql.NVarChar, j.loc)
                        .input('sal', sql.NVarChar, j.salary)
                        .input('skills', sql.NVarChar, j.skills)
                        .query(`INSERT INTO Jobs (companyId, title, description, location, salary, skills) VALUES (@cid, @title, @desc, @loc, @sal, @skills)`);
                    console.log(`Created job ${j.title} for company ${c.name}`);
                }
            }
        }
        console.log('Seeding complete.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding:', err);
        process.exit(1);
    }
}
seed();
