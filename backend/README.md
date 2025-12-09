# PharmaTrade — Backend Server (Go)

A simple B2B medicine ordering backend written in Go using Gin, PostgreSQL and JWT-based authentication. This README explains how to set up, run, and understand the code you provided (signup/login/products/orders/admin flows), along with example requests and a suggested database schema.

---

## Table of Contents

- Project overview
- Features
- Tech stack
- Getting started
  - Prerequisites
  - Configuration
  - Database schema (example)
  - Run locally
- API endpoints (examples)
- File structure (high level)
- Security & production notes
- TODO / Improvements
- License & contact

---

## Project overview

This service provides the following flows:

- User signup (with license PDF upload)
- Admin approval for clients (RETAILER / CLINIC)
- Login with JWT generation
- View products (public to authenticated users)
- Place orders with transactional and row-level locking to safely deduct stock
- Admin endpoints to list pending clients and approve them

The server serves uploaded license files from `./uploads` so admins can visually verify documents.

---

## Features

- Password hashing with `bcrypt`.
- JWT authentication (signed with a `SECRET_KEY`).
- File upload handling for license PDFs.
- Transactional order placement using `FOR UPDATE` to avoid race conditions.
- Simple role-based access (ADMIN bypasses approval checks).

---

## Tech stack

- Go (1.20+ recommended)
- Gin web framework
- PostgreSQL (>= 12)
- `github.com/golang-jwt/jwt/v5`
- `golang.org/x/crypto/bcrypt`
- `github.com/lib/pq` (Postgres driver)

---

## Getting started

### Prerequisites

- Go installed
- PostgreSQL running locally or remotely
- `make` (optional) or you can run `go run` directly

### Configuration

In the code sample the DB connection is defined as a constant:

```go
const (
    SECRET_KEY = "my_super_secret_key"
    DB_CONN = "host=localhost port=5432 user=postgres password=admin123 dbname=pharmatrade sslmode=disable"
)
```

**Important:** Don't keep secrets (like `SECRET_KEY` or DB passwords) in code for production. Use environment variables or a secrets manager. Example using environment variables (recommended):

```bash
export PHARMATRADE_SECRET_KEY="..."
export DATABASE_URL="postgres://user:pass@host:5432/dbname?sslmode=disable"
```

Modify `main()` to read from `os.Getenv`.

### Example database schema (suggested)

Run these SQL statements to create minimal tables used by the server. Adjust types and constraints as needed.

```sql
CREATE TABLE users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'RETAILER',
  company_name text,
  license_url text,
  is_approved boolean DEFAULT FALSE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) ON DELETE SET NULL,
  total_amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id integer REFERENCES orders(id) ON DELETE CASCADE,
  product_id integer REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price numeric(12,2) NOT NULL
);
```

### Run locally

1. Create `uploads` folder in project root:

```bash
mkdir -p uploads
```

2. Initialize DB using SQL above.

3. Set environment variables or update constants in code.

4. Run server:

```bash
go mod tidy
go run .
```

Server will listen on `:8080` by default.

---

## API Endpoints (examples)

> All protected endpoints require `Authorization` header containing the JWT string returned from `/api/login`.

### Public

- `POST /api/signup` — Multipart form (fields: `email`, `password`, `role`, `company_name`, file field `license`).
  - Response: `201` on success (user created, pending admin approval)

- `POST /api/login`
  - Body (JSON): `{ "email": "user@example.com", "password": "secret" }`
  - Response: `{ "token": "<jwt>", "role": "RETAILER" }`

### Protected (JWT required)

- `GET /api/products` — List all products.

- `POST /api/orders` — Place an order.
  - Request body example:

```json
{
  "items": [
    {"product_id": 1, "quantity": 2},
    {"product_id": 3, "quantity": 1}
  ]
}
```

- `GET /api/clients` — (Admin only) List pending clients with `license_link`.

- `POST /api/admin/approve` — (Admin only) Approve a client.
  - Body: `{ "user_id": 123 }
`

### Example curl (login -> use token)

```bash
# Login
curl -s -X POST http://localhost:8080/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"adminpass"}'

# Suppose the token is returned as "<TOKEN>" then call protected route:
curl -s -X GET http://localhost:8080/api/products -H "Authorization: <TOKEN>"
```

> Note: In production use the header `Authorization: Bearer <token>` (and update middleware to accept that format).

---

## File structure (high level)

```
pharmatrade-backend/
├─ main.go       # The code you provided
├─ go.mod
├─ uploads/      # license PDFs stored here
└─ README.md
```

Consider splitting handlers, models, db access, and middleware into packages as the project grows.

---

## Security & production notes

- Move secrets out of the code and into environment variables.
- Use HTTPS in front of the server (TLS termination via reverse proxy/load balancer).
- Use prepared statements / parameterized queries (you already do) and check for SQL errors carefully.
- Limit allowed file types and scan uploaded files. Ensure `uploads` directory can't execute code and serve only static assets.
- Implement rate limiting and request validation.
- Use stronger password policy and possibly email verification.
- Consider refresh tokens for longer sessions.

---

## TODO / Improvements

- Add pagination for `GET /api/products`.
- Add product search and filtering.
- Add order history and order status updates.
- Add role management and admin user creation flows.
- Add logging and structured error handling.
- Add unit and integration tests.
- Add database migrations (e.g., use `golang-migrate`).

---

## License & contact

This project is provided as an example. Add a license file (e.g., MIT) if you plan to open-source it.

If you want, I can:
- Convert this README to a downloadable `README.md` file in the project folder,
- Split the `main.go` into packages and provide a refactor, or
- Add examples for environment-based configuration and `docker-compose`.

---

*Generated README for the provided Go server code.*
