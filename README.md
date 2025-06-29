# Global Pharma Trading - Pharmacy Management System

A comprehensive pharmacy management system built with Next.js, TypeScript, Prisma, and Tailwind CSS.

## 🚀 Features

- **User Management**: Admin, Staff, and Customer roles with permissions
- **Prescription Management**: Create, track, and fulfill prescriptions
- **Customer Management**: Comprehensive customer profiles and history
- **Complaint System**: Handle customer complaints and support tickets
- **Contact Management**: Manage customer inquiries and communications
- **Payment Integration**: Stripe payment processing
- **Responsive Design**: Modern, mobile-first UI with Tailwind CSS
- **Authentication**: Secure JWT-based authentication system
- **Admin Dashboard**: Comprehensive analytics and management tools

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Payments**: Stripe
- **Validation**: Zod
- **Icons**: Heroicons, React Icons
- **Charts**: Chart.js with react-chartjs-2

## 📁 Project Structure

```
pharmacy/
├── prisma/                    # Database schema and migrations
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
├── public/                    # Static assets
│   ├── images/
│   └── assets/
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin pages
│   │   ├── auth/             # Authentication pages
│   │   ├── dashboard/        # User dashboard
│   │   ├── components/       # Page-specific components
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable components
│   │   └── ui/              # UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and configurations
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── auth-context.tsx # Auth context provider
│   │   ├── constants.ts     # App constants
│   │   ├── database.ts      # Database utilities
│   │   ├── prisma.ts        # Prisma client
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── utils.ts         # General utilities
│   │   └── validations.ts   # Zod validation schemas
│   └── pages/               # Legacy pages (if any)
├── .env.local               # Environment variables (create from .env.example)
├── .env.example             # Environment variables template
├── middleware.ts           # Next.js middleware for route protection
├── tailwind.config.ts      # Tailwind CSS configuration
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database (running on port 3306)
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual values:
   ```bash
   DATABASE_URL="mysql://root:password@localhost:3306/pharmacy_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
   STRIPE_SECRET_KEY="sk_test_your_stripe_key"
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed the database (optional)
   npm run seed
   ```

4. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
