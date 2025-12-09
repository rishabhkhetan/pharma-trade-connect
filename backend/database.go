package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // Postgres driver
)

// Global DB variable accessible by all other files in package main
var db *sql.DB

func connectDatabase() {
	var err error
	db, err = sql.Open("postgres", DB_CONN)
	if err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Database not reachable. Check password!", err)
	}
	fmt.Println("Successfully connected to Database!")
}
