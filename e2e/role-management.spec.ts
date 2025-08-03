import { test, expect } from '@playwright/test';

test.describe('Role Management', () => {
  test('shows access denied for admin routes when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show access restricted message
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to access the admin panel')).toBeVisible();
  });

  test('shows appropriate navigation items based on authentication', async ({ page }) => {
    // Visit the home page
    await page.goto('/');
    
    // Should show basic navigation when not authenticated
    await expect(page.getByText('eventRunner')).toBeVisible();
    
    // Should not show admin or role-specific navigation
    await expect(page.getByText('User Management')).not.toBeVisible();
  });

  test('contacts page shows access restriction when not authenticated', async ({ page }) => {
    await page.goto('/contacts');
    
    // Should show access restricted message
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to view contacts')).toBeVisible();
  });

  test('projects page shows access restriction when not authenticated', async ({ page }) => {
    await page.goto('/projects');
    
    // Should show access restricted message
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to view projects')).toBeVisible();
  });

  test('admin page shows specific access restriction', async ({ page }) => {
    await page.goto('/admin');
    
    // Should show specific admin access restriction
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to access the admin panel')).toBeVisible();
  });
});