# API Specification

## Base URL
```
Production: https://your-app.vercel.app/api
Development: http://localhost:3000/api
```

## Authentication
Currently uses mock authentication. In production, implement:
- Session-based authentication with secure cookies
- JWT tokens for API access
- OAuth integration for Google Calendar

## Endpoints

### Upload Syllabus
```http
POST /upload
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: File (PDF/DOCX/TXT, max 10MB)

**Response:**
```json
{
  "syllabusId": "cuid",
  "status": "uploaded",
  "message": "File uploaded successfully and parsing started"
}
```

**Error Responses:**
- `400`: Invalid file type or size
- `500`: Server error

---

### Get Syllabus
```http
GET /syllabi/{id}
```

**Response:**
```json
{
  "id": "cuid",
  "title": "Course Syllabus",
  "courseName": "Computer Science 101",
  "semester": "Fall",
  "year": 2024,
  "instructor": "Dr. Smith",
  "fileName": "syllabus.pdf",
  "fileSize": 1024000,
  "fileMimeType": "application/pdf",
  "status": "PARSED",
  "parsedAt": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "items": [
    {
      "id": "cuid",
      "title": "Assignment 1: Introduction",
      "type": "ASSIGNMENT",
      "dueDate": "2024-02-15T23:59:00Z",
      "weight": 10.0,
      "description": "Basic programming exercises",
      "confidence": 0.9,
      "sourceLine": "Assignment 1 due February 15th",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `404`: Syllabus not found
- `500`: Server error

---

### Update Syllabus
```http
PUT /syllabi/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "courseName": "Updated Course Name",
  "semester": "Spring",
  "year": 2024,
  "instructor": "Dr. Johnson"
}
```

**Response:** Updated syllabus object (same as GET)

---

### Update Syllabus Item
```http
PUT /items/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Assignment Title",
  "type": "ASSIGNMENT",
  "dueDate": "2024-03-01T23:59:00Z",
  "weight": 15.0,
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "cuid",
  "title": "Updated Assignment Title",
  "type": "ASSIGNMENT",
  "dueDate": "2024-03-01T23:59:00Z",
  "weight": 15.0,
  "description": "Updated description",
  "confidence": 0.9,
  "sourceLine": "Original source line",
  "syllabusId": "cuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Item not found
- `500`: Server error

---

### Delete Syllabus Item
```http
DELETE /items/{id}
```

**Response:**
```json
{
  "success": true
}
```

**Error Responses:**
- `404`: Item not found
- `500`: Server error

---

### Export ICS
```http
GET /syllabi/{id}/ics
```

**Response:** ICS file download
```
Content-Type: text/calendar
Content-Disposition: attachment; filename="syllabus.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Syllabus Importer//EN
BEGIN:VEVENT
UID:assignment-1@syllabus-app.com
DTSTART:20240215T235900Z
SUMMARY:Assignment 1: Introduction
DESCRIPTION:Basic programming exercises
END:VEVENT
END:VCALENDAR
```

---

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "version": "1.0.0"
}
```

## Data Types

### Syllabus Status
- `UPLOADED`: File uploaded, parsing not started
- `PARSING`: Currently being parsed
- `PARSED`: Successfully parsed
- `ERROR`: Parsing failed
- `REVIEW_NEEDED`: Low confidence items need review

### Item Type
- `ASSIGNMENT`: Homework, projects, papers
- `EXAM`: Midterms, finals
- `QUIZ`: Short assessments
- `PROJECT`: Long-term projects
- `READING`: Reading assignments
- `EVENT`: Class events, presentations
- `DEADLINE`: General deadlines

### Validation Rules

#### File Upload
- **Size**: Maximum 10MB
- **Types**: PDF, DOCX, TXT only
- **Name**: Must be valid filename

#### Syllabus
- **title**: 1-200 characters
- **courseName**: 1-100 characters
- **semester**: Optional string
- **year**: 2000-2100
- **instructor**: 0-100 characters

#### Syllabus Item
- **title**: 1-200 characters, required
- **type**: Must be valid ItemType enum
- **dueDate**: Valid ISO 8601 datetime
- **weight**: 0-100 (percentage)
- **description**: 0-1000 characters
- **confidence**: 0.0-1.0 (auto-generated)

## Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `FILE_TOO_LARGE`: File exceeds size limit
- `INVALID_FILE_TYPE`: Unsupported file format
- `NOT_FOUND`: Resource not found
- `PARSING_FAILED`: Syllabus parsing failed
- `DATABASE_ERROR`: Database operation failed
- `RATE_LIMITED`: Too many requests

## Rate Limiting

- **Upload**: 5 requests per minute per IP
- **API calls**: 100 requests per minute per user
- **Export**: 10 requests per minute per user

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks (Future)

For real-time updates on parsing status:

```http
POST /webhooks/parsing
Content-Type: application/json
```

**Payload:**
```json
{
  "event": "parsing.completed",
  "syllabusId": "cuid",
  "status": "PARSED",
  "itemCount": 15,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Example (JavaScript)

```javascript
class SyllabusAPI {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async uploadSyllabus(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return response.json();
  }

  async getSyllabus(id) {
    const response = await fetch(`${this.baseUrl}/syllabi/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    return response.json();
  }

  async updateItem(id, data) {
    const response = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  }
}
```
