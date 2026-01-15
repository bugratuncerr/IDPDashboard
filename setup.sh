#!/bin/bash

echo "🚀 Setting up CoachHub Dashboard..."
echo ""

# Create src/components directory if it doesn't exist
echo "📁 Creating src/components directory..."
mkdir -p src/components

# Copy all component files
echo "📋 Copying component files..."
cp -r components/*.tsx src/components/ 2>/dev/null || {
    echo "⚠️  Warning: Could not copy all files. Please manually copy files from /components to /src/components"
}

# Check if components were copied
if [ -f "src/components/Dashboard.tsx" ]; then
    echo "✅ Components copied successfully!"
else
    echo "❌ Failed to copy components. Please manually copy files:"
    echo "   cp -r components/*.tsx src/components/"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🎯 To start the development server, run:"
    echo "   npm run dev"
    echo ""
    echo "📧 Default login credentials:"
    echo "   Email: coach@example.com"
    echo "   Password: password123"
    echo ""
else
    echo "❌ npm install failed. Please run 'npm install' manually."
    exit 1
fi
