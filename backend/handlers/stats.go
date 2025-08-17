package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Stats represents overall statistics
type Stats struct {
	TotalHabits      int     `json:"total_habits"`
	CompletedToday   int     `json:"completed_today"`
	TotalCompletions int     `json:"total_completions"`
	AverageStreak    float64 `json:"average_streak"`
	BestStreak       int     `json:"best_streak"`
	CompletionRate   float64 `json:"completion_rate"`
}

// ChartData represents data for charts
type ChartData struct {
	Labels []string  `json:"labels"`
	Data   []float64 `json:"data"`
}

// StatsHandler handles statistics requests
func StatsHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	stats, err := calculateStats(db)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to calculate stats: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(stats)
}

// CompletionRateChartHandler returns data for completion rate charts
func CompletionRateChartHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get last 30 days of completion data
	chartData, err := getCompletionRateData(db, 30)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get completion rate data: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(chartData)
}

// StreakChartHandler returns data for streak charts
func StreakChartHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get streak data for all habits
	chartData, err := getStreakData(db)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get streak data: %v", err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(chartData)
}

func calculateStats(db *sql.DB) (*Stats, error) {
	stats := &Stats{}

	// Get total habits
	err := db.QueryRow("SELECT COUNT(*) FROM habits").Scan(&stats.TotalHabits)
	if err != nil {
		return nil, err
	}

	// Get completions today
	err = db.QueryRow(`
		SELECT COUNT(*) FROM habit_completions 
		WHERE DATE(completed_at) = DATE('now')
	`).Scan(&stats.CompletedToday)
	if err != nil {
		return nil, err
	}

	// Get total completions
	err = db.QueryRow("SELECT COUNT(*) FROM habit_completions").Scan(&stats.TotalCompletions)
	if err != nil {
		return nil, err
	}

	// Get average streak
	err = db.QueryRow(`
		SELECT COALESCE(AVG(current_streak), 0) FROM habit_streaks
	`).Scan(&stats.AverageStreak)
	if err != nil {
		return nil, err
	}

	// Get best streak
	err = db.QueryRow(`
		SELECT COALESCE(MAX(longest_streak), 0) FROM habit_streaks
	`).Scan(&stats.BestStreak)
	if err != nil {
		return nil, err
	}

	// Calculate completion rate (last 7 days)
	if stats.TotalHabits > 0 {
		var completedLastWeek int
		err = db.QueryRow(`
			SELECT COUNT(*) FROM habit_completions 
			WHERE completed_at >= DATE('now', '-7 days')
		`).Scan(&completedLastWeek)
		if err != nil {
			return nil, err
		}

		// Assuming daily habits, 7 days * total habits = max possible completions
		maxPossible := stats.TotalHabits * 7
		if maxPossible > 0 {
			stats.CompletionRate = float64(completedLastWeek) / float64(maxPossible) * 100
		}
	}

	return stats, nil
}

func getCompletionRateData(db *sql.DB, days int) (*ChartData, error) {
	chartData := &ChartData{
		Labels: make([]string, days),
		Data:   make([]float64, days),
	}

	// Generate labels for the last N days
	for i := 0; i < days; i++ {
		date := time.Now().AddDate(0, 0, -i)
		chartData.Labels[days-1-i] = date.Format("Jan 2")
	}

	// Get completion data for each day
	query := `
		SELECT DATE(completed_at) as date, COUNT(*) as count
		FROM habit_completions 
		WHERE completed_at >= DATE('now', '-? days')
		GROUP BY DATE(completed_at)
		ORDER BY date
	`

	rows, err := db.Query(query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Create a map to store completion counts by date
	completionMap := make(map[string]int)
	for rows.Next() {
		var date string
		var count int
		if err := rows.Scan(&date, &count); err != nil {
			return nil, err
		}
		completionMap[date] = count
	}

	// Fill in the data array
	for i := range chartData.Labels {
		// Convert label back to date format for lookup
		date := time.Now().AddDate(0, 0, -(days - 1 - i)).Format("2006-01-02")
		if count, exists := completionMap[date]; exists {
			chartData.Data[i] = float64(count)
		} else {
			chartData.Data[i] = 0
		}
	}

	return chartData, nil
}

func getStreakData(db *sql.DB) (*ChartData, error) {
	chartData := &ChartData{}

	// Get habit names and their current streaks
	query := `
		SELECT h.name, COALESCE(hs.current_streak, 0) as current_streak
		FROM habits h
		LEFT JOIN habit_streaks hs ON h.id = hs.habit_id
		ORDER BY hs.current_streak DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var name string
		var streak int
		if err := rows.Scan(&name, &streak); err != nil {
			return nil, err
		}
		chartData.Labels = append(chartData.Labels, name)
		chartData.Data = append(chartData.Data, float64(streak))
	}

	return chartData, nil
}
