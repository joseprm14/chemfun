import { test, expect } from '@playwright/test';

test.setTimeout(60_000);

test('test-f-e-03 - completa una partida corta en modo click', async ({ page }) => {
  await page.goto('/');

  // Cambiar a modo CLICK si hay toggles visibles
  const clickBtn = page.getByRole('button', { name: /click/i });
  if (await clickBtn.isVisible().catch(() => false)) {
    await clickBtn.click();
  }

  // Iniciar partida
  await page.getByRole('button', { name: /iniciar partida|start game/i }).click();

  // Con el "modo corto" activo (NEXT_PUBLIC_E2E_SHORT_MODE=1) la tabla tendrá 5 elementos
  const target = page.getByTestId('target');
  await expect(target).toBeVisible({ timeout: 15000 });

  const finished = page.getByTestId('game-finished');
  const dialog = page.getByRole('dialog');

  // Resuelve hasta 5 objetivos o hasta finalizar
  for (let i = 0; i < 118; i++) {
    // Lee el símbolo actual del objetivo
    let sym = (await target.getAttribute('data-target-symbol')) || '';
    // Si todavía no está definido (latencia de render), espera un poco
    if (!sym) {
      await page.waitForFunction(
        el => (el as unknown as HTMLElement).getAttribute('data-target-symbol'),
        target,
        { timeout: 5000 }
      ).catch(() => {});
      sym = (await target.getAttribute('data-target-symbol')) || '';
    }

    // Si ya no hay objetivo (porque se acabó la partida), sal
    if (!sym) break;

    const cell = page.locator(`[data-testid="cell-${sym}"]`).first();
    await cell.scrollIntoViewIfNeeded();
    await expect(cell).toBeVisible({ timeout: 5000 });

    // Clic en la celda correcta
    await cell.click({ force: true });

    // Espera a que cambie el objetivo o a que termine la partida
    await Promise.race([
      page.waitForFunction(
        (el: any, prev: any) => (el as HTMLElement).getAttribute('data-target-symbol') !== prev,
        target,
        sym,
        { timeout: 8000 }
      ),
      finished.waitFor({ state: 'visible', timeout: 8000 }),
      dialog.waitFor({ state: 'visible', timeout: 8000 }),
    ]).catch(() => {});
    
    // Si ya terminó, corta el bucle
    if (await finished.isVisible().catch(() => false)) break;
    if (await dialog.isVisible().catch(() => false)) break;
  }

  // Aserción final: juego terminado (flag o modal)
  expect(
    (await finished.isVisible().catch(() => false)) ||
    (await dialog.isVisible().catch(() => false))
  ).toBeTruthy();
});