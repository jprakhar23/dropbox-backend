const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    let error = {
        success: false,
        message: err.message || 'Internal Server Error'
    };

    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        return res.status(404).json(error);
    }

    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        return res.status(400).json(error);
    }

    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json(error);
    }

    if (err.code) {
        switch (err.code) {
            case 'SQLITE_CONSTRAINT_UNIQUE':
                error.message = 'Duplicate entry found';
                return res.status(409).json(error);
            case 'SQLITE_CONSTRAINT':
                error.message = 'Database constraint violation';
                return res.status(400).json(error);
            case 'ENOENT':
                error.message = 'File not found';
                return res.status(404).json(error);
            default:
                error.message = 'Database error occurred';
                return res.status(500).json(error);
        }
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
        error.message = 'File too large';
        return res.status(413).json(error);
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error.message = 'Unexpected file field';
        return res.status(400).json(error);
    }

    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        return res.status(401).json(error);
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        return res.status(401).json(error);
    }

    const statusCode = err.statusCode || 500;
    
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        error.message = 'Something went wrong';
    }

    if (process.env.NODE_ENV === 'development') {
        error.stack = err.stack;
    }

    res.status(statusCode).json(error);
};

module.exports = errorHandler;