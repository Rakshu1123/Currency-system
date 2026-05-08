# EC Platform — Next.js Full Stack
### CHIAC ASI · Superintelligence Edge Project · Group 8

## Quick Start (2 commands)

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**

## Login Credentials

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| User  | demo@ec.platform      | demo123   |
| Admin | admin@ec.platform     | admin123  |

Or register a new account — no backend setup needed.

## Tech Stack
- **Framework**: Next.js 15 (App Router)  
- **Auth**: JWT + bcrypt  
- **Database**: JSON file (auto-created in `/data/db.json`)  
- **Styling**: Tailwind CSS + custom CSS  
- **Charts**: Recharts  
- **Icons**: Lucide React  

## Features
- ✅ Login / Register with JWT auth
- ✅ Dashboard with EC stats & weekly chart
- ✅ Contribution submission (5 types)
- ✅ Admin review panel (approve / reject / audit flag)
- ✅ Global leaderboard with podium
- ✅ Redemption store (Tier 1/2/3 rewards)
- ✅ User profile with full history
- ✅ EC formula engine with weekly cap & integrity system

## EC Formula
```
EC = (Hours × Quality Factor + Collaboration Bonus) × Integrity Multiplier
```
Weekly cap: 40 EC · Learning cap: 10 EC · Audit penalty: 0.5× for 2 weeks
