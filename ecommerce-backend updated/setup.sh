#!/bin/bash

# Setup script for @gabfashion/ecommerce-backend package

echo "🚀 Setting up @gabfashion/ecommerce-backend package..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create npm link
echo "🔗 Creating npm link..."
npm link

echo "✅ Package setup complete!"
echo ""
echo "To use this package in your projects:"
echo "1. Run: npm link @gabfashion/ecommerce-backend"
echo "2. Import: import { createEcommerceBackend } from '@gabfashion/ecommerce-backend'"
echo ""
echo "For Urban Jungle project:"
echo "1. Create new project directory"
echo "2. Run: npm link @gabfashion/ecommerce-backend"
echo "3. Use with tablePrefix: 'urban_'"
echo ""
echo "To unlink: npm unlink @gabfashion/ecommerce-backend"

