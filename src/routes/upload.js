const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { runQuery, getOne } = require('../database');

const router = express.Router();

const ALLOWED_TYPES = ['txt', 'jpg', 'jpeg', 'png', 'json', 'pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${fileExtension}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (ALLOWED_TYPES.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});

/**
 * @route   POST /api/files
 * @desc    Upload a file
 * @access  Public
 */
router.post('/', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const {
            filename,
            originalname,
            path: filePath,
            size,
            mimetype
        } = req.file;

        const result = await runQuery(
            `INSERT INTO files (filename, original_name, file_path, file_size, mime_type) 
             VALUES (?, ?, ?, ?, ?)`,
            [filename, originalname, filePath, size, mimetype]
        );

        const fileRecord = await getOne(
            'SELECT * FROM files WHERE id = ?',
            [result.lastID]
        );

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                id: fileRecord.id,
                filename: fileRecord.filename,
                originalName: fileRecord.original_name,
                size: fileRecord.file_size,
                mimeType: fileRecord.mime_type,
                uploadDate: fileRecord.upload_date
            }
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
});

module.exports = router;