import { useState, useEffect } from 'react';
import { statsApi } from '../services/api';
import type { Stats } from '../types/habit';
import toast from 'react-hot-toast';

const StatsPage = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsApi.getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600">Overview of your habit tracking progress</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Habits</h3>
            <p className="text-3xl font-bold text-primary-600">{stats.total_habits}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Today</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed_today}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Completions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_completions}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Streak</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.average_streak.toFixed(1)}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Streak</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.best_streak}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completion_rate.toFixed(1)}%</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading stats...</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analytics</h2>
        <div className="text-center py-12 text-gray-500">
          <p>Detailed charts and analytics will be implemented here</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
