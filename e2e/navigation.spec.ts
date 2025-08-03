import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('displays eventRunner branding', async ({ page }) => {
    await page.goto('/');
    
    // Check for eventRunner branding in navigation
    await expect(page.getByText('eventRunner')).toBeVisible();
  });

  test('shows appropriate content on different pages', async ({ page }) => {
    // Home page
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /eventrunner/i })).toBeVisible();
    
    // Contacts page (unauthenticated)
    await page.goto('/contacts');
    await expect(page.getByText('Contact Management')).toBeVisible();
    
    // Projects page (unauthenticated)
    await page.goto('/projects');
    await expect(page.getByText('Project Management')).toBeVisible();
  });

  test('maintains responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.getByText('eventRunner')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByText('eventRunner')).toBeVisible();
  });
});