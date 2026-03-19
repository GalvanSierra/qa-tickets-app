const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const testDatabasePath = path.join(__dirname, 'backend', 'data', 'test.sqlite');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  fullyParallel: false,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: [
    {
      command: 'npm run start:test --workspace backend',
      url: 'http://127.0.0.1:3100/health',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        PORT: '3100',
        DB_PATH: testDatabasePath,
        ENABLE_TEST_ENDPOINTS: 'true'
      }
    },
    {
      command: 'npm run dev:test --workspace frontend',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        VITE_API_URL: 'http://127.0.0.1:3100/api'
      }
    }
  ]
});
