
# Contributing to CareerPathPro

## Development Setup

### Prerequisites

- Node.js 18+
- Yarn package manager
- PostgreSQL database
- Git

### Local Development

1. Clone and install:
```bash
git clone https://github.com/agentpeterm-beep/CareerPathPro.git
cd CareerPathPro
yarn install
```

2. Environment setup:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. Database setup:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

4. Start development:
```bash
yarn dev
```

## Database Migrations

When making schema changes:

1. Update `prisma/schema.prisma`
2. Generate migration: `npx prisma db push`
3. Test locally with seed data: `npx prisma db seed`
4. Commit both schema and migration files

## Code Style

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Add proper error handling and loading states

## Testing

Before submitting:
1. Test all user flows
2. Verify responsive design
3. Check for TypeScript errors: `yarn build`
4. Run linter: `yarn lint`

## API Development

- All API routes in `app/api/`
- Use proper HTTP status codes
- Include error handling
- Validate inputs with Zod schemas

## Environment Variables

For new environment variables:
1. Add to `.env.example` with placeholder
2. Document in README.md
3. Add to deployment checklist

## Deployment

The app supports deployment on:
- Vercel (recommended)
- Netlify
- Railway
- Custom Node.js hosting

Ensure all environment variables are set on your hosting platform.

