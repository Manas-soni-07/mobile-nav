const app = require('../server/index');
const http = require('http');
const XLSX = require('xlsx');

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  console.log('Test Server listening on port 5098');

  try {
    // Test 1: Fetch JSON metadata for The Villa
    const resVillaJson = await fetch('http://localhost:5098/api/reports/guests/export?hotelId=h-villa&format=json');
    const dataVillaJson = await resVillaJson.json();
    console.log('\n--- Test 1: The Villa (JSON) ---');
    console.log('Status:', resVillaJson.status);
    console.log('Success:', dataVillaJson.success);
    console.log('Hotel:', dataVillaJson.hotelName);
    console.log('Total Records:', dataVillaJson.totalRecords);
    if (!dataVillaJson.success || dataVillaJson.totalRecords !== 13) {
      throw new Error(`Expected 13 records for The Villa, got ${dataVillaJson.totalRecords}`);
    }

    // Test 2: Fetch Binary Excel for The Villa
    const resVillaExcel = await fetch('http://localhost:5098/api/reports/guests/export?hotelId=h-villa');
    console.log('\n--- Test 2: The Villa (Excel Binary) ---');
    console.log('Status:', resVillaExcel.status);
    console.log('Content-Type:', resVillaExcel.headers.get('content-type'));
    console.log('Content-Disposition:', resVillaExcel.headers.get('content-disposition'));
    const arrayBufferVilla = await resVillaExcel.arrayBuffer();
    const wbVilla = XLSX.read(Buffer.from(arrayBufferVilla), { type: 'buffer' });
    const sheetVilla = wbVilla.Sheets[wbVilla.SheetNames[0]];
    const rowsVilla = XLSX.utils.sheet_to_json(sheetVilla);
    console.log('Parsed Excel Row Count:', rowsVilla.length);
    if (rowsVilla.length !== 13) {
      throw new Error(`Expected 13 rows in Excel, got ${rowsVilla.length}`);
    }

    // Test 3: Fetch JSON metadata for Navkar Palace
    const resNavkarJson = await fetch('http://localhost:5098/api/reports/guests/export?hotelId=h-navkar&format=json');
    const dataNavkarJson = await resNavkarJson.json();
    console.log('\n--- Test 3: Navkar Palace (JSON) ---');
    console.log('Status:', resNavkarJson.status);
    console.log('Success:', dataNavkarJson.success);
    console.log('Hotel:', dataNavkarJson.hotelName);
    console.log('Total Records:', dataNavkarJson.totalRecords);
    if (!dataNavkarJson.success || dataNavkarJson.totalRecords !== 30) {
      throw new Error(`Expected 30 records for Navkar Palace, got ${dataNavkarJson.totalRecords}`);
    }

    // Test 4: Fetch Binary Excel for Navkar Palace
    const resNavkarExcel = await fetch('http://localhost:5098/api/reports/guests/export?hotelId=h-navkar');
    console.log('\n--- Test 4: Navkar Palace (Excel Binary) ---');
    console.log('Status:', resNavkarExcel.status);
    console.log('Content-Type:', resNavkarExcel.headers.get('content-type'));
    console.log('Content-Disposition:', resNavkarExcel.headers.get('content-disposition'));
    const arrayBufferNavkar = await resNavkarExcel.arrayBuffer();
    const wbNavkar = XLSX.read(Buffer.from(arrayBufferNavkar), { type: 'buffer' });
    const sheetNavkar = wbNavkar.Sheets[wbNavkar.SheetNames[0]];
    const rowsNavkar = XLSX.utils.sheet_to_json(sheetNavkar);
    console.log('Parsed Excel Row Count:', rowsNavkar.length);
    if (rowsNavkar.length !== 30) {
      throw new Error(`Expected 30 rows in Excel, got ${rowsNavkar.length}`);
    }

    // Test 5: Verify Hotel Data Isolation (Ensure no cross-property contamination)
    const villaGuestsInNavkar = rowsNavkar.filter(r => r['Property'] === 'THE VILLA');
    const navkarGuestsInVilla = rowsVilla.filter(r => r['Property'] === 'NAVKAR PALACE & RESORT');
    console.log('\n--- Test 5: Data Isolation Audit ---');
    console.log('Villa guests inside Navkar export:', villaGuestsInNavkar.length);
    console.log('Navkar guests inside Villa export:', navkarGuestsInVilla.length);
    if (villaGuestsInNavkar.length > 0 || navkarGuestsInVilla.length > 0) {
      throw new Error('Data contamination detected between properties!');
    }

    // Test 6: Verify Manager Permission Check
    const resForbidden = await fetch('http://localhost:5098/api/reports/guests/export?hotelId=h-villa', {
      headers: {
        'x-user-role': 'MANAGER',
        'x-user-hotel-id': 'h-navkar',
      },
    });
    console.log('\n--- Test 6: Security & Role Permission Check ---');
    console.log('Status for unauthorized Manager access:', resForbidden.status);
    if (resForbidden.status !== 403) {
      throw new Error(`Expected 403 Forbidden for cross-hotel manager access, got ${resForbidden.status}`);
    }

    // Test 7: Verify Missing hotelId returns 400
    const resBad = await fetch('http://localhost:5098/api/reports/guests/export');
    console.log('\n--- Test 7: Missing hotelId Check ---');
    console.log('Status for missing hotelId:', resBad.status);
    if (resBad.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${resBad.status}`);
    }

    console.log('\n======================================================');
    console.log('✅ ALL 7 EXCEL EXPORT TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
