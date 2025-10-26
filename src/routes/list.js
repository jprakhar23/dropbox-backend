const express = require('express');

const { getAll, getOne } = require('../database');

const router = express.Router();

/**
 * @route   GET /api/files
 * @desc    Get list of all uploaded files
 * @access  Public
 */
router.get('/', async (req, res, next) => {
    try {
        const files = await getAll(
            'SELECT id, filename, original_name, file_size, mime_type, upload_date FROM files ORDER BY upload_date DESC'
        );

        const formattedFiles = files.map(file => ({
            id: file.id,
            filename: file.filename,
            originalName: file.original_name,
            size: file.file_size,
            mimeType: file.mime_type,
            uploadDate: file.upload_date,
            downloadUrl: `/api/files/${file.id}/download`
        }));

        res.status(200).json({
            success: true,
            message: 'Files retrieved successfully',
            data: formattedFiles,
            count: formattedFiles.length
        });

    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/files/:id
 * @desc    Get file metadata by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
    try {
        const fileId = req.params.id;

        const fileRecord = await getOne(
            'SELECT id, filename, original_name, file_size, mime_type, upload_date FROM files WHERE id = ?',
            [fileId]
        );

        if (!fileRecord) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File metadata retrieved successfully',
            data: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                originalName: fileRecord.original_name,
                size: fileRecord.file_size,
                mimeType: fileRecord.mime_type,
                uploadDate: fileRecord.upload_date,
                downloadUrl: `/api/files/${fileRecord.id}/download`
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;