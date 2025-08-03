import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('shows sign in prompt when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should show unauthenticated state
    await expect(page.getByText('Welcome to eventRunner')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in to get started/i })).toBeVisible();
  });

  test('shows authentication required for protected routes', async ({ page }) => {
    await page.goto('/contacts');
    
    // Should show access restricted message
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to view contacts')).toBeVisible();
  });

  test('shows authentication required for projects page', async ({ page }) => {
    await page.goto('/projects');
    
    // Should show access restricted message
    await expect(page.getByText('Access Restricted')).toBeVisible();
    await expect(page.getByText('Please sign in to view projects')).toBeVisible();
  });
});