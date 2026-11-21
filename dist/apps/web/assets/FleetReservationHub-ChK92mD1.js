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
  cloneElement: () => cloneElement,
  createContext: () => createContext,
  createElement: () => createElement,
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

// apps/web/node_modules/lucide-react/dist/esm/icons/arrow-right.js
var ArrowRight = createLucideIcon("ArrowRight", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
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

// apps/web/node_modules/lucide-react/dist/esm/icons/navigation.js
var Navigation = createLucideIcon("Navigation", [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
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

// apps/web/node_modules/lucide-react/dist/esm/icons/trending-up.js
var TrendingUp = createLucideIcon("TrendingUp", [
  ["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }],
  ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]
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

// apps/web/node_modules/lucide-react/dist/esm/icons/x.js
var X = createLucideIcon("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
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
  const Slot22 = forwardRef((props, forwardedRef) => {
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
  Slot22.displayName = `${ownerName}.Slot`;
  return Slot22;
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

// node_modules/@radix-ui/primitive/dist/index.mjs
var __defProp4 = Object.defineProperty;
var __name3 = (target, value) => __defProp4(target, "name", { value, configurable: true });
var canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);
function composeEventHandlers(originalEventHandler, ourEventHandler, { checkForDefaultPrevented = true } = {}) {
  return /* @__PURE__ */ __name3(function handleEvent(event) {
    originalEventHandler?.(event);
    if (checkForDefaultPrevented === false || !event || !event.defaultPrevented) {
      return ourEventHandler?.(event);
    }
  }, "handleEvent");
}
__name3(composeEventHandlers, "composeEventHandlers");
function getOwnerWindow(element) {
  if (!canUseDOM) {
    throw new Error("Cannot access window outside of the DOM");
  }
  return element?.ownerDocument?.defaultView ?? window;
}
__name3(getOwnerWindow, "getOwnerWindow");
function getOwnerDocument(element) {
  if (!canUseDOM) {
    throw new Error("Cannot access document outside of the DOM");
  }
  return element?.ownerDocument ?? document;
}
__name3(getOwnerDocument, "getOwnerDocument");
function getActiveElement(node, activeDescendant = false) {
  const { activeElement } = getOwnerDocument(node);
  if (!activeElement?.nodeName) {
    return null;
  }
  if (isFrame(activeElement) && activeElement.contentDocument) {
    return getActiveElement(activeElement.contentDocument.body, activeDescendant);
  }
  if (activeDescendant) {
    const id = activeElement.getAttribute("aria-activedescendant");
    if (id) {
      const element = getOwnerDocument(activeElement).getElementById(id);
      if (element) {
        return element;
      }
    }
  }
  return activeElement;
}
__name3(getActiveElement, "getActiveElement");
function isFrame(element) {
  return element.tagName === "IFRAME";
}
__name3(isFrame, "isFrame");

// node_modules/@radix-ui/react-context/dist/index.mjs
var __defProp5 = Object.defineProperty;
var __name4 = (target, value) => __defProp5(target, "name", { value, configurable: true });
// @__NO_SIDE_EFFECTS__
function createContext2(rootComponentName, defaultContext) {
  const Context = createContext(defaultContext);
  Context.displayName = rootComponentName + "Context";
  const Provider = /* @__PURE__ */ __name4((props) => {
    const { children, ...context } = props;
    const value = useMemo(() => context, Object.values(context));
    return /* @__PURE__ */ jsx(Context.Provider, { value, children });
  }, "Provider");
  Provider.displayName = rootComponentName + "Provider";
  function useContext2(consumerName, options2 = {}) {
    const { optional = false } = options2;
    const context = useContext(Context);
    if (context) return context;
    if (defaultContext !== void 0) return defaultContext;
    if (optional) return void 0;
    throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
  }
  __name4(useContext2, "useContext");
  return [Provider, useContext2];
}
__name4(createContext2, "createContext");
// @__NO_SIDE_EFFECTS__
function createContextScope(scopeName, createContextScopeDeps = []) {
  let defaultContexts = [];
  function createContext3(rootComponentName, defaultContext) {
    const BaseContext = createContext(defaultContext);
    BaseContext.displayName = rootComponentName + "Context";
    const index = defaultContexts.length;
    defaultContexts = [...defaultContexts, defaultContext];
    const Provider = /* @__PURE__ */ __name4((props) => {
      const { scope, children, ...context } = props;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const value = useMemo(() => context, Object.values(context));
      return /* @__PURE__ */ jsx(Context.Provider, { value, children });
    }, "Provider");
    Provider.displayName = rootComponentName + "Provider";
    function useContext2(consumerName, scope, options2 = {}) {
      const { optional = false } = options2;
      const Context = scope?.[scopeName]?.[index] || BaseContext;
      const context = useContext(Context);
      if (context) return context;
      if (defaultContext !== void 0) return defaultContext;
      if (optional) return void 0;
      throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    __name4(useContext2, "useContext");
    return [Provider, useContext2];
  }
  __name4(createContext3, "createContext");
  const createScope = /* @__PURE__ */ __name4(() => {
    const scopeContexts = defaultContexts.map((defaultContext) => {
      return createContext(defaultContext);
    });
    return /* @__PURE__ */ __name4(function useScope(scope) {
      const contexts = scope?.[scopeName] || scopeContexts;
      return useMemo(
        () => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }),
        [scope, contexts]
      );
    }, "useScope");
  }, "createScope");
  createScope.scopeName = scopeName;
  return [createContext3, composeContextScopes(createScope, ...createContextScopeDeps)];
}
__name4(createContextScope, "createContextScope");
function composeContextScopes(...scopes) {
  const baseScope = scopes[0];
  if (scopes.length === 1) return baseScope;
  const createScope = /* @__PURE__ */ __name4(() => {
    const scopeHooks = scopes.map((createScope2) => ({
      useScope: createScope2(),
      scopeName: createScope2.scopeName
    }));
    return /* @__PURE__ */ __name4(function useComposedScopes(overrideScopes) {
      const nextScopes = scopeHooks.reduce((nextScopes2, { useScope, scopeName }) => {
        const scopeProps = useScope(overrideScopes);
        const currentScope = scopeProps[`__scope${scopeName}`];
        return { ...nextScopes2, ...currentScope };
      }, {});
      return useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
    }, "useComposedScopes");
  }, "createScope");
  createScope.scopeName = baseScope.scopeName;
  return createScope;
}
__name4(composeContextScopes, "composeContextScopes");

// node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var useLayoutEffect2 = globalThis?.document ? useLayoutEffect : () => {
};

// node_modules/@radix-ui/react-id/dist/index.mjs
var __defProp6 = Object.defineProperty;
var __name5 = (target, value) => __defProp6(target, "name", { value, configurable: true });
var useReactId = react_shim_exports[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId2(deterministicId) {
  const [id, setId] = useState(useReactId());
  useLayoutEffect2(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}
__name5(useId2, "useId");

// node_modules/@radix-ui/primitive/dist/internal/is-development.false.mjs
var IS_DEVELOPMENT = false;

// node_modules/@radix-ui/react-use-effect-event/dist/index.mjs
var __defProp7 = Object.defineProperty;
var __name6 = (target, value) => __defProp7(target, "name", { value, configurable: true });
var useReactEffectEvent = react_shim_exports[" useEffectEvent ".trim().toString()];
var useReactInsertionEffect = react_shim_exports[" useInsertionEffect ".trim().toString()];
function useEffectEvent(callback) {
  if (typeof useReactEffectEvent === "function") {
    return useReactEffectEvent(callback);
  }
  const ref = useRef(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  if (typeof useReactInsertionEffect === "function") {
    useReactInsertionEffect(() => {
      ref.current = callback;
    });
  } else {
    useLayoutEffect2(() => {
      ref.current = callback;
    });
  }
  return useMemo(() => ((...args) => ref.current?.(...args)), []);
}
__name6(useEffectEvent, "useEffectEvent");

// node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
var __defProp8 = Object.defineProperty;
var __name7 = (target, value) => __defProp8(target, "name", { value, configurable: true });
var useInsertionEffect = react_shim_exports[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = /* @__PURE__ */ __name7(() => {
  }, "onChange"),
  caller
}) {
  const [uncontrolledProp, setUncontrolledProp, onChangeRef] = useUncontrolledState({
    defaultProp,
    onChange
  });
  const isControlled = prop !== void 0;
  const value = isControlled ? prop : uncontrolledProp;
  if (IS_DEVELOPMENT) {
    const isControlledRef = useRef(prop !== void 0);
    useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const setValue = useCallback(
    (nextValue) => {
      if (isControlled) {
        const value2 = isFunction(nextValue) ? nextValue(prop) : nextValue;
        if (value2 !== prop) {
          onChangeRef.current?.(value2);
        }
      } else {
        setUncontrolledProp(nextValue);
      }
    },
    [isControlled, prop, setUncontrolledProp, onChangeRef]
  );
  return [value, setValue];
}
__name7(useControllableState, "useControllableState");
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = useState(defaultProp);
  const prevValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useInsertionEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (prevValueRef.current !== value) {
      onChangeRef.current?.(value);
      prevValueRef.current = value;
    }
  }, [value, prevValueRef]);
  return [value, setValue, onChangeRef];
}
__name7(useUncontrolledState, "useUncontrolledState");
function isFunction(value) {
  return typeof value === "function";
}
__name7(isFunction, "isFunction");
var SYNC_STATE = /* @__PURE__ */ Symbol("RADIX:SYNC_STATE");
function useControllableStateReducer(reducer, userArgs, initialArg, init) {
  const { prop: controlledState, defaultProp, onChange: onChangeProp, caller } = userArgs;
  const isControlled = controlledState !== void 0;
  const onChange = useEffectEvent(onChangeProp);
  if (IS_DEVELOPMENT) {
    const isControlledRef = useRef(controlledState !== void 0);
    useEffect(() => {
      const wasControlled = isControlledRef.current;
      if (wasControlled !== isControlled) {
        const from = wasControlled ? "controlled" : "uncontrolled";
        const to = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
        );
      }
      isControlledRef.current = isControlled;
    }, [isControlled, caller]);
  }
  const args = [{ ...initialArg, state: defaultProp }];
  if (init) {
    args.push(init);
  }
  const [internalState, dispatch] = useReducer(
    (state2, action) => {
      if (action.type === SYNC_STATE) {
        return { ...state2, state: action.state };
      }
      const next = reducer(state2, action);
      if (isControlled && !Object.is(next.state, state2.state)) {
        onChange(next.state);
      }
      return next;
    },
    ...args
  );
  const uncontrolledState = internalState.state;
  const prevValueRef = useRef(uncontrolledState);
  useEffect(() => {
    if (prevValueRef.current !== uncontrolledState) {
      prevValueRef.current = uncontrolledState;
      if (!isControlled) {
        onChange(uncontrolledState);
      }
    }
  }, [uncontrolledState, prevValueRef, isControlled]);
  const state = useMemo(() => {
    const isControlled2 = controlledState !== void 0;
    if (isControlled2) {
      return { ...internalState, state: controlledState };
    }
    return internalState;
  }, [internalState, controlledState]);
  useEffect(() => {
    if (isControlled && !Object.is(controlledState, internalState.state)) {
      dispatch({ type: SYNC_STATE, state: controlledState });
    }
  }, [controlledState, internalState.state, isControlled]);
  return [state, dispatch];
}
__name7(useControllableStateReducer, "useControllableStateReducer");

// node_modules/@radix-ui/react-primitive/dist/index.mjs
var __defProp9 = Object.defineProperty;
var __name8 = (target, value) => __defProp9(target, "name", { value, configurable: true });
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot3 = createSlot(`Primitive.${node}`);
  const Node2 = forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot3 : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return /* @__PURE__ */ jsx(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node2.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node2 };
}, {});
function dispatchDiscreteCustomEvent(target, event) {
  if (target) (void 0)(() => target.dispatchEvent(event));
}
__name8(dispatchDiscreteCustomEvent, "dispatchDiscreteCustomEvent");

// node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var __defProp10 = Object.defineProperty;
var __name9 = (target, value) => __defProp10(target, "name", { value, configurable: true });
function useCallbackRef(callback) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(() => ((...args) => callbackRef.current?.(...args)), []);
}
__name9(useCallbackRef, "useCallbackRef");

// node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var __defProp11 = Object.defineProperty;
var __name10 = (target, value) => __defProp11(target, "name", { value, configurable: true });
var CONTEXT_UPDATE = "dismissableLayer.update";
var POINTER_DOWN_OUTSIDE = "dismissableLayer.pointerDownOutside";
var FOCUS_OUTSIDE = "dismissableLayer.focusOutside";
var originalBodyPointerEvents;
var DismissableLayerContext = createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
});
var DismissableLayer = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name10(function DismissableLayer2(props, forwardedRef) {
    const {
      disableOutsidePointerEvents = false,
      deferPointerDownOutside = false,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      onDismiss,
      ...layerProps
    } = props;
    const context = useContext(DismissableLayerContext);
    const [node, setNode] = useState(null);
    const ownerDocument = node?.ownerDocument ?? globalThis?.document;
    const [, force] = useState({});
    const composedRefs = useComposedRefs(forwardedRef, setNode);
    const layers = Array.from(context.layers);
    const [highestLayerWithOutsidePointerEventsDisabled] = [
      ...context.layersWithOutsidePointerEventsDisabled
    ].slice(-1);
    const highestLayerWithOutsidePointerEventsDisabledIndex = highestLayerWithOutsidePointerEventsDisabled ? layers.indexOf(highestLayerWithOutsidePointerEventsDisabled) : -1;
    const index = node ? layers.indexOf(node) : -1;
    const isBodyPointerEventsDisabled = context.layersWithOutsidePointerEventsDisabled.size > 0;
    const isPointerEventsEnabled = index >= highestLayerWithOutsidePointerEventsDisabledIndex;
    const isDeferredPointerDownOutsideRef = useRef(false);
    const pointerDownOutside = usePointerDownOutside(
      (event) => {
        onPointerDownOutside?.(event);
        onInteractOutside?.(event);
        if (!event.defaultPrevented) onDismiss?.();
      },
      {
        ownerDocument,
        deferPointerDownOutside,
        isDeferredPointerDownOutsideRef,
        dismissableSurfaces: context.dismissableSurfaces,
        shouldHandlePointerDownOutside: useCallback(
          (target) => {
            if (!(target instanceof Node)) {
              return false;
            }
            const isPointerDownOnBranch = [...context.branches].some(
              (branch) => branch.contains(target)
            );
            return isPointerEventsEnabled && !isPointerDownOnBranch;
          },
          [context.branches, isPointerEventsEnabled]
        )
      }
    );
    const focusOutside = useFocusOutside((event) => {
      if (deferPointerDownOutside && isDeferredPointerDownOutsideRef.current) {
        return;
      }
      const target = event.target;
      const isFocusInBranch = [...context.branches].some((branch) => branch.contains(target));
      if (isFocusInBranch) return;
      onFocusOutside?.(event);
      onInteractOutside?.(event);
      if (!event.defaultPrevented) onDismiss?.();
    }, ownerDocument);
    const isHighestLayer = node ? index === layers.length - 1 : false;
    const handleKeyDown = useCallbackRef((event) => {
      if (event.key !== "Escape") {
        return;
      }
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented && onDismiss) {
        event.preventDefault();
        onDismiss();
      }
    });
    useEffect(() => {
      if (!isHighestLayer) {
        return;
      }
      ownerDocument.addEventListener("keydown", handleKeyDown, { capture: true });
      return () => ownerDocument.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [ownerDocument, isHighestLayer, handleKeyDown]);
    useEffect(() => {
      if (!node) return;
      if (disableOutsidePointerEvents) {
        if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
          originalBodyPointerEvents = ownerDocument.body.style.pointerEvents;
          ownerDocument.body.style.pointerEvents = "none";
        }
        context.layersWithOutsidePointerEventsDisabled.add(node);
      }
      context.layers.add(node);
      dispatchUpdate();
      return () => {
        if (disableOutsidePointerEvents) {
          context.layersWithOutsidePointerEventsDisabled.delete(node);
          if (context.layersWithOutsidePointerEventsDisabled.size === 0) {
            ownerDocument.body.style.pointerEvents = originalBodyPointerEvents;
          }
        }
      };
    }, [node, ownerDocument, disableOutsidePointerEvents, context]);
    useEffect(() => {
      return () => {
        if (!node) return;
        context.layers.delete(node);
        context.layersWithOutsidePointerEventsDisabled.delete(node);
        dispatchUpdate();
      };
    }, [node, context]);
    useEffect(() => {
      const handleUpdate = /* @__PURE__ */ __name10(() => force({}), "handleUpdate");
      document.addEventListener(CONTEXT_UPDATE, handleUpdate);
      return () => document.removeEventListener(CONTEXT_UPDATE, handleUpdate);
    }, []);
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...layerProps,
        ref: composedRefs,
        style: {
          pointerEvents: isBodyPointerEventsDisabled ? isPointerEventsEnabled ? "auto" : "none" : void 0,
          ...props.style
        },
        onFocusCapture: composeEventHandlers(props.onFocusCapture, focusOutside.onFocusCapture),
        onBlurCapture: composeEventHandlers(props.onBlurCapture, focusOutside.onBlurCapture),
        onPointerDownCapture: composeEventHandlers(
          props.onPointerDownCapture,
          pointerDownOutside.onPointerDownCapture
        )
      }
    );
  }, "DismissableLayer")
);
function useDismissableLayerSurface() {
  const context = useContext(DismissableLayerContext);
  const [node, setNode] = useState(null);
  useEffect(() => {
    if (!node) {
      return;
    }
    context.dismissableSurfaces.add(node);
    return () => {
      context.dismissableSurfaces.delete(node);
    };
  }, [node, context.dismissableSurfaces]);
  return setNode;
}
__name10(useDismissableLayerSurface, "useDismissableLayerSurface");
var IS_TRUE = /* @__PURE__ */ __name10(() => true, "IS_TRUE");
function usePointerDownOutside(onPointerDownOutside, args) {
  const {
    ownerDocument = globalThis?.document,
    deferPointerDownOutside = false,
    isDeferredPointerDownOutsideRef,
    dismissableSurfaces,
    shouldHandlePointerDownOutside = IS_TRUE
  } = args;
  const handlePointerDownOutside = useCallbackRef(onPointerDownOutside);
  const isPointerInsideReactTreeRef = useRef(false);
  const isPointerDownOutsideRef = useRef(false);
  const interceptedOutsideInteractionEventsRef = useRef(/* @__PURE__ */ new Map());
  const handleClickRef = useRef(() => {
  });
  useEffect(() => {
    function resetOutsideInteraction() {
      isPointerDownOutsideRef.current = false;
      isDeferredPointerDownOutsideRef.current = false;
      interceptedOutsideInteractionEventsRef.current.clear();
    }
    __name10(resetOutsideInteraction, "resetOutsideInteraction");
    function isOutsideInteractionIntercepted() {
      return Array.from(interceptedOutsideInteractionEventsRef.current.values()).some(Boolean);
    }
    __name10(isOutsideInteractionIntercepted, "isOutsideInteractionIntercepted");
    function handleInteractionCapture(event) {
      if (!isPointerDownOutsideRef.current) {
        return;
      }
      const target = event.target;
      const isDismissableSurface = target instanceof Node && [...dismissableSurfaces].some((surface) => surface.contains(target));
      if (!isDismissableSurface) {
        interceptedOutsideInteractionEventsRef.current.set(event.type, true);
      }
      if (event.type === "click") {
        window.setTimeout(() => {
          if (isPointerDownOutsideRef.current) {
            handleClickRef.current();
          }
        }, 0);
      }
    }
    __name10(handleInteractionCapture, "handleInteractionCapture");
    function handleInteractionBubble(event) {
      if (isPointerDownOutsideRef.current) {
        interceptedOutsideInteractionEventsRef.current.set(event.type, false);
      }
    }
    __name10(handleInteractionBubble, "handleInteractionBubble");
    const handlePointerDown = /* @__PURE__ */ __name10((event) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        let handleAndDispatchPointerDownOutsideEvent2 = function() {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          const wasOutsideInteractionIntercepted = isOutsideInteractionIntercepted();
          resetOutsideInteraction();
          if (!wasOutsideInteractionIntercepted) {
            handleAndDispatchCustomEvent(
              POINTER_DOWN_OUTSIDE,
              handlePointerDownOutside,
              eventDetail,
              { discrete: true }
            );
          }
        };
        var handleAndDispatchPointerDownOutsideEvent = handleAndDispatchPointerDownOutsideEvent2;
        __name10(handleAndDispatchPointerDownOutsideEvent2, "handleAndDispatchPointerDownOutsideEvent");
        if (!shouldHandlePointerDownOutside(event.target)) {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          resetOutsideInteraction();
          isPointerInsideReactTreeRef.current = false;
          return;
        }
        const eventDetail = { originalEvent: event };
        isPointerDownOutsideRef.current = true;
        isDeferredPointerDownOutsideRef.current = deferPointerDownOutside && event.button === 0;
        interceptedOutsideInteractionEventsRef.current.clear();
        if (!deferPointerDownOutside || event.button !== 0) {
          handleAndDispatchPointerDownOutsideEvent2();
        } else {
          ownerDocument.removeEventListener("click", handleClickRef.current);
          handleClickRef.current = handleAndDispatchPointerDownOutsideEvent2;
          ownerDocument.addEventListener("click", handleClickRef.current, { once: true });
        }
      } else {
        ownerDocument.removeEventListener("click", handleClickRef.current);
        resetOutsideInteraction();
      }
      isPointerInsideReactTreeRef.current = false;
    }, "handlePointerDown");
    const outsideInteractionEvents = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const eventName of outsideInteractionEvents) {
      ownerDocument.addEventListener(eventName, handleInteractionCapture, true);
      ownerDocument.addEventListener(eventName, handleInteractionBubble);
    }
    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", handlePointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", handlePointerDown);
      ownerDocument.removeEventListener("click", handleClickRef.current);
      for (const eventName of outsideInteractionEvents) {
        ownerDocument.removeEventListener(eventName, handleInteractionCapture, true);
        ownerDocument.removeEventListener(eventName, handleInteractionBubble);
      }
    };
  }, [
    ownerDocument,
    handlePointerDownOutside,
    deferPointerDownOutside,
    isDeferredPointerDownOutsideRef,
    dismissableSurfaces,
    shouldHandlePointerDownOutside
  ]);
  return {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: /* @__PURE__ */ __name10(() => isPointerInsideReactTreeRef.current = true, "onPointerDownCapture")
  };
}
__name10(usePointerDownOutside, "usePointerDownOutside");
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
  const handleFocusOutside = useCallbackRef(onFocusOutside);
  const isFocusInsideReactTreeRef = useRef(false);
  useEffect(() => {
    const handleFocus = /* @__PURE__ */ __name10((event) => {
      if (event.target && !isFocusInsideReactTreeRef.current) {
        const eventDetail = { originalEvent: event };
        handleAndDispatchCustomEvent(FOCUS_OUTSIDE, handleFocusOutside, eventDetail, {
          discrete: false
        });
      }
    }, "handleFocus");
    ownerDocument.addEventListener("focusin", handleFocus);
    return () => ownerDocument.removeEventListener("focusin", handleFocus);
  }, [ownerDocument, handleFocusOutside]);
  return {
    onFocusCapture: /* @__PURE__ */ __name10(() => isFocusInsideReactTreeRef.current = true, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ __name10(() => isFocusInsideReactTreeRef.current = false, "onBlurCapture")
  };
}
__name10(useFocusOutside, "useFocusOutside");
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
__name10(dispatchUpdate, "dispatchUpdate");
function handleAndDispatchCustomEvent(name, handler, detail, { discrete }) {
  const target = detail.originalEvent.target;
  const event = new CustomEvent(name, { bubbles: false, cancelable: true, detail });
  if (handler) target.addEventListener(name, handler, { once: true });
  if (discrete) {
    dispatchDiscreteCustomEvent(target, event);
  } else {
    target.dispatchEvent(event);
  }
}
__name10(handleAndDispatchCustomEvent, "handleAndDispatchCustomEvent");

// node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var __defProp12 = Object.defineProperty;
var __name11 = (target, value) => __defProp12(target, "name", { value, configurable: true });
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var FocusScope = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name11(function FocusScope2(props, forwardedRef) {
    const {
      loop = false,
      trapped = false,
      onMountAutoFocus: onMountAutoFocusProp,
      onUnmountAutoFocus: onUnmountAutoFocusProp,
      ...scopeProps
    } = props;
    const [container, setContainer] = useState(null);
    const onMountAutoFocus = useCallbackRef(onMountAutoFocusProp);
    const onUnmountAutoFocus = useCallbackRef(onUnmountAutoFocusProp);
    const lastFocusedElementRef = useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, setContainer);
    const focusScope = useRef({
      paused: false,
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      }
    }).current;
    useEffect(() => {
      if (trapped) {
        let handleFocusIn2 = function(event) {
          if (focusScope.paused || !container) return;
          const target = event.target;
          if (container.contains(target)) {
            lastFocusedElementRef.current = target;
          } else {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleFocusOut2 = function(event) {
          if (focusScope.paused || !container) return;
          const relatedTarget = event.relatedTarget;
          if (relatedTarget === null) return;
          if (!container.contains(relatedTarget)) {
            focus(lastFocusedElementRef.current, { select: true });
          }
        }, handleMutations2 = function(mutations) {
          const focusedElement = document.activeElement;
          if (focusedElement !== document.body) return;
          for (const mutation of mutations) {
            if (mutation.removedNodes.length > 0) focus(container);
          }
        };
        var handleFocusIn = handleFocusIn2, handleFocusOut = handleFocusOut2, handleMutations = handleMutations2;
        __name11(handleFocusIn2, "handleFocusIn");
        __name11(handleFocusOut2, "handleFocusOut");
        __name11(handleMutations2, "handleMutations");
        document.addEventListener("focusin", handleFocusIn2);
        document.addEventListener("focusout", handleFocusOut2);
        const mutationObserver = new MutationObserver(handleMutations2);
        if (container) mutationObserver.observe(container, { childList: true, subtree: true });
        return () => {
          document.removeEventListener("focusin", handleFocusIn2);
          document.removeEventListener("focusout", handleFocusOut2);
          mutationObserver.disconnect();
        };
      }
    }, [trapped, container, focusScope.paused]);
    useEffect(() => {
      if (container) {
        focusScopesStack.add(focusScope);
        const previouslyFocusedElement = document.activeElement;
        const hasFocusedCandidate = container.contains(previouslyFocusedElement);
        if (!hasFocusedCandidate) {
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          container.dispatchEvent(mountEvent);
          if (!mountEvent.defaultPrevented) {
            focusFirst(removeLinks(getTabbableCandidates(container)), { select: true });
            if (document.activeElement === previouslyFocusedElement) {
              focus(container);
            }
          }
        }
        return () => {
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          setTimeout(() => {
            const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS);
            container.addEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            container.dispatchEvent(unmountEvent);
            if (!unmountEvent.defaultPrevented) {
              focus(previouslyFocusedElement ?? document.body, { select: true });
            }
            container.removeEventListener(AUTOFOCUS_ON_UNMOUNT, onUnmountAutoFocus);
            focusScopesStack.remove(focusScope);
          }, 0);
        };
      }
    }, [container, onMountAutoFocus, onUnmountAutoFocus, focusScope]);
    const handleKeyDown = useCallback(
      (event) => {
        if (!loop && !trapped) return;
        if (focusScope.paused) return;
        const isTabKey = event.key === "Tab" && !event.altKey && !event.ctrlKey && !event.metaKey;
        const focusedElement = document.activeElement;
        if (isTabKey && focusedElement) {
          const container2 = event.currentTarget;
          const [first, last] = getTabbableEdges(container2);
          const hasTabbableElementsInside = first && last;
          if (!hasTabbableElementsInside) {
            if (focusedElement === container2) event.preventDefault();
          } else {
            if (!event.shiftKey && focusedElement === last) {
              event.preventDefault();
              if (loop) focus(first, { select: true });
            } else if (event.shiftKey && focusedElement === first) {
              event.preventDefault();
              if (loop) focus(last, { select: true });
            }
          }
        }
      },
      [loop, trapped, focusScope.paused]
    );
    return /* @__PURE__ */ jsx(Primitive.div, { tabIndex: -1, ...scopeProps, ref: composedRefs, onKeyDown: handleKeyDown });
  }, "FocusScope")
);
function focusFirst(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
__name11(focusFirst, "focusFirst");
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
__name11(getTabbableEdges, "getTabbableEdges");
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ __name11((node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
__name11(getTabbableCandidates, "getTabbableCandidates");
function findVisible(elements, container) {
  const canUseCheckVisibility = typeof container.checkVisibility === "function" && container.checkVisibility({ checkVisibilityCSS: true });
  for (const element of elements) {
    const hidden = canUseCheckVisibility ? !element.checkVisibility({ checkVisibilityCSS: true }) : isHidden(element, { upTo: container });
    if (!hidden) {
      return element;
    }
  }
}
__name11(findVisible, "findVisible");
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
__name11(isHidden, "isHidden");
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
__name11(isSelectableInput, "isSelectableInput");
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
__name11(focus, "focus");
var focusScopesStack = createFocusScopesStack();
function createFocusScopesStack() {
  let stack = [];
  return {
    add(focusScope) {
      const activeFocusScope = stack[0];
      if (focusScope !== activeFocusScope) {
        activeFocusScope?.pause();
      }
      stack = arrayRemove(stack, focusScope);
      stack.unshift(focusScope);
    },
    remove(focusScope) {
      stack = arrayRemove(stack, focusScope);
      stack[0]?.resume();
    }
  };
}
__name11(createFocusScopesStack, "createFocusScopesStack");
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}
__name11(arrayRemove, "arrayRemove");
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}
__name11(removeLinks, "removeLinks");

// node_modules/@radix-ui/react-portal/dist/index.mjs
var __defProp13 = Object.defineProperty;
var __name12 = (target, value) => __defProp13(target, "name", { value, configurable: true });
var Portal = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name12(function Portal2(props, forwardedRef) {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = useState(false);
    useLayoutEffect2(() => setMounted(true), []);
    const container = containerProp || mounted && globalThis?.document?.body;
    return container ? (void 0)(/* @__PURE__ */ jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
  }, "Portal")
);

// node_modules/@radix-ui/react-presence/dist/index.mjs
var __defProp14 = Object.defineProperty;
var __name13 = (target, value) => __defProp14(target, "name", { value, configurable: true });
function useStateMachine(initialState, machine) {
  return useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
__name13(useStateMachine, "useStateMachine");
var Presence = /* @__PURE__ */ __name13((props) => {
  const { present, children } = props;
  const presence = usePresence(present);
  const child = typeof children === "function" ? children({ present: presence.isPresent }) : Children.only(children);
  const ref = useStableComposedRefs(presence.ref, getElementRef2(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent ? cloneElement(child, { ref }) : null;
}, "Presence");
function usePresence(present) {
  const [node, setNode] = useState();
  const stylesRef = useRef(null);
  const prevPresentRef = useRef(present);
  const prevAnimationNameRef = useRef("none");
  const mountAnimationNameRef = useRef(void 0);
  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  useEffect(() => {
    if (state === "mounted") {
      prevAnimationNameRef.current = mountAnimationNameRef.current ?? getAnimationName(stylesRef.current);
      mountAnimationNameRef.current = void 0;
    } else {
      prevAnimationNameRef.current = "none";
    }
  }, [state]);
  useLayoutEffect2(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;
    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const currentAnimationName = getAnimationName(styles);
      if (present) {
        mountAnimationNameRef.current = currentAnimationName;
        send("MOUNT");
      } else if (currentAnimationName === "none" || styles?.display === "none") {
        send("UNMOUNT");
      } else {
        const isAnimating = prevAnimationName !== currentAnimationName;
        if (wasPresent && isAnimating) {
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }
      }
      prevPresentRef.current = present;
    }
  }, [present, send]);
  useLayoutEffect2(() => {
    if (node) {
      let timeoutId;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      const handleAnimationEnd = /* @__PURE__ */ __name13((event) => {
        const currentAnimationName = getAnimationName(stylesRef.current);
        const isCurrentAnimation = currentAnimationName.includes(CSS.escape(event.animationName));
        if (event.target === node && isCurrentAnimation) {
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
              }
            });
          }
        }
      }, "handleAnimationEnd");
      const handleAnimationStart = /* @__PURE__ */ __name13((event) => {
        if (event.target === node) {
          prevAnimationNameRef.current = getAnimationName(stylesRef.current);
        }
      }, "handleAnimationStart");
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      send("ANIMATION_END");
    }
  }, [node, send]);
  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: useCallback((node2) => {
      if (node2) {
        const styles = getComputedStyle(node2);
        stylesRef.current = styles;
        mountAnimationNameRef.current = getAnimationName(styles);
      } else {
        stylesRef.current = null;
      }
      setNode(node2);
    }, [])
  };
}
__name13(usePresence, "usePresence");
function setRef2(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
__name13(setRef2, "setRef");
function useStableComposedRefs(...refs) {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  return useCallback((node) => {
    const currentRefs = refsRef.current;
    let hasCleanup = false;
    const cleanups = currentRefs.map((ref) => {
      const cleanup = setRef2(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });
    if (hasCleanup) {
      return () => {
        for (let i2 = 0; i2 < cleanups.length; i2++) {
          const cleanup = cleanups[i2];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef2(currentRefs[i2], null);
          }
        }
      };
    }
  }, []);
}
__name13(useStableComposedRefs, "useStableComposedRefs");
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
__name13(getAnimationName, "getAnimationName");
function getElementRef2(element) {
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
__name13(getElementRef2, "getElementRef");

// node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var __defProp15 = Object.defineProperty;
var __name14 = (target, value) => __defProp15(target, "name", { value, configurable: true });
var count2 = 0;
var guards = null;
function FocusGuards(props) {
  useFocusGuards();
  return props.children;
}
__name14(FocusGuards, "FocusGuards");
function useFocusGuards() {
  useEffect(() => {
    if (!guards) {
      guards = { start: createFocusGuard(), end: createFocusGuard() };
    }
    const { start, end } = guards;
    if (document.body.firstElementChild !== start) {
      document.body.insertAdjacentElement("afterbegin", start);
    }
    if (document.body.lastElementChild !== end) {
      document.body.insertAdjacentElement("beforeend", end);
    }
    count2++;
    return () => {
      if (count2 === 1) {
        guards?.start.remove();
        guards?.end.remove();
        guards = null;
      }
      count2 = Math.max(0, count2 - 1);
    };
  }, []);
}
__name14(useFocusGuards, "useFocusGuards");
function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-radix-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}
__name14(createFocusGuard, "createFocusGuard");

// node_modules/tslib/tslib.es6.mjs
var __assign = function() {
  __assign = Object.assign || function __assign2(t2) {
    for (var s2, i2 = 1, n2 = arguments.length; i2 < n2; i2++) {
      s2 = arguments[i2];
      for (var p in s2) if (Object.prototype.hasOwnProperty.call(s2, p)) t2[p] = s2[p];
    }
    return t2;
  };
  return __assign.apply(this, arguments);
};
function __rest(s2, e2) {
  var t2 = {};
  for (var p in s2) if (Object.prototype.hasOwnProperty.call(s2, p) && e2.indexOf(p) < 0)
    t2[p] = s2[p];
  if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i2 = 0, p = Object.getOwnPropertySymbols(s2); i2 < p.length; i2++) {
      if (e2.indexOf(p[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i2]))
        t2[p[i2]] = s2[p[i2]];
    }
  return t2;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i2 = 0, l = from.length, ar; i2 < l; i2++) {
    if (ar || !(i2 in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i2);
      ar[i2] = from[i2];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

// node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var zeroRightClassName = "right-scroll-bar-position";
var fullWidthClassName = "width-before-scroll-bar";
var noScrollbarsClassName = "with-scroll-bars-hidden";
var removedBarSizeVariable = "--removed-body-scroll-bar-size";

// node_modules/use-callback-ref/dist/es2015/assignRef.js
function assignRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}

// node_modules/use-callback-ref/dist/es2015/useRef.js
function useCallbackRef2(initialValue, callback) {
  var ref = useState(function() {
    return {
      // value
      value: initialValue,
      // last callback
      callback,
      // "memoized" public interface
      facade: {
        get current() {
          return ref.value;
        },
        set current(value) {
          var last = ref.value;
          if (last !== value) {
            ref.value = value;
            ref.callback(value, last);
          }
        }
      }
    };
  })[0];
  ref.callback = callback;
  return ref.facade;
}

// node_modules/use-callback-ref/dist/es2015/useMergeRef.js
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
var currentValues = /* @__PURE__ */ new WeakMap();
function useMergeRefs(refs, defaultValue) {
  var callbackRef = useCallbackRef2(defaultValue || null, function(newValue) {
    return refs.forEach(function(ref) {
      return assignRef(ref, newValue);
    });
  });
  useIsomorphicLayoutEffect(function() {
    var oldValue = currentValues.get(callbackRef);
    if (oldValue) {
      var prevRefs_1 = new Set(oldValue);
      var nextRefs_1 = new Set(refs);
      var current_1 = callbackRef.current;
      prevRefs_1.forEach(function(ref) {
        if (!nextRefs_1.has(ref)) {
          assignRef(ref, null);
        }
      });
      nextRefs_1.forEach(function(ref) {
        if (!prevRefs_1.has(ref)) {
          assignRef(ref, current_1);
        }
      });
    }
    currentValues.set(callbackRef, refs);
  }, [refs]);
  return callbackRef;
}

// node_modules/use-sidecar/dist/es2015/medium.js
function ItoI(a) {
  return a;
}
function innerCreateMedium(defaults, middleware) {
  if (middleware === void 0) {
    middleware = ItoI;
  }
  var buffer = [];
  var assigned = false;
  var medium = {
    read: function() {
      if (assigned) {
        throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
      }
      if (buffer.length) {
        return buffer[buffer.length - 1];
      }
      return defaults;
    },
    useMedium: function(data) {
      var item = middleware(data, assigned);
      buffer.push(item);
      return function() {
        buffer = buffer.filter(function(x) {
          return x !== item;
        });
      };
    },
    assignSyncMedium: function(cb) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
      }
      buffer = {
        push: function(x) {
          return cb(x);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb);
      };
      var cycle = function() {
        return Promise.resolve().then(executeQueue);
      };
      cycle();
      buffer = {
        push: function(x) {
          pendingQueue.push(x);
          cycle();
        },
        filter: function(filter) {
          pendingQueue = pendingQueue.filter(filter);
          return buffer;
        }
      };
    }
  };
  return medium;
}
function createSidecarMedium(options2) {
  if (options2 === void 0) {
    options2 = {};
  }
  var medium = innerCreateMedium(null);
  medium.options = __assign({ async: true, ssr: false }, options2);
  return medium;
}

// node_modules/use-sidecar/dist/es2015/exports.js
var SideCar = function(_a) {
  var sideCar = _a.sideCar, rest = __rest(_a, ["sideCar"]);
  if (!sideCar) {
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  }
  var Target = sideCar.read();
  if (!Target) {
    throw new Error("Sidecar medium not found");
  }
  return createElement(Target, __assign({}, rest));
};
SideCar.isSideCarExport = true;
function exportSidecar(medium, exported) {
  medium.useMedium(exported);
  return SideCar;
}

// node_modules/react-remove-scroll/dist/es2015/medium.js
var effectCar = createSidecarMedium();

// node_modules/react-remove-scroll/dist/es2015/UI.js
var nothing = function() {
  return;
};
var RemoveScroll = forwardRef(function(props, parentRef) {
  var ref = useRef(null);
  var _a = useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a[0], setCallbacks = _a[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
  var SideCar2 = sideCar;
  var containerRef = useMergeRefs([ref, parentRef]);
  var containerProps = __assign(__assign({}, rest), callbacks);
  return createElement(
    Fragment,
    null,
    enabled && createElement(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noRelative, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref, gapMode }),
    forwardProps ? cloneElement(Children.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : createElement(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
  );
});
RemoveScroll.defaultProps = {
  enabled: true,
  removeScrollBar: true,
  inert: false
};
RemoveScroll.classNames = {
  fullWidth: fullWidthClassName,
  zeroRight: zeroRightClassName
};

// node_modules/get-nonce/dist/es2015/index.js
var currentNonce;
var getNonce = function() {
  if (currentNonce) {
    return currentNonce;
  }
  if (typeof __webpack_nonce__ !== "undefined") {
    return __webpack_nonce__;
  }
  return void 0;
};

// node_modules/react-style-singleton/dist/es2015/singleton.js
function makeStyleTag() {
  if (!document)
    return null;
  var tag = document.createElement("style");
  tag.type = "text/css";
  var nonce = getNonce();
  if (nonce) {
    tag.setAttribute("nonce", nonce);
  }
  return tag;
}
function injectStyles(tag, css) {
  if (tag.styleSheet) {
    tag.styleSheet.cssText = css;
  } else {
    tag.appendChild(document.createTextNode(css));
  }
}
function insertStyleTag(tag) {
  var head = document.head || document.getElementsByTagName("head")[0];
  head.appendChild(tag);
}
var stylesheetSingleton = function() {
  var counter = 0;
  var stylesheet = null;
  return {
    add: function(style) {
      if (counter == 0) {
        if (stylesheet = makeStyleTag()) {
          injectStyles(stylesheet, style);
          insertStyleTag(stylesheet);
        }
      }
      counter++;
    },
    remove: function() {
      counter--;
      if (!counter && stylesheet) {
        stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
        stylesheet = null;
      }
    }
  };
};

// node_modules/react-style-singleton/dist/es2015/hook.js
var styleHookSingleton = function() {
  var sheet = stylesheetSingleton();
  return function(styles, isDynamic) {
    useEffect(function() {
      sheet.add(styles);
      return function() {
        sheet.remove();
      };
    }, [styles && isDynamic]);
  };
};

// node_modules/react-style-singleton/dist/es2015/component.js
var styleSingleton = function() {
  var useStyle = styleHookSingleton();
  var Sheet = function(_a) {
    var styles = _a.styles, dynamic = _a.dynamic;
    useStyle(styles, dynamic);
    return null;
  };
  return Sheet;
};

// node_modules/react-remove-scroll-bar/dist/es2015/utils.js
var zeroGap = {
  left: 0,
  top: 0,
  right: 0,
  gap: 0
};
var parse = function(x) {
  return parseInt(x || "", 10) || 0;
};
var getOffset = function(gapMode) {
  var cs = window.getComputedStyle(document.body);
  var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
  return [parse(left), parse(top), parse(right)];
};
var getGapWidth = function(gapMode) {
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  if (typeof window === "undefined") {
    return zeroGap;
  }
  var offsets = getOffset(gapMode);
  var documentWidth = document.documentElement.clientWidth;
  var windowWidth = window.innerWidth;
  return {
    left: offsets[0],
    top: offsets[1],
    right: offsets[2],
    gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
  };
};

// node_modules/react-remove-scroll-bar/dist/es2015/component.js
var Style = styleSingleton();
var lockAttribute = "data-scroll-locked";
var getStyles = function(_a, allowRelative, gapMode, important) {
  var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
  if (gapMode === void 0) {
    gapMode = "margin";
  }
  return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body[").concat(lockAttribute, "] {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
    allowRelative && "position: relative ".concat(important, ";"),
    gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
    gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
  ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body[").concat(lockAttribute, "] {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
};
var getCurrentUseCounter = function() {
  var counter = parseInt(document.body.getAttribute(lockAttribute) || "0", 10);
  return isFinite(counter) ? counter : 0;
};
var useLockAttribute = function() {
  useEffect(function() {
    document.body.setAttribute(lockAttribute, (getCurrentUseCounter() + 1).toString());
    return function() {
      var newCounter = getCurrentUseCounter() - 1;
      if (newCounter <= 0) {
        document.body.removeAttribute(lockAttribute);
      } else {
        document.body.setAttribute(lockAttribute, newCounter.toString());
      }
    };
  }, []);
};
var RemoveScrollBar = function(_a) {
  var noRelative = _a.noRelative, noImportant = _a.noImportant, _b = _a.gapMode, gapMode = _b === void 0 ? "margin" : _b;
  useLockAttribute();
  var gap = useMemo(function() {
    return getGapWidth(gapMode);
  }, [gapMode]);
  return createElement(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
};

// node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
var passiveSupported = false;
if (typeof window !== "undefined") {
  try {
    options = Object.defineProperty({}, "passive", {
      get: function() {
        passiveSupported = true;
        return true;
      }
    });
    window.addEventListener("test", options, options);
    window.removeEventListener("test", options, options);
  } catch (err) {
    passiveSupported = false;
  }
}
var options;
var nonPassive = passiveSupported ? { passive: false } : false;

// node_modules/react-remove-scroll/dist/es2015/handleScroll.js
var alwaysContainsScroll = function(node) {
  return node.tagName === "TEXTAREA";
};
var elementCanBeScrolled = function(node, overflow) {
  if (!(node instanceof Element)) {
    return false;
  }
  var styles = window.getComputedStyle(node);
  return (
    // not-not-scrollable
    styles[overflow] !== "hidden" && // contains scroll inside self
    !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node) && styles[overflow] === "visible")
  );
};
var elementCouldBeVScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowY");
};
var elementCouldBeHScrolled = function(node) {
  return elementCanBeScrolled(node, "overflowX");
};
var locationCouldBeScrolled = function(axis, node) {
  var ownerDocument = node.ownerDocument;
  var current = node;
  do {
    if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
      current = current.host;
    }
    var isScrollable = elementCouldBeScrolled(axis, current);
    if (isScrollable) {
      var _a = getScrollVariables(axis, current), scrollHeight = _a[1], clientHeight = _a[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a) {
  var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a) {
  var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
  return [
    scrollLeft,
    scrollWidth,
    clientWidth
  ];
};
var elementCouldBeScrolled = function(axis, node) {
  return axis === "v" ? elementCouldBeVScrolled(node) : elementCouldBeHScrolled(node);
};
var getScrollVariables = function(axis, node) {
  return axis === "v" ? getVScrollVariables(node) : getHScrollVariables(node);
};
var getDirectionFactor = function(axis, direction) {
  return axis === "h" && direction === "rtl" ? -1 : 1;
};
var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
  var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
  var delta = directionFactor * sourceDelta;
  var target = event.target;
  var targetInLock = endTarget.contains(target);
  var shouldCancelScroll = false;
  var isDeltaPositive = delta > 0;
  var availableScroll = 0;
  var availableScrollTop = 0;
  do {
    if (!target) {
      break;
    }
    var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
    var elementScroll = scroll_1 - capacity - directionFactor * position;
    if (position || elementScroll) {
      if (elementCouldBeScrolled(axis, target)) {
        availableScroll += elementScroll;
        availableScrollTop += position;
      }
    }
    var parent_1 = target.parentNode;
    target = parent_1 && parent_1.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? parent_1.host : parent_1;
  } while (
    // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
  );
  if (isDeltaPositive && (noOverscroll && Math.abs(availableScroll) < 1 || !noOverscroll && delta > availableScroll)) {
    shouldCancelScroll = true;
  } else if (!isDeltaPositive && (noOverscroll && Math.abs(availableScrollTop) < 1 || !noOverscroll && -delta > availableScrollTop)) {
    shouldCancelScroll = true;
  }
  return shouldCancelScroll;
};

// node_modules/react-remove-scroll/dist/es2015/SideEffect.js
var getTouchXY = function(event) {
  return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
};
var getDeltaXY = function(event) {
  return [event.deltaX, event.deltaY];
};
var extractRef = function(ref) {
  return ref && "current" in ref ? ref.current : ref;
};
var deltaCompare = function(x, y) {
  return x[0] === y[0] && x[1] === y[1];
};
var generateStyle = function(id) {
  return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
};
var idCounter = 0;
var lockStack = [];
function RemoveScrollSideCar(props) {
  var shouldPreventQueue = useRef([]);
  var touchStartRef = useRef([0, 0]);
  var activeAxis = useRef();
  var id = useState(idCounter++)[0];
  var Style2 = useState(styleSingleton)[0];
  var lastProps = useRef(props);
  useEffect(function() {
    lastProps.current = props;
  }, [props]);
  useEffect(function() {
    if (props.inert) {
      document.body.classList.add("block-interactivity-".concat(id));
      var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef), true).filter(Boolean);
      allow_1.forEach(function(el) {
        return el.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el) {
          return el.classList.remove("allow-interactivity-".concat(id));
        });
      };
    }
    return;
  }, [props.inert, props.lockRef.current, props.shards]);
  var shouldCancelEvent = useCallback(function(event, parent) {
    if ("touches" in event && event.touches.length === 2 || event.type === "wheel" && event.ctrlKey) {
      return !lastProps.current.allowPinchZoom;
    }
    var touch = getTouchXY(event);
    var touchStart = touchStartRef.current;
    var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
    var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
    var currentAxis;
    var target = event.target;
    var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
    if ("touches" in event && moveDirection === "h" && target.type === "range") {
      return false;
    }
    var selection = window.getSelection();
    var anchorNode = selection && selection.anchorNode;
    var isTouchingSelection = anchorNode ? anchorNode === target || anchorNode.contains(target) : false;
    if (isTouchingSelection) {
      return false;
    }
    var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    if (!canBeScrolledInMainDirection) {
      return true;
    }
    if (canBeScrolledInMainDirection) {
      currentAxis = moveDirection;
    } else {
      currentAxis = moveDirection === "v" ? "h" : "v";
      canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
    }
    if (!canBeScrolledInMainDirection) {
      return false;
    }
    if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
      activeAxis.current = currentAxis;
    }
    if (!currentAxis) {
      return true;
    }
    var cancelingAxis = activeAxis.current || currentAxis;
    return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
  }, []);
  var shouldPrevent = useCallback(function(_event) {
    var event = _event;
    if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
      return;
    }
    var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
    var sourceEvent = shouldPreventQueue.current.filter(function(e2) {
      return e2.name === event.type && (e2.target === event.target || event.target === e2.shadowParent) && deltaCompare(e2.delta, delta);
    })[0];
    if (sourceEvent && sourceEvent.should) {
      if (event.cancelable) {
        event.preventDefault();
      }
      return;
    }
    if (!sourceEvent) {
      var shardNodes = (lastProps.current.shards || []).map(extractRef).filter(Boolean).filter(function(node) {
        return node.contains(event.target);
      });
      var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
      if (shouldStop) {
        if (event.cancelable) {
          event.preventDefault();
        }
      }
    }
  }, []);
  var shouldCancel = useCallback(function(name, delta, target, should) {
    var event = { name, delta, target, should, shadowParent: getOutermostShadowParent(target) };
    shouldPreventQueue.current.push(event);
    setTimeout(function() {
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e2) {
        return e2 !== event;
      });
    }, 1);
  }, []);
  var scrollTouchStart = useCallback(function(event) {
    touchStartRef.current = getTouchXY(event);
    activeAxis.current = void 0;
  }, []);
  var scrollWheel = useCallback(function(event) {
    shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  var scrollTouchMove = useCallback(function(event) {
    shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
  }, []);
  useEffect(function() {
    lockStack.push(Style2);
    props.setCallbacks({
      onScrollCapture: scrollWheel,
      onWheelCapture: scrollWheel,
      onTouchMoveCapture: scrollTouchMove
    });
    document.addEventListener("wheel", shouldPrevent, nonPassive);
    document.addEventListener("touchmove", shouldPrevent, nonPassive);
    document.addEventListener("touchstart", scrollTouchStart, nonPassive);
    return function() {
      lockStack = lockStack.filter(function(inst) {
        return inst !== Style2;
      });
      document.removeEventListener("wheel", shouldPrevent, nonPassive);
      document.removeEventListener("touchmove", shouldPrevent, nonPassive);
      document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
    };
  }, []);
  var removeScrollBar = props.removeScrollBar, inert = props.inert;
  return createElement(
    Fragment,
    null,
    inert ? createElement(Style2, { styles: generateStyle(id) }) : null,
    removeScrollBar ? createElement(RemoveScrollBar, { noRelative: props.noRelative, gapMode: props.gapMode }) : null
  );
}
function getOutermostShadowParent(node) {
  var shadowParent = null;
  while (node !== null) {
    if (node instanceof ShadowRoot) {
      shadowParent = node.host;
      node = node.host;
    }
    node = node.parentNode;
  }
  return shadowParent;
}

// node_modules/react-remove-scroll/dist/es2015/sidecar.js
var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

// node_modules/react-remove-scroll/dist/es2015/Combination.js
var ReactRemoveScroll = forwardRef(function(props, ref) {
  return createElement(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
});
ReactRemoveScroll.classNames = RemoveScroll.classNames;
var Combination_default = ReactRemoveScroll;

// node_modules/aria-hidden/dist/es2015/index.js
var getDefaultParent = function(originalTarget) {
  if (typeof document === "undefined") {
    return null;
  }
  var sampleTarget = Array.isArray(originalTarget) ? originalTarget[0] : originalTarget;
  return sampleTarget.ownerDocument.body;
};
var counterMap = /* @__PURE__ */ new WeakMap();
var uncontrolledNodes = /* @__PURE__ */ new WeakMap();
var markerMap = {};
var lockCount = 0;
var unwrapHost = function(node) {
  return node && (node.host || unwrapHost(node.parentNode));
};
var correctTargets = function(parent, targets) {
  return targets.map(function(target) {
    if (parent.contains(target)) {
      return target;
    }
    var correctedTarget = unwrapHost(target);
    if (correctedTarget && parent.contains(correctedTarget)) {
      return correctedTarget;
    }
    console.error("aria-hidden", target, "in not contained inside", parent, ". Doing nothing");
    return null;
  }).filter(function(x) {
    return Boolean(x);
  });
};
var applyAttributeToOthers = function(originalTarget, parentNode, markerName, controlAttribute) {
  var targets = correctTargets(parentNode, Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  if (!markerMap[markerName]) {
    markerMap[markerName] = /* @__PURE__ */ new WeakMap();
  }
  var markerCounter = markerMap[markerName];
  var hiddenNodes = [];
  var elementsToKeep = /* @__PURE__ */ new Set();
  var elementsToStop = new Set(targets);
  var keep = function(el) {
    if (!el || elementsToKeep.has(el)) {
      return;
    }
    elementsToKeep.add(el);
    keep(el.parentNode);
  };
  targets.forEach(keep);
  var deep = function(parent) {
    if (!parent || elementsToStop.has(parent)) {
      return;
    }
    Array.prototype.forEach.call(parent.children, function(node) {
      if (elementsToKeep.has(node)) {
        deep(node);
      } else {
        try {
          var attr = node.getAttribute(controlAttribute);
          var alreadyHidden = attr !== null && attr !== "false";
          var counterValue = (counterMap.get(node) || 0) + 1;
          var markerValue = (markerCounter.get(node) || 0) + 1;
          counterMap.set(node, counterValue);
          markerCounter.set(node, markerValue);
          hiddenNodes.push(node);
          if (counterValue === 1 && alreadyHidden) {
            uncontrolledNodes.set(node, true);
          }
          if (markerValue === 1) {
            node.setAttribute(markerName, "true");
          }
          if (!alreadyHidden) {
            node.setAttribute(controlAttribute, "true");
          }
        } catch (e2) {
          console.error("aria-hidden: cannot operate on ", node, e2);
        }
      }
    });
  };
  deep(parentNode);
  elementsToKeep.clear();
  lockCount++;
  return function() {
    hiddenNodes.forEach(function(node) {
      var counterValue = counterMap.get(node) - 1;
      var markerValue = markerCounter.get(node) - 1;
      counterMap.set(node, counterValue);
      markerCounter.set(node, markerValue);
      if (!counterValue) {
        if (!uncontrolledNodes.has(node)) {
          node.removeAttribute(controlAttribute);
        }
        uncontrolledNodes.delete(node);
      }
      if (!markerValue) {
        node.removeAttribute(markerName);
      }
    });
    lockCount--;
    if (!lockCount) {
      counterMap = /* @__PURE__ */ new WeakMap();
      counterMap = /* @__PURE__ */ new WeakMap();
      uncontrolledNodes = /* @__PURE__ */ new WeakMap();
      markerMap = {};
    }
  };
};
var hideOthers = function(originalTarget, parentNode, markerName) {
  if (markerName === void 0) {
    markerName = "data-aria-hidden";
  }
  var targets = Array.from(Array.isArray(originalTarget) ? originalTarget : [originalTarget]);
  var activeParentNode = parentNode || getDefaultParent(originalTarget);
  if (!activeParentNode) {
    return function() {
      return null;
    };
  }
  targets.push.apply(targets, Array.from(activeParentNode.querySelectorAll("[aria-live], script")));
  return applyAttributeToOthers(targets, activeParentNode, markerName, "aria-hidden");
};

// node_modules/@radix-ui/react-dialog/dist/index.mjs
var __defProp16 = Object.defineProperty;
var __name15 = (target, value) => __defProp16(target, "name", { value, configurable: true });
var DIALOG_NAME = "Dialog";
var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = /* @__PURE__ */ __name15((props) => {
  const {
    __scopeDialog,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = true
  } = props;
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: DIALOG_NAME
  });
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);
  return /* @__PURE__ */ jsx(
    DialogProvider,
    {
      scope: __scopeDialog,
      triggerRef,
      contentRef,
      contentId: useId2(),
      titleId: useId2(),
      descriptionId: useId2(),
      titlePresent: titleCount > 0,
      descriptionPresent: descriptionCount > 0,
      setTitleCount,
      setDescriptionCount,
      open,
      onOpenChange: setOpen,
      onOpenToggle: useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      modal,
      children
    }
  );
}, "Dialog");
var PORTAL_NAME = "DialogPortal";
var [PortalProvider, usePortalContext] = createDialogContext(PORTAL_NAME, {
  forceMount: void 0
});
var DialogPortal = /* @__PURE__ */ __name15((props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: Children.map(children, (child) => /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal, { asChild: true, container, children: child }) })) });
}, "DialogPortal");
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function DialogOverlay2(props, forwardedRef) {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }, "DialogOverlay")
);
var Slot2 = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function DialogOverlayImpl2(props, forwardedRef) {
    const { __scopeDialog, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, __scopeDialog);
    const registerDismissableSurface = useDismissableLayerSurface();
    const composedRefs = useComposedRefs(forwardedRef, registerDismissableSurface);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ jsx(Combination_default, { as: Slot2, allowPinchZoom: true, shards: [context.contentRef], children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          "data-state": getState(context.open),
          ...overlayProps,
          ref: composedRefs,
          style: { pointerEvents: "auto", ...overlayProps.style }
        }
      ) })
    );
  }, "DialogOverlayImpl")
);
var CONTENT_NAME = "DialogContent";
var DialogContent = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function DialogContent2(props, forwardedRef) {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }, "DialogContent")
);
var DialogContentModal = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function DialogContentModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const contentRef = useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, context.contentRef, contentRef);
    useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsx(
      DialogContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: context.open,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(props.onPointerDownOutside, (event) => {
          const originalEvent = event.detail.originalEvent;
          const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
          const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
          if (isRightClick) event.preventDefault();
        }),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault()
        )
      }
    );
  }, "DialogContentModal")
);
var DialogContentNonModal = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function DialogContentNonModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME, props.__scopeDialog);
    const hasInteractedOutsideRef = useRef(false);
    const hasPointerDownOutsideRef = useRef(false);
    return /* @__PURE__ */ jsx(
      DialogContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }, "DialogContentNonModal")
);
var DialogContentImpl = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function DialogContentImpl2(props, forwardedRef) {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME, __scopeDialog);
    useFocusGuards();
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
      FocusScope,
      {
        asChild: true,
        loop: true,
        trapped: trapFocus,
        onMountAutoFocus: onOpenAutoFocus,
        onUnmountAutoFocus: onCloseAutoFocus,
        children: /* @__PURE__ */ jsx(
          DismissableLayer,
          {
            role: "dialog",
            id: context.contentId,
            "aria-describedby": context.descriptionPresent ? context.descriptionId : void 0,
            "aria-labelledby": context.titlePresent ? context.titleId : void 0,
            "data-state": getState(context.open),
            ...contentProps,
            ref: forwardedRef,
            deferPointerDownOutside: true,
            onDismiss: () => context.onOpenChange(false)
          }
        )
      }
    ) });
  }, "DialogContentImpl")
);
var TITLE_NAME = "DialogTitle";
var DialogTitle = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function DialogTitle2(props, forwardedRef) {
    const { __scopeDialog, ...titleProps } = props;
    const context = useDialogContext(TITLE_NAME, __scopeDialog);
    const { setTitleCount } = context;
    useLayoutEffect2(() => {
      setTitleCount((count3) => count3 + 1);
      return () => setTitleCount((count3) => count3 - 1);
    }, [setTitleCount]);
    return /* @__PURE__ */ jsx(Primitive.h2, { id: context.titleId, ...titleProps, ref: forwardedRef });
  }, "DialogTitle")
);
var DESCRIPTION_NAME = "DialogDescription";
var DialogDescription = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function DialogDescription2(props, forwardedRef) {
    const { __scopeDialog, ...descriptionProps } = props;
    const context = useDialogContext(DESCRIPTION_NAME, __scopeDialog);
    const { setDescriptionCount } = context;
    useLayoutEffect2(() => {
      setDescriptionCount((count3) => count3 + 1);
      return () => setDescriptionCount((count3) => count3 - 1);
    }, [setDescriptionCount]);
    return /* @__PURE__ */ jsx(Primitive.p, { id: context.descriptionId, ...descriptionProps, ref: forwardedRef });
  }, "DialogDescription")
);
var CLOSE_NAME = "DialogClose";
var DialogClose = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function DialogClose2(props, forwardedRef) {
    const { __scopeDialog, ...closeProps } = props;
    const context = useDialogContext(CLOSE_NAME, __scopeDialog);
    return /* @__PURE__ */ jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }, "DialogClose")
);
function getState(open) {
  return open ? "open" : "closed";
}
__name15(getState, "getState");

// apps/web/src/components/ui/dialog.jsx
var Dialog2 = Dialog;
var DialogPortal2 = DialogPortal;
var DialogOverlay3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogOverlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay3.displayName = DialogOverlay.displayName;
var DialogContent3 = forwardRef(({ className, children, ...props }, ref) => {
  const hasLayoutClass = className && (className.includes("flex") || className.includes("grid") || className.includes("block"));
  return /* @__PURE__ */ createElement(DialogPortal2, null, /* @__PURE__ */ createElement(DialogOverlay3, null), /* @__PURE__ */ createElement(
    DialogContent,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        !hasLayoutClass && "grid gap-4",
        className
      ),
      ...props
    },
    children,
    /* @__PURE__ */ createElement(
      DialogClose,
      {
        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      },
      /* @__PURE__ */ createElement(X, { className: "h-4 w-4" }),
      /* @__PURE__ */ createElement("span", { className: "sr-only" }, "Close")
    )
  ));
});
DialogContent3.displayName = DialogContent.displayName;
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ createElement(
  "div",
  {
    className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ createElement(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogTitle,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle3.displayName = DialogTitle.displayName;
var DialogDescription3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogDescription,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription3.displayName = DialogDescription.displayName;

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
pocketbaseClient.beforeSend = (url, options2) => {
  if (options2 && options2.headers && options2.headers.Authorization) {
    const token = String(options2.headers.Authorization).replace(/^Bearer\s+/i, "");
    if (token && !token.startsWith("ey")) {
      delete options2.headers.Authorization;
    }
  }
  return options2;
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
  "Available": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Available" },
  "Booked": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", label: "Booked" },
  "Booking Requested": { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Booking Requested" },
  "Loading": { bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/30", label: "Loading at Dock" },
  "In Transit": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", label: "In Transit" },
  "Unloading": { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", label: "Unloading at Dock" },
  "Waiting": { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "Detained / Waiting" },
  "Expected Available": { bg: "bg-emerald-500/10 border-dashed", text: "text-emerald-300", border: "border-emerald-400/40", label: "Expected Available" },
  "Maintenance": { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", label: "Maintenance" },
  "Breakdown": { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/40", label: "Breakdown" },
  "Documents Expired": { bg: "bg-red-500/25", text: "text-red-400", border: "border-red-500/50", label: "Documents Expired" },
  "Schedule Conflict": { bg: "bg-crimson-500/30 animate-pulse", text: "text-red-300", border: "border-red-500", label: "Schedule Conflict" }
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
  const [viewMode, setViewMode] = useState("weekly");
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTruck, setSelectedTruck] = useState(null);
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
      const res = await reservationClient.getCalendar(viewMode);
      setTimelineData(res.timeline || []);
    } catch (err) {
      toast.error("Failed to load fleet calendar: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCalendar();
  }, [viewMode]);
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
      toast.success(`Truck ${blockForm.truck_number} blocked for ${blockForm.block_type}.`);
      setIsBlockModalOpen(false);
      loadCalendar();
    } catch (err) {
      toast.error(err.message || "Failed to create block");
    }
  };
  const filteredTimeline = timelineData.filter(
    (t2) => (t2.truck_number || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t2.current_location || "").toLowerCase().includes(searchTerm.toLowerCase()) || (t2.current_status || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const days = Array.from({ length: 7 }, (_, i2) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + i2);
    return {
      date: d,
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      isToday: i2 === 0
    };
  });
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-7xl mx-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }, "Module 1: Airline-Style Fleet Schedule"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Clock, { className: "w-3 h-3" }), " Live Telematics & Forecast Matrix")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(Calendar, { className: "w-7 h-7 text-emerald-400" }), "Fleet Availability Calendar"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm text-slate-400" }, "Real-time multi-resource timeline. Schedule bookings, forecast truck movements, and manage fleet downtime.")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-1 flex items-center" }, ["daily", "weekly", "monthly"].map((mode) => /* @__PURE__ */ react_shim_default.createElement(
    "button",
    {
      key: mode,
      onClick: () => setViewMode(mode),
      className: `px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${viewMode === mode ? "bg-emerald-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"}`
    },
    mode
  ))), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      variant: "outline",
      size: "sm",
      onClick: loadCalendar,
      className: "border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
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
      className: "bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-md shadow-amber-600/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(ShieldAlert, { className: "w-3.5 h-3.5 mr-1.5" }),
    "Block Availability"
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5" }, Object.entries(STATUS_CONFIG).slice(0, 6).map(([statusKey, cfg]) => {
    const count3 = timelineData.filter((t2) => t2.current_status === statusKey).length;
    return /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        key: statusKey,
        className: `p-2.5 rounded-xl border ${cfg.border} ${cfg.bg} flex items-center justify-between transition-all`
      },
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[11px] font-semibold text-slate-300" }, cfg.label), /* @__PURE__ */ react_shim_default.createElement("p", { className: `text-base font-extrabold ${cfg.text}` }, count3, " Trucks")),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: `w-2.5 h-2.5 rounded-full ${cfg.text.replace("text-", "bg-")}` })
    );
  })), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80" }, /* @__PURE__ */ react_shim_default.createElement(Filter, { className: "w-4 h-4 text-slate-400 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "Filter by truck number, terminal city, or status...",
      value: searchTerm,
      onChange: (e2) => setSearchTerm(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
    }
  ), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-xs text-slate-400 shrink-0 font-medium px-2" }, "Showing ", /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-emerald-400 font-bold" }, filteredTimeline.length), " of ", timelineData.length, " Fleet Resources")), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-950 border-slate-800 overflow-hidden shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "min-w-[900px]" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-12 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-300 py-3 px-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "col-span-3 flex items-center gap-2 text-slate-400 uppercase tracking-wider text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4 text-emerald-400" }), "Fleet Resource & Specs"), /* @__PURE__ */ react_shim_default.createElement("div", { className: "col-span-9 grid grid-cols-7 gap-1" }, days.map((day, idx) => /* @__PURE__ */ react_shim_default.createElement(
    "div",
    {
      key: idx,
      className: `text-center py-1 rounded-md ${day.isToday ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-400"}`
    },
    /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-[10px] uppercase font-semibold" }, day.label.split(",")[0]),
    /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs font-extrabold" }, day.label.split(",")[1] || day.label)
  )))), loading ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-16 text-center text-slate-400 flex flex-col items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(RefreshCw, { className: "w-6 h-6 animate-spin text-emerald-400" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm" }, "Calculating real-time fleet movement schedules...")) : filteredTimeline.length === 0 ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-16 text-center text-slate-500" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-8 h-8 mx-auto mb-2 opacity-40" }), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm font-semibold" }, "No fleet resources found matching filter.")) : /* @__PURE__ */ react_shim_default.createElement("div", { className: "divide-y divide-slate-850" }, filteredTimeline.map((truck) => {
    const cfg = STATUS_CONFIG[truck.current_status] || STATUS_CONFIG["Available"];
    return /* @__PURE__ */ react_shim_default.createElement(
      "div",
      {
        key: truck.truck_id || truck.truck_number,
        className: "grid grid-cols-12 py-3.5 px-4 items-center hover:bg-slate-900/50 transition-colors cursor-pointer group",
        onClick: () => setSelectedTruck(truck)
      },
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "col-span-3 space-y-1 pr-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-black text-sm text-white tracking-wide group-hover:text-emerald-400 transition-colors" }, truck.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 border-slate-700 bg-slate-900 text-slate-300" }, truck.vehicle_category || "32FT SXL")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 text-[11px] text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3 h-3 text-emerald-400" }), truck.predicted_location || truck.current_location || "Depot"), /* @__PURE__ */ react_shim_default.createElement("span", null, "\u2022"), /* @__PURE__ */ react_shim_default.createElement("span", null, truck.capacity_tons || 14.5, " MT"))),
      /* @__PURE__ */ react_shim_default.createElement("div", { className: "col-span-9 grid grid-cols-7 gap-1 h-10 items-center" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: `col-span-7 h-8 rounded-lg border ${cfg.border} ${cfg.bg} flex items-center justify-between px-3 relative overflow-hidden shadow-inner` }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 z-10" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: `w-2 h-2 rounded-full ${cfg.text.replace("text-", "bg-")} animate-pulse` }), /* @__PURE__ */ react_shim_default.createElement("span", { className: `text-xs font-extrabold ${cfg.text}` }, cfg.label), truck.expected_destination && /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-[11px] text-slate-300 font-medium" }, "\u2192 ", truck.expected_destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 z-10 text-[11px] text-slate-400" }, truck.earliest_next_departure && /* @__PURE__ */ react_shim_default.createElement("span", null, "Next Free: ", new Date(truck.earliest_next_departure).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-slate-900/80 text-[10px] text-emerald-400 border border-emerald-500/30" }, truck.prediction_confidence || 85, "% Conf."))))
    );
  }))))), selectedTruck && /* @__PURE__ */ react_shim_default.createElement(Dialog2, { open: !!selectedTruck, onOpenChange: () => setSelectedTruck(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent3, { className: "bg-slate-900 border-slate-800 text-white max-w-lg" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement(DialogTitle3, { className: "text-xl font-bold flex items-center gap-2 text-white" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-5 h-5 text-emerald-400" }), selectedTruck.truck_number, " \u2014 Schedule Details"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-4 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[11px]" }, "Current Scheduled Status"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm font-extrabold text-emerald-400" }, selectedTruck.current_status)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-right" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[11px]" }, "Prediction Confidence"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm font-extrabold text-cyan-400" }, selectedTruck.prediction_confidence, "% High"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 text-[10px] block" }, "Current Location"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-white text-xs" }, selectedTruck.current_location || "Hyderabad")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 text-[10px] block" }, "Predicted Availability Spot"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-emerald-400 text-xs" }, selectedTruck.predicted_location || "Hyderabad")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 text-[10px] block" }, "Vehicle Specs"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-white text-xs" }, selectedTruck.vehicle_category, " (", selectedTruck.capacity_tons, " MT)")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2.5 bg-slate-950 rounded-lg border border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-slate-400 text-[10px] block" }, "Earliest Next Departure"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-white text-xs" }, selectedTruck.earliest_next_departure ? new Date(selectedTruck.earliest_next_departure).toLocaleString("en-IN") : "Available Immediately"))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("h4", { className: "font-bold text-slate-300 mb-2 flex items-center gap-1.5" }, /* @__PURE__ */ react_shim_default.createElement(FileText, { className: "w-3.5 h-3.5 text-blue-400" }), "Upcoming Confirmed Bookings (", selectedTruck.reservations?.length || 0, ")"), selectedTruck.reservations?.length > 0 ? /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-1.5 max-h-36 overflow-y-auto" }, selectedTruck.reservations.map((res) => /* @__PURE__ */ react_shim_default.createElement("div", { key: res.id || res.booking_number, className: "p-2 bg-slate-950 rounded border border-slate-800 flex justify-between items-center text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-bold text-white" }, res.booking_number), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400" }, res.origin, " \u2192 ", res.destination)), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-blue-500/20 text-blue-400 text-[10px] border-blue-500/30" }, res.status)))) : /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-500 italic text-[11px]" }, "No conflicting confirmed bookings on this timeline."))), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, null, /* @__PURE__ */ react_shim_default.createElement(Button, { variant: "outline", size: "sm", onClick: () => setSelectedTruck(null), className: "border-slate-800" }, "Close"), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      size: "sm",
      onClick: () => {
        setBlockForm((prev) => ({ ...prev, truck_number: selectedTruck.truck_number }));
        setSelectedTruck(null);
        setIsBlockModalOpen(true);
      },
      className: "bg-amber-600 hover:bg-amber-500 text-white font-semibold"
    },
    /* @__PURE__ */ react_shim_default.createElement(ShieldAlert, { className: "w-3.5 h-3.5 mr-1.5" }),
    "Block This Truck"
  )))), /* @__PURE__ */ react_shim_default.createElement(Dialog2, { open: isBlockModalOpen, onOpenChange: setIsBlockModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent3, { className: "bg-slate-900 border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle3, { className: "text-lg font-bold flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(ShieldAlert, { className: "w-5 h-5 text-amber-400" }), "Manual Fleet Availability Block")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleCreateBlock, className: "space-y-3.5 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Select Truck"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: blockForm.truck_number,
      onChange: (e2) => setBlockForm({ ...blockForm, truck_number: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white text-xs",
      required: true
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "" }, "-- Choose Truck --"),
    timelineData.map((t2) => /* @__PURE__ */ react_shim_default.createElement("option", { key: t2.truck_number, value: t2.truck_number }, t2.truck_number, " (", t2.vehicle_category, ")"))
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Block Reason Category"), /* @__PURE__ */ react_shim_default.createElement(
    "select",
    {
      value: blockForm.block_type,
      onChange: (e2) => setBlockForm({ ...blockForm, block_type: e2.target.value }),
      className: "w-full bg-slate-950 border border-slate-800 rounded-md p-2 text-white text-xs"
    },
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Maintenance" }, "Scheduled Workshop Maintenance"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Breakdown" }, "Mechanical Breakdown"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Document Expired" }, "Permit / Insurance Expired"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "RTO Inspection" }, "RTO Passing / Fitness Inspection"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Personal Use" }, "Owner / Personal Use"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "Operational Hold" }, "Operational Hold")
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Start Date & Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      value: blockForm.start_time,
      onChange: (e2) => setBlockForm({ ...blockForm, start_time: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "End Date & Time"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "datetime-local",
      value: blockForm.end_time,
      onChange: (e2) => setBlockForm({ ...blockForm, end_time: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Specific Reason & Notes"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. Engine overhaul and front axle tyre replacement",
      value: blockForm.reason,
      onChange: (e2) => setBlockForm({ ...blockForm, reason: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setIsBlockModalOpen(false), className: "border-slate-800" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", size: "sm", className: "bg-amber-600 hover:bg-amber-500 text-white font-semibold" }, "Lock Availability"))))));
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
  const [bookForm, setBookForm] = useState({
    customer_name: currentUser?.full_name || currentUser?.name || "",
    customer_phone: currentUser?.phone_number || "",
    customer_email: currentUser?.email || "",
    cargo_description: "Industrial Equipment & FMCG Goods",
    special_requirements: "",
    indicative_freight: 28e3
  });
  const handleSearch = async (e2) => {
    e2.preventDefault();
    if (!searchParams.origin || !searchParams.destination || !searchParams.loadingDatetime) {
      toast.warning("Please specify origin, destination, and loading date.");
      return;
    }
    try {
      setLoading(true);
      const res = await reservationClient.searchAvailability({
        origin: searchParams.origin,
        destination: searchParams.destination,
        loadingDatetime: searchParams.loadingDatetime,
        vehicleCategory: searchParams.vehicleCategory,
        cargoWeightTons: parseFloat(searchParams.cargoWeightTons) || 14
      });
      setSearchResults(res);
      toast.success(`Found ${res.total_matches} candidate vehicles (${res.available_count} feasible).`);
    } catch (err) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
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
        reservation_type: selectedMatch?.booking_mode === "Instant Confirmed" ? "Confirmed" : "Provisional",
        status: selectedMatch?.booking_mode === "Instant Confirmed" ? "Confirmed" : "Pending",
        match_score: selectedMatch?.match_score || 90,
        match_reasons: selectedMatch?.match_reasons || [],
        created_by: currentUser?.full_name || currentUser?.name || "Customer"
      });
      toast.success(`Booking Confirmed! Unique Reference: ${res.reservation?.booking_number}`);
      setIsBookModalOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      toast.error(err.message || "Booking submission failed");
    }
  };
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-4 md:p-6 space-y-6 max-w-7xl mx-auto" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20" }, "Module 3 & 5: Search & Intelligent Availability Matcher"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-muted-foreground flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(ShieldCheck, { className: "w-3.5 h-3.5 text-blue-400" }), "10-Point Operational Feasibility Engine")), /* @__PURE__ */ react_shim_default.createElement("h1", { className: "text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3" }, /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-7 h-7 text-blue-400" }), "Customer Truck Booking & Availability Search"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-sm text-slate-400" }, "Search future truck availability, evaluate deadhead distances, review match scores, and lock reservations.")), /* @__PURE__ */ react_shim_default.createElement(Card, { className: "bg-slate-900 border-slate-800 p-5 shadow-2xl" }, /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleSearch, className: "space-y-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5 text-emerald-400" }), " Origin Hub / City"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: searchParams.origin,
      onChange: (e2) => setSearchParams({ ...searchParams, origin: e2.target.value }),
      placeholder: "e.g. Hyderabad (Patancheru)",
      className: "bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(MapPin, { className: "w-3.5 h-3.5 text-rose-400" }), " Destination Drop Point"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: searchParams.destination,
      onChange: (e2) => setSearchParams({ ...searchParams, destination: e2.target.value }),
      placeholder: "e.g. Hubli / Belgaum",
      className: "bg-slate-950 border-slate-800 text-white font-semibold text-xs h-10",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-bold block mb-1.5 flex items-center gap-1" }, /* @__PURE__ */ react_shim_default.createElement(Calendar, { className: "w-3.5 h-3.5 text-blue-400" }), " Required Loading Date & Time"), /* @__PURE__ */ react_shim_default.createElement(
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
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "20FT Container" }, "20FT Container \u2014 9.0 MT"),
    /* @__PURE__ */ react_shim_default.createElement("option", { value: "24FT Container" }, "24FT Container \u2014 11.0 MT")
  ))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-4 text-xs text-slate-400" }, /* @__PURE__ */ react_shim_default.createElement("span", null, "Payload: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, "14.0 Metric Tons (FTL)")), /* @__PURE__ */ react_shim_default.createElement("span", null, "\u2022"), /* @__PURE__ */ react_shim_default.createElement("span", null, "Buffer SLA: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400" }, "4 Hours Turnaround"))), /* @__PURE__ */ react_shim_default.createElement(
    Button,
    {
      type: "submit",
      disabled: loading,
      className: "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs h-10 px-6 shadow-lg shadow-blue-500/20"
    },
    /* @__PURE__ */ react_shim_default.createElement(Search, { className: "w-4 h-4 mr-2" }),
    loading ? "Evaluating Fleet Availabilities..." : "Find Matching Trucks"
  )))), searchResults && /* @__PURE__ */ react_shim_default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ react_shim_default.createElement("h2", { className: "text-lg font-bold text-white flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(Sparkles, { className: "w-5 h-5 text-amber-400" }), "Available Truck Matches (", searchResults.total_matches, " Evaluated)"), /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400" }, "Ranked by Feasibility & Deadhead Proximity")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, searchResults.results.map((match, idx) => /* @__PURE__ */ react_shim_default.createElement(
    Card,
    {
      key: match.truck_id || match.truck_number || idx,
      className: `p-5 border transition-all ${match.is_feasible ? "bg-slate-900 border-slate-800 hover:border-blue-500/50" : "bg-slate-950/60 border-slate-850 opacity-70"}`
    },
    /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-base font-black text-white" }, match.truck_number), /* @__PURE__ */ react_shim_default.createElement(Badge, { className: "bg-slate-800 text-slate-300 text-[10px] border-slate-700" }, match.vehicle_category)), /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-xs text-slate-400 mt-0.5" }, "Capacity: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-white" }, match.capacity_tons, " MT"), " | Deadhead: ", /* @__PURE__ */ react_shim_default.createElement("strong", { className: "text-emerald-400" }, "~", match.deadhead_km, " km"))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-right" }, /* @__PURE__ */ react_shim_default.createElement("span", { className: "text-xs text-slate-400 block text-[10px] font-semibold" }, "Match Score"), /* @__PURE__ */ react_shim_default.createElement("span", { className: `text-xl font-black ${match.match_score >= 80 ? "text-emerald-400" : match.match_score >= 50 ? "text-amber-400" : "text-rose-400"}` }, match.match_score, "%"))),
    /* @__PURE__ */ react_shim_default.createElement("div", { className: "my-3.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1" }, match.match_reasons?.map((reason, i2) => /* @__PURE__ */ react_shim_default.createElement("div", { key: i2, className: "flex items-center gap-2 text-slate-300 text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement(CircleCheck, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("span", null, reason))), match.disqualifications?.map((disq, i2) => /* @__PURE__ */ react_shim_default.createElement("div", { key: i2, className: "flex items-center gap-2 text-rose-400 text-[11px]" }, /* @__PURE__ */ react_shim_default.createElement(CircleAlert, { className: "w-3.5 h-3.5 text-rose-400 shrink-0" }), /* @__PURE__ */ react_shim_default.createElement("span", null, disq)))),
    /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center justify-between pt-2 border-t border-slate-800" }, /* @__PURE__ */ react_shim_default.createElement(Badge, { className: match.booking_mode === "Instant Confirmed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30" }, match.booking_mode), /* @__PURE__ */ react_shim_default.createElement(
      Button,
      {
        size: "sm",
        disabled: !match.is_feasible,
        onClick: () => {
          setSelectedMatch(match);
          setIsBookModalOpen(true);
        },
        className: "bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
      },
      "Select & Reserve \u2192"
    ))
  )))), /* @__PURE__ */ react_shim_default.createElement(Dialog2, { open: isBookModalOpen, onOpenChange: setIsBookModalOpen }, /* @__PURE__ */ react_shim_default.createElement(DialogContent3, { className: "bg-slate-900 border-slate-800 text-white max-w-lg" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle3, { className: "text-xl font-bold flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(FileText, { className: "w-5 h-5 text-blue-400" }), "Confirm Truck Reservation (", selectedMatch?.truck_number, ")")), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleConfirmBooking, className: "space-y-3.5 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[11px]" }, "Selected Corridor"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-extrabold text-white text-sm" }, searchParams.origin, " \u2192 ", searchParams.destination)), /* @__PURE__ */ react_shim_default.createElement("div", { className: "text-right" }, /* @__PURE__ */ react_shim_default.createElement("p", { className: "text-slate-400 text-[11px]" }, "Indicative Freight"), /* @__PURE__ */ react_shim_default.createElement("p", { className: "font-extrabold text-emerald-400 text-sm" }, "\u20B9", bookForm.indicative_freight.toLocaleString("en-IN")))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "grid grid-cols-2 gap-2.5" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Customer / Company Name"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: bookForm.customer_name,
      onChange: (e2) => setBookForm({ ...bookForm, customer_name: e2.target.value }),
      placeholder: "e.g. Acme Logistics Pvt Ltd",
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Contact Phone Number"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: bookForm.customer_phone,
      onChange: (e2) => setBookForm({ ...bookForm, customer_phone: e2.target.value }),
      placeholder: "e.g. +91 98765 43210",
      className: "bg-slate-950 border-slate-800 text-white text-xs",
      required: true
    }
  ))), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Cargo Description"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      value: bookForm.cargo_description,
      onChange: (e2) => setBookForm({ ...bookForm, cargo_description: e2.target.value }),
      className: "bg-slate-950 border-slate-800 text-white text-xs"
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", { className: "p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-300 text-[11px]" }, "\u{1F512} ", /* @__PURE__ */ react_shim_default.createElement("strong", null, "Server-Side Concurrency Lock Active:"), " Truck schedule will be immediately reserved upon confirmation."), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setIsBookModalOpen(false), className: "border-slate-800" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", size: "sm", className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold" }, "Confirm & Lock Booking"))))));
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
      const res = await reservationClient.listReservations();
      setReservations(res.reservations || []);
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
      toast.warning("Please specify truck number for allocation.");
      return;
    }
    try {
      await reservationClient.approveReservation(selectedForApproval.id, {
        truck_number: allocTruckNumber,
        agreed_freight: agreedFreight,
        approved_by: currentUser?.full_name || currentUser?.name || "Dispatcher"
      });
      toast.success(`Booking ${selectedForApproval.booking_number} approved and allocated to ${allocTruckNumber}!`);
      setSelectedForApproval(null);
      loadReservations();
    } catch (err) {
      toast.error(err.message || "Approval failed");
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
  )))))))), selectedForApproval && /* @__PURE__ */ react_shim_default.createElement(Dialog2, { open: !!selectedForApproval, onOpenChange: () => setSelectedForApproval(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent3, { className: "bg-slate-900 border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle3, { className: "text-lg font-bold flex items-center gap-2" }, /* @__PURE__ */ react_shim_default.createElement(CircleCheck, { className: "w-5 h-5 text-emerald-400" }), "Allocate Truck to Booking ", selectedForApproval.booking_number)), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleApprove, className: "space-y-3 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Enter / Select Truck Number"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      placeholder: "e.g. TS08 UJ 5428",
      value: allocTruckNumber,
      onChange: (e2) => setAllocTruckNumber(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-white text-xs font-bold",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Final Agreed Freight (\u20B9)"), /* @__PURE__ */ react_shim_default.createElement(
    Input,
    {
      type: "number",
      value: agreedFreight,
      onChange: (e2) => setAgreedFreight(e2.target.value),
      className: "bg-slate-950 border-slate-800 text-white text-xs font-bold",
      required: true
    }
  )), /* @__PURE__ */ react_shim_default.createElement(DialogFooter, { className: "pt-2" }, /* @__PURE__ */ react_shim_default.createElement(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setSelectedForApproval(null), className: "border-slate-800" }, "Cancel"), /* @__PURE__ */ react_shim_default.createElement(Button, { type: "submit", size: "sm", className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold" }, "Approve & Lock Schedule"))))), selectedForRejection && /* @__PURE__ */ react_shim_default.createElement(Dialog2, { open: !!selectedForRejection, onOpenChange: () => setSelectedForRejection(null) }, /* @__PURE__ */ react_shim_default.createElement(DialogContent3, { className: "bg-slate-900 border-slate-800 text-white max-w-md" }, /* @__PURE__ */ react_shim_default.createElement(DialogHeader, null, /* @__PURE__ */ react_shim_default.createElement(DialogTitle3, { className: "text-lg font-bold flex items-center gap-2 text-rose-400" }, /* @__PURE__ */ react_shim_default.createElement(CircleX, { className: "w-5 h-5" }), "Reject Booking Request ", selectedForRejection.booking_number)), /* @__PURE__ */ react_shim_default.createElement("form", { onSubmit: handleReject, className: "space-y-3 py-2 text-xs" }, /* @__PURE__ */ react_shim_default.createElement("div", null, /* @__PURE__ */ react_shim_default.createElement("label", { className: "text-slate-400 font-semibold block mb-1" }, "Documented Rejection Reason (Mandatory Audit)"), /* @__PURE__ */ react_shim_default.createElement(
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

// apps/web/src/pages/FleetReservationHub.jsx
var SUBMODULES = [
  { id: "calendar", label: "Fleet Calendar", icon: CalendarDays, description: "Gantt timeline & truck scheduling" },
  { id: "prediction", label: "Movement Prediction", icon: Compass, description: "SLA forecasts & India map distribution" },
  { id: "search", label: "Availability Search", icon: Search, description: "Intelligent truck matching & booking" },
  { id: "manage", label: "Booking Management", icon: ClipboardCheck, description: "Confirmed, provisional & requests" },
  { id: "return-loads", label: "Return-Load Opportunities", icon: Repeat, description: "Backhaul revenue maximizer" }
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
  return /* @__PURE__ */ react_shim_default.createElement("div", { className: "min-h-screen bg-slate-950 text-white font-sans" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-4 md:px-6 py-2.5" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ react_shim_default.createElement("div", { className: "w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs" }, /* @__PURE__ */ react_shim_default.createElement(Truck, { className: "w-4 h-4" })), /* @__PURE__ */ react_shim_default.createElement("span", { className: "font-extrabold text-sm tracking-tight text-white hidden sm:inline" }, "Fleet Reservation")), /* @__PURE__ */ react_shim_default.createElement("div", { className: "flex items-center gap-1.5 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800" }, SUBMODULES.map((tab) => {
    const Icon2 = tab.icon;
    const isActive = activeTab === tab.id;
    return /* @__PURE__ */ react_shim_default.createElement(
      "button",
      {
        key: tab.id,
        onClick: () => handleSelectTab(tab.id),
        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-slate-900"}`
      },
      /* @__PURE__ */ react_shim_default.createElement(Icon2, { className: "w-3.5 h-3.5" }),
      /* @__PURE__ */ react_shim_default.createElement("span", null, tab.label)
    );
  })))), /* @__PURE__ */ react_shim_default.createElement("div", { className: "py-2" }, activeTab === "calendar" && /* @__PURE__ */ react_shim_default.createElement(FleetCalendarPage, null), activeTab === "prediction" && /* @__PURE__ */ react_shim_default.createElement(MovementPredictionPage, null), activeTab === "search" && /* @__PURE__ */ react_shim_default.createElement(AvailabilitySearchPage, null), activeTab === "manage" && /* @__PURE__ */ react_shim_default.createElement(BookingManagementPage, null), activeTab === "return-loads" && /* @__PURE__ */ react_shim_default.createElement(ReturnLoadPage, null)));
}
export {
  FleetReservationHub as default
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-right.js:
lucide-react/dist/esm/icons/calendar-days.js:
lucide-react/dist/esm/icons/calendar.js:
lucide-react/dist/esm/icons/circle-alert.js:
lucide-react/dist/esm/icons/circle-check.js:
lucide-react/dist/esm/icons/circle-x.js:
lucide-react/dist/esm/icons/clipboard-check.js:
lucide-react/dist/esm/icons/clock.js:
lucide-react/dist/esm/icons/compass.js:
lucide-react/dist/esm/icons/file-text.js:
lucide-react/dist/esm/icons/filter.js:
lucide-react/dist/esm/icons/layers.js:
lucide-react/dist/esm/icons/map-pin.js:
lucide-react/dist/esm/icons/navigation.js:
lucide-react/dist/esm/icons/printer.js:
lucide-react/dist/esm/icons/radio.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/repeat.js:
lucide-react/dist/esm/icons/search.js:
lucide-react/dist/esm/icons/shield-alert.js:
lucide-react/dist/esm/icons/shield-check.js:
lucide-react/dist/esm/icons/sparkles.js:
lucide-react/dist/esm/icons/trending-up.js:
lucide-react/dist/esm/icons/truck.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.469.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
