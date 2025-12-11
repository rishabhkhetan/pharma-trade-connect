package main

import (
	"net/http"

	"fmt"

	"github.com/gin-gonic/gin"
)

// GET /api/products
func getProductsHandler(c *gin.Context) {
	rows, err := db.Query("SELECT id, name, price, stock_quantity FROM products")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
		return
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		rows.Scan(&p.ID, &p.Name, &p.Price, &p.Stock)
		products = append(products, p)
	}
	c.JSON(http.StatusOK, products)
}

// POST /api/products (Admin Only)
func addProductHandler(c *gin.Context) {
	// 1. Check if the user is an Admin
	if c.GetString("role") != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin only access"})
		return
	}

	var req ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: Name, Price, and Stock are required"})
		return
	}

	// 2. Insert the new product into the database
	_, err := db.Exec(`INSERT INTO products (name, price, stock_quantity) VALUES ($1, $2, $3)`,
		req.Name, req.Price, req.Stock)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product to database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Product added successfully"})
}

// PUT /api/products/:id (Admin Only - Update)
func updateProductHandler(c *gin.Context) {
	// 1. Check if the user is an Admin
	if c.GetString("role") != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin only access"})
		return
	}

	// 2. Get the product ID from the URL path
	productID := c.Param("id")

	var req ProductRequest // Reusing the ProductRequest struct
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// 3. Update the product in the database
	result, err := db.Exec(`UPDATE products SET name=$1, price=$2, stock_quantity=$3 WHERE id=$4`,
		req.Name, req.Price, req.Stock, productID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Product ID %s updated successfully", productID)})
}

// DELETE /api/products/:id (Admin Only - Delete)
func deleteProductHandler(c *gin.Context) {
	// 1. Check if the user is an Admin
	if c.GetString("role") != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin only access"})
		return
	}

	// 2. Get the product ID from the URL path
	productID := c.Param("id")

	// 3. Delete the product from the database
	result, err := db.Exec(`DELETE FROM products WHERE id=$1`, productID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Product ID %s deleted successfully", productID)})
}
