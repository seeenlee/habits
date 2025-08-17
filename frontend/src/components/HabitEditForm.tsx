import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { habitsApi } from '../services/api';
import type { Habit, UpdateHabitRequest } from '../types/habit';
import toast from 'react-hot-toast';

const HabitEditForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<UpdateHabitRequest>({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
  });

  useEffect(() => {
    if (id) {
      loadHabit(parseInt(id));
    }
  }, [id]);

  const loadHabit = async (habitId: number) => {
    try {
      const data = await habitsApi.getById(habitId);
      setHabit(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        frequency: data.frequency,
        target_count: data.target_count,
      });
    } catch (error) {
      toast.error('Failed to load habit');
      console.error('Error loading habit:', error);
      navigate('/habits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    if (!id) {
      toast.error('Invalid habit ID');
      return;
    }

    setSaving(true);
    try {
      await habitsApi.update(parseInt(id), formData);
      toast.success('Habit updated successfully!');
      navigate(`/habits/${id}`);
    } catch (error) {
      toast.error('Failed to update habit');
      console.error('Error updating habit:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UpdateHabitRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
        <button
          onClick={() => navigate('/habits')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          Back to habits
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Habit</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="input-field"
              placeholder="e.g., Exercise, Read, Meditate"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Add a description to help you remember what this habit is about..."
            />
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => handleChange('frequency', e.target.value as any)}
              className="input-field"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="multiple_times_week">Multiple times per week</option>
            </select>
          </div>

          {/* Target Count (for multiple times per week) */}
          {formData.frequency === 'multiple_times_week' && (
            <div>
              <label htmlFor="target_count" className="block text-sm font-medium text-gray-700 mb-2">
                Target Times Per Week
              </label>
              <input
                type="number"
                id="target_count"
                value={formData.target_count}
                onChange={(e) => handleChange('target_count', parseInt(e.target.value) || 1)}
                className="input-field"
                min="1"
                max="7"
              />
            </div>
          )}

          {/* Current Stats Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Progress</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Streak:</span>
                <span className="ml-2 font-medium">{habit.current_streak} days</span>
              </div>
              <div>
                <span className="text-gray-500">Longest Streak:</span>
                <span className="ml-2 font-medium">{habit.longest_streak} days</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/habits/${id}`)}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitEditForm;
