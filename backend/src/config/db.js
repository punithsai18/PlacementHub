<<<<<<< HEAD
const sql = require('mssql'); // Microsoft SQL Server Native Client
const { CosmosClient } = require('@azure/cosmos'); // Azure Cosmos DB SDK

// Configure Azure SQL Database connection properties
// These settings are pulled straight from your environment variables
=======
const sql = require('mssql');
const { CosmosClient } = require('@azure/cosmos');

// Azure SQL configuration
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
const sqlConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  server: process.env.AZURE_SQL_SERVER,
  pool: {
<<<<<<< HEAD
    max: 10, // Max number of concurrent connections in the pool
    min: 0, // Min connections (start with none)
    idleTimeoutMillis: 30000 // Close idle connections after 30 seconds
  },
  options: {
    encrypt: true, // Required for Azure SQL connections for security
    trustServerCertificate: false // Do not bypass SSL validation
  }
};

let sqlPool = null; // Store the active SQL connection pool to prevent reconnecting on every request

// Retrieve the global Azure SQL connection pool asynchronously
async function getSqlPool() {
  if (!sqlPool) { // Initialize the pool only if it hasn't been created yet
=======
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let sqlPool = null;

async function getSqlPool() {
  if (!sqlPool) {
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
    if (!process.env.AZURE_SQL_SERVER) {
      throw new Error('Azure SQL environment variables are not configured. Please set AZURE_SQL_SERVER, AZURE_SQL_USER, AZURE_SQL_PASSWORD, AZURE_SQL_DATABASE.');
    }
    try {
<<<<<<< HEAD
      sqlPool = await sql.connect(sqlConfig); // Establish connection with the DB
=======
      sqlPool = await sql.connect(sqlConfig);
>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
      console.log('Connected to Azure SQL Database');
    } catch (err) {
      console.error('Azure SQL connection failed:', err.message);
      throw err;
    }
  }
  return sqlPool;
}

<<<<<<< HEAD
// Global variables to store Cosmos DB client instances for chat features
let cosmosClient = null;
let cosmosDb = null;

// Initialize the Cosmos DB Client Singleton
=======
// Cosmos DB configuration
let cosmosClient = null;
let cosmosDb = null;

>>>>>>> 3e137e57eb8ef42b74345ff2decff774e61fb394
function getCosmosClient() {
  if (!cosmosClient) {
    if (!process.env.COSMOS_DB_ENDPOINT || !process.env.COSMOS_DB_KEY) {
      throw new Error('Cosmos DB environment variables are not configured. Please set COSMOS_DB_ENDPOINT and COSMOS_DB_KEY.');
    }
    cosmosClient = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT,
      key: process.env.COSMOS_DB_KEY
    });
  }
  return cosmosClient;
}

async function getCosmosDb() {
  if (!cosmosDb) {
    const client = getCosmosClient();
    const dbName = process.env.COSMOS_DB_NAME || 'placementhub';
    const { database } = await client.databases.createIfNotExists({ id: dbName });
    cosmosDb = database;
    console.log('Connected to Cosmos DB');
  }
  return cosmosDb;
}

module.exports = { getSqlPool, getCosmosDb, sql };
