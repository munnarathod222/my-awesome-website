import{r as l,j as e,al as T,aq as g,an as S}from"./vendor-react-CMo3lvZy.js";import{D as w,a as D,b as R,c as I,d as k,L as x,S as $,e as _,g as E,h as O,i as o,T as B,B as i,j as P,t as m}from"./index-1EbDe9dc.js";function G({isOpen:b,onClose:h,selectedCustomers:p=[]}){const[r,f]=l.useState("payment_reminder"),[c,j]=l.useState(""),s=l.useMemo(()=>p.filter(t=>t&&(t.phone||t.primary_contact)),[p]),d=t=>{const a=t.primary_contact||t.company_name||"Valued Customer",n=t.company_name||"Enterprise Account",u=(t.outstanding_amount||0).toLocaleString("en-IN"),A=(t.credit_limit||0).toLocaleString("en-IN");return r==="share_contacts"?`📇 *JAI BHAVANI CARGO - DIRECTORY CONTACT SHARE*

• *Name:* ${n}
• *Role / Designation:* ${a}
• *Phone:* ${t.phone||"N/A"}
• *Email:* ${t.email||"N/A"}`:r==="payment_reminder"?`🚚 *JAI BHAVANI CARGO - OUTSTANDING FREIGHT REMINDER*

Dear *${a}* (${n}),

This is a friendly reminder regarding your outstanding freight invoice balance of *₹${u}*.

• Credit Limit: ₹${A}
• Current Outstanding: ₹${u}

Kindly arrange for invoice settlement at your earliest convenience.

Thank you,
*Jai Bhavani Cargo Accounts Desk*`:r==="rate_offer"?`🚚 *JAI BHAVANI CARGO - EXCLUSIVE FREIGHT RATE QUOTE*

Dear *${a}* (${n}),

We are pleased to offer dedicated container & truck rates for your logistics routes with instant GPS tracking & zero-delay dispatch.

Contact us for contract bookings.

*Jai Bhavani Cargo Operations*`:r==="company_dossier"?`🏢 *JAI BHAVANI CARGO - CORPORATE DOSSIER*

GSTIN: 36DPXPR9171A1Z8
PAN: DPXPR9171A
Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234

For bookings & dispatch: +91 9876543210`:c||`Hello *${a}* (${n}), message from Jai Bhavani Cargo.`},C=l.useMemo(()=>s.length===0?"":s.map(t=>{const a=t.phone?` [Phone: ${t.phone}]`:"";return`${d(t)}${a}`}).join(`

--------------------------------------------------

`),[s,r,c]),N=()=>{navigator.clipboard.writeText(C),m.success(`Copied broadcast text for ${s.length} contacts to clipboard!`)},y=()=>{const t=s.map(a=>a.phone).filter(Boolean).join(", ");navigator.clipboard.writeText(t),m.success(`Copied ${s.length} phone numbers for WhatsApp Broadcast!`)},v=t=>{if(!t.phone){m.error(`No phone number available for ${t.company_name}`);return}const a=t.phone.replace(/[^0-9]/g,""),n=encodeURIComponent(d(t));window.open(`https://wa.me/${a.length===10?"91"+a:a}?text=${n}`,"_blank")};return e.jsx(w,{open:b,onOpenChange:h,children:e.jsxs(D,{className:"max-w-2xl bg-slate-900 border-slate-800 text-slate-100 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",children:[e.jsxs(R,{className:"shrink-0 pb-3 border-b border-slate-800",children:[e.jsxs(I,{className:"text-xl font-extrabold text-white flex items-center gap-2",children:[e.jsx(T,{className:"w-5 h-5 text-emerald-400"}),"WhatsApp Multi-Contact Broadcast (",s.length," Selected)"]}),e.jsx(k,{className:"text-xs text-slate-400",children:"Send payment reminders, rate quotes, or company dossiers directly to selected customer contacts via WhatsApp."})]}),e.jsxs("div",{className:"space-y-4 py-3 overflow-y-auto flex-1 pr-1 scrollbar-none",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(x,{className:"text-xs font-bold text-slate-300",children:"Select Message Template"}),e.jsxs($,{value:r,onValueChange:f,children:[e.jsx(_,{className:"bg-slate-950 border-slate-800 text-xs rounded-xl font-bold text-emerald-400",children:e.jsx(E,{placeholder:"Choose Template"})}),e.jsxs(O,{className:"bg-slate-900 border-slate-800 text-slate-100",children:[e.jsx(o,{value:"share_contacts",children:"📇 Share Selected Contact Cards / Directory Text"}),e.jsx(o,{value:"payment_reminder",children:"💰 Outstanding Freight Payment Reminder"}),e.jsx(o,{value:"rate_offer",children:"🚚 Dedicated Route Rate Offer / Quote"}),e.jsx(o,{value:"company_dossier",children:"🏢 Corporate Profile & GST/Bank Details"}),e.jsx(o,{value:"custom",children:"✏️ Custom Message"})]})]})]}),r==="custom"&&e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(x,{className:"text-xs font-bold text-slate-300",children:"Custom WhatsApp Message"}),e.jsx(B,{value:c,onChange:t=>j(t.target.value),placeholder:"Type your WhatsApp message...",className:"bg-slate-950 border-slate-800 text-xs rounded-xl h-24 text-white"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between items-center text-xs font-bold text-slate-400",children:[e.jsxs("span",{children:["Selected Contacts List (",s.length,")"]}),e.jsxs(i,{variant:"ghost",size:"sm",onClick:y,className:"h-6 text-[11px] text-amber-400 hover:text-amber-300 p-0",children:[e.jsx(g,{className:"w-3 h-3 mr-1"})," Copy Phone List"]})]}),e.jsx("div",{className:"space-y-1.5 max-h-48 overflow-y-auto pr-1",children:s.map(t=>e.jsxs("div",{className:"p-2.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs",children:[e.jsxs("div",{className:"flex items-center gap-2 truncate pr-2",children:[e.jsx("div",{className:"w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-emerald-500/20",children:t.company_name?.slice(0,2).toUpperCase()}),e.jsxs("div",{className:"truncate",children:[e.jsx("span",{className:"font-bold text-white block truncate",children:t.company_name}),e.jsxs("span",{className:"text-[10px] text-slate-400 block font-mono",children:[t.primary_contact||"Contact"," (",t.phone||"No phone",")"]})]})]}),e.jsxs(i,{size:"sm",variant:"outline",onClick:()=>v(t),className:"h-7 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 rounded-lg shrink-0 flex items-center gap-1 font-bold",children:["Send ",e.jsx(S,{className:"w-3 h-3"})]})]},t.id))})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(x,{className:"text-xs font-bold text-slate-300",children:"Message Preview"}),e.jsx("div",{className:"p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto",children:s.length>0?d(s[0]):"Select contacts to preview."})]})]}),e.jsxs(P,{className:"pt-3 border-t border-slate-800 shrink-0 flex flex-col sm:flex-row gap-2",children:[e.jsx(i,{variant:"outline",onClick:h,className:"rounded-xl text-xs border-slate-800 text-slate-300",children:"Cancel"}),e.jsxs(i,{onClick:N,className:"rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950",children:[e.jsx(g,{className:"w-3.5 h-3.5 mr-1.5"})," Copy Message Text"]})]})]})})}export{G as T};
