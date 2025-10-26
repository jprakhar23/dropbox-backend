const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`${timestamp} - ${method} ${url} - ${ip} - ${userAgent}`);

    const startTime = Date.now();

    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        const statusColor = getStatusColor(statusCode);
        
        console.log(`${timestamp} - ${method} ${url} - ${statusColor}${statusCode}\x1b[0m - ${responseTime}ms`);
        
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Get color code for status code

const getStatusColor = (statusCode) => {
    if (statusCode >= 500) {
        return '\x1b[31m'; // Red
    } else if (statusCode >= 400) {
        return '\x1b[33m'; // Yellow
    } else if (statusCode >= 300) {
        return '\x1b[36m'; // Cyan
    } else if (statusCode >= 200) {
        return '\x1b[32m'; // Green
    } else {
        return '\x1b[0m';  // Default
    }
};

module.exports = logger;