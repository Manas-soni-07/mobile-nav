require('dotenv').config();

async function main() {
  const API_BASE = 'http://192.168.0.104:5000/api';
  console.log('Connecting to Mobile API Backend at:', API_BASE);

  // 1. Mobile App Login Flow
  console.log('\n--- Step 1: Mobile App Authentication ---');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@resortos.com',
      password: 'Password123!',
      role: 'ADMIN',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error('Mobile login failed: ' + JSON.stringify(loginData));
  }
  console.log('Authenticated as:', loginData.user.fullName, `(${loginData.user.role})`);
  const token = loginData.token;

  // 2. Mobile App Expense Creation Flow (Exact parameters from DailyExpensesScreen)
  console.log('\n--- Step 2: Creating Test Expense via Mobile App API ---');
  const expensePayload = {
    hotelId: 'h-villa',
    hotelName: 'THE VILLA',
    title: '[TEST-AUDIT] Front Desk Stationery Pack',
    category: 'Supplies',
    amount: 250,
    paymentMethod: 'UPI',
    vendor: 'Jaipur Stationery Mart',
    recordedBy: `${loginData.user.fullName} (${loginData.user.role})`,
    description: 'Verification of mobile app to TiDB Cloud persistence.',
  };

  const createRes = await fetch(`${API_BASE}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-user-role': 'ADMIN',
      'x-user-hotel-id': 'h-villa',
    },
    body: JSON.stringify(expensePayload),
  });

  const createData = await createRes.json();
  console.log('Create Response Status:', createRes.status);
  console.log('Create Response Body:', JSON.stringify(createData, null, 2));

  if (!createRes.ok || !createData.success || !createData.id) {
    throw new Error('Expense creation failed: ' + JSON.stringify(createData));
  }

  const insertedId = createData.id;
  console.log('\n✅ Successfully created record via Mobile App API!');
  console.log('Inserted Database ID:', insertedId);

  // 3. Verify via App Re-fetch (Simulating App Restart)
  console.log('\n--- Step 3: Simulating App Restart (Re-fetching from TiDB Cloud) ---');
  const listRes = await fetch(`${API_BASE}/expenses?hotelId=h-villa`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-user-role': 'ADMIN',
    },
  });
  const listData = await listRes.json();
  const foundInAppList = listData.find((item) => item.id === insertedId || item.title === expensePayload.title);

  if (foundInAppList) {
    console.log('✅ Confirmed: Record preserved on app re-fetch!');
    console.log('Fetched Record in App:', JSON.stringify(foundInAppList, null, 2));
  } else {
    console.error('❌ Record not found in app expenses list');
  }
}

main().catch((err) => {
  console.error('Execution Error:', err);
  process.exit(1);
});
