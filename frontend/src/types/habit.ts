export interface Habit {
  id: number;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'multiple_times_week';
  target_count: number;
  created_at: string;
  updated_at: string;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  is_completed_today: boolean;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  completed_at: string;
}

export interface HabitStreak {
  id: number;
  habit_id: number;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string;
}

export interface Stats {
  total_habits: number;
  completed_today: number;
  total_completions: number;
  average_streak: number;
  best_streak: number;
  completion_rate: number;
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'multiple_times_week';
  target_count?: number;
}

export interface UpdateHabitRequest {
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'multiple_times_week';
  target_count?: number;
}
