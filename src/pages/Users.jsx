import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout';
import { Card, Button } from '../components/common';
import { Users as UsersIcon, Plus, Search, Filter, UserPlus } from 'lucide-react';
import UserTable from '../components/users/UserTable';
import UserModal from '../components/users/UserModal';
import userApi from '../api/userApi';
import { useToast } from '../contexts/ToastContext';
import { useNotifications } from '../contexts/NotificationContext';
import useAuthStore from '../store/authStore';

const Users = () => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const { user: currentUser } = useAuthStore();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedRole) params.role = selectedRole;

      const response = await userApi.getUsers(params);

      if (response.success && response.data) {
        setUsers(response.data);

        if (response.pagination) {
          setTotalPages(response.pagination.total_pages || 1);
          setTotalItems(response.pagination.total_rows || response.data.length);
        } else {
          setTotalItems(response.data.length);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add User
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Handle Edit User
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // Handle Delete User
  const handleDeleteUser = async (user) => {
    // Prevent deleting yourself
    if (user.id === currentUser?.id) {
      toast.warning('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.full_name}"?`)) {
      return;
    }

    try {
      const response = await userApi.deleteUser(user.id);

      if (response.success) {
        toast.success(`User "${user.full_name}" deleted successfully`);
        addNotification({
          type: 'success',
          title: 'User Deleted',
          message: `${user.full_name} has been removed`,
        });
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + error.message);
    }
  };

  // Handle Reset Password
  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(
      `Enter new password for "${user.full_name}":\n(Minimum 6 characters)`
    );

    if (!newPassword) return;

    if (newPassword.length < 6) {
      toast.warning('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await userApi.resetPassword(user.id, {
        new_password: newPassword,
      });

      if (response.success) {
        toast.success(`Password reset successfully for ${user.full_name}`);
        addNotification({
          type: 'success',
          title: 'Password Reset',
          message: `Password updated for ${user.full_name}`,
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password: ' + error.message);
    }
  };

  // Handle Form Submit (Create/Update)
  const handleSubmit = async (userData) => {
    try {
      setIsSubmitting(true);

      let response;
      if (selectedUser) {
        // Update existing user
        response = await userApi.updateUser(selectedUser.id, userData);
      } else {
        // Create new user
        response = await userApi.createUser(userData);
      }

      if (response.success) {
        const action = selectedUser ? 'updated' : 'created';
        toast.success(`User ${action} successfully!`);
        addNotification({
          type: 'success',
          title: selectedUser ? 'User Updated' : 'User Created',
          message: `${userData.full_name} has been ${action}`,
        });

        setIsModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle role filter
  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedRole('');
    setCurrentPage(1);
  };

  return (
    <MainLayout title="User Management">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8" />
            User Management
          </h2>
          <p className="text-neutral-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Add User Button */}
        <Button variant="primary" size="md" onClick={handleAddUser}>
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by name, username, or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Role Filter */}
        <div className="w-48">
          <select
            value={selectedRole}
            onChange={handleRoleFilter}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedRole) && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && (
        <div className="mb-4">
          <p className="text-sm text-neutral-600">
            Showing <span className="font-semibold text-neutral-900">{users.length}</span> of{' '}
            <span className="font-semibold">{totalItems}</span> users
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading users...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">Error loading users</p>
            <p className="text-neutral-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchUsers} variant="primary" size="sm">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* User List */}
      {!loading && !error && (
        <>
          <Card>
            {users.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <UserPlus className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No Users Found
                </h3>
                <p className="text-neutral-600 mb-6">
                  {searchQuery || selectedRole
                    ? 'No users match your search criteria.'
                    : 'Get started by adding your first user.'}
                </p>
                {!searchQuery && !selectedRole && (
                  <Button variant="primary" size="md" onClick={handleAddUser}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add First User
                  </Button>
                )}
              </div>
            ) : (
              /* User Table */
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onResetPassword={handleResetPassword}
              />
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </MainLayout>
  );
};

export default Users;
