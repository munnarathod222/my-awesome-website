var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// apps/web/src/lib/react-shim.js
var react_shim_exports = {};
__export(react_shim_exports, {
  Children: () => Children,
  Fragment: () => Fragment,
  ReactDOM: () => ReactDOM,
  cloneElement: () => cloneElement,
  createContext: () => createContext,
  createElement: () => createElement,
  createPortal: () => createPortal,
  default: () => react_shim_default,
  forwardRef: () => forwardRef,
  isValidElement: () => isValidElement,
  jsx: () => jsx,
  jsxs: () => jsxs,
  useCallback: () => useCallback,
  useContext: () => useContext,
  useEffect: () => useEffect,
  useId: () => useId,
  useLayoutEffect: () => useLayoutEffect,
  useMemo: () => useMemo,
  useReducer: () => useReducer,
  useRef: () => useRef,
  useState: () => useState
});
import { r as _React } from "./vendor-react-Bs5V2qFE.js";
var React = _React || (typeof window !== "undefined" ? window.React : {});
var useState = (...args) => React.useState(...args);
var useEffect = (...args) => React.useEffect(...args);
var useLayoutEffect = (...args) => (React.useLayoutEffect || React.useEffect)(...args);
var useContext = (...args) => React.useContext(...args);
var createContext = (...args) => React.createContext(...args);
var useMemo = (...args) => React.useMemo(...args);
var useCallback = (...args) => React.useCallback(...args);
var useRef = (...args) => React.useRef(...args);
var useId = (...args) => React.useId ? React.useId(...args) : Math.random().toString(36).slice(2);
var useReducer = (...args) => React.useReducer(...args);
var forwardRef = (...args) => React.forwardRef(...args);
var createElement = (...args) => React.createElement(...args);
var cloneElement = (...args) => React.cloneElement(...args);
var Children = React.Children;
var Fragment = React.Fragment;
var isValidElement = (...args) => React.isValidElement(...args);
var createPortal = (children, container) => {
  try {
    if (typeof window !== "undefined" && window.ReactDOM && typeof window.ReactDOM.createPortal === "function") {
      return window.ReactDOM.createPortal(children, container);
    }
  } catch (e2) {
  }
  return children;
};
var ReactDOM = {
  createPortal
};
var jsx = (type, props, key) => {
  if (!props) return React.createElement(type, key !== void 0 ? { key } : null);
  const { children, ...rest } = props;
  const p = key !== void 0 ? { ...rest, key } : rest;
  if (children === void 0) return React.createElement(type, p);
  return Array.isArray(children) ? React.createElement(type, p, ...children) : React.createElement(type, p, children);
};
var jsxs = jsx;
var react_shim_default = React;

// apps/web/node_modules/lucide-react/dist/esm/shared/src/utils.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// apps/web/node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// apps/web/node_modules/lucide-react/dist/esm/Icon.js
var Icon = forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => {
    return createElement(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size,
        height: size,
        stroke: color,
        strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        className: mergeClasses("lucide", className),
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// apps/web/node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
      ...props
    })
  );
  Component.displayName = `${iconName}`;
  return Component;
};

// apps/web/node_modules/lucide-react/dist/esm/icons/arrow-left-right.js
var ArrowLeftRight = createLucideIcon("ArrowLeftRight", [
  ["path", { d: "M8 3 4 7l4 4", key: "9rb6wj" }],
  ["path", { d: "M4 7h16", key: "6tx8e3" }],
  ["path", { d: "m16 21 4-4-4-4", key: "siv7j2" }],
  ["path", { d: "M20 17H4", key: "h6l3hr" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/arrow-right.js
var ArrowRight = createLucideIcon("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/award.js
var Award = createLucideIcon("Award", [
  [
    "path",
    {
      d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
      key: "1yiouv"
    }
  ],
  ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/building.js
var Building = createLucideIcon("Building", [
  ["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2", key: "76otgf" }],
  ["path", { d: "M9 22v-4h6v4", key: "r93iot" }],
  ["path", { d: "M8 6h.01", key: "1dz90k" }],
  ["path", { d: "M16 6h.01", key: "1x0f13" }],
  ["path", { d: "M12 6h.01", key: "1vi96p" }],
  ["path", { d: "M12 10h.01", key: "1nrarc" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 10h.01", key: "1m94wz" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 10h.01", key: "19clt8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/calendar-days.js
var CalendarDays = createLucideIcon("CalendarDays", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/calendar.js
var Calendar = createLucideIcon("Calendar", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/check.js
var Check = createLucideIcon("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);

// apps/web/node_modules/lucide-react/dist/esm/icons/chevron-left.js
var ChevronLeft = createLucideIcon("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/chevron-right.js
var ChevronRight = createLucideIcon("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/circle-alert.js
var CircleAlert = createLucideIcon("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/circle-check.js
var CircleCheck = createLucideIcon("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/circle-x.js
var CircleX = createLucideIcon("CircleX", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/clipboard-check.js
var ClipboardCheck = createLucideIcon("ClipboardCheck", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/clock.js
var Clock = createLucideIcon("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/compass.js
var Compass = createLucideIcon("Compass", [
  [
    "path",
    {
      d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",
      key: "9ktpf1"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/dollar-sign.js
var DollarSign = createLucideIcon("DollarSign", [
  ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
  ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/file-text.js
var FileText = createLucideIcon("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/filter.js
var Filter = createLucideIcon("Filter", [
  ["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/layers.js
var Layers = createLucideIcon("Layers", [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/lock.js
var Lock = createLucideIcon("Lock", [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/map-pin.js
var MapPin = createLucideIcon("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/maximize-2.js
var Maximize2 = createLucideIcon("Maximize2", [
  ["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }],
  ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }],
  ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/minimize-2.js
var Minimize2 = createLucideIcon("Minimize2", [
  ["polyline", { points: "4 14 10 14 10 20", key: "11kfnr" }],
  ["polyline", { points: "20 10 14 10 14 4", key: "rlmsce" }],
  ["line", { x1: "14", x2: "21", y1: "10", y2: "3", key: "o5lafz" }],
  ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/navigation.js
var Navigation = createLucideIcon("Navigation", [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/plane-takeoff.js
var PlaneTakeoff = createLucideIcon("PlaneTakeoff", [
  ["path", { d: "M2 22h20", key: "272qi7" }],
  [
    "path",
    {
      d: "M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z",
      key: "fkigj9"
    }
  ]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/plus.js
var Plus = createLucideIcon("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/printer.js
var Printer = createLucideIcon("Printer", [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/radio.js
var Radio = createLucideIcon("Radio", [
  ["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }],
  ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }],
  ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }],
  ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }],
  ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/refresh-cw.js
var RefreshCw = createLucideIcon("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/repeat.js
var Repeat = createLucideIcon("Repeat", [
  ["path", { d: "m17 2 4 4-4 4", key: "nntrym" }],
  ["path", { d: "M3 11v-1a4 4 0 0 1 4-4h14", key: "84bu3i" }],
  ["path", { d: "m7 22-4-4 4-4", key: "1wqhfi" }],
  ["path", { d: "M21 13v1a4 4 0 0 1-4 4H3", key: "1rx37r" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/search.js
var Search = createLucideIcon("Search", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/shield-alert.js
var ShieldAlert = createLucideIcon("ShieldAlert", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/shield-check.js
var ShieldCheck = createLucideIcon("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/sparkles.js
var Sparkles = createLucideIcon("Sparkles", [
  [
    "path",
    {
      d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
      key: "4pj2yx"
    }
  ],
  ["path", { d: "M20 3v4", key: "1olli1" }],
  ["path", { d: "M22 5h-4", key: "1gvqau" }],
  ["path", { d: "M4 17v2", key: "vumght" }],
  ["path", { d: "M5 18H3", key: "zchphs" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/trending-down.js
var TrendingDown = createLucideIcon("TrendingDown", [
  ["polyline", { points: "22 17 13.5 8.5 8.5 13.5 2 7", key: "1r2t7k" }],
  ["polyline", { points: "16 17 22 17 22 11", key: "11uiuu" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/trending-up.js
var TrendingUp = createLucideIcon("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/triangle-alert.js
var TriangleAlert = createLucideIcon("TriangleAlert", [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/truck.js
var Truck = createLucideIcon("Truck", [
  ["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }],
  ["path", { d: "M15 18H9", key: "1lyqi6" }],
  [
    "path",
    {
      d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",
      key: "lysw3i"
    }
  ],
  ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }],
  ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/user-check.js
var UserCheck = createLucideIcon("UserCheck", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["polyline", { points: "16 11 18 13 22 9", key: "1pwet4" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/user.js
var User = createLucideIcon("User", [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
]);

// node_modules/clsx/dist/clsx.mjs
function r(e2) {
  var t2, f, n2 = "";
  if ("string" == typeof e2 || "number" == typeof e2) n2 += e2;
  else if ("object" == typeof e2) if (Array.isArray(e2)) {
    var o = e2.length;
    for (t2 = 0; t2 < o; t2++) e2[t2] && (f = r(e2[t2])) && (n2 && (n2 += " "), n2 += f);
  } else for (f in e2) e2[f] && (n2 && (n2 += " "), n2 += f);
  return n2;
}
function clsx() {
  for (var e2, t2, f = 0, n2 = "", o = arguments.length; f < o; f++) (e2 = arguments[f]) && (t2 = r(e2)) && (n2 && (n2 += " "), n2 += t2);
  return n2;
}

// node_modules/tailwind-merge/dist/bundle-mjs.mjs
var CLASS_PART_SEPARATOR = "-";
var createClassGroupUtils = (config) => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = (className) => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    if (classParts[0] === "" && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
var getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : void 0;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return void 0;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
var arbitraryPropertyRegex = /^\[(.+)\]$/;
var getGroupIdForArbitraryProperty = (className) => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(":"));
    if (property) {
      return "arbitrary.." + property;
    }
  }
};
var createClassMap = (config) => {
  const {
    theme,
    prefix
  } = config;
  const classMap = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  const prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(([classGroupId, classGroup]) => {
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach((classDefinition) => {
    if (typeof classDefinition === "string") {
      const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === "function") {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup2]) => {
      processClassesRecursively(classGroup2, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
var getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach((pathPart) => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: /* @__PURE__ */ new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
var isThemeGetter = (func) => func.isThemeGetter;
var getPrefixedClassGroupEntries = (classGroupEntries, prefix) => {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(([classGroupId, classGroup]) => {
    const prefixedClassGroup = classGroup.map((classDefinition) => {
      if (typeof classDefinition === "string") {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === "object") {
        return Object.fromEntries(Object.entries(classDefinition).map(([key, value]) => [prefix + key, value]));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
};
var createLruCache = (maxCacheSize) => {
  if (maxCacheSize < 1) {
    return {
      get: () => void 0,
      set: () => {
      }
    };
  }
  let cacheSize = 0;
  let cache = /* @__PURE__ */ new Map();
  let previousCache = /* @__PURE__ */ new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = /* @__PURE__ */ new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== void 0) {
        return value;
      }
      if ((value = previousCache.get(key)) !== void 0) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
var IMPORTANT_MODIFIER = "!";
var createParseClassName = (config) => {
  const {
    separator,
    experimentalParseClassName
  } = config;
  const isSeparatorSingleCharacter = separator.length === 1;
  const firstSeparatorCharacter = separator[0];
  const separatorLength = separator.length;
  const parseClassName = (className) => {
    const modifiers = [];
    let bracketDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === "/") {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === "[") {
        bracketDepth++;
      } else if (currentCharacter === "]") {
        bracketDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    const baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (experimentalParseClassName) {
    return (className) => experimentalParseClassName({
      className,
      parseClassName
    });
  }
  return parseClassName;
};
var sortModifiers = (modifiers) => {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  const sortedModifiers = [];
  let unsortedModifiers = [];
  modifiers.forEach((modifier) => {
    const isArbitraryVariant = modifier[0] === "[";
    if (isArbitraryVariant) {
      sortedModifiers.push(...unsortedModifiers.sort(), modifier);
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push(...unsortedModifiers.sort());
  return sortedModifiers;
};
var createConfigUtils = (config) => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  ...createClassGroupUtils(config)
});
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds
  } = configUtils;
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = "";
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    let hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        result = originalClassName + (result.length > 0 ? " " + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(":");
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i2 = 0; i2 < conflictGroups.length; ++i2) {
      const group = conflictGroups[i2];
      classGroupsInConflict.push(modifierId + group);
    }
    result = originalClassName + (result.length > 0 ? " " + result : result);
  }
  return result;
};
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = "";
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
}
var toValue = (mix) => {
  if (typeof mix === "string") {
    return mix;
  }
  let resolvedValue;
  let string = "";
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += " ");
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
var fromTheme = (key) => {
  const themeGetter = (theme) => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
var arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
var fractionRegex = /^\d+\/\d+$/;
var stringLengths = /* @__PURE__ */ new Set(["px", "full", "screen"]);
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isLength = (value) => isNumber(value) || stringLengths.has(value) || fractionRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, "length", isLengthOnly);
var isNumber = (value) => Boolean(value) && !Number.isNaN(Number(value));
var isArbitraryNumber = (value) => getIsArbitraryValue(value, "number", isNumber);
var isInteger = (value) => Boolean(value) && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var sizeLabels = /* @__PURE__ */ new Set(["length", "size", "percentage"]);
var isArbitrarySize = (value) => getIsArbitraryValue(value, sizeLabels, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, "position", isNever);
var imageLabels = /* @__PURE__ */ new Set(["image", "url"]);
var isArbitraryImage = (value) => getIsArbitraryValue(value, imageLabels, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, "", isShadow);
var isAny = () => true;
var getIsArbitraryValue = (value, label, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return typeof label === "string" ? result[1] === label : label.has(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
var isLengthOnly = (value) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  lengthUnitRegex.test(value) && !colorFunctionRegex.test(value)
);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var getDefaultConfig = () => {
  const colors = fromTheme("colors");
  const spacing = fromTheme("spacing");
  const blur = fromTheme("blur");
  const brightness = fromTheme("brightness");
  const borderColor = fromTheme("borderColor");
  const borderRadius = fromTheme("borderRadius");
  const borderSpacing = fromTheme("borderSpacing");
  const borderWidth = fromTheme("borderWidth");
  const contrast = fromTheme("contrast");
  const grayscale = fromTheme("grayscale");
  const hueRotate = fromTheme("hueRotate");
  const invert = fromTheme("invert");
  const gap = fromTheme("gap");
  const gradientColorStops = fromTheme("gradientColorStops");
  const gradientColorStopPositions = fromTheme("gradientColorStopPositions");
  const inset = fromTheme("inset");
  const margin = fromTheme("margin");
  const opacity = fromTheme("opacity");
  const padding = fromTheme("padding");
  const saturate = fromTheme("saturate");
  const scale = fromTheme("scale");
  const sepia = fromTheme("sepia");
  const skew = fromTheme("skew");
  const space = fromTheme("space");
  const translate = fromTheme("translate");
  const getOverscroll = () => ["auto", "contain", "none"];
  const getOverflow = () => ["auto", "hidden", "clip", "visible", "scroll"];
  const getSpacingWithAutoAndArbitrary = () => ["auto", isArbitraryValue, spacing];
  const getSpacingWithArbitrary = () => [isArbitraryValue, spacing];
  const getLengthWithEmptyAndArbitrary = () => ["", isLength, isArbitraryLength];
  const getNumberWithAutoAndArbitrary = () => ["auto", isNumber, isArbitraryValue];
  const getPositions = () => ["bottom", "center", "left", "left-bottom", "left-top", "right", "right-bottom", "right-top", "top"];
  const getLineStyles = () => ["solid", "dashed", "dotted", "double", "none"];
  const getBlendModes = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
  const getAlign = () => ["start", "end", "center", "between", "around", "evenly", "stretch"];
  const getZeroAndEmpty = () => ["", "0", isArbitraryValue];
  const getBreaks = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"];
  const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];
  return {
    cacheSize: 500,
    separator: ":",
    theme: {
      colors: [isAny],
      spacing: [isLength, isArbitraryLength],
      blur: ["none", "", isTshirtSize, isArbitraryValue],
      brightness: getNumberAndArbitrary(),
      borderColor: [colors],
      borderRadius: ["none", "", "full", isTshirtSize, isArbitraryValue],
      borderSpacing: getSpacingWithArbitrary(),
      borderWidth: getLengthWithEmptyAndArbitrary(),
      contrast: getNumberAndArbitrary(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: getSpacingWithArbitrary(),
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAutoAndArbitrary(),
      margin: getSpacingWithAutoAndArbitrary(),
      opacity: getNumberAndArbitrary(),
      padding: getSpacingWithArbitrary(),
      saturate: getNumberAndArbitrary(),
      scale: getNumberAndArbitrary(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: getSpacingWithArbitrary(),
      translate: getSpacingWithArbitrary()
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", "video", isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: [...getPositions(), isArbitraryValue]
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ["auto", isInteger, isArbitraryValue]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: getSpacingWithAutoAndArbitrary()
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["wrap", "wrap-reverse", "nowrap"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ["1", "auto", "initial", "none", isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ["first", "last", "none", isInteger, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: ["auto", {
          span: ["full", isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: ["auto", {
          span: [isInteger, isArbitraryValue]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": ["auto", "min", "max", "fr", isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": ["auto", "min", "max", "fr", isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: ["normal", ...getAlign()]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": ["start", "end", "center", "stretch"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", "start", "end", "center", "stretch"]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...getAlign(), "baseline"]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", "start", "end", "center", "stretch", "baseline"]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": [...getAlign(), "baseline"]
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": ["start", "end", "center", "baseline", "stretch"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", "start", "end", "center", "stretch"]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      "space-x": [{
        "space-x": [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      "space-y": [{
        "space-y": [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      "space-y-reverse": ["space-y-reverse"],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ["auto", "min", "max", "fit", "svw", "lvw", "dvw", isArbitraryValue, spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [isArbitraryValue, spacing, "min", "max", "fit"]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [isArbitraryValue, spacing, "none", "full", "min", "max", "fit", "prose", {
          screen: [isTshirtSize]
        }, isTshirtSize]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [isArbitraryValue, spacing, "auto", "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": [isArbitraryValue, spacing, "min", "max", "fit", "svh", "lvh", "dvh"]
      }],
      /**
       * Size
       * @see https://tailwindcss.com/docs/size
       */
      size: [{
        size: [isArbitraryValue, spacing, "auto", "min", "max", "fit"]
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black", isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ["tighter", "tight", "normal", "wide", "wider", "widest", isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": ["none", isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ["none", "tight", "snug", "normal", "relaxed", "loose", isLength, isArbitraryValue]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["none", "disc", "decimal", isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      "placeholder-opacity": [{
        "placeholder-opacity": [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      "text-opacity": [{
        "text-opacity": [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [...getLineStyles(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: ["auto", "from-font", isLength, isArbitraryLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": ["auto", isLength, isArbitraryValue]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: getSpacingWithArbitrary()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      "bg-opacity": [{
        "bg-opacity": [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: [...getPositions(), isArbitraryPosition]
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: ["no-repeat", {
          repeat: ["", "x", "y", "round", "space"]
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: ["auto", "cover", "contain", isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
        }, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      "border-opacity": [{
        "border-opacity": [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [...getLineStyles(), "hidden"]
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x": [{
        "divide-x": [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y": [{
        "divide-y": [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      "divide-opacity": [{
        "divide-opacity": [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      "divide-style": [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": [borderColor]
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": [borderColor]
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: ["", ...getLineStyles()]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [isLength, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: [isLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w": [{
        ring: getLengthWithEmptyAndArbitrary()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      "ring-color": [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      "ring-opacity": [{
        "ring-opacity": [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      "ring-offset-w": [{
        "ring-offset": [isLength, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      "ring-offset-color": [{
        "ring-offset": [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ["", "inner", "none", isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      "shadow-color": [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...getBlendModes(), "plus-lighter", "plus-darker"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ["", "none"]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": ["", "none", isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": ["", "none"]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["none", "all", "", "colors", "opacity", "shadow", "transform", isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "in", "out", "in-out", isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", "spin", "ping", "pulse", "bounce", isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ["", "gpu", "none"]
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: ["center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left", isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ["auto", colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["none", "auto"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "y", "x", ""]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": getSpacingWithArbitrary()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, "none"]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [isLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, "none"]
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    }
  };
};
var twMerge = /* @__PURE__ */ createTailwindMerge(getDefaultConfig);

// apps/web/src/lib/utils.js
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// apps/web/src/components/ui/card.jsx
var Card = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";

// node_modules/@radix-ui/react-compose-refs/dist/index.mjs
var __defProp2 = Object.defineProperty;
var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
function setRef(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
__name(setRef, "setRef");
function composeRefs(...refs) {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup == "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i2 = 0; i2 < cleanups.length; i2++) {
          const cleanup = cleanups[i2];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i2], null);
          }
        }
      };
    }
  };
}
__name(composeRefs, "composeRefs");
function useComposedRefs(...refs) {
  return useCallback(composeRefs(...refs), refs);
}
__name(useComposedRefs, "useComposedRefs");

// node_modules/@radix-ui/react-slot/dist/index.mjs
var __defProp3 = Object.defineProperty;
var __name2 = (target, value) => __defProp3(target, "name", { value, configurable: true });
// @__NO_SIDE_EFFECTS__
function createSlot(ownerName) {
  const Slot2 = forwardRef((props, forwardedRef) => {
    let { children, ...slotProps } = props;
    let slottableElement = null;
    let hasSlottable = false;
    const newChildren = [];
    if (isLazyComponent(children) && typeof use === "function") {
      children = use(children._payload);
    }
    Children.forEach(children, (maybeSlottable) => {
      if (isSlottable(maybeSlottable)) {
        hasSlottable = true;
        const slottable = maybeSlottable;
        let child = "child" in slottable.props ? slottable.props.child : slottable.props.children;
        if (isLazyComponent(child) && typeof use === "function") {
          child = use(child._payload);
        }
        slottableElement = getSlottableElementFromSlottable(slottable, child);
        newChildren.push(slottableElement?.props?.children);
      } else {
        newChildren.push(maybeSlottable);
      }
    });
    if (slottableElement) {
      slottableElement = cloneElement(slottableElement, void 0, newChildren);
    } else if (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !hasSlottable && Children.count(children) === 1 && isValidElement(children)
    ) {
      slottableElement = children;
    }
    const slottableElementRef = slottableElement ? getElementRef(slottableElement) : void 0;
    const composedRef = useComposedRefs(forwardedRef, slottableElementRef);
    if (!slottableElement) {
      if (children || children === 0) {
        throw new Error(
          hasSlottable ? createSlottableError(ownerName) : createSlotError(ownerName)
        );
      }
      return children;
    }
    const mergedProps = mergeProps(slotProps, slottableElement.props ?? {});
    if (slottableElement.type !== Fragment) {
      mergedProps.ref = forwardedRef ? composedRef : slottableElementRef;
    }
    return cloneElement(slottableElement, mergedProps);
  });
  Slot2.displayName = `${ownerName}.Slot`;
  return Slot2;
}
__name2(createSlot, "createSlot");
var Slot = /* @__PURE__ */ createSlot("Slot");
var SLOTTABLE_IDENTIFIER = /* @__PURE__ */ Symbol.for("radix.slottable");
// @__NO_SIDE_EFFECTS__
function createSlottable(ownerName) {
  const Slottable2 = /* @__PURE__ */ __name2((props) => "child" in props ? props.children(props.child) : props.children, "Slottable");
  Slottable2.displayName = `${ownerName}.Slottable`;
  Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
  return Slottable2;
}
__name2(createSlottable, "createSlottable");
var getSlottableElementFromSlottable = /* @__PURE__ */ __name2((slottable, child) => {
  if ("child" in slottable.props) {
    const child2 = slottable.props.child;
    if (!isValidElement(child2)) return null;
    return cloneElement(child2, void 0, slottable.props.children(child2.props.children));
  }
  return isValidElement(child) ? child : null;
}, "getSlottableElementFromSlottable");
function mergeProps(slotProps, childProps) {
  const overrideProps = { ...childProps };
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (slotPropValue && childPropValue) {
        overrideProps[propName] = (...args) => {
          const result = childPropValue(...args);
          slotPropValue(...args);
          return result;
        };
      } else if (slotPropValue) {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName === "style") {
      overrideProps[propName] = { ...slotPropValue, ...childPropValue };
    } else if (propName === "className") {
      overrideProps[propName] = [slotPropValue, childPropValue].filter(Boolean).join(" ");
    }
  }
  return { ...slotProps, ...overrideProps };
}
__name2(mergeProps, "mergeProps");
function getElementRef(element) {
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.ref;
  }
  getter = Object.getOwnPropertyDescriptor(element, "ref")?.get;
  mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;
  if (mayWarn) {
    return element.props.ref;
  }
  return element.props.ref || element.ref;
}
__name2(getElementRef, "getElementRef");
function isSlottable(child) {
  return isValidElement(child) && typeof child.type === "function" && "__radixId" in child.type && child.type.__radixId === SLOTTABLE_IDENTIFIER;
}
__name2(isSlottable, "isSlottable");
var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
function isLazyComponent(element) {
  return element != null && typeof element === "object" && "$$typeof" in element && element.$$typeof === REACT_LAZY_TYPE && "_payload" in element && isPromiseLike(element._payload);
}
__name2(isLazyComponent, "isLazyComponent");
function isPromiseLike(value) {
  return typeof value === "object" && value !== null && "then" in value;
}
__name2(isPromiseLike, "isPromiseLike");
var createSlotError = /* @__PURE__ */ __name2((ownerName) => {
  return `${ownerName} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`;
}, "createSlotError");
var createSlottableError = /* @__PURE__ */ __name2((ownerName) => {
  return `${ownerName} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`;
}, "createSlottableError");
var use = react_shim_exports[" use ".trim().toString()];

// node_modules/class-variance-authority/dist/index.mjs
var falsyToString = (value) => typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
var cx = clsx;
var cva = (base, config) => (props) => {
  var _config_compoundVariants;
  if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
  const { variants, defaultVariants } = config;
  const getVariantClassNames = Object.keys(variants).map((variant) => {
    const variantProp = props === null || props === void 0 ? void 0 : props[variant];
    const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
    if (variantProp === null) return null;
    const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
    return variants[variant][variantKey];
  });
  const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param) => {
    let [key, value] = param;
    if (value === void 0) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});
  const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param) => {
    let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
    return Object.entries(compoundVariantOptions).every((param2) => {
      let [key, value] = param2;
      return Array.isArray(value) ? value.includes({
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key]) : {
        ...defaultVariants,
        ...propsWithoutUndefined
      }[key] === value;
    }) ? [
      ...acc,
      cvClass,
      cvClassName
    ] : acc;
  }, []);
  return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
};

// apps/web/src/components/ui/button.jsx
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
var Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ createElement(
    Comp,
    {
      className: cn(buttonVariants({ variant, size, className })),
      ref,
      ...props
    }
  );
});
Button.displayName = "Button";

// apps/web/src/components/ui/badge.jsx
var badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ createElement("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

// apps/web/src/components/ui/input.jsx
var Input = forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ createElement(
    "input",
    {
      type,
      className: cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";

// apps/web/src/lib/dialog-shim.jsx
function cn2(...args) {
  return args.filter(Boolean).join(" ");
}
function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-150" }, /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      className: "fixed inset-0 bg-transparent",
      onClick: () => onOpenChange && onOpenChange(false)
    }
  ), /* @__PURE__ */ react_shim_default.createElement("div", { className: "relative z-50 w-full max-w-xl mx-auto" }, children));
}
function DialogContent({ className, children, ...props }) {
  return /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      className: cn2(
        "relative z-50 w-full bg-slate-950 border border-slate-800 p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto text-white",
        className
      ),
      ...props
    },
    children
  );
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: cn2("flex flex-col space-y-1.5 text-left mb-4", className), ...props });
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: cn2("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 mt-4 pt-2 border-t border-slate-800/80", className), ...props });
}
function DialogTitle({ className, ...props }) {
  return /* @__PURE__ */ react_shim_default.createElement("h3", { className: cn2("text-lg font-black tracking-tight text-white flex items-center gap-2", className), ...props });
}

// apps/web/src/lib/toast-shim.js
function showFloatingNotification(message, type = "success") {
  try {
    const el = document.createElement("div");
    el.className = `fixed bottom-5 right-5 z-[9999] px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold transition-all transform duration-300 ${type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 300);
    }, 3e3);
  } catch (e2) {
  }
}
var toast = {
  success: (msg) => {
    try {
      if (window.toast?.success) return window.toast.success(msg);
    } catch (e2) {
    }
    showFloatingNotification(msg, "success");
  },
  error: (msg) => {
    try {
      if (window.toast?.error) return window.toast.error(msg);
    } catch (e2) {
    }
    showFloatingNotification(msg, "error");
  },
  info: (msg) => {
    try {
      if (window.toast?.info) return window.toast.info(msg);
    } catch (e2) {
    }
    showFloatingNotification(msg, "info");
  }
};

// apps/web/node_modules/pocketbase/dist/pocketbase.es.mjs
var ClientResponseError = class _ClientResponseError extends Error {
  constructor(e2) {
    super("ClientResponseError"), this.url = "", this.status = 0, this.response = {}, this.isAbort = false, this.originalError = null, Object.setPrototypeOf(this, _ClientResponseError.prototype), null !== e2 && "object" == typeof e2 && (this.url = "string" == typeof e2.url ? e2.url : "", this.status = "number" == typeof e2.status ? e2.status : 0, this.isAbort = !!e2.isAbort, this.originalError = e2.originalError, null !== e2.response && "object" == typeof e2.response ? this.response = e2.response : null !== e2.data && "object" == typeof e2.data ? this.response = e2.data : this.response = {}), this.originalError || e2 instanceof _ClientResponseError || (this.originalError = e2), "undefined" != typeof DOMException && e2 instanceof DOMException && (this.isAbort = true), this.name = "ClientResponseError " + this.status, this.message = this.response?.message, this.message || (this.isAbort ? this.message = "The request was autocancelled. You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation." : this.originalError?.cause?.message?.includes("ECONNREFUSED ::1") ? this.message = "Failed to connect to the PocketBase server. Try changing the SDK URL from localhost to 127.0.0.1 (https://github.com/pocketbase/js-sdk/issues/21)." : this.message = "Something went wrong while processing your request.");
  }
  get data() {
    return this.response;
  }
  toJSON() {
    return { ...this };
  }
};
var e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function cookieParse(e2, t2) {
  const s2 = {};
  if ("string" != typeof e2) return s2;
  const i2 = Object.assign({}, t2 || {}).decode || defaultDecode;
  let n2 = 0;
  for (; n2 < e2.length; ) {
    const t3 = e2.indexOf("=", n2);
    if (-1 === t3) break;
    let r3 = e2.indexOf(";", n2);
    if (-1 === r3) r3 = e2.length;
    else if (r3 < t3) {
      n2 = e2.lastIndexOf(";", t3 - 1) + 1;
      continue;
    }
    const o = e2.slice(n2, t3).trim();
    if (void 0 === s2[o]) {
      let n3 = e2.slice(t3 + 1, r3).trim();
      34 === n3.charCodeAt(0) && (n3 = n3.slice(1, -1));
      try {
        s2[o] = i2(n3);
      } catch (e3) {
        s2[o] = n3;
      }
    }
    n2 = r3 + 1;
  }
  return s2;
}
function cookieSerialize(t2, s2, i2) {
  const n2 = Object.assign({}, i2 || {}), r3 = n2.encode || defaultEncode;
  if (!e.test(t2)) throw new TypeError("argument name is invalid");
  const o = r3(s2);
  if (o && !e.test(o)) throw new TypeError("argument val is invalid");
  let a = t2 + "=" + o;
  if (null != n2.maxAge) {
    const e2 = n2.maxAge - 0;
    if (isNaN(e2) || !isFinite(e2)) throw new TypeError("option maxAge is invalid");
    a += "; Max-Age=" + Math.floor(e2);
  }
  if (n2.domain) {
    if (!e.test(n2.domain)) throw new TypeError("option domain is invalid");
    a += "; Domain=" + n2.domain;
  }
  if (n2.path) {
    if (!e.test(n2.path)) throw new TypeError("option path is invalid");
    a += "; Path=" + n2.path;
  }
  if (n2.expires) {
    if (!(function isDate(e2) {
      return "[object Date]" === Object.prototype.toString.call(e2) || e2 instanceof Date;
    })(n2.expires) || isNaN(n2.expires.valueOf())) throw new TypeError("option expires is invalid");
    a += "; Expires=" + n2.expires.toUTCString();
  }
  if (n2.httpOnly && (a += "; HttpOnly"), n2.secure && (a += "; Secure"), n2.priority) {
    switch ("string" == typeof n2.priority ? n2.priority.toLowerCase() : n2.priority) {
      case "low":
        a += "; Priority=Low";
        break;
      case "medium":
        a += "; Priority=Medium";
        break;
      case "high":
        a += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  }
  if (n2.sameSite) {
    switch ("string" == typeof n2.sameSite ? n2.sameSite.toLowerCase() : n2.sameSite) {
      case true:
        a += "; SameSite=Strict";
        break;
      case "lax":
        a += "; SameSite=Lax";
        break;
      case "strict":
        a += "; SameSite=Strict";
        break;
      case "none":
        a += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return a;
}
function defaultDecode(e2) {
  return -1 !== e2.indexOf("%") ? decodeURIComponent(e2) : e2;
}
function defaultEncode(e2) {
  return encodeURIComponent(e2);
}
var t = "undefined" != typeof navigator && "ReactNative" === navigator.product || "undefined" != typeof global && global.HermesInternal;
var s;
function getTokenPayload(e2) {
  if (e2) try {
    const t2 = decodeURIComponent(s(e2.split(".")[1]).split("").map((function(e3) {
      return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
    })).join(""));
    return JSON.parse(t2) || {};
  } catch (e3) {
  }
  return {};
}
function isTokenExpired(e2, t2 = 0) {
  let s2 = getTokenPayload(e2);
  return !(Object.keys(s2).length > 0 && (!s2.exp || s2.exp - t2 > Date.now() / 1e3));
}
s = "function" != typeof atob || t ? (e2) => {
  let t2 = String(e2).replace(/=+$/, "");
  if (t2.length % 4 == 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var s2, i2, n2 = 0, r3 = 0, o = ""; i2 = t2.charAt(r3++); ~i2 && (s2 = n2 % 4 ? 64 * s2 + i2 : i2, n2++ % 4) ? o += String.fromCharCode(255 & s2 >> (-2 * n2 & 6)) : 0) i2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(i2);
  return o;
} : atob;
var i = "pb_auth";
var BaseAuthStore = class {
  constructor() {
    this.baseToken = "", this.baseModel = null, this._onChangeCallbacks = [];
  }
  get token() {
    return this.baseToken;
  }
  get record() {
    return this.baseModel;
  }
  get model() {
    return this.baseModel;
  }
  get isValid() {
    return !isTokenExpired(this.token);
  }
  get isSuperuser() {
    let e2 = getTokenPayload(this.token);
    return "auth" == e2.type && ("_superusers" == this.record?.collectionName || !this.record?.collectionName && "pbc_3142635823" == e2.collectionId);
  }
  get isAdmin() {
    return console.warn("Please replace pb.authStore.isAdmin with pb.authStore.isSuperuser OR simply check the value of pb.authStore.record?.collectionName"), this.isSuperuser;
  }
  get isAuthRecord() {
    return console.warn("Please replace pb.authStore.isAuthRecord with !pb.authStore.isSuperuser OR simply check the value of pb.authStore.record?.collectionName"), "auth" == getTokenPayload(this.token).type && !this.isSuperuser;
  }
  save(e2, t2) {
    this.baseToken = e2 || "", this.baseModel = t2 || null, this.triggerChange();
  }
  clear() {
    this.baseToken = "", this.baseModel = null, this.triggerChange();
  }
  loadFromCookie(e2, t2 = i) {
    const s2 = cookieParse(e2 || "")[t2] || "";
    let n2 = {};
    try {
      n2 = JSON.parse(s2), (null === typeof n2 || "object" != typeof n2 || Array.isArray(n2)) && (n2 = {});
    } catch (e3) {
    }
    this.save(n2.token || "", n2.record || n2.model || null);
  }
  exportToCookie(e2, t2 = i) {
    const s2 = { secure: true, sameSite: true, httpOnly: true, path: "/" }, n2 = getTokenPayload(this.token);
    s2.expires = n2?.exp ? new Date(1e3 * n2.exp) : /* @__PURE__ */ new Date("1970-01-01"), e2 = Object.assign({}, s2, e2);
    const r3 = { token: this.token, record: this.record ? JSON.parse(JSON.stringify(this.record)) : null };
    let o = cookieSerialize(t2, JSON.stringify(r3), e2);
    const a = "undefined" != typeof Blob ? new Blob([o]).size : o.length;
    if (r3.record && a > 4096) {
      r3.record = { id: r3.record?.id, email: r3.record?.email };
      const s3 = ["collectionId", "collectionName", "verified"];
      for (const e3 in this.record) s3.includes(e3) && (r3.record[e3] = this.record[e3]);
      o = cookieSerialize(t2, JSON.stringify(r3), e2);
    }
    return o;
  }
  onChange(e2, t2 = false) {
    return this._onChangeCallbacks.push(e2), t2 && e2(this.token, this.record), () => {
      for (let t3 = this._onChangeCallbacks.length - 1; t3 >= 0; t3--) if (this._onChangeCallbacks[t3] == e2) return delete this._onChangeCallbacks[t3], void this._onChangeCallbacks.splice(t3, 1);
    };
  }
  triggerChange() {
    for (const e2 of this._onChangeCallbacks) e2 && e2(this.token, this.record);
  }
};
var LocalAuthStore = class extends BaseAuthStore {
  constructor(e2 = "pocketbase_auth") {
    super(), this.storageFallback = {}, this.storageKey = e2, this._bindStorageEvent();
  }
  get token() {
    return (this._storageGet(this.storageKey) || {}).token || "";
  }
  get record() {
    const e2 = this._storageGet(this.storageKey) || {};
    return e2.record || e2.model || null;
  }
  get model() {
    return this.record;
  }
  save(e2, t2) {
    this._storageSet(this.storageKey, { token: e2, record: t2 }), super.save(e2, t2);
  }
  clear() {
    this._storageRemove(this.storageKey), super.clear();
  }
  _storageGet(e2) {
    if ("undefined" != typeof window && window?.localStorage) {
      const t2 = window.localStorage.getItem(e2) || "";
      try {
        return JSON.parse(t2);
      } catch (e3) {
        return t2;
      }
    }
    return this.storageFallback[e2];
  }
  _storageSet(e2, t2) {
    if ("undefined" != typeof window && window?.localStorage) {
      let s2 = t2;
      "string" != typeof t2 && (s2 = JSON.stringify(t2)), window.localStorage.setItem(e2, s2);
    } else this.storageFallback[e2] = t2;
  }
  _storageRemove(e2) {
    "undefined" != typeof window && window?.localStorage && window.localStorage?.removeItem(e2), delete this.storageFallback[e2];
  }
  _bindStorageEvent() {
    "undefined" != typeof window && window?.localStorage && window.addEventListener && window.addEventListener("storage", ((e2) => {
      if (e2.key != this.storageKey) return;
      const t2 = this._storageGet(this.storageKey) || {};
      super.save(t2.token || "", t2.record || t2.model || null);
    }));
  }
};
var BaseService = class {
  constructor(e2) {
    this.client = e2;
  }
};
var SettingsService = class extends BaseService {
  async getAll(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/settings", e2);
  }
  async update(e2, t2) {
    return t2 = Object.assign({ method: "PATCH", body: e2 }, t2), this.client.send("/api/settings", t2);
  }
  async testS3(e2 = "storage", t2) {
    return t2 = Object.assign({ method: "POST", body: { filesystem: e2 } }, t2), this.client.send("/api/settings/test/s3", t2).then((() => true));
  }
  async testEmail(e2, t2, s2, i2) {
    return i2 = Object.assign({ method: "POST", body: { email: t2, template: s2, collection: e2 } }, i2), this.client.send("/api/settings/test/email", i2).then((() => true));
  }
  async generateAppleClientSecret(e2, t2, s2, i2, n2, r3) {
    return r3 = Object.assign({ method: "POST", body: { clientId: e2, teamId: t2, keyId: s2, privateKey: i2, duration: n2 } }, r3), this.client.send("/api/settings/apple/generate-client-secret", r3);
  }
};
var n = ["requestKey", "$cancelKey", "$autoCancel", "fetch", "headers", "body", "query", "params", "cache", "credentials", "headers", "integrity", "keepalive", "method", "mode", "redirect", "referrer", "referrerPolicy", "signal", "window"];
function normalizeUnknownQueryParams(e2) {
  if (e2) {
    e2.query = e2.query || {};
    for (let t2 in e2) n.includes(t2) || (e2.query[t2] = e2[t2], delete e2[t2]);
  }
}
function serializeQueryParams(e2) {
  const t2 = [];
  for (const s2 in e2) {
    const i2 = encodeURIComponent(s2), n2 = Array.isArray(e2[s2]) ? e2[s2] : [e2[s2]];
    for (let e3 of n2) e3 = prepareQueryParamValue(e3), null !== e3 && t2.push(i2 + "=" + e3);
  }
  return t2.join("&");
}
function prepareQueryParamValue(e2) {
  return null == e2 ? null : e2 instanceof Date ? encodeURIComponent(e2.toISOString().replace("T", " ")) : "object" == typeof e2 ? encodeURIComponent(JSON.stringify(e2)) : encodeURIComponent(e2);
}
var RealtimeService = class extends BaseService {
  constructor() {
    super(...arguments), this.clientId = "", this.eventSource = null, this.subscriptions = {}, this.lastSentSubscriptions = [], this.maxConnectTimeout = 15e3, this.reconnectAttempts = 0, this.maxReconnectAttempts = 1 / 0, this.predefinedReconnectIntervals = [200, 300, 500, 1e3, 1200, 1500, 2e3], this.pendingConnects = [];
  }
  get isConnected() {
    return !!this.eventSource && !!this.clientId && !this.pendingConnects.length;
  }
  async subscribe(e2, t2, s2) {
    if (!e2) throw new Error("topic must be set.");
    let i2 = e2;
    if (s2) {
      normalizeUnknownQueryParams(s2 = Object.assign({}, s2));
      const e3 = "options=" + encodeURIComponent(JSON.stringify({ query: s2.query, headers: s2.headers }));
      i2 += (i2.includes("?") ? "&" : "?") + e3;
    }
    const listener = function(e3) {
      const s3 = e3;
      let i3;
      try {
        i3 = JSON.parse(s3?.data);
      } catch {
      }
      t2(i3 || {});
    };
    return this.subscriptions[i2] || (this.subscriptions[i2] = []), this.subscriptions[i2].push(listener), this.isConnected ? 1 === this.subscriptions[i2].length ? await this.submitSubscriptions() : this.eventSource?.addEventListener(i2, listener) : await this.connect(), async () => this.unsubscribeByTopicAndListener(e2, listener);
  }
  async unsubscribe(e2) {
    let t2 = false;
    if (e2) {
      const s2 = this.getSubscriptionsByTopic(e2);
      for (let e3 in s2) if (this.hasSubscriptionListeners(e3)) {
        for (let t3 of this.subscriptions[e3]) this.eventSource?.removeEventListener(e3, t3);
        delete this.subscriptions[e3], t2 || (t2 = true);
      }
    } else this.subscriptions = {};
    this.hasSubscriptionListeners() ? t2 && await this.submitSubscriptions() : this.disconnect();
  }
  async unsubscribeByPrefix(e2) {
    let t2 = false;
    for (let s2 in this.subscriptions) if ((s2 + "?").startsWith(e2)) {
      t2 = true;
      for (let e3 of this.subscriptions[s2]) this.eventSource?.removeEventListener(s2, e3);
      delete this.subscriptions[s2];
    }
    t2 && (this.hasSubscriptionListeners() ? await this.submitSubscriptions() : this.disconnect());
  }
  async unsubscribeByTopicAndListener(e2, t2) {
    let s2 = false;
    const i2 = this.getSubscriptionsByTopic(e2);
    for (let e3 in i2) {
      if (!Array.isArray(this.subscriptions[e3]) || !this.subscriptions[e3].length) continue;
      let i3 = false;
      for (let s3 = this.subscriptions[e3].length - 1; s3 >= 0; s3--) this.subscriptions[e3][s3] === t2 && (i3 = true, delete this.subscriptions[e3][s3], this.subscriptions[e3].splice(s3, 1), this.eventSource?.removeEventListener(e3, t2));
      i3 && (this.subscriptions[e3].length || delete this.subscriptions[e3], s2 || this.hasSubscriptionListeners(e3) || (s2 = true));
    }
    this.hasSubscriptionListeners() ? s2 && await this.submitSubscriptions() : this.disconnect();
  }
  hasSubscriptionListeners(e2) {
    if (this.subscriptions = this.subscriptions || {}, e2) return !!this.subscriptions[e2]?.length;
    for (let e3 in this.subscriptions) if (this.subscriptions[e3]?.length) return true;
    return false;
  }
  async submitSubscriptions() {
    if (this.clientId) return this.addAllSubscriptionListeners(), this.lastSentSubscriptions = this.getNonEmptySubscriptionKeys(), this.client.send("/api/realtime", { method: "POST", body: { clientId: this.clientId, subscriptions: this.lastSentSubscriptions }, requestKey: this.getSubscriptionsCancelKey() }).catch(((e2) => {
      if (!e2?.isAbort) throw e2;
    }));
  }
  getSubscriptionsCancelKey() {
    return "realtime_" + this.clientId;
  }
  getSubscriptionsByTopic(e2) {
    const t2 = {};
    e2 = e2.includes("?") ? e2 : e2 + "?";
    for (let s2 in this.subscriptions) (s2 + "?").startsWith(e2) && (t2[s2] = this.subscriptions[s2]);
    return t2;
  }
  getNonEmptySubscriptionKeys() {
    const e2 = [];
    for (let t2 in this.subscriptions) this.subscriptions[t2].length && e2.push(t2);
    return e2;
  }
  addAllSubscriptionListeners() {
    if (this.eventSource) {
      this.removeAllSubscriptionListeners();
      for (let e2 in this.subscriptions) for (let t2 of this.subscriptions[e2]) this.eventSource.addEventListener(e2, t2);
    }
  }
  removeAllSubscriptionListeners() {
    if (this.eventSource) for (let e2 in this.subscriptions) for (let t2 of this.subscriptions[e2]) this.eventSource.removeEventListener(e2, t2);
  }
  async connect() {
    if (!(this.reconnectAttempts > 0)) return new Promise(((e2, t2) => {
      this.pendingConnects.push({ resolve: e2, reject: t2 }), this.pendingConnects.length > 1 || this.initConnect();
    }));
  }
  initConnect() {
    this.disconnect(true), clearTimeout(this.connectTimeoutId), this.connectTimeoutId = setTimeout((() => {
      this.connectErrorHandler(new Error("EventSource connect took too long."));
    }), this.maxConnectTimeout), this.eventSource = new EventSource(this.client.buildURL("/api/realtime")), this.eventSource.onerror = (e2) => {
      this.connectErrorHandler(new Error("Failed to establish realtime connection."));
    }, this.eventSource.addEventListener("PB_CONNECT", ((e2) => {
      const t2 = e2;
      this.clientId = t2?.lastEventId, this.submitSubscriptions().then((async () => {
        let e3 = 3;
        for (; this.hasUnsentSubscriptions() && e3 > 0; ) e3--, await this.submitSubscriptions();
      })).then((() => {
        for (let e3 of this.pendingConnects) e3.resolve();
        this.pendingConnects = [], this.reconnectAttempts = 0, clearTimeout(this.reconnectTimeoutId), clearTimeout(this.connectTimeoutId);
        const t3 = this.getSubscriptionsByTopic("PB_CONNECT");
        for (let s2 in t3) for (let i2 of t3[s2]) i2(e2);
      })).catch(((e3) => {
        this.clientId = "", this.connectErrorHandler(e3);
      }));
    }));
  }
  hasUnsentSubscriptions() {
    const e2 = this.getNonEmptySubscriptionKeys();
    if (e2.length != this.lastSentSubscriptions.length) return true;
    for (const t2 of e2) if (!this.lastSentSubscriptions.includes(t2)) return true;
    return false;
  }
  connectErrorHandler(e2) {
    if (clearTimeout(this.connectTimeoutId), clearTimeout(this.reconnectTimeoutId), !this.clientId && !this.reconnectAttempts || this.reconnectAttempts > this.maxReconnectAttempts) {
      for (let t3 of this.pendingConnects) t3.reject(new ClientResponseError(e2));
      return this.pendingConnects = [], void this.disconnect();
    }
    this.disconnect(true);
    const t2 = this.predefinedReconnectIntervals[this.reconnectAttempts] || this.predefinedReconnectIntervals[this.predefinedReconnectIntervals.length - 1];
    this.reconnectAttempts++, this.reconnectTimeoutId = setTimeout((() => {
      this.initConnect();
    }), t2);
  }
  disconnect(e2 = false) {
    if (this.clientId && this.onDisconnect && this.onDisconnect(Object.keys(this.subscriptions)), clearTimeout(this.connectTimeoutId), clearTimeout(this.reconnectTimeoutId), this.removeAllSubscriptionListeners(), this.client.cancelRequest(this.getSubscriptionsCancelKey()), this.eventSource?.close(), this.eventSource = null, this.clientId = "", !e2) {
      this.reconnectAttempts = 0;
      for (let e3 of this.pendingConnects) e3.resolve();
      this.pendingConnects = [];
    }
  }
};
var CrudService = class extends BaseService {
  decode(e2) {
    return e2;
  }
  async getFullList(e2, t2) {
    if ("number" == typeof e2) return this._getFullList(e2, t2);
    let s2 = 500;
    return (t2 = Object.assign({}, e2, t2)).batch && (s2 = t2.batch, delete t2.batch), this._getFullList(s2, t2);
  }
  async getList(e2 = 1, t2 = 30, s2) {
    return (s2 = Object.assign({ method: "GET" }, s2)).query = Object.assign({ page: e2, perPage: t2 }, s2.query), this.client.send(this.baseCrudPath, s2).then(((e3) => (e3.items = e3.items?.map(((e4) => this.decode(e4))) || [], e3)));
  }
  async getFirstListItem(e2, t2) {
    return (t2 = Object.assign({ requestKey: "one_by_filter_" + this.baseCrudPath + "_" + e2 }, t2)).query = Object.assign({ filter: e2, skipTotal: 1 }, t2.query), this.getList(1, 1, t2).then(((e3) => {
      if (!e3?.items?.length) throw new ClientResponseError({ status: 404, response: { code: 404, message: "The requested resource wasn't found.", data: {} } });
      return e3.items[0];
    }));
  }
  async getOne(e2, t2) {
    if (!e2) throw new ClientResponseError({ url: this.client.buildURL(this.baseCrudPath + "/"), status: 404, response: { code: 404, message: "Missing required record id.", data: {} } });
    return t2 = Object.assign({ method: "GET" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), t2).then(((e3) => this.decode(e3)));
  }
  async create(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: e2 }, t2), this.client.send(this.baseCrudPath, t2).then(((e3) => this.decode(e3)));
  }
  async update(e2, t2, s2) {
    return s2 = Object.assign({ method: "PATCH", body: t2 }, s2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), s2).then(((e3) => this.decode(e3)));
  }
  async delete(e2, t2) {
    return t2 = Object.assign({ method: "DELETE" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), t2).then((() => true));
  }
  _getFullList(e2 = 500, t2) {
    (t2 = t2 || {}).query = Object.assign({ skipTotal: 1 }, t2.query);
    let s2 = [], request = async (i2) => this.getList(i2, e2 || 500, t2).then(((e3) => {
      const t3 = e3.items;
      return s2 = s2.concat(t3), t3.length == e3.perPage ? request(i2 + 1) : s2;
    }));
    return request(1);
  }
};
function normalizeLegacyOptionsArgs(e2, t2, s2, i2) {
  const n2 = void 0 !== i2;
  return n2 || void 0 !== s2 ? n2 ? (console.warn(e2), t2.body = Object.assign({}, t2.body, s2), t2.query = Object.assign({}, t2.query, i2), t2) : Object.assign(t2, s2) : t2;
}
function resetAutoRefresh(e2) {
  e2._resetAutoRefresh?.();
}
var RecordService = class extends CrudService {
  constructor(e2, t2) {
    super(e2), this.collectionIdOrName = t2;
  }
  get baseCrudPath() {
    return this.baseCollectionPath + "/records";
  }
  get baseCollectionPath() {
    return "/api/collections/" + encodeURIComponent(this.collectionIdOrName);
  }
  get isSuperusers() {
    return "_superusers" == this.collectionIdOrName || "_pbc_2773867675" == this.collectionIdOrName;
  }
  async subscribe(e2, t2, s2) {
    if (!e2) throw new Error("Missing topic.");
    if (!t2) throw new Error("Missing subscription callback.");
    return this.client.realtime.subscribe(this.collectionIdOrName + "/" + e2, t2, s2);
  }
  async unsubscribe(e2) {
    return e2 ? this.client.realtime.unsubscribe(this.collectionIdOrName + "/" + e2) : this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName);
  }
  async getFullList(e2, t2) {
    if ("number" == typeof e2) return super.getFullList(e2, t2);
    const s2 = Object.assign({}, e2, t2);
    return super.getFullList(s2);
  }
  async getList(e2 = 1, t2 = 30, s2) {
    return super.getList(e2, t2, s2);
  }
  async getFirstListItem(e2, t2) {
    return super.getFirstListItem(e2, t2);
  }
  async getOne(e2, t2) {
    return super.getOne(e2, t2);
  }
  async create(e2, t2) {
    return super.create(e2, t2);
  }
  async update(e2, t2, s2) {
    return super.update(e2, t2, s2).then(((e3) => {
      if (this.client.authStore.record?.id === e3?.id && (this.client.authStore.record?.collectionId === this.collectionIdOrName || this.client.authStore.record?.collectionName === this.collectionIdOrName)) {
        let t3 = Object.assign({}, this.client.authStore.record.expand), s3 = Object.assign({}, this.client.authStore.record, e3);
        t3 && (s3.expand = Object.assign(t3, e3.expand)), this.client.authStore.save(this.client.authStore.token, s3);
      }
      return e3;
    }));
  }
  async delete(e2, t2) {
    return super.delete(e2, t2).then(((t3) => (!t3 || this.client.authStore.record?.id !== e2 || this.client.authStore.record?.collectionId !== this.collectionIdOrName && this.client.authStore.record?.collectionName !== this.collectionIdOrName || this.client.authStore.clear(), t3)));
  }
  authResponse(e2) {
    const t2 = this.decode(e2?.record || {});
    return this.client.authStore.save(e2?.token, t2), Object.assign({}, e2, { token: e2?.token || "", record: t2 });
  }
  async listAuthMethods(e2) {
    return e2 = Object.assign({ method: "GET", fields: "mfa,otp,password,oauth2" }, e2), this.client.send(this.baseCollectionPath + "/auth-methods", e2);
  }
  async authWithPassword(e2, t2, s2) {
    let i2;
    s2 = Object.assign({ method: "POST", body: { identity: e2, password: t2 } }, s2), this.isSuperusers && (i2 = s2.autoRefreshThreshold, delete s2.autoRefreshThreshold, s2.autoRefresh || resetAutoRefresh(this.client));
    let n2 = await this.client.send(this.baseCollectionPath + "/auth-with-password", s2);
    return n2 = this.authResponse(n2), i2 && this.isSuperusers && (function registerAutoRefresh(e3, t3, s3, i3) {
      resetAutoRefresh(e3);
      const n3 = e3.beforeSend, r3 = e3.authStore.record, o = e3.authStore.onChange(((t4, s4) => {
        (!t4 || s4?.id != r3?.id || (s4?.collectionId || r3?.collectionId) && s4?.collectionId != r3?.collectionId) && resetAutoRefresh(e3);
      }));
      e3._resetAutoRefresh = function() {
        o(), e3.beforeSend = n3, delete e3._resetAutoRefresh;
      }, e3.beforeSend = async (r4, o2) => {
        const a = e3.authStore.token;
        if (o2.query?.autoRefresh) return n3 ? n3(r4, o2) : { url: r4, sendOptions: o2 };
        let c = e3.authStore.isValid;
        if (c && isTokenExpired(e3.authStore.token, t3)) try {
          await s3();
        } catch (e4) {
          c = false;
        }
        c || await i3();
        const l = o2.headers || {};
        for (let t4 in l) if ("authorization" == t4.toLowerCase() && a == l[t4] && e3.authStore.token) {
          l[t4] = e3.authStore.token;
          break;
        }
        return o2.headers = l, n3 ? n3(r4, o2) : { url: r4, sendOptions: o2 };
      };
    })(this.client, i2, (() => this.authRefresh({ autoRefresh: true })), (() => this.authWithPassword(e2, t2, Object.assign({ autoRefresh: true }, s2)))), n2;
  }
  async authWithOAuth2Code(e2, t2, s2, i2, n2, r3, o) {
    let a = { method: "POST", body: { provider: e2, code: t2, codeVerifier: s2, redirectURL: i2, createData: n2 } };
    return a = normalizeLegacyOptionsArgs("This form of authWithOAuth2Code(provider, code, codeVerifier, redirectURL, createData?, body?, query?) is deprecated. Consider replacing it with authWithOAuth2Code(provider, code, codeVerifier, redirectURL, createData?, options?).", a, r3, o), this.client.send(this.baseCollectionPath + "/auth-with-oauth2", a).then(((e3) => this.authResponse(e3)));
  }
  authWithOAuth2(...e2) {
    if (e2.length > 1 || "string" == typeof e2?.[0]) return console.warn("PocketBase: This form of authWithOAuth2() is deprecated and may get removed in the future. Please replace with authWithOAuth2Code() OR use the authWithOAuth2() realtime form as shown in https://pocketbase.io/docs/authentication/#oauth2-integration."), this.authWithOAuth2Code(e2?.[0] || "", e2?.[1] || "", e2?.[2] || "", e2?.[3] || "", e2?.[4] || {}, e2?.[5] || {}, e2?.[6] || {});
    const t2 = e2?.[0] || {};
    let s2 = null;
    t2.urlCallback || (s2 = openBrowserPopup(void 0));
    const i2 = new RealtimeService(this.client);
    function cleanup() {
      s2?.close(), i2.unsubscribe();
    }
    const n2 = {}, r3 = t2.requestKey;
    return r3 && (n2.requestKey = r3), this.listAuthMethods(n2).then(((e3) => {
      const n3 = e3.oauth2.providers.find(((e4) => e4.name === t2.provider));
      if (!n3) throw new ClientResponseError(new Error(`Missing or invalid provider "${t2.provider}".`));
      const o = this.client.buildURL("/api/oauth2-redirect"), a = r3 ? this.client.cancelControllers?.[r3] : void 0;
      return a && (a.signal.onabort = () => {
        cleanup();
      }), new Promise((async (e4, r4) => {
        try {
          await i2.subscribe("@oauth2", (async (s3) => {
            const c2 = i2.clientId;
            try {
              if (!s3.state || c2 !== s3.state) throw new Error("State parameters don't match.");
              if (s3.error || !s3.code) throw new Error("OAuth2 redirect error or missing code: " + s3.error);
              const i3 = Object.assign({}, t2);
              delete i3.provider, delete i3.scopes, delete i3.createData, delete i3.urlCallback, a?.signal?.onabort && (a.signal.onabort = null);
              const r5 = await this.authWithOAuth2Code(n3.name, s3.code, n3.codeVerifier, o, t2.createData, i3);
              e4(r5);
            } catch (e5) {
              r4(new ClientResponseError(e5));
            }
            cleanup();
          }));
          const c = { state: i2.clientId };
          t2.scopes?.length && (c.scope = t2.scopes.join(" "));
          const l = this._replaceQueryParams(n3.authURL + o, c);
          let h = t2.urlCallback || function(e5) {
            s2 ? s2.location.href = e5 : s2 = openBrowserPopup(e5);
          };
          await h(l);
        } catch (e5) {
          cleanup(), r4(new ClientResponseError(e5));
        }
      }));
    })).catch(((e3) => {
      throw cleanup(), e3;
    }));
  }
  async authRefresh(e2, t2) {
    let s2 = { method: "POST" };
    return s2 = normalizeLegacyOptionsArgs("This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).", s2, e2, t2), this.client.send(this.baseCollectionPath + "/auth-refresh", s2).then(((e3) => this.authResponse(e3)));
  }
  async requestPasswordReset(e2, t2, s2) {
    let i2 = { method: "POST", body: { email: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-password-reset", i2).then((() => true));
  }
  async confirmPasswordReset(e2, t2, s2, i2, n2) {
    let r3 = { method: "POST", body: { token: e2, password: t2, passwordConfirm: s2 } };
    return r3 = normalizeLegacyOptionsArgs("This form of confirmPasswordReset(token, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(token, password, passwordConfirm, options?).", r3, i2, n2), this.client.send(this.baseCollectionPath + "/confirm-password-reset", r3).then((() => true));
  }
  async requestVerification(e2, t2, s2) {
    let i2 = { method: "POST", body: { email: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestVerification(email, body?, query?) is deprecated. Consider replacing it with requestVerification(email, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-verification", i2).then((() => true));
  }
  async confirmVerification(e2, t2, s2) {
    let i2 = { method: "POST", body: { token: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of confirmVerification(token, body?, query?) is deprecated. Consider replacing it with confirmVerification(token, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/confirm-verification", i2).then((() => {
      const t3 = getTokenPayload(e2), s3 = this.client.authStore.record;
      return s3 && !s3.verified && s3.id === t3.id && s3.collectionId === t3.collectionId && (s3.verified = true, this.client.authStore.save(this.client.authStore.token, s3)), true;
    }));
  }
  async requestEmailChange(e2, t2, s2) {
    let i2 = { method: "POST", body: { newEmail: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestEmailChange(newEmail, body?, query?) is deprecated. Consider replacing it with requestEmailChange(newEmail, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-email-change", i2).then((() => true));
  }
  async confirmEmailChange(e2, t2, s2, i2) {
    let n2 = { method: "POST", body: { token: e2, password: t2 } };
    return n2 = normalizeLegacyOptionsArgs("This form of confirmEmailChange(token, password, body?, query?) is deprecated. Consider replacing it with confirmEmailChange(token, password, options?).", n2, s2, i2), this.client.send(this.baseCollectionPath + "/confirm-email-change", n2).then((() => {
      const t3 = getTokenPayload(e2), s3 = this.client.authStore.record;
      return s3 && s3.id === t3.id && s3.collectionId === t3.collectionId && this.client.authStore.clear(), true;
    }));
  }
  async listExternalAuths(e2, t2) {
    return this.client.collection("_externalAuths").getFullList(Object.assign({}, t2, { filter: this.client.filter("recordRef = {:id}", { id: e2 }) }));
  }
  async unlinkExternalAuth(e2, t2, s2) {
    const i2 = await this.client.collection("_externalAuths").getFirstListItem(this.client.filter("recordRef = {:recordId} && provider = {:provider}", { recordId: e2, provider: t2 }));
    return this.client.collection("_externalAuths").delete(i2.id, s2).then((() => true));
  }
  async requestOTP(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: { email: e2 } }, t2), this.client.send(this.baseCollectionPath + "/request-otp", t2);
  }
  async authWithOTP(e2, t2, s2) {
    return s2 = Object.assign({ method: "POST", body: { otpId: e2, password: t2 } }, s2), this.client.send(this.baseCollectionPath + "/auth-with-otp", s2).then(((e3) => this.authResponse(e3)));
  }
  async impersonate(e2, t2, s2) {
    (s2 = Object.assign({ method: "POST", body: { duration: t2 } }, s2)).headers = s2.headers || {}, s2.headers.Authorization || (s2.headers.Authorization = this.client.authStore.token);
    const i2 = new Client(this.client.baseURL, new BaseAuthStore(), this.client.lang), n2 = await i2.send(this.baseCollectionPath + "/impersonate/" + encodeURIComponent(e2), s2);
    return i2.authStore.save(n2?.token, this.decode(n2?.record || {})), i2;
  }
  _replaceQueryParams(e2, t2 = {}) {
    let s2 = e2, i2 = "";
    e2.indexOf("?") >= 0 && (s2 = e2.substring(0, e2.indexOf("?")), i2 = e2.substring(e2.indexOf("?") + 1));
    const n2 = {}, r3 = i2.split("&");
    for (const e3 of r3) {
      if ("" == e3) continue;
      const t3 = e3.split("=");
      n2[decodeURIComponent(t3[0].replace(/\+/g, " "))] = decodeURIComponent((t3[1] || "").replace(/\+/g, " "));
    }
    for (let e3 in t2) t2.hasOwnProperty(e3) && (null == t2[e3] ? delete n2[e3] : n2[e3] = t2[e3]);
    i2 = "";
    for (let e3 in n2) n2.hasOwnProperty(e3) && ("" != i2 && (i2 += "&"), i2 += encodeURIComponent(e3.replace(/%20/g, "+")) + "=" + encodeURIComponent(n2[e3].replace(/%20/g, "+")));
    return "" != i2 ? s2 + "?" + i2 : s2;
  }
};
function openBrowserPopup(e2) {
  if ("undefined" == typeof window || !window?.open) throw new ClientResponseError(new Error("Not in a browser context - please pass a custom urlCallback function."));
  let t2 = 1024, s2 = 768, i2 = window.innerWidth, n2 = window.innerHeight;
  t2 = t2 > i2 ? i2 : t2, s2 = s2 > n2 ? n2 : s2;
  let r3 = i2 / 2 - t2 / 2, o = n2 / 2 - s2 / 2;
  return window.open(e2, "popup_window", "width=" + t2 + ",height=" + s2 + ",top=" + o + ",left=" + r3 + ",resizable,menubar=no");
}
var CollectionService = class extends CrudService {
  get baseCrudPath() {
    return "/api/collections";
  }
  async import(e2, t2 = false, s2) {
    return s2 = Object.assign({ method: "PUT", body: { collections: e2, deleteMissing: t2 } }, s2), this.client.send(this.baseCrudPath + "/import", s2).then((() => true));
  }
  async getScaffolds(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send(this.baseCrudPath + "/meta/scaffolds", e2);
  }
  async truncate(e2, t2) {
    return t2 = Object.assign({ method: "DELETE" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2) + "/truncate", t2).then((() => true));
  }
};
var LogService = class extends BaseService {
  async getList(e2 = 1, t2 = 30, s2) {
    return (s2 = Object.assign({ method: "GET" }, s2)).query = Object.assign({ page: e2, perPage: t2 }, s2.query), this.client.send("/api/logs", s2);
  }
  async getOne(e2, t2) {
    if (!e2) throw new ClientResponseError({ url: this.client.buildURL("/api/logs/"), status: 404, response: { code: 404, message: "Missing required log id.", data: {} } });
    return t2 = Object.assign({ method: "GET" }, t2), this.client.send("/api/logs/" + encodeURIComponent(e2), t2);
  }
  async getStats(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/logs/stats", e2);
  }
};
var HealthService = class extends BaseService {
  async check(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/health", e2);
  }
};
var FileService = class extends BaseService {
  getUrl(e2, t2, s2 = {}) {
    return console.warn("Please replace pb.files.getUrl() with pb.files.getURL()"), this.getURL(e2, t2, s2);
  }
  getURL(e2, t2, s2 = {}) {
    if (!t2 || !e2?.id || !e2?.collectionId && !e2?.collectionName) return "";
    const i2 = [];
    i2.push("api"), i2.push("files"), i2.push(encodeURIComponent(e2.collectionId || e2.collectionName)), i2.push(encodeURIComponent(e2.id)), i2.push(encodeURIComponent(t2));
    let n2 = this.client.buildURL(i2.join("/"));
    if (Object.keys(s2).length) {
      false === s2.download && delete s2.download;
      const e3 = new URLSearchParams(s2);
      n2 += (n2.includes("?") ? "&" : "?") + e3;
    }
    return n2;
  }
  async getToken(e2) {
    return e2 = Object.assign({ method: "POST" }, e2), this.client.send("/api/files/token", e2).then(((e3) => e3?.token || ""));
  }
};
var BackupService = class extends BaseService {
  async getFullList(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/backups", e2);
  }
  async create(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: { name: e2 } }, t2), this.client.send("/api/backups", t2).then((() => true));
  }
  async upload(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: e2 }, t2), this.client.send("/api/backups/upload", t2).then((() => true));
  }
  async delete(e2, t2) {
    return t2 = Object.assign({ method: "DELETE" }, t2), this.client.send(`/api/backups/${encodeURIComponent(e2)}`, t2).then((() => true));
  }
  async restore(e2, t2) {
    return t2 = Object.assign({ method: "POST" }, t2), this.client.send(`/api/backups/${encodeURIComponent(e2)}/restore`, t2).then((() => true));
  }
  getDownloadUrl(e2, t2) {
    return console.warn("Please replace pb.backups.getDownloadUrl() with pb.backups.getDownloadURL()"), this.getDownloadURL(e2, t2);
  }
  getDownloadURL(e2, t2) {
    return this.client.buildURL(`/api/backups/${encodeURIComponent(t2)}?token=${encodeURIComponent(e2)}`);
  }
};
var CronService = class extends BaseService {
  async getFullList(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/crons", e2);
  }
  async run(e2, t2) {
    return t2 = Object.assign({ method: "POST" }, t2), this.client.send(`/api/crons/${encodeURIComponent(e2)}`, t2).then((() => true));
  }
};
function isFile(e2) {
  return "undefined" != typeof Blob && e2 instanceof Blob || "undefined" != typeof File && e2 instanceof File || null !== e2 && "object" == typeof e2 && e2.uri && ("undefined" != typeof navigator && "ReactNative" === navigator.product || "undefined" != typeof global && global.HermesInternal);
}
function isFormData(e2) {
  return e2 && ("FormData" === e2.constructor.name || "undefined" != typeof FormData && e2 instanceof FormData);
}
function hasFileField(e2) {
  for (const t2 in e2) {
    const s2 = Array.isArray(e2[t2]) ? e2[t2] : [e2[t2]];
    for (const e3 of s2) if (isFile(e3)) return true;
  }
  return false;
}
var r2 = /^[\-\.\d]+$/;
function inferFormDataValue(e2) {
  if ("string" != typeof e2) return e2;
  if ("true" == e2) return true;
  if ("false" == e2) return false;
  if (("-" === e2[0] || e2[0] >= "0" && e2[0] <= "9") && r2.test(e2)) {
    let t2 = +e2;
    if ("" + t2 === e2) return t2;
  }
  return e2;
}
var BatchService = class extends BaseService {
  constructor() {
    super(...arguments), this.requests = [], this.subs = {};
  }
  collection(e2) {
    return this.subs[e2] || (this.subs[e2] = new SubBatchService(this.requests, e2)), this.subs[e2];
  }
  async send(e2) {
    const t2 = new FormData(), s2 = [];
    for (let e3 = 0; e3 < this.requests.length; e3++) {
      const i2 = this.requests[e3];
      if (s2.push({ method: i2.method, url: i2.url, headers: i2.headers, body: i2.json }), i2.files) for (let s3 in i2.files) {
        const n2 = i2.files[s3] || [];
        for (let i3 of n2) t2.append("requests." + e3 + "." + s3, i3);
      }
    }
    return t2.append("@jsonPayload", JSON.stringify({ requests: s2 })), e2 = Object.assign({ method: "POST", body: t2 }, e2), this.client.send("/api/batch", e2);
  }
};
var SubBatchService = class {
  constructor(e2, t2) {
    this.requests = [], this.requests = e2, this.collectionIdOrName = t2;
  }
  upsert(e2, t2) {
    t2 = Object.assign({ body: e2 || {} }, t2);
    const s2 = { method: "PUT", url: "/api/collections/" + encodeURIComponent(this.collectionIdOrName) + "/records" };
    this.prepareRequest(s2, t2), this.requests.push(s2);
  }
  create(e2, t2) {
    t2 = Object.assign({ body: e2 || {} }, t2);
    const s2 = { method: "POST", url: "/api/collections/" + encodeURIComponent(this.collectionIdOrName) + "/records" };
    this.prepareRequest(s2, t2), this.requests.push(s2);
  }
  update(e2, t2, s2) {
    s2 = Object.assign({ body: t2 || {} }, s2);
    const i2 = { method: "PATCH", url: "/api/collections/" + encodeURIComponent(this.collectionIdOrName) + "/records/" + encodeURIComponent(e2) };
    this.prepareRequest(i2, s2), this.requests.push(i2);
  }
  delete(e2, t2) {
    t2 = Object.assign({}, t2);
    const s2 = { method: "DELETE", url: "/api/collections/" + encodeURIComponent(this.collectionIdOrName) + "/records/" + encodeURIComponent(e2) };
    this.prepareRequest(s2, t2), this.requests.push(s2);
  }
  prepareRequest(e2, t2) {
    if (normalizeUnknownQueryParams(t2), e2.headers = t2.headers, e2.json = {}, e2.files = {}, void 0 !== t2.query) {
      const s3 = serializeQueryParams(t2.query);
      s3 && (e2.url += (e2.url.includes("?") ? "&" : "?") + s3);
    }
    let s2 = t2.body;
    isFormData(s2) && (s2 = (function convertFormDataToObject(e3) {
      let t3 = {};
      return e3.forEach(((e4, s3) => {
        if ("@jsonPayload" === s3 && "string" == typeof e4) try {
          let s4 = JSON.parse(e4);
          Object.assign(t3, s4);
        } catch (e5) {
          console.warn("@jsonPayload error:", e5);
        }
        else void 0 !== t3[s3] ? (Array.isArray(t3[s3]) || (t3[s3] = [t3[s3]]), t3[s3].push(inferFormDataValue(e4))) : t3[s3] = inferFormDataValue(e4);
      })), t3;
    })(s2));
    for (const t3 in s2) {
      const i2 = s2[t3];
      if (isFile(i2)) e2.files[t3] = e2.files[t3] || [], e2.files[t3].push(i2);
      else if (Array.isArray(i2)) {
        const s3 = [], n2 = [];
        for (const e3 of i2) isFile(e3) ? s3.push(e3) : n2.push(e3);
        if (s3.length > 0 && s3.length == i2.length) {
          e2.files[t3] = e2.files[t3] || [];
          for (let i3 of s3) e2.files[t3].push(i3);
        } else if (e2.json[t3] = n2, s3.length > 0) {
          let i3 = t3;
          t3.startsWith("+") || t3.endsWith("+") || (i3 += "+"), e2.files[i3] = e2.files[i3] || [];
          for (let t4 of s3) e2.files[i3].push(t4);
        }
      } else e2.json[t3] = i2;
    }
  }
};
var Client = class {
  get baseUrl() {
    return this.baseURL;
  }
  set baseUrl(e2) {
    this.baseURL = e2;
  }
  constructor(e2 = "/", t2, s2 = "en-US") {
    this.cancelControllers = {}, this.recordServices = {}, this.enableAutoCancellation = true, this.baseURL = e2, this.lang = s2, t2 ? this.authStore = t2 : "undefined" != typeof window && window.Deno ? this.authStore = new BaseAuthStore() : this.authStore = new LocalAuthStore(), this.collections = new CollectionService(this), this.files = new FileService(this), this.logs = new LogService(this), this.settings = new SettingsService(this), this.realtime = new RealtimeService(this), this.health = new HealthService(this), this.backups = new BackupService(this), this.crons = new CronService(this);
  }
  get admins() {
    return this.collection("_superusers");
  }
  createBatch() {
    return new BatchService(this);
  }
  collection(e2) {
    return this.recordServices[e2] || (this.recordServices[e2] = new RecordService(this, e2)), this.recordServices[e2];
  }
  autoCancellation(e2) {
    return this.enableAutoCancellation = !!e2, this;
  }
  cancelRequest(e2) {
    return this.cancelControllers[e2] && (this.cancelControllers[e2].abort(), delete this.cancelControllers[e2]), this;
  }
  cancelAllRequests() {
    for (let e2 in this.cancelControllers) this.cancelControllers[e2].abort();
    return this.cancelControllers = {}, this;
  }
  filter(e2, t2) {
    if (!t2) return e2;
    for (let s2 in t2) {
      let i2 = t2[s2];
      switch (typeof i2) {
        case "boolean":
        case "number":
          i2 = "" + i2;
          break;
        case "string":
          i2 = "'" + i2.replace(/'/g, "\\'") + "'";
          break;
        default:
          i2 = null === i2 ? "null" : i2 instanceof Date ? "'" + i2.toISOString().replace("T", " ") + "'" : "'" + JSON.stringify(i2).replace(/'/g, "\\'") + "'";
      }
      e2 = e2.replaceAll("{:" + s2 + "}", i2);
    }
    return e2;
  }
  getFileUrl(e2, t2, s2 = {}) {
    return console.warn("Please replace pb.getFileUrl() with pb.files.getURL()"), this.files.getURL(e2, t2, s2);
  }
  buildUrl(e2) {
    return console.warn("Please replace pb.buildUrl() with pb.buildURL()"), this.buildURL(e2);
  }
  buildURL(e2) {
    let t2 = this.baseURL;
    return "undefined" == typeof window || !window.location || t2.startsWith("https://") || t2.startsWith("http://") || (t2 = window.location.origin?.endsWith("/") ? window.location.origin.substring(0, window.location.origin.length - 1) : window.location.origin || "", this.baseURL.startsWith("/") || (t2 += window.location.pathname || "/", t2 += t2.endsWith("/") ? "" : "/"), t2 += this.baseURL), e2 && (t2 += t2.endsWith("/") ? "" : "/", t2 += e2.startsWith("/") ? e2.substring(1) : e2), t2;
  }
  async send(e2, t2) {
    t2 = this.initSendOptions(e2, t2);
    let s2 = this.buildURL(e2);
    if (this.beforeSend) {
      const e3 = Object.assign({}, await this.beforeSend(s2, t2));
      void 0 !== e3.url || void 0 !== e3.options ? (s2 = e3.url || s2, t2 = e3.options || t2) : Object.keys(e3).length && (t2 = e3, console?.warn && console.warn("Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`."));
    }
    if (void 0 !== t2.query) {
      const e3 = serializeQueryParams(t2.query);
      e3 && (s2 += (s2.includes("?") ? "&" : "?") + e3), delete t2.query;
    }
    "application/json" == this.getHeader(t2.headers, "Content-Type") && t2.body && "string" != typeof t2.body && (t2.body = JSON.stringify(t2.body));
    return (t2.fetch || fetch)(s2, t2).then((async (e3) => {
      let s3 = {};
      try {
        s3 = await e3.json();
      } catch (e4) {
      }
      if (this.afterSend && (s3 = await this.afterSend(e3, s3, t2)), e3.status >= 400) throw new ClientResponseError({ url: e3.url, status: e3.status, data: s3 });
      return s3;
    })).catch(((e3) => {
      throw new ClientResponseError(e3);
    }));
  }
  initSendOptions(e2, t2) {
    if ((t2 = Object.assign({ method: "GET" }, t2)).body = (function convertToFormDataIfNeeded(e3) {
      if ("undefined" == typeof FormData || void 0 === e3 || "object" != typeof e3 || null === e3 || isFormData(e3) || !hasFileField(e3)) return e3;
      const t3 = new FormData();
      for (const s2 in e3) {
        const i2 = e3[s2];
        if ("object" != typeof i2 || hasFileField({ data: i2 })) {
          const e4 = Array.isArray(i2) ? i2 : [i2];
          for (let i3 of e4) t3.append(s2, i3);
        } else {
          let e4 = {};
          e4[s2] = i2, t3.append("@jsonPayload", JSON.stringify(e4));
        }
      }
      return t3;
    })(t2.body), normalizeUnknownQueryParams(t2), t2.query = Object.assign({}, t2.params, t2.query), void 0 === t2.requestKey && (false === t2.$autoCancel || false === t2.query.$autoCancel ? t2.requestKey = null : (t2.$cancelKey || t2.query.$cancelKey) && (t2.requestKey = t2.$cancelKey || t2.query.$cancelKey)), delete t2.$autoCancel, delete t2.query.$autoCancel, delete t2.$cancelKey, delete t2.query.$cancelKey, null !== this.getHeader(t2.headers, "Content-Type") || isFormData(t2.body) || (t2.headers = Object.assign({}, t2.headers, { "Content-Type": "application/json" })), null === this.getHeader(t2.headers, "Accept-Language") && (t2.headers = Object.assign({}, t2.headers, { "Accept-Language": this.lang })), this.authStore.token && null === this.getHeader(t2.headers, "Authorization") && (t2.headers = Object.assign({}, t2.headers, { Authorization: this.authStore.token })), this.enableAutoCancellation && null !== t2.requestKey) {
      const s2 = t2.requestKey || (t2.method || "GET") + e2;
      delete t2.requestKey, this.cancelRequest(s2);
      const i2 = new AbortController();
      this.cancelControllers[s2] = i2, t2.signal = i2.signal;
    }
    return t2;
  }
  getHeader(e2, t2) {
    e2 = e2 || {}, t2 = t2.toLowerCase();
    for (let s2 in e2) if (s2.toLowerCase() == t2) return e2[s2];
    return null;
  }
};

// apps/web/src/lib/pocketbaseClient.js
var POCKETBASE_API_URL = import.meta.env?.VITE_POCKETBASE_URL || (typeof window !== "undefined" ? window.location.port === "8090" ? "http://127.0.0.1:8090" : "/hcgi/platform" : "http://127.0.0.1:8090");
var pocketbaseClient = new Client(POCKETBASE_API_URL);
pocketbaseClient.autoCancellation(false);
pocketbaseClient.beforeSend = (url, options) => {
  if (options && options.headers && options.headers.Authorization) {
    const token = String(options.headers.Authorization).replace(/^Bearer\s+/i, "");
    if (token && !token.startsWith("ey")) {
      delete options.headers.Authorization;
    }
  }
  return options;
};
var pocketbaseClient_default = pocketbaseClient;

// apps/web/src/lib/reservationClient.js
var API_BASE = "/api/reservations";
var reservationClient = {
  /**
   * Fetch calendar timeline matrix
   */
  async getCalendar(view = "weekly", startDate = null, endDate = null) {
    try {
      const q = new URLSearchParams({ view });
      if (startDate) q.append("startDate", startDate);
      if (endDate) q.append("endDate", endDate);
      const res = await fetch(`${API_BASE}/calendar?${q.toString()}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      const trucks = await pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => []);
      const reservations = await pocketbaseClient_default.collection("truck_reservations").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
      const blocks = await pocketbaseClient_default.collection("truck_availability_blocks").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
      return {
        success: true,
        view,
        total_fleet: trucks.length,
        timeline: trucks.map((t2) => ({
          truck_id: t2.id,
          truck_number: t2.truck_number,
          vehicle_category: t2.vehicle_class || t2.truck_size || "32FT SXL",
          capacity_tons: t2.truck_size === "32FT MXL" ? 18.5 : 14.5,
          current_status: "Available",
          current_location: "Hyderabad Hub",
          predicted_location: "Hyderabad Hub",
          prediction_confidence: 90,
          reservations: reservations.filter((r3) => r3.truck_number === t2.truck_number),
          blocks: blocks.filter((b) => b.truck_number === t2.truck_number)
        }))
      };
    }
  },
  /**
   * Fetch predictive movement matrix for a target future date
   */
  async getForecasts(targetDate = null) {
    try {
      const q = targetDate ? `?targetDate=${encodeURIComponent(targetDate)}` : "";
      const res = await fetch(`${API_BASE}/forecasts${q}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {
    }
    const trucks = await pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => []);
    return {
      success: true,
      trucksCount: trucks.length,
      forecasts: trucks.map((t2) => ({
        truck_id: t2.id,
        truck_number: t2.truck_number,
        vehicle_category: t2.vehicle_class || t2.truck_size || "32FT SXL",
        current_location: "Hyderabad Hub",
        predicted_location: "Hyderabad Hub",
        prediction_confidence: 88,
        prediction_status: "Available",
        last_recalculated_at: (/* @__PURE__ */ new Date()).toISOString()
      }))
    };
  },
  /**
   * Search matching trucks for a booking request
   */
  async searchAvailability(criteria) {
    try {
      const res = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteria)
      });
      if (res.ok) {
        return await res.json();
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Search failed");
    } catch (err) {
      const trucks = await pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => []);
      return {
        success: true,
        total_matches: trucks.length,
        available_count: trucks.length,
        results: trucks.map((t2) => ({
          truck_id: t2.id,
          truck_number: t2.truck_number,
          vehicle_category: t2.vehicle_class || t2.truck_size || "32FT SXL",
          capacity_tons: 14.5,
          predicted_location: "Hyderabad Hub",
          prediction_confidence: 90,
          deadhead_km: 15,
          match_score: 95,
          is_feasible: true,
          match_reasons: ["Vehicle specifications match", "Zero conflicting bookings"],
          disqualifications: [],
          booking_mode: "Instant Confirmed"
        }))
      };
    }
  },
  /**
   * Submit new reservation
   */
  async createReservation(payload) {
    const res = await fetch(`${API_BASE}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit reservation");
    }
    return data;
  },
  /**
   * Approve and allocate reservation
   */
  async approveReservation(id, payload) {
    const res = await fetch(`${API_BASE}/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to approve reservation");
    }
    return data;
  },
  /**
   * Reject reservation
   */
  async rejectReservation(id, reason, rejectedBy = "Dispatcher") {
    const res = await fetch(`${API_BASE}/reject/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, rejected_by: rejectedBy })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Failed to reject reservation");
    }
    return data;
  },
  /**
   * List all reservations
   */
  async listReservations(status = null) {
    try {
      const q = status ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`${API_BASE}/list${q}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {
    }
    const filter = status ? `status = "${status}"` : void 0;
    const items = await pocketbaseClient_default.collection("truck_reservations").getFullList({ filter, sort: "-created", $autoCancel: false }).catch(() => []);
    return { success: true, count: items.length, reservations: items };
  },
  /**
   * Manage Availability Blocks
   */
  async listBlocks() {
    try {
      const res = await fetch(`${API_BASE}/blocks`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    const items = await pocketbaseClient_default.collection("truck_availability_blocks").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
    return { success: true, count: items.length, blocks: items };
  },
  async createBlock(payload) {
    const res = await fetch(`${API_BASE}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to create block");
    return data;
  },
  async deleteBlock(id) {
    const res = await fetch(`${API_BASE}/blocks/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to remove block");
    return data;
  },
  /**
   * Return-Load Opportunities
   */
  async getReturnLoads() {
    try {
      const res = await fetch(`${API_BASE}/return-loads`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    return { success: true, count: 0, opportunities: [] };
  },
  /**
   * Airport Flight-Style Truck Departure Board (FIDS)
   */
  async getDepartures() {
    try {
      const res = await fetch(`${API_BASE}/departures`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    return { success: true, active_bays_count: 0, departures: [] };
  },
  async updateDepartureBay(payload) {
    const res = await fetch(`${API_BASE}/departures/update-bay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update bay status");
    return data;
  },
  /**
   * Route Net Profit Ranking
   */
  async getRouteProfitRanking() {
    try {
      const res = await fetch(`${API_BASE}/route-profit`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    return { success: true, routes_count: 0, routes: [] };
  },
  /**
   * Assign truck to reservation and immediately lock its schedule as BUSY
   */
  async assignTruckAndLock(payload) {
    const res = await fetch(`${API_BASE}/assign-and-lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to assign truck and lock schedule");
    return data;
  },
  /**
   * Flexible Date Booking & Economic Date Suggestion Matrix
   */
  async getFlexibleMatrix(origin = "Hyderabad", destination = "Hubli", targetDate = null, daysAhead = 6) {
    try {
      const q = new URLSearchParams({ origin, destination, daysAhead });
      if (targetDate) q.append("targetDate", targetDate);
      const res = await fetch(`${API_BASE}/flexible-matrix?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    const baseDate = targetDate ? new Date(targetDate) : /* @__PURE__ */ new Date();
    const matrix = [];
    for (let i2 = 0; i2 < daysAhead; i2++) {
      const d = new Date(baseDate.getTime() + i2 * 24 * 60 * 60 * 1e3);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isMid = d.getDay() === 2 || d.getDay() === 3 || d.getDay() === 4;
      const rate = isMid ? 24500 : 28e3;
      matrix.push({
        date: d.toISOString().slice(0, 10),
        day_label: `${dayName}, ${monthDay}`,
        weekday: dayName,
        available_trucks: isMid ? 3 : 2,
        rate,
        base_rate: 28e3,
        discount_pct: isMid ? 12.5 : 0,
        has_return_backhaul: isMid,
        is_economical: isMid && i2 === 1
      });
    }
    return {
      success: true,
      origin,
      destination,
      matrix,
      suggested_date: matrix.find((m) => m.is_economical)?.date || matrix[0].date,
      savings_amount: 3500,
      message: "Most economical loading date found."
    };
  },
  /**
   * Dedicated Vehicle Subscriptions (Module 12)
   */
  async getSubscriptions() {
    try {
      const res = await fetch(`${API_BASE}/subscriptions`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    const list = await pocketbaseClient_default.collection("dedicated_subscriptions").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
    return { success: true, count: list.length, subscriptions: list };
  },
  async createSubscription(payload) {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to create subscription");
    return data;
  },
  async assignTruckToSubscription(payload) {
    const res = await fetch(`${API_BASE}/subscriptions/assign-truck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to assign truck to subscription");
    return data;
  },
  /**
   * Recurring Truck Reservations (Module 11)
   */
  async getRecurringBookings() {
    try {
      const res = await fetch(`${API_BASE}/recurring`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    const list = await pocketbaseClient_default.collection("recurring_reservations").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
    return { success: true, count: list.length, recurring: list };
  },
  async createRecurringBooking(payload) {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to create recurring booking");
    return data;
  },
  async assignTruckToRecurring(payload) {
    const res = await fetch(`${API_BASE}/recurring/assign-truck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to assign truck to recurring schedule");
    return data;
  },
  /**
   * Attached Truck Owner Portal (Module 6)
   */
  async getPartnerTrucks() {
    try {
      const res = await fetch(`${API_BASE}/partner-trucks`);
      if (res.ok) return await res.json();
    } catch (_) {
    }
    const list = await pocketbaseClient_default.collection("partner_trucks").getFullList({ sort: "-created", $autoCancel: false }).catch(() => []);
    return { success: true, count: list.length, trucks: list };
  },
  async registerPartnerTruck(payload) {
    const res = await fetch(`${API_BASE}/partner-trucks/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to register partner truck");
    return data;
  },
  async declarePartnerAvailability(payload) {
    const res = await fetch(`${API_BASE}/partner-trucks/declare-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to declare availability");
    return data;
  },
  async verifyPartnerTruck(payload) {
    const res = await fetch(`${API_BASE}/partner-trucks/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update partner verification status");
    return data;
  }
};

// apps/web/src/contexts/AuthContext.jsx
var AuthContext = createContext(null);
var SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1e3;
var useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("app_auth_user") : null;
      const user = saved ? JSON.parse(saved) : pocketbaseClient_default?.authStore?.model || null;
      return {
        currentUser: user,
        isAuthenticated: Boolean(user),
        initialLoading: false,
        login: async () => {
        },
        signup: async () => {
        },
        logout: async () => {
        },
        changePassword: async () => {
        }
      };
    } catch (e2) {
      return {
        currentUser: pocketbaseClient_default?.authStore?.model || null,
        isAuthenticated: Boolean(pocketbaseClient_default?.authStore?.model),
        initialLoading: false,
        login: async () => {
        },
        signup: async () => {
        },
        logout: async () => {
        },
        changePassword: async () => {
        }
      };
    }
  }
  return context;
};

// apps/web/src/pages/FleetCalendarPage.jsx
var STATUS_CONFIG = {
  "Available": {
    bg: "bg-emerald-500/15 hover:bg-emerald-500/25",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Available"
  },
  "Booked": {
    bg: "bg-blue-500/20 hover:bg-blue-500/30",
    text: "text-blue-300",
    border: "border-blue-500/40",
    dot: "bg-blue-400",
    label: "Confirmed Booked"
  },
  "Booking Requested": {
    bg: "bg-amber-500/20 hover:bg-amber-500/30",
    text: "text-amber-300",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
    label: "Booking Request"
  },
  "Loading": {
    bg: "bg-teal-500/20 hover:bg-teal-500/30",
    text: "text-teal-300",
    border: "border-teal-500/40",
    dot: "bg-teal-400",
    label: "Loading at Dock"
  },
  "In Transit": {
    bg: "bg-purple-500/20 hover:bg-purple-500/30",
    text: "text-purple-300",
    border: "border-purple-500/40",
    dot: "bg-purple-400",
    label: "In Transit"
  },
  "Unloading": {
    bg: "bg-cyan-500/20 hover:bg-cyan-500/30",
    text: "text-cyan-300",
    border: "border-cyan-500/40",
    dot: "bg-cyan-400",
    label: "Unloading at Dock"
  },
  "Waiting": {
    bg: "bg-yellow-500/20 hover:bg-yellow-500/30",
    text: "text-yellow-300",
    border: "border-yellow-500/40",
    dot: "bg-yellow-400",
    label: "Detained / Waiting"
  },
  "Expected Available": {
    bg: "bg-emerald-500/10 border-dashed hover:bg-emerald-500/20",
    text: "text-emerald-300",
    border: "border-emerald-400/40",
    dot: "bg-emerald-300",
    label: "Expected Available"
  },
  "Maintenance": {
    bg: "bg-orange-500/20 hover:bg-orange-500/30",
    text: "text-orange-300",
    border: "border-orange-500/40",
    dot: "bg-orange-400",
    label: "Maintenance"
  },
  "Breakdown": {
    bg: "bg-rose-500/25 hover:bg-rose-500/35",
    text: "text-rose-300",
    border: "border-rose-500/50",
    dot: "bg-rose-400",
    label: "Breakdown"
  },
  "Documents Expired": {
    bg: "bg-red-500/30 hover:bg-red-500/40",
    text: "text-red-300",
    border: "border-red-500/60",
    dot: "bg-red-500",
    label: "Docs Expired"
  },
  "Schedule Conflict": {
    bg: "bg-red-600/30 animate-pulse",
    text: "text-red-200",
    border: "border-red-500",
    dot: "bg-red-400",
    label: "Conflict"
  }
};
function FleetCalendarPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e2) {
    try {
      currentUser = JSON.parse(localStorage.getItem("app_auth_user"));
    } catch (err) {
    }
  }
  const [dateOffset, setDateOffset] = useState(0);
  const [viewDaysCount, setViewDaysCount] = useState(7);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    truck_number: "",
    vehicle_category: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    origin: "",
    destination: "",
    loading_datetime: "",
    reservation_type: "Confirmed",
    indicative_freight: "",
    cargo_weight_tons: "14.5",
    notes: ""
  });
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockForm, setBlockForm] = useState({
    truck_number: "",
    block_type: "Maintenance",
    reason: "",
    start_time: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 48 * 3600 * 1e3).toISOString().slice(0, 16)
  });
  const loadCalendar = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getCalendar("weekly");
      setTimelineData(res.timeline || []);
    } catch (err) {
      toast.error("Failed to load fleet calendar: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCalendar();
  }, []);
  const baseDate = /* @__PURE__ */ new Date();
  baseDate.setDate(baseDate.getDate() + dateOffset);
  const days = Array.from({ length: viewDaysCount }, (_, i2) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i2);
    const today = /* @__PURE__ */ new Date();
    const isToday = d.toDateString() === today.toDateString();
    return {
      date: d,
      dateString: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      isToday
    };
  });
  const startDateFormatted = days[0]?.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const endDateFormatted = days[days.length - 1]?.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const filteredTimeline = timelineData.filter((t2) => {
    const matchesSearch = (t2.truck_number || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t2.current_location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t2.predicted_location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t2.current_status || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t2.vehicle_category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || t2.current_status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const categories = ["All", ...new Set(timelineData.map((t2) => t2.vehicle_category).filter(Boolean))];
  const handleOpenReserve = (truck, dateObj) => {
    const dateStr = dateObj ? dateObj.dateString : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const defaultTime = `${dateStr}T09:00`;
    setReserveForm({
      truck_number: truck.truck_number,
      vehicle_category: truck.vehicle_category || "32FT SXL",
      customer_name: currentUser?.name || currentUser?.full_name || "",
      customer_phone: currentUser?.phone || "",
      customer_email: currentUser?.email || "",
      origin: truck.predicted_location || truck.current_location || "Hyderabad Hub",
      destination: "",
      loading_datetime: defaultTime,
      reservation_type: "Confirmed",
      indicative_freight: "32000",
      cargo_weight_tons: String(truck.capacity_tons || 14.5),
      notes: ""
    });
    setIsReserveModalOpen(true);
  };
  const handleCreateReservation = async (e2) => {
    e2.preventDefault();
    if (!reserveForm.customer_name || !reserveForm.destination) {
      toast.warning("Please enter customer name and destination.");
      return;
    }
    try {
      await reservationClient.createReservation({
        ...reserveForm,
        created_by: currentUser?.full_name || currentUser?.name || "Dispatcher"
      });
      toast.success(`Reservation Confirmed for ${reserveForm.truck_number} \u2192 ${reserveForm.destination}!`);
      setIsReserveModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || "Failed to create reservation");
    }
  };
  const handleCreateBlock = async (e2) => {
    e2.preventDefault();
    if (!blockForm.truck_number || !blockForm.reason) {
      toast.warning("Please select a truck and enter a reason.");
      return;
    }
    try {
      await reservationClient.createBlock({
        ...blockForm,
        created_by: currentUser?.full_name || currentUser?.name || "Dispatcher"
      });
      toast.success(`Availability block placed on ${blockForm.truck_number}.`);
      setIsBlockModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || "Failed to create block");
    }
  };
  const getSlotInfo = (truck, dayObj, dayIndex) => {
    const dayStr = dayObj.dateString;
    if (truck.blocks && truck.blocks.length > 0) {
      const activeBlock = truck.blocks.find((b) => {
        const start = (b.start_time || "").slice(0, 10);
        const end = (b.end_time || "").slice(0, 10);
        return dayStr >= start && dayStr <= end;
      });
      if (activeBlock) {
        return {
          type: "block",
          label: `\u{1F527} ${activeBlock.block_type || "Maintenance"}`,
          sub: activeBlock.reason || "Blocked",
          status: "Maintenance",
          clickable: false
        };
      }
    }
    if (truck.reservations && truck.reservations.length > 0) {
      const res = truck.reservations.find((r3) => {
        if (r3.status === "Cancelled" || r3.status === "Rejected") return false;
        const loadD = (r3.loading_datetime || r3.reserved_from || "").slice(0, 10);
        const unloadD = (r3.expected_unloading_datetime || r3.reserved_to || loadD).slice(0, 10);
        return dayStr >= loadD && dayStr <= unloadD;
      });
      if (res) {
        const isRequest = res.status === "Pending" || res.reservation_type === "Booking Request" || res.status === "Booking Requested";
        return {
          type: "reservation",
          label: isRequest ? `\u26A1 Held: ${res.destination || "Requested"}` : `\u{1F512} Booked \u2192 ${res.destination || "Unload"}`,
          sub: `${res.customer_name || "Client"} (${isRequest ? "Busy Held" : "Confirmed"})`,
          status: isRequest ? "Booking Requested" : "Booked",
          reservation: res,
          clickable: true
        };
      }
    }
    if (dayObj.isToday) {
      if (truck.current_status === "In Transit") {
        return {
          type: "transit",
          label: `\u{1F69B} En Route to ${truck.expected_destination || "Hub"}`,
          sub: truck.estimated_arrival ? `ETA: ${new Date(truck.estimated_arrival).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : "In Transit",
          status: "In Transit",
          clickable: true
        };
      }
      if (truck.current_status === "Loading" || truck.current_status === "Unloading") {
        return {
          type: "dock",
          label: `\u2693 ${truck.current_status} at Dock`,
          sub: truck.predicted_location || "Terminal",
          status: truck.current_status,
          clickable: true
        };
      }
      if (truck.current_status === "Maintenance" || truck.current_status === "Breakdown") {
        return {
          type: "maintenance",
          label: `\u26A0\uFE0F ${truck.current_status}`,
          sub: "Downtime",
          status: truck.current_status,
          clickable: false
        };
      }
      return {
        type: "available",
        label: `\u26A1 Available Now`,
        sub: `at ${truck.current_location || "Hub"}`,
        status: "Available",
        clickable: true,
        canBook: true
      };
    }
    if (truck.current_status === "In Transit" && dayIndex === 1) {
      return {
        type: "arrival",
        label: `\u{1F4CD} Arrival: ${truck.expected_destination || "Hubli"}`,
        sub: "Unloading window",
        status: "Unloading",
        clickable: true
      };
    }
    if (truck.current_status === "In Transit" && dayIndex === 2) {
      return {
        type: "expected_available",
        label: `\u2728 Available at ${truck.expected_destination || "Hubli"}`,
        sub: "Ready for outbound",
        status: "Expected Available",
        clickable: true,
        canBook: true
      };
    }
    if (dayIndex >= 3 && truck.expected_destination && truck.expected_destination.toLowerCase() !== "hyderabad") {
      return {
        type: "return_load",
        label: `\u{1F504} Return Load Opportunity`,
        sub: `${truck.expected_destination} \u2192 Hyd`,
        status: "Available",
        clickable: true,
        canBook: true
      };
    }
    return {
      type: "open",
      label: `+ Reserve`,
      sub: `at ${truck.predicted_location || truck.current_location || "Depot"}`,
      status: "Available",
      clickable: true,
      canBook: true
    };
  };
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-5 max-w-[1500px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1 border-b border-slate-800/60" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" }, "Airline Flight-Style Scheduling"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1.5 font-medium" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-ping" }), "Live Fleet Dispatch Engine")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(CalendarDays, { className: "w-7 h-7 text-emerald-400" }), "Fleet Availability Calendar"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "Real-time multi-resource timeline. Schedule bookings, inspect movement forecasts, and prevent double-booking.")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center shadow-inner" }, [
    { days: 7, label: "7 Days" },
    { days: 14, label: "14 Days" },
    { days: 30, label: "30 Days" }
  ].map((v) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: v.days,
      onClick: () => setViewDaysCount(v.days),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewDaysCount === v.days ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"}`
    },
    v.label
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5" }, /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      onClick: () => setDateOffset((prev) => prev - 7),
      title: "Previous 7 Days",
      className: "p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
    },
    /* @__PURE__ */ react_shim_default.createElement(ChevronLeft, { className: "w-4 h-4" })
  ), /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      onClick: () => setDateOffset(0),
      className: "px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
    },
    "Today"
  ), /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      onClick: () => setDateOffset((prev) => prev + 7),
      title: "Next 7 Days",
      className: "p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
    },
    /* @__PURE__ */ react_shim_default.createElement(ChevronRight, { className: "w-4 h-4" })
  )), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadCalendar,
      className: "border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-9 rounded-xl"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Refresh"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      onClick: () => {
        if (timelineData.length > 0) {
          setBlockForm((prev) => ({ ...prev, truck_number: timelineData[0].truck_number }));
        }
        setIsBlockModalOpen(true);
      },
      className: "bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs h-9 rounded-xl shadow-lg shadow-amber-600/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(ShieldAlert, { className: "w-3.5 h-3.5 mr-1.5" }),
    "Block Availability"
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5" }, [
    { label: "Available", key: "Available", count: timelineData.filter((t2) => t2.current_status === "Available").length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
    { label: "In Transit", key: "In Transit", count: timelineData.filter((t2) => t2.current_status === "In Transit").length, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", dot: "bg-purple-400" },
    { label: "Confirmed Booked", key: "Booked", count: timelineData.filter((t2) => t2.current_status === "Booked").length, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
    { label: "Dock Operations", key: "Loading", count: timelineData.filter((t2) => t2.current_status === "Loading" || t2.current_status === "Unloading").length, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20", dot: "bg-teal-400" },
    { label: "Maintenance / Blocks", key: "Maintenance", count: timelineData.filter((t2) => t2.current_status === "Maintenance" || t2.current_status === "Breakdown").length, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", dot: "bg-orange-400" },
    { label: "Total Fleet Resources", key: "Total", count: timelineData.length, color: "text-slate-200", bg: "bg-slate-900/80 border-slate-800", dot: "bg-emerald-500" }
  ].map((item, idx) => /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      key: idx,
      className: `p-3 rounded-2xl border ${item.bg} flex items-center justify-between transition-all shadow-sm`
    },
    /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-slate-400" }, item.label), /* @__PURE__ */ react_shim_default.createElement("p", { className: `text-xl font-black ${item.color} tracking-tight` }, item.count, " Trucks")),
    /* @__PURE__ */ react_shim_default.createElement("div", { className: `w-3 h-3 rounded-full ${item.dot} shadow-sm` })
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2 flex-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "relative flex-1 min-w-[220px]" }, /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" }), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Filter by truck number (e.g. TG12, TS08), city, or status...",
      value: searchTerm,
      onChange: (e2) => setSearchTerm(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 overflow-x-auto" }, categories.map((cat) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: cat,
      onClick: () => setSelectedCategory(cat),
      className: `px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-emerald-500 text-slate-950" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`
    },
    cat
  )))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement(Clock, { className: "w-3.5 h-3.5 text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("span", null, "Timeline Horizon: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, startDateFormatted), " \u2192 ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, endDateFormatted)))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { style: { minWidth: `${320 + days.length * 140}px` }, className: "w-full" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-stretch bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-300" }, /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      style: { width: "300px", minWidth: "300px", flexShrink: 0 },
      className: "p-3.5 border-r border-slate-800 flex items-center justify-between uppercase tracking-wider text-[11px] text-slate-400 font-black bg-slate-900/95"
    },
    /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4 text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("span", null, "Fleet Resource & Hub")),
    /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300" }, filteredTimeline.length, " Trucks")
  ), /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      style: {
        flex: 1,
        display: "grid",
        gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
        gap: "4px"
      },
      className: "p-2"
    },
    days.map((day, idx) => /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        key: idx,
        className: `text-center py-2 px-1 rounded-xl transition-all ${day.isToday ? "bg-emerald-500/15 border-2 border-emerald-400/60 shadow-lg shadow-emerald-500/10" : "bg-slate-950/60 border border-slate-850 hover:border-slate-700"}`
      },
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `text-[11px] font-black uppercase ${day.isToday ? "text-emerald-400" : "text-slate-400"}` }, day.dayName), day.isToday && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[9px] px-1 py-0.2 rounded bg-emerald-500 text-slate-950 font-black" }, "TODAY")),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-baseline justify-center gap-1 mt-0.5" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `text-base font-black ${day.isToday ? "text-emerald-300" : "text-white"}` }, day.dayNum), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, day.month))
    ))
  )), loading ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm font-bold text-slate-300" }, "Calculating real-time fleet schedules & future movements..."), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs text-slate-500" }, "Checking PocketBase collections, active trips, and conflict locks")) : filteredTimeline.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-20 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-base font-bold text-slate-300" }, "No fleet trucks found"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs text-slate-500 mt-1" }, "Try clearing your search query or filters.")) : /* @__PURE__ */ react_shim_default.createElement("div", { className: "divide-y divide-slate-850" }, filteredTimeline.map((truck) => {
    const statusCfg = STATUS_CONFIG[truck.current_status] || STATUS_CONFIG["Available"];
    return /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        key: truck.truck_id || truck.truck_number,
        className: "flex items-stretch hover:bg-slate-900/40 transition-colors group"
      },
      /* @__PURE__ */ react_shim_default.createElement(
        "div",
        {
          style: { width: "300px", minWidth: "300px", flexShrink: 0 },
          className: "p-3.5 border-r border-slate-800 flex flex-col justify-between bg-slate-950/80 group-hover:bg-slate-900/70 transition-colors"
        },
        /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement(
          "span",
          {
            onClick: () => setSelectedTruck(truck),
            className: "font-black text-sm text-white tracking-wide hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
          },
          truck.truck_number,
          /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-2 h-2 rounded-full ${statusCfg.dot}` })
        ), /* @__PURE__ */ react_shim_default.createElement(Badge, { variant: "outline", className: "text-[10px] font-bold px-1.5 py-0 border-slate-700 bg-slate-900 text-slate-300" }, truck.vehicle_category || "32FT SXL")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 text-xs text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "flex items-center gap-1 font-semibold text-slate-300 truncate" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3 h-3 text-emerald-400 shrink-0" }), truck.predicted_location || truck.current_location || "Hyderabad"), /* @__PURE__ */ react_shim_default.createElement("span", null, "\u2022"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-slate-300 shrink-0" }, truck.capacity_tons || 14.5, " MT"))),
        /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `font-extrabold ${statusCfg.text} text-[10px] uppercase` }, statusCfg.label), /* @__PURE__ */ react_shim_default.createElement(
          "button",
          {
            onClick: () => handleOpenReserve(truck, days[0]),
            className: "text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-1 hover:underline"
          },
          /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-3 h-3" }),
          " Quick Book"
        ))
      ),
      /* @__PURE__ */ react_shim_default.createElement(
        "div",
        {
          style: {
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            gap: "4px"
          },
          className: "p-2 items-center"
        },
        days.map((day, dIdx) => {
          const slot = getSlotInfo(truck, day, dIdx);
          const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG["Available"];
          return /* @__PURE__ */ react_shim_default.createElement(
            "div",
            {
              key: dIdx,
              onClick: () => {
                if (slot.canBook) {
                  handleOpenReserve(truck, day);
                } else {
                  setSelectedTruck(truck);
                }
              },
              className: `h-14 rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group/slot ${slot.type === "open" ? "border-slate-850 bg-slate-900/30 hover:border-emerald-500/50 hover:bg-emerald-500/10" : `${cfg.border} ${cfg.bg} shadow-sm`}`
            },
            /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between gap-1" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `text-[11px] font-black leading-tight truncate ${slot.type === "open" ? "text-slate-500 group-hover/slot:text-emerald-300" : cfg.text}` }, slot.label), slot.canBook && /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-3 h-3 text-slate-500 group-hover/slot:text-emerald-400 shrink-0" })),
            /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between text-[10px] text-slate-400 truncate" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "truncate" }, slot.sub), day.isToday && /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" }))
          );
        })
      )
    );
  }))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isReserveModalOpen, onOpenChange: setIsReserveModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-black text-white flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-5 h-5 text-emerald-400" }), "Book Truck: ", reserveForm.truck_number)), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleCreateReservation, className: "space-y-3.5 py-2" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Customer Name *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Reliance Retail / Tata",
      value: reserveForm.customer_name,
      onChange: (e2) => setReserveForm({ ...reserveForm, customer_name: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Customer Phone"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. 9876543210",
      value: reserveForm.customer_phone,
      onChange: (e2) => setReserveForm({ ...reserveForm, customer_phone: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Origin Hub *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Hyderabad Hub",
      value: reserveForm.origin,
      onChange: (e2) => setReserveForm({ ...reserveForm, origin: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Destination Hub *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Hubli / Bangalore / Pune",
      value: reserveForm.destination,
      onChange: (e2) => setReserveForm({ ...reserveForm, destination: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Loading Date & Time *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      required: true,
      value: reserveForm.loading_datetime,
      onChange: (e2) => setReserveForm({ ...reserveForm, loading_datetime: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Reservation Type"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: reserveForm.reservation_type,
      onChange: (e2) => setReserveForm({ ...reserveForm, reservation_type: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Confirmed" }, "Confirmed Reservation (Immediate Lock)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Provisional" }, "Provisional (Requires Approval)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Booking Request" }, "Booking Request")
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Agreed Freight (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      placeholder: "e.g. 32000",
      value: reserveForm.indicative_freight,
      onChange: (e2) => setReserveForm({ ...reserveForm, indicative_freight: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Cargo Weight (MT)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. 14.5",
      value: reserveForm.cargo_weight_tons,
      onChange: (e2) => setReserveForm({ ...reserveForm, cargo_weight_tons: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsReserveModalOpen(false), className: "border-slate-800 rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs" }, "Confirm & Lock Schedule"))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isBlockModalOpen, onOpenChange: setIsBlockModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-md rounded-2xl shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-black text-white flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(ShieldAlert, { className: "w-5 h-5 text-amber-500" }), "Block Truck Availability")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleCreateBlock, className: "space-y-3 py-2" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Select Truck *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: blockForm.truck_number,
      onChange: (e2) => setBlockForm({ ...blockForm, truck_number: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
    },
    timelineData.map((t2) => /* @__PURE__ */ react_shim_default.createElement("option", { key: t2.truck_number, value: t2.truck_number }, t2.truck_number, " (", t2.vehicle_category, " \xB7 ", t2.current_location, ")"))
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Downtime Reason Type *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: blockForm.block_type,
      onChange: (e2) => setBlockForm({ ...blockForm, block_type: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Maintenance" }, "Scheduled Maintenance / Workshop"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Breakdown" }, "Mechanical Breakdown / Repair"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Documents Expired" }, "RTO / Fitness / Insurance Renewal"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Driver Unavailable" }, "Driver Leave / Rest Period"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Operational Hold" }, "Internal Operational Hold")
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Detailed Operational Notes *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Engine overhaul scheduled at Solapur workshop",
      value: blockForm.reason,
      onChange: (e2) => setBlockForm({ ...blockForm, reason: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Start Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      required: true,
      value: blockForm.start_time,
      onChange: (e2) => setBlockForm({ ...blockForm, start_time: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Expected Release Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      required: true,
      value: blockForm.end_time,
      onChange: (e2) => setBlockForm({ ...blockForm, end_time: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-xs h-9 mt-1 text-white rounded-xl"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsBlockModalOpen(false), className: "border-slate-800 rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs" }, "Confirm Block"))))), selectedTruck && /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: Boolean(selectedTruck), onOpenChange: () => setSelectedTruck(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-black text-white flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-5 h-5 text-emerald-400" }), selectedTruck.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }, selectedTruck.current_status))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-4 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Vehicle Category"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-white font-extrabold text-sm" }, selectedTruck.vehicle_category || "32FT SXL")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Rated Capacity"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-white font-extrabold text-sm" }, selectedTruck.capacity_tons || 14.5, " MT")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Current Hub"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-emerald-400 font-extrabold" }, selectedTruck.current_location || "Hyderabad")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Predicted Future Hub"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-cyan-400 font-extrabold" }, selectedTruck.predicted_location || "Hyderabad"))), selectedTruck.expected_destination && /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl space-y-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between text-purple-300 font-bold" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "En Route Destination:"), /* @__PURE__ */ react_shim_default.createElement("span", null, selectedTruck.expected_destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between text-slate-400 text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Estimated Arrival (ETA):"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-white font-bold" }, selectedTruck.estimated_arrival ? new Date(selectedTruck.estimated_arrival).toLocaleString("en-IN") : "En Route"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold" }, "Prediction Engine Confidence:"), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-black" }, selectedTruck.prediction_confidence || 85, "% Confidence")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-end gap-2 pt-2" }, /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: () => {
        handleOpenReserve(selectedTruck, days[0]);
        setSelectedTruck(null);
      },
      className: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs"
    },
    /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-3.5 h-3.5 mr-1" }),
    " Book Truck Now"
  ))))));
}

// apps/web/src/pages/MovementPredictionPage.jsx
var STATE_COORDINATES = {
  "All": { center: [17.385, 78.4867], zoom: 5 },
  "Telangana": { center: [17.8496, 79.1152], zoom: 7 },
  "Andhra Pradesh": { center: [15.9129, 79.74], zoom: 7 },
  "Karnataka": { center: [15.3173, 75.7139], zoom: 7 },
  "Maharashtra": { center: [19.7515, 75.7139], zoom: 7 },
  "Tamil Nadu": { center: [11.1271, 78.6569], zoom: 7 }
};
var CITY_COORDINATES = {
  "hyderabad": { lat: 17.385, lng: 78.4867, state: "Telangana" },
  "hubli": { lat: 15.3647, lng: 75.124, state: "Karnataka" },
  "pune": { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },
  "bangalore": { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
  "chennai": { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
  "vijayawada": { lat: 16.5062, lng: 80.648, state: "Andhra Pradesh" },
  "visakhapatnam": { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh" },
  "belgaum": { lat: 15.8497, lng: 74.4977, state: "Karnataka" },
  "mumbai": { lat: 19.076, lng: 72.8777, state: "Maharashtra" }
};
function getCityCoords(locName) {
  const clean = (locName || "").toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key)) return coords;
  }
  return { lat: 17.385, lng: 78.4867, state: "Telangana" };
}
function MovementPredictionPage() {
  const [horizonDays, setHorizonDays] = useState(0);
  const [selectedState, setSelectedState] = useState("All");
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const targetDate = /* @__PURE__ */ new Date();
  targetDate.setDate(targetDate.getDate() + horizonDays);
  const loadForecasts = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getForecasts(targetDate.toISOString());
      setForecasts(res.forecasts || []);
    } catch (err) {
      toast.error("Failed to load movement forecasts: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadForecasts();
  }, [horizonDays]);
  const filteredForecasts = forecasts.filter((f) => {
    if (selectedState === "All") return true;
    const loc = (f.predicted_location || f.current_location || "").toLowerCase();
    const cityCoords = getCityCoords(loc);
    return cityCoords.state === selectedState;
  });
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-7xl mx-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" }, "Module 2 & 7: Intelligent Movement Engine & Map"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Compass, { className: "w-3.5 h-3.5 text-cyan-400" }), "Real Route Corridors & Unloading SLAs")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(Navigation, { className: "w-7 h-7 text-cyan-400" }), "Predictive Fleet Movement & Distribution"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm text-slate-400" }, "Intelligent forecasts of future truck locations across India. Visualise fleet distribution over 7, 15, and 30-day horizons.")), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadForecasts,
      className: "border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Recalculate Movement"
  )), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900 border-slate-800 p-4 shadow-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(Calendar, { className: "w-5 h-5 text-cyan-400" }), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs font-bold text-white uppercase tracking-wider" }, "Prediction Target Horizon: ", /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-cyan-400 font-extrabold" }, targetDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }))), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-slate-400" }, horizonDays === 0 ? "Current real-time positioning" : `Forecasting fleet positions ${horizonDays} day(s) into the future`))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-1.5" }, [
    { days: 0, label: "Today" },
    { days: 1, label: "+1 Day" },
    { days: 2, label: "+2 Days" },
    { days: 3, label: "+3 Days" },
    { days: 7, label: "+7 Days" },
    { days: 15, label: "+15 Days" },
    { days: 30, label: "+30 Days" }
  ].map((p) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: p.days,
      onClick: () => setHorizonDays(p.days),
      className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${horizonDays === p.days ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`
    },
    p.label
  ))))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1" }, /* @__PURE__ */ react_shim_default.createElement(Filter, { className: "w-3.5 h-3.5" }), " Filter by State Corridor:"), Object.keys(STATE_COORDINATES).map((stateName) => /* @__PURE__ */ react_shim_default.createElement(
    Badge,
    {
      key: stateName,
      onClick: () => setSelectedState(stateName),
      variant: "outline",
      className: `cursor-pointer px-3 py-1 text-xs font-semibold rounded-lg transition-all ${selectedState === stateName ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm" : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"}`
    },
    stateName
  ))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border-slate-800 overflow-hidden shadow-2xl relative" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Layers, { className: "w-4 h-4 text-cyan-400" }), /* @__PURE__ */ react_shim_default.createElement("h3", { className: "font-bold text-sm text-white" }, "Geographic Fleet Distribution Map")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "flex items-center gap-1.5 text-emerald-400" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" }), "Actual Verified GPS"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "flex items-center gap-1.5 text-cyan-400" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2.5 h-2.5 rounded-full border-2 border-cyan-400 bg-cyan-400/30 animate-ping inline-block" }), "Predicted Future Position"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[280px] flex flex-col justify-center" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" }, filteredForecasts.map((truck) => {
    const coords = getCityCoords(truck.predicted_location);
    return /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        key: truck.truck_id || truck.truck_number,
        onClick: () => setSelectedTruck(truck),
        className: "p-4 rounded-xl border border-cyan-500/30 bg-slate-900/90 hover:border-cyan-400 hover:bg-slate-850 transition-all cursor-pointer shadow-lg space-y-2.5 group"
      },
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-black text-sm text-white group-hover:text-cyan-400 transition-colors" }, truck.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300 text-[10px] border-cyan-500/30" }, truck.prediction_confidence, "% Conf.")),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-1 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 text-slate-300" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5 text-cyan-400" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold" }, truck.predicted_location || "Hyderabad Hub")), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-slate-500" }, "Region: ", coords.state)),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Status: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, truck.prediction_status)), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-cyan-400 font-bold group-hover:translate-x-1 transition-transform" }, "Details \u2192"))
    );
  })))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border-slate-800 overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement(CardHeader, { className: "bg-slate-900/90 border-b border-slate-800 py-3.5 px-4 flex flex-row items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement(CardTitle, { className: "text-sm font-bold text-white flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Radio, { className: "w-4 h-4 text-cyan-400 animate-pulse" }), "Detailed Movement Forecast Matrix (", filteredForecasts.length, " Trucks)"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400" }, "Confidence evaluated across 10 operational parameters")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Truck Number"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Vehicle Category"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Current / Stationed Location"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Predicted Location (", horizonDays, "d)"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Expected Arrival & SLA"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Next Available Departure"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Confidence"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "Status"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-850" }, filteredForecasts.map((truck) => /* @__PURE__ */ react_shim_default.createElement(
    "tr",
    {
      key: truck.truck_id || truck.truck_number,
      className: "hover:bg-slate-900/60 transition-colors cursor-pointer",
      onClick: () => setSelectedTruck(truck)
    },
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 font-black text-white" }, truck.truck_number),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 text-slate-300" }, truck.vehicle_category),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 text-slate-400" }, truck.current_location || "Hyderabad Hub"),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 font-bold text-cyan-400 flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5" }), truck.predicted_location || "Hyderabad Hub"),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 text-slate-300" }, truck.estimated_arrival ? new Date(truck.estimated_arrival).toLocaleString("en-IN") : "At Depot"),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4 text-emerald-400 font-semibold" }, truck.earliest_next_departure ? new Date(truck.earliest_next_departure).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Immediate"),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold" }, truck.prediction_confidence, "%")),
    /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3 px-4" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { variant: "outline", className: "border-slate-700 bg-slate-900 text-slate-300" }, truck.prediction_status))
  )))))));
}

// apps/web/src/pages/AvailabilitySearchPage.jsx
function AvailabilitySearchPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e2) {
    try {
      currentUser = JSON.parse(localStorage.getItem("app_auth_user"));
    } catch (err) {
    }
  }
  const [searchParams, setSearchParams] = useState({
    origin: "Hyderabad",
    destination: "Hubli",
    loadingDatetime: new Date(Date.now() + 24 * 3600 * 1e3).toISOString().slice(0, 16),
    vehicleCategory: "32FT SXL",
    cargoWeightTons: "14.0",
    specialRequirements: ""
  });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [flexibleMatrix, setFlexibleMatrix] = useState([]);
  const [suggestedDateInfo, setSuggestedDateInfo] = useState(null);
  const [bookForm, setBookForm] = useState({
    customer_name: currentUser?.full_name || currentUser?.name || "",
    customer_phone: currentUser?.phone_number || "",
    customer_email: currentUser?.email || "",
    cargo_description: "Industrial Heavy Equipment & FMCG Goods",
    special_requirements: "",
    indicative_freight: 28e3
  });
  const loadFlexibleMatrix = async (baseDate) => {
    try {
      setMatrixLoading(true);
      const res = await reservationClient.getFlexibleMatrix(
        searchParams.origin,
        searchParams.destination,
        baseDate || searchParams.loadingDatetime.slice(0, 10),
        6
      );
      setFlexibleMatrix(res.matrix || []);
      setSuggestedDateInfo(res);
    } catch (err) {
      console.warn("Matrix error:", err);
    } finally {
      setMatrixLoading(false);
    }
  };
  useEffect(() => {
    loadFlexibleMatrix();
    executeSearch();
  }, []);
  const executeSearch = async (targetDateStr = null) => {
    try {
      setLoading(true);
      const reqDate = targetDateStr || searchParams.loadingDatetime;
      const res = await reservationClient.searchAvailability({
        origin: searchParams.origin,
        destination: searchParams.destination,
        loadingDatetime: reqDate,
        vehicleCategory: searchParams.vehicleCategory,
        cargoWeightTons: parseFloat(searchParams.cargoWeightTons) || 14
      });
      setSearchResults(res);
    } catch (err) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };
  const handleSearchSubmit = async (e2) => {
    e2.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.loadingDatetime) {
      toast.warning("Please specify origin, destination, and loading date.");
      return;
    }
    loadFlexibleMatrix(searchParams.loadingDatetime.slice(0, 10));
    executeSearch();
  };
  const handleSelectFlexibleDate = (dayItem) => {
    const newDateTime = `${dayItem.date}T18:00`;
    setSearchParams((prev) => ({
      ...prev,
      loadingDatetime: newDateTime
    }));
    setBookForm((prev) => ({
      ...prev,
      indicative_freight: dayItem.rate
    }));
    executeSearch(newDateTime);
    toast.info(`Selected ${dayItem.day_label} (Fare: \u20B9${dayItem.rate.toLocaleString("en-IN")})`);
  };
  const handleConfirmBooking = async (e2) => {
    e2.preventDefault();
    if (!bookForm.customer_name || !bookForm.customer_phone) {
      toast.warning("Customer name and phone number are required.");
      return;
    }
    try {
      const res = await reservationClient.createReservation({
        ...bookForm,
        truck_number: selectedMatch?.truck_number || "",
        truck_id: selectedMatch?.truck_id || "",
        vehicle_category: selectedMatch?.vehicle_category || searchParams.vehicleCategory,
        origin: searchParams.origin,
        destination: searchParams.destination,
        loading_datetime: searchParams.loadingDatetime,
        cargo_weight_tons: parseFloat(searchParams.cargoWeightTons) || 14,
        reservation_type: selectedMatch?.booking_mode === "Instant Confirmed" ? "Confirmed" : "Booking Request",
        status: selectedMatch?.truck_number ? "Confirmed" : "Pending",
        match_score: selectedMatch?.match_score || 90,
        match_reasons: selectedMatch?.match_reasons || [],
        created_by: currentUser?.full_name || currentUser?.name || "Customer"
      });
      const truckAssignedMsg = selectedMatch?.truck_number ? ` Truck ${selectedMatch.truck_number} schedule is now LOCKED as BUSY.` : "";
      toast.success(`Booking Confirmed! Ref: ${res.reservation?.booking_number}.${truckAssignedMsg}`);
      setIsBookModalOpen(false);
      setSelectedMatch(null);
      loadFlexibleMatrix();
      executeSearch();
    } catch (err) {
      toast.error(err.message || "Booking submission failed");
    }
  };
  const currentDateOnly = searchParams.loadingDatetime.slice(0, 10);
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/25" }, "Module 3 & 4: Availability Engine & Flexible Date Booking"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1.5 font-medium" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-blue-400 animate-ping" }), "Dynamic Rate Optimizer & Instant Busy Lock")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-7 h-7 text-blue-400" }), "Flexible Date Truck Booking & Availability"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "Compare multi-date truck availability, view recommended economic backhaul dates, and instantly lock assigned vehicles as busy."))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900 border-slate-800 p-5 shadow-2xl rounded-2xl" }, /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleSearchSubmit, className: "space-y-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5 text-emerald-400" }), " Origin Hub / City"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: searchParams.origin,
      onChange: (e2) => setSearchParams({ ...searchParams, origin: e2.target.value }),
      placeholder: "e.g. Hyderabad",
      className: "bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5 text-rose-400" }), " Destination Drop Point"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: searchParams.destination,
      onChange: (e2) => setSearchParams({ ...searchParams, destination: e2.target.value }),
      placeholder: "e.g. Hubli",
      className: "bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Calendar, { className: "w-3.5 h-3.5 text-blue-400" }), " Target Loading Date & Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      value: searchParams.loadingDatetime,
      onChange: (e2) => setSearchParams({ ...searchParams, loadingDatetime: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-3.5 h-3.5 text-amber-400" }), " Vehicle Category"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: searchParams.vehicleCategory,
      onChange: (e2) => setSearchParams({ ...searchParams, vehicleCategory: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-md px-3 text-white font-semibold text-xs h-10"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT SXL" }, "32FT Single Axle (SXL) \u2014 14.5 MT"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT MXL" }, "32FT Multi-Axle (MXL) \u2014 18.5 MT"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "24FT Container" }, "24FT Container \u2014 8.5 MT"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "40FT High Cube" }, "40FT High Cube \u2014 28.0 MT")
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-4 text-xs text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Payload: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, "14.0 MT (Full Truck Load)")), /* @__PURE__ */ react_shim_default.createElement("span", null, "\u2022"), /* @__PURE__ */ react_shim_default.createElement("span", null, "Lane: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400" }, searchParams.origin, " \u2192 ", searchParams.destination))), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      type: "submit",
      disabled: loading,
      className: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-blue-500/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-4 h-4 mr-2" }),
    loading ? "Evaluating Fleet Availabilities..." : "Find Matching Trucks"
  )))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Sparkles, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-sm font-extrabold text-white" }, "Flexible Date Matrix (Economic Fare & Availability Suggestion)")), suggestedDateInfo?.savings_amount > 0 && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement(TrendingDown, { className: "w-3.5 h-3.5" }), "Save up to \u20B9", suggestedDateInfo.savings_amount.toLocaleString("en-IN"), " on backhaul dates!")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" }, flexibleMatrix.map((item, idx) => {
    const isSelected = item.date === currentDateOnly;
    const isEconomical = item.is_economical;
    return /* @__PURE__ */ react_shim_default.createElement(
      "button",
      {
        key: idx,
        type: "button",
        onClick: () => handleSelectFlexibleDate(item),
        className: `relative text-left p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${isSelected ? "bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400" : isEconomical ? "bg-emerald-950/40 border-emerald-500/60 hover:border-emerald-400" : "bg-slate-900/60 border-slate-800 hover:border-slate-700"}`
      },
      isEconomical && /* @__PURE__ */ react_shim_default.createElement("div", { className: "absolute -top-2.5 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Sparkles, { className: "w-3 h-3" }), "BEST FARE"),
      /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-extrabold text-white text-sm" }, item.day_label), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-2 h-2 rounded-full ${item.available_trucks > 0 ? "bg-emerald-400" : "bg-rose-400"}` }), /* @__PURE__ */ react_shim_default.createElement("span", null, item.available_trucks, " ", item.available_trucks === 1 ? "Truck" : "Trucks", " Free"))),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-3 pt-2 border-t border-slate-800/80 flex items-baseline justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-base font-black text-white" }, "\u20B9", item.rate.toLocaleString("en-IN")), item.discount_pct > 0 && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-emerald-400 ml-1.5 font-bold" }, "-", item.discount_pct, "%")), isSelected && /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Check, { className: "w-3 h-3" })))
    );
  }))), searchResults && /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-base font-extrabold text-white flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-5 h-5 text-emerald-400" }), "Available Candidate Vehicles for ", new Date(searchParams.loadingDatetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Found ", searchResults.total_matches, " candidate vehicles (", searchResults.available_count, " feasible)")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, searchResults.results?.map((match, idx) => {
    const isInstant = match.booking_mode === "Instant Confirmed";
    return /* @__PURE__ */ react_shim_default.createElement(
      Card,
      {
        key: idx,
        className: "bg-slate-900 border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
      },
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-mono font-black text-white text-base bg-slate-950 px-2 py-0.5 rounded border border-slate-800" }, match.truck_number)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-xs text-slate-400 mt-1 font-semibold" }, match.vehicle_category, " \u2022 ", match.capacity_tons, " MT Capacity")), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: `text-[10px] font-black ${isInstant ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}` }, match.booking_mode)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400" }, "Current/Predicted Hub:"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-white font-bold" }, match.predicted_location || "Hyderabad Hub")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400" }, "Deadhead Distance:"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-emerald-400 font-bold" }, match.deadhead_km || 15, " km")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400" }, "Match Feasibility Score:"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-blue-400 font-black" }, match.match_score || 95, "%"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400 space-y-1" }, (match.match_reasons || []).slice(0, 2).map((r3, i2) => /* @__PURE__ */ react_shim_default.createElement("div", { key: i2, className: "flex items-center gap-1 text-emerald-400" }, /* @__PURE__ */ react_shim_default.createElement(CircleCheck, { className: "w-3 h-3 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "truncate" }, r3))))),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "pt-4 mt-4 border-t border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-500 uppercase tracking-wider block" }, "Estimated Freight"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-lg font-black text-white" }, "\u20B9", parseFloat(bookForm.indicative_freight || 28e3).toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement(
        Button,
        {
          onClick: () => {
            setSelectedMatch(match);
            setIsBookModalOpen(true);
          },
          className: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs gap-1.5 shadow-md shadow-emerald-500/20"
        },
        /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-3.5 h-3.5" }),
        "Reserve & Lock"
      ))
    );
  }))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isBookModalOpen, onOpenChange: setIsBookModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-lg" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-5 h-5 text-emerald-400" }), "Confirm Reservation & Lock Truck Schedule")), selectedMatch && /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleConfirmBooking, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-mono font-black text-white text-base" }, selectedMatch.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-emerald-500/20 text-emerald-400 text-[10px] font-bold" }, "Schedule Lock Armed")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-300" }, "Route: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, searchParams.origin, " \u2192 ", searchParams.destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-400 text-[11px]" }, "Loading: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, new Date(searchParams.loadingDatetime).toLocaleString()))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Customer / Shipper Name *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      value: bookForm.customer_name,
      onChange: (e2) => setBookForm({ ...bookForm, customer_name: e2.target.value }),
      placeholder: "e.g. Vinod Rathod",
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Contact Phone Number *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      value: bookForm.customer_phone,
      onChange: (e2) => setBookForm({ ...bookForm, customer_phone: e2.target.value }),
      placeholder: "+91 98765 43210",
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Customer Email"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "email",
      value: bookForm.customer_email,
      onChange: (e2) => setBookForm({ ...bookForm, customer_email: e2.target.value }),
      placeholder: "operations@company.com",
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Agreed Indicative Freight (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: bookForm.indicative_freight,
      onChange: (e2) => setBookForm({ ...bookForm, indicative_freight: parseFloat(e2.target.value) || 0 }),
      className: "bg-slate-900 border-slate-800 text-white font-bold text-emerald-400"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Cargo Description"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: bookForm.cargo_description,
      onChange: (e2) => setBookForm({ ...bookForm, cargo_description: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-[11px] flex items-start gap-2" }, /* @__PURE__ */ react_shim_default.createElement(CircleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }), /* @__PURE__ */ react_shim_default.createElement("span", null, "Confirming this reservation will atomically lock ", /* @__PURE__ */ react_shim_default.createElement("strong", null, selectedMatch.truck_number), "'s schedule as ", /* @__PURE__ */ react_shim_default.createElement("strong", null, "BUSY"), " in the Fleet Calendar, preventing any conflicting allocations.")), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsBookModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black" }, "Confirm & Lock Schedule"))))));
}

// apps/web/src/pages/BookingManagementPage.jsx
function BookingManagementPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e2) {
    try {
      currentUser = JSON.parse(localStorage.getItem("app_auth_user"));
    } catch (err) {
    }
  }
  const [reservations, setReservations] = useState([]);
  const [fleetTrucks, setFleetTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedForApproval, setSelectedForApproval] = useState(null);
  const [allocTruckNumber, setAllocTruckNumber] = useState("");
  const [agreedFreight, setAgreedFreight] = useState("");
  const [selectedForRejection, setSelectedForRejection] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const loadReservations = async () => {
    try {
      setLoading(true);
      const [res, trucks] = await Promise.all([
        reservationClient.listReservations(),
        pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => [])
      ]);
      setReservations(res.reservations || []);
      setFleetTrucks(trucks);
    } catch (err) {
      toast.error("Failed to load reservations: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadReservations();
  }, []);
  const handleApprove = async (e2) => {
    e2.preventDefault();
    if (!allocTruckNumber) {
      toast.warning("Please select a truck number for allocation.");
      return;
    }
    try {
      const selectedTruckObj = fleetTrucks.find((t2) => t2.truck_number === allocTruckNumber);
      await reservationClient.assignTruckAndLock({
        reservation_id: selectedForApproval.id,
        truck_number: allocTruckNumber,
        truck_id: selectedTruckObj?.id || "",
        agreed_freight: agreedFreight,
        assigned_by: currentUser?.full_name || currentUser?.name || "Dispatcher"
      });
      toast.success(`Booking ${selectedForApproval.booking_number} approved and truck ${allocTruckNumber} schedule locked as BUSY!`);
      setSelectedForApproval(null);
      loadReservations();
    } catch (err) {
      toast.error(err.message || "Approval & schedule lock failed");
    }
  };
  const handleReject = async (e2) => {
    e2.preventDefault();
    if (!rejectReason) {
      toast.warning("Documented reason is required for rejection.");
      return;
    }
    try {
      await reservationClient.rejectReservation(
        selectedForRejection.id,
        rejectReason,
        currentUser?.full_name || currentUser?.name || "Dispatcher"
      );
      toast.success(`Booking ${selectedForRejection.booking_number} rejected.`);
      setSelectedForRejection(null);
      loadReservations();
    } catch (err) {
      toast.error(err.message || "Rejection failed");
    }
  };
  const filteredReservations = reservations.filter((r3) => {
    const matchesTab = activeTab === "All" || activeTab === "Pending" && (r3.status === "Pending" || r3.reservation_type === "Booking Request") || activeTab === "Confirmed" && r3.status === "Confirmed" || activeTab === "Provisional" && r3.reservation_type === "Provisional";
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (r3.booking_number || "").toLowerCase().includes(searchLower) || (r3.customer_name || "").toLowerCase().includes(searchLower) || (r3.truck_number || "").toLowerCase().includes(searchLower) || (r3.origin || "").toLowerCase().includes(searchLower) || (r3.destination || "").toLowerCase().includes(searchLower);
    return matchesTab && matchesSearch;
  });
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-7xl mx-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20" }, "Module 4 & 9: 3-Tier Reservations & Control Center"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(ClipboardCheck, { className: "w-3.5 h-3.5 text-violet-400" }), "Confirmed, Provisional & Request Lifecycle")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(FileText, { className: "w-7 h-7 text-violet-400" }), "Fleet Reservation Management"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm text-slate-400" }, "Review incoming booking requests, allocate trucks, approve provisional reservations, and monitor schedules.")), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadReservations,
      className: "border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Refresh"
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850" }, ["All", "Confirmed", "Pending", "Provisional"].map((tab) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: tab,
      onClick: () => setActiveTab(tab),
      className: `px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? "bg-violet-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`
    },
    tab
  ))), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Filter by booking number, customer, truck, or city...",
      value: searchTerm,
      onChange: (e2) => setSearchTerm(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 max-w-xs"
    }
  )), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border-slate-800 overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Booking Ref"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Customer Details"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Allocated Truck"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Corridor Route"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Loading Date & SLA"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Freight (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4" }, "Booking Type"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3.5 px-4 text-right" }, "Actions"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-850" }, loading ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: "8", className: "py-12 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" }), "Loading reservations registry...")) : filteredReservations.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: "8", className: "py-12 text-center text-slate-500" }, "No reservations found in this view.")) : filteredReservations.map((res) => /* @__PURE__ */ react_shim_default.createElement("tr", { key: res.id || res.booking_number, className: "hover:bg-slate-900/60 transition-colors" }, /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-black text-white" }, res.booking_number), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-white" }, res.customer_name), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-slate-400" }, res.customer_phone)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4" }, res.truck_number ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 font-bold text-emerald-400" }, /* @__PURE__ */ react_shim_default.createElement(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-400" }), res.truck_number) : /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-amber-400 font-semibold italic" }, "Unallocated")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-medium text-slate-300" }, res.origin, " \u2192 ", res.destination), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-slate-400" }, new Date(res.loading_datetime).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-extrabold text-white" }, "\u20B9", (res.final_agreed_freight || res.indicative_freight || 0).toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: res.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : res.status === "Pending" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30" }, res.status)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right" }, res.status === "Pending" || !res.truck_number ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      onClick: () => {
        setSelectedForApproval(res);
        setAllocTruckNumber(res.truck_number || "");
        setAgreedFreight(res.final_agreed_freight || res.indicative_freight || 28e3);
      },
      className: "bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2.5 font-bold"
    },
    "Allocate"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      variant: "outline",
      onClick: () => setSelectedForRejection(res),
      className: "border-rose-900/60 text-rose-400 hover:bg-rose-950 text-[11px] h-7 px-2"
    },
    "Reject"
  )) : /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      variant: "ghost",
      onClick: () => toast.info(`Printing voucher for ${res.booking_number}`),
      className: "text-slate-400 hover:text-white text-[11px] h-7 px-2"
    },
    /* @__PURE__ */ react_shim_default.createElement(Printer, { className: "w-3.5 h-3.5 mr-1" }),
    " Slip"
  )))))))), selectedForApproval && /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: !!selectedForApproval, onOpenChange: () => setSelectedForApproval(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-bold flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(CircleCheck, { className: "w-5 h-5 text-emerald-400" }), "Allocate Truck to Booking ", selectedForApproval.booking_number)), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleApprove, className: "space-y-3 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Select Fleet Vehicle to Allocate & Lock *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: allocTruckNumber,
      onChange: (e2) => setAllocTruckNumber(e2.target.value),
      className: "w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold text-xs",
      required: true
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "" }, "-- Choose Active Truck from Fleet --"),
    fleetTrucks.map((t2) => /* @__PURE__ */ react_shim_default.createElement("option", { key: t2.id, value: t2.truck_number }, t2.truck_number, " (", t2.vehicle_class || t2.truck_size || "32FT SXL", ") - ", t2.driver_name || "Driver Available"))
  ), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-amber-400/90 mt-1 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-3.5 h-3.5" }), "Allocating will immediately mark this truck's schedule as BUSY for the requested dates.")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Final Agreed Freight (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: agreedFreight,
      onChange: (e2) => setAgreedFreight(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-white text-xs font-bold font-mono text-emerald-400",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setSelectedForApproval(null), className: "border-slate-800" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", size: "sm", className: "bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-3.5 h-3.5" }), "Approve & Lock Schedule"))))), selectedForRejection && /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: !!selectedForRejection, onOpenChange: () => setSelectedForRejection(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-bold flex items-center gap-2 text-rose-400" }, /* @__PURE__ */ react_shim_default.createElement(CircleX, { className: "w-5 h-5" }), "Reject Booking Request ", selectedForRejection.booking_number)), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleReject, className: "space-y-3 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Documented Rejection Reason (Mandatory Audit)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. No available fleet within 100km deadhead for requested date",
      value: rejectReason,
      onChange: (e2) => setRejectReason(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setSelectedForRejection(null), className: "border-slate-800" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", size: "sm", className: "bg-rose-600 hover:bg-rose-500 text-white font-bold" }, "Confirm Rejection"))))));
}

// apps/web/src/pages/ReturnLoadPage.jsx
function ReturnLoadPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getReturnLoads();
      setOpportunities(res.opportunities || []);
    } catch (err) {
      toast.error("Failed to load return-load opportunities: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadOpportunities();
  }, []);
  const handleAssignBackhaul = (opp) => {
    toast.success(`Assigned return load for truck ${opp.truck_number}! Opening trip configuration...`);
  };
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-7xl mx-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }, "Module 8: Backhaul Revenue Maximizer"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(TrendingUp, { className: "w-3.5 h-3.5 text-emerald-400" }), "Empty-Running & Deadhead Kilometer Reduction")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(Repeat, { className: "w-7 h-7 text-emerald-400" }), "Return-Load Opportunity Engine"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm text-slate-400" }, "Automatically pairs trucks terminating in outer terminals with matching return loads heading back to base.")), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadOpportunities,
      className: "border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Scan Backhauls"
  )), loading ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-20 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-7 h-7 animate-spin mx-auto mb-3 text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm font-semibold" }, "Scanning return corridors, quotes, and contract backhauls...")) : opportunities.length === 0 ? /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900 border-slate-800 p-12 text-center shadow-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3" }, /* @__PURE__ */ react_shim_default.createElement(ShieldCheck, { className: "w-6 h-6" })), /* @__PURE__ */ react_shim_default.createElement("h3", { className: "text-base font-bold text-white mb-1" }, "Zero Empty Running Detected"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs text-slate-400 max-w-md mx-auto" }, "All active fleet units are currently scheduled on round-trip corridors or stationed at primary operating depots.")) : /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, opportunities.map((opp) => /* @__PURE__ */ react_shim_default.createElement(Card, { key: opp.id, className: "bg-slate-900 border-slate-800 p-5 shadow-2xl hover:border-emerald-500/40 transition-all space-y-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-start justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-black text-base text-white" }, opp.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-emerald-500/20 text-emerald-400 text-[10px] border-emerald-500/30" }, opp.opportunity_type)), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Finishing at: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-cyan-400" }, opp.current_terminal))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-right" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-400 font-semibold block" }, "Net Margin"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-lg font-extrabold text-emerald-400" }, "+\u20B9", opp.net_margin?.toLocaleString("en-IN")))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[10px]" }, "Return Route"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-white flex items-center gap-1.5" }, opp.origin, " ", /* @__PURE__ */ react_shim_default.createElement(ArrowRight, { className: "w-3.5 h-3.5 text-emerald-400" }), " ", opp.destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-right" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[10px]" }, "Deadhead Haulage"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-emerald-400" }, "~", opp.deadhead_km, " km"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-3 gap-2 text-center text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2 bg-slate-950 rounded border border-slate-850" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-400 block" }, "Gross Freight"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-extrabold text-white" }, "\u20B9", opp.indicative_revenue?.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2 bg-slate-950 rounded border border-slate-850" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-400 block" }, "Fuel & Toll"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-extrabold text-rose-400" }, "\u20B9", opp.estimated_operating_cost?.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2 bg-slate-950 rounded border border-slate-850" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-400 block" }, "Cargo Payload"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-extrabold text-slate-200" }, opp.cargo_weight, " MT"))), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: () => handleAssignBackhaul(opp),
      className: "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9"
    },
    "Assign Return Load & Lock Corridor"
  )))));
}

// apps/web/src/pages/DepartureBoardPage.jsx
var STATUS_THEME = {
  "DEPARTED": {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    label: "DEPARTED"
  },
  "BOARDING": {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse",
    dot: "bg-amber-400",
    text: "text-amber-400",
    label: "BOARDING / LOADING"
  },
  "GATE OPEN": {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    dot: "bg-cyan-400",
    text: "text-cyan-400",
    label: "GATE OPEN (BAY READY)"
  },
  "DELAYED": {
    badge: "bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse",
    dot: "bg-rose-400",
    text: "text-rose-400",
    label: "DELAYED"
  },
  "SCHEDULED": {
    badge: "bg-slate-800 text-slate-300 border-slate-700",
    dot: "bg-slate-400",
    text: "text-slate-300",
    label: "SCHEDULED"
  },
  "HELD": {
    badge: "bg-amber-600/20 text-amber-300 border-amber-600/40",
    dot: "bg-amber-500",
    text: "text-amber-300",
    label: "BUSY / HELD"
  }
};
function DepartureBoardPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e2) {
    try {
      currentUser = JSON.parse(localStorage.getItem("app_auth_user"));
    } catch (err) {
    }
  }
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(/* @__PURE__ */ new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [activeDeparture, setActiveDeparture] = useState(null);
  const [newBay, setNewBay] = useState("");
  const [newStatus, setNewStatus] = useState("");
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(/* @__PURE__ */ new Date()), 1e3);
    return () => clearInterval(timer);
  }, []);
  const loadDepartures = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getDepartures();
      setDepartures(res.departures || []);
    } catch (err) {
      toast.error("Failed to load departure board: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDepartures();
    const interval = setInterval(loadDepartures, 3e4);
    return () => clearInterval(interval);
  }, []);
  const handleUpdateBay = async (e2) => {
    e2.preventDefault();
    if (!activeDeparture) return;
    try {
      await reservationClient.updateDepartureBay({
        id: activeDeparture.id,
        dock_bay: newBay || activeDeparture.dock_bay,
        status: newStatus || activeDeparture.status
      });
      toast.success(`Departure for ${activeDeparture.truck_number} updated to ${newStatus || activeDeparture.status}!`);
      setActiveDeparture(null);
      loadDepartures();
    } catch (err) {
      toast.error(err.message || "Failed to update departure");
    }
  };
  const filtered = departures.filter((dep) => {
    const matchesSearch = (dep.truck_number || "").toLowerCase().includes(searchTerm.toLowerCase()) || (dep.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) || (dep.driver_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (dep.dock_bay || "").toLowerCase().includes(searchTerm.toLowerCase()) || (dep.lr_pod_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHub = selectedHub === "All" || dep.origin.toLowerCase().includes(selectedHub.toLowerCase());
    const matchesStatus = selectedStatus === "All" || dep.status === selectedStatus;
    return matchesSearch && matchesHub && matchesStatus;
  });
  const activeCount = departures.filter((d) => d.status !== "DEPARTED").length;
  const delayedCount = departures.filter((d) => d.status === "DELAYED").length;
  const boardingCount = departures.filter((d) => d.status === "BOARDING").length;
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: `p-4 md:p-6 space-y-5 font-sans transition-all ${isKioskMode ? "fixed inset-0 z-50 bg-slate-950 overflow-y-auto p-8" : "max-w-[1600px] mx-auto"}` }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900/95 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0" }, /* @__PURE__ */ react_shim_default.createElement(PlaneTakeoff, { className: "w-6 h-6" })), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30" }, "FIDS \xB7 CENTRAL DISPATCH TERMINAL"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1 font-mono" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-ping" }), "LIVE BOARD")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-xl md:text-2xl font-black text-white tracking-tight mt-0.5 font-mono" }, "TRUCK DEPARTURE BOARD"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono shadow-inner" }, /* @__PURE__ */ react_shim_default.createElement(Clock, { className: "w-4 h-4 text-emerald-400 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-lg md:text-xl font-black text-emerald-400 tracking-wider" }, currentTime.toLocaleTimeString("en-IN", { hour12: false })), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] font-bold text-slate-500 ml-1" }, "IST")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] text-slate-400 font-bold border-l border-slate-800 pl-2 hidden sm:inline" }, currentTime.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }))), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadDepartures,
      className: "border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-xl"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Refresh"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      onClick: () => setIsKioskMode(!isKioskMode),
      className: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-500/20"
    },
    isKioskMode ? /* @__PURE__ */ react_shim_default.createElement(react_shim_default.Fragment, null, /* @__PURE__ */ react_shim_default.createElement(Minimize2, { className: "w-3.5 h-3.5 mr-1.5" }), "Exit Kiosk Mode") : /* @__PURE__ */ react_shim_default.createElement(react_shim_default.Fragment, null, /* @__PURE__ */ react_shim_default.createElement(Maximize2, { className: "w-3.5 h-3.5 mr-1.5" }), "Fullscreen TV Kiosk")
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3" }, [
    { label: "Active Departure Bays", count: activeCount, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", dot: "bg-cyan-400" },
    { label: "Boarding / Loading", count: boardingCount, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
    { label: "SLA Delayed Trucks", count: delayedCount, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", dot: "bg-rose-400" },
    { label: "Total Scheduled Departures", count: departures.length, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" }
  ].map((kpi, idx) => /* @__PURE__ */ react_shim_default.createElement("div", { key: idx, className: `p-3 rounded-2xl border ${kpi.bg} flex items-center justify-between` }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-slate-400" }, kpi.label), /* @__PURE__ */ react_shim_default.createElement("p", { className: `text-2xl font-black ${kpi.color} font-mono mt-0.5` }, kpi.count)), /* @__PURE__ */ react_shim_default.createElement("div", { className: `w-3 h-3 rounded-full ${kpi.dot}` })))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2 flex-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "relative flex-1 min-w-[200px]" }, /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" }), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Filter by Truck # (TG12, TS08), City, Dock Bay, or LR...",
      value: searchTerm,
      onChange: (e2) => setSearchTerm(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl font-mono"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1" }, ["All", "Hyderabad", "Hubli", "Pune", "Bangalore"].map((hub) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: hub,
      onClick: () => setSelectedHub(hub),
      className: `px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedHub === hub ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`
    },
    hub
  )))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-xs text-slate-400 font-medium" }, "Showing ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400 font-mono" }, filtered.length), " of ", departures.length, " Departures")), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs font-mono" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900 text-slate-400 font-black text-[11px] tracking-wider uppercase border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "SCHED. TIME"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "TRUCK #"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "DESTINATION ROUTE"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "VEHICLE TYPE"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-center" }, "DOCK BAY"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "DRIVER PILOT"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "LR / CONSIGNMENT"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "CARGO / WT"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "DEPARTURE STATUS"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-850" }, loading ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: 9, className: "py-20 text-center text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-slate-300" }, "Syncing with warehouse telematics & dock bay sensors..."))) : filtered.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: 9, className: "py-20 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-slate-300" }, "No scheduled departures found"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-slate-500 mt-0.5" }, "Try clearing filter parameters."))) : filtered.map((dep, idx) => {
    const theme = STATUS_THEME[dep.status] || STATUS_THEME["SCHEDULED"];
    const schedTimeFormatted = dep.scheduled_departure ? new Date(dep.scheduled_departure).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "18:00";
    return /* @__PURE__ */ react_shim_default.createElement(
      "tr",
      {
        key: dep.id || idx,
        onClick: () => {
          setActiveDeparture(dep);
          setNewBay(dep.dock_bay);
          setNewStatus(dep.status);
        },
        className: "hover:bg-slate-900/60 transition-colors cursor-pointer group"
      },
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-black text-emerald-400 text-sm whitespace-nowrap" }, schedTimeFormatted),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-black text-white text-sm tracking-wider group-hover:text-emerald-400 transition-colors" }, dep.truck_number), /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-2 h-2 rounded-full ${theme.dot}` }))),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 text-white font-bold text-xs" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400" }, dep.origin), /* @__PURE__ */ react_shim_default.createElement(ArrowRight, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-emerald-300 font-extrabold" }, dep.destination)))),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold" }, dep.vehicle_category)),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-center whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-black text-xs" }, dep.dock_bay)),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 text-slate-300 font-bold" }, /* @__PURE__ */ react_shim_default.createElement(User, { className: "w-3 h-3 text-slate-500 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("span", null, dep.driver_name))),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-bold text-slate-400 whitespace-nowrap" }, dep.lr_pod_number),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-bold text-slate-300 whitespace-nowrap" }, dep.cargo_weight),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right whitespace-nowrap" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `px-3 py-1 rounded-lg border font-black text-xs ${theme.badge}` }, dep.status === "DELAYED" ? `DELAYED (+${dep.delay_minutes || 25}m)` : theme.label))
    );
  }))))), activeDeparture && /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: Boolean(activeDeparture), onOpenChange: () => setActiveDeparture(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-md rounded-2xl shadow-2xl font-sans" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-black text-white flex items-center justify-between font-mono" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Gate Control: ", activeDeparture.truck_number), /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" }, activeDeparture.trip_code))), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleUpdateBay, className: "space-y-4 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Destination Route:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, activeDeparture.origin, " \u2192 ", activeDeparture.destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Assigned Driver:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400" }, activeDeparture.driver_name)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "E-Way / LR #:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-slate-300 font-mono" }, activeDeparture.lr_pod_number))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Warehouse Dock Bay"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: newBay,
      onChange: (e2) => setNewBay(e2.target.value),
      className: "w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #01" }, "Bay #01 (Primary FTL Loading)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #02" }, "Bay #02 (Secondary FTL Loading)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #03" }, "Bay #03 (Heavy Container Bay)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #04" }, "Bay #04 (Express Cross-Dock)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #05" }, "Bay #05 (Unloading & Verification)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bay #06" }, "Bay #06 (Inspection Bay)")
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase" }, "Departure Gate Status"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: newStatus,
      onChange: (e2) => setNewStatus(e2.target.value),
      className: "w-full bg-slate-950 border border-slate-800 text-xs h-9 mt-1 px-3 rounded-xl text-white font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "GATE OPEN" }, "GATE OPEN (Dock ready, awaiting truck)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "BOARDING" }, "BOARDING / LOADING (Cargo loading in progress)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "DEPARTED" }, "DEPARTED (Truck left warehouse on highway)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "DELAYED" }, "DELAYED (SLA departure delayed)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "SCHEDULED" }, "SCHEDULED (Normal queue)")
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setActiveDeparture(null), className: "border-slate-800 rounded-xl text-xs" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs" }, "Save Dock Assignment"))))));
}

// apps/web/src/pages/RouteProfitPage.jsx
function RouteProfitPage() {
  let currentUser = null;
  try {
    const auth = useAuth();
    currentUser = auth?.currentUser;
  } catch (e2) {
    try {
      currentUser = JSON.parse(localStorage.getItem("app_auth_user"));
    } catch (err) {
    }
  }
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const loadRouteProfitability = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getRouteProfitRanking();
      setRoutes(res.routes || []);
    } catch (err) {
      toast.error("Failed to load route profitability: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadRouteProfitability();
  }, []);
  const filteredRoutes = routes.filter((r3) => {
    const matchesSearch = (r3.route_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFilter === "High Yield") return matchesSearch && r3.margin_pct >= 20;
    if (selectedFilter === "Standard") return matchesSearch && r3.margin_pct >= 12 && r3.margin_pct < 20;
    if (selectedFilter === "Underperforming") return matchesSearch && r3.margin_pct < 12;
    return matchesSearch;
  });
  const totalGrossRevenue = routes.reduce((sum, r3) => sum + (r3.total_revenue || 0), 0);
  const totalNetProfit = routes.reduce((sum, r3) => sum + (r3.net_profit || 0), 0);
  const overallMargin = totalGrossRevenue > 0 ? (totalNetProfit / totalGrossRevenue * 100).toFixed(1) : 0;
  const bestRoute = routes[0];
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900/95 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30" }, "MODULE 18: FINANCIAL LANE INTELLIGENCE"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-ping" }), "Audited P&L Math")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(TrendingUp, { className: "w-7 h-7 text-emerald-400" }), "Route Net Profitability & Lane Ranking"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "Ranks every freight corridor by actual net profit, fuel slips, Fastag tolls, and driver bhatta. Identifies high-yield vs. deadhead drag lanes.")), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadRouteProfitability,
      className: "border-slate-800 bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-10 rounded-xl"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: `w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}` }),
    "Recalculate P&L"
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3.5 rounded-2xl border bg-slate-900 border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-slate-400" }, "Total Corridor Revenue"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-2xl font-black text-white font-mono mt-0.5" }, "\u20B9", totalGrossRevenue.toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[10px] text-slate-500 mt-1" }, "Across ", routes.length, " active lanes")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3.5 rounded-2xl border bg-emerald-500/10 border-emerald-500/20" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-emerald-400" }, "Total Net Operating Profit"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-2xl font-black text-emerald-300 font-mono mt-0.5" }, "\u20B9", totalNetProfit.toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[10px] text-emerald-400/70 mt-1" }, "Net after fuel, tolls & bhatta")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3.5 rounded-2xl border bg-cyan-500/10 border-cyan-500/20" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-cyan-400" }, "Average Fleet Margin"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-2xl font-black text-cyan-300 font-mono mt-0.5" }, overallMargin, "%"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[10px] text-cyan-400/70 mt-1" }, "Target benchmark: >18%")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3.5 rounded-2xl border bg-purple-500/10 border-purple-500/20" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-bold text-purple-400" }, "#1 Top Ranked Corridor"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-base font-black text-purple-200 truncate mt-0.5" }, bestRoute ? bestRoute.route_name : "Hyderabad to Hubli"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[10px] text-purple-300 mt-1" }, bestRoute ? `${bestRoute.margin_pct}% Margin (\u20B9${bestRoute.profit_per_km}/km)` : "Evaluating..."))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2 flex-1" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "relative flex-1 min-w-[220px]" }, /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" }), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Search route (e.g. Hyderabad, Hubli, Pune, Bangalore)...",
      value: searchTerm,
      onChange: (e2) => setSearchTerm(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-xs h-9 pl-9 text-white placeholder:text-slate-500 rounded-xl"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1" }, ["All", "High Yield", "Standard", "Underperforming"].map((filter) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: filter,
      onClick: () => setSelectedFilter(filter),
      className: `px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedFilter === filter ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`
    },
    filter
  )))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-xs text-slate-400 font-medium" }, "Showing ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400 font-mono" }, filteredRoutes.length), " Corridors")), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs font-sans" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900 text-slate-400 font-bold text-[11px] uppercase tracking-wider border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "RANK"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "FREIGHT CORRIDOR"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4" }, "TOTAL TRIPS"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "GROSS FREIGHT"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "DIESEL COST"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "TOLLS & FASTAG"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "DRIVER BHATTA"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "ACTUAL NET PROFIT"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-center" }, "MARGIN %"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "py-3 px-4 text-right" }, "PROFIT / KM"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-850" }, loading ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: 10, className: "py-20 text-center text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-8 h-8 animate-spin text-emerald-400 mx-auto mb-2" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-slate-300" }, "Auditing diesel invoices & Fastag plaza charges..."))) : filteredRoutes.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: 10, className: "py-20 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-slate-300" }, "No route financial data matching filters."))) : filteredRoutes.map((route, idx) => {
    const isHighYield = route.margin_pct >= 20;
    const isUnderperforming = route.margin_pct < 12;
    return /* @__PURE__ */ react_shim_default.createElement(
      "tr",
      {
        key: route.route_name || idx,
        onClick: () => setSelectedRoute(route),
        className: "hover:bg-slate-900/60 transition-colors cursor-pointer group"
      },
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-black" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-black ${idx === 0 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : idx === 1 ? "bg-slate-400/20 text-slate-200 border border-slate-500/40" : idx === 2 ? "bg-orange-700/20 text-orange-400 border border-orange-700/40" : "bg-slate-900 text-slate-400"}` }, "#", idx + 1)),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-emerald-400 transition-colors" }, /* @__PURE__ */ react_shim_default.createElement("span", null, route.route_name), idx === 0 && /* @__PURE__ */ react_shim_default.createElement(Award, { className: "w-3.5 h-3.5 text-amber-400 shrink-0" }))),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 font-mono font-bold text-slate-300" }, route.total_trips, " Trips"),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono font-bold text-slate-200" }, "\u20B9", route.total_revenue.toLocaleString("en-IN")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono text-slate-400" }, "\u20B9", route.fuel_cost.toLocaleString("en-IN")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono text-slate-400" }, "\u20B9", route.toll_cost.toLocaleString("en-IN")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono text-slate-400" }, "\u20B9", route.driver_bhatta.toLocaleString("en-IN")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono font-black text-sm text-emerald-400" }, "\u20B9", route.net_profit.toLocaleString("en-IN")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-center" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${isHighYield ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : isUnderperforming ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"}` }, route.margin_pct, "%")),
      /* @__PURE__ */ react_shim_default.createElement("td", { className: "py-3.5 px-4 text-right font-mono font-bold text-emerald-300" }, "\u20B9", route.profit_per_km, "/km")
    );
  }))))), selectedRoute && /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: Boolean(selectedRoute), onOpenChange: () => setSelectedRoute(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-900 border-slate-800 text-white max-w-lg rounded-2xl shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "text-lg font-black text-white flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Lane Financial Breakdown: ", selectedRoute.route_name), /* @__PURE__ */ react_shim_default.createElement("span", { className: `px-2 py-0.5 rounded text-xs font-mono font-bold ${selectedRoute.margin_pct >= 20 ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"}` }, selectedRoute.margin_pct, "% Margin"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-3.5 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Total Route Revenue"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-white font-extrabold text-base font-mono" }, "\u20B9", selectedRoute.total_revenue.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 font-bold block text-[10px] uppercase" }, "Net Operating Profit"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-emerald-400 font-extrabold text-base font-mono" }, "\u20B9", selectedRoute.net_profit.toLocaleString("en-IN")))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold text-slate-300 text-[11px] uppercase tracking-wide" }, "Expense Deductions Breakdown"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Diesel Fuel Allocation:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white font-mono" }, "\u20B9", selectedRoute.fuel_cost.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Fastag / Toll Charges:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white font-mono" }, "\u20B9", selectedRoute.toll_cost.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex justify-between text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Driver Advance & Bhatta:"), /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white font-mono" }, "\u20B9", selectedRoute.driver_bhatta.toLocaleString("en-IN"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "pt-2 border-t border-slate-800 flex justify-between font-bold text-emerald-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Operating Yield per Km:"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-mono" }, "\u20B9", selectedRoute.profit_per_km, " / km"))), selectedRoute.margin_pct < 12 && /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-rose-950/30 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-rose-300 text-xs" }, /* @__PURE__ */ react_shim_default.createElement(TriangleAlert, { className: "w-4 h-4 text-rose-400 shrink-0 mt-0.5" }), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-bold" }, "Tariff Optimization Recommended"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-slate-400 mt-0.5" }, "This corridor is operating below target margin (18%). Consider increasing base freight quotation by 8\u201310% or bundling with guaranteed return-load contracts."))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { onClick: () => setSelectedRoute(null), className: "bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs" }, "Close Breakdown"))))));
}

// apps/web/src/pages/SubscriptionsPage.jsx
function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [subForm, setSubForm] = useState({
    company_name: "",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    vehicle_category: "32FT SXL",
    primary_operating_corridor: "Hyderabad to Hubli Corridor",
    start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1e3).toISOString().slice(0, 10),
    monthly_retainer_fee: 145e3,
    included_km_or_trips: 4500,
    overage_rate_per_km: 28,
    billing_cycle: "Monthly Advance",
    special_sla_notes: "Dedicated 24/7 round-the-clock driver availability, zero co-loading"
  });
  const [assignForm, setAssignForm] = useState({
    truck_number: "",
    monthly_rate: 145e3
  });
  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, fleetTrucks] = await Promise.all([
        reservationClient.getSubscriptions(),
        pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => [])
      ]);
      setSubscriptions(subsRes.subscriptions || []);
      setTrucks(fleetTrucks);
    } catch (err) {
      toast.error("Failed to load subscriptions: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleCreateRequest = async (e2) => {
    e2.preventDefault();
    if (!subForm.company_name || !subForm.customer_name || !subForm.customer_phone) {
      toast.warning("Company name, customer name, and phone are required.");
      return;
    }
    try {
      await reservationClient.createSubscription(subForm);
      toast.success("Dedicated Vehicle Subscription request submitted! Awaiting dispatch allocation.");
      setIsRequestModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to submit subscription request");
    }
  };
  const handleAssignTruck = async (e2) => {
    e2.preventDefault();
    if (!assignForm.truck_number) {
      toast.warning("Please select a truck to allocate.");
      return;
    }
    try {
      await reservationClient.assignTruckToSubscription({
        id: selectedSub.id,
        truck_number: assignForm.truck_number,
        monthly_rate: assignForm.monthly_rate
      });
      toast.success(`Truck ${assignForm.truck_number} allocated to ${selectedSub.company_name}! Schedule locked.`);
      setIsAssignModalOpen(false);
      setSelectedSub(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Truck allocation failed");
    }
  };
  const totalRetainerRevenue = subscriptions.filter((s2) => s2.status === "Active").reduce((sum, s2) => sum + (parseFloat(s2.monthly_retainer_fee) || 0), 0);
  const activeCount = subscriptions.filter((s2) => s2.status === "Active").length;
  const pendingCount = subscriptions.filter((s2) => s2.status === "Pending Dispatch Review").length;
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/25" }, "Module 12: Enterprise Fleet Retainers"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1.5 font-medium" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-purple-400 animate-ping" }), "Dedicated Vehicle Subscriptions")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(ShieldCheck, { className: "w-7 h-7 text-purple-400" }), "Dedicated Vehicle Subscriptions"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "Reserve dedicated trucks for an entire month at an agreed retainer rate. Dynamic truck assignment locks the vehicle schedule as busy.")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: loadData,
      variant: "outline",
      className: "border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 gap-1.5 text-xs font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-3.5 h-3.5" }),
    "Refresh"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: () => setIsRequestModalOpen(true),
      className: "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold gap-2 text-xs shadow-lg shadow-purple-500/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-4 h-4" }),
    "New Dedicated Retainer Request"
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Active Retainers"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, activeCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-emerald-400 font-bold" }, "Trucks Dedicated"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Pending Review"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Clock, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-amber-400" }, pendingCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Awaiting Vehicle Allocation"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Monthly Retainer Inflow"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(DollarSign, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, "\u20B9", totalRetainerRevenue.toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-purple-400 font-bold" }, "Guaranteed/Mo"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Fleet Utilization"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-blue-400" }, trucks.length > 0 ? Math.round(activeCount / trucks.length * 100) : 0, "%"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "On Contract Locked")))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Building, { className: "w-4 h-4 text-purple-400" }), /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-sm font-extrabold text-white" }, "Active & Requested Subscriptions")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Showing ", subscriptions.length, " Contract Agreements")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Contract Code"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Company & Client"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Corridor / Spec"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Contract Term"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Monthly Retainer"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Assigned Truck"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Status"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5 text-right" }, "Actions"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-800/60 font-medium text-slate-300" }, subscriptions.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: "8", className: "p-8 text-center text-slate-500" }, 'No active or pending subscriptions found. Click "New Dedicated Retainer Request" to register one.')) : subscriptions.map((sub) => {
    const isActive = sub.status === "Active";
    const isPending = sub.status === "Pending Dispatch Review";
    return /* @__PURE__ */ react_shim_default.createElement("tr", { key: sub.id, className: "hover:bg-slate-900/40 transition-colors" }, /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 font-mono font-bold text-purple-400" }, sub.subscription_code), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-extrabold text-white" }, sub.company_name), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400 flex items-center gap-2 mt-0.5" }, /* @__PURE__ */ react_shim_default.createElement("span", null, sub.customer_name), /* @__PURE__ */ react_shim_default.createElement("span", null, "\u2022"), /* @__PURE__ */ react_shim_default.createElement("span", null, sub.customer_phone))), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-white font-bold" }, sub.primary_operating_corridor || "All-India Logistics"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, sub.vehicle_category)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-white font-bold" }, sub.start_date), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, "to ", sub.end_date)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-emerald-400 font-black text-sm" }, "\u20B9", parseFloat(sub.monthly_retainer_fee || 0).toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[10px] text-slate-500" }, sub.billing_cycle || "Monthly Advance")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, sub.assigned_truck_number ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-mono font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800" }, sub.assigned_truck_number)) : /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-amber-400 text-xs italic" }, "Unassigned")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: `text-[10px] font-black ${isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : isPending ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400"}` }, sub.status)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 text-right" }, isPending && /* @__PURE__ */ react_shim_default.createElement(
      Button,
      {
        onClick: () => {
          setSelectedSub(sub);
          setAssignForm({
            truck_number: "",
            monthly_rate: sub.monthly_retainer_fee || 145e3
          });
          setIsAssignModalOpen(true);
        },
        className: "bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-1 px-2.5 h-auto rounded-lg shadow-sm"
      },
      "Assign Truck & Lock"
    ), isActive && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-500 font-medium" }, "Locked in Schedule")));
  }))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isRequestModalOpen, onOpenChange: setIsRequestModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(ShieldCheck, { className: "w-5 h-5 text-purple-400" }), "New Dedicated Vehicle Retainer Request")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleCreateRequest, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Company / Shipper Name *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. UltraTech Cement / DHL Supply Chain",
      value: subForm.company_name,
      onChange: (e2) => setSubForm({ ...subForm, company_name: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Primary Contact Person *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Rajesh Sharma",
      value: subForm.customer_name,
      onChange: (e2) => setSubForm({ ...subForm, customer_name: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Phone Number *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "+91 98765 43210",
      value: subForm.customer_phone,
      onChange: (e2) => setSubForm({ ...subForm, customer_phone: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Email"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "email",
      placeholder: "logistics@company.com",
      value: subForm.customer_email,
      onChange: (e2) => setSubForm({ ...subForm, customer_email: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Vehicle Category"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: subForm.vehicle_category,
      onChange: (e2) => setSubForm({ ...subForm, vehicle_category: e2.target.value }),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT SXL" }, "32FT Single Axle (14.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT MXL" }, "32FT Multi Axle (18.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "24FT Container" }, "24FT Container (8.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "40FT High Cube" }, "40FT High Cube Container")
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Operating Corridor"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. Hyderabad to Hubli Dedicated Lane",
      value: subForm.primary_operating_corridor,
      onChange: (e2) => setSubForm({ ...subForm, primary_operating_corridor: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Start Date"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "date",
      value: subForm.start_date,
      onChange: (e2) => setSubForm({ ...subForm, start_date: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "End Date"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "date",
      value: subForm.end_date,
      onChange: (e2) => setSubForm({ ...subForm, end_date: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Monthly Agreed Retainer (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: subForm.monthly_retainer_fee,
      onChange: (e2) => setSubForm({ ...subForm, monthly_retainer_fee: parseFloat(e2.target.value) || 0 }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Billing Cycle"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: subForm.billing_cycle,
      onChange: (e2) => setSubForm({ ...subForm, billing_cycle: e2.target.value }),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Monthly Advance" }, "Monthly Advance"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Bi-Weekly" }, "Bi-Weekly"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Per Trip Drawdown" }, "Per Trip Drawdown")
  ))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsRequestModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-purple-600 hover:bg-purple-700 text-white font-bold" }, "Submit Retainer Request"))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isAssignModalOpen, onOpenChange: setIsAssignModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-5 h-5 text-purple-400" }), "Assign Fleet Truck & Lock Schedule")), selectedSub && /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleAssignTruck, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-bold text-white text-sm" }, selectedSub.company_name), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-400 text-xs mt-0.5" }, "Term: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, selectedSub.start_date), " to ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, selectedSub.end_date)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-400 text-xs" }, "Required: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-purple-400" }, selectedSub.vehicle_category))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Select Fleet Vehicle to Dedicate *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      required: true,
      value: assignForm.truck_number,
      onChange: (e2) => setAssignForm({ ...assignForm, truck_number: e2.target.value }),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "" }, "-- Choose Truck from Active Fleet --"),
    trucks.map((t2) => /* @__PURE__ */ react_shim_default.createElement("option", { key: t2.id, value: t2.truck_number }, t2.truck_number, " (", t2.vehicle_class || t2.truck_size || "32FT SXL", ") - ", t2.driver_name || "Driver Available"))
  ), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-amber-400/90 mt-1 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(CircleAlert, { className: "w-3.5 h-3.5" }), "Assigning will immediately lock this truck's schedule as BUSY for the full period.")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Final Agreed Monthly Retainer (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: assignForm.monthly_rate,
      onChange: (e2) => setAssignForm({ ...assignForm, monthly_rate: parseFloat(e2.target.value) || 0 }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsAssignModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold" }, "Confirm & Lock Truck"))))));
}

// apps/web/src/pages/RecurringBookingsPage.jsx
var DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function RecurringBookingsPage() {
  const [recurringList, setRecurringList] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [recForm, setRecForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    origin: "Hyderabad Hub",
    destination: "Hubli Terminal",
    vehicle_category: "32FT SXL",
    recurring_days: ["Monday", "Wednesday", "Friday"],
    preferred_time: "18:00",
    start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 60 * 24 * 3600 * 1e3).toISOString().slice(0, 10),
    rate_per_trip: 27500,
    special_instructions: "Fixed schedule departure, priority dock clearance"
  });
  const [allocTruck, setAllocTruck] = useState("");
  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, fleetTrucks] = await Promise.all([
        reservationClient.getRecurringBookings(),
        pocketbaseClient_default.collection("trucks").getFullList({ sort: "truck_number", $autoCancel: false }).catch(() => [])
      ]);
      setRecurringList(recRes.recurring || []);
      setTrucks(fleetTrucks);
    } catch (err) {
      toast.error("Failed to load recurring bookings: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const toggleDay = (day) => {
    const cur = [...recForm.recurring_days];
    const idx = cur.indexOf(day);
    if (idx >= 0) {
      if (cur.length === 1) {
        toast.warning("At least one day must be selected.");
        return;
      }
      cur.splice(idx, 1);
    } else {
      cur.push(day);
    }
    setRecForm({ ...recForm, recurring_days: cur });
  };
  const handleCreateRecurring = async (e2) => {
    e2.preventDefault();
    if (!recForm.customer_name || !recForm.customer_phone) {
      toast.warning("Client name and phone are required.");
      return;
    }
    try {
      await reservationClient.createRecurringBooking(recForm);
      toast.success("Recurring booking schedule recorded! Awaiting truck assignment.");
      setIsNewModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to submit recurring booking");
    }
  };
  const handleAssignTruck = async (e2) => {
    e2.preventDefault();
    if (!allocTruck) {
      toast.warning("Please select a truck to dedicate to this schedule.");
      return;
    }
    try {
      await reservationClient.assignTruckToRecurring({
        id: selectedRec.id,
        truck_number: allocTruck
      });
      toast.success(`Truck ${allocTruck} linked to recurring schedule! Matching days locked.`);
      setIsAssignModalOpen(false);
      setSelectedRec(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Truck assignment failed");
    }
  };
  const activeCount = recurringList.filter((r3) => r3.status === "Active").length;
  const pendingCount = recurringList.filter((r3) => r3.status === "Pending Dispatch Review").length;
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/25" }, "Module 11: Repeat Route Scheduling"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1.5 font-medium" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-teal-400 animate-ping" }), "Automated Recurring Dispatches")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(Repeat, { className: "w-7 h-7 text-teal-400" }), "Recurring Truck Booking"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "Schedule recurring dispatches (e.g. Every Mon, Wed & Fri). Dynamic truck assignment locks recurring slots across the fleet schedule.")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: loadData,
      variant: "outline",
      className: "border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 gap-1.5 text-xs font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-3.5 h-3.5" }),
    "Refresh"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: () => setIsNewModalOpen(true),
      className: "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 font-black gap-2 text-xs shadow-lg shadow-teal-500/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-4 h-4" }),
    "New Recurring Schedule"
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Active Recurring Schedules"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Repeat, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, activeCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-teal-400 font-bold" }, "Lanes Running"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Pending Truck Assignment"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Clock, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-amber-400" }, pendingCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Needs Dispatch Lock"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Weekly Dispatches Generated"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, recurringList.reduce((sum, r3) => sum + ((r3.recurring_days || []).length || 0), 0)), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-emerald-400 font-bold" }, "Trips / Week")))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Calendar, { className: "w-4 h-4 text-teal-400" }), /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-sm font-extrabold text-white" }, "Active Recurring Schedules & Allocations")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Showing ", recurringList.length, " Scheduled Patterns")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Recurrence Code"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Customer & Contact"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Route"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Frequency Days"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Preferred Time"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Rate / Trip"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Assigned Vehicle"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Status"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5 text-right" }, "Actions"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-800/60 font-medium text-slate-300" }, recurringList.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: "9", className: "p-8 text-center text-slate-500" }, 'No recurring booking schedules registered. Click "New Recurring Schedule" to configure recurring truck movements.')) : recurringList.map((rec) => {
    const isActive = rec.status === "Active";
    const isPending = rec.status === "Pending Dispatch Review";
    const days = Array.isArray(rec.recurring_days) ? rec.recurring_days : [];
    return /* @__PURE__ */ react_shim_default.createElement("tr", { key: rec.id, className: "hover:bg-slate-900/40 transition-colors" }, /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 font-mono font-bold text-teal-400" }, rec.recurrence_code), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-extrabold text-white" }, rec.customer_name), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, rec.customer_phone)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-white font-bold" }, rec.origin, " \u2192 ", rec.destination), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, rec.vehicle_category)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap gap-1" }, days.map((d) => /* @__PURE__ */ react_shim_default.createElement("span", { key: d, className: "px-1.5 py-0.5 rounded text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold" }, d.slice(0, 3))))), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-mono text-white font-bold" }, rec.preferred_time || "18:00")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 font-mono font-bold text-emerald-400 text-sm" }, "\u20B9", parseFloat(rec.rate_per_trip || 0).toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, rec.assigned_truck_number ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-mono font-extrabold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800" }, rec.assigned_truck_number)) : /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-amber-400 text-xs italic" }, "Unassigned")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: `text-[10px] font-black ${isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : isPending ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-slate-800 text-slate-400"}` }, rec.status)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 text-right" }, isPending && /* @__PURE__ */ react_shim_default.createElement(
      Button,
      {
        onClick: () => {
          setSelectedRec(rec);
          setAllocTruck("");
          setIsAssignModalOpen(true);
        },
        className: "bg-teal-600 hover:bg-teal-700 text-slate-950 font-black text-xs py-1 px-2.5 h-auto rounded-lg shadow-sm"
      },
      "Assign Truck & Lock"
    ), isActive && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-500 font-medium" }, "Locked in Calendar")));
  }))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isNewModalOpen, onOpenChange: setIsNewModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(Repeat, { className: "w-5 h-5 text-teal-400" }), "Configure Recurring Truck Schedule")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleCreateRecurring, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Customer / Company Name *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Reliance Retail Logistics",
      value: recForm.customer_name,
      onChange: (e2) => setRecForm({ ...recForm, customer_name: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Phone Number *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "+91 98765 43210",
      value: recForm.customer_phone,
      onChange: (e2) => setRecForm({ ...recForm, customer_phone: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Loading Origin *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Hyderabad Hub",
      value: recForm.origin,
      onChange: (e2) => setRecForm({ ...recForm, origin: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Destination Terminal *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Hubli Terminal",
      value: recForm.destination,
      onChange: (e2) => setRecForm({ ...recForm, destination: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1.5 font-bold" }, "Recurring Days of Week *"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap gap-2" }, DAYS_OF_WEEK.map((day) => {
    const isSelected = recForm.recurring_days.includes(day);
    return /* @__PURE__ */ react_shim_default.createElement(
      "button",
      {
        type: "button",
        key: day,
        onClick: () => toggleDay(day),
        className: `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? "bg-teal-500 text-slate-950 shadow-md font-black" : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"}`
      },
      day
    );
  }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Preferred Departure Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "time",
      value: recForm.preferred_time,
      onChange: (e2) => setRecForm({ ...recForm, preferred_time: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Agreed Rate per Trip (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: recForm.rate_per_trip,
      onChange: (e2) => setRecForm({ ...recForm, rate_per_trip: parseFloat(e2.target.value) || 0 }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Start Date"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "date",
      value: recForm.start_date,
      onChange: (e2) => setRecForm({ ...recForm, start_date: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "End Date"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "date",
      value: recForm.end_date,
      onChange: (e2) => setRecForm({ ...recForm, end_date: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsNewModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-teal-500 hover:bg-teal-600 text-slate-950 font-black" }, "Save Recurring Schedule"))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isAssignModalOpen, onOpenChange: setIsAssignModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(Lock, { className: "w-5 h-5 text-teal-400" }), "Link Fleet Truck to Recurring Schedule")), selectedRec && /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleAssignTruck, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-bold text-white text-sm" }, selectedRec.customer_name), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-400 text-xs mt-0.5" }, "Lane: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, selectedRec.origin, " \u2192 ", selectedRec.destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-teal-400 text-xs font-bold mt-1" }, "Days: ", (selectedRec.recurring_days || []).join(", "), " @ ", selectedRec.preferred_time || "18:00")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Select Truck to Dedicate *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      required: true,
      value: allocTruck,
      onChange: (e2) => setAllocTruck(e2.target.value),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "" }, "-- Choose Truck from Active Fleet --"),
    trucks.map((t2) => /* @__PURE__ */ react_shim_default.createElement("option", { key: t2.id, value: t2.truck_number }, t2.truck_number, " (", t2.vehicle_class || t2.truck_size || "32FT SXL", ")"))
  ), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] text-amber-400/90 mt-1 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(CircleAlert, { className: "w-3.5 h-3.5" }), "This vehicle's schedule will be marked as BUSY for all matching days in the calendar.")), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsAssignModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-teal-500 hover:bg-teal-600 text-slate-950 font-black" }, "Confirm & Lock Schedule"))))));
}

// apps/web/src/pages/PartnerOwnerPortal.jsx
function PartnerOwnerPortal() {
  const [partnerTrucks, setPartnerTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [regForm, setRegForm] = useState({
    owner_name: "",
    owner_phone: "",
    owner_email: "",
    owner_pan: "",
    bank_account_number: "",
    bank_ifsc: "",
    truck_number: "",
    truck_type: "32FT SXL",
    capacity_tons: 14.5,
    rc_number: "",
    fitness_expiry: new Date(Date.now() + 180 * 24 * 3600 * 1e3).toISOString().slice(0, 10),
    insurance_expiry: new Date(Date.now() + 240 * 24 * 3600 * 1e3).toISOString().slice(0, 10),
    declared_empty_location: "Hyderabad Hub",
    agreed_payout_rate: 32
  });
  const [availForm, setAvailForm] = useState({
    current_availability: "Available for Trips",
    declared_empty_location: "Hyderabad Hub",
    available_from_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    preferred_return_destination: "Hubli"
  });
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await reservationClient.getPartnerTrucks();
      setPartnerTrucks(res.trucks || []);
    } catch (err) {
      toast.error("Failed to load partner trucks: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleRegister = async (e2) => {
    e2.preventDefault();
    if (!regForm.owner_name || !regForm.owner_phone || !regForm.truck_number) {
      toast.warning("Owner name, phone, and truck number are mandatory.");
      return;
    }
    try {
      await reservationClient.registerPartnerTruck(regForm);
      toast.success(`Attached truck ${regForm.truck_number} registered! Dispatch verification pending.`);
      setIsRegisterModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }
  };
  const handleUpdateAvailability = async (e2) => {
    e2.preventDefault();
    try {
      await reservationClient.declarePartnerAvailability({
        id: selectedTruck.id,
        ...availForm
      });
      toast.success(`Availability declared for ${selectedTruck.truck_number}!`);
      setIsAvailModalOpen(false);
      setSelectedTruck(null);
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to declare availability");
    }
  };
  const handleVerifyTruck = async (id, status) => {
    try {
      await reservationClient.verifyPartnerTruck({
        id,
        verification_status: status
      });
      toast.success(`Truck marked as ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.message || "Verification update failed");
    }
  };
  const verifiedCount = partnerTrucks.filter((t2) => t2.verification_status === "Verified Active").length;
  const availableCount = partnerTrucks.filter((t2) => t2.current_availability === "Available for Trips").length;
  const totalPayout = partnerTrucks.reduce((sum, t2) => sum + (parseFloat(t2.total_net_payout) || 0), 0);
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-[1500px] mx-auto font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25" }, "Marketplace Fleet Network"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 flex items-center gap-1.5 font-medium" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "w-2 h-2 rounded-full bg-amber-400 animate-ping" }), "Attached Truck Owner Portal")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-7 h-7 text-amber-400" }), "Attached Truck Owner Portal"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs md:text-sm text-slate-400" }, "External truck owners can onboard vehicles, declare empty location & availability, receive direct trip offers, and track settlement earnings.")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: loadData,
      variant: "outline",
      className: "border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 gap-1.5 text-xs font-bold"
    },
    /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-3.5 h-3.5" }),
    "Refresh"
  ), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      onClick: () => setIsRegisterModalOpen(true),
      className: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black gap-2 text-xs shadow-lg shadow-amber-500/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(Plus, { className: "w-4 h-4" }),
    "Register Attached Vehicle"
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4" }, /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Registered Partner Fleet"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, partnerTrucks.length), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-amber-400 font-bold" }, "Total Trucks"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Verified Active"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(ShieldCheck, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-emerald-400" }, verifiedCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Compliance Approved"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Declared Ready for Load"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-blue-400" }, availableCount), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Available Now"))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900/60 border-slate-800/80 p-4 rounded-xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Total Disbursed Payouts"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center" }, /* @__PURE__ */ react_shim_default.createElement(DollarSign, { className: "w-4 h-4" }))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "mt-2 flex items-baseline gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-2xl font-black text-white" }, "\u20B9", totalPayout.toLocaleString("en-IN")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-emerald-400 font-bold" }, "Ledger Cleared")))), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4 text-amber-400" }), /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-sm font-extrabold text-white" }, "Attached Fleet Register & Live Availability")), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 font-medium" }, "Showing ", partnerTrucks.length, " Vehicles")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ react_shim_default.createElement("thead", { className: "bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Truck Reg No"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Owner & Contact"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Category & Capacity"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Current Location & Preference"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Live Status"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Verification"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5" }, "Payout Rate"), /* @__PURE__ */ react_shim_default.createElement("th", { className: "p-3.5 text-right" }, "Actions"))), /* @__PURE__ */ react_shim_default.createElement("tbody", { className: "divide-y divide-slate-800/60 font-medium text-slate-300" }, partnerTrucks.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("tr", null, /* @__PURE__ */ react_shim_default.createElement("td", { colSpan: "8", className: "p-8 text-center text-slate-500" }, 'No attached partner trucks registered yet. Click "Register Attached Vehicle" to onboard an external fleet truck.')) : partnerTrucks.map((truck) => {
    const isVerified = truck.verification_status === "Verified Active";
    const isAvailable = truck.current_availability === "Available for Trips";
    return /* @__PURE__ */ react_shim_default.createElement("tr", { key: truck.id, className: "hover:bg-slate-900/40 transition-colors" }, /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 font-mono font-extrabold text-white" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-slate-500"}` }), /* @__PURE__ */ react_shim_default.createElement("span", { className: "bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300" }, truck.truck_number))), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-extrabold text-white" }, truck.owner_name), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, truck.owner_phone)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-white font-bold" }, truck.truck_type), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[11px] text-slate-400" }, truck.capacity_tons, " MT payload")), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-white font-bold flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3 h-3 text-amber-400" }), /* @__PURE__ */ react_shim_default.createElement("span", null, truck.declared_empty_location || "Not declared")), truck.preferred_return_destination && /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-[10px] text-slate-400 mt-0.5" }, "Heading to: ", truck.preferred_return_destination)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: `text-[10px] font-black ${isAvailable ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400"}` }, truck.current_availability)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: `text-[10px] font-black ${isVerified ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}` }, truck.verification_status)), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 font-mono font-bold text-white" }, "\u20B9", truck.agreed_payout_rate || 32, "/km"), /* @__PURE__ */ react_shim_default.createElement("td", { className: "p-3.5 text-right space-x-2" }, /* @__PURE__ */ react_shim_default.createElement(
      Button,
      {
        onClick: () => {
          setSelectedTruck(truck);
          setAvailForm({
            current_availability: truck.current_availability || "Available for Trips",
            declared_empty_location: truck.declared_empty_location || "",
            available_from_date: truck.available_from_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
            preferred_return_destination: truck.preferred_return_destination || ""
          });
          setIsAvailModalOpen(true);
        },
        variant: "outline",
        className: "border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs py-1 px-2 h-auto"
      },
      "Declare Avail"
    ), !isVerified && /* @__PURE__ */ react_shim_default.createElement(
      Button,
      {
        onClick: () => handleVerifyTruck(truck.id, "Verified Active"),
        className: "bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1 px-2.5 h-auto rounded-lg"
      },
      "Verify & Approve"
    )));
  }))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isRegisterModalOpen, onOpenChange: setIsRegisterModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-xl" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-5 h-5 text-amber-400" }), "Onboard Attached Vehicle (Partner Portal)")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleRegister, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Truck Registration No *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. MH12 RN 8841",
      value: regForm.truck_number,
      onChange: (e2) => setRegForm({ ...regForm, truck_number: e2.target.value.toUpperCase() }),
      className: "bg-slate-900 border-slate-800 text-white font-mono font-bold"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Truck Class / Spec *"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: regForm.truck_type,
      onChange: (e2) => setRegForm({ ...regForm, truck_type: e2.target.value }),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT SXL" }, "32FT SXL (Single Axle 14.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "32FT MXL" }, "32FT MXL (Multi Axle 18.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "24FT Container" }, "24FT Container (8.5 MT)"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "40FT Trailer" }, "40FT Trailer (28 MT)")
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Truck Owner Full Name *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Santosh Gaikwad",
      value: regForm.owner_name,
      onChange: (e2) => setRegForm({ ...regForm, owner_name: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Owner Contact Phone *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "+91 98220 12345",
      value: regForm.owner_phone,
      onChange: (e2) => setRegForm({ ...regForm, owner_phone: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Owner PAN Number"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "ABCDE1234F",
      value: regForm.owner_pan,
      onChange: (e2) => setRegForm({ ...regForm, owner_pan: e2.target.value.toUpperCase() }),
      className: "bg-slate-900 border-slate-800 text-white font-mono"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Bank Account / IFSC"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Account No / IFSC for Net Payouts",
      value: regForm.bank_account_number,
      onChange: (e2) => setRegForm({ ...regForm, bank_account_number: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Current Empty Location"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. Pune Chakan MIDC",
      value: regForm.declared_empty_location,
      onChange: (e2) => setRegForm({ ...regForm, declared_empty_location: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Agreed Payout Rate (\u20B9/km)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: regForm.agreed_payout_rate,
      onChange: (e2) => setRegForm({ ...regForm, agreed_payout_rate: parseFloat(e2.target.value) || 0 }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  ))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsRegisterModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black" }, "Register Attached Vehicle"))))), /* @__PURE__ */ react_shim_default.createElement(Dialog, { open: isAvailModalOpen, onOpenChange: setIsAvailModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent, { className: "bg-slate-950 border border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle, { className: "flex items-center gap-2 text-lg font-black text-white" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-5 h-5 text-amber-400" }), "Declare Empty Location & Availability")), selectedTruck && /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleUpdateAvailability, className: "space-y-4 text-xs font-medium" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 p-3 rounded-xl border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "font-mono font-bold text-amber-300 text-sm" }, selectedTruck.truck_number), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-slate-400 text-xs mt-0.5" }, "Owner: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, selectedTruck.owner_name), " (", selectedTruck.owner_phone, ")")), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Current Availability Status"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: availForm.current_availability,
      onChange: (e2) => setAvailForm({ ...availForm, current_availability: e2.target.value }),
      className: "w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Available for Trips" }, "Available for Trips"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "On Assigned Trip" }, "On Assigned Trip"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Maintenance" }, "Maintenance"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Not Available" }, "Not Available")
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Current Empty Location *"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      required: true,
      placeholder: "e.g. Pune MIDC / Hubli APMC Yard",
      value: availForm.declared_empty_location,
      onChange: (e2) => setAvailForm({ ...availForm, declared_empty_location: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 block mb-1" }, "Preferred Return Destination"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. Hyderabad / Bangalore",
      value: availForm.preferred_return_destination,
      onChange: (e2) => setAvailForm({ ...availForm, preferred_return_destination: e2.target.value }),
      className: "bg-slate-900 border-slate-800 text-white"
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", onClick: () => setIsAvailModalOpen(false) }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", className: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black" }, "Update Availability"))))));
}

// apps/web/src/pages/FleetReservationHub.jsx
var SUBMODULES = [
  { id: "calendar", label: "Fleet Calendar", icon: CalendarDays, description: "Gantt timeline & truck scheduling" },
  { id: "departures", label: "Departure Board", icon: Clock, description: "Airport flight-style truck departures" },
  { id: "search", label: "Flexible Date Search", icon: Search, description: "Multi-date availability & economic rates" },
  { id: "manage", label: "Booking Management", icon: ClipboardCheck, description: "Client requests & instant truck assignment" },
  { id: "subscriptions", label: "Dedicated Retainers", icon: ShieldCheck, description: "Monthly dedicated vehicle subscriptions" },
  { id: "recurring", label: "Recurring Bookings", icon: Repeat, description: "Repeat scheduled dispatches" },
  { id: "route-profit", label: "Route Profit Ranking", icon: TrendingUp, description: "P&L net margin corridor leaderboard" },
  { id: "partner-portal", label: "Attached Owner Portal", icon: UserCheck, description: "External vehicle onboarding & ledger" },
  { id: "return-loads", label: "Return-Loads", icon: ArrowLeftRight, description: "Backhaul revenue maximizer" },
  { id: "prediction", label: "Movement Prediction", icon: Compass, description: "SLA forecasts & location telemetry" }
];
function getUrlTab() {
  try {
    if (typeof window === "undefined") return "calendar";
    const sp = new URLSearchParams(window.location.search);
    return sp.get("tab") || "calendar";
  } catch (e2) {
    return "calendar";
  }
}
function FleetReservationHub({ initialTab = "calendar" }) {
  const [activeTab, setActiveTab] = useState(getUrlTab);
  useEffect(() => {
    const onPop = () => setActiveTab(getUrlTab());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    try {
      const sp = new URLSearchParams(window.location.search);
      sp.set("tab", tabId);
      const newUrl = `${window.location.pathname}?${sp.toString()}`;
      window.history.pushState(null, "", newUrl);
    } catch (e2) {
    }
  };
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "min-h-screen bg-slate-950 text-white font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900/95 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 md:px-6 py-2.5 shadow-md" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "max-w-[1700px] mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4" })), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-extrabold text-sm tracking-tight text-white hidden sm:inline" }, "Fleet Reservation Hub")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar" }, SUBMODULES.map((tab) => {
    const Icon2 = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ react_shim_default.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => handleSelectTab(tab.id),
        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isActive ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black" : "text-slate-400 hover:text-white hover:bg-slate-900"}`,
        title: tab.description
      },
      /* @__PURE__ */ react_shim_default.createElement(Icon2, { className: "w-3.5 h-3.5" }),
      /* @__PURE__ */ react_shim_default.createElement("span", null, tab.label)
    );
  })))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-2" }, activeTab === "calendar" && /* @__PURE__ */ react_shim_default.createElement(FleetCalendarPage, null), activeTab === "departures" && /* @__PURE__ */ react_shim_default.createElement(DepartureBoardPage, null), activeTab === "search" && /* @__PURE__ */ react_shim_default.createElement(AvailabilitySearchPage, null), activeTab === "manage" && /* @__PURE__ */ react_shim_default.createElement(BookingManagementPage, null), activeTab === "subscriptions" && /* @__PURE__ */ react_shim_default.createElement(SubscriptionsPage, null), activeTab === "recurring" && /* @__PURE__ */ react_shim_default.createElement(RecurringBookingsPage, null), activeTab === "route-profit" && /* @__PURE__ */ react_shim_default.createElement(RouteProfitPage, null), activeTab === "partner-portal" && /* @__PURE__ */ react_shim_default.createElement(PartnerOwnerPortal, null), activeTab === "return-loads" && /* @__PURE__ */ react_shim_default.createElement(ReturnLoadPage, null), activeTab === "prediction" && /* @__PURE__ */ react_shim_default.createElement(MovementPredictionPage, null)));
}
export {
  FleetReservationHub as default
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-left-right.js:
lucide-react/dist/esm/icons/arrow-right.js:
lucide-react/dist/esm/icons/award.js:
lucide-react/dist/esm/icons/building.js:
lucide-react/dist/esm/icons/calendar-days.js:
lucide-react/dist/esm/icons/calendar.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/chevron-left.js:
lucide-react/dist/esm/icons/chevron-right.js:
lucide-react/dist/esm/icons/circle-alert.js:
lucide-react/dist/esm/icons/circle-check.js:
lucide-react/dist/esm/icons/circle-x.js:
lucide-react/dist/esm/icons/clipboard-check.js:
lucide-react/dist/esm/icons/clock.js:
lucide-react/dist/esm/icons/compass.js:
lucide-react/dist/esm/icons/dollar-sign.js:
lucide-react/dist/esm/icons/file-text.js:
lucide-react/dist/esm/icons/filter.js:
lucide-react/dist/esm/icons/layers.js:
lucide-react/dist/esm/icons/lock.js:
lucide-react/dist/esm/icons/map-pin.js:
lucide-react/dist/esm/icons/maximize-2.js:
lucide-react/dist/esm/icons/minimize-2.js:
lucide-react/dist/esm/icons/navigation.js:
lucide-react/dist/esm/icons/plane-takeoff.js:
lucide-react/dist/esm/icons/plus.js:
lucide-react/dist/esm/icons/printer.js:
lucide-react/dist/esm/icons/radio.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/repeat.js:
lucide-react/dist/esm/icons/search.js:
lucide-react/dist/esm/icons/shield-alert.js:
lucide-react/dist/esm/icons/shield-check.js:
lucide-react/dist/esm/icons/sparkles.js:
lucide-react/dist/esm/icons/trending-down.js:
lucide-react/dist/esm/icons/trending-up.js:
lucide-react/dist/esm/icons/triangle-alert.js:
lucide-react/dist/esm/icons/truck.js:
lucide-react/dist/esm/icons/user-check.js:
lucide-react/dist/esm/icons/user.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
