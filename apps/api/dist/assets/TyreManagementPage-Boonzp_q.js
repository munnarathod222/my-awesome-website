import{r as c,j as e,X as Z,dH as Ze,a0 as _e,a9 as Pe,ak as Qe,ag as Le,R as fe,dI as es,dJ as ss,az as Ae,a4 as Be,a2 as He,b2 as Q,cs as ts,aT as ie,dK as ze,ax as Ke,ap as as,aA as rs,dd as Ve,aS as ls,a6 as Oe,at as ns,aD as We,aE as ke,bL as is,u as ds,bE as os,aF as Te,dL as Re,a3 as Ne}from"./vendor-react-Bs5V2qFE.js";import{p as j,D as je,a as ye,b as Me,c as Ce,L as b,S as de,e as oe,g as ce,h as xe,i as K,I as R,B as _,j as Se,t as I,X as cs,w as G,k as ne,d as xs,T as ms,C as X,O as we,N as us,n as hs,s as ps,v as be,x as ge,ao as bs}from"./index-DLxf9dwO.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";const W=[{id:"front_left",label:"Front Left",axle:"front_axle"},{id:"front_right",label:"Front Right",axle:"front_axle"},{id:"rear_left_1",label:"Rear Left Outer",axle:"rear_axle"},{id:"rear_left_2",label:"Rear Left Inner",axle:"rear_axle"},{id:"rear_right_1",label:"Rear Right Inner",axle:"rear_axle"},{id:"rear_right_2",label:"Rear Right Outer",axle:"rear_axle"},{id:"stepney",label:"Stepney/Spare",axle:"stepney"}];function gs({isOpen:N,onClose:C,tyre:s,truck:V,initialPosition:l,onSuccess:S}){const[u,T]=c.useState(!1),[m,p]=c.useState([]),[x,y]=c.useState(null),[a,g]=c.useState({tyre_position:"",purchase_date:"",tyre_brand:"",model_no:"",serial_number:"",tyre_depth_mm:"",status:"active",assignment_start_kms:"",current_lifecycle_kms:""});c.useEffect(()=>{if(N)if(s){if(g({tyre_position:s.tyre_position||l||"",purchase_date:s.purchase_date?s.purchase_date.substring(0,10):new Date().toISOString().split("T")[0],tyre_brand:s.tyre_brand||"",model_no:s.model_no||"",serial_number:s.serial_number||"",tyre_depth_mm:s.tyre_depth_mm||"",status:s.status||"active",assignment_start_kms:s.assignment_start_kms!==void 0?s.assignment_start_kms:"",current_lifecycle_kms:s.base_lifecycle_kms!==void 0?s.base_lifecycle_kms:s.current_lifecycle_kms!==void 0?s.current_lifecycle_kms:""}),s.tyre_image){const o=Array.isArray(s.tyre_image)?s.tyre_image:[s.tyre_image];p(o.filter(Boolean).map(i=>({url:j.files.getUrl(s,i),isExisting:!0,name:i})))}else p([]);s.bill_invoice?y({url:j.files.getUrl(s,s.bill_invoice),isExisting:!0,name:s.bill_invoice}):y(null)}else g({tyre_position:l||"",purchase_date:new Date().toISOString().split("T")[0],tyre_brand:"",model_no:"",serial_number:"",tyre_depth_mm:"",status:"active",assignment_start_kms:"",current_lifecycle_kms:"0"}),p([]),y(null)},[N,s,l]);const P=o=>{const i=Array.from(o.target.files);if(i.length>0){const B=i.map(O=>({url:URL.createObjectURL(O),isExisting:!1,file:O}));p(O=>[...O,...B])}},w=o=>{const i=m[o];p(B=>B.filter((O,U)=>U!==o)),!i.isExisting&&i.url&&URL.revokeObjectURL(i.url)},k=o=>{const i=o.target.files[0];i&&(x&&!x.isExisting&&x.url&&URL.revokeObjectURL(x.url),y({url:URL.createObjectURL(i),isExisting:!1,file:i}))},L=()=>{x&&!x.isExisting&&x.url&&URL.revokeObjectURL(x.url),y(null)},A=async o=>{o.preventDefault(),T(!0);try{const i=new FormData;i.append("truck_id",V.id),i.append("tyre_position",a.tyre_position);const B=W.find(v=>v.id===a.tyre_position);i.append("axle_position",B?B.axle:"single_axle"),i.append("tyre_brand",a.tyre_brand),i.append("model_no",a.model_no),i.append("serial_number",a.serial_number),i.append("tyre_depth_mm",Number(a.tyre_depth_mm)),i.append("status",a.status),a.purchase_date&&i.append("purchase_date",a.purchase_date);let O=a.assignment_start_kms;if(!s?.id&&!O)try{O=(await j.collection("trip_logs").getFullList({filter:`truck_number = "${V.truck_number}" && trip_status = "Completed" && date < "${a.purchase_date}"`,$autoCancel:!1})).reduce((f,E)=>f+(E.kms||0),0)}catch(v){console.error("Failed to precalculate assignment start KMs:",v),O=0}i.append("assignment_start_kms",Number(O)||0),i.append("current_lifecycle_kms",Number(a.current_lifecycle_kms)||0);let U=!1;m.forEach(v=>{v.isExisting?(i.append("tyre_image",v.name),U=!0):v.file&&(i.append("tyre_image",v.file),U=!0)}),!U&&s?.tyre_image&&i.append("tyre_image",""),x?x.file?i.append("bill_invoice",x.file):x.isExisting&&i.append("bill_invoice",x.name):s?.bill_invoice&&i.append("bill_invoice",""),s?.id?(await j.collection("tyres").update(s.id,i,{$autoCancel:!1}),I.success("Tyre updated successfully")):(await j.collection("tyres").create(i,{$autoCancel:!1}),I.success("Tyre added successfully")),S(),C()}catch(i){console.error(i),I.error(i.message||"Failed to save tyre")}finally{T(!1)}};return e.jsx(je,{open:N,onOpenChange:o=>!o&&!u&&C(),children:e.jsxs(ye,{className:"sm:max-w-[650px] rounded-3xl p-0 overflow-hidden border-border/50 shadow-lg",children:[e.jsx(Me,{className:"bg-secondary/30 p-6 border-b border-border/50",children:e.jsx(Ce,{className:"font-heading text-2xl tracking-tight",children:s?"Edit Tyre Details":"Add New Tyre"})}),e.jsxs("form",{onSubmit:A,className:"p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Tyre Position ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs(de,{required:!0,value:a.tyre_position,onValueChange:o=>g({...a,tyre_position:o}),children:[e.jsx(oe,{className:"rounded-xl",children:e.jsx(ce,{placeholder:"Select Position"})}),e.jsx(xe,{children:W.map(o=>e.jsx(K,{value:o.id,children:o.label},o.id))})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Brand ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{required:!0,className:"rounded-xl",value:a.tyre_brand,onChange:o=>g({...a,tyre_brand:o.target.value})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Model No ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{required:!0,className:"rounded-xl",value:a.model_no,onChange:o=>g({...a,model_no:o.target.value})})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Serial Number ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{required:!0,className:"rounded-xl",value:a.serial_number,onChange:o=>g({...a,serial_number:o.target.value})})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Tread Depth (mm) ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{type:"number",step:"0.1",min:"0",required:!0,className:"rounded-xl",value:a.tyre_depth_mm,onChange:o=>g({...a,tyre_depth_mm:o.target.value})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Installation Date ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{type:"date",required:!0,className:"rounded-xl",value:a.purchase_date,onChange:o=>g({...a,purchase_date:o.target.value})})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{children:["Status ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs(de,{required:!0,value:a.status,onValueChange:o=>g({...a,status:o}),children:[e.jsx(oe,{className:"rounded-xl",children:e.jsx(ce,{})}),e.jsxs(xe,{children:[e.jsx(K,{value:"active",children:"Active"}),e.jsx(K,{value:"worn",children:"Worn"}),e.jsx(K,{value:"damaged",children:"Damaged"}),e.jsx(K,{value:"replaced",children:"Replaced"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Base KMs at Installation"}),e.jsx(R,{type:"number",min:"0",className:"rounded-xl",value:a.current_lifecycle_kms,onChange:o=>g({...a,current_lifecycle_kms:o.target.value}),placeholder:"e.g. 0"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Fitment Odometer (KM)"}),e.jsx(R,{type:"number",min:"0",className:"rounded-xl",value:a.assignment_start_kms,onChange:o=>g({...a,assignment_start_kms:o.target.value}),placeholder:s?"e.g. 120000":"Auto-calculate"})]})]}),e.jsxs("div",{className:"space-y-6 flex flex-col",children:[e.jsxs("div",{children:[e.jsx(b,{className:"text-sm font-semibold mb-2 block",children:"Tyre Photos"}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 min-h-[140px] border border-border/50 rounded-2xl p-3 bg-muted/10",children:[m.map((o,i)=>e.jsxs("div",{className:"relative aspect-video rounded-xl overflow-hidden border border-border group bg-background shadow-sm",children:[e.jsx("img",{src:o.url,alt:`Tyre preview ${i+1}`,className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",className:"absolute top-1.5 right-1.5 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100",onClick:()=>w(i),children:e.jsx(Z,{className:"w-3.5 h-3.5"})})]},i)),e.jsxs("div",{className:"border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl relative flex flex-col items-center justify-center min-h-[90px] aspect-video bg-muted/20 cursor-pointer",children:[e.jsx(Ze,{className:"w-5 h-5 text-muted-foreground mb-1"}),e.jsx("span",{className:"text-[11px] font-medium text-muted-foreground",children:"Add Photo"}),e.jsx("input",{type:"file",multiple:!0,accept:"image/*",className:"absolute inset-0 w-full h-full opacity-0 cursor-pointer",onChange:P,title:"Upload tyre photos"})]})]})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-sm font-semibold mb-2 block",children:"Upload Bill/Invoice"}),x?e.jsxs("div",{className:"flex items-center justify-between p-3 border border-border rounded-xl bg-background shadow-sm",children:[e.jsxs("div",{className:"flex items-center space-x-3 overflow-hidden",children:[e.jsx("div",{className:"p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0",children:e.jsx(_e,{className:"w-5 h-5"})}),e.jsx("span",{className:"text-xs font-medium truncate max-w-[180px]",children:x.isExisting?"Uploaded Bill/Invoice":x.file?.name})]}),e.jsx(_,{type:"button",variant:"ghost",size:"icon",className:"h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg",onClick:L,children:e.jsx(Z,{className:"w-4 h-4"})})]}):e.jsxs("div",{className:"border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 relative flex flex-col items-center justify-center bg-muted/20 cursor-pointer",children:[e.jsx(Pe,{className:"w-6 h-6 text-muted-foreground mb-2"}),e.jsx("span",{className:"text-xs font-medium text-foreground",children:"Click to upload bill/invoice"}),e.jsx("span",{className:"text-[10px] text-muted-foreground mt-1",children:"PDF, JPG, PNG up to 20MB"}),e.jsx("input",{type:"file",accept:"image/*,application/pdf",className:"absolute inset-0 w-full h-full opacity-0 cursor-pointer",onChange:k,title:"Upload invoice"})]})]})]})]}),e.jsxs(Se,{className:"pt-4 border-t border-border/50",children:[e.jsx(_,{type:"button",variant:"ghost",onClick:C,disabled:u,className:"rounded-xl",children:"Cancel"}),e.jsxs(_,{type:"submit",disabled:u||!a.tyre_position,className:"rounded-xl shadow-sm",children:[u&&e.jsx(Qe,{className:"w-4 h-4 mr-2 animate-spin"}),s?"Save Changes":"Add Tyre"]})]})]})]})})}function fs({tyres:N,onSlotClick:C,onDragStart:s,onDrop:V}){const l=u=>N.find(T=>T.tyre_position===u),S=({pos:u,label:T})=>{const m=l(u),p=m?.tyre_image?Array.isArray(m.tyre_image)?m.tyre_image[0]:m.tyre_image:null,x=p?j.files.getUrl(m,p,{thumb:"100x100"}):null;let y="bg-card border-border hover:border-primary";if(m){const a=m.current_lifecycle_kms||0;m.status==="damaged"||m.status==="active"&&a>=8e4?y="bg-destructive/10 border-destructive hover:border-destructive/80":(m.status==="worn"||m.status==="active"&&a>=6e4)&&(y="bg-warning/10 border-warning hover:border-warning/80")}return e.jsx("div",{onClick:()=>C(u),draggable:!!m,onDragStart:a=>s&&s(a,u),onDragOver:a=>a.preventDefault(),onDrop:a=>V&&V(a,u),className:cs("w-12 h-18 sm:w-16 sm:h-22 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative shadow-sm select-none",m?y:"bg-muted/30 border-dashed border-border/80 hover:bg-secondary"),children:m?e.jsxs(e.Fragment,{children:[x?e.jsx("img",{src:x,alt:m.tyre_brand,className:"w-full h-full object-cover"}):e.jsx("div",{className:"w-full h-full bg-secondary/60 flex flex-col items-center justify-center p-1 text-center",children:e.jsxs("span",{className:"text-[10px] font-bold text-foreground rotate-[-90deg] whitespace-nowrap tracking-wider",children:[m.tyre_depth_mm," mm"]})}),e.jsx("div",{className:"absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[1px]",children:e.jsx("span",{className:"text-white text-[9px] font-bold text-center px-0.5 leading-tight",children:T})})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center p-1 text-center",children:[e.jsx(Le,{className:"w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all"}),e.jsx("span",{className:"text-[8px] sm:text-[9px] text-muted-foreground font-semibold mt-1 leading-none",children:T.split(" ")[0]})]})})};return e.jsx("div",{className:"flex justify-center p-3 sm:p-5 bg-card/60 rounded-3xl border border-border/60 shadow-sm overflow-x-auto",children:e.jsxs("div",{className:"relative flex flex-col items-center w-full max-w-sm",children:[e.jsx("div",{className:"absolute top-6 bottom-16 w-5 bg-muted-foreground/10 rounded-full z-0 shadow-inner"}),e.jsxs("div",{className:"w-24 sm:w-32 h-12 sm:h-14 bg-secondary/80 rounded-t-[2rem] rounded-b-lg border border-border/50 flex flex-col items-center justify-center z-10 shadow-sm relative",children:[e.jsx("div",{className:"w-14 sm:w-20 h-5 sm:h-6 bg-background/50 rounded-t-lg absolute top-1.5 shadow-inner"}),e.jsx("span",{className:"font-heading font-bold text-muted-foreground text-[11px] mt-4 tracking-widest",children:"CAB"})]}),e.jsxs("div",{className:"relative flex items-center justify-center w-[200px] sm:w-[240px] mt-5 sm:mt-6 z-10",children:[e.jsx("div",{className:"absolute h-2.5 bg-foreground/10 w-full z-0 rounded-full shadow-inner"}),e.jsxs("div",{className:"flex justify-between w-full z-10",children:[e.jsx(S,{pos:"front_left",label:"Front Left"}),e.jsx(S,{pos:"front_right",label:"Front Right"})]})]}),e.jsxs("div",{className:"relative flex items-center justify-center w-[290px] sm:w-[340px] mt-6 sm:mt-8 z-10",children:[e.jsx("div",{className:"absolute h-2.5 bg-foreground/10 w-full z-0 rounded-full shadow-inner"}),e.jsxs("div",{className:"flex justify-between w-full z-10",children:[e.jsxs("div",{className:"flex gap-1 sm:gap-1.5 p-1 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs",children:[e.jsx(S,{pos:"rear_left_1",label:"Rear L Outer"}),e.jsx(S,{pos:"rear_left_2",label:"Rear L Inner"})]}),e.jsxs("div",{className:"flex gap-1 sm:gap-1.5 p-1 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs",children:[e.jsx(S,{pos:"rear_right_1",label:"Rear R Inner"}),e.jsx(S,{pos:"rear_right_2",label:"Rear R Outer"})]})]})]}),e.jsx("div",{className:"mt-5 sm:mt-6 z-10",children:e.jsx("div",{className:"p-1 sm:p-1.5 bg-background/60 backdrop-blur rounded-xl border border-border/50 shadow-xs inline-block",children:e.jsx(S,{pos:"stepney",label:"Stepney/Spare"})})})]})})}function js({isOpen:N,onClose:C,tyre:s,onEdit:V,onDelete:l,onReplace:S,onSuccess:u}){const[T,m]=c.useState(!1),[p,x]=c.useState(!1),[y,a]=c.useState(null);fe.useEffect(()=>{s&&N&&(s.tyre_image?Array.isArray(s.tyre_image)&&s.tyre_image.length>0?a(s.tyre_image[0]):typeof s.tyre_image=="string"?a(s.tyre_image):a(null):a(null))},[s,N]);const g=async()=>{if(s){x(!0);try{const f=await j.collection("trucks").getOne(s.truck_id,{$autoCancel:!1});if(!f)throw new Error("Associated truck not found.");const E=s.purchase_date?s.purchase_date.split("T")[0]:s.created.split(" ")[0],ee=(await j.collection("trip_logs").getFullList({filter:`truck_number = "${f.truck_number}" && trip_status = "Completed" && date < "${E}"`,$autoCancel:!1})).reduce((M,z)=>M+(z.kms||0),0),d=(await j.collection("trip_logs").getFullList({filter:`truck_number = "${f.truck_number}" && trip_status = "Completed" && date >= "${E}"`,$autoCancel:!1})).reduce((M,z)=>M+(z.kms||0),0);await j.collection("tyres").update(s.id,{assignment_start_kms:ee,current_lifecycle_kms:s.base_lifecycle_kms!==void 0?s.base_lifecycle_kms:s.current_lifecycle_kms||0},{$autoCancel:!1}),I.success("Mileage recalculated successfully!"),u&&u(),C()}catch(f){console.error(f),I.error("Failed to recalculate mileage: "+f.message)}finally{x(!1)}}};if(!s)return null;const P=W.find(f=>f.id===s.tyre_position),w=P?P.label:s.tyre_position?.replace(/-/g," ")||"Unknown Position",k=y?j.files.getUrl(s,y):null;let L="text-muted-foreground bg-muted border-black/10",A=Ae,o=s.status;const i=s.current_lifecycle_kms||0,B=8e4,O=Math.min(i/B*100,100);s.status==="active"?i>=B?(o="Replacement Recommended",L="text-destructive bg-destructive/10 border-destructive/20",A=ie):i>=6e4?(o="Rotation Due",L="text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20",A=ze):(L="text-[hsl(var(--success))] bg-[hsl(var(--success))/0.15] border-[hsl(var(--success))/0.2]",A=Ae):s.status==="worn"?(L="text-[hsl(var(--warning))] bg-[hsl(var(--warning))/0.15] border-[hsl(var(--warning))/0.2]",A=ze):s.status==="damaged"&&(L="text-destructive bg-destructive/10 border-destructive/20",A=ie);const U=async()=>{window.confirm("Are you sure you want to permanently delete this tyre record?")&&(m(!0),await l(s.id),m(!1),C())},v=({label:f,value:E})=>e.jsxs("div",{className:"flex flex-col py-3 border-b border-border/50 last:border-0",children:[e.jsx("span",{className:"text-[10px] uppercase tracking-wider font-bold text-muted-foreground",children:f}),e.jsx("span",{className:"font-medium text-foreground mt-0.5",children:E||"-"})]});return e.jsx(je,{open:N,onOpenChange:f=>!f&&C(),children:e.jsxs(ye,{className:"sm:max-w-[800px] p-0 overflow-hidden rounded-3xl border-border/50 shadow-elevated",children:[e.jsx(_,{variant:"ghost",size:"icon",className:"absolute right-4 top-4 z-50 bg-background/50 backdrop-blur hover:bg-background rounded-full",onClick:C,children:e.jsx(Z,{className:"w-5 h-5"})}),e.jsxs("div",{className:"flex flex-col md:flex-row h-full max-h-[85vh]",children:[e.jsxs("div",{className:"md:w-[45%] relative bg-secondary flex flex-col justify-center min-h-[250px] md:min-h-[400px]",children:[k?e.jsxs("a",{href:k,target:"_blank",rel:"noopener noreferrer",className:"w-full h-full cursor-zoom-in block relative group",children:[e.jsx("img",{src:k,alt:s.tyre_brand,className:"w-full h-full object-cover animate-in fade-in duration-300"}),e.jsx("div",{className:"absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center duration-200",children:e.jsxs("span",{className:"text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-1.5 shadow-md",children:[e.jsx(es,{className:"w-3.5 h-3.5"})," View Full Image"]})})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center text-muted-foreground/60 p-8",children:[e.jsx(ss,{className:"w-16 h-16 mb-4 opacity-50"}),e.jsx("p",{className:"font-medium",children:"No photo uploaded"})]}),e.jsx("div",{className:"absolute top-4 left-4 z-10",children:e.jsxs(G,{className:`px-3 py-1.5 text-xs shadow-md border flex items-center gap-1.5 capitalize backdrop-blur-md ${L}`,children:[e.jsx(A,{className:"w-3.5 h-3.5"})," ",o]})}),Array.isArray(s.tyre_image)&&s.tyre_image.length>1&&e.jsx("div",{className:"absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-20",children:e.jsx("div",{className:"flex gap-2 p-2 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 max-w-full overflow-x-auto",children:s.tyre_image.map((f,E)=>e.jsx("div",{onClick:()=>a(f),className:`w-10 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${y===f?"border-primary scale-110 shadow-md":"border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`,children:e.jsx("img",{src:j.files.getUrl(s,f,{thumb:"50x50"}),alt:`Tyre Thumbnail ${E+1}`,className:"w-full h-full object-cover"})},E))})})]}),e.jsxs("div",{className:"md:w-[55%] flex flex-col bg-card",children:[e.jsxs("div",{className:"p-6 md:p-8 flex-1 overflow-y-auto",children:[e.jsxs("div",{className:"mb-6",children:[e.jsx("p",{className:"text-sm font-bold text-primary tracking-wider uppercase mb-1",children:w}),e.jsx("h2",{className:"text-3xl font-heading font-bold tracking-tight text-foreground leading-tight",children:s.tyre_brand}),e.jsx("p",{className:"text-lg text-muted-foreground font-medium mt-1",children:s.model_no})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6",children:[e.jsxs("div",{className:"bg-secondary/20 p-5 rounded-2xl border border-border/50 flex justify-between items-center shadow-inner",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground",children:"Tread Depth"}),e.jsxs("p",{className:"text-3xl font-bold font-heading mt-1",children:[s.tyre_depth_mm,e.jsx("span",{className:"text-base text-muted-foreground ml-1",children:"mm"})]})]}),e.jsx("div",{className:"h-12 w-12 rounded-full border-4 flex items-center justify-center",style:{borderColor:s.tyre_depth_mm>4?"hsl(var(--success))":s.tyre_depth_mm>2?"hsl(var(--warning))":"hsl(var(--destructive))"},children:e.jsx("div",{className:"h-8 w-8 rounded-full",style:{backgroundColor:s.tyre_depth_mm>4?"hsl(var(--success))":s.tyre_depth_mm>2?"hsl(var(--warning))":"hsl(var(--destructive))"}})})]}),e.jsxs("div",{className:"bg-secondary/20 p-5 rounded-2xl border border-border/50 flex flex-col justify-center shadow-inner",children:[e.jsxs("div",{className:"flex justify-between items-center mb-1.5",children:[e.jsx("p",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground",children:"Tyre Wear"}),e.jsxs("span",{className:"text-xs font-semibold text-foreground",children:[O.toFixed(0),"%"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-2.5 overflow-hidden",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-500 ${i>=8e4?"bg-destructive":i>=6e4?"bg-yellow-500":"bg-primary"}`,style:{width:`${O}%`}})}),e.jsxs("span",{className:"text-[10px] text-muted-foreground mt-1.5 font-medium",children:[i.toLocaleString()," / 80,000 KM"]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-x-6",children:[e.jsx(v,{label:"Serial Number",value:e.jsx("span",{className:"font-mono text-sm",children:s.serial_number})}),e.jsx(v,{label:"Installation Date",value:e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(Be,{className:"w-3.5 h-3.5 text-muted-foreground"}),s.purchase_date?ne(new Date(s.purchase_date),"MMM dd, yyyy"):"-"]})}),e.jsx(v,{label:"Base Mileage",value:s.base_lifecycle_kms!==void 0?`${s.base_lifecycle_kms.toLocaleString()} KM`:s.current_lifecycle_kms!==void 0?`${s.current_lifecycle_kms.toLocaleString()} KM`:"-"}),e.jsx(v,{label:"Fitment Odometer",value:s.assignment_start_kms!==void 0?`${s.assignment_start_kms.toLocaleString()} KM`:"-"}),e.jsx(v,{label:"Lifecycle Mileage",value:`${i.toLocaleString()} KM`}),e.jsx(v,{label:"System ID",value:e.jsx("span",{className:"text-xs text-muted-foreground",children:s.id})}),e.jsx(v,{label:"Added On",value:s.created?ne(new Date(s.created),"MMM dd, yyyy"):"-"})]})]}),e.jsxs("div",{className:"p-6 border-t border-border/50 bg-muted/10 flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap",children:[e.jsxs(_,{variant:"ghost",className:"text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs",onClick:U,disabled:T||p,children:[e.jsx(He,{className:"w-4 h-4 md:mr-2"})," ",e.jsx("span",{className:"hidden md:inline",children:"Delete"})]}),e.jsxs(_,{variant:"outline",className:"rounded-xl border-primary/20 text-primary hover:bg-primary/5 text-xs",onClick:g,disabled:p||T,children:[e.jsx(Q,{className:`w-4 h-4 mr-1.5 ${p?"animate-spin":""}`}),"Recalculate"]}),e.jsxs(_,{className:"rounded-xl shadow-sm bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold",onClick:()=>{C(),S?.(s)},disabled:p||T,children:[e.jsx(Q,{className:"w-4 h-4 mr-1.5"})," Replace Tyre"]}),e.jsxs(_,{variant:"outline",className:"rounded-xl shadow-sm text-xs font-semibold",onClick:()=>{C(),V(s)},disabled:p||T,children:[e.jsx(ts,{className:"w-4 h-4 mr-1.5"})," Edit"]})]})]})]})]})})}const ys=["Torn / Burst on Highway","Severe Sidewall Cut / Damage","Tread Worn Out (< 2mm)","Uneven Wear / Alignment Issue","Multiple Punctures / Bead Failure","Retreading Required","Scheduled Fleet Upgrade","Manufacturing Defect / Bulge"],vs=["MRF","Apollo","JK Tyre","CEAT","Bridgestone","Michelin","Goodyear","Continental","Other"];function Ns({isOpen:N,onClose:C,oldTyre:s,truck:V,onSuccess:l}){const[S,u]=c.useState(1),[T,m]=c.useState(!1),[p,x]=c.useState({replacementDate:ne(new Date,"yyyy-MM-dd"),replacementReason:"Torn / Burst on Highway",removalOdometer:"",finalTreadDepth:"",mechanicNotes:""}),[y,a]=c.useState([]),[g,P]=c.useState([]),[w,k]=c.useState({tyre_brand:"MRF",model_no:"Steel Muscle",serial_number:"",purchase_date:ne(new Date,"yyyy-MM-dd"),tyre_depth_mm:"14",purchase_cost:"",vendor_name:""}),[L,A]=c.useState(null),[o,i]=c.useState(null),[B,O]=c.useState(null);if(c.useEffect(()=>{N&&s&&(u(1),x({replacementDate:ne(new Date,"yyyy-MM-dd"),replacementReason:"Torn / Burst on Highway",removalOdometer:"",finalTreadDepth:s.tyre_depth_mm?String(s.tyre_depth_mm):"",mechanicNotes:""}),a([]),P([]),k({tyre_brand:"MRF",model_no:"Steel Muscle",serial_number:"",purchase_date:ne(new Date,"yyyy-MM-dd"),tyre_depth_mm:"14",purchase_cost:"",vendor_name:""}),A(null),i(null),O(null))},[N,s]),!s)return null;const U=W.find(n=>n.id===s.tyre_position),v=U?U.label:s.tyre_position||"Truck Axle",f=n=>{const d=Array.from(n.target.files||[]);d.length!==0&&(a(M=>[...M,...d]),d.forEach(M=>{const z=new FileReader;z.onloadend=()=>{P(me=>[...me,z.result])},z.readAsDataURL(M)}))},E=n=>{a(d=>d.filter((M,z)=>z!==n)),P(d=>d.filter((M,z)=>z!==n))},te=n=>{const d=n.target.files?.[0];if(!d)return;A(d);const M=new FileReader;M.onloadend=()=>{i(M.result)},M.readAsDataURL(d)},ee=async()=>{if(!w.serial_number){I.error("Please enter the new tyre serial number");return}m(!0);try{const n=new FormData;n.append("status","replaced"),n.append("tyre_position",""),n.append("notes",`REPLACED on ${p.replacementDate}: Reason - ${p.replacementReason}. ${p.mechanicNotes||""}`),y.forEach(M=>{n.append("tyre_image",M)}),await j.collection("tyres").update(s.id,n,{$autoCancel:!1});const d=new FormData;d.append("truck_id",s.truck_id),d.append("tyre_position",s.tyre_position),d.append("tyre_brand",w.tyre_brand),d.append("model_no",w.model_no),d.append("serial_number",w.serial_number),d.append("purchase_date",w.purchase_date+" 00:00:00.000Z"),d.append("tyre_depth_mm",Number(w.tyre_depth_mm||14)),d.append("status","active"),d.append("current_lifecycle_kms",0),d.append("assignment_start_kms",p.removalOdometer?Number(p.removalOdometer):0),L&&d.append("tyre_image",L),B&&d.append("bill_invoice",B),await j.collection("tyres").create(d,{$autoCancel:!1}),I.success(`✅ Successfully replaced tyre at ${v}! Old tyre archived.`),l?.(),C()}catch(n){console.error("Tyre replacement error:",n),I.error("Failed to replace tyre: "+(n.message||"Unknown error"))}finally{m(!1)}};return e.jsx(je,{open:N,onOpenChange:n=>!n&&C(),children:e.jsxs(ye,{className:"sm:max-w-[700px] p-0 overflow-hidden bg-slate-950 border-slate-800 text-slate-100 rounded-3xl shadow-2xl",children:[e.jsx("div",{className:"bg-slate-900 border-b border-slate-800 p-6",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400",children:e.jsx(Q,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsxs(Ce,{className:"text-lg font-black text-white flex items-center gap-2",children:["Replace Tyre: ",e.jsx("span",{className:"text-cyan-400 font-mono",children:v})]}),e.jsxs(xs,{className:"text-xs text-slate-400 mt-0.5",children:["Truck: ",e.jsx("strong",{className:"text-slate-200",children:V?.truck_number})," • Archive damaged/worn tyre specs & install new tyre"]})]})]}),e.jsxs(G,{className:"bg-slate-800 text-slate-300 border-slate-700 text-xs px-3 py-1 font-mono",children:["Step ",S," of 2: ",S===1?"Old Tyre Audit":"New Tyre Specs"]})]})}),e.jsxs("div",{className:"p-6 max-h-[75vh] overflow-y-auto space-y-6",children:[S===1&&e.jsxs("div",{className:"space-y-5 animate-in fade-in duration-200",children:[e.jsxs("div",{className:"p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3",children:[e.jsxs("p",{className:"text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5",children:[e.jsx(ie,{className:"w-3.5 h-3.5 text-rose-400"})," Current Old Tyre Details"]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono",children:[e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block",children:"Brand & Model"}),e.jsxs("strong",{className:"text-slate-200 font-bold",children:[s.tyre_brand," ",s.model_no||""]})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block",children:"Serial Number"}),e.jsx("strong",{className:"text-cyan-400 font-bold",children:s.serial_number||"N/A"})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block",children:"Total Lifespan Run"}),e.jsxs("strong",{className:"text-purple-400 font-bold",children:[(s.current_lifecycle_kms||0).toLocaleString("en-IN")," KM"]})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block",children:"Installed On"}),e.jsx("strong",{className:"text-slate-300",children:s.purchase_date?s.purchase_date.split("T")[0]:"N/A"})]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs(b,{className:"text-xs font-bold text-slate-300",children:["Reason for Replacement ",e.jsx("span",{className:"text-rose-400",children:"*"})]}),e.jsxs(de,{value:p.replacementReason,onValueChange:n=>x(d=>({...d,replacementReason:n})),children:[e.jsx(oe,{className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl",children:e.jsx(ce,{})}),e.jsx(xe,{className:"bg-slate-900 border-slate-800 text-slate-200",children:ys.map(n=>e.jsx(K,{value:n,children:n},n))})]})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Removal Date"}),e.jsx(R,{type:"date",value:p.replacementDate,onChange:n=>x(d=>({...d,replacementDate:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Current Truck Odometer (KM)"}),e.jsx(R,{type:"number",placeholder:"e.g. 145000",value:p.removalOdometer,onChange:n=>x(d=>({...d,removalOdometer:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Final Tread Depth (mm)"}),e.jsx(R,{type:"number",placeholder:"e.g. 1.5",value:p.finalTreadDepth,onChange:n=>x(d=>({...d,finalTreadDepth:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{className:"text-xs font-bold text-slate-300 flex items-center justify-between",children:[e.jsxs("span",{className:"flex items-center gap-1.5",children:[e.jsx(Ke,{className:"w-3.5 h-3.5 text-rose-400"})," Upload Damaged / Torn Tyre Photos"]}),e.jsx("span",{className:"text-[11px] text-slate-500 font-normal",children:"Saved permanently in history"})]}),e.jsxs("div",{className:"border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-4 bg-slate-900/50 text-center transition-colors",children:[e.jsx("input",{type:"file",multiple:!0,accept:"image/*",id:"damage-photos",onChange:f,className:"hidden"}),e.jsxs("label",{htmlFor:"damage-photos",className:"cursor-pointer flex flex-col items-center justify-center gap-1.5",children:[e.jsx(Pe,{className:"w-8 h-8 text-slate-400"}),e.jsx("span",{className:"text-xs font-bold text-cyan-400",children:"Click to upload damage photos"}),e.jsx("span",{className:"text-[10px] text-slate-500",children:"Supports JPG, PNG (burst tread, sidewall crack, etc.)"})]})]}),g.length>0&&e.jsx("div",{className:"flex items-center gap-2 overflow-x-auto pt-2",children:g.map((n,d)=>e.jsxs("div",{className:"relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 group",children:[e.jsx("img",{src:n,alt:"Damage Preview",className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",onClick:()=>E(d),className:"absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-500",children:e.jsx(He,{className:"w-3 h-3"})})]},d))})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Condition & Mechanic Notes"}),e.jsx(ms,{placeholder:"e.g. Torn near right shoulder on NH44 route due to sharp object. Inspected by mechanic.",value:p.mechanicNotes,onChange:n=>x(d=>({...d,mechanicNotes:n.target.value})),className:"mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl min-h-[60px]"})]})]}),S===2&&e.jsxs("div",{className:"space-y-5 animate-in fade-in duration-200",children:[e.jsxs("div",{className:"p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2",children:[e.jsx(as,{className:"w-4 h-4 shrink-0 text-cyan-400"}),e.jsxs("span",{children:["Assigning new tyre into slot: ",e.jsx("strong",{className:"text-white font-mono",children:v})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs(b,{className:"text-xs font-bold text-slate-300",children:["New Tyre Brand ",e.jsx("span",{className:"text-cyan-400",children:"*"})]}),e.jsxs(de,{value:w.tyre_brand,onValueChange:n=>k(d=>({...d,tyre_brand:n})),children:[e.jsx(oe,{className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl",children:e.jsx(ce,{})}),e.jsx(xe,{className:"bg-slate-900 border-slate-800 text-slate-200",children:vs.map(n=>e.jsx(K,{value:n,children:n},n))})]})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Model / Pattern"}),e.jsx(R,{placeholder:"e.g. Steel Muscle / EnduRace RD",value:w.model_no,onChange:n=>k(d=>({...d,model_no:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs(b,{className:"text-xs font-bold text-slate-300",children:["Serial Number (Unique) ",e.jsx("span",{className:"text-cyan-400",children:"*"})]}),e.jsx(R,{placeholder:"e.g. MRF-8924019",value:w.serial_number,onChange:n=>k(d=>({...d,serial_number:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-cyan-400 font-bold font-mono text-xs rounded-xl",required:!0})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Installation Date"}),e.jsx(R,{type:"date",value:w.purchase_date,onChange:n=>k(d=>({...d,purchase_date:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Initial Tread Depth (mm)"}),e.jsx(R,{type:"number",placeholder:"e.g. 14",value:w.tyre_depth_mm,onChange:n=>k(d=>({...d,tyre_depth_mm:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-emerald-400 font-bold font-mono text-xs rounded-xl"})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Purchase Cost (₹)"}),e.jsx(R,{type:"number",placeholder:"e.g. 24500",value:w.purchase_cost,onChange:n=>k(d=>({...d,purchase_cost:n.target.value})),className:"h-10 mt-1.5 bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl"})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"New Tyre Photo"}),e.jsxs("div",{className:"border border-dashed border-slate-800 rounded-xl p-3 bg-slate-900/40 text-center mt-1.5",children:[e.jsx("input",{type:"file",accept:"image/*",id:"new-tyre-photo",onChange:te,className:"hidden"}),e.jsxs("label",{htmlFor:"new-tyre-photo",className:"cursor-pointer flex items-center justify-center gap-2 text-xs text-cyan-400 font-bold",children:[e.jsx(Ke,{className:"w-4 h-4"})," ",L?L.name:"Upload New Tyre Image"]})]}),o&&e.jsx("div",{className:"mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-700",children:e.jsx("img",{src:o,alt:"New Tyre",className:"w-full h-full object-cover"})})]}),e.jsxs("div",{children:[e.jsx(b,{className:"text-xs font-bold text-slate-300",children:"Bill / Purchase Invoice"}),e.jsxs("div",{className:"border border-dashed border-slate-800 rounded-xl p-3 bg-slate-900/40 text-center mt-1.5",children:[e.jsx("input",{type:"file",accept:"image/*,application/pdf",id:"new-tyre-invoice",onChange:n=>O(n.target.files?.[0]||null),className:"hidden"}),e.jsxs("label",{htmlFor:"new-tyre-invoice",className:"cursor-pointer flex items-center justify-center gap-2 text-xs text-purple-400 font-bold",children:[e.jsx(Pe,{className:"w-4 h-4"})," ",B?B.name:"Upload Bill / PDF"]})]})]})]})]})]}),e.jsxs(Se,{className:"bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between",children:[e.jsx(_,{type:"button",variant:"ghost",onClick:C,className:"h-10 text-xs rounded-xl text-slate-400 hover:text-white",children:"Cancel"}),e.jsx("div",{className:"flex items-center gap-2",children:S===1?e.jsxs(_,{type:"button",onClick:()=>u(2),className:"h-10 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-600/20",children:["Proceed to New Tyre ",e.jsx(rs,{className:"w-4 h-4 ml-1"})]}):e.jsxs(e.Fragment,{children:[e.jsx(_,{type:"button",variant:"outline",onClick:()=>u(1),className:"h-10 text-xs rounded-xl border-slate-700 bg-slate-950 text-slate-300",children:"Back to Step 1"}),e.jsxs(_,{type:"button",onClick:ee,disabled:T,className:"h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20",children:[e.jsx(Ae,{className:"w-4 h-4 mr-1.5"}),T?"Installing...":"Confirm Replacement"]})]})})]})]})})}function ws({replacedTyres:N=[],activeTyres:C=[],truck:s=null,onViewTyreDetails:V}){const[l,S]=c.useState(""),[u,T]=c.useState("all"),[m,p]=c.useState(null),x=c.useMemo(()=>N.filter(a=>{const g=!l||(a.tyre_brand||"").toLowerCase().includes(l.toLowerCase())||(a.serial_number||"").toLowerCase().includes(l.toLowerCase())||(a.model_no||"").toLowerCase().includes(l.toLowerCase())||(a.notes||"").toLowerCase().includes(l.toLowerCase()),P=u==="all"||(a.notes||"").includes(u);return g&&P}),[N,l,u]),y=c.useMemo(()=>{const a=N.length;let g=0,P=0;N.forEach(L=>{g+=Number(L.current_lifecycle_kms||0);const A=(L.notes||"").toLowerCase();A.includes("torn")||A.includes("burst")?P++:A.includes("worn")});const w=a>0?Math.round(g/a):0,k=a>0?Math.round(P/a*100):0;return{totalReplaced:a,avgLifespan:w,tornCount:P,tornPct:k}},[N]);return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",children:[e.jsx(X,{className:"bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl",children:e.jsx(we,{className:"p-5",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-slate-400 font-semibold uppercase tracking-wider",children:"Total Tyres Changed"}),e.jsx("h3",{className:"text-3xl font-black text-rose-400 mt-1 tabular-nums",children:y.totalReplaced}),e.jsxs("p",{className:"text-xs text-slate-400 mt-1",children:["On ",s?s.truck_number:"Fleet"]})]}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400",children:e.jsx(ie,{className:"w-6 h-6"})})]})})}),e.jsx(X,{className:"bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl",children:e.jsx(we,{className:"p-5",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-slate-400 font-semibold uppercase tracking-wider",children:"Torn / Burst Incidents"}),e.jsxs("h3",{className:"text-3xl font-black text-amber-400 mt-1 tabular-nums",children:[y.tornCount," (",y.tornPct,"%)"]}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Premature highway tyre damage"})]}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400",children:e.jsx(Ve,{className:"w-6 h-6"})})]})})}),e.jsx(X,{className:"bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl",children:e.jsx(we,{className:"p-5",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-slate-400 font-semibold uppercase tracking-wider",children:"Avg Tyre Lifespan"}),e.jsx("h3",{className:"text-3xl font-black text-purple-400 mt-1 tabular-nums",children:y.avgLifespan>0?`${y.avgLifespan.toLocaleString("en-IN")} KM`:"N/A"}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Kilometers before retirement"})]}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400",children:e.jsx(ls,{className:"w-6 h-6"})})]})})}),e.jsx(X,{className:"bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl",children:e.jsx(we,{className:"p-5",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-slate-400 font-semibold uppercase tracking-wider",children:"Active Wheel Positions"}),e.jsxs("h3",{className:"text-3xl font-black text-emerald-400 mt-1 tabular-nums",children:[C.length," Mounted"]}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"Running on vehicle axles"})]}),e.jsx("div",{className:"w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400",children:e.jsx(Oe,{className:"w-6 h-6"})})]})})})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"relative w-64",children:[e.jsx(ns,{className:"w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"}),e.jsx(R,{type:"text",placeholder:"Search serial no, brand, notes...",value:l,onChange:a=>S(a.target.value),className:"h-9 pl-8 text-xs bg-slate-950 border-slate-800 text-slate-200 rounded-xl"})]}),e.jsxs(de,{value:u,onValueChange:T,children:[e.jsx(oe,{className:"h-9 w-44 text-xs bg-slate-950 border-slate-800 text-slate-300 rounded-xl",children:e.jsx(ce,{placeholder:"All Reasons"})}),e.jsxs(xe,{className:"bg-slate-900 border-slate-800 text-slate-200",children:[e.jsx(K,{value:"all",children:"All Replacement Reasons"}),e.jsx(K,{value:"Torn",children:"Torn / Burst"}),e.jsx(K,{value:"Worn",children:"Tread Worn Out"}),e.jsx(K,{value:"Sidewall",children:"Sidewall Cut"}),e.jsx(K,{value:"Puncture",children:"Puncture / Bead Damage"})]})]})]}),e.jsxs("span",{className:"text-xs text-slate-400 font-mono",children:["Showing ",e.jsx("strong",{className:"text-white",children:x.length})," archived replacement records"]})]}),e.jsx("div",{className:"space-y-3",children:x.length===0?e.jsxs(X,{className:"bg-slate-900/60 border-slate-800 p-12 text-center text-slate-500",children:[e.jsx(Ve,{className:"w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400"}),e.jsx("p",{className:"text-base font-bold text-slate-300",children:"No Replaced Tyres Recorded"}),e.jsx("p",{className:"text-xs text-slate-400 mt-1",children:"When a tyre gets damaged or torn and replaced, its old photos, specs, and lifespan are archived here."})]}):x.map(a=>{a.tyre_image&&(Array.isArray(a.tyre_image)?a.tyre_image.length>0:a.tyre_image);const g=Array.isArray(a.tyre_image)?a.tyre_image:a.tyre_image?[a.tyre_image]:[];return e.jsxs("div",{className:"p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all space-y-4 shadow-lg",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(G,{className:"bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-mono font-bold px-2.5 py-1",children:"REPLACED"}),e.jsx("div",{children:e.jsxs("h4",{className:"text-base font-black text-white flex items-center gap-2",children:[a.tyre_brand," ",a.model_no||"",e.jsxs("span",{className:"text-cyan-400 font-mono text-xs",children:["(",a.serial_number||"No Serial",")"]})]})})]}),e.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-slate-400",children:[e.jsx(Be,{className:"w-3.5 h-3.5 text-slate-500"}),e.jsxs("span",{children:["Archived: ",a.updated?a.updated.split(" ")[0]:a.created?a.created.split(" ")[0]:"N/A"]})]})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono",children:[e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block uppercase",children:"Lifespan Run"}),e.jsxs("strong",{className:"text-purple-400 font-bold",children:[(a.current_lifecycle_kms||0).toLocaleString("en-IN")," KM"]})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950 border border-slate-800/80",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block uppercase",children:"Installed On"}),e.jsx("strong",{className:"text-slate-300",children:a.purchase_date?a.purchase_date.split("T")[0]:"N/A"})]}),e.jsxs("div",{className:"p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 sm:col-span-2",children:[e.jsx("span",{className:"text-[10px] text-slate-500 block uppercase",children:"Replacement Reason & Notes"}),e.jsx("strong",{className:"text-amber-300 font-sans block truncate",title:a.notes,children:a.notes||"Replaced due to wear/damage"})]})]}),g.length>0&&e.jsxs("div",{className:"space-y-1.5 pt-1",children:[e.jsxs("span",{className:"text-[11px] font-bold text-slate-400 flex items-center gap-1",children:[e.jsx(We,{className:"w-3 h-3 text-cyan-400"})," Damage & Old Tyre Photos (",g.length,")"]}),e.jsx("div",{className:"flex items-center gap-2 overflow-x-auto",children:g.map((P,w)=>{const k=j.files.getUrl(a,P);return e.jsxs("div",{onClick:()=>p(k),className:"w-16 h-16 rounded-xl overflow-hidden border border-slate-700/80 cursor-pointer hover:border-cyan-500 shrink-0 group relative transition-all",children:[e.jsx("img",{src:k,alt:"Old Tyre Photo",className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity",children:e.jsx(ke,{className:"w-4 h-4 text-white"})})]},w)})})]})]},a.id)})}),m&&e.jsx("div",{className:"fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4",onClick:()=>p(null),children:e.jsxs("div",{className:"relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden border border-slate-800",children:[e.jsx("img",{src:m,alt:"Enlarged Tyre",className:"w-full h-full object-contain max-h-[80vh]"}),e.jsx("button",{type:"button",onClick:()=>p(null),className:"absolute top-3 right-3 bg-slate-900/80 text-white rounded-full p-2 hover:bg-slate-800",children:"✕"})]})})]})}const WrenchIcon = as;
function getTruckEquipment(truck) {
  let eq = null;
  if (truck && truck.fastag_notes) {
    try {
      const parsed = JSON.parse(truck.fastag_notes);
      if (parsed && (parsed.jack || parsed.wheel_spanner || parsed.tool_box)) {
        eq = parsed;
      }
    } catch (e2) {
    }
  }
  return {
    jack: {
      status: eq?.jack?.status || "present",
      serial: eq?.jack?.serial || "JACK-20T-01",
      brand: eq?.jack?.brand || "20 Ton Hydraulic Bottle Jack + Rod",
      purchase_date: eq?.jack?.purchase_date || "2026-09-01",
      last_verified: eq?.jack?.last_verified || ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
      verified_by: eq?.jack?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.jack?.notes || "20-Ton heavy lifting bottle jack with 2-piece operating lever rod. Inspected and working properly.",
      images: Array.isArray(eq?.jack?.images) ? eq.jack.images : eq?.jack?.images ? [eq.jack.images] : [],
      bill: eq?.jack?.bill || null,
      bill_name: eq?.jack?.bill_name || "Jack_Invoice.pdf"
    },
    wheel_spanner: {
      status: eq?.wheel_spanner?.status || "present",
      serial: eq?.wheel_spanner?.serial || "SPAN-3233-01",
      brand: eq?.wheel_spanner?.brand || "32mm x 33mm Heavy Duty Wheel Spanner + Tommy Bar",
      purchase_date: eq?.wheel_spanner?.purchase_date || "2026-09-01",
      last_verified: eq?.wheel_spanner?.last_verified || ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
      verified_by: eq?.wheel_spanner?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.wheel_spanner?.notes || "Forged carbon steel lug spanner with 3-foot tommy extension pipe for wheel nut torque.",
      images: Array.isArray(eq?.wheel_spanner?.images) ? eq.wheel_spanner.images : eq?.wheel_spanner?.images ? [eq.wheel_spanner.images] : [],
      bill: eq?.wheel_spanner?.bill || null,
      bill_name: eq?.wheel_spanner?.bill_name || "Wheel_Spanner_Invoice.pdf"
    },
    tool_box: {
      status: eq?.tool_box?.status || "present",
      serial: eq?.tool_box?.serial || "TB-STEEL-01",
      brand: eq?.tool_box?.brand || "Heavy Steel Lockable Tool Box (12-Piece Emergency Repair Kit)",
      purchase_date: eq?.tool_box?.purchase_date || "2026-09-01",
      last_verified: eq?.tool_box?.last_verified || ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
      verified_by: eq?.tool_box?.verified_by || truck?.driver_name || "Driver / Supervisor",
      notes: eq?.tool_box?.notes || "Padlock-secured steel box containing ring spanners (10-32mm), heavy pliers, wire cutter, hammer, and emergency air hose.",
      images: Array.isArray(eq?.tool_box?.images) ? eq.tool_box.images : eq?.tool_box?.images ? [eq.tool_box.images] : [],
      bill: eq?.tool_box?.bill || null,
      bill_name: eq?.tool_box?.bill_name || "Tool_Box_Invoice.pdf"
    }
  };
}
function FleetEquipmentTab({
  truck = null,
  allTrucks = [],
  onOpenSwapModal = null,
  onViewImage = null,
  onSuccess = null
}) {
  const [activeItemKey, setActiveItemKey] = c.useState("jack");
  const [loading, setLoading] = c.useState(false);
  const [equipment, setEquipment] = c.useState(() => getTruckEquipment(truck));
  const [editModalOpen, setEditModalOpen] = c.useState(false);
  const [editForm, setEditForm] = c.useState({
    serial: "",
    brand: "",
    purchase_date: "",
    verified_by: "",
    notes: ""
  });
  const photoInputRef = c.useRef(null);
  const billInputRef = c.useRef(null);
  c.useEffect(() => {
    setEquipment(getTruckEquipment(truck));
  }, [truck]);
  if (!truck) {
    return /* @__PURE__ */ e.jsx("div", { className: "p-12 text-center text-muted-foreground bg-card rounded-3xl border border-border/50 max-w-4xl mx-auto" }, "Please select a vehicle above to view its roadside emergency equipment and tool kit.");
  }
  const itemMeta = {
    jack: {
      name: "Hydraulic Jack (10T - 20T)",
      badgeName: "20T Bottle Jack",
      tagline: "Heavy Lifting & Wheel Change Equipment",
      color: "amber",
      defaultDesc: "Omex 20 Ton Heavy Duty Hydraulic Bottle Jack with lever rod"
    },
    wheel_spanner: {
      name: "Wheel Spanner & Tommy Bar",
      badgeName: "32x33mm Spanner",
      tagline: "Wheel Servicing & Lug Nut Torque Kit",
      color: "cyan",
      defaultDesc: "Forged 32mm x 33mm cross wheel spanner with high-tensile tommy bar"
    },
    tool_box: {
      name: "Tool Box & Emergency Repair Kit",
      badgeName: "Steel Tool Chest",
      tagline: "Lockable Heavy Steel Roadside Repair Kit",
      color: "indigo",
      defaultDesc: "12-piece mechanic spanner set, pliers, sledge hammer, air hose"
    }
  };
  const currentItem = equipment[activeItemKey] || equipment.jack;
  const currentMeta = itemMeta[activeItemKey] || itemMeta.jack;
  const isPresent = currentItem.status === "present";
  const saveEquipmentToTruck = async (newEquipmentState, successMsg) => {
    setLoading(true);
    try {
      setEquipment(newEquipmentState);
      await j.collection("trucks").update(truck.id, {
        fastag_notes: JSON.stringify(newEquipmentState)
      }, { $autoCancel: false });
      if (successMsg) I.success(successMsg);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to update equipment:", err);
      I.error(err?.message || "Failed to update equipment on vehicle");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleStatus = async () => {
    const nextStatus = isPresent ? "stolen" : "present";
    const nextNotes = nextStatus === "stolen" ? `Reported STOLEN / MISSING on inspection by ${truck.driver_name || "driver"}` : `Verified present and inspected on vehicle by ${truck.driver_name || "supervisor"}`;
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        status: nextStatus,
        last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
        notes: nextNotes
      }
    };
    const msg = nextStatus === "stolen" ? `Reported ${currentMeta.name} as STOLEN / MISSING!` : `Marked ${currentMeta.name} as PRESENT & VERIFIED!`;
    await saveEquipmentToTruck(updated, msg);
  };
  const handleOpenEdit = () => {
    setEditForm({
      serial: currentItem.serial || "",
      brand: currentItem.brand || "",
      purchase_date: currentItem.purchase_date || ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
      verified_by: currentItem.verified_by || truck.driver_name || "Supervisor",
      notes: currentItem.notes || ""
    });
    setEditModalOpen(true);
  };
  const handleSaveEdit = async (eEvent) => {
    eEvent.preventDefault();
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        serial: editForm.serial.trim().toUpperCase(),
        brand: editForm.brand.trim() || currentMeta.defaultDesc,
        purchase_date: editForm.purchase_date,
        verified_by: editForm.verified_by.trim(),
        notes: editForm.notes.trim(),
        last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd")
      }
    };
    await saveEquipmentToTruck(updated, "Equipment specifications saved successfully!");
    setEditModalOpen(false);
  };
  const handlePhotoUpload = async (eEvent) => {
    const files = Array.from(eEvent.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const newImages = [];
      for (const file of files) {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e2) => {
            const img = new Image();
            img.onload = () => {
              let w = img.width;
              let h = img.height;
              const maxDim = 1e3;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round(h * maxDim / w);
                  w = maxDim;
                } else {
                  w = Math.round(w * maxDim / h);
                  h = maxDim;
                }
              }
              const canvas = document.createElement("canvas");
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.72));
            };
            img.onerror = () => resolve(e2.target.result);
            img.src = e2.target.result;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newImages.push(dataUrl);
      }
      const existing = Array.isArray(currentItem.images) ? currentItem.images : [];
      const updated = {
        ...equipment,
        [activeItemKey]: {
          ...currentItem,
          images: [...existing, ...newImages]
        }
      };
      await saveEquipmentToTruck(updated, `Uploaded ${newImages.length} equipment snapshot(s)!`);
    } catch (err) {
      console.error("Photo upload error:", err);
      I.error("Failed to upload equipment photo");
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
      setLoading(false);
    }
  };
  const handleDeletePhoto = async (indexToRemove) => {
    const existing = Array.isArray(currentItem.images) ? currentItem.images : [];
    const updatedImages = existing.filter((_2, idx) => idx !== indexToRemove);
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        images: updatedImages
      }
    };
    await saveEquipmentToTruck(updated, "Photo deleted");
  };
  const handleBillUpload = async (eEvent) => {
    const file = eEvent.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e2) => resolve(e2.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const updated = {
        ...equipment,
        [activeItemKey]: {
          ...currentItem,
          bill: dataUrl,
          bill_name: file.name
        }
      };
      await saveEquipmentToTruck(updated, "Purchase bill / invoice uploaded successfully!");
    } catch (err) {
      console.error("Bill upload error:", err);
      I.error("Failed to upload invoice bill");
    } finally {
      if (billInputRef.current) billInputRef.current.value = "";
      setLoading(false);
    }
  };
  const handleDeleteBill = async () => {
    const updated = {
      ...equipment,
      [activeItemKey]: {
        ...currentItem,
        bill: null,
        bill_name: ""
      }
    };
    await saveEquipmentToTruck(updated, "Bill removed");
  };
  const anyMissing = Object.values(equipment).some((item) => item.status === "stolen" || item.status === "missing");
  return /* @__PURE__ */ e.jsx("div", { className: "space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between gap-3 p-1.5 bg-card rounded-2xl border border-border/60 shadow-sm overflow-x-auto" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1.5" }, ["jack", "wheel_spanner", "tool_box"].map((k) => {
    const meta = itemMeta[k];
    const item = equipment[k];
    const isItemPresent = item?.status === "present";
    const isActive = activeItemKey === k;
    return /* @__PURE__ */ e.jsx(
      "button",
      {
        key: k,
        type: "button",
        onClick: () => setActiveItemKey(k),
        className: `py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`
      },
      /* @__PURE__ */ e.jsx("span", null, meta.name),
      /* @__PURE__ */ e.jsx("span", { className: `w-2 h-2 rounded-full ${isItemPresent ? "bg-emerald-400" : "bg-rose-500 animate-pulse"}` })
    );
  })), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => onOpenSwapModal && onOpenSwapModal(activeItemKey),
      className: "py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
    },
    /* @__PURE__ */ e.jsx(Q, { className: "w-3.5 h-3.5" }),
    /* @__PURE__ */ e.jsx("span", null, "\u21C4 Swap Across Trucks")
  )), /* @__PURE__ */ e.jsx(X, { className: "p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-6" }, /* @__PURE__ */ e.jsx("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center space-x-3" }, /* @__PURE__ */ e.jsx("div", { className: `p-2.5 rounded-2xl border ${isPresent ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"}` }, /* @__PURE__ */ e.jsx(as, { className: "w-6 h-6" })), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ e.jsx("h3", { className: "text-lg font-bold font-heading text-foreground" }, currentMeta.name), /* @__PURE__ */ e.jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${isPresent ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"}` }, isPresent ? "\u2713 Present on Vehicle" : "\u{1F6A8} Stolen / Missing")), /* @__PURE__ */ e.jsx("p", { className: "text-xs text-muted-foreground" }, "Vehicle: ", /* @__PURE__ */ e.jsx("span", { className: "font-semibold text-foreground" }, truck.truck_number), " \u2022 ", currentMeta.tagline))), /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2 flex-wrap" }, isPresent ? /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      disabled: loading,
      onClick: handleToggleStatus,
      className: "py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
    },
    "\u{1F6A8} Report Stolen"
  ) : /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      disabled: loading,
      onClick: handleToggleStatus,
      className: "py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
    },
    "\u2713 Mark Present"
  ), /* @__PURE__ */ e.jsx(
    _,
    {
      size: "sm",
      onClick: handleOpenEdit,
      className: "rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm"
    },
    "Edit Details"
  ), /* @__PURE__ */ e.jsx(
    _,
    {
      size: "sm",
      onClick: () => onOpenSwapModal && onOpenSwapModal(activeItemKey),
      className: "rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5"
    },
    /* @__PURE__ */ e.jsx(Q, { className: "w-3.5 h-3.5 text-indigo-500" }),
    "Swap / Transfer"
  ))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-4" }, /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40" }, /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Serial / Stamp #"), /* @__PURE__ */ e.jsx("span", { className: "font-mono text-sm font-bold text-foreground truncate block" }, currentItem.serial || "Unstamped / NA")), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Purchase Date"), /* @__PURE__ */ e.jsx("span", { className: "text-sm font-bold text-foreground block" }, currentItem.purchase_date || "N/A")), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Model / Capacity"), /* @__PURE__ */ e.jsx("span", { className: "text-xs font-semibold text-foreground truncate block", title: currentItem.brand }, currentItem.brand || currentMeta.defaultDesc)), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Last Verified By"), /* @__PURE__ */ e.jsx("span", { className: "text-xs font-semibold text-foreground truncate block" }, currentItem.verified_by || "Driver", " (", currentItem.last_verified || "Today", ")"))), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5" }, "Condition Notes & Handover Details"), /* @__PURE__ */ e.jsx("p", { className: "text-xs text-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/50 min-h-[60px] whitespace-pre-line leading-relaxed font-medium" }, currentItem.notes || "No condition notes recorded."))), /* @__PURE__ */ e.jsx("div", { className: "space-y-4" }, /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Equipment Snapshots (", currentItem.images?.length || 0, ")"), /* @__PURE__ */ e.jsx("label", { className: "text-[11px] font-bold text-cyan-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Te, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ e.jsx("span", null, "+ Upload Photo"), /* @__PURE__ */ e.jsx(
    "input",
    {
      ref: photoInputRef,
      type: "file",
      accept: "image/*",
      multiple: true,
      onChange: handlePhotoUpload,
      className: "hidden"
    }
  ))), currentItem.images && currentItem.images.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2" }, currentItem.images.map((imgSrc, idx) => /* @__PURE__ */ e.jsx(
    "div",
    {
      key: idx,
      className: "aspect-video rounded-xl overflow-hidden border border-border bg-muted/10 relative cursor-pointer group"
    },
    /* @__PURE__ */ e.jsx(
      "img",
      {
        src: imgSrc,
        alt: `Snapshot ${idx + 1}`,
        className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
        onClick: () => {
          if (onViewImage) {
            onViewImage({
              id: truck.id,
              collectionName: "trucks",
              file: imgSrc,
              document_type: `${currentMeta.name} Snapshot`,
              document_number: currentItem.serial || "N/A"
            });
          }
        }
      }
    ),
    /* @__PURE__ */ e.jsx("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity" }, /* @__PURE__ */ e.jsx(
      "button",
      {
        type: "button",
        onClick: () => {
          if (onViewImage) {
            onViewImage({
              id: truck.id,
              collectionName: "trucks",
              file: imgSrc,
              document_type: `${currentMeta.name} Snapshot`,
              document_number: currentItem.serial || "N/A"
            });
          }
        },
        className: "p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg",
        title: "View Full Size"
      },
      /* @__PURE__ */ e.jsx("ke", { className: "w-4 h-4" })
    ), /* @__PURE__ */ e.jsx(
      "button",
      {
        type: "button",
        onClick: (e2) => {
          e2.stopPropagation();
          handleDeletePhoto(idx);
        },
        className: "p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg",
        title: "Delete Photo"
      },
      "\u2715"
    ))
  ))) : /* @__PURE__ */ e.jsx(
    "div",
    {
      onClick: () => photoInputRef.current?.click(),
      className: "w-full aspect-video rounded-2xl border border-dashed border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:bg-muted/20 transition"
    },
    /* @__PURE__ */ e.jsx(Te, { className: "w-5 h-5 text-muted-foreground/60" }),
    /* @__PURE__ */ e.jsx("span", { className: "text-xs text-muted-foreground" }, "Click to upload equipment photos")
  )), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] uppercase font-bold text-muted-foreground tracking-wider block" }, "Purchase Invoice / Bill"), /* @__PURE__ */ e.jsx("label", { className: "text-[11px] font-bold text-cyan-500 hover:text-cyan-400 cursor-pointer flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Te, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ e.jsx("span", null, currentItem.bill ? "Replace Bill" : "+ Upload Bill"), /* @__PURE__ */ e.jsx(
    "input",
    {
      ref: billInputRef,
      type: "file",
      accept: "image/*,application/pdf",
      onChange: handleBillUpload,
      className: "hidden"
    }
  ))), currentItem.bill ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-2xl" }, /* @__PURE__ */ e.jsx("div", { className: "p-2 bg-cyan-500/10 rounded-xl shrink-0 text-cyan-500" }, currentItem.bill_name?.toLowerCase().endsWith(".pdf") ? /* @__PURE__ */ e.jsx(_e, { className: "w-5 h-5" }) : /* @__PURE__ */ e.jsx(Ne, { className: "w-5 h-5" })), /* @__PURE__ */ e.jsx("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ e.jsx("p", { className: "text-xs font-bold text-foreground truncate" }, currentItem.bill_name || "Equipment_Invoice.pdf"), /* @__PURE__ */ e.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5" }, currentItem.bill_name?.toLowerCase().endsWith(".pdf") ? "PDF Document" : "Image Invoice")), /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-1 shrink-0" }, /* @__PURE__ */ e.jsx(
    "a",
    {
      href: currentItem.bill,
      target: "_blank",
      rel: "noreferrer",
      className: "p-2 rounded-xl text-muted-foreground hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors",
      title: "View / Download"
    },
    /* @__PURE__ */ e.jsx("ke", { className: "w-4 h-4" })
  ), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: handleDeleteBill,
      className: "p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors",
      title: "Remove Bill"
    },
    "\u2715"
  ))) : /* @__PURE__ */ e.jsx(
    "div",
    {
      onClick: () => billInputRef.current?.click(),
      className: "flex items-center gap-2 p-3.5 bg-muted/20 border border-dashed border-border/50 rounded-2xl cursor-pointer hover:bg-muted/30 transition"
    },
    /* @__PURE__ */ e.jsx(Ne, { className: "w-4 h-4 text-muted-foreground/50" }),
    /* @__PURE__ */ e.jsx("span", { className: "text-xs text-muted-foreground" }, "No bill uploaded yet. Click to attach invoice.")
  ))))), editModalOpen && /* @__PURE__ */ e.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" }, /* @__PURE__ */ e.jsx("div", { className: "w-full max-w-[480px] bg-card border border-border/60 rounded-3xl p-6 shadow-2xl space-y-4" }, /* @__PURE__ */ e.jsx("div", { className: "flex justify-between items-center border-b border-border/50 pb-3" }, /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("h4", { className: "text-lg font-bold font-heading text-foreground" }, "Edit ", currentMeta.name), /* @__PURE__ */ e.jsx("p", { className: "text-xs text-muted-foreground" }, "Vehicle: ", truck.truck_number)), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setEditModalOpen(false),
      className: "text-muted-foreground hover:text-foreground text-sm font-bold"
    },
    "\u2715"
  )), /* @__PURE__ */ e.jsx("form", { onSubmit: handleSaveEdit, className: "space-y-3.5 py-1" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Serial / Stamp Tag # *"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: editForm.serial,
      onChange: (e2) => setEditForm({ ...editForm, serial: e2.target.value }),
      className: "text-xs h-9 rounded-xl font-mono uppercase",
      placeholder: "e.g. JACK-20T-01",
      required: true
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Model / Specs / Brand"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: editForm.brand,
      onChange: (e2) => setEditForm({ ...editForm, brand: e2.target.value }),
      className: "text-xs h-9 rounded-xl",
      placeholder: "e.g. Omex 20 Ton Hydraulic"
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Purchase Date"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "date",
      value: editForm.purchase_date,
      onChange: (e2) => setEditForm({ ...editForm, purchase_date: e2.target.value }),
      className: "text-xs h-9 rounded-xl"
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Verified By"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: editForm.verified_by,
      onChange: (e2) => setEditForm({ ...editForm, verified_by: e2.target.value }),
      className: "text-xs h-9 rounded-xl",
      placeholder: "Inspector / Driver"
    }
  ))), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Condition Notes & Handover Details"), /* @__PURE__ */ e.jsx(
    "textarea",
    {
      value: editForm.notes,
      onChange: (e2) => setEditForm({ ...editForm, notes: e2.target.value }),
      className: "w-full text-xs p-3 rounded-xl bg-background border border-border font-medium focus:ring-2 focus:ring-primary/20 min-h-[70px]",
      placeholder: "Enter equipment condition, accessories included, or driver handover remarks..."
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "pt-3 border-t border-border/50 flex justify-end gap-2" }, /* @__PURE__ */ e.jsx(
    _,
    {
      type: "button",
      variant: "ghost",
      onClick: () => setEditModalOpen(false),
      disabled: loading,
      className: "rounded-xl text-xs"
    },
    "Cancel"
  ), /* @__PURE__ */ e.jsx(
    _,
    {
      type: "submit",
      disabled: loading,
      className: "rounded-xl shadow-sm text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
    },
    loading && /* @__PURE__ */ e.jsx(Qe, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
    "Save Details"
  ))))));
}
function CrossTruckTyreSwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  currentTyres = [],
  preselectedTyre = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap");
  const [loading, setLoading] = c.useState(false);
  const [sourceTyreId, setSourceTyreId] = c.useState("");
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [targetPosition, setTargetPosition] = c.useState("front_left");
  const [odometerReading, setOdometerReading] = c.useState("");
  const [swapReason, setSwapReason] = c.useState("Fleet Tyre Reallocation & Axle Wear Balancing");
  const [newBrand, setNewBrand] = c.useState("MRF");
  const [newModel, setNewModel] = c.useState("Steel Muscle");
  const [newSerial, setNewSerial] = c.useState("");
  const [newDepth, setNewDepth] = c.useState("15.0");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [newCost, setNewCost] = c.useState("");
  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");
  c.useEffect(() => {
    if (isOpen) {
      const activeTyres2 = currentTyres.filter((t) => t.status !== "replaced" && t.tyre_position);
      setSourceTyreId(preselectedTyre?.id || (activeTyres2.length > 0 ? activeTyres2[0].id : ""));
      const otherTrucks2 = allTrucks.filter((t) => t.id !== currentTruck?.id);
      if (otherTrucks2.length > 0) {
        setTargetTruckId(otherTrucks2[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("inventory");
      }
      setOdometerReading("");
      setNewSerial("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, preselectedTyre, currentTyres, allTrucks, currentTruck]);
  if (!isOpen) return null;
  const activeTyres = currentTyres.filter((t) => t.status !== "replaced" && t.tyre_position);
  const selectedSourceTyre = activeTyres.find((t) => t.id === sourceTyreId);
  const otherTrucks = allTrucks.filter((t) => t.id !== currentTruck?.id);
  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!selectedSourceTyre) {
      I.error("Please select a tyre from the current truck to swap/move.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please provide the serial number for the new tyre being installed.");
      return;
    }
    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = otherTrucks.find((t) => t.id === finalTargetTruckId);
      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the vehicle registration number for the new truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }
      const targetPosObj = W.find((w) => w.id === targetPosition);
      const targetAxle = targetPosObj ? targetPosObj.axle : "single_axle";
      const sourcePosObj = W.find((w) => w.id === selectedSourceTyre.tyre_position);
      const sourceAxle = sourcePosObj ? sourcePosObj.axle : "single_axle";
      if (finalTargetTruckId === "inventory") {
        await j.collection("tyres").update(selectedSourceTyre.id, {
          truck_id: "",
          tyre_position: "stepney",
          axle_position: "stepney",
          status: "spare"
        }, { $autoCancel: false });
        if (mode === "transfer_replace") {
          await j.collection("tyres").create({
            truck_id: currentTruck.id,
            tyre_position: selectedSourceTyre.tyre_position,
            axle_position: sourceAxle,
            tyre_brand: newBrand,
            model_no: newModel,
            serial_number: newSerial.trim().toUpperCase(),
            tyre_depth_mm: parseFloat(newDepth || "15.0"),
            purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            current_lifecycle_kms: 0,
            assignment_start_kms: Number(odometerReading || 0)
          }, { $autoCancel: false });
        }
        I.success(`Tyre ${selectedSourceTyre.serial_number} moved to Standby Yard / Spare inventory!`);
      } else {
        const targetTyres = await j.collection("tyres").getFullList({
          filter: `truck_id = "${finalTargetTruckId}" && status != "replaced"`,
          $autoCancel: false
        }).catch(() => []);
        const targetOccupant = targetTyres.find((t) => t.tyre_position === targetPosition);
        if (mode === "swap") {
          await j.collection("tyres").update(selectedSourceTyre.id, {
            truck_id: finalTargetTruckId,
            tyre_position: targetPosition,
            axle_position: targetAxle
          }, { $autoCancel: false });
          if (targetOccupant) {
            await j.collection("tyres").update(targetOccupant.id, {
              truck_id: currentTruck.id,
              tyre_position: selectedSourceTyre.tyre_position,
              axle_position: sourceAxle
            }, { $autoCancel: false });
          }
          try {
            await j.collection("tyre_rotations").create({
              truck_id: currentTruck.id,
              tyre1_id: selectedSourceTyre.id,
              tyre2_id: targetOccupant ? targetOccupant.id : null,
              from_position1: selectedSourceTyre.tyre_position,
              to_position1: targetPosition,
              from_position2: targetOccupant ? targetPosition : "",
              to_position2: targetOccupant ? selectedSourceTyre.tyre_position : "",
              swap_odometer_reading: Number(odometerReading || 0),
              swap_date: (/* @__PURE__ */ new Date()).toISOString()
            }, { $autoCancel: false });
          } catch (rotErr) {
            console.warn("Rotation logging notice:", rotErr);
          }
          I.success(`Successfully swapped tyre ${selectedSourceTyre.serial_number} with ${finalTargetTruck ? finalTargetTruck.truck_number : "other truck"}!`);
        } else {
          await j.collection("tyres").update(selectedSourceTyre.id, {
            truck_id: finalTargetTruckId,
            tyre_position: targetPosition,
            axle_position: targetAxle
          }, { $autoCancel: false });
          if (targetOccupant) {
            await j.collection("tyres").update(targetOccupant.id, {
              tyre_position: "stepney",
              axle_position: "stepney"
            }, { $autoCancel: false });
          }
          await j.collection("tyres").create({
            truck_id: currentTruck.id,
            tyre_position: selectedSourceTyre.tyre_position,
            axle_position: sourceAxle,
            tyre_brand: newBrand,
            model_no: newModel,
            serial_number: newSerial.trim().toUpperCase(),
            tyre_depth_mm: parseFloat(newDepth || "15.0"),
            purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : (/* @__PURE__ */ new Date()).toISOString(),
            status: "active",
            current_lifecycle_kms: 0,
            assignment_start_kms: Number(odometerReading || 0)
          }, { $autoCancel: false });
          try {
            await j.collection("tyre_rotations").create({
              truck_id: currentTruck.id,
              tyre1_id: selectedSourceTyre.id,
              from_position1: selectedSourceTyre.tyre_position,
              to_position1: targetPosition,
              swap_odometer_reading: Number(odometerReading || 0),
              swap_date: (/* @__PURE__ */ new Date()).toISOString()
            }, { $autoCancel: false });
          } catch (rotErr) {
            console.warn("Rotation logging notice:", rotErr);
          }
          I.success(`Moved tyre to ${finalTargetTruck ? finalTargetTruck.truck_number : "target"} & fitted new tyre ${newSerial.toUpperCase()} on ${currentTruck.truck_number}!`);
        }
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Tyre swap failure:", err);
      I.error(err?.message || "Failed to execute cross-truck tyre swap");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ e.jsx(je, { open: isOpen, onOpenChange: (openState) => !openState && !loading && onClose() }, /* @__PURE__ */ e.jsx(ye, { className: "sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card" }, /* @__PURE__ */ e.jsx(Me, { className: "pb-3 border-b border-border/50" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "p-2 bg-indigo-500/10 rounded-2xl text-indigo-500 border border-indigo-500/20" }, /* @__PURE__ */ e.jsx(Q, { className: "w-5 h-5" })), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx(Ce, { className: "text-xl font-heading font-bold text-foreground" }, "Fleet Tyre Swapping & Transfer"), /* @__PURE__ */ e.jsx(xs, { className: "text-xs text-muted-foreground" }, "Swap tyres between trucks or move a tyre to another vehicle and fit a fresh one.")))), /* @__PURE__ */ e.jsx("form", { onSubmit: handleSubmit, className: "space-y-4 py-3" }, /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50" }, /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("swap"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "swap" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Q, { className: "w-3.5 h-3.5" }),
    "\u21C4 Two-Way Swap"
  ), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("transfer_replace"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "transfer_replace" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Le, { className: "w-3.5 h-3.5" }),
    "\u2192 Move & Fit New Tyre"
  )), /* @__PURE__ */ e.jsx("div", { className: "p-3.5 bg-muted/20 border border-border/50 rounded-2xl space-y-3" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Oe, { className: "w-3.5 h-3.5" }), " Source Vehicle: ", currentTruck?.truck_number || "Current"), /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-muted-foreground font-mono" }, activeTyres.length, " tyres available")), /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Select Tyre to Swap / Move"), /* @__PURE__ */ e.jsx(
    "select",
    {
      value: sourceTyreId,
      onChange: (e2) => setSourceTyreId(e2.target.value),
      className: "w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20",
      required: true
    },
    activeTyres.map((t) => {
      const pos = W.find((w) => w.id === t.tyre_position);
      return /* @__PURE__ */ e.jsx("option", { key: t.id, value: t.id }, "[", pos ? pos.label : t.tyre_position, "] ", t.tyre_brand, " - SN: ", t.serial_number, " (", t.tyre_depth_mm || 15, "mm)");
    })
  ))), /* @__PURE__ */ e.jsx("div", { className: "p-3.5 bg-muted/20 border border-border/50 rounded-2xl space-y-3" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Oe, { className: "w-3.5 h-3.5" }), " Destination Vehicle & Axle"), otherTrucks.length === 0 && !showQuickAddTruck && /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(true),
      className: "text-[10px] text-primary hover:underline font-bold"
    },
    "+ Add 2nd Truck"
  )), showQuickAddTruck ? /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2" }, /* @__PURE__ */ e.jsx("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-primary" }, "Register Destination Truck"), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(false),
      className: "text-[10px] text-muted-foreground hover:text-foreground"
    },
    "Cancel"
  )), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Reg No (e.g. TG12AB1234)",
      value: quickTruckNumber,
      onChange: (e2) => setQuickTruckNumber(e2.target.value),
      className: "text-xs h-8 rounded-lg uppercase",
      required: true
    }
  ), /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Truck Name / Model",
      value: quickTruckName,
      onChange: (e2) => setQuickTruckName(e2.target.value),
      className: "text-xs h-8 rounded-lg"
    }
  ))) : /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Target Vehicle"), /* @__PURE__ */ e.jsx(
    "select",
    {
      value: targetTruckId,
      onChange: (e2) => {
        if (e2.target.value === "new_truck") {
          setShowQuickAddTruck(true);
        } else {
          setTargetTruckId(e2.target.value);
        }
      },
      className: "w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20",
      required: true
    },
    otherTrucks.map((t) => /* @__PURE__ */ e.jsx("option", { key: t.id, value: t.id }, t.truck_number, " ", t.truck_name ? `(${t.truck_name})` : "")),
    /* @__PURE__ */ e.jsx("option", { value: "inventory" }, "Standby Yard / Spare Inventory"),
    /* @__PURE__ */ e.jsx("option", { value: "new_truck" }, "+ Quick Register New Truck...")
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Target Position"), /* @__PURE__ */ e.jsx(
    "select",
    {
      value: targetPosition,
      onChange: (e2) => setTargetPosition(e2.target.value),
      className: "w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20",
      disabled: targetTruckId === "inventory"
    },
    W.map((w) => /* @__PURE__ */ e.jsx("option", { key: w.id, value: w.id }, w.label))
  )))), mode === "transfer_replace" && /* @__PURE__ */ e.jsx("div", { className: "p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Te, { className: "w-3.5 h-3.5" }), " Fit Brand-New Tyre on ", currentTruck?.truck_number, " (", selectedSourceTyre?.tyre_position || "Vacated Slot", ")"), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Brand"), /* @__PURE__ */ e.jsx(
    "select",
    {
      value: newBrand,
      onChange: (e2) => setNewBrand(e2.target.value),
      className: "w-full h-8 px-2 text-xs bg-background border border-border rounded-lg"
    },
    /* @__PURE__ */ e.jsx("option", { value: "MRF" }, "MRF"),
    /* @__PURE__ */ e.jsx("option", { value: "Apollo" }, "Apollo"),
    /* @__PURE__ */ e.jsx("option", { value: "JK Tyre" }, "JK Tyre"),
    /* @__PURE__ */ e.jsx("option", { value: "CEAT" }, "CEAT"),
    /* @__PURE__ */ e.jsx("option", { value: "Bridgestone" }, "Bridgestone"),
    /* @__PURE__ */ e.jsx("option", { value: "Michelin" }, "Michelin")
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Model / Pattern"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newModel,
      onChange: (e2) => setNewModel(e2.target.value),
      className: "text-xs h-8 rounded-lg",
      placeholder: "e.g. Steel Muscle 99"
    }
  ))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "New Serial # *"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newSerial,
      onChange: (e2) => setNewSerial(e2.target.value),
      className: "text-xs h-8 rounded-lg font-mono uppercase",
      placeholder: "e.g. 58364019201",
      required: true
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Initial Tread (mm)"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "number",
      step: "0.1",
      value: newDepth,
      onChange: (e2) => setNewDepth(e2.target.value),
      className: "text-xs h-8 rounded-lg",
      placeholder: "15.0"
    }
  ))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Purchase Date"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "date",
      value: newPurchaseDate,
      onChange: (e2) => setNewPurchaseDate(e2.target.value),
      className: "text-xs h-8 rounded-lg"
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Purchase Cost (\u20B9, optional)"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "number",
      value: newCost,
      onChange: (e2) => setNewCost(e2.target.value),
      className: "text-xs h-8 rounded-lg",
      placeholder: "e.g. 24500"
    }
  )))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Current Odometer (KM)"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "number",
      value: odometerReading,
      onChange: (e2) => setOdometerReading(e2.target.value),
      className: "text-xs h-9 rounded-xl font-mono",
      placeholder: "e.g. 145830"
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Swap Reason / Notes"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: swapReason,
      onChange: (e2) => setSwapReason(e2.target.value),
      className: "text-xs h-9 rounded-xl",
      placeholder: "Reason for swap"
    }
  ))), /* @__PURE__ */ e.jsx(Se, { className: "pt-2 border-t border-border/50 flex items-center justify-end gap-2" }, /* @__PURE__ */ e.jsx(_, { type: "button", variant: "ghost", onClick: onClose, disabled: loading, className: "rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ e.jsx(
    _,
    {
      type: "submit",
      disabled: loading,
      className: "rounded-xl shadow-sm text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
    },
    loading && /* @__PURE__ */ e.jsx(Qe, { className: "w-3.5 h-3.5 animate-spin" }),
    mode === "swap" ? "Confirm Cross-Truck Swap" : "Confirm Move & Fit New Tyre"
  )))));
}
function CrossTruckBatterySwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  onSuccess
}) {
  const [mode, setMode] = c.useState("swap");
  const [loading, setLoading] = c.useState(false);
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [swapDate, setSwapDate] = c.useState(ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = c.useState("Battery rotated between fleet vehicles");
  const [newSerial, setNewSerial] = c.useState("");
  const [newBrand, setNewBrand] = c.useState("Amaron");
  const [newWarranty, setNewWarranty] = c.useState("24 Months Replacement");
  const [newPurchaseDate, setNewPurchaseDate] = c.useState(ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");
  c.useEffect(() => {
    if (isOpen) {
      const otherTrucks2 = allTrucks.filter((t) => t.id !== currentTruck?.id);
      if (otherTrucks2.length > 0) {
        setTargetTruckId(otherTrucks2[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("new_truck");
        setShowQuickAddTruck(true);
      }
      setNewSerial("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, allTrucks, currentTruck]);
  if (!isOpen) return null;
  const otherTrucks = allTrucks.filter((t) => t.id !== currentTruck?.id);
  const selectedTargetTruck = otherTrucks.find((t) => t.id === targetTruckId);
  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!currentTruck) {
      I.error("No active truck selected.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please enter the new battery serial number.");
      return;
    }
    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = selectedTargetTruck;
      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the vehicle registration number for the second truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }
      if (!finalTargetTruck) {
        I.error("Please select a target truck.");
        setLoading(false);
        return;
      }
      if (mode === "swap") {
        const truckABattery = {
          battery_serial_number: currentTruck.battery_serial_number || "",
          battery_purchase_date: currentTruck.battery_purchase_date || "",
          battery_warranty_details: currentTruck.battery_warranty_details || ""
        };
        const truckBBattery = {
          battery_serial_number: finalTargetTruck.battery_serial_number || "",
          battery_purchase_date: finalTargetTruck.battery_purchase_date || "",
          battery_warranty_details: finalTargetTruck.battery_warranty_details || ""
        };
        await j.collection("trucks").update(currentTruck.id, {
          battery_serial_number: truckBBattery.battery_serial_number,
          battery_purchase_date: truckBBattery.battery_purchase_date,
          battery_warranty_details: truckBBattery.battery_warranty_details
        }, { $autoCancel: false });
        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: truckABattery.battery_serial_number,
          battery_purchase_date: truckABattery.battery_purchase_date,
          battery_warranty_details: truckABattery.battery_warranty_details
        }, { $autoCancel: false });
        I.success(`Swapped batteries between ${currentTruck.truck_number} and ${finalTargetTruck.truck_number}!`);
      } else {
        const oldBattery = {
          battery_serial_number: currentTruck.battery_serial_number || "",
          battery_purchase_date: currentTruck.battery_purchase_date || "",
          battery_warranty_details: currentTruck.battery_warranty_details || ""
        };
        await j.collection("trucks").update(finalTargetTruckId, {
          battery_serial_number: oldBattery.battery_serial_number,
          battery_purchase_date: oldBattery.battery_purchase_date,
          battery_warranty_details: oldBattery.battery_warranty_details
        }, { $autoCancel: false });
        await j.collection("trucks").update(currentTruck.id, {
          battery_serial_number: newSerial.trim().toUpperCase(),
          battery_purchase_date: newPurchaseDate ? `${newPurchaseDate} 00:00:00.000Z` : (/* @__PURE__ */ new Date()).toISOString(),
          battery_warranty_details: `${newWarranty}${newBrand ? ` (${newBrand})` : ""}`
        }, { $autoCancel: false });
        I.success(`Moved battery to ${finalTargetTruck.truck_number} & installed new battery (${newSerial.toUpperCase()}) on ${currentTruck.truck_number}!`);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Battery swap failure:", err);
      I.error(err?.message || "Failed to execute battery swap");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ e.jsx(je, { open: isOpen, onOpenChange: (openState) => !openState && !loading && onClose() }, /* @__PURE__ */ e.jsx(ye, { className: "sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card" }, /* @__PURE__ */ e.jsx(Me, { className: "pb-3 border-b border-border/50" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "p-2 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20" }, /* @__PURE__ */ e.jsx(Re, { className: "w-5 h-5" })), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx(Ce, { className: "text-xl font-heading font-bold text-foreground" }, "Fleet Battery Swapping & Transfer"), /* @__PURE__ */ e.jsx(xs, { className: "text-xs text-muted-foreground" }, "Swap batteries between vehicles or transfer current battery to another truck and install a new unit.")))), /* @__PURE__ */ e.jsx("form", { onSubmit: handleSubmit, className: "space-y-4 py-3" }, /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50" }, /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("swap"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "swap" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Q, { className: "w-3.5 h-3.5" }),
    "\u21C4 Two-Way Battery Swap"
  ), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("transfer_replace"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "transfer_replace" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Le, { className: "w-3.5 h-3.5" }),
    "\u2192 Move & Install New Battery"
  )), /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-1.5" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Re, { className: "w-3.5 h-3.5" }), " Current Battery on ", currentTruck?.truck_number), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs" }, /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-muted-foreground block" }, "Serial Number:"), /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-foreground" }, currentTruck?.battery_serial_number || "None / 0")), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-muted-foreground block" }, "Warranty Details:"), /* @__PURE__ */ e.jsx("span", { className: "font-medium text-foreground" }, currentTruck?.battery_warranty_details || "N/A")))), /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-2" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Oe, { className: "w-3.5 h-3.5" }), " Destination Vehicle"), otherTrucks.length === 0 && !showQuickAddTruck && /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(true),
      className: "text-[10px] text-primary hover:underline font-bold"
    },
    "+ Add 2nd Truck"
  )), showQuickAddTruck ? /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2" }, /* @__PURE__ */ e.jsx("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-primary" }, "Register Destination Truck"), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(false),
      className: "text-[10px] text-muted-foreground hover:text-foreground"
    },
    "Cancel"
  )), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Reg No (e.g. TG12AB1234)",
      value: quickTruckNumber,
      onChange: (e2) => setQuickTruckNumber(e2.target.value),
      className: "text-xs h-8 rounded-lg uppercase",
      required: true
    }
  ), /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Truck Name / Model",
      value: quickTruckName,
      onChange: (e2) => setQuickTruckName(e2.target.value),
      className: "text-xs h-8 rounded-lg"
    }
  ))) : /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx(
    "select",
    {
      value: targetTruckId,
      onChange: (e2) => {
        if (e2.target.value === "new_truck") {
          setShowQuickAddTruck(true);
        } else {
          setTargetTruckId(e2.target.value);
        }
      },
      className: "w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20",
      required: true
    },
    otherTrucks.map((t) => /* @__PURE__ */ e.jsx("option", { key: t.id, value: t.id }, t.truck_number, " ", t.truck_name ? `(${t.truck_name})` : "", " - Battery: ", t.battery_serial_number || "None")),
    /* @__PURE__ */ e.jsx("option", { value: "new_truck" }, "+ Quick Register New Truck...")
  ))), mode === "transfer_replace" && /* @__PURE__ */ e.jsx("div", { className: "p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Re, { className: "w-3.5 h-3.5" }), " Install Brand-New Battery on ", currentTruck?.truck_number), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "New Battery Serial # *"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newSerial,
      onChange: (e2) => setNewSerial(e2.target.value),
      className: "text-xs h-8 rounded-lg font-mono uppercase",
      placeholder: "e.g. AMARON-150AH-01",
      required: true
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Battery Brand"), /* @__PURE__ */ e.jsx(
    "select",
    {
      value: newBrand,
      onChange: (e2) => setNewBrand(e2.target.value),
      className: "w-full h-8 px-2 text-xs bg-background border border-border rounded-lg"
    },
    /* @__PURE__ */ e.jsx("option", { value: "Amaron" }, "Amaron"),
    /* @__PURE__ */ e.jsx("option", { value: "Exide" }, "Exide"),
    /* @__PURE__ */ e.jsx("option", { value: "Tata Green" }, "Tata Green"),
    /* @__PURE__ */ e.jsx("option", { value: "SF Sonic" }, "SF Sonic"),
    /* @__PURE__ */ e.jsx("option", { value: "PowerZone" }, "PowerZone")
  ))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Warranty Details"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newWarranty,
      onChange: (e2) => setNewWarranty(e2.target.value),
      className: "text-xs h-8 rounded-lg",
      placeholder: "e.g. 24 Months Replacement"
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Purchase Date"), /* @__PURE__ */ e.jsx(
    R,
    {
      type: "date",
      value: newPurchaseDate,
      onChange: (e2) => setNewPurchaseDate(e2.target.value),
      className: "text-xs h-8 rounded-lg"
    }
  )))), /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Swap Notes / Reason"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: notes,
      onChange: (e2) => setNotes(e2.target.value),
      className: "text-xs h-9 rounded-xl",
      placeholder: "e.g. Swapped battery for heavy night runs"
    }
  )), /* @__PURE__ */ e.jsx(Se, { className: "pt-2 border-t border-border/50 flex items-center justify-end gap-2" }, /* @__PURE__ */ e.jsx(_, { type: "button", variant: "ghost", onClick: onClose, disabled: loading, className: "rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ e.jsx(
    _,
    {
      type: "submit",
      disabled: loading,
      className: "rounded-xl shadow-sm text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white gap-1.5"
    },
    loading && /* @__PURE__ */ e.jsx(Qe, { className: "w-3.5 h-3.5 animate-spin" }),
    mode === "swap" ? "Confirm Battery Swap" : "Confirm Move & Fit New Battery"
  )))));
}
function CrossTruckEquipmentSwapModal({
  isOpen,
  onClose,
  allTrucks = [],
  currentTruck = null,
  initialItemKey = "jack",
  // 'jack' | 'wheel_spanner' | 'tool_box'
  onSuccess
}) {
  const [selectedItemKey, setSelectedItemKey] = c.useState(initialItemKey);
  const [mode, setMode] = c.useState("swap");
  const [loading, setLoading] = c.useState(false);
  const [targetTruckId, setTargetTruckId] = c.useState("");
  const [swapNotes, setSwapNotes] = c.useState("Transferred equipment between fleet vehicles");
  const [newSerial, setNewSerial] = c.useState("");
  const [newBrand, setNewBrand] = c.useState("");
  const [showQuickAddTruck, setShowQuickAddTruck] = c.useState(false);
  const [quickTruckNumber, setQuickTruckNumber] = c.useState("");
  const [quickTruckName, setQuickTruckName] = c.useState("");
  const itemNames = {
    jack: "Hydraulic Jack (10T-20T)",
    wheel_spanner: "Wheel Spanner & Tommy Bar",
    tool_box: "Tool Box & Emergency Kit"
  };
  c.useEffect(() => {
    if (isOpen) {
      setSelectedItemKey(initialItemKey || "jack");
      const otherTrucks2 = allTrucks.filter((t) => t.id !== currentTruck?.id);
      if (otherTrucks2.length > 0) {
        setTargetTruckId(otherTrucks2[0].id);
        setShowQuickAddTruck(false);
      } else {
        setTargetTruckId("new_truck");
        setShowQuickAddTruck(true);
      }
      setNewSerial("");
      setNewBrand("");
      setQuickTruckNumber("");
      setQuickTruckName("");
    }
  }, [isOpen, initialItemKey, allTrucks, currentTruck]);
  if (!isOpen) return null;
  const otherTrucks = allTrucks.filter((t) => t.id !== currentTruck?.id);
  const selectedTargetTruck = otherTrucks.find((t) => t.id === targetTruckId);
  const currentEquipment = getTruckEquipment(currentTruck);
  const currentItem = currentEquipment[selectedItemKey];
  const handleSubmit = async (eEvent) => {
    eEvent.preventDefault();
    if (!currentTruck) {
      I.error("No active truck selected.");
      return;
    }
    if (mode === "transfer_replace" && !newSerial.trim()) {
      I.error("Please enter the serial / tag # for the replacement equipment.");
      return;
    }
    setLoading(true);
    try {
      let finalTargetTruckId = targetTruckId;
      let finalTargetTruck = selectedTargetTruck;
      if (showQuickAddTruck || finalTargetTruckId === "new_truck") {
        if (!quickTruckNumber.trim()) {
          I.error("Please enter the registration number for the second truck.");
          setLoading(false);
          return;
        }
        const createdTruck = await j.collection("trucks").create({
          truck_number: quickTruckNumber.trim().toUpperCase(),
          truck_name: quickTruckName.trim() || "Secondary Truck",
          tyre_count: 6,
          ownership_type: "Owned"
        }, { $autoCancel: false });
        finalTargetTruckId = createdTruck.id;
        finalTargetTruck = createdTruck;
      }
      if (!finalTargetTruck) {
        I.error("Please select a target truck.");
        setLoading(false);
        return;
      }
      const targetEquipment = getTruckEquipment(finalTargetTruck);
      if (mode === "swap") {
        const itemA = { ...currentEquipment[selectedItemKey] };
        const itemB = { ...targetEquipment[selectedItemKey] };
        currentEquipment[selectedItemKey] = {
          ...itemB,
          last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
          notes: `Swapped from ${finalTargetTruck.truck_number}. ${swapNotes}`
        };
        targetEquipment[selectedItemKey] = {
          ...itemA,
          last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
          notes: `Swapped from ${currentTruck.truck_number}. ${swapNotes}`
        };
        await j.collection("trucks").update(currentTruck.id, {
          fastag_notes: JSON.stringify(currentEquipment)
        }, { $autoCancel: false });
        await j.collection("trucks").update(finalTargetTruckId, {
          fastag_notes: JSON.stringify(targetEquipment)
        }, { $autoCancel: false });
        I.success(`Swapped ${itemNames[selectedItemKey]} between ${currentTruck.truck_number} and ${finalTargetTruck.truck_number}!`);
      } else {
        const itemA = { ...currentEquipment[selectedItemKey] };
        targetEquipment[selectedItemKey] = {
          ...itemA,
          status: "present",
          last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
          notes: `Transferred from ${currentTruck.truck_number}. ${swapNotes}`
        };
        currentEquipment[selectedItemKey] = {
          status: "present",
          serial: newSerial.trim().toUpperCase(),
          brand: newBrand.trim() || currentItem.brand,
          last_verified: ne(/* @__PURE__ */ new Date(), "yyyy-MM-dd"),
          verified_by: currentTruck.driver_name || "Supervisor",
          notes: `Brand new equipment issued. ${swapNotes}`
        };
        await j.collection("trucks").update(currentTruck.id, {
          fastag_notes: JSON.stringify(currentEquipment)
        }, { $autoCancel: false });
        await j.collection("trucks").update(finalTargetTruckId, {
          fastag_notes: JSON.stringify(targetEquipment)
        }, { $autoCancel: false });
        I.success(`Moved ${itemNames[selectedItemKey]} to ${finalTargetTruck.truck_number} & issued new unit (${newSerial.toUpperCase()}) on ${currentTruck.truck_number}!`);
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Equipment swap failure:", err);
      I.error(err?.message || "Failed to execute equipment swap");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ e.jsx(je, { open: isOpen, onOpenChange: (openState) => !openState && !loading && onClose() }, /* @__PURE__ */ e.jsx(ye, { className: "sm:max-w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl border-border/60 shadow-xl bg-card" }, /* @__PURE__ */ e.jsx(Me, { className: "pb-3 border-b border-border/50" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "p-2 bg-cyan-500/10 rounded-2xl text-cyan-500 border border-cyan-500/20" }, /* @__PURE__ */ e.jsx(WrenchIcon, { className: "w-5 h-5" })), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx(Ce, { className: "text-xl font-heading font-bold text-foreground" }, "Fleet Tool & Equipment Swapper"), /* @__PURE__ */ e.jsx(xs, { className: "text-xs text-muted-foreground" }, "Swap Jack, Wheel Spanner or Tool Box between vehicles or issue new equipment.")))), /* @__PURE__ */ e.jsx("form", { onSubmit: handleSubmit, className: "space-y-4 py-3" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Select Equipment Item"), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-3 gap-1.5 p-1 bg-muted/30 rounded-xl border border-border/50" }, ["jack", "wheel_spanner", "tool_box"].map((k) => /* @__PURE__ */ e.jsx(
    "button",
    {
      key: k,
      type: "button",
      onClick: () => setSelectedItemKey(k),
      className: `py-1.5 px-2 rounded-lg text-[11px] font-bold transition text-center truncate ${selectedItemKey === k ? "bg-cyan-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    k === "jack" ? "Jack" : k === "wheel_spanner" ? "Spanner" : "Tool Box"
  )))), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/50" }, /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("swap"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "swap" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Q, { className: "w-3.5 h-3.5" }),
    "\u21C4 Two-Way Swap"
  ), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setMode("transfer_replace"),
      className: `py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${mode === "transfer_replace" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ e.jsx(Le, { className: "w-3.5 h-3.5" }),
    "\u2192 Move & Issue New"
  )), /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-1.5" }, /* @__PURE__ */ e.jsx("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-cyan-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(WrenchIcon, { className: "w-3.5 h-3.5" }), " Current ", itemNames[selectedItemKey], " on ", currentTruck?.truck_number), /* @__PURE__ */ e.jsx("span", { className: `text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${currentItem?.status === "present" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}` }, currentItem?.status === "present" ? "Present" : "Stolen / Missing")), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2 text-xs" }, /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-muted-foreground block" }, "Serial / Tag #:"), /* @__PURE__ */ e.jsx("span", { className: "font-mono font-bold text-foreground" }, currentItem?.serial || "N/A")), /* @__PURE__ */ e.jsx("div", null, /* @__PURE__ */ e.jsx("span", { className: "text-[10px] text-muted-foreground block" }, "Specs:"), /* @__PURE__ */ e.jsx("span", { className: "font-medium text-foreground truncate block", title: currentItem?.brand }, currentItem?.brand || "Standard Kit")))), /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-muted/20 border border-border/50 rounded-2xl space-y-2" }, /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Oe, { className: "w-3.5 h-3.5" }), " Destination Vehicle"), otherTrucks.length === 0 && !showQuickAddTruck && /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(true),
      className: "text-[10px] text-primary hover:underline font-bold"
    },
    "+ Add 2nd Truck"
  )), showQuickAddTruck ? /* @__PURE__ */ e.jsx("div", { className: "p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-2" }, /* @__PURE__ */ e.jsx("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ e.jsx("span", { className: "text-xs font-bold text-primary" }, "Register Destination Truck"), /* @__PURE__ */ e.jsx(
    "button",
    {
      type: "button",
      onClick: () => setShowQuickAddTruck(false),
      className: "text-[10px] text-muted-foreground hover:text-foreground"
    },
    "Cancel"
  )), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Reg No (e.g. TG12AB1234)",
      value: quickTruckNumber,
      onChange: (e2) => setQuickTruckNumber(e2.target.value),
      className: "text-xs h-8 rounded-lg uppercase",
      required: true
    }
  ), /* @__PURE__ */ e.jsx(
    R,
    {
      placeholder: "Truck Name / Model",
      value: quickTruckName,
      onChange: (e2) => setQuickTruckName(e2.target.value),
      className: "text-xs h-8 rounded-lg"
    }
  ))) : /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx(
    "select",
    {
      value: targetTruckId,
      onChange: (e2) => {
        if (e2.target.value === "new_truck") {
          setShowQuickAddTruck(true);
        } else {
          setTargetTruckId(e2.target.value);
        }
      },
      className: "w-full h-9 px-3 text-xs bg-background border border-border rounded-xl font-medium focus:ring-2 focus:ring-primary/20",
      required: true
    },
    otherTrucks.map((t) => /* @__PURE__ */ e.jsx("option", { key: t.id, value: t.id }, t.truck_number, " ", t.truck_name ? `(${t.truck_name})` : "")),
    /* @__PURE__ */ e.jsx("option", { value: "new_truck" }, "+ Quick Register New Truck...")
  ))), mode === "transfer_replace" && /* @__PURE__ */ e.jsx("div", { className: "p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3" }, /* @__PURE__ */ e.jsx("span", { className: "text-[11px] font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ e.jsx(Le, { className: "w-3.5 h-3.5" }), " Issue Brand-New ", itemNames[selectedItemKey], " to ", currentTruck?.truck_number), /* @__PURE__ */ e.jsx("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "New Serial / Stamp # *"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newSerial,
      onChange: (e2) => setNewSerial(e2.target.value),
      className: "text-xs h-8 rounded-lg font-mono uppercase",
      placeholder: "e.g. JACK-20T-NEW",
      required: true
    }
  )), /* @__PURE__ */ e.jsx("div", { className: "space-y-1" }, /* @__PURE__ */ e.jsx("b", { className: "text-[11px] font-semibold" }, "Brand / Specification"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: newBrand,
      onChange: (e2) => setNewBrand(e2.target.value),
      className: "text-xs h-8 rounded-lg",
      placeholder: "e.g. Omex 20T Hydraulic"
    }
  )))), /* @__PURE__ */ e.jsx("div", { className: "space-y-1.5" }, /* @__PURE__ */ e.jsx("b", { className: "text-xs font-semibold" }, "Swap Notes / Reason"), /* @__PURE__ */ e.jsx(
    R,
    {
      value: swapNotes,
      onChange: (e2) => setSwapNotes(e2.target.value),
      className: "text-xs h-9 rounded-xl",
      placeholder: "e.g. Reallocated jack for emergency road tyre change"
    }
  )), /* @__PURE__ */ e.jsx(Se, { className: "pt-2 border-t border-border/50 flex items-center justify-end gap-2" }, /* @__PURE__ */ e.jsx(_, { type: "button", variant: "ghost", onClick: onClose, disabled: loading, className: "rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ e.jsx(
    _,
    {
      type: "submit",
      disabled: loading,
      className: "rounded-xl shadow-sm text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white gap-1.5"
    },
    loading && /* @__PURE__ */ e.jsx(Qe, { className: "w-3.5 h-3.5 animate-spin" }),
    mode === "swap" ? "Confirm Equipment Swap" : "Confirm Move & Issue New"
  )))));
}

function Ts(){const [crossTyreModal, setCrossTyreModal] = c.useState({ isOpen: !1, preselectedTyre: null });const [batterySwapModal, setBatterySwapModal] = c.useState({ isOpen: !1 });const [equipSwapModal, setEquipSwapModal] = c.useState({ isOpen: !1, itemKey: "jack" });const{truckId:N}=is(),C=ds(),[s,V]=c.useState([]),[l,S]=c.useState(null),[u,T]=c.useState([]),[m,p]=c.useState([]),[x,y]=c.useState(!0),a=fe.useMemo(()=>u.filter(t=>t.status!=="replaced"&&t.tyre_position),[u]),g=fe.useMemo(()=>u.filter(t=>t.status==="replaced"||!t.tyre_position),[u]),P=fe.useMemo(()=>a.filter(t=>(t.current_lifecycle_kms||0)>=8e4||t.status==="damaged").length,[a]);fe.useMemo(()=>a.filter(t=>(t.current_lifecycle_kms||0)>=6e4&&(t.current_lifecycle_kms||0)<8e4).length,[a]);const[w,k]=c.useState({isOpen:!1,tyre:null,initialPosition:null}),[L,A]=c.useState({isOpen:!1,tyre:null}),[o,i]=c.useState({isOpen:!1,tyre:null}),[B,O]=c.useState(null),[U,v]=c.useState(!1),[f,E]=c.useState({battery_serial_number:"",battery_purchase_date:"",battery_warranty_details:""}),[te,ee]=c.useState([]),[n,d]=c.useState([]),[M,z]=c.useState([]),[me,ve]=c.useState(null),[ue,ae]=c.useState(null),[_s,he]=c.useState(!1),[Y,pe]=c.useState({isOpen:!1,sourcePosition:null,targetPosition:null,odometerReading:""}),se=async()=>{try{y(!0);const t=await j.collection("trucks").getFullList({sort:"truck_number",$autoCancel:!1}).catch(()=>[]);V(t);const r=N||(t.length>0?t[0].id:null);if(!r){S(null),T([]),p([]);return}if(!N&&r){C(`/tyres/${r}`,{replace:!0});return}const h=t.find(D=>D.id===r)||await j.collection("trucks").getOne(r,{$autoCancel:!1});S(h);const H=await j.collection("trip_logs").getFullList({filter:`truck_number = "${h.truck_number}" && trip_status = "Completed"`,$autoCancel:!1}).catch(()=>[]),$=(await j.collection("tyres").getFullList({filter:`truck_id="${r}"`,sort:"-created",$autoCancel:!1}).catch(()=>[])).map(D=>{let q=0;if(D.purchase_date){const J=new Date(D.purchase_date.split(" ")[0]||D.purchase_date);q=H.filter(le=>!le.date||!le.kms?!1:new Date(le.date.split(" ")[0]||le.date)>=J).reduce((le,Ue)=>le+(Number(Ue.kms)||0),0)}return{...D,base_lifecycle_kms:D.current_lifecycle_kms||0,current_lifecycle_kms:(D.current_lifecycle_kms||0)+q}});T($);const re=await j.collection("tyre_rotations").getFullList({filter:`truck_id="${r}"`,sort:"-swap_date",expand:"tyre1_id,tyre2_id",$autoCancel:!1}).catch(()=>[]);p(re)}catch(t){console.error(t),I.error("Failed to load truck and tyre data")}finally{y(!1)}};c.useEffect(()=>{se()},[N]),c.useEffect(()=>{if(l&&U){E({battery_serial_number:l.battery_serial_number||"",battery_purchase_date:l.battery_purchase_date?l.battery_purchase_date.split("T")[0]:"",battery_warranty_details:l.battery_warranty_details||""});const t=l.battery_image?Array.isArray(l.battery_image)?l.battery_image:[l.battery_image]:[];if(d(t),ee([]),z([]),l.battery_bill){const r=j.files.getUrl(l,l.battery_bill);ae(r),he(l.battery_bill.toLowerCase().endsWith(".pdf"))}else ae(null),he(!1);ve(null)}},[U,l]);const De=t=>{const r=u.find(h=>h.tyre_position===t);r?A({isOpen:!0,tyre:r}):k({isOpen:!0,tyre:null,initialPosition:t})},Fe=t=>{k({isOpen:!0,tyre:t,initialPosition:t.tyre_position})},Ie=async t=>{try{await j.collection("tyres").delete(t,{$autoCancel:!1}),I.success("Tyre deleted successfully"),se()}catch(r){console.error(r),I.error("Failed to delete tyre")}},Ee=(t,r)=>{t.dataTransfer.setData("text/plain",r)},$e=(t,r)=>{t.preventDefault();const h=t.dataTransfer.getData("text/plain");!h||h===r||!u.some(F=>F.tyre_position===h)||pe({isOpen:!0,sourcePosition:h,targetPosition:r,odometerReading:""})},qe=async t=>{if(t.preventDefault(),!Y.odometerReading){I.error("Please enter odometer reading");return}y(!0);try{const{sourcePosition:r,targetPosition:h,odometerReading:H}=Y,F=u.find(D=>D.tyre_position===r),$=u.find(D=>D.tyre_position===h);if(!F){I.error("Source tyre not found");return}const re=W.find(D=>D.id===h);if(await j.collection("tyres").update(F.id,{tyre_position:h,axle_position:re?re.axle:"single_axle"},{$autoCancel:!1}),$){const D=W.find(q=>q.id===r);await j.collection("tyres").update($.id,{tyre_position:r,axle_position:D?D.axle:"single_axle"},{$autoCancel:!1})}await j.collection("tyre_rotations").create({truck_id:N,tyre1_id:F.id,tyre2_id:$?$.id:null,from_position1:r,to_position1:h,from_position2:$?h:"",to_position2:$?r:"",swap_odometer_reading:Number(H),swap_date:new Date().toISOString()},{$autoCancel:!1}),I.success("Tyres swapped successfully"),pe({isOpen:!1,sourcePosition:null,targetPosition:null,odometerReading:""}),se()}catch(r){console.error(r),I.error("Failed to swap tyres: "+r.message)}finally{y(!1)}},Ge=async t=>{t.preventDefault(),y(!0);try{const r=new FormData;r.append("battery_serial_number",f.battery_serial_number),r.append("battery_purchase_date",f.battery_purchase_date),r.append("battery_warranty_details",f.battery_warranty_details),te.forEach(h=>{r.append("battery_image",h)}),M.length>0&&M.forEach(h=>{r.append(`battery_image.${h}`,"")}),me?r.append("battery_bill",me):!ue&&l.battery_bill&&r.append("battery_bill",""),await j.collection("trucks").update(N,r,{$autoCancel:!1}),I.success("Battery details updated successfully"),v(!1),se()}catch(r){console.error(r),I.error("Failed to update battery details")}finally{y(!1)}},Ye=t=>{const r=t.target.files[0];r&&(ve(r),he(r.type==="application/pdf"),r.type!=="application/pdf"?ae(URL.createObjectURL(r)):ae("pdf_selected"))},Je=t=>{const r=Array.from(t.target.files);r.length>0&&ee(h=>[...h,...r])},Xe=t=>{const r=u.find(J=>J.tyre_position===t.id),h=r?.tyre_image?Array.isArray(r.tyre_image)?r.tyre_image[0]:r.tyre_image:null,H=h?j.files.getUrl(r,h,{thumb:"150x150"}):null,F=r?.current_lifecycle_kms||0,$=8e4,re=Math.min(F/$*100,100);let D=r?.status||"active",q="capitalize text-[9px] px-2 py-0.5 font-bold";return r?.status==="active"?F>=$?(D="Replace Rec.",q="capitalize text-[9px] px-2 py-0.5 font-bold text-destructive border-destructive/30 bg-destructive/10"):F>=6e4?(D="Rotation Due",q="capitalize text-[9px] px-2 py-0.5 font-bold text-amber-500 border-amber-500/30 bg-amber-500/10"):q="capitalize text-[9px] px-2 py-0.5 font-bold text-emerald-500 border-emerald-500/30 bg-emerald-500/10":r?.status==="damaged"&&(q="capitalize text-[9px] px-2 py-0.5 font-bold text-destructive border-destructive/30 bg-destructive/10"),e.jsx(X,{draggable:!!r,onDragStart:J=>Ee(J,t.id),onDragOver:J=>J.preventDefault(),onDrop:J=>$e(J,t.id),className:"overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card cursor-grab active:cursor-grabbing p-3 sm:p-3.5",children:r?e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary/40 shrink-0 overflow-hidden relative cursor-pointer group border border-border/50",onClick:()=>De(t.id),children:[H?e.jsx("img",{src:H,alt:r.tyre_brand,className:"w-full h-full object-cover"}):e.jsxs("div",{className:"w-full h-full flex flex-col items-center justify-center bg-secondary/30 text-center p-1",children:[e.jsx(Te,{className:"w-5 h-5 text-primary opacity-60"}),e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground mt-0.5",children:t.label.split(" ")[0]})]}),e.jsx("div",{className:"absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]",children:e.jsx(ke,{className:"w-4 h-4 text-white"})})]}),e.jsxs("div",{className:"flex-1 min-w-0 space-y-1",children:[e.jsxs("div",{className:"flex items-center justify-between gap-1",children:[e.jsx("span",{className:"text-[10px] font-black text-primary uppercase tracking-wider truncate",children:t.label}),e.jsx(G,{variant:"outline",className:q,children:D})]}),e.jsxs("div",{className:"flex items-baseline justify-between gap-1",children:[e.jsxs("h4",{className:"font-bold text-sm text-foreground truncate",children:[r.tyre_brand," ",e.jsxs("span",{className:"text-xs font-normal text-muted-foreground",children:["(",r.model_no||"STD",")"]})]}),e.jsxs("span",{className:"font-extrabold text-foreground text-sm font-mono shrink-0",children:[r.tyre_depth_mm,e.jsx("span",{className:"text-[10px] font-normal text-muted-foreground ml-0.5",children:"mm"})]})]}),e.jsxs("div",{className:"flex items-center justify-between text-[10px] font-mono text-muted-foreground",children:[e.jsxs("span",{className:"truncate",children:["SN: ",r.serial_number]}),e.jsxs("span",{className:"font-bold shrink-0",children:[F.toLocaleString()," KM"]})]}),e.jsx("div",{className:"w-full bg-muted rounded-full h-1.5 overflow-hidden mt-1",children:e.jsx("div",{className:`h-full rounded-full transition-all duration-500 ${F>=$?"bg-destructive":F>=6e4?"bg-amber-500":"bg-primary"}`,style:{width:`${re}%`}})})]}),e.jsxs("div",{className:"flex flex-col gap-1 shrink-0",children:[e.jsx(_,{variant:"ghost",size:"icon",onClick:()=>i({isOpen:!0,tyre:r}),className:"h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10",title:"Replace Damaged/Torn Tyre",children:e.jsx(Q,{className:"w-3.5 h-3.5"})}),e.jsx(_,{variant:"ghost",size:"icon",onClick:()=>Fe(r),className:"h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10",title:"Edit Tyre",children:e.jsx(_e,{className:"w-3.5 h-3.5"})}),e.jsx(_,{variant:"ghost",size:"icon",onClick:()=>Ie(r.id),className:"h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",title:"Delete Tyre",children:e.jsx(Z,{className:"w-3.5 h-3.5"})})]})]}):e.jsxs("div",{className:"flex items-center justify-between p-1.5 px-3 cursor-pointer hover:bg-muted/20 transition-colors group rounded-xl border border-dashed border-border/60",onClick:()=>De(t.id),children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0",children:e.jsx(Le,{className:"w-4 h-4 group-hover:scale-110 transition-transform"})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-[10px] font-bold text-primary uppercase tracking-wider",children:t.label}),e.jsx("p",{className:"text-xs font-semibold text-muted-foreground",children:"Empty Position"})]})]}),e.jsx(_,{variant:"outline",size:"sm",className:"rounded-xl text-[11px] font-bold h-7 px-2.5 pointer-events-none",children:"+ Add Tyre"})]})},t.id)};return x&&!l?e.jsx("div",{className:"p-12 flex justify-center",children:e.jsx(us,{text:"Loading tyre and fleet data..."})}):e.jsxs("div",{className:"max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 pb-36 md:pb-8",children:[e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 bg-card p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border shadow-sm",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx(_,{variant:"ghost",size:"icon",onClick:()=>C("/truck-manager"),className:"rounded-xl h-8 w-8 text-muted-foreground hover:bg-secondary/50",children:e.jsx(os,{className:"w-4 h-4"})}),e.jsxs("h1",{className:"text-lg sm:text-2xl font-heading font-bold flex items-center gap-2 tracking-tight",children:[e.jsx("div",{className:"p-1.5 bg-primary/10 rounded-xl",children:e.jsx(Te,{className:"w-4 h-4 sm:w-5 sm:h-5 text-primary"})}),"Tyre & Battery Hub"]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground font-medium",children:[e.jsx(G,{variant:"secondary",className:"px-2 py-0.5 font-bold text-foreground bg-background border",children:l?.truck_number||"Select Vehicle"}),l?.truck_name&&e.jsx("span",{className:"font-semibold text-foreground",children:l.truck_name}),e.jsx("span",{className:"opacity-40",children:"•"}),e.jsxs("span",{className:"text-emerald-500 font-bold",children:[a.length,"/7 Active"]}),g.length>0&&e.jsxs(G,{variant:"outline",className:"text-[10px] text-rose-400 border-rose-500/30 bg-rose-500/10 font-bold",children:[g.length," Replaced"]}),P>0&&e.jsxs(G,{className:"bg-rose-500/10 text-rose-500 border-rose-500/30 text-[10px]",children:[e.jsx(ie,{className:"w-3 h-3 mr-1"})," ",P," Warning"]})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2 w-full md:w-auto",children:[s.length>0&&e.jsxs("div",{className:"flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/50 flex-1 md:flex-none",children:[e.jsx(Oe,{className:"w-3.5 h-3.5 text-primary ml-1.5 shrink-0"}),e.jsxs(de,{value:l?.id||"",onValueChange:t=>C(`/tyres/${t}`),children:[e.jsx(oe,{className:"w-full md:w-56 bg-background rounded-xl font-bold h-8 border-border/60 text-xs",children:e.jsx(ce,{placeholder:"Select Vehicle..."})}),e.jsx(xe,{children:s.map(t=>e.jsxs(K,{value:t.id,className:"font-medium text-xs",children:[e.jsx("span",{className:"font-mono font-bold text-primary mr-2",children:t.truck_number}),t.truck_name?`(${t.truck_name})`:""]},t.id))})]})]}),e.jsxs(_,{size:"sm",onClick:()=>setCrossTyreModal({isOpen:!0,preselectedTyre:null}),className:"rounded-xl bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Q,{className:"w-3.5 h-3.5 text-indigo-500"})," Swap Tyre Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap Battery Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>setEquipSwapModal({isOpen:!0,itemKey:"jack"}),className:"rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold gap-1.5 h-8 px-3 shadow-sm",children:[e.jsx(as,{className:"w-3.5 h-3.5 text-cyan-500"})," Swap Tools / Kit Across Trucks"]}),e.jsxs(_,{size:"sm",onClick:()=>k({isOpen:!0,tyre:null,initialPosition:null}),className:"rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold gap-1 h-8 px-3 shadow-sm",children:[e.jsx(Le,{className:"w-3.5 h-3.5"})," Add Tyre"]})]})]}),e.jsxs(hs,{defaultValue:"visual",className:"w-full space-y-5",children:[e.jsx("div",{className:"w-full overflow-x-auto scrollbar-none pb-1",children:e.jsxs(ps,{className:"flex items-center gap-1 w-max min-w-full sm:min-w-0 bg-card p-1 rounded-2xl border border-border/60",children:[e.jsxs(be,{value:"visual",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",children:[e.jsx(Te,{className:"w-3.5 h-3.5"})," Axle Diagram"]}),e.jsxs(be,{value:"positions",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",children:[e.jsx(Oe,{className:"w-3.5 h-3.5"})," Positions (",a.length,"/7)"]}),e.jsxs(be,{value:"replacements",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-rose-600 data-[state=active]:text-white",children:[e.jsx(ie,{className:"w-3.5 h-3.5"})," Replacement History (",g.length,")"]}),e.jsxs(be,{value:"battery",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-amber-500 data-[state=active]:text-white",children:[e.jsx(Re,{className:"w-3.5 h-3.5"})," Battery ",l?.battery_serial_number?`(${l.battery_serial_number})`:""]}),e.jsxs(be,{value:"equipment",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-cyan-500 data-[state=active]:text-white",children:[e.jsx(as,{className:"w-3.5 h-3.5"})," Tool Kit & Jack"]}),e.jsxs(be,{value:"rotations",className:"rounded-xl text-xs font-bold gap-1.5 py-1.5 px-3 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",children:[e.jsx(Q,{className:"w-3.5 h-3.5"})," Rotation History (",m.length,")"]})]})}),e.jsx(ge,{value:"visual",className:"space-y-5 animate-in fade-in duration-300",children:e.jsxs(X,{className:"p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border-border/60 bg-card shadow-sm overflow-hidden",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-base sm:text-lg font-heading font-bold tracking-tight",children:"Interactive Axle Layout"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Click any node to view/add details, or drag & drop nodes to swap tyre positions."})]}),e.jsx(G,{variant:"outline",className:"text-[11px] font-mono bg-background",children:l?.truck_number})]}),e.jsx("div",{className:"w-full overflow-x-auto scrollbar-none py-2 flex justify-center",children:e.jsx("div",{className:"min-w-[340px]",children:e.jsx(fs,{tyres:a,onSlotClick:De,onDragStart:Ee,onDrop:$e})})})]})}),e.jsxs(ge,{value:"positions",className:"space-y-6 animate-in fade-in duration-300",children:[e.jsxs("div",{className:"flex justify-between items-center px-1",children:[e.jsx("h2",{className:"text-lg font-heading font-bold tracking-tight",children:"All 7 Tyre Positions"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Detailed wear bars, tread depth, and serial numbers"})]}),e.jsx("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",children:W.map(t=>Xe(t))})]}),e.jsx(ge,{value:"replacements",className:"space-y-6 animate-in fade-in duration-300",children:e.jsx(ws,{replacedTyres:g,activeTyres:a,truck:l,onViewTyreDetails:t=>A({isOpen:!0,tyre:t})})}),e.jsx(ge,{value:"battery",className:"animate-in fade-in duration-300",children:e.jsxs(X,{className:"p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-6 max-w-4xl mx-auto",children:[e.jsxs("div",{className:"flex justify-between items-center border-b border-border/50 pb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:"p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500",children:e.jsx(Re,{className:"w-6 h-6"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-bold font-heading text-foreground",children:"Battery Specification & Bill"}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Vehicle: ",l?.truck_number||"N/A"]})]})]}),e.jsx(_,{size:"sm",onClick:()=>v(!0),className:"rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold",children:"Edit Details"}),e.jsxs(_,{size:"sm",onClick:()=>setBatterySwapModal({isOpen:!0}),className:"rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold gap-1.5 ml-2",children:[e.jsx(Re,{className:"w-3.5 h-3.5 text-amber-500"})," Swap / Transfer Battery to Another Truck"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/40",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider block",children:"Serial Number"}),e.jsx("span",{className:"font-mono text-sm font-bold text-foreground truncate block",children:l?.battery_serial_number||"N/A"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider block",children:"Purchase Date"}),e.jsx("span",{className:"text-sm font-bold text-foreground block",children:l?.battery_purchase_date?new Date(l.battery_purchase_date).toLocaleDateString():"N/A"})]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5",children:"Warranty & Terms"}),e.jsx("p",{className:"text-xs text-foreground bg-muted/30 p-3.5 rounded-2xl border border-border/50 min-h-[60px] whitespace-pre-line leading-relaxed font-medium",children:l?.battery_warranty_details||"No warranty details provided."})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block",children:"Battery Snapshots"}),l?.battery_image&&(Array.isArray(l.battery_image)?l.battery_image.length>0:l.battery_image)?e.jsx("div",{className:"grid grid-cols-2 gap-2",children:(Array.isArray(l.battery_image)?l.battery_image:[l.battery_image]).map((t,r)=>e.jsxs("div",{className:"aspect-video rounded-xl overflow-hidden border border-border bg-muted/10 relative cursor-pointer group",onClick:()=>{O({id:l.id,collectionId:l.collectionId||"",collectionName:"trucks",created:l.created||new Date().toISOString(),files:Array.isArray(l.battery_image)?l.battery_image:[l.battery_image],file:t,document_type:"Battery Snapshot",document_number:l.battery_serial_number||"N/A"})},children:[e.jsx("img",{src:j.files.getUrl(l,t),alt:`Battery Snapshot ${r+1}`,className:"w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"}),e.jsx("div",{className:"absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity",children:e.jsx(ke,{className:"w-5 h-5 text-white"})})]},r))}):e.jsx("div",{className:"w-full aspect-video rounded-2xl border border-dashed border-border/60 bg-muted/10 flex items-center justify-center",children:e.jsx("span",{className:"text-xs text-muted-foreground",children:"No photos uploaded"})})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block",children:"Purchase Invoice / Bill"}),l?.battery_bill?e.jsxs("div",{className:"flex items-center gap-3 p-3 bg-muted/30 border border-border/50 rounded-2xl",children:[e.jsx("div",{className:"p-2 bg-amber-500/10 rounded-xl shrink-0 text-amber-500",children:l.battery_bill.toLowerCase().endsWith(".pdf")?e.jsx(_e,{className:"w-5 h-5"}):e.jsx(Ne,{className:"w-5 h-5"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-xs font-bold text-foreground truncate",children:l.battery_bill}),e.jsx("p",{className:"text-[10px] text-muted-foreground mt-0.5",children:l.battery_bill.toLowerCase().endsWith(".pdf")?"PDF Document":"Image"})]}),e.jsx("div",{className:"flex gap-1.5 shrink-0",children:e.jsx("a",{href:j.files.getUrl(l,l.battery_bill),target:"_blank",rel:"noreferrer",className:"p-2 rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors",title:"View / Download",children:e.jsx(ke,{className:"w-4 h-4"})})})]}):e.jsxs("div",{className:"flex items-center gap-2 p-3.5 bg-muted/20 border border-dashed border-border/50 rounded-2xl",children:[e.jsx(Ne,{className:"w-4 h-4 text-muted-foreground/50"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"No bill uploaded yet."})]})]})]})]})]})}),e.jsx(ge,{value:"equipment",className:"animate-in fade-in duration-300",children:e.jsx(FleetEquipmentTab,{truck:l,allTrucks:s,onOpenSwapModal:(k)=>setEquipSwapModal({isOpen:!0,itemKey:k}),onViewImage:(d)=>O(d),onSuccess:se})}),e.jsx(ge,{value:"rotations",className:"animate-in fade-in duration-300",children:e.jsxs(X,{className:"p-6 border-border/60 shadow-sm rounded-3xl bg-card space-y-4 max-w-4xl mx-auto",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-border/50 pb-4",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx("div",{className:"p-2.5 bg-primary/10 rounded-2xl text-primary",children:e.jsx(Q,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-bold font-heading text-foreground",children:"Tyre Rotation & Swap Logs"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Historical odometer readings and position changes"})]})]}),e.jsxs(G,{variant:"secondary",className:"font-mono text-xs",children:[m.length," Logs Saved"]})]}),e.jsx("div",{className:"space-y-3",children:m.length===0?e.jsxs("div",{className:"p-12 text-center text-muted-foreground space-y-2",children:[e.jsx(Q,{className:"w-8 h-8 mx-auto opacity-30 animate-spin-slow"}),e.jsx("p",{className:"text-sm font-semibold",children:"No rotation history logged yet."}),e.jsx("p",{className:"text-xs",children:"Drag and drop tyres on the Visual Axle Diagram to log a swap!"})]}):m.map(t=>{const r=t.expand?.tyre1_id,h=t.expand?.tyre2_id,H=W.find($=>$.id===t.to_position1),F=W.find($=>$.id===t.to_position2);return e.jsxs("div",{className:"p-4 bg-muted/20 border border-border/50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 text-muted-foreground font-semibold mb-1",children:[e.jsx(Be,{className:"w-3.5 h-3.5 text-primary"}),e.jsx("span",{children:new Date(t.swap_date).toLocaleDateString()})]}),e.jsxs("p",{className:"text-foreground leading-relaxed text-xs",children:[e.jsx("strong",{children:r?.tyre_brand||"Tyre"})," moved to ",e.jsx("strong",{children:H?.label||t.to_position1}),".",h&&e.jsxs("span",{children:[" Swapped with ",e.jsx("strong",{children:h?.tyre_brand||"Tyre"})," at ",e.jsx("strong",{children:F?.label||t.to_position2}),"."]})]})]}),e.jsxs(G,{variant:"outline",className:"font-mono text-xs bg-background shrink-0 font-bold text-primary",children:[t.swap_odometer_reading," KM"]})]},t.id)})})]})})]}),e.jsx(je,{open:U,onOpenChange:t=>!t&&!x&&v(!1),children:e.jsxs(ye,{className:"sm:max-w-[450px] rounded-3xl border-border/50 shadow-lg",children:[e.jsx(Me,{children:e.jsx(Ce,{className:"text-xl font-heading font-bold",children:"Edit Battery Details"})}),e.jsxs("form",{onSubmit:Ge,className:"space-y-4 py-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Battery Serial Number"}),e.jsx(R,{className:"rounded-xl",value:f.battery_serial_number,onChange:t=>E({...f,battery_serial_number:t.target.value}),placeholder:"Enter Serial Number"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Purchase Date"}),e.jsx(R,{type:"date",className:"rounded-xl",value:f.battery_purchase_date,onChange:t=>E({...f,battery_purchase_date:t.target.value})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Warranty Details"}),e.jsx(R,{className:"rounded-xl",value:f.battery_warranty_details,onChange:t=>E({...f,battery_warranty_details:t.target.value}),placeholder:"e.g. 24 Months replacement warranty"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(b,{children:"Upload Battery Snapshots"}),e.jsxs("div",{className:"border border-dashed border-border/50 bg-muted/10 rounded-2xl p-4 text-center relative cursor-pointer hover:bg-muted/20 transition-all flex flex-col items-center justify-center",children:[e.jsxs("div",{className:"py-2",children:[e.jsx(We,{className:"w-8 h-8 text-muted-foreground mx-auto mb-1"}),e.jsx("span",{className:"text-xs text-muted-foreground font-medium",children:"Click to select snapshots"})]}),e.jsx("input",{type:"file",accept:"image/*",multiple:!0,className:"absolute inset-0 opacity-0 cursor-pointer w-full h-full",onChange:Je})]}),n.length>0&&e.jsxs("div",{className:"space-y-1.5 mt-2",children:[e.jsx("p",{className:"text-xs font-semibold text-muted-foreground",children:"Existing Snapshots:"}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:n.map((t,r)=>e.jsxs("div",{className:"relative aspect-video rounded-xl overflow-hidden border border-border bg-card",children:[e.jsx("img",{src:j.files.getUrl(l,t),alt:"Battery Snapshot",className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",className:"absolute top-1.5 right-1.5 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/90",onClick:()=>{d(h=>h.filter(H=>H!==t)),z(h=>[...h,t])},children:e.jsx(Z,{className:"w-3.5 h-3.5"})})]},`existing-${r}`))})]}),te.length>0&&e.jsxs("div",{className:"space-y-1.5 mt-2",children:[e.jsx("p",{className:"text-xs font-semibold text-muted-foreground",children:"New Snapshots:"}),e.jsx("div",{className:"grid grid-cols-2 gap-2",children:te.map((t,r)=>e.jsxs("div",{className:"relative aspect-video rounded-xl overflow-hidden border border-primary/30 bg-primary/5",children:[e.jsx("img",{src:URL.createObjectURL(t),alt:"Battery Snapshot Preview",className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",className:"absolute top-1.5 right-1.5 bg-destructive text-white p-1 rounded-full shadow-md hover:bg-destructive/90",onClick:()=>{ee(h=>h.filter((H,F)=>F!==r))},children:e.jsx(Z,{className:"w-3.5 h-3.5"})})]},`new-${r}`))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{className:"flex items-center gap-1.5",children:[e.jsx(Ne,{className:"w-3.5 h-3.5"}),"Purchase Bill / Invoice",e.jsx("span",{className:"text-[10px] font-normal text-muted-foreground ml-1",children:"(PDF or Image, max 10 MB)"})]}),e.jsxs("div",{className:"border border-border/50 bg-muted/10 rounded-2xl p-4 relative cursor-pointer hover:bg-muted/20 transition-all",children:[ue&&ue!=="pdf_selected"?e.jsxs("div",{className:"relative w-full aspect-video rounded-xl overflow-hidden",children:[e.jsx("img",{src:ue,alt:"Bill Preview",className:"w-full h-full object-cover"}),e.jsx("button",{type:"button",className:"absolute top-2 right-2 bg-destructive text-white p-1 rounded-full shadow-md",onClick:t=>{t.preventDefault(),ve(null),ae(null),he(!1)},children:e.jsx(Z,{className:"w-4 h-4"})})]}):ue==="pdf_selected"?e.jsxs("div",{className:"flex items-center justify-between px-3 py-2 bg-primary/8 border border-primary/20 rounded-xl",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(_e,{className:"w-5 h-5 text-primary"}),e.jsx("span",{className:"text-xs font-semibold text-foreground truncate max-w-[200px]",children:me?.name||"PDF selected"})]}),e.jsx("button",{type:"button",className:"text-destructive hover:bg-destructive/10 rounded-full p-1 shrink-0",onClick:t=>{t.preventDefault(),ve(null),ae(null),he(!1)},children:e.jsx(Z,{className:"w-4 h-4"})})]}):e.jsxs("div",{className:"flex flex-col items-center justify-center py-4 gap-2",children:[e.jsx(Ne,{className:"w-8 h-8 text-muted-foreground/40"}),e.jsxs("span",{className:"text-xs text-muted-foreground text-center",children:["Click to upload bill",e.jsx("br",{}),e.jsx("span",{className:"text-[10px]",children:"JPG, PNG, WebP or PDF"})]})]}),e.jsx("input",{type:"file",accept:"image/jpeg,image/png,image/webp,application/pdf",className:"absolute inset-0 opacity-0 cursor-pointer w-full h-full",onChange:Ye})]})]}),e.jsxs(Se,{className:"pt-4",children:[e.jsx(_,{type:"button",variant:"ghost",onClick:()=>v(!1),disabled:x,className:"rounded-xl",children:"Cancel"}),e.jsx(_,{type:"submit",disabled:x,className:"rounded-xl shadow-sm",children:"Save Changes"})]})]})]})}),e.jsx(je,{open:Y.isOpen,onOpenChange:t=>!t&&!x&&pe({...Y,isOpen:!1}),children:e.jsxs(ye,{className:"sm:max-w-[400px] rounded-3xl border-border/50 shadow-lg",children:[e.jsx(Me,{children:e.jsxs(Ce,{className:"text-xl font-heading font-bold flex items-center gap-2",children:[e.jsx(Q,{className:"w-5 h-5 text-primary animate-spin"})," Swap Tyre Position"]})}),e.jsxs("form",{onSubmit:qe,className:"space-y-4 py-2",children:[e.jsxs("div",{className:"p-3 bg-muted/40 rounded-xl border border-border/50 text-xs text-foreground space-y-1",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Source Position:"})," ",W.find(t=>t.id===Y.sourcePosition)?.label]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Target Position:"})," ",W.find(t=>t.id===Y.targetPosition)?.label]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(b,{className:"text-sm font-semibold",children:["Current Odometer Reading (KM) ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(R,{type:"number",required:!0,min:"0",className:"rounded-xl",value:Y.odometerReading,onChange:t=>pe({...Y,odometerReading:t.target.value}),placeholder:"Enter current KM reading"})]}),e.jsxs(Se,{className:"pt-4",children:[e.jsx(_,{type:"button",variant:"ghost",onClick:()=>pe({...Y,isOpen:!1}),disabled:x,className:"rounded-xl",children:"Cancel"}),e.jsx(_,{type:"submit",disabled:x,className:"rounded-xl shadow-sm",children:"Confirm Swap"})]})]})]})}),e.jsx(gs,{isOpen:w.isOpen,onClose:()=>k({isOpen:!1,tyre:null,initialPosition:null}),tyre:w.tyre,truck:l,initialPosition:w.initialPosition,onSuccess:se}),e.jsx(js,{isOpen:L.isOpen,onClose:()=>A({isOpen:!1,tyre:null}),tyre:L.tyre,onEdit:Fe,onDelete:Ie,onReplace:t=>i({isOpen:!0,tyre:t}),onSuccess:se}),e.jsx(Ns,{isOpen:o.isOpen,onClose:()=>i({isOpen:!1,tyre:null}),oldTyre:o.tyre,truck:l,onSuccess:se}),e.jsx(bs,{isOpen:!!B,onClose:()=>O(null),document:B,collectionName:"trucks"}),e.jsx(CrossTruckTyreSwapModal,{isOpen:crossTyreModal.isOpen,onClose:()=>setCrossTyreModal({isOpen:!1,preselectedTyre:null}),allTrucks:s,currentTruck:l,currentTyres:u,preselectedTyre:crossTyreModal.preselectedTyre,onSuccess:se}),e.jsx(CrossTruckBatterySwapModal,{isOpen:batterySwapModal.isOpen,onClose:()=>setBatterySwapModal({isOpen:!1}),allTrucks:s,currentTruck:l,onSuccess:se}),e.jsx(CrossTruckEquipmentSwapModal,{isOpen:equipSwapModal.isOpen,onClose:()=>setEquipSwapModal({isOpen:!1,itemKey:"jack"}),allTrucks:s,currentTruck:l,initialItemKey:equipSwapModal.itemKey,onSuccess:se})]})}
export{Ts as default};
