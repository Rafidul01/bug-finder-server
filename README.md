# Bug Finder – Internal Tech Issue & Feature Tracker

A collaborative REST API platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `https://bug-finder-theta.vercel`  
**GitHub:** `https://github.com/Rafidul01/bug-finder-server`

---

## Features

- JWT-based authentication with role-based access control
- Two user roles: `contributor` and `maintainer`
- Full CRUD for issues (bugs & feature requests)
- Issue filtering by type and status, sorting by date
- Secure password hashing with bcrypt
- PostgreSQL with raw SQL (no ORM)
- Centralized error handling middleware
- Modular Express architecture

---

## Tech Stack

| Technology   | Usage                              |
|--------------|------------------------------------|
| Node.js 24+  | LTS runtime                        |
| TypeScript   | Strict typing throughout           |
| Express.js   | Modular router architecture        |
| PostgreSQL   | Relational database                |
| `pg`         | Native PostgreSQL driver           |
| `bcrypt`     | Password hashing (salt rounds: 10) |
| `jsonwebtoken` | JWT generation & verification    |

---

## Getting Started

### Prerequisites

- Node.js 24+
- PostgreSQL database (local or hosted)

### Installation

```bash
git clone https://github.com/Rafidul01/bug-finder-server
cd bug-finder-server
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/devpulse
JWT_SECRET=your_jwt_secret_here
```

### Database Setup

Run the following SQL to create the required tables:

```sql
CREATE TABLE IF NOT EXISTS users (
id           SERIAL PRIMARY KEY,
name         VARCHAR(40) NOT NULL,
email        VARCHAR(40) NOT NULL UNIQUE,
password     TEXT NOT NULL,
role         VARCHAR(20) DEFAULT 'contributor',
created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS issues(
id           SERIAL PRIMARY KEY,
title        VARCHAR(150) NOT NULL,
description  TEXT NOT NULL,
type         VARCHAR(20) NOT NULL,
status       VARCHAR(20) DEFAULT 'open',
reporter_id  INTEGER NOT NULL,
created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Run the Project

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

---

## API Endpoints

### Auth

| Method | Endpoint          | Access | Description          |
|--------|-------------------|--------|----------------------|
| POST   | `/api/auth/signup` | Public | Register a new user  |
| POST   | `/api/auth/login`  | Public | Login & receive JWT  |

### Issues

| Method | Endpoint         | Access                  | Description             |
|--------|------------------|-------------------------|-------------------------|
| POST   | `/api/issues`    | Authenticated           | Create a new issue      |
| GET    | `/api/issues`    | Public                  | Get all issues          |
| GET    | `/api/issues/:id` | Public                 | Get a single issue      |
| PATCH  | `/api/issues/:id` | Maintainer / Contributor (own + open) | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer only        | Delete an issue         |

### Authentication Header

```
Authorization: <JWT_TOKEN>
```

### Query Parameters (GET /api/issues)

| Param    | Values                          | Default  |
|----------|---------------------------------|----------|
| `sort`   | `newest`, `oldest`              | `newest` |
| `type`   | `bug`, `feature_request`        | —        |
| `status` | `open`, `in_progress`, `resolved` | —      |

**Example:** `GET /api/issues?sort=oldest&type=bug&status=open`

---

## Project Structure

```
src/
├── config/          # Database connection pool
├── modules/
│   ├── auth/        # Signup, login controllers & routes
│   └── issues/      # Issue controllers, services & routes
├── middleware/       # Auth guard, role check, error handler
├── utils/            # Response formatter, AppError class
└── app.ts            # Express app setup
```

---

## HTTP Status Codes Used

| Code | Meaning               |
|------|-----------------------|
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |