# Tubira Affiliate Program

A comprehensive affiliate management system built with Next.js 16+, Convex, Stripe, and shadcn/ui.

## Features

- **Landing Page**: Beautiful, mobile-first landing page with all affiliate program information
- **Registration Flow**: User-friendly registration form with plan selection
- **Payment Processing**: Stripe integration for secure payment processing
- **Email Notifications**: Automated welcome emails using Resend and React Email
- **Admin Dashboard**: Complete admin panel with sidebar navigation
- **Authentication**: Secure admin authentication with JWT and sessions
- **Data Export**: CSV export functionality for affiliates, payments, and activities
- **Activity Tracking**: Comprehensive activity logs for all system events

## Tech Stack

- **Frontend**: Next.js 16+ with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Backend**: Convex
- **Payments**: Stripe
- **Emails**: Resend + React Email
- **Authentication**: JWT + Sessions

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Convex**:
   - Set up your Convex project at [convex.dev](https://convex.dev)
   - Add `NEXT_PUBLIC_CONVEX_URL` to your `.env.local`
   - Set `JWT_SECRET` in Convex dashboard environment variables

4. **Configure Stripe**:
   - Get your Stripe API keys from [stripe.com](https://stripe.com)
   - Add them to `.env.local`
   - Set up webhook endpoint: `/api/webhooks/stripe`
   - Webhook secret will be provided by Stripe

5. **Configure Resend**:
   - Get your API key from [resend.com](https://resend.com)
   - Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to `.env.local`

6. **Run the development server**:
   ```bash
   npm run dev
   ```

7. **Run Convex dev** (in a separate terminal):
   ```bash
   npx convex dev
   ```

## Admin Setup

1. Login at `/admin/login`

## Project Structure

```
├── app/
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes (Stripe webhooks, email)
│   ├── checkout/       # Payment checkout page
│   ├── register/       # Affiliate registration
│   ├── success/        # Payment success page
│   └── page.tsx        # Landing page
├── components/
│   ├── admin/          # Admin components (sidebar, layout)
│   └── ui/             # shadcn/ui components
├── convex/
│   ├── affiliates.ts   # Affiliate CRUD operations
│   ├── payments.ts     # Payment management
│   ├── activities.ts   # Activity logging
│   ├── auth.ts         # Admin authentication
│   ├── webhooks.ts     # Stripe webhook handler
│   └── schema.ts       # Database schema
├── emails/             # React Email templates
├── lib/                # Utilities and configurations
└── proxy.ts            # Next.js proxy for auth checks
```

## Environment Variables

See `.env.example` for all required environment variables.

## Stripe Webhook Setup

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Deployment

1. Deploy Convex functions
2. Deploy Next.js app (Vercel recommended)
3. Update environment variables in your hosting platform
4. Update Stripe webhook URL to production URL
5. Update `NEXT_PUBLIC_APP_URL` to production URL

## License

Private - Tubira Affiliate Program
