const { getSearchClient, getSearchIndexClient } = require('../config/azure');

const INDEX_NAME = process.env.AZURE_SEARCH_INDEX || 'candidates';

/**
 * Search for candidates in Azure Cognitive Search by skills or query.
 *
 * @param {string} searchText - Skills or free-text query.
 * @param {Object} options - Additional search options.
 * @returns {Array} Search results.
 */
async function searchCandidates(searchText, options = {}) {
  try {
    const client = getSearchClient(INDEX_NAME);
    const searchResults = await client.search(searchText, {
      select: ['id', 'name', 'email', 'skills', 'course', 'graduationYear'],
      top: options.top || 20,
      skip: options.skip || 0,
      searchFields: ['name', 'skills', 'course'],
      queryType: 'simple'
    });

    const results = [];
    for await (const result of searchResults.results) {
      results.push(result.document);
    }
    return results;
  } catch (err) {
    if (err.message.includes('not configured') || err.code === 'ENOTFOUND') {
      console.warn('Azure Cognitive Search not available, returning empty results:', err.message);
      return [];
    }
    throw err;
  }
}

/**
 * Index a student document into Azure Cognitive Search.
 *
 * @param {Object} student - Student data to index.
 */
async function indexStudent(student) {
  try {
    const client = getSearchClient(INDEX_NAME);
    await client.uploadDocuments([{
      id: student.id.toString(),
      name: student.name,
      email: student.email,
      skills: student.skills || '',
      course: student.course || '',
      graduationYear: student.graduationYear || null
    }]);
  } catch (err) {
    if (err.message.includes('not configured')) {
      console.warn('Azure Cognitive Search not configured, skipping index:', err.message);
      return;
    }
    throw err;
  }
}

module.exports = { searchCandidates, indexStudent };
