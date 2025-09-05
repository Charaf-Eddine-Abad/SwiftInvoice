#!/bin/bash

echo "🚀 SwiftInvoice Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node -v) is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f .env ]; then
    echo ""
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from env.example"
    echo "⚠️  Please edit .env file with your database and NextAuth configuration"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo ""
echo "🗄️  Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database connection and NextAuth secret"
echo "2. Set up your PostgreSQL database"
echo "3. Run: npx prisma migrate dev --name init"
echo "4. Run: npm run dev"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo "Happy coding! 🚀"

