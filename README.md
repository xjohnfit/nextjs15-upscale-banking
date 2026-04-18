# 🏦 Upscale Banking - Next.js 15 Banking Application

A modern, full-stack banking application built with Next.js 15, featuring real-time transactions, secure authentication, comprehensive financial management tools, and enterprise-grade CI/CD deployment with optimized mobile experience.

## 🚀 Project Overview

Upscale Banking is a sophisticated financial management platform that provides users with a complete banking experience. The application integrates with real banking APIs through Plaid, offers secure payment processing via Dwolla, maintains robust data management with Appwrite, and includes comprehensive DevOps practices with automated CI/CD pipelines, containerization, and Kubernetes deployment capabilities.

### ✨ Key Features

- **🔐 Secure Authentication**: Multi-factor authentication with Appwrite
- **🏦 Bank Account Integration**: Connect multiple bank accounts via Plaid with optimized mobile experience
- **💳 Real-time Transactions**: View and manage transactions across all accounts
- **💸 Money Transfers**: Secure peer-to-peer payments through Dwolla
- **📊 Financial Analytics**: Interactive charts and spending insights
- **📱 Mobile-First Design**: Optimized mobile experience with touch-friendly Plaid integration
- **🎨 Modern UI**: Clean, intuitive interface with Radix UI components
- **📈 Transaction History**: Comprehensive transaction tracking and categorization
- **🔄 Real-time Updates**: Live balance updates and transaction notifications
- **🚀 CI/CD Pipeline**: Automated testing, security scanning, and deployment
- **🐳 Containerized**: Docker support for consistent deployments
- **☸️ Kubernetes Ready**: Production-ready Kubernetes manifests

- **🔒 Security Scanning**: Automated vulnerability scanning with Trivy and OWASP
- **🎯 Optimized Performance**: Font preloading, image optimization, and mobile touch enhancements


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


- **Next Themes** - Theme management for dark/light mode

### DevOps & Deployment

- **Jenkins** - CI/CD automation with comprehensive pipeline stages
- **Docker** - Multi-stage containerization for optimized production builds
- **Kubernetes** - Container orchestration with deployment and service manifests
- **SonarQube** - Code quality analysis and technical debt management
- **Trivy** - Container and filesystem vulnerability scanning
- **OWASP Dependency Check** - Security vulnerability assessment for dependencies

### UI Components

- **Sonner** - Toast notifications
- **Tailwind CSS Animate** - Animation utilities

## 🎮 Demo & Testing

### Demo Account Access

Experience the full functionality without signing up using our sandbox demo account:

**Email**: `john-demo@sandbox.com`  
**Password**: `demoPassword123`

### Sandbox Environment

- All transactions are simulated and no real money is involved
- Plaid sandbox provides realistic banking data for testing
- Dwolla sandbox enables payment flow testing without actual transfers
- Full feature access including transfers, analytics, and account management

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
├── kubernetes/                  # Kubernetes deployment manifests
│   ├── deployment.yml           # Kubernetes deployment configuration
│   └── service.yml              # Kubernetes service configuration
├── public/                      # Static assets
├── Dockerfile                   # Multi-stage Docker build configuration
├── Jenkinsfile                  # CI/CD pipeline configuration

├── instrumentation.ts           # Next.js instrumentation setup
└── config files                 # Next.js, Tailwind, TypeScript configs
│   │   └── transaction.actions.ts # Transaction handling
│   ├── appwrite.ts              # Appwrite configuration
│   ├── plaid.ts                 # Plaid API setup
│   └── utils.ts                 # Utility functions
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



# Jenkins CI/CD Configuration (for automated deployments)
DOCKER_USER=your-dockerhub-username
DOCKER_PASS=your-dockerhub-password-or-token
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

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server on port 5004
- `npm run lint` - Run ESLint for code quality

## 🐳 Docker Support

### Building the Docker Image

```bash
docker build -t upscale-banking .
```

### Running with Docker

```bash
docker run -p 3000:5004 --env-file .env.local upscale-banking
```

### Multi-stage Build Benefits

- **Optimized Size**: Uses Alpine Linux for minimal image footprint
- **Security**: Separate build and runtime environments
- **Performance**: Production-optimized dependencies only

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (local or cloud)
- kubectl configured
- Docker registry access

### Deploy to Kubernetes

1. **Create namespace and secrets:**

   ```bash
   kubectl create namespace banking-app
   kubectl create secret generic upscale-banking-secret \
     --from-env-file=.env.local \
     -n banking-app
   ```

2. **Deploy the application:**

   ```bash
   kubectl apply -f kubernetes/ -n banking-app
   ```

3. **Check deployment status:**

   ```bash
   kubectl get pods -n banking-app
   kubectl get services -n banking-app
   ```

### Kubernetes Features

- **Horizontal Scaling**: Ready for pod autoscaling
- **Resource Management**: CPU and memory limits configured
- **Secret Management**: Environment variables via Kubernetes secrets
- **Service Discovery**: NodePort service for external access

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

## 🚀 CI/CD Pipeline

This project includes a comprehensive Jenkins pipeline for automated testing, security scanning, and deployment with enterprise-grade DevOps practices.

### Pipeline Stages

1. **🧹 Clean Workspace** - Ensures a clean build environment
2. **📥 Checkout from Git** - Pulls the latest code from the main branch
3. **🔍 SonarQube Analysis** - Comprehensive code quality and security analysis
4. **🚦 Quality Gate** - Ensures code meets predefined quality standards
5. **📦 Install Dependencies** - Installs npm packages with caching
6. **�️ OWASP Dependency Check** - Scans for known vulnerabilities in dependencies
7. **🔒 Trivy Filesystem Scan** - Security vulnerability scanning for source code
8. **🐳 Docker Build & Push** - Multi-stage Docker image creation and registry push
9. **� Trivy Image Scan** - Container image vulnerability assessment
10. **🧹 Cleanup Artifacts** - Removes local Docker images to save space
11. **📧 Email Notifications** - Automated build status notifications with reports

### Pipeline Configuration

- **Runtime Environment**: Java 21, Node.js 24
- **Code Quality**: SonarQube integration with quality gates and technical debt tracking
- **Security Scanning**:
  - Trivy for filesystem and container image vulnerability scanning
  - OWASP Dependency Check for third-party library security assessment
- **Container Registry**: DockerHub integration with automated image versioning
- **Artifact Management**: Automated report archiving and email delivery
- **Version Control**: GitHub integration with webhook triggers
- **Notification System**: Email alerts with detailed build reports and scan results

### DevOps Tools Integration

- **Jenkins** - CI/CD automation platform with declarative pipeline
- **SonarQube** - Static code analysis, code coverage, and security vulnerability detection
- **Trivy** - Comprehensive vulnerability scanner for containers and filesystems
- **OWASP Dependency Check** - Security vulnerability assessment for project dependencies
- **Docker** - Containerization with multi-stage builds for production optimization
- **DockerHub** - Container image registry with automated versioning

### Security & Quality Gates

- **Automated Quality Checks**: Code coverage thresholds and maintainability ratings
- **Security Vulnerability Scanning**: Critical and high-severity vulnerability detection
- **Dependency Security**: Third-party library vulnerability assessment
- **Container Security**: Base image and application layer security scanning
- **Build Notifications**: Immediate alerts for failed builds or security issues

## 🔒 Security Features

- **Server-side authentication** with Appwrite
- **Environment variable protection** for sensitive data
- **CSRF protection** with Next.js built-in features
- **Type-safe API calls** with TypeScript
- **Input validation** with Zod schemas

- **Automated security scanning** with Trivy and OWASP Dependency Check
- **Code quality checks** with SonarQube static analysis
- **Container security** with multi-stage Docker builds
- **Dependency vulnerability assessment** with automated scanning
- **Secure secret management** via Kubernetes secrets
- **Production monitoring** with comprehensive logging and alerting

## � Monitoring & Observability


- **Integration Dashboards**: Custom dashboards for business metrics
- **Automated Alerting**: Slack, email, and webhook notifications

## 📱 Responsive Design

The application is fully responsive and optimized for:

- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🚀 Production Deployment

### Deployment Strategies

The application supports multiple deployment strategies:

1. **Traditional Server Deployment**
   - Direct deployment on VPS or dedicated servers
   - PM2 process management for Node.js applications
   - Nginx reverse proxy configuration

2. **Containerized Deployment**
   - Docker containerization with multi-stage builds
   - DockerHub registry for image distribution
   - Environment-specific configuration management

3. **Kubernetes Orchestration**
   - Production-ready Kubernetes manifests
   - Horizontal pod autoscaling capabilities
   - Rolling updates with zero downtime
   - Secret management and configuration injection

4. **Cloud Platform Deployment**
   - Compatible with AWS, GCP, Azure
   - Vercel deployment for seamless Next.js hosting
   - Serverless deployment options

### Scaling Considerations

- **Horizontal Scaling**: Load balancing across multiple instances
- **Database Scaling**: Appwrite cloud scaling capabilities
- **CDN Integration**: Static asset optimization and global distribution
- **Performance Optimization**: Image optimization, code splitting, and caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework and App Router
- **Appwrite** for providing comprehensive backend services
- **Plaid** for secure banking API integration
- **Dwolla** for reliable payment processing

- **Jenkins Community** for the robust CI/CD automation platform
- **SonarQube** for code quality and security analysis tools
- **Aqua Security** for the Trivy vulnerability scanner
- **OWASP** for dependency security checking tools
- **Docker** for containerization technology
- **Kubernetes** for container orchestration
- **All open-source contributors** who make modern development possible

---

### Built with ❤️ using Next.js 15, Appwrite, Plaid, Dwolla, and Enterprise DevOps Practices

**Features**: Full-stack banking application • Real-time transactions • Secure authentication • CI/CD pipeline • Docker containerization • Kubernetes deployment • Comprehensive monitoring • Security scanning
