import pb from './src/utils/pocketbaseClient.js';

async function run() {
  try {
    const list = await pb.collection('advances').getFullList();
    console.log("Raw advances records from PocketBase client:");
    list.forEach(item => {
      console.log(item.id, typeof item.employee_id, item.employee_id, item.userId);
    });
  } catch (err) {
    console.error(err);
  }
}

run();
