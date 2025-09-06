# Syllabus Importer

A production-grade application that transforms syllabus documents into actionable tasks and calendar events using AI-powered parsing.

## Features

- **Smart Upload**: Drag-and-drop interface supporting PDF, DOCX, and TXT files
- **AI Parsing**: Intelligent extraction of assignments, exams, deadlines, and events
- **Confidence Scoring**: AI provides confidence levels for extracted items
- **Inline Editing**: Notion-style editable table for reviewing and correcting items
- **Calendar Integration**: Export to ICS or sync with Google Calendar
- **Keyboard Navigation**: Full keyboard support with Cmd/Ctrl+K command menu
- **Accessibility**: WCAG AA compliant with screen reader support
- **Dark Mode**: Automatic theme switching based on system preference

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd syllabus
   npm install
   ```

2. **Set up Database**
   ```bash
   # Copy environment variables
   cp .env.example .env
   
   # Update DATABASE_URL in .env
   # For development, you can use a local PostgreSQL instance
   
   # Run migrations
   npx prisma migrate dev
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Visit http://localhost:3000

## Project Structure

```
/app                 # Next.js App Router
  /api              # API routes
  /upload           # Upload page
  /review           # Review and edit tasks
  /calendar         # Calendar view
  /export           # Export and sync
  /settings         # User preferences

/components         # UI components
  /ui              # Base UI components (buttons, inputs, etc.)
  /layout          # Layout components (sidebar, page shell)
  /upload          # Upload-specific components
  /review          # Review table and editing components

/lib               # Utilities and shared code
  /utils           # Utility functions
  prisma.ts        # Database client

/prisma            # Database schema and migrations
/docs              # Documentation
/tests             # Test files
```

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS with custom design tokens
- **UI Components**: Radix UI primitives with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion (respects reduced motion)
- **Testing**: Jest, React Testing Library, Playwright

## Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `GOOGLE_CLIENT_ID/SECRET`: For Google Calendar integration (optional)
- `BLOB_READ_WRITE_TOKEN`: For file storage (optional)
- `OPENAI_API_KEY`: For enhanced parsing (optional)

## Design System

The application uses a Notion-inspired design system with:

- **Colors**: Neutral grays with blue accent
- **Typography**: Inter font, 16px base size, 1.55 line height
- **Spacing**: Generous whitespace, compact data tables
- **Interactions**: Subtle hover states, focus rings
- **Accessibility**: 4.5:1 contrast ratio, keyboard navigation

## API Documentation

### Upload Syllabus
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (PDF/DOCX/TXT, max 10MB)
Response: { syllabusId: string, status: string }
```

### Get Syllabus
```
GET /api/syllabi/[id]
Response: { id, title, items: [...] }
```

### Update Item
```
PUT /api/items/[id]
Body: { title?, type?, dueDate?, weight?, description? }
Response: Updated item
```

### Export ICS
```
GET /api/syllabi/[id]/ics
Response: ICS file download
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details
