import PocketBase from 'pocketbase';

const PB_HOST = 'https://www.jaibhavanicargo.com/hcgi/platform';
const EMAIL = 'munnarathod222@gmail.com';
const PASSWORD = 'Munnarathod@25';

async function main() {
  const pb = new PocketBase(PB_HOST);
  pb.autoCancellation(false);

  console.log('=== Testing User Token Access ===\n');

  // 1. Authenticate as regular user (users collection)
  console.log(`Logging in via 'users' collection as ${EMAIL}...`);
  try {
    const authData = await pb.collection('users').authWithPassword(EMAIL, PASSWORD);
    console.log('✅ Logged in successfully!');
    console.log('User ID:', authData.record.id);
    console.log('User Role:', authData.record.role);
    console.log('Token:', pb.authStore.token.substring(0, 30) + '...\n');
  } catch (err) {
    console.error('❌ User login failed:', err.message);
    return;
  }

  // 2. Test getList on key collections as regular user
  const collections = [
    'expenses',
    'trip_logs',
    'attendance',
    'cashbook',
    'payment_requests',
    'advances',
    'contacts',
    'reminders',
    'trucks',
    'employees',
    'routes',
    'credit_cards'
  ];

  console.log('--- Checking record visibility with USER token ---');
  let totalVisible = 0;

  for (const col of collections) {
    try {
      const list = await pb.collection(col).getList(1, 1, { $autoCancel: false });
      console.log(`  ${col.padEnd(20)}: ${list.totalItems} records visible (status 200)`);
      totalVisible += list.totalItems;
    } catch (err) {
      console.log(`  ❌ ${col.padEnd(20)}: FAILED - ${err.message} (status ${err.status})`);
    }
  }

  console.log(`\nTotal items visible to user token: ${totalVisible}`);
}

main().catch(console.error);
