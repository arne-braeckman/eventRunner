"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { RoleGuard } from "../auth/RoleGuard";

type UserRole = "ADMIN" | "SALES" | "PROJECT_MANAGER" | "STAFF" | "CLIENT";

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "ADMIN", label: "Admin", description: "Full system access" },
  { value: "SALES", label: "Sales", description: "Contact and lead management" },
  { value: "PROJECT_MANAGER", label: "Project Manager", description: "Project and team management" },
  { value: "STAFF", label: "Staff", description: "Basic dashboard access" },
  { value: "CLIENT", label: "Client", description: "Client portal access only" },
];

export function UserManagement() {
  const users = useQuery(api.users.getAllUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      setIsUpdating(userId);
      await updateUserRole({ userId: userId as any, role: newRole });
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert("Failed to update user role. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <RoleGuard requiredRole="ADMIN">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
        
        {users === undefined ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No users found.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img
                            className="h-10 w-10 rounded-full mr-3"
                            src={user.image}
                            alt={user.name || "User"}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || "Anonymous"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "ADMIN" ? "bg-red-100 text-red-800" :
                        user.role === "SALES" ? "bg-blue-100 text-blue-800" :
                        user.role === "PROJECT_MANAGER" ? "bg-purple-100 text-purple-800" :
                        user.role === "STAFF" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role || "STAFF"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role || "STAFF"}
                        onChange={(e) => handleRoleUpdate(user._id, e.target.value as UserRole)}
                        disabled={isUpdating === user._id}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {isUpdating === user._id && (
                        <div className="ml-2 inline-block text-gray-500">
                          Updating...
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Role Descriptions</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {ROLE_OPTIONS.map((role) => (
              <li key={role.value}>
                <strong>{role.label}:</strong> {role.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RoleGuard>
  );
}