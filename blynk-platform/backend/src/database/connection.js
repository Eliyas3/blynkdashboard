const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('🔗 New database connection established');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
});

async function initializeDatabase() {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        return true;
    } catch (error) {
        throw new Error(`Database connection failed: ${error.message}`);
    }
}

async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log(`📊 Query executed in ${duration}ms`);
        }
        return res;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

async function getClient() {
    return await pool.connect();
}

module.exports = {
    pool,
    query,
    getClient,
    initializeDatabase
};
