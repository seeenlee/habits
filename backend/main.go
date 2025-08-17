package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"habits/handlers"

	_ "github.com/mattn/go-sqlite3"
)

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Health check endpoint
func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"status": "healthy",
		"time":   time.Now().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// API routes
func apiRoutes(db *sql.DB) http.Handler {
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", healthHandler)

	// Habits endpoints
	mux.HandleFunc("/api/habits", func(w http.ResponseWriter, r *http.Request) {
		handlers.HabitsHandler(w, r, db)
	})

	// Individual habit endpoints
	mux.HandleFunc("/api/habits/", func(w http.ResponseWriter, r *http.Request) {
		handleHabitRoutes(w, r, db)
	})

	// Stats endpoints
	mux.HandleFunc("/api/stats", func(w http.ResponseWriter, r *http.Request) {
		handlers.StatsHandler(w, r, db)
	})

	// Chart endpoints
	mux.HandleFunc("/api/charts/completion-rates", func(w http.ResponseWriter, r *http.Request) {
		handlers.CompletionRateChartHandler(w, r, db)
	})

	mux.HandleFunc("/api/charts/streaks", func(w http.ResponseWriter, r *http.Request) {
		handlers.StreakChartHandler(w, r, db)
	})

	return mux
}

// handleHabitRoutes routes individual habit operations
func handleHabitRoutes(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	path := r.URL.Path

	if strings.HasSuffix(path, "/complete") {
		handlers.CompleteHabitHandler(w, r, db)
		return
	}

	// Check if it's a specific habit ID
	parts := strings.Split(path, "/")
	if len(parts) >= 4 {
		handlers.HabitDetailHandler(w, r, db)
		return
	}

	// Fallback to general habits handler
	handlers.HabitsHandler(w, r, db)
}

func main() {
	// Database setup
	dbPath := "../database/habits.db"

	// Ensure database directory exists
	os.MkdirAll("../database", 0755)

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Initialize database tables
	if err := initDatabase(db); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Setup routes
	apiHandler := apiRoutes(db)

	// Apply CORS middleware
	handler := corsMiddleware(apiHandler)

	// Start server
	port := ":8080"
	fmt.Printf("Server starting on port %s\n", port)
	fmt.Printf("Health check: http://localhost%s/health\n", port)
	fmt.Printf("API base: http://localhost%s/api\n", port)

	log.Fatal(http.ListenAndServe(port, handler))
}

// Initialize database tables
func initDatabase(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS habits (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			frequency TEXT NOT NULL,
			target_count INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS habit_completions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			habit_id INTEGER NOT NULL,
			completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (habit_id) REFERENCES habits(id)
		)`,

		`CREATE TABLE IF NOT EXISTS habit_streaks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			habit_id INTEGER NOT NULL,
			current_streak INTEGER DEFAULT 0,
			longest_streak INTEGER DEFAULT 0,
			last_completion_date DATE,
			FOREIGN KEY (habit_id) REFERENCES habits(id)
		)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to execute query: %v", err)
		}
	}

	fmt.Println("Database initialized successfully")
	return nil
}
