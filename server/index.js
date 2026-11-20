/**
 * ResortOS - TiDB Cloud Backend Server
 * Express Server exposing REST APIs for Mobile Application
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'ResortOS TiDB Cloud Backend API is running!',
    region: 'AWS Tokyo (ap-northeast-1)',
    version: '1.0.0 (Phase 7)',
    endpoints: {
      health: '/api/health',
      syncSummary: '/api/sync/summary',
      hotels: '/api/hotels',
      rooms: '/api/rooms',
      banquets: '/api/banquets',
      dining: '/api/dining/orders',
      housekeeping: '/api/housekeeping/tickets',
      spa: '/api/spa/bookings',
      concierge: '/api/concierge/bookings',
      shiftHandovers: '/api/shift-handovers',
    },
  });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ResortOS TiDB Cloud API Server listening on port ${PORT}`);
    console.log(`📡 Bound Interface:  ${HOST} (Available across Wi-Fi LAN)`);
    console.log(`💻 Local Host:       http://localhost:${PORT}/api/health`);
    console.log(`📱 Android Phone:    http://192.168.0.104:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
