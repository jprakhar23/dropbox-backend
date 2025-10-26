const express = require('express');
const fs = require('fs');

const { getOne } = require('../database');

const router = express.Router();

/**
 * @route   GET /api/files/:id/download
 * @desc    Download a file by ID
 * @access  Public
 */
router.get('/:id/download', async (req, res, next) => {
    try {
        const fileId = req.params.id;

        const fileRecord = await getOne(
            'SELECT * FROM files WHERE id = ?',
            [fileId]
        );

        if (!fileRecord) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        const filePath = fileRecord.file_path;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.original_name}"`);
        res.setHeader('Content-Type', fileRecord.mime_type);
        res.setHeader('Content-Length', fileRecord.file_size);

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error reading file'
                });
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;