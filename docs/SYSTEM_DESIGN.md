# System Design

## Architecture Overview

The Syllabus Importer is built as a modern web application with a clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - React UI      │    │ - File Upload   │    │ - User Data     │
│ - TanStack Query│    │ - Parsing Jobs  │    │ - Syllabi       │
│ - Form Handling │    │ - CRUD Ops      │    │ - Items         │
│ - State Mgmt    │    │ - Export/Sync   │    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  External APIs  │
                    │                 │
                    │ - Google Cal    │
                    │ - File Storage  │
                    │ - OpenAI (opt)  │
                    └─────────────────┘
```

## Data Flow

### 1. Upload Flow
```
User uploads file → Validation → Store metadata → Start parsing → Return job ID
                                      ↓
Background job → Extract text → Parse content → Store items → Update status
```

### 2. Review Flow
```
User loads review → Fetch syllabus+items → Display editable table → Save changes → Update DB
```

### 3. Export Flow
```
User requests export → Fetch items → Generate ICS → Return file/sync to calendar
```

## Key Components

### Frontend Architecture

- **Pages**: Route-based pages using Next.js App Router
- **Components**: Reusable UI components with Radix primitives
- **State Management**: TanStack Query for server state, React state for UI
- **Forms**: React Hook Form with Zod validation
- **Styling**: TailwindCSS with custom design tokens

### API Design

- **RESTful endpoints** with proper HTTP methods
- **Zod validation** for all inputs
- **Error handling** with consistent error responses
- **Rate limiting** to prevent abuse
- **Audit logging** for security compliance

### Database Schema

```sql
Users (id, email, name, timestamps)
  ├── Syllabi (id, title, course, file_info, status, timestamps)
  │   └── SyllabusItems (id, title, type, due_date, weight, confidence)
  ├── AuditLogs (id, action, entity, changes, ip, timestamps)
  └── OAuthTokens (id, provider, tokens, timestamps)
```

## Parsing Pipeline

### 1. Ingest Stage
- Accept PDF, DOCX, TXT files
- Validate file size and type
- Extract raw text content

### 2. Normalize Stage
- Clean up text formatting
- Remove headers/footers
- Standardize line breaks

### 3. Segment Stage
- Split into logical sections
- Identify course information
- Separate schedule from policies

### 4. Extract Stage
- Use regex patterns for dates
- Identify assignment keywords
- Parse weights and percentages
- Use chrono-node for flexible date parsing

### 5. Validate Stage
- Check date validity
- Ensure required fields
- Calculate confidence scores

### 6. Map Stage
- Map to database schema
- Assign item types
- Set default values

### 7. Post-process Stage
- Sort by due date
- Flag low-confidence items
- Generate summaries

## Security Considerations

### Data Protection
- **Encryption at rest** for sensitive data
- **HTTPS only** for all communications
- **Input validation** on all endpoints
- **SQL injection prevention** via Prisma ORM

### Access Control
- **Session-based auth** with secure cookies
- **Rate limiting** on API endpoints
- **File size limits** to prevent DoS
- **MIME type validation** for uploads

### Privacy
- **Audit logging** for compliance
- **Data retention policies**
- **User consent** for data processing
- **GDPR compliance** considerations

## Performance Optimizations

### Frontend
- **Code splitting** with Next.js
- **Image optimization** built-in
- **Caching** with TanStack Query
- **Lazy loading** for large tables

### Backend
- **Database indexing** on common queries
- **Connection pooling** with Prisma
- **Background jobs** for parsing
- **CDN** for static assets

### Database
- **Proper indexes** on foreign keys and queries
- **Query optimization** with Prisma
- **Connection limits** to prevent exhaustion

## Scalability

### Horizontal Scaling
- **Stateless API** design
- **Database connection pooling**
- **Background job queues**
- **CDN for static assets**

### Vertical Scaling
- **Efficient queries** with proper indexing
- **Memory management** in parsing
- **File streaming** for large uploads

## Monitoring & Observability

### Logging
- **Structured logging** with correlation IDs
- **Error tracking** with stack traces
- **Performance metrics** for key operations
- **Audit trails** for security

### Metrics
- **Response times** for API endpoints
- **Error rates** by endpoint
- **Upload success rates**
- **User engagement** metrics

### Alerting
- **High error rates**
- **Slow response times**
- **Database connection issues**
- **Storage space warnings**

## Deployment Architecture

### Development
- Local PostgreSQL database
- Hot reloading with Next.js
- Local file storage

### Production
- **Vercel** for hosting and serverless functions
- **Neon/Vercel Postgres** for database
- **Vercel Blob** for file storage
- **GitHub Actions** for CI/CD
