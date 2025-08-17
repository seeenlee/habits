import axios from 'axios';
import type { Habit, Stats, ChartData, CreateHabitRequest, UpdateHabitRequest } from '../types/habit';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Habits API
export const habitsApi = {
  // Get all habits
  getAll: async (): Promise<Habit[]> => {
    const response = await api.get('/habits');
    return response.data;
  },

  // Get single habit
  getById: async (id: number): Promise<Habit> => {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },

  // Create new habit
  create: async (habit: CreateHabitRequest): Promise<Habit> => {
    const response = await api.post('/habits', habit);
    return response.data;
  },

  // Update habit
  update: async (id: number, habit: UpdateHabitRequest): Promise<Habit> => {
    const response = await api.put(`/habits/${id}`, habit);
    return response.data;
  },

  // Delete habit
  delete: async (id: number): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },

  // Complete habit
  complete: async (id: number): Promise<{ message: string; habit_id: number }> => {
    const response = await api.post(`/habits/${id}/complete`);
    return response.data;
  },

  // Uncomplete habit
  uncomplete: async (id: number): Promise<{ message: string; habit_id: number }> => {
    const response = await api.delete(`/habits/${id}/complete`);
    return response.data;
  },
};

// Stats API
export const statsApi = {
  // Get overall stats
  getStats: async (): Promise<Stats> => {
    const response = await api.get('/stats');
    return response.data;
  },

  // Get completion rate chart data
  getCompletionRateData: async (): Promise<ChartData> => {
    const response = await api.get('/charts/completion-rates');
    return response.data;
  },

  // Get streak chart data
  getStreakData: async (): Promise<ChartData> => {
    const response = await api.get('/charts/streaks');
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; time: string }> => {
    const response = await axios.get('http://localhost:8080/health');
    return response.data;
  },
};

export default api;
