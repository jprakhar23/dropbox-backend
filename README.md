# Dropbox Clone - Backend API

RESTful API server for file storage application built with Node.js, Express, and SQLite.

## Here's the demo
[Deployed app](https://tranquil-kleicha-7cc256.netlify.app/)

## Features

- File upload/download with validation (txt, jpg, png, json, pdf)
- Complete CRUD operations for file management
- SQLite database with filesystem storage
- CORS support and error handling
- Health monitoring endpoints

## Tech Stack

- Node.js 18+ with Express.js
- SQLite3 database
- Multer for file uploads

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dropbox-clone-backend.git
cd dropbox-clone-backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./database.sqlite
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |
| `GET` | `/api/files` | List all files |
| `POST` | `/api/files` | Upload file |
| `GET` | `/api/files/:id` | Get file metadata |
| `GET` | `/api/files/:id/download` | Download file |
| `DELETE` | `/api/files/:id` | Delete file |

**File Constraints:** 10MB max, supports txt/jpg/png/json/pdf

## Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Upload file
curl -X POST -F "file=@document.txt" http://localhost:5000/api/files

# List files
curl http://localhost:5000/api/files
```

Server runs on `http://localhost:5000`

## Installation

```bash
# Clone and install
git clone <repository-url>
cd dropbox-backend
npm install

# Configure environment
cp .env.example .env

# Start server
npm run dev  # development
npm start    # production
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_PATH=./database.sqlite
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```
