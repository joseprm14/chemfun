import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: {
        command: 'npm run dev',
        env: { NEXT_PUBLIC_E2E_SHORT_MODE: '1' },
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});