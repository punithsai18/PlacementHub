const { getBlobServiceClient } = require('../config/azure');

const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER || 'resumes';

/**
 * Ensure the resumes container exists in Azure Blob Storage.
 */
async function ensureContainer() {
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(CONTAINER_NAME);
<<<<<<< HEAD
  await containerClient.createIfNotExists();
=======
  await containerClient.createIfNotExists({ access: 'private' });
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
  return containerClient;
}

/**
 * Upload a resume buffer to Azure Blob Storage.
 *
 * @param {Buffer} buffer - File buffer.
 * @param {string} blobName - Target blob name/path.
 * @param {string} contentType - MIME type.
 * @returns {string} Public URL of the uploaded blob.
 */
async function uploadResume(buffer, blobName, contentType) {
  try {
    const containerClient = await ensureContainer();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });
    return blockBlobClient.url;
  } catch (err) {
    if (err.message.includes('not configured')) {
      console.warn('Azure Blob Storage not configured:', err.message);
      return `local://${blobName}`;
    }
    throw err;
  }
}

/**
 * Delete a resume blob from Azure Blob Storage.
 *
 * @param {string} blobName - Blob name/path to delete.
 */
async function deleteResume(blobName) {
  try {
    const containerClient = await ensureContainer();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error('Failed to delete blob:', err.message);
  }
}

module.exports = { uploadResume, deleteResume };
