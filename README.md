# NutriScan

A production-ready nutrition tracking application that scans food labels, estimates nutrition with AI, and provides personalized meal recommendations.

## Features

- 📸 **Scan Nutrition Labels** - Use OCR (Tesseract.js) to extract nutrition facts from food packaging
- 🤖 **AI Nutrition Estimation** - Estimate nutrition for any food using OpenAI
- 📊 **Visual Analytics** - Interactive charts showing macro/micronutrient intake
- 📈 **Intake Tracking** - Spreadsheet-like table with inline editing, CSV/XLSX export
- 🎯 **Goals & Budget** - Set daily nutritional goals and spending limits
- 💡 **Smart Recommendations** - Get personalized meal suggestions based on deficits and budget
- ✅ **Quality Assurance** - Comprehensive unit tests and E2E tests

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Table**: TanStack Table
- **Forms**: React Hook Form + Zod validation
- **OCR**: Tesseract.js (client-side)
- **AI**: OpenAI API with function calling
- **Database**: Prisma + SQLite (dev) / PostgreSQL (production)
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

Visit [http://localhost:3000](http://localhost:3000) and sign in with `demo@nutriscan.app` or just `demo`.

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

## Key Features Explained

### 1. Scan Nutrition Label

- Upload a photo of a nutrition facts label
- Tesseract.js performs OCR to extract text
- Intelligent parsing detects and normalizes nutrients
- Handles various units (mg/g, kJ/kcal)
- Confidence scoring based on fields detected
- If confidence is low, prompts user to rescan
- All nutrients are editable before saving

### 2. AI Nutrition Estimation

- Enter food name, brand, and serving size
- OpenAI estimates nutrition using function calling
- Returns structured data with confidence score
- Low-confidence banner appears if < 60%
- All estimates are fully editable

### 3. Dashboard

- Today's totals vs. daily goals with progress bars
- Deficit/excess badges (e.g., "Fiber −12g", "Sodium +550mg")
- Quick action buttons: Scan, Add Food, Recommendations
- Real-time updates

### 4. Intake Table

- Spreadsheet-like view of all food entries
- Search/filter functionality
- Sort by any column
- Delete entries
- Export to CSV or XLSX

### 5. Charts

- **Macronutrient Breakdown**: Stacked bar chart for protein/carbs/fat
- **Micronutrient Radar**: Shows progress toward goals for fiber, sodium, potassium, calcium, iron
- **7-Day Trend**: Line chart tracking calories and protein over time

### 6. Goals & Budget

- Set daily targets for calories and all nutrients
- Set daily spending budget
- All goals are optional
- Progress tracked on dashboard

### 7. Meal Recommendations

- Rules-based engine analyzes deficits and excesses
- Suggests 3 meals that fill nutritional gaps
- Respects remaining budget
- Optional AI enhancement for personalized suggestions
- One-click "Add to Entries" for each recommendation

### 8. Disclaimers

- Footer in navigation
- Recommendations page header
- "Informational only, not medical advice"
- "OCR and AI may contain errors"

## Data Model

### User
- Email, name, authentication details
- One-to-one with Goals
- One-to-many with FoodEntry

### Goal
- Daily targets: calories, protein, carbs, fat, fiber, sugar, sodium, potassium, calcium, iron
- Daily budget in USD

### FoodEntry
- Name, source (scan/ai/manual)
- Serving size, servings, price
- All macro and micronutrients
- OCR text and AI model (for audit)
- Timestamp

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

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus management
- Color contrast meets WCAG AA
- Responsive design (mobile-first)

## Deployment

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="production-secret"
OPENAI_API_KEY="sk-..."
```

### Build

```bash
pnpm build
pnpm start
```

### Database Migration

For production (PostgreSQL):

1. Update `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma` datasource to `postgresql`
3. Run `pnpm prisma:migrate`

## Demo User

The seed script creates a demo user:

- **Email**: `demo@nutriscan.app`
- **Password**: Not required (magic link)
- Quick sign-in: Just type `demo` in the email field

Demo data includes:
- 5 example food entries (oatmeal, chicken, salad, yogurt, chips)
- Default goals (2,500 kcal, 130g protein, 30g fiber, etc.)

## Roadmap / Nice-to-Haves

- [ ] Barcode lookup (UPC → brand + serving size)
- [ ] PWA with offline support (cache last 30 days)
- [ ] Multi-profile households
- [ ] Meal planning calendar
- [ ] Recipe builder with nutrition calculation
- [ ] Integration with fitness trackers
- [ ] Social features (share meals, challenges)

## License

MIT

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For issues or questions, please open a GitHub issue.

---

**Disclaimer**: NutriScan provides informational estimates only and does not replace professional medical or dietary advice. OCR and AI estimates may contain errors. Always verify labels and consult a healthcare professional for personalized guidance.

