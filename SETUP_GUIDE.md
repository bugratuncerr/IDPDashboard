# Setup Guide - CoachHub Dashboard

Follow these simple steps to get your project running locally.

## 🎯 Quick Setup (Automated)

### For macOS/Linux:

```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### For Windows:

```cmd
# Run the setup script
setup.bat
```

The automated script will:
1. Create the `src/components` directory
2. Copy all component files
3. Install npm dependencies
4. Confirm successful setup

---

## 🔧 Manual Setup (If automated setup fails)

### Step 1: Copy Component Files

**On macOS/Linux:**
```bash
mkdir -p src/components
cp components/*.tsx src/components/
```

**On Windows (Command Prompt):**
```cmd
mkdir src\components
xcopy /Y /I components\*.tsx src\components\
```

**On Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path src/components
Copy-Item -Path components/*.tsx -Destination src/components/
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

---

## ✅ Verification

After setup, your project structure should look like this:

```
coach-dashboard/
├── node_modules/          # ✅ Created after npm install
├── src/
│   ├── components/        # ✅ Should contain all .tsx files
│   │   ├── BasicsLibrary.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ExercisesLibrary.tsx
│   │   ├── LoginPage.tsx
│   │   ├── MatchLineup.tsx
│   │   ├── Navigation.tsx
│   │   ├── PrinciplesLibrary.tsx
│   │   ├── TacticsLibrary.tsx
│   │   ├── TeamManagement.tsx
│   │   └── TrainingManager.tsx
│   ├── styles/
│   │   └── globals.css    # ✅ Already exists
│   ├── App.tsx            # ✅ Already exists
│   └── main.tsx           # ✅ Already exists
├── package.json           # ✅ Already exists
└── ...other config files
```

---

## 🚀 Running the Application

Once setup is complete:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:5173`

3. **Login with default credentials:**
   - Email: `coach@example.com`
   - Password: `password123`

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:** Make sure all component files are in `src/components/`

```bash
# Check if files exist
ls src/components/

# Should show: BasicsLibrary.tsx, Dashboard.tsx, etc.
```

### Issue: npm install fails

**Solution:** Delete `node_modules` and `package-lock.json`, then try again

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 is already in use

**Solution:** The app will automatically try a different port, or you can specify one:

```bash
npm run dev -- --port 3000
```

### Issue: Components not copying on Windows

**Solution:** Use PowerShell with administrator privileges or manually copy files:

1. Open File Explorer
2. Navigate to `/components` folder
3. Select all `.tsx` files
4. Copy them to `/src/components` folder

---

## 📦 Build for Production

When you're ready to build for production:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` folder.

---

## 💡 Additional Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean install (if having issues)
rm -rf node_modules package-lock.json && npm install
```

---

## 🎨 Features to Explore

Once running, check out these features:

- **Dashboard** - Overview of team statistics
- **Team Management** - Add and manage players
- **Exercises Library** - Create reusable training exercises
- **Training Manager** - Build comprehensive training sessions
- **Basics/Principles/Tactics** - Three-layer training architecture
- **Match & Lineup** - Drag-and-drop lineup builder
- **Dark Mode** - Toggle with moon/sun icon in navigation

---

## 📞 Need Help?

If you encounter any issues:

1. Check this guide's troubleshooting section
2. Ensure you're using Node.js 16 or higher (`node --version`)
3. Try a clean install: `rm -rf node_modules package-lock.json && npm install`
4. Check the browser console for error messages (F12)

---

**Happy Coaching! ⚽🏀🏈**
