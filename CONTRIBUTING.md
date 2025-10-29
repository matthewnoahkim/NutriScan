# Contributing to NutriScan

Thank you for your interest in contributing to NutriScan! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/NutriScan.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `pnpm test` and `pnpm e2e`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a pull request

## Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Set up database
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed

# Start development server
pnpm dev
```

## Code Style

- We use TypeScript for type safety
- Follow the existing code style
- Use ESLint and Prettier (configured in the project)
- Run `pnpm lint` before committing

## Testing

- Write unit tests for utilities and business logic (Vitest)
- Add E2E tests for critical user flows (Playwright)
- Ensure all tests pass before submitting PR

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Add tests for new features
- Ensure all tests pass
- Follow commit message conventions

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(scan): add multi-language OCR support

Adds support for Spanish and French nutrition labels
using Tesseract.js language packs.

Closes #123
```

## Questions?

Open an issue or discussion on GitHub.

Thank you for contributing! 🎉

