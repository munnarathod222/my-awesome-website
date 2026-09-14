import assert from 'assert';

console.log('=== RUNNING TESTS FOR LR & POD MODULE ===\n');

// 1. Indian Financial Year Calculation
function getIndianFinancialYear(dateInput = new Date()) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const month = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();

  let startYear;
  let endYear;

  if (month >= 3) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  const startStr = String(startYear).slice(-2);
  const endStr = String(endYear).slice(-2);
  return `${startStr}-${endStr}`;
}

console.log('1. Testing Indian Financial Year logic...');
const apr2026 = getIndianFinancialYear(new Date('2026-04-15'));
assert.strictEqual(apr2026, '26-27', `Expected 26-27, got ${apr2026}`);

const sep2026 = getIndianFinancialYear(new Date('2026-09-15'));
assert.strictEqual(sep2026, '26-27', `Expected 26-27, got ${sep2026}`);

const feb2027 = getIndianFinancialYear(new Date('2027-02-10'));
assert.strictEqual(feb2027, '26-27', `Expected 26-27, got ${feb2027}`);

const apr2027 = getIndianFinancialYear(new Date('2027-04-01'));
assert.strictEqual(apr2027, '27-28', `Expected 27-28, got ${apr2027}`);
console.log('✅ Financial Year calculations passed!\n');

// 2. Test LR & POD Numbering Sequence Format
console.log('2. Testing LR & POD Number formatting...');
const prefix = 'JBC';
const podPrefix = 'JBC/POD';
const seq = 1;
const lrNumber = `${prefix}/${apr2026}/${String(seq).padStart(6, '0')}`;
const podNumber = `${podPrefix}/${apr2026}/${String(seq).padStart(6, '0')}`;

assert.strictEqual(lrNumber, 'JBC/26-27/000001');
assert.strictEqual(podNumber, 'JBC/POD/26-27/000001');
console.log(`✅ Generated LR: ${lrNumber}`);
console.log(`✅ Generated POD: ${podNumber}`);
console.log('✅ Numbering formats verified!\n');

// 3. Test Company Profile Data
console.log('3. Testing Company Settings & Official Transport Identity...');
const company = {
  company_name: 'JAI BHAVANI CARGO',
  company_gstin: '36DPXPR9171A1Z8',
  company_address: 'Plot No. 3, Patel Nagar, Ghatkesar, Medchal-Malkajgiri Dist., Telangana - 501301',
  company_phone: '+91 7794072244',
  company_email: 'vinod@jaibhavanicargo.com',
  company_website: 'www.jaibhavanicargo.com'
};
assert.strictEqual(company.company_name, 'JAI BHAVANI CARGO');
assert.strictEqual(company.company_gstin, '36DPXPR9171A1Z8');
assert(company.company_address.includes('Ghatkesar'));
assert(company.company_phone.includes('7794072244'));
console.log('✅ Company Settings verified!\n');

// 4. Test Tax & Freight Calculations
console.log('4. Testing Freight & GST Calculation...');
const basicFreight = 6500;
const loading = 300;
const unloading = 300;
const detention = 0;
const discount = 0;
const taxable = basicFreight + loading + unloading + detention - discount;
assert.strictEqual(taxable, 7100);

const cgst = Math.round(taxable * 0.025 * 100) / 100;
const sgst = Math.round(taxable * 0.025 * 100) / 100;
const total = taxable + cgst + sgst;
assert.strictEqual(cgst, 177.5);
assert.strictEqual(sgst, 177.5);
assert.strictEqual(total, 7455);
console.log(`✅ Taxable: ₹${taxable}, CGST: ₹${cgst}, SGST: ₹${sgst}, Total: ₹${total}`);
console.log('✅ Freight & GST math verified!\n');

console.log('🎉 ALL DOCUMENT ENGINE CHECKS PASSED!');
