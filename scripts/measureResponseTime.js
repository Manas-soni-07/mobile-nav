require('dotenv').config();
const http = require('http');
const app = require('../server/index');

async function measure() {
  const server = http.createServer(app);
  await new Promise((res) => server.listen(5094, '0.0.0.0', res));
  try {
    console.log('=== Performance & Response Time Benchmark (over LAN 192.168.1.26) ===\n');

    // 1. Admin Login
    let adminToken = '';
    for (let i = 1; i <= 3; i++) {
      const start = Date.now();
      const res = await fetch('http://192.168.1.26:5094/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@resortos.com',
          password: 'Password123!',
          role: 'ADMIN',
        }),
      });
      const data = await res.json();
      const duration = Date.now() - start;
      if (data.token) adminToken = data.token;
      console.log(`Admin Login #${i}: status=${res.status}, duration=${duration}ms, user=${data.user?.fullName}`);
    }

    // 2. Manager Login
    for (let i = 1; i <= 3; i++) {
      const start = Date.now();
      const res = await fetch('http://192.168.1.26:5094/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'manager.villa@resortos.com',
          password: 'Password123!',
          role: 'MANAGER',
        }),
      });
      const data = await res.json();
      const duration = Date.now() - start;
      console.log(`Manager Login #${i}: status=${res.status}, duration=${duration}ms, user=${data.user?.fullName}, hotel=${data.user?.hotelId}`);
    }

    // 3. Hotel Listing
    {
      const start = Date.now();
      const res = await fetch('http://192.168.1.26:5094/api/hotels', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-user-role': 'ADMIN',
        },
      });
      const data = await res.json();
      const duration = Date.now() - start;
      console.log(`Hotels API: status=${res.status}, duration=${duration}ms, count=${data.length}`);
    }

    // 4. Dashboard KPIs
    {
      const start = Date.now();
      const res = await fetch('http://192.168.1.26:5094/api/dashboard/kpis?hotelId=h-villa', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'x-user-role': 'ADMIN',
        },
      });
      const data = await res.json();
      const duration = Date.now() - start;
      console.log(`Dashboard KPIs: status=${res.status}, duration=${duration}ms, rooms=${data.totalRooms}`);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    server.close();
    const pool = require('../server/db');
    await pool.end();
  }
}
measure();
