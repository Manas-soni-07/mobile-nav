const app = require('../server/index');
const http = require('http');

async function testServer() {
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log("✓ Test server listening on http://localhost:5099");

  try {
    const healthRes = await fetch('http://localhost:5099/api/health');
    const healthData = await healthRes.json();
    console.log("✓ Health Check Response:", healthData);

    const syncRes = await fetch('http://localhost:5099/api/sync/summary');
    const syncData = await syncRes.json();
    console.log("✓ Sync Summary Response:", syncData);

    const banquetsRes = await fetch('http://localhost:5099/api/banquets');
    const banquets = await banquetsRes.json();
    console.log(`✓ Fetched ${banquets.length} banquets from TiDB Cloud!`);

    const spaRes = await fetch('http://localhost:5099/api/spa/bookings');
    const spaBookings = await spaRes.json();
    console.log(`✓ Fetched ${spaBookings.length} spa bookings from TiDB Cloud!`);
  } catch (err) {
    console.error("Test error:", err.message);
  } finally {
    server.close();
    process.exit(0);
  }
}

testServer();
