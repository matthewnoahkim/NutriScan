# NutriScan Quick Start Guide

Get NutriScan running in 5 minutes!

## Prerequisites

- Node.js 18+ or pnpm 8+
- Basic knowledge of Next.js (optional)

## Step 1: Install

```bash
cd NutriScan
pnpm install
```

## Step 2: Configure

The project includes a working `.env.example`. For development, you can use it as-is:

```bash
# Option A: Copy the example (basic setup)
cp .env.example .env

# Option B: Use the included .env (if present, already configured for dev)
# No action needed!
```

**Optional**: Add your OpenAI API key to enable AI nutrition estimation:

1. Get a key from https://platform.openai.com/api-keys
2. Open `.env` and uncomment:
   ```
   OPENAI_API_KEY="sk-your-key-here"
   ```

## Step 3: Set Up Database

```bash
pnpm setup
```

This single command will:
- Generate Prisma client
- Create SQLite database
- Run migrations
- Seed with demo data (including a demo user and sample entries)

## Step 4: Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Sign In

Use the demo account:
- Email: `demo@nutriscan.app` (or just type `demo`)
- No password needed!

Click "Sign in with Email" and you'll be redirected to the dashboard.

## What's Next?

### Try Core Features

1. **Dashboard** - See your daily progress and deficit/excess badges
2. **Add Food** - Try AI estimation (needs OpenAI key) or manual entry
3. **Scan Label** - Upload a nutrition label photo (works offline with Tesseract.js!)
4. **Intake Table** - View all entries and export to CSV/XLSX
5. **Charts** - Visualize your nutrition with interactive charts
6. **Recommendations** - Get meal suggestions based on your goals
7. **Settings** - Customize your daily goals and budget

### Run Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires Playwright browsers)
pnpm exec playwright install chromium
pnpm e2e
```

### Explore the Code

- `app/` - Next.js pages and API routes
- `components/` - React components (UI and feature-specific)
- `lib/` - Business logic and utilities
- `prisma/` - Database schema and seed data
- `tests/` - Unit tests
- `e2e/` - End-to-end tests

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Run `pnpm install` again

### Issue: Database errors

**Solution**: Delete `prisma/dev.db` and run `pnpm setup` again

### Issue: "NEXTAUTH_SECRET" missing

**Solution**: Make sure `.env` exists and contains `NEXTAUTH_SECRET`

### Issue: OCR not working

**Solution**: Tesseract.js downloads language files on first use. Give it a minute and try again.

### Issue: AI estimation fails

**Solution**: 
1. Check that `OPENAI_API_KEY` is set in `.env`
2. Verify your API key is valid
3. Check your OpenAI account has credits
4. Without API key, you can still use manual entry

## Need Help?

- Read the full [README.md](./README.md)
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub

## Next Steps

- **Deploy**: See README for production deployment instructions
- **Customize**: Modify goals, add new nutrients, change UI theme
- **Extend**: Add barcode scanning, meal planning, or social features

Enjoy tracking your nutrition with NutriScan! 🥗📊

