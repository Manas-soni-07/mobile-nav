/**
 * ResortOS - Authentication & Role Verification Test Script
 */

const http = require('http');

function postJSON(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: urlPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body });
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAuthTests() {
  console.log("==================================================");
  console.log("ResortOS: Testing Authentication & Role Verification");
  console.log("==================================================");

  // Test 1: Admin Login
  console.log("\n[Test 1] Admin Login (admin@resortos.com)...");
  const res1 = await postJSON('/api/auth/login', {
    email: 'admin@resortos.com',
    password: 'Password123!',
    role: 'ADMIN',
  });
  console.log("Status:", res1.statusCode);
  console.log("Response:", res1.data);
  if (res1.statusCode === 200 && res1.data.user.role === 'ADMIN') {
    console.log("✓ PASS: Admin authenticated with role ADMIN");
  } else {
    console.error("✗ FAIL: Admin authentication failed");
  }

  // Test 2: Manager THE VILLA Login
  console.log("\n[Test 2] Manager Login (manager.villa@resortos.com)...");
  const res2 = await postJSON('/api/auth/login', {
    email: 'manager.villa@resortos.com',
    password: 'Password123!',
    role: 'MANAGER',
  });
  console.log("Status:", res2.statusCode);
  console.log("Response:", res2.data);
  if (res2.statusCode === 200 && res2.data.user.role === 'MANAGER' && res2.data.user.hotelId === 'h-villa') {
    console.log("✓ PASS: Manager authenticated and locked to THE VILLA (h-villa)");
  } else {
    console.error("✗ FAIL: Manager authentication failed");
  }

  // Test 3: Manager attempting to login as Admin (SECURITY MANDATE)
  console.log("\n[Test 3] Privilege Elevation Check: Manager account selecting ADMIN role...");
  const res3 = await postJSON('/api/auth/login', {
    email: 'manager.villa@resortos.com',
    password: 'Password123!',
    role: 'ADMIN',
  });
  console.log("Status:", res3.statusCode);
  console.log("Response:", res3.data);
  if (res3.statusCode === 403) {
    console.log("✓ PASS: Privilege escalation correctly blocked by backend!");
  } else {
    console.error("✗ FAIL: Privilege escalation was NOT blocked!");
  }

  // Test 4: Invalid Password
  console.log("\n[Test 4] Invalid Password Check...");
  const res4 = await postJSON('/api/auth/login', {
    email: 'admin@resortos.com',
    password: 'wrong_password',
    role: 'ADMIN',
  });
  console.log("Status:", res4.statusCode);
  console.log("Response:", res4.data);
  if (res4.statusCode === 401) {
    console.log("✓ PASS: Invalid password rejected with 401");
  } else {
    console.error("✗ FAIL: Invalid password not rejected");
  }

  console.log("\n==================================================");
  console.log("ALL AUTHENTICATION TESTS COMPLETED!");
  console.log("==================================================");
}

// Run test against running server or launch in process
const app = require('../server/index');
const server = app.listen(5000, async () => {
  try {
    await runAuthTests();
  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});
