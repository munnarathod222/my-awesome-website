const { spawn } = require('child_process');
const assert = require('assert');

process.env.JWT_SECRET = 'synthetic_test_driver_auth_secret_key_32chars_2026';
const PORT = 3099;
const baseUrl = `http://127.0.0.1:${PORT}/api/mobile/v1`;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiCall(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log('🧪 Starting Live HTTP Server Tests on server.js mobile auth routes...');

  const serverProcess = spawn('node', ['server.js'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      JWT_SECRET: 'synthetic_test_driver_auth_secret_key_32chars_2026'
    },
    stdio: 'inherit'
  });

  try {
    // Wait for server to start
    await sleep(1500);

    const driverAuthService = await import('../apps/api/src/services/driverAuthService.js');
    const testEmployeeId = '2ioikacogombftp'; // Chandrakant Shivaji Gaikwad (D005)

    // Create or reset driver account
    const accStatus = driverAuthService.getAccountStatus(null, testEmployeeId);
    if (!accStatus.hasAccount) {
      driverAuthService.createDriverAccount(null, {
        employeeId: testEmployeeId,
        temporaryPassword: 'TempDriverPass2026!'
      });
    } else {
      driverAuthService.resetDriverPassword(null, {
        employeeId: testEmployeeId,
        temporaryPassword: 'TempDriverPass2026!'
      });
    }

    console.log('1. POST /api/mobile/v1/auth/login with temporary password');
    const loginRes = await apiCall('POST', '/auth/login', {
      employeeCode: 'D005',
      password: 'TempDriverPass2026!'
    });
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.mustChangePassword, true);
    assert(loginRes.data.accessToken);
    assert(loginRes.data.refreshToken);
    const { accessToken, refreshToken } = loginRes.data;

    console.log('2. Token-type rejection: Sending accessToken to /auth/refresh');
    const refreshWithAccess = await apiCall('POST', '/auth/refresh', {
      refreshToken: accessToken
    });
    assert.strictEqual(refreshWithAccess.status, 401);
    assert.strictEqual(refreshWithAccess.data.code, 'TOKEN_TYPE_INVALID');
    console.log('✓ Access token rejected on /auth/refresh with 401 TOKEN_TYPE_INVALID');

    console.log('3. Token-type rejection: Sending refreshToken to protected route /me');
    const meWithRefresh = await apiCall('GET', '/me', null, refreshToken);
    assert.strictEqual(meWithRefresh.status, 401);
    assert.strictEqual(meWithRefresh.data.code, 'TOKEN_TYPE_INVALID');
    console.log('✓ Refresh token rejected on protected route /me with 401 TOKEN_TYPE_INVALID');

    console.log('4. First-login restriction: Refresh rejected when mustChangePassword=true');
    const refreshGated = await apiCall('POST', '/auth/refresh', {
      refreshToken
    });
    assert.strictEqual(refreshGated.status, 403);
    assert.strictEqual(refreshGated.data.code, 'PASSWORD_CHANGE_REQUIRED');
    console.log('✓ Refresh token rejected with 403 PASSWORD_CHANGE_REQUIRED');

    console.log('5. First-login restriction: /me rejected when mustChangePassword=true');
    const meGated = await apiCall('GET', '/me', null, accessToken);
    assert.strictEqual(meGated.status, 403);
    assert.strictEqual(meGated.data.code, 'PASSWORD_CHANGE_REQUIRED');
    console.log('✓ Protected route /me rejected with 403 PASSWORD_CHANGE_REQUIRED');

    console.log('6. Changing password via /auth/change-password');
    const changeRes = await apiCall('POST', '/auth/change-password', {
      currentPassword: 'TempDriverPass2026!',
      newPassword: 'MyNewPermanentPass2026#'
    }, accessToken);
    assert.strictEqual(changeRes.status, 200);
    assert.strictEqual(changeRes.data.mustChangePassword, false);
    const newAccessToken = changeRes.data.accessToken;
    const newRefreshToken = changeRes.data.refreshToken;

    console.log('7. Verifying /me access with accurate profile, truck, and supervisor');
    const meRes = await apiCall('GET', '/me', null, newAccessToken);
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data.driver.employeeCode, 'D005');
    assert.strictEqual(meRes.data.driver.name, 'Chandrakant Shivaji Gaikwad');
    assert.strictEqual(meRes.data.driver.role, 'driver');
    assert(meRes.data.driver.assignedTruck, 'Must have assigned truck');
    assert.strictEqual(meRes.data.driver.assignedTruck.truckNumber, 'TG12U2637');
    assert.strictEqual(meRes.data.driver.assignedTruck.truckCode, 'TRK-001');
    assert(meRes.data.driver.assignedSupervisor, 'Must have assigned supervisor');
    assert.strictEqual(meRes.data.driver.assignedSupervisor.name, 'Vinod Kumar Rathod');
    assert.strictEqual(meRes.data.driver.assignedSupervisor.code, 'E001');
    console.log('✓ /me profile returned accurate data:', JSON.stringify(meRes.data.driver, null, 2));

    console.log('8. Verifying token refresh now succeeds after password change');
    const refreshOk = await apiCall('POST', '/auth/refresh', {
      refreshToken: newRefreshToken
    });
    assert.strictEqual(refreshOk.status, 200);
    assert(refreshOk.data.accessToken);
    console.log('✓ Token refresh successfully issued new access token');

    console.log('\n🎉 ALL LIVE SERVER.JS HTTP TESTS PASSED CLEANLY!\n');
  } finally {
    serverProcess.kill();
  }
}

run().catch(err => {
  console.error('\n❌ SERVER TEST FAILED:', err);
  process.exit(1);
});
