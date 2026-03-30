# WageGlass — Anonymous Salary Transparency

WageGlass is a platform for professionals to share and discover salary data anonymously.

## Project Structure

- `client/`: React + Vite + Tailwind CSS frontend
- `server/`: Node.js + Express + Mongoose backend
- `shared/`: Shared TypeScript types and interfaces

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example server/.env
   ```
3. Run development servers:
   ```bash
   # In root
   npm run dev
   ```

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Hook Form, Zod, Recharts, TanStack Query
- **Backend**: Node.js 20, Express 4, TypeScript, Mongoose 8
- **Database**: MongoDB Atlas
- **Security**: JWT, bcrypt, Helmet, Rate Limiter, Mongo Sanitize, HPP
