# Syllabus Importer

A production-grade application that transforms syllabus documents into actionable tasks and calendar events using AI-powered parsing and a clean Notion-style interface.

![Syllabus Importer Screenshot](https://via.placeholder.com/800x400?text=Syllabus+Importer+Screenshot)

## Features

- **🚀 Smart Upload**: Drag-and-drop interface supporting PDF, DOCX, and TXT files
- **🤖 AI Parsing**: Intelligent extraction of assignments, exams, deadlines, and events
- **📊 Confidence Scoring**: AI provides confidence levels for extracted items with human-in-the-loop review
- **✏️ Inline Editing**: Notion-style editable table for reviewing and correcting items
- **📅 Calendar Integration**: Export to ICS or sync with Google Calendar
- **⌨️ Keyboard Navigation**: Full keyboard support with Cmd/Ctrl+K command menu
- **♿ Accessibility**: WCAG AA compliant with screen reader support
- **🌙 Dark Mode**: Automatic theme switching based on system preference
- **📱 Responsive**: Works beautifully on desktop, tablet, and mobile

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
   
   # Update DATABASE_URL in .env with your PostgreSQL connection string
   
   # Run migrations
   npx prisma migrate dev
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Visit [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS with custom Notion-inspired design tokens
- **UI Components**: Radix UI primitives with custom styling
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion (respects reduced motion)
- **Testing**: Jest, React Testing Library, Playwright
- **CI/CD**: GitHub Actions, Vercel deployment

## Architecture

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
```

## Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

Create a `.env` file with:

```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/syllabus_db"
NODE_ENV="development"

# Optional
GOOGLE_CLIENT_ID=""              # Google Calendar integration
GOOGLE_CLIENT_SECRET=""          # Google Calendar integration
BLOB_READ_WRITE_TOKEN=""         # Vercel Blob storage
OPENAI_API_KEY=""               # Enhanced parsing with OpenAI
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fsyllabus-importer)

See [DEPLOY.md](docs/DEPLOY.md) for detailed deployment instructions.

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

The application uses a Notion-inspired design system featuring:

- **Colors**: Neutral grays (#ffffff/#0b0b0c) with blue accent (HSL 220 96% 55%)
- **Typography**: Inter font, 16px base, 1.55 line height, 500 weight for headings
- **Spacing**: Generous whitespace with compact data tables
- **Interactions**: Subtle hover states, 2px focus rings
- **Accessibility**: 4.5:1 contrast ratio, full keyboard navigation

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

## Support

- 📧 Email: support@syllabus-importer.com
- 💬 Discord: [Join our community](https://discord.gg/syllabus-importer)
- 📖 Documentation: [Full docs](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/syllabus-importer/issues)

---

<p align="center">
  Made with ❤️ by the Syllabus Importer team
</p>