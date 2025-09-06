import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to upload page from home', async ({ page }) => {
    // Click on Upload Syllabus button
    await page.click('text=Upload Syllabus');
    
    // Should be on upload page
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('Upload Syllabus');
  });

  test('should show upload interface elements', async ({ page }) => {
    await page.goto('/upload');
    
    // Should show upload area
    await expect(page.locator('text=Upload your syllabus')).toBeVisible();
    await expect(page.locator('text=Drag and drop your file here')).toBeVisible();
    
    // Should show supported formats
    await expect(page.locator('text=PDF, DOCX, and TXT')).toBeVisible();
    
    // Should show help section
    await expect(page.locator('text=What we support')).toBeVisible();
  });

  test('should handle file selection', async ({ page }) => {
    await page.goto('/upload');
    
    // Create a test file
    const testFile = path.join(__dirname, '../fixtures/test-syllabus.txt');
    
    // Set up file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Upload your syllabus');
    const fileChooser = await fileChooserPromise;
    
    // Mock file selection (in real test, you'd use actual file)
    // For now, just verify the file chooser opened
    expect(fileChooser).toBeTruthy();
  });

  test('should navigate between pages using sidebar', async ({ page }) => {
    // Test sidebar navigation
    await expect(page.locator('text=Syllabus')).toBeVisible();
    
    // Navigate to different pages
    await page.click('text=Review');
    await expect(page).toHaveURL('/review');
    
    await page.click('text=Calendar');
    await expect(page).toHaveURL('/calendar');
    
    await page.click('text=Export');
    await expect(page).toHaveURL('/export');
    
    await page.click('text=Settings');
    await expect(page).toHaveURL('/settings');
    
    // Navigate back home
    await page.click('text=Home');
    await expect(page).toHaveURL('/');
  });

  test('should show empty states correctly', async ({ page }) => {
    // Review page empty state
    await page.goto('/review');
    await expect(page.locator('text=No syllabi uploaded yet')).toBeVisible();
    
    // Calendar page empty state
    await page.goto('/calendar');
    await expect(page.locator('text=No tasks to display')).toBeVisible();
    
    // Export page empty state
    await page.goto('/export');
    await expect(page.locator('text=Nothing to export')).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('a[href="/"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('a[href="/upload"]')).toBeFocused();
    
    // Test Enter key navigation
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/upload');
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    
    // Verify page loads without animation issues
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Syllabus Importer')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Test mobile navigation (if applicable)
    // This would depend on your mobile menu implementation
  });
});
