import{E as le,a as P}from"./vendor-pdf-DtmgLs_2.js";import{utils as A,write as re}from"./xlsx-CNerDvZX.js";import{aS as se,p as I}from"./index-DLxf9dwO.js";let a=null,z=null,T=null;const q=o=>new Promise(s=>{try{const i=document.createElement("img");i.crossOrigin="Anonymous",i.onload=()=>{try{const e=document.createElement("canvas");e.width=i.width||100,e.height=i.height||100,e.getContext("2d").drawImage(i,0,0);const S=e.toDataURL("image/png");s(S)}catch{s(o)}},i.onerror=()=>s(o),i.src=o}catch{s(o)}}),ce=async()=>{try{const o=await I.collection("company_settings").getOne("companysettings",{$autoCancel:!1});if(a=o,o&&o.company_logo){const s=I.files.getUrl(o,o.company_logo);z=await q(s).catch(()=>null)}else z=null;if(o&&o.e_signature){const s=I.files.getUrl(o,o.e_signature);T=await q(s).catch(()=>null)}else T=localStorage.getItem("jbc_e_signature")||null;return o}catch(o){return console.error("Failed to pre-fetch company settings:",o),null}};ce().catch(()=>{});const pe=(o,s)=>{try{const i=window.URL.createObjectURL(o),e=document.createElement("a");e.href=i,e.download=s,document.body.appendChild(e),e.click(),document.body.removeChild(e),window.URL.revokeObjectURL(i)}catch(i){throw console.error("Download failed:",i),new Error("Failed to download file")}},ue=(o,s,i={})=>{try{const e=new le,{type:g="generic",invoiceObj:S=null,quoteObj:w=null,title:v="Report",columns:p=[],totals:N=null,companyInfo:Y=a?.company_name||"Jai Bhavani Cargo"}=i,R=t=>{if(!t)return null;if(t instanceof Date)return isNaN(t.getTime())?null:t;if(typeof t=="number")return new Date(t);if(typeof t=="string"){const n=t.trim();if(!n)return null;const r=n.includes(" ")&&!n.includes("T")?n.replace(" ","T"):n,h=new Date(r);return isNaN(h.getTime())?null:h}return null};if((g==="invoice"||g==="payment_request")&&S){
  const t=S;
  const n=g==="payment_request"||t.invoice_number?.startsWith("REQ-")||t.invoice_number?.startsWith("PR-");
  const r=[15,23,42];  // #0F172A
  const h=[217,119,6]; // #D97706
  const c=[71,85,105]; // #475569
  const C=[248,250,252];// #F8FAFC
  const x=[226,232,240];// #E2E8F0

  // Top Accent Banner
  e.setFillColor(...r);
  e.rect(0,0,e.internal.pageSize.width,7,"F");
  e.setFillColor(...h);
  e.rect(0,7,e.internal.pageSize.width,1.5,"F");

  const l=se();
  const y=a?.company_name||t.company_name||l.company_name||"JAI BHAVANI CARGO";
  const F=a?.company_address||t.company_address||l.company_address||"Plot No 3, Patel Nagar, Ghatkesar";
  const b=a?.company_phone||t.company_phone||l.company_phone||"+91 7794072244";
  const _=a?.company_email||t.company_email||l.company_email||"operations@jaibhavanicargo.com";
  const U=a?.company_gstin||l.company_gstin||"36DPXPR9171A1Z8";

  // Top Left: Logo & Company Address (Logo not stretched, no redundant header text)
  if(z) {
    // Proportional logo bounds maxW=36, maxH=15
    e.addImage(z,"PNG",14,11,36,15);
    e.setFont("helvetica","normal");
    e.setFontSize(7.8);
    e.setTextColor(...c);
    e.text(F,14,28,{maxWidth:100});
    e.text(`Phone: ${b} | Email: ${_} | GSTIN: ${U}`,14,33);
  } else {
    e.setFont("helvetica","bold");
    e.setFontSize(16);
    e.setTextColor(...r);
    e.text(y,14,20);
    e.setFont("helvetica","normal");
    e.setFontSize(8.2);
    e.setTextColor(...c);
    e.text(F,14,26,{maxWidth:110});
    e.text(`Phone: ${b} | Email: ${_} | GSTIN: ${U}`,14,32);
  }

  // Top Right: Title, Invoice No, Date & Due Date
  const M=n?"PAYMENT REQUEST & DEMAND NOTE":"TAX INVOICE";
  e.setFont("helvetica","bold");
  e.setFontSize(14);
  e.setTextColor(...r);
  e.text(M,e.internal.pageSize.width-14,18,{align:"right"});

  e.setFont("helvetica","bold");
  e.setFontSize(9);
  e.setTextColor(...c);
  e.text(`${n?"Req No":"Invoice No"}: ${t.invoice_number||t.request_number||"INV-001"}`,e.internal.pageSize.width-14,24,{align:"right"});

  const k=R(t.invoice_date||t.request_date||t.date)||new Date();
  const Q=R(t.due_date)||new Date(k.getTime()+10080*60*1e3);
  const W=k.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  const V=Q.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});

  e.setFont("helvetica","normal");
  e.setFontSize(8.5);
  e.setTextColor(...c);
  e.text(`Date: ${W}`,e.internal.pageSize.width-14,29,{align:"right"});
  e.text(`Due Date: ${V}`,e.internal.pageSize.width-14,34,{align:"right"});

  // Divider Line
  e.setDrawColor(...x);
  e.line(14,38,e.internal.pageSize.width-14,38);

  // Cards Section
  // Billed To (Left Card)
  e.setFillColor(...C);
  e.roundedRect(14,42,e.internal.pageSize.width/2-18,32,2,2,"F");
  e.setDrawColor(...x);
  e.roundedRect(14,42,e.internal.pageSize.width/2-18,32,2,2,"D");

  e.setFont("helvetica","bold");
  e.setFontSize(8.5);
  e.setTextColor(...h);
  e.text("BILLED TO / CUSTOMER DETAILS:",18,48);

  e.setFont("helvetica","bold");
  e.setFontSize(9.5);
  e.setTextColor(0,0,0);
  e.text(t.customer_name||"Valued Client",18,54);

  e.setFont("helvetica","normal");
  e.setFontSize(8);
  e.setTextColor(...c);
  const H=t.customer_address||"Registered Business Location";
  const L=t.customer_phone?`Phone: ${t.customer_phone}`:"";
  const B=t.customer_email?`Email: ${t.customer_email}`:"";
  e.text(H,18,59,{maxWidth:e.internal.pageSize.width/2-26});
  e.text(`${L} ${L&&B?"| ":""}${B}`,18,68);

  // Payment & Status Summary (Right Card)
  e.setFillColor(...C);
  e.roundedRect(e.internal.pageSize.width/2+4,42,e.internal.pageSize.width/2-18,32,2,2,"F");
  e.setDrawColor(...x);
  e.roundedRect(e.internal.pageSize.width/2+4,42,e.internal.pageSize.width/2-18,32,2,2,"D");

  e.setFont("helvetica","bold");
  e.setFontSize(8.5);
  e.setTextColor(...h);
  e.text("PAYMENT & STATUS SUMMARY:",e.internal.pageSize.width/2+8,48);

  const D=(t.status||"Pending").toUpperCase();
  let E=[217,119,6];
  if(D==="PAID") E=[16,185,129];
  if(D==="OVERDUE") E=[225,29,72];

  e.setFont("helvetica","bold");
  e.setFontSize(8.5);
  e.setTextColor(...c);
  e.text("Payment Status: ",e.internal.pageSize.width/2+8,54);
  e.setTextColor(...E);
  e.text(D,e.internal.pageSize.width/2+36,54);

  e.setFont("helvetica","normal");
  e.setTextColor(...c);
  e.text("Payment Terms: Credit Account / Net 30",e.internal.pageSize.width/2+8,61);
  e.text(`Invoice Date: ${W}  |  Due: ${V}`,e.internal.pageSize.width/2+8,68);

  // Table Data Formatting (Fix Rupee Symbol)
  const J=o.map(f=>p.map(ie=>{
    const $=f[ie.key];
    if($==null) return "";
    return String($).replace(/[₹]/g,"Rs. ").replace(/Rs. /g,"Rs. ");
  }));

  P(e,{
    startY:79,
    head:[p.map(f=>String(f.header||"").replace(/[₹]/g,"Rs. ").replace(/Rs. /g,"Rs. "))],
    body:J,
    theme:"striped",
    headStyles:{fillColor:r,textColor:255,fontStyle:"bold",fontSize:9},
    styles:{fontSize:8.5,cellPadding:2.8,font:"helvetica"},
    alternateRowStyles:{fillColor:[248,250,252]},
    columnStyles:{[p.length-1]:{halign:"right",fontStyle:"bold"}}
  });

  // Financial Totals Section
  let m=e.lastAutoTable.finalY+8;
  if(m>e.internal.pageSize.height-60) { e.addPage(); m=20; }

  const formatAmt = (val) => "Rs. " + Number(val||0).toLocaleString("en-IN");

  e.setFont("helvetica","normal");
  e.setFontSize(8.5);
  e.setTextColor(...c);
  e.text("Subtotal Amount:",e.internal.pageSize.width-70,m,{align:"right"});
  e.setFont("helvetica","bold");
  e.setTextColor(0,0,0);
  e.text(formatAmt(t.subtotal||t.total_amount||0),e.internal.pageSize.width-14,m,{align:"right"});

  if(t.tax_amount&&t.tax_amount>0) {
    m+=5;
    e.setFont("helvetica","normal");
    e.setTextColor(...c);
    e.text(`GST / Tax (${t.tax_rate||18}%):`,e.internal.pageSize.width-70,m,{align:"right"});
    e.setFont("helvetica","bold");
    e.setTextColor(0,0,0);
    e.text(formatAmt(t.tax_amount||0),e.internal.pageSize.width-14,m,{align:"right"});
  }

  // TOTAL AMOUNT DUE BOX (Perfect alignment & crisp font rendering)
  m+=7;
  const totalStr = formatAmt(t.total_amount||0);
  const boxWidth = 88;
  const boxLeft = e.internal.pageSize.width-14-boxWidth;

  e.setFillColor(...r);
  e.roundedRect(boxLeft,m-5,boxWidth,9.5,1.5,1.5,"F");

  e.setFont("helvetica","bold");
  e.setFontSize(9);
  e.setTextColor(255,255,255);
  e.text("TOTAL AMOUNT DUE:",boxLeft+4,m+1.2,{align:"left"});
  e.text(totalStr,e.internal.pageSize.width-18,m+1.2,{align:"right"});

  // Bank Details (Left side)
  let u=m-(t.tax_amount&&t.tax_amount>0?12:5);
  e.setFont("helvetica","bold");
  e.setFontSize(9);
  e.setTextColor(...r);
  e.text("BANK DETAILS:",14,u);

  const K=a?.bank_name||l.bank_name||"HDFC BANK";
  const Z=(a?.account_name||l.account_name||y).toUpperCase();
  const ee=a?.account_number||l.account_number||"50200117182677";
  const te=a?.ifsc_code||l.ifsc_code||"HDFC0004480";
  const oe=a?.branch_name||l.branch_name||"GHATKESAR BRANCH";

  e.setFont("helvetica","normal");
  e.setFontSize(8);
  e.setTextColor(...c);
  e.text(`Bank Name: ${K}`,14,u+5);
  e.text(`Account Name: ${Z}`,14,u+9);
  e.text(`Account No: ${ee}`,14,u+13);
  e.text(`IFSC Code: ${te}`,14,u+17);
  e.text(`Branch / UPI: ${oe}`,14,u+21);

  // Footer Terms & Signature
  let d=u+30;
  if(d>e.internal.pageSize.height-30) { e.addPage(); d=25; }

  e.setDrawColor(...x);
  e.line(14,d,e.internal.pageSize.width-14,d);

  e.setFont("helvetica","bold");
  e.setFontSize(8.5);
  e.setTextColor(...r);
  e.text("Terms & Conditions:",14,d+5);

  e.setFont("helvetica","normal");
  e.setFontSize(7.5);
  e.setTextColor(...c);
  e.text(`1. Payment is due as per agreed credit terms.
2. Interest @ 18% p.a. will apply to overdue balances.
3. All disputes subject to Hyderabad jurisdiction.`,14,d+9);

  const ne=a?.signatory_name||l.signatory_name||"Vinod Kumar Rathod";
  const ae=a?.signatory_title||l.signatory_title||"Managing Director";

  if(T) {
    try { e.addImage(T,"PNG",e.internal.pageSize.width-55,d+2,35,12); } catch(err){}
  }
  e.line(e.internal.pageSize.width-65,d+16,e.internal.pageSize.width-14,d+16);
  e.setFont("helvetica","bold");
  e.setFontSize(8);
  e.setTextColor(0,0,0);
  e.text(`For ${y}`,e.internal.pageSize.width-14,d+20,{align:"right"});
  e.setFont("helvetica","normal");
  e.setFontSize(7.5);
  e.setTextColor(...c);
  e.text(`${ne} (${ae})`,e.internal.pageSize.width-14,d+24,{align:"right"});
}else if(g==="quote"&&w){const t=w,n=[15,23,42],r=[217,119,6],h=[71,85,105],c=[226,232,240];e.setFillColor(...n),e.rect(0,0,e.internal.pageSize.width,7,"F"),e.setFillColor(...r),e.rect(0,7,e.internal.pageSize.width,1.5,"F");const C=a?.company_name||"JAI BHAVANI CARGO",x=a?.company_address||"Plot No 3, Patel Nagar, Ghatkesar",l=a?.company_phone||"+91 7794072244",y=a?.company_email||"vinod@jaibhavanicargo.com";e.setFont("helvetica","bold"),e.setFontSize(18),e.setTextColor(...n),e.text(C,14,20),e.setFont("helvetica","normal"),e.setFontSize(8.5),e.setTextColor(...h),e.text(x,14,25),e.text(`Phone: ${l} | Email: ${y}`,14,29),e.setFont("helvetica","bold"),e.setFontSize(16),e.setTextColor(...n),e.text("FREIGHT QUOTATION",e.internal.pageSize.width-14,20,{align:"right"}),e.setFont("helvetica","normal"),e.setFontSize(9),e.setTextColor(...h),e.text(`Quote No: ${t.quote_number}`,e.internal.pageSize.width-14,26,{align:"right"});const F=o.map(b=>p.map(_=>String(b[_.key]||"")));P(e,{startY:50,head:[p.map(b=>b.header)],body:F,theme:"striped",headStyles:{fillColor:n,textColor:255,fontStyle:"bold",fontSize:9}})}else{e.setFontSize(16),e.setTextColor(15,23,42),e.text(Y,14,15),e.setFontSize(12),e.setTextColor(71,85,105),e.text(v,14,23);const t=o.map(n=>p.map(r=>String(n[r.key]||"")));N&&t.push(p.map(n=>N[n.key]?String(N[n.key]):"")),P(e,{startY:30,head:[p.map(n=>n.header)],body:t,theme:"grid",headStyles:{fillColor:[15,23,42],textColor:255}})}const O=e.internal.getNumberOfPages();for(let t=1;t<=O;t++)e.setPage(t),e.setFontSize(7.5),e.setTextColor(148,163,184),e.text(`Page ${t} of ${O} — Jai Bhavani Cargo Enterprise System (Official Document)`,e.internal.pageSize.width/2,e.internal.pageSize.height-8,{align:"center"});return e.output("blob")}catch(e){throw console.error("PDF generation failed:",e),e}},Se=(o,s,i="Sheet1")=>{try{const e=A.json_to_sheet(o);if(o.length>0){const w=Object.keys(o[0]).map(v=>({wch:Math.max(v.length+5,15)}));e["!cols"]=w}const g=A.book_new();A.book_append_sheet(g,e,i);const S=re(g,{bookType:"xlsx",type:"array"});return new Blob([S],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})}catch(e){throw console.error("Excel generation failed:",e),new Error("Failed to generate Excel")}};export{Se as a,pe as d,ce as f,ue as g};
