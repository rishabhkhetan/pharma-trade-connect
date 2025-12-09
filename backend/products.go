package main

import (
	"net/http"

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
