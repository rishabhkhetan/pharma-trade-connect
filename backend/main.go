package main

import (
	"database/sql"
	"fmt"
	"log"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// --- CONFIGURATION ---
const (
	SECRET_KEY = "my_super_secret_key"
	// !!! CHANGE 'yourpassword' TO YOUR ACTUAL POSTGRES PASSWORD !!!
	DB_CONN = "host=localhost port=5432 user=postgres password=admin123 dbname=pharmatrade sslmode=disable"
)

var db *sql.DB

// --- STRUCTS (Data Models) ---

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type OrderRequest struct {
	Items []struct {
		ProductID int `json:"product_id"`
		Quantity  int `json:"quantity"`
	} `json:"items"`
}

type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	IsApproved  bool   `json:"is_approved"`
	LicenseURL  string `json:"license_url"`
	CompanyName string `json:"company_name"`
}

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock_quantity"`
}

// --- MAIN FUNCTION ---

func main() {
	var err error
	// 1. Connect to Database
	db, err = sql.Open("postgres", DB_CONN)
	if err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Database not reachable. Check password!", err)
	}
	fmt.Println("Successfully connected to Database!")

	// 2. Setup Router
	r := gin.Default()

	// 3. Static Files (Lets Admin view the uploaded licenses)
	r.Static("/uploads", "./uploads")

	// 4. Public Routes
	r.POST("/api/login", loginHandler)
	r.POST("/api/signup", signupHandler) // Multipart form (files)

	// 5. Protected Routes (Require JWT)
	protected := r.Group("/api")
	protected.Use(AuthMiddleware())
	{
		protected.GET("/products", getProductsHandler)
		protected.POST("/orders", placeOrderHandler) // The Complex Transaction Logic

		// Admin Only Routes
		protected.GET("/clients", getPendingClientsHandler)
		protected.POST("/admin/approve", approveClientHandler)
	}

	// 6. Start Server
	fmt.Println("Server running on port 8080...")
	r.Run(":8080")
}

// --- HANDLERS (API Logic) ---

// 1. SIGNUP (With File Upload)
func signupHandler(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")
	role := c.PostForm("role") // 'RETAILER' or 'CLINIC'
	company := c.PostForm("company_name")

	// Handle File Upload
	file, err := c.FormFile("license")
	if err != nil {
		c.JSON(400, gin.H{"error": "License PDF is required"})
		return
	}

	// Save file to './uploads' folder
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	savePath := filepath.Join("uploads", filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(500, gin.H{"error": "Failed to save file"})
		return
	}

	// Hash Password
	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 14)

	// Insert into DB
	_, err = db.Exec(`INSERT INTO users (email, password_hash, role, company_name, license_url, is_approved) 
		VALUES ($1, $2, $3, $4, $5, FALSE)`, email, string(hashed), role, company, savePath)

	if err != nil {
		c.JSON(500, gin.H{"error": "Email already exists"})
		return
	}

	c.JSON(201, gin.H{"message": "Signup successful. Wait for Admin approval."})
}

// 2. LOGIN
func loginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid Input"})
		return
	}

	var user User
	var storedHash string

	// Get User
	err := db.QueryRow("SELECT id, email, role, password_hash, is_approved FROM users WHERE email=$1", req.Email).
		Scan(&user.ID, &user.Email, &user.Role, &storedHash, &user.IsApproved)

	if err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Compare Password
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check Approval (Admins bypass this)
	if user.Role != "ADMIN" && !user.IsApproved {
		c.JSON(403, gin.H{"error": "Account pending approval from Admin"})
		return
	}

	// Generate JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(SECRET_KEY))

	c.JSON(200, gin.H{"token": tokenString, "role": user.Role})
}

// 3. GET PRODUCTS
func getProductsHandler(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, price, stock_quantity FROM products")
	if err != nil {
		c.JSON(500, gin.H{"error": "DB Error"})
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock)
		products = append(products, p)
	}
	c.JSON(200, products)
}

// 4. PLACE ORDER (Transactional & Concurrency Safe)
func placeOrderHandler(c *gin.Context) {
	userID := int(c.GetFloat64("user_id")) // From JWT Middleware
	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid Body"})
		return
	}

	// START TRANSACTION
	tx, err := db.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Transaction failed"})
		return
	}
	// Defer rollback in case of panic or error
	defer tx.Rollback()

	var totalAmount float64

	// Step A: Calculate Total & Verify Stock (LOCKING ROWS)
	for _, item := range req.Items {
		var price float64
		var stock int

		// 'FOR UPDATE' locks this row so no one else can buy it until we finish
		err := tx.QueryRow("SELECT price, stock_quantity FROM products WHERE id = $1 FOR UPDATE", item.ProductID).
			Scan(&price, &stock)

		if err != nil {
			c.JSON(404, gin.H{"error": fmt.Sprintf("Product ID %d not found", item.ProductID)})
			return
		}

		if stock < item.Quantity {
			c.JSON(400, gin.H{"error": fmt.Sprintf("Insufficient stock for Product ID %d", item.ProductID)})
			return
		}

		totalAmount += price * float64(item.Quantity)
	}

	// Step B: Create Order Record
	var orderID int
	err = tx.QueryRow("INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, 'PENDING') RETURNING id", userID, totalAmount).Scan(&orderID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to create order"})
		return
	}

	// Step C: Deduct Stock & Insert Order Items
	for _, item := range req.Items {
		// Deduct Stock
		_, err = tx.Exec("UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to update stock"})
			return
		}

		// Get Unit Price again (safe to query normally now)
		var price float64
		tx.QueryRow("SELECT price FROM products WHERE id = $1", item.ProductID).Scan(&price)

		// Insert Item
		_, err = tx.Exec("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
			orderID, item.ProductID, item.Quantity, price)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to save order item"})
			return
		}
	}

	// COMMIT TRANSACTION
	if err := tx.Commit(); err != nil {
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(200, gin.H{"message": "Order placed successfully", "order_id": orderID})
}

// 5. GET PENDING CLIENTS (Admin)
func getPendingClientsHandler(c *gin.Context) {
	if c.GetString("role") != "ADMIN" {
		c.JSON(403, gin.H{"error": "Admin only"})
		return
	}

	rows, err := db.Query("SELECT id, email, company_name, license_url FROM users WHERE is_approved = FALSE AND role != 'ADMIN'")
	if err != nil {
		c.JSON(500, gin.H{"error": "DB Error"})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var id int
		var email, company, license string
		rows.Scan(&id, &email, &company, &license)
		// Make URL clickable
		fullURL := "http://localhost:8080/" + license
		users = append(users, gin.H{"id": id, "email": email, "company": company, "license_link": fullURL})
	}
	c.JSON(200, users)
}

// 6. APPROVE CLIENT (Admin)
func approveClientHandler(c *gin.Context) {
	if c.GetString("role") != "ADMIN" {
		c.JSON(403, gin.H{"error": "Admin only"})
		return
	}

	type ApproveReq struct {
		UserID int `json:"user_id"`
	}
	var req ApproveReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid ID"})
		return
	}

	_, err := db.Exec("UPDATE users SET is_approved = TRUE WHERE id = $1", req.UserID)
	if err != nil {
		c.JSON(500, gin.H{"error": "DB Error"})
		return
	}
	c.JSON(200, gin.H{"message": "User Approved"})
}

// --- MIDDLEWARE (JWT Check) ---
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenStr := c.GetHeader("Authorization")
		if tokenStr == "" {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}

		token, _ := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return []byte(SECRET_KEY), nil
		})

		if token != nil && token.Valid {
			claims := token.Claims.(jwt.MapClaims)
			c.Set("user_id", claims["user_id"])
			c.Set("role", claims["role"])
			c.Next()
		} else {
			c.AbortWithStatusJSON(401, gin.H{"error": "Invalid Token"})
		}
	}
}
