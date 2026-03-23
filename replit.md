# GymCRM — Gym Management System

## Overview
A comprehensive Gym CRM/Management System built with TypeScript/React, Express, PostgreSQL, and Drizzle ORM. Replaces a previous CarStore app.

## Architecture

### Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI + TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: JWT tokens stored in localStorage as `gym_crm_token`

### Key Directories
- `client/src/pages/` — All page components (one per feature)
- `client/src/components/layout/` — DashboardLayout + Sidebar
- `client/src/hooks/` — use-auth.ts for auth state
- `client/src/lib/queryClient.ts` — TanStack Query setup + JWT helpers
- `server/routes.ts` — All API endpoints
- `server/storage.ts` — Database operations (IStorage interface)
- `server/auth.ts` — JWT middleware (authenticate, requireRole)
- `shared/schema.ts` — Drizzle schema (17+ tables)

## Features & Pages
| Page | Path | Roles |
|---|---|---|
| Login | `/login` | All |
| Dashboard | `/dashboard` | All |
| Branches | `/branches` | owner |
| Members | `/members` | owner, admin |
| Coaches | `/coaches` | owner, admin |
| Classes | `/classes` | All |
| Packages | `/packages` | owner, admin |
| Payments | `/payments` | owner, admin |
| Attendance | `/attendance` | owner, admin, coach |
| CRM Leads | `/leads` | owner, admin |
| Products | `/products` | owner, admin |
| Diet Plans | `/diet-plans` | owner, admin, dietitian |
| Messages | `/messages` | owner, admin |
| Users | `/users` | owner |

## User Roles
- **owner** — Full access to all branches and features
- **admin** — Branch-scoped access to management features
- **coach** — Classes, attendance, member view
- **member** — Own profile, classes
- **dietitian** — Diet plans

## Authentication
- JWT-based, stored in `localStorage` as `gym_crm_token`
- Default owner: `owner@gymcrm.com` / `Owner@2024!`
- Default member password: `Member@2024`
- Default coach password: `Coach@2024`

## Database
- PostgreSQL via Drizzle ORM
- Push schema with: `npx drizzle-kit push --force`
- 17+ tables: users, branches, members, coaches, classes, bookings, packages, subscriptions, payments, attendance, leads, leadTasks, products, orders, orderItems, dietPlans, contactMessages, newsletter

## Running
- Workflow: `Start application` runs `npm run dev`
- Express serves on port 5000
- Vite HMR enabled for frontend
