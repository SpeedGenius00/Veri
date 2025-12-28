# Veri - Know What's Real

Detect AI-generated content and certify your authentic work.

## Features

- **AI Detection** - Analyze images and text to determine if they're AI-generated
- **Content Certification** - Create cryptographic certificates for authentic content
- **Verification** - Anyone can verify certificates without an account
- **API Access** - Programmatic access for developers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js
- **Payments**: Stripe
- **Styling**: Tailwind CSS + shadcn/ui
- **Email**: Resend
- **Storage**: AWS S3
- **Cache**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- (Optional) AWS account for file storage
- (Optional) Upstash account for rate limiting

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/veri.git
   cd veri
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with your credentials

5. Initialize the database:

   ```bash
   npm run db:push
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables

See `.env.production.example` for all required variables.

## API Documentation

### Detection

```bash
POST /api/v1/detect
Header: X-API-Key: your_api_key
Body: FormData with "file" or "text"
```

### Certification

```bash
POST /api/v1/certify
Header: X-API-Key: your_api_key
Body: FormData with "file" and "metadata"
```

### Verification

```bash
GET /api/v1/verify/{certificateId}
```

## License

MIT
