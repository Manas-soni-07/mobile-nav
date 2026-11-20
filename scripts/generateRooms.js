const fs = require('fs');
const path = require('path');

// 1. Generate 15 rooms for The Villa
const villaRooms = [];
for (let i = 1; i <= 15; i++) {
  const roomNum = (100 + i).toString();
  const floor = i <= 8 ? 1 : 2;
  let category = 'Deluxe Room';
  let rate = 2500;
  let maxOccupancy = 2;
  let amenities = ['Courtyard Garden View', 'King Bed', 'Rain Shower', 'Complimentary Chai'];

  if (i >= 6 && i <= 8) {
    category = 'Super Deluxe Room';
    rate = 3500;
    maxOccupancy = 3;
    amenities = ['Private Balcony', 'Sitting Area', 'LED TV', 'Mini Fridge'];
  } else if (i >= 9 && i <= 12) {
    category = 'Executive Suite';
    rate = 4500;
    maxOccupancy = 4;
    amenities = ['Separate Living Room', 'Bathtub', 'Work Desk', 'Premium Toiletries'];
  } else if (i === 13 || i === 14) {
    category = 'Family Suite';
    rate = 5500;
    maxOccupancy = 6;
    amenities = ['Two Bedrooms', 'Living Lounge', 'Dining Table', 'Mountain View'];
  } else if (i === 15) {
    category = 'Standard Room';
    rate = 1800;
    maxOccupancy = 2;
    amenities = ['Cozy Double Bed', 'Attached Bath', 'Wi-Fi'];
  }

  // Initial Statuses: 4 occupied (101, 102, 109, 113), 1 cleaning (105), 1 maintenance (115), 9 available
  let status = 'available';
  let housekeepingStatus = 'clean';
  let currentGuestName = undefined;
  let currentBookingId = undefined;

  if (i === 1) {
    status = 'occupied';
    currentGuestName = 'Aarav Sharma';
    currentBookingId = 'b-101';
  } else if (i === 2) {
    status = 'occupied';
    currentGuestName = 'Priya Venkatesh';
    currentBookingId = 'b-102';
  } else if (i === 5) {
    status = 'cleaning';
    housekeepingStatus = 'dirty';
  } else if (i === 9) {
    status = 'occupied';
    currentGuestName = 'Rajesh Singhania';
    currentBookingId = 'b-103';
  } else if (i === 13) {
    status = 'occupied';
    currentGuestName = 'Kavita Reddy';
    currentBookingId = 'b-104';
  } else if (i === 15) {
    status = 'maintenance';
    housekeepingStatus = 'dirty';
  }

  villaRooms.push({
    id: `rm-v-${roomNum}`,
    hotelId: 'h-villa',
    roomNumber: roomNum,
    floor,
    category,
    ratePerNight: rate,
    status,
    housekeepingStatus,
    currentGuestName,
    currentBookingId,
    maxOccupancy,
    amenities,
  });
}

// 2. Generate 70 rooms for Navkar Palace
const navkarRooms = [];
const navkarOccupied = [1, 2, 3, 7, 10, 12, 14, 15, 17, 18, 26, 29, 30, 32, 35, 38, 40, 42, 51, 52, 55, 61]; // 22 occupied
const navkarCleaning = [4, 28, 53]; // 3 cleaning
const navkarMaintenance = [70]; // 1 maintenance

for (let i = 1; i <= 70; i++) {
  const roomNum = (100 + i).toString();
  const floor = i <= 25 ? 1 : i <= 50 ? 2 : 3;
  let category = 'Deluxe AC Room';
  let rate = 2800;
  let maxOccupancy = 2;
  let amenities = ['AC', 'Smart TV', 'Tea Maker', 'Attached Bath'];

  if (i >= 16 && i <= 35) {
    category = 'Super Deluxe Room';
    rate = 3800;
    maxOccupancy = 3;
    amenities = ['Spacious Balcony', 'Split AC', 'Sofa Seating', 'Mini Bar'];
  } else if (i >= 36 && i <= 60) {
    category = 'Palace Suite';
    rate = 5000;
    maxOccupancy = 4;
    amenities = ['Heritage Interiors', 'Royal Diwan', 'Soaking Tub', 'Garden View'];
  } else if (i >= 61 && i <= 66) {
    category = 'Royal Family Villa';
    rate = 6500;
    maxOccupancy = 6;
    amenities = ['Independent Villa', 'Private Lawn', 'Butler Service', 'Dining Area'];
  } else if (i >= 67 && i <= 70) {
    category = 'Standard Non-AC Room';
    rate = 1600;
    maxOccupancy = 2;
    amenities = ['Ceiling Fan', 'Double Bed', 'Attached Bath', 'Wi-Fi'];
  }

  let status = 'available';
  let housekeepingStatus = 'clean';
  let currentGuestName = undefined;
  let currentBookingId = undefined;

  if (navkarOccupied.includes(i)) {
    status = 'occupied';
    currentGuestName = `Guest Room ${roomNum}`;
    currentBookingId = `b-occ-${roomNum}`;
    if (i === 1) { currentGuestName = 'Siddharth Malhotra'; currentBookingId = 'b-201'; }
    if (i === 12) { currentGuestName = 'Manish Sisodia'; currentBookingId = 'b-207'; }
    if (i === 42) { currentGuestName = 'Rekha Chawla'; currentBookingId = 'b-208'; }
  } else if (navkarCleaning.includes(i)) {
    status = 'cleaning';
    housekeepingStatus = 'dirty';
  } else if (navkarMaintenance.includes(i)) {
    status = 'maintenance';
    housekeepingStatus = 'dirty';
  }

  navkarRooms.push({
    id: `rm-n-${roomNum}`,
    hotelId: 'h-navkar',
    roomNumber: roomNum,
    floor,
    category,
    ratePerNight: rate,
    status,
    housekeepingStatus,
    currentGuestName,
    currentBookingId,
    maxOccupancy,
    amenities,
  });
}

console.log(`Generated ${villaRooms.length} rooms for The Villa.`);
console.log(`Generated ${navkarRooms.length} rooms for Navkar Palace.`);

module.exports = { villaRooms, navkarRooms };
