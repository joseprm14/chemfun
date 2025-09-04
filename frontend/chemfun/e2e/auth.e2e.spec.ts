import { test, expect, Page } from '@playwright/test';

// Intercepta /api/users/login del backend
test.beforeEach(async ({ page }) => {
  await page.route('**/api/users/login', async route => {
    const req = route.request();
    if (req.method() !== 'POST') return route.fallback();

    const body = await req.postDataJSON();
    if (body.username === 'alice' && body.password === 'secret') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'jwt' }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciales inválidas' }),
      });
    }
  });
});

async function getLoginButton(page: Page) {
  const candidates = [
    page.getByRole('button', { name: /iniciar\s+sesi[oó]n|entrar|acceder|sign\s*in|log\s*in/i }),
    page.locator('button[type=submit]'),
    page.locator('input[type=submit]'),
    page.getByTestId('login-submit'),
  ];
  for (const loc of candidates) {
    if (await loc.count()) return loc.first();
  }
  throw new Error('No se encontró el botón de login');
}

test('test-f-e-01 - login correcto navega al home', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.getByLabel(/usuario|correo|email|user/i).fill('alice');
  await page.getByLabel(/contrase(?:ñ|n)a|password|clave/i).fill('secret');
  const btn = await getLoginButton(page);
  await btn.click();
  await expect(page).toHaveURL(/\/$/);
});

test('test-f-e-02 - login incorrecto muestra error', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.getByLabel(/usuario|correo|email|user/i).fill('bad');
  await page.getByLabel(/contrase(?:ñ|n)a|password|clave/i).fill('bad');
  const btn = await getLoginButton(page);
  await btn.click();
  await expect(page.getByText(/credenciales inválidas|invalid credentials/i)).toBeVisible();
});