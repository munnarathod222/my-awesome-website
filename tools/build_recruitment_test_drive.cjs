const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('🚀 Building Upgraded Driver Application Form & Recruitment Dashboard with Practical Test Drive...');

const dAppOriginal = fs.readFileSync(path.join(__dirname, '../dist/assets/DriverApplicationPage-DRqVLxd0.js'), 'utf8');
const rDashOriginal = fs.readFileSync(path.join(__dirname, '../dist/assets/RecruitmentDashboardPage-BXt0K_qh.js'), 'utf8');

// ============================================================================
// PART A: UPGRADE DRIVER APPLICATION PAGE (/apply/driver)
// ============================================================================
console.log('1. Transforming DriverApplicationPage...');
let dApp = dAppOriginal;

// A1: Add test drive fields to initial state
const oldState = 'drinks_alcohol:"No - Non-Drinker (Teetotaler)",reference1_name:""';
const newState = 'drinks_alcohol:"No - Non-Drinker (Teetotaler)",test_drive_ready:"Yes - Ready for Practical Driving Test",test_drive_vehicle_pref:"32ft Multi-Axle Container (MXL)",test_drive_preferred_date:"Immediate",test_drive_yard:"Hyderabad Hub (Ghatkesar Yard)",reference1_name:""';

if (!dApp.includes(oldState)) {
  throw new Error('Could not find oldState in DriverApplicationPage');
}
dApp = dApp.replace(oldState, newState);

// A2: Test Drive card in Step 2
const testDriveCardJSX = `e.jsxs("div",{className:"space-y-3 pt-4 border-t border-slate-800 bg-blue-950/20 p-4.5 rounded-2xl border border-blue-500/30",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0",children:e.jsx(Ae,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx(l,{className:"text-xs font-black text-blue-300 flex items-center gap-1.5",children:"🚚 Practical Test Drive & Skill Assessment Readiness *"}),e.jsx("p",{className:"text-[11px] text-slate-400",children:"All candidate drivers undergo a practical highway & yard maneuvering test drive before truck assignment."})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs",children:[e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(l,{className:"text-xs font-bold text-slate-300",children:"Ready for Driving Test? *"}),e.jsxs("select",{value:s.test_drive_ready,onChange:a=>r("test_drive_ready",a.target.value),className:"w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none",children:[e.jsx("option",{value:"Yes - Ready for Practical Driving Test",children:"✅ Yes - Ready for Road & Yard Test Drive"}),e.jsx("option",{value:"Need 2-3 Days Preparation",children:"⏱️ Need 2-3 Days Preparation"}),e.jsx("option",{value:"Available on Weekend",children:"📅 Available on Weekend"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(l,{className:"text-xs font-bold text-slate-300",children:"Preferred Vehicle for Test Drive *"}),e.jsxs("select",{value:s.test_drive_vehicle_pref,onChange:a=>r("test_drive_vehicle_pref",a.target.value),className:"w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none",children:[e.jsx("option",{value:"32ft Multi-Axle Container (MXL)",children:"🚛 32ft Multi-Axle Container (MXL)"}),e.jsx("option",{value:"24ft / 20ft Single Axle Container",children:"🚚 24ft / 20ft Single Axle Container"}),e.jsx("option",{value:"40ft Articulated Trailer / Flatbed",children:"🚛 40ft Articulated Trailer"}),e.jsx("option",{value:"10-Wheeler / 12-Wheeler Heavy Truck",children:"🚛 10-Wheeler / 12-Wheeler Heavy Truck"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(l,{className:"text-xs font-bold text-slate-300",children:"Availability for Driving Test *"}),e.jsxs("select",{value:s.test_drive_preferred_date,onChange:a=>r("test_drive_preferred_date",a.target.value),className:"w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none",children:[e.jsx("option",{value:"Immediate",children:"⚡ Immediate (Today / Tomorrow)"}),e.jsx("option",{value:"Within 2 to 3 Days",children:"📅 Within 2 to 3 Days"}),e.jsx("option",{value:"Next Week",children:"📆 Next Week"})]})]}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx(l,{className:"text-xs font-bold text-slate-300",children:"Preferred Testing Yard / Hub *"}),e.jsxs("select",{value:s.test_drive_yard,onChange:a=>r("test_drive_yard",a.target.value),className:"w-full h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:border-blue-500 focus:outline-none",children:[e.jsx("option",{value:"Hyderabad Hub (Ghatkesar Yard)",children:"📍 Hyderabad Hub (Ghatkesar Yard)"}),e.jsx("option",{value:"Vijayawada / Guntur Hub",children:"📍 Vijayawada / Guntur Hub"}),e.jsx("option",{value:"Bangalore Hub",children:"📍 Bangalore Hub"}),e.jsx("option",{value:"Chennai Hub",children:"📍 Chennai Hub"})]})]})]})]})`;

const alcoholBlockEnd = 'children:a.sub})]},a.value)})})]})]})';
if (!dApp.includes(alcoholBlockEnd)) {
  throw new Error('Could not find alcoholBlockEnd in DriverApplicationPage');
}
dApp = dApp.replace(alcoholBlockEnd, alcoholBlockEnd + ',' + testDriveCardJSX);

// A3: Test Drive summary in Step 3 Review
const reviewTestDriveJSX = `P&&s.test_drive_ready&&e.jsxs("div",{className:"bg-slate-800/60 rounded-2xl p-4 space-y-1.5 border border-slate-700",children:[e.jsxs("h3",{className:"font-extrabold text-white text-sm mb-2 flex items-center gap-1.5",children:[e.jsx(Ae,{className:"w-3.5 h-3.5 text-blue-400"})," Practical Test Drive Preferences"]}),e.jsxs("div",{className:"grid grid-cols-2 gap-x-4 gap-y-1 text-xs",children:[e.jsx("span",{className:"text-slate-500",children:"Readiness:"}),e.jsx("span",{className:"font-bold text-emerald-400",children:s.test_drive_ready}),e.jsx("span",{className:"text-slate-500",children:"Preferred Truck:"}),e.jsx("span",{className:"text-white font-bold",children:s.test_drive_vehicle_pref}),e.jsx("span",{className:"text-slate-500",children:"Testing Yard & Date:"}),e.jsxs("span",{className:"text-white",children:[s.test_drive_yard," (",s.test_drive_preferred_date,")"]})]})]}),`;

const refReviewStart = 'e.jsxs("div",{className:"bg-slate-800/60 rounded-2xl p-4 space-y-1.5 border border-slate-700",children:[e.jsxs("h3",{className:"font-extrabold text-white text-sm mb-2 flex items-center gap-1.5",children:[e.jsx(z,{className:"w-3.5 h-3.5 text-amber-400"})," References"]';
if (!dApp.includes(refReviewStart)) {
  throw new Error('Could not find refReviewStart in DriverApplicationPage');
}
dApp = dApp.replace(refReviewStart, reviewTestDriveJSX + refReviewStart);

console.log('✓ DriverApplicationPage string transformations applied.');

// Validate dApp with esbuild
const compiledDApp = esbuild.transformSync(dApp, { loader: 'js', target: 'es2020' }).code;
console.log('✓ DriverApplicationPage validated successfully! Length:', compiledDApp.length);


// ============================================================================
// PART B: UPGRADE RECRUITMENT DASHBOARD PAGE (/recruitment)
// ============================================================================
console.log('2. Transforming RecruitmentDashboardPage...');
let rDash = rDashOriginal;

// B1: In-file status badge helper and custom statuses
rDash = rDash.replace('aL as Y,', 'aL as origY,');
const customYFunc = `
function Y(status) {
  switch (status) {
    case "Applied":
      return { label: "Applied", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    case "Shortlisted":
      return { label: "Shortlisted", color: "text-violet-400 border-violet-500/30 bg-violet-500/10" };
    case "Interview":
      return { label: "Interview", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
    case "Test Drive Scheduled":
      return { label: "🚚 Test Drive Scheduled", color: "text-amber-300 border-amber-500/40 bg-amber-500/15" };
    case "Test Drive In-Progress":
      return { label: "⏱️ Test Drive In-Progress", color: "text-cyan-300 border-cyan-500/40 bg-cyan-500/15" };
    case "Test Drive Passed":
      return { label: "✅ Test Drive Passed", color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/15" };
    case "Test Drive Failed":
      return { label: "❌ Test Drive Failed", color: "text-rose-400 border-rose-500/40 bg-rose-500/15" };
    case "Selected":
      return { label: "Selected / Hired", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    case "Rejected":
      return { label: "Rejected", color: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
    default:
      return { label: status || "Applied", color: "text-slate-400 border-slate-500/30 bg-slate-500/10" };
  }
}

const customStatuses = [
  { value: "Applied", label: "New Applied" },
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Interview", label: "Interview Scheduled" },
  { value: "Test Drive Scheduled", label: "🚚 Test Drive Scheduled" },
  { value: "Test Drive In-Progress", label: "⏱️ Test Drive In-Progress" },
  { value: "Test Drive Passed", label: "✅ Test Drive Passed" },
  { value: "Test Drive Failed", label: "❌ Test Drive Failed" },
  { value: "Selected", label: "Selected / Hired" },
  { value: "Rejected", label: "Rejected" }
];
`;

rDash = rDash.replace('function He({', customYFunc + '\nfunction He({');
rDash = rDash.replace(/le\.map/g, 'customStatuses.map');

// B2: State & saveTestDriveAssessment in He
const oldHeState = 'const[x,P]=c.useState(s?.status||"Applied"),[g,L]=c.useState(s?.notes||""),[C,u]=c.useState(!1),[j,_]=c.useState(!1),[b,m]=c.useState(null);if(!s)return null;';
const newHeState = `const[x,P]=c.useState(s?.status||"Applied"),[g,L]=c.useState(s?.notes||""),[C,u]=c.useState(!1),[j,_]=c.useState(!1),[b,m]=c.useState(null),
[tdStatus, setTdStatus]=c.useState(s?.test_drive_status||(s?.status==="Test Drive Scheduled"?"Scheduled":s?.status==="Test Drive Passed"?"Passed":s?.status==="Test Drive Failed"?"Failed":"Pending")),
[tdDate, setTdDate]=c.useState(s?.test_drive_date||""),
[tdVehicle, setTdVehicle]=c.useState(s?.test_drive_vehicle||s?.test_drive_vehicle_pref||"TG12U2637 (32ft MXL)"),
[tdRoute, setTdRoute]=c.useState(s?.test_drive_route||"Hyderabad Ghatkesar Yard ➔ ORR Toll Expressway (25 KM)"),
[tdEvaluator, setTdEvaluator]=c.useState(s?.test_drive_evaluator||"Senior Fleet Supervisor"),
[tdScore, setTdScore]=c.useState(s?.test_drive_score||"4.5"),
[tdResult, setTdResult]=c.useState(s?.test_drive_result||(s?.status==="Test Drive Passed"?"Passed - Heavy Multi-Axle Fleet Recommended":"Passed - Heavy Multi-Axle Fleet Recommended")),
[tdNotes, setTdNotes]=c.useState(s?.test_drive_notes||""),
[tdClutchGear, setTdClutchGear]=c.useState(s?.test_drive_clutch_gear||"5"),
[tdSteeringLane, setTdSteeringLane]=c.useState(s?.test_drive_steering_lane||"5"),
[tdBraking, setTdBraking]=c.useState(s?.test_drive_braking||"4"),
[tdReverse, setTdReverse]=c.useState(s?.test_drive_reverse||"5"),
[tdPrecheck, setTdPrecheck]=c.useState(s?.test_drive_precheck||"5"),
[tdSaving, setTdSaving]=c.useState(!1);

const saveTestDriveAssessment = async () => {
  setTdSaving(!0);
  try {
    const payload = {
      test_drive_status: tdStatus,
      test_drive_date: tdDate,
      test_drive_vehicle: tdVehicle,
      test_drive_route: tdRoute,
      test_drive_evaluator: tdEvaluator,
      test_drive_score: tdScore,
      test_drive_result: tdResult,
      test_drive_notes: tdNotes,
      test_drive_clutch_gear: tdClutchGear,
      test_drive_steering_lane: tdSteeringLane,
      test_drive_braking: tdBraking,
      test_drive_reverse: tdReverse,
      test_drive_precheck: tdPrecheck
    };
    if (tdStatus === "Passed") payload.status = "Test Drive Passed";
    else if (tdStatus === "Failed") payload.status = "Test Drive Failed";
    else if (tdStatus === "Scheduled") payload.status = "Test Drive Scheduled";

    const res = await fetch(\`/api/driver/applications/\${s.id}\`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      h.success("Test Drive evaluation saved successfully!");
      if (payload.status) P(payload.status);
      o && o();
    } else {
      h.error("Failed to save test drive assessment");
    }
  } catch (err) {
    console.error(err);
    h.error("Error saving test drive evaluation");
  } finally {
    setTdSaving(!1);
  }
};if(!s)return null;`;

if (!rDash.includes(oldHeState)) {
  throw new Error('Could not find oldHeState in RecruitmentDashboardPage');
}
rDash = rDash.replace(oldHeState, newHeState);

// B3: Upgrade D function in He
const oldDFunc = 'D=async()=>{u(!0);try{await Me(s.id,x,g),h.success(`Status updated to "${x}"`),o&&o(),p()}catch{h.error("Failed to update status")}finally{u(!1)}}';
const newDFunc = `D=async()=>{u(!0);try{await fetch(\`/api/driver/applications/\${s.id}\`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:x,notes:g,test_drive_status:tdStatus,test_drive_date:tdDate,test_drive_vehicle:tdVehicle,test_drive_route:tdRoute,test_drive_evaluator:tdEvaluator,test_drive_score:tdScore,test_drive_result:tdResult,test_drive_notes:tdNotes,test_drive_clutch_gear:tdClutchGear,test_drive_steering_lane:tdSteeringLane,test_drive_braking:tdBraking,test_drive_reverse:tdReverse,test_drive_precheck:tdPrecheck})});h.success(\`Status updated to "\${x}"\`),o&&o(),p()}catch{h.error("Failed to update status")}finally{u(!1)}}`;

if (!rDash.includes(oldDFunc)) {
  throw new Error('Could not find oldDFunc in RecruitmentDashboardPage');
}
rDash = rDash.replace(oldDFunc, newDFunc);

// B4: Insert Test Drive Modal section
const testDriveModalSectionJSX = `e.jsxs("div",{className:"bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-slate-950 rounded-2xl p-4 sm:p-5 border-2 border-blue-500/40 shadow-xl space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-blue-500/20",children:[e.jsxs("div",{className:"flex items-center gap-2.5",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0",children:e.jsx(O,{className:"w-5 h-5 text-blue-400"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-black text-white text-sm flex items-center gap-2",children:"🚚 Practical Test Drive & Driving Skill Assessment"}),e.jsx("p",{className:"text-[11px] text-blue-300/80 font-medium",children:"Road handling, highway speed control, reversing & dock parking evaluation"})]})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("span",{className:\`text-xs font-black px-3 py-1 rounded-xl border \${tdStatus==="Passed"?"bg-emerald-500/20 border-emerald-500 text-emerald-400":tdStatus==="Failed"?"bg-rose-500/20 border-rose-500 text-rose-400":tdStatus==="Scheduled"?"bg-amber-500/20 border-amber-500 text-amber-300":"bg-slate-800 border-slate-700 text-slate-300"}\`,children:["Test Drive: ",tdStatus]})})]}),s.test_drive_ready&&e.jsxs("div",{className:"bg-blue-950/60 rounded-xl p-3 border border-blue-500/30 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-slate-400 block text-[10px]",children:"Candidate Readiness:"}),e.jsx("strong",{className:"text-blue-300 font-bold",children:s.test_drive_ready})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-slate-400 block text-[10px]",children:"Preferred Vehicle:"}),e.jsx("strong",{className:"text-white font-bold",children:s.test_drive_vehicle_pref||s.vehicle_types||"32ft MXL"})]}),e.jsxs("div",{children:[e.jsx("span",{className:"text-slate-400 block text-[10px]",children:"Testing Yard / Availability:"}),e.jsx("strong",{className:"text-white font-bold",children:\`\${s.test_drive_yard||"Ghatkesar Yard"} (\${s.test_drive_preferred_date||"Immediate"})\`})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Test Drive Status"}),e.jsxs("select",{value:tdStatus,onChange:a=>setTdStatus(a.target.value),className:"w-full h-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs px-2.5 font-bold focus:border-blue-500 focus:outline-none",children:[e.jsx("option",{value:"Pending",children:"Pending / Not Scheduled"}),e.jsx("option",{value:"Scheduled",children:"Scheduled"}),e.jsx("option",{value:"In-Progress",children:"In-Progress"}),e.jsx("option",{value:"Passed",children:"Passed (Approved)"}),e.jsx("option",{value:"Failed",children:"Failed (Ineligible)"}),e.jsx("option",{value:"Re-Test Required",children:"Re-Test Required"})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Test Drive Date & Time"}),e.jsx("input",{type:"datetime-local",value:tdDate,onChange:a=>setTdDate(a.target.value),className:"w-full h-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs px-2.5 font-mono focus:border-blue-500 focus:outline-none"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Assigned Fleet Truck"}),e.jsx("input",{type:"text",placeholder:"e.g. TG12U2637 (32ft MXL)",value:tdVehicle,onChange:a=>setTdVehicle(a.target.value),className:"w-full h-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs px-2.5 font-bold focus:border-blue-500 focus:outline-none"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Examiner / Evaluator"}),e.jsx("input",{type:"text",placeholder:"Senior Fleet Supervisor",value:tdEvaluator,onChange:a=>setTdEvaluator(a.target.value),className:"w-full h-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs px-2.5 font-bold focus:border-blue-500 focus:outline-none"})]})]}),e.jsxs("div",{className:"space-y-1 text-xs",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Test Route / Terrain Description"}),e.jsx("input",{type:"text",placeholder:"e.g. Hyderabad Ghatkesar Yard ➔ ORR Toll Expressway ➔ Reverse Dock Parking (25 KM)",value:tdRoute,onChange:a=>setTdRoute(a.target.value),className:"w-full h-9 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs px-2.5 focus:border-blue-500 focus:outline-none"})]}),e.jsxs("div",{className:"bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("h4",{className:"text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5",children:[e.jsx("span",{children:"⭐"})," Practical Driving Assessment Scorecard (1 to 5 Stars)"]}),e.jsxs("span",{className:"text-[11px] font-bold text-slate-400",children:["Overall Score: ",e.jsxs("strong",{className:"text-amber-400 text-sm",children:[tdScore," / 5.0"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs",children:[e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-bold text-slate-200",children:"1. Clutch & Gear Control"}),e.jsxs("span",{className:"font-bold text-amber-400",children:[tdClutchGear,"★"]})]}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Smooth shifting, no half-clutch burning"}),e.jsxs("select",{value:tdClutchGear,onChange:a=>setTdClutchGear(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"5",children:"⭐⭐⭐⭐⭐ 5 - Flawless"}),e.jsx("option",{value:"4",children:"⭐⭐⭐⭐ 4 - Good & Smooth"}),e.jsx("option",{value:"3",children:"⭐⭐⭐ 3 - Average"}),e.jsx("option",{value:"2",children:"⭐⭐ 2 - Rough / Jerky"}),e.jsx("option",{value:"1",children:"⭐ 1 - Poor / Burning Clutch"})]})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-bold text-slate-200",children:"2. Lane & Steering Discipline"}),e.jsxs("span",{className:"font-bold text-amber-400",children:[tdSteeringLane,"★"]})]}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Highway centering, indicator usage"}),e.jsxs("select",{value:tdSteeringLane,onChange:a=>setTdSteeringLane(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"5",children:"⭐⭐⭐⭐⭐ 5 - Excellent Centering"}),e.jsx("option",{value:"4",children:"⭐⭐⭐⭐ 4 - Safe & Steady"}),e.jsx("option",{value:"3",children:"⭐⭐⭐ 3 - Moderate"}),e.jsx("option",{value:"2",children:"⭐⭐ 2 - Wanders Out of Lane"}),e.jsx("option",{value:"1",children:"⭐ 1 - Erratic Steering"})]})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-bold text-slate-200",children:"3. Braking & Safe Distance"}),e.jsxs("span",{className:"font-bold text-amber-400",children:[tdBraking,"★"]})]}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Gradual deceleration, safe gap"}),e.jsxs("select",{value:tdBraking,onChange:a=>setTdBraking(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"5",children:"⭐⭐⭐⭐⭐ 5 - Progressive & Safe"}),e.jsx("option",{value:"4",children:"⭐⭐⭐⭐ 4 - Good Distance Control"}),e.jsx("option",{value:"3",children:"⭐⭐⭐ 3 - Acceptable"}),e.jsx("option",{value:"2",children:"⭐⭐ 2 - Late Panic Braking"}),e.jsx("option",{value:"1",children:"⭐ 1 - Dangerous Tailgating"})]})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-bold text-slate-200",children:"4. Reverse & Dock Maneuver"}),e.jsxs("span",{className:"font-bold text-amber-400",children:[tdReverse,"★"]})]}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Yard parking into narrow loading dock"}),e.jsxs("select",{value:tdReverse,onChange:a=>setTdReverse(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"5",children:"⭐⭐⭐⭐⭐ 5 - First Attempt Dock"}),e.jsx("option",{value:"4",children:"⭐⭐⭐⭐ 4 - Clean & Controlled"}),e.jsx("option",{value:"3",children:"⭐⭐⭐ 3 - Needs 2 Corrections"}),e.jsx("option",{value:"2",children:"⭐⭐ 2 - Poor Mirror Awareness"}),e.jsx("option",{value:"1",children:"⭐ 1 - Unsafe Blind Reversing"})]})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"font-bold text-slate-200",children:"5. Pre-Trip Inspection"}),e.jsxs("span",{className:"font-bold text-amber-400",children:[tdPrecheck,"★"]})]}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Tyres, air pressure, cabin check"}),e.jsxs("select",{value:tdPrecheck,onChange:a=>setTdPrecheck(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"5",children:"⭐⭐⭐⭐⭐ 5 - Thorough 360° Check"}),e.jsx("option",{value:"4",children:"⭐⭐⭐⭐ 4 - Checked Tyres & Oil"}),e.jsx("option",{value:"3",children:"⭐⭐⭐ 3 - Basic Walkaround"}),e.jsx("option",{value:"2",children:"⭐⭐ 2 - Missed Pressure"}),e.jsx("option",{value:"1",children:"⭐ 1 - No Check Conducted"})]})]}),e.jsxs("div",{className:"p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1",children:[e.jsx("div",{className:"flex justify-between items-center",children:e.jsx("span",{className:"font-bold text-slate-200",children:"Final Test Drive Verdict"})}),e.jsx("p",{className:"text-[10px] text-slate-400",children:"Fleet assignment qualification"}),e.jsxs("select",{value:tdResult,onChange:a=>setTdResult(a.target.value),className:"w-full h-7 rounded bg-slate-950 border border-slate-700 text-white text-[11px] px-1 font-bold",children:[e.jsx("option",{value:"Passed - Heavy Multi-Axle Fleet Recommended",children:"🟢 PASSED - Heavy Multi-Axle"}),e.jsx("option",{value:"Passed - Short Route / Feeder Only",children:"🟡 CONDITIONAL - City / Feeder"}),e.jsx("option",{value:"Needs Re-Test",children:"🟠 RE-TEST - Needs Practice"}),e.jsx("option",{value:"Failed - Driving Ineligible",children:"🔴 FAILED - Ineligible"})]})]})]})]}),e.jsxs("div",{className:"space-y-2 text-xs",children:[e.jsx("label",{className:"text-[11px] font-bold text-slate-300 block",children:"Examiner Practical Driving Feedback & Road Observations"}),e.jsx("textarea",{value:tdNotes,onChange:a=>setTdNotes(a.target.value),placeholder:"Record detailed observations during the test drive (e.g. reverse parking accuracy, highway speed discipline, brake confidence, trailer alignment, cabin cleanliness)...",className:"w-full h-20 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs p-3 focus:border-blue-500 focus:outline-none"})]}),e.jsxs("div",{className:"flex items-center justify-between pt-1 flex-wrap gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{type:"button",onClick:()=>{setTdStatus("Passed");setTdResult("Passed - Heavy Multi-Axle Fleet Recommended");},className:"px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors",children:"✓ Quick Mark: Passed"}),e.jsx("button",{type:"button",onClick:()=>{setTdStatus("Failed");setTdResult("Failed - Driving Ineligible");},className:"px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600/30 transition-colors",children:"✕ Quick Mark: Failed"})]}),e.jsx("button",{type:"button",onClick:saveTestDriveAssessment,disabled:tdSaving,className:"px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5",children:tdSaving?"Saving...":"💾 Save Test Drive Assessment"})]})]}),`;

const modalHrMarker = 'e.jsxs("div",{className:"bg-muted/30 rounded-2xl p-4 border border-border space-y-3",children:[e.jsx("h3",{className:"font-extrabold text-foreground text-sm",children:"Update Application Status & HR Notes"})';
if (!rDash.includes(modalHrMarker)) {
  throw new Error('Could not find modalHrMarker in RecruitmentDashboardPage');
}
rDash = rDash.replace(modalHrMarker, testDriveModalSectionJSX + modalHrMarker);

// B5: Table candidate column test drive badge
const tableTestDriveBadgeJSX = `,(t.applicant_role==="Driver"||t.test_drive_ready)&&e.jsx("div",{className:"mt-1",children:(t.status==="Test Drive Passed"||(t.test_drive_result&&t.test_drive_result.includes("Pass")))?e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400",children:["✅ Test Drive: PASSED ",t.test_drive_score?\`(\${t.test_drive_score}★)\`:\"\"]}):(t.status==="Test Drive Scheduled"||t.test_drive_date)?e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300",children:["⏱️ Test Drive: ",t.test_drive_date?t.test_drive_date.split("T")[0]:"Scheduled"]}):(t.status==="Test Drive Failed"||(t.test_drive_result&&t.test_drive_result.includes("Fail")))?e.jsx("span",{className:"inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/40 text-rose-400",children:"❌ Test Drive: FAILED"}):e.jsxs("span",{className:"inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400/80",children:["🚚 Test Drive: ",t.test_drive_ready?"Ready":"Pending"]})})`;

const candidatePhoneColEnd = 'className:"text-[10px] text-primary font-mono font-bold hover:underline",children:t.phone})]})]})})';
if (!rDash.includes(candidatePhoneColEnd)) {
  throw new Error('Could not find candidatePhoneColEnd in RecruitmentDashboardPage');
}
rDash = rDash.replace(candidatePhoneColEnd, 'className:"text-[10px] text-primary font-mono font-bold hover:underline",children:t.phone})' + tableTestDriveBadgeJSX + ']})]})})');

// B6: Update stats calculation and cards
const oldStatsObj = 'S=c.useMemo(()=>({total:i.length,applied:i.filter(t=>t.status==="Applied").length,shortlisted:i.filter(t=>t.status==="Shortlisted").length,interview:i.filter(t=>t.status==="Interview").length,selected:i.filter(t=>t.status==="Selected").length,rejected:i.filter(t=>t.status==="Rejected").length}),[i])';
const newStatsObj = 'S=c.useMemo(()=>({total:i.length,applied:i.filter(t=>t.status==="Applied").length,shortlisted:i.filter(t=>t.status==="Shortlisted").length,interview:i.filter(t=>t.status==="Interview").length,testDrive:i.filter(t=>(t.status&&t.status.includes("Test Drive"))||t.test_drive_status==="Scheduled"||t.test_drive_status==="Passed").length,selected:i.filter(t=>t.status==="Selected").length,rejected:i.filter(t=>t.status==="Rejected").length}),[i])';

if (!rDash.includes(oldStatsObj)) {
  throw new Error('Could not find oldStatsObj in RecruitmentDashboardPage');
}
rDash = rDash.replace(oldStatsObj, newStatsObj);

const oldStatsArr = '{label:"Interview Stage",value:S.interview,icon:ve,color:"text-amber-400",bg:"bg-amber-500/10"}';
const newStatsArr = '{label:"Interview Stage",value:S.interview,icon:ve,color:"text-amber-400",bg:"bg-amber-500/10"},{label:"🚚 Test Drive Stage",value:S.testDrive,icon:O,color:"text-cyan-400",bg:"bg-cyan-500/10"}';

if (!rDash.includes(oldStatsArr)) {
  throw new Error('Could not find oldStatsArr in RecruitmentDashboardPage');
}
rDash = rDash.replace(oldStatsArr, newStatsArr);

console.log('✓ RecruitmentDashboardPage string transformations applied.');

// Validate rDash with esbuild
const compiledRDash = esbuild.transformSync(rDash, { loader: 'js', target: 'es2020' }).code;
console.log('✓ RecruitmentDashboardPage validated successfully! Length:', compiledRDash.length);

// Save generated tools copies
fs.writeFileSync(path.join(__dirname, 'DriverApplicationPage.upgraded.js'), compiledDApp, 'utf8');
fs.writeFileSync(path.join(__dirname, 'RecruitmentDashboardPage.upgraded.js'), compiledRDash, 'utf8');

// ============================================================================
// PART C: WRITE TO ALL 8 TARGET CHUNK DESTINATIONS
// ============================================================================
const dAppDests = [
  path.join(__dirname, '../dist/assets/DriverApplicationPage-DRqVLxd0.js'),
  path.join(__dirname, '../apps/web/dist/assets/DriverApplicationPage-DRqVLxd0.js'),
  path.join(__dirname, '../apps/api/dist/assets/DriverApplicationPage-DRqVLxd0.js'),
  path.join(__dirname, '../dist/apps/web/assets/DriverApplicationPage-DRqVLxd0.js')
];

const rDashDests = [
  path.join(__dirname, '../dist/assets/RecruitmentDashboardPage-BXt0K_qh.js'),
  path.join(__dirname, '../apps/web/dist/assets/RecruitmentDashboardPage-BXt0K_qh.js'),
  path.join(__dirname, '../apps/api/dist/assets/RecruitmentDashboardPage-BXt0K_qh.js'),
  path.join(__dirname, '../dist/apps/web/assets/RecruitmentDashboardPage-BXt0K_qh.js')
];

for (const dest of dAppDests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, compiledDApp, 'utf8');
  console.log('✓ Updated DriverApplicationPage ->', dest);
}

for (const dest of rDashDests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, compiledRDash, 'utf8');
  console.log('✓ Updated RecruitmentDashboardPage ->', dest);
}

console.log('🎉 ALL 8 RECRUITMENT CHUNKS SUCCESSFULLY COMPILED & WRITTEN WITH TEST DRIVE!');
