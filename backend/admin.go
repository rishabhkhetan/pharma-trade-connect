package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /api/clients
func getPendingClientsHandler(c *gin.Context) {
	if c.GetString("role") != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin only"})
		return
	}

	rows, err := db.Query("SELECT id, email, company_name, license_url FROM users WHERE is_approved = FALSE AND role != 'ADMIN'")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var id int
		var email, company, license string
		rows.Scan(&id, &email, &company, &license)
		fullURL := "http://localhost:8080/" + license
		users = append(users, gin.H{"id": id, "email": email, "company": company, "license_link": fullURL})
	}
	c.JSON(http.StatusOK, users)
}

// POST /api/admin/approve
func approveClientHandler(c *gin.Context) {
	if c.GetString("role") != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin only"})
		return
	}

	type ApproveReq struct {
		UserID int `json:"user_id"`
	}
	var req ApproveReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	_, err := db.Exec("UPDATE users SET is_approved = TRUE WHERE id = $1", req.UserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User Approved"})
}
