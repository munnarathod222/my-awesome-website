import PocketBase from 'pocketbase';
import fs from 'node:fs';
import path from 'node:path';

const pb = new PocketBase('http://localhost:8090');

async function test() {
  const tempPdfPath = path.resolve('scratch/temp_test_doc.pdf');
  try {
    // 1. Authenticate as superuser
    console.log("Authenticating as superuser...");
    await pb.collection('_superusers').authWithPassword('munnarathod222@gmail.com', 'admin123456');

    // 2. Create a dummy PDF file for testing
    console.log("Creating dummy PDF file...");
    if (!fs.existsSync('scratch')) {
      fs.mkdirSync('scratch');
    }
    fs.writeFileSync(tempPdfPath, '%PDF-1.4 ... dummy pdf content ...');

    // 3. Find or create a loan profile
    let profile;
    const profiles = await pb.collection('loan_profiles').getFullList({ limit: 1 });
    
    if (profiles.length > 0) {
      profile = profiles[0];
      console.log(`Found existing loan profile: ID=${profile.id}, Name=${profile.profileName}`);
    } else {
      console.log("No profiles found. Creating a test loan profile...");
      profile = await pb.collection('loan_profiles').create({
        profileName: "Test Auto Loan",
        loanAmount: 1200000,
        interestRate: 8.5,
        loanTerm: 36,
        userId: "vomu7tmaa889wv8", // admin user ID
        isDefault: true,
        bank_name: "ICICI Bank"
      });
      console.log(`Created test profile: ID=${profile.id}`);
    }

    // 4. Upload the PDF file
    console.log(`Uploading PDF document to profile ID=${profile.id}...`);
    const fileBuffer = fs.readFileSync(tempPdfPath);
    const fileBlob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('loan_document', fileBlob, 'temp_test_doc.pdf');

    const updatedProfile = await pb.collection('loan_profiles').update(profile.id, formData);
    console.log("Upload response record:", JSON.stringify(updatedProfile, null, 2));

    // 5. Verify
    if (updatedProfile.loan_document) {
      const fileUrl = pb.files.getUrl(updatedProfile, updatedProfile.loan_document);
      console.log(`\nSUCCESS: PDF document uploaded successfully!`);
      console.log(`Document Field: ${updatedProfile.loan_document}`);
      console.log(`File URL: ${fileUrl}`);
    } else {
      throw new Error("File field 'loan_document' is empty after upload!");
    }

    // 6. Clean up: remove the document
    console.log("\nRemoving document from profile...");
    const clearedProfile = await pb.collection('loan_profiles').update(profile.id, {
      loan_document: null
    });
    console.log("Clear response record 'loan_document':", clearedProfile.loan_document);

    if (!clearedProfile.loan_document) {
      console.log("SUCCESS: Document cleared successfully from record.");
    } else {
      console.log("WARNING: Document could not be cleared.");
    }

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    // Delete temp file
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
      console.log("Deleted temporary test PDF file.");
    }
  }
}

test();
