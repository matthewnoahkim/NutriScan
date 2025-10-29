# NutriScan Architecture

This document describes the technical architecture and design decisions of NutriScan.

## Overview

NutriScan is a full-stack TypeScript application built with Next.js 14 (App Router) following modern best practices:

- **Server-first**: Uses Server Components and Server Actions by default
- **Type-safe**: End-to-end TypeScript with Zod validation
- **Database-first**: Prisma ORM with migrations
- **Component-driven**: Modular, reusable React components
- **Tested**: Unit tests (Vitest) and E2E tests (Playwright)

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│                    Presentation                     │
│  Next.js App Router • React Server Components      │
│  Client Components for interactivity                │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   Application Logic                 │
│  Server Actions • API Routes • Business Logic       │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                     Data Layer                      │
│  Prisma ORM • SQLite (dev) • PostgreSQL (prod)     │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                  External Services                  │
│  OpenAI API • Tesseract.js • NextAuth               │
└─────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. Server Components by Default

- All pages are Server Components
- Fetches data directly in components
- Eliminates client-side API calls for initial render
- Better SEO and performance

```typescript
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  const [entries, goals] = await Promise.all([
    getTodayEntries(),
    getGoals()
  ]);
  
  return <DashboardStats entries={entries} goals={goals} />;
}
```

### 2. Server Actions for Mutations

- Type-safe mutations without API routes
- Automatic revalidation
- Progressive enhancement

```typescript
// app/actions/entries.ts
"use server";

export async function createEntry(data: EntryData) {
  const entry = await prisma.foodEntry.create({ data });
  revalidatePath("/dashboard");
  return entry;
}
```

### 3. Zod Schemas for Validation

- Single source of truth for types
- Client and server validation
- Compile-time type inference

```typescript
// lib/schemas.ts
export const nutritionSchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative().optional(),
  // ...
});

export type NutritionData = z.infer<typeof nutritionSchema>;
```

### 4. Composition Over Inheritance

- Small, focused components
- Composition via props and children
- Reusable UI primitives from shadcn/ui

```typescript
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

## Data Flow

### Read Flow (Server Components)

```
1. User navigates to /dashboard
2. Server Component runs on server
3. Directly calls Server Action (getTodayEntries, getGoals)
4. Server Action queries Prisma
5. Data returned to component
6. HTML rendered on server
7. Sent to client
```

### Write Flow (Client Components + Server Actions)

```
1. User submits form (Client Component)
2. Form handler calls Server Action
3. Server Action validates with Zod
4. Updates database via Prisma
5. Revalidates affected paths
6. Returns result
7. Client updates UI (optimistic or after success)
```

## Feature Modules

### OCR Pipeline

```
1. User uploads image (Client)
2. Image sent to /api/ocr (API Route)
3. Tesseract.js performs OCR on server
4. parseNutritionFromOCR extracts nutrients
5. Normalization (unit conversion)
6. Confidence scoring
7. Return parsed data to client
8. User reviews and edits
9. Save via Server Action
```

### AI Estimation Pipeline

```
1. User enters food info (Client)
2. Client calls /api/ai/estimate
3. Server calls OpenAI with function schema
4. OpenAI returns structured nutrition data
5. Confidence checked
6. Return to client
7. User reviews and edits
8. Save via Server Action
```

### Recommendation Engine

```
1. User views recommendations page
2. Server Component calls getRecommendations
3. Calculate today's totals
4. Calculate deficits vs goals
5. Rules engine generates 3 meals
6. (Optional) Call OpenAI for AI recommendations
7. Display recommendations
8. User clicks "Add to Entries" → Server Action
```

## Database Schema

### User → Goal (1:1)

One user has one set of goals. Goals are optional.

### User → FoodEntry (1:N)

One user has many food entries. Entries are the core data model.

### Authentication

Uses NextAuth with Prisma adapter:
- Account (OAuth accounts)
- Session (sessions)
- VerificationToken (magic link tokens)

## State Management

### Server State

- Server Components fetch data directly
- No client-side cache needed for initial render
- Revalidation via `revalidatePath()` after mutations

### Client State

- React Hook Form for form state
- React Query (TanStack Query) for client-side caching (when needed)
- URL state for filters/search (future)

### Global State

Avoided! Most state is:
- Server-side (database)
- Component-local (useState)
- Form-local (React Hook Form)

## Error Handling

### Client-Side

- Form validation with Zod + React Hook Form
- Toast notifications for success/error
- Try/catch in async handlers

### Server-Side

- API routes return appropriate status codes
- Server Actions throw errors (caught by client)
- Prisma errors logged and abstracted

### User-Facing

- Low OCR confidence → modal with tips
- Low AI confidence → banner warning
- API errors → retry button
- Network errors → toast notification

## Performance Optimizations

### Server Components

- No JavaScript shipped for static content
- Streaming with Suspense (future)
- Parallel data fetching with Promise.all

### Code Splitting

- Automatic with Next.js App Router
- Dynamic imports for heavy components (Recharts, Tesseract)

### Database

- Indexed foreign keys (Prisma default)
- Efficient queries (select only needed fields)
- Connection pooling (Prisma)

### Caching

- Next.js automatic caching for fetch()
- Revalidation on demand after mutations
- CDN caching for static assets

## Security

### Authentication

- NextAuth with secure session handling
- JWT tokens (stateless) or database sessions
- CSRF protection built-in

### Authorization

- All Server Actions check session
- User can only access their own data
- Database queries filtered by userId

### Input Validation

- Client-side with Zod + React Hook Form
- Server-side with Zod (defense in depth)
- Prisma prevents SQL injection

### API Security

- Rate limiting (future)
- API key stored in env vars (never exposed to client)
- Content Security Policy (future)

## Testing Strategy

### Unit Tests (Vitest)

- Pure functions (normalization, parsing, calculations)
- Business logic (recommendation engine)
- Fast feedback loop

### E2E Tests (Playwright)

- Critical user flows (sign in → add food → view charts)
- Visual regression (future)
- Slower but high confidence

### Manual Testing

- OCR with various label types
- AI estimation accuracy
- Mobile responsiveness
- Accessibility with screen readers

## Deployment

### Development

```bash
pnpm dev
# SQLite database
# Hot reload
# Source maps
```

### Production

```bash
pnpm build
pnpm start
# PostgreSQL database
# Optimized bundles
# No source maps
```

### Environment Variables

- `DATABASE_URL`: Database connection string
- `NEXTAUTH_SECRET`: Session encryption key
- `OPENAI_API_KEY`: AI estimation (optional)
- `EMAIL_*`: Email provider for magic links (optional)

## Future Improvements

### Performance

- [ ] Add Suspense boundaries for streaming
- [ ] Implement ISR for static pages
- [ ] Add Redis for caching
- [ ] Optimize Recharts bundle size

### Features

- [ ] Real-time updates with WebSockets
- [ ] Barcode scanning with QuaggaJS
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] PWA with service worker

### Architecture

- [ ] Extract recommendation engine to microservice
- [ ] Add event sourcing for audit log
- [ ] Implement CQRS pattern for complex queries
- [ ] Add GraphQL API (optional)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth Documentation](https://next-auth.js.org)
- [shadcn/ui Components](https://ui.shadcn.com)

## Questions?

Open an issue or discussion on GitHub!

