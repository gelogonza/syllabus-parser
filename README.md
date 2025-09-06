# Syllabus Importer

A web application that converts syllabus documents into structured tasks and calendar events. Built with Next.js and designed with a clean, minimal interface inspired by Notion.

## Features

- **Document Upload**: Drag-and-drop interface supporting PDF, DOCX, and TXT files
- **Content Parsing**: Extracts assignments, exams, deadlines, and events from uploaded documents
- **Confidence Scoring**: Provides reliability indicators for extracted content with manual review options
- **Inline Editing**: Editable table interface for reviewing and correcting extracted items
- **Calendar Export**: Generate ICS files and sync with Google Calendar
- **Keyboard Navigation**: Full keyboard support with command menu (Cmd/Ctrl+K)
- **Accessibility**: WCAG AA compliant with screen reader support
- **Dark Mode**: Automatic theme switching based on system preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd syllabus
npm install
```

Set up the database:

```bash
# Copy environment variables
cp .env.example .env

# Add your PostgreSQL connection string to .env
# DATABASE_URL="postgresql://username:password@localhost:5432/syllabus_db"

# Run database migrations
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: TailwindCSS with custom design tokens
- **UI Components**: Radix UI primitives with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion with reduced motion support
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions, Vercel deployment

## Architecture

The application follows a standard three-tier architecture with a React frontend, Next.js API layer, and PostgreSQL database. The frontend handles user interactions and form validation, the API layer processes file uploads and manages data operations, and the database stores user information and extracted syllabus content.

## Development

Available commands:

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

Create a `.env` file with your database connection:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/syllabus_db"
NODE_ENV="development"

# Optional integrations
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
BLOB_READ_WRITE_TOKEN=""
OPENAI_API_KEY=""
```

## Deployment

The application can be deployed to Vercel or any platform supporting Next.js:

1. Connect your repository to your hosting platform
2. Set the required environment variables
3. Deploy from the main branch

See [docs/DEPLOY.md](docs/DEPLOY.md) for detailed deployment instructions.

## Project Structure

```
/app                 # Next.js App Router pages and API routes
/components          # Reusable UI components
  /ui               # Base UI components (buttons, inputs, etc.)
  /layout           # Layout components (sidebar, page shell)
  /upload           # Upload-specific components
  /review           # Review table and editing components
/lib                # Utilities and shared code
  /utils            # Utility functions
  prisma.ts         # Database client
/prisma             # Database schema and migrations
/docs               # Comprehensive documentation
/tests              # Unit, integration, and E2E tests
```

## Documentation

- [System Design](docs/SYSTEM_DESIGN.md) - Architecture and design decisions
- [API Specification](docs/API_SPEC.md) - Complete API documentation
- [Deployment Guide](docs/DEPLOY.md) - Production deployment instructions
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## Design System

The interface uses a minimal design system with:

- **Colors**: Neutral grays with a blue accent color
- **Typography**: Inter font family with consistent sizing
- **Layout**: Clean spacing and organized data presentation
- **Interactions**: Subtle hover effects and focus indicators
- **Accessibility**: High contrast ratios and keyboard navigation support

## API Example

```javascript
// Upload a syllabus
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { syllabusId } = await response.json();

// Get syllabus with extracted items
const syllabus = await fetch(`/api/syllabi/${syllabusId}`).then(r => r.json());

// Update an item
await fetch(`/api/items/${itemId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Updated Assignment Title',
    dueDate: '2024-03-15T23:59:00Z'
  })
});
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

