import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard, useRolePermissions } from '~/components/auth/RoleGuard'

// Create a mock function for useQuery
const mockUseQuery = vi.fn()

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args)
}))

// Mock API
vi.mock('../../../convex/_generated/api', () => ({
  api: {
    auth: {
      checkUserRole: 'checkUserRole',
      getCurrentUserWithRole: 'getCurrentUserWithRole',
    }
  }
}))

describe('RoleGuard', () => {
  beforeEach(() => {
    mockUseQuery.mockReset()
  })

  it('shows loading state when permissions are being checked', () => {
    mockUseQuery.mockReturnValue(undefined);
    
    render(
      <RoleGuard requiredRole="STAFF">
        <div>Protected content</div>
      </RoleGuard>
    );
    
    expect(screen.getByText('Checking permissions...')).toBeInTheDocument();
  });

  it('shows access denied when user lacks permissions', () => {
    mockUseQuery.mockReturnValue({
      hasPermission: false,
      reason: 'Insufficient permissions'
    });
    
    render(
      <RoleGuard requiredRole="ADMIN">
        <div>Protected content</div>
      </RoleGuard>
    );
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Insufficient permissions')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('shows content when user has permissions', () => {
    mockUseQuery.mockReturnValue({
      hasPermission: true,
      reason: 'Access granted'
    });
    
    render(
      <RoleGuard requiredRole="STAFF">
        <div>Protected content</div>
      </RoleGuard>
    );
    
    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it('shows custom fallback when user lacks permissions', () => {
    mockUseQuery.mockReturnValue({
      hasPermission: false,
      reason: 'Insufficient permissions'
    });
    
    render(
      <RoleGuard 
        requiredRole="ADMIN" 
        fallback={<div>Custom access denied message</div>}
      >
        <div>Protected content</div>
      </RoleGuard>
    );
    
    expect(screen.getByText('Custom access denied message')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });
});

describe('useRolePermissions', () => {
  it('returns loading state when user data is not available', () => {
    mockUseQuery.mockReturnValue(undefined);
    
    const TestComponent = () => {
      const { userRole, permissions, isLoading } = useRolePermissions();
      return (
        <div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Role: {userRole || 'null'}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('Loading: true')).toBeInTheDocument();
    expect(screen.getByText('Role: null')).toBeInTheDocument();
  });

  it('returns user role and permissions when available', () => {
    const mockUser = {
      role: 'ADMIN',
      permissions: {
        canManageUsers: true,
        canManageContacts: true,
        canManageProjects: true,
        canViewDashboard: true,
        canAccessClientPortal: true,
      }
    };
    
    mockUseQuery.mockReturnValue(mockUser);
    
    const TestComponent = () => {
      const { userRole, permissions, isLoading } = useRolePermissions();
      return (
        <div>
          <div>Loading: {isLoading.toString()}</div>
          <div>Role: {userRole}</div>
          <div>Can Manage Users: {permissions?.canManageUsers?.toString()}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByText('Loading: false')).toBeInTheDocument();
    expect(screen.getByText('Role: ADMIN')).toBeInTheDocument();
    expect(screen.getByText('Can Manage Users: true')).toBeInTheDocument();
  });
});