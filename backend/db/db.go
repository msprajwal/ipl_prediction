package db

import (
	"fmt"
	"log"
	"os"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	// Use SQLite for local development
	dbName := "ipl_prediction.db"

	db, err := gorm.Open(sqlite.Open(dbName), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to SQLite database. \n", err)
		os.Exit(2)
	}

	fmt.Println("SQLite database connection successfully opened")
	DB = db
	return DB
}
