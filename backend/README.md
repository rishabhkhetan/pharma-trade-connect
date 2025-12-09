# PharmaTrading Backend

This is the backend service for the PharmaTrade application.

## Setup Instructions
1. **Database:** Run the `schema.sql` file in your PostgreSQL database.
2. **Config:** Update `config.go` with your DB password.
3. **Run:** Use the command `go run .`

## API Endpoints
* **POST /api/login**: Admin & User Login
* **POST /api/signup**: Register with License Upload
* **GET /api/products**: List Medicines (Protected)
* **POST /api/orders**: Buy Medicines (Transactional)
* **POST /api/admin/approve**: Approve Retailers