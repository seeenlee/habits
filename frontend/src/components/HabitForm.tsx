import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { habitsApi } from '../services/api';
import type { CreateHabitRequest } from '../types/habit';
import toast from 'react-hot-toast';

interface HabitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const HabitForm = ({ onSuccess, onCancel }: HabitFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateHabitRequest>({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Habit name is required');
      return;
    }

    setLoading(true);
    try {
      await habitsApi.create(formData);
      toast.success('Habit created successfully!');
      onSuccess?.();
      navigate('/habits');
    } catch (error) {
      toast.error('Failed to create habit');
      console.error('Error creating habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateHabitRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Habit</h2>
        
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

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel || (() => navigate('/habits'))}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
