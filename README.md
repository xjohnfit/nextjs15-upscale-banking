# 🏦 Upscale Banking - Next.js 15 Banking Application

A modern, full-stack banking application built with Next.js 15, featuring real-time transactions, secure authentication, and comprehensive financial management tools.

## 🚀 Project Overview

Upscale Banking is a sophisticated financial management platform that provides users with a complete banking experience. The application integrates with real banking APIs through Plaid, offers secure payment processing via Dwolla, and maintains robust data management with Appwrite.

### ✨ Key Features

- **🔐 Secure Authentication**: Multi-factor authentication with Appwrite
- **🏦 Bank Account Integration**: Connect multiple bank accounts via Plaid
- **💳 Real-time Transactions**: View and manage transactions across all accounts
- **💸 Money Transfers**: Secure peer-to-peer payments through Dwolla
- **📊 Financial Analytics**: Interactive charts and spending insights
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🎨 Modern UI**: Clean, intuitive interface with Radix UI components
- **📈 Transaction History**: Comprehensive transaction tracking and categorization
- **🔄 Real-time Updates**: Live balance updates and transaction notifications

## 🛠️ Technologies Used

### Frontend Framework

- **Next.js 15** - React framework with App Router for server-side rendering and routing
- **React 18** - JavaScript library for building user interfaces
- **TypeScript** - Type-safe JavaScript development

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Radix UI** - Low-level UI primitives for accessible components
- **Lucide React** - Beautiful & consistent icon library
- **Chart.js** - Data visualization for financial analytics
- **React Chart.js 2** - React wrapper for Chart.js

### Backend & Database

- **Appwrite** - Backend-as-a-Service for authentication, database, and file storage
- **Node Appwrite** - Server-side Appwrite SDK

### Financial Services

- **Plaid** - Bank account linking and transaction data
- **Dwolla** - ACH payment processing and money transfers
- **React Plaid Link** - React component for Plaid Link integration

### Forms & Validation

- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Hookform Resolvers** - Validation resolvers for React Hook Form

### State Management & Utilities

- **Query String** - URL query parameter parsing
- **React CountUp** - Animated number counting
- **Class Variance Authority** - Utility for creating variant-based component APIs
- **Tailwind Merge** - Utility for merging Tailwind CSS classes
- **CLSX** - Utility for constructing className strings

### Monitoring & Analytics

- **Sentry** - Error tracking and performance monitoring
- **Next Themes** - Theme management for dark/light mode

### UI Components

- **Sonner** - Toast notifications
- **Tailwind CSS Animate** - Animation utilities

## 📁 Project Structure

```
├── app/                          # Next.js 15 App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   ├── (auth)/                  # Authentication route group
│   │   ├── layout.tsx           # Auth layout
│   │   ├── sign-in/             # Sign-in page
│   │   └── sign-up/             # Sign-up page
│   └── (root)/                  # Main application routes
│       ├── layout.tsx           # Main layout
│       ├── page.tsx             # Dashboard/home page
│       ├── my-banks/            # Bank accounts management
│       ├── payment-transfer/    # Money transfer functionality
│       └── transaction-history/ # Transaction history view
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components (Radix UI)
│   ├── AuthForm.tsx             # Authentication form
│   ├── BankCard.tsx             # Bank account card
│   ├── DoughnutChart.tsx        # Financial analytics chart
│   ├── PaymentTransferForm.tsx  # Payment transfer form
│   ├── RecentTransactions.tsx   # Transaction list
│   └── ...                     # Other components
├── lib/                         # Utility functions and configurations
│   ├── actions/                 # Server actions
│   │   ├── bank.actions.ts      # Bank-related operations
│   │   ├── user.actions.ts      # User management
│   │   └── transaction.actions.ts # Transaction handling
│   ├── appwrite.ts              # Appwrite configuration
│   ├── plaid.ts                 # Plaid API setup
│   └── utils.ts                 # Utility functions
├── types/                       # TypeScript type definitions
├── constants/                   # Application constants
├── public/                      # Static assets
├── Jenkinsfile                  # CI/CD pipeline configuration
└── config files                 # Next.js, Tailwind, TypeScript configs
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Appwrite account and project setup
- Plaid developer account (sandbox environment)
- Dwolla developer account (sandbox environment)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id
APPWRITE_DATABASE_ID=your-database-id
APPWRITE_USER_COLLECTION_ID=your-user-collection-id
APPWRITE_BANK_COLLECTION_ID=your-bank-collection-id
APPWRITE_TRANSACTION_COLLECTION_ID=your-transaction-collection-id
APPWRITE_SECRET=your-appwrite-secret

# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox

# Dwolla Configuration
DWOLLA_KEY=your-dwolla-key
DWOLLA_SECRET=your-dwolla-secret
DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
DWOLLA_ENV=sandbox

# Sentry Configuration (Optional)
SENTRY_DSN=your-sentry-dsn
```

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/xjohnfit/nextjs15-upscale-banking
   cd nextjs15-upscale-banking
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and configuration values

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🏗️ Architecture

### Authentication Flow

1. Users sign up/sign in through Appwrite authentication
2. Session management with secure cookies
3. Protected routes with middleware

### Banking Integration

1. Plaid Link for secure bank account connection
2. Real-time transaction syncing
3. Account balance updates

### Payment Processing

1. Dwolla integration for ACH transfers
2. Secure payment verification
3. Transaction status tracking

### Data Management

1. Appwrite database for user data
2. Real-time synchronization
3. Optimistic updates for better UX

## � CI/CD Pipeline

This project includes a comprehensive Jenkins pipeline for automated testing, security scanning, and deployment:

### Pipeline Stages

1. **🧹 Clean Workspace** - Ensures a clean build environment
2. **📥 Checkout from Git** - Pulls the latest code from the main branch
3. **🔍 SonarQube Analysis** - Code quality and security analysis
4. **🚦 Quality Gate** - Ensures code meets quality standards
5. **📦 Install Dependencies** - Installs npm packages
6. **�🔒 Trivy Security Scan** - Vulnerability scanning for dependencies
7. **📋 Archive Reports** - Saves security scan reports as artifacts

### Pipeline Configuration

- **Runtime Environment**: Java 21, Node.js 24
- **Code Quality**: SonarQube integration with quality gates
- **Security Scanning**: Trivy filesystem scanning
- **Artifact Management**: Automated report archiving
- **Version Control**: GitHub integration with automated triggers

### DevOps Tools

- **Jenkins** - CI/CD automation platform
- **SonarQube** - Code quality and security analysis
- **Trivy** - Vulnerability scanner for containers and filesystems

## 🔒 Security Features

- **Server-side authentication** with Appwrite
- **Environment variable protection** for sensitive data
- **CSRF protection** with Next.js built-in features
- **Type-safe API calls** with TypeScript
- **Input validation** with Zod schemas
- **Error tracking** with Sentry
- **Automated security scanning** with Trivy
- **Code quality checks** with SonarQube

## 📱 Responsive Design

The application is fully responsive and optimized for:

- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Appwrite for backend services
- Plaid for banking API integration
- Dwolla for payment processing
- All open-source contributors

---

### Built with ❤️ using Next.js 15, Appwrite, Plaid, and Dwolla
