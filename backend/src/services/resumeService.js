const { getDocumentAnalysisClient } = require('../config/azure');

/**
 * Extract structured data from a resume buffer using Azure AI Document Intelligence.
 * Falls back to placeholder data if the service is not configured.
 *
 * @param {Buffer} fileBuffer - The resume file buffer.
 * @param {string} mimeType - MIME type of the file.
 * @returns {Object} Extracted resume fields.
 */
async function extractResumeData(fileBuffer, mimeType) {
  try {
    const client = getDocumentAnalysisClient();
    const poller = await client.beginAnalyzeDocument('prebuilt-read', fileBuffer, { contentType: mimeType });
    const result = await poller.pollUntilDone();

    const fullText = result.content || '';
    return parseResumeText(fullText);
  } catch (err) {
    // Graceful degradation if service is not configured or unavailable
    if (err.message.includes('not configured') || err.code === 'ENOTFOUND') {
      console.warn('Azure AI Document Intelligence not available, returning placeholder data:', err.message);
      return {
        name: null,
        email: null,
        phone: null,
        skills: [],
        education: [],
        experience: [],
        rawText: null
      };
    }
    throw err;
  }
}

/**
 * Parse extracted text from a resume to identify key fields.
 * Uses simple heuristics for skill, email, and phone extraction.
 *
 * @param {string} text - Raw text content of the resume.
 * @returns {Object} Parsed resume fields.
 */
function parseResumeText(text) {
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);

  // Common tech skills to detect — pre-compiled regexps for efficiency
  const knownSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cosmos DB',
    'Azure', 'AWS', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
  ];

  const skillRegexps = knownSkills.map(skill => ({
    name: skill,
    re: new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  }));

  const foundSkills = skillRegexps.filter(({ re }) => re.test(text)).map(({ name }) => name);

  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    skills: foundSkills,
    rawText: text.substring(0, 500) // Store first 500 chars for reference
  };
}

module.exports = { extractResumeData };
