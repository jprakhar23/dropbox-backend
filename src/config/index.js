const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    path: process.env.DATABASE_PATH || path.join(__dirname, '../database.sqlite')
  },
  
  upload: {
    directory: process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 50MB
    allowedTypes: ['txt', 'jpg', 'jpeg', 'png', 'json', 'pdf']
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
};

module.exports = config;