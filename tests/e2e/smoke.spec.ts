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

  test('standings page shows group tables', async ({ page }) => {
    await page.goto('/standings');
    await expect(page.getByRole('heading', { name: 'Group standings', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Group A' })).toBeVisible();
  });

  test('team page shows stats and fixtures', async ({ page, request }) => {
    const response = await request.get('/api/v1/teams');
    const code = (await response.json()).data[0].code as string;

    await page.goto(`/teams/${code}`);
    await expect(page.getByText('Elo rating')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Fixtures/ })).toBeVisible();
  });

  test('admin is protected and redirects to login when signed out', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
  });

  test('admin API rejects unauthenticated requests', async ({ request }) => {
    const response = await request.post('/api/v1/admin/refresh');
    expect(response.status()).toBe(401);
  });

  test('admin can sign in and use the controls', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(process.env.ADMIN_EMAIL ?? '');
    await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? '');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Admin dashboard', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh now' })).toBeVisible();
    await expect(page.getByText('Ensemble model weights')).toBeVisible();
    await page.screenshot({ path: 'test-results/admin-authed.png', fullPage: true });
  });
});
