import PocketBase from 'pocketbase';

async function main() {
  const pb = new PocketBase('http://127.0.0.1:8090');
  try {
    const collections = await pb.collections.getFullList();
    const contacts = collections.find(c => c.name === 'contacts');
    console.log('CONTACTS SCHEMA:');
    console.log(JSON.stringify(contacts.fields, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
