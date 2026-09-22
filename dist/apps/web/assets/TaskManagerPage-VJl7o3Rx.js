import{r as l,j as e,bs as be,aM as $,ag as fe,al as je,af as ye,ap as Ne,az as ve,at as we,av as Se,bU as _e,n as ke,a7 as Te,ds as T,aT as Ce,ar as De,c3 as c3,a$ as a$,a1 as a1,aq as aq,a2 as a2,b2 as b2,ao as ao,a6 as a6}from"./vendor-react-Bs5V2qFE.js";import{u as Me,k as b,B as f,n as Ie,s as Ae,v as X,x as Y,C as w,O as S,I as A,S as u,e as p,g as h,h as g,i as o,w as V,X as _,D as Oe,a as Pe,b as Ee,c as Re,L as j,T as Le,j as $e,p as k,t as H}from"./index-DLxf9dwO.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";

const Z=["Dispatch & Trips","Maintenance & Workshop","Billing & Accounts","RTO & FASTag Compliance","Customer Support & Quotes","Driver Management","General Operations"];
const O=[{id:"Critical",label:"🔥 Critical / Urgent",badge:"bg-red-500/20 text-red-400 border-red-500/30"},{id:"High",label:"⚡ High Priority",badge:"bg-amber-500/20 text-amber-400 border-amber-500/30"},{id:"Medium",label:"🔷 Medium Priority",badge:"bg-blue-500/20 text-blue-400 border-blue-500/30"},{id:"Low",label:"☕ Low Priority",badge:"bg-slate-500/20 text-slate-300 border-slate-500/30"}];
const ee=[{id:"To Do",label:"To Do",badge:"bg-slate-800 text-slate-300 border-slate-700"},{id:"In Progress",label:"In Progress",badge:"bg-blue-500/20 text-blue-400 border-blue-500/30"},{id:"In Review",label:"In Review",badge:"bg-amber-500/20 text-amber-400 border-amber-500/30"},{id:"Completed",label:"Completed ✓",badge:"bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}];
const se=[
  {id:"general-ops",name:"general-ops",desc:"Company-wide fleet operations & updates",icon:T,badge:"All Ops"},
  {id:"dispatch-alerts",name:"dispatch-alerts",desc:"Live trip assignment & route status",icon:a6||T,badge:"Trips"},
  {id:"workshop-maint",name:"workshop-maint",desc:"Tyres, repairs & breakdown reports",icon:T,badge:"Garage"},
  {id:"finance-billing",name:"finance-billing",desc:"POD collection, advance & billing",icon:T,badge:"Accounts"},
  {id:"urgent-alerts",name:"urgent-alerts",desc:"🚨 Critical roadside & safety notices",icon:Ce,badge:"Emergency"}
];

const QUICK_ACTIONS=[
  "🚛 Trip Dispatched & en route",
  "📞 Driver Contacted & verified",
  "🔧 Workshop Alerted for repairs",
  "📄 Original POD Collected",
  "💳 Advance Fuel Processed",
  "🚨 Roadside Assistance Required"
];

function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function Ke({initialTab:ae="tasks"}){
  const{currentUser:y}=Me();
  const[te,re]=l.useState(ae);
  const[x,F]=l.useState([]);
  const[Ve,U]=l.useState(!0);
  const[P,ne]=l.useState("");
  const[C,le]=l.useState("all");
  const[D,ie]=l.useState("all");
  const[M,oe]=l.useState("all");
  const[N,de]=l.useState([]);
  const[ce,I]=l.useState(!1);
  const[d,B]=l.useState(null);
  const[n,m]=l.useState({title:"",description:"",assigned_to_name:"",assigned_to_phone:"",priority:"High",category:"Dispatch & Trips",status:"To Do",due_date:b(new Date,"yyyy-MM-dd")});

  // Chat State
  const[c,xe]=l.useState("general-ops");
  const[E,R]=l.useState([]);
  const[L,J]=l.useState("");
  const[G,K]=l.useState("normal");
  const[searchQuery,setSearchQuery]=l.useState("");
  const[isSearching,setIsSearching]=l.useState(!1);
  const[soundEnabled,setSoundEnabled]=l.useState(!0);
  const[isScrolledUp,setIsScrolledUp]=l.useState(!1);
  const[unreadCount,setUnreadCount]=l.useState(0);

  const chatScrollRef=l.useRef(null);
  const prevMessagesRawRef=l.useRef("");
  const isInitialLoadRef=l.useRef(!0);
  const isScrolledUpRef=l.useRef(!1);
  isScrolledUpRef.current=isScrolledUp;

  // Safe inner container scroll
  const scrollToBottom=l.useCallback((smooth=!0)=>{
    if(!chatScrollRef.current)return;
    const el=chatScrollRef.current;
    if(smooth){
      try{
        el.scrollTo({top:el.scrollHeight,behavior:"smooth"});
      }catch{
        el.scrollTop=el.scrollHeight;
      }
    }else{
      el.scrollTop=el.scrollHeight;
    }
    setIsScrolledUp(!1);
    setUnreadCount(0);
  },[]);

  // Scroll event handler on the message container
  const handleMessageFeedScroll=l.useCallback(()=>{
    if(!chatScrollRef.current)return;
    const{scrollTop,scrollHeight,clientHeight}=chatScrollRef.current;
    const distanceFromBottom=scrollHeight-scrollTop-clientHeight;
    const scrolledUp=distanceFromBottom>80;
    setIsScrolledUp(scrolledUp);
    if(!scrolledUp){
      setUnreadCount(0);
    }
  },[]);

  // Users fetch
  l.useEffect(()=>{(async()=>{let a=[];try{a=await k.collection("users").getFullList({sort:"name",$autoCancel:!1})}catch{}(!a||a.length===0)&&(a=[{id:"u1",name:"Vinod Kumar Rathod",email:"vinod@jaibhavanicargo.com",phone:"7794072244",role:"Super Admin"},{id:"u2",name:"Ravi Kumar",email:"ravi.dispatch@jaibhavanicargo.com",phone:"9848012345",role:"Dispatcher"},{id:"u3",name:"Suresh Patil",email:"suresh.maint@jaibhavanicargo.com",phone:"9848054321",role:"Maintenance Supervisor"},{id:"u4",name:"Anil Sharma",email:"anil.accounts@jaibhavanicargo.com",phone:"9848098765",role:"Accounts Executive"},{id:"u5",name:"Ramesh Yadav",email:"ramesh.driver@jaibhavanicargo.com",phone:"9123456789",role:"Senior Driver"}]);de(a)})()},[]);

  // Tasks fetch
  const z=async()=>{U(!0);try{let s=[];try{s=await k.collection("todos").getFullList({sort:"-created",$autoCancel:!1})}catch{}let a=[];try{a=JSON.parse(localStorage.getItem("jbc_staff_tasks")||"[]")}catch{}const t=new Map;if((s||[]).forEach(r=>t.set(r.id,{id:r.id,title:r.title,description:r.description||"",assigned_to_name:r.assigned_to_name||r.assigned_to||"General Team",assigned_to_phone:r.assigned_to_phone||"",priority:r.priority||"Medium",category:r.category||"General Operations",status:r.status==="Completed"||r.completed?"Completed":r.status||"To Do",due_date:r.due_date?r.due_date.split("T")[0]:b(new Date,"yyyy-MM-dd"),created:r.created||new Date().toISOString()})),(a||[]).forEach(r=>{t.has(r.id)||t.set(r.id,r)}),t.size===0){const r=[{id:"task_01",title:"Verify Fastag recharge for 5 North-bound container trucks",description:"Ensure min ₹5,000 balance per vehicle before crossing toll plazas.",assigned_to_name:"Ravi Kumar",assigned_to_phone:"9848012345",priority:"High",category:"RTO & FASTag Compliance",status:"To Do",due_date:b(new Date,"yyyy-MM-dd"),created:new Date().toISOString()},{id:"task_02",title:"Arrange emergency tyre replacement for Truck MH12-AB-1234",description:"Coordinate with Nagpur Tyre Shop for 295/80R22.5 tubeless radial tyre.",assigned_to_name:"Suresh Patil",assigned_to_phone:"9848054321",priority:"Critical",category:"Maintenance & Workshop",status:"In Progress",due_date:b(new Date,"yyyy-MM-dd"),created:new Date().toISOString()},{id:"task_03",title:"Collect original signed POD from Reliance Bhiwandi Hub",description:"Invoice ₹4,20,000 pending submission upon POD upload.",assigned_to_name:"Anil Sharma",assigned_to_phone:"9848098765",priority:"High",category:"Billing & Accounts",status:"In Review",due_date:b(new Date,"yyyy-MM-dd"),created:new Date().toISOString()}];r.forEach(i=>t.set(i.id,i)),localStorage.setItem("jbc_staff_tasks",JSON.stringify(r))}F(Array.from(t.values()))}catch(s){console.error(s)}finally{U(!1)}};
  l.useEffect(()=>{z()},[]);

  // Load chat messages safely without triggering scroll jump or unnecessary re-renders
  const loadChat=l.useCallback(()=>{
    try{
      const raw=localStorage.getItem("jbc_chat_"+c);
      if(raw===prevMessagesRawRef.current)return;
      prevMessagesRawRef.current=raw||"";

      let list=[];
      if(!raw||raw==="[]"){
        list=[{
          id:"msg_init_"+c,
          sender_name:"Operations Bot",
          sender_role:"Fleet Dispatch AI",
          channel:c,
          text:"👋 Welcome to #"+c+". Use this channel for live coordination, route alerts, breakdown notices, and dispatch updates.",
          priority:"announcement",
          timestamp:new Date().toISOString(),
          reactions:{}
        }];
        localStorage.setItem("jbc_chat_"+c,JSON.stringify(list));
        prevMessagesRawRef.current=JSON.stringify(list);
      }else{
        list=JSON.parse(raw);
      }

      R(list);

      // Handle scrolling on new messages
      if(isInitialLoadRef.current){
        isInitialLoadRef.current=!1;
        setTimeout(()=>scrollToBottom(!1),40);
      }else if(!isScrolledUpRef.current){
        setTimeout(()=>scrollToBottom(!0),40);
      }else{
        setUnreadCount(prev=>prev+1);
      }
    }catch(err){console.error("Chat load error:",err)}
  },[c,scrollToBottom]);

  // Channel switch & real-time sync listeners
  l.useEffect(()=>{
    prevMessagesRawRef.current="";
    isInitialLoadRef.current=!0;
    setUnreadCount(0);
    setIsScrolledUp(!1);
    setSearchQuery("");
    setIsSearching(!1);
    loadChat();

    const interval=setInterval(loadChat,2000);

    const onStorageChange=(e)=>{
      if(e.key==="jbc_chat_"+c){
        loadChat();
      }
    };
    window.addEventListener("storage",onStorageChange);

    let bc=null;
    try{
      bc=new BroadcastChannel("jbc_ops_chat_sync");
      bc.onmessage=(ev)=>{
        if(ev.data?.channel===c){
          loadChat();
          if(ev.data?.priority==="urgent"&&soundEnabled){
            playNotificationChime();
          }
        }
      };
    }catch(e){}

    return()=>{
      clearInterval(interval);
      window.removeEventListener("storage",onStorageChange);
      if(bc)bc.close();
    };
  },[c,loadChat,soundEnabled]);

  // Send message
  const pe=(s,customText=null)=>{
    if(s&&s.preventDefault)s.preventDefault();
    const textToSend=(customText!==null?customText:L).trim();
    if(!textToSend)return;

    const newMsg={
      id:"msg_"+Date.now()+"_"+Math.random().toString(36).substr(2,4),
      sender_name:y?.name||y?.full_name||"Operations Staff",
      sender_role:y?.role||"Dispatcher",
      channel:c,
      text:textToSend,
      priority:G,
      timestamp:new Date().toISOString(),
      reactions:{}
    };

    const currentList=JSON.parse(localStorage.getItem("jbc_chat_"+c)||"[]");
    const updated=[...currentList,newMsg];
    localStorage.setItem("jbc_chat_"+c,JSON.stringify(updated));
    prevMessagesRawRef.current=JSON.stringify(updated);
    R(updated);
    if(customText===null)J("");
    K("normal");

    // Instant local scroll
    setTimeout(()=>scrollToBottom(!0),30);

    // Broadcast to other tabs
    try{
      const bc=new BroadcastChannel("jbc_ops_chat_sync");
      bc.postMessage({channel:c,priority:G,type:"NEW_MESSAGE"});
      bc.close();
    }catch(e){}

    if(G==="urgent"&&soundEnabled){
      playNotificationChime();
    }
  };

  // Add reaction to message
  const toggleReaction=(msgId,emoji)=>{
    const updated=E.map(item=>{
      if(item.id!==msgId)return item;
      const reactions={...(item.reactions||{})};
      reactions[emoji]=(reactions[emoji]||0)+1;
      return{...item,reactions};
    });
    R(updated);
    localStorage.setItem("jbc_chat_"+c,JSON.stringify(updated));
    prevMessagesRawRef.current=JSON.stringify(updated);
  };

  // Copy message text
  const copyMessageText=(txt)=>{
    navigator.clipboard?.writeText(txt);
    H.success("Message copied to clipboard!");
  };

  // WhatsApp share
  const shareToWhatsApp=(msg)=>{
    const text=`🚨 *JAI BHAVANI CARGO - OPERATIONS ALERT* [#${c.toUpperCase()}]\n\n${msg.text}\n\n*Sender:* ${msg.sender_name} (${msg.sender_role})\n*Time:* ${b(new Date(msg.timestamp),"dd MMM, hh:mm a")}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
  };

  // Export chat transcript
  const exportChatHistory=()=>{
    const lines=E.map(m=>`[${b(new Date(m.timestamp),"yyyy-MM-dd HH:mm:ss")}] [${m.priority.toUpperCase()}] ${m.sender_name} (${m.sender_role}): ${m.text}`);
    const blob=new Blob([lines.join("\n\n")],{type:"text/plain"});
    const url=URL.createObjectURL(blob);
    const link=document.createElement("a");
    link.href=url;
    link.download=`jbc_chat_${c}_${b(new Date,"yyyyMMdd_HHmm")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    H.success("Chat log exported successfully!");
  };

  // Clear chat
  const clearChannel=()=>{
    if(confirm(`Are you sure you want to clear history in #${c}?`)){
      const fresh=[{
        id:"msg_init_"+c,
        sender_name:"Operations Bot",
        sender_role:"Fleet Dispatch AI",
        channel:c,
        text:"History cleared. Channel ready for new updates.",
        priority:"announcement",
        timestamp:new Date().toISOString(),
        reactions:{}
      }];
      localStorage.setItem("jbc_chat_"+c,JSON.stringify(fresh));
      prevMessagesRawRef.current=JSON.stringify(fresh);
      R(fresh);
      H.success("Channel history cleared");
    }
  };

  // Tasks handlers
  const me=async s=>{if(s.preventDefault(),!n.title.trim())return H.error("Task title is required");const a={id:d?d.id:`task_${Date.now()}`,title:n.title.trim(),description:n.description.trim(),assigned_to_name:n.assigned_to_name||"General Team",assigned_to_phone:n.assigned_to_phone||"",priority:n.priority,category:n.category,status:n.status,due_date:n.due_date,created:d?d.created:new Date().toISOString()},t=JSON.parse(localStorage.getItem("jbc_staff_tasks")||"[]"),r=d?t.map(i=>i.id===d.id?a:i):[a,...t];localStorage.setItem("jbc_staff_tasks",JSON.stringify(r));try{d&&!d.id.startsWith("task_")?await k.collection("todos").update(d.id,{title:a.title,description:a.description,priority:a.priority,category:a.category,status:a.status,due_date:a.due_date},{$autoCancel:!1}):d||await k.collection("todos").create({title:a.title,description:a.description,priority:a.priority,category:a.category,status:a.status,user_id:y?.id,created_by:y?.id},{$autoCancel:!1}).catch(()=>{})}catch{}I(!1),B(null),H.success(d?"Task updated":"New task assigned successfully"),z()};
  const Q=(s,a)=>{const t=x.map(r=>r.id===s?{...r,status:a}:r);F(t),localStorage.setItem("jbc_staff_tasks",JSON.stringify(t)),H.success(`Task marked as "${a}"`),s.startsWith("task_")||k.collection("todos").update(s,{status:a},{$autoCancel:!1}).catch(()=>{})};
  const ue=s=>{const a=(s.assigned_to_phone||"").replace(/\D/g,""),t=`📌 *JAI BHAVANI CARGO - TASK ASSIGNMENT*\n\n📋 *Task:* ${s.title}\n📂 *Category:* ${s.category}\n⚠️ *Priority:* ${s.priority}\n📅 *Due Date:* ${s.due_date}\n\n📝 *Instructions:* ${s.description||"Please complete and update status."}\n\nPlease reply with *DONE* when finished.`;let r=`https://wa.me/?text=${encodeURIComponent(t)}`;a&&(a.length===10||a.length===12)&&(r=`https://wa.me/${a.length===10?`91${a}`:a}?text=${encodeURIComponent(t)}`),window.open(r,"_blank")};

  const he=l.useMemo(()=>x.filter(s=>{const a=P.toLowerCase(),t=!a||s.title.toLowerCase().includes(a)||s.description.toLowerCase().includes(a)||s.assigned_to_name.toLowerCase().includes(a),r=C==="all"||s.assigned_to_name===C,i=D==="all"||s.priority===D,ge=M==="all"||s.category===M;return t&&r&&i&&ge}),[x,P,C,D,M]);
  const v=l.useMemo(()=>{const s=x.length,a=x.filter(i=>i.status==="To Do").length,t=x.filter(i=>i.status==="In Progress").length,r=x.filter(i=>i.status==="Completed").length;return{total:s,todo:a,inProgress:t,completed:r}},[x]);

  // Filter messages by search query
  const filteredMessages=l.useMemo(()=>{
    if(!searchQuery.trim())return E;
    const q=searchQuery.toLowerCase();
    return E.filter(m=>m.text.toLowerCase().includes(q)||m.sender_name.toLowerCase().includes(q)||m.sender_role.toLowerCase().includes(q));
  },[E,searchQuery]);

  const activeChannelObj=se.find(s=>s.id===c)||se[0];

  return e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300",children:[
    e.jsx(be,{children:e.jsx("title",{children:"Staff Tasks & Operations Team Chat | Jai Bhavani Cargo"})}),
    
    // Page Header
    e.jsxs("div",{className:"flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40",children:[
      e.jsxs("div",{children:[
        e.jsxs("h1",{className:"text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 text-slate-100",children:[
          e.jsx("div",{className:"p-2 rounded-xl bg-primary/10 text-primary border border-primary/20",children:e.jsx($,{className:"w-7 h-7"})}),
          "Operations & Logistics Team Hub"
        ]}),
        e.jsx("p",{className:"text-muted-foreground text-xs sm:text-sm mt-1",children:"Coordinate live fleet movements, driver breakdown alerts, workshop repairs, and assign staff operations tasks."})
      ]}),
      e.jsx("div",{className:"flex items-center gap-3",children:
        e.jsxs(f,{onClick:()=>{B(null),m({title:"",description:"",assigned_to_name:N[0]?.name||"",assigned_to_phone:N[0]?.phone||"",priority:"High",category:"Dispatch & Trips",status:"To Do",due_date:b(new Date,"yyyy-MM-dd")}),I(!0)},className:"rounded-xl font-bold text-xs gap-2 shadow-md shadow-primary/20 h-10 px-4",children:[
          e.jsx(fe,{className:"w-4 h-4"})," Create & Assign Task"
        ]})
      })
    ]}),

    // Tabs Selector
    e.jsxs(Ie,{value:te,onValueChange:re,className:"w-full space-y-6",children:[
      e.jsxs(Ae,{className:"bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto inline-flex h-12 shadow-inner",children:[
        e.jsxs(X,{value:"tasks",className:"flex-1 sm:px-6 flex items-center justify-center gap-2 rounded-xl font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all",children:[
          e.jsx($,{className:"w-4 h-4"}),
          "Task Management (",v.todo+v.inProgress,")"
        ]}),
        e.jsxs(X,{value:"chat",className:"flex-1 sm:px-6 flex items-center justify-center gap-2 rounded-xl font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all",children:[
          e.jsx(je,{className:"w-4 h-4"}),
          "Operations Team Chat",
          e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 animate-pulse"})
        ]})
      ]}),

      // TAB: TASKS
      e.jsxs(Y,{value:"tasks",className:"space-y-6 m-0 outline-none",children:[
        e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-4",children:[
          e.jsx(w,{className:"bg-card/70 border-border shadow-sm",children:e.jsxs(S,{className:"p-4 flex items-center justify-between",children:[
            e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-muted-foreground font-bold uppercase",children:"Total Tasks"}),e.jsx("p",{className:"text-2xl font-black mt-0.5 text-foreground",children:v.total})]}),
            e.jsx("div",{className:"w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary",children:e.jsx($,{className:"w-5 h-5"})})
          ]})}),
          e.jsx(w,{className:"bg-card/70 border-slate-700 bg-slate-800/30 shadow-sm",children:e.jsxs(S,{className:"p-4 flex items-center justify-between",children:[
            e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-slate-300 font-bold uppercase",children:"To Do / Pending"}),e.jsx("p",{className:"text-2xl font-black text-slate-200 mt-0.5",children:v.todo})]}),
            e.jsx("div",{className:"w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-300",children:e.jsx(ye,{className:"w-5 h-5"})})
          ]})}),
          e.jsx(w,{className:"bg-card/70 border-blue-500/30 bg-blue-500/5 shadow-sm",children:e.jsxs(S,{className:"p-4 flex items-center justify-between",children:[
            e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-blue-400 font-bold uppercase",children:"In Progress"}),e.jsx("p",{className:"text-2xl font-black text-blue-400 mt-0.5",children:v.inProgress})]}),
            e.jsx("div",{className:"w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400",children:e.jsx(Ne,{className:"w-5 h-5"})})
          ]})}),
          e.jsx(w,{className:"bg-card/70 border-emerald-500/30 bg-emerald-500/5 shadow-sm",children:e.jsxs(S,{className:"p-4 flex items-center justify-between",children:[
            e.jsxs("div",{children:[e.jsx("p",{className:"text-xs text-emerald-400 font-bold uppercase",children:"Completed"}),e.jsx("p",{className:"text-2xl font-black text-emerald-400 mt-0.5",children:v.completed})]}),
            e.jsx("div",{className:"w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400",children:e.jsx(ve,{className:"w-5 h-5"})})
          ]})})
        ]}),

        e.jsxs("div",{className:"flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/60 p-4 rounded-2xl border border-border shadow-sm",children:[
          e.jsxs("div",{className:"relative w-full sm:w-72",children:[
            e.jsx(we,{className:"absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"}),
            e.jsx(A,{placeholder:"Search tasks, staff, descriptions...",value:P,onChange:s=>ne(s.target.value),className:"pl-9 bg-background text-xs h-9 rounded-xl"})
          ]}),
          e.jsxs("div",{className:"flex items-center gap-2.5 flex-wrap w-full sm:w-auto",children:[
            e.jsxs(u,{value:C,onValueChange:le,children:[
              e.jsx(p,{className:"w-[150px] bg-background text-xs h-9 rounded-xl",children:e.jsx(h,{placeholder:"Assigned Staff"})}),
              e.jsxs(g,{children:[e.jsx(o,{value:"all",children:"All Staff Members"}),N.map(s=>e.jsx(o,{value:s.name,children:s.name},s.id))]})
            ]}),
            e.jsxs(u,{value:D,onValueChange:ie,children:[
              e.jsx(p,{className:"w-[140px] bg-background text-xs h-9 rounded-xl",children:e.jsx(h,{placeholder:"Priority"})}),
              e.jsxs(g,{children:[e.jsx(o,{value:"all",children:"All Priorities"}),O.map(s=>e.jsx(o,{value:s.id,children:s.label},s.id))]})
            ]}),
            e.jsxs(u,{value:M,onValueChange:oe,children:[
              e.jsx(p,{className:"w-[160px] bg-background text-xs h-9 rounded-xl",children:e.jsx(h,{placeholder:"Category"})}),
              e.jsxs(g,{children:[e.jsx(o,{value:"all",children:"All Categories"}),Z.map(s=>e.jsx(o,{value:s,children:s},s))]})
            ]})
          ]})
        ]}),

        e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-5",children:ee.map(s=>{
          const a=he.filter(t=>t.status===s.id);
          return e.jsxs("div",{className:"bg-muted/20 border border-border/80 rounded-2xl p-4 space-y-3",children:[
            e.jsxs("div",{className:"flex items-center justify-between pb-2 border-b border-border/50",children:[
              e.jsxs("span",{className:"font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-2",children:[
                e.jsx("span",{className:"w-2 h-2 rounded-full bg-primary"}),s.label
              ]}),
              e.jsx(V,{variant:"outline",className:"text-xs font-bold px-2 py-0.5 bg-background",children:a.length})
            ]}),
            e.jsx("div",{className:"space-y-3 min-h-[300px]",children:a.length===0?e.jsxs("div",{className:"text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-xl",children:["No tasks in ",s.label]}):a.map(t=>{
              const r=O.find(i=>i.id===t.priority)||O[2];
              return e.jsx(w,{className:"bg-card border-border hover:border-primary/50 shadow-sm transition-all duration-200",children:e.jsxs(S,{className:"p-4 space-y-3",children:[
                e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[
                  e.jsx(V,{variant:"outline",className:_("text-[10px] font-bold px-2 py-0.5",r.badge),children:r.label}),
                  e.jsx("span",{className:"text-[10px] text-muted-foreground font-mono",children:t.due_date})
                ]}),
                e.jsxs("div",{children:[
                  e.jsx("h4",{className:"font-bold text-xs text-foreground leading-snug",children:t.title}),
                  t.description&&e.jsx("p",{className:"text-[11px] text-muted-foreground mt-1 line-clamp-2",children:t.description})
                ]}),
                e.jsxs("div",{className:"pt-2 border-t border-border/40 flex items-center justify-between text-xs",children:[
                  e.jsxs("div",{className:"flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]",children:[
                    e.jsx(Se,{className:"w-3.5 h-3.5 text-primary"}),
                    e.jsx("span",{className:"truncate max-w-[110px]",children:t.assigned_to_name})
                  ]}),
                  e.jsxs("div",{className:"flex items-center gap-1",children:[
                    e.jsx(f,{size:"sm",variant:"outline",onClick:()=>ue(t),className:"h-6 px-1.5 text-[10px] rounded-lg border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",title:"Send task to WhatsApp",children:e.jsx(_e,{className:"w-3 h-3"})}),
                    t.status!=="Completed"?e.jsxs(f,{size:"sm",onClick:()=>Q(t.id,"Completed"),className:"h-6 px-2 text-[10px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold",children:[e.jsx(ke,{className:"w-3 h-3 mr-0.5"})," Done"]}):e.jsx(f,{size:"sm",variant:"ghost",onClick:()=>Q(t.id,"In Progress"),className:"h-6 px-2 text-[10px] text-muted-foreground",children:"Reopen"})
                  ]})
                ]})
              ]})},t.id)})
            })
          ]},s.id)})
        })
      ]}),

      // TAB: OPERATIONS TEAM CHAT (WORLD-CLASS PRODUCTION GRADE)
      e.jsx(Y,{value:"chat",className:"m-0 outline-none",children:
        e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-12 bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md h-[680px]",children:[
          
          // LEFT COLUMN: Channels & Online Staff (3 cols)
          e.jsxs("div",{className:"lg:col-span-4 xl:col-span-3 bg-slate-900/60 border-r border-slate-800 flex flex-col h-full overflow-hidden",children:[
            
            // Channels Header
            e.jsxs("div",{className:"p-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between",children:[
              e.jsxs("div",{className:"flex items-center gap-2",children:[
                e.jsx("div",{className:"w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"}),
                e.jsx("h3",{className:"text-xs font-black uppercase tracking-wider text-slate-300",children:"Ops Channels"})
              ]}),
              e.jsx(V,{variant:"outline",className:"text-[10px] font-bold border-slate-700 text-slate-400",children:"5 Live"})
            ]}),

            // Channels List
            e.jsx("div",{className:"flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin",children:
              se.map(s=>{
                const IconComp=s.icon||T;
                const isSelected=c===s.id;
                const isUrgent=s.id==="urgent-alerts";
                return e.jsxs("button",{
                  key:s.id,
                  onClick:()=>xe(s.id),
                  className:_("w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-left transition-all duration-200 group border",
                    isSelected
                      ? isUrgent
                        ? "bg-red-500/20 border-red-500/40 text-red-100 shadow-md shadow-red-950/50"
                        : "bg-primary text-primary-foreground border-primary/50 shadow-md shadow-primary/20"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  ),
                  children:[
                    e.jsx("div",{className:_("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all",
                      isSelected
                        ? isUrgent ? "bg-red-500/30 text-red-200" : "bg-primary-foreground/20 text-white"
                        : "bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                    ),children:e.jsx(IconComp,{className:"w-4 h-4"})}),
                    e.jsxs("div",{className:"flex-1 min-w-0",children:[
                      e.jsxs("div",{className:"flex items-center justify-between",children:[
                        e.jsxs("p",{className:"font-bold text-xs truncate",children:["#",s.name]}),
                        e.jsx("span",{className:_("text-[9px] px-1.5 py-0.2 rounded font-semibold",
                          isSelected
                            ? isUrgent ? "bg-red-500/40 text-white" : "bg-primary-foreground/20 text-white"
                            : "bg-slate-800 text-slate-400"
                        ),children:s.badge})
                      ]}),
                      e.jsx("p",{className:_("text-[10px] truncate mt-0.5",isSelected?"opacity-80":"text-slate-500"),children:s.desc})
                    ]})
                  ]
                });
              })
            }),

            // Online Staff Members
            e.jsxs("div",{className:"p-3 border-t border-slate-800/80 bg-slate-900/90",children:[
              e.jsxs("div",{className:"flex items-center justify-between mb-2 px-1",children:[
                e.jsx("span",{className:"text-[11px] font-bold text-slate-400 uppercase tracking-wider",children:"Team Online"}),
                e.jsx("span",{className:"text-[10px] text-emerald-400 font-bold",children:`${N.length} active`})
              ]}),
              e.jsx("div",{className:"space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin pr-1",children:
                N.map(s=>e.jsxs("div",{key:s.id,className:"flex items-center justify-between py-1 px-2 rounded-xl bg-slate-800/40 border border-slate-800/60 text-xs",children:[
                  e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[
                    e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-sm shadow-emerald-400/50"}),
                    e.jsx("span",{className:"font-semibold text-slate-200 text-[11px] truncate",children:s.name})
                  ]}),
                  e.jsx("span",{className:"text-[9px] text-slate-400 font-mono shrink-0 ml-1 px-1 rounded bg-slate-800",children:s.role||"Staff"})
                ]}))
              })
            ]})
          ]}),

          // RIGHT COLUMN: Active Chat Feed & Interactive Input (8-9 cols)
          e.jsxs("div",{className:"lg:col-span-8 xl:col-span-9 flex flex-col h-full bg-slate-950/40 relative overflow-hidden",children:[
            
            // CHAT HEADER (Pinned Top)
            e.jsxs("div",{className:"px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between shrink-0 z-10",children:[
              e.jsxs("div",{className:"flex items-center gap-3 min-w-0",children:[
                e.jsx("div",{className:"w-9 h-9 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0",children:e.jsx(T,{className:"w-4 h-4"})}),
                e.jsxs("div",{className:"min-w-0",children:[
                  e.jsxs("div",{className:"flex items-center gap-2",children:[
                    e.jsxs("h3",{className:"font-black text-sm sm:text-base text-slate-100 flex items-center gap-1.5 truncate",children:[
                      "#",activeChannelObj.name
                    ]}),
                    e.jsx(V,{variant:"outline",className:"text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold px-2 py-0.5",children:"🟢 Live Fleet"})
                  ]}),
                  e.jsx("p",{className:"text-[11px] text-slate-400 truncate hidden sm:block",children:activeChannelObj.desc})
                ]})
              ]}),

              // Actions: Search, Sound, Export, Clear
              e.jsxs("div",{className:"flex items-center gap-1.5 shrink-0",children:[
                e.jsx(f,{size:"sm",variant:"ghost",onClick:()=>setIsSearching(!isSearching),className:_("h-8 w-8 p-0 rounded-xl",isSearching?"bg-primary/20 text-primary":"text-slate-400 hover:text-slate-200"),title:"Search channel messages",children:e.jsx(we,{className:"w-4 h-4"})}),
                e.jsx(f,{size:"sm",variant:"ghost",onClick:()=>setSoundEnabled(!soundEnabled),className:_("h-8 w-8 p-0 rounded-xl",soundEnabled?"text-slate-300":"text-slate-600"),title:soundEnabled?"Mute alerts":"Unmute alerts",children:e.jsx(a$,{className:"w-4 h-4"})}),
                e.jsx(f,{size:"sm",variant:"ghost",onClick:exportChatHistory,className:"h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-slate-200",title:"Export chat history",children:e.jsx(a1,{className:"w-4 h-4"})}),
                e.jsx(f,{size:"sm",variant:"ghost",onClick:clearChannel,className:"h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-red-400",title:"Clear channel",children:e.jsx(a2,{className:"w-4 h-4"})})
              ]})
            ]}),

            // OPTIONAL SEARCH BAR
            isSearching&&e.jsxs("div",{className:"px-4 sm:px-6 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2 duration-150",children:[
              e.jsx(we,{className:"w-3.5 h-3.5 text-slate-400 shrink-0"}),
              e.jsx(A,{
                value:searchQuery,
                onChange:e=>setSearchQuery(e.target.value),
                placeholder:`Filter messages in #${c} by keyword or sender...`,
                className:"h-7 bg-background text-xs rounded-lg border-slate-700 flex-1"
              }),
              searchQuery&&e.jsx(f,{size:"sm",variant:"ghost",onClick:()=>setSearchQuery(""),className:"h-6 px-2 text-[10px] text-slate-400",children:"Clear"})
            ]}),

            // MAIN MESSAGE FEED (The Scrollable Area - Window Scroll Isolated!)
            e.jsxs("div",{
              ref:chatScrollRef,
              onScroll:handleMessageFeedScroll,
              className:"flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-thin relative select-text",
              style:{scrollBehavior:"smooth"},
              children:[
                
                // Welcome card in channel
                e.jsxs("div",{className:"text-center py-4 border-b border-slate-800/60 mb-4",children:[
                  e.jsx("div",{className:"inline-flex p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-primary mb-2 shadow-inner",children:e.jsx(T,{className:"w-6 h-6"})}),
                  e.jsxs("h4",{className:"font-bold text-sm text-slate-200",children:["Welcome to #",activeChannelObj.name]}),
                  e.jsx("p",{className:"text-xs text-slate-400 max-w-md mx-auto mt-1",children:activeChannelObj.desc}),
                  e.jsx("div",{className:"flex items-center justify-center gap-2 mt-2",children:
                    e.jsx("span",{className:"text-[10px] font-mono text-slate-500",children:"End-to-end synchronized across all dispatch consoles"})
                  })
                ]}),

                // Message bubbles
                filteredMessages.length===0?e.jsx("div",{className:"text-center py-10 text-xs text-slate-500",children:searchQuery?"No messages match your search.":"No messages yet in this channel."}):
                filteredMessages.map((msg,idx)=>{
                  const isSelf=(y?.name||"").toLowerCase()===(msg.sender_name||"").toLowerCase()||msg.sender_name==="Operations Staff";
                  const isUrgent=msg.priority==="urgent";
                  const isAnnouncement=msg.priority==="announcement";
                  const timeFormatted=msg.timestamp?b(new Date(msg.timestamp),"hh:mm a"):"Now";
                  const dateFormatted=msg.timestamp?b(new Date(msg.timestamp),"dd MMM yyyy"):"Today";
                  
                  // Show date divider if first message or date changed
                  const prevMsg=idx>0?filteredMessages[idx-1]:null;
                  const prevDate=prevMsg?.timestamp?b(new Date(prevMsg.timestamp),"dd MMM yyyy"):"";
                  const showDateDivider=!prevMsg||prevDate!==dateFormatted;

                  return e.jsxs(l.Fragment,{key:msg.id||idx,children:[
                    showDateDivider&&e.jsx("div",{className:"flex items-center justify-center my-3",children:
                      e.jsx("span",{className:"px-3 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/90 text-slate-400 border border-slate-700/60 shadow-sm",children:dateFormatted})
                    }),
                    e.jsxs("div",{className:_("flex flex-col space-y-1 group transition-all",isSelf?"items-end":"items-start"),children:[
                      
                      // Message Meta Info (Sender, Role, Time)
                      e.jsxs("div",{className:_("flex items-center gap-2 text-[11px] text-slate-400 px-1",isSelf?"flex-row-reverse":"flex-row"),children:[
                        e.jsx("span",{className:"font-bold text-slate-200",children:isSelf?"You":msg.sender_name}),
                        msg.sender_role&&e.jsx("span",{className:"px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-semibold border border-slate-700/50",children:msg.sender_role}),
                        e.jsx("span",{className:"text-[10px] text-slate-500 font-mono",children:timeFormatted}),
                        
                        // Message Action Buttons on Hover
                        e.jsxs("div",{className:"opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1",children:[
                          e.jsx("button",{onClick:()=>toggleReaction(msg.id,"👍"),className:"p-1 rounded hover:bg-slate-800 text-[11px]",title:"Like",children:"👍"}),
                          e.jsx("button",{onClick:()=>toggleReaction(msg.id,"🚛"),className:"p-1 rounded hover:bg-slate-800 text-[11px]",title:"Truck ack",children:"🚛"}),
                          e.jsx("button",{onClick:()=>toggleReaction(msg.id,"✅"),className:"p-1 rounded hover:bg-slate-800 text-[11px]",title:"Done ack",children:"✅"}),
                          e.jsx("button",{onClick:()=>copyMessageText(msg.text),className:"p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200",title:"Copy",children:e.jsx(aq,{className:"w-3 h-3"})}),
                          e.jsx("button",{onClick:()=>shareToWhatsApp(msg),className:"p-1 rounded hover:bg-slate-800 text-emerald-400",title:"Forward to WhatsApp",children:e.jsx(_e,{className:"w-3 h-3"})})
                        ]})
                      ]}),

                      // Message Body Box
                      e.jsxs("div",{
                        className:_("px-4 py-3 rounded-2xl text-xs max-w-[85%] sm:max-w-[75%] shadow-md break-words relative",
                          isUrgent
                            ? "bg-gradient-to-br from-red-950/80 to-red-900/60 border border-red-500/60 text-red-100 shadow-red-950/40"
                            : isAnnouncement
                              ? "bg-gradient-to-br from-amber-950/70 to-amber-900/50 border border-amber-500/50 text-amber-100 shadow-amber-950/30"
                              : isSelf
                                ? "bg-primary text-primary-foreground rounded-tr-none shadow-primary/20 font-medium"
                                : "bg-slate-900/90 text-slate-100 rounded-tl-none border border-slate-800 shadow-inner"
                        ),
                        children:[
                          isUrgent&&e.jsxs("div",{className:"flex items-center gap-1.5 text-red-400 font-black text-[10px] mb-1.5 uppercase tracking-wider pb-1 border-b border-red-500/30",children:[
                            e.jsx(Ce,{className:"w-3.5 h-3.5"}),
                            "🚨 Critical Roadside / Safety Alert"
                          ]}),
                          isAnnouncement&&e.jsxs("div",{className:"flex items-center gap-1.5 text-amber-400 font-black text-[10px] mb-1.5 uppercase tracking-wider pb-1 border-b border-amber-500/30",children:[
                            "📢 Fleet Operations Announcement"
                          ]}),
                          e.jsx("p",{className:"whitespace-pre-line leading-relaxed selection:bg-primary/40",children:msg.text}),

                          // Reaction badges
                          msg.reactions&&Object.keys(msg.reactions).length>0&&e.jsx("div",{className:"flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/10 flex-wrap",children:
                            Object.entries(msg.reactions).map(([emoji,count])=>e.jsxs("span",{key:emoji,onClick:()=>toggleReaction(msg.id,emoji),className:"px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800/80 border border-slate-700/60 flex items-center gap-1 cursor-pointer hover:bg-slate-700/80",children:[
                              e.jsx("span",{children:emoji}),
                              e.jsx("span",{className:"font-bold text-slate-300",children:count})
                            ]}))
                          })
                        ]
                      })
                    ]})
                  ]});
                })
              ]
            }),

            // FLOATING NEW MESSAGES / JUMP TO BOTTOM BUTTON
            (isScrolledUp||unreadCount>0)&&e.jsxs(f,{
              onClick:()=>scrollToBottom(!0),
              className:"absolute bottom-28 right-8 z-20 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3.5 py-2 flex items-center gap-2 border border-primary/50 animate-bounce",
              children:[
                e.jsx(c3,{className:"w-3.5 h-3.5"}),
                unreadCount>0?`${unreadCount} New Message${unreadCount>1?"s":""} Below`:"Jump to Latest"
              ]
            }),

            // QUICK LOGISTICS ACTION PILLS
            e.jsx("div",{className:"px-4 sm:px-6 pt-2 pb-1 bg-slate-900/40 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0",children:
              QUICK_ACTIONS.map(action=>e.jsx("button",{
                key:action,
                onClick:()=>pe(null,action),
                className:"px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors shrink-0 active:scale-95",
                children:action
              }))
            }),

            // INPUT FORM (Pinned Bottom)
            e.jsxs("form",{onSubmit:e=>pe(e),className:"p-3 sm:p-4 bg-slate-900/80 border-t border-slate-800 space-y-2.5 shrink-0 backdrop-blur-md",children:[
              
              // Priority selector & shortcuts
              e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[
                e.jsxs("div",{className:"flex items-center gap-2",children:[
                  e.jsxs(u,{value:G,onValueChange:K,children:[
                    e.jsx(p,{className:_("h-7 text-xs rounded-xl border-slate-700 font-bold",
                      G==="urgent"?"bg-red-500/20 text-red-300 border-red-500/40":
                      G==="announcement"?"bg-amber-500/20 text-amber-300 border-amber-500/40":
                      "bg-background text-slate-300"
                    ),children:e.jsx(h,{})}),
                    e.jsxs(g,{children:[
                      e.jsx(o,{value:"normal",children:"🟢 Normal Update"}),
                      e.jsx(o,{value:"urgent",children:"🚨 Urgent Fleet Notice"}),
                      e.jsx(o,{value:"announcement",children:"📢 Fleet Announcement"})
                    ]})
                  ]}),
                  G==="urgent"&&e.jsx("span",{className:"text-[10px] text-red-400 font-bold animate-pulse hidden sm:inline",children:"⚠️ Alerts entire team immediately"})
                ]}),
                e.jsx("span",{className:"text-[10px] text-slate-500 font-mono hidden sm:inline",children:"Press Enter to send"})
              ]}),

              // Input box & Send button
              e.jsxs("div",{className:"flex items-center gap-2",children:[
                e.jsx(A,{
                  value:L,
                  onChange:s=>J(s.target.value),
                  onKeyDown:s=>{
                    if(s.key==="Enter"&&!s.shiftKey){
                      s.preventDefault();
                      pe(s);
                    }
                  },
                  placeholder:`Message #${c}... (e.g. Truck MH12-AB-1234 crossed Pune Toll)`,
                  className:"bg-background text-xs rounded-xl h-11 flex-1 border-slate-700 focus-visible:ring-primary shadow-inner px-4"
                }),
                e.jsxs(f,{
                  type:"submit",
                  disabled:!L.trim(),
                  className:_("rounded-xl h-11 px-5 font-black text-xs gap-2 shadow-lg transition-all",
                    G==="urgent"
                      ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/50"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/30"
                  ),
                  children:[
                    e.jsx(De,{className:"w-4 h-4"}),
                    "Send"
                  ]
                })
              ]})
            ]})
          ]})
        ]})
      })
    ]}),

    // TASK CREATION / EDIT DIALOG (Preserved in full!)
    e.jsx(Oe,{open:ce,onOpenChange:I,children:e.jsxs(Pe,{className:"sm:max-w-[500px] bg-card text-card-foreground",children:[
      e.jsx(Ee,{children:e.jsx(Re,{children:d?"Edit Task":"Assign New Task to Staff"})}),
      e.jsxs("form",{onSubmit:me,className:"space-y-4 py-2",children:[
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsx(j,{className:"text-xs font-bold",children:"Task Title *"}),
          e.jsx(A,{value:n.title,onChange:s=>m({...n,title:s.target.value}),placeholder:"e.g. Inspect fastag balance for vehicle RJ14-GB-9999",className:"bg-background text-xs",required:!0})
        ]}),
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsx(j,{className:"text-xs font-bold",children:"Assign to Staff Member *"}),
          e.jsxs(u,{value:n.assigned_to_name,onValueChange:s=>{const a=N.find(t=>t.name===s);m({...n,assigned_to_name:s,assigned_to_phone:a?.phone||""})},children:[
            e.jsx(p,{className:"bg-background text-xs",children:e.jsx(h,{placeholder:"Select staff member"})}),
            e.jsx(g,{children:N.map(s=>e.jsxs(o,{value:s.name,children:[s.name," (",s.role||"Staff",")"]},s.id))})
          ]})
        ]}),
        e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
          e.jsxs("div",{className:"space-y-1.5",children:[
            e.jsx(j,{className:"text-xs font-bold",children:"Priority"}),
            e.jsxs(u,{value:n.priority,onValueChange:s=>m({...n,priority:s}),children:[
              e.jsx(p,{className:"bg-background text-xs",children:e.jsx(h,{})}),
              e.jsx(g,{children:O.map(s=>e.jsx(o,{value:s.id,children:s.label},s.id))})
            ]})
          ]}),
          e.jsxs("div",{className:"space-y-1.5",children:[
            e.jsx(j,{className:"text-xs font-bold",children:"Category"}),
            e.jsxs(u,{value:n.category,onValueChange:s=>m({...n,category:s}),children:[
              e.jsx(p,{className:"bg-background text-xs",children:e.jsx(h,{})}),
              e.jsx(g,{children:Z.map(s=>e.jsx(o,{value:s,children:s},s))})
            ]})
          ]})
        ]}),
        e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
          e.jsxs("div",{className:"space-y-1.5",children:[
            e.jsx(j,{className:"text-xs font-bold",children:"Due Date"}),
            e.jsx(A,{type:"date",value:n.due_date,onChange:s=>m({...n,due_date:s.target.value}),className:"bg-background text-xs"})
          ]}),
          e.jsxs("div",{className:"space-y-1.5",children:[
            e.jsx(j,{className:"text-xs font-bold",children:"Initial Status"}),
            e.jsxs(u,{value:n.status,onValueChange:s=>m({...n,status:s}),children:[
              e.jsx(p,{className:"bg-background text-xs",children:e.jsx(h,{})}),
              e.jsx(g,{children:ee.map(s=>e.jsx(o,{value:s.id,children:s.label},s.id))})
            ]})
          ]})
        ]}),
        e.jsxs("div",{className:"space-y-1.5",children:[
          e.jsx(j,{className:"text-xs font-bold",children:"Task Instructions / Notes"}),
          e.jsx(Le,{value:n.description,onChange:s=>m({...n,description:s.target.value}),placeholder:"Enter specific instructions, route details, vehicle number, or invoice details...",className:"bg-background text-xs min-h-[70px]"})
        ]}),
        e.jsxs($e,{className:"pt-2",children:[
          e.jsx(f,{type:"button",variant:"outline",onClick:()=>I(!1),children:"Cancel"}),
          e.jsx(f,{type:"submit",className:"font-bold",children:"Save & Assign Task"})
        ]})
      ]})
    ]})})
  ]});
}

export{Ke as default};
