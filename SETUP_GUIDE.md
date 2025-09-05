# SwiftInvoice Setup Guide

This guide will walk you through setting up SwiftInvoice on your local machine step by step.

## 🚀 Quick Setup (Recommended)

If you want to get started quickly, run our setup script:

```bash
./setup.sh
```

This script will:
- Check your Node.js version
- Install dependencies
- Create your .env file
- Generate the Prisma client

## 📋 Manual Setup

### Prerequisites

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **PostgreSQL Database** - Local or cloud-hosted
3. **Git** - For version control

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/swiftinvoice"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

3. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

### Step 3: Database Setup

1. **Create PostgreSQL Database**:
   ```sql
   CREATE DATABASE swiftinvoice;
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Optional: View Database**:
   ```bash
   npx prisma studio
   ```

### Step 4: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Options

### Local PostgreSQL

1. **Install PostgreSQL**:
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt-get install postgresql`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

2. **Start PostgreSQL**:
   - **macOS**: `brew services start postgresql`
   - **Ubuntu**: `sudo systemctl start postgresql`

3. **Create Database**:
   ```bash
   createdb swiftinvoice
   ```

### Cloud Options

#### Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update your `.env` file

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection string to `.env`

#### Neon
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Get connection string from dashboard
4. Update your `.env` file

## 🔐 First User Setup

1. **Start the application**: `npm run dev`
2. **Navigate to**: [http://localhost:3000](http://localhost:3000)
3. **Click "Get Started"** to create your first account
4. **Sign in** with your new credentials
5. **Start using SwiftInvoice!**

## 🧪 Testing the Application

### Create Your First Client

1. Go to **Clients** in the navigation
2. Click **"Add New Client"**
3. Fill in client details:
   - Name: "Test Client"
   - Email: "test@example.com"
   - Company: "Test Company"
4. Click **"Create Client"**

### Create Your First Invoice

1. Go to **Invoices** in the navigation
2. Click **"Create New Invoice"**
3. Select your client
4. Add invoice items:
   - Description: "Web Development"
   - Quantity: 10
   - Unit Price: 100
5. Set dates and tax/discount if needed
6. Click **"Create Invoice"**

### Download PDF

1. In the invoices list, click the **download icon** (📥)
2. The PDF will download automatically
3. Open to verify the invoice looks professional

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and your connection string is correct.

#### 2. Prisma Client Error
```
Error: PrismaClient is not generated
```
**Solution**: Run `npx prisma generate`

#### 3. Authentication Issues
```
Error: Invalid credentials
```
**Solution**: Check your NEXTAUTH_SECRET and clear browser cookies.

#### 4. PDF Generation Fails
```
Error: Failed to generate PDF
```
**Solution**: Ensure all invoice data is complete and pdfmake is installed.

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
DEBUG=*
```

### Check Logs

Monitor your terminal for error messages and check the browser console for client-side errors.

## 🚀 Production Deployment

### Environment Variables

Update your `.env` for production:
```env
NEXTAUTH_URL="https://yourdomain.com"
DATABASE_URL="postgresql://username:password@your-db-host:5432/database_name"
NEXTAUTH_SECRET="your-production-secret"
```

### Build and Deploy

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**:
   - **Vercel**: Connect GitHub repo
   - **Railway**: Connect GitHub repo
   - **Netlify**: Build and deploy

## 📚 Next Steps

After successful setup:

1. **Explore the Dashboard** - View your statistics and recent items
2. **Add More Clients** - Build your client database
3. **Create Invoices** - Start invoicing your clients
4. **Customize** - Modify the application to fit your needs
5. **Learn More** - Read the code comments and documentation

## 🆘 Getting Help

- **Documentation**: Check the main README.md
- **Issues**: Create an issue in the GitHub repository
- **Code**: Review the code comments for implementation details
- **Community**: Join our discussions

## 🎯 What's Next?

This completes Phase 1 of SwiftInvoice! You now have a fully functional invoicing platform with:

- ✅ User authentication
- ✅ Client management
- ✅ Invoice creation and management
- ✅ PDF generation
- ✅ Responsive dashboard

**Future phases** will include:
- Payment integration
- Recurring invoices
- Client portal
- Advanced analytics
- Email notifications

---

**Happy invoicing! 🚀**

