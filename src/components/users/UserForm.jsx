import React, { useState, useEffect } from 'react';
import { Button } from '../common';

const UserForm = ({ user, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'cashier',
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      // Edit mode
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        password: '', // Don't populate password for security
        role: user.role || 'cashier',
        is_active: user.is_active !== undefined ? user.is_active : true,
      });
    } else {
      // Create mode - reset form
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'cashier',
        is_active: true,
      });
    }
    setErrors({});
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    // Password is required only when creating new user
    if (!user && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Prepare data to submit
    const dataToSubmit = { ...formData };

    // Remove password if empty (for edit mode)
    if (user && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={!!user} // Disable username edit
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${errors.username ? 'border-red-500' : 'border-neutral-300'}
            ${user ? 'bg-neutral-100 cursor-not-allowed' : ''}
          `}
          placeholder="johndoe"
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${errors.email ? 'border-red-500' : 'border-neutral-300'}
          `}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${errors.full_name ? 'border-red-500' : 'border-neutral-300'}
          `}
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Password {!user && <span className="text-red-500">*</span>}
          {user && <span className="text-neutral-500 text-xs ml-2">(Leave blank to keep current)</span>}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${errors.password ? 'border-red-500' : 'border-neutral-300'}
          `}
          placeholder={user ? '••••••••' : 'Minimum 6 characters'}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${errors.role ? 'border-red-500' : 'border-neutral-300'}
          `}
        >
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-500">{errors.role}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          {formData.role === 'admin' && 'Full access to all features'}
          {formData.role === 'manager' && 'Access to reports and user management'}
          {formData.role === 'cashier' && 'Access to POS and basic features'}
        </p>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
          Active User
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
