package models

import (
	"database/sql"
	"time"
)

// Habit represents a habit in the system
type Habit struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Frequency   string    `json:"frequency"` // daily, weekly, multiple_times_week
	TargetCount int       `json:"target_count"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	// Computed fields
	CurrentStreak    int     `json:"current_streak"`
	LongestStreak    int     `json:"longest_streak"`
	CompletionRate   float64 `json:"completion_rate"`
	IsCompletedToday bool    `json:"is_completed_today"`
}

// HabitCompletion represents a habit completion record
type HabitCompletion struct {
	ID          int       `json:"id"`
	HabitID     int       `json:"habit_id"`
	CompletedAt time.Time `json:"completed_at"`
}

// HabitStreak represents streak data for a habit
type HabitStreak struct {
	ID                 int       `json:"id"`
	HabitID            int       `json:"habit_id"`
	CurrentStreak      int       `json:"current_streak"`
	LongestStreak      int       `json:"longest_streak"`
	LastCompletionDate time.Time `json:"last_completion_date"`
}

// CreateHabit creates a new habit in the database
func CreateHabit(db *sql.DB, habit *Habit) error {
	query := `
		INSERT INTO habits (name, description, frequency, target_count, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(query, habit.Name, habit.Description, habit.Frequency, habit.TargetCount, time.Now(), time.Now())
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	habit.ID = int(id)
	habit.CreatedAt = time.Now()
	habit.UpdatedAt = time.Now()

	// Initialize streak record
	_, err = db.Exec("INSERT INTO habit_streaks (habit_id, current_streak, longest_streak) VALUES (?, 0, 0)", habit.ID)

	return err
}

// GetHabits retrieves all habits with their current streaks
func GetHabits(db *sql.DB) ([]Habit, error) {
	query := `
		SELECT h.id, h.name, h.description, h.frequency, h.target_count, h.created_at, h.updated_at,
		       COALESCE(hs.current_streak, 0) as current_streak,
		       COALESCE(hs.longest_streak, 0) as longest_streak
		FROM habits h
		LEFT JOIN habit_streaks hs ON h.id = hs.habit_id
		ORDER BY h.created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var habits []Habit
	for rows.Next() {
		var habit Habit
		err := rows.Scan(
			&habit.ID, &habit.Name, &habit.Description, &habit.Frequency, &habit.TargetCount,
			&habit.CreatedAt, &habit.UpdatedAt, &habit.CurrentStreak, &habit.LongestStreak,
		)
		if err != nil {
			return nil, err
		}

		// Check if completed today
		habit.IsCompletedToday, _ = IsHabitCompletedToday(db, habit.ID)

		habits = append(habits, habit)
	}

	return habits, nil
}

// GetHabit retrieves a single habit by ID
func GetHabit(db *sql.DB, id int) (*Habit, error) {
	query := `
		SELECT h.id, h.name, h.description, h.frequency, h.target_count, h.created_at, h.updated_at,
		       COALESCE(hs.current_streak, 0) as current_streak,
		       COALESCE(hs.longest_streak, 0) as longest_streak
		FROM habits h
		LEFT JOIN habit_streaks hs ON h.id = hs.habit_id
		WHERE h.id = ?
	`

	var habit Habit
	err := db.QueryRow(query, id).Scan(
		&habit.ID, &habit.Name, &habit.Description, &habit.Frequency, &habit.TargetCount,
		&habit.CreatedAt, &habit.UpdatedAt, &habit.CurrentStreak, &habit.LongestStreak,
	)
	if err != nil {
		return nil, err
	}

	// Check if completed today
	habit.IsCompletedToday, _ = IsHabitCompletedToday(db, habit.ID)

	return &habit, nil
}

// UpdateHabit updates an existing habit
func UpdateHabit(db *sql.DB, habit *Habit) error {
	query := `
		UPDATE habits 
		SET name = ?, description = ?, frequency = ?, target_count = ?, updated_at = ?
		WHERE id = ?
	`

	_, err := db.Exec(query, habit.Name, habit.Description, habit.Frequency, habit.TargetCount, time.Now(), habit.ID)
	return err
}

// DeleteHabit deletes a habit and all related data
func DeleteHabit(db *sql.DB, id int) error {
	// Delete in order due to foreign key constraints
	_, err := db.Exec("DELETE FROM habit_completions WHERE habit_id = ?", id)
	if err != nil {
		return err
	}

	_, err = db.Exec("DELETE FROM habit_streaks WHERE habit_id = ?", id)
	if err != nil {
		return err
	}

	_, err = db.Exec("DELETE FROM habits WHERE id = ?", id)
	return err
}

// IsHabitCompletedToday checks if a habit was completed today
func IsHabitCompletedToday(db *sql.DB, habitID int) (bool, error) {
	query := `
		SELECT COUNT(*) FROM habit_completions 
		WHERE habit_id = ? AND DATE(completed_at) = DATE('now')
	`

	var count int
	err := db.QueryRow(query, habitID).Scan(&count)
	return count > 0, err
}

// CompleteHabit marks a habit as completed for today
func CompleteHabit(db *sql.DB, habitID int) error {
	// Check if already completed today
	completed, err := IsHabitCompletedToday(db, habitID)
	if err != nil {
		return err
	}
	if completed {
		return nil // Already completed today
	}

	// Insert completion record
	_, err = db.Exec("INSERT INTO habit_completions (habit_id, completed_at) VALUES (?, ?)", habitID, time.Now())
	if err != nil {
		return err
	}

	// Update streak
	return UpdateHabitStreak(db, habitID)
}

// UncompleteHabit removes the completion for today
func UncompleteHabit(db *sql.DB, habitID int) error {
	// Check if completed today
	completed, err := IsHabitCompletedToday(db, habitID)
	if err != nil {
		return err
	}
	if !completed {
		return nil // Not completed today
	}

	// Delete completion record for today
	_, err = db.Exec("DELETE FROM habit_completions WHERE habit_id = ? AND DATE(completed_at) = DATE('now')", habitID)
	if err != nil {
		return err
	}

	// Update streak (decrease it)
	return UpdateHabitStreakOnUncomplete(db, habitID)
}

// UpdateHabitStreak updates the streak for a habit
func UpdateHabitStreak(db *sql.DB, habitID int) error {
	// This is a simplified streak calculation
	// In a real implementation, you'd want more sophisticated logic
	query := `
		UPDATE habit_streaks 
		SET current_streak = current_streak + 1,
		    longest_streak = CASE 
		        WHEN current_streak + 1 > longest_streak THEN current_streak + 1
		        ELSE longest_streak
		    END,
		    last_completion_date = DATE('now')
		WHERE habit_id = ?
	`

	_, err := db.Exec(query, habitID)
	return err
}

// UpdateHabitStreakOnUncomplete updates the streak when a habit is uncompleted
func UpdateHabitStreakOnUncomplete(db *sql.DB, habitID int) error {
	// Get current and longest streak before updating
	var currentStreak, longestStreak int
	err := db.QueryRow("SELECT current_streak, longest_streak FROM habit_streaks WHERE habit_id = ?", habitID).Scan(&currentStreak, &longestStreak)
	if err != nil {
		return err
	}

	// Decrease the current streak by 1, but don't go below 0
	newCurrentStreak := currentStreak - 1
	if newCurrentStreak < 0 {
		newCurrentStreak = 0
	}

	// Update current streak
	_, err = db.Exec("UPDATE habit_streaks SET current_streak = ? WHERE habit_id = ?", newCurrentStreak, habitID)
	if err != nil {
		return err
	}

	// If the current streak was equal to the longest streak and we're decreasing it,
	// we need to recalculate the longest streak from the remaining completions
	if currentStreak == longestStreak && currentStreak > 0 {
		// Calculate the actual longest streak from completion history
		query := `
			WITH consecutive_days AS (
				SELECT 
					DATE(completed_at) as completion_date,
					ROW_NUMBER() OVER (ORDER BY DATE(completed_at)) as row_num
				FROM habit_completions 
				WHERE habit_id = ?
				ORDER BY DATE(completed_at)
			),
			streaks AS (
				SELECT 
					completion_date,
					DATE(completion_date, '-' || (row_num - 1) || ' days') as streak_start
				FROM consecutive_days
			),
			streak_lengths AS (
				SELECT 
					streak_start,
					COUNT(*) as length
				FROM streaks
				GROUP BY streak_start
			)
			SELECT COALESCE(MAX(length), 0) as max_streak
			FROM streak_lengths
		`

		var actualLongestStreak int
		err = db.QueryRow(query, habitID).Scan(&actualLongestStreak)
		if err != nil {
			return err
		}

		// Update the longest streak if it's different
		if actualLongestStreak != longestStreak {
			_, err = db.Exec("UPDATE habit_streaks SET longest_streak = ? WHERE habit_id = ?", actualLongestStreak, habitID)
		}
	}

	return err
}
