const { villaRooms, navkarRooms } = require('./generateRooms');
const fs = require('fs');
const path = require('path');

const allRooms = [...villaRooms, ...navkarRooms];

const tsContent = `import { Room } from '../types/hotel';

export const INITIAL_ROOMS: Room[] = ${JSON.stringify(allRooms, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'roomsData.ts.txt'), tsContent, 'utf8');
console.log('Written to scripts/roomsData.ts.txt');
