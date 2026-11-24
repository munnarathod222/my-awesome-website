/**
 * Courier partner live tracking URL resolver & deep-link helper
 */

export function getCourierTrackingUrl(courierName, trackingNo) {
  if (!trackingNo) return null;
  const name = (courierName || '').toLowerCase().trim();
  const cleanNo = encodeURIComponent(String(trackingNo).trim());

  if (name.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp?booking_no=${cleanNo}`;
  }
  if (name.includes('trackon')) {
    return `https://trackon.in/tracking?awb=${cleanNo}`;
  }
  if (name.includes('bluedart') || name.includes('blue dart')) {
    return `https://www.bluedart.com/tracking?trackNumber=${cleanNo}`;
  }
  if (name.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${cleanNo}`;
  }
  if (name.includes('speed post') || name.includes('india post') || name.includes('post')) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`;
  }
  if (name.includes('professional')) {
    return `https://www.tpcindia.com/`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent((courierName || 'Courier') + ' tracking ' + trackingNo)}`;
}

export function formatCourierName(courierName) {
  if (!courierName) return 'Courier Partner';
  const name = courierName.trim();
  if (/dtdc/i.test(name)) return 'DTDC Express';
  if (/trackon/i.test(name)) return 'Trackon Couriers';
  if (/bluedart/i.test(name)) return 'BlueDart';
  if (/delhivery/i.test(name)) return 'Delhivery Express';
  if (/speed post/i.test(name)) return 'India Post Speed Post';
  if (/professional/i.test(name)) return 'The Professional Couriers';
  return name;
}
