package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"habits/models"
)

// HabitsHandler handles all habit-related HTTP requests
func HabitsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		handleGetHabits(w, r, db)
	case "POST":
		handleCreateHabit(w, r, db)
	case "PUT":
		handleUpdateHabit(w, r, db)
	case "DELETE":
		handleDeleteHabit(w, r, db)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// HabitDetailHandler handles individual habit operations
func HabitDetailHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	// Extract habit ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		http.Error(w, "Invalid habit ID", http.StatusBadRequest)
		return
	}

	habitID, err := strconv.Atoi(pathParts[3])
	if err != nil {
		http.Error(w, "Invalid habit ID", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case "GET":
		handleGetHabit(w, r, db, habitID)
	case "PUT":
		handleUpdateHabitByID(w, r, db, habitID)
	case "DELETE":
		handleDeleteHabitByID(w, r, db, habitID)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// CompleteHabitHandler handles habit completion
func CompleteHabitHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	// Extract habit ID from URL
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 5 {
		http.Error(w, "Invalid habit ID", http.StatusBadRequest)
		return
	}

	habitID, err := strconv.Atoi(pathParts[3])
	if err != nil {
		http.Error(w, "Invalid habit ID", http.StatusBadRequest)
		return
	}

	if r.Method == "POST" {
		// Complete habit
		err = models.CompleteHabit(db, habitID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to complete habit: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"message":  "Habit completed successfully",
			"habit_id": habitID,
		}
		json.NewEncoder(w).Encode(response)
	} else if r.Method == "DELETE" {
		// Uncomplete habit
		err = models.UncompleteHabit(db, habitID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to uncomplete habit: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]interface{}{
			"message":  "Habit uncompleted successfully",
			"habit_id": habitID,
		}
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleGetHabits(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	habits, err := models.GetHabits(db)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get habits: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(habits)
}

func handleGetHabit(w http.ResponseWriter, r *http.Request, db *sql.DB, habitID int) {
	habit, err := models.GetHabit(db, habitID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Habit not found", http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf("Failed to get habit: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(habit)
}

func handleCreateHabit(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var habit models.Habit
	if err := json.NewDecoder(r.Body).Decode(&habit); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if habit.Name == "" {
		http.Error(w, "Habit name is required", http.StatusBadRequest)
		return
	}

	if habit.Frequency == "" {
		habit.Frequency = "daily" // Default to daily
	}

	if habit.TargetCount == 0 {
		habit.TargetCount = 1 // Default to 1
	}

	err := models.CreateHabit(db, &habit)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create habit: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(habit)
}

func handleUpdateHabit(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// This would need habit ID in the request body or URL
	http.Error(w, "Use PUT /api/habits/{id} to update a specific habit", http.StatusBadRequest)
}

func handleUpdateHabitByID(w http.ResponseWriter, r *http.Request, db *sql.DB, habitID int) {
	var habit models.Habit
	if err := json.NewDecoder(r.Body).Decode(&habit); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	habit.ID = habitID

	// Validate required fields
	if habit.Name == "" {
		http.Error(w, "Habit name is required", http.StatusBadRequest)
		return
	}

	err := models.UpdateHabit(db, &habit)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update habit: %v", err), http.StatusInternalServerError)
		return
	}

	// Get updated habit
	updatedHabit, err := models.GetHabit(db, habitID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get updated habit: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedHabit)
}

func handleDeleteHabit(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	// This would need habit ID in the request body or URL
	http.Error(w, "Use DELETE /api/habits/{id} to delete a specific habit", http.StatusBadRequest)
}

func handleDeleteHabitByID(w http.ResponseWriter, r *http.Request, db *sql.DB, habitID int) {
	err := models.DeleteHabit(db, habitID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete habit: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message":  "Habit deleted successfully",
		"habit_id": habitID,
	}
	json.NewEncoder(w).Encode(response)
}
