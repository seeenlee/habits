import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { habitsApi } from '../services/api';
import type { Habit } from '../types/habit';
import toast from 'react-hot-toast';

const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadHabit(parseInt(id));
    }
  }, [id]);

  const loadHabit = async (habitId: number) => {
    try {
      const data = await habitsApi.getById(habitId);
      setHabit(data);
    } catch (error) {
      toast.error('Failed to load habit');
      console.error('Error loading habit:', error);
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

  if (!habit) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Habit not found</h2>
        <Link to="/habits" className="text-primary-600 hover:text-primary-700">
          Back to habits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/habits"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{habit.name}</h1>
            <p className="text-gray-600">Habit details and progress</p>
          </div>
        </div>
        <Link
          to={`/habits/${habit.id}/edit`}
          className="btn-primary"
        >
          Edit Habit
        </Link>
      </div>

      {/* Habit Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Habit Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{habit.name}</p>
            </div>
            {habit.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{habit.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Frequency</label>
              <p className="text-gray-900">{habit.frequency.replace('_', ' ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Target Count</label>
              <p className="text-gray-900">{habit.target_count}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Current Streak</span>
              <span className="text-2xl font-bold text-primary-600">{habit.current_streak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Longest Streak</span>
              <span className="text-2xl font-bold text-yellow-600">{habit.longest_streak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Status Today</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                habit.is_completed_today
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {habit.is_completed_today ? 'Completed' : 'Not completed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Charts</h2>
        <div className="text-center py-12 text-gray-500">
          <p>Charts will be implemented here</p>
          <p className="text-sm">Completion rate and streak visualization</p>
        </div>
      </div>
    </div>
  );
};

export default HabitDetail;
