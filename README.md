# Finance Dashboard Monorepo

This repository contains both applications for the Finance Dashboard system:

- frontend: React + Vite + TypeScript SPA
- backend: Spring Boot REST API with JWT auth and role-based access

## Repository Structure

- frontend: UI application for login, dashboard, records, users, budget, and audit pages
- backend: Java API implementing authentication, business logic, persistence, and access control

## System Overview

The frontend communicates with the backend over HTTP.

- Backend base URL (local): http://localhost:8081
- Frontend dev URL (local): http://localhost:5173
- Auth model: JWT Bearer token
- Response envelope used by API:
  {
    "status": "success|error",
    "message": "string|null",
    "data": "any|null"
  }

## Core Features

- JWT login and role-aware routing
- Financial records listing, filtering, and admin CRUD
- Dashboard summary and monthly income vs expense chart
- Admin user management (create + active status toggle)
- Budget creation and budget status viewing
- Admin audit log viewing

## Roles

- ROLE_ADMIN: full access (frontend + backend admin operations)
- ROLE_ANALYST: dashboard, records read/filter, budget status
- ROLE_VIEWER: dashboard-only experience

## Local Setup

### 1) Start Backend

From backend folder:

- cd backend
- ./mvnw -DskipTests package
- java -jar target/backend-0.0.1-SNAPSHOT.jar

Backend runs on: http://localhost:8081

### 2) Start Frontend

From frontend folder:

- cd frontend
- npm install
- npm run dev

Frontend runs on: http://localhost:5173

## Frontend Environment

Create or update frontend/.env with:

VITE_API_BASE_URL=http://localhost:8081

## Seeded Users (Backend)

- admin / adminpass
- admin1 / admin123
- analyst1 / analyst123
- viewer1 / viewer123

## Key API Endpoints

- POST /api/auth/login
- GET /api/summary
- GET /api/records
- GET /api/records/filter
- POST /api/records
- PUT /api/records
- DELETE /api/records/{id}
- POST /api/users
- GET /api/users
- PUT /api/users/{id}/status?active=true|false
- POST /api/budget
- GET /api/budget/status?userId=<id>
- GET /api/audit
- POST /api/admin/seed (admin only)

## Assumptions and Tradeoffs

- Frontend stores JWT in localStorage for simplicity and current contract compatibility.
- Backend defaults to H2 in-memory for quick local setup.
- Charting support improves visibility but increases frontend bundle size.
- Optional analytics methods may exist in service layer; only public controller endpoints are consumed by frontend.

## Troubleshooting

- If frontend login shows Network Error but backend works in curl, check backend CORS.
- Ensure backend allows origin http://localhost:5173 and OPTIONS preflight for /api endpoints.
- If requests fail with 401, verify token, role claims, and expiry.

## Detailed Docs

- Frontend details: see frontend/README.md
- Backend details: see backend/README.md
