const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) results = results.concat(walk(fullPath));
    else if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(fullPath);
  });
  return results;
}
walk('src').forEach(f => {
  if (f.includes('hotelData.ts')) return;
  const c = fs.readFileSync(f, 'utf8');
  if (c.includes("MOCK_KPIS") || c.includes("MOCK_ATTENDANCE") || c.includes("MOCK_ADVANCE_BOOKING") || c.includes("MOCK_BILLING")) {
    console.log(f);
  }
});
