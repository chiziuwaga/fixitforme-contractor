# Vercel Deployment Guide for FixItForMe Contractor Module

This guide provides the necessary steps and configuration to deploy the FixItForMe Contractor Module to Vercel.

## 1. Project Configuration

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

## 2. Environment Variables

The following environment variables must be set in the Vercel project settings. These values are available in the `.env.local` file in the root of the repository.

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

### Database (Postgres)
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### AI Provider
- `DEEPSEEK_API_KEY`

### Application
- `NEXT_PUBLIC_APP_URL` (Set to `https://contractor.fixitforme.ai`)
- `NEXT_PUBLIC_SITE_URL` (Set to `https://contractor.fixitforme.ai`)

### Demo Mode
- `NEXT_PUBLIC_DEMO_MODE` (Set to `true` for the demo version, `false` for full production)

## 3. Deployment Steps

1. Connect your Git repository to Vercel.
2. Configure the project settings as described above.
3. Add all the environment variables listed in section 2 to the Vercel project's environment variables settings.
4. Trigger a deployment. Vercel will automatically use the build command and settings from `package.json` and `next.config.ts`.
5. Once the deployment is successful, the application will be available at the domain configured in your Vercel project (e.g., `https://contractor.fixitforme.ai`).
