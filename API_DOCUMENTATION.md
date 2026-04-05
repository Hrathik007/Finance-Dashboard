# Finance Dashboard API Documentation

This document describes the public API endpoints for the Finance Dashboard backend.

## Base URL

- Local development: `http://localhost:8081`
- Production: replace with your deployed backend URL

## Response Envelope

All endpoints return:

```json
{
  "status": "success|error",
  "message": "string|null",
  "data": "any|null"
}
```

## Authentication

### Login
- Method: `POST`
- Path: `/api/auth/login`
- Body:

```json
{
  "username": "admin1",
  "password": "admin123"
}
```

- Success response data:

```json
{
  "token": "<JWT_TOKEN>"
}
```

### Authorization Header

For protected endpoints, send:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Roles

- `ROLE_ADMIN`
- `ROLE_ANALYST`
- `ROLE_VIEWER`

## Endpoints

### Summary
- `GET /api/summary`
- Access: ADMIN, ANALYST

### Financial Records
- `GET /api/records?page=0&size=10`
  - Access: ADMIN, ANALYST, VIEWER
- `GET /api/records/filter?start=YYYY-MM-DD&end=YYYY-MM-DD&category=...&type=INCOME|EXPENSE&page=0&size=10`
  - Access: ADMIN, ANALYST, VIEWER
- `POST /api/records`
  - Access: ADMIN
- `PUT /api/records`
  - Access: ADMIN
- `DELETE /api/records/{id}`
  - Access: ADMIN

### Users
- `POST /api/users`
  - Access: ADMIN
- `GET /api/users`
  - Access: ADMIN
- `PUT /api/users/{id}/status?active=true|false`
  - Access: ADMIN

### Budget
- `POST /api/budget`
  - Access: ADMIN
- `GET /api/budget/status?userId=<id>`
  - Access: ADMIN, ANALYST

### Audit
- `GET /api/audit`
- Access: ADMIN

### Admin Utility
- `POST /api/admin/seed`
- Access: ADMIN

## Example Curl

### Login

```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"admin123"}'
```

### Get Records with Token

```bash
curl -X GET "http://localhost:8081/api/records?page=0&size=10" \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Notes

- Token is expected in `data.token` after login.
- Frontend stores token in local storage key `token`.
- On `401`, frontend clears token and redirects to login.
