# Finance Dashboard Backend

This repository contains a Spring Boot backend for a Finance Dashboard application. It implements user/role management, financial records CRUD, analytics, budgets, and audit logging. The project is intentionally structured with a clear Controller → Service → Repository separation and includes JWT-based authentication.

## Quick status
- App is configured to run on port `8081`.
- Seeded users:
  - `admin` / `adminpass` (ROLE_ADMIN)
  - `admin1` / `admin123` (ROLE_ADMIN)
  - `analyst1` / `analyst123` (ROLE_ANALYST)
  - `viewer1` / `viewer123` (ROLE_VIEWER)
- Seeded demo financial records and budgets for exploration.
- Admin-only runtime seed endpoint: `POST /api/admin/seed` (requires ADMIN JWT).

## Tech stack
- Java 17
- Spring Boot 3.5.x
- Spring Data JPA (H2 in-memory by default)
- Spring Security with JWT (jjwt)
- OpenAPI / Swagger UI

## Project layout (important files)
- `src/main/java/com/upwise/backend/controller` — REST controllers
- `src/main/java/com/upwise/backend/service` — business logic
- `src/main/java/com/upwise/backend/repository` — Spring Data JPA repositories
- `src/main/java/com/upwise/backend/model` — JPA entities
- `src/main/java/com/upwise/backend/dto` — DTOs and ApiResponse wrapper
- `src/main/java/com/upwise/backend/bootstrap/DataInitializer.java` — seeds roles, users, demo data at startup
- `pom.xml` — maven build and dependencies

## Setup & Run (local)
1. Build the project:
```bash
./mvnw -DskipTests package
```

2. Run the packaged jar:
```bash
nohup java -jar target/backend-0.0.1-SNAPSHOT.jar > backend.log 2>&1 & echo $! > backend.pid
tail -f backend.log
```

3. Open Swagger UI (if app started):
```
http://localhost:8081/swagger-ui.html
```

## Environment & JWT secret
- The app reads `SPRING_JWT_SECRET` environment variable (base64 encoded) for JWT signing. If not supplied, a development fallback key is used — change this in production.
- To set a secret (example, base64 of a 32-byte key):
```bash
export SPRING_JWT_SECRET=BASE64_YOUR_32_BYTE_KEY
```

## API summary (core endpoints)
- `POST /api/auth/login` — body: { username, password } → returns ApiResponse.data.token
- `GET /api/summary` — dashboard summary (role-based)
- `GET /api/records` — paginated list
- `GET /api/records/filter` — filter by date range/category/type
- `POST /api/records` — create (ADMIN)
- `PUT /api/records` — update (ADMIN)
- `DELETE /api/records/{id}` — delete (ADMIN)
- `POST /api/users` — create user (ADMIN)
- `GET /api/users` — list users (ADMIN)
- `PUT /api/users/{id}/status` — update active (ADMIN)
- `POST /api/budget` — create budget (ADMIN)
- `GET /api/budget/status?userId=X` — budget status (ADMIN, ANALYST)
- `GET /api/audit` — view audit logs (ADMIN)
- `POST /api/admin/seed` — re-run seeding (ADMIN)

All API responses use the standard envelope:
```json
{ "status": "success|error", "message": <string|null>, "data": <any|null> }
```

## Seeded demo data
- Users listed above.
- Demo financial records (income and expenses across Salary, Rent, Groceries, Dining, Transport) seeded at startup.
- Budgets for `admin1` seeded for Groceries, Dining, Rent.
- Some audit logs created at startup for exploration.

## Assumptions & Tradeoffs
- H2 in-memory DB is used for simplicity; switch to MySQL/Postgres by updating `application.properties`.
- JWT secret fallback is insecure (only for dev); production must provide `SPRING_JWT_SECRET`.
- Debug endpoints were removed from default runtime — use a dev-only approach with `@Profile("dev")` if you need temporary debugging routes.
- Analytics logic moved to `AnalyticsService`, accessible via `GET /api/summary`. Some analytics methods exist in the service layer but may not be exposed via public endpoints; they can be added if required.

## Clean up & removed items
- `DebugController` endpoints removed (file retained but disabled) to keep production surface clean.
- Temporary helper endpoints used during development were deleted or protected.

## How to re-seed demo data at runtime
1. Login as an admin (e.g., `admin` / `adminpass`) to obtain JWT.
2. Call:
```bash
curl -X POST http://localhost:8081/api/admin/seed -H "Authorization: Bearer <TOKEN>"
```

## Next recommended steps
- Provide a `frontend/` directory (React + Vite) implementing login, summary, records, users, budget, audit pages following the `frontend-copilot-prompt.txt` in this repo.
- Add persistent DB configuration and secure JWT secret via environment variables for production.
- Add integration tests (MockMvc) covering auth, records, analytics, and access control.

---
If you want, I can now scaffold a minimal `frontend/` app inside this workspace (login + summary) and wire it to the backend. Say "scaffold frontend" and I’ll add a working Vite React project with the Axios client and a Login page.
