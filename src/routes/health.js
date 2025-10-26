const express = require('express');
const { getDatabase } = require('../database');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint - verify server and database are working
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const healthCheck = {
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            database: {
                status: 'disconnected',
                message: 'Database connection not verified'
            }
        };

        try {
            const db = getDatabase();
            
            await new Promise((resolve, reject) => {
                db.get('SELECT 1 as test', (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });

            await new Promise((resolve, reject) => {
                db.get(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='files'", 
                    (err, row) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(row);
                    }
                );
            });

            healthCheck.database = {
                status: 'connected',
                message: 'Database connection successful',
                tables: ['files']
            };

        } catch (dbError) {
            console.error('Health check database error:', dbError);
            healthCheck.database = {
                status: 'error',
                message: dbError.message
            };
            
            healthCheck.success = false;
            healthCheck.message = 'Server running but database has issues';
        }

        res.status(200).json(healthCheck);

    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            timestamp: new Date().toISOString(),
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/health/database
 * @desc    Detailed database health check
 * @access  Public
 */
router.get('/database', async (req, res) => {
    try {
        const db = getDatabase();
        
        const dbInfo = await new Promise((resolve, reject) => {
            db.get("SELECT sqlite_version() as version", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });

        const tables = await new Promise((resolve, reject) => {
            db.all(
                "SELECT name FROM sqlite_master WHERE type='table'", 
                (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(rows);
                }
            );
        });

        const fileCount = await new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) as count FROM files", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });

        res.status(200).json({
            success: true,
            message: 'Database health check successful',
            database: {
                version: dbInfo.version,
                tables: tables.map(t => t.name),
                fileCount: fileCount.count,
                path: process.env.DB_PATH || 'default'
            }
        });

    } catch (error) {
        console.error('Database health check error:', error);
        res.status(503).json({
            success: false,
            message: 'Database health check failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;