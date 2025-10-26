const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database.sqlite');

let db = null;

/**
 * Initialize SQLite database connection
 */
const initializeDatabase = async () => {
    return new Promise((resolve, reject) => {
        const dbDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
        });

        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                console.error('Error enabling foreign keys:', err.message);
                reject(err);
                return;
            }
        });

        createTables()
            .then(() => {
                console.log('Database tables created/verified');
                resolve();
            })
            .catch((err) => {
                console.error('Error creating tables:', err);
                reject(err);
            });
    });
};

/**
 * Create database tables
 */
const createTables = async () => {
    return new Promise((resolve, reject) => {
        const createFilesTable = `
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL UNIQUE,
                original_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type TEXT NOT NULL,
                upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        db.run(createFilesTable, (err) => {
            if (err) {
                console.error('Error creating files table:', err.message);
                reject(err);
                return;
            }
            console.log(' Files table created/verified');
            resolve();
        });
    });
};

/**
 * Get database instance
 */
const getDatabase = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
};

/**
 * Execute a query with parameters
 */
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        database.run(query, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
};

/**
 * Get single row from query
 */
const getOne = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        database.get(query, params, (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row);
        });
    });
};

/**
 * Get all rows from query
 */
const getAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        database.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
};

/**
 * Close database connection
 */
const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                    reject(err);
                    return;
                }
                console.log('Database connection closed');
                db = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
};

module.exports = {
    initializeDatabase,
    getDatabase,
    runQuery,
    getOne,
    getAll,
    closeDatabase
};