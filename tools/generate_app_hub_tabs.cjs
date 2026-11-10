const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

console.log('Generating Overhauled Mobile App Hub with Interactive Categorized Tabs...');

const componentSource = `
import {
  u as useAuth,
  r as React,
  a6 as TruckIcon,
  aF as TyresIcon,
  aG as FileBoxIcon,
  aH as QrCodeIcon,
  as as WrenchIcon,
  aI as DropletIcon,
  aJ as ClipboardListIcon,
  aK as NavigationIcon,
  ae as MapPinIcon,
  aL as PackageIcon,
  aM as CheckSquareIcon,
  ad as Building2Icon,
  aN as LayoutDashboardIcon,
  ap as SparklesIcon,
  aO as BarChart3Icon,
  ai as TrendingUpIcon,
  aP as CalculatorIcon,
  aQ as PieChartIcon,
  aR as TrophyIcon,
  aS as IdCardIcon,
  a3 as ReceiptIcon,
  a0 as FileTextIcon,
  al as WarningIcon,
  a8 as CreditCardIcon,
  aT as ShieldAlertIcon,
  aU as ShieldCheckIcon,
  a7 as UsersIcon,
  aV as CalendarDaysIcon,
  aW as UserPlusIcon,
  aX as TargetIcon,
  aY as Contact2Icon,
  aZ as BriefcaseIcon,
  a_ as MailIcon,
  a$ as BellIcon,
  b0 as DatabaseIcon,
  am as SettingsIcon,
  j as jsxRuntime,
  at as SearchIcon,
  X as CloseIcon,
  aA as ArrowRightIcon
} from "./vendor-react-Bs5V2qFE.js";
import {
  u as useNavigate,
  M as motion,
  p as pb,
  m as motionObj
} from "./index-DLxf9dwO.js";
import "./vendor-radix-BQCqNqg0.js";
import "./vendor-pdf-DtmgLs_2.js";

const { useState, useMemo, useRef } = React;

function LaunchpadPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const role = currentUser?.role || "user";
  const email = (currentUser?.email || "").toLowerCase();
  const isSuper = email === "munnarathod222@gmail.com" || role === "superuser" || role === "super_admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const tabsScrollRef = useRef(null);

  // 7 Exact Sidebar Sections with Complete Tab Data & Distinct Color Schemes
  const menuGroups = useMemo(() => [
    {
      id: "main_analytics",
      title: "Main & Analytics",
      shortTitle: "Main",
      subtitle: "Executive intelligence & fleet KPIs",
      icon: LayoutDashboardIcon,
      accentColor: "text-cyan-400",
      activeBg: "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/30",
      iconBg: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25",
      items: [
        { icon: LayoutDashboardIcon, label: "Dashboard", path: "/dashboard", desc: "Real-time overview of fleet operations", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: SparklesIcon, label: "AI Freight Marketplace", path: "/marketplace", desc: "AI load matching, corridor rates & shipper loads", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor", "user"] },
        { icon: TargetIcon, label: "Bidding Intelligence", path: "/bidding-intelligence", desc: "Freight lane bids, benchmark rates & bidding logs", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: BarChart3Icon, label: "Analytics", path: "/analytics", desc: "P&L reporting & financial matrices", roles: ["super_admin", "admin", "manager"] },
        { icon: TrendingUpIcon, label: "Trip Overview", path: "/dashboard/trip-overview", desc: "Global route metrics & calculations", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: CalculatorIcon, label: "Vehicle TCO & ROI", path: "/tco-roi", desc: "Calculate vehicle loan profiles & TCO", roles: ["super_admin", "admin", "manager"] },
        { icon: PieChartIcon, label: "Client Analysis", path: "/client-analysis", desc: "Revenue split and payment margins", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: TrophyIcon, label: "Leaderboard", path: "/leaderboard", desc: "Top performing drivers leaderboard", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: IdCardIcon, label: "Driver Scorecard", path: "/driver-scorecard", desc: "Driver safety, fuel and performance metrics", roles: ["super_admin", "admin", "manager"] }
      ]
    },
    {
      id: "fleet_operations",
      title: "Fleet & Operations",
      shortTitle: "Fleet",
      subtitle: "Vehicle logistics, trips, fuel & tracking",
      icon: TruckIcon,
      accentColor: "text-emerald-400",
      activeBg: "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/25 border-emerald-400",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent border-emerald-500/30",
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
      items: [
        { icon: TruckIcon, label: "Truck Manager", path: "/truck-manager", desc: "Track physical trucks & managers", roles: ["super_admin", "admin", "dispatcher", "supervisor"] },
        { icon: MapPinIcon, label: "GPS Tracking", path: "/gps", desc: "Live vehicle telematics & geo-fencing", roles: ["super_admin", "admin", "dispatcher", "manager", "supervisor", "user"] },
        { icon: TyresIcon, label: "Tyres & Battery", path: "/tyres", desc: "Track tyre serial numbers & replacement lifecycles", roles: ["super_admin", "admin", "dispatcher", "manager", "supervisor"] },
        { icon: FileBoxIcon, label: "Vehicle Docs", path: "/truck-docs", desc: "RC, Insurance & permit renewals", roles: ["super_admin", "admin", "dispatcher", "supervisor"] },
        { icon: QrCodeIcon, label: "Vehicle QR Pass Hub", path: "/truck-docs?view=qr_pass", desc: "Instant QR gate passes for security checkpoints", roles: ["super_admin", "admin", "dispatcher", "manager", "supervisor"] },
        { icon: WrenchIcon, label: "Fleet Maintenance", path: "/fleet-maintenance", desc: "Servicing logs, problems & inventory", roles: ["super_admin", "admin", "dispatcher"] },
        { icon: DropletIcon, label: "Fuel Tracker & AI Scanner", path: "/fuel-tracker", desc: "Fuel purchases, efficiency KMPL & receipts", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: ClipboardListIcon, label: "Trip Logs", path: "/trip-logs", desc: "Manage & dispatch trip schedules", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: NavigationIcon, label: "Track Shipment", path: "/tracking", desc: "Live consignment tracking & ETA status", roles: ["super_admin", "admin", "dispatcher", "manager", "user"] },
        { icon: MapPinIcon, label: "Route Master", path: "/routes-master", desc: "Route rate configurations & origins", roles: ["super_admin", "admin", "dispatcher"] },
        { icon: PackageIcon, label: "Inventory", path: "/inventory", desc: "Manage spare parts stock levels", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: FileBoxIcon, label: "Lorry Receipts & POD", path: "/pod-management", desc: "Official LR / Bilty generation & POD verification", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: CheckSquareIcon, label: "Exit Audit", path: "/exit-audit", desc: "Vehicle inspections before releases", roles: ["super_admin", "admin", "manager", "dispatcher"] }
      ]
    },
    {
      id: "finance_accounts",
      title: "Finance & Accounts",
      shortTitle: "Finance",
      subtitle: "Cashflow, expenses, tax, cards & payroll",
      icon: CreditCardIcon,
      accentColor: "text-amber-400",
      activeBg: "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 border-amber-400",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30",
      iconBg: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
      items: [
        { icon: ReceiptIcon, label: "Cashbook", path: "/cashbook", desc: "Petty cash balances & double entry ledger", roles: ["super_admin", "admin", "manager"] },
        { icon: FileTextIcon, label: "Expenses", path: "/expenses", desc: "Track fleet and operational overheads", roles: ["super_admin", "admin", "manager"] },
        { icon: WarningIcon, label: "Payment Requests", path: "/payment-requests", desc: "Submit and approve vendor requests", roles: ["super_admin", "admin", "manager"] },
        { icon: ReceiptIcon, label: "Invoice Matching", path: "/invoice-matching", desc: "Match invoices with client trips and PODs", roles: ["super_admin", "admin", "manager"] },
        { icon: CreditCardIcon, label: "FASTag Management", path: "/fastag", desc: "Truck balances, tolls & recharge history", roles: ["super_admin", "admin", "manager"] },
        { icon: CreditCardIcon, label: "Credit Cards", path: "/credit-cards", desc: "Manage company cards & payments", roles: ["super_admin", "admin"] },
        { icon: ReceiptIcon, label: "GST ITC Tax", path: "/gst-itc", desc: "Tax liabilities, credits and GST filings", roles: ["super_admin", "admin", "manager"] },
        { icon: ShieldAlertIcon, label: "Insurance Manager", path: "/insurance-manager", desc: "Fleet policy renewals, claims & broker rates", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: ShieldCheckIcon, label: "Company Vault", path: "/company-vault", desc: "Secure encrypted document & certificate storage", roles: ["super_admin", "admin", "manager"] },
        { icon: CalculatorIcon, label: "EMI Calculator", path: "/emi-calculator", desc: "Calculate vehicle loan profiles & amortization", roles: ["super_admin", "admin", "manager"] },
        { icon: FileTextIcon, label: "Payroll", path: "/payroll", desc: "Staff salaries, advances & monthly disbursements", roles: ["super_admin", "admin"] },
        { icon: FileTextIcon, label: "Quotes & B2B Contracts", path: "/quotes-manager", desc: "B2B rate cards, proposals & quotation PDFs", roles: ["super_admin", "admin", "manager"] }
      ]
    },
    {
      id: "staff_hr",
      title: "Staff & HR",
      shortTitle: "Staff",
      subtitle: "Drivers, employees, attendance & hiring",
      icon: UsersIcon,
      accentColor: "text-violet-400",
      activeBg: "bg-violet-500 text-slate-950 font-black shadow-lg shadow-violet-500/25 border-violet-400",
      badgeColor: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
      gradient: "from-violet-500/20 via-purple-500/10 to-transparent border-violet-500/30",
      iconBg: "bg-violet-500/15 text-violet-400 border border-violet-500/25",
      items: [
        { icon: UsersIcon, label: "Employees", path: "/employees", desc: "Driver profiles and active staff directory", roles: ["super_admin", "admin", "manager", "supervisor"] },
        { icon: FileBoxIcon, label: "Employee Docs", path: "/employee-docs", desc: "ID proofs, DL copies & driver contracts", roles: ["super_admin", "admin", "supervisor"] },
        { icon: CalendarDaysIcon, label: "Attendance Hub", path: "/dashboard/attendance", desc: "Daily biometric and manual attendance logs", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: UserPlusIcon, label: "Recruitment Portal", path: "/recruitment", desc: "Driver hiring pipeline, tests & test drives", roles: ["super_admin", "admin", "manager"] }
      ]
    },
    {
      id: "crm_partners",
      title: "CRM & Partners",
      shortTitle: "CRM",
      subtitle: "Clients, vendors, credit limits & leads",
      icon: Building2Icon,
      accentColor: "text-rose-400",
      activeBg: "bg-rose-500 text-slate-950 font-black shadow-lg shadow-rose-500/25 border-rose-400",
      badgeColor: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
      gradient: "from-rose-500/20 via-pink-500/10 to-transparent border-rose-500/30",
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
      items: [
        { icon: UsersIcon, label: "Clients List", path: "/clients", desc: "Client accounts, billing terms & credit limits", roles: ["super_admin", "admin", "manager"] },
        { icon: ShieldAlertIcon, label: "Credit Control", path: "/credit-control", desc: "Track overdue balances & automated follow-ups", roles: ["super_admin", "admin", "manager"] },
        { icon: Building2Icon, label: "Vendor Registration Tracker", path: "/vendor-tracker", desc: "Subcontractor empanelment & compliance status", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: Building2Icon, label: "Transport CRM", path: "/transport-crm", desc: "Shipper interactions, deals & lane history", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: TargetIcon, label: "Sales & Vendor Leads", path: "/sales-leads", desc: "New freight opportunities & vendor inquiries", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: Contact2Icon, label: "Contacts Directory", path: "/contacts", desc: "Shippers, brokers, mechanics & emergency contacts", roles: ["super_admin", "admin", "manager", "dispatcher"] }
      ]
    },
    {
      id: "studio_tools",
      title: "Studio & Tools",
      shortTitle: "Tools",
      subtitle: "Mail, calendar, tasks & workflow engine",
      icon: BriefcaseIcon,
      accentColor: "text-indigo-400",
      activeBg: "bg-indigo-500 text-slate-950 font-black shadow-lg shadow-indigo-500/25 border-indigo-400",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
      gradient: "from-indigo-500/20 via-blue-500/10 to-transparent border-indigo-500/30",
      iconBg: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25",
      items: [
        { icon: BriefcaseIcon, label: "Branding Hub", path: "/branding-hub", desc: "Official letterheads, badges & company assets", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor", "user"] },
        { icon: MailIcon, label: "Business Mail", path: "/business-mail", desc: "Communication portal & corporate mailboxes", roles: ["super_admin", "admin", "manager", "dispatcher"] },
        { icon: CalendarDaysIcon, label: "Calendar", path: "/calendar", desc: "Monthly dispatch schedules & compliance reminders", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: BellIcon, label: "Reminders", path: "/reminders", desc: "Stay updated on vehicle & regulatory deadlines", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: CheckSquareIcon, label: "To-Do List", path: "/todo", desc: "Daily operational task checklist manager", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: CheckSquareIcon, label: "Workflow Command Center", path: "/todo", desc: "Enterprise tasks, approvals & automated sync", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] },
        { icon: DatabaseIcon, label: "Data Backup & Export", path: "/data-backup", desc: "Export full PDF, Excel & CSV database dumps", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor", "user"] }
      ]
    },
    {
      id: "administration",
      title: "Administration",
      shortTitle: "Admin",
      subtitle: "User access, audit logs & system config",
      icon: SettingsIcon,
      accentColor: "text-slate-300",
      activeBg: "bg-slate-200 text-slate-950 font-black shadow-lg shadow-white/10 border-white",
      badgeColor: "bg-slate-800 text-slate-300 border border-slate-700",
      gradient: "from-slate-500/20 via-zinc-500/10 to-transparent border-slate-500/30",
      iconBg: "bg-slate-800 text-slate-200 border border-slate-700",
      items: [
        { icon: UsersIcon, label: "User Management", path: "/dashboard/users", desc: "Portal system users, invitations & roles", roles: ["superuser", "super_admin", "admin"] },
        { icon: ShieldCheckIcon, label: "Audit & Security Logs", path: "/dashboard/audit-logs", desc: "System event audits, logins & security tracking", roles: ["superuser", "super_admin"] },
        { icon: FileTextIcon, label: "Reports Center", path: "/reports", desc: "Comprehensive business reports & summaries", roles: ["super_admin", "admin"] },
        { icon: SettingsIcon, label: "Settings", path: "/dashboard/profile", desc: "Personal profile, security & system options", roles: ["super_admin", "admin", "manager", "dispatcher", "supervisor"] }
      ]
    }
  ], []);

  // Filter groups according to user role
  const authorizedGroups = useMemo(() => {
    return menuGroups.map(group => {
      const filteredItems = group.items.filter(item => {
        if (isSuper) return true;
        return (item.roles || []).includes(role);
      });
      return {
        ...group,
        items: filteredItems,
        count: filteredItems.length
      };
    }).filter(group => group.count > 0);
  }, [menuGroups, isSuper, role]);

  // Total modules count
  const totalModulesCount = useMemo(() => {
    return authorizedGroups.reduce((acc, g) => acc + g.count, 0);
  }, [authorizedGroups]);

  // Categories list for tab pills
  const categoriesList = useMemo(() => {
    const list = [{ title: "All", count: totalModulesCount, id: "all", icon: SparklesIcon }];
    authorizedGroups.forEach(g => {
      list.push({ title: g.title, count: g.count, id: g.id, icon: g.icon, activeBg: g.activeBg, accentColor: g.accentColor });
    });
    return list;
  }, [authorizedGroups, totalModulesCount]);

  // Filter groups based on search and activeCategory
  const displayedGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return authorizedGroups.map(group => {
      if (activeCategory !== "All" && group.title !== activeCategory) {
        return null;
      }
      const matchedItems = group.items.filter(item => {
        if (!query) return true;
        return (
          item.label.toLowerCase().includes(query) ||
          item.desc.toLowerCase().includes(query)
        );
      });
      if (matchedItems.length === 0) return null;
      return {
        ...group,
        items: matchedItems
      };
    }).filter(Boolean);
  }, [authorizedGroups, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#070A13] text-white px-4 pt-4 pb-28 md:hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] tracking-widest font-black uppercase text-cyan-400/90 flex items-center gap-1">
            <span>JAI BHAVANI CARGO</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">OPERATIONS PORTAL</span>
          </span>
          <h1 className="text-2xl font-black tracking-tight mt-0.5 flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-400">
            App Hub <SparklesIcon className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
            {totalModulesCount} Modules
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-extrabold text-xs text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            {(currentUser?.full_name || currentUser?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Modern App Search */}
      <div className="relative mb-3.5">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search all modules (e.g. cashbook, tyres, bilty)..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-11 pr-10 text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 backdrop-blur-md transition-all text-white shadow-inner"
        />
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-slate-300 transition"
          >
            <CloseIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Interactive Categorized Sidebar Tabs Bar (with icons & module count badges) */}
      <div 
        ref={tabsScrollRef}
        className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none snap-x snap-mandatory -mx-4 px-4 scroll-smooth"
      >
        {categoriesList.map(cat => {
          const isActive = activeCategory === cat.title;
          const IconComp = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.title);
                setSearchQuery("");
              }}
              className={"flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all snap-align-start cursor-pointer border " + (
                isActive
                  ? (cat.activeBg || "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400 scale-[1.02]")
                  : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              )}
            >
              <IconComp className={"w-3.5 h-3.5 " + (isActive ? "text-slate-950" : (cat.accentColor || "text-slate-400"))} />
              <span>{cat.title}</span>
              <span className={"ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black " + (
                isActive ? "bg-black/20 text-slate-950" : "bg-slate-800 text-slate-400"
              )}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* When a specific category is selected, show an executive banner header */}
      {activeCategory !== "All" && displayedGroups.length > 0 && (() => {
        const currentGroup = displayedGroups[0];
        const GroupIcon = currentGroup.icon;
        return (
          <div className={"p-3.5 mb-4 rounded-2xl border bg-gradient-to-r " + currentGroup.gradient + " flex items-center justify-between shadow-lg"}>
            <div className="flex items-center gap-3">
              <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + currentGroup.iconBg}>
                <GroupIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white leading-tight">
                  {currentGroup.title}
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {currentGroup.subtitle}
                </p>
              </div>
            </div>
            <div className={"px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold " + currentGroup.badgeColor}>
              {currentGroup.items.length} {currentGroup.items.length === 1 ? "module" : "modules"}
            </div>
          </div>
        );
      })()}

      {/* Empty Search State */}
      {displayedGroups.length === 0 && (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/50 border border-slate-800 mt-4">
          <SearchIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No modules found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            No matching modules for "{searchQuery}" in {activeCategory}.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            className="mt-4 px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Module Cards Grid */}
      <div className="space-y-6">
        {displayedGroups.map(group => {
          return (
            <div key={group.id} className="space-y-2.5">
              {/* If viewing All, show group header */}
              {activeCategory === "All" && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={"w-2 h-2 rounded-full " + (
                      group.id === "main_analytics" ? "bg-cyan-400" :
                      group.id === "fleet_operations" ? "bg-emerald-400" :
                      group.id === "finance_accounts" ? "bg-amber-400" :
                      group.id === "staff_hr" ? "bg-violet-400" :
                      group.id === "crm_partners" ? "bg-rose-400" :
                      group.id === "studio_tools" ? "bg-indigo-400" : "bg-slate-400"
                    )} />
                    <h2 className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                      {group.title}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {group.items.length} {group.items.length === 1 ? "tab" : "tabs"}
                  </span>
                </div>
              )}

              {/* 2-Column Responsive Card Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {group.items.map(item => {
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.path + item.label}
                      onClick={() => navigate(item.path)}
                      className={"flex flex-col items-start p-3 rounded-2xl border bg-gradient-to-br " + group.gradient + " transition-all cursor-pointer relative overflow-hidden group/item active:scale-[0.97] shadow-sm hover:shadow-md hover:border-slate-700"}
                    >
                      {/* Icon & Arrow */}
                      <div className="w-full flex items-center justify-between mb-2">
                        <div className={"w-8 h-8 rounded-xl flex items-center justify-center " + group.iconBg}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-slate-300 transition-colors" />
                      </div>

                      {/* Title & Desc */}
                      <div className="w-full mt-auto">
                        <h3 className="text-xs font-bold text-white leading-tight line-clamp-1">
                          {item.label}
                        </h3>
                        <p className="text-[9.5px] text-slate-400 line-clamp-2 mt-1 leading-snug font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { LaunchpadPage as default };
`;

const res = esbuild.transformSync(componentSource, {
  loader: 'jsx',
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  target: 'es2020',
  minify: false
});

const compiled = res.code;
console.log('Compiled length:', compiled.length);

// Target destinations
const chunkDests = [
  path.join(__dirname, '../dist/assets/LaunchpadPage-DLaI-S9K.js'),
  path.join(__dirname, '../apps/web/dist/assets/LaunchpadPage-DLaI-S9K.js'),
  path.join(__dirname, '../apps/api/dist/assets/LaunchpadPage-DLaI-S9K.js'),
  path.join(__dirname, '../dist/apps/web/assets/LaunchpadPage-DLaI-S9K.js')
];

for (const dest of chunkDests) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, compiled, 'utf8');
  console.log('✓ Successfully written chunk to:', dest);
}

console.log('✅ All App Hub Launchpad chunk destinations updated successfully with 7 Sidebar Tabs!');
