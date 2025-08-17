import { useState, useEffect } from 'react';
import { statsApi } from '../services/api';
import type { ChartData } from '../types/habit';
import toast from 'react-hot-toast';

const Charts = () => {
  const [completionData, setCompletionData] = useState<ChartData | null>(null);
  const [streakData, setStreakData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const [completion, streak] = await Promise.all([
        statsApi.getCompletionRateData(),
        statsApi.getStreakData(),
      ]);
      setCompletionData(completion);
      setStreakData(streak);
    } catch (error) {
      toast.error('Failed to load chart data');
      console.error('Error loading chart data:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Charts & Analytics</h1>
        <p className="text-gray-600">Visual insights into your habit tracking progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate (Last 30 Days)</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Completion rate chart will be implemented here</p>
              <p className="text-sm mt-2">
                {completionData?.labels ? `${completionData.labels.length} days of data` : 'No data available'}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Streaks</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Streak comparison chart will be implemented here</p>
              <p className="text-sm mt-2">
                {streakData?.labels ? `${streakData.labels.length} habits` : 'No data available'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center py-8 text-gray-500">
            <p>Weekly progress heatmap</p>
            <p className="text-sm">Coming soon</p>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Habit performance trends</p>
            <p className="text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
