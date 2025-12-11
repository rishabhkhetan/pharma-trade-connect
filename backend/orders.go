package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// POST /api/orders
func placeOrderHandler(c *gin.Context) {
	userID := int(c.GetFloat64("user_id"))
	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Body"})
		return
	}

	tx, err := db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
		return
	}
	defer tx.Rollback()

	var totalAmount float64

	for _, item := range req.Items {
		var price float64
		var stock int

		err := tx.QueryRow("SELECT price, stock_quantity FROM products WHERE id = $1 FOR UPDATE", item.ProductID).
			Scan(&price, &stock)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Product ID %d not found", item.ProductID)})
			return
		}

		if stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Insufficient stock for Product ID %d", item.ProductID)})
			return
		}

		totalAmount += price * float64(item.Quantity)
	}

	var orderID int
	err = tx.QueryRow("INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, 'PENDING') RETURNING id", userID, totalAmount).Scan(&orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	for _, item := range req.Items {
		_, err = tx.Exec("UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2", item.Quantity, item.ProductID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
			return
		}

		var price float64
		tx.QueryRow("SELECT price FROM products WHERE id = $1", item.ProductID).Scan(&price)

		_, err = tx.Exec("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
			orderID, item.ProductID, item.Quantity, price)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save order item"})
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order placed successfully", "order_id": orderID})
}
