──────────────────────────────────────────────────────────
// RECRUITMENT & PUBLIC DRIVER APPLICATION ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const RECRUITMENT_FILE_PATH = path.join(process.cwd(), 'driver_applications_store.json');

function getStoredApplications() {
  try {
    if (fs.existsSync(RECRUITMENT_FILE_PATH)) {
      const raw = fs.readFileSync(RECRUITMENT_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    logger.warn('Error reading driver_applications_store.json:', e.message);
  }
  return [];
}

function saveStoredApplications(list) {
  try {
    if (!Array.isArray(list)) return;
    fs.writeFileSync(RECRUITMENT_FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
    if (typeof global.uploadRecruitmentStoreToSupabase === 'function' && list.length > 0) {
      global.uploadRecruitmentStoreToSupabase().catch(() => {});
    }
  } catch (e) {
    logger.error('Failed to write driver_applications_store.json:', e.message);
  }
}

/**
 * GET /api/driver/applications
 * Returns all submitted applications (merged from disk store, PocketBase DB & Cloud Backup)
 */
router.get('/applications', async (req, res) => {
  try {
    let diskStore = getStoredApplications();

    // If disk store is empty, attempt to download cloud backup immediately
    if (diskStore.length === 0 && typeof global.uploadRecruitmentStoreToSupabase === 'function') {
      try {
        const { downloadRecruitmentStoreFromSupabase } = await import('../main.js').catch(() => ({}));
      } catch (e) {}
      diskStore = getStoredApplications();
    }

    const pbList = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    const mergedMap = new Map();
    diskStore.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });
    pbList.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });

    const allApps = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.applied_date || b.created || 0) - new Date(a.applied_date || a.created || 0);
    });

    // Auto-update disk store & cloud backup if merged list has new records
    if (allApps.length > diskStore.length) {
      saveStoredApplications(allApps);
    }

    return res.json({ success: true, applications: allApps });
  } catch (err) {
    logger.error('Error fetching driver applications:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

const uploadRecruitmentDocs = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 20 * 1024 * 1024 } 
}).fields([
  { name: 'license_front', maxCount: 1 },
  { name: 'license_back', maxCount: 1 },
  { name: 'license_file', maxCount: 1 },
  { name: 'aadhaar_front', maxCount: 1 },
  { name: 'aadhaar_back', maxCount: 1 },
  { name: 'aadhaar_file', maxCount: 1 },
  { name: 'photo_file', maxCount: 1 },
  { name: 'pan_file', maxCount: 1 }
]);

/**
 * POST /api/driver/apply
 * Public endpoint for driver/staff job applications submitted from website.
 * Saves to server disk store AND PocketBase DB.
 */
router.post('/apply', uploadRecruitmentDocs, async (req, res) => {
  try {
    const data = req.body || {};
    const appliedDate = new Date().toISOString();

    const newRecord = {
      id: `app-${Date.now()}`,
      applicant_role: data.applicant_role || 'Driver',
      full_name: data.full_name || '',
      phone: data.phone || '',
      email: data.email || '',
      dob: data.dob || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      aadhaar_number: data.aadhaar_number || '',
      pan_number: data.pan_number || '',
      qualification: data.qualification || '',
      license_number: data.license_number || '',
      license_type: data.license_type || '',
      license_expiry: data.license_expiry || '',
      experience_years: data.experience_years || '',
      vehicle_types: data.vehicle_types || '',
      skills: data.skills || '',
      languages_spoken: data.languages_spoken || '',
      drinks_alcohol: data.drinks_alcohol || 'No - Non-Drinker (Teetotaler)',
      previous_employer: data.previous_employer || '',
      previous_designation: data.previous_designation || '',
      reference1_name: data.reference1_name || '',
      reference1_phone: data.reference1_phone || '',
      reference1_relation: data.reference1_relation || '',
      reference2_name: data.reference2_name || '',
      reference2_phone: data.reference2_phone || '',
      reference2_relation: data.reference2_relation || '',
      license_front: data.license_front || data.license_file || '',
      license_back: data.license_back || '',
      aadhaar_front: data.aadhaar_front || data.aadhaar_file || '',
      aadhaar_back: data.aadhaar_back || '',
      photo_file: data.photo_file || '',
      pan_file: data.pan_file || '',
      test_drive_ready: data.test_drive_ready || 'Yes - Ready for Practical Driving Test',
      test_drive_vehicle_pref: data.test_drive_vehicle_pref || '32ft Multi-Axle Container (MXL)',
      test_drive_preferred_date: data.test_drive_preferred_date || 'Immediate',
      test_drive_yard: data.test_drive_yard || 'Hyderabad Hub (Ghatkesar Yard)',
      test_drive_transmission: data.test_drive_transmission || 'Manual Transmission',
      test_drive_status: data.test_drive_status || 'Pending Assessment',
      test_drive_score: data.test_drive_score || '',
      test_drive_result: data.test_drive_result || '',
      test_drive_notes: data.test_drive_notes || '',
      status: 'Applied',
      applied_date: appliedDate,
      created: appliedDate,
    };

    // Convert uploaded files to base64 Data URLs for 100% reliable preview & download
    if (req.files) {
      const getFileBase64 = (fileArr) => {
        if (!fileArr?.[0]) return null;
        const file = fileArr[0];
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      };

      const licFront = getFileBase64(req.files.license_front) || getFileBase64(req.files.license_file);
      if (licFront) newRecord.license_front = licFront;

      const licBack = getFileBase64(req.files.license_back);
      if (licBack) newRecord.license_back = licBack;

      const aadhFront = getFileBase64(req.files.aadhaar_front) || getFileBase64(req.files.aadhaar_file);
      if (aadhFront) newRecord.aadhaar_front = aadhFront;

      const aadhBack = getFileBase64(req.files.aadhaar_back);
      if (aadhBack) newRecord.aadhaar_back = aadhBack;

      const photo = getFileBase64(req.files.photo_file);
      if (photo) newRecord.photo_file = photo;

      const pan = getFileBase64(req.files.pan_file);
      if (pan) newRecord.pan_file = pan;
    }

    // 1. Save to disk file store immediately
    const diskStore = getStoredApplications();
    saveStoredApplications([newRecord, ...diskStore.filter(r => r.id !== newRecord.id)]);

    // 2. Try PocketBase create in background
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') formData.append(k, String(v));
      });
      formData.append('status', 'Applied');
      formData.append('applied_date', appliedDate);

      if (req.files) {
        if (req.files.license_file?.[0]) {
          const file = req.files.license_file[0];
          formData.append('license_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
        if (req.files.photo_file?.[0]) {
          const file = req.files.photo_file[0];
          formData.append('photo_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
        if (req.files.pan_file?.[0]) {
          const file = req.files.pan_file[0];
          formData.append('pan_file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }
      }

      await pb.collection('driver_applications').create(formData, { $autoCancel: false });
    } catch (pbErr) {
      logger.warn('PocketBase create warning (saved to disk fallback):', pbErr.message);
    }

    logger.info(`📥 New Job Application Received & Saved: ${newRecord.full_name} (${newRecord.phone}) - Role: ${newRecord.applicant_role}`);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application: newRecord
    });
  } catch (err) {
    logger.error('Error in /api/driver/apply:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to submit application' });
  }
});

/**
 * GET /api/driver/applications
 * Returns all driver & staff recruitment applications for the admin portal.
 */
router.get('/applications', async (req, res) => {
  try {
    const diskStore = getStoredApplications();
    const pbList = await pb.collection('driver_applications').getFullList({
      sort: '-created',
      $autoCancel: false
    }).catch(() => []);

    const mergedMap = new Map();
    diskStore.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });
    pbList.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });

    const allApps = Array.from(mergedMap.values()).sort((a, b) => {
      return new Date(b.applied_date || b.created || 0) - new Date(a.applied_date || a.created || 0);
    });

    return res.json({ success: true, applications: allApps });
  } catch (err) {
    logger.error('Error fetching driver applications:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

/**
 * PATCH /api/driver/applications/:id
 * Updates application status, notes, or test drive assessment details.
 */
router.patch('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    const diskStore = getStoredApplications();
    const updatedStore = diskStore.map(r => r.id === id ? { ...r, ...updates } : r);
    saveStoredApplications(updatedStore);

    try {
      await pb.collection('driver_applications').update(id, updates, { $autoCancel: false });
    } catch (e) {}

    return res.json({ success: true, message: 'Updated application details', application: updatedStore.find(r => r.id === id) });
  } catch (err) {
    logger.error(`Error updating driver application ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: 'Failed to update application' });
  }
});

/**
 * POST /api/driver/applications/:id/hire
 * Hires a candidate, creating an employee record and copying any uploaded documents.
 */
router.post('/applications/:id/hire', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the driver application
    const pbApp = await pb.collection('driver_applications').getOne(id, { $autoCancel: false }).catch(() => null);
    const diskStore = getStoredApplications();
    const diskApp = diskStore.find(r => r.id === id);
    const application = pbApp || diskApp;

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // 2. Map applicant role to employee type select values: "driver", "supervisor", "manager"
    const applicantRole = (application.applicant_role || 'Driver').toLowerCase();
    let empType = 'driver';
    if (applicantRole.includes('supervisor')) empType = 'supervisor';
    else if (applicantRole.includes('manager')) empType = 'manager';

    // 3. Create the employee record
    const employeePayload = {
      name: application.full_name,
      contact: application.phone,
      address: application.address || `${application.city || ''}, ${application.state || ''}`.trim(),
      license_number: application.license_number || '',
      pan_card: application.pan_number || '',
      employee_type: empType,
      position: application.applicant_role || 'Heavy Driver',
      joining_date: new Date().toISOString().split('T')[0],
      active_status: 'active',
      employment_type: 'Permanent',
      salary_amount: 0,
      base_salary: 0,
      salary_billing_cycle: 'Monthly',
      payroll_cycle_start_day: 1,
      payroll_cycle_end_day: 30,
      salary_disbursement_day: 5,
      // File reference fields
      driver_photo: application.photo_file || '',
      photo: application.photo_file || '',
      license_photo: application.license_file || '',
      pan_photo: application.pan_file || ''
    };

    const newEmp = await pb.collection('employees').create(employeePayload, { $autoCancel: false });

    // 4. Copy physical files if any exist
    if (application.collectionId && newEmp.collectionId) {
      let storageDir = global.storageDir;
      if (!storageDir) {
        const possiblePaths = [
          path.resolve(process.cwd(), 'apps/pocketbase/pb_data/storage'),
          path.resolve(process.cwd(), 'pb_data/storage'),
          '/opt/render/project/src/apps/pocketbase/pb_data/storage'
        ];
        storageDir = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
      }

      const srcDir = path.join(storageDir, application.collectionId, application.id);
      const destDir = path.join(storageDir, newEmp.collectionId, newEmp.id);

      const copyDir = (src, dest) => {
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (let entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      try {
        copyDir(srcDir, destDir);
        logger.info(`✅ Successfully copied recruitment documents for hired employee ${newEmp.id}`);
      } catch (copyErr) {
        logger.error(`⚠️ Failed to copy recruitment files to employee folder: ${copyErr.message}`);
      }
    }

    // 5. Update the application status to 'Selected' if not already
    const updatedStore = diskStore.map(r => r.id === id ? { ...r, status: 'Selected' } : r);
    saveStoredApplications(updatedStore);

    try {
      await pb.collection('driver_applications').update(id, { status: 'Selected' }, { $autoCancel: false });
    } catch (e) {}

    return res.json({ success: true, message: 'Candidate successfully hired as employee', employeeId: newEmp.id });
  } catch (err) {
    logger.error('Error hiring driver candidate:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to hire candidate' });
  }
});

/**
 * DELETE /api/driver/applications/:id
 * Deletes an application record and instantly syncs deletion to cloud backup.
 */
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const diskStore = getStoredApplications();
    const filteredList = diskStore.filter(r => r.id !== id);
    saveStoredApplications(filteredList);

    try {
      await pb.collection('driver_applications').delete(id, { $autoCancel: false });
    } catch (e) {}

    // Instant Cloud Persistence Sync on Deletion
    if (typeof global.uploadRecruitmentStoreToSupabase === 'function') {
      global.uploadRecruitmentStoreToSupabase({ force: true }).catch(() => {});
    }
    if (typeof global.uploadDatabaseToSupabase === 'function' && global.dbFilePath) {
      global.uploadDatabaseToSupabase(global.dbFilePath).catch(() => {});
    }

    logger.info(`🗑️ Deleted application ${id} and synced deletion to cloud backup.`);
    return res.json({ success: true, message: 'Application deleted and cloud sync updated' });
  } catch (err) {
    logger.error(`Error deleting driver application ${req.params.id}:`, err);
    return res.status(500).json({ success: false, error: 'Failed to delete application' });
  }
});

/**
 * POST /api/driver/approve-signup-request
 * Approves a signup request, creates/updates the PocketBase user account with superuser admin privileges,
 * and updates the signup request status.
 */
router.post('/approve-signup-request', async (req, res) => {
  try {
    const { requestId, email, fullName, phone, role, notes, tempPassword, approvedBy } = req.body || {};
    
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanFullName = (fullName || 'User').trim();
    const cleanPhone = (phone || '').trim();
    const assignedRole = (role || 'manager').toLowerCase();
    const password = tempPassword || `Jbc@${Math.random().toString(36).slice(-6)}A1`;

    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Valid email address is required' });
    }

    logger.info(`🔐 [Admin Server] Approving account for ${cleanFullName} (${cleanEmail