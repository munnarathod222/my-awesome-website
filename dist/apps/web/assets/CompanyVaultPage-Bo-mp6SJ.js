import{r as o,R as es,j as e,al as ie,av as ss,ao as as,a0 as te,aq as D,an as _e,ak as ts,ar as ls,aU as Te,ad as W,bU as ve,a_ as De,a9 as we,c4 as rs,cg as Re,a8 as Ie,cw as ns,at as os,a2 as is,aE as $e,a1 as ue}from"./vendor-react-Bs5V2qFE.js";import{D as le,a as re,b as ne,c as oe,d as Ce,n as Be,s as Le,v as be,L as g,I as N,w as K,B as n,T as Ge,j as ge,t as u,p as B,C as T,O as L,o as Oe,q as cs,r as ds,S as Q,e as ee,g as se,h as ae,i as J,k as Fe,x as Pe}from"./index-DLxf9dwO.js";import{S as ms}from"./SendMailDialog-DwU-GlVi.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";function xs({isOpen:fe,onClose:G,companyInfo:d={},document:m=null,allDocuments:R=[],selectedDocIds:V=null}){const[a,z]=o.useState(""),[i,H]=o.useState(""),[v,Ne]=o.useState(""),[S,ce]=o.useState(!1),[A,q]=o.useState(m?"single":"dossier");es.useEffect(()=>{q(m?"single":"dossier")},[m,fe]);const I=o.useMemo(()=>Array.isArray(R)?V?R.filter(x=>V.has(x.id)):R:[],[R,V]),Y=o.useMemo(()=>{if(!m)return"";const x=a.trim()||"Sir / Madam",f=d.company_name||"JAI BHAVANI CARGO",l=d.company_gstin||"36DPXPR9171A1Z8";let b=`🏢 *${f} - OFFICIAL DOCUMENT SHARE*

`;return b+=`Dear *${x}*,

`,b+=`Please find the official company document from our corporate vault:

`,b+=`📄 *Document:* ${m.title}
`,b+=`📂 *Category:* ${m.category} ${m.sub_category?`(${m.sub_category})`:""}
`,m.financial_year&&m.financial_year!=="N/A"&&(b+=`📅 *Filing Period:* ${m.financial_year}
`),b+=`🏛️ *Company:* ${f}
`,b+=`🆔 *GSTIN:* ${l}
`,m.file_url&&(b+=`\n🔗 *Front Side Link:* ${m.file_url}\n`),m.back_file_url&&(b+=`\n🔗 *Back Side Link:* ${m.back_file_url}\n`),v.trim()&&(b+=`
📝 *Note:* ${v.trim()}
`),b+=`
📞 For verification or inquiries: ${d.company_phone||"+91 7794072244"}
`,b+=`🌐 ${d.company_website||"www.jaibhavanicargo.com"}`,b},[m,a,d,v]),je=o.useMemo(()=>{const x=a.trim()||"Sir / Madam",f=d.company_name||"JAI BHAVANI CARGO";let l=`🏢 *${f} - CORPORATE DOSSIER & COMPLIANCE VAULT*

`;return l+=`Dear *${x}*,

`,l+=`Please find the official corporate profile, tax registrations, banking coordinates, and compliance documents for *${f}* below:

`,l+=`📋 *COMPANY IDENTIFICATION & TAXES*
`,l+=`• Company Name: ${f}
`,l+=`• GSTIN: ${d.company_gstin||"36DPXPR9171A1Z8"}
`,d.pan_number&&(l+=`• PAN: ${d.pan_number}
`),d.tan_number&&(l+=`• TAN: ${d.tan_number}
`),(d.msme_number||d.udyam_number)&&(l+=`• MSME/Udyam: ${d.msme_number||d.udyam_number}
`),l+=`• Registered Address: ${d.company_address||"Plot no 3, Patel nagar, Ghatkesar, pin: 501301"}

`,l+=`🏦 *OFFICIAL BANKING COORDINATES*
`,l+=`• Bank Name: ${d.bank_name||"HDFC BANK"}
`,l+=`• Account Name: ${d.account_name||"JAI BHAVANI CARGO"}
`,l+=`• Account No: ${d.account_number||"50200117182677"}
`,l+=`• IFSC Code: ${d.ifsc_code||"HDFC0004480"}
`,l+=`• Branch: ${d.branch_name||"GHATKESAR BRANCH"}

`,I.length>0&&(l+=`📂 *VERIFIED VAULT DOCUMENTS (${I.length} ATTACHMENTS)*
`,I.forEach((b,me)=>{l+=`${me+1}. *${b.title}* (${b.category})
`,b.file_url&&(l+=`   🔗 Link: ${b.file_url}
`)}),l+=`
`),v.trim()&&(l+=`📝 *Note:* ${v.trim()}

`),l+=`📞 Official Contact: ${d.company_phone||"+91 7794072244"} | ✉️ ${d.company_email||"vinod@jaibhavanicargo.com"}
`,l+=`🌐 ${d.company_website||"www.jaibhavanicargo.com"}`,l},[d,I,a,v]),k=A==="single"?Y:je,$=o.useMemo(()=>{const x=String(i||"").replace(/[^0-9]/g,"");return x.length===10?`91${x}`:(x.length===12&&x.startsWith("91"),x)},[i]),O=async()=>{if(!$||$.length<10){u.error("Please enter a valid 10-digit mobile number");return}ce(!0);const x=a.trim()||"Valued Client";try{const f=await fetch("/hcgi/api/whatsapp/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({campaignName:"general_update",destination:$,userName:x,templateParams:[x,k],rawText:k,media:A==="single"&&m?.file_url?{url:m.file_url,filename:`${m.title.replace(/[^a-zA-Z0-9_-]/g,"_")}.pdf`}:null})}),l=await f.json();f.ok&&l.success?(u.success(`WhatsApp message sent successfully via Aisensy API! Message ID: ${l.messageId||"DELIVERED"}`),G()):u.error(`Aisensy API Notice: ${l.error||"Could not dispatch message"}`)}catch(f){console.error("WhatsApp dispatch error:",f),u.error(`Network error: ${f.message}`)}finally{ce(!1)}},c=()=>{const x=encodeURIComponent(k),f=$?`https://wa.me/${$}?text=${x}`:`https://wa.me/?text=${x}`;window.open(f,"_blank")},de=()=>{navigator.clipboard.writeText(k),u.success("WhatsApp message & document links copied to clipboard!")};return e.jsx(le,{open:fe,onOpenChange:G,children:e.jsxs(re,{className:"max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",children:[e.jsxs(ne,{className:"shrink-0 pb-3 border-b border-slate-800",children:[e.jsxs(oe,{className:"text-xl font-extrabold text-white flex items-center gap-2",children:[e.jsx(ie,{className:"w-5 h-5 text-emerald-400"}),"Share Company Documents via WhatsApp API"]}),e.jsx(Ce,{className:"text-xs text-slate-400",children:"Dispatch verified company certificates, tax filings, and corporate dossiers directly via Aisensy WhatsApp Business API."})]}),e.jsxs("div",{className:"space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none",children:[m&&e.jsx(Be,{value:A,onValueChange:q,className:"w-full",children:e.jsxs(Le,{className:"grid grid-cols-2 bg-slate-950 p-1 border border-slate-800 rounded-xl h-10",children:[e.jsxs(be,{value:"single",className:"text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg",children:["📄 Single Document (",m.title,")"]}),e.jsxs(be,{value:"dossier",className:"text-xs font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg",children:["🏢 Complete Corporate Dossier (",I.length," Docs)"]})]})}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"text-xs font-bold text-slate-300 flex items-center gap-1.5",children:[e.jsx(ss,{className:"w-3.5 h-3.5 text-primary"})," Recipient Name / Designation"]}),e.jsx(N,{placeholder:"e.g. Bank Manager / Auditor / Client",value:a,onChange:x=>z(x.target.value),className:"bg-slate-900 border-slate-700 text-xs h-9 text-white rounded-xl"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs(g,{className:"text-xs font-bold text-slate-300 flex items-center gap-1.5",children:[e.jsx(as,{className:"w-3.5 h-3.5 text-emerald-400"})," WhatsApp Mobile Number *"]}),e.jsx(N,{type:"tel",placeholder:"e.g. 9876543210 or 919876543210",value:i,onChange:x=>H(x.target.value),className:"bg-slate-900 border-slate-700 text-xs h-9 text-emerald-300 font-mono rounded-xl"})]}),e.jsxs("div",{className:"sm:col-span-2 space-y-1.5 pt-1",children:[e.jsx(g,{className:"text-xs font-semibold text-slate-400",children:"Custom Note (Optional)"}),e.jsx(N,{placeholder:"e.g. Please find our audited financials for loan processing.",value:v,onChange:x=>Ne(x.target.value),className:"bg-slate-900 border-slate-700 text-xs h-9 text-slate-200 rounded-xl"})]})]}),A==="single"&&m&&e.jsxs("div",{className:"p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"p-2 bg-emerald-500/10 rounded-lg text-emerald-400",children:e.jsx(te,{className:"w-4 h-4"})}),e.jsxs("div",{children:[e.jsx("h5",{className:"font-bold text-xs text-white",children:m.title}),e.jsxs("p",{className:"text-[10px] text-slate-400",children:[m.category," • ",m.financial_year||"Current"]})]})]}),m.file_url&&e.jsx(K,{variant:"outline",className:"text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10",children:"Link Attached"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(g,{className:"text-xs font-bold text-slate-300 flex items-center gap-1.5",children:[e.jsx(ie,{className:"w-3.5 h-3.5 text-emerald-400"})," WhatsApp Message Live Preview"]}),e.jsxs(n,{variant:"ghost",size:"sm",onClick:de,className:"h-7 text-[11px] text-slate-400 hover:text-white px-2 rounded-lg",children:[e.jsx(D,{className:"w-3 h-3 mr-1"})," Copy"]})]}),e.jsx(Ge,{value:k,readOnly:!0,rows:8,className:"bg-slate-950 border-slate-800 text-slate-200 text-xs font-mono rounded-xl p-3 leading-relaxed resize-none selection:bg-emerald-500/30"})]})]}),e.jsxs(ge,{className:"shrink-0 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2 justify-end",children:[e.jsx(n,{variant:"ghost",size:"sm",onClick:G,className:"w-full sm:w-auto text-xs text-slate-400 hover:text-white rounded-xl h-10",children:"Cancel"}),e.jsxs(n,{variant:"outline",size:"sm",onClick:c,className:"w-full sm:w-auto text-xs font-bold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-xl h-10",children:[e.jsx(_e,{className:"w-3.5 h-3.5 mr-1.5"})," WhatsApp Web / App"]}),e.jsx(n,{size:"sm",onClick:O,disabled:S,className:"w-full sm:w-auto text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 shadow-lg shadow-emerald-600/25 px-5",children:S?e.jsxs(e.Fragment,{children:[e.jsx(ts,{className:"w-4 h-4 mr-1.5 animate-spin"})," Dispatching API..."]}):e.jsxs(e.Fragment,{children:[e.jsx(ls,{className:"w-3.5 h-3.5 mr-1.5"})," Send Direct WhatsApp (Aisensy API)"]})})]})]})})}const Ee=["All","Registration & Identity","Tax Returns (ITR)","Tax Returns (GST)","Financials & Banking","Loans & Legal","Other"],Me={"Registration & Identity":["GST Registration Certificate","PAN Card","Certificate of Incorporation (COI)","MSME / Udyam Certificate","Shop & Establishment License","Trademark / ISO Certificate","Other License"],"Tax Returns (ITR)":["ITR-V (Acknowledgement)","Computation Sheet","Tax Audit Report (Form 3CD)","Advance Tax Receipt","Self Assessment Tax Challan"],"Tax Returns (GST)":["GSTR-1 Monthly Return","GSTR-3B Summary Return","GSTR-9 Annual Return","GST Payment Challan","GSTR-2B Recon Sheet"],"Financials & Banking":["Audited Balance Sheet","Profit & Loss Statement","Bank Statement (6-12 Months)","Cancelled Cheque / Bank Letter","Net Worth Certificate","Form 26AS / AIS Statement"],"Loans & Legal":["Sanction Letter","Loan Account Statement","Lease / Rental Agreement","Director / Partner Identity Proof","Board Resolution"],Other:["General Document","Client Contract","Insurance Policy"]},Ue=["N/A","FY 2026-27","FY 2025-26","FY 2024-25","FY 2023-24","FY 2022-23","FY 2021-22"];function fs(){const[fe,G]=o.useState(!0),[d,m]=o.useState(!1),[editingDocId,setEditingDocId]=o.useState(null),[hasBackSide,setHasBackSide]=o.useState(!1),[selectedBackFile,setSelectedBackFile]=o.useState(null),[previewSide,setPreviewSide]=o.useState("front"),[pdfViewerMode,setPdfViewerMode]=o.useState("auto"),[batchRcOpen,setBatchRcOpen]=o.useState(!1),[batchRcFiles,setBatchRcFiles]=o.useState([]),[batchRcTitle,setBatchRcTitle]=o.useState("Fleet Commercial Vehicle RCs (Consolidated Compilation)"),[batchRcUploading,setBatchRcUploading]=o.useState(!1),[batchRcProgress,setBatchRcProgress]=o.useState(""),[batchRcTargetMode,setBatchRcTargetMode]=o.useState("append"),[selectedCompilationId,setSelectedCompilationId]=o.useState(null),[existingAttachedRcs,setExistingAttachedRcs]=o.useState([]),[activePreviewTruckIdx,setActivePreviewTruckIdx]=o.useState(0),[R,V]=o.useState(!1),[a,z]=o.useState({id:"companysettings",company_name:"JAI BHAVANI CARGO",company_gstin:"36DPXPR9171A1Z8",pan_number:"",tan_number:"",cin_number:"",msme_number:"",udyam_number:"",company_address:"Plot no 3, Patel nagar, Ghatkesar, pin: 501301",company_phone:"+91 7794072244",company_email:"vinod@jaibhavanicargo.com",company_website:"www.jaibhavanicargo.com",bank_name:"HDFC BANK",account_name:"JAI BHAVANI CARGO",account_number:"50200117182677",ifsc_code:"HDFC0004480",branch_name:"GHATKESAR BRANCH",company_docs_json:"[]"}),[i,H]=o.useState([]),[v,Ne]=o.useState(""),[S,ce]=o.useState("All"),[A,q]=o.useState("All"),[I,Y]=o.useState(!1),[je,k]=o.useState(!1),[$,O]=o.useState(!1),[c,de]=o.useState(null),[x,f]=o.useState(!1),[l,b]=o.useState({recipient:"",subject:"",body:"",html:"",label:""}),[me,xe]=o.useState({isOpen:!1,doc:null}),[F,Ve]=o.useState(!0),[P,he]=o.useState(new Set);o.useEffect(()=>{Array.isArray(i)&&he(new Set(i.map(s=>s.id)))},[i]);const ye=s=>{if(!s?.file_url)return u.error("No file URL available for download");const t=document.createElement("a");t.href=s.file_url,t.download=s.file_name||s.title||"document",t.target="_blank",document.body.appendChild(t),t.click(),document.body.removeChild(t),u.success(`Downloading "${s.title}"...`)},ze=s=>{he(t=>{const r=new Set(t);return r.has(s)?r.delete(s):r.add(s),r})},He=()=>{P.size===i.length?he(new Set):he(new Set(i.map(s=>s.id)))},Ye=()=>{const s=i.slice(0,15).map(r=>`<tr><td style="padding:5px 0;font-size:12px;color:#64748b">${r.category||"—"}</td><td style="padding:5px 0;font-size:12px;color:#1e293b">${r.title||"—"}</td><td style="padding:5px 0;font-size:12px;color:#6366f1">${r.financial_year||"—"}</td></tr>`).join(""),t=`<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:20px 24px"><p style="color:#94a3b8;font-size:11px;font-weight:700;letter-spacing:2px;margin:0 0 6px">JAI BHAVANI CARGO</p><h2 style="color:#f8fafc;font-size:20px;font-weight:800;margin:0">Company Document Vault Index</h2><p style="color:#64748b;font-size:12px;margin:6px 0 0">${i.length} documents stored</p></div><div style="padding:20px 24px;background:#f8fafc"><table style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">CATEGORY</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">DOCUMENT</th><th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;padding-bottom:8px;letter-spacing:1px">FY</th></tr></thead><tbody>${s}</tbody></table>${i.length>15?`<p style="font-size:11px;color:#94a3b8;margin-top:10px">+ ${i.length-15} more documents</p>`:""}<p style="margin-top:14px;font-size:11px;color:#94a3b8">Company: ${a.company_name} | GSTIN: ${a.company_gstin}</p></div></div>`;b({recipient:"",subject:"Company Vault Document Index – Jai Bhavani Cargo",body:"Please find the company document vault index below.",html:t,label:"Vault Document Index"}),f(!0)},[h,E]=o.useState({title:"",category:"Tax Returns (ITR)",sub_category:"ITR-V (Acknowledgement)",financial_year:"FY 2024-25",notes:"",file_url:"",back_file_url:""}),[M,Ae]=o.useState(null),[p,y]=o.useState({...a});o.useEffect(()=>{We()},[]);const We=async()=>{G(!0);try{let s;try{s=await B.collection("company_settings").getOne("companysettings",{$autoCancel:!1})}catch{const r=await B.collection("company_settings").getList(1,1,{$autoCancel:!1});r.items?.length>0&&(s=r.items[0])}if(s){z({id:s.id,company_name:s.company_name||"JAI BHAVANI CARGO",company_gstin:s.company_gstin||"36DPXPR9171A1Z8",pan_number:s.pan_number||"",tan_number:s.tan_number||"",cin_number:s.cin_number||"",msme_number:s.msme_number||"",udyam_number:s.udyam_number||"",company_address:s.company_address||"",company_phone:s.company_phone||"",company_email:s.company_email||"",company_website:s.company_website||"",bank_name:s.bank_name||"",account_name:s.account_name||"",account_number:s.account_number||"",ifsc_code:s.ifsc_code||"",branch_name:s.branch_name||"",company_docs_json:s.company_docs_json||"[]"});try{const t=JSON.parse(s.company_docs_json||"[]");H(Array.isArray(t)?t:[])}catch{H([])}}}catch(s){console.error("Error loading company data:",s),u.error("Failed to load company vault details")}finally{G(!1)}},Je=async s=>{s.preventDefault(),m(!0);try{const t={...p};await B.collection("company_settings").update(a.id,t,{$autoCancel:!1}),z({...p}),u.success("Company profile & tax details updated successfully!"),O(!1)}catch(t){console.error("Error saving company details:",t),u.error("Failed to update company settings")}finally{m(!1)}},X=(s="Tax Returns (ITR)",t="ITR-V (Acknowledgement)")=>{
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
    let t=h.file_url.trim(),r=M?M.name:(t?"External Link":"Document"),w=M?`${(M.size/(1024*1024)).toFixed(2)} MB`:"N/A";
    if(M){
      const _=new FormData;
      _.append("file",M);
      _.append("truck_id","COMPANY_VAULT");
      _.append("document_type","Other");
      _.append("document_name",h.title.trim());
      _.append("notes",`Company Vault: ${h.title} (${h.category})`);
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
      _b.append("document_name",`${h.title.trim()} (Back Side)`);
      _b.append("notes",`Company Vault: ${h.title} (Back Side)`);
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
      u.success(`"${h.title}" updated successfully!`);
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
      u.success(`"${C.title}" uploaded to Company Vault!`);
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
    u.error(`Failed to save document: ${msg}`);
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
      u.info(`Uploading ${batchRcFiles.length} truck RCs... Please wait.`);
      for(let idx=0;idx<batchRcFiles.length;idx++){
        const file=batchRcFiles[idx];
        setBatchRcProgress(`Uploading truck RC ${idx+1} of ${batchRcFiles.length}: ${file.name}`);
        const formData=new FormData();
        formData.append("file",file);
        formData.append("truck_id","FLEET_RC_BUNDLE");
        formData.append("document_type","RC");
        formData.append("document_name",file.name);
        formData.append("status","Active");
        formData.append("expiry_date","2099-12-31T00:00:00.000Z");
        const res=await B.collection("truck_documents").create(formData,{$autoCancel:!1});
        const fileUrl=B.files.getURL(res,res.file);
        const cleanName=file.name.replace(/\.[^/.]+$/,"");
        const truckMatch=cleanName.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})/i);
        const truckNum=truckMatch?truckMatch[1].toUpperCase():`Truck ${existingAttachedRcs.length+idx+1}`;
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
    const finalTitle=batchRcTitle.trim()||`Fleet Commercial Vehicle RCs (${totalCount} Trucks)`;
    let updatedList;

    if(batchRcTargetMode==="append"&&selectedCompilationId){
      updatedList=i.map(doc=>{
        if(doc.id===selectedCompilationId){
          return {
            ...doc,
            title:finalTitle,
            file_url:merged[0]?.url||doc.file_url,
            file_size:`${totalCount} Truck RCs Attached`,
            is_multi_file:!0,
            rc_count:totalCount,
            file_count:totalCount,
            attached_files:merged,
            updated_at:new Date().toISOString()
          };
        }
        return doc;
      });
      u.success(`Successfully updated compilation! Now contains ${totalCount} truck RCs.`);
    }else{
      const newDoc={
        id:"vault_"+Date.now(),
        title:finalTitle,
        category:"Fleet & Vehicle Documents",
        sub_category:"Commercial Vehicle RC Compilation",
        financial_year:"N/A",
        file_url:merged[0]?.url||"",
        file_size:`${totalCount} Truck RCs Attached`,
        notes:"Consolidated commercial vehicle registration certificates for fleet financing & bank compliance.",
        is_multi_file:!0,
        rc_count:totalCount,
        file_count:totalCount,
        attached_files:merged,
        created_at:new Date().toISOString()
      };
      updatedList=[newDoc,...i];
      u.success(`Successfully created compilation with ${totalCount} truck RCs!`);
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
},qe=async(s,t)=>{if(window.confirm(`Are you sure you want to delete "${t}" from Company Vault?`))try{const r=i.filter(C=>C.id!==s),w=JSON.stringify(r);await B.collection("company_settings").update(a.id,{company_docs_json:w},{$autoCancel:!1}),H(r),z(C=>({...C,company_docs_json:w})),u.success("Document deleted successfully")}catch(r){console.error("Error deleting document:",r),u.error("Failed to delete document")}},Se=o.useMemo(()=>Array.isArray(i)?i.filter(s=>{if(!s)return!1;const t=S==="All"||s.category===S,r=A==="All"||s.financial_year===A,w=(s.title||s.file_name||"Document").toLowerCase(),C=(s.sub_category||"").toLowerCase(),j=(s.notes||"").toLowerCase(),U=v.trim().toLowerCase(),_=!U||w.includes(U)||C.includes(U)||j.includes(U);return t&&r&&_}):[],[i,S,A,v]),Z=o.useMemo(()=>{if(!Array.isArray(i))return{total:0,itr:0,gst:0,reg:0,fin:0};const s=i.length,t=i.filter(j=>j&&j.category==="Tax Returns (ITR)").length,r=i.filter(j=>j&&j.category==="Tax Returns (GST)").length,w=i.filter(j=>j&&j.category==="Registration & Identity").length,C=i.filter(j=>j&&j.category==="Financials & Banking").length;return{total:s,itr:t,gst:r,reg:w,fin:C}},[i]),pe=o.useMemo(()=>{let s=`🏢 *${a.company_name||"JAI BHAVANI CARGO"} - OFFICIAL COMPANY DOSSIER*
`;s+=`--------------------------------------------------
`,s+=`📍 *Registered Address*: ${a.company_address||"N/A"}
`,s+=`📧 *Email*: ${a.company_email||"N/A"} | 📞 *Phone*: ${a.company_phone||"N/A"}

`,s+=`📌 *REGISTRATION & TAX IDENTIFIER NUMBERS*:
`,s+=`• GSTIN: ${a.company_gstin||"N/A"}
`,s+=`• PAN Number: ${a.pan_number||"N/A"}
`,s+=`• TAN Number: ${a.tan_number||"N/A"}
`,s+=`• CIN / Reg No: ${a.cin_number||"N/A"}
`,s+=`• MSME / Udyam: ${a.udyam_number||a.msme_number||"N/A"}

`,s+=`🏦 *BANK ACCOUNT DETAILS (FOR PAYMENTS & LOANS)*:
`,s+=`• Bank Name: ${a.bank_name||"HDFC BANK"}
`,s+=`• Account Name: ${a.account_name||a.company_name}
`,s+=`• Account Number: ${a.account_number||"N/A"}
`,s+=`• IFSC Code: ${a.ifsc_code||"N/A"}
`,s+=`• Branch: ${a.branch_name||"N/A"}

`;const t=i.filter(r=>r&&P.has(r.id));return s+=`📁 *COMPANY VAULT DOCUMENTS (${t.length} ATTACHED)*:
`,t.length===0?s+=`(No files selected in shared dossier)
`:t.forEach((r,w)=>{s+=`${w+1}. [${r.category}] ${r.title} ${r.financial_year!=="N/A"?`(${r.financial_year})`:""}
`,r.file_url&&(F?s+=`   🔗 Direct Download Link: ${r.file_url}
`:s+=`   🔒 Download Access: Restricted / View Only
`)}),s+=`
--------------------------------------------------
`,s+="Generated via Jai Bhavani Cargo Corporate Vault System.",s},[a,i,P,F]),Xe=()=>{navigator.clipboard.writeText(pe),u.success("Company Dossier details & download links copied to clipboard!")},Ze=()=>{const s=encodeURIComponent(pe);window.open(`https://wa.me/?text=${s}`,"_blank")},Qe=()=>{const s=`<div style="font-family: monospace; white-space: pre-wrap; font-size: 13px; color: #1e293b; line-height: 1.5; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">${pe}</div>`;b({recipient:a.company_email||"",subject:"Company Dossier Credentials - Jai Bhavani Cargo",body:`Dear Team,

Please find the Jai Bhavani Cargo official company dossier and active documents attached below.

Regards,
Vinod kumar Rathod`,html:s,label:"Company Vault Dossier"}),f(!0)};return e.jsxs("div",{className:"space-y-6 pb-12 animate-in fade-in duration-300",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/60 backdrop-blur p-6 rounded-2xl border border-border",children:[e.jsx("div",{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"p-2 bg-primary/10 rounded-xl text-primary",children:e.jsx(Te,{className:"w-6 h-6"})}),e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",children:["Company Document Vault",e.jsx(K,{variant:"outline",className:"text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono",children:"🔒 Secure Corporate Hub"})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Centralized vault for loan applications, bank compliance, ITR returns & GST filings."})]})]})}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2.5",children:[e.jsxs(n,{variant:"outline",size:"sm",className:"h-10 border-primary/30 text-primary hover:bg-primary/10 font-medium",onClick:()=>{y({...a}),O(!0)},children:[e.jsx(W,{className:"w-4 h-4 mr-2"}),"Edit Company Info & Tax IDs"]}),e.jsxs(n,{variant:"secondary",size:"sm",className:"h-10 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 font-semibold",onClick:()=>k(!0),children:[e.jsx(ve,{className:"w-4 h-4 mr-2"}),"⚡ 1-Click Share Company Dossier"]}),e.jsxs(n,{size:"sm",className:"h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 px-4 border-none",onClick:()=>xe({isOpen:!0,doc:null}),children:[e.jsx(ie,{className:"w-4 h-4 mr-2"}),"WhatsApp API Share"]}),e.jsxs(n,{size:"sm",variant:"outline",className:"h-10 font-semibold text-blue-400 border-blue-500/30 hover:bg-blue-500/10",onClick:Ye,children:[e.jsx(De,{className:"w-4 h-4 mr-2"}),"Email Vault Index"]}),e.jsxs(n,{size:"sm",className:"h-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 cursor-pointer mr-1",onClick:()=>openBatchRcModal(),children:[e.jsx("span",{className:"mr-1.5"},"🚛"),"+ Upload / Manage Truck RCs"]}),
e.jsxs(n,{size:"sm",className:"h-10 font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25",onClick:()=>X(),children:[e.jsx(we,{className:"w-4 h-4 mr-2"}),"+ Upload Vault Document"]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-5 gap-3.5",children:[e.jsx(T,{className:"bg-card/40 border-border/80",children:e.jsxs(L,{className:"p-4 flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:"Total Vault Files"}),e.jsx("h3",{className:"text-2xl font-bold font-mono text-foreground",children:Z.total})]}),e.jsx(te,{className:"w-7 h-7 text-primary/70"})]})}),e.jsx(T,{className:"bg-card/40 border-border/80",children:e.jsxs(L,{className:"p-4 flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:"ITR Returns"}),e.jsx("h3",{className:"text-2xl font-bold font-mono text-emerald-400",children:Z.itr})]}),e.jsx(rs,{className:"w-7 h-7 text-emerald-400/70"})]})}),e.jsx(T,{className:"bg-card/40 border-border/80",children:e.jsxs(L,{className:"p-4 flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:"GST Returns"}),e.jsx("h3",{className:"text-2xl font-bold font-mono text-cyan-400",children:Z.gst})]}),e.jsx(Re,{className:"w-7 h-7 text-cyan-400/70"})]})}),e.jsx(T,{className:"bg-card/40 border-border/80",children:e.jsxs(L,{className:"p-4 flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:"Certificates & PAN"}),e.jsx("h3",{className:"text-2xl font-bold font-mono text-purple-400",children:Z.reg})]}),e.jsx(W,{className:"w-7 h-7 text-purple-400/70"})]})}),e.jsx(T,{className:"bg-card/40 border-border/80 col-span-2 md:col-span-1",children:e.jsxs(L,{className:"p-4 flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-medium",children:"Audited & Bank Docs"}),e.jsx("h3",{className:"text-2xl font-bold font-mono text-amber-400",children:Z.fin})]}),e.jsx(Ie,{className:"w-7 h-7 text-amber-400/70"})]})})]}),e.jsxs(T,{className:"bg-card/60 border-border/80",children:[e.jsx(Oe,{className:"pb-3 border-b border-border/60",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsxs(cs,{className:"text-base font-bold text-foreground flex items-center gap-2",children:[e.jsx(W,{className:"w-4 h-4 text-primary"}),a.company_name," - Tax & Banking Profile"]}),e.jsx(ds,{className:"text-xs",children:"Official business identifiers ready for instant loan & client compliance."})]}),e.jsx(n,{variant:"ghost",size:"sm",className:"h-8 text-xs text-muted-foreground hover:text-foreground",onClick:()=>{y({...a}),O(!0)},children:"Edit Identifiers ✏️"})]})}),e.jsxs(L,{className:"pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-muted-foreground",children:"GSTIN Number"}),e.jsx("p",{className:"font-mono font-bold text-foreground text-sm flex items-center gap-1",children:a.company_gstin||"Not Provided"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-muted-foreground",children:"PAN Number"}),e.jsx("p",{className:"font-mono font-bold text-foreground text-sm",children:a.pan_number||"ABCDE1234F (Sample)"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-muted-foreground",children:"TAN / CIN Number"}),e.jsx("p",{className:"font-mono font-bold text-foreground text-sm",children:a.tan_number||a.cin_number||"Not Provided"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-muted-foreground",children:"MSME / Udyam Reg"}),e.jsx("p",{className:"font-mono font-bold text-foreground text-sm",children:a.udyam_number||a.msme_number||"Not Provided"})]}),e.jsxs("div",{className:"space-y-1 md:col-span-2",children:[e.jsx("span",{className:"text-muted-foreground",children:"Registered Address"}),e.jsx("p",{className:"font-medium text-foreground truncate",children:a.company_address||"Plot no 3, Patel nagar, Ghatkesar"})]}),e.jsxs("div",{className:"space-y-1 md:col-span-2",children:[e.jsx("span",{className:"text-muted-foreground",children:"Primary Bank Account"}),e.jsxs("p",{className:"font-mono font-semibold text-foreground truncate",children:[a.bank_name," - A/C: ",a.account_number," (IFSC: ",a.ifsc_code,")"]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsx("div",{onClick:()=>X("Tax Returns (ITR)","ITR-V (Acknowledgement)"),className:"p-4 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all duration-200 group",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full",children:"⚡ Quick Action"}),e.jsx("h4",{className:"font-bold text-foreground text-sm group-hover:text-emerald-400 transition-colors",children:"Upload ITR Return"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Upload ITR-V, Computation Sheet, or Form 3CD Audit Report."})]}),e.jsx(ns,{className:"w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform"})]})}),e.jsx("div",{onClick:()=>X("Tax Returns (GST)","GSTR-3B Summary Return"),className:"p-4 bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all duration-200 group",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-full",children:"⚡ Quick Action"}),e.jsx("h4",{className:"font-bold text-foreground text-sm group-hover:text-cyan-400 transition-colors",children:"Upload GST Return"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Upload Monthly GSTR-1, GSTR-3B, or Annual GSTR-9 filing."})]}),e.jsx(Re,{className:"w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform"})]})}),e.jsx("div",{onClick:()=>X("Registration & Identity","GST Registration Certificate"),className:"p-4 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 rounded-2xl cursor-pointer transition-all duration-200 group",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded-full",children:"⚡ Quick Action"}),e.jsx("h4",{className:"font-bold text-foreground text-sm group-hover:text-purple-400 transition-colors",children:"Upload Registration Certificate"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Upload GST Cert, PAN, COI, MSME / Udyam, or Trade License."})]}),e.jsx(W,{className:"w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform"})]})})]}),e.jsxs("div",{className:"flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card/40 p-4 rounded-xl border border-border",children:[e.jsxs("div",{className:"relative flex-1",children:[e.jsx(os,{className:"w-4 h-4 absolute left-3 top-3 text-muted-foreground"}),e.jsx(N,{type:"text",placeholder:"Search by document title, category, or period...",value:v,onChange:s=>Ne(s.target.value),className:"pl-9 bg-background/80 h-10 text-xs"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-44",children:e.jsxs(Q,{value:S,onValueChange:ce,children:[e.jsx(ee,{className:"bg-background/80 h-10 text-xs",children:e.jsx(se,{placeholder:"Category..."})}),e.jsx(ae,{children:Ee.map(s=>e.jsx(J,{value:s,className:"text-xs",children:s},s))})]})}),e.jsx("div",{className:"w-36",children:e.jsxs(Q,{value:A,onValueChange:q,children:[e.jsx(ee,{className:"bg-background/80 h-10 text-xs",children:e.jsx(se,{placeholder:"Financial Year..."})}),e.jsxs(ae,{children:[e.jsx(J,{value:"All",className:"text-xs",children:"All FYs"}),Ue.filter(s=>s!=="N/A").map(s=>e.jsx(J,{value:s,className:"text-xs",children:s},s))]})]})})]})]}),Se.length===0?e.jsx(T,{className:"bg-card/40 border-dashed border-2 border-border p-12 text-center",children:e.jsxs("div",{className:"max-w-md mx-auto space-y-4",children:[e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto",children:e.jsx(te,{className:"w-6 h-6"})}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"text-lg font-bold text-foreground",children:"No documents found"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:v||S!=="All"?"No vault documents match your current filter query.":"Start uploading your company registration certificates, ITR returns, and GST filings."})]}),e.jsxs(n,{size:"sm",onClick:()=>X(),children:[e.jsx(we,{className:"w-4 h-4 mr-2"}),"Upload First Document"]})]})}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:Se.map(s=>{const t=s.category==="Tax Returns (ITR)",r=s.category==="Tax Returns (GST)",w=s.category==="Registration & Identity";return e.jsxs(T,{className:"bg-card/60 border-border/80 hover:border-primary/40 transition-all duration-200 group relative flex flex-col justify-between",children:[e.jsx(Oe,{className:"pb-3",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[e.jsx(K,{variant:"outline",className:`text-[10px] font-semibold ${t?"bg-emerald-500/10 text-emerald-400 border-emerald-500/20":r?"bg-cyan-500/10 text-cyan-400 border-cyan-500/20":w?"bg-purple-500/10 text-purple-400 border-purple-500/20":"bg-amber-500/10 text-amber-400 border-amber-500/20"}`,children:s.category}),s.financial_year&&s.financial_year!=="N/A"&&e.jsx(K,{variant:"secondary",className:"text-[10px] font-mono",children:s.financial_year}),
(s.back_file_url||s.has_back_side)&&e.jsx(K,{variant:"outline",className:"text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border-cyan-500/30",children:"🔄 Front + Back"}),
(s.is_multi_file||(s.attached_files&&s.attached_files.length>0))&&e.jsx(K,{variant:"outline",className:"text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/30",children:`🚛 ${s.attached_files?.length||s.rc_count||1} Trucks Attached`})]}),e.jsx("h3",{className:"font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors",children:s.title}),e.jsxs("p",{className:"text-[11px] text-muted-foreground font-medium",children:["Type: ",s.sub_category]})]}),e.jsx("div",{className:"flex items-center gap-1",children:e.jsx(n,{variant:"ghost",size:"icon",className:"h-8 w-8 text-destructive hover:bg-destructive/10",onClick:()=>qe(s.id,s.title),title:"Delete Document",children:e.jsx(is,{className:"w-3.5 h-3.5"})})})]})}),e.jsxs(L,{className:"pt-0 space-y-3",children:[s.notes&&e.jsxs("p",{className:"text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg line-clamp-2 italic",children:['"',s.notes,'"']}),e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50",children:[e.jsxs("span",{children:["Uploaded: ",s.created_at?Fe(new Date(s.created_at),"dd MMM yyyy"):"Recently"]}),e.jsx("span",{className:"font-mono",children:s.file_size||"File"})]}),e.jsxs("div",{className:"space-y-1.5 pt-2 border-t border-border/50",children:[
  (s.is_multi_file||(s.attached_files&&s.attached_files.length>0))&&e.jsxs(n,{size:"sm",className:"w-full h-8 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 transition-all",onClick:()=>openBatchRcModal(s),children:[
    e.jsx("span",{children:"➕"}),
    `Add / Manage Truck RCs (${s.attached_files?.length||s.rc_count||1} Trucks)`
  ]}),
  e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-bold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm",onClick:()=>{setActivePreviewTruckIdx(0);de(s);setPreviewSide("front")},disabled:!s.file_url,title:"View & Preview Document",children:[e.jsx($e,{className:"w-3.5 h-3.5 mr-1"}),"View Document"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-8 text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm",onClick:()=>ye(s),disabled:!s.file_url,title:"Download Document",children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1"}),"Download"]})
  ]}),
  e.jsxs("div",{className:"grid grid-cols-3 gap-1.5",children:[
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>xe({isOpen:!0,doc:s}),title:"Share via WhatsApp",children:[e.jsx("span",{children:"💬"}),"WhatsApp"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>handleOpenEdit(s),title:"Edit Document Details",children:[e.jsx("span",{children:"✏️"}),"Edit"]}),
    e.jsxs(n,{variant:"outline",size:"sm",className:"h-7 text-[11px] font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700 hover:text-white border-slate-700/60 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all",onClick:()=>{s.file_url?(navigator.clipboard.writeText(s.file_url),u.success(`Link for "${s.title}" copied!`)):u.error("No URL available to copy")},title:"Copy Link",children:[e.jsx(De,{className:"w-3 h-3 mr-1"}),"Copy"]})
  ]})
]})]})]},s.id)})}),e.jsx(le,{open:I,onOpenChange:s=>{if(!s){setEditingDocId(null);setHasBackSide(!1);setSelectedBackFile(null)}Y(s)},children:e.jsxs(re,{className:"sm:max-w-lg bg-card border-border",children:[e.jsx(ne,{children:e.jsxs(oe,{className:"text-lg font-bold text-foreground flex items-center gap-2",children:[e.jsx(we,{className:"w-5 h-5 text-primary"}),editingDocId?"Edit Company Vault Document":"Upload Company Vault Document"]})}),
editingDocId&&h.file_url&&e.jsxs("div",{className:"px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs flex items-center justify-between text-slate-300",children:[
  e.jsxs("span",{className:"truncate mr-2",children:["Current Front File: ",e.jsx("span",{className:"font-mono text-cyan-400 font-bold",children:h.file_url.split("/").pop().slice(0,35)})]}),
  e.jsx("a",{href:h.file_url,target:"_blank",rel:"noreferrer",className:"text-cyan-400 hover:underline font-bold text-[11px] shrink-0",children:"Preview Front ↗"})
]}),e.jsxs("form",{onSubmit:Ke,className:"space-y-4 py-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Document Title *"}),e.jsx(N,{type:"text",placeholder:"e.g. ITR-V Acknowledgement FY 2024-25, GST Certificate",value:h.title,onChange:s=>E({...h,title:s.target.value}),className:"bg-background h-10 text-xs",required:!0})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Category *"}),e.jsxs(Q,{value:h.category,onValueChange:s=>{const t=Me[s]||[];E({...h,category:s,sub_category:t[0]||"General"})},children:[e.jsx(ee,{className:"bg-background h-10 text-xs",children:e.jsx(se,{placeholder:"Select Category"})}),e.jsx(ae,{children:Ee.filter(s=>s!=="All").map(s=>e.jsx(J,{value:s,className:"text-xs",children:s},s))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Sub-Type / Filing Type"}),e.jsxs(Q,{value:h.sub_category,onValueChange:s=>E({...h,sub_category:s}),children:[e.jsx(ee,{className:"bg-background h-10 text-xs",children:e.jsx(se,{placeholder:"Select Sub-type"})}),e.jsx(ae,{children:(Me[h.category]||["General"]).map(s=>e.jsx(J,{value:s,className:"text-xs",children:s},s))})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Financial Year / Filing Period"}),e.jsxs(Q,{value:h.financial_year,onValueChange:s=>E({...h,financial_year:s}),children:[e.jsx(ee,{className:"bg-background h-10 text-xs",children:e.jsx(se,{placeholder:"Select Financial Year"})}),e.jsx(ae,{children:Ue.map(s=>e.jsx(J,{value:s,className:"text-xs",children:s},s))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:editingDocId?"Replace Front File (Optional)":"Select Front File (PDF, Image, Excel, Zip) *"}),e.jsx(N,{type:"file",onChange:s=>Ae(s.target.files[0]),className:"bg-background text-xs cursor-pointer"}),e.jsx("p",{className:"text-[11px] text-muted-foreground",children:"Supports PDF, PNG, JPG, XLSX, ZIP documents up to 50MB."})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Or Provide Direct File URL (Optional)"}),e.jsx(N,{type:"url",placeholder:"https://drive.google.com/... or https://...",value:h.file_url,onChange:s=>E({...h,file_url:s.target.value}),className:"bg-background h-10 text-xs font-mono"})]}),
e.jsxs("div",{className:"p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3",children:[
  e.jsxs("div",{className:"flex items-center justify-between cursor-pointer select-none",onClick:()=>setHasBackSide(!hasBackSide),children:[
    e.jsxs("div",{className:"flex items-center gap-2.5",children:[
      e.jsx("span",{className:"text-lg",children:"🔄"}),
      e.jsxs("div",{children:[
        e.jsx("p",{className:"text-xs font-bold text-slate-100",children:"Include Back Side (License / ID / RC)"}),
        e.jsx("p",{className:"text-[10px] text-slate-400",children:"Toggle ON to upload reverse side image or PDF"})
      ]})
    ]}),
    e.jsx("div",{className:`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${hasBackSide?"bg-emerald-600 justify-end":"bg-slate-800 justify-start border border-slate-700"}`,children:e.jsx("div",{className:"bg-white w-5 h-5 rounded-full shadow-md transition-transform"})})
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
]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(g,{className:"text-xs font-semibold",children:"Notes / Filing Reference (Optional)"}),e.jsx(Ge,{placeholder:"e.g. Filed on 28th July 2026, ACK No: 123456789",value:h.notes,onChange:s=>E({...h,notes:s.target.value}),className:"bg-background text-xs resize-none",rows:2})]}),e.jsxs(ge,{className:"pt-2",children:[e.jsx(n,{type:"button",variant:"outline",onClick:()=>{setEditingDocId(null);setHasBackSide(!1);setSelectedBackFile(null);Y(!1)},children:"Cancel"}),e.jsx(n,{type:"submit",disabled:R,className:"font-bold",children:R?(editingDocId?"Saving Changes...":"Uploading to Vault..."):(editingDocId?"Save Changes":"Save & Store in Vault")})]})]})]})}),e.jsx(le,{open:je,onOpenChange:k,children:e.jsxs(re,{className:"sm:max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col",children:[e.jsxs(ne,{className:"shrink-0 pb-3 border-b border-slate-800",children:[e.jsxs(oe,{className:"text-xl font-black text-white flex items-center gap-2",children:[e.jsx(ve,{className:"w-5 h-5 text-amber-400"}),"One-Click Company Dossier Share"]}),e.jsx(Ce,{className:"text-xs text-slate-400",children:"Share complete company identity, tax registrations, bank accounts, and direct download links for all vault documents in a single click."})]}),e.jsxs(Be,{defaultValue:"visual",className:"flex-1 overflow-hidden flex flex-col pt-3",children:[e.jsxs(Le,{className:"bg-slate-950 border border-slate-800 p-1 rounded-xl shrink-0 w-fit",children:[e.jsx(be,{value:"visual",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:"📋 Visual Preview"}),e.jsx(be,{value:"raw",className:"rounded-lg text-xs font-bold px-3 py-1.5",children:"💬 WhatsApp Text"})]}),e.jsxs(Pe,{value:"visual",className:"flex-1 overflow-y-auto space-y-4 pt-3 pr-1 scrollbar-none",children:[e.jsxs("div",{className:"p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("h3",{className:"text-base font-extrabold text-white",children:a.company_name}),e.jsx(K,{className:"bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono",children:"Verified Dossier"})]}),e.jsxs("p",{className:"text-xs text-slate-300 flex items-center gap-1.5",children:[e.jsx(W,{className:"w-3.5 h-3.5 text-rose-400 shrink-0"})," ",a.company_address]}),e.jsxs("div",{className:"flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1 border-t border-slate-800/60",children:[e.jsxs("span",{children:["📧 ",a.company_email]}),e.jsxs("span",{children:["📞 ",a.company_phone]})]})]}),e.jsxs("div",{className:"p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3",children:[e.jsxs("h4",{className:"text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5",children:[e.jsx(Te,{className:"w-4 h-4"})," Tax & Registration Identifiers"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2.5 text-xs",children:[e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-mono",children:"GSTIN"}),e.jsx("div",{className:"font-mono font-bold text-white mt-0.5",children:a.company_gstin||"N/A"})]}),a.company_gstin&&e.jsx(n,{size:"sm",variant:"ghost",className:"h-6 w-6 p-0 text-slate-400 hover:text-white",onClick:()=>{navigator.clipboard.writeText(a.company_gstin),u.success("GSTIN Copied")},children:e.jsx(D,{className:"w-3 h-3"})})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-mono",children:"PAN NUMBER"}),e.jsx("div",{className:"font-mono font-bold text-white mt-0.5",children:a.pan_number||"N/A"})]}),a.pan_number&&e.jsx(n,{size:"sm",variant:"ghost",className:"h-6 w-6 p-0 text-slate-400 hover:text-white",onClick:()=>{navigator.clipboard.writeText(a.pan_number),u.success("PAN Copied")},children:e.jsx(D,{className:"w-3 h-3"})})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-mono",children:"TAN NUMBER"}),e.jsx("div",{className:"font-mono font-bold text-slate-300 mt-0.5",children:a.tan_number||"N/A"})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800",children:[e.jsx("div",{className:"text-[10px] text-slate-500 font-mono",children:"MSME / UDYAM"}),e.jsx("div",{className:"font-mono font-bold text-slate-300 mt-0.5",children:a.udyam_number||a.msme_number||"N/A"})]})]})]}),e.jsxs("div",{className:"p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3",children:[e.jsxs("h4",{className:"text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5",children:[e.jsx(Ie,{className:"w-4 h-4"})," Bank Account Details (For Payments & Loans)"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2.5 text-xs font-mono",children:[e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800",children:[e.jsx("div",{className:"text-[10px] text-slate-500",children:"BANK NAME"}),e.jsx("div",{className:"font-bold text-white mt-0.5",children:a.bank_name||"HDFC BANK"})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800",children:[e.jsx("div",{className:"text-[10px] text-slate-500",children:"ACCOUNT NAME"}),e.jsx("div",{className:"font-bold text-white mt-0.5 truncate",children:a.account_name||a.company_name})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] text-slate-500",children:"ACCOUNT NUMBER"}),e.jsx("div",{className:"font-bold text-emerald-400 mt-0.5",children:a.account_number||"N/A"})]}),a.account_number&&e.jsx(n,{size:"sm",variant:"ghost",className:"h-6 w-6 p-0 text-slate-400 hover:text-white",onClick:()=>{navigator.clipboard.writeText(a.account_number),u.success("Account Number Copied")},children:e.jsx(D,{className:"w-3 h-3"})})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("div",{className:"text-[10px] text-slate-500",children:"IFSC CODE"}),e.jsx("div",{className:"font-bold text-emerald-400 mt-0.5",children:a.ifsc_code||"N/A"})]}),a.ifsc_code&&e.jsx(n,{size:"sm",variant:"ghost",className:"h-6 w-6 p-0 text-slate-400 hover:text-white",onClick:()=>{navigator.clipboard.writeText(a.ifsc_code),u.success("IFSC Code Copied")},children:e.jsx(D,{className:"w-3 h-3"})})]})]})]}),e.jsxs("div",{className:"p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between",children:[e.jsxs("label",{className:"flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-200",children:[e.jsx("input",{type:"checkbox",checked:F,onChange:s=>Ve(s.target.checked),className:"w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer"}),e.jsx(ue,{className:"w-4 h-4 text-emerald-400"}),"Allow Shared Recipient to Download Files"]}),e.jsx(K,{variant:"outline",className:`text-[10px] font-bold ${F?"bg-emerald-500/10 text-emerald-400 border-emerald-500/30":"bg-rose-500/10 text-rose-400 border-rose-500/30"}`,children:F?"✓ Download Enabled":"🔒 Download Disabled"})]}),i.length>0&&e.jsxs("div",{className:"p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h4",{className:"text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5",children:[e.jsx(te,{className:"w-4 h-4"})," Select Documents to Include (",P.size,"/",i.length,")"]}),e.jsx(n,{variant:"ghost",size:"sm",className:"h-6 text-[10px] text-slate-400 hover:text-white px-2",onClick:He,children:P.size===i.length?"Deselect All":"Select All"})]}),e.jsx("div",{className:"space-y-1.5 max-h-48 overflow-y-auto pr-1",children:i.map(s=>{const t=P.has(s.id);return e.jsxs("div",{onClick:()=>ze(s.id),className:`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${t?"bg-slate-900 border-purple-500/40 text-white":"bg-slate-950/40 border-slate-800 text-slate-400 opacity-60"}`,children:[e.jsxs("div",{className:"flex items-center gap-2.5 truncate pr-2",children:[e.jsx("input",{type:"checkbox",checked:t,onChange:()=>{},className:"w-3.5 h-3.5 rounded border-slate-700 text-purple-500 focus:ring-purple-500/50 cursor-pointer"}),e.jsxs("div",{className:"truncate",children:[e.jsx("span",{className:"font-bold",children:s.title}),e.jsxs("span",{className:"text-[10px] text-slate-400 block font-mono",children:[s.category," ",s.financial_year!=="N/A"?`(${s.financial_year})`:""]})]})]}),s.file_url&&F&&e.jsx("span",{className:"text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20",children:"Downloadable"}),s.file_url&&!F&&e.jsx("span",{className:"text-[10px] font-bold text-slate-500 shrink-0 bg-slate-800 px-2 py-0.5 rounded",children:"View Only"})]},s.id)})})]})]}),e.jsx(Pe,{value:"raw",className:"flex-1 overflow-hidden pt-3 flex flex-col",children:e.jsx("div",{className:"p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap overflow-y-auto flex-1 select-all",children:pe})})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-800 shrink-0",children:[e.jsxs(n,{className:"w-full sm:flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20",onClick:Ze,children:[e.jsx(ve,{className:"w-4 h-4 mr-2"})," Share via WhatsApp"]}),e.jsxs(n,{className:"w-full sm:flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 border-none",onClick:Qe,children:[e.jsx(De,{className:"w-4 h-4 mr-2"})," Share via Email"]}),e.jsxs(n,{variant:"outline",className:"w-full sm:flex-1 h-11 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border-slate-700",onClick:Xe,children:[e.jsx(D,{className:"w-4 h-4 mr-2"})," Copy Full Dossier Text"]})]})]})}),e.jsx(le,{open:$,onOpenChange:O,children:e.jsxs(re,{className:"sm:max-w-xl bg-card border-border",children:[e.jsx(ne,{children:e.jsxs(oe,{className:"text-lg font-bold text-foreground flex items-center gap-2",children:[e.jsx(W,{className:"w-5 h-5 text-primary"}),"Edit Company Profile & Tax Identifiers"]})}),e.jsxs("form",{onSubmit:Je,className:"space-y-4 py-2",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-1.5 sm:col-span-2",children:[e.jsx(g,{className:"text-xs",children:"Company Legal Name"}),e.jsx(N,{value:p.company_name,onChange:s=>y({...p,company_name:s.target.value}),className:"bg-background h-9 text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"GSTIN Number"}),e.jsx(N,{value:p.company_gstin,onChange:s=>y({...p,company_gstin:s.target.value}),className:"bg-background h-9 text-xs font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"PAN Number"}),e.jsx(N,{value:p.pan_number,onChange:s=>y({...p,pan_number:s.target.value}),className:"bg-background h-9 text-xs font-mono",placeholder:"e.g. ABCDE1234F"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"TAN Number"}),e.jsx(N,{value:p.tan_number,onChange:s=>y({...p,tan_number:s.target.value}),className:"bg-background h-9 text-xs font-mono",placeholder:"e.g. HYDJ12345F"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"CIN / LLPIN / Reg No"}),e.jsx(N,{value:p.cin_number,onChange:s=>y({...p,cin_number:s.target.value}),className:"bg-background h-9 text-xs font-mono",placeholder:"e.g. U60200TG2020PTC145000"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"MSME / Udyam Reg No"}),e.jsx(N,{value:p.udyam_number,onChange:s=>y({...p,udyam_number:s.target.value,msme_number:s.target.value}),className:"bg-background h-9 text-xs font-mono",placeholder:"e.g. UDYAM-TS-02-0012345"})]}),e.jsxs("div",{className:"space-y-1.5 sm:col-span-2",children:[e.jsx(g,{className:"text-xs",children:"Registered Address"}),e.jsx(N,{value:p.company_address,onChange:s=>y({...p,company_address:s.target.value}),className:"bg-background h-9 text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"Bank Name"}),e.jsx(N,{value:p.bank_name,onChange:s=>y({...p,bank_name:s.target.value}),className:"bg-background h-9 text-xs"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"Account Number"}),e.jsx(N,{value:p.account_number,onChange:s=>y({...p,account_number:s.target.value}),className:"bg-background h-9 text-xs font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"IFSC Code"}),e.jsx(N,{value:p.ifsc_code,onChange:s=>y({...p,ifsc_code:s.target.value}),className:"bg-background h-9 text-xs font-mono"})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(g,{className:"text-xs",children:"Branch Name"}),e.jsx(N,{value:p.branch_name,onChange:s=>y({...p,branch_name:s.target.value}),className:"bg-background h-9 text-xs"})]})]}),e.jsxs(ge,{className:"pt-2",children:[e.jsx(n,{type:"button",variant:"outline",onClick:()=>O(!1),children:"Cancel"}),e.jsx(n,{type:"submit",disabled:d,className:"font-bold",children:d?"Saving...":"Save Identifiers"})]})]})]})}),e.jsx(le,{open:!!c,onOpenChange:s=>{if(!s){de(null);setPreviewSide("front");setPdfViewerMode("auto");setActivePreviewTruckIdx(0)}},children:e.jsx(re,{className:"w-[96vw] sm:max-w-4xl bg-slate-900 border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl overflow-hidden max-h-[96vh] flex flex-col",children:c&&(()=>{
  const isMulti = Boolean(c.attached_files && c.attached_files.length > 0);
  const activeTruck = isMulti ? (c.attached_files[activePreviewTruckIdx] || c.attached_files[0]) : null;
  const curUrl = activeTruck ? activeTruck.url : ((previewSide==="back"&&c.back_file_url)?c.back_file_url:c.file_url);
  const curTitle = activeTruck ? `${c.title} - ${activeTruck.truck_number}` : (previewSide==="back"?`${c.title}_Back`:`${c.title}_Front`);
  const isPdf = Boolean(curUrl && (curUrl.match(/\.(pdf)($|\?)/i) || (activeTruck?activeTruck.name:c.file_name)?.match(/\.pdf$/i) || c.title?.toLowerCase().includes("pdf") || c.sub_category?.toLowerCase().includes("statement")));
  const isMob = typeof navigator !== "undefined" && (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== "undefined" && window.innerWidth < 768));
  const useGoogle = pdfViewerMode === "google" || (pdfViewerMode === "auto" && isMob);
  const pdfSrc = useGoogle ? ("https://docs.google.com/gview?embedded=true&url=" + encodeURIComponent(curUrl)) : curUrl;

  return e.jsxs(e.Fragment,{children:[
    e.jsxs(ne,{className:"shrink-0 pb-2 sm:pb-3 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2",children:[
      e.jsxs("div",{children:[
        e.jsxs(oe,{className:"text-base sm:text-lg font-bold text-white flex items-center gap-2",children:[e.jsx($e,{className:"w-5 h-5 text-primary"}),c.title]}),
        e.jsxs(Ce,{className:"text-xs text-slate-400 mt-0.5",children:["Category: ",e.jsx("span",{className:"text-primary font-semibold",children:c.category})," • Sub-type: ",c.sub_category,isMulti?` • ${c.attached_files.length} Trucks in Dossier`:` • Period: ${c.financial_year}`]})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 flex-wrap",children:[
        c.back_file_url&&!isMulti&&e.jsxs("div",{className:"flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl",children:[
          e.jsxs(n,{size:"sm",variant:"ghost",className:`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-3 transition-all cursor-pointer ${previewSide==="front"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,onClick:()=>setPreviewSide("front"),children:[e.jsx("span",{className:"mr-1"},"📄"),"Front"]}),
          e.jsxs(n,{size:"sm",variant:"ghost",className:`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-3 transition-all cursor-pointer ${previewSide==="back"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,onClick:()=>setPreviewSide("back"),children:[e.jsx("span",{className:"mr-1"},"🔄"),"Back"]})
        ]}),
        isPdf&&e.jsxs("div",{className:"flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl",children:[
          e.jsxs(n,{size:"sm",variant:"ghost",className:`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-2.5 transition-all cursor-pointer ${useGoogle?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,onClick:()=>setPdfViewerMode("google"),title:"Cloud Mobile Viewer",children:[e.jsx("span",{className:"mr-1"},"🌐"),"Cloud"]}),
          e.jsxs(n,{size:"sm",variant:"ghost",className:`h-7 sm:h-8 text-xs font-bold rounded-lg px-2 sm:px-2.5 transition-all cursor-pointer ${!useGoogle?"bg-blue-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,onClick:()=>setPdfViewerMode("native"),title:"Direct File",children:[e.jsx("span",{className:"mr-1"},"📄"),"Direct"]})
        ]})
      ]})
    ]}),

    /* ── Multi-Truck Selector Carousel ── */
    isMulti&&e.jsxs("div",{className:"w-full pt-2 pb-1 border-b border-slate-800/80 space-y-1.5",children:[
      e.jsxs("div",{className:"flex items-center justify-between text-[11px] text-slate-400",children:[
        e.jsxs("span",{className:"font-bold text-emerald-400 flex items-center gap-1",children:[e.jsx("span",{children:"🚛"}),`Select Truck to Preview (${activePreviewTruckIdx+1} of ${c.attached_files.length}):`]}),
        e.jsx(n,{size:"sm",variant:"outline",className:"h-6 text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-md cursor-pointer",onClick:()=>{de(null);openBatchRcModal(c)},children:"➕ Add / Manage Trucks in this Dossier"})
      ]}),
      e.jsx("div",{className:"flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin",children:c.attached_files.map((trk,tIdx)=>e.jsxs(n,{
        key:tIdx,
        size:"sm",
        variant:"ghost",
        className:`h-7 text-xs font-bold rounded-lg px-2.5 shrink-0 transition-all cursor-pointer ${activePreviewTruckIdx===tIdx?"bg-emerald-600 text-white shadow-sm":"bg-slate-950 text-slate-300 hover:text-white border border-slate-800"}`,
        onClick:()=>setActivePreviewTruckIdx(tIdx),
        children:[e.jsx("span",{className:"mr-1"},"🚚"),trk.truck_number||`Truck ${tIdx+1}`]
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

    e.jsx("div",{className:"flex-1 overflow-y-auto my-2 sm:my-3 bg-slate-950 p-1 sm:p-2 rounded-xl sm:rounded-2xl border border-slate-800 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[420px]",children:curUrl?curUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)||(activeTruck?activeTruck.name:c.file_name)?.match(/\.(jpeg|jpg|gif|png|webp)$/i)?e.jsx("img",{src:curUrl,alt:curTitle,className:"max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow-lg"}):isPdf?e.jsx("iframe",{src:pdfSrc,title:curTitle,className:"w-full h-[60vh] sm:h-[65vh] rounded-lg sm:rounded-xl border border-slate-800 bg-white"}):e.jsxs("div",{className:"text-center p-8 space-y-4",children:[e.jsx(te,{className:"w-16 h-16 text-primary mx-auto opacity-60"}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm font-bold text-white",children:curTitle}),e.jsxs("p",{className:"text-xs text-slate-400 mt-1",children:["This document is stored securely in Company Vault."]})]}),e.jsxs("div",{className:"flex items-center justify-center gap-3 pt-2",children:[e.jsxs(n,{onClick:()=>ye({file_url:curUrl,title:curTitle}),className:"bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-lg shadow-emerald-500/20",children:[e.jsx(ue,{className:"w-4 h-4 mr-2"})," Download This Document"]}),e.jsxs(n,{variant:"outline",onClick:()=>window.open(curUrl,"_blank"),className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs rounded-xl",children:[e.jsx(_e,{className:"w-4 h-4 mr-2"})," Open in Browser"]})]})]}):e.jsx("p",{className:"text-xs text-slate-400",children:"No file URL available for preview"})}),
    e.jsxs(ge,{className:"shrink-0 pt-2 sm:pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3",children:[
      e.jsxs("div",{className:"text-xs text-slate-400 font-mono flex items-center gap-2 flex-wrap",children:[
        activeTruck?e.jsxs("span",{children:["Showing: ",e.jsx("strong",{className:"text-emerald-400 font-mono",children:activeTruck.truck_number})," (",activeTruck.name,")"]}):e.jsxs("span",{children:["Showing: ",e.jsx("strong",{className:"text-emerald-400",children:previewSide==="back"?"Back Side":"Front Side"})]}),
        c.back_file_url&&!isMulti&&e.jsx("span",{className:"text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20",children:"2-Sided Document"}),
        isPdf&&e.jsx("span",{className:"text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20",children:useGoogle?"Cloud Viewer":"Native Viewer"})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end",children:[
        e.jsxs(n,{variant:"outline",size:"sm",className:"border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold rounded-xl",onClick:()=>{navigator.clipboard.writeText(curUrl),u.success("Document URL copied!")},children:[e.jsx(D,{className:"w-3.5 h-3.5 mr-1.5"})," Copy Link"]}),
        e.jsxs(n,{variant:"outline",size:"sm",className:"border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold rounded-xl",onClick:()=>window.open(curUrl,"_blank"),children:[e.jsx(_e,{className:"w-3.5 h-3.5 mr-1.5"})," Open Link"]}),
        e.jsxs(n,{size:"sm",className:"bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20",onClick:()=>ye({file_url:curUrl,title:curTitle}),children:[e.jsx(ue,{className:"w-3.5 h-3.5 mr-1.5"}),activeTruck?`Download ${activeTruck.truck_number} RC`:"Download"]})
      ]})
    ]})
  ]});
})()})}),e.jsx(ms,{isOpen:x,onOpenChange:f,defaultRecipient:l.recipient,defaultSubject:l.subject,defaultBody:l.body,richHtmlContent:l.html,contextLabel:l.label,defaultAttachment:l.attachment}),e.jsx(xs,{isOpen:me.isOpen,onClose:()=>xe({isOpen:!1,doc:null}),companyInfo:a,document:me.doc,allDocuments:i,selectedDocIds:P}),

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
            className:`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${batchRcTargetMode==="append"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,
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
            className:`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${batchRcTargetMode==="new"?"bg-emerald-600 text-white shadow-sm":"text-slate-400 hover:text-white"}`,
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
          children:allCompilations.map(c=>e.jsx("option",{key:c.id,value:c.id,children:`${c.title} (${c.attached_files?.length||c.rc_count||0} Trucks attached)`}))
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
        `${existingAttachedRcs.length} Trucks Currently Attached in Dossier`
      ]}),
      e.jsx("span",{className:"text-[10px] text-slate-400 font-normal",children:"(Existing files are preserved safely)"})
    ]}),
    e.jsx("div",{className:"max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin",children:existingAttachedRcs.map((rc,rIdx)=>e.jsxs("div",{key:rIdx,className:"flex items-center justify-between text-xs text-slate-200 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg",children:[
      e.jsxs("div",{className:"flex items-center gap-2 truncate pr-2",children:[
        e.jsx("span",{className:"text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20",children:rc.truck_number||`Truck ${rIdx+1}`}),
        e.jsx("span",{className:"truncate text-[11px] text-slate-300 font-mono",children:rc.name}),
        e.jsx("span",{className:"text-slate-500 text-[10px]",children:rc.size})
      ]}),
      e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[
        e.jsx("button",{type:"button",onClick:()=>window.open(rc.url,"_blank"),title:"Preview this RC",className:"h-6 px-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded border border-cyan-500/30 cursor-pointer",children:"👁️ View"}),
        e.jsx("button",{
          type:"button",
          onClick:()=>{
            const trkName = rc.truck_number || `Truck ${rIdx+1}`;
            setExistingAttachedRcs(prev=>prev.filter((_,idx)=>idx!==rIdx));
            u.info(`Removed ${trkName} from list. Click 'Save Changes' to update dossier.`);
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
          u.success(`${evt.target.files.length} new truck RCs selected to add!`);
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
        e.jsxs("span",{children:[`+ ${batchRcFiles.length} New Truck RCs Queued to Upload`]}),
        e.jsx("button",{type:"button",onClick:()=>setBatchRcFiles([]),className:"text-red-400 hover:text-red-300 text-[11px] cursor-pointer",children:"Clear Queued Files"})
      ]}),
      e.jsx("div",{className:"max-h-36 overflow-y-auto space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800",children:batchRcFiles.map((f,fIdx)=>{
        const cleanName=f.name.replace(/\.[^/.]+$/,"");
        const truckMatch=cleanName.match(/([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4})/i);
        const truckNum=truckMatch?truckMatch[1].toUpperCase():`Truck ${existingAttachedRcs.length+fIdx+1}`;
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
      children:batchRcUploading?"Uploading Truck RCs...":(batchRcFiles.length>0?`Upload & Append ${batchRcFiles.length} RCs (Total: ${existingAttachedRcs.length+batchRcFiles.length})`:`Save Changes (${existingAttachedRcs.length} Trucks)`)
    })
  ]})
]})})
]})}export{fs as default};
