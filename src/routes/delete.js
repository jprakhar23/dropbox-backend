const express = require('express');
const fs = require('fs');

const { runQuery, getOne } = require('../database');

const router = express.Router();

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete a file by ID
 * @access  Public
 */
router.delete('/:id', async (req, res, next) => {
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
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`File deleted from filesystem: ${filePath}`);
            } catch (fsError) {
                console.error('Error deleting file from filesystem:', fsError);
            }
        } else {
            console.log(`File not found on filesystem: ${filePath}`);
        }

        const result = await runQuery(
            'DELETE FROM files WHERE id = ?',
            [fileId]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'File not found in database'
            });
        }

        res.status(200).json({
            success: true,
            message: 'File deleted successfully',
            data: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                originalName: fileRecord.original_name
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;