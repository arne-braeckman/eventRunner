"use client";

import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: "ADMIN" | "SALES" | "PROJECT_MANAGER" | "STAFF" | "CLIENT";
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const roleCheck = useQuery(api.auth.checkUserRole, { requiredRole });

  if (roleCheck === undefined) {
    return <div className="text-gray-500">Checking permissions...</div>;
  }

  if (!roleCheck.hasPermission) {
    return fallback || (
      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700 font-medium">Access Denied</p>
        <p className="text-red-600 text-sm">{roleCheck.reason}</p>
      </div>
    );
  }

  return <>{children}</>;
}

interface UseRolePermissionsReturn {
  userRole: string | null;
  permissions: {
    canManageUsers: boolean;
    canManageContacts: boolean;
    canManageProjects: boolean;
    canViewDashboard: boolean;
    canAccessClientPortal: boolean;
  } | null;
  isLoading: boolean;
}

export function useRolePermissions(): UseRolePermissionsReturn {
  const userWithRole = useQuery(api.auth.getCurrentUserWithRole);

  return {
    userRole: userWithRole?.role || null,
    permissions: userWithRole?.permissions || null,
    isLoading: userWithRole === undefined,
  };
}