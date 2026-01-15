@echo off
echo 🚀 Setting up CoachHub Dashboard...
echo.

REM Create src/components directory if it doesn't exist
echo 📁 Creating src/components directory...
if not exist "src\components" mkdir src\components

REM Copy all component files
echo 📋 Copying component files...
xcopy /Y /I components\*.tsx src\components\ >nul 2>&1

REM Check if components were copied
if exist "src\components\Dashboard.tsx" (
    echo ✅ Components copied successfully!
) else (
    echo ❌ Failed to copy components. Please manually copy files:
    echo    xcopy /Y /I components\*.tsx src\components\
    exit /b 1
)

echo.
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Setup complete!
    echo.
    echo 🎯 To start the development server, run:
    echo    npm run dev
    echo.
    echo 📧 Default login credentials:
    echo    Email: coach@example.com
    echo    Password: password123
    echo.
) else (
    echo ❌ npm install failed. Please run 'npm install' manually.
    exit /b 1
)
