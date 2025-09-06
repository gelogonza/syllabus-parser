# PDF Parser Microservice

A FastAPI-based microservice for extracting text from PDF files using PyMuPDF (fitz).

## Features

- **Reliable PDF Parsing**: Uses PyMuPDF for robust text extraction
- **File Validation**: Validates file type and size before processing
- **Metadata Extraction**: Returns document metadata along with text
- **Error Handling**: Comprehensive error handling for various PDF issues
- **Health Checks**: Built-in health check endpoints
- **CORS Support**: Configured for Next.js frontend integration

## API Endpoints

### `GET /`
Health check endpoint

### `GET /health`
Detailed health check with service information

### `POST /parse-pdf`
Full PDF parsing with metadata
- **Input**: PDF file (multipart/form-data)
- **Output**: JSON with text, metadata, and page information
- **Max Size**: 10MB

### `POST /parse-pdf-simple`
Simple PDF text extraction
- **Input**: PDF file (multipart/form-data)  
- **Output**: JSON with just text content
- **Max Size**: 10MB

## Local Development

### Option 1: Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

The service will be available at `http://localhost:8001`

### Option 2: Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t pdf-parser .
docker run -p 8001:8001 pdf-parser
```

## Testing

Test the service with curl:

```bash
# Health check
curl http://localhost:8001/health

# Parse a PDF file
curl -X POST -F "file=@sample.pdf" http://localhost:8001/parse-pdf-simple
```

## Integration with Next.js

Update your Next.js file parser to call this service:

```typescript
// In your Next.js API route or parser
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('http://localhost:8001/parse-pdf-simple', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
const extractedText = result.text;
```

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Render

1. Connect your GitHub repository
2. Choose "Web Service"
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker/VPS

```bash
# Build and push to registry
docker build -t your-registry/pdf-parser .
docker push your-registry/pdf-parser

# Deploy on your server
docker run -d -p 8001:8001 your-registry/pdf-parser
```

## Environment Variables

- `PORT`: Service port (default: 8001)
- `CORS_ORIGINS`: Allowed CORS origins (comma-separated)

## Error Handling

The service handles various PDF-related errors:

- **Invalid file type**: Returns 400 with clear message
- **File too large**: Returns 400 with size limit info
- **Corrupted PDF**: Returns 400 with corruption details
- **Password-protected PDF**: Returns 400 with protection notice
- **Server errors**: Returns 500 with error details

## Dependencies

- **FastAPI**: Modern web framework for APIs
- **PyMuPDF**: Reliable PDF parsing library
- **python-magic**: File type detection
- **uvicorn**: ASGI server for FastAPI
