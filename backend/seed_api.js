const axios = require('axios');

const companies = [
    {
        name: 'Google', email: 'hr@google.com', password: 'Google@123', website: 'https://google.com', industry: 'Technology',
        jobs: [
            { title: 'Software Engineer', description: 'Develop scalable systems.', location: 'Remote', salary: '$120k', skills: 'Python, Java, React' },
            { title: 'Data Scientist', description: 'Build ML models.', location: 'US/Remote', salary: '$140k', skills: 'Python, SQL, Machine Learning' }
        ]
    },
    {
        name: 'Microsoft', email: 'jobs@microsoft.com', password: 'Microsoft@123', website: 'https://microsoft.com', industry: 'Technology',
        jobs: [
            { title: 'Cloud Engineer (Azure)', description: 'Deploy cloud apps.', location: 'Seattle', salary: '$110k', skills: 'Azure, C#, Cloud' }
        ]
    },
    {
        name: 'Amazon', email: 'recruit@amazon.com', password: 'Amazon@123', website: 'https://amazon.com', industry: 'E-commerce',
        jobs: [
            { title: 'Backend Developer', description: 'Build robust APIs.', location: 'Seattle', salary: '$130k', skills: 'Java, Node.js, AWS' }
        ]
    },
    {
        name: 'Tesla', email: 'careers@tesla.com', password: 'Tesla@123', website: 'https://tesla.com', industry: 'Automotive',
        jobs: [
            { title: 'Embedded Systems Engineer', description: 'Develop car firmware.', location: 'Palo Alto', salary: '$150k', skills: 'C++, C, Embedded' }
        ]
    },
    {
        name: 'Netflix', email: 'talent@netflix.com', password: 'Netflix@123', website: 'https://netflix.com', industry: 'Entertainment',
        jobs: [
            { title: 'Video Processing Engineer', description: 'Optimize video formats.', location: 'Los Gatos', salary: '$160k', skills: 'C++, Python, Video Compression' }
        ]
    },
    {
        name: 'Meta', email: 'careers@meta.com', password: 'Meta@123', website: 'https://meta.com', industry: 'Social Media',
        jobs: [
            { title: 'React Native Developer', description: 'Build mobile apps.', location: 'Menlo Park', salary: '$135k', skills: 'React Native, JavaScript' }
        ]
    },
    {
        name: 'Apple', email: 'jobs@apple.com', password: 'Apple@123', website: 'https://apple.com', industry: 'Consumer Electronics',
        jobs: [
            { title: 'iOS Developer', description: 'Develop iOS apps.', location: 'Cupertino', salary: '$145k', skills: 'Swift, Objective-C, iOS' }
        ]
    },
    {
        name: 'Oracle', email: 'hr@oracle.com', password: 'Oracle@123', website: 'https://oracle.com', industry: 'Enterprise Software',
        jobs: [
            { title: 'Database Administrator', description: 'Manage large databases.', location: 'Austin', salary: '$115k', skills: 'SQL, Database Design, Oracle' }
        ]
    },
    {
        name: 'Adobe', email: 'careers@adobe.com', password: 'Adobe@123', website: 'https://adobe.com', industry: 'Software',
        jobs: [
            { title: 'UI/UX Designer', description: 'Design creative tools.', location: 'San Jose', salary: '$120k', skills: 'UI/UX, Figma, Design' }
        ]
    },
    {
        name: 'IBM', email: 'jobs@ibm.com', password: 'IBM@123', website: 'https://ibm.com', industry: 'IT Services',
        jobs: [
            { title: 'AI Researcher', description: 'Research quantum & AI.', location: 'New York', salary: '$140k', skills: 'AI, Python, Research' }
        ]
    }
];

const API_BASE = 'https://placementhub1914-web.azurewebsites.net/api';

async function seed() {
    for (const c of companies) {
        try {
            console.log('Registering ' + c.name + '...');
            await axios.post(API_BASE + '/companies/register', {
                name: c.name, email: c.email, password: c.password, website: c.website, industry: c.industry
            }).catch(e => {
                if (e.response && e.response.status === 409) return; // already registered
                throw e;
            });

            console.log('Logging in ' + c.name + '...');
            const { data } = await axios.post(API_BASE + '/companies/login', {
                email: c.email, password: c.password
            });

            const token = data.token;

            console.log('Fetching jobs for ' + c.name + '...');
            const existingJobsRes = await axios.get(API_BASE + '/companies/jobs', { headers: { Authorization: 'Bearer ' + token } });
            const existingJobs = existingJobsRes.data;

            for (const j of c.jobs) {
                if (!existingJobs.find(job => job.title === j.title)) {
                    console.log('Posting job ' + j.title + ' for ' + c.name + '...');
                    await axios.post(API_BASE + '/companies/jobs', j, {
                        headers: { Authorization: 'Bearer ' + token }
                    });
                }
            }
        } catch (err) {
            console.error('Failed for ' + c.name + ':', err.response?.data?.error || err.message);
        }
    }
    console.log('API Seeding complete!');
}

seed();
