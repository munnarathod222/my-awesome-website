import{r,j as e,dR as Ee,ak as ge,az as bt,cs as jt,aq as yt,bx as Nt,a2 as Te,bF as vt,bs as wt,aP as Ye,dK as kt,cH as Pt,cx as Ge,aw as Qe,aQ as We,a0 as Dt,an as St,a9 as Ct,cC as Xe,bt as Mt,cJ as Ft,a1 as Ze}from"./vendor-react-Bs5V2qFE.js";import{u as _t,p as A,S as Re,e as Le,g as $e,h as ze,i as se,_ as It,a0 as At,a1 as Et,a2 as Tt,bf as Rt,L as D,I as M,B as N,w as J,D as et,a as tt,b as at,c as st,d as Lt,j as rt,k as w,b1 as fe,aq as $t,bg as zt,C as q,o as te,q as ae,O as G,r as Ae,y as Bt,z as Ot,A as lt,E as Z,F as Ht,G as ee,t as L}from"./index-DLxf9dwO.js";import{i as nt}from"./isBefore-Brnnz_-V.js";import{i as it}from"./isSameDay-tDnVa-xb.js";import{R as Ut,C as dt,T as Vt,L as qt}from"./generateCategoricalChart-BEnIo3F8.js";import{P as Jt,a as Kt}from"./PieChart-DFpEcMSh.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";function Yt(){const{currentUser:i}=_t(),[S,o]=r.useState(!1),[K,x]=r.useState(null),[g,C]=r.useState([]),$=r.useCallback(async()=>{if(!i?.id)return C([]),[];o(!0),x(null);try{const a=await A.collection("loan_profiles").getFullList({filter:`userId = "${i.id}"`,sort:"-createdAt",$autoCancel:!1});return C(a),a}catch(a){return console.error("Error fetching loan profiles:",a),x(a.message),C([]),[]}finally{o(!1)}},[i?.id]),re=r.useCallback(async a=>{o(!0),x(null);try{return await A.collection("loan_profiles").getOne(a,{$autoCancel:!1})}catch(l){return console.error("Error loading loan profile:",l),x(l.message),null}finally{o(!1)}},[]),le=r.useCallback(async a=>{if(!i?.id)throw new Error("User not authenticated");o(!0),x(null);try{const l={...a,userId:i.id},d=await A.collection("loan_profiles").create(l,{$autoCancel:!1});return C(_=>[d,..._]),d}catch(l){throw console.error("Error saving loan profile:",l),x(l.message),l}finally{o(!1)}},[i?.id]),b=r.useCallback(async(a,l)=>{o(!0),x(null);try{const d=await A.collection("loan_profiles").update(a,l,{$autoCancel:!1});return C(_=>_.map(Y=>Y.id===a?d:Y)),d}catch(d){throw console.error("Error updating loan profile:",d),x(d.message),d}finally{o(!1)}},[]),p=r.useCallback(async a=>{o(!0),x(null);try{return await A.collection("loan_profiles").delete(a,{$autoCancel:!1}),C(l=>l.filter(d=>d.id!==a)),!0}catch(l){throw console.error("Error deleting loan profile:",l),x(l.message),l}finally{o(!1)}},[]),F=r.useCallback(async()=>{if(!i?.id)return null;o(!0),x(null);try{const a=await A.collection("loan_profiles").getFullList({filter:`userId = "${i.id}" && isDefault = true`,$autoCancel:!1});return a.length>0?a[0]:null}catch(a){return console.error("Error fetching default profile:",a),x(a.message),null}finally{o(!1)}},[i?.id]),E=r.useCallback(async a=>{if(!i?.id)return!1;o(!0),x(null);try{const l=await A.collection("loan_profiles").getFullList({filter:`userId = "${i.id}" && isDefault = true`,$autoCancel:!1});for(const d of l)d.id!==a&&await A.collection("loan_profiles").update(d.id,{isDefault:!1},{$autoCancel:!1});return a&&await A.collection("loan_profiles").update(a,{isDefault:!0},{$autoCancel:!1}),await $(),!0}catch(l){throw console.error("Error setting default profile:",l),x(l.message),l}finally{o(!1)}},[i?.id,$]);return{profiles:g,loading:S,error:K,getAllProfiles:$,loadProfile:re,saveProfile:le,updateProfile:b,deleteProfile:p,getDefaultProfile:F,setDefaultProfile:E}}function Gt({profiles:i,activeProfileId:S,onProfileChange:o,loading:K,trucks:x=[]}){return K&&i.length===0?e.jsx("div",{className:"h-10 w-full sm:w-[240px] bg-muted animate-pulse rounded-xl"}):e.jsxs("div",{className:"flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0",children:[e.jsx("div",{className:"bg-primary/10 p-2 rounded-lg text-primary",children:e.jsx(Ee,{className:"w-4 h-4"})}),e.jsxs(Re,{value:S||"draft",onValueChange:g=>o(g==="draft"?null:g),children:[e.jsx(Le,{className:"w-full sm:w-[240px] bg-background rounded-xl shadow-sm border-border min-w-0",children:e.jsx($e,{placeholder:"Select a profile"})}),e.jsxs(ze,{children:[e.jsx(se,{value:"draft",className:"font-medium italic text-muted-foreground",children:"Unsaved Draft"}),i.length===0?e.jsx("div",{className:"p-2 text-sm text-muted-foreground text-center italic",children:"No profiles saved"}):i.map(g=>{const C=x.find($=>$.id===g.truck_id);return e.jsx(se,{value:g.id,children:e.jsxs("div",{className:"flex items-center justify-between w-full gap-2",children:[e.jsxs("span",{children:[g.profileName," ",C?`· ${C.truck_number}`:""]}),g.isDefault&&e.jsx("span",{className:"text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium",children:"Default"})]})},g.id)})]})]})]})}function Qt({isOpen:i,onClose:S,profiles:o,activeProfileId:K,onProfileSelect:x,onSave:g,onUpdate:C,onDelete:$,onDuplicate:re,onSetDefault:le,loading:b,trucks:p=[]}){const[F,E]=r.useState(""),[a,l]=r.useState(null),[d,_]=r.useState(null),Y=async()=>{F.trim()&&(await g(F),E(""))},ne=async()=>{!d||!d.profileName.trim()||(await C(d.id,{profileName:d.profileName}),_(null))},we=async()=>{a&&(await $(a),l(null))};return e.jsxs(e.Fragment,{children:[e.jsx(It,{open:i,onOpenChange:S,children:e.jsxs(At,{className:"w-full sm:max-w-md overflow-y-auto custom-scrollbar border-l border-border",children:[e.jsxs(Et,{className:"mb-6",children:[e.jsxs(Tt,{className:"flex items-center gap-2 text-xl",children:[e.jsx(Ee,{className:"w-5 h-5 text-primary"}),"Loan Profiles"]}),e.jsx(Rt,{children:"Manage your saved loan configurations for quick access."})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"bg-muted/30 p-4 rounded-xl border border-border space-y-3",children:[e.jsx(D,{className:"text-sm font-semibold",children:"Save Current Calculator State"}),e.jsxs("div",{className:"flex flex-wrap gap-2 w-full sm:w-auto",children:[e.jsx(M,{placeholder:"e.g., Home Loan 2026",value:F,onChange:n=>E(n.target.value),className:"bg-background"}),e.jsx(N,{onClick:Y,disabled:b||!F.trim(),className:"shrink-0",children:b?e.jsx(ge,{className:"w-4 h-4 animate-spin"}):"Save"})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h4",{className:"text-sm font-medium text-muted-foreground uppercase tracking-wider",children:"Saved Profiles"}),o.length===0&&!b&&e.jsxs("div",{className:"text-center p-8 border border-dashed border-border rounded-xl text-muted-foreground",children:[e.jsx(Ee,{className:"w-8 h-8 mx-auto mb-2 opacity-20"}),e.jsx("p",{className:"text-sm",children:"No profiles saved yet."})]}),o.map(n=>{const z=n.id===K,k=p.find(ie=>ie.id===n.truck_id);return e.jsxs("div",{className:`p-4 rounded-xl border transition-all ${z?"border-primary bg-primary/5 shadow-sm":"border-border bg-card hover:border-primary/30"}`,children:[e.jsxs("div",{className:"flex justify-between items-start mb-3",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h5",{className:"font-semibold text-foreground",children:n.profileName}),z&&e.jsxs(J,{variant:"outline",className:"bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 h-5",children:[e.jsx(bt,{className:"w-3 h-3 mr-1"})," Active"]}),n.isDefault&&e.jsx(J,{variant:"secondary",className:"text-[10px] px-1.5 py-0 h-5",children:"Default"})]}),e.jsxs("p",{className:"text-xs text-muted-foreground mt-1",children:["₹",n.loanAmount?.toLocaleString("en-IN")," • ",n.interestRate,"% • ",n.loanTerm," mos",k?` • ${k.truck_number}`:""]})]}),e.jsx(N,{variant:z?"secondary":"outline",size:"sm",onClick:()=>x(n.id),disabled:z||b,className:"h-8 text-xs",children:z?"Loaded":"Load"})]}),e.jsxs("div",{className:"flex items-center gap-1 pt-3 border-t border-border/50",children:[e.jsx(N,{variant:"ghost",size:"icon",className:"h-7 w-7 text-muted-foreground hover:text-foreground",onClick:()=>_(n),title:"Edit Name",children:e.jsx(jt,{className:"w-3.5 h-3.5"})}),e.jsx(N,{variant:"ghost",size:"icon",className:"h-7 w-7 text-muted-foreground hover:text-foreground",onClick:()=>re(n),title:"Duplicate",children:e.jsx(yt,{className:"w-3.5 h-3.5"})}),!n.isDefault&&e.jsx(N,{variant:"ghost",size:"icon",className:"h-7 w-7 text-muted-foreground hover:text-warning",onClick:()=>le(n.id),title:"Set as Default",children:e.jsx(Nt,{className:"w-3.5 h-3.5"})}),e.jsx("div",{className:"flex-1"}),e.jsx(N,{variant:"ghost",size:"icon",className:"h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10",onClick:()=>l(n.id),title:"Delete",children:e.jsx(Te,{className:"w-3.5 h-3.5"})})]})]},n.id)})]})]})]})}),e.jsx(et,{open:!!a,onOpenChange:n=>!n&&l(null),children:e.jsxs(tt,{className:"sm:max-w-md rounded-2xl",children:[e.jsxs(at,{children:[e.jsx(st,{children:"Delete Profile"}),e.jsx(Lt,{children:"Are you sure you want to delete this loan profile? This action cannot be undone."})]}),e.jsxs(rt,{children:[e.jsx(N,{variant:"outline",onClick:()=>l(null),disabled:b,children:"Cancel"}),e.jsxs(N,{variant:"destructive",onClick:we,disabled:b,children:[b?e.jsx(ge,{className:"w-4 h-4 animate-spin mr-2"}):e.jsx(Te,{className:"w-4 h-4 mr-2"}),"Delete"]})]})]})}),e.jsx(et,{open:!!d,onOpenChange:n=>!n&&_(null),children:e.jsxs(tt,{className:"sm:max-w-md rounded-2xl",children:[e.jsx(at,{children:e.jsx(st,{children:"Rename Profile"})}),e.jsxs("div",{className:"py-4",children:[e.jsx(D,{children:"Profile Name"}),e.jsx(M,{value:d?.profileName||"",onChange:n=>_({...d,profileName:n.target.value}),className:"mt-2"})]}),e.jsxs(rt,{children:[e.jsx(N,{variant:"outline",onClick:()=>_(null),disabled:b,children:"Cancel"}),e.jsx(N,{onClick:ne,disabled:b||!d?.profileName.trim(),children:b?e.jsx(ge,{className:"w-4 h-4 animate-spin mr-2"}):"Save Changes"})]})]})})]})}function na(){const{profiles:i=[],loading:S,getAllProfiles:o,getDefaultProfile:K,saveProfile:x,updateProfile:g,deleteProfile:C,setDefaultProfile:$,loadProfile:re}=Yt(),[le,b]=r.useState(!1),[p,F]=r.useState(null),[E,a]=r.useState(!1),l=async t=>{const m=t.target.files?.[0];if(m){if(m.type!=="application/pdf"){L.error("Only PDF documents are allowed");return}if(m.size>20*1024*1024){L.error("File size exceeds the 20MB limit");return}a(!0);try{const h=new FormData;h.append("loan_document",m),await g(p,h)&&(L.success("Loan document uploaded successfully"),await o())}catch(h){console.error("Failed to upload document:",h),L.error("Failed to upload document")}finally{a(!1)}}},d=async()=>{if(window.confirm("Are you sure you want to remove the uploaded loan document?")){a(!0);try{const t=new FormData;t.append("loan_document",""),await g(p,t)&&(L.success("Loan document removed"),await o())}catch(t){console.error("Failed to remove document:",t),L.error("Failed to remove document")}finally{a(!1)}}},[_]=vt(),Y=_.get("profileId"),[ne,we]=r.useState([]),[n,z]=r.useState(null),[k,ie]=r.useState("HDFC Bank"),[B,ke]=r.useState("500000"),[O,Pe]=r.useState("9.5"),[v,De]=r.useState("5"),[I,Se]=r.useState("years"),[Q,Ce]=r.useState(w(new Date,"yyyy-MM-dd")),[T,Me]=r.useState(w(fe(new Date,1),"yyyy-MM-dd")),[be,ot]=r.useState("0"),[je,ct]=r.useState("0"),[Fe,mt]=r.useState("12"),j=r.useMemo(()=>i.find(t=>t.id===p),[i,p]),_e=r.useMemo(()=>{if(!j)return!1;const t=I==="years"?parseFloat(v)*12:parseFloat(v);return B!==(j.loanAmount?.toString()||"0")||O!==(j.interestRate?.toString()||"0")||t!==(j.loanTerm||0)||k!==(j.bank_name||"HDFC Bank")||Q!==(j.disbursal_date?j.disbursal_date.substring(0,10):"")||T!==(j.first_emi_date?j.first_emi_date.substring(0,10):"")||n!==(j.truck_id||null)},[j,B,O,v,I,k,Q,T,n]);r.useEffect(()=>{(async()=>{const m=await o();try{const s=await A.collection("trucks").getFullList({sort:"truck_number",$autoCancel:!1});we(s)}catch(s){console.error("Failed to fetch trucks:",s)}let h=!1;if(Y){const s=m.find(c=>c.id===Y);s&&(ye(s),h=!0)}if(!h){const s=localStorage.getItem("emi_draft");if(s)try{const c=JSON.parse(s);if(c.activeProfileId){const y=m.find(H=>H.id===c.activeProfileId);y&&(ye(y),h=!0)}h||(ie(c.bankName||"HDFC Bank"),ke(c.amount||"500000"),Pe(c.rate||"9.5"),De(c.tenure||"5"),Se(c.tenureType||"years"),Ce(c.loanDate||w(new Date,"yyyy-MM-dd")),Me(c.firstEmiDate||w(fe(new Date,1),"yyyy-MM-dd")),z(c.selectedTruckId||null),F(c.activeProfileId||null))}catch(c){console.error("Failed to parse draft",c)}else{const c=await K();c&&ye(c)}}})()},[o,K,Y]),r.useEffect(()=>{const t={bankName:k,amount:B,rate:O,tenure:v,tenureType:I,loanDate:Q,firstEmiDate:T,activeProfileId:p,selectedTruckId:n};localStorage.setItem("emi_draft",JSON.stringify(t))},[k,B,O,v,I,Q,T,p,n]);const ye=t=>{ke(t.loanAmount?.toString()||"0"),Pe(t.interestRate?.toString()||"0"),De(t.loanTerm?.toString()||"0"),Se("months"),ie(t.bank_name||"HDFC Bank"),Ce(t.disbursal_date?t.disbursal_date.substring(0,10):w(new Date,"yyyy-MM-dd")),Me(t.first_emi_date?t.first_emi_date.substring(0,10):w(fe(new Date,1),"yyyy-MM-dd")),z(t.truck_id||null),F(t.id)},Be=async t=>{if(!t){F(null);return}const m=await re(t);m&&ye(m)},ut=async t=>{const m=I==="years"?parseFloat(v)*12:parseFloat(v),h={profileName:t,loanAmount:parseFloat(B)||0,interestRate:parseFloat(O)||0,loanTerm:m||0,isDefault:i.length===0,bank_name:k,disbursal_date:Q,first_emi_date:T,truck_id:n||null},s=await x(h);s&&F(s.id)},xt=async()=>{if(!p)return;const t=I==="years"?parseFloat(v)*12:parseFloat(v),m={loanAmount:parseFloat(B)||0,interestRate:parseFloat(O)||0,loanTerm:t||0,bank_name:k,disbursal_date:Q,first_emi_date:T,truck_id:n||null};try{await g(p,m)}catch(h){console.error("Failed to update profile:",h)}},ht=async t=>{const m={profileName:`${t.profileName} (Copy)`,loanAmount:t.loanAmount,interestRate:t.interestRate,loanTerm:t.loanTerm,isDefault:!1,bank_name:t.bank_name,disbursal_date:t.disbursal_date,first_emi_date:t.first_emi_date,truck_id:t.truck_id||null};await x(m)},{schedule:de,summary:u,prepaidSchedule:Wt,prepaidSummary:W}=r.useMemo(()=>{const t=parseFloat(B)||0,m=parseFloat(O)||0,h=parseFloat(v)||0,s=I==="years"?h*12:h;if(t<=0||s<=0||!T)return{schedule:[],summary:null,prepaidSchedule:[],prepaidSummary:null};const c=$t(T);if(!zt(c))return{schedule:[],summary:null,prepaidSchedule:[],prepaidSummary:null};const y=m/12/100;let H=0;y===0?H=t/s:H=t*y*Math.pow(1+y,s)/(Math.pow(1+y,s)-1);const oe=[];let Ne=t,ce=0;const ve=new Date;let me=0,ue=0;for(let P=1;P<=s;P++){const R=Ne*y;let U=H-R;P===s&&(U=Ne,H=U+R),Ne-=U,ce+=R;const V=fe(c,P-1),X=nt(V,ve)||it(V,ve);X&&(me+=U,ue+=R),oe.push({number:P,date:V,emiAmount:H,principal:U,interest:R,balance:Math.max(0,Ne),isPaid:X})}const He=t+ce;let xe=[],Ue=null;const Ve=parseFloat(be)||0,qe=parseFloat(je)||0,Je=parseInt(Fe)||0;if(Ve>0||qe>0&&Je>0){let P=t,R=0,U=0;for(let V=1;V<=s*2&&!(P<=.01);V++){U++;const X=P*y;let he=H-X;P<he&&(he=P);let Ke=Ve;V===Je&&(Ke+=qe);let pe=he+Ke;P<pe&&(pe=P),P-=pe,R+=X;const Ie=fe(c,V-1),gt=nt(Ie,ve)||it(Ie,ve);xe.push({number:V,date:Ie,emiAmount:he+X+(pe-he),principal:pe,interest:X,balance:Math.max(0,P),isPaid:gt})}Ue={totalInterest:R,totalAmount:t+R,monthsCount:U,interestSaved:Math.max(0,ce-R),monthsSaved:Math.max(0,s-U),lastEmiDate:xe.length>0?xe[xe.length-1].date:null}}return{schedule:oe,summary:{emi:H,totalPrincipal:t,totalInterest:ce,totalAmount:He,paidPrincipal:me,paidInterest:ue,paidTotal:me+ue,outstandingPrincipal:t-me,outstandingInterest:ce-ue,outstandingTotal:He-(me+ue),lastEmiDate:oe.length>0?oe[oe.length-1].date:null},prepaidSchedule:xe,prepaidSummary:Ue}},[B,O,v,I,T,be,je,Fe]),f=t=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(t||0),pt=()=>{try{const t=de.map(y=>({Installment:String(y.number),"Due Date":w(y.date,"dd MMM yyyy"),"EMI Amount (Rs.)":Math.round(y.emiAmount),"Principal (Rs.)":Math.round(y.principal),"Interest (Rs.)":Math.round(y.interest),"Remaining Balance (Rs.)":Math.round(y.balance),Status:y.isPaid?"Paid":"Pending"})),m=[{header:"Installment",key:"Installment"},{header:"Due Date",key:"Due Date"},{header:"EMI Amount (Rs.)",key:"EMI Amount (Rs.)"},{header:"Principal (Rs.)",key:"Principal (Rs.)"},{header:"Interest (Rs.)",key:"Interest (Rs.)"},{header:"Remaining Balance (Rs.)",key:"Remaining Balance (Rs.)"},{header:"Status",key:"Status"}],h={Installment:"TOTALS","Due Date":"","EMI Amount (Rs.)":Math.round(u.totalAmount),"Principal (Rs.)":Math.round(u.totalPrincipal),"Interest (Rs.)":Math.round(u.totalInterest),"Remaining Balance (Rs.)":"",Status:""},s=`Amortization_Schedule_${k.replace(/\s+/g,"_")}_${w(new Date,"yyyyMMdd")}`,c=generatePDF(t,s,{title:`${k} Loan Amortization Schedule`,columns:m,totals:h});downloadFile(c,`${s}.pdf`),L.success("PDF Amortization Schedule downloaded!")}catch(t){L.error("Failed to export PDF: "+t.message)}},ft=()=>{try{const t=de.map(s=>({Installment:s.number,"Due Date":w(s.date,"yyyy-MM-dd"),"EMI Amount":Math.round(s.emiAmount),"Principal Paid":Math.round(s.principal),"Interest Paid":Math.round(s.interest),"Remaining Balance":Math.round(s.balance),Status:s.isPaid?"Paid":"Pending"})),m=`Amortization_Schedule_${k.replace(/\s+/g,"_")}_${w(new Date,"yyyyMMdd")}`,h=generateExcel(t,"Loan_Schedule","Amortization");downloadFile(h,`${m}.xlsx`),L.success("Excel Amortization Schedule downloaded!")}catch(t){L.error("Failed to export Excel: "+t.message)}},Oe=i?.find(t=>t.id===p)?.profileName;return e.jsxs("div",{className:"p-3 sm:p-6 w-full max-w-7xl mx-auto space-y-4 sm:space-y-8 animate-in fade-in duration-500 overflow-x-hidden pb-28 sm:pb-8 box-border",children:[e.jsxs(wt,{children:[e.jsx("title",{children:"EMI Calculator | Financial Hub"}),e.jsx("meta",{name:"description",content:"Calculate and manage your loan EMIs"})]}),e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 bg-card p-3.5 sm:p-5 rounded-2xl border border-border shadow-sm w-full min-w-0",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-xl sm:text-2xl font-bold tracking-tight text-foreground flex flex-wrap items-center gap-2 sm:gap-3",children:[e.jsx(Ye,{className:"w-7 h-7 text-primary"}),"EMI Calculator",S&&!i?.length?e.jsx("div",{className:"h-5 w-24 bg-muted animate-pulse rounded-md ml-2"}):Oe?e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(J,{variant:"secondary",className:"ml-2 font-medium",children:Oe}),_e&&e.jsx(J,{variant:"outline",className:"border-amber-500/30 text-amber-500 bg-amber-500/10 font-medium text-[10px] px-1.5 py-0 h-5",children:"Unsaved Changes"})]}):null]}),e.jsx("p",{className:"text-muted-foreground mt-1 text-sm",children:"Calculate your monthly installments and track outstanding loan balances."})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0",children:[e.jsx(Gt,{profiles:i||[],activeProfileId:p,onProfileChange:Be,loading:S,trucks:ne}),e.jsxs(N,{variant:"outline",onClick:()=>b(!0),disabled:S&&!i?.length,className:"rounded-xl shadow-sm w-full sm:w-auto justify-center",children:[S&&!i?.length?e.jsx(ge,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(kt,{className:"w-4 h-4 mr-2"}),"Manage Profiles"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0",children:[e.jsxs("div",{className:"lg:col-span-4 space-y-4 sm:space-y-6 w-full min-w-0",children:[e.jsxs(q,{className:"border-border shadow-sm",children:[e.jsx(te,{className:"bg-muted/20 border-b border-border pb-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs(ae,{className:"text-lg flex items-center gap-2",children:[e.jsx(Pt,{className:"w-5 h-5 text-primary"}),"Loan Details"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[p&&e.jsxs(N,{variant:"ghost",size:"sm",onClick:xt,disabled:S||!_e,className:`h-8 text-xs font-semibold ${_e?"text-success hover:text-success/80 hover:bg-success/10":"text-muted-foreground opacity-50 cursor-not-allowed"}`,children:[e.jsx(Ge,{className:"w-3.5 h-3.5 mr-1.5"})," Save Changes"]}),e.jsx(N,{variant:"ghost",size:"sm",onClick:()=>b(!0),disabled:S&&!i?.length,className:"h-8 text-xs text-primary hover:text-primary/80",children:p?"Profiles":e.jsxs(e.Fragment,{children:[e.jsx(Ge,{className:"w-3.5 h-3.5 mr-1.5"})," Save"]})})]})]})}),e.jsxs(G,{className:"space-y-3.5 sm:space-y-4 pt-4 sm:pt-6 p-3.5 sm:p-6 w-full min-w-0",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"bankName",children:"Bank / Financial Institution"}),e.jsx(M,{id:"bankName",value:k,onChange:t=>{ie(t.target.value)},placeholder:"e.g. HDFC Bank",className:"bg-background rounded-xl"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"truckSelect",children:"Linked Truck"}),e.jsxs(Re,{value:n||"none",onValueChange:t=>{z(t==="none"?null:t)},children:[e.jsx(Le,{id:"truckSelect",className:"bg-background rounded-xl",children:e.jsx($e,{placeholder:"Select a truck"})}),e.jsxs(ze,{children:[e.jsx(se,{value:"none",children:"None"}),ne.map(t=>e.jsxs(se,{value:t.id,children:[t.truck_number," ",t.truck_name?`(${t.truck_name})`:""]},t.id))]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"amount",children:"Loan Amount (₹)"}),e.jsxs("div",{className:"relative",children:[e.jsx(Qe,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"}),e.jsx(M,{id:"amount",type:"number",value:B,onChange:t=>{ke(t.target.value)},className:"pl-9 bg-background font-medium rounded-xl"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"rate",children:"Annual Interest Rate (%)"}),e.jsxs("div",{className:"relative",children:[e.jsx(We,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"}),e.jsx(M,{id:"rate",type:"number",step:"0.1",value:O,onChange:t=>{Pe(t.target.value)},className:"pl-9 bg-background rounded-xl"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"tenure",children:"Tenure"}),e.jsx(M,{id:"tenure",type:"number",value:v,onChange:t=>{De(t.target.value)},className:"bg-background rounded-xl"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"tenureType",children:"Period"}),e.jsxs(Re,{value:I,onValueChange:t=>{Se(t)},children:[e.jsx(Le,{id:"tenureType",className:"bg-background rounded-xl",children:e.jsx($e,{})}),e.jsxs(ze,{children:[e.jsx(se,{value:"years",children:"Years"}),e.jsx(se,{value:"months",children:"Months"})]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-2 w-full min-w-0",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"loanDate",children:"Disbursal Date"}),e.jsx(M,{id:"loanDate",type:"date",value:Q,onChange:t=>{Ce(t.target.value)},className:"bg-background rounded-xl"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"firstEmiDate",children:"First EMI Date"}),e.jsx(M,{id:"firstEmiDate",type:"date",value:T,onChange:t=>{Me(t.target.value)},className:"bg-background rounded-xl"})]})]}),p&&e.jsxs("div",{className:"space-y-2 pt-4 border-t border-border mt-4",children:[e.jsxs(D,{className:"flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider",children:[e.jsx("span",{children:"Loan Document"}),j?.loan_document&&e.jsx("span",{className:"text-[10px] text-success-foreground lowercase font-normal normal-case bg-success/15 px-2 py-0.5 rounded-full border border-success/30 flex items-center gap-1",children:e.jsx(J,{variant:"outline",className:"border-transparent p-0 bg-transparent text-success text-[10px]",children:"active"})})]}),j?.loan_document?e.jsxs("div",{className:"flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border",children:[e.jsxs("div",{className:"flex items-center gap-2 overflow-hidden mr-2",children:[e.jsx(Dt,{className:"w-5 h-5 text-primary shrink-0"}),e.jsx("span",{className:"text-sm font-medium truncate text-foreground",title:j.loan_document,children:j.loan_document})]}),e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[e.jsxs(N,{type:"button",variant:"ghost",size:"sm",onClick:()=>{const t=A.files.getUrl(j,j.loan_document);window.open(t,"_blank")},className:"h-8 text-xs text-primary hover:bg-primary/10 hover:text-primary rounded-lg",children:[e.jsx(St,{className:"w-3.5 h-3.5 mr-1"})," View"]}),e.jsx(N,{type:"button",variant:"ghost",size:"icon",onClick:d,disabled:E,className:"h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg",title:"Remove document",children:e.jsx(Te,{className:"w-3.5 h-3.5"})})]})]}):e.jsxs("div",{className:"relative",children:[e.jsx(M,{type:"file",accept:"application/pdf",onChange:l,disabled:E,className:"hidden",id:"loan-doc-upload"}),e.jsxs("label",{htmlFor:"loan-doc-upload",className:`flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors ${E?"opacity-50 pointer-events-none":""}`,children:[E?e.jsx(ge,{className:"w-5 h-5 animate-spin text-primary mb-1"}):e.jsx(Ct,{className:"w-5 h-5 text-muted-foreground mb-1"}),e.jsx("span",{className:"text-xs font-semibold text-foreground",children:E?"Uploading PDF...":"Upload Loan PDF Document"}),e.jsx("span",{className:"text-[10px] text-muted-foreground mt-0.5",children:"PDF format up to 20MB"})]})]})]})]})]}),e.jsxs(q,{className:"border-border shadow-sm",children:[e.jsxs(te,{className:"bg-muted/20 border-b border-border pb-4",children:[e.jsxs(ae,{className:"text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2",children:[e.jsx(Xe,{className:"w-4 h-4 text-primary"}),"Prepayment Simulator"]}),e.jsx(Ae,{children:"Accelerate your repayment and save interest"})]}),e.jsxs(G,{className:"space-y-4 pt-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"extraMonthly",children:"Extra Monthly Payment (₹)"}),e.jsxs("div",{className:"relative",children:[e.jsx(Qe,{className:"absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"}),e.jsx(M,{id:"extraMonthly",type:"number",min:"0",value:be==="0"?"":be,onChange:t=>ot(t.target.value||"0"),className:"pl-9 bg-background font-semibold text-xs rounded-xl",placeholder:"e.g. 5000"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"lumpSum",children:"Lump-Sum (₹)"}),e.jsx(M,{id:"lumpSum",type:"number",min:"0",value:je==="0"?"":je,onChange:t=>ct(t.target.value||"0"),className:"bg-background font-semibold text-xs rounded-xl",placeholder:"e.g. 100000"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(D,{htmlFor:"lumpMonth",children:"Month Number"}),e.jsx(M,{id:"lumpMonth",type:"number",min:"1",value:Fe,onChange:t=>mt(t.target.value),className:"bg-background text-xs rounded-xl",placeholder:"e.g. 12"})]})]})]})]})]}),e.jsx("div",{className:"lg:col-span-8 space-y-4 sm:space-y-6 w-full min-w-0",children:u?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"grid grid-cols-3 gap-1.5 sm:gap-4 w-full min-w-0",children:[e.jsx(q,{className:"bg-primary text-primary-foreground border-transparent shadow-md rounded-2xl",children:e.jsxs(G,{className:"p-6",children:[e.jsx("p",{className:"text-primary-foreground/80 text-sm font-medium mb-1",children:"Monthly EMI"}),e.jsx("p",{className:"text-2xl sm:text-3xl font-bold tracking-tight tabular-nums truncate",children:f(u.emi)}),e.jsxs("p",{className:"text-primary-foreground/70 text-xs mt-2 truncate",children:[k," Loan"]})]})}),e.jsx(q,{className:"bg-card border-border shadow-sm rounded-2xl",children:e.jsxs(G,{className:"p-6",children:[e.jsx("p",{className:"text-muted-foreground text-sm font-medium mb-1",children:"Total Interest"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight text-destructive tabular-nums truncate",children:f(u.totalInterest)}),e.jsxs("p",{className:"text-muted-foreground text-xs mt-2",children:["Over ",I==="years"?v*12:v," months"]})]})}),e.jsx(q,{className:"bg-card border-border shadow-sm rounded-2xl",children:e.jsxs(G,{className:"p-6",children:[e.jsx("p",{className:"text-muted-foreground text-sm font-medium mb-1",children:"Total Amount Payable"}),e.jsx("p",{className:"text-xl sm:text-2xl font-bold tracking-tight tabular-nums truncate",children:f(u.totalAmount)}),e.jsx("p",{className:"text-muted-foreground text-xs mt-2",children:"Principal + Interest"})]})})]}),W&&W.interestSaved>0&&e.jsxs(q,{className:"border-emerald-500/30 bg-emerald-500/5 shadow-sm rounded-2xl overflow-hidden animate-in zoom-in duration-300",children:[e.jsxs(te,{className:"bg-emerald-500/10 border-b border-emerald-500/10 pb-4",children:[e.jsxs(ae,{className:"text-lg text-emerald-500 flex items-center gap-2 font-extrabold",children:[e.jsx(Xe,{className:"w-5 h-5"}),"Prepayment Savings Analyst"]}),e.jsx(Ae,{className:"text-emerald-500/70 font-semibold",children:"Your extra payments will significantly reduce your loan cost and tenure!"})]}),e.jsxs(G,{className:"p-3.5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 w-full min-w-0",children:[e.jsxs("div",{className:"bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20",children:[e.jsx("p",{className:"text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1",children:"Total Interest Saved"}),e.jsx("p",{className:"text-xl sm:text-2xl font-extrabold text-emerald-500 tabular-nums truncate",children:f(W.interestSaved)}),e.jsx("p",{className:"text-emerald-500/70 text-[10px] mt-1 font-semibold",children:"Saved from bank interest charges"})]}),e.jsxs("div",{className:"bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20",children:[e.jsx("p",{className:"text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1",children:"Tenure Reduced By"}),e.jsxs("p",{className:"text-xl sm:text-2xl font-extrabold text-emerald-500 tabular-nums truncate",children:[W.monthsSaved," Months"]}),e.jsxs("p",{className:"text-emerald-500/70 text-[10px] mt-1 font-semibold",children:["Loan closed in ",W.monthsCount," months instead of ",I==="years"?v*12:v]})]}),e.jsxs("div",{className:"bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20",children:[e.jsx("p",{className:"text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1",children:"New Close Date"}),e.jsx("p",{className:"text-2xl font-extrabold text-emerald-500",children:W.lastEmiDate?w(W.lastEmiDate,"MMM yyyy"):"-"}),e.jsxs("p",{className:"text-emerald-500/70 text-[10px] mt-1 font-semibold",children:["Original close date: ",u.lastEmiDate?w(u.lastEmiDate,"MMM yyyy"):"-"]})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full min-w-0",children:[e.jsxs(q,{className:"border-border shadow-sm overflow-hidden rounded-2xl flex flex-col justify-between",children:[e.jsx(te,{className:"bg-muted/20 border-b border-border pb-4",children:e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs(ae,{className:"text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2",children:[e.jsx(Mt,{className:"w-4 h-4 text-primary"}),"Current Status (As of Today)"]})})}),e.jsxs(G,{className:"p-0 divide-y divide-border",children:[e.jsxs("div",{className:"grid grid-cols-2 divide-x divide-border",children:[e.jsxs("div",{className:"p-4",children:[e.jsx("span",{className:"text-[10px] text-muted-foreground font-semibold uppercase tracking-wider",children:"Paid Principal"}),e.jsx("p",{className:"text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5 sm:mt-1 truncate",children:f(u.paidPrincipal)})]}),e.jsxs("div",{className:"p-4",children:[e.jsx("span",{className:"text-[10px] text-muted-foreground font-semibold uppercase tracking-wider",children:"Paid Interest"}),e.jsx("p",{className:"text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5 sm:mt-1 truncate",children:f(u.paidInterest)})]})]}),e.jsxs("div",{className:"grid grid-cols-2 divide-x divide-border bg-muted/5",children:[e.jsxs("div",{className:"p-4",children:[e.jsx("span",{className:"text-[10px] text-warning font-semibold uppercase tracking-wider",children:"Out. Principal"}),e.jsx("p",{className:"text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5 sm:mt-1 truncate",children:f(u.outstandingPrincipal)})]}),e.jsxs("div",{className:"p-4",children:[e.jsx("span",{className:"text-[10px] text-destructive font-semibold uppercase tracking-wider",children:"Out. Interest"}),e.jsx("p",{className:"text-base sm:text-lg font-bold tabular-nums text-foreground mt-0.5 sm:mt-1 truncate",children:f(u.outstandingInterest)})]})]}),e.jsxs("div",{className:"bg-muted/30 p-4 space-y-1.5 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Original close:"}),e.jsx("span",{className:"font-semibold",children:u.lastEmiDate?w(u.lastEmiDate,"dd MMM yyyy"):"-"})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Total remaining cost:"}),e.jsx("span",{className:"font-bold text-foreground",children:f(u.outstandingTotal)})]})]})]})]}),e.jsxs(q,{className:"border-border shadow-sm overflow-hidden rounded-2xl flex flex-col justify-between",children:[e.jsx(te,{className:"bg-muted/20 border-b border-border pb-4",children:e.jsxs(ae,{className:"text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2",children:[e.jsx(We,{className:"w-4 h-4 text-primary"}),"Interest & Principal composition"]})}),e.jsx(G,{className:"p-2 sm:p-4 h-[180px] sm:h-[200px] w-full min-w-0 flex items-center justify-center",children:e.jsx(Ut,{width:"100%",height:"100%",children:e.jsxs(Jt,{children:[e.jsxs(Kt,{data:[{name:"Principal (Loan)",value:u.totalPrincipal},{name:"Total Interest",value:u.totalInterest}],cx:"50%",cy:"50%",innerRadius:45,outerRadius:70,paddingAngle:3,dataKey:"value",children:[e.jsx(dt,{fill:"hsl(var(--primary))"}),e.jsx(dt,{fill:"hsl(var(--destructive))"})]}),e.jsx(Vt,{formatter:t=>f(t)}),e.jsx(qt,{verticalAlign:"bottom",height:36,iconType:"circle"})]})})}),e.jsxs("div",{className:"bg-muted/30 px-4 py-2 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground",children:[e.jsxs("span",{children:["Principal: ",Math.round(u.totalPrincipal/u.totalAmount*100),"%"]}),e.jsxs("span",{children:["Interest: ",Math.round(u.totalInterest/u.totalAmount*100),"%"]})]})]})]})]}):e.jsx("div",{className:"h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/10 p-12 text-center",children:e.jsxs("div",{children:[e.jsx(Ye,{className:"w-12 h-12 text-muted-foreground/30 mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-medium text-foreground",children:"Enter Loan Details"}),e.jsx("p",{className:"text-sm text-muted-foreground max-w-sm mt-1",children:"Provide the loan amount, interest rate, and tenure to generate your amortization schedule."})]})})})]}),de.length>0&&e.jsxs(q,{className:"border-border shadow-sm rounded-2xl overflow-hidden",children:[e.jsx(te,{className:"bg-muted/20 border-b border-border",children:e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 w-full min-w-0",children:[e.jsxs("div",{children:[e.jsxs(ae,{className:"text-lg flex items-center gap-2",children:[e.jsx(Ft,{className:"w-5 h-5 text-primary"}),"Amortization Schedule"]}),e.jsx(Ae,{children:"Month-by-month breakdown of your repayment"})]}),e.jsxs("div",{className:"flex flex-wrap gap-2 w-full sm:w-auto",children:[e.jsxs(N,{variant:"outline",size:"sm",onClick:pt,className:"rounded-lg h-8 text-xs font-semibold",children:[e.jsx(Ze,{className:"w-3.5 h-3.5 mr-1 text-destructive"})," Export PDF"]}),e.jsxs(N,{variant:"outline",size:"sm",onClick:ft,className:"rounded-lg h-8 text-xs font-semibold",children:[e.jsx(Ze,{className:"w-3.5 h-3.5 mr-1 text-success"})," Export Excel"]})]})]})}),e.jsxs("div",{className:"overflow-x-auto",children:[e.jsx("div",{className:"hidden md:block max-h-[600px] overflow-y-auto relative custom-scrollbar",children:e.jsxs(Bt,{children:[e.jsx(Ot,{className:"sticky top-0 bg-card z-10 shadow-[0_1px_0_hsl(var(--border))]",children:e.jsxs(lt,{children:[e.jsx(Z,{className:"w-16 text-center",children:"#"}),e.jsx(Z,{children:"Date"}),e.jsx(Z,{className:"text-right",children:"EMI Amount"}),e.jsx(Z,{className:"text-right",children:"Principal Paid"}),e.jsx(Z,{className:"text-right",children:"Interest Paid"}),e.jsx(Z,{className:"text-right",children:"Closing Balance"}),e.jsx(Z,{className:"text-center w-24",children:"Status"})]})}),e.jsx(Ht,{children:de.map(t=>e.jsxs(lt,{className:t.isPaid?"bg-muted/20":"",children:[e.jsx(ee,{className:"text-center text-muted-foreground font-medium",children:t.number}),e.jsx(ee,{className:"whitespace-nowrap font-medium",children:w(t.date,"MMM dd, yyyy")}),e.jsx(ee,{className:"text-right tabular-nums font-semibold",children:f(t.emiAmount)}),e.jsx(ee,{className:"text-right tabular-nums text-success/90",children:f(t.principal)}),e.jsx(ee,{className:"text-right tabular-nums text-destructive/90",children:f(t.interest)}),e.jsx(ee,{className:"text-right tabular-nums font-medium",children:f(t.balance)}),e.jsx(ee,{className:"text-center",children:t.isPaid?e.jsx(J,{variant:"outline",className:"bg-success/10 text-success border-success/20",children:"Paid"}):e.jsx(J,{variant:"outline",className:"text-muted-foreground border-border",children:"Pending"})})]},t.number))})]})}),e.jsx("div",{className:"block md:hidden divide-y divide-border/40 max-h-[600px] overflow-y-auto custom-scrollbar w-full min-w-0",children:de.map(t=>e.jsxs("div",{className:`p-3 sm:p-4 space-y-2 hover:bg-muted/5 transition-colors ${t.isPaid?"bg-muted/10":""}`,children:[e.jsxs("div",{className:"flex justify-between items-start gap-3",children:[e.jsx("div",{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsxs("span",{className:"text-xs font-semibold text-muted-foreground",children:["#",t.number]}),e.jsx("p",{className:"font-bold text-sm text-foreground",children:w(t.date,"MMM dd, yyyy")})]})}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-extrabold text-sm text-foreground",children:f(t.emiAmount)}),t.isPaid?e.jsx(J,{variant:"outline",className:"bg-success/10 text-success border-success/20 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 mt-1",children:"Paid"}):e.jsx(J,{variant:"outline",className:"text-muted-foreground border-border text-[9px] uppercase font-bold tracking-wider px-1.5 py-0 mt-1",children:"Pending"})]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-border/20 text-[11px] sm:text-xs min-w-0",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] text-muted-foreground uppercase font-medium",children:"Principal"}),e.jsx("p",{className:"font-medium text-success/90 mt-0.5 truncate",children:f(t.principal)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] text-muted-foreground uppercase font-medium",children:"Interest"}),e.jsx("p",{className:"font-medium text-destructive/90 mt-0.5 truncate",children:f(t.interest)})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] text-muted-foreground uppercase font-medium",children:"Balance"}),e.jsx("p",{className:"font-bold text-foreground mt-0.5 truncate",children:f(t.balance)})]})]})]},t.number))})]})]}),e.jsx(Qt,{isOpen:le,onClose:()=>b(!1),profiles:i||[],activeProfileId:p,onProfileSelect:t=>{Be(t),b(!1)},onSave:ut,onUpdate:g,onDelete:C,onDuplicate:ht,onSetDefault:$,loading:S,trucks:ne})]})}
// ==========================================
// UPGRADED EMI CALCULATOR EXPANSION MODULES
// ==========================================

// Inline SVG Icon Helpers
const SvgIcons = {
  Calculator: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm3-6h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm3-6h.008v.008H14.25v-.008zm0 3h.008v.008H14.25v-.008zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-12.75h3" }) }),
  Compare: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" }) }),
  Discount: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z" }) }),
  Calendar: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" }) }),
  Plus: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }) }),
  Trash: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }) }),
  Copy: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" }) }),
  Share: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" }) }),
  Check: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }) }),
  Sparkles: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" }) }),
  ArrowRight: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }) }),
  Info: (props) => e.jsx("svg", { fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.8, stroke: "currentColor", className: props.className || "w-4 h-4", children: e.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" }) })
};

// Currency Formatter
const formatCurrency = (amount) => {
  const num = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Format Number with Indian Comma System
const formatNum = (amount) => {
  const num = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat('en-IN').format(num);
};

// ==========================================
// 1. COMPARE LOANS VIEW (2 to 4 LOANS)
// ==========================================
function CompareLoansView() {
  const [loans, setLoans] = r.useState([
    {
      id: 1,
      name: "Offer A (HDFC Commercial)",
      principal: 3000000,
      rate: 10.5,
      tenureMonths: 60,
      processingFeePct: 1.0
    },
    {
      id: 2,
      name: "Offer B (Tata Motors Finance)",
      principal: 3000000,
      rate: 11.2,
      tenureMonths: 60,
      processingFeePct: 0.5
    }
  ]);

  const [copiedId, setCopiedId] = r.useState(null);

  // Compute calculated values for each loan
  const evaluatedLoans = r.useMemo(() => {
    return loans.map(l => {
      const p = Math.max(10000, Number(l.principal) || 0);
      const annualRate = Math.max(0.1, Number(l.rate) || 0);
      const n = Math.max(1, Number(l.tenureMonths) || 1);
      const feePct = Math.max(0, Number(l.processingFeePct) || 0);

      const rMonthly = (annualRate / 12) / 100;
      const compoundFactor = Math.pow(1 + rMonthly, n);
      const emi = (p * rMonthly * compoundFactor) / (compoundFactor - 1);
      const totalRepay = emi * n;
      const totalInterest = Math.max(0, totalRepay - p);
      const procFee = p * (feePct / 100);
      const totalCost = totalRepay + procFee;

      const principalPct = totalRepay > 0 ? (p / totalRepay) * 100 : 100;
      const interestPct = totalRepay > 0 ? (totalInterest / totalRepay) * 100 : 0;

      return {
        ...l,
        principal: p,
        rate: annualRate,
        tenureMonths: n,
        processingFeePct: feePct,
        monthlyEmi: emi,
        totalInterest,
        totalRepayment: totalRepay,
        processingFee: procFee,
        totalCost,
        principalPct,
        interestPct
      };
    });
  }, [loans]);

  // Identify best offers
  const comparisonSummary = r.useMemo(() => {
    if (evaluatedLoans.length === 0) return null;
    let minEmiLoan = evaluatedLoans[0];
    let minInterestLoan = evaluatedLoans[0];
    let minTotalCostLoan = evaluatedLoans[0];
    let maxTotalCostLoan = evaluatedLoans[0];

    evaluatedLoans.forEach(l => {
      if (l.monthlyEmi < minEmiLoan.monthlyEmi) minEmiLoan = l;
      if (l.totalInterest < minInterestLoan.totalInterest) minInterestLoan = l;
      if (l.totalCost < minTotalCostLoan.totalCost) minTotalCostLoan = l;
      if (l.totalCost > maxTotalCostLoan.totalCost) maxTotalCostLoan = l;
    });

    const maxCostDiff = maxTotalCostLoan.totalCost - minTotalCostLoan.totalCost;
    const monthlySavings = (maxTotalCostLoan.monthlyEmi - minTotalCostLoan.monthlyEmi);

    return {
      minEmiId: minEmiLoan.id,
      minInterestId: minInterestLoan.id,
      bestValueId: minTotalCostLoan.id,
      maxCostDiff,
      monthlySavings: Math.max(0, monthlySavings),
      bestLoanName: minTotalCostLoan.name,
      highestLoanName: maxTotalCostLoan.name
    };
  }, [evaluatedLoans]);

  const updateLoan = (id, key, val) => {
    setLoans(prev => prev.map(item => item.id === id ? { ...item, [key]: val } : item));
  };

  const addLoan = () => {
    if (loans.length >= 4) return;
    const newId = Date.now();
    const alphabet = ["A", "B", "C", "D"][loans.length] || "X";
    setLoans(prev => [
      ...prev,
      {
        id: newId,
        name: "Offer " + alphabet + " (NBFC / Fleet)",
        principal: prev[0]?.principal || 3000000,
        rate: 11.5,
        tenureMonths: prev[0]?.tenureMonths || 60,
        processingFeePct: 1.0
      }
    ]);
  };

  const removeLoan = (id) => {
    if (loans.length <= 2) return;
    setLoans(prev => prev.filter(item => item.id !== id));
  };

  const applyPreset = (type) => {
    if (type === 'new_truck') {
      setLoans([
        { id: 1, name: "Offer A: Nationalized Bank (PSU)", principal: 3500000, rate: 9.8, tenureMonths: 60, processingFeePct: 0.5 },
        { id: 2, name: "Offer B: Private Fleet Financier", principal: 3500000, rate: 10.75, tenureMonths: 60, processingFeePct: 1.2 }
      ]);
    } else if (type === 'used_trailer') {
      setLoans([
        { id: 1, name: "Offer A: 3-Year Fixed Fleet Loan", principal: 1800000, rate: 12.0, tenureMonths: 36, processingFeePct: 1.0 },
        { id: 2, name: "Offer B: 4-Year Extended Repayment", principal: 1800000, rate: 13.25, tenureMonths: 48, processingFeePct: 1.5 }
      ]);
    } else if (type === 'multi_quote') {
      setLoans([
        { id: 1, name: "HDFC Commercial Vehicle", principal: 4000000, rate: 10.25, tenureMonths: 60, processingFeePct: 0.75 },
        { id: 2, name: "Tata Motors Finance", principal: 4000000, rate: 10.85, tenureMonths: 60, processingFeePct: 0.5 },
        { id: 3, name: "Chola / Shriram NBFC", principal: 4000000, rate: 12.0, tenureMonths: 60, processingFeePct: 1.5 }
      ]);
    }
  };

  const copyComparison = (loan) => {
    const text = "🚚 Loan Offer: " + loan.name + "\n" +
      "• Principal: " + formatCurrency(loan.principal) + "\n" +
      "• Interest Rate: " + loan.rate + "% (" + (loan.tenureMonths / 12).toFixed(1) + " yrs)\n" +
      "• Monthly EMI: " + formatCurrency(loan.monthlyEmi) + "/mo\n" +
      "• Total Interest: " + formatCurrency(loan.totalInterest) + "\n" +
      "• Total Outflow: " + formatCurrency(loan.totalCost);
    navigator.clipboard.writeText(text);
    setCopiedId(loan.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Header & Controls
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "⚖️" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Multi-Loan Comparator" }),
                  e.jsxs("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: [evaluatedLoans.length, " Loans Active"] })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Compare commercial truck & fleet financing proposals side-by-side with live cost savings analysis." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-2 flex-wrap",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: addLoan,
                disabled: loans.length >= 4,
                className: "px-3.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-semibold flex items-center gap-1.5 transition",
                children: [e.jsx(SvgIcons.Plus, { className: "w-3.5 h-3.5" }), " Add Loan (Max 4)"]
              })
            ]
          })
        ]
      }),

      // Presets bar
      e.jsxs("div", {
        className: "flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-[#0b0f19] p-3 rounded-xl border border-slate-800/80",
        children: [
          e.jsx("span", { className: "font-semibold text-slate-300 flex items-center gap-1", children: [e.jsx(SvgIcons.Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), " Quick Fleet Presets:"] }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('new_truck'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚚 New 16-Wheeler (₹35L PSU vs Pvt)" }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('used_trailer'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚛 Used Trailer (3Y vs 4Y Tenure)" }),
          e.jsx("button", { type: "button", onClick: () => applyPreset('multi_quote'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🏢 3-Way Bank Quote Comparison" })
        ]
      }),

      // Best Value Savings Banner
      comparisonSummary && comparisonSummary.maxCostDiff > 0 && e.jsxs("div", {
        className: "p-4 bg-gradient-to-r from-emerald-950/40 via-[#0f1d2b] to-[#0f1523] border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm",
        children: [
          e.jsxs("div", {
            className: "flex items-center gap-3",
            children: [
              e.jsx("div", { className: "w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0", children: "🏆" }),
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [
                      e.jsx("span", { className: "text-xs font-bold uppercase tracking-wider text-emerald-400", children: "FINANCIAL RECOMMENDATION" }),
                      e.jsxs("span", { className: "text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700", children: ["Winner: ", comparisonSummary.bestLoanName] })
                    ]
                  }),
                  e.jsxs("p", {
                    className: "text-sm text-slate-200 mt-0.5 font-medium",
                    children: [
                      "Choosing this offer saves ",
                      e.jsx("span", { className: "text-emerald-400 font-bold font-mono", children: formatCurrency(comparisonSummary.maxCostDiff) }),
                      " in total loan outflow compared to ",
                      comparisonSummary.highestLoanName,
                      "!"
                    ]
                  })
                ]
              })
            ]
          }),
          comparisonSummary.monthlySavings > 0 && e.jsxs("div", {
            className: "px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-right shrink-0",
            children: [
              e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-400 block", children: "MONTHLY CASHFLOW RELIEF" }),
              e.jsxs("span", { className: "text-base font-black text-emerald-300 font-mono", children: ["Save ", formatCurrency(comparisonSummary.monthlySavings), "/mo"] })
            ]
          })
        ]
      }),

      // Loans Side-by-Side Grid
      e.jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-" + Math.min(4, Math.max(2, loans.length)) + " gap-5",
        children: evaluatedLoans.map((loan, idx) => {
          const isBestValue = comparisonSummary && comparisonSummary.bestValueId === loan.id;
          const isLowestEmi = comparisonSummary && comparisonSummary.minEmiId === loan.id;
          const isLowestInterest = comparisonSummary && comparisonSummary.minInterestId === loan.id;

          return e.jsxs("div", {
            className: `relative bg-[#0f1523] border ${isBestValue ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-[#1e293b]/80'} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition`,
            children: [
              // Top Bar: Name & Badges
              e.jsxs("div", {
                className: "space-y-2",
                children: [
                  e.jsxs("div", {
                    className: "flex items-center justify-between gap-2",
                    children: [
                      e.jsx("input", {
                        type: "text",
                        value: loan.name,
                        onChange: (e2) => updateLoan(loan.id, 'name', e2.target.value),
                        className: "font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-primary focus:outline-none px-0.5 py-0.5 w-full truncate"
                      }),
                      loans.length > 2 && e.jsx("button", {
                        type: "button",
                        onClick: () => removeLoan(loan.id),
                        className: "p-1 text-slate-500 hover:text-rose-400 transition shrink-0",
                        title: "Remove loan",
                        children: e.jsx(SvgIcons.Trash, { className: "w-3.5 h-3.5" })
                      })
                    ]
                  }),

                  // Badges
                  e.jsxs("div", {
                    className: "flex items-center gap-1.5 flex-wrap min-h-[22px]",
                    children: [
                      isBestValue && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1", children: "🏆 Best Overall" }),
                      isLowestEmi && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full", children: "Lowest EMI" }),
                      isLowestInterest && e.jsx("span", { className: "text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full", children: "Lowest Interest" })
                    ]
                  })
                ]
              }),

              // Big Result Card: Monthly EMI
              e.jsxs("div", {
                className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 text-center space-y-1",
                children: [
                  e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-slate-400", children: "MONTHLY EMI" }),
                  e.jsx("p", { className: "text-2xl sm:text-3xl font-black text-white font-mono tracking-tight", children: formatCurrency(loan.monthlyEmi) }),
                  e.jsxs("span", { className: "text-[11px] text-slate-400 font-medium block", children: ["for ", loan.tenureMonths, " months (", (loan.tenureMonths / 12).toFixed(1), " yrs)"] })
                ]
              }),

              // Sliders & Direct Inputs
              e.jsxs("div", {
                className: "space-y-3.5 text-xs",
                children: [
                  // Principal
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Loan Principal" }),
                          e.jsx("span", { className: "text-white font-mono font-bold", children: formatCurrency(loan.principal) })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 50000,
                        max: 10000000,
                        step: 25000,
                        value: loan.principal,
                        onChange: (e2) => updateLoan(loan.id, 'principal', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Interest Rate
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Interest Rate (p.a.)" }),
                          e.jsxs("span", { className: "text-white font-mono font-bold", children: [loan.rate, "%"] })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 6.0,
                        max: 24.0,
                        step: 0.1,
                        value: loan.rate,
                        onChange: (e2) => updateLoan(loan.id, 'rate', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Tenure
                  e.jsxs("div", {
                    className: "space-y-1",
                    children: [
                      e.jsxs("div", {
                        className: "flex justify-between items-center text-slate-400 font-medium",
                        children: [
                          e.jsx("span", { children: "Loan Tenure" }),
                          e.jsxs("span", { className: "text-white font-mono font-bold", children: [loan.tenureMonths, " mo (", (loan.tenureMonths / 12).toFixed(1), " yr)"] })
                        ]
                      }),
                      e.jsx("input", {
                        type: "range",
                        min: 12,
                        max: 84,
                        step: 6,
                        value: loan.tenureMonths,
                        onChange: (e2) => updateLoan(loan.id, 'tenureMonths', Number(e2.target.value)),
                        className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      })
                    ]
                  }),

                  // Processing Fee
                  e.jsxs("div", {
                    className: "flex items-center justify-between pt-1 border-t border-slate-800/60 text-slate-400",
                    children: [
                      e.jsx("span", { children: "Proc. Fee %" }),
                      e.jsxs("div", {
                        className: "flex items-center gap-1",
                        children: [
                          e.jsx("input", {
                            type: "number",
                            min: 0,
                            max: 5,
                            step: 0.25,
                            value: loan.processingFeePct,
                            onChange: (e2) => updateLoan(loan.id, 'processingFeePct', Number(e2.target.value)),
                            className: "w-14 px-1.5 py-0.5 bg-[#0a0d14] border border-slate-800 rounded text-right font-mono text-white text-xs"
                          }),
                          e.jsx("span", { children: "%" })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Financial Breakdown Summary
              e.jsxs("div", {
                className: "pt-2 border-t border-slate-800/70 space-y-2 text-xs",
                children: [
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Principal Borrowed:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-white", children: formatCurrency(loan.principal) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Total Interest Cost:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-amber-400", children: formatCurrency(loan.totalInterest) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between text-slate-400",
                    children: [
                      e.jsx("span", { children: "Processing Fee:" }),
                      e.jsx("span", { className: "font-mono font-semibold text-slate-300", children: formatCurrency(loan.processingFee) })
                    ]
                  }),
                  e.jsxs("div", {
                    className: "flex justify-between pt-1 border-t border-slate-800/80 font-bold",
                    children: [
                      e.jsx("span", { className: "text-slate-300", children: "Total Loan Outflow:" }),
                      e.jsx("span", { className: "font-mono text-emerald-400 text-sm", children: formatCurrency(loan.totalCost) })
                    ]
                  }),

                  // Visual Progress Bar
                  e.jsxs("div", {
                    className: "space-y-1 pt-1",
                    children: [
                      e.jsxs("div", {
                        className: "w-full h-2 bg-slate-800 rounded-full overflow-hidden flex",
                        children: [
                          e.jsx("div", { className: "h-full bg-emerald-500", style: { width: loan.principalPct + "%" }, title: "Principal: " + loan.principalPct.toFixed(1) + "%" }),
                          e.jsx("div", { className: "h-full bg-amber-500", style: { width: loan.interestPct + "%" }, title: "Interest: " + loan.interestPct.toFixed(1) + "%" })
                        ]
                      }),
                      e.jsxs("div", {
                        className: "flex justify-between text-[10px] text-slate-500 font-bold uppercase",
                        children: [
                          e.jsxs("span", { children: ["Principal ", loan.principalPct.toFixed(0), "%"] }),
                          e.jsxs("span", { children: ["Interest ", loan.interestPct.toFixed(0), "%"] })
                        ]
                      })
                    ]
                  })
                ]
              }),

              // Copy Quote Action
              e.jsx("div", {
                className: "pt-2",
                children: e.jsxs("button", {
                  type: "button",
                  onClick: () => copyComparison(loan),
                  className: "w-full py-1.5 bg-[#131b2e] hover:bg-[#1c2742] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition",
                  children: [
                    copiedId === loan.id ? e.jsx(SvgIcons.Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }),
                    copiedId === loan.id ? "Copied to Clipboard!" : "Copy Offer Breakdown"
                  ]
                })
              })
            ]
          }, loan.id);
        })
      }),

      // Detailed Side-by-Side Metric Matrix Table
      e.jsxs("div", {
        className: "bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-5 shadow-sm space-y-4 overflow-hidden",
        children: [
          e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Direct Metrics Comparison Table" }),
          e.jsx("div", {
            className: "overflow-x-auto",
            children: e.jsxs("table", {
              className: "w-full text-xs text-left border-collapse",
              children: [
                e.jsx("thead", {
                  children: e.jsxs("tr", {
                    className: "border-b border-slate-800 text-slate-400",
                    children: [
                      e.jsx("th", { className: "py-2.5 px-3 font-semibold", children: "Financial Metric" }),
                      evaluatedLoans.map(l => e.jsx("th", { key: l.id, className: "py-2.5 px-3 font-semibold text-white", children: l.name }))
                    ]
                  })
                }),
                e.jsxs("tbody", {
                  className: "divide-y divide-slate-800/60 text-slate-300",
                  children: [
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Monthly EMI" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-bold " + (comparisonSummary?.minEmiId === l.id ? "text-emerald-400 bg-emerald-500/5" : "text-white"), children: formatCurrency(l.monthlyEmi) }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Annual Interest Rate" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-semibold", children: l.rate + "%" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Loan Tenure" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono", children: l.tenureMonths + " Months (" + (l.tenureMonths / 12).toFixed(1) + " Years)" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Total Interest Cost" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono font-semibold " + (comparisonSummary?.minInterestId === l.id ? "text-amber-400 bg-amber-500/5" : "text-slate-300"), children: formatCurrency(l.totalInterest) }))
                      ]
                    }),
                    e.jsxs("tr", {
                      children: [
                        e.jsx("td", { className: "py-2.5 px-3 text-slate-400 font-medium", children: "Processing Fee" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-2.5 px-3 font-mono", children: formatCurrency(l.processingFee) + " (" + l.processingFeePct + "%)" }))
                      ]
                    }),
                    e.jsxs("tr", {
                      className: "bg-slate-900/60 font-bold",
                      children: [
                        e.jsx("td", { className: "py-3 px-3 text-slate-200", children: "Total Loan Outflow" }),
                        evaluatedLoans.map(l => e.jsx("td", { key: l.id, className: "py-3 px-3 font-mono text-sm " + (comparisonSummary?.bestValueId === l.id ? "text-emerald-400 font-black bg-emerald-500/10" : "text-white"), children: formatCurrency(l.totalCost) }))
                      ]
                    })
                  ]
                })
              ]
            })
          })
        ]
      })
    ]
  });
}

// ==========================================
// 2. COMMERCIAL DISCOUNT & TAX CALCULATOR
// ==========================================
function DiscountCalculatorView() {
  const [invoiceAmount, setInvoiceAmount] = r.useState(50000);
  const [discountType, setDiscountType] = r.useState('percent'); // 'percent' or 'flat'
  const [discountVal, setDiscountVal] = r.useState(10); // 10%
  const [cashDiscountType, setCashDiscountType] = r.useState('percent');
  const [cashDiscountVal, setCashDiscountVal] = r.useState(2); // 2%
  const [gstRate, setGstRate] = r.useState(18); // 0, 5, 12, 18, 28
  const [copied, setCopied] = r.useState(false);
  const [mode, setMode] = r.useState('direct'); // 'direct' or 'reverse'
  const [targetBudget, setTargetBudget] = r.useState(50000);

  // Direct Calculations
  const results = r.useMemo(() => {
    const gross = Math.max(0, Number(invoiceAmount) || 0);

    // Primary discount
    let primaryDisc = 0;
    if (discountType === 'percent') {
      primaryDisc = gross * (Math.min(100, Math.max(0, Number(discountVal) || 0)) / 100);
    } else {
      primaryDisc = Math.min(gross, Math.max(0, Number(discountVal) || 0));
    }
    const afterPrimary = Math.max(0, gross - primaryDisc);

    // Cash discount
    let cashDisc = 0;
    if (cashDiscountType === 'percent') {
      cashDisc = afterPrimary * (Math.min(100, Math.max(0, Number(cashDiscountVal) || 0)) / 100);
    } else {
      cashDisc = Math.min(afterPrimary, Math.max(0, Number(cashDiscountVal) || 0));
    }
    const taxableBase = Math.max(0, afterPrimary - cashDisc);

    // GST
    const rate = Math.max(0, Number(gstRate) || 0);
    const gstAmount = taxableBase * (rate / 100);
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const finalPayable = taxableBase + gstAmount;

    const totalDiscountAmt = primaryDisc + cashDisc;
    const effectiveDiscountPct = gross > 0 ? (totalDiscountAmt / gross) * 100 : 0;

    return {
      gross,
      primaryDisc,
      afterPrimary,
      cashDisc,
      taxableBase,
      gstRate: rate,
      gstAmount,
      cgst,
      sgst,
      finalPayable,
      totalDiscountAmt,
      effectiveDiscountPct
    };
  }, [invoiceAmount, discountType, discountVal, cashDiscountType, cashDiscountVal, gstRate]);

  // Reverse mode calculation
  const reverseResults = r.useMemo(() => {
    const target = Math.max(0, Number(targetBudget) || 0);
    const rate = Math.max(0, Number(gstRate) || 0);
    // target = taxableBase * (1 + rate / 100)
    const derivedTaxable = target / (1 + (rate / 100));
    const derivedGst = target - derivedTaxable;

    // assume standard discount %
    const discPct = Math.min(99, Math.max(0, Number(discountVal) || 0));
    const derivedGross = discPct < 100 ? (derivedTaxable / (1 - (discPct / 100))) : derivedTaxable;
    const derivedDiscount = derivedGross - derivedTaxable;

    return {
      target,
      derivedTaxable,
      derivedGst,
      derivedGross,
      derivedDiscount
    };
  }, [targetBudget, gstRate, discountVal]);

  const setPreset = (preset) => {
    if (preset === 'gta') {
      setInvoiceAmount(85000);
      setDiscountType('percent');
      setDiscountVal(5);
      setCashDiscountVal(0);
      setGstRate(5);
    } else if (preset === 'tyres') {
      setInvoiceAmount(140000);
      setDiscountType('percent');
      setDiscountVal(12);
      setCashDiscountType('percent');
      setCashDiscountVal(2.5);
      setGstRate(18);
    } else if (preset === 'spare_parts') {
      setInvoiceAmount(25000);
      setDiscountType('flat');
      setDiscountVal(2500);
      setCashDiscountVal(0);
      setGstRate(28);
    } else if (preset === 'exempt') {
      setInvoiceAmount(60000);
      setDiscountType('percent');
      setDiscountVal(5);
      setCashDiscountVal(0);
      setGstRate(0);
    }
  };

  const copySummary = () => {
    const summary = "🧾 JAI BHAVANI CARGO - COMMERCIAL BILLING SUMMARY\n" +
      "• Gross Amount: " + formatCurrency(results.gross) + "\n" +
      "• Trade Discount: -" + formatCurrency(results.primaryDisc) + " (" + results.effectiveDiscountPct.toFixed(1) + "% eff.)\n" +
      (results.cashDisc > 0 ? ("• Cash Discount: -" + formatCurrency(results.cashDisc) + "\n") : "") +
      "• Net Taxable Value: " + formatCurrency(results.taxableBase) + "\n" +
      "• GST (" + results.gstRate + "%): +" + formatCurrency(results.gstAmount) + "\n" +
      "----------------------------------\n" +
      "• FINAL NET PAYABLE: " + formatCurrency(results.finalPayable);

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const summary = "*JAI BHAVANI CARGO - BILLING & DISCOUNT SUMMARY*\n\n" +
      "📋 *Gross Invoice*: " + formatCurrency(results.gross) + "\n" +
      "🏷️ *Discount Applied*: -" + formatCurrency(results.totalDiscountAmt) + "\n" +
      "📦 *Taxable Subtotal*: " + formatCurrency(results.taxableBase) + "\n" +
      "🏛️ *GST (" + results.gstRate + "%)*: +" + formatCurrency(results.gstAmount) + "\n" +
      "💰 *TOTAL NET PAYABLE*: *" + formatCurrency(results.finalPayable) + "*\n\n" +
      "Total Savings: " + formatCurrency(results.totalDiscountAmt) + " (" + results.effectiveDiscountPct.toFixed(1) + "%)";
    window.open("https://wa.me/?text=" + encodeURIComponent(summary), "_blank");
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "🏷️" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Commercial Discount & Tax Calculator" })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Accurately compute freight rate discounts, dealer margins, cash discounts, and GST tax waterfall." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => setMode('direct'),
                className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'direct' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`,
                children: "Direct Calculation"
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => setMode('reverse'),
                className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === 'reverse' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`,
                children: "Reverse Budget"
              })
            ]
          })
        ]
      }),

      // Presets
      e.jsxs("div", {
        className: "flex items-center gap-2 flex-wrap text-xs text-slate-400 bg-[#0b0f19] p-3 rounded-xl border border-slate-800/80",
        children: [
          e.jsx("span", { className: "font-semibold text-slate-300 flex items-center gap-1", children: [e.jsx(SvgIcons.Sparkles, { className: "w-3.5 h-3.5 text-amber-400" }), " Logistics Presets:"] }),
          e.jsx("button", { type: "button", onClick: () => setPreset('gta'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🚚 GTA Freight (5% GST)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('tyres'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🔘 Tyres / Spares (18% + Cash Disc)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('spare_parts'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "⚙️ Auto Parts / Chassis (28% GST)" }),
          e.jsx("button", { type: "button", onClick: () => setPreset('exempt'), className: "px-2.5 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-200 border border-slate-700/60 rounded-lg transition", children: "🌾 Agri Freight (0% Exempt)" })
        ]
      }),

      mode === 'direct' ? (
        // Direct Mode
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left Input Controls (7 cols)
            e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Input Parameters" }),

                // Base Invoice Value
                e.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Gross Invoice / Freight Value (₹)" }),
                        e.jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(invoiceAmount) })
                      ]
                    }),
                    e.jsx("input", {
                      type: "number",
                      min: 0,
                      value: invoiceAmount,
                      onChange: (e2) => setInvoiceAmount(Number(e2.target.value)),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                    }),
                    e.jsx("input", {
                      type: "range",
                      min: 1000,
                      max: 1000000,
                      step: 5000,
                      value: invoiceAmount,
                      onChange: (e2) => setInvoiceAmount(Number(e2.target.value)),
                      className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    })
                  ]
                }),

                // Primary Trade Discount
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Primary Trade / Volume Discount" }),
                        e.jsxs("div", {
                          className: "flex items-center gap-1 bg-[#0a0d14] p-0.5 rounded-lg border border-slate-800",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setDiscountType('percent'),
                              className: `px-2 py-0.5 rounded text-[11px] font-bold ${discountType === 'percent' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}`,
                              children: "%"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setDiscountType('flat'),
                              className: `px-2 py-0.5 rounded text-[11px] font-bold ${discountType === 'flat' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}`,
                              children: "₹ Flat"
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("input", {
                          type: "number",
                          min: 0,
                          value: discountVal,
                          onChange: (e2) => setDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                        }),
                        e.jsx("span", { className: "text-slate-400 text-xs font-semibold w-12", children: discountType === 'percent' ? '%' : '₹' })
                      ]
                    })
                  ]
                }),

                // Secondary / Cash Discount
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Prompt Payment / Cash Discount" }),
                        e.jsxs("div", {
                          className: "flex items-center gap-1 bg-[#0a0d14] p-0.5 rounded-lg border border-slate-800",
                          children: [
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setCashDiscountType('percent'),
                              className: `px-2 py-0.5 rounded text-[11px] font-bold ${cashDiscountType === 'percent' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}`,
                              children: "%"
                            }),
                            e.jsx("button", {
                              type: "button",
                              onClick: () => setCashDiscountType('flat'),
                              className: `px-2 py-0.5 rounded text-[11px] font-bold ${cashDiscountType === 'flat' ? 'bg-primary text-primary-foreground' : 'text-slate-400'}`,
                              children: "₹ Flat"
                            })
                          ]
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "flex items-center gap-2",
                      children: [
                        e.jsx("input", {
                          type: "number",
                          min: 0,
                          value: cashDiscountVal,
                          onChange: (e2) => setCashDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                        }),
                        e.jsx("span", { className: "text-slate-400 text-xs font-semibold w-12", children: cashDiscountType === 'percent' ? '%' : '₹' })
                      ]
                    })
                  ]
                }),

                // GST Rate Selector
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsx("label", { className: "text-slate-300 font-semibold text-xs block", children: "Applicable GST Tax Slab" }),
                    e.jsx("div", {
                      className: "grid grid-cols-5 gap-2",
                      children: [0, 5, 12, 18, 28].map(slab => e.jsxs("button", {
                        key: slab,
                        type: "button",
                        onClick: () => setGstRate(slab),
                        className: `py-2 rounded-xl text-xs font-bold transition border ${gstRate === slab ? 'bg-primary/20 border-primary text-primary font-black' : 'bg-[#0a0d14] border-slate-800 text-slate-300 hover:border-slate-700'}`,
                        children: [slab, "%"]
                      }))
                    })
                  ]
                })
              ]
            }),

            // Right Result Waterfall (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6",
              children: [
                e.jsxs("div", {
                  className: "space-y-4",
                  children: [
                    e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Price Waterfall Breakdown" }),

                    // Big Final Card
                    e.jsxs("div", {
                      className: "p-4 bg-gradient-to-b from-[#131b2e] to-[#0a0d14] rounded-2xl border border-slate-700/60 text-center space-y-1 shadow-sm",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "FINAL PAYABLE AMOUNT" }),
                        e.jsx("p", { className: "text-3xl font-black text-white font-mono tracking-tight", children: formatCurrency(results.finalPayable) }),
                        e.jsxs("div", {
                          className: "inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs text-emerald-400 font-semibold mt-1",
                          children: [
                            "Total Savings: ",
                            e.jsx("span", { className: "font-mono font-bold", children: formatCurrency(results.totalDiscountAmt) }),
                            " (", results.effectiveDiscountPct.toFixed(1), "%)"
                          ]
                        })
                      ]
                    }),

                    // Step-by-step Waterfall Rows
                    e.jsxs("div", {
                      className: "space-y-2 text-xs divide-y divide-slate-800/80 pt-1",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-slate-300",
                          children: [
                            e.jsx("span", { children: "1. Gross Invoice Amount:" }),
                            e.jsx("span", { className: "font-mono font-semibold text-white", children: formatCurrency(results.gross) })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-rose-400",
                          children: [
                            e.jsx("span", { children: "2. Trade Discount (-):" }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["-", formatCurrency(results.primaryDisc)] })
                          ]
                        }),
                        results.cashDisc > 0 && e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-rose-400",
                          children: [
                            e.jsx("span", { children: "3. Cash Discount (-):" }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["-", formatCurrency(results.cashDisc)] })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-sky-400 font-semibold",
                          children: [
                            e.jsx("span", { children: "4. Net Taxable Value:" }),
                            e.jsx("span", { className: "font-mono", children: formatCurrency(results.taxableBase) })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-amber-400",
                          children: [
                            e.jsxs("span", { children: ["5. GST (", results.gstRate, "%):"] }),
                            e.jsxs("span", { className: "font-mono font-semibold", children: ["+", formatCurrency(results.gstAmount)] })
                          ]
                        }),
                        results.gstRate > 0 && e.jsxs("div", {
                          className: "flex justify-between items-center pt-2 text-[11px] text-slate-500 pl-4",
                          children: [
                            e.jsxs("span", { children: ["CGST (", results.gstRate / 2, "%) + SGST (", results.gstRate / 2, "%):"] }),
                            e.jsxs("span", { className: "font-mono", children: [formatCurrency(results.cgst), " each"] })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Action Buttons
                e.jsxs("div", {
                  className: "grid grid-cols-2 gap-3 pt-2",
                  children: [
                    e.jsxs("button", {
                      type: "button",
                      onClick: copySummary,
                      className: "py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition",
                      children: [
                        copied ? e.jsx(SvgIcons.Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }),
                        copied ? "Copied!" : "Copy Summary"
                      ]
                    }),
                    e.jsxs("button", {
                      type: "button",
                      onClick: shareWhatsApp,
                      className: "py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition",
                      children: [e.jsx(SvgIcons.Share, { className: "w-3.5 h-3.5" }), " WhatsApp Quote"]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ) : (
        // Reverse Mode (Target Budget -> Gross Quote)
        e.jsxs("div", {
          className: "bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto",
          children: [
            e.jsxs("div", {
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Reverse Budget Margin Calculator" }),
                e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Customer gave an all-inclusive target budget? Compute backward to determine what base rate and discount to invoice." })
              ]
            }),

            e.jsxs("div", {
              className: "space-y-4",
              children: [
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Customer All-Inclusive Target Budget (₹)" }),
                    e.jsx("input", {
                      type: "number",
                      value: targetBudget,
                      onChange: (e2) => setTargetBudget(Number(e2.target.value)),
                      className: "w-full px-3.5 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-base focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                e.jsxs("div", {
                  className: "grid grid-cols-2 gap-4",
                  children: [
                    e.jsxs("div", {
                      className: "space-y-1.5",
                      children: [
                        e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Applicable GST Slab (%)" }),
                        e.jsx("select", {
                          value: gstRate,
                          onChange: (e2) => setGstRate(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs",
                          children: [0, 5, 12, 18, 28].map(s => e.jsxs("option", { value: s, children: [s, "% GST"] }, s))
                        })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "space-y-1.5",
                      children: [
                        e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Target Discount To Show (%)" }),
                        e.jsx("input", {
                          type: "number",
                          value: discountVal,
                          onChange: (e2) => setDiscountVal(Number(e2.target.value)),
                          className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono"
                        })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Reverse Results Table
            e.jsxs("div", {
              className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 space-y-3 text-xs",
              children: [
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsx("span", { children: "Recommended Base Quote (Before Discount):" }),
                    e.jsx("span", { className: "font-mono font-bold text-amber-400 text-sm", children: formatCurrency(reverseResults.derivedGross) })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsxs("span", { children: ["Discount to Show (", discountVal, "%):"] }),
                    e.jsxs("span", { className: "font-mono font-bold text-rose-400", children: ["-", formatCurrency(reverseResults.derivedDiscount)] })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsx("span", { children: "Net Taxable Base (Excl. Tax):" }),
                    e.jsx("span", { className: "font-mono font-bold text-white", children: formatCurrency(reverseResults.derivedTaxable) })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center text-slate-300",
                  children: [
                    e.jsxs("span", { children: ["GST Amount (", gstRate, "%):"] }),
                    e.jsxs("span", { className: "font-mono font-bold text-sky-400", children: ["+", formatCurrency(reverseResults.derivedGst)] })
                  ]
                }),
                e.jsxs("div", {
                  className: "flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold",
                  children: [
                    e.jsx("span", { className: "text-slate-200", children: "Total Budget (Target Match):" }),
                    e.jsx("span", { className: "font-mono text-emerald-400 font-black", children: formatCurrency(reverseResults.target) })
                  ]
                })
              ]
            })
          ]
        })
      )
    ]
  });
}

// ==========================================
// 3. LOGISTICS DAYS & DURATION CALCULATOR
// ==========================================
function DaysCalculatorView() {
  const [subTab, setSubTab] = r.useState('diff'); // 'diff' or 'add'

  // Mode 1: Difference
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

  const [startDate, setStartDate] = r.useState(todayStr);
  const [endDate, setEndDate] = r.useState(nextWeekStr);
  const [excludeSundays, setExcludeSundays] = r.useState(true);

  // Mode 2: Add/Subtract
  const [baseDate, setBaseDate] = r.useState(todayStr);
  const [dayOffset, setDayOffset] = r.useState(30);
  const [autoShiftSunday, setAutoShiftSunday] = r.useState(true);

  // Calculation for Mode 1
  const diffResults = r.useMemo(() => {
    if (!startDate || !endDate) return null;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);

    const diffMs = d2.getTime() - d1.getTime();
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const isNegative = totalDays < 0;
    const absDays = Math.abs(totalDays);

    const weeks = Math.floor(absDays / 7);
    const remainderDays = absDays % 7;

    // Count business working days
    let workingDays = 0;
    let sundaysCount = 0;
    const cur = new Date(Math.min(d1.getTime(), d2.getTime()));
    const end = new Date(Math.max(d1.getTime(), d2.getTime()));

    while (cur < end) {
      cur.setDate(cur.getDate() + 1);
      const dayOfWeek = cur.getDay(); // 0 is Sunday
      if (dayOfWeek === 0) {
        sundaysCount++;
      } else {
        workingDays++;
      }
    }

    return {
      totalDays,
      absDays,
      weeks,
      remainderDays,
      workingDays: isNegative ? -workingDays : workingDays,
      sundaysCount,
      transitHours: absDays * 24
    };
  }, [startDate, endDate]);

  // Calculation for Mode 2
  const addResults = r.useMemo(() => {
    if (!baseDate) return null;
    const start = new Date(baseDate);
    const target = new Date(start);
    target.setDate(target.getDate() + (Number(dayOffset) || 0));

    const dayOfWeek = target.getDay(); // 0 is Sunday
    const isSunday = dayOfWeek === 0;

    const adjusted = new Date(target);
    if (isSunday && autoShiftSunday) {
      adjusted.setDate(adjusted.getDate() + 1); // Shift to Monday
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formatFull = (d) => {
      return dayNames[d.getDay()] + ", " + d.getDate() + " " + monthNames[d.getMonth()] + " " + d.getFullYear();
    };

    return {
      targetDateStr: target.toISOString().split('T')[0],
      targetFormatted: formatFull(target),
      targetDayName: dayNames[dayOfWeek],
      isSunday,
      adjustedFormatted: formatFull(adjusted),
      adjustedDateStr: adjusted.toISOString().split('T')[0]
    };
  }, [baseDate, dayOffset, autoShiftSunday]);

  const setOffsetPreset = (days) => {
    setDayOffset(days);
  };

  return e.jsxs("div", {
    className: "space-y-6 animate-in fade-in duration-300",
    children: [
      // Top Header
      e.jsxs("div", {
        className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0f1523] border border-[#1e293b]/70 p-5 rounded-2xl shadow-sm",
        children: [
          e.jsxs("div", {
            children: [
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "text-lg", children: "📅" }),
                  e.jsx("h2", { className: "text-lg sm:text-xl font-bold text-white tracking-tight", children: "Logistics Days & Duration Calculator" })
                ]
              }),
              e.jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Calculate exact transit duration, freight credit due dates, POD SLAs, and business working days." })
            ]
          }),
          e.jsxs("div", {
            className: "flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800",
            children: [
              e.jsx("button", {
                type: "button",
                onClick: () => setSubTab('diff'),
                className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${subTab === 'diff' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`,
                children: "Date Difference"
              }),
              e.jsx("button", {
                type: "button",
                onClick: () => setSubTab('add'),
                className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${subTab === 'add' ? 'bg-primary text-primary-foreground shadow' : 'text-slate-400 hover:text-white'}`,
                children: "Add / Subtract Days"
              })
            ]
          })
        ]
      }),

      subTab === 'diff' ? (
        // Mode 1: Date Difference
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left Inputs (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-4",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Select Transit Dates" }),

                // Start Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Loading / Start Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: startDate,
                      onChange: (e2) => setStartDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // End Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Delivery / Unloading Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: endDate,
                      onChange: (e2) => setEndDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // Working day toggle
                e.jsxs("div", {
                  className: "pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300",
                  children: [
                    e.jsx("span", { children: "Exclude Sundays from Working Days" }),
                    e.jsx("input", {
                      type: "checkbox",
                      checked: excludeSundays,
                      onChange: (e2) => setExcludeSundays(e2.target.checked),
                      className: "w-4 h-4 accent-primary rounded cursor-pointer"
                    })
                  ]
                }),

                // Quick buttons
                e.jsxs("div", {
                  className: "flex items-center gap-2 pt-2",
                  children: [
                    e.jsx("button", {
                      type: "button",
                      onClick: () => { setStartDate(todayStr); },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "Start Today"
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 3);
                        setEndDate(d.toISOString().split('T')[0]);
                      },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "+3d Express"
                    }),
                    e.jsx("button", {
                      type: "button",
                      onClick: () => {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        setEndDate(d.toISOString().split('T')[0]);
                      },
                      className: "px-3 py-1 bg-[#131b2e] hover:bg-[#1e2a4a] text-slate-300 text-xs rounded-lg border border-slate-800 transition",
                      children: "+7d Interstate"
                    })
                  ]
                })
              ]
            }),

            // Right Results Display (7 cols)
            diffResults && e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Duration Results" }),

                // Big Day Count Cards
                e.jsxs("div", {
                  className: "grid grid-cols-2 sm:grid-cols-3 gap-3",
                  children: [
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-slate-400", children: "CALENDAR DAYS" }),
                        e.jsx("p", { className: "text-3xl font-black text-white font-mono", children: diffResults.absDays }),
                        e.jsxs("span", { className: "text-[10px] text-slate-500 font-medium block", children: [diffResults.weeks, "w ", diffResults.remainderDays, "d"] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "WORKING DAYS" }),
                        e.jsx("p", { className: "text-3xl font-black text-emerald-400 font-mono", children: diffResults.workingDays }),
                        e.jsxs("span", { className: "text-[10px] text-slate-500 font-medium block", children: ["Excl. ", diffResults.sundaysCount, " Sundays"] })
                      ]
                    }),
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-2xl border border-slate-800/80 text-center space-y-1 col-span-2 sm:col-span-1",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-sky-400", children: "TRANSIT HOURS" }),
                        e.jsx("p", { className: "text-3xl font-black text-sky-400 font-mono", children: diffResults.transitHours }),
                        e.jsx("span", { className: "text-[10px] text-slate-500 font-medium block", children: "Hours continuous" })
                      ]
                    })
                  ]
                }),

                // Logistics SLA Assessment Badge
                e.jsxs("div", {
                  className: "p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5",
                  children: [
                    e.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400 block", children: "LOGISTICS CLASSIFICATION" }),
                    e.jsxs("p", {
                      className: "text-sm font-semibold text-slate-200",
                      children: [
                        diffResults.absDays <= 3 ? "⚡ Express Regional Haul (≤ 3 Days)" :
                        diffResults.absDays <= 7 ? "🚚 Interstate Standard Transit (4 - 7 Days)" :
                        diffResults.absDays <= 14 ? "🌐 Long-Haul Cross-Country (8 - 14 Days)" :
                        "🚢 Extended Transit / Project Cargo (> 14 Days)",
                        " — Total duration covers ",
                        diffResults.workingDays,
                        " business handling days."
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ) : (
        // Mode 2: Add / Subtract Days (Credit Terms & SLA)
        e.jsxs("div", {
          className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
          children: [
            // Left (5 cols)
            e.jsxs("div", {
              className: "lg:col-span-5 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm space-y-5",
              children: [
                e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Credit & SLA Parameters" }),

                // Base Date
                e.jsxs("div", {
                  className: "space-y-1.5",
                  children: [
                    e.jsx("label", { className: "text-xs text-slate-300 font-semibold", children: "Invoice / Dispatch Date" }),
                    e.jsx("input", {
                      type: "date",
                      value: baseDate,
                      onChange: (e2) => setBaseDate(e2.target.value),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-primary"
                    })
                  ]
                }),

                // Offset Days Slider / Input
                e.jsxs("div", {
                  className: "space-y-2",
                  children: [
                    e.jsxs("div", {
                      className: "flex justify-between items-center text-xs",
                      children: [
                        e.jsx("label", { className: "text-slate-300 font-semibold", children: "Credit Period / SLA Offset" }),
                        e.jsxs("span", { className: "font-mono font-bold text-white", children: [dayOffset > 0 ? "+" : "", dayOffset, " Days"] })
                      ]
                    }),
                    e.jsx("input", {
                      type: "number",
                      value: dayOffset,
                      onChange: (e2) => setDayOffset(Number(e2.target.value)),
                      className: "w-full px-3 py-2 bg-[#0a0d14] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-primary"
                    }),
                    e.jsx("input", {
                      type: "range",
                      min: -60,
                      max: 120,
                      step: 1,
                      value: dayOffset,
                      onChange: (e2) => setDayOffset(Number(e2.target.value)),
                      className: "w-full accent-primary h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    })
                  ]
                }),

                // Shift Sunday Toggle
                e.jsxs("div", {
                  className: "pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-300",
                  children: [
                    e.jsxs("div", {
                      children: [
                        e.jsx("span", { className: "font-medium block", children: "Auto-shift Sunday to Monday" }),
                        e.jsx("span", { className: "text-[10px] text-slate-500", children: "Banking and credit terms rollover" })
                      ]
                    }),
                    e.jsx("input", {
                      type: "checkbox",
                      checked: autoShiftSunday,
                      onChange: (e2) => setAutoShiftSunday(e2.target.checked),
                      className: "w-4 h-4 accent-primary rounded cursor-pointer"
                    })
                  ]
                }),

                // Quick Logistics Offset Presets
                e.jsxs("div", {
                  className: "space-y-2 pt-2 border-t border-slate-800/60",
                  children: [
                    e.jsx("span", { className: "text-xs font-semibold text-slate-400 block", children: "Standard Fleet Credit Presets:" }),
                    e.jsxs("div", {
                      className: "grid grid-cols-2 gap-2 text-xs",
                      children: [
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(7), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+7d (Trip SLA)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(15), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+15d (POD SLA)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(30), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+30d (Standard Net)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(45), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+45d (Corporate)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(60), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+60d (Enterprise)" }),
                        e.jsx("button", { type: "button", onClick: () => setOffsetPreset(90), className: "p-2 bg-[#0a0d14] hover:bg-[#162035] border border-slate-800 rounded-xl text-left font-medium text-slate-200 transition", children: "+90d (Quarterly)" })
                      ]
                    })
                  ]
                })
              ]
            }),

            // Right Target Date Display (7 cols)
            addResults && e.jsxs("div", {
              className: "lg:col-span-7 bg-[#0f1523] border border-[#1e293b]/70 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6",
              children: [
                e.jsxs("div", {
                  className: "space-y-5",
                  children: [
                    e.jsx("h3", { className: "text-sm font-bold text-white uppercase tracking-wider", children: "Computed Due Date" }),

                    // Target Date Card
                    e.jsxs("div", {
                      className: "p-5 bg-gradient-to-b from-[#131b2e] to-[#0a0d14] rounded-2xl border border-slate-700/60 text-center space-y-1.5 shadow-sm",
                      children: [
                        e.jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-400", children: "FINAL PAYMENT DUE DATE" }),
                        e.jsx("p", { className: "text-2xl sm:text-3xl font-black text-white tracking-tight", children: autoShiftSunday && addResults.isSunday ? addResults.adjustedFormatted : addResults.targetFormatted }),
                        e.jsxs("span", {
                          className: "text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mt-1 " + (dayOffset >= 0 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"),
                          children: [dayOffset >= 0 ? ("Due in " + dayOffset + " days") : (Math.abs(dayOffset) + " days in the past")]
                        })
                      ]
                    }),

                    // Sunday Warning / Adjustment Notice
                    addResults.isSunday && e.jsxs("div", {
                      className: "p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2.5",
                      children: [
                        e.jsx(SvgIcons.Info, { className: "w-4 h-4 text-amber-400 shrink-0 mt-0.5" }),
                        e.jsxs("div", {
                          children: [
                            e.jsx("p", { className: "font-bold", children: "Target date lands on a Sunday (Non-Banking Day)." }),
                            autoShiftSunday
                              ? e.jsxs("p", { className: "text-amber-200/80 mt-0.5", children: ["Automatically rolled forward to next banking day: ", e.jsx("strong", { children: addResults.adjustedFormatted })] })
                              : e.jsx("p", { className: "text-amber-200/80 mt-0.5", children: "You have disabled auto-shift; settlement may require prior Friday clearing." })
                          ]
                        })
                      ]
                    }),

                    // Timeline Flow
                    e.jsxs("div", {
                      className: "p-4 bg-[#0a0d14] rounded-xl border border-slate-800/80 space-y-2 text-xs",
                      children: [
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Base / Start Date:" }),
                            e.jsx("span", { className: "font-mono font-bold text-white", children: baseDate })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Credit Term Added:" }),
                            e.jsxs("span", { className: "font-mono font-bold text-sky-400", children: [dayOffset > 0 ? "+" : "", dayOffset, " Days"] })
                          ]
                        }),
                        e.jsxs("div", {
                          className: "flex justify-between items-center text-slate-300",
                          children: [
                            e.jsx("span", { children: "Exact Calculated Day:" }),
                            e.jsx("span", { className: "font-semibold text-slate-200", children: addResults.targetDayName })
                          ]
                        })
                      ]
                    })
                  ]
                }),

                // Copy Action
                e.jsx("button", {
                  type: "button",
                  onClick: () => {
                    const text = "📅 Payment Terms Due Date: " + (autoShiftSunday && addResults.isSunday ? addResults.adjustedFormatted : addResults.targetFormatted) + " (" + dayOffset + " days credit from " + baseDate + ")";
                    navigator.clipboard.writeText(text);
                  },
                  className: "w-full py-2 bg-[#131b2e] hover:bg-[#1a243d] border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition",
                  children: [e.jsx(SvgIcons.Copy, { className: "w-3.5 h-3.5" }), " Copy Due Date Notice"]
                })
              ]
            })
          ]
        })
      )
    ]
  });
}

// ==========================================
// 4. MASTER UPGRADED EMI CALCULATOR HUB
// ==========================================
function UpgradedEMICalculatorHub(props) {
  // Sync tab with URL search parameter if present
  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (['emi', 'compare', 'discount', 'days'].includes(t)) return t;
    } catch (e) {}
    return 'emi';
  };

  const [activeTab, setActiveTab] = r.useState(getInitialTab);

  const setTab = (newTab) => {
    setActiveTab(newTab);
    try {
      const url = new URL(window.location);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url);
    } catch (e) {}
  };

  return e.jsxs("div", {
    className: "min-h-screen bg-[#070b13] text-slate-100 p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto",
    children: [
      // Top Navigation Hub Header & Tabs Switcher
      e.jsxs("div", {
        className: "bg-[#0b0f19] border border-[#1e293b]/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4",
        children: [
          e.jsxs("div", {
            className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsxs("div", {
                    className: "flex items-center gap-2.5",
                    children: [
                      e.jsx("span", { className: "text-2xl", children: "🧮" }),
                      e.jsx("h1", { className: "text-xl sm:text-2xl font-black text-white tracking-tight font-heading", children: "Fleet Financial & Loan Calculator Hub" }),
                      e.jsx("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest", children: "PRO UPGRADED" })
                    ]
                  }),
                  e.jsx("p", { className: "text-xs sm:text-sm text-slate-400 mt-1", children: "Comprehensive financial calculation suite for commercial fleet loans, multi-offer comparisons, freight discounts, and credit duration." })
                ]
              }),
              e.jsxs("div", {
                className: "flex items-center gap-2",
                children: [
                  e.jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
                  e.jsx("span", { className: "text-xs font-semibold text-slate-300", children: "Real-time Live Engine" })
                ]
              })
            ]
          }),

          // Tabs Navigation Switcher
          e.jsxs("div", {
            className: "flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none",
            children: [
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('emi'),
                className: `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'emi'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }`,
                children: [
                  e.jsx(SvgIcons.Calculator, { className: "w-4 h-4" }),
                  "EMI & Loan Calculator"
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('compare'),
                className: `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'compare'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }`,
                children: [
                  e.jsx(SvgIcons.Compare, { className: "w-4 h-4" }),
                  "Compare 2+ Loans",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-slate-950 font-black", children: "NEW" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('discount'),
                className: `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'discount'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }`,
                children: [
                  e.jsx(SvgIcons.Discount, { className: "w-4 h-4" }),
                  "Discount & Tax Calculator",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 font-black", children: "NEW" })
                ]
              }),
              e.jsxs("button", {
                type: "button",
                onClick: () => setTab('days'),
                className: `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'days'
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'bg-[#0f1523] text-slate-300 hover:text-white hover:bg-[#162035] border border-slate-800'
                }`,
                children: [
                  e.jsx(SvgIcons.Calendar, { className: "w-4 h-4" }),
                  "Days & SLA Calculator",
                  e.jsx("span", { className: "text-[10px] px-1.5 py-0.2 rounded-md bg-sky-500 text-slate-950 font-black", children: "NEW" })
                ]
              })
            ]
          })
        ]
      }),

      // Tab Content Views
      activeTab === 'emi' && e.jsx(na, { ...props }),
      activeTab === 'compare' && e.jsx(CompareLoansView, {}),
      activeTab === 'discount' && e.jsx(DiscountCalculatorView, {}),
      activeTab === 'days' && e.jsx(DaysCalculatorView, {})
    ]
  });
}

export { UpgradedEMICalculatorHub as default };

