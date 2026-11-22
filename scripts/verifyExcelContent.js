const XLSX = require('xlsx');
const path = require('path');

function verifyExcel(fileName) {
  const filePath = path.join(__dirname, 'output', fileName);
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet);
  console.log(`\n=== Verified ${fileName} ===`);
  console.log(`Sheet name: ${sheetName}`);
  console.log(`Row count: ${json.length}`);
  console.log('First 2 rows:');
  console.log(json.slice(0, 2));
  console.log('Last row:');
  console.log(json.slice(-1));
  return json.length;
}

const villaCount = verifyExcel('h-villa_guest_records.xlsx');
const navkarCount = verifyExcel('h-navkar_guest_records.xlsx');

console.log(`\nVerification Summary: The Villa = ${villaCount} rows, Navkar Palace = ${navkarCount} rows.`);
