require('dotenv').config();
const { getSqlPool } = require('./src/config/db');

async function test() {
    try {
        await getSqlPool();
        console.log("Success");
    } catch (err) {
        console.error("Error:", err);
    }
}
test();
