# SwiftInvoice - Professional Invoicing Platform

SwiftInvoice is a modern, full-stack invoicing application built with Next.js, TypeScript, and PostgreSQL. It provides a complete solution for freelancers and small businesses to manage clients, create professional invoices, and generate PDFs.

## 🚀 Features (Phase 1 MVP)

### ✅ Core Functionality
- **User Authentication**: Secure signup/login with email verification
- **Email Verification**: 6-digit code verification system for new accounts
- **Password Reset**: Forgot password with email-based reset codes
- **Client Management**: Full CRUD operations with preview and edit pages
- **Invoice Management**: Create, edit, and delete invoices with line items
- **PDF Generation**: Professional HTML-based invoice generation for printing
- **Responsive Dashboard**: Overview of invoices, clients, and revenue

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Modern database management with PostgreSQL
- **NextAuth.js**: Secure authentication system with email verification
- **Email Service**: Nodemailer integration for verification and reset emails
- **Form Validation**: Zod schema validation for all inputs
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Unique Invoice Numbers**: Thread-safe invoice number generation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **PDF Generation**: HTML-based with client-side printing
- **Email Service**: Nodemailer
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd invoice
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/swiftinvoice"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Email Configuration (Required for email verification and password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="SwiftInvoice <your-email@gmail.com>"

# Generate a secret with: openssl rand -base64 32
```

#### 📧 Email Setup Instructions

For Gmail SMTP (recommended for development):
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for this application
3. Use the app password in `SMTP_PASS`

For other email providers:
- **SendGrid**: Use `smtp.sendgrid.net` with your API key
- **Mailgun**: Use `smtp.mailgun.org` with your credentials
- **Custom SMTP**: Update the SMTP settings accordingly

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

The application uses the following main entities:

- **Users**: Authentication, user management, and email verification
- **Clients**: Client information and contact details
- **Invoices**: Invoice headers with metadata and unique numbering
- **Invoice_Items**: Individual line items for each invoice
- **Email_Verifications**: Email verification codes for new accounts
- **Password_Resets**: Password reset codes for forgot password feature
- **NextAuth Tables**: Account, Session, and VerificationToken for authentication

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── register/  # User registration
│   │   │   ├── verify-email/ # Email verification
│   │   │   ├── forgot-password/ # Password reset request
│   │   │   └── reset-password/ # Password reset
│   │   ├── clients/       # Client management API
│   │   └── invoices/      # Invoice management API
│   ├── auth/              # Authentication pages
│   │   ├── signin/        # Sign in page
│   │   ├── signup/        # Sign up page
│   │   ├── verify-email/  # Email verification page
│   │   ├── forgot-password/ # Forgot password page
│   │   └── reset-password/ # Reset password page
│   ├── dashboard/         # Main dashboard
│   ├── clients/           # Client management pages
│   │   ├── [id]/         # Client details page
│   │   └── [id]/edit/    # Client edit page
│   └── invoices/          # Invoice management pages
├── components/             # Reusable UI components
├── lib/                    # Utility functions and configurations
│   ├── auth.ts            # Authentication utilities
│   ├── auth-config.ts     # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── validations.ts     # Zod validation schemas
│   └── email.ts           # Email service utilities
└── globals.css            # Global styles
```

## 🔐 Authentication

SwiftInvoice uses NextAuth.js with email verification and password reset:

- **Registration**: Users create accounts with email/password and receive verification codes
- **Email Verification**: 6-digit codes sent via email, required before login
- **Login**: Secure authentication with email verification requirement
- **Password Reset**: Forgot password with email-based reset codes
- **Password Security**: Bcrypt hashing for password storage
- **Session Management**: JWT-based sessions with secure cookies
- **Unique Email Validation**: Prevents duplicate accounts

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/verify-email` - Email verification with 6-digit code
- `POST /api/auth/forgot-password` - Request password reset code
- `POST /api/auth/reset-password` - Reset password with code
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get specific client
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get specific invoice
- `PUT /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `GET /api/invoices/[id]/pdf` - Generate HTML invoice for printing

## 🎨 UI Components

The application includes several reusable components:

- **Navigation**: Main navigation with authentication status
- **ClientForm**: Form for creating/editing clients
- **InvoiceForm**: Comprehensive invoice creation form
- **Dashboard**: Overview with statistics and recent items
- **Email Verification Pages**: User-friendly verification and reset flows
- **Client Detail Pages**: Preview and edit pages for client management

## 🔒 Security Features

- **Input Validation**: Zod schemas for all form inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Authentication**: Secure session management with NextAuth.js
- **Email Verification**: Required email verification for new accounts
- **Password Security**: Bcrypt hashing with salt rounds
- **Unique Constraints**: Thread-safe invoice number generation
- **CORS Protection**: Built-in Next.js security features

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Railway

1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic scaling

### Database Hosting

- **Supabase**: Free PostgreSQL hosting
- **Railway**: Managed PostgreSQL
- **Neon**: Serverless PostgreSQL

## 🔮 Future Features (Phase 2+)

- **Payment Integration**: Stripe, PayPal integration
- **Recurring Invoices**: Automated invoice generation
- **Client Portal**: Client login and invoice viewing
- **Email Notifications**: Automated invoice delivery
- **Advanced Analytics**: Revenue tracking and reporting
- **Multi-currency**: Support for different currencies
- **Tax Calculations**: Advanced tax handling
- **Invoice Templates**: Customizable invoice designs
- **Two-Factor Authentication**: Enhanced security for user accounts
- **Bulk Operations**: Mass client and invoice management
- **Export Features**: CSV/Excel export for data analysis

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Check database permissions

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Clear browser cookies and local storage

3. **Email Not Sending**
   - Verify SMTP credentials in .env file
   - Check Gmail app password is correct
   - Ensure 2FA is enabled for Gmail
   - Check spam folder for verification emails

4. **PDF Generation Fails**
   - Check browser console for errors
   - Verify invoice data is complete
   - Try refreshing the page and generating again

### Development Tips

- Use `npx prisma studio` to view/edit database data
- Check browser developer tools for API errors
- Use `console.log` for debugging (remove in production)
- Monitor Prisma query performance

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the code comments for implementation details

## 🔄 User Flow

### New User Registration
1. **Sign Up**: User creates account with email/password
2. **Email Verification**: 6-digit code sent to email
3. **Verify Email**: User enters code to verify account
4. **Sign In**: User can now access the dashboard

### Password Reset
1. **Forgot Password**: User enters email on forgot password page
2. **Reset Code**: 6-digit code sent to email
3. **Reset Password**: User enters code and new password
4. **Sign In**: User can sign in with new password

### Invoice Management
1. **Create Client**: Add client information
2. **Create Invoice**: Select client and add invoice items
3. **Generate PDF**: Download/print professional invoice
4. **Manage**: Edit, delete, or update invoice status

## 🎯 Roadmap

- **Phase 1 (Current)**: MVP with core invoicing features ✅
  - ✅ User authentication with email verification
  - ✅ Client management with CRUD operations
  - ✅ Invoice creation and management
  - ✅ PDF generation for invoices
  - ✅ Password reset functionality
- **Phase 2**: Payment integration and recurring invoices
- **Phase 3**: Advanced analytics and client portal
- **Phase 4**: Multi-tenant and enterprise features

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
