import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { habitsApi, statsApi } from '../services/api';
import type { Habit, Stats } from '../types/habit';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [habitsData, statsData] = await Promise.all([
        habitsApi.getAll(),
        statsApi.getStats(),
      ]);
      setHabits(habitsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHabit = async (habitId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await habitsApi.uncomplete(habitId);
        toast.success('Habit uncompleted!');
      } else {
        await habitsApi.complete(habitId);
        toast.success('Habit completed!');
      }
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${isCompleted ? 'uncomplete' : 'complete'} habit`);
      console.error('Error toggling habit:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your habits and progress</p>
        </div>
        <Link
          to="/habits"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Habit
        </Link>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Habits</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_habits}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed_today}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">🔥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Best Streak</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.best_streak}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.completion_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading stats...</p>
        </div>
      )}

      {/* Today's Habits */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Habits</h2>
          <Link to="/habits" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>

        {!habits || habits.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No habits yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first habit.</p>
            <div className="mt-6">
              <Link to="/habits" className="btn-primary">
                Create Habit
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits?.slice(0, 5).map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      habit.is_completed_today ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{habit.name}</p>
                    <p className="text-sm text-gray-500">
                      {habit.current_streak} day streak
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleHabit(habit.id, habit.is_completed_today)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    habit.is_completed_today
                      ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {habit.is_completed_today ? 'Completed' : 'Complete'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
