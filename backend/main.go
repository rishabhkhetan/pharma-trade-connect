package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Connect to Database (Function is in database.go)
	connectDatabase()
	defer db.Close()

	// 2. Setup Router
	r := gin.Default()

	// 3. Static Files
	r.Static("/uploads", "./uploads")

	// 4. Public Routes (Functions are in auth.go)
	r.POST("/api/login", loginHandler)
	r.POST("/api/signup", signupHandler)

	// 5. Protected Routes
	protected := r.Group("/api")
	protected.Use(AuthMiddleware()) // Function is in middleware.go
	{
		protected.GET("/products", getProductsHandler) // in products.go
		protected.POST("/orders", placeOrderHandler)   // in orders.go

		// Admin Routes (in admin.go)
		protected.GET("/clients", getPendingClientsHandler)
		protected.POST("/admin/approve", approveClientHandler)
	}

	// 6. Start Server
	fmt.Println("Server running on port 8080...")
	r.Run(":8080")
}
