# Finance Dashboard Frontend

Production-ready React + Vite + TypeScript frontend for a Spring Boot backend running at http://localhost:8081.

## Tech Stack

- React 19 + TypeScript
- Vite
- Material UI (MUI)
- React Router
- Axios
- React Hook Form + Zod

## Backend Contract

- Base URL: `http://localhost:8081`
- All endpoints return:
  - `status`: `success` or `error`
  # Finance Dashboard Frontend

  Production-ready React + Vite + TypeScript SPA for the Spring Boot backend at `http://localhost:8081`.

  ## 1) What This App Does

  - JWT login and role-aware navigation
  - Dashboard summary + recent transactions + monthly income vs expense chart
  - Records listing with pagination and filter support
  - Admin user management (create user, activate/deactivate)
  - Budget management and budget status checks
  - Admin audit log viewer

  ## 2) Tech Stack

  - React 19 + TypeScript
  - Vite
  - Material UI (MUI)
  - React Router v6+
  - Axios
  - React Hook Form + Zod
  - Recharts

  ## 3) Setup (Local)

  ### Prerequisites

  - Node.js 18+
  - npm 9+
  - Backend running at `http://localhost:8081`

  ### Environment

  Create/update `.env`:

  ```env
  VITE_API_BASE_URL=http://localhost:8081
  ```

  ### Install + Run

  ```bash
  npm install
  npm run dev
  ```

  Open: `http://localhost:5173`

  ### Quality Checks

  ```bash
  npm run lint
  npm run build
  ```

  ## 4) Authentication and Security Flow

  - Login endpoint: `POST /api/auth/login`
  - JWT is read from `ApiResponse.data.token`
  - Token is stored in `localStorage` under `token`
  - Axios automatically adds `Authorization: Bearer <token>` to `/api/**`
  - On HTTP `401`, token is cleared and app redirects to `/login`
  - Client decodes JWT payload to read:
    - `sub` (username)
    - `roles` (role array)
    - `exp` (expiry)

  ## 5) Roles and Access

  - `ROLE_ADMIN`
    - Full access: dashboard, records CRUD, users, budget, audit
  - `ROLE_ANALYST`
    - Dashboard, records (read/filter), budget
  - `ROLE_VIEWER`
    - Dashboard-only experience

  ## 6) API Surface Used (Exact)

  - `POST /api/auth/login`
  - `GET /api/summary`

  ### Records

  - `GET /api/records?page=0&size=10`
  - `GET /api/records/filter?start=YYYY-MM-DD&end=YYYY-MM-DD&category=...&type=INCOME|EXPENSE&page=0&size=10`
  - `POST /api/records`
  - `PUT /api/records`
  - `DELETE /api/records/{id}`

  ### Users

  - `POST /api/users`
  - `GET /api/users`
  - `PUT /api/users/{id}/status?active=true|false`

  ### Budget

  - `POST /api/budget`
  - `GET /api/budget/status?userId=<id>`

  ### Audit

  - `GET /api/audit`

  All endpoints are expected to return:

  ```json
  {
    "status": "success|error",
    "message": "string|null",
    "data": "any|null"
  }
  ```

  If `status !== "success"`, the client throws and shows the API message.

  ## 7) Assumptions

  - Backend CORS allows `http://localhost:5173`
  - JWT includes `roles` claim as array of strings
  - Records endpoints return paginated data shape:
    - `content`, `totalElements`, `totalPages`, `pageNumber`, `pageSize`
  - Budget status endpoint may return either one object or a list (handled in UI)

  ## 8) Tradeoffs Considered

  - Chose localStorage token storage for simplicity and compatibility with current backend contract; this is convenient but less resilient than HttpOnly cookie strategy against XSS.
  - Chose centralized Axios wrapper + interceptors to keep API behavior consistent and predictable across pages.
  - Added charting with Recharts for better dashboard UX, which increases bundle size; can be optimized with lazy loading/code splitting if needed.
  - Kept optional advanced caching libraries (for example React Query) out to reduce complexity and keep project easy to maintain.

  ## 9) Troubleshooting

  - Browser `Network Error` on login usually means backend CORS/preflight issue, not frontend runtime failure.
  - Verify backend is reachable:

  ```bash
  curl -i -X POST http://localhost:8081/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin1","password":"admin123"}'
  ```

  - If this works in curl but not browser, fix CORS in backend security config.

  ## 10) Project Structure

  ```text
  src/
    api/
      auth.ts
      audit.ts
      budget.ts
      client.ts
      records.ts
      summary.ts
      users.ts
    auth/
      AuthContext.ts
      AuthProvider.tsx
      token.ts
      useAuth.ts
    components/
      AppErrorBoundary.tsx
      AppSnackbarContext.ts
      AppSnackbarProvider.tsx
      AuditTable.tsx
      BudgetForm.tsx
      Layout.tsx
      Navbar.tsx
      ProtectedRoute.tsx
      RecordForm.tsx
      SummaryWidgets/
        index.tsx
      UserForm.tsx
      dialogs/
        ConfirmDialog.tsx
      useAppSnackbar.ts
    pages/
      AuditPage.tsx
      BudgetPage.tsx
      DashboardPage.tsx
      LoginPage.tsx
      RecordsPage.tsx
      UsersPage.tsx
    types/
      index.ts
    utils/
      charts.ts
      date.ts
  ```
