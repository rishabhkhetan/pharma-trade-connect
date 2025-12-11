package main

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// POST /api/signup
func signupHandler(c *gin.Context) {
	email := c.PostForm("email")
	password := c.PostForm("password")
	role := c.PostForm("role")
	company := c.PostForm("company_name")

	var savePath string

	// --- LOGIC CHANGE: Only require license if NOT Admin ---
	if role == "ADMIN" {
		savePath = "" // Admins don't need a license
	} else {
		// For Retailers and Clinics, the file is MANDATORY
		file, err := c.FormFile("license")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "License PDF is required for Retailers/Clinics"})
			return
		}

		// Save the file
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		savePath = filepath.Join("uploads", filename)
		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}
	}
	// -------------------------------------------------------

	hashed, _ := bcrypt.GenerateFromPassword([]byte(password), 14)

	// Insert into DB (is_approved defaults to TRUE for Admin, FALSE for others)
	// Logic: If role is ADMIN, approved = TRUE. If not, approved = FALSE.
	isApproved := (role == "ADMIN")

	_, err := db.Exec(`INSERT INTO users (email, password_hash, role, company_name, license_url, is_approved) 
		VALUES ($1, $2, $3, $4, $5, $6)`, email, string(hashed), role, company, savePath, isApproved)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Email already exists"})
		return
	}

	if role == "ADMIN" {
		c.JSON(http.StatusCreated, gin.H{"message": "Admin created successfully. You can login now."})
	} else {
		c.JSON(http.StatusCreated, gin.H{"message": "Signup successful. Wait for Admin approval."})
	}
}

// POST /api/login
func loginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Input"})
		return
	}

	var user User
	var storedHash string

	// We also fetch 'is_approved' to stop pending users
	err := db.QueryRow("SELECT id, email, role, password_hash, is_approved FROM users WHERE email=$1", req.Email).
		Scan(&user.ID, &user.Email, &user.Role, &storedHash, &user.IsApproved)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Logic: Admins are always allowed. Retailers must be approved.
	if user.Role != "ADMIN" && !user.IsApproved {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account pending approval from Admin"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString([]byte(SECRET_KEY))

	c.JSON(http.StatusOK, gin.H{"token": tokenString, "role": user.Role})
}
