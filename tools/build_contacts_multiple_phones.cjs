const fs = require('fs');
const path = require('path');
const babel = require('@babel/parser');

console.log('🚀 Building Contacts Directory with Multiple Phone Numbers Support...');

const srcPath = path.join(__dirname, '../dist/assets/ContactsPage-BGG1WU_b.js');
let src = fs.readFileSync(srcPath, 'utf8');

// ============================================================================
// 1. ADD extraPhones STATE TO function ka
// ============================================================================
const oldKaState = 'function ka({isOpen:r,onClose:p,contact:t,onSuccess:b}){const{currentUser:u}=We(),[C,j]=h.useState(!1),[N,c]=h.useState("Client"),[y,x]=h.useState(""),[s,d]=h.useState({contact_type:"Client",company_name:"",phone_number:"",physical_address:"",gstin:"",email:"",notes:"",google_maps_url:"",truck_brand:""}),[I,i]=h.useState([]),[m,M]=h.useState([]);';

const newKaState = 'function ka({isOpen:r,onClose:p,contact:t,onSuccess:b}){const{currentUser:u}=We(),[C,j]=h.useState(!1),[N,c]=h.useState("Client"),[y,x]=h.useState(""),[s,d]=h.useState({contact_type:"Client",company_name:"",phone_number:"",physical_address:"",gstin:"",email:"",notes:"",google_maps_url:"",truck_brand:""}),[extraPhones,setExtraPhones]=h.useState([]),[I,i]=h.useState([]),[m,M]=h.useState([]);';

if (!src.includes(oldKaState)) {
  throw new Error('Could not find oldKaState in ContactsPage');
}
src = src.replace(oldKaState, newKaState);
console.log('✓ Added extraPhones state to function ka');

// ============================================================================
// 2. PARSE MULTIPLE PHONES IN useEffect (EDIT & RESET)
// ============================================================================
// In useEffect when t exists:
const oldUseEffectSetContact = 'phone_number:t.phone_number||"",physical_address:t.physical_address||"",gstin:t.gstin||"",email:t.email||"",notes:ie,google_maps_url:F,truck_brand:t.truck_brand||"",warehouse_name:t.warehouse_name||"",designation:t.designation||"",client_name:t.client_name||"",bank_name:T,branch_name:E,ifsc_code:$,account_type:H,loan_type:re,agent_company:R})}';

// We split t.phone_number so primary is in s.phone_number, and the rest in extraPhones
const newUseEffectSetContact = 'phone_number:((t.phone_number||"").split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean)[0]||""),physical_address:t.physical_address||"",gstin:t.gstin||"",email:t.email||"",notes:ie,google_maps_url:F,truck_brand:t.truck_brand||"",warehouse_name:t.warehouse_name||"",designation:t.designation||"",client_name:t.client_name||"",bank_name:T,branch_name:E,ifsc_code:$,account_type:H,loan_type:re,agent_company:R}),setExtraPhones((t.phone_number||"").split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean).slice(1))}';

if (!src.includes(oldUseEffectSetContact)) {
  throw new Error('Could not find oldUseEffectSetContact in ContactsPage');
}
src = src.replace(oldUseEffectSetContact, newUseEffectSetContact);

// In useEffect reset when creating new contact:
const oldUseEffectReset = 'd({contact_type:"Client",company_name:"",phone_number:"",physical_address:"",gstin:"",email:"",notes:"",google_maps_url:"",truck_brand:"",warehouse_name:"",designation:"",client_name:"",bank_name:"",branch_name:"",ifsc_code:"",account_type:"",loan_type:"",agent_company:""})';

const newUseEffectReset = 'd({contact_type:"Client",company_name:"",phone_number:"",physical_address:"",gstin:"",email:"",notes:"",google_maps_url:"",truck_brand:"",warehouse_name:"",designation:"",client_name:"",bank_name:"",branch_name:"",ifsc_code:"",account_type:"",loan_type:"",agent_company:""}),setExtraPhones([])';

if (!src.includes(oldUseEffectReset)) {
  throw new Error('Could not find oldUseEffectReset in ContactsPage');
}
src = src.replace(oldUseEffectReset, newUseEffectReset);
console.log('✓ Updated useEffect to split existing phone numbers into primary + extraPhones');

// ============================================================================
// 3. UPDATE VALIDATION v() & SUBMIT B() TO COMBINE MULTIPLE PHONE NUMBERS
// ============================================================================
// Update validation: check if at least one number is provided
const oldValidation = 'v=()=>s.company_name.trim()?s.phone_number.trim()?s.physical_address.trim()?';
const newValidation = 'v=()=>s.company_name.trim()?(s.phone_number.trim()||extraPhones.some(p=>p.trim()))?s.physical_address.trim()?';

if (!src.includes(oldValidation)) {
  throw new Error('Could not find oldValidation in ContactsPage');
}
src = src.replace(oldValidation, newValidation);

// Update payload construction in B: combine all numbers into phone_number
const oldPayload = 'phone_number:s.phone_number?s.phone_number.trim():"",physical_address:s.physical_address?s.physical_address.trim():"",gstin:s.gstin?s.gstin.trim().toUpperCase():""';

const newPayload = 'phone_number:[s.phone_number,...extraPhones].flatMap(p=>(p||"").split(/[,;\\/\\n]+/)).map(p=>p.trim()).filter(Boolean).join(", "),physical_address:s.physical_address?s.physical_address.trim():"",gstin:s.gstin?s.gstin.trim().toUpperCase():""';

if (!src.includes(oldPayload)) {
  throw new Error('Could not find oldPayload in ContactsPage');
}
src = src.replace(oldPayload, newPayload);
console.log('✓ Updated validation & payload to combine multiple phone numbers');

// ============================================================================
// 4. REPLACE SINGLE PHONE INPUT WITH DYNAMIC MULTIPLE PHONE NUMBERS UI
// ============================================================================
const oldPhoneInputJSX = 'e.jsxs("div",{className:"space-y-2 col-span-2 sm:col-span-1",children:[e.jsx(g,{children:"Phone Number *"}),e.jsx(k,{value:s.phone_number,onChange:o=>d(a=>({...a,phone_number:o.target.value})),placeholder:"e.g. 9876543210",className:"bg-background"})]})';

const newPhoneInputJSX = `e.jsxs("div",{className:"space-y-3 col-span-2 bg-muted/20 p-3.5 rounded-xl border border-border/50",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(g,{className:"font-bold text-xs text-foreground flex items-center gap-1.5",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-emerald-500"})," Contact Phone Numbers *",e.jsx("span",{className:"text-[10px] text-muted-foreground font-normal ml-1",children:"(Add multiple mobile, WhatsApp or office numbers)"})]}),e.jsxs("button",{type:"button",onClick:()=>setExtraPhones(a=>[...a,""]),className:"text-[11px] font-bold text-primary hover:text-primary/80 flex items-center gap-1 hover:underline cursor-pointer",children:[e.jsx("span",{className:"text-xs font-black",children:"+"})," Add Another Number"]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-[10px] font-bold text-muted-foreground w-16 shrink-0",children:"Primary:"}),e.jsx(k,{value:s.phone_number,onChange:o=>d(a=>({...a,phone_number:o.target.value})),placeholder:"e.g. 98497 35080 (or paste comma-separated numbers)",className:"bg-background flex-1 font-mono text-xs font-semibold",required:!0})]}),extraPhones.map((ph,idx)=>e.jsxs("div",{key:idx,className:"flex items-center gap-2 animate-in fade-in duration-150",children:[e.jsxs("span",{className:"text-[10px] font-bold text-muted-foreground w-16 shrink-0",children:[\`Alt #\${idx+2}:\`]}),e.jsx(k,{value:ph,onChange:o=>{const val=o.target.value;setExtraPhones(a=>{const n=[...a];n[idx]=val;return n})},placeholder:"Alternate Phone / WhatsApp / Office...",className:"bg-background flex-1 font-mono text-xs font-semibold"}),e.jsx("button",{type:"button",onClick:()=>setExtraPhones(a=>a.filter((_,i)=>i!==idx)),className:"p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors text-xs font-bold shrink-0",title:"Remove number",children:"✕"})]}))]}),e.jsx("p",{className:"text-[10px] text-muted-foreground",children:"💡 Add secondary mobile numbers, WhatsApp lines, or landlines. All numbers will be saved and directly callable."})]})`;

if (!src.includes(oldPhoneInputJSX)) {
  throw new Error('Could not find oldPhoneInputJSX in ContactsPage');
}
src = src.replace(oldPhoneInputJSX, newPhoneInputJSX);
console.log('✓ Replaced single phone input with dynamic Multiple Phone Numbers UI');

// ============================================================================
// 5. UPGRADE DESKTOP TABLE TO RENDER EACH PHONE NUMBER WITH CALL + WA
// ============================================================================
const oldTablePhoneJSX = 'e.jsx("div",{className:"flex items-center gap-1.5",children:e.jsxs("a",{href:`tel:${l.phone_number?.replace(/\\D/g,"")}`,className:"font-semibold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-primary"})," ",l.phone_number]})})';

const newTablePhoneJSX = `e.jsx("div",{className:"flex flex-col gap-1",children:(l.phone_number?l.phone_number.split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean):[]).length>0?(l.phone_number.split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean).map((ph,idx)=>e.jsxs("div",{key:idx,className:"flex items-center gap-1.5",children:[e.jsxs("a",{href:\`tel:\${ph.replace(/\\D/g,"")}\`,className:"font-semibold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1",title:\`Call \${ph}\`,children:[e.jsx(ae,{className:"w-3 h-3 text-primary shrink-0"})," ",ph]}),e.jsx("a",{href:\`https://wa.me/\${ph.replace(/\\D/g,"").startsWith("91")?ph.replace(/\\D/g,""):"91"+ph.replace(/\\D/g,"")}\`,target:"_blank",rel:"noopener noreferrer",className:"text-[9px] font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded",title:"WhatsApp",children:"WA"})]}))):e.jsx("span",{className:"text-muted-foreground text-[11px]",children:"No phone"})})`;

if (!src.includes(oldTablePhoneJSX)) {
  throw new Error('Could not find oldTablePhoneJSX in ContactsPage');
}
src = src.replace(oldTablePhoneJSX, newTablePhoneJSX);
console.log('✓ Upgraded Desktop Table to render all phone numbers with Call & WhatsApp buttons');

// ============================================================================
// 6. UPGRADE DETAILS MODAL (function Ea) TO DISPLAY ALL PHONE NUMBERS
// ============================================================================
const oldDetailsPhoneJSX = 'e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wider",children:"Phone Number"}),e.jsx("a",{href:`tel:${t.phone_number}`,className:"text-sm font-medium text-foreground hover:text-primary transition-colors",children:t.phone_number||"N/A"})]})';

const newDetailsPhoneJSX = `e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wider",children:"Contact Phone Numbers"}),e.jsx("div",{className:"flex flex-col gap-1.5 mt-1",children:(t.phone_number?t.phone_number.split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean):[]).length>0?(t.phone_number.split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean).map((ph,idx)=>e.jsxs("div",{key:idx,className:"flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 gap-2",children:[e.jsxs("a",{href:\`tel:\${ph.replace(/\\D/g,"")}\`,className:"text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-emerald-500"}),ph,idx===0&&e.jsx("span",{className:"text-[10px] text-muted-foreground font-normal ml-1",children:"(Primary)"})]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx("a",{href:\`tel:\${ph.replace(/\\D/g,"")}\`,className:"px-2 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary hover:bg-primary/20",children:"Call"}),e.jsx("a",{href:\`https://wa.me/\${ph.replace(/\\D/g,"").startsWith("91")?ph.replace(/\\D/g,""):"91"+ph.replace(/\\D/g,"")}\`,target:"_blank",rel:"noopener noreferrer",className:"px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25",children:"WhatsApp"})]})]}))):e.jsx("span",{className:"text-sm text-muted-foreground",children:"N/A"})})]})`;

if (!src.includes(oldDetailsPhoneJSX)) {
  throw new Error('Could not find oldDetailsPhoneJSX in ContactsPage');
}
src = src.replace(oldDetailsPhoneJSX, newDetailsPhoneJSX);
console.log('✓ Upgraded Details Modal to render all phone numbers with Call & WhatsApp buttons');

// ============================================================================
// 7. UPGRADE MOBILE CARD TO DISPLAY ALL NUMBERS
// ============================================================================
const oldMobilePhoneJSX = 'l.phone_number?e.jsxs("a",{href:"tel:"+l.phone_number,className:"font-bold text-primary flex items-center gap-1 hover:underline text-xs",children:[e.jsx(ae,{className:"w-3.5 h-3.5"})," ",l.phone_number]}):e.jsx("span",{className:"text-muted-foreground text-[11px]",children:"No phone"})';

const newMobilePhoneJSX = `l.phone_number?e.jsx("div",{className:"flex flex-col gap-1",children:l.phone_number.split(/[,;\\/\\n]+/).map(p=>p.trim()).filter(Boolean).map((ph,idx)=>e.jsxs("div",{key:idx,className:"flex items-center gap-1.5",children:[e.jsxs("a",{href:\`tel:\${ph.replace(/\\D/g,"")}\`,className:"font-bold text-primary flex items-center gap-1 hover:underline text-xs",children:[e.jsx(ae,{className:"w-3.5 h-3.5"})," ",ph]}),e.jsx("a",{href:\`https://wa.me/\${ph.replace(/\\D/g,"").startsWith("91")?ph.replace(/\\D/g,""):"91"+ph.replace(/\\D/g,"")}\`,target:"_blank",rel:"noopener noreferrer",className:"text-[9px] font-bold text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded",children:"WA"})]}))}):e.jsx("span",{className:"text-muted-foreground text-[11px]",children:"No phone"})`;

if (src.includes(oldMobilePhoneJSX)) {
  src = src.replace(oldMobilePhoneJSX, newMobilePhoneJSX);
  console.log('✓ Upgraded Mobile Card to display multiple phone numbers');
}

// In mobile action buttons, ensure Call button dials the primary phone:
const oldMobileCallBtn = 'l.phone_number&&e.jsxs("a",{href:"tel:"+l.phone_number,';
const newMobileCallBtn = 'l.phone_number&&e.jsxs("a",{href:"tel:"+(l.phone_number.split(/[,;\\/\\n]+/)[0]?.replace(/\\D/g,"")||""),';
if (src.includes(oldMobileCallBtn)) {
  src = src.replace(oldMobileCallBtn, newMobileCallBtn);
  console.log('✓ Updated Mobile Card Call button to dial primary number');
}

// ============================================================================
// 8. VALIDATE WITH BABEL PARSER
// ============================================================================
console.log('Validating modified code with Babel parser...');
try {
  babel.parse(src, { sourceType: 'module', plugins: ['jsx'] });
  console.log('🎉 100% VALID SYNTAX! ZERO PARSER ERRORS!');
} catch (err) {
  console.error('Fatal parser error:', err.message);
  process.exit(1);
}

// ============================================================================
// 9. SAVE TO ALL 4 DESTINATIONS
// ============================================================================
const targets = [
  'dist/assets/ContactsPage-BGG1WU_b.js',
  'apps/web/dist/assets/ContactsPage-BGG1WU_b.js',
  'apps/api/dist/assets/ContactsPage-BGG1WU_b.js',
  'dist/apps/web/assets/ContactsPage-BGG1WU_b.js'
];

targets.forEach(t => {
  const full = path.resolve(__dirname, '..', t);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, src, 'utf8');
  console.log('✓ Successfully wrote to', t);
});

console.log('✨ All ContactsPage chunks updated with Multiple Phone Numbers support!');
