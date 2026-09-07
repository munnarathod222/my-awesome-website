const fs = require('fs');
const path = require('path');

const websiteDir = "c:\\Users\\Munna'\\OneDrive\\Desktop\\JAI BHAVANI CARGO\\website";
let code = fs.readFileSync(path.join(websiteDir, 'tools', 'CompanyVaultPage-Bo-mp6SJ.clean.js'), 'utf8');
console.log('Original clean chunk size:', code.length);

// 1. Add state: editingDocId, hasBackSide, selectedBackFile, previewSide, batchRc states + incremental append states
const stateTarget = 'const[fe,G]=o.useState(!0),[d,m]=o.useState(!1),';
const stateReplacement = `const[fe,G]=o.useState(!0),[d,m]=o.useState(!1),[editingDocId,setEditingDocId]=o.useState(null),[hasBackSide,setHasBackSide]=o.useState(!1),[selectedBackFile,setSelectedBackFile]=o.useState(null),[previewSide,setPreviewSide]=o.useState("front"),[pdfViewerMode,setPdfViewerMode]=o.useState("auto"),[batchRcOpen,setBatchRcOpen]=o.useState(!1),[batchRcFiles,setBatchRcFiles]=o.useState([]),[batchRcTitle,setBatchRcTitle]=o.useState("Fleet Commercial Vehicle RCs (Consolidated Compilation)"),[batchRcUploading,setBatchRcUploading]=o.useState(!1),[batchRcProgress,setBatchRcProgress]=o.useState(""),[batchRcTargetMode,setBatchRcTargetMode]=o.useState("append"),[selectedCompilationId,setSelectedCompilationId]=o.useState(null),[existingAttachedRcs,setExistingAttachedRcs]=o.useState([]),[activePreviewTruckIdx,setActivePreviewTruckIdx]=o.useState(0),`;
if (!code.includes(stateTarget)) throw new Error('State target not found');
code = code.replace(stateTarget, stateReplacement);

// 2. Include back_file_url in uploadFormData state h
const formStateTarget = '[h,E]=o.useState({title:"",category:"Tax Returns (ITR)",sub_category:"ITR-V (Acknowledgement)",financial_year:"FY 2024-25",notes:"",file_url:""})';
const formStateReplacement = '[h,E]=o.useState({title:"",category:"Tax Returns (ITR)",sub_category:"ITR-V (Acknowledgement)",financial_year:"FY 2024-25",notes:"",file_url:"",back_file_url:""})';
if (!code.includes(formStateTarget)) throw new Error('Form state target not found');
code = code.replace(formStateTarget, formStateReplacement);

// 3. WhatsApp single doc message: include back_file_url if available
const waSingleTarget = 'm.file_url&&(b+=`\n🔗 *Direct Download / View Link:*\n${m.file_url}\n`),';
const waSingleReplacement = `m.file_url&&(b+=\`\\n🔗 *Front Side Link:* \${m.file_url}\\n\`),m.back_file_url&&(b+=\`\\n🔗 *Back Side Link:* \${m.back_file_url}\\n\`),`;
if (code.includes(waSingleTarget)) {
  code = code.replace(waSingleTarget, waSingleReplacement);
}

// 4. Replace X and Ke with X, handleOpenEdit, openBatchRcModal, Ke, batchUpload50RCs
const xStart = code.indexOf(',X=(s="Tax Returns (ITR)"');
const keEnd = code.indexOf('finally{V(!1)}}') + 'finally{V(!1)}}'.length;
if (xStart === -1 || keEnd === -1) throw new Error('X and Ke targets not found');

const originalXAndKe = code.slice(xStart, keEnd);

const newXAndKe = `,X=(s="Tax Returns (ITR)",t="ITR-V (Acknowledgement)")=>{
  setEditingDocId(null),
  setHasBackSide(!1),
  setSelectedBackFile(null),
  E({title:"",category:s,sub_category:t,financial_year:s.includes("ITR")?"FY 2024-25":"N/A",notes:"",file_url:"",back_file_url:""}),
  Ae(null),
  Y(!0)
},
handleOpenEdit=(s)=>{
  setEditingDocId(s.id),
  setHasBackSide(Boolean(s.back_file_url)),
  setSelectedBackFile(null),
  E({
    title:s.title||"",
    category:s.category||"Registration & Identity",
    sub_category:s.sub_category||"General",
    financial_year:s.financial_year||"N/A",
    notes:s.notes||"",
    file_url:s.file_url||"",
    back_file_url:s.back_file_url||""
  }),
  Ae(null),
  Y(!0)
},
openBatchRcModal=(targetDoc=null)=>{
  if(targetDoc){
    setBatchRcTargetMode("append"),
    setSelectedCompilationId(targetDoc.id),
    setBatchRcTitle(targetDoc.title||"Fleet Commercial Vehicle RCs Compilation"),
    setExistingAttachedRcs(Array.isArray(targetDoc.attached_files)?[...targetDoc.attached_files]:[])
  }else{
    const existingComp=(i||[]).find(d=>d&&(d.is_multi_file||(d.attached_files&&d.attached_files.length>0)));
    if(existingComp){
      setBatchRcTargetMode("append"),
      setSelectedCompilationId(existingComp.id),
      setBatchRcTitle(existingComp.title||"Fleet Commercial Vehicle RCs Compilation"),
      setExistingAttachedRcs(Array.isArray(existingComp.attached_files)?[...existingComp.attached_files]:[])
    }else{
      setBatchRcTargetMode("new"),
      setSelectedCompilationId(null),
      setBatchRcTitle("Fleet Commercial Vehicle RCs (Consolidated Compilation)"),
      setExistingAttachedRcs([])
    }
  }
  setBatchRcFiles([]),
  setBatchRcOpen(!0)
},
Ke=async s=>{
  if(s.preventDefault(),!h.title.trim())return u.error("Document title is required");
  if(!M&&!h.file_url.trim()&&!editingDocId)return u.error("Please upload a file or provide a valid file URL");
  V(!0);
  try{
    let t=h.file_url.trim(),r=M?M.name:(t?"External Link":"Document"),w=M?\`\${(M.size/(1024*1024)).toFixed(2)} MB\`:"N/A";
    if(M){
      const _=new FormData;
      _.append("file",M);
      _.append("truck_id","COMPANY_VAULT");
      _.append("document_type","Other");
      _.append("document_name",h.title.trim());
      _.append("notes",\`Company Vault: \${h.title} (\${h.category})\`);
      _.append("status","Active");
      _.append("expiry_date","2099-12-31T00:00:00.000Z");
      const ke=await B.collection("truck_documents").create(_,{$autoCancel:!1});
      t=B.files.getURL(ke,ke.file);
    }
    let backUrl = h.back_file_url ? h.back_file_url.trim() : "";
    if(hasBackSide && selectedBackFile){
      const _b=new FormData;
      _b.append("file",selectedBackFile);
      _b.append("truck_id","COMPANY_VAULT");
      _b.append("document_type","Other");
      _b.append("document_name",\`\${h.title.trim()} (Back Side)\`);
      _b.append("notes",\`Company Vault: \${h.title} (Back Side)\`);
      _b.append("status","Active");
      _b.append("expiry_date","2099-12-31T00:00:00.000Z");
      const keBack=await B.collection("truck_documents").create(_b,{$autoCancel:!1});
      backUrl=B.files.getURL(keBack,keBack.file);
    }
    let j;
    if(editingDocId){
      j=i.map(doc=>{
        if(doc.id===editingDocId){
          const finalBack = hasBackSide ? (selectedBackFile ? backUrl : (backUrl || doc.back_file_url || "")) : "";
          return {
            ...doc,
            title:h.title.trim(),
            category:h.category,
            sub_category:h.sub_category||"General",
            financial_year:h.financial_year||"N/A",
            file_url:M?t:(t||doc.file_url),
            file_name:M?r:(t?r:doc.file_name),
            file_size:M?w:doc.file_size,
            back_file_url:finalBack,
            has_back_side:Boolean(finalBack),
            notes:h.notes.trim(),
            updated_at:new Date().toISOString()
          };
        }
        return doc;
      });
      u.success(\`"\${h.title}" updated successfully!\`);
    } else {
      const finalBack = hasBackSide ? backUrl : "";
      const C={
        id:"doc_"+Date.now()+"_"+Math.random().toString(36).substring(2,7),
        title:h.title.trim(),
        category:h.category,
        sub_category:h.sub_category||"General",
        financial_year:h.financial_year||"N/A",
        file_url:t,
        file_name:r,
        file_size:w,
        back_file_url:finalBack,
        has_back_side:Boolean(finalBack),
        notes:h.notes.trim(),
        created_at:new Date().toISOString()
      };
      j=[C,...i];
      u.success(\`"\${C.title}" uploaded to Company Vault!\`);
    }
    const U=JSON.stringify(j);
    try{
      await B.collection("company_settings").update(a.id,{company_docs_json:U},{$autoCancel:!1});
    }catch(updErr){
      const rList=await B.collection("company_settings").getList(1,1,{$autoCancel:!1});
      if(rList.items?.length>0){
        await B.collection("company_settings").update(rList.items[0].id,{company_docs_json:U},{$autoCancel:!1});
      }
    }
    H(j);
    z(_=>({..._,company_docs_json:U}));
    try{localStorage.setItem("jbc_company_vault_docs",U)}catch(e){}
    Y(!1);
    setEditingDocId(null);
    setHasBackSide(!1);
    setSelectedBackFile(null);
    Ae(null);
  }catch(err){
    console.error("Error saving document:",err);
    const msg=err?.data?.message||err?.message||(err?.data?JSON.stringify(err.data):"Failed to save document");
    u.error(\`Failed to save document: \${msg}\`);
  }finally{
    V(!1);
  }
},
batchUpload50RCs=async()=>{
  if(batchRcTargetMode==="new"&&!batchRcFiles.length)return u.error("Please select at least one truck RC to create compilation");
  if(!batchRcFiles.length&&!existingAttachedRcs.length)return u.error("No truck RCs to save in compilation");
  if(!batchRcTitle.trim())return u.error("Please provide a title for the dossier");

  setBatchRcUploading(!0);
  try{
    const newlyUploaded=[];
    if(batchRcFiles.length>0){
      u.info(\`Uploading \${batchRcFiles.length} truck RCs... Please wait.\`);
      for(let idx=0;idx<batchRcFiles.length;idx++){
        const file=batchRcFiles[idx];
        setBatchRcProgress(\`Uploading truck RC \${idx+1} of \${batchRcFiles.length}: \${file.name}\`);
        const formData=new FormData();
        formData.append("file",file);
        formData.append("truck_id","FLEET_RC_BUNDLE");
        formData.append("document_type","RC");
        formData.append("document_name",file.name);
        formData.append("status","Active");
        formData.append("expiry_date","2099-12-31T00:00:00.000Z");
        const res=await B.collection("truck_documents").create(formData,{$autoCancel:!1});
        const fileUrl=B.files.getURL(res,res.file);
        const cleanName=file.name.replace(/\\.[^/.]+$/,"");
        const truckMatch=cleanName.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})/i);
        const truckNum=truckMatch?truckMatch[1].toUpperCase():\`Truck \${existingAttachedRcs.length+idx+1}\`;
        newlyUploaded.push({
          id:"rc_"+Date.now()+"_"+idx,
          name:file.name,
          url:fileUrl,
          size:(file.size/(1024*1024)).toFixed(2)+" MB",
          truck_number:truckNum,
          uploaded_at:new Date().toISOString()
        });
      }
    }

    let merged=[...existingAttachedRcs];
    newlyUploaded.forEach(newRc=>{
      const exIdx=merged.findIndex(m=>m.truck_number===newRc.truck_number);
      if(exIdx>=0){
        merged[exIdx]=newRc;
      }else{
        merged.push(newRc);
      }
    });

    const totalCount=merged.length;
    const finalTitle=batchRcTitle.trim()||\`Fleet Commercial Vehicle RCs (\${totalCount} Trucks)\`;
    let updatedList;

    if(batchRcTargetMode==="append"&&selectedCompilationId){
      updatedList=i.map(doc=>{
        if(doc.id===selectedCompilationId){
          return {
            ...doc,
            title:finalTitle,
            file_url:merged[0]?.url||doc.file_url,
            file_size:\`\${totalCount} Truck RCs Attached\`,
            is_multi_file:!0,
            rc_count:totalCount,
            file_count:totalCount,
            attached_files:merged,
            updated_at:new Date().toISOString()
          };
        }
        return doc;
      });
      u.success(\`Successfully updated compilation! Now contains \${totalCount} truck RCs.\`);
    }else{
      const newDoc={
        id:"vault_"+Date.now(),
        title:finalTitle,
        category:"Fleet & Vehicle Documents",
        sub_category:"Commercial Vehicle RC Compilation",
        financial_year:"N/A",
        file_url:merged[0]?.url||"",
        file_size:\`\${totalCount} Truck RCs Attached\`,
        notes:"Consolidated commercial vehicle registration certificates for fleet financing & bank compliance.",
        is_multi_file:!0,
        rc_count:totalCount,
        file_count:totalCount,
        attached_files:merged,
        created_at:new Date().toISOString()
      };
      updatedList=[newDoc,...i];
      u.success(\`Successfully created compilation with \${totalCount} truck RCs!\`);
    }

    const w=JSON.stringify(updatedList);
    try{
      await B.collection("company_settings").update(a.id,{company_docs_json:w},{$autoCancel:!1});
    }catch(updErr){
      const rList=await B.collection("company_settings").getList(1,1,{$autoCancel:!1});
      if(rList.items?.length>0){
        await B.collection("company_settings").update(rList.items[0].id,{company_docs_json:w},{$autoCancel:!1});
      }
    }

    H(updatedList);
    z(C=>({...C,company_docs_json:w}));
    try{localStorage.setItem("jbc_company_vault_docs",w)}catch(e){}

    setBatchRcOpen(!1);
    setBatchRcFiles([]);
    setExistingAttachedRcs([]);
  }catch(err){
    console.error("Batch RC compilation failed:",err);
    u.error("Failed to save truck RCs");
  }finally{
    setBatchRcUploading(!1);
    setBatchRcProgress("");
  }
}`;

code = code.replace(originalXAndKe, newXAndKe);

// 5. Header button "+ Upload / Manage Truck RCs"
const headerButtonsContainer = 'e.jsxs(n,{size:"sm",className:"h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25",onClick:()=>X(),children:[e.jsx(we,{className:"w-4 h-4 mr-2"}),"+ Upload Vault Document"]})';
const headerButtonsReplacement = `e.jsxs(n,{size:"sm",className:"h-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer mr-1",onClick:()=>openBatchRcModal(),children:[e.jsx("span",{className:"mr-1.5"},"🚛"),"+ Upload / Manage Truck RCs"]}),
e.jsxs(n,{size:"sm",className:"h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25",onClick:()=>X(),children:[e.jsx(we,{className:"w-4 h-4 mr-2"}),"+ Upload Vault Document"]})`;

if (!code.includes(headerButtonsContainer)) throw new Error('Header button container not found');
code = code.replace(headerButtonsContainer, headerButtonsReplacement);

// 6. Card Badge: show "🔄 Front + Back" AND "🚛 X Trucks Attached"
const cardBadgeTarget = 's.financial_year&&s.financial_year!=="N/A"&&e.jsx(K,{variant:"secondary",className:"text-[10px] font-mono",children:s.financial_year})]}),';
const cardBadgeReplacement = `s.financial_year&&s.financial_year!=="N/A"&&e.jsx(K,{variant:"secondary",className:"text-[10px] font-mono",children:s.financial_year}),
(s.back_file_url||s.has_back_side)&&e.jsx(K,{variant:"outline",className:"text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border-cyan-500/30",children:"🔄 Front + Back"}),
(s.is_multi_file||(s.attached_files&&s.attached_files.length>0))&&e.jsx(K,{variant:"outline",className:"text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/30",children:\`🚛 \${s.attached_files?.length||s.rc_count||1} Trucks Attached\`})]}),`;

if (!code.includes(cardBadgeTarget)) throw new Error('Card badge target not found');
code = code.replace(cardBadgeTarget, cardBadgeReplacement);

// 7. In Action Buttons Row: Include prominent "➕ Add / Manage Truck RCs" for multi-RC documents
const actionGridTarget = 'e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1",children:[e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 px-1.5",onClick:()=>de(s),disabled:!s.file_url,title:"View & Preview Document",children:[e.jsx($e,{className:"w-3.5 h-3.5 mr-1"}),"View"]}),e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 px-1.5",onClick:()=>ye(s),disabled:!s.file_url,title:"Download Document",children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1"}),"Download"]}),e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-bold text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5",onClick:()=>xe({isOpen:!0,doc:s}),title:"Share via WhatsApp API",children:[e.jsx(ie,{className:"w-3.5 h-3.5 mr-1"}),"WhatsApp"]}),e.jsxs(n,{variant:"secondary",size:"sm",className:"h-8 text-xs font-medium px-1.5",onClick:()=>{s.file_url?(navigator.clipboard.writeText(s.file_url),u.success(`Direct link for "${s.title}" copied!`)):u.error("No URL available to copy")},title:"Copy URL Link",children:[e.jsx(D,{className:"w-3.5 h-3.5 mr-1"}),"Copy"]})]})';

const actionGridReplacement = `e.jsxs("div",{className:"space-y-1.5 pt-2 border-t border-border/50",children:[
  (s.is_multi_file||(s.attached_files&&s.attached_files.length>0))&&e.jsxs(n,{size:"sm",className:"w-full h-8 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 transition-all",onClick:()=>openBatchRcModal(s),children:[
    e.jsx("span",{children:"➕"}),
    \`Add / Manage Truck RCs (\${s.attached_files?.length||s.rc_count||1} Trucks)\`
  ]}),
  e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm",onClick:()=>{setActivePreviewTruckIdx(0);de(s);setPreviewSide("front")},disabled:!s.file_url,title:"View & Preview Document",children:[e.jsx($e,{className:"w-3.5 h-3.5 mr-1"}),"View Document"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm",onClick:()=>ye(s),disabled:!s.file_url,title:"Download Document",children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1"}),"Download"]})
  ]}),
  e.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>xe({isOpen:!0,doc:s}),title:"Share via WhatsApp",children:[e.jsx("span",{children:"💬"}),"WhatsApp"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>handleOpenEdit(s),title:"Edit Document Details",children:[e.jsx("span",{children:"✏️"}),"Edit"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border-slate-700/60 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>{s.file_url?(navigator.clipboard.writeText(s.file_url),u.success(\`Link for "\${s.title}" copied!\`)):u.error("No URL available to copy")},title:"Copy Link",children:[e.jsx(De,{className:"w-3 h-3 mr-1"}),"Copy"]})
  ]})
]})`;

if (!code.includes(actionGridTarget)) throw new Error('Action grid target not found');
code = code.replace(actionGridTarget, actionGridReplacement);

// 8. In Upload Modal: adapt title & preview banner if editing
const modalOpenTarget = 'e.jsx(le,{open:I,onOpenChange:Y,children:e.jsxs(re,{className:"sm:max-w-lg bg-card border-border",children:[e.jsx(ne,{children:e.jsxs(oe,{className:"text-lg font-bold text-foreground flex items-center gap-2",children:[e.jsx(we,{className:"w-5 h-5 text-primary"}),"Upload Company Vault Document"]})}),';

const modalOpenReplacement = `e.jsx(le,{open:I,onOpenChange:s=>{if(!s){setEditingDocId(null);setHasBackSide(!1);setSelectedBackFile(null)}Y(s)},children:e.jsxs(re,{className:"sm:max-w-lg bg-card border-border",children:[e.jsx(ne,{children:e.jsxs(oe,{className:"text-lg font-bold text-foreground flex items-center gap-2",children:[e.jsx(we,{className:"w-5 h-5 text-primary"}),editingDocId?"Edit Company Vault Document":"Upload Company Vault Document"]})}),
editingDocId&&h.file_url&&e.jsxs("div",{className:"px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-300",children:[
  e.jsxs("span",{className:"truncate mr-2",children:["Current Front File: ",e.jsx("span",{className:"font-mono text-cyan-400 font-bold",children:h.file_url.split("/").pop().slice(0,35)})]}),
  e.jsx("a",{href:h.file_url,target:"_blank",rel:"noreferrer",className:"text-cyan-400 hover:underline font-bold text-[11px] shrink-0",children:"Preview Front ↗"})
]}),`;

if (!code.includes(modalOpenTarget)) throw new Error('Modal open target not found');
code = code.replace(modalOpenTarget, modalOpenReplacement);

// 9. Modal Front File Label:
const fileLabelTarget = 'children:"Select File (PDF, Image, Excel, Zip) *"';
const fileLabelReplacement = 'children:editingDocId?"Replace Front File (Optional)":"Select Front File (PDF, Image, Excel, Zip) *"';
code = code.replace(fileLabelTarget, fileLabelReplacement);

// 10. Add Back Side Toggle Button & Back File Uploader in Modal
const modalUrlFieldTarget = 'e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Or Provide Direct File URL (Optional)"}),e.jsx(N,{type:"url",placeholder:"https://drive.google.com/... or https://...",value:h.file_url,onChange:s=>E({...h,file_url:s.target.value}),className:"bg-background h-10 text-xs font-mono"})]}),';

const modalUrlFieldReplacement = `e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Or Provide Direct File URL (Optional)"}),e.jsx(N,{type:"url",placeholder:"https://drive.google.com/... or https://...",value:h.file_url,onChange:s=>E({...h,file_url:s.target.value}),className:"bg-background h-10 text-xs font-mono"})]}),
e.jsxs("div",{className:"p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3",children:[
  e.jsxs("div",{className:"flex items-center justify-between cursor-pointer select-none",onClick:()=>setHasBackSide(!hasBackSide),children:[
    e.jsxs("div",{className:"flex items-center gap-2.5",children:[
      e.jsx("span",{className:"text-lg",children:"🔄"}),
      e.jsxs("div",{children:[
        e.jsx("p",{className:"text-xs font-bold text-slate-100",children:"Include Back Side (License / ID / RC)"}),
        e.jsx("p",{className:"text-[10px] text-slate-400",children:"Toggle ON to upload reverse side image or PDF"})
      ]})
    ]}),
    e.jsx("div",{className:\`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer \${hasBackSide?"bg-emerald-600 justify-end":"bg-slate-800 justify-start border border-slate-700"}\`,children:e.jsx("div",{className:"bg-white w-5 h-5 rounded-full shadow-md transition-transform"})})
  ]}),
  hasBackSide&&e.jsxs("div",{className:"pt-3 border-t border-slate-800/80 space-y-3",children:[
    editingDocId&&h.back_file_url&&e.jsxs("div",{className:"px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-300",children:[
      e.jsxs("span",{className:"truncate mr-2 text-[11px]",children:["Current Back File: ",e.jsx("span",{className:"font-mono text-cyan-400 font-bold",children:h.back_file_url.split("/").pop().slice(0,30)})]}),
      e.jsx("a",{href:h.back_file_url,target:"_blank",rel:"noreferrer",className:"text-cyan-400 hover:underline font-bold text-[11px] shrink-0",children:"Preview Back ↗"})
    ]}),
    e.jsxs("div",{className:"space-y-1.5",children:[
      e.jsx(g,{className:"text-xs font-semibold text-slate-200",children:editingDocId?"Replace Back Side File (Optional)":"Select Back Side File (Image, PDF) *"}),
      e.jsx(N,{type:"file",accept:"image/*,.pdf",onChange:s=>setSelectedBackFile(s.target.files[0]),className:"bg-background text-xs cursor-pointer"}),
      e.jsx("p",{className:"text-[10px] text-slate-400",children:"Upload reverse side of driving license, RC book, ID card, or certificate."})
    ]}),
    e.jsxs("div",{className:"space-y-1.5",children:[
      e.jsx(g,{className:"text-xs font-semibold text-slate-400",children:"Or Back Side Direct URL (Optional)"}),
      e.jsx(N,{type:"url",placeholder:"https://... (Back side file link)",value:h.back_file_url||"",onChange:s=>E({...h,back_file_url:s.target.value}),className:"bg-background h-9 text-xs font-mono"})
    ]})
  ]})
]}),`;

if (!code.includes(modalUrlFieldTarget)) throw new Error('Modal url field target not found');
code = code.replace(modalUrlFieldTarget, modalUrlFieldReplacement);

// 11. Modal Cancel Button:
const cancelBtnTarget = 'e.jsx(n,{type:"button",variant:"outline",onClick:()=>Y(!1),children:"Cancel"})';
const cancelBtnReplacement = 'e.jsx(n,{type:"button",variant:"outline",onClick:()=>{setEditingDocId(null);setHasBackSide(!1);setSelectedBackFile(null);Y(!1)},children:"Cancel"})';
if (!code.includes(cancelBtnTarget)) throw new Error('Cancel btn target not found');
code = code.replace(cancelBtnTarget, cancelBtnReplacement);

// 12. Modal Submit Button:
const submitBtnTarget = 'children:R?"Uploading to Vault...":"Save & Store in Vault"';
const submitBtnReplacement = 'children:R?(editingDocId?"Saving Changes...":"Uploading to Vault..."):(editingDocId?"Save Changes":"Save & Store in Vault")';
if (!code.includes(submitBtnTarget)) throw new Error('Submit btn target not found');
code = code.replace(submitBtnTarget, submitBtnReplacement);

// 13. Enhanced Preview Modal with Front / Back Switcher Tabs AND Multi-Truck Selector Carousel
const previewTarget = 'open:!!c,onOpenChange:s=>!s&&de(null),children:e.jsx(re,{className:"sm:max-w-4xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col",children:c&&e.jsxs(e.Fragment,{children:[e.jsx(ne,{className:"shrink-0 pb-3 border-b border-slate-800 flex flex-row items-center justify-between",children:e.jsxs("div",{children:[e.jsxs(oe,{className:"text-lg font-bold text-white flex items-center gap-2",children:[e.jsx($e,{className:"w-5 h-5 text-primary"}),c.title]}),e.jsxs(Ce,{className:"text-xs text-slate-400 mt-0.5",children:["Category: ",e.jsx("span",{className:"text-primary font-semibold",children:c.category})," • Sub-type: ",c.sub_category," • Period: ",c.financial_year]})]})}),e.jsx("div",{className:"flex-1 overflow-y-auto my-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[420px]",children:c.file_url?c.file_url.match(/\\.(jpeg|jpg|gif|png|webp)($|\\?)/i)||c.file_name?.match(/\\.(jpeg|jpg|gif|png|webp)$/i)?e.jsx("img",{src:c.file_url,alt:c.title,className:"max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-lg"}):c.file_url.match(/\\.pdf($|\\?)/i)||c.file_name?.match(/\\.pdf$/i)?e.jsx("iframe",{src:c.file_url,title:c.title,className:"w-full h-[60vh] rounded-xl border border-slate-800 bg-white"}):e.jsxs("div",{className:"text-center p-8 space-y-4",children:[e.jsx(te,{className:"w-16 h-16 text-primary mx-auto opacity-60"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-white",children:c.file_name||c.title}),e.jsxs("p",{className:"text-xs text-slate-400 mt-1",children:["This document (",c.file_size||"file",") is stored securely in Company Vault."]})]}),e.jsxs("div",{className:"flex items-center justify-center gap-3 pt-2",children:[e.jsxs(n,{onClick:()=>ye(c),className:"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-lg shadow-emerald-500/20",children:[e.jsx(ue,{className:"w-4 h-4 mr-2"})," Download File"]}),e.jsxs(n,{variant:"outline",onClick:()=>window.open(c.file_url,"_blank"),className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs rounded-xl",children:[e.jsx(_e,{className:"w-4 h-4 mr-2"})," Open in Browser"]})]})]}):e.jsx("p",{className:"text-xs text-slate-400",children:"No URL available for preview"})}),e.jsxs(ge,{className:"shrink-0 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3",children:[e.jsxs("div",{className:"text-xs text-slate-400 font-mono",children:["Size: ",c.file_size||"N/A"," • Uploaded: ",c.created_at?Fe(new Date(c.created_at),"dd MMM yyyy"):"Recently"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs(n,{variant:"outline",size:"sm",className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-xl",onClick:()=>{navigator.clipboard.writeText(c.file_url),u.success("Direct document URL copied!")},children:[e.jsx(D,{className:"w-3.5 h-3.5 mr-1.5"})," Copy Link"]}),e.jsxs(n,{variant:"outline",size:"sm",className:"border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold rounded-xl",onClick:()=>window.open(c.file_url,"_blank"),children:[e.jsx(_e,{className:"w-3.5 h-3.5 mr-1.5"})," Open Link"]}),e.jsxs(n,{size:"sm",className:"bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20",onClick:()=>xe({isOpen:!0,doc:c}),children:[e.jsx(ie,{className:"w-3.5 h-3.5 mr-1.5"})," Share via WhatsApp API"]}),e.jsxs(n,{size:"sm",className:"bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl",onClick:()=>ye(c),children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1.5"})," Download"]})]})]})]})})}),';

const previewReplacement = `open:!!c,onOpenChange:s=>{if(!s){de(null);setPreviewSide("front");setPdfViewerMode("auto");setActivePreviewTruckIdx(0)}},children:e.jsx(re,{className:"w-[96vw] sm:max-w-4xl bg-slate-900 border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl overflow-hidden max-h-[96vh] flex flex-col",children:c&&(()=>{
  const isMulti = Boolean(c.attached_files && c.attached_files.length > 0);
  const activeTruck = isMulti ? (c.attached_files[activePreviewTruckIdx] || c.attached_files[0]) : null;
  const curUrl = activeTruck ? activeTruck.url : ((previewSide==="back"&&c.back_file_url)?c.back_file_url:c.file_url);
  const curTitle = activeTruck ? \`\${c.title} - \${activeTruck.truck_number}\` : (previewSide==="back"?\`\${c.title}_Back\`:\`\${c.title}_Front\`);
  const isPdf = Boolean(curUrl && (curUrl.match(/\\.(pdf)($|\\?)/i) || (activeTruck?activeTruck.name:c.file_name)?.match(/\\.pdf$/i) || c.title?.toLowerCase().includes("pdf") || c.sub_category?.toLowerCase().includes("statement")));
  const isMob = typeof navigator !== "undefined" && (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== "undefined" && window.innerWidth < 768));
  const useGoogle = pdfViewerMode === "google" || (pdfViewerMode === "auto" && isMob);
  const pdfSrc = useGoogle ? ("https://docs.google.com/gview?embedded=true&url=" + encodeURIComponent(curUrl)) : curUrl;

  return e.jsxs(e.Fragment,{children:[
    e.jsxs(ne,{className:"shrink-0 pb-2 sm:pb-3 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2",children:[
      e.jsxs("div",{children:[
        e.jsxs(oe,{className:"text-base sm:text-lg font-bold text-white flex items-center gap-2",children:[e.jsx($e,{className:"w-5 h-5 text-primary"}),c.title]}),
        e.jsxs(Ce,{className:"text-xs text-slate-400 mt-0.5",children:["Category: ",e.jsx("span",{className:"text-primary font-semibold",children:c.category})," • Sub-type: ",c.sub_category,isMulti?\` • \${c.attached_files.length} Trucks in Dossier\`:\` • Period: \${c.financial_year}\`]})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[
        c.back_file_url&&!isMulti&&e.jsxs("div",{className:"flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl",children:[
          e.jsxs(n,{size:"sm",variant:"ghost",className:\`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-3 transition-all cursor-pointer \${previewSide==="front"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,onClick:()=>setPreviewSide("front"),children:[e.jsx("span",{className:"mr-1"},"📄"),"Front"]}),
          e.jsxs(n,{size:"sm",variant:"ghost",className:\`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-3 transition-all cursor-pointer \${previewSide==="back"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,onClick:()=>setPreviewSide("back"),children:[e.jsx("span",{className:"mr-1"},"🔄"),"Back"]})
        ]}),
        isPdf&&e.jsxs("div",{className:"flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl",children:[
          e.jsxs(n,{size:"sm",variant:"ghost",className:\`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-2.5 transition-all cursor-pointer \${useGoogle?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,onClick:()=>setPdfViewerMode("google"),title:"Cloud Mobile Viewer",children:[e.jsx("span",{className:"mr-1"},"🌐"),"Cloud"]}),
          e.jsxs(n,{size:"sm",variant:"ghost",className:\`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-2.5 transition-all cursor-pointer \${!useGoogle?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,onClick:()=>setPdfViewerMode("native"),title:"Direct File",children:[e.jsx("span",{className:"mr-1"},"📄"),"Direct"]})
        ]})
      ]})
    ]}),

    /* ── Multi-Truck Selector Carousel ── */
    isMulti&&e.jsxs("div",{className:"w-full pt-2 pb-1 border-b border-slate-800/80 space-y-1.5",children:[
      e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-slate-400",children:[
        e.jsxs("span",{className:"font-bold text-emerald-400 flex items-center gap-1",children:[e.jsx("span",{children:"🚛"}),\`Select Truck to Preview (\${activePreviewTruckIdx+1} of \${c.attached_files.length}):\`]}),
        e.jsx(n,{size:"sm",variant:"outline",className:"h-6 text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md cursor-pointer",onClick:()=>{de(null);openBatchRcModal(c)},children:"➕ Add / Manage Trucks in this Dossier"})
      ]}),
      e.jsx("div",{className:"flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin",children:c.attached_files.map((trk,tIdx)=>e.jsxs(n,{
        key:tIdx,
        size:"sm",
        variant:"ghost",
        className:\`h-7 text-xs font-bold rounded-lg px-2.5 shrink-0 transition-all cursor-pointer \${activePreviewTruckIdx===tIdx?"bg-emerald-600 text-white shadow-sm":"bg-slate-950 text-slate-300 hover:text-white border border-slate-800"}\`,
        onClick:()=>setActivePreviewTruckIdx(tIdx),
        children:[e.jsx("span",{className:"mr-1"},"🚚"),trk.truck_number||\`Truck \${tIdx+1}\`]
      }))})
    ]}),

    isPdf&&isMob&&e.jsxs("div",{className:"w-full mt-2 p-2 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center justify-between gap-2 text-xs",children:[
      e.jsxs("div",{className:"flex items-center gap-1.5 text-blue-200 text-[11px] truncate",children:[
        e.jsx("span",{children:"📱"}),
        e.jsxs("span",{className:"truncate font-medium",children:[useGoogle?"Mobile Cloud Viewer Active":"Direct View Active",": Swipe & zoom pages below"]})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1 shrink-0",children:[
        e.jsxs(n,{size:"sm",variant:"outline",className:"h-6 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 rounded-md cursor-pointer px-1.5",onClick:()=>window.open(curUrl,"_blank"),children:[e.jsx(_e,{className:"w-2.5 h-2.5 mr-1"}),"Fullscreen ↗"]})
      ]})
    ]}),

    e.jsx("div",{className:"flex-1 overflow-y-auto my-2 sm:my-3 bg-slate-950 p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[420px]",children:curUrl?curUrl.match(/\\.(jpeg|jpg|gif|png|webp)($|\\?)/i)||(activeTruck?activeTruck.name:c.file_name)?.match(/\\.(jpeg|jpg|gif|png|webp)$/i)?e.jsx("img",{src:curUrl,alt:curTitle,className:"max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-lg"}):isPdf?e.jsx("iframe",{src:pdfSrc,title:curTitle,className:"w-full h-[60vh] sm:h-[65vh] rounded-lg sm:rounded-xl border border-slate-800 bg-white"}):e.jsxs("div",{className:"text-center p-8 space-y-4",children:[e.jsx(te,{className:"w-16 h-16 text-primary mx-auto opacity-60"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-white",children:curTitle}),e.jsxs("p",{className:"text-xs text-slate-400 mt-1",children:["This document is stored securely in Company Vault."]})]}),e.jsxs("div",{className:"flex items-center justify-center gap-3 pt-2",children:[e.jsxs(n,{onClick:()=>ye({file_url:curUrl,title:curTitle}),className:"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-lg shadow-emerald-500/20",children:[e.jsx(ue,{className:"w-4 h-4 mr-2"})," Download This Document"]}),e.jsxs(n,{variant:"outline",onClick:()=>window.open(curUrl,"_blank"),className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs rounded-xl",children:[e.jsx(_e,{className:"w-4 h-4 mr-2"})," Open in Browser"]})]})]}):e.jsx("p",{className:"text-xs text-slate-400",children:"No file URL available for preview"})}),
    e.jsxs(ge,{className:"shrink-0 pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3",children:[
      e.jsxs("div",{className:"text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap",children:[
        activeTruck?e.jsxs("span",{children:["Showing: ",e.jsx("strong",{className:"text-emerald-400 font-mono",children:activeTruck.truck_number})," (",activeTruck.name,")"]}):e.jsxs("span",{children:["Showing: ",e.jsx("strong",{className:"text-emerald-400",children:previewSide==="back"?"Back Side":"Front Side"})]}),
        c.back_file_url&&!isMulti&&e.jsx("span",{className:"text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20",children:"2-Sided Document"}),
        isPdf&&e.jsx("span",{className:"text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20",children:useGoogle?"Cloud Viewer":"Native Viewer"})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end",children:[
        e.jsxs(n,{variant:"outline",size:"sm",className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-xl",onClick:()=>{navigator.clipboard.writeText(curUrl),u.success("Document URL copied!")},children:[e.jsx(D,{className:"w-3.5 h-3.5 mr-1.5"})," Copy Link"]}),
        e.jsxs(n,{variant:"outline",size:"sm",className:"border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold rounded-xl",onClick:()=>window.open(curUrl,"_blank"),children:[e.jsx(_e,{className:"w-3.5 h-3.5 mr-1.5"})," Open Link"]}),
        e.jsxs(n,{size:"sm",className:"bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20",onClick:()=>ye({file_url:curUrl,title:curTitle}),children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1.5"}),activeTruck?\`Download \${activeTruck.truck_number} RC\`:"Download"]})
      ]})
    ]})
  ]});
})()})}),`;

if (!code.includes(previewTarget)) throw new Error('Preview target not found');
code = code.replace(previewTarget, previewReplacement);

// 14. Add Full-Featured Batch RC & Compilation Manager Modal
const modalsTarget = 'e.jsx(xs,{isOpen:me.isOpen,onClose:()=>xe({isOpen:!1,doc:null}),companyInfo:a,document:me.doc,allDocuments:i,selectedDocIds:P})]})}export{fs as default};';

const modalsReplacement = `e.jsx(xs,{isOpen:me.isOpen,onClose:()=>xe({isOpen:!1,doc:null}),companyInfo:a,document:me.doc,allDocuments:i,selectedDocIds:P}),

/* ── MODAL: 🚛 Bulk RC & Incremental Compilation Manager ── */
batchRcOpen&&e.jsx(le,{open:batchRcOpen,onOpenChange:setBatchRcOpen,children:e.jsxs(re,{className:"max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border-slate-800 text-white p-5 rounded-2xl shadow-2xl space-y-4",children:[
  e.jsxs(ne,{children:[
    e.jsxs(oe,{className:"text-lg font-black text-white flex items-center gap-2",children:[
      e.jsx("span",{className:"text-2xl"},"🚛"),
      batchRcTargetMode==="append"&&selectedCompilationId?"Manage & Append Fleet Truck RCs":"Upload Fleet RCs (Bulk Dossier)"
    ]}),
    e.jsx(Ce,{className:"text-xs text-slate-400",children:"Upload and bundle commercial vehicle registration certificates (RCs). Newly uploaded trucks will be appended without overwriting existing files."})
  ]}),

  /* Mode Switcher & Existing Compilation Selector */
  (()=>{
    const allCompilations=(i||[]).filter(d=>d&&(d.is_multi_file||(d.attached_files&&d.attached_files.length>0)));
    return e.jsxs("div",{className:"p-3 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2.5",children:[
      allCompilations.length>0&&e.jsxs("div",{className:"flex items-center justify-between gap-2 flex-wrap",children:[
        e.jsx("span",{className:"text-xs font-bold text-slate-300",children:"Action Mode:"}),
        e.jsxs("div",{className:"flex items-center gap-1 bg-slate-900 p-1 border border-slate-800 rounded-lg",children:[
          e.jsxs("button",{
            type:"button",
            onClick:()=>{
              setBatchRcTargetMode("append");
              const target=allCompilations.find(c=>c.id===selectedCompilationId)||allCompilations[0];
              if(target){
                setSelectedCompilationId(target.id);
                setBatchRcTitle(target.title);
                setExistingAttachedRcs(Array.isArray(target.attached_files)?[...target.attached_files]:[]);
              }
            },
            className:\`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer \${batchRcTargetMode==="append"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,
            children:[e.jsx("span",{className:"mr-1"},"➕"),"Append to Existing Dossier"]
          }),
          e.jsxs("button",{
            type:"button",
            onClick:()=>{
              setBatchRcTargetMode("new");
              setSelectedCompilationId(null);
              setBatchRcTitle("Fleet Commercial Vehicle RCs (New Batch)");
              setExistingAttachedRcs([]);
            },
            className:\`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer \${batchRcTargetMode==="new"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}\`,
            children:[e.jsx("span",{className:"mr-1"},"✨"),"Create New Dossier"]
          })
        ]})
      ]}),

      batchRcTargetMode==="append"&&allCompilations.length>1&&e.jsxs("div",{className:"space-y-1 pt-1",children:[
        e.jsx("label",{className:"text-[11px] font-bold text-slate-400",children:"Select Target Compilation to Append to:"}),
        e.jsx("select",{
          value:selectedCompilationId||"",
          onChange:evt=>{
            const sel=allCompilations.find(c=>c.id===evt.target.value);
            if(sel){
              setSelectedCompilationId(sel.id);
              setBatchRcTitle(sel.title);
              setExistingAttachedRcs(Array.isArray(sel.attached_files)?[...sel.attached_files]:[]);
            }
          },
          className:"w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-white",
          children:allCompilations.map(c=>e.jsx("option",{key:c.id,value:c.id,children:\`\${c.title} (\${c.attached_files?.length||c.rc_count||0} Trucks attached)\`}))
        })
      ]}),

      e.jsxs("div",{className:"space-y-1 pt-1",children:[
        e.jsx("label",{className:"text-[11px] font-bold text-slate-300",children:"Compilation Dossier Title *"}),
        e.jsx(N,{value:batchRcTitle,onChange:evt=>setBatchRcTitle(evt.target.value),className:"bg-slate-900 border-slate-800 text-white text-xs h-9"})
      ]})
    ]});
  })(),

  /* Currently Attached Trucks List (Additive Preservation) */
  existingAttachedRcs.length>0&&e.jsxs("div",{className:"p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2",children:[
    e.jsxs("div",{className:"flex items-center justify-between text-xs font-bold text-emerald-400",children:[
      e.jsxs("span",{className:"flex items-center gap-1.5",children:[
        e.jsx("span",{className:"text-emerald-400"},"✓"),
        \`\${existingAttachedRcs.length} Trucks Currently Attached in Dossier\`
      ]}),
      e.jsx("span",{className:"text-[10px] text-slate-400 font-normal",children:"(Existing files are preserved safely)"})
    ]}),
    e.jsx("div",{className:"max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin",children:existingAttachedRcs.map((rc,rIdx)=>e.jsxs("div",{key:rIdx,className:"flex items-center justify-between text-xs text-slate-200 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg",children:[
      e.jsxs("div",{className:"flex items-center gap-2 truncate pr-2",children:[
        e.jsx("span",{className:"text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20",children:rc.truck_number||\`Truck \${rIdx+1}\`}),
        e.jsx("span",{className:"truncate text-[11px] text-slate-300 font-mono",children:rc.name}),
        e.jsx("span",{className:"text-slate-500 text-[10px]",children:rc.size})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[
        e.jsx("button",{type:"button",onClick:()=>window.open(rc.url,"_blank"),title:"Preview this RC",className:"h-6 px-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded border border-cyan-500/30 cursor-pointer",children:"👁️ View"}),
        e.jsx("button",{
          type:"button",
          onClick:()=>{
            const trkName = rc.truck_number || \`Truck \${rIdx+1}\`;
            setExistingAttachedRcs(prev=>prev.filter((_,idx)=>idx!==rIdx));
            u.info(\`Removed \${trkName} from list. Click 'Save Changes' to update dossier.\`);
          },
          title:"Remove this truck RC",
          className:"h-6 px-1.5 text-[10px] text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/30 cursor-pointer",
          children:"🗑️ Delete"
        })
      ]})
    ]}))})
  ]}),

  /* Dropzone: Add More Trucks */
  e.jsxs("div",{className:"space-y-2",children:[
    e.jsxs("div",{className:"border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 rounded-2xl p-5 text-center space-y-2 cursor-pointer relative",children:[
      e.jsx("input",{type:"file",multiple:!0,accept:"image/*,.pdf",onChange:evt=>{
        if(evt.target.files?.length){
          setBatchRcFiles(Array.from(evt.target.files));
          u.success(\`\${evt.target.files.length} new truck RCs selected to add!\`);
        }
      },className:"absolute inset-0 opacity-0 cursor-pointer w-full h-full"}),
      e.jsx("div",{className:"text-3xl",children:"🚚"}),
      e.jsxs("span",{className:"text-xs font-bold text-emerald-400 block",children:[
        existingAttachedRcs.length>0?"Click or Drag & Drop Additional Truck RCs Here":"Click or Drag & Drop 1, 10 or 50+ Truck RC Files Here"
      ]}),
      e.jsx("span",{className:"text-[11px] text-slate-400 block",children:"Select multiple vehicle images or PDFs at once (PNG, JPG, WEBP, PDF)."})
    ]}),

    /* Queued Files List */
    batchRcFiles.length>0&&e.jsxs("div",{className:"p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2",children:[
      e.jsxs("div",{className:"flex items-center justify-between text-xs font-bold text-emerald-400",children:[
        e.jsxs("span",{children:[\`+ \${batchRcFiles.length} New Truck RCs Queued to Upload\`]}),
        e.jsx("button",{type:"button",onClick:()=>setBatchRcFiles([]),className:"text-red-400 hover:text-red-300 text-[11px] cursor-pointer",children:"Clear Queued Files"})
      ]}),
      e.jsx("div",{className:"max-h-36 overflow-y-auto space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800",children:batchRcFiles.map((f,fIdx)=>{
        const cleanName=f.name.replace(/\\.[^/.]+$/,"");
        const truckMatch=cleanName.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})/i);
        const truckNum=truckMatch?truckMatch[1].toUpperCase():\`Truck \${existingAttachedRcs.length+fIdx+1}\`;
        const willReplace=existingAttachedRcs.some(e=>e.truck_number===truckNum);

        return e.jsxs("div",{key:fIdx,className:"flex items-center justify-between text-[11px] text-slate-300 bg-slate-900 px-2 py-1 rounded",children:[
          e.jsxs("div",{className:"flex items-center gap-1.5 truncate max-w-[340px]",children:[
            e.jsx("span",{className:"font-mono text-emerald-400 font-bold",children:truckNum}),
            e.jsx("span",{className:"truncate text-slate-400 font-mono",children:f.name}),
            willReplace&&e.jsx("span",{className:"text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30 shrink-0",children:"🔄 Updates existing"})
          ]}),
          e.jsxs("span",{className:"text-slate-500 text-[10px]",children:[(f.size/(1024*1024)).toFixed(2)," MB"]})
        ]});
      })})
    ]})
  ]}),

  batchRcProgress&&e.jsxs("div",{className:"p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold animate-pulse text-center",children:["⏳ ",batchRcProgress]}),

  /* Footer Controls */
  e.jsxs("div",{className:"pt-2 border-t border-slate-800 flex items-center justify-end gap-2",children:[
    e.jsx(n,{type:"button",variant:"outline",onClick:()=>setBatchRcOpen(!1),className:"text-xs",children:"Cancel"}),
    e.jsx(n,{
      type:"button",
      disabled:batchRcUploading||(!batchRcFiles.length&&!existingAttachedRcs.length),
      onClick:batchUpload50RCs,
      className:"bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-emerald-600/30 px-4",
      children:batchRcUploading?"Uploading Truck RCs...":(batchRcFiles.length>0?\`Upload & Append \${batchRcFiles.length} RCs (Total: \${existingAttachedRcs.length+batchRcFiles.length})\`:\`Save Changes (\${existingAttachedRcs.length} Trucks)\`)
    })
  ]})
]})})
]})}export{fs as default};`;

if (!code.includes(modalsTarget)) throw new Error('Modals target not found');
code = code.replace(modalsTarget, modalsReplacement);

// Write to the destination path used by deploy script
const destPaths = [
  "C:\\Users\\Munna'\\.gemini\\antigravity\\scratch\\www.jaibhavanicargo.com\\dist\\apps\\web\\assets\\CompanyVaultPage-Bo-mp6SJ.js",
  path.join(websiteDir, 'dist', 'apps', 'web', 'assets', 'CompanyVaultPage-Bo-mp6SJ.js'),
  path.join(websiteDir, 'dist', 'assets', 'CompanyVaultPage-Bo-mp6SJ.js'),
  path.join(websiteDir, 'apps', 'web', 'dist', 'assets', 'CompanyVaultPage-Bo-mp6SJ.js'),
  path.join(websiteDir, 'apps', 'api', 'dist', 'assets', 'CompanyVaultPage-Bo-mp6SJ.js')
];

for (const dest of destPaths) {
  try {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, code, 'utf8');
    console.log('✓ Written to:', dest, '(' + code.length + ' bytes)');
  } catch (err) {
    console.warn('Could not write to:', dest, err.message);
  }
}
console.log('✓ Build successful! Final size:', code.length);
