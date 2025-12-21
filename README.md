# OnSite - First Contact Visit App

A modern web application built with React and Node.js for managing customer visits and form templates.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **State Management**: Zustand

## Project Structure

```
onsite/
├── client/          # React frontend application
├── server/         # Node.js backend API
└── supabase/       # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:

**client/.env:**
```
VITE_SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
```

**server/.env:**
```
SUPABASE_URL=https://ckargfikgicnflsqbbld.supabase.co
SUPABASE_ANON_KEY=sb_publishable_tQ1pbrvgVOwtc148R3oq9w_VkjXFyMU
PORT=3001
CLIENT_URL=http://localhost:5173
GOOGLE_WEB_CLIENT_ID=your_google_client_id
```

### Running the Application

Start both client and server in development mode:
```bash
npm run dev
```

Or run them separately:

**Server:**
```bash
npm run dev:server
```

**Client:**
```bash
npm run dev:client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Building for Production

```bash
npm run build
```

This will build both the client and server applications.

## Features

- 🔐 Google OAuth authentication
- 📋 Form template management
- 👥 Contact management with Google Contacts import
- 📝 Visit form filling with signature capture
- 📄 PDF report generation
- 📊 Dashboard with statistics
- 👤 User profile management

## Environment Variables

### Client (.env)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Server (.env)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Frontend URL
- `GOOGLE_WEB_CLIENT_ID` - Google OAuth client ID

## License

ISC

