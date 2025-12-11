package main

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

// Add this struct to models.go
type ProductRequest struct {
	Name  string  `json:"name" binding:"required"`
	Price float64 `json:"price" binding:"required"`
	Stock int     `json:"stock_quantity" binding:"required"`
}
