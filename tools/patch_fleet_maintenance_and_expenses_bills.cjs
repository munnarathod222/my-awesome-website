const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

console.log('=== Step 1: Patching MaintenancePage bundles ===');

const maintBundles = [
  'dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/web/dist/assets/MaintenancePage-FpBhnDc2.js',
  'apps/api/dist/assets/MaintenancePage-FpBhnDc2.js',
  'dist/apps/web/assets/MaintenancePage-FpBhnDc2.js'
];

const targetMaintBadge = `r.length===0?e.jsx("span",{className:"text-muted-foreground text-xs",children:"—"}):r.length===1?e.jsxs("a",{href:r[0].url,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md",title:"Open attached bill / receipt",children:[e.jsx(Re,{className:"w-3 h-3"})," Bill"]}):e.jsx("div",{className:"flex flex-wrap items-center justify-center gap-1",children:r.map((a,s)=>e.jsxs("a",{href:a.url,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded",title:\`Open \${a.name||\`Bill #\${s+1}\`}\`,children:[e.jsx(Re,{className:"w-2.5 h-2.5"})," #",s+1]},s))})`;

const replaceMaintBadge = `r.length===0?e.jsx("span",{className:"text-muted-foreground text-xs",children:"—"}):r.length===1?e.jsxs("button",{type:"button",onClick:()=>openBillsViewer(r,0,t),className:"inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md cursor-pointer transition-all hover:scale-105 active:scale-95",title:"View attached bill photo",children:[e.jsx(Re,{className:"w-3 h-3"})," Bill"]}):e.jsx("div",{className:"flex flex-wrap items-center justify-center gap-1",children:r.map((a,s)=>e.jsxs("button",{key:s,type:"button",onClick:()=>openBillsViewer(r,s,t),className:"inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded cursor-pointer transition-all hover:scale-105 active:scale-95",title:\`View \${a.name||\`Bill #\${s+1}\`}\`,children:[e.jsx(Re,{className:"w-2.5 h-2.5"})," #",s+1]}))})`;

// Maintenance expense sync: link bills via notes <!-- BILLS_JSON: ... --> without duplicate binary file uploads
const targetExpenseNotes = `c.append("notes",\`Mechanic: \${u.assigned_mechanic||"Workshop"}. Parts: ₹\${H}, Labour: ₹\${Le}\`),c.append("service_provider_name",u.assigned_mechanic||"Workshop"),A.forEach(V=>{c.append("documents",V),c.append("bill",V)})`;
const replaceExpenseNotes = `c.append("notes",\`Mechanic: \${u.assigned_mechanic||"Workshop"}. Parts: ₹\${H}, Labour: ₹\${Le}\`+(()=>{const _bUrls=((Array.isArray(u.bills_json)&&u.bills_json.length>0)?u.bills_json:(Array.isArray(T)?T:[])).map(b=>typeof b==="string"?{name:"Bill",url:b}:b);return _bUrls.length>0?\`\\n<!-- BILLS_JSON:\${JSON.stringify(_bUrls)} -->\`:""})()),c.append("service_provider_name",u.assigned_mechanic||"Workshop")`;

for (const pth of maintBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  let modified = false;
  if (code.includes(targetMaintBadge)) {
    code = code.replace(targetMaintBadge, replaceMaintBadge);
    modified = true;
    console.log('✅ Replaced table bill badges with image viewer button in:', pth);
  } else {
    console.log('Badge target not found in:', pth);
  }

  if (code.includes(targetExpenseNotes)) {
    code = code.replace(targetExpenseNotes, replaceExpenseNotes);
    modified = true;
    console.log('✅ Replaced expense duplicate upload with clean bill linking in:', pth);
  } else {
    console.log('Expense notes target not found in:', pth);
  }

  if (modified) {
    parser.parse(code, { sourceType: 'module' });
    fs.writeFileSync(pth, code, 'utf8');
    console.log('🎉 Successfully saved and validated Maintenance bundle:', pth);
  }
}

console.log('\n=== Step 2: Patching ExpensesPage bundles ===');

const expBundles = [
  'ExpensesPage-DPFHVAFy.js',
  'dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/web/dist/assets/ExpensesPage-DPFHVAFy.js',
  'apps/api/dist/assets/ExpensesPage-DPFHVAFy.js',
  'dist/apps/web/assets/ExpensesPage-DPFHVAFy.js',
  'tools/ExpensesPage.patched.js'
];

// In ExpensesPage, inject _getExpImgs helper before the component render
const helperDef = `function _getExpImgs(t,g){const I=[];const S=new Set;const add=(n,u)=>{if(u&&!S.has(u)){S.add(u);I.push({name:n||"Receipt",url:u})}};(t.image_urls||[]).forEach(f=>{if(!f)return;const u=typeof f==="string"&&(f.startsWith("http")||f.startsWith("/"))?f:g.files.getUrl(t,f);add(typeof f==="string"?f:"Receipt",u)});(t.documents||[]).forEach(f=>{if(!f)return;if(typeof f==="string"&&f.match(/\\.(jpg|jpeg|png|webp|gif)$/i)){const u=f.startsWith("http")||f.startsWith("/")?f:g.files.getUrl(t,f);add(f,u)}});if(t.notes&&t.notes.includes("<!-- BILLS_JSON:")){try{const raw=t.notes.split("<!-- BILLS_JSON:")[1].split("-->")[0];const P=JSON.parse(raw);if(Array.isArray(P)){P.forEach(b=>{const u=typeof b==="string"?b:(b.url||"");const n=typeof b==="string"?b:(b.name||"Job Card Bill");add(n,u)})}}catch(e){}}return I;}
`;

// Desktop Table target
const targetDeskRender = `Array.from(new Set(t.image_urls||[])).map((s,a)=>{const r=g.files.getUrl(t,s);return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm",title:"View Receipt Snapshot",children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

const replaceDeskRender = `_getExpImgs(t,g).map((item,a)=>{const r=item.url;return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-7 h-7 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-muted shrink-0 shadow-sm",title:\`View \${item.name||"Receipt"}\`,children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

// Mobile Card target
const targetMobileRender = `Array.from(new Set(t.image_urls||[])).map((s,a)=>{const r=g.files.getUrl(t,s);return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-6 h-6 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm",title:"View Receipt Snapshot",children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

const replaceMobileRender = `_getExpImgs(t,g).map((item,a)=>{const r=item.url;return e.jsx("div",{onClick:function(E){if(E.currentTarget.dataset.missing==="true"){E.stopPropagation();et(t);return;}he({url:r,expense:t});},className:"w-6 h-6 rounded border border-border/80 overflow-hidden cursor-pointer hover:scale-105 transition-transform bg-muted shrink-0 shadow-sm",title:\`View \${item.name||"Receipt"}\`,children:e.jsx("img",{src:r,alt:"receipt",className:"w-full h-full object-cover",onError:function(E){E.currentTarget.style.display="none";var p=E.currentTarget.parentElement;if(p){p.dataset.missing="true";p.title="Bill missing - Click to upload bill";p.innerHTML="<span style=\\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:bold;cursor:pointer\\" title=\\"Bill missing - Click to upload\\">📷+</span>";}}})},a)})`;

// Empty check target: (!t.image_urls||t.image_urls.length===0)&&(!t.documents||t.documents.length===0)&&e.jsx(p,{variant:"ghost",size:"icon",onClick:()=>et(t)
const targetEmpty = `(!t.image_urls||t.image_urls.length===0)&&(!t.documents||t.documents.length===0)&&e.jsx(p,{variant:"ghost",size:"icon",onClick:()=>et(t)`;
const replaceEmpty = `_getExpImgs(t,g).length===0&&(!t.documents||t.documents.filter(doc=>!(t.image_urls||[]).includes(doc)&&!doc.match(/\\.(jpg|jpeg|png|webp|gif)$/i)).length===0)&&e.jsx(p,{variant:"ghost",size:"icon",onClick:()=>et(t)`;

for (const pth of expBundles) {
  if (!fs.existsSync(pth)) continue;
  let code = fs.readFileSync(pth, 'utf8');

  let modified = false;
  if (!code.includes('function _getExpImgs')) {
    code = helperDef + code;
    modified = true;
    console.log('✅ Injected _getExpImgs in:', pth);
  }

  if (code.includes(targetDeskRender)) {
    code = code.replace(targetDeskRender, replaceDeskRender);
    modified = true;
    console.log('✅ Replaced desktop image render with _getExpImgs in:', pth);
  }

  if (code.includes(targetMobileRender)) {
    code = code.replace(targetMobileRender, replaceMobileRender);
    modified = true;
    console.log('✅ Replaced mobile image render with _getExpImgs in:', pth);
  }

  if (code.includes(targetEmpty)) {
    code = code.replace(targetEmpty, replaceEmpty);
    modified = true;
    console.log('✅ Updated empty bill condition in:', pth);
  }

  if (modified) {
    parser.parse(code, { sourceType: 'module' });
    fs.writeFileSync(pth, code, 'utf8');
    console.log('🎉 Successfully saved and validated ExpensesPage bundle:', pth);
  }
}
