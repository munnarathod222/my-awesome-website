/**
 * High-Precision vCard (.vcf) Bulk Contact Parser
 * Supports vCard versions 2.1, 3.0, and 4.0.
 * Handles multiline unfolding, Quoted-Printable UTF-8 decoding,
 * multi-contact files, phone normalization, address formatting,
 * and intelligent transport industry categorization.
 */

// Helper to decode Quoted-Printable text
function decodeQuotedPrintable(str, charset = 'UTF-8') {
  if (!str) return '';
  // Remove soft line breaks (=\r\n or =\n)
  const clean = str.replace(/=(?:\r\n|\r|\n)/g, '');
  
  try {
    // Collect bytes and decode with TextDecoder
    const bytes = [];
    for (let i = 0; i < clean.length; i++) {
      if (clean[i] === '=' && i + 2 < clean.length) {
        const hex = clean.substring(i + 1, i + 3);
        if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
          bytes.push(parseInt(hex, 16));
          i += 2;
          continue;
        }
      }
      bytes.push(clean.charCodeAt(i));
    }
    const decoder = new TextDecoder(charset.toLowerCase().includes('utf') ? 'utf-8' : charset);
    return decoder.decode(new Uint8Array(bytes));
  } catch (e) {
    // Fallback simple hex replacement
    return clean.replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
}

// Unfold multiline vCard records (lines starting with space or tab)
function unfoldLines(rawText) {
  const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const unfolded = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0 && /^[ \t]/.test(line)) {
      unfolded[unfolded.length - 1] += line.substring(1);
    } else {
      unfolded.push(line);
    }
  }
  return unfolded;
}

// Normalize phone number for comparison and display
export function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
  
  // Standardize 10-digit Indian numbers with +91
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (/^91[6-9]\d{9}$/.test(cleaned)) {
    const num = cleaned.slice(2);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  } else if (/^0[6-9]\d{9}$/.test(cleaned)) {
    const num = cleaned.slice(1);
    return `+91 ${num.slice(0, 5)} ${num.slice(5)}`;
  }
  
  return rawPhone.trim();
}

// Extract pure 10-digit key for deduplication
export function getPhoneLookupKey(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10); // Last 10 digits
  }
  return digits;
}

// Keyword-based transport categorization
export function autoCategorizeContact(name = '', org = '', title = '', note = '', address = '') {
  const combined = `${name} ${org} ${title} ${note} ${address}`.toLowerCase();

  if (/\b(mechanics?|garages?|workshops?|motor works?|repairs?|service cent(er|re)s?|grease|diesel services?)\b/.test(combined)) {
    return 'Mechanic';
  }
  if (/\b(electricians?|electricals?|batter(y|ies)|wirings?|alternators?|starters?|dynamos?|auto electric)\b/.test(combined)) {
    return 'Electrician';
  }
  if (/\b(punctures?|tyres?|tires?|tubeless|wheels?|alignments?|vulcaniz\w*)\b/.test(combined)) {
    return 'Puncture Shop';
  }
  if (/\b(transport(ers?|s)?|cargo|logistics?|freights?|roadlines?|carriers?|fleets?|truck owners?|lorr(y|ies)|bilty|trailers?)\b/.test(combined)) {
    return 'Transporter';
  }
  if (/\b(showrooms?|tata motors|mahindra|eicher|ashok leyland|bharatbenz|isuzu|dealers?|dealerships?)\b/.test(combined)) {
    return 'Showroom';
  }
  if (/\b(spare parts?|spares?|automobiles?|lubricants?|oil depots?|filters?|springs?|clutch)\b/.test(combined)) {
    return 'Spare Parts';
  }
  if (/\b(weldings?|bodyworks?|body works?|cabins?|chassis|fabricat\w*)\b/.test(combined)) {
    return 'Bodywork / Welding';
  }
  if (/\b(cranes?|tow(ing)?|hydra|recovery trucks?)\b/.test(combined)) {
    return 'Crane / Tow Truck';
  }
  if (/\b(hydraulics?|plastics?|hoses?|pipes?|jacks?)\b/.test(combined)) {
    return 'Hydraulics';
  }
  if (/\b(washings?|water services?|pressure wash)\b/.test(combined)) {
    return 'Washing Centre';
  }
  if (/\b(rto|fitness|permits?|road tax|agents?|registrations?)\b/.test(combined)) {
    return 'RTO Agent';
  }
  if (/\b(warehouses?|godowns?|cold storages?|depots?|c&f|cf agents?|hubs?)\b/.test(combined)) {
    return 'Warehouse';
  }
  if (/\b(drivers?|pilots?|chauffeurs?)\b/.test(combined)) {
    return 'Driver';
  }
  if (/\b(bank(ers?|s)?|loans?|dsa|finances?|branch managers?|credit cards?|emi)\b/.test(combined)) {
    return 'Banking';
  }
  if (/\b(clients?|customers?|pvt ltd|ltd|industries|mills|pharma|exports?|fmcg|steel|cement)\b/.test(combined)) {
    return 'Client';
  }
  if (/\b(vendors?|suppliers?|traders?)\b/.test(combined)) {
    return 'Vendor';
  }

  return 'Other';
}

/**
 * Parses raw vCard string into structured contact items.
 * Handles multiple contacts in a single file.
 */
export function parseVCardContent(vcardText) {
  if (!vcardText || typeof vcardText !== 'string') return [];

  const lines = unfoldLines(vcardText);
  const contacts = [];
  let currentCard = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.toUpperCase() === 'BEGIN:VCARD') {
      currentCard = {
        name: '',
        formattedName: '',
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        phones: [],
        emails: [],
        addresses: [],
        urls: [],
        notes: [],
        categories: []
      };
      continue;
    }

    if (line.toUpperCase() === 'END:VCARD') {
      if (currentCard) {
        contacts.push(formatContactRecord(currentCard));
        currentCard = null;
      }
      continue;
    }

    if (!currentCard) continue;

    // Split property and value
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const propPart = line.substring(0, colonIdx);
    let valPart = line.substring(colonIdx + 1).trim();

    // Remove group prefixes (e.g. item1.TEL -> TEL)
    const cleanProp = propPart.replace(/^item\d+\./i, '');
    const propTokens = cleanProp.split(';');
    const propName = propTokens[0].toUpperCase();
    const propParams = propTokens.slice(1).map(p => p.toUpperCase());

    // Check for QUOTED-PRINTABLE encoding
    const isQuotedPrintable = propParams.some(p => p.includes('ENCODING=QUOTED-PRINTABLE') || p === 'QUOTED-PRINTABLE');
    const charsetParam = propParams.find(p => p.startsWith('CHARSET=')) || 'CHARSET=UTF-8';
    const charset = charsetParam.replace('CHARSET=', '');

    if (isQuotedPrintable) {
      valPart = decodeQuotedPrintable(valPart, charset);
    }

    // Unescape standard vCard escape sequences (\,, \;, \n)
    valPart = valPart.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');

    switch (propName) {
      case 'FN':
        currentCard.formattedName = valPart.trim();
        break;

      case 'N': {
        const parts = valPart.split(';').map(p => p.trim());
        currentCard.lastName = parts[0] || '';
        currentCard.firstName = parts[1] || '';
        currentCard.middleName = parts[2] || '';
        currentCard.prefix = parts[3] || '';
        break;
      }

      case 'ORG': {
        // e.g. "Jai Bhavani Cargo;Transport Division"
        const orgParts = valPart.split(';').map(p => p.trim()).filter(Boolean);
        currentCard.organization = orgParts.join(' - ');
        break;
      }

      case 'TITLE':
      case 'ROLE':
        currentCard.title = valPart.trim();
        break;

      case 'TEL': {
        const cleaned = cleanPhoneNumber(valPart);
        if (cleaned && !currentCard.phones.includes(cleaned)) {
          currentCard.phones.push(cleaned);
        }
        break;
      }

      case 'EMAIL':
        if (valPart && !currentCard.emails.includes(valPart)) {
          currentCard.emails.push(valPart.toLowerCase().trim());
        }
        break;

      case 'ADR': {
        // ADR format: postOfficeBox;extendedAddress;street;locality(city);region(state);postalCode;country
        const adrParts = valPart.split(';').map(p => p.trim()).filter(Boolean);
        if (adrParts.length > 0) {
          currentCard.addresses.push(adrParts.join(', '));
        }
        break;
      }

      case 'NOTE':
        if (valPart) {
          currentCard.notes.push(valPart.trim());
        }
        break;

      case 'URL':
        if (valPart && !currentCard.urls.includes(valPart)) {
          currentCard.urls.push(valPart.trim());
        }
        break;

      case 'CATEGORIES':
        valPart.split(',').forEach(c => {
          const cat = c.trim();
          if (cat && !currentCard.categories.includes(cat)) {
            currentCard.categories.push(cat);
          }
        });
        break;
    }
  }

  return contacts;
}

// Convert parsed raw vCard card to directory ready contact object
function formatContactRecord(card) {
  // Determine display name
  let displayName = card.formattedName;
  if (!displayName) {
    const nameParts = [card.prefix, card.firstName, card.middleName, card.lastName].filter(Boolean);
    displayName = nameParts.join(' ').trim();
  }
  if (!displayName && card.organization) {
    displayName = card.organization;
  }
  if (!displayName && card.phones.length > 0) {
    displayName = `Contact (${card.phones[0]})`;
  }
  if (!displayName) {
    displayName = 'Unnamed Contact';
  }

  const primaryPhone = card.phones[0] || '';
  const alternatePhones = card.phones.slice(1).join(', ');
  const email = card.emails[0] || '';
  const address = card.addresses[0] || '-';
  
  // Combine notes
  let combinedNotes = card.notes.join('\n');
  if (alternatePhones) {
    combinedNotes = combinedNotes ? `${combinedNotes}\nAlt Phone: ${alternatePhones}` : `Alt Phone: ${alternatePhones}`;
  }
  if (card.organization && card.organization !== displayName) {
    combinedNotes = combinedNotes ? `${combinedNotes}\nOrg: ${card.organization}` : `Org: ${card.organization}`;
  }

  // Location / Maps URL
  const googleMapsUrl = card.urls.find(u => u.includes('maps') || u.includes('goo.gl')) || card.urls[0] || '';

  // Smart Category
  const detectedCategory = autoCategorizeContact(
    displayName,
    card.organization,
    card.title,
    combinedNotes,
    address
  );

  return {
    id: `temp_${Math.random().toString(36).substring(2, 9)}`,
    company_name: displayName,
    contact_type: detectedCategory,
    phone_number: primaryPhone,
    alternate_phone: alternatePhones,
    physical_address: address,
    email: email,
    designation: card.title || '',
    notes: combinedNotes,
    google_maps_url: googleMapsUrl,
    selected: Boolean(primaryPhone || displayName !== 'Unnamed Contact'),
    phoneLookupKey: getPhoneLookupKey(primaryPhone)
  };
}
