import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: "Dashboard",
    analytics: "Analytics",
    client_analysis: "Client Analysis",
    trip_overview: "Trip Overview",
    reminders: "Reminders",
    todo_list: "To-Do List",
    trip_logs: "Trip Logs",
    route_master: "Route Master",
    quotes: "Quotes",
    fuel_tracker: "Fuel Tracker",
    fleet_maintenance: "Fleet Maintenance",
    inventory: "Inventory Management",
    pod: "POD",
    exit_audit: "Exit Audit",
    cashbook: "Cashbook",
    expenses: "Expenses",
    payment_requests: "Payment Requests",
    credit_cards: "Credit Cards",
    payroll: "Payroll",
    emi_calculator: "EMI Calculator",
    truck_manager: "Truck Manager",
    vehicle_docs: "Vehicle Docs",
    employees: "Employees",
    employee_docs: "Employee Docs",
    attendance: "Attendance",
    business_mail: "Business Mail",
    contacts: "Contacts",
    clients: "Clients",
    user_management: "User Management",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    welcome: "Welcome back",
    assigned_shipments: "Assigned Shipments",
    pending_pods: "Pending PODs",
    active_tasks: "Active Tasks",
    active_fleet: "Active Fleet",
    net_revenue: "Net Revenue Settled",
    retained_earnings: "Retained Earnings",
    total_shipments: "Total Shipments",
    recent_shipments: "Recent Shipments",
    system_health: "System Health",
    add_expense: "Add Expense",
    dispatch_trip: "Dispatch Trip",
    record_advance: "Record Advance",
    log_maintenance: "Log Maintenance",
    overview: "Overview",
    operations: "Operations",
    finance: "Finance",
    fleet_staff: "Fleet & Staff",
    communication: "Communication",
    directory: "Directory",
    administration: "Administration",
    profile: "Profile"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    analytics: "विश्लेषण",
    client_analysis: "ग्राहक विश्लेषण",
    trip_overview: "यात्रा अवलोकन",
    reminders: "अनुस्मारक",
    todo_list: "कार्य सूची",
    trip_logs: "यात्रा लॉग",
    route_master: "मार्ग मास्टर",
    quotes: "कोटेशन",
    fuel_tracker: "ईंधन ट्रैकर",
    fleet_maintenance: "बेड़ा रखरखाव",
    inventory: "इन्वेंटरी प्रबंधन",
    pod: "पीओडी",
    exit_audit: "निकास ऑडिट",
    cashbook: "कैशबुक",
    expenses: "खर्चे",
    payment_requests: "भुगतान अनुरोध",
    credit_cards: "क्रेडिट कार्ड",
    payroll: "पेरोल",
    emi_calculator: "ईएमआई कैलकुलेटर",
    truck_manager: "ट्रक प्रबंधक",
    vehicle_docs: "वाहन दस्तावेज",
    employees: "कर्मचारी",
    employee_docs: "कर्मचारी दस्तावेज",
    attendance: "उपस्थिति",
    business_mail: "बिजनेस मेल",
    contacts: "संपर्क",
    clients: "ग्राहक",
    user_management: "उपयोगकर्ता प्रबंधन",
    reports: "रिपोर्ट",
    settings: "सेटिंग्स",
    logout: "लॉगआउट",
    welcome: "आपका स्वागत है",
    assigned_shipments: "सौंपे गए शिपमेंट",
    pending_pods: "लंबित पीओडी",
    active_tasks: "सक्रिय कार्य",
    active_fleet: "सक्रिय बेड़ा",
    net_revenue: "शुद्ध राजस्व तय",
    retained_earnings: "प्रतिधारित आय",
    total_shipments: "कुल शिपमेंट",
    recent_shipments: "हाल के शिपमेंट",
    system_health: "सिस्टम स्वास्थ्य",
    add_expense: "खर्च जोड़ें",
    dispatch_trip: "यात्रा भेजें",
    record_advance: "अग्रिम रिकॉर्ड करें",
    log_maintenance: "रखरखाव दर्ज करें",
    overview: "अवलोकन",
    operations: "संचालन",
    finance: "वित्त",
    fleet_staff: "बेड़ा और कर्मचारी",
    communication: "संचार",
    directory: "निर्देशिका",
    administration: "प्रशासन",
    profile: "प्रोफ़ाइल"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    analytics: "विश्लेषण",
    client_analysis: "ग्राहक विश्लेषण",
    trip_overview: "प्रवास आढावा",
    reminders: "स्मरणपत्रे",
    todo_list: "कार्य सूची",
    trip_logs: "प्रवास नोंदी",
    route_master: "मार्ग मास्टर",
    quotes: "कोटेशन",
    fuel_tracker: "इंधन ट्रॅकर",
    fleet_maintenance: "वाहन देखभाल",
    inventory: "इन्व्हेंटरी व्यवस्थापन",
    pod: "पीओडी",
    exit_audit: "निकास ऑडिट",
    cashbook: "कॅशबुक",
    expenses: "खर्च",
    payment_requests: "पैसे मिळण्याची विनंती",
    credit_cards: "क्रेडिट कार्ड",
    payroll: "पेरोल",
    emi_calculator: "ईएमआय कॅल्क्युलेटर",
    truck_manager: "ट्रक व्यवस्थापक",
    vehicle_docs: "वाहन दस्तऐवज",
    employees: "कर्मचारी",
    employee_docs: "कर्मचारी दस्तऐवज",
    attendance: "हजेरी",
    business_mail: "व्यवसाय मेल",
    contacts: "संपर्क",
    clients: "ग्राहक",
    user_management: "वापरकर्ता व्यवस्थापन",
    reports: "अहवाल",
    settings: "सेटिंग्ज",
    logout: "लॉगआउट",
    welcome: "पुन्हा स्वागत आहे",
    assigned_shipments: "सोपवलेले शिपमेंट",
    pending_pods: "प्रलंबित पीओडी",
    active_tasks: "सक्रिय कार्ये",
    active_fleet: "सक्रिय वाहन ताफा",
    net_revenue: "निव्वळ महसूल",
    retained_earnings: "राखून ठेवलेली कमाई",
    total_shipments: "एकूण शिपमेंट",
    recent_shipments: "अलीकडील शिपमेंट",
    system_health: "सिस्टम आरोग्य",
    add_expense: "खर्च जोडा",
    dispatch_trip: "प्रवास सुरू करा",
    record_advance: "अग्रिम नोंदवा",
    log_maintenance: "रखरखाव नोंदवा",
    overview: "आढावा",
    operations: "ऑपरेशन्स",
    finance: "वित्त",
    fleet_staff: "ताफा आणि कर्मचारी",
    communication: "संपर्क",
    directory: "डायरेक्टरी",
    administration: "प्रशासन",
    profile: "प्रोफाइल"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('app_language') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
