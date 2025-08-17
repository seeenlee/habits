import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { habitsApi } from '../services/api';
import type { Habit } from '../types/habit';
import toast from 'react-hot-toast';

const HabitsList = () => {
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const data = await habitsApi.getAll();
      setHabits(data);
    } catch (error) {
      toast.error('Failed to load habits');
      console.error('Error loading habits:', error);
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
      loadHabits(); // Refresh data
    } catch (error) {
      toast.error(`Failed to ${isCompleted ? 'uncomplete' : 'complete'} habit`);
      console.error('Error toggling habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    if (!confirm('Are you sure you want to delete this habit?')) {
      return;
    }

    try {
      await habitsApi.delete(habitId);
      toast.success('Habit deleted');
      loadHabits(); // Refresh data
    } catch (error) {
      toast.error('Failed to delete habit');
      console.error('Error deleting habit:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-600">Manage your habits and track progress</p>
        </div>
        <Link
          to="/habits/new"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Habit
        </Link>
      </div>

      {/* Habits List */}
      {!habits || habits.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No habits yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first habit.</p>
          <div className="mt-6">
            <Link to="/habits/new" className="btn-primary">
              Create Habit
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {habits?.map((habit) => (
            <div key={habit.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    habit.is_completed_today ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-gray-500">{habit.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        {habit.frequency.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {habit.current_streak} day streak
                      </span>
                      <span className="text-sm text-gray-500">
                        Best: {habit.longest_streak} days
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleHabit(habit.id, habit.is_completed_today)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      habit.is_completed_today
                        ? 'bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                  >
                    {habit.is_completed_today ? 'Completed' : 'Complete'}
                  </button>
                  
                  <Link
                    to={`/habits/${habit.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="View details"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  
                  <Link
                    to={`/habits/${habit.id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Edit habit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsList;
