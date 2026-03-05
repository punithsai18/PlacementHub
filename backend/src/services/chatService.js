const { getCosmosDb } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const CONTAINER_NAME = 'messages';

/**
 * Get or create the messages container in Cosmos DB.
 */
async function getContainer() {
  const db = await getCosmosDb();
  const { container } = await db.containers.createIfNotExists({
    id: CONTAINER_NAME,
    partitionKey: { paths: ['/userId'] }
  });
  return container;
}

/**
 * Save a chat message to Cosmos DB.
 *
 * @param {Object} messageData - Message data.
 * @returns {Object} Saved message.
 */
async function saveMessage(messageData) {
  try {
    const container = await getContainer();
    const message = {
      id: uuidv4(),
      userId: messageData.fromUserId,
      ...messageData,
      timestamp: messageData.timestamp || new Date().toISOString()
    };
    const { resource } = await container.items.create(message);
    return resource;
  } catch (err) {
    if (err.message.includes('not configured')) {
      console.warn('Cosmos DB not configured, message not persisted:', err.message);
      return { ...messageData, id: uuidv4() };
    }
    throw err;
  }
}

/**
 * Retrieve chat history for a specific user from Cosmos DB.
 *
 * @param {string} userId - The user ID.
 * @param {number} limit - Maximum number of messages to return.
 * @returns {Array} Chat messages.
 */
async function getChatHistory(userId, limit = 50) {
  try {
    const container = await getContainer();
    const querySpec = {
      query: `SELECT TOP @limit * FROM c WHERE c.userId = @userId OR c.toUserId = @userId
              ORDER BY c.timestamp DESC`,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@limit', value: limit }
      ]
    };
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources.reverse();
  } catch (err) {
    if (err.message.includes('not configured')) {
      console.warn('Cosmos DB not configured, returning empty history:', err.message);
      return [];
    }
    throw err;
  }
}

module.exports = { saveMessage, getChatHistory };
