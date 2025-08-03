"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useRolePermissions } from "../auth/RoleGuard";

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const { permissions } = useRolePermissions();

  const navItems = [
    { href: "/", label: "Dashboard", auth: true, permission: "canViewDashboard" },
    { href: "/contacts", label: "Contacts", auth: true, permission: "canViewDashboard" }, // All staff can view contacts
    { href: "/projects", label: "Projects", auth: true, permission: "canManageProjects" },
    { href: "/admin", label: "User Management", auth: true, permission: "canManageUsers" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-800">
              event<span className="text-blue-600">Runner</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                
                // Check role-based permissions
                if (item.permission && permissions && !permissions[item.permission as keyof typeof permissions]) {
                  return null;
                }
                
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <UserButton />
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Please sign in to continue
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                
                // Check role-based permissions
                if (item.permission && permissions && !permissions[item.permission as keyof typeof permissions]) {
                  return null;
                }
                
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}