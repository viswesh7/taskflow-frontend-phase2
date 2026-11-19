# TaskFlow · Phase 2 Frontend

A responsive React + TypeScript dashboard integrated with the **actual Phase 1 TaskFlow Spring Boot API**. Includes authentication, JWT refresh, tasks, categories, summary cards, filters, pagination, and status transitions.

## Requirements

- Node.js 20.19+ or 22.12+ recommended for Vite 6
- npm
- TaskFlow Phase 1 backend running on `http://localhost:8080`
- PostgreSQL + Liquibase working on backend before authenticated API calls will succeed

## Run (Windows PowerShell)

```powershell
cd taskflow-frontend-phase2
Copy-Item .env.example .env
npm install
npm run dev
```

Open **http://localhost:5173**.

For type-checking and production build:

```powershell
npm run typecheck
npm run build
npm run preview
```

## Backend integration

Set `VITE_API_BASE_URL` in `.env`, e.g. `http://localhost:8080/api/v1`. The Phase 1 backend `app.security.cors.allowed-origins` must include `http://localhost:5173` (the default in the provided backend). Restart Vite after changing `.env`.

| Screen / operation | Backend endpoint |
| --- | --- |
| Register | `POST /auth/register` |
| Login | `POST /auth/login` |
| Refresh | `POST /auth/refresh` |
| Logout | `POST /auth/logout` |
| Current user | `GET /users/me` (endpoint client included) |
| Dashboard | `GET /dashboard/summary` |
| Task list/search/filter/sort/page | `GET /tasks` |
| Create task | `POST /tasks` |
| Edit task (with `version`) | `PUT /tasks/{id}` |
| Change status | `PATCH /tasks/{id}/status` |
| Soft-delete task | `DELETE /tasks/{id}` |
| Categories list/create/edit/delete | `/categories` |

The frontend sends ISO-8601 UTC instants for due dates and converts to local time for editing. It respects the backend's allowed task transitions and displays server errors, including 409 conflicts. Category deletion is rejected by the backend when active tasks reference it.

## Important security and production notes

**The existing Phase 1 API returns both access and refresh tokens in JSON.** This frontend deliberately stores them **only in JavaScript memory**; no `localStorage`, `sessionStorage`, or persistent cookies. This reduces token persistence but **does not eliminate XSS risks**. Refresh is single-flight to avoid multiple concurrent requests from rotating the same refresh token. Reloading the page requires signing in again. Logout clears the local session immediately and attempts server-side refresh-token revocation.

For a production browser deployment, change the backend contract to put the refresh token in a `HttpOnly; Secure; SameSite` cookie, configure CSRF protection appropriately, and implement replay detection, refresh-token family revocation, login throttling, signing-key rotation, and robust CSP/security headers. The frontend cannot implement those backend controls by itself.

**Backend readiness:** This ZIP is a frontend artifact, not a repaired backend. If your Phase 1 app still fails on PostgreSQL `public` schema permissions or the Hibernate mixed insertable column mapping, fix those backend issues first. Frontend API calls will fail until Spring Boot starts successfully.

## Structure

```
src/
  components/    Task modal, reusable feedback and dialog UI
  context/       In-memory auth state
  layouts/       Responsive sidebar/header
  pages/         Login/register, dashboard, categories
  services/      Axios client, refresh interceptor, typed API calls
  types.ts       Types matching Java records
```

## Manual smoke-test checklist

1. Register (password at least 10 characters), then sign out and log in.
2. Create a category, then create a task assigned to it.
3. Edit title/priority/due date; verify the update sends `version`.
4. Change status through valid transitions; check summary cards update.
5. Search, filter by status/priority/category, sort, and page.
6. Delete task; verify it disappears from active list.
7. Delete an unused category; try deleting one with an active task to see the backend rejection.
8. Let an access token expire and trigger an API call to test automatic refresh.
9. Reload the page and confirm login is required (tokens are not persisted).

## Verification scope

The source and project ZIP are generated against the supplied backend Java DTOs and controllers. Type checking/build should be run with npm on your machine. End-to-end behavior requires a functioning Phase 1 backend; no live PostgreSQL/Spring Boot instance was available in this generation environment.
