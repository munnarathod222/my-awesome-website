import pb from './pocketbaseClient.js';

/**
 * Calculates vehicle compliance score (0-100%) and document statuses
 */
export function calculateVehicleCompliance(truck = {}, documents = []) {
  const today = new Date();

  const docTypes = [
    { key: 'rc', label: 'Registration Certificate (RC)', weight: 20 },
    { key: 'insurance', label: 'Insurance Policy', weight: 20 },
    { key: 'fitness', label: 'Fitness Certificate', weight: 15 },
    { key: 'permit', label: 'National / State Permit', weight: 15 },
    { key: 'puc', label: 'Pollution Under Control (PUC)', weight: 10 },
    { key: 'road_tax', label: 'Road Tax Receipt', weight: 10 },
    { key: 'fastag', label: 'FASTag Active Status', weight: 10 },
  ];

  const docsMap = {};
  
  // Find matching document records for each type
  docTypes.forEach(typeObj => {
    let docRecord = documents.find(d => 
      (d.truck_number === truck.truck_number || d.truck_id === truck.id) && 
      (d.document_type?.toLowerCase().includes(typeObj.key) || d.notes?.toLowerCase().includes(typeObj.key))
    );

    // Also fallback to truck object properties if document collection record not found
    let expiryDateStr = docRecord?.expiry_date || docRecord?.valid_till;
    let docNumber = docRecord?.document_number || docRecord?.doc_no || 'N/A';
    let fileUrl = docRecord ? pb.files.getURL(docRecord, docRecord.file) : '';

    if (!expiryDateStr) {
      if (typeObj.key === 'insurance' && truck.insurance_expiry) expiryDateStr = truck.insurance_expiry;
      if (typeObj.key === 'fitness' && truck.fitness_expiry) expiryDateStr = truck.fitness_expiry;
      if (typeObj.key === 'permit' && truck.permit_expiry) expiryDateStr = truck.permit_expiry;
      if (typeObj.key === 'puc' && truck.puc_expiry) expiryDateStr = truck.puc_expiry;
      if (typeObj.key === 'rc' && truck.rc_expiry) expiryDateStr = truck.rc_expiry;
      if (typeObj.key === 'road_tax' && truck.road_tax_expiry) expiryDateStr = truck.road_tax_expiry;
    }

    let status = 'MISSING';
    let statusText = 'Not Uploaded';
    let colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    let daysRemaining = null;

    if (expiryDateStr || typeObj.key === 'fastag') {
      if (typeObj.key === 'fastag') {
        const isFastagActive = truck.fastag_status !== 'Disabled' && truck.fastag_status !== 'Blocked';
        status = isFastagActive ? 'VALID' : 'EXPIRED';
        statusText = isFastagActive ? 'Active & Linked' : 'Inactive / Low Balance';
        colorClass = isFastagActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      } else if (expiryDateStr) {
        const expDate = new Date(expiryDateStr);
        const diffMs = expDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysRemaining > 30) {
          status = 'VALID';
          statusText = `Valid (${daysRemaining} days left)`;
          colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        } else if (daysRemaining >= 0) {
          status = 'EXPIRING';
          statusText = `Expiring Soon (${daysRemaining} days left)`;
          colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        } else {
          status = 'EXPIRED';
          statusText = `Expired (${Math.abs(daysRemaining)} days ago)`;
          colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        }
      }
    }

    docsMap[typeObj.key] = {
      label: typeObj.label,
      weight: typeObj.weight,
      status,
      statusText,
      colorClass,
      docNumber,
      expiryDate: expiryDateStr || 'N/A',
      daysRemaining,
      fileUrl
    };
  });

  // Compute Overall Score (0-100%)
  let totalScore = 0;
  docTypes.forEach(t => {
    const item = docsMap[t.key];
    if (item.status === 'VALID') totalScore += t.weight;
    else if (item.status === 'EXPIRING') totalScore += t.weight * 0.7; // partial score for expiring
  });

  const overallScore = Math.min(100, Math.round(totalScore));

  let complianceRating = 'CRITICAL';
  let complianceColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  let complianceBanner = '🔴 NON-COMPLIANT VEHICLE';

  if (overallScore >= 85) {
    complianceRating = 'EXCELLENT';
    complianceColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    complianceBanner = '🟢 VERIFIED COMPLIANT VEHICLE';
  } else if (overallScore >= 60) {
    complianceRating = 'MODERATE';
    complianceColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    complianceBanner = '🟡 PARTIALLY COMPLIANT (DOCUMENTS EXPIRING)';
  }

  return {
    docsMap,
    overallScore,
    complianceRating,
    complianceColor,
    complianceBanner
  };
}

/**
 * Utility to partially mask sensitive numbers (DL, Chassis, Engine)
 */
export function maskSensitive(str = '', visibleCount = 4) {
  if (!str || str.length <= visibleCount) return str || 'N/A';
  const visible = str.slice(-visibleCount);
  const masked = '*'.repeat(Math.max(4, str.length - visibleCount));
  return `${masked}${visible}`;
}

/**
 * Log scan event
 */
export async function logVehicleScanEvent(qrToken, truckNumber, purpose = 'Roadside Inspection') {
  try {
    let deviceType = 'Mobile Browser';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) deviceType = 'iOS Mobile';
    else if (/Android/.test(ua)) deviceType = 'Android Mobile';
    else if (/Windows|Macintosh|Linux/.test(ua)) deviceType = 'Desktop PC';

    let lat = 0;
    let lng = 0;

    // Optional GPS Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          pb.collection('vehicle_scan_logs').create({
            qr_token: qrToken,
            truck_number: truckNumber,
            device_type: deviceType,
            user_agent: ua.substring(0, 200),
            location_lat: lat,
            location_lng: lng,
            purpose
          }, { $autoCancel: false }).catch(() => {});
        },
        () => {
          // Location permission denied, log without coordinates
          pb.collection('vehicle_scan_logs').create({
            qr_token: qrToken,
            truck_number: truckNumber,
            device_type: deviceType,
            user_agent: ua.substring(0, 200),
            purpose
          }, { $autoCancel: false }).catch(() => {});
        },
        { timeout: 3000 }
      );
    } else {
      pb.collection('vehicle_scan_logs').create({
        qr_token: qrToken,
        truck_number: truckNumber,
        device_type: deviceType,
        user_agent: ua.substring(0, 200),
        purpose
      }, { $autoCancel: false }).catch(() => {});
    }
  } catch (e) {
    console.error('Failed to log scan:', e);
  }
}
