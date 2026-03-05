const { BlobServiceClient } = require('@azure/storage-blob');
const { DocumentAnalysisClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const { SearchClient, SearchIndexClient } = require('@azure/search-documents');
const { WebPubSubServiceClient } = require('@azure/web-pubsub');
const { createClient } = require('redis');

// Azure Blob Storage
function getBlobServiceClient() {
  if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not configured.');
  }
  return BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
}

// Azure AI Document Intelligence (Form Recognizer)
function getDocumentAnalysisClient() {
  if (!process.env.AZURE_FORM_RECOGNIZER_ENDPOINT || !process.env.AZURE_FORM_RECOGNIZER_KEY) {
    throw new Error('Azure AI Document Intelligence environment variables are not configured. Please set AZURE_FORM_RECOGNIZER_ENDPOINT and AZURE_FORM_RECOGNIZER_KEY.');
  }
  return new DocumentAnalysisClient(
    process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY)
  );
}

// Azure Cognitive Search
function getSearchClient(indexName) {
  if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
    throw new Error('Azure Cognitive Search environment variables are not configured. Please set AZURE_SEARCH_ENDPOINT and AZURE_SEARCH_KEY.');
  }
  return new SearchClient(
    process.env.AZURE_SEARCH_ENDPOINT,
    indexName || process.env.AZURE_SEARCH_INDEX || 'candidates',
    new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
  );
}

function getSearchIndexClient() {
  if (!process.env.AZURE_SEARCH_ENDPOINT || !process.env.AZURE_SEARCH_KEY) {
    throw new Error('Azure Cognitive Search environment variables are not configured.');
  }
  return new SearchIndexClient(
    process.env.AZURE_SEARCH_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_SEARCH_KEY)
  );
}

// Azure Web PubSub
function getWebPubSubClient(hub) {
  if (!process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING) {
    throw new Error('AZURE_WEB_PUBSUB_CONNECTION_STRING is not configured.');
  }
  return new WebPubSubServiceClient(
    process.env.AZURE_WEB_PUBSUB_CONNECTION_STRING,
    hub || process.env.AZURE_WEB_PUBSUB_HUB || 'chat'
  );
}

// Redis Cache
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    if (!process.env.REDIS_CONNECTION_STRING) {
      throw new Error('REDIS_CONNECTION_STRING is not configured.');
    }
    redisClient = createClient({ url: process.env.REDIS_CONNECTION_STRING });
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    console.log('Connected to Redis Cache');
  }
  return redisClient;
}

module.exports = {
  getBlobServiceClient,
  getDocumentAnalysisClient,
  getSearchClient,
  getSearchIndexClient,
  getWebPubSubClient,
  getRedisClient
};
