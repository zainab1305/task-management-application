# Task Management Application

Production-ready task manager built with Next.js App Router and MongoDB, including secure authentication, encrypted task payloads, and protected frontend routes.

## Tech Stack

- Backend and Frontend: Next.js 16 (App Router + API Routes)
- Database: MongoDB (Mongoose)
- Authentication: JWT in HTTP-only cookie
- Security: bcrypt password hashing, AES-256-GCM task description encryption, schema validation via Zod

## Core Features

- User registration and login
- JWT-based authentication with HTTP-only cookie storage
- Password hashing using bcrypt
- Task CRUD APIs with title, encrypted description, status, created date
- Authorization so users only access their own tasks
- Pagination in list API
- Filtering by status
- Search by title
- Protected frontend routes (`/dashboard`)
- Structured API errors and proper HTTP status codes

## Security Practices Applied

- Input validation with Zod on all API write/query paths
- Secure auth cookie configuration:
	- `HttpOnly`
	- `SameSite=Lax`
	- `Secure` in production
- Sensitive field encryption (task description) using AES-256-GCM
- JWT expiration (`7d`)
- Environment variables are required at runtime and never hardcoded
- Query/filter handling avoids injection-style payloads through strict schema parsing and escaped regex search

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Tasks

- `GET /api/tasks?page=1&limit=10&status=todo&search=title`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template and set values:

```bash
cp .env.example .env.local
```

3. Fill required variables in `.env.local`:

- `MONGODB_URI`
- `JWT_SECRET`
- `ENCRYPTION_SECRET`

4. Run development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`

## Deploy (Vercel Recommended)

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set build command to default (`next build`).
4. Configure environment variables in Vercel project settings:
	 - `MONGODB_URI`
	 - `JWT_SECRET`
	 - `ENCRYPTION_SECRET`
5. Deploy.

The cookie `Secure` flag is automatically enabled in production via `NODE_ENV=production`.

## Deployment Alternatives

You can deploy on Render, Railway, or Azure App Service with the same environment variables. Ensure HTTPS is enabled in production so secure cookies are correctly transmitted.
