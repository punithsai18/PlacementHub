require('dotenv').config();
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const sql = require('mssql');

const sqlConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER,
  options: { encrypt: true, trustServerCertificate: false }
};

/**
 * Azure Function: ResumeProcessor
 * Triggered by a new blob upload to the "resumes/{studentId}/{name}" path.
 * Extracts resume data using Azure AI Document Intelligence and saves to Azure SQL.
 */
module.exports = async function (context, myBlob) {
  context.log('ResumeProcessor triggered. Blob name:', context.bindingData.name);
  context.log('Blob size:', myBlob.length, 'bytes');

  const studentId = context.bindingData.studentId;
  if (!studentId) {
    context.log.error('Could not extract studentId from blob path.');
    return;
  }

  try {
    // --- Step 1: Analyze resume with Azure AI Document Intelligence ---
    if (!process.env.AZURE_FORM_RECOGNIZER_ENDPOINT || !process.env.AZURE_FORM_RECOGNIZER_KEY) {
      context.log.warn('Azure AI Document Intelligence not configured. Skipping extraction.');
      return;
    }

    const docClient = new DocumentAnalysisClient(
      process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY)
    );

    const poller = await docClient.beginAnalyzeDocument('prebuilt-read', myBlob);
    const result = await poller.pollUntilDone();
    const fullText = result.content || '';
    context.log('Text extracted, length:', fullText.length);

    // --- Step 2: Parse extracted text ---
    const extractedData = parseResumeText(fullText);
    context.log('Extracted data:', JSON.stringify(extractedData));

    // --- Step 3: Save to Azure SQL ---
    if (!process.env.AZURE_SQL_SERVER) {
      context.log.warn('Azure SQL not configured. Skipping database update.');
      return;
    }

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input('studentId', sql.Int, parseInt(studentId))
      .input('skills', sql.NVarChar, (extractedData.skills || []).join(', '))
      .query('UPDATE Students SET skills=@skills WHERE id=@studentId');

    context.log(`Successfully updated skills for student ${studentId}`);
    await pool.close();
  } catch (err) {
    context.log.error('ResumeProcessor error:', err.message);
    throw err;
  }
};

/**
 * Extract skills and contact info from resume text.
 *
 * @param {string} text - Raw resume text.
 * @returns {Object} Parsed resume fields.
 */
function parseResumeText(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);

  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Spring',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Azure', 'AWS', 'GCP', 'Docker', 'Kubernetes', 'Git',
    'Machine Learning', 'Deep Learning', 'REST API', 'GraphQL', 'Agile'
  ];

  const foundSkills = knownSkills.filter(skill =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    skills: foundSkills
  };
}
