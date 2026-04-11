# Silabus.uz — Claude Code Guidelines

## Project Overview

University syllabus management platform for Uzbekistan (Toshkent International University context).  
Stack: FastAPI + SQLAlchemy (async) backend, Next.js 15 frontend, Docker Compose deployment, nginx proxy.

## Architecture

- **Backend:** `backend/app/` — FastAPI modules (auth, ai, syllabus, export, users)
- **Frontend:** `frontend/src/` — Next.js App Router, Zustand auth store, Axios client
- **Auth:** Cookie-based JWT (`withCredentials: true`), nginx forwards `Cookie` header to backend
- **API base:** Frontend calls `/api/v1/` → nginx proxies to FastAPI

## Design System

Always read `DESIGN.md` before making any visual or UI decisions. Key rules:

- Brand name is **Silabus.uz** — never "Silabuys" or other misspellings
- Primary color token: `primary-600` (#0E7490 teal) — never raw `blue-600`
- Accent color: `accent-600` (#D97706 amber) — used for the ".uz" logo mark
- Sidebar uses inline styles (not Tailwind classes) — see DESIGN.md for hex values
- Font: Plus Jakarta Sans (loaded via Google Fonts in globals.css)
- Page bg: `#F8F7F5` warm off-white

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
