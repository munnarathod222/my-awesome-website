/**
 * High-Precision Indian Visiting & Business Card Parser
 * Extracts Company Name, Contact Person, Designation, Phones, Email,
 * Website, GSTIN, Address, Services Notes, and Contact Category from raw OCR text.
 */

const COMMON_DESIGNATIONS = [
  'Proprietor', 'Prop.', 'Prop', 'Managing Director', 'MD', 'Director',
  'Partner', 'Owner', 'Fleet Manager', 'Transport Manager', 'Branch Manager',
  'Sales Manager', 'General Manager', 'Manager', 'Supervisor', 'CEO',
  'Founder', 'Co-Founder', 'President', 'Secretary', 'Treasurer',
  'Mechanic', 'Senior Mechanic', 'Electrician', 'Technician', 'Agent',
  'RTO Agent', 'DSA', 'Loan Advisor', 'Bank Manager', 'Driver'
];

const KNOWN_INDIAN_CITIES = [
  'Hyderabad', 'Secunderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Mahabubnagar',
  'Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada',
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Aurangabad', 'Solapur', 'Kolhapur', 'Navi Mumbai',
  'Bengaluru', 'Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga',
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli',
  'Delhi', 'New Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Ghaziabad', 'Faridabad',
  'Kolkata', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Jaipur', 'Jodhpur', 'Indore', 'Bhopal',
  'Lucknow', 'Kanpur', 'Patna', 'Ranchi', 'Bhubaneswar', 'Raipur', 'Chandigarh', 'Ludhiana', 'Amritsar'
];

export function parseVisitingCardText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return getEmptyCardResult();
  }

  const clean = rawText.replace(/\r\n/g, '\n').replace(/\t/g, ' ');
  const lines = clean.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 1);

  const result = getEmptyCardResult();

  // ── 1. PHONE NUMBERS (Mobile & Landline) ──────────────────────────────────
  const mobileRegex = /(?:(?:\+91|91|0)[\s-]?)?([6-9]\d{4}[\s-]?[0-9]{5})\b/g;
  const rawPhones = [];
  let match;
  while ((match = mobileRegex.exec(clean)) !== null) {
    const num = match[1].replace(/[\s-]/g, '');
    if (num.length === 10 && !rawPhones.includes(num)) {
      rawPhones.push(num);
    }
  }

  if (rawPhones.length === 0) {
    const broadDigits = clean.match(/\b[6-9]\d{9}\b/g) || [];
    broadDigits.forEach(d => {
      if (!rawPhones.includes(d)) rawPhones.push(d);
    });
  }

  if (rawPhones.length > 0) {
    result.phone_number = '+91 ' + rawPhones[0];
    if (rawPhones.length > 1) {
      result.alternate_phone = '+91 ' + rawPhones[1];
    }
  }

  // ── 2. EMAIL ADDRESS ─────────────────────────────────────────────────────
  const emailMatch = clean.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // ── 3. WEBSITE ───────────────────────────────────────────────────────────
  const webMatch = clean.match(/\b(?:https?:\/\/|www\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i);
  if (webMatch) {
    let url = webMatch[0].toLowerCase();
    if (!url.startsWith('http')) url = 'https://' + url;
    result.website = url;
  }

  // ── 4. GSTIN (15-character Indian Tax ID) ────────────────────────────────
  const gstinMatch = clean.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/);
  if (gstinMatch) {
    result.gstin = gstinMatch[0].toUpperCase();
  }

  // ── 5. DESIGNATION / ROLE ────────────────────────────────────────────────
  for (const des of COMMON_DESIGNATIONS) {
    const desRegex = new RegExp('\\b' + des + '\\b', 'i');
    const matchedLine = lines.find(l => desRegex.test(l));
    if (matchedLine) {
      result.designation = des;
      const stripped = matchedLine.replace(desRegex, '').replace(/[:,-]/g, '').trim();
      if (stripped.length >= 3 && !result.contact_person && !hasCompanySuffix(stripped)) {
        result.contact_person = stripped;
      }
      break;
    }
  }

  // ── 6. CONTACT PERSON NAME ───────────────────────────────────────────────
  if (!result.contact_person) {
    const personPrefixMatch = clean.match(/(?:Prop\.?|Proprietor|Contact|Name|Mr\.?|Shri|Dr\.?)[:\s]+([A-Za-z.\s]{3,35})/i);
    if (personPrefixMatch && personPrefixMatch[1]) {
      const candidate = personPrefixMatch[1].trim().split('\n')[0];
      if (!hasCompanySuffix(candidate) && candidate.length > 2) {
        result.contact_person = candidate;
      }
    }
  }

  // ── 7. COMPANY / FIRM NAME ───────────────────────────────────────────────
  const companySuffixRegex = /(?:Pvt\.?\s*Ltd\.?|Private\s*Limited|Limited|LLP|Logistics|Transports?|Cargo|Carriers?|Roadways|Automobiles?|Motors?|Showroom|Spares?|Workshop|Garage|Enterprises|Agency|Industries|Services|Trading|Corporation|Solutions|Hub|Centre|Center)\b/i;
  
  let companyCandidate = lines.find(l => companySuffixRegex.test(l) && !l.includes('@') && !l.includes('http'));

  if (!companyCandidate) {
    companyCandidate = lines.find(l => {
      if (l.includes('@') || l.includes('http') || /\d{5}/.test(l)) return false;
      if (result.contact_person && l.toLowerCase().includes(result.contact_person.toLowerCase())) return false;
      if (result.designation && l.toLowerCase().includes(result.designation.toLowerCase())) return false;
      return l.length >= 3;
    });
  }

  if (companyCandidate) {
    result.company_name = companyCandidate.replace(/^[:\s-]+/, '').trim();
  }

  if (!result.contact_person) {
    const personCandidate = lines.find(l => {
      if (l === result.company_name) return false;
      if (l.includes('@') || l.includes('http') || /\d{4}/.test(l)) return false;
      if (hasCompanySuffix(l)) return false;
      const words = l.split(/\s+/);
      return words.length >= 1 && words.length <= 4 && /^[A-Z]/.test(l);
    });
    if (personCandidate) {
      result.contact_person = personCandidate;
    }
  }

  // ── 8. PHYSICAL ADDRESS & PIN CODE ───────────────────────────────────────
  const pinMatch = clean.match(/\b([1-9][0-9]{5})\b/);
  const cityMatch = lines.find(l => KNOWN_INDIAN_CITIES.some(city => new RegExp('\\b' + city + '\\b', 'i').test(l)));
  const addressLines = lines.filter(l => {
    if (l === result.company_name || l === result.contact_person) return false;
    if (l.includes('@') || l.includes('http')) return false;
    if (/(?:Plot|Shop|H\.No|Door|Road|Street|Nagar|Colony|Lane|Complex|Bhavan|Tower|Opp|Near|Behind|Beside|Highway|Circle|Cross|Main Road)/i.test(l)) return true;
    if (pinMatch && l.includes(pinMatch[1])) return true;
    return false;
  });

  if (addressLines.length > 0) {
    result.physical_address = addressLines.join(', ');
  } else if (cityMatch) {
    result.physical_address = cityMatch;
  }

  // ── 9. CATEGORY AUTO-CLASSIFICATION ──────────────────────────────────────
  const fullContent = clean.toLowerCase();

  if (/(?:logistics|transport|cargo|carrier|roadway|fleet|lorry|truck|trailer|container|odc|all india permit)/i.test(fullContent)) {
    result.contact_type = 'Truck Owner';
  } else if (/(?:mechanic|garage|workshop|automobile|service centre|repair)/i.test(fullContent)) {
    result.contact_type = 'Mechanic';
  } else if (/(?:spare parts|spares|auto parts|bearings|filters|lubricants|oil)/i.test(fullContent)) {
    result.contact_type = 'Spare Parts';
  } else if (/(?:showroom|dealership|tata motors|ashok leyland|eicher|bharatbenz|mahindra)/i.test(fullContent)) {
    result.contact_type = 'Showroom';
  } else if (/(?:electrician|battery|batteries|wiring|starter|alternator)/i.test(fullContent)) {
    result.contact_type = 'Electrician';
  } else if (/(?:puncture|tyre|tyres|vulcanizing|alignment|mrf|apollo|ceat|jk tyre)/i.test(fullContent)) {
    result.contact_type = 'Puncture Shop';
  } else if (/(?:bodywork|welding|fabrication|tinkering|cabin|chassis)/i.test(fullContent)) {
    result.contact_type = 'Bodywork / Welding';
  } else if (/(?:crane|towing|tow truck|recovery)/i.test(fullContent)) {
    result.contact_type = 'Crane / Tow Truck';
  } else if (/(?:hydraulics|hydraulic|tipper|jack)/i.test(fullContent)) {
    result.contact_type = 'Hydraulics';
  } else if (/(?:washing|wash centre|water service)/i.test(fullContent)) {
    result.contact_type = 'Washing Centre';
  } else if (/(?:rto|agent|fitness|permit|tax|registration|pollution)/i.test(fullContent)) {
    result.contact_type = 'RTO Agent';
  } else if (/(?:bank|finance|loan|dsa|credit|capital)/i.test(fullContent)) {
    result.contact_type = 'Banking';
  } else if (/(?:warehouse|godown|cold storage|depot|c&f)/i.test(fullContent)) {
    result.contact_type = 'Warehouse';
  } else if (/(?:pvt ltd|private limited|limited|industries|corp|corporation|exports|imports|distributor)/i.test(fullContent)) {
    result.contact_type = 'Corporate';
  } else {
    result.contact_type = 'Client';
  }

  // ── 10. SERVICES / TAGLINE / NOTES ───────────────────────────────────────
  const serviceLines = lines.filter(l => {
    if (l === result.company_name || l === result.contact_person || l === result.physical_address) return false;
    if (l.includes('@') || l.includes('http') || (result.gstin && l.includes(result.gstin))) return false;
    return l.length > 5;
  });

  if (serviceLines.length > 0) {
    result.notes = serviceLines.slice(0, 3).join(' • ');
  }

  if (!result.company_name && result.contact_person) {
    result.company_name = result.contact_person + "'s Firm";
  } else if (!result.company_name && result.phone_number) {
    result.company_name = 'Contact (' + result.phone_number + ')';
  }

  return result;
}

function hasCompanySuffix(text) {
  return /(?:Pvt|Ltd|Limited|Logistics|Transports?|Cargo|Carriers?|Motors|Spares|Enterprises|Agency|Industries|Workshop|Services)\b/i.test(text);
}

function getEmptyCardResult() {
  return {
    company_name: '',
    contact_person: '',
    designation: '',
    contact_type: 'Client',
    phone_number: '',
    alternate_phone: '',
    email: '',
    website: '',
    gstin: '',
    physical_address: '',
    notes: ''
  };
}
