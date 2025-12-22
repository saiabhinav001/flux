# Flux ⚡

> **The Event-Driven Command Canvas.**
> A local-first, keyboard-centric workflow automation tool for the modern web.

![Flux Canvas](./docs/hero.png)

## 🌟 Vision
Flux is not a task manager or a Zapier clone. It is a **live instrument** for composing automation.
Built with a "Neo-glassmorphism" aesthetic, it prioritizes **God-tier micro-interactions**, real-time state, and keyboard parity.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Canvas Engine**: React Flow (@xyflow/react)
- **State**: Zustand + Supabase Realtime
- **Database**: PostgreSQL (Supabase)
- **Scheduling**: GitHub Actions (Free Cron)

## 🚀 Getting Started

### Prerequisites
1. Node.js 18+
2. A [Supabase](https://supabase.com) project.

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/flux.git
   cd flux
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Schema**
   Run the SQL found in [`schema.sql`](./schema.sql) in your Supabase SQL Editor to create tables and enabling Realtime.

4. **Run Locally**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

## 🎮 Usage
- **Open Command Palette**: `Cmd + K` (or `Ctrl + K`)
- **Add Trigger**: Select "Add Trigger" (Cron Node).
- **Add Action**: Select "Add Action" (HTTP Request Node).
- **Connect**: Drag from the bottom handle of Trigger to the top handle of Action.
- **Run Simulation**: `Cmd + K` -> "Trigger Execution".

## 🕰 Setting up the "Free Scheduler"
Flux uses GitHub Actions to trigger your workflows for free (every 5 minutes).

1. **Deploy** your app (e.g., to Vercel).
2. **Configure Secrets** in your GitHub Repo:
   - `DEPLOY_URL`: Your deployed URL (e.g., `https://my-flux.vercel.app`)
   - `CRON_KEY`: `flux-secret-cron-key`
3. **Enable Workflow**: The scheduler is defined in `.github/workflows/scheduler.yml`.

## 📜 License
MIT © 2025 Flux Contributors
