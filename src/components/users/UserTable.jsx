import React from 'react';
import { Edit, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common';

const UserTable = ({ users, onEdit, onDelete, onResetPassword }) => {
  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      cashier: 'bg-green-100 text-green-700',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[role] || 'bg-gray-100 text-gray-700'}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="flex items-center gap-1 text-success-700">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Active</span>
      </span>
    ) : (
      <span className="flex items-center gap-1 text-neutral-500">
        <XCircle className="w-4 h-4" />
        <span className="text-sm">Inactive</span>
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-100 border-b border-neutral-200">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              User
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Email
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Role
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Joined
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-neutral-50 transition-colors"
            >
              {/* User Info */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{user.full_name}</p>
                    <p className="text-sm text-neutral-500">@{user.username}</p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3">
                <p className="text-neutral-900">{user.email}</p>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                {getRoleBadge(user.role)}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                {getStatusBadge(user.is_active)}
              </td>

              {/* Joined Date */}
              <td className="px-4 py-3">
                <p className="text-sm text-neutral-600">
                  {formatDate(user.created_at)}
                </p>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onResetPassword(user)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                    title="Reset Password"
                  >
                    <Key className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
