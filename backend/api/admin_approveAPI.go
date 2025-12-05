package api

import (
	"database/sql"
	"net/http"
)

type ApprovalRequest struct {
	Approve       bool   `json:"approve" binding:"required"`
	LicenseNumber string `json:"license_number"`
	LicenseStatus string `json:"license_status"`
	RejectionNote string `json:"rejection_note"`
}

func approveUser(c *gin.Context) {
	userID := c.Param("id")
	var req ApprovalRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user details
	var user User
	err := db.QueryRow(`
		SELECT id, name, email, role, is_approved 
		FROM users 
		WHERE id = $1
	`, userID).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.IsApproved)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if already approved
	if user.IsApproved == "YES" {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already approved"})
		return
	}

	// Approve or reject based on request
	var approvalStatus string
	var message string

	if req.Approve {
		// Validate license for RETAILER and CLINIC
		if (user.Role == "RETAILER" || user.Role == "CLINIC") && req.LicenseNumber == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "License number required for " + user.Role,
			})
			return
		}

		approvalStatus = "YES"
		message = "User approved successfully"
	} else {
		approvalStatus = "NO"
		message = "User approval rejected"
	}

	// Update user approval status
	_, err = db.Exec(`
		UPDATE users 
		SET is_approved = $1, updated_at = CURRENT_TIMESTAMP 
		WHERE id = $2
	`, approvalStatus, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	response := gin.H{
		"message": message,
		"user": gin.H{
			"id":          user.ID,
			"name":        user.Name,
			"email":       user.Email,
			"role":        user.Role,
			"is_approved": approvalStatus,
		},
	}

	// Add additional info based on approval
	if req.Approve {
		response["license_number"] = req.LicenseNumber
		response["license_status"] = req.LicenseStatus
	} else {
		response["rejection_note"] = req.RejectionNote
	}

	c.JSON(http.StatusOK, response)
}
