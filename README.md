# NutriScan

A production-ready nutrition tracking application that scans food labels, estimates nutrition with AI, and provides personalized meal recommendations.

## Features

- Use OCR (Tesseract.js) to extract nutrition facts from food packaging
- Use Open AI to keep track of your nutritional intake
- Visualize charts showing macro/micronutrient intake
- Spreadsheets and tables table with CSV/XLSX export
- Set and keep track of daily nutritional goals & budget
- Receive smart recommendations and get personalized meal suggestions based on deficits and budget

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Table**: TanStack Table
- **Forms**: React Hook Form + Zod validation
- **OCR**: Tesseract.js (client-side)
- **AI**: OpenAI API with function calling
- **Database**: Prisma + SQLite
- **Auth**: NextAuth.js
- **State**: Server Actions + TanStack Query
- **Testing**: Vitest (unit) + Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 18+ or pnpm 8+
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone and install dependencies:**

```bash
cd NutriScan
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32
OPENAI_API_KEY="sk-..."  # Optional: for AI nutrition estimation
```

3. **Run the setup script:**

```bash
pnpm setup
```

This will:
- Install dependencies
- Generate Prisma client
- Run database migrations
- Seed the database with demo data

4. **Start the development server:**

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with `demo@nutriscan.app`.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run unit tests with Vitest
- `pnpm e2e` - Run E2E tests with Playwright
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm seed` - Seed database with demo data
- `pnpm setup` - Complete setup (install + migrate + seed)

## Project Structure

```
NutriScan/
├── app/                      # Next.js 14 App Router
│   ├── (app)/               # Authenticated routes
│   │   ├── dashboard/       # Dashboard with stats and progress
│   │   ├── scan/            # Scan nutrition label (OCR)
│   │   ├── add/             # Add food with AI estimation
│   │   ├── intake/          # Intake table with export
│   │   ├── charts/          # Nutrition visualizations
│   │   ├── recommendations/ # Meal recommendations
│   │   └── settings/        # Goals and budget settings
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── ocr/             # OCR processing
│   │   └── ai/              # AI nutrition estimation
│   └── actions/             # Server actions
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components (nav)
│   ├── dashboard/           # Dashboard-specific components
│   ├── scan/                # Scan flow components
│   ├── add/                 # Add food components
│   ├── intake/              # Intake table components
│   ├── charts/              # Chart components
│   ├── recommendations/     # Recommendations components
│   └── settings/            # Settings components
├── lib/                     # Utilities and shared logic
│   ├── ocr/                 # OCR and nutrition parsing
│   ├── ai/                  # AI nutrition estimation
│   ├── nutrition/           # Nutrition normalization utilities
│   ├── recommendations.ts   # Recommendation engine
│   ├── schemas.ts           # Zod validation schemas
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── prisma/                  # Database
│   ├── schema.prisma        # Prisma schema
│   └── seed.ts              # Seed script
├── tests/                   # Unit tests (Vitest)
├── e2e/                     # E2E tests (Playwright)
└── public/                  # Static assets
```

## Testing

### Unit Tests (Vitest)

```bash
pnpm test
```

Tests cover:
- Nutrition unit normalization (mg↔g, kJ↔kcal)
- OCR nutrition parsing
- Recommendation engine

### E2E Tests (Playwright)

```bash
pnpm e2e
```

Happy path test:
1. Sign in as demo user
2. Add food with AI estimation
3. View dashboard and verify stats
4. Navigate to charts
5. Navigate to intake table and verify export buttons
6. View recommendations
7. Verify settings page

## Security & Privacy

- User authentication via NextAuth
- Email magic link or OAuth providers
- Minimal PII: email only
- OCR images processed client-side (Tesseract.js) or server-side briefly
- No persistent image storage by default
- GDPR-style data export/delete endpoints ready

## Error Handling

- **Scan fails**: Modal with tips (lighting, framing, glare)
- **AI fails**: Banner + retry button, allow manual entry
- **Low confidence**: Warning badges on scan and AI previews
- **API errors**: Toast notifications with retry options

## License

MIT

**Disclaimer**: NutriScan provides informational estimates only and does not replace professional medical or dietary advice. OCR and AI estimates may contain errors. Always verify labels and consult a healthcare professional for personalized guidance.

