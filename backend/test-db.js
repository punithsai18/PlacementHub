const mssql = require('mssql');

const config = {
    user: 'placementadmin',
    password: 'P@ssw0rd1914!',
    server: 'placementhub1914-sql.database.windows.net',
    database: 'placementhub',
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

async function testConnection() {
    try {
        await mssql.connect(config);
        console.log("Connection successful!");
    } catch (err) {
        console.error("Connection Error Details:");
        console.error(err.originalError || err);
    } finally {
        mssql.close();
    }
}

testConnection();
