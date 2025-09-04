import { test, expect } from '@playwright/test';


// Mock de endpoints de sesión/partidas usados por MainPage
test.beforeEach(async ({ page }) => {
    await page.route('**/api/game/save', async route => {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, id: 's1' }) });
    });
});


test('test-f-e-04 - inicio rápido de partida', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /iniciar partida/i }).click();
    await expect(page.getByRole('button', { name: /pausar/i })).toBeVisible();
});