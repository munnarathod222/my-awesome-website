import{
  p as b,u as Te,k as y,aa as Z,f as Fe,t as R,J as Q,D as Me,a as Re,b as Le,c as $e,d as Ae,L as u,S as I,e as O,g as q,h as B,i as L,aj as Pe,I as j,B as ee,X as le,ac as oe,C as ue,j as Ee,ad as Ue,a9 as Ie
}from"./index-DLxf9dwO.js";
import{
  r as g,j as e,cp as Oe,af as qe,a4 as Be,ak as Ke,a6 as Ye,bu as Xe,ap as Ze,n as Je
}from"./vendor-react-Bs5V2qFE.js";
import{
  a as K
}from"./addDays-D4tJXVkB.js";

function te(n){
  return n?n.replace(/[^a-zA-Z0-9]/g,"").toUpperCase():""
}

async function Ge(n){
  if(!n)return null;
  const N=n.truck_number||n.truck_id;
  if(!N)return console.warn("[FASTagUtils] No truck_number on trip log, skipping deduction."),null;
  const E=te(N);
  try{
    const f=(await b.collection("trucks").getFullList({$autoCancel:!1}).catch(()=>[])).find(w=>{
      const F=te(w.truck_number),C=te(w.registration_number);
      return F===E||C===E||w.id===N
    });
    if(!f)return console.warn(`[FASTagUtils] Truck '${N}' (normalized: '${E}') not found in trucks collection.`),null;
    let p=0;
    if(n.fastag_charge!==void 0&&n.fastag_charge!==null&&Number(n.fastag_charge)>0&&(p=Number(n.fastag_charge)),!p){
      const F=(await b.collection("routes").getFullList({$autoCancel:!1}).catch(()=>[])).find(C=>!!(n.route_id&&C.id===n.route_id||n.route&&(C.route_name?.trim().toLowerCase()===n.route.trim().toLowerCase()||C.route_code?.trim().toLowerCase()===n.route.trim().toLowerCase())));
      F&&F.fastag_charge&&(p=Number(F.fastag_charge)||0)
    }
    p<=0&&(p=450);
    const v=Number(f.current_fastag_balance)||0,$=v-p;
    await b.collection("trucks").update(f.id,{current_fastag_balance:$},{$autoCancel:!1});
    try{
      await b.collection("fastag_transactions").create({
        truck_number:f.truck_number||N,
        transaction_type:"Debit",
        amount:p,
        trip_code:n.trip_id||n.id,
        date:new Date().toISOString(),
        notes:`FASTag toll deduction (₹${p}) for Delivered trip ${n.trip_id||n.id} (Route: ${n.route||""})`
      },{$autoCancel:!1})
    }catch(w){
      console.warn("[FASTagUtils] Transaction log creation warning:",w)
    }
    return{truck:f,tollDeducted:p,newBalance:$}
  }catch(V){
    return console.error("[FASTagUtils] Error in deductFastagForTrip:",V),null
  }
}

const Ve=[
  {id:"mon",label:"Mon",fullLabel:"Monday",value:1},
  {id:"tue",label:"Tue",fullLabel:"Tuesday",value:2},
  {id:"wed",label:"Wed",fullLabel:"Wednesday",value:3},
  {id:"thu",label:"Thu",fullLabel:"Thursday",value:4},
  {id:"fri",label:"Fri",fullLabel:"Friday",value:5},
  {id:"sat",label:"Sat",fullLabel:"Saturday",value:6},
  {id:"sun",label:"Sun",fullLabel:"Sunday",value:0}
];

function He({isOpen:n,onClose:N,onSuccess:E}){
  const{currentUser:V}=Te(),
       [f,p]=g.useState(!1),
       [v,$]=g.useState(!0),
       [w,F]=g.useState([]),
       [C,me]=g.useState([]),
       [se,_e]=g.useState([]),
       [A,pe]=g.useState([]),
       [t,d]=g.useState({
         client_id:"",
         selected_route_id:"",
         is_round_trip:!1,
         selected_second_route_id:"",
         startDate:y(new Date,"yyyy-MM-dd"),
         endDate:y(K(new Date,7),"yyyy-MM-dd"),
         driver_name:"",
         truck_number:"",
         amount:"",
         kms:"",
         second_amount:"",
         second_kms:"",
         advance_received_from_client:"",
         advance_paid_to_driver:"",
         client_payment_status:"pending",
         trip_status:"Upcoming",
         selectedDays:[1,2,3,4,5,6,0],
         pickup_time:"",
         delivery_eta:""
       }),
       [J,ae]=g.useState(()=>Z(1,1)),
       [G,re]=g.useState(()=>Z(1,1)),
       [H,ne]=g.useState("up"),
       i=A.find(s=>s.id===t.selected_route_id),
       T=t.selected_second_route_id&&t.selected_second_route_id!=="default"?A.find(s=>s.id===t.selected_second_route_id):null;

  g.useEffect(()=>{
    n&&(xe(),he())
  },[n]);

  const xe=async()=>{
    $(!0);
    try{
      const[s,a,r,c]=await Promise.all([
        b.collection("clients").getFullList({sort:"client_name",$autoCancel:!1}),
        b.collection("employees").getFullList({filter:'employee_type="driver"',$autoCancel:!1}),
        b.collection("trucks").getFullList({$autoCancel:!1}),
        b.collection("routes").getFullList({sort:"route_name",$autoCancel:!1})
      ]);
      let l=[];
      try{
        const h=localStorage.getItem("jbc_driver_applications");
        h&&(l=JSON.parse(h).map(m=>({
          id:m.id,
          name:m.full_name||m.name,
          status:m.status,
          active_status:m.active_status,
          employment_status:m.employment_status,
          employee_type:"driver"
        })))
      }catch{}
      const _=[...a,...l],
            M=Fe(_),
            k=new Map;
      M.forEach(h=>{
        h&&h.name&&!k.has(h.name.trim().toLowerCase())&&k.set(h.name.trim().toLowerCase(),h)
      });
      F(s);
      me(Array.from(k.values()));
      _e(r);
      pe(c);
    }catch(s){
      console.error("Failed to load dependencies",s);
      R.error("Failed to load form dependencies");
    }finally{
      $(!1);
    }
  };

  const he=()=>{
    d({
      client_id:"",
      selected_route_id:"",
      is_round_trip:!1,
      selected_second_route_id:"",
      startDate:y(new Date,"yyyy-MM-dd"),
      endDate:y(K(new Date,7),"yyyy-MM-dd"),
      driver_name:"",
      truck_number:"",
      amount:"",
      kms:"",
      second_amount:"",
      second_kms:"",
      advance_received_from_client:"",
      advance_paid_to_driver:"",
      client_payment_status:"pending",
      trip_status:"Upcoming",
      selectedDays:[1,2,3,4,5,6,0],
      pickup_time:"",
      delivery_eta:""
    })
  };

  const ge=s=>{
    const a=A.find(r=>r.id===s);
    if(a){
      const r=a.is_round_trip||!1,
            c=a.origin||a.from_city||"",
            l=a.destination||a.to_city||"";
      ae(Z(1,1,c,l));
      r&&re(Z(1,1,l,c));
      d(_=>({
        ..._,
        selected_route_id:s,
        is_round_trip:r,
        amount:a.amount_per_trip?.toString()||"",
        kms:a.distance_km?.toString()||"",
        selected_second_route_id:r?_.selected_second_route_id||"default":"",
        second_amount:r&&(_.second_amount||a.amount_per_trip?.toString())||"",
        second_kms:r&&(_.second_kms||a.distance_km?.toString())||""
      }))
    }
  };

  const fe=s=>{
    if(s==="default"){
      d(r=>({...r,selected_second_route_id:"default",second_amount:"",second_kms:""}));
      return;
    }
    const a=A.find(r=>r.id===s);
    d(a?r=>({
      ...r,
      selected_second_route_id:s,
      second_amount:a.amount_per_trip?.toString()||"",
      second_kms:a.distance_km?.toString()||""
    }):r=>({
      ...r,
      selected_second_route_id:"",
      second_amount:"",
      second_kms:""
    }))
  };

  const be=s=>{
    d(a=>{
      const c=a.selectedDays.includes(s)?a.selectedDays.filter(l=>l!==s):[...a.selectedDays,s];
      return{...a,selectedDays:c}
    })
  };

  const de=t.client_id&&t.selected_route_id&&t.startDate&&t.endDate&&t.driver_name&&t.truck_number&&t.amount&&t.kms&&(!t.is_round_trip||t.second_amount&&t.second_kms)&&t.selectedDays.length>0&&new Date(t.startDate)<=new Date(t.endDate);

  const ve=async s=>{
    if(s.preventDefault(),!de)return;
    p(!0);
    try{
      const a=new Date(t.startDate),
            r=new Date(t.endDate),
            c=Q(r,a)+1,
            l=[];
      for(let o=0;o<c;o++){
        const m=K(a,o);
        t.selectedDays.includes(m.getDay())&&l.push(m)
      }
      if(l.length===0){
        R.error("No valid dates fall within the selected parameters.");
        p(!1);
        return;
      }
      const _=V?.id||b.authStore.model?.id||"",
            M=l.length,
            k=l.map((o,m)=>{
              const D=!t.is_round_trip||m%2===0;
              let S=i.route_code,P=t.selected_route_id,U=parseFloat(t.kms)||0,ie=parseFloat(t.amount)||0;
              D||(T?(S=T.route_code,P=T.id):(S=i.down_route_code||i.route_code,P=t.selected_route_id),U=parseFloat(t.second_kms||t.kms)||0,ie=parseFloat(t.second_amount||t.amount)||0);
              let X=null;
              if(t.pickup_time){
                const z=t.pickup_time.match(/T(\d{2}:\d{2})/);
                z?X=y(o,"yyyy-MM-dd")+`T${z[1]}:00.000Z`:X=new Date(t.pickup_time).toISOString()
              }
              let Y=null;
              if(t.delivery_eta){
                const z=new Date(t.startDate),
                      Se=new Date(t.delivery_eta),
                      we=Math.max(0,Q(Se,z)),
                      Ce=K(o,we),
                      ce=t.delivery_eta.match(/T(\d{2}:\d{2})/);
                ce?Y=y(Ce,"yyyy-MM-dd")+`T${ce[1]}:00.000Z`:Y=new Date(t.delivery_eta).toISOString()
              }
              const De=y(o,"yyyy-MM-dd"),x=Ue(De,D?J:G);
              return{
                trip_id:"",
                client_id:t.client_id,
                route_id:P,
                date:y(o,"yyyy-MM-dd")+" 12:00:00.000Z",
                route:S,
                revenue:ie,
                kms:U,
                advance_received_from_client:parseFloat(t.advance_received_from_client)||0,
                advance_paid_to_driver:parseFloat(t.advance_paid_to_driver)||0,
                client_payment_status:t.client_payment_status,
                trip_status:t.trip_status,
                driver_name:t.driver_name,
                truck_number:t.truck_number,
                created_by:_,
                user_id:_,
                trip_stops:x.milestones_schedule,
                milestones_schedule:x.milestones_schedule,
                total_docks_count:x.total_docks_count,
                total_drops_count:x.total_drops_count,
                dock_sched_arrival_time:x.dock_sched_arrival_time,
                dock_sched_dispatch_time:x.dock_sched_dispatch_time,
                dock2_sched_arrival_time:x.dock2_sched_arrival_time,
                dock2_sched_dispatch_time:x.dock2_sched_dispatch_time,
                drop1_sched_arrival_time:x.drop1_sched_arrival_time,
                drop1_sched_dispatch_time:x.drop1_sched_dispatch_time,
                drop2_sched_arrival_time:x.drop2_sched_arrival_time,
                drop2_sched_dispatch_time:x.drop2_sched_dispatch_time,
                pickup_time:x.pickup_time||X,
                delivery_eta:x.delivery_eta||Y
              }
            });
      R.loading(`Creating ${M} recurring trips...`,{id:"batch-progress"});
      let h=!1;
      try{
        const o=await Ie.fetch("/trips/bulk-create",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({trips:k})
        }),m=await o.json();
        o.ok&&m.success?h=!0:console.warn("Server bulk-create returned error status, executing client fallback:",m)
      }catch(o){
        console.warn("Server bulk-create API call failed, executing client fallback:",o)
      }
      if(!h){
        let o=0;
        try{
          (await b.collection("trip_logs").getFullList({fields:"trip_id",$autoCancel:!1})).forEach(S=>{
            if(S.trip_id){
              const P=S.trip_id.match(/TRIP-(\d+)/);
              if(P){
                const U=parseInt(P[1],10);
                U>o&&(o=U)
              }
            }
          })
        }catch{}
        let m=o+1;
        for(let D=0;D<k.length;D++){
          const S={...k[D]};
          S.trip_id=`TRIP-${(m+D).toString().padStart(3,"0")}`;
          await b.collection("trip_logs").create(S,{$autoCancel:!1})
        }
      }
      R.dismiss("batch-progress");
      R.success(`Successfully generated ${M} recurring trips!`);
      E?.();
      N();
    }catch(a){
      R.dismiss("batch-progress");
      console.error("Batch generation failed:",a);
      R.error("Failed to generate recurring trips: "+a.message);
    }finally{
      p(!1)
    }
  };

  const W=g.useMemo(()=>{
    if(!i||!t.startDate||!t.endDate||t.selectedDays.length===0)return[];
    const s=new Date(t.startDate),a=new Date(t.endDate);
    if(s>a)return[];
    const r=Q(a,s)+1,c=[];
    for(let l=0;l<r;l++){
      const _=K(s,l);
      t.selectedDays.includes(_.getDay())&&c.push(_)
    }
    return c.map((l,_)=>{
      const M=!t.is_round_trip||_%2===0,
            k=M?i.route_code:T?T.route_code:i.down_route_code||i.route_code;
      return{date:l,isForward:M,routeCode:k,index:_}
    })
  },[t.startDate,t.endDate,t.selectedDays,t.is_round_trip,i,T]);

  // Derived financial summary
  const fwdCount=W.filter(x=>x.isForward).length,
        retCount=W.filter(x=>!x.isForward).length,
        fwdFare=parseFloat(t.amount)||0,
        retFare=t.is_round_trip?(parseFloat(t.second_amount||t.amount)||0):0,
        fwdKms=parseFloat(t.kms)||0,
        retKms=t.is_round_trip?(parseFloat(t.second_kms||t.kms)||0):0,
        totalRevenueForecast=(fwdCount*fwdFare)+(retCount*retFare),
        totalKmsForecast=(fwdCount*fwdKms)+(retCount*retKms),
        totalDriverAdvForecast=W.length*(parseFloat(t.advance_paid_to_driver)||0);

  return e.jsx(Me,{
    open:n,
    onOpenChange:s=>!s&&!f&&N(),
    children:e.jsxs(Re,{
      className:"max-w-5xl w-[96vw] max-h-[92vh] p-0 overflow-hidden bg-background border-border/50 shadow-2xl rounded-3xl flex flex-col",
      children:[
        // Clean Branded Header
        e.jsxs(Le,{
          className:"px-6 py-4.5 border-b border-border/50 bg-secondary/15 flex flex-wrap items-center justify-between gap-3 shrink-0",
          children:[
            e.jsxs("div",{
              className:"flex items-center gap-3",
              children:[
                e.jsx("div",{
                  className:"p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0",
                  children:e.jsx(Oe,{className:"w-6 h-6"})
                }),
                e.jsxs("div",{
                  children:[
                    e.jsxs($e,{
                      className:"text-xl font-bold font-heading flex items-center gap-2 text-foreground",
                      children:[
                        "Add Recurring Trips",
                        e.jsx("span",{
                          className:"text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20",
                          children:"Batch Schedule"
                        })
                      ]
                    }),
                    e.jsx(Ae,{
                      className:"text-xs text-muted-foreground mt-0.5",
                      children:"Schedule automated recurring logistics trips across custom date intervals."
                    })
                  ]
                })
              ]
            }),
            W.length>0?e.jsxs("div",{
              className:"px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2",
              children:[
                e.jsx("span",{className:"w-2 h-2 rounded-full bg-emerald-500 animate-pulse"}),
                e.jsxs("span",{
                  className:"text-xs font-bold text-emerald-400 font-mono",
                  children:[W.length," Trips Configured"]
                })
              ]
            }):null
          ]
        }),

        // Main Scrollable Body
        e.jsx("form",{
          id:"recurring-trips-form",
          onSubmit:ve,
          className:"flex-1 overflow-y-auto p-6",
          children:e.jsxs("div",{
            className:"grid grid-cols-1 lg:grid-cols-3 gap-6 items-start",
            children:[
              // Left Column: 4 Clean Sections
              e.jsxs("div",{
                className:"lg:col-span-2 space-y-5",
                children:[
                  // SECTION 1: ROUTE & CLIENT
                  e.jsxs("div",{
                    className:"rounded-2xl border border-border/60 bg-card/40 p-4.5 space-y-4 shadow-sm",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between pb-2.5 border-b border-border/40",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx("div",{
                                className:"p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20",
                                children:e.jsx(Oe,{className:"w-4 h-4"})
                              }),
                              e.jsx("h4",{
                                className:"text-xs font-bold uppercase tracking-wider text-foreground font-heading",
                                children:"1. Route & Client Assignment"
                              })
                            ]
                          }),
                          e.jsx("span",{
                            className:"text-[10px] text-muted-foreground font-medium",
                            children:"Step 1 of 4"
                          })
                        ]
                      }),
                      e.jsxs("div",{
                        className:"grid grid-cols-1 md:grid-cols-2 gap-4",
                        children:[
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Client / Company ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsxs(I,{
                                value:t.client_id,
                                onValueChange:s=>d({...t,client_id:s}),
                                disabled:v,
                                children:[
                                  e.jsx(O,{className:"rounded-xl bg-background h-10 text-xs font-medium",children:e.jsx(q,{placeholder:v?"Loading clients...":"Select client / company"})}),
                                  e.jsx(B,{children:w.map(s=>e.jsx(L,{value:s.id,children:s.client_name||s.company_name},s.id))})
                                ]
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Select Saved Route ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsxs(I,{
                                value:t.selected_route_id,
                                onValueChange:ge,
                                disabled:v,
                                children:[
                                  e.jsx(O,{className:"rounded-xl bg-background h-10 text-xs font-medium",children:e.jsx(q,{placeholder:v?"Loading routes...":"Select route template"})}),
                                  e.jsx(B,{children:A.map(s=>e.jsxs(L,{value:s.id,children:[s.route_name," (",s.route_code,")"]},s.id))})
                                ]
                              })
                            ]
                          })
                        ]
                      }),

                      // Round-Trip Box
                      e.jsxs("div",{
                        className:"p-3 rounded-xl bg-secondary/15 border border-border/50 flex flex-wrap items-center justify-between gap-3",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center space-x-2.5",
                            children:[
                              e.jsx(Pe,{
                                id:"is_round_trip",
                                checked:t.is_round_trip,
                                onCheckedChange:s=>d(a=>({
                                  ...a,
                                  is_round_trip:!!s,
                                  selected_second_route_id:s?a.selected_second_route_id||"default":"",
                                  second_amount:s?a.second_amount||a.amount:"",
                                  second_kms:s?a.second_kms||a.kms:""
                                }))
                              }),
                              e.jsxs(u,{
                                htmlFor:"is_round_trip",
                                className:"cursor-pointer text-xs font-semibold text-foreground select-none",
                                children:[
                                  "Configure as Round-Trip (Alternating UP & DOWN Legs)",
                                  e.jsx("span",{className:"block text-[11px] font-normal text-muted-foreground",children:"Dispatches will alternate between forward and return routes"})
                                ]
                              })
                            ]
                          }),
                          t.is_round_trip?e.jsx("span",{
                            className:"px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider",
                            children:"Round-Trip Active"
                          }):null
                        ]
                      }),

                      t.is_round_trip&&e.jsx("div",{
                        className:"pt-1 animate-in fade-in slide-in-from-top-1 duration-200",
                        children:e.jsxs("div",{
                          className:"space-y-1.5",
                          children:[
                            e.jsx(u,{className:"text-xs font-semibold text-foreground/90",children:"Select Return Route (2nd Leg / DOWN)"}),
                            e.jsxs(I,{
                              value:t.selected_second_route_id,
                              onValueChange:fe,
                              disabled:v,
                              children:[
                                e.jsx(O,{className:"rounded-xl bg-background h-10 text-xs font-medium",children:e.jsx(q,{placeholder:"Use template default / Select return route"})}),
                                e.jsxs(B,{
                                  children:[
                                    e.jsx(L,{value:"default",children:"Use Template Default (or Forward Route)"}),
                                    A.map(s=>e.jsxs(L,{value:s.id,children:[s.route_name," (",s.route_code,")"]},s.id))
                                  ]
                                })
                              ]
                            })
                          ]
                        })
                      })
                    ]
                  }),

                  // SECTION 2: SCHEDULE & RECURRENCE
                  e.jsxs("div",{
                    className:"rounded-2xl border border-border/60 bg-card/40 p-4.5 space-y-4 shadow-sm",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between pb-2.5 border-b border-border/40",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx("div",{
                                className:"p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20",
                                children:e.jsx(Be,{className:"w-4 h-4"})
                              }),
                              e.jsx("h4",{
                                className:"text-xs font-bold uppercase tracking-wider text-foreground font-heading",
                                children:"2. Schedule & Recurrence Pattern"
                              })
                            ]
                          }),
                          e.jsx("span",{
                            className:"text-[10px] text-muted-foreground font-medium",
                            children:"Step 2 of 4"
                          })
                        ]
                      }),

                      // Date Range
                      e.jsxs("div",{
                        className:"grid grid-cols-1 md:grid-cols-2 gap-4",
                        children:[
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Start Date ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsx(j,{
                                type:"date",
                                required:!0,
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.startDate,
                                onChange:s=>d({...t,startDate:s.target.value})
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["End Date ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsx(j,{
                                type:"date",
                                required:!0,
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.endDate,
                                onChange:s=>d({...t,endDate:s.target.value})
                              })
                            ]
                          })
                        ]
                      }),

                      // Timings (Pickup & Delivery)
                      e.jsxs("div",{
                        className:"grid grid-cols-1 md:grid-cols-2 gap-4",
                        children:[
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsx(u,{className:"text-xs font-semibold text-foreground/90",children:"Pickup Time (Dispatch SLA)"}),
                              e.jsx(j,{
                                type:"datetime-local",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.pickup_time,
                                onChange:s=>d({...t,pickup_time:s.target.value})
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsx(u,{className:"text-xs font-semibold text-foreground/90",children:"Delivery ETA (Arrival SLA)"}),
                              e.jsx(j,{
                                type:"datetime-local",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.delivery_eta,
                                onChange:s=>d({...t,delivery_eta:s.target.value})
                              })
                            ]
                          })
                        ]
                      }),

                      // Recurrence Days with Quick Presets
                      e.jsxs("div",{
                        className:"space-y-2.5 pt-1",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center justify-between",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Recurrence Days ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsxs("div",{
                                className:"flex items-center gap-1.5",
                                children:[
                                  e.jsx("button",{
                                    type:"button",
                                    onClick:()=>d(a=>({...a,selectedDays:[1,2,3,4,5,6,0]})),
                                    className:"text-[10px] font-bold text-primary hover:underline px-2 py-0.5 rounded bg-primary/10 border border-primary/20",
                                    children:"All Days"
                                  }),
                                  e.jsx("button",{
                                    type:"button",
                                    onClick:()=>d(a=>({...a,selectedDays:[1,2,3,4,5]})),
                                    className:"text-[10px] font-bold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border/50",
                                    children:"Mon - Fri"
                                  }),
                                  e.jsx("button",{
                                    type:"button",
                                    onClick:()=>d(a=>({...a,selectedDays:[6,0]})),
                                    className:"text-[10px] font-bold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary/50 border border-border/50",
                                    children:"Weekends"
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsx("div",{
                            className:"grid grid-cols-7 gap-2",
                            children:Ve.map(s=>{
                              const a=t.selectedDays.includes(s.value);
                              return e.jsxs("button",{
                                type:"button",
                                onClick:()=>be(s.value),
                                className:le(
                                  "py-2.5 px-1 rounded-xl text-xs font-bold transition-all text-center border flex flex-col items-center justify-center gap-0.5 shadow-sm",
                                  a
                                    ?"bg-primary text-primary-foreground border-primary shadow-primary/20 scale-[1.02]"
                                    :"bg-background/80 hover:bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground"
                                ),
                                children:[
                                  e.jsx("span",{className:"leading-none text-xs",children:s.label}),
                                  e.jsx("span",{
                                    className:le("text-[9px] font-medium leading-none opacity-80",a?"text-primary-foreground":"text-muted-foreground/60"),
                                    children:a?"✓":"—"
                                  })
                                ]
                              },s.id)
                            })
                          })
                        ]
                      })
                    ]
                  }),

                  // SECTION 3: FLEET & DRIVER
                  e.jsxs("div",{
                    className:"rounded-2xl border border-border/60 bg-card/40 p-4.5 space-y-4 shadow-sm",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between pb-2.5 border-b border-border/40",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx("div",{
                                className:"p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20",
                                children:e.jsx(Ye,{className:"w-4 h-4"})
                              }),
                              e.jsx("h4",{
                                className:"text-xs font-bold uppercase tracking-wider text-foreground font-heading",
                                children:"3. Fleet & Driver Assignments"
                              })
                            ]
                          }),
                          e.jsx("span",{
                            className:"text-[10px] text-muted-foreground font-medium",
                            children:"Step 3 of 4"
                          })
                        ]
                      }),
                      e.jsxs("div",{
                        className:"grid grid-cols-1 md:grid-cols-2 gap-4",
                        children:[
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Driver ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsxs(I,{
                                value:t.driver_name,
                                onValueChange:s=>d({...t,driver_name:s}),
                                disabled:v,
                                children:[
                                  e.jsx(O,{className:"rounded-xl bg-background h-10 text-xs font-medium",children:e.jsx(q,{placeholder:"Select driver"})}),
                                  e.jsxs(B,{
                                    children:[
                                      e.jsx(L,{value:"Temporary Driver",className:"font-semibold text-amber-600 dark:text-amber-400",children:"⚡ Temporary Driver"}),
                                      C.map(s=>e.jsx(L,{value:s.name,children:s.name},s.id))
                                    ]
                                  })
                                ]
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:["Truck Number ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsxs(I,{
                                value:t.truck_number,
                                onValueChange:s=>{
                                  const a=se.find(c=>c.truck_number===s),
                                        r=C.find(c=>c.assigned_truck===a?.id);
                                  d(c=>({...c,truck_number:s,driver_name:r?r.name:c.driver_name}))
                                },
                                disabled:v,
                                children:[
                                  e.jsx(O,{className:"rounded-xl bg-background h-10 text-xs font-medium",children:e.jsx(q,{placeholder:"Select truck"})}),
                                  e.jsx(B,{children:se.map(s=>e.jsx(L,{value:s.truck_number,children:s.truck_number},s.id))})
                                ]
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),

                  // SECTION 4: FINANCIALS
                  e.jsxs("div",{
                    className:"rounded-2xl border border-border/60 bg-card/40 p-4.5 space-y-4 shadow-sm",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between pb-2.5 border-b border-border/40",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx("div",{
                                className:"p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                                children:e.jsx(Xe,{className:"w-4 h-4"})
                              }),
                              e.jsx("h4",{
                                className:"text-xs font-bold uppercase tracking-wider text-foreground font-heading",
                                children:"4. Financial Parameters & Advances (Per Leg)"
                              })
                            ]
                          }),
                          e.jsx("span",{
                            className:"text-[10px] text-muted-foreground font-medium",
                            children:"Step 4 of 4"
                          })
                        ]
                      }),
                      e.jsxs("div",{
                        className:"grid grid-cols-1 md:grid-cols-2 gap-4",
                        children:[
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:[t.is_round_trip?"Revenue Per Forward Leg (₹)":"Revenue Per Leg (₹)"," ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsx(j,{
                                type:"number",
                                required:!0,
                                min:"0",
                                step:"0.01",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.amount,
                                onChange:s=>d({...t,amount:s.target.value})
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsxs(u,{
                                className:"text-xs font-semibold text-foreground/90",
                                children:[t.is_round_trip?"Distance Per Forward Leg (KM)":"Distance Per Leg (KM)"," ",e.jsx("span",{className:"text-destructive",children:"*"})]
                              }),
                              e.jsx(j,{
                                type:"number",
                                required:!0,
                                min:"0",
                                step:"0.1",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.kms,
                                onChange:s=>d({...t,kms:s.target.value})
                              })
                            ]
                          }),

                          t.is_round_trip&&e.jsxs(e.Fragment,{
                            children:[
                              e.jsxs("div",{
                                className:"space-y-1.5 animate-in fade-in duration-200",
                                children:[
                                  e.jsxs(u,{
                                    className:"text-xs font-semibold text-foreground/90",
                                    children:["Revenue Per Return Leg (₹) ",e.jsx("span",{className:"text-destructive",children:"*"})]
                                  }),
                                  e.jsx(j,{
                                    type:"number",
                                    required:!0,
                                    min:"0",
                                    step:"0.01",
                                    className:"rounded-xl bg-background h-10 text-xs font-medium",
                                    value:t.second_amount,
                                    onChange:s=>d({...t,second_amount:s.target.value})
                                  })
                                ]
                              }),
                              e.jsxs("div",{
                                className:"space-y-1.5 animate-in fade-in duration-200",
                                children:[
                                  e.jsxs(u,{
                                    className:"text-xs font-semibold text-foreground/90",
                                    children:["Distance Per Return Leg (KM) ",e.jsx("span",{className:"text-destructive",children:"*"})]
                                  }),
                                  e.jsx(j,{
                                    type:"number",
                                    required:!0,
                                    min:"0",
                                    step:"0.1",
                                    className:"rounded-xl bg-background h-10 text-xs font-medium",
                                    value:t.second_kms,
                                    onChange:s=>d({...t,second_kms:s.target.value})
                                  })
                                ]
                              })
                            ]
                          }),

                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsx(u,{className:"text-xs font-semibold text-foreground/90",children:"Driver Advance Per Leg (₹)"}),
                              e.jsx(j,{
                                type:"number",
                                min:"0",
                                step:"0.01",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.advance_paid_to_driver,
                                onChange:s=>d({...t,advance_paid_to_driver:s.target.value})
                              })
                            ]
                          }),
                          e.jsxs("div",{
                            className:"space-y-1.5",
                            children:[
                              e.jsx(u,{className:"text-xs font-semibold text-foreground/90",children:"Client Advance Per Leg (₹)"}),
                              e.jsx(j,{
                                type:"number",
                                min:"0",
                                step:"0.01",
                                className:"rounded-xl bg-background h-10 text-xs font-medium",
                                value:t.advance_received_from_client,
                                onChange:s=>d({...t,advance_received_from_client:s.target.value})
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  }),

                  // SECTION 5: MULTI-STOP SLA MILESTONES
                  e.jsxs("div",{
                    className:"rounded-2xl border border-border/60 bg-card/40 p-4.5 space-y-3.5 shadow-sm",
                    children:[
                      e.jsxs("div",{
                        className:"flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border/40",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx("div",{
                                className:"p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20",
                                children:e.jsx(qe,{className:"w-4 h-4"})
                              }),
                              e.jsx("h4",{
                                className:"text-xs font-bold uppercase tracking-wider text-foreground font-heading",
                                children:"Multi-Stop Scheduled Milestones (SLA Timing)"
                              })
                            ]
                          }),
                          t.is_round_trip&&e.jsxs("div",{
                            className:"flex rounded-xl bg-muted/60 p-0.5 border border-border/60",
                            children:[
                              e.jsxs("button",{
                                type:"button",
                                className:le("px-3 py-1 text-xs font-bold rounded-lg transition-all",H==="up"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"),
                                onClick:()=>ne("up"),
                                children:["↑ UP Leg Stops (",J.length,")"]
                              }),
                              e.jsxs("button",{
                                type:"button",
                                className:le("px-3 py-1 text-xs font-bold rounded-lg transition-all",H==="down"?"bg-primary text-primary-foreground shadow-sm":"text-muted-foreground hover:text-foreground"),
                                onClick:()=>ne("down"),
                                children:["↓ DOWN Leg Stops (",G.length,")"]
                              })
                            ]
                          })
                        ]
                      }),
                      H==="up"?e.jsx(oe,{
                        stops:J,
                        onChange:ae,
                        origin:i?.origin||"",
                        destination:i?.destination||"",
                        legLabel:"↑ UP Leg (Forward)"
                      }):e.jsx(oe,{
                        stops:G,
                        onChange:re,
                        origin:i?.destination||"",
                        destination:i?.origin||"",
                        legLabel:"↓ DOWN Leg (Return)"
                      })
                    ]
                  })
                ]
              }),

              // Right Column: Sticky Live Preview & Projections Dashboard
              e.jsxs("div",{
                className:"lg:col-span-1 space-y-4 lg:sticky lg:top-0",
                children:[
                  // Trip Schedule Preview Card
                  e.jsxs(ue,{
                    className:"rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm space-y-3",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between border-b border-border/40 pb-2.5",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx(Be,{className:"w-4 h-4 text-primary"}),
                              e.jsx("h4",{className:"font-heading font-bold text-xs uppercase tracking-wider text-foreground",children:"Schedule Preview"})
                            ]
                          }),
                          W.length>0&&e.jsxs("span",{
                            className:"text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full font-mono",
                            children:[W.length," trips"]
                          })
                        ]
                      }),
                      W.length>0?e.jsx("div",{
                        className:"max-h-60 overflow-y-auto pr-1 space-y-1.5",
                        children:W.map(({date:s,isForward:a,routeCode:r,index:c})=>e.jsxs("div",{
                          className:`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs border ${a?"bg-emerald-500/8 border-emerald-500/20":"bg-blue-500/8 border-blue-500/20"}`,
                          children:[
                            e.jsxs("div",{
                              className:"flex items-center gap-2 min-w-0",
                              children:[
                                e.jsx("span",{
                                  className:`font-bold text-[9px] px-1.5 py-0.5 rounded shrink-0 ${a?"bg-emerald-500/20 text-emerald-600 dark:text-emerald-400":"bg-blue-500/20 text-blue-600 dark:text-blue-400"}`,
                                  children:a?"↑ UP":"↓ DOWN"
                                }),
                                e.jsx("span",{className:"font-medium text-foreground",children:y(s,"dd MMM yyyy")}),
                                e.jsx("span",{className:"text-muted-foreground text-[10px]",children:y(s,"EEE")})
                              ]
                            }),
                            e.jsx("span",{
                              className:"font-mono text-[10px] text-muted-foreground truncate ml-2 max-w-[85px] bg-background/50 px-1.5 py-0.5 rounded border border-border/40",
                              title:r,
                              children:r
                            })
                          ]
                        },c))
                      }):e.jsxs("div",{
                        className:"text-center py-8 text-muted-foreground italic flex flex-col items-center gap-2",
                        children:[
                          e.jsx(Be,{className:"w-8 h-8 opacity-40 animate-pulse"}),
                          e.jsx("span",{className:"text-xs",children:"Select route, dates & recurrence days to preview the schedule."})
                        ]
                      })
                    ]
                  }),

                  // Projections & Financial Summary Card
                  e.jsxs(ue,{
                    className:"rounded-2xl border border-border/60 bg-card/60 p-4 shadow-sm space-y-3",
                    children:[
                      e.jsxs("div",{
                        className:"flex items-center justify-between border-b border-border/40 pb-2.5",
                        children:[
                          e.jsxs("div",{
                            className:"flex items-center gap-2",
                            children:[
                              e.jsx(Xe,{className:"w-4 h-4 text-emerald-400"}),
                              e.jsx("h4",{className:"font-heading font-bold text-xs uppercase tracking-wider text-foreground",children:"Batch Projections"})
                            ]
                          }),
                          i&&e.jsx("span",{
                            className:"text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full",
                            children:i.route_code
                          })
                        ]
                      }),
                      e.jsxs("div",{
                        className:"space-y-2.5 text-xs",
                        children:[
                          e.jsxs("div",{
                            className:"flex justify-between items-center",
                            children:[
                              e.jsx("span",{className:"text-muted-foreground",children:"Total Trips:"}),
                              e.jsxs("span",{className:"font-bold font-mono text-foreground",children:[W.length," legs",t.is_round_trip&&W.length>0?` (${fwdCount} UP / ${retCount} DOWN)`:null]})
                            ]
                          }),
                          e.jsxs("div",{
                            className:"flex justify-between items-center",
                            children:[
                              e.jsx("span",{className:"text-muted-foreground",children:"Total Revenue:"}),
                              e.jsxs("span",{className:"font-bold font-mono text-emerald-400",children:["₹",totalRevenueForecast.toLocaleString("en-IN")]})
                            ]
                          }),
                          e.jsxs("div",{
                            className:"flex justify-between items-center",
                            children:[
                              e.jsx("span",{className:"text-muted-foreground",children:"Total Distance:"}),
                              e.jsxs("span",{className:"font-bold font-mono text-foreground",children:[totalKmsForecast.toLocaleString("en-IN")," KM"]})
                            ]
                          }),
                          totalDriverAdvForecast>0&&e.jsxs("div",{
                            className:"flex justify-between items-center",
                            children:[
                              e.jsx("span",{className:"text-muted-foreground",children:"Total Driver Advance:"}),
                              e.jsxs("span",{className:"font-bold font-mono text-amber-400",children:["₹",totalDriverAdvForecast.toLocaleString("en-IN")]})
                            ]
                          }),
                          e.jsxs("div",{
                            className:"flex justify-between items-center border-t border-border/40 pt-2",
                            children:[
                              e.jsx("span",{className:"text-muted-foreground",children:"Trip Type:"}),
                              e.jsx("span",{
                                className:le("text-[10px] font-bold px-2 py-0.5 rounded-full",t.is_round_trip?"bg-sky-500/10 text-sky-400 border border-sky-500/20":"bg-muted text-muted-foreground"),
                                children:t.is_round_trip?"Round-Trip (Alternating)":"One-Way (Single Leg)"
                              })
                            ]
                          })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        }),

        // Clean Fixed Dialog Footer
        e.jsxs(Ee,{
          className:"px-6 py-4 border-t border-border/50 bg-secondary/15 flex flex-wrap items-center justify-between gap-3 shrink-0",
          children:[
            e.jsx("div",{
              className:"text-xs text-muted-foreground",
              children:W.length>0
                ? e.jsxs("span",{children:["Ready to generate ",e.jsx("strong",{className:"text-foreground",children:W.length})," trips across ",e.jsx("strong",{className:"text-foreground",children:t.selectedDays.length})," recurring days."]})
                : "Fill required fields marked with * to schedule trips"
            }),
            e.jsxs("div",{
              className:"flex items-center gap-2",
              children:[
                e.jsx(ee,{
                  type:"button",
                  variant:"ghost",
                  onClick:N,
                  disabled:f,
                  className:"rounded-xl text-xs h-9 px-4",
                  children:"Cancel"
                }),
                e.jsxs(ee,{
                  form:"recurring-trips-form",
                  type:"submit",
                  disabled:f||!de,
                  className:"rounded-xl min-w-36 h-9 px-5 text-xs font-bold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground",
                  children:[
                    f&&e.jsx(Ke,{className:"w-3.5 h-3.5 mr-2 animate-spin"}),
                    f?"Generating...":`Generate ${W.length>0?W.length+" ":""}Trips`
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  })
}

export{He as A,Ge as d};
