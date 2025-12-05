package api

import (
	"database/sql"
	"net/http"
	"time"
)

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from database
	var user User
	err := db.QueryRow(`
		SELECT id, name, email, password_hash, role, is_approved 
		FROM users 
		WHERE email = $1
	`, req.Email).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.IsApproved)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check if user is approved
	if user.IsApproved != "YES" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":       "Account not approved",
			"message":     "Your account is pending admin approval. Please contact support.",
			"is_approved": false,
		})
		return
	}

	// Generate JWT token
	token, err := generateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":          user.ID,
			"name":        user.Name,
			"email":       user.Email,
			"role":        user.Role,
			"is_approved": user.IsApproved,
		},
		"expires_at": time.Now().Add(24 * time.Hour).Unix(),
	})
}
