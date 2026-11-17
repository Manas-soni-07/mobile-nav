const fs = require('fs');
let txt = fs.readFileSync('src/constants/mockDatabase.ts', 'utf8');
txt = txt.split("'h-1'").join("'h-villa'");
txt = txt.split("'h-2'").join("'h-navkar'");
txt = txt.split("'h-3'").join("'h-villa'");
fs.writeFileSync('src/constants/mockDatabase.ts', txt, 'utf8');
console.log('Updated mockDatabase IDs successfully!');
