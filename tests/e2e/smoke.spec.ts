import { expect, test } from '@playwright/test';

test.describe('World Cup 2026 Predictor', () => {
  test('landing page links to matches', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('World Cup 2026');
    await expect(page.getByRole('link', { name: 'Explore matches' })).toBeVisible();
  });

  test('matches list renders fixtures', async ({ page }) => {
    await page.goto('/matches');
    await expect(page.getByRole('heading', { name: 'Matches', level: 1 })).toBeVisible();
    await expect(page.locator('a[href^="/matches/"]').first()).toBeVisible();
  });

  test('match detail renders the prediction and explanation', async ({ page, request }) => {
    const response = await request.get('/api/v1/matches?limit=1');
    const body = await response.json();
    const matchId = body.data[0].id as string;

    await page.goto(`/matches/${matchId}`);
    await expect(page.getByText('Match outcome')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Why this prediction')).toBeVisible();
    await expect(page.getByText('Model breakdown')).toBeVisible();
    await page.screenshot({ path: 'test-results/match-detail.png', fullPage: true });
  });
});
