import{r as a,j as e,bs as Qe,ai as ue,cx as U,aP as k,a6 as Xe,bt as Ge,bu as Je,aQ as Ue,ak as he,a4 as Ye,aE as Ze,b$ as pe,a2 as es}from"./vendor-react-Bs5V2qFE.js";import{B as c,n as ss,s as ts,v as be,x as ge,C,o as L,q as P,r as I,O as V,L as n,I as d,X as x,D as fe,a as je,b as Ne,c as ve,d as as,S as ye,e as we,g as ke,h as Ce,i as Y,j as _e,t as i,p as Se}from"./index-DLxf9dwO.js";import{S as p}from"./slider-MQ0bc9CC.js";import{R as rs,T as ls,B as ns,C as os}from"./generateCategoricalChart-BEnIo3F8.js";import{B as ds}from"./BarChart-DOVIJigh.js";import{C as is}from"./CartesianGrid-BCC_9QQg.js";import{X as cs,Y as xs}from"./YAxis-C3vl7O1m.js";import"./vendor-radix-BQCqNqg0.js";import"./vendor-pdf-DtmgLs_2.js";
const ORR_IC=[{id:"1",code:"1",name:"Kokapet"},{id:"1A",code:"1A",name:"Neopolis"},{id:"2",code:"2",name:"Edula nagulapally"},{id:"3",code:"3",name:"Patancheru"},{id:"4",code:"4",name:"Sultanpur"},{id:"4A",code:"4A",name:"Mallampet"},{id:"5",code:"5",name:"Dindigal / Saragudem"},{id:"6",code:"6",name:"Medchal"},{id:"7",code:"7",name:"Shamirpet"},{id:"8",code:"8",name:"Keesara"},{id:"9",code:"9",name:"Ghatkesar"},{id:"10",code:"10",name:"Taramptipet"},{id:"11",code:"11",name:"Pedda Amberpet"},{id:"12",code:"12",name:"Bonguluru"},{id:"13",code:"13",name:"Raviryal"},{id:"14",code:"14",name:"Tukkuguda"},{id:"15",code:"15",name:"Pedda Golconda"},{id:"16",code:"16",name:"Shamshabad"},{id:"17",code:"17",name:"Rajendra Nagar"},{id:"18",code:"18",name:"TGPA"},{id:"18A",code:"18A",name:"Narsingi"},{id:"19",code:"19",name:"Nanakramguda"}];
const ORR_CATS=[{id:"car_jeep_van_lmv",label:"Car / Jeep / Van / LMV"},{id:"lcv_minibus",label:"LCV / Mini Bus"},{id:"bus_2axle",label:"Bus / 2 Axle Truck"},{id:"truck_3axle",label:"3 Axle Commercial Truck"},{id:"heavy_4_6axle",label:"Heavy Machinery / 4-6 Axle Truck"},{id:"oversized_7plus",label:"Oversized Vehicle (7+ Axles)"}];
const ORR_MAP={"1":0,"1A":1,"2":2,"3":3,"4":4,"4A":5,"5":6,"6":7,"7":8,"8":9,"9":10,"10":11,"11":12,"12":13,"13":14,"14":15,"15":16,"16":17,"17":18,"18":19,"18A":20,"19":21};
const ORR_M1=[[0,10,30,50,70,80,100,120,140,170,170,150,140,110,90,80,60,50,30,20,10,10],[10,0,20,40,60,80,90,110,130,160,180,160,140,110,100,80,60,50,30,20,10,20],[30,20,0,20,40,50,70,90,110,140,160,180,170,140,120,110,90,70,60,50,40,40],[50,40,20,0,20,30,50,70,90,120,140,160,170,160,140,130,110,90,80,70,60,60],[70,60,40,20,0,10,30,50,70,100,120,140,150,180,160,150,130,110,100,90,80,80],[80,80,50,30,10,0,10,40,60,80,100,120,140,170,170,160,140,130,110,100,90,100],[100,90,70,50,30,10,0,20,40,70,90,110,130,150,170,180,160,140,130,110,100,110],[120,110,90,70,50,40,20,0,20,50,70,90,100,130,150,160,180,160,150,140,130,130],[140,130,110,90,70,60,40,20,0,30,50,70,80,110,130,140,160,180,170,160,150,150],[170,160,140,120,100,80,70,50,30,0,20,40,60,80,100,110,130,150,160,170,170,180],[170,180,160,140,120,100,90,70,50,20,0,20,40,60,80,90,110,130,140,150,160,180],[150,160,180,160,140,120,110,90,70,40,20,0,20,40,60,70,90,110,120,140,150,160],[140,140,170,170,150,140,130,100,80,60,40,20,0,30,50,60,80,90,110,120,130,140],[110,110,140,160,180,170,150,130,110,80,60,40,30,0,20,30,50,60,80,90,100,110],[90,100,120,140,160,170,170,150,130,100,80,60,50,20,0,10,30,50,60,70,80,100],[80,80,110,130,150,160,180,160,140,110,90,70,60,30,10,0,20,30,50,60,70,90],[60,60,90,110,130,140,160,180,160,130,110,90,80,50,30,20,0,10,30,40,50,70],[50,50,70,90,110,130,140,160,180,150,130,110,90,60,50,30,10,0,20,30,40,50],[30,30,60,80,100,110,130,150,170,160,140,120,110,80,60,50,30,20,0,10,20,40],[20,20,50,70,90,100,110,140,160,170,150,140,120,90,70,60,40,30,10,0,10,20],[10,10,40,60,80,90,100,130,150,170,160,150,130,100,80,70,50,40,20,10,0,10],[10,20,40,60,80,100,110,130,150,180,180,160,140,110,100,90,70,50,40,20,10,0]];
const ORR_M2=[[0,10,40,80,110,130,150,190,220,270,280,250,220,180,150,130,100,70,50,30,10,20],[10,0,40,70,100,130,150,180,220,260,290,250,230,180,160,140,100,80,60,40,20,30],[40,40,0,30,60,90,110,140,180,220,260,290,270,220,190,170,140,120,90,70,60,70],[80,70,30,0,30,50,80,110,150,190,220,250,280,250,230,210,170,150,130,110,90,100],[110,100,60,30,0,20,40,80,110,160,190,220,250,290,260,240,210,180,160,140,120,130],[130,130,90,50,20,0,20,60,90,140,170,200,220,270,280,260,230,210,180,160,150,160],[150,150,110,80,40,20,0,40,70,110,150,180,200,250,280,280,250,230,200,180,170,180],[190,180,140,110,80,60,40,0,30,80,110,140,170,210,240,260,290,260,240,220,200,210],[220,220,180,150,110,90,70,30,0,40,80,110,130,180,210,230,260,280,270,250,240,250],[270,260,220,190,160,140,110,80,40,0,30,60,90,140,160,180,210,240,260,280,280,290],[280,290,260,220,190,170,150,110,80,30,0,30,60,100,130,150,180,210,230,250,270,290],[250,250,290,250,220,200,180,140,110,60,30,0,30,70,100,120,150,170,200,220,230,260],[220,230,270,280,250,220,200,170,130,90,60,30,0,50,70,90,120,150,170,190,210,230],[180,180,220,250,290,270,250,210,180,140,100,70,50,0,30,50,80,100,130,150,160,190],[150,160,190,230,260,280,280,240,210,160,130,100,70,30,0,20,50,80,100,120,140,160],[130,140,170,210,240,260,280,260,230,180,150,120,90,50,20,0,30,60,80,100,110,140],[100,100,140,170,210,230,250,290,260,210,180,150,120,80,50,30,0,20,50,70,80,110],[70,80,120,150,180,210,230,260,280,240,210,170,150,100,80,60,20,0,20,40,60,80],[50,60,90,130,160,180,200,240,270,260,230,200,170,130,100,80,50,20,0,20,40,60],[30,40,70,110,140,160,180,220,250,280,250,220,190,150,120,100,70,40,20,0,20,40],[10,20,60,90,120,150,170,200,240,280,270,230,210,160,140,110,80,60,40,20,0,20],[20,30,70,100,130,160,180,210,250,290,290,260,230,190,160,140,110,80,60,40,20,0]];
const ORR_M3=[[0,10,80,140,190,230,270,340,400,470,500,440,390,310,260,230,170,130,90,50,20,40],[10,0,70,130,180,220,260,320,380,460,510,450,410,320,280,240,180,140,100,60,40,50],[80,70,0,60,110,150,190,260,320,400,450,510,470,390,340,310,250,210,170,130,100,120],[140,130,60,0,60,100,140,200,260,340,400,450,500,450,400,370,310,270,220,190,160,180],[190,180,110,60,0,40,80,140,200,280,340,390,440,510,460,420,370,320,280,250,220,240],[230,220,150,100,40,0,40,100,160,240,300,350,400,480,500,460,410,360,320,290,260,280],[270,260,190,140,80,40,0,60,120,200,260,310,360,440,490,500,450,400,360,330,300,320],[340,320,260,200,140,100,60,0,60,140,200,250,300,380,430,460,510,470,420,390,360,380],[400,380,320,260,200,160,120,60,0,80,140,190,240,320,370,400,460,500,480,450,420,440],[470,460,400,340,280,240,200,140,80,0,60,110,160,240,290,320,380,420,470,500,500,520],[500,510,450,400,340,300,260,200,140,60,0,50,100,180,230,270,320,360,410,440,470,510],[440,450,510,450,390,350,310,250,190,110,50,0,50,130,180,210,270,310,350,390,420,460],[390,410,470,500,440,400,360,300,240,160,100,50,0,80,130,170,220,260,310,340,370,410],[310,320,390,450,510,480,440,380,320,240,180,130,80,0,50,80,140,180,230,260,290,330],[260,280,340,400,460,500,490,430,370,290,230,180,130,50,0,40,90,130,180,210,240,280],[230,240,310,370,420,460,500,460,400,320,270,210,170,80,40,0,60,100,140,170,200,240],[170,180,250,310,370,410,450,510,460,380,320,270,220,140,90,60,0,40,90,120,150,190],[130,140,210,270,320,360,400,470,500,420,360,310,260,180,130,100,40,0,40,80,110,150],[90,100,170,220,280,320,360,420,480,470,410,350,310,230,180,140,90,40,0,30,60,100],[50,60,130,190,250,290,330,390,450,500,440,390,340,260,210,170,120,80,30,0,30,70],[20,40,100,160,220,260,300,360,420,500,470,420,370,290,240,200,150,110,60,30,0,40],[40,50,120,180,240,280,320,380,440,520,510,460,410,330,280,240,190,150,100,70,40,0]];
const ORR_M4=[[0,10,100,180,250,300,350,430,510,610,640,570,510,400,340,290,220,170,110,70,30,60],[10,0,90,160,240,290,340,420,500,600,650,580,520,420,360,310,240,180,130,80,50,70],[100,90,0,70,150,200,250,330,410,510,580,650,610,510,440,400,330,270,210,170,130,160],[180,160,70,0,70,130,170,260,330,440,510,580,640,580,520,470,400,350,290,250,210,230],[250,240,150,70,0,50,100,180,260,360,440,510,570,650,590,540,470,420,360,320,280,310],[300,290,200,130,50,0,50,130,210,310,380,460,510,620,640,600,530,470,410,370,330,360],[350,340,250,170,100,50,0,80,160,260,340,410,470,570,630,650,570,520,460,420,380,410],[430,420,330,260,180,130,80,0,80,180,250,320,380,490,550,600,660,600,550,500,460,490],[510,500,410,330,260,210,160,80,0,100,180,250,310,410,470,520,590,650,620,580,540,570],[610,600,510,440,360,310,260,180,100,0,70,140,200,310,370,420,490,540,600,640,640,670],[640,650,580,510,440,380,340,250,180,70,0,70,130,240,300,340,420,470,530,570,610,660],[570,580,650,580,510,460,410,320,250,140,70,0,60,170,230,270,350,400,460,500,540,590],[510,520,610,640,570,510,470,380,310,200,130,60,0,110,170,210,290,340,400,440,480,530],[400,420,510,580,650,620,570,490,410,310,240,170,110,0,60,110,180,230,290,330,370,420],[340,360,440,520,590,640,630,550,470,370,300,230,170,60,0,50,120,170,230,270,310,360],[290,310,400,470,540,600,650,600,520,420,340,270,210,110,50,0,70,130,180,230,260,320],[220,240,330,400,470,530,570,660,590,490,420,350,290,180,120,70,0,50,110,150,190,240],[170,180,270,350,420,470,520,600,650,540,470,400,340,230,170,130,50,0,60,100,140,190],[110,130,210,290,360,410,460,550,620,600,530,460,400,290,230,180,110,60,0,40,80,130],[70,80,170,250,320,370,420,500,580,640,570,500,440,330,270,230,150,100,40,0,40,90],[30,50,130,210,280,330,380,460,540,640,610,540,480,370,310,260,190,140,80,40,0,50],[60,70,160,230,310,360,410,490,570,670,660,590,530,420,360,320,240,190,130,90,50,0]];
const ORR_M5=[[0,20,150,250,360,430,500,620,730,880,920,820,730,580,490,420,320,240,160,100,40,80],[20,0,130,230,340,410,480,600,710,860,940,840,750,600,510,440,340,260,180,120,70,100],[150,130,0,110,210,290,360,470,590,730,840,940,880,730,640,570,470,390,310,250,190,230],[250,230,110,0,110,180,250,370,480,630,730,830,920,830,750,680,570,500,420,350,300,330],[360,340,210,110,0,70,150,260,370,520,630,730,810,940,850,780,680,600,520,460,400,440],[430,410,290,180,70,0,70,190,300,450,550,650,740,890,930,860,750,680,600,530,480,510],[500,480,360,250,150,70,0,120,230,380,480,580,670,820,910,930,830,750,670,600,550,580],[620,600,470,370,260,190,120,0,110,260,360,470,550,700,790,860,940,860,780,720,670,700],[730,710,590,480,370,300,230,110,0,150,250,360,440,590,680,750,850,930,890,830,780,810],[880,860,730,630,520,450,380,260,150,0,110,210,290,450,530,600,700,780,860,930,930,960],[920,940,840,730,630,550,480,360,250,110,0,100,190,340,430,500,600,680,760,820,870,950],[820,840,940,830,730,650,580,470,360,210,100,0,90,240,330,390,500,570,660,720,770,850],[730,750,880,920,810,740,670,550,440,290,190,90,0,150,240,310,410,490,570,630,690,760],[580,600,730,830,940,890,820,700,590,450,340,240,150,0,90,160,260,340,420,480,530,610],[490,510,640,750,850,930,910,790,680,530,430,330,240,90,0,70,170,250,330,390,450,520],[420,440,570,680,780,860,930,860,750,600,500,390,310,160,70,0,100,180,260,320,380,450],[320,340,470,570,680,750,830,940,850,700,600,500,410,260,170,100,0,80,160,220,280,350],[240,260,390,500,600,680,750,860,930,780,680,570,490,340,250,180,80,0,80,140,200,270],[160,180,310,420,520,600,670,780,890,860,760,660,570,420,330,260,160,80,0,60,120,190],[100,120,250,350,460,530,600,720,830,930,820,720,630,480,390,320,220,140,60,0,50,130],[40,70,190,300,400,480,550,670,780,930,870,770,690,530,450,380,280,200,120,50,0,70],[80,100,230,330,440,510,580,700,810,960,950,850,760,610,520,450,350,270,190,130,70,0]];
const ORR_M6=[[0,30,180,310,440,530,610,760,890,1070,1120,990,890,700,600,510,390,290,200,120,50,100],[30,0,150,280,410,500,590,730,870,1050,1140,1020,920,730,620,540,420,320,220,150,80,120],[180,150,0,130,260,350,430,580,710,890,1020,1140,1070,880,780,690,570,470,380,300,230,280],[310,280,130,0,130,220,300,450,580,760,890,1010,1120,1010,910,820,700,600,510,430,360,410],[440,410,260,130,0,90,180,320,450,630,760,890,990,1140,1040,950,830,730,630,560,490,530],[530,500,350,220,90,0,90,230,360,540,670,800,900,1080,1130,1040,920,820,720,650,580,620],[610,590,430,300,180,90,0,140,280,460,590,710,810,1000,1110,1130,1000,910,810,730,670,710],[760,730,580,450,320,230,140,0,130,310,440,570,670,860,960,1050,1150,1050,950,880,810,850],[890,870,710,580,450,360,280,130,0,180,310,430,540,720,830,910,1040,1130,1090,1010,950,990],[1070,1050,890,760,630,540,460,310,180,0,130,250,360,540,650,730,860,950,1050,1130,1130,1170],[1120,1140,1020,890,760,670,590,440,310,130,0,120,230,410,520,600,730,820,920,1000,1060,1150],[990,1020,1140,1010,890,800,710,570,430,250,120,0,100,290,400,480,600,700,800,870,940,1030],[890,920,1070,1120,990,900,810,670,540,360,230,100,0,180,290,370,500,600,690,770,840,930],[700,730,880,1010,1140,1080,1000,860,720,540,410,290,180,0,110,190,310,410,510,580,650,740],[600,620,780,910,1040,1130,1110,960,830,650,520,400,290,110,0,80,210,300,400,480,540,630],[510,540,690,820,950,1040,1130,1050,910,730,600,480,370,190,80,0,120,220,320,390,460,550],[390,420,570,700,830,920,1000,1150,1040,860,730,600,500,310,210,120,0,100,190,270,340,430],[290,320,470,600,730,820,910,1050,1130,950,820,700,600,410,300,220,100,0,100,170,240,330],[200,220,380,510,630,720,810,950,1090,1050,920,800,690,510,400,320,190,100,0,80,140,230],[120,150,300,430,560,650,730,880,1010,1130,1000,870,770,580,480,390,270,170,80,0,70,160],[50,80,230,360,490,580,670,810,950,1130,1060,940,840,650,540,460,340,240,140,70,0,90],[100,120,280,410,530,620,710,850,990,1170,1150,1030,930,740,630,550,430,330,230,160,90,0]];
const ORR_ALL_M={car_jeep_van_lmv:ORR_M1,lcv_minibus:ORR_M2,bus_2axle:ORR_M3,truck_3axle:ORR_M4,heavy_4_6axle:ORR_M5,oversized_7plus:ORR_M6};
function calcOrrToll(o,d,v="bus_2axle",t="single"){
  const oi=ORR_MAP[o],di=ORR_MAP[d];
  if(oi===undefined||di===undefined)return{singleFare:0,returnFare24h:0,selectedFare:0,savings:0};
  const m=ORR_ALL_M[v]||ORR_M3;
  const s=m[oi][di]||0;
  const r=s===0?0:Math.round(s*1.5);
  const sav=s===0?0:(s*2)-r;
  return{singleFare:s,returnFare24h:r,selectedFare:t==="return24h"?r:s,savings:sav,origin:ORR_IC[oi],destination:ORR_IC[di]};
}

const jsx = e.jsx, jsxs = e.jsxs;
function LogisticsTripCostCalculator({
  initialDistance = 650,
  initialMileage = 4.5,
  initialFuelPrice = 92.5,
  initialTolls = 1400,
  onSaveToDatabase,
  savedReportsCount = 0,
  onOpenReports
}) {
  const [emiMonthly, setEmiMonthly] = a.useState(42e3);
  const [driverSalaryMonthly, setDriverSalaryMonthly] = a.useState(22e3);
  const [insuranceAnnual, setInsuranceAnnual] = a.useState(65e3);
  const [roadTaxAnnual, setRoadTaxAnnual] = a.useState(28e3);
  const [permitsAnnual, setPermitsAnnual] = a.useState(18e3);
  const [workingDaysMonthly, setWorkingDaysMonthly] = a.useState(25);
  const [allocationMode, setAllocationMode] = a.useState("trips_frequency");
  const [tripsPerMonth, setTripsPerMonth] = a.useState(15);
  const [tripDays, setTripDays] = a.useState(2);
  const [distanceKm, setDistanceKm] = a.useState(initialDistance);
  const [mileageKmpl, setMileageKmpl] = a.useState(initialMileage);
  const [fuelPricePerLitre, setFuelPricePerLitre] = a.useState(initialFuelPrice);
  const [tollCost, setTollCost] = a.useState(initialTolls);
  const [tyreWearPerKm, setTyreWearPerKm] = a.useState(2.5);
  const [maintenancePerKm, setMaintenancePerKm] = a.useState(1.8);
  const [loadingUnloadingCost, setLoadingUnloadingCost] = a.useState(1200);
  const [driverBattaPerTrip, setDriverBattaPerTrip] = a.useState(800);
  const [targetMarginPct, setTargetMarginPct] = a.useState(15);
  const [clientOfferRevenue, setClientOfferRevenue] = a.useState(38e3);
  const [showClientOfferCompare, setShowClientOfferCompare] = a.useState(false);
  const [orrOrigin, setOrrOrigin] = a.useState("1");
  const [orrDestination, setOrrDestination] = a.useState("16");
  const [orrVehicle, setOrrVehicle] = a.useState("bus_2axle");
  const [orrTripType, setOrrTripType] = a.useState("single");
  const [orrApplied, setOrrApplied] = a.useState(false);
  const orrRes = calcOrrToll(orrOrigin, orrDestination, orrVehicle, orrTripType);
  const handleApplyOrrToll = () => {
    setTollCost(orrRes.selectedFare);
    setOrrApplied(true);
    setTimeout(() => setOrrApplied(false), 2e3);
    i.success(`Applied ORR Toll: \u20B9${orrRes.selectedFare} (${orrTripType === "return24h" ? "2-Way Return" : "1-Way Single"})`);
  };
  const handleSwapOrr = () => {
    const tmp = orrOrigin;
    setOrrOrigin(orrDestination);
    setOrrDestination(tmp);
  };
  const calc = a.useMemo(() => {
    const insuranceMonthly = (parseFloat(insuranceAnnual) || 0) / 12;
    const roadTaxMonthly = (parseFloat(roadTaxAnnual) || 0) / 12;
    const permitsMonthly = (parseFloat(permitsAnnual) || 0) / 12;
    const totalMonthlyFixed = (parseFloat(emiMonthly) || 0) + (parseFloat(driverSalaryMonthly) || 0) + insuranceMonthly + roadTaxMonthly + permitsMonthly;
    let allocatedFixedCost = 0;
    if (allocationMode === "trips_frequency") {
      const freq = Math.max(1, parseFloat(tripsPerMonth) || 1);
      allocatedFixedCost = totalMonthlyFixed / freq;
    } else {
      const workingDays = Math.max(1, parseFloat(workingDaysMonthly) || 25);
      const days = Math.max(0.5, parseFloat(tripDays) || 1);
      const fixedPerDay = totalMonthlyFixed / workingDays;
      allocatedFixedCost = fixedPerDay * days;
    }
    const dist = Math.max(0, parseFloat(distanceKm) || 0);
    const mileage = Math.max(0.1, parseFloat(mileageKmpl) || 1);
    const fuelPrice = Math.max(0, parseFloat(fuelPricePerLitre) || 0);
    const fuelLitres = dist / mileage;
    const fuelCost = fuelLitres * fuelPrice;
    const toll = parseFloat(tollCost) || 0;
    const tyreCost = dist * (parseFloat(tyreWearPerKm) || 0);
    const maintCost = dist * (parseFloat(maintenancePerKm) || 0);
    const loadingCost = parseFloat(loadingUnloadingCost) || 0;
    const battaCost = parseFloat(driverBattaPerTrip) || 0;
    const totalVariableCost = fuelCost + toll + tyreCost + maintCost + loadingCost + battaCost;
    const totalTripCost = allocatedFixedCost + totalVariableCost;
    const costPerKm = dist > 0 ? totalTripCost / dist : 0;
    const variableCostPerKm = dist > 0 ? totalVariableCost / dist : 0;
    const fixedCostPerKm = dist > 0 ? allocatedFixedCost / dist : 0;
    const breakEvenRate = totalTripCost;
    const marginPct = parseFloat(targetMarginPct) || 0;
    const recommendedQuote = totalTripCost * (1 + marginPct / 100);
    const expectedProfit = recommendedQuote - totalTripCost;
    const quotePerKm = dist > 0 ? recommendedQuote / dist : 0;
    const minBidMarginPct = 6;
    const minBidAmount = totalTripCost * (1 + minBidMarginPct / 100);
    const minBidProfit = minBidAmount - totalTripCost;
    const minBidRatePerKm = dist > 0 ? minBidAmount / dist : 0;
    const medBidMarginPct = 15;
    const medBidAmount = totalTripCost * (1 + medBidMarginPct / 100);
    const medBidProfit = medBidAmount - totalTripCost;
    const medBidRatePerKm = dist > 0 ? medBidAmount / dist : 0;
    const maxBidMarginPct = 28;
    const maxBidAmount = totalTripCost * (1 + maxBidMarginPct / 100);
    const maxBidProfit = maxBidAmount - totalTripCost;
    const maxBidRatePerKm = dist > 0 ? maxBidAmount / dist : 0;
    const clientOffer = parseFloat(clientOfferRevenue) || 0;
    const clientNetProfit = clientOffer - totalTripCost;
    const clientMarginPct = clientOffer > 0 ? clientNetProfit / clientOffer * 100 : 0;
    return {
      totalMonthlyFixed,
      insuranceMonthly,
      roadTaxMonthly,
      permitsMonthly,
      allocatedFixedCost,
      fuelLitres,
      fuelCost,
      toll,
      tyreCost,
      maintCost,
      loadingCost,
      battaCost,
      totalVariableCost,
      totalTripCost,
      costPerKm,
      variableCostPerKm,
      fixedCostPerKm,
      breakEvenRate,
      recommendedQuote,
      expectedProfit,
      quotePerKm,
      minBidMarginPct,
      minBidAmount,
      minBidProfit,
      minBidRatePerKm,
      medBidMarginPct,
      medBidAmount,
      medBidProfit,
      medBidRatePerKm,
      maxBidMarginPct,
      maxBidAmount,
      maxBidProfit,
      maxBidRatePerKm,
      clientOffer,
      clientNetProfit,
      clientMarginPct
    };
  }, [
    emiMonthly,
    driverSalaryMonthly,
    insuranceAnnual,
    roadTaxAnnual,
    permitsAnnual,
    workingDaysMonthly,
    allocationMode,
    tripsPerMonth,
    tripDays,
    distanceKm,
    mileageKmpl,
    fuelPricePerLitre,
    tollCost,
    tyreWearPerKm,
    maintenancePerKm,
    loadingUnloadingCost,
    driverBattaPerTrip,
    targetMarginPct,
    clientOfferRevenue
  ]);
  const inr = (val) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(val || 0));
  const handleReset = () => {
    setEmiMonthly(42e3);
    setDriverSalaryMonthly(22e3);
    setInsuranceAnnual(65e3);
    setRoadTaxAnnual(28e3);
    setPermitsAnnual(18e3);
    setWorkingDaysMonthly(25);
    setAllocationMode("trips_frequency");
    setTripsPerMonth(15);
    setTripDays(2);
    setDistanceKm(650);
    setMileageKmpl(4.5);
    setFuelPricePerLitre(92.5);
    setTollCost(1400);
    setTyreWearPerKm(2.5);
    setMaintenancePerKm(1.8);
    setLoadingUnloadingCost(1200);
    setDriverBattaPerTrip(800);
    setTargetMarginPct(15);
    setClientOfferRevenue(38e3);
    i.success("Reset calculator to heavy commercial 32ft truck standards");
  };
  const handleCopyWhatsAppQuote = () => {
    const text = `\u{1F69A} *JAI BHAVANI CARGO - TRIP FREIGHT QUOTATION*
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u{1F4CD} *Trip Distance:* ${distanceKm} KM
\u{1F5D3}\uFE0F *Operating Frequency:* ${tripsPerMonth} Trips/Month

*COST STRUCTURE [A + B]:*
\u2022 *[A] Allocated Fixed Overhead:* ${inr(calc.allocatedFixedCost)}
\u2022 *[B] Variable Running Costs:* ${inr(calc.totalVariableCost)}
  _(Fuel: ${inr(calc.fuelCost)} | Tolls: ${inr(calc.toll)} | Tyre: ${inr(calc.tyreCost)} | Maint: ${inr(calc.maintCost)} | Labour/Batta: ${inr(calc.loadingCost + calc.battaCost)})_

*TOTAL NET TRIP COST:* ${inr(calc.totalTripCost)} (\u20B9${calc.costPerKm.toFixed(2)}/KM)
*BREAK-EVEN RATE:* ${inr(calc.breakEvenRate)}
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u{1F3AF} *THREE-TIER BIDDING RATES:*
\u2022 \u{1F7E2} *MINIMUM BID (Floor / Backhaul):* ${inr(calc.minBidAmount)} (\u20B9${calc.minBidRatePerKm.toFixed(2)}/KM \u2022 +${calc.minBidMarginPct}%)
\u2022 \u{1F535} *MEDIUM BID (Standard Target):* ${inr(calc.medBidAmount)} (\u20B9${calc.medBidRatePerKm.toFixed(2)}/KM \u2022 +${calc.medBidMarginPct}%)
\u2022 \u{1F7E3} *MAXIMUM BID (Peak / Urgent):* ${inr(calc.maxBidAmount)} (\u20B9${calc.maxBidRatePerKm.toFixed(2)}/KM \u2022 +${calc.maxBidMarginPct}%)
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u2B50 *CURRENT QUOTE SELECTED:* ${inr(calc.recommendedQuote)}
_Generated via Jai Bhavani Cargo Fleet Intelligence_`;
    navigator.clipboard.writeText(text);
    i.success("Copied 3-Tier Freight Quote to Clipboard!");
  };
  const handlePrint = () => {
    window.print();
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-5 bg-card border border-border/80 rounded-3xl shadow-sm space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5", children: /* @__PURE__ */ jsx("span", { children: "\u26A1 OPERATIONAL FREQUENCY SCENARIOS" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground mt-0.5", children: "How many trips does this truck complete per month?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "A 4-trip long haul must absorb 1/4th of the monthly EMI & salary, while a 30-trip local route absorbs 1/30th." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Allocation Model:" }),
          /* @__PURE__ */ jsxs("div", { className: "p-0.5 bg-muted rounded-xl flex", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setAllocationMode("trips_frequency"),
                className: `px-3 py-1 text-xs font-bold rounded-lg transition ${allocationMode === "trips_frequency" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                children: "By Trips / Mo"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setAllocationMode("trip_days"),
                className: `px-3 py-1 text-xs font-bold rounded-lg transition ${allocationMode === "trip_days" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                children: "By Trip Days"
              }
            )
          ] })
        ] })
      ] }),
      allocationMode === "trips_frequency" ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1", children: [
        {
          trips: 4,
          title: "4 Trips / Month",
          type: "Long-Haul Line-Haul",
          desc: "1,500-2,500 KM (Hyd-Del/Mum), ~7 days",
          badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30"
        },
        {
          trips: 15,
          title: "15 Trips / Month",
          type: "Regional Inter-State",
          desc: "500-800 KM (Hyd-Blr/Chn), ~2 days",
          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30"
        },
        {
          trips: 30,
          title: "30 Trips / Month",
          type: "Daily Express / Local",
          desc: "150-300 KM (Warangal/VJA), 1 day",
          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
        },
        {
          trips: "custom",
          title: "Custom Frequency",
          type: "Flexible Allocation",
          desc: "Specify exact monthly trips",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30"
        }
      ].map((scenario) => {
        const isSelected = scenario.trips === "custom" ? tripsPerMonth !== 4 && tripsPerMonth !== 15 && tripsPerMonth !== 30 : tripsPerMonth === scenario.trips;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              if (scenario.trips !== "custom") setTripsPerMonth(scenario.trips);
              else if (tripsPerMonth === 4 || tripsPerMonth === 15 || tripsPerMonth === 30) {
                setTripsPerMonth(10);
              }
            },
            className: `p-3.5 rounded-2xl text-left border transition flex flex-col justify-between ${isSelected ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary" : "bg-card hover:bg-muted/30 border-border/60"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: scenario.title }),
                  /* @__PURE__ */ jsx("span", { className: `text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${scenario.badgeColor}`, children: scenario.type })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground line-clamp-1", children: scenario.desc })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "pt-2 mt-2 border-t border-border/30 flex items-baseline justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Fixed Burden [A]:" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-bold font-mono text-primary", children: scenario.trips === "custom" ? inr(calc.allocatedFixedCost) : inr(calc.totalMonthlyFixed / scenario.trips) })
              ] })
            ]
          },
          scenario.title
        );
      }) }) : /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/20 border border-border/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: "Trip Duration Based Allocation" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
            "Monthly fixed cost (",
            inr(calc.totalMonthlyFixed),
            ") is divided across ",
            workingDaysMonthly,
            " working days = ",
            inr(calc.totalMonthlyFixed / workingDaysMonthly),
            " / day."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "Trip Days:" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0.5",
                max: "30",
                step: "0.5",
                value: tripDays,
                onChange: (e) => setTripDays(parseFloat(e.target.value) || 1),
                className: "w-20 h-9 px-2 text-center text-xs font-mono font-bold bg-background border border-border rounded-xl"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-primary font-mono bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20", children: [
            "[A] Burden: ",
            inr(calc.allocatedFixedCost)
          ] })
        ] })
      ] }),
      allocationMode === "trips_frequency" && tripsPerMonth !== 4 && tripsPerMonth !== 15 && tripsPerMonth !== 30 && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-amber-500", children: "Enter Custom Trips Completed Per Month:" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              min: "1",
              max: "100",
              value: tripsPerMonth,
              onChange: (e) => setTripsPerMonth(Math.max(1, parseInt(e.target.value) || 1)),
              className: "w-24 h-8 px-2 text-center text-xs font-mono font-bold bg-background border border-amber-500/40 rounded-xl text-foreground"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "trips/month" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 bg-gradient-to-br from-card via-card to-primary/[0.04] border-2 border-primary/30 rounded-3xl shadow-lg space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-primary text-primary-foreground uppercase", children: "FORMULA: [A] + [B]" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground", children: "32ft Container / Commercial Fleet Cost Structure" })
          ] }),
          /* @__PURE__ */ jsxs("h2", { className: "text-xl sm:text-2xl font-black font-heading text-foreground", children: [
            "Total Trip Cost = ",
            inr(calc.allocatedFixedCost),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-primary font-bold text-sm", children: "[A]" }),
            " + ",
            inr(calc.totalVariableCost),
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-emerald-500 font-bold text-sm", children: "[B]" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleCopyWhatsAppQuote,
              className: "px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 transition active:scale-95",
              children: /* @__PURE__ */ jsx("span", { children: "\u{1F4CB} Copy WhatsApp Quote" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handlePrint,
              className: "px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border/60 transition",
              children: "\u{1F5A8}\uFE0F Print"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleReset,
              className: "px-3 py-2 rounded-xl text-xs font-semibold bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition",
              title: "Reset to 32ft commercial standards",
              children: "\u21BA Reset"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block", children: "TOTAL NET TRIP COST" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black font-mono text-foreground", children: inr(calc.totalTripCost) }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground font-medium", children: [
            "\u20B9",
            calc.costPerKm.toFixed(2),
            " / KM over ",
            distanceKm,
            " KMs"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-amber-500 block", children: "BREAK-EVEN FREIGHT RATE" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black font-mono text-amber-500", children: inr(calc.breakEvenRate) }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-amber-500/80 font-medium", children: "Zero-profit booking threshold" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block", children: "RECOMMENDED QUOTE" }),
            /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400", children: [
              "+",
              targetMarginPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black font-mono text-emerald-400", children: inr(calc.recommendedQuote) }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-emerald-400/80 font-medium", children: [
            "Rate: \u20B9",
            calc.quotePerKm.toFixed(2),
            "/KM \u2022 Net: +",
            inr(calc.expectedProfit)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-muted/30 border border-border/60 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block", children: "FUEL EXPENSE BURDEN" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-black font-mono text-primary", children: inr(calc.fuelCost) }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground font-medium", children: [
            calc.fuelLitres.toFixed(1),
            " L diesel (",
            Math.round(calc.fuelCost / (calc.totalTripCost || 1) * 100),
            "% of total trip cost)"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-card/60 border border-border/50 rounded-2xl space-y-2.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx("span", { children: "Target Net Profit Margin:" }),
            /* @__PURE__ */ jsxs("span", { className: "text-emerald-500 font-extrabold font-mono text-sm", children: [
              targetMarginPct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: [10, 15, 20, 25].map((pct) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setTargetMarginPct(pct),
              className: `px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${targetMarginPct === pct ? "bg-emerald-500 text-white border-emerald-500 shadow-sm" : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/40"}`,
              children: [
                pct,
                "%"
              ]
            },
            pct
          )) })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "35",
            step: "1",
            value: targetMarginPct,
            onChange: (e) => setTargetMarginPct(parseFloat(e.target.value) || 0),
            className: "w-full accent-emerald-500 cursor-pointer h-2 bg-muted rounded-lg"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "pt-3 border-t border-border/50 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30", children: "\u{1F3AF} BIDDING INTELLIGENCE" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-foreground", children: "Three Strategic Quotation Benchmarks" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "Click any tier to auto-apply its margin to your quote" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3.5", children: [
          /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${targetMarginPct === calc.minBidMarginPct ? "bg-amber-500/10 border-amber-500 shadow-md ring-1 ring-amber-500/30" : "bg-muted/20 border-amber-500/30 hover:border-amber-500/60"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-amber-500/20 text-amber-500 border border-amber-500/30", children: "\u{1F7E2} Minimum Bid" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-bold text-amber-500", children: [
                  "+",
                  calc.minBidMarginPct,
                  "% Margin"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-semibold", children: "Floor / Backhaul / Tender" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-black font-mono text-foreground mt-0.5", children: inr(calc.minBidAmount) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground space-y-0.5 font-medium", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Rate: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground", children: [
                    "\u20B9",
                    calc.minBidRatePerKm.toFixed(2),
                    "/KM"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Net Profit: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-400", children: [
                    "+",
                    inr(calc.minBidProfit)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40", children: "Floor pricing for return loads, empty backhauls, or highly contested tenders. Covers all costs with a safety buffer." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setTargetMarginPct(calc.minBidMarginPct),
                className: `mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${targetMarginPct === calc.minBidMarginPct ? "bg-amber-500 text-white shadow-sm" : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30"}`,
                children: targetMarginPct === calc.minBidMarginPct ? "\u2713 Active Bid Selected" : "Select Minimum Bid"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${targetMarginPct === calc.medBidMarginPct ? "bg-blue-500/10 border-blue-500 shadow-md ring-1 ring-blue-500/30" : "bg-muted/20 border-blue-500/30 hover:border-blue-500/60"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-blue-500/20 text-blue-400 border border-blue-500/30", children: "\u{1F535} Medium Bid" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-bold text-blue-400", children: [
                  "+",
                  calc.medBidMarginPct,
                  "% Margin"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-semibold", children: "Standard Commercial Target" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-black font-mono text-foreground mt-0.5", children: inr(calc.medBidAmount) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground space-y-0.5 font-medium", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Rate: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground", children: [
                    "\u20B9",
                    calc.medBidRatePerKm.toFixed(2),
                    "/KM"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Net Profit: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-400", children: [
                    "+",
                    inr(calc.medBidProfit)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40", children: "Standard market rate for regular contracts and dedicated trips. Generates solid enterprise profit while staying competitive." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setTargetMarginPct(calc.medBidMarginPct),
                className: `mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${targetMarginPct === calc.medBidMarginPct ? "bg-blue-600 text-white shadow-sm" : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"}`,
                children: targetMarginPct === calc.medBidMarginPct ? "\u2713 Active Bid Selected" : "Select Medium Bid"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${targetMarginPct === calc.maxBidMarginPct ? "bg-purple-500/10 border-purple-500 shadow-md ring-1 ring-purple-500/30" : "bg-muted/20 border-purple-500/30 hover:border-purple-500/60"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-purple-500/20 text-purple-400 border border-purple-500/30", children: "\u{1F7E3} Maximum Bid" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-mono font-bold text-purple-400", children: [
                  "+",
                  calc.maxBidMarginPct,
                  "% Margin"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-semibold", children: "Peak Demand / Urgent / Premium" }),
                /* @__PURE__ */ jsx("div", { className: "text-2xl font-black font-mono text-foreground mt-0.5", children: inr(calc.maxBidAmount) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground space-y-0.5 font-medium", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "Rate: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-foreground", children: [
                    "\u20B9",
                    calc.maxBidRatePerKm.toFixed(2),
                    "/KM"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  "Net Profit: ",
                  /* @__PURE__ */ jsxs("span", { className: "font-bold text-emerald-400", children: [
                    "+",
                    inr(calc.maxBidProfit)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/90 leading-tight pt-1.5 border-t border-border/40", children: "Premium quotation for urgent express dispatches, festive peak seasons, fragile freight, or difficult terrain routes." })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setTargetMarginPct(calc.maxBidMarginPct),
                className: `mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${targetMarginPct === calc.maxBidMarginPct ? "bg-purple-600 text-white shadow-sm" : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30"}`,
                children: targetMarginPct === calc.maxBidMarginPct ? "\u2713 Active Bid Selected" : "Select Maximum Bid"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-card/80 border border-border/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block", children: "CLIENT OFFER STRESS TEST" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: "Client's Proposed Freight:" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("span", { className: "absolute left-2.5 top-1.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: "0",
                    step: "500",
                    value: clientOfferRevenue,
                    onChange: (e) => setClientOfferRevenue(parseFloat(e.target.value) || 0),
                    className: "w-32 h-7 pl-6 pr-2 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground",
                    placeholder: "Enter offer"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Margin on Offer:" }),
              /* @__PURE__ */ jsxs("span", { className: `text-xs font-mono font-black ${calc.clientNetProfit >= 0 ? "text-emerald-400" : "text-rose-500"}`, children: [
                calc.clientMarginPct.toFixed(1),
                "% (",
                calc.clientNetProfit >= 0 ? `+${inr(calc.clientNetProfit)}` : `-${inr(Math.abs(calc.clientNetProfit))}`,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${calc.clientOffer >= calc.maxBidAmount ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : calc.clientOffer >= calc.medBidAmount ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : calc.clientOffer >= calc.minBidAmount ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`, children: [
              calc.clientOffer >= calc.maxBidAmount && /* @__PURE__ */ jsx("span", { children: "\u{1F7E3} Premium Win" }),
              calc.clientOffer >= calc.medBidAmount && calc.clientOffer < calc.maxBidAmount && /* @__PURE__ */ jsx("span", { children: "\u{1F7E2} Highly Profitable" }),
              calc.clientOffer >= calc.minBidAmount && calc.clientOffer < calc.medBidAmount && /* @__PURE__ */ jsx("span", { children: "\u{1F7E1} Acceptable Backhaul" }),
              calc.clientOffer < calc.minBidAmount && calc.clientOffer >= calc.breakEvenRate && /* @__PURE__ */ jsx("span", { children: "\u26A0\uFE0F Zero Profit Buffer" }),
              calc.clientOffer < calc.breakEvenRate && /* @__PURE__ */ jsx("span", { children: "\u{1F534} Direct Loss (Reject)" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 bg-card border border-border/70 rounded-3xl shadow-sm space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/50 pb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20", children: /* @__PURE__ */ jsx(Xe, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-purple-400 block", children: "PART [A]" }),
              /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground", children: "Fixed Fleet Overhead (Monthly Base)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Monthly Pool:" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-black font-mono text-purple-400", children: inr(calc.totalMonthlyFixed) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Expenses that remain constant regardless of running KMs. These are divided by your expected trip frequency to calculate the fixed overhead this trip must absorb." }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Vehicle EMI / Loan" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground font-bold", children: [
                inr(emiMonthly),
                "/mo"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "500",
                  value: emiMonthly,
                  onChange: (e) => setEmiMonthly(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Driver Monthly Salary" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground font-bold", children: [
                inr(driverSalaryMonthly),
                "/mo"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "500",
                  value: driverSalaryMonthly,
                  onChange: (e) => setDriverSalaryMonthly(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Annual Comprehensive Insurance" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "(",
                inr(calc.insuranceMonthly),
                "/mo)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "1000",
                  value: insuranceAnnual,
                  onChange: (e) => setInsuranceAnnual(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Road Tax (Annual Equivalent)" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "(",
                inr(calc.roadTaxMonthly),
                "/mo)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "500",
                  value: roadTaxAnnual,
                  onChange: (e) => setRoadTaxAnnual(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "National Permits & Fitness" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "(",
                inr(calc.permitsMonthly),
                "/mo)"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "500",
                  value: permitsAnnual,
                  onChange: (e) => setPermitsAnnual(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Working Days Per Month" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "Default 25 days" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1",
                max: "31",
                value: workingDaysMonthly,
                onChange: (e) => setWorkingDaysMonthly(parseInt(e.target.value) || 25),
                className: "w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-purple-500"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "Allocated Fixed Cost For This Trip [A]:" }),
            /* @__PURE__ */ jsx("span", { className: "text-base font-black font-mono text-purple-400", children: inr(calc.allocatedFixedCost) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground leading-relaxed", children: [
            "Calculation: Total monthly fixed overhead of ",
            /* @__PURE__ */ jsx("strong", { children: inr(calc.totalMonthlyFixed) }),
            " divided by",
            " ",
            /* @__PURE__ */ jsx("strong", { children: allocationMode === "trips_frequency" ? `${tripsPerMonth} trips/month` : `${workingDaysMonthly} working days \xD7 ${tripDays} trip days` }),
            " ",
            "= ",
            /* @__PURE__ */ jsx("strong", { children: inr(calc.allocatedFixedCost) }),
            " (\u20B9",
            calc.fixedCostPerKm.toFixed(2),
            "/KM)."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 bg-card border border-border/70 rounded-3xl shadow-sm space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/50 pb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", children: /* @__PURE__ */ jsx(Ge, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-wider text-emerald-400 block", children: "PART [B]" }),
              /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-foreground", children: "Variable Trip-Specific Costs" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground block", children: "Total Variable:" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-black font-mono text-emerald-400", children: inr(calc.totalVariableCost) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Direct operational expenses incurred solely for this journey (Diesel, Fastag tolls, Tyre and Maintenance wear per KM, Batta, and Loading)." }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
              /* @__PURE__ */ jsx("label", { className: "font-semibold text-foreground", children: "Trip Distance (KM)" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setDistanceKm((prev) => Math.round(prev * 2)),
                    className: "text-[10px] px-2 py-0.5 bg-muted rounded border border-border hover:bg-muted/80 text-muted-foreground",
                    title: "Convert to Round Trip",
                    children: "\u21C4 2-Way Round Trip"
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground font-black text-sm", children: [
                  distanceKm,
                  " KM"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "10",
                max: "5000",
                value: distanceKm,
                onChange: (e) => setDistanceKm(Math.max(0, parseFloat(e.target.value) || 0)),
                className: "w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Vehicle Mileage (KM/L)" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground font-bold", children: [
                mileageKmpl,
                " KMPL"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "1.0",
                max: "15.0",
                step: "0.1",
                value: mileageKmpl,
                onChange: (e) => setMileageKmpl(parseFloat(e.target.value) || 4.5),
                className: "w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Diesel Price (\u20B9/Litre)" }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-foreground font-bold", children: [
                "\u20B9",
                fuelPricePerLitre,
                "/L"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "50",
                  max: "150",
                  step: "0.5",
                  value: fuelPricePerLitre,
                  onChange: (e) => setFuelPricePerLitre(parseFloat(e.target.value) || 92.5),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Highway Toll Charges (\u20B9)" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground font-bold", children: inr(tollCost) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "100",
                  value: tollCost,
                  onChange: (e) => setTollCost(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Driver Batta / Allowance" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground font-bold", children: inr(driverBattaPerTrip) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "100",
                  value: driverBattaPerTrip,
                  onChange: (e) => setDriverBattaPerTrip(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Tyre Wear Cost (\u20B9/KM)" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "(",
                inr(calc.tyreCost),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                max: "10",
                step: "0.1",
                value: tyreWearPerKm,
                onChange: (e) => setTyreWearPerKm(parseFloat(e.target.value) || 0),
                className: "w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Maintenance / Servicing (\u20B9/KM)" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                "(",
                inr(calc.maintCost),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                min: "0",
                max: "10",
                step: "0.1",
                value: maintenancePerKm,
                onChange: (e) => setMaintenancePerKm(parseFloat(e.target.value) || 0),
                className: "w-full h-9 px-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-semibold text-muted-foreground flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Loading / Unloading / Hamali Charges (Fixed per trip)" }),
              /* @__PURE__ */ jsx("span", { className: "font-mono text-foreground font-bold", children: inr(loadingUnloadingCost) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-2.5 text-xs text-muted-foreground font-bold", children: "\u20B9" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "100",
                  value: loadingUnloadingCost,
                  onChange: (e) => setLoadingUnloadingCost(parseFloat(e.target.value) || 0),
                  className: "w-full h-9 pl-7 pr-3 text-xs font-mono font-bold bg-muted/30 border border-border/80 rounded-xl focus:border-emerald-500"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-3.5 bg-slate-950/70 border border-border/80 rounded-2xl space-y-3 shadow-inner", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded", children: "ORR" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-200", children: "Hyderabad ORR Toll Calculator" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 font-medium", children: "2024-25 Matrix" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-5 gap-2 items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400", children: "Origin" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: orrOrigin,
                  onChange: (e) => setOrrOrigin(e.target.value),
                  className: "w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-primary",
                  children: ORR_IC.map((ic) => /* @__PURE__ */ jsxs("option", { value: ic.id, className: "bg-slate-900 text-white", children: [
                    "IC ",
                    ic.code,
                    " - ",
                    ic.name
                  ] }, `orig-${ic.id}`))
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "sm:col-span-1 flex justify-center pt-2 sm:pt-4", children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleSwapOrr,
                title: "Swap Origin & Destination",
                className: "p-1.5 rounded-lg bg-muted/30 hover:bg-muted border border-border/60 text-slate-300 hover:text-white transition active:scale-95",
                children: "\u21C4"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-bold text-slate-400", children: "Destination" }),
              /* @__PURE__ */ jsx(
                "select",
                {
                  value: orrDestination,
                  onChange: (e) => setOrrDestination(e.target.value),
                  className: "w-full h-8 text-xs bg-muted/40 border border-border/80 rounded-lg px-2 text-white font-medium focus:outline-none focus:border-primary",
                  children: ORR_IC.map((ic) => /* @__PURE__ */ jsxs("option", { value: ic.id, className: "bg-slate-900 text-white", children: [
                    "IC ",
                    ic.code,
                    " - ",
                    ic.name
                  ] }, `dest-${ic.id}`))
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setOrrTripType("single"),
                className: `py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${orrTripType === "single" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/30 text-slate-400 border border-border/50"}`,
                children: /* @__PURE__ */ jsxs("span", { children: [
                  "1-Way Single: \u20B9",
                  orrRes.singleFare
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setOrrTripType("return24h"),
                className: `py-1 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${orrTripType === "return24h" ? "bg-emerald-600 text-white shadow-sm" : "bg-muted/30 text-slate-400 border border-border/50"}`,
                children: /* @__PURE__ */ jsxs("span", { children: [
                  "2-Way 24h: \u20B9",
                  orrRes.returnFare24h
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-border/40 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-white font-mono", children: [
              "Calculated Toll: \u20B9",
              orrRes.selectedFare
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleApplyOrrToll,
                className: "px-3 py-1 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-sm transition",
                children: orrApplied ? "\u2713 Applied to Tolls" : "Apply to Tolls \u2192"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-5 bg-card border border-border/70 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-foreground", children: "Save or Export This Trip Simulation" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Store this [A + B] breakdown to track route margins and client bidding trends over time." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        onOpenReports && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: onOpenReports,
            className: "px-3.5 py-2 bg-muted hover:bg-muted/80 text-foreground border border-border/60 rounded-xl text-xs font-bold transition",
            children: [
              "Saved Reports (",
              savedReportsCount,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => onSaveToDatabase && onSaveToDatabase({
              distance: distanceKm,
              mileage: mileageKmpl,
              fuel_price: fuelPricePerLitre,
              tolls: tollCost,
              total_fixed_allocated: calc.allocatedFixedCost,
              total_variable: calc.totalVariableCost,
              total_expenses: calc.totalTripCost,
              break_even_rate: calc.breakEvenRate,
              recommended_quote: calc.recommendedQuote,
              target_margin_pct: targetMarginPct,
              trips_per_month: tripsPerMonth
            }),
            className: "px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsx(U, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { children: "Save Calculation" })
            ]
          }
        )
      ] })
    ] })
  ] });
}


function vs(){const[b,A]=a.useState([1477]),[g,O]=a.useState([103.8]),[f,$]=a.useState([11.5]),[j,B]=a.useState([1860]),[orrOrigin,setOrrOrigin]=a.useState("1"),[orrDestination,setOrrDestination]=a.useState("16"),[orrVehicle,setOrrVehicle]=a.useState("bus_2axle"),[orrTripType,setOrrTripType]=a.useState("single"),[orrApplied,setOrrApplied]=a.useState(false),[N,q]=a.useState([1200]),[v,K]=a.useState([3]),[_,Z]=a.useState(0),[S,ee]=a.useState(0),[D,se]=a.useState(0),[y,te]=a.useState(15e3),[w,ae]=a.useState(1),[De,T]=a.useState(!1),[z,re]=a.useState(!1),[m,H]=a.useState({routeName:"",vehicleNumber:""}),[Te,Re]=a.useState([]),[Fe,Me]=a.useState([]),[le,Ee]=a.useState([]),[Le,ne]=a.useState(!1),[oe,W]=a.useState("calculator"),[t,R]=a.useState(null),F=async()=>{ne(!0);try{const r=await(await fetch("/hcgi/api/trip-calculations/list")).json();r.success?Ee(r.calculations||[]):i.error(r.error||"Failed to fetch saved calculations")}catch(s){console.error(s),i.error("Failed to load saved calculations")}finally{ne(!1)}},Pe=async s=>{if(window.confirm("Are you sure you want to delete this saved calculation report?"))try{const u=await(await fetch(`/hcgi/api/trip-calculations/${s}`,{method:"DELETE"})).json();u.success?(i.success("Report deleted successfully"),F()):i.error(u.error||"Failed to delete report")}catch(r){console.error(r),i.error("Failed to delete report. Connection error.")}},de=s=>{A([s.distance||1477]),O([s.fuel_price||103.8]),$([s.mileage||11.5]),B([s.tolls||1860]),q([s.driver_expenses||1200]),K([s.tyre_depreciation_rate||3]),Z(s.vehicle_emi||0),ee(s.insurance||0),se(s.quarterly_tax||0),te(s.freight_revenue||15e3),ae(s.tds_rate!==void 0?s.tds_rate:1),W("calculator"),i.success(`Loaded parameters for Route: ${s.route_name}`)};a.useEffect(()=>{(async()=>{try{const[r,u]=await Promise.all([Se.collection("routes").getFullList({sort:"route_name",$autoCancel:!1}),Se.collection("trucks").getFullList({sort:"truck_number",$autoCancel:!1})]);Re(r),Me(u)}catch(r){console.error("Failed to load routes/trucks data:",r)}})(),F()},[]);const{fuelCost:Ie,tyreExpense:Ve,totalExpenses:ie,tdsAmount:Q,netProfit:o,profitMargin:h,chartData:ce}=a.useMemo(()=>{const s=b[0]||0,r=g[0]||0,u=f[0]||1,M=j[0]||0,Oe=N[0]||0,$e=v[0]||0,Be=parseFloat(_)||0,qe=parseFloat(S)||0,Ke=parseFloat(D)||0,E=parseFloat(y)||0,ze=parseFloat(w)||0,xe=s/u*r,me=s*$e,X=xe+me+M+Oe+Be+qe+Ke,G=E*ze/100,J=E-G-X,He=E>0?J/E*100:0,We=[{name:"Expenses",value:X,color:"hsl(var(--primary))"},{name:"TDS Deducted",value:G,color:"hsl(var(--warning))"},{name:"Net Profit",value:Math.max(J,0),color:"hsl(var(--success))"}];return{fuelCost:xe,tyreExpense:me,totalExpenses:X,tdsAmount:G,netProfit:J,profitMargin:He,chartData:We}},[b,g,f,j,N,v,_,S,D,y,w]),l=s=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(s||0),
orrRes=calcOrrToll(orrOrigin,orrDestination,orrVehicle,orrTripType),
applyOrrToll=()=>{B([orrRes.selectedFare]);setOrrApplied(true);setTimeout(()=>setOrrApplied(false),2000);i.success("Applied ORR toll: ₹"+orrRes.selectedFare+" ("+(orrTripType==="return24h"?"2-Way 24h Return":"1-Way Single")+")")},
swapOrr=()=>{const tmp=orrOrigin;setOrrOrigin(orrDestination);setOrrDestination(tmp)},Ae=async s=>{if(s.preventDefault(),!m.routeName){i.error("Route Name is required to save calculation.");return}re(!0);try{const r={route_name:m.routeName,vehicle_number:m.vehicleNumber==="none"?"":m.vehicleNumber,distance:b[0],fuel_price:g[0],mileage:f[0],tolls:j[0],driver_expenses:N[0],tyre_depreciation_rate:v[0],tyre_expense:Ve,fuel_cost:Ie,vehicle_emi:parseFloat(_)||0,insurance:parseFloat(S)||0,quarterly_tax:parseFloat(D)||0,freight_revenue:parseFloat(y)||0,total_expenses:ie,net_profit:o,profit_margin:h,tds_rate:parseFloat(w)||0,tds_amount:Q},M=await(await fetch("/hcgi/api/trip-calculations/save",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)})).json();M.success?(i.success("Trip calculation report saved successfully!"),T(!1),H({routeName:"",vehicleNumber:""}),F()):i.error(M.error||"Failed to save calculation.")}catch(r){console.error("Save trip calculation error:",r),i.error("Failed to save calculation. Connection error.")}finally{re(!1)}};return e.jsxs("div",{className:"p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500",children:[e.jsxs(Qe,{children:[e.jsx("title",{children:"Trip Overview | Logistics Hub"}),e.jsx("meta",{name:"description",content:"Calculate trip profitability, expenses, and margins"})]}),e.jsxs("div",{className:"flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-5 rounded-2xl border border-border shadow-sm",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl font-bold tracking-tight text-foreground flex items-center gap-3",children:[e.jsx(ue,{className:"w-7 h-7 text-primary"}),"Trip Overview Calculator"]}),e.jsx("p",{className:"text-muted-foreground mt-1 text-sm",children:"Simulate profitability based on variable constraints, tyre depreciation, and vehicle fixed costs."})]}),e.jsx("div",{className:"flex items-center gap-3 w-full md:w-auto",children:oe==="calculator"?e.jsxs(c,{onClick:()=>T(!0),className:"rounded-xl font-bold shadow-sm w-full md:w-auto",children:[e.jsx(U,{className:"w-4 h-4 mr-2"})," Save Calculation"]}):e.jsxs(c,{onClick:()=>W("calculator"),className:"rounded-xl font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-md w-full md:w-auto gap-2",children:[e.jsx(k,{className:"w-4 h-4"})," Calculate New Trip"]})})]}),e.jsxs(ss,{value:oe,onValueChange:s=>{W(s),s==="reports"&&F()},className:"w-full",children:[e.jsxs(ts,{className:"bg-muted/50 p-1 mb-6 flex h-auto rounded-xl max-w-xs",children:[e.jsx(be,{value:"calculator",className:"gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm w-1/2",children:"Calculator"}),e.jsx(be,{value:"reports",className:"gap-2 px-6 py-2 rounded-lg data-[state=active]:shadow-sm w-1/2",children:"Saved Reports"})]}),e.jsx(ge,{value:"calculator",className:"space-y-4 m-0",children:e.jsx(LogisticsTripCostCalculator,{initialDistance:b[0]||650,initialMileage:f[0]||4.5,initialFuelPrice:g[0]||92.5,initialTolls:j[0]||1400,savedReportsCount:le.length,onOpenReports:()=>W("reports"),onSaveToDatabase:(data)=>{A([data.distance]);O([data.fuel_price]);$([data.mileage]);B([data.tolls]);Z(data.total_fixed_allocated);te(data.recommended_quote);T(!0)}})}),e.jsx(ge,{value:"reports",className:"space-y-6 m-0 animate-in fade-in duration-300",children:e.jsxs(C,{className:"border-border shadow-sm bg-card",children:[e.jsxs(L,{className:"border-b border-border/50 pb-4",children:[e.jsxs(P,{className:"flex items-center gap-2 text-lg",children:[e.jsx(k,{className:"w-5 h-5 text-primary"}),"Saved Simulation Reports"]}),e.jsx(I,{children:"View, load parameters, or delete previously saved simulation records."})]}),e.jsx(V,{className:"pt-6",children:Le?e.jsxs("div",{className:"py-12 flex justify-center items-center text-muted-foreground gap-2",children:[e.jsx(he,{className:"w-6 h-6 animate-spin text-primary"}),e.jsx("span",{children:"Loading reports..."})]}):le.length===0?e.jsxs("div",{className:"py-16 text-center text-muted-foreground space-y-3",children:[e.jsx(k,{className:"w-12 h-12 mx-auto opacity-20"}),e.jsx("p",{className:"text-base font-semibold",children:"No saved calculations found"}),e.jsx("p",{className:"text-sm",children:'Run a simulation and click "Save Calculation" to record a report.'})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:le.map(s=>{const r=Number(s.net_profit)>=0;return e.jsxs(C,{className:"border-border/60 bg-card hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden flex flex-col justify-between",children:[e.jsxs("div",{className:"p-5 space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-start gap-2 border-b border-border/40 pb-3",children:[e.jsxs("div",{className:"overflow-hidden mr-2",children:[e.jsx("h4",{className:"font-heading font-bold text-base text-foreground tracking-tight truncate",title:s.route_name,children:s.route_name}),e.jsx("p",{className:"text-[10px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider font-mono",children:s.vehicle_number?`Truck: ${s.vehicle_number}`:"No Truck Assigned"})]}),e.jsxs("div",{className:x("text-[10px] font-bold py-0.5 px-2 rounded-md border border-transparent shrink-0",r?"bg-emerald-500/10 text-emerald-500 border-emerald-500/20":"bg-destructive/10 text-destructive border-destructive/20"),children:[s.profit_margin?.toFixed(1),"% Margin"]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-x-4 gap-y-2 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Distance:"}),e.jsxs("span",{className:"font-medium text-foreground",children:[s.distance," km"]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Mileage:"}),e.jsxs("span",{className:"font-medium text-foreground",children:[s.mileage," km/l"]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Fuel Price:"}),e.jsxs("span",{className:"font-medium text-foreground",children:["₹",s.fuel_price]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Tolls:"}),e.jsxs("span",{className:"font-medium text-foreground",children:["₹",s.tolls]})]})]}),e.jsxs("div",{className:"bg-muted/30 border border-border/50 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-1 shadow-inner",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Net Profit"}),e.jsx("span",{className:x("font-bold text-sm tabular-nums block mt-0.5",r?"text-emerald-500":"text-destructive"),children:l(s.net_profit)})]}),e.jsxs("div",{className:"text-right sm:text-center sm:border-x border-border/30",children:[e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Expense/KM"}),e.jsxs("span",{className:"font-bold text-primary font-mono tabular-nums block mt-0.5",children:["₹",(s.distance>0?(s.total_expenses/s.distance).toFixed(2):"0.00")]})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Profit/KM"}),e.jsxs("span",{className:x("font-bold font-mono tabular-nums block mt-0.5",r?"text-emerald-500":"text-destructive"),children:["₹",(s.distance>0?(s.net_profit/s.distance).toFixed(2):"0.00")]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("span",{className:"text-[9px] font-bold text-muted-foreground uppercase tracking-widest block",children:"Revenue"}),e.jsx("span",{className:"font-bold text-foreground tabular-nums block mt-0.5",children:l(s.freight_revenue)})]})]})]}),e.jsxs("div",{className:"bg-muted/10 border-t border-border/50 px-5 py-3.5 flex justify-between items-center gap-2",children:[e.jsxs("span",{className:"text-[10px] text-muted-foreground flex items-center gap-1 font-medium",children:[e.jsx(Ye,{className:"w-3.5 h-3.5"}),new Date(s.created).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})]}),e.jsxs("div",{className:"flex gap-1.5",children:[e.jsxs(c,{size:"sm",variant:"outline",onClick:()=>R(s),className:"rounded-lg h-8 text-[11px] font-semibold border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 shadow-sm",children:[e.jsx(Ze,{className:"w-3.5 h-3.5 text-primary"})," View Details"]}),e.jsxs(c,{size:"sm",variant:"outline",onClick:()=>de(s),className:"rounded-lg h-8 text-[11px] font-semibold border-border bg-background hover:bg-muted text-foreground flex items-center gap-1 shadow-sm",children:[e.jsx(pe,{className:"w-3 h-3 fill-current text-primary"})," Load"]}),e.jsx(c,{size:"sm",variant:"ghost",onClick:()=>Pe(s.id),className:"rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10",children:e.jsx(es,{className:"w-3.5 h-3.5"})})]})]})]},s.id)})})})]})})]}),e.jsx(fe,{open:De,onOpenChange:s=>!s&&T(!1),children:e.jsxs(je,{className:"sm:max-w-[480px] rounded-[2rem] p-6 sm:p-8 shadow-2xl bg-card border-border/50",children:[e.jsxs(Ne,{className:"mb-4",children:[e.jsxs(ve,{className:"text-xl font-bold tracking-tight text-foreground flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/10 p-2.5 rounded-2xl text-primary",children:e.jsx(U,{className:"w-5 h-5"})}),"Save Profitability Report"]}),e.jsx(as,{className:"text-sm text-muted-foreground pt-1.5",children:"Record this simulation log to help track profitability trends across routes and trucks."})]}),e.jsxs("form",{onSubmit:Ae,className:"space-y-5",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{className:"text-sm font-medium text-foreground ml-1",children:"Route Name *"}),e.jsxs(ye,{value:m.routeName,onValueChange:s=>H({...m,routeName:s}),required:!0,children:[e.jsx(we,{className:"bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-12 text-base px-4 w-full",children:e.jsx(ke,{placeholder:"Select Route Name"})}),e.jsx(Ce,{className:"rounded-xl",children:Te.map(s=>e.jsxs(Y,{value:s.route_name,children:[s.route_name," ",s.route_code?`(${s.route_code})`:""]},s.id))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(n,{className:"text-sm font-medium text-foreground ml-1",children:"Vehicle Registration Number"}),e.jsxs(ye,{value:m.vehicleNumber||"none",onValueChange:s=>H({...m,vehicleNumber:s}),children:[e.jsx(we,{className:"bg-muted/40 border-muted-foreground/20 focus:ring-primary/30 rounded-xl h-12 text-base px-4 w-full",children:e.jsx(ke,{placeholder:"Select Vehicle Number"})}),e.jsxs(Ce,{className:"rounded-xl",children:[e.jsx(Y,{value:"none",children:"None / Select later"}),Fe.map(s=>e.jsxs(Y,{value:s.truck_number,children:[s.truck_number," ",s.truck_name?`(${s.truck_name})`:""]},s.id))]})]})]}),e.jsxs(_e,{className:"pt-4 gap-3",children:[e.jsx(c,{type:"button",variant:"outline",onClick:()=>T(!1),disabled:z,className:"rounded-xl h-12 px-6",children:"Cancel"}),e.jsxs(c,{type:"submit",disabled:z,className:"rounded-xl font-bold bg-primary hover:bg-primary/95 text-primary-foreground h-12 px-6 shadow-sm",children:[z?e.jsx(he,{className:"w-4 h-4 mr-2 animate-spin"}):e.jsx(U,{className:"w-4 h-4 mr-2"}),"Save Report"]})]})]})]})}),e.jsx(fe,{open:!!t,onOpenChange:s=>!s&&R(null),children:e.jsxs(je,{className:"sm:max-w-[550px] bg-card text-card-foreground border-border/50 rounded-3xl p-6 shadow-2xl",children:[e.jsxs(Ne,{className:"border-b border-border/50 pb-4",children:[e.jsxs(ve,{className:"text-xl font-heading font-bold flex items-center gap-2",children:[e.jsx(k,{className:"w-5 h-5 text-primary"}),"Trip Calculation Details"]}),e.jsx("div",{className:"text-xs text-muted-foreground mt-1 flex gap-3",children:e.jsxs("span",{children:["Saved: ",t&&new Date(t.created).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})]})})]}),t&&e.jsxs("div",{className:"space-y-6 py-4 overflow-y-auto max-h-[60vh] pr-1",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider block",children:"Route"}),e.jsx("span",{className:"text-sm font-semibold text-foreground block truncate",title:t.route_name,children:t.route_name})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-[10px] uppercase font-bold text-muted-foreground tracking-wider block",children:"Vehicle"}),e.jsx("span",{className:"text-sm font-semibold text-foreground block",children:t.vehicle_number||"No Vehicle Assigned"})]})]}),e.jsxs("div",{className:"space-y-2.5",children:[e.jsx("h4",{className:"text-xs font-bold text-primary uppercase tracking-wider",children:"Simulation Parameters"}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3",children:[e.jsxs("div",{className:"bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center",children:[e.jsx("span",{className:"text-[9px] text-muted-foreground block",children:"Distance"}),e.jsxs("span",{className:"text-xs font-bold text-foreground",children:[t.distance," km"]})]}),e.jsxs("div",{className:"bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center",children:[e.jsx("span",{className:"text-[9px] text-muted-foreground block",children:"Mileage"}),e.jsxs("span",{className:"text-xs font-bold text-foreground",children:[t.mileage," km/l"]})]}),e.jsxs("div",{className:"bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center",children:[e.jsx("span",{className:"text-[9px] text-muted-foreground block",children:"Fuel Price"}),e.jsxs("span",{className:"text-xs font-bold text-foreground",children:["₹",t.fuel_price]})]}),e.jsxs("div",{className:"bg-muted/10 border border-border/40 p-2.5 rounded-xl text-center",children:[e.jsx("span",{className:"text-[9px] text-muted-foreground block",children:"Tolls"}),e.jsxs("span",{className:"text-xs font-bold text-foreground",children:["₹",t.tolls]})]})]})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx("h4",{className:"text-xs font-bold text-primary uppercase tracking-wider",children:"Financial Breakdown"}),e.jsxs("div",{className:"border border-border/50 rounded-2xl overflow-hidden text-xs",children:[e.jsxs("div",{className:"flex justify-between items-center p-3 bg-muted/20 border-b border-border/50",children:[e.jsx("span",{className:"font-semibold text-foreground",children:"Gross Freight Revenue"}),e.jsx("span",{className:"font-bold text-foreground text-sm",children:l(t.freight_revenue)})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-muted/10 border-b border-border/50 text-yellow-600 dark:text-yellow-500",children:[e.jsxs("span",{className:"font-semibold",children:["TDS Deducted (",t.tds_rate!==void 0?t.tds_rate:0,"%)"]}),e.jsxs("span",{className:"font-bold text-sm",children:["-",l(t.tds_amount||t.freight_revenue*(t.tds_rate||0)/100)]})]}),e.jsxs("div",{className:"p-3 space-y-2 bg-card",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Fuel Cost:"}),e.jsx("span",{className:"font-medium text-foreground",children:l(t.fuel_cost||t.distance/t.mileage*t.fuel_price)})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Toll Charges:"}),e.jsx("span",{className:"font-medium text-foreground",children:l(t.tolls)})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-muted-foreground",children:"Driver Expenses / Batta:"}),e.jsx("span",{className:"font-medium text-foreground",children:l(t.driver_expenses)})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("span",{className:"text-muted-foreground",children:["Tyre Wear & Tear (₹",t.tyre_depreciation_rate||3,"/km):"]}),e.jsx("span",{className:"font-medium text-foreground",children:l(t.tyre_expense||t.distance*(t.tyre_depreciation_rate||3))})]}),e.jsxs("div",{className:"flex justify-between items-center border-t border-border/40 pt-2 mt-1",children:[e.jsx("span",{className:"text-muted-foreground",children:"Fixed Overheads (EMI, Tax, Insurance):"}),e.jsx("span",{className:"font-medium text-foreground",children:l(Number(t.vehicle_emi||0)+Number(t.insurance||0)+Number(t.quarterly_tax||0))})]})]}),e.jsxs("div",{className:"flex justify-between items-center p-3 bg-muted/10 border-t border-border/50",children:[e.jsx("span",{className:"font-semibold text-foreground",children:"Total Operating Expenses"}),e.jsx("span",{className:"font-bold text-foreground",children:l(t.total_expenses)})]}),e.jsxs("div",{className:x("flex justify-between items-center p-3.5 border-t border-border/50",Number(t.net_profit)>=0?"bg-emerald-500/5 text-emerald-600":"bg-destructive/5 text-destructive"),children:[e.jsxs("div",{className:"space-y-0.5",children:[e.jsx("span",{className:"font-bold text-sm block",children:"Net Profit / Earnings"}),e.jsxs("span",{className:"text-[10px] opacity-80 block",children:[t.profit_margin?.toFixed(1),"% Margin on revenue"]})]}),e.jsx("span",{className:"font-extrabold text-base tabular-nums",children:l(t.net_profit)})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-3 p-3 bg-muted/20 border-t border-border/50 text-xs",children:[e.jsxs("div",{className:"p-2.5 rounded-xl bg-primary/5 border border-primary/20",children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",children:"⚡ Expense Intel"}),e.jsxs("span",{className:"font-mono font-black text-sm text-primary block mt-0.5",children:["₹",(t.distance>0?(Number(t.total_expenses||0)/t.distance).toFixed(2):"0.00")," / KM"]})]}),e.jsxs("div",{className:x("p-2.5 rounded-xl border",Number(t.net_profit)>=0?"bg-emerald-500/10 border-emerald-500/30 text-emerald-500":"bg-destructive/10 border-destructive/30 text-destructive"),children:[e.jsx("span",{className:"text-[10px] font-bold uppercase tracking-wider text-muted-foreground block",children:"📈 Profit Intel"}),e.jsxs("span",{className:"font-mono font-black text-sm block mt-0.5",children:["₹",(t.distance>0?(Number(t.net_profit||0)/t.distance).toFixed(2):"0.00")," / KM"]})]})]})]})]})]}),e.jsxs(_e,{className:"pt-3 border-t border-border/50",children:[e.jsx(c,{variant:"outline",className:"rounded-xl h-11",onClick:()=>R(null),children:"Close Details"}),t&&e.jsxs(c,{className:"rounded-xl h-11 gap-1.5",onClick:()=>{de(t),R(null)},children:[e.jsx(pe,{className:"w-3.5 h-3.5 fill-current"})," Load Simulator"]})]})]})})]})}export{vs as default};
