
# CareerPathPro - AI-Powered Career & Business Guidance

A comprehensive career and business guidance platform for adults in the USA, built with Next.js 14, TypeScript, NextAuth.js, Prisma/PostgreSQL, and Stripe for subscriptions.

## Features

- **User Authentication**: Secure login/signup with NextAuth.js
- **AI-Powered Q&A**: Get personalized career and business guidance
- **Resource Database**: Comprehensive database of career and business resources
- **Contact Search**: Find relevant industry contacts and connections
- **Subscription Management**: Premium features with Stripe integration
- **Profile Management**: Customize your experience with interests and preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database
- Stripe account (for payments)
- AbacusAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/agentpeterm-beep/CareerPathPro.git
cd CareerPathPro
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your actual values (see Environment Variables section below).

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. Start the development server:
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following required variables:

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random string for NextAuth.js sessions
- `ABACUSAI_API_KEY`: API key for AI-powered features
- `STRIPE_SECRET_KEY`: Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM`: Stripe price ID for premium subscription

### Optional
- Email provider configuration (SendGrid, Gmail SMTP, or custom SMTP)
- Samcart integration (see `SAMCART_INTEGRATION.md`)

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production  
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Database

This project uses Prisma with PostgreSQL. Key commands:

- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed database with initial data
- `npx prisma studio` - Open Prisma Studio database browser

## Deployment

The app is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Heroku

Make sure to:
1. Set all environment variables on your hosting platform
2. Set up your production database
3. Configure Stripe webhooks to point to your production URL

## Project Structure

```
app/                    # Next.js App Router
├── api/               # API routes
├── auth/              # Authentication pages
├── dashboard/         # Protected dashboard pages
├── components/        # React components
├── lib/               # Utility functions and configurations
└── ...

prisma/                # Database schema and migrations
public/                # Static assets
scripts/               # Database seeds and utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For questions or support, contact: agentpeterm@gmail.com

## License

This project is proprietary software. All rights reserved.

