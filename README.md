# CreateKar

Full-stack creator campaign collaboration and contract management platform built with Next.js 14 App Router, Neon PostgreSQL, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Neon PostgreSQL (`@neondatabase/serverless`)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## Features
- **Creator Directory**: Search and filter verified creators across niches (Tech, Fashion, Fitness, Lifestyle).
- **Campaign Proposals**: Propose contract campaigns with dynamic deliverable types, custom budgets, and deliverable deadlines.
- **Contract Lifecycle**: Schema supporting states (`PROPOSED`, `ACCEPTED`, `FUNDED`, `IN_REVIEW`, `COMPLETED`, `DISPUTED`).
- **PostgreSQL Schema**: Production-ready schema for profiles, contracts, deliverables, and invoices with automated timestamps and foreign key integrity.

## Local Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   ```

3. **Run Database Migration**:
   ```bash
   node --env-file=.env scripts/migrate.mjs
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deploying to Render

1. Create a new **Web Service** on [Render](https://dashboard.render.com).
2. Connect this GitHub repository (`CreateKar`).
3. Set the following build and start settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variable:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
5. Deploy service.
