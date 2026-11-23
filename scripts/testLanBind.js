const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK', message: 'Accessible from LAN interface' }));
});

server.listen(5000, '0.0.0.0', async () => {
  console.log('Server bound to 0.0.0.0:5000');
  try {
    const res = await fetch('http://192.168.1.26:5000');
    const data = await res.json();
    console.log('Successfully reached via LAN IP 192.168.1.26:', data);
  } catch (err) {
    console.error('Failed to reach via LAN IP:', err.message);
  } finally {
    server.close();
  }
});
