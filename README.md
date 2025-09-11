# Restaurant Ordering Platform 🍽️

A modern, full-featured restaurant ordering platform built with Next.js 15, featuring multi-vendor support, real-time order management, payment processing, and comprehensive admin dashboard.

## ✨ Features

### 🏪 Multi-Vendor Platform

- **Vendor Registration & Management**: Complete vendor onboarding with Stripe Connect integration
- **Restaurant Profiles**: Customizable restaurant pages with menus, images, and descriptions
- **Menu Management**: Dynamic menu creation with categories, items, and pricing
- **Order Processing**: Real-time order management with status tracking

### 👨‍💼 Admin Dashboard

- **Super Admin Panel**: Complete platform oversight and management
- **Vendor Management**: Approve, suspend, and manage restaurant partners
- **Analytics & Reporting**: Comprehensive business insights and metrics
- **User Management**: Role-based access control (SUPER_ADMIN, VENDOR_ADMIN, VENDOR_STAFF, CUSTOMER)

### 💳 Payment Processing

- **Stripe Integration**: Secure payment processing with Stripe Connect
- **Multi-Vendor Payouts**: Automated payment distribution to vendors
- **Order Management**: Complete order lifecycle from cart to delivery

### 🔐 Authentication & Security

- **NextAuth.js**: Secure authentication with multiple providers
- **Google OAuth**: Social login integration
- **Email Authentication**: Magic link sign-in via Resend
- **Role-Based Access**: Granular permission system

### 📱 Modern UI/UX

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching with system preference detection
- **Component Library**: Built with Radix UI and Shadcn/ui
- **Real-time Updates**: Live order status and notifications

## 🛠️ Tech Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Shadcn/ui**: Beautiful, reusable components

### Backend

- **tRPC**: End-to-end typesafe APIs
- **Drizzle ORM**: Type-safe database toolkit
- **PostgreSQL**: Robust relational database
- **NextAuth.js**: Authentication solution
- **Zod**: Schema validation

### Infrastructure

- **AWS S3**: File storage and CDN
- **Stripe**: Payment processing and Connect
- **Resend**: Email delivery service
- **Vercel**: Deployment and hosting (recommended)

### Development Tools

- **Bun**: Fast JavaScript runtime and package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Drizzle Studio**: Database management GUI

## 🚀 Quick Start

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **PostgreSQL** database
- **Stripe** account for payments
- **AWS** account for file storage
- **Resend** account for emails

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd restaurant
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_db"

   # Authentication
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_RESEND_KEY="your-resend-api-key"

   # Admin
   ADMIN_EMAIL="admin@yourrestaurant.com"

   # AWS S3
   AWS_BUCKET_NAME="your-bucket-name"
   AWS_REGION="your-region"
   AWS_ACCESS_ID="your-access-key"
   AWS_SECRET="your-secret-key"

   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."

   # OpenAI (optional)
   OPENAI_API_KEY="your-openai-key"

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_NAME="Restaurant"
   ```

4. **Database Setup**

   ```bash
   # Generate database schema
   bun run db:generate

   # Run migrations
   bun run db:migrate

   # Push schema changes (development)
   bun run db:push
   ```

5. **Start Development Server**

   ```bash
   bun run dev
   # or
   npm run dev
   # or
   pnpm run dev
   ```

   Open [https://localhost:3000](https://localhost:3000) to view the application.

## 📝 Available Scripts

- `bun run dev` - Start development server with Turbo
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run preview` - Build and preview production
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint issues
- `bun run typecheck` - Type checking
- `bun run format:check` - Check code formatting
- `bun run format:write` - Format code
- `bun run db:generate` - Generate Drizzle schema
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes
- `bun run db:studio` - Open Drizzle Studio
- `bun run stripe:listen` - Listen for Stripe webhooks

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── api/               # API routes
│   ├── checkout/          # Checkout flow
│   ├── r/                 # Restaurant pages
│   ├── account/           # User account pages
│   └── ...
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   └── custom/            # App-specific components
├── server/                # Backend logic
│   ├── api/               # tRPC routers
│   ├── auth/              # Authentication config
│   └── db/                # Database schema
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── styles/                # Global styles
```

## 🔧 Configuration

### Database Schema

The application uses a comprehensive PostgreSQL schema with tables for:

- Users and authentication
- Vendors and restaurants
- Menu items and categories
- Orders and order items
- Payments and transactions

### Authentication Providers

- **Google OAuth**: Social login
- **Email Magic Links**: Passwordless authentication via Resend

### File Upload

Images are uploaded to AWS S3 with automatic optimization and blur placeholders for improved performance.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment

1. Build the application: `bun run build`
2. Start the production server: `bun run start`

## 🏢 Architecture

Built following modern development practices:

- **Type Safety**: End-to-end TypeScript with tRPC
- **Server Components**: Optimized with React Server Components
- **Database**: Type-safe queries with Drizzle ORM
- **Styling**: Component-based design with Tailwind CSS
- **Performance**: Optimized images, lazy loading, and caching

## 🔒 Security Features

- **Role-based Access Control**: Granular permissions for different user types
- **Input Validation**: Comprehensive schema validation with Zod
- **Secure Authentication**: Industry-standard authentication flows
- **Payment Security**: PCI-compliant payment processing with Stripe

---

**Built with ❤️ using the T3 Stack, SSE, WebSockets and modern web technologies**
