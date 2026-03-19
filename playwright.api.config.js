const path = require('path');
const { defineConfig } = require('@playwright/test');

const testDatabasePath = path.join(__dirname, 'backend', 'data', 'test.sqlite');

module.exports = defineConfig({
  testDir: './tests/api',
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3100'
  },
  webServer: {
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
  }
});
