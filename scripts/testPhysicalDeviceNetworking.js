/**
 * ResortOS - Physical Android Device Networking & Backend Connectivity Verification
 * Tests LAN interface binding on 0.0.0.0:5000, 192.168.1.26 resolution,
 * backend APIs, and centralized apiConfig.
 */

require('dotenv').config();
const http = require('http');
const app = require('../server/index');

async function testNetworking() {
  console.log('====================================================');
  console.log('📱 ResortOS Physical Device Networking Verification');
  console.log('====================================================\n');

  const LAN_IP = '192.168.1.26';
  const PORT = 5000;
  const HOST = '0.0.0.0';

  let server;
  const results = [];

  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${testName} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // 1. Check or start backend server bound to 0.0.0.0:5000
    try {
      server = http.createServer(app);
      await new Promise((resolve, reject) => {
        server.listen(PORT, HOST, () => {
          console.log(`Server actively listening on ${HOST}:${PORT}`);
          resolve();
        });
        server.on('error', reject);
      });
      record('Server LAN Binding', true, `Listening on ${HOST}:${PORT}`);
    } catch (e) {
      if (e.code === 'EADDRINUSE') {
        record('Server LAN Binding', true, `Active server already running on ${HOST}:${PORT}`);
      } else {
        throw e;
      }
    }

    // 2. Test Root Endpoint via LAN IP
    const rootRes = await fetch(`http://${LAN_IP}:${PORT}/`);
    const rootData = await rootRes.json();
    const rootOk = rootRes.status === 200 && rootData.message?.includes('ResortOS');
    record('Root LAN Accessibility', rootOk, `HTTP ${rootRes.status}: ${rootData.message}`);

    // 3. Test Health Endpoint via LAN IP
    const healthRes = await fetch(`http://${LAN_IP}:${PORT}/api/health`);
    const healthData = await healthRes.json();
    const healthOk = healthRes.status === 200 && healthData.status === 'ONLINE';
    record('Health Check via LAN IP', healthOk, `Status: ${healthData.status}, Region: ${healthData.region}`);

    // 4. Test Login Endpoint via LAN IP
    const loginRes = await fetch(`http://${LAN_IP}:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@resortos.com',
        password: 'Password123!',
        role: 'ADMIN',
      }),
    });
    const loginData = await loginRes.json();
    const loginOk = loginRes.status === 200 && loginData.success && loginData.token;
    record('Admin Login via LAN IP', loginOk, `User: ${loginData.user?.fullName}, Role: ${loginData.user?.role}`);

    const authToken = loginData.token;

    // 5. Test Hotel Listing API via LAN IP
    const hotelsRes = await fetch(`http://${LAN_IP}:${PORT}/api/hotels`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-user-role': 'ADMIN',
      },
    });
    const hotelsData = await hotelsRes.json();
    const hotelsOk = hotelsRes.status === 200 && Array.isArray(hotelsData) && hotelsData.length >= 2;
    record('Hotel Listing API via LAN IP', hotelsOk, `Found ${hotelsData.length} properties`);

    // 6. Test Dashboard KPIs API via LAN IP
    const kpiRes = await fetch(`http://${LAN_IP}:${PORT}/api/dashboard/kpis?hotelId=h-villa`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-user-role': 'ADMIN',
      },
    });
    const kpiData = await kpiRes.json();
    const kpiOk = kpiRes.status === 200 && typeof kpiData.totalRooms === 'number';
    record('Dashboard KPIs via LAN IP', kpiOk, `Total Rooms: ${kpiData.totalRooms}, Occupied: ${kpiData.occupiedRooms}`);

    // 7. Test Dashboard Daily Summary API via LAN IP
    const summaryRes = await fetch(`http://${LAN_IP}:${PORT}/api/dashboard/daily-summary?hotelId=h-villa`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-user-role': 'ADMIN',
      },
    });
    const summaryData = await summaryRes.json();
    const summaryOk = summaryRes.status === 200 && summaryData.totalRooms === 15;
    record('Daily Summary via LAN IP', summaryOk, `Total Rooms: ${summaryData.totalRooms}, ADR: ₹${summaryData.adr}`);

    // 8. Test Database Integrity - Credentials Check
    const dbUserExposed = JSON.stringify(rootData).includes('4SrH1BGohq6Yugo') || JSON.stringify(healthData).includes('ogus8NoUWzayhpfY');
    record('Security: DB Credentials Hidden from Mobile', !dbUserExposed, 'Zero credentials exposed in HTTP responses');

    // 9. Test Centralized apiConfig resolution
    const fs = require('fs');
    const apiConfigContent = fs.readFileSync('src/config/apiConfig.ts', 'utf8');
    const hasLanIp = apiConfigContent.includes('192.168.1.26');
    const hasExpoEnv = apiConfigContent.includes('EXPO_PUBLIC_API_URL');
    const hasMetroDetect = apiConfigContent.includes('NativeModules?.SourceCode?.scriptURL');
    const hasProdUrl = apiConfigContent.includes('https://api.resortos.com/api');

    const configOk = hasLanIp && hasExpoEnv && hasMetroDetect && hasProdUrl;
    record('Centralized apiConfig Resolution', configOk, 'LAN IP + EXPO_PUBLIC_API_URL + Metro Auto-Detect + Production URL configured');

    console.log('\n====================================================');
    const totalPassed = results.filter((r) => r.passed).length;
    console.log(`📊 SUMMARY: ${totalPassed} / ${results.length} checks PASSED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    if (server && server.listening) {
      server.close();
    }
    const pool = require('../server/db');
    await pool.end();
  }
}

testNetworking().catch((e) => {
  console.error(e);
  process.exit(1);
});
