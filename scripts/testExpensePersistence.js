require('dotenv').config();
const pool = require('../server/db');

async function checkExpense() {
  try {
    const [rows] = await pool.query(
      `SELECT id, hotelId, category, title, amount, paymentMethod, vendor, createdAt 
       FROM expenses 
       WHERE title = '[TEST-AUDIT] Front Desk Stationery Pack' 
       ORDER BY createdAt DESC`
    );
    console.log('QUERY_RESULT:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error querying expenses:', err);
  } finally {
    await pool.end();
  }
}

checkExpense();
