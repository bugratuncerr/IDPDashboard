# CoachHub - Sports Team Management Dashboard

> 🚀 **New to this project?** Check out **[START_HERE.md](./START_HERE.md)** for the fastest way to get running!

A modern, coach-centric web dashboard for managing sports teams, training sessions, and matches. Built with React, TypeScript, and Tailwind CSS.

## Features

- 📊 **Dashboard** - Team statistics and quick actions
- 👥 **Team Management** - Player profiles and team organization
- 📝 **Exercises Library** - Create and manage reusable training exercises
- 🎯 **Training Manager** - Build comprehensive training sessions
- 📚 **Libraries** - Manage Basics, Principles, and Tactics
- ⚽ **Match & Lineup** - Visual field positioning and lineup builder
- 🌙 **Dark Mode** - Full dark mode support with localStorage persistence
- 📱 **Responsive** - Optimized for desktop (1440px width)

## Quick Start

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. **Clone or download this repository**

2. **Copy component files**

   You need to manually copy the component files from `/components` to `/src/components`:

   ```bash
   # On macOS/Linux
   mkdir -p src/components
   cp -r components/* src/components/

   # On Windows (PowerShell)
   New-Item -ItemType Directory -Force -Path src/components
   Copy-Item -Path components/* -Destination src/components/ -Recurse
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173`

## Default Login Credentials

- **Email:** coach@example.com
- **Password:** password123

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts and graphs
- **React DnD** - Drag and drop functionality
- **Sonner** - Toast notifications
- **React Hook Form** - Form handling

## Project Structure

```
coach-dashboard/
├── src/
│   ├── components/
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
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features Detail

### Training Sessions Architecture

Training sessions are composed of three layers:
1. **Basics** - Fundamental concepts
2. **Principles** - Coach-specific philosophy
3. **Tactics** - Widely known tactical systems

### Dark Mode

Toggle dark mode using the moon/sun icon in the navigation bar. Preference is saved to localStorage.

### Data Persistence

All data is stored in localStorage, allowing you to maintain your work across sessions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.