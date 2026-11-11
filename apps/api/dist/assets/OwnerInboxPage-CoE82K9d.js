var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// virtual:virtual-react
var virtual_react_exports = {};
__export(virtual_react_exports, {
  Children: () => Children,
  Component: () => Component,
  Fragment: () => Fragment,
  Profiler: () => Profiler,
  PureComponent: () => PureComponent,
  StrictMode: () => StrictMode,
  Suspense: () => Suspense,
  act: () => act,
  cloneElement: () => cloneElement,
  createContext: () => createContext,
  createElement: () => createElement,
  createFactory: () => createFactory,
  createRef: () => createRef,
  default: () => virtual_react_default,
  forwardRef: () => forwardRef,
  isValidElement: () => isValidElement,
  jsx: () => jsx,
  jsxDEV: () => jsxDEV,
  jsxs: () => jsxs,
  lazy: () => lazy,
  memo: () => memo,
  startTransition: () => startTransition,
  useCallback: () => useCallback,
  useContext: () => useContext,
  useDebugValue: () => useDebugValue,
  useDeferredValue: () => useDeferredValue,
  useEffect: () => useEffect,
  useId: () => useId,
  useImperativeHandle: () => useImperativeHandle,
  useInsertionEffect: () => useInsertionEffect,
  useLayoutEffect: () => useLayoutEffect,
  useMemo: () => useMemo,
  useReducer: () => useReducer,
  useRef: () => useRef,
  useState: () => useState,
  useSyncExternalStore: () => useSyncExternalStore,
  useTransition: () => useTransition,
  version: () => version
});

// dist/assets/vendor-radix-BQCqNqg0.js
function u(n, t7, { checkForDefaultPrevented: a = true } = {}) {
  return function(e) {
    if (n?.(e), a === false || !e.defaultPrevented) return t7?.(e);
  };
}
function c(n, [t7, a]) {
  return Math.min(a, Math.max(t7, n));
}

// dist/assets/vendor-react-Bs5V2qFE.js
function Jw(t7, r2) {
  for (var o = 0; o < r2.length; o++) {
    const a = r2[o];
    if (typeof a != "string" && !Array.isArray(a)) {
      for (const l in a) if (l !== "default" && !(l in t7)) {
        const s = Object.getOwnPropertyDescriptor(a, l);
        s && Object.defineProperty(t7, l, s.get ? s : { enumerable: true, get: () => a[l] });
      }
    }
  }
  return Object.freeze(Object.defineProperty(t7, Symbol.toStringTag, { value: "Module" }));
}
function Sr(t7) {
  return t7 && t7.__esModule && Object.prototype.hasOwnProperty.call(t7, "default") ? t7.default : t7;
}
var tu = { exports: {} };
var la = {};
var nu = { exports: {} };
var Pe = {};
var Gh;
function ex() {
  if (Gh) return Pe;
  Gh = 1;
  var t7 = /* @__PURE__ */ Symbol.for("react.element"), r2 = /* @__PURE__ */ Symbol.for("react.portal"), o = /* @__PURE__ */ Symbol.for("react.fragment"), a = /* @__PURE__ */ Symbol.for("react.strict_mode"), l = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.provider"), u2 = /* @__PURE__ */ Symbol.for("react.context"), f = /* @__PURE__ */ Symbol.for("react.forward_ref"), d = /* @__PURE__ */ Symbol.for("react.suspense"), m = /* @__PURE__ */ Symbol.for("react.memo"), v = /* @__PURE__ */ Symbol.for("react.lazy"), g = Symbol.iterator;
  function w(I) {
    return I === null || typeof I != "object" ? null : (I = g && I[g] || I["@@iterator"], typeof I == "function" ? I : null);
  }
  var k = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, P = Object.assign, C = {};
  function x(I, V, we) {
    this.props = I, this.context = V, this.refs = C, this.updater = we || k;
  }
  x.prototype.isReactComponent = {}, x.prototype.setState = function(I, V) {
    if (typeof I != "object" && typeof I != "function" && I != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, I, V, "setState");
  }, x.prototype.forceUpdate = function(I) {
    this.updater.enqueueForceUpdate(this, I, "forceUpdate");
  };
  function R() {
  }
  R.prototype = x.prototype;
  function b(I, V, we) {
    this.props = I, this.context = V, this.refs = C, this.updater = we || k;
  }
  var M = b.prototype = new R();
  M.constructor = b, P(M, x.prototype), M.isPureReactComponent = true;
  var N = Array.isArray, j = Object.prototype.hasOwnProperty, B = { current: null }, z = { key: true, ref: true, __self: true, __source: true };
  function Q(I, V, we) {
    var ge, ke = {}, Se = null, Y = null;
    if (V != null) for (ge in V.ref !== void 0 && (Y = V.ref), V.key !== void 0 && (Se = "" + V.key), V) j.call(V, ge) && !z.hasOwnProperty(ge) && (ke[ge] = V[ge]);
    var ue = arguments.length - 2;
    if (ue === 1) ke.children = we;
    else if (1 < ue) {
      for (var Ee = Array(ue), Re = 0; Re < ue; Re++) Ee[Re] = arguments[Re + 2];
      ke.children = Ee;
    }
    if (I && I.defaultProps) for (ge in ue = I.defaultProps, ue) ke[ge] === void 0 && (ke[ge] = ue[ge]);
    return { $$typeof: t7, type: I, key: Se, ref: Y, props: ke, _owner: B.current };
  }
  function Z(I, V) {
    return { $$typeof: t7, type: I.type, key: V, ref: I.ref, props: I.props, _owner: I._owner };
  }
  function J(I) {
    return typeof I == "object" && I !== null && I.$$typeof === t7;
  }
  function ee(I) {
    var V = { "=": "=0", ":": "=2" };
    return "$" + I.replace(/[=:]/g, function(we) {
      return V[we];
    });
  }
  var ce = /\/+/g;
  function fe(I, V) {
    return typeof I == "object" && I !== null && I.key != null ? ee("" + I.key) : V.toString(36);
  }
  function de(I, V, we, ge, ke) {
    var Se = typeof I;
    (Se === "undefined" || Se === "boolean") && (I = null);
    var Y = false;
    if (I === null) Y = true;
    else switch (Se) {
      case "string":
      case "number":
        Y = true;
        break;
      case "object":
        switch (I.$$typeof) {
          case t7:
          case r2:
            Y = true;
        }
    }
    if (Y) return Y = I, ke = ke(Y), I = ge === "" ? "." + fe(Y, 0) : ge, N(ke) ? (we = "", I != null && (we = I.replace(ce, "$&/") + "/"), de(ke, V, we, "", function(Re) {
      return Re;
    })) : ke != null && (J(ke) && (ke = Z(ke, we + (!ke.key || Y && Y.key === ke.key ? "" : ("" + ke.key).replace(ce, "$&/") + "/") + I)), V.push(ke)), 1;
    if (Y = 0, ge = ge === "" ? "." : ge + ":", N(I)) for (var ue = 0; ue < I.length; ue++) {
      Se = I[ue];
      var Ee = ge + fe(Se, ue);
      Y += de(Se, V, we, Ee, ke);
    }
    else if (Ee = w(I), typeof Ee == "function") for (I = Ee.call(I), ue = 0; !(Se = I.next()).done; ) Se = Se.value, Ee = ge + fe(Se, ue++), Y += de(Se, V, we, Ee, ke);
    else if (Se === "object") throw V = String(I), Error("Objects are not valid as a React child (found: " + (V === "[object Object]" ? "object with keys {" + Object.keys(I).join(", ") + "}" : V) + "). If you meant to render a collection of children, use an array instead.");
    return Y;
  }
  function ye(I, V, we) {
    if (I == null) return I;
    var ge = [], ke = 0;
    return de(I, ge, "", "", function(Se) {
      return V.call(we, Se, ke++);
    }), ge;
  }
  function re(I) {
    if (I._status === -1) {
      var V = I._result;
      V = V(), V.then(function(we) {
        (I._status === 0 || I._status === -1) && (I._status = 1, I._result = we);
      }, function(we) {
        (I._status === 0 || I._status === -1) && (I._status = 2, I._result = we);
      }), I._status === -1 && (I._status = 0, I._result = V);
    }
    if (I._status === 1) return I._result.default;
    throw I._result;
  }
  var ae = { current: null }, $ = { transition: null }, H = { ReactCurrentDispatcher: ae, ReactCurrentBatchConfig: $, ReactCurrentOwner: B };
  function X2() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Pe.Children = { map: ye, forEach: function(I, V, we) {
    ye(I, function() {
      V.apply(this, arguments);
    }, we);
  }, count: function(I) {
    var V = 0;
    return ye(I, function() {
      V++;
    }), V;
  }, toArray: function(I) {
    return ye(I, function(V) {
      return V;
    }) || [];
  }, only: function(I) {
    if (!J(I)) throw Error("React.Children.only expected to receive a single React element child.");
    return I;
  } }, Pe.Component = x, Pe.Fragment = o, Pe.Profiler = l, Pe.PureComponent = b, Pe.StrictMode = a, Pe.Suspense = d, Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = H, Pe.act = X2, Pe.cloneElement = function(I, V, we) {
    if (I == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + I + ".");
    var ge = P({}, I.props), ke = I.key, Se = I.ref, Y = I._owner;
    if (V != null) {
      if (V.ref !== void 0 && (Se = V.ref, Y = B.current), V.key !== void 0 && (ke = "" + V.key), I.type && I.type.defaultProps) var ue = I.type.defaultProps;
      for (Ee in V) j.call(V, Ee) && !z.hasOwnProperty(Ee) && (ge[Ee] = V[Ee] === void 0 && ue !== void 0 ? ue[Ee] : V[Ee]);
    }
    var Ee = arguments.length - 2;
    if (Ee === 1) ge.children = we;
    else if (1 < Ee) {
      ue = Array(Ee);
      for (var Re = 0; Re < Ee; Re++) ue[Re] = arguments[Re + 2];
      ge.children = ue;
    }
    return { $$typeof: t7, type: I.type, key: ke, ref: Se, props: ge, _owner: Y };
  }, Pe.createContext = function(I) {
    return I = { $$typeof: u2, _currentValue: I, _currentValue2: I, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, I.Provider = { $$typeof: s, _context: I }, I.Consumer = I;
  }, Pe.createElement = Q, Pe.createFactory = function(I) {
    var V = Q.bind(null, I);
    return V.type = I, V;
  }, Pe.createRef = function() {
    return { current: null };
  }, Pe.forwardRef = function(I) {
    return { $$typeof: f, render: I };
  }, Pe.isValidElement = J, Pe.lazy = function(I) {
    return { $$typeof: v, _payload: { _status: -1, _result: I }, _init: re };
  }, Pe.memo = function(I, V) {
    return { $$typeof: m, type: I, compare: V === void 0 ? null : V };
  }, Pe.startTransition = function(I) {
    var V = $.transition;
    $.transition = {};
    try {
      I();
    } finally {
      $.transition = V;
    }
  }, Pe.unstable_act = X2, Pe.useCallback = function(I, V) {
    return ae.current.useCallback(I, V);
  }, Pe.useContext = function(I) {
    return ae.current.useContext(I);
  }, Pe.useDebugValue = function() {
  }, Pe.useDeferredValue = function(I) {
    return ae.current.useDeferredValue(I);
  }, Pe.useEffect = function(I, V) {
    return ae.current.useEffect(I, V);
  }, Pe.useId = function() {
    return ae.current.useId();
  }, Pe.useImperativeHandle = function(I, V, we) {
    return ae.current.useImperativeHandle(I, V, we);
  }, Pe.useInsertionEffect = function(I, V) {
    return ae.current.useInsertionEffect(I, V);
  }, Pe.useLayoutEffect = function(I, V) {
    return ae.current.useLayoutEffect(I, V);
  }, Pe.useMemo = function(I, V) {
    return ae.current.useMemo(I, V);
  }, Pe.useReducer = function(I, V, we) {
    return ae.current.useReducer(I, V, we);
  }, Pe.useRef = function(I) {
    return ae.current.useRef(I);
  }, Pe.useState = function(I) {
    return ae.current.useState(I);
  }, Pe.useSyncExternalStore = function(I, V, we) {
    return ae.current.useSyncExternalStore(I, V, we);
  }, Pe.useTransition = function() {
    return ae.current.useTransition();
  }, Pe.version = "18.3.1", Pe;
}
var Yh;
function Pl() {
  return Yh || (Yh = 1, nu.exports = ex()), nu.exports;
}
var Xh;
function tx() {
  if (Xh) return la;
  Xh = 1;
  var t7 = Pl(), r2 = /* @__PURE__ */ Symbol.for("react.element"), o = /* @__PURE__ */ Symbol.for("react.fragment"), a = Object.prototype.hasOwnProperty, l = t7.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, s = { key: true, ref: true, __self: true, __source: true };
  function u2(f, d, m) {
    d = d || {};
    var v, g = {}, w = null, k = null;
    m !== void 0 && (w = "" + m), d.key !== void 0 && (w = "" + d.key), d.ref !== void 0 && (k = d.ref);
    for (v in d) a.call(d, v) && !s.hasOwnProperty(v) && (g[v] = d[v]);
    if (f && f.defaultProps) for (v in d = f.defaultProps, d) g[v] === void 0 && (g[v] = d[v]);
    return { $$typeof: r2, type: f, key: w, ref: k, props: g, _owner: l.current };
  }
  return la.Fragment = o, la.jsx = u2, la.jsxs = u2, la;
}
var Qh;
function nx() {
  return Qh || (Qh = 1, tu.exports = tx()), tu.exports;
}
var E = nx();
var p = Pl();
var Oe = Sr(p);
var uf = Jw({ __proto__: null, default: Oe }, [p]);
var qi = {};
var ru = { exports: {} };
var vt = {};
var ou = { exports: {} };
var au = {};
var Zh;
function rx() {
  return Zh || (Zh = 1, (function(t7) {
    function r2($, H) {
      var X2 = $.length;
      $.push(H);
      e: for (; 0 < X2; ) {
        var I = X2 - 1 >>> 1, V = $[I];
        if (0 < l(V, H)) $[I] = H, $[X2] = V, X2 = I;
        else break e;
      }
    }
    function o($) {
      return $.length === 0 ? null : $[0];
    }
    function a($) {
      if ($.length === 0) return null;
      var H = $[0], X2 = $.pop();
      if (X2 !== H) {
        $[0] = X2;
        e: for (var I = 0, V = $.length, we = V >>> 1; I < we; ) {
          var ge = 2 * (I + 1) - 1, ke = $[ge], Se = ge + 1, Y = $[Se];
          if (0 > l(ke, X2)) Se < V && 0 > l(Y, ke) ? ($[I] = Y, $[Se] = X2, I = Se) : ($[I] = ke, $[ge] = X2, I = ge);
          else if (Se < V && 0 > l(Y, X2)) $[I] = Y, $[Se] = X2, I = Se;
          else break e;
        }
      }
      return H;
    }
    function l($, H) {
      var X2 = $.sortIndex - H.sortIndex;
      return X2 !== 0 ? X2 : $.id - H.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var s = performance;
      t7.unstable_now = function() {
        return s.now();
      };
    } else {
      var u2 = Date, f = u2.now();
      t7.unstable_now = function() {
        return u2.now() - f;
      };
    }
    var d = [], m = [], v = 1, g = null, w = 3, k = false, P = false, C = false, x = typeof setTimeout == "function" ? setTimeout : null, R = typeof clearTimeout == "function" ? clearTimeout : null, b = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function M($) {
      for (var H = o(m); H !== null; ) {
        if (H.callback === null) a(m);
        else if (H.startTime <= $) a(m), H.sortIndex = H.expirationTime, r2(d, H);
        else break;
        H = o(m);
      }
    }
    function N($) {
      if (C = false, M($), !P) if (o(d) !== null) P = true, re(j);
      else {
        var H = o(m);
        H !== null && ae(N, H.startTime - $);
      }
    }
    function j($, H) {
      P = false, C && (C = false, R(Q), Q = -1), k = true;
      var X2 = w;
      try {
        for (M(H), g = o(d); g !== null && (!(g.expirationTime > H) || $ && !ee()); ) {
          var I = g.callback;
          if (typeof I == "function") {
            g.callback = null, w = g.priorityLevel;
            var V = I(g.expirationTime <= H);
            H = t7.unstable_now(), typeof V == "function" ? g.callback = V : g === o(d) && a(d), M(H);
          } else a(d);
          g = o(d);
        }
        if (g !== null) var we = true;
        else {
          var ge = o(m);
          ge !== null && ae(N, ge.startTime - H), we = false;
        }
        return we;
      } finally {
        g = null, w = X2, k = false;
      }
    }
    var B = false, z = null, Q = -1, Z = 5, J = -1;
    function ee() {
      return !(t7.unstable_now() - J < Z);
    }
    function ce() {
      if (z !== null) {
        var $ = t7.unstable_now();
        J = $;
        var H = true;
        try {
          H = z(true, $);
        } finally {
          H ? fe() : (B = false, z = null);
        }
      } else B = false;
    }
    var fe;
    if (typeof b == "function") fe = function() {
      b(ce);
    };
    else if (typeof MessageChannel < "u") {
      var de = new MessageChannel(), ye = de.port2;
      de.port1.onmessage = ce, fe = function() {
        ye.postMessage(null);
      };
    } else fe = function() {
      x(ce, 0);
    };
    function re($) {
      z = $, B || (B = true, fe());
    }
    function ae($, H) {
      Q = x(function() {
        $(t7.unstable_now());
      }, H);
    }
    t7.unstable_IdlePriority = 5, t7.unstable_ImmediatePriority = 1, t7.unstable_LowPriority = 4, t7.unstable_NormalPriority = 3, t7.unstable_Profiling = null, t7.unstable_UserBlockingPriority = 2, t7.unstable_cancelCallback = function($) {
      $.callback = null;
    }, t7.unstable_continueExecution = function() {
      P || k || (P = true, re(j));
    }, t7.unstable_forceFrameRate = function($) {
      0 > $ || 125 < $ ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Z = 0 < $ ? Math.floor(1e3 / $) : 5;
    }, t7.unstable_getCurrentPriorityLevel = function() {
      return w;
    }, t7.unstable_getFirstCallbackNode = function() {
      return o(d);
    }, t7.unstable_next = function($) {
      switch (w) {
        case 1:
        case 2:
        case 3:
          var H = 3;
          break;
        default:
          H = w;
      }
      var X2 = w;
      w = H;
      try {
        return $();
      } finally {
        w = X2;
      }
    }, t7.unstable_pauseExecution = function() {
    }, t7.unstable_requestPaint = function() {
    }, t7.unstable_runWithPriority = function($, H) {
      switch ($) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          $ = 3;
      }
      var X2 = w;
      w = $;
      try {
        return H();
      } finally {
        w = X2;
      }
    }, t7.unstable_scheduleCallback = function($, H, X2) {
      var I = t7.unstable_now();
      switch (typeof X2 == "object" && X2 !== null ? (X2 = X2.delay, X2 = typeof X2 == "number" && 0 < X2 ? I + X2 : I) : X2 = I, $) {
        case 1:
          var V = -1;
          break;
        case 2:
          V = 250;
          break;
        case 5:
          V = 1073741823;
          break;
        case 4:
          V = 1e4;
          break;
        default:
          V = 5e3;
      }
      return V = X2 + V, $ = { id: v++, callback: H, priorityLevel: $, startTime: X2, expirationTime: V, sortIndex: -1 }, X2 > I ? ($.sortIndex = X2, r2(m, $), o(d) === null && $ === o(m) && (C ? (R(Q), Q = -1) : C = true, ae(N, X2 - I))) : ($.sortIndex = V, r2(d, $), P || k || (P = true, re(j))), $;
    }, t7.unstable_shouldYield = ee, t7.unstable_wrapCallback = function($) {
      var H = w;
      return function() {
        var X2 = w;
        w = H;
        try {
          return $.apply(this, arguments);
        } finally {
          w = X2;
        }
      };
    };
  })(au)), au;
}
var Jh;
function ox() {
  return Jh || (Jh = 1, ou.exports = rx()), ou.exports;
}
var e1;
function ax() {
  if (e1) return vt;
  e1 = 1;
  var t7 = Pl(), r2 = ox();
  function o(e) {
    for (var n = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, i = 1; i < arguments.length; i++) n += "&args[]=" + encodeURIComponent(arguments[i]);
    return "Minified React error #" + e + "; visit " + n + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var a = /* @__PURE__ */ new Set(), l = {};
  function s(e, n) {
    u2(e, n), u2(e + "Capture", n);
  }
  function u2(e, n) {
    for (l[e] = n, e = 0; e < n.length; e++) a.add(n[e]);
  }
  var f = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), d = Object.prototype.hasOwnProperty, m = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, v = {}, g = {};
  function w(e) {
    return d.call(g, e) ? true : d.call(v, e) ? false : m.test(e) ? g[e] = true : (v[e] = true, false);
  }
  function k(e, n, i, c7) {
    if (i !== null && i.type === 0) return false;
    switch (typeof n) {
      case "function":
      case "symbol":
        return true;
      case "boolean":
        return c7 ? false : i !== null ? !i.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return false;
    }
  }
  function P(e, n, i, c7) {
    if (n === null || typeof n > "u" || k(e, n, i, c7)) return true;
    if (c7) return false;
    if (i !== null) switch (i.type) {
      case 3:
        return !n;
      case 4:
        return n === false;
      case 5:
        return isNaN(n);
      case 6:
        return isNaN(n) || 1 > n;
    }
    return false;
  }
  function C(e, n, i, c7, h, y, S) {
    this.acceptsBooleans = n === 2 || n === 3 || n === 4, this.attributeName = c7, this.attributeNamespace = h, this.mustUseProperty = i, this.propertyName = e, this.type = n, this.sanitizeURL = y, this.removeEmptyString = S;
  }
  var x = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    x[e] = new C(e, 0, false, e, null, false, false);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var n = e[0];
    x[n] = new C(n, 1, false, e[1], null, false, false);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    x[e] = new C(e, 2, false, e.toLowerCase(), null, false, false);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    x[e] = new C(e, 2, false, e, null, false, false);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    x[e] = new C(e, 3, false, e.toLowerCase(), null, false, false);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    x[e] = new C(e, 3, true, e, null, false, false);
  }), ["capture", "download"].forEach(function(e) {
    x[e] = new C(e, 4, false, e, null, false, false);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    x[e] = new C(e, 6, false, e, null, false, false);
  }), ["rowSpan", "start"].forEach(function(e) {
    x[e] = new C(e, 5, false, e.toLowerCase(), null, false, false);
  });
  var R = /[\-:]([a-z])/g;
  function b(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var n = e.replace(R, b);
    x[n] = new C(n, 1, false, e, null, false, false);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var n = e.replace(R, b);
    x[n] = new C(n, 1, false, e, "http://www.w3.org/1999/xlink", false, false);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var n = e.replace(R, b);
    x[n] = new C(n, 1, false, e, "http://www.w3.org/XML/1998/namespace", false, false);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    x[e] = new C(e, 1, false, e.toLowerCase(), null, false, false);
  }), x.xlinkHref = new C("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false), ["src", "href", "action", "formAction"].forEach(function(e) {
    x[e] = new C(e, 1, false, e.toLowerCase(), null, true, true);
  });
  function M(e, n, i, c7) {
    var h = x.hasOwnProperty(n) ? x[n] : null;
    (h !== null ? h.type !== 0 : c7 || !(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (P(n, i, h, c7) && (i = null), c7 || h === null ? w(n) && (i === null ? e.removeAttribute(n) : e.setAttribute(n, "" + i)) : h.mustUseProperty ? e[h.propertyName] = i === null ? h.type === 3 ? false : "" : i : (n = h.attributeName, c7 = h.attributeNamespace, i === null ? e.removeAttribute(n) : (h = h.type, i = h === 3 || h === 4 && i === true ? "" : "" + i, c7 ? e.setAttributeNS(c7, n, i) : e.setAttribute(n, i))));
  }
  var N = t7.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, j = /* @__PURE__ */ Symbol.for("react.element"), B = /* @__PURE__ */ Symbol.for("react.portal"), z = /* @__PURE__ */ Symbol.for("react.fragment"), Q = /* @__PURE__ */ Symbol.for("react.strict_mode"), Z = /* @__PURE__ */ Symbol.for("react.profiler"), J = /* @__PURE__ */ Symbol.for("react.provider"), ee = /* @__PURE__ */ Symbol.for("react.context"), ce = /* @__PURE__ */ Symbol.for("react.forward_ref"), fe = /* @__PURE__ */ Symbol.for("react.suspense"), de = /* @__PURE__ */ Symbol.for("react.suspense_list"), ye = /* @__PURE__ */ Symbol.for("react.memo"), re = /* @__PURE__ */ Symbol.for("react.lazy"), ae = /* @__PURE__ */ Symbol.for("react.offscreen"), $ = Symbol.iterator;
  function H(e) {
    return e === null || typeof e != "object" ? null : (e = $ && e[$] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var X2 = Object.assign, I;
  function V(e) {
    if (I === void 0) try {
      throw Error();
    } catch (i) {
      var n = i.stack.trim().match(/\n( *(at )?)/);
      I = n && n[1] || "";
    }
    return `
` + I + e;
  }
  var we = false;
  function ge(e, n) {
    if (!e || we) return "";
    we = true;
    var i = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (n) if (n = function() {
        throw Error();
      }, Object.defineProperty(n.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(n, []);
        } catch (F) {
          var c7 = F;
        }
        Reflect.construct(e, [], n);
      } else {
        try {
          n.call();
        } catch (F) {
          c7 = F;
        }
        e.call(n.prototype);
      }
      else {
        try {
          throw Error();
        } catch (F) {
          c7 = F;
        }
        e();
      }
    } catch (F) {
      if (F && c7 && typeof F.stack == "string") {
        for (var h = F.stack.split(`
`), y = c7.stack.split(`
`), S = h.length - 1, T = y.length - 1; 1 <= S && 0 <= T && h[S] !== y[T]; ) T--;
        for (; 1 <= S && 0 <= T; S--, T--) if (h[S] !== y[T]) {
          if (S !== 1 || T !== 1) do
            if (S--, T--, 0 > T || h[S] !== y[T]) {
              var _ = `
` + h[S].replace(" at new ", " at ");
              return e.displayName && _.includes("<anonymous>") && (_ = _.replace("<anonymous>", e.displayName)), _;
            }
          while (1 <= S && 0 <= T);
          break;
        }
      }
    } finally {
      we = false, Error.prepareStackTrace = i;
    }
    return (e = e ? e.displayName || e.name : "") ? V(e) : "";
  }
  function ke(e) {
    switch (e.tag) {
      case 5:
        return V(e.type);
      case 16:
        return V("Lazy");
      case 13:
        return V("Suspense");
      case 19:
        return V("SuspenseList");
      case 0:
      case 2:
      case 15:
        return e = ge(e.type, false), e;
      case 11:
        return e = ge(e.type.render, false), e;
      case 1:
        return e = ge(e.type, true), e;
      default:
        return "";
    }
  }
  function Se(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case z:
        return "Fragment";
      case B:
        return "Portal";
      case Z:
        return "Profiler";
      case Q:
        return "StrictMode";
      case fe:
        return "Suspense";
      case de:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case ee:
        return (e.displayName || "Context") + ".Consumer";
      case J:
        return (e._context.displayName || "Context") + ".Provider";
      case ce:
        var n = e.render;
        return e = e.displayName, e || (e = n.displayName || n.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case ye:
        return n = e.displayName || null, n !== null ? n : Se(e.type) || "Memo";
      case re:
        n = e._payload, e = e._init;
        try {
          return Se(e(n));
        } catch {
        }
    }
    return null;
  }
  function Y(e) {
    var n = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (n.displayName || "Context") + ".Consumer";
      case 10:
        return (n._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return e = n.render, e = e.displayName || e.name || "", n.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return n;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return Se(n);
      case 8:
        return n === Q ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof n == "function") return n.displayName || n.name || null;
        if (typeof n == "string") return n;
    }
    return null;
  }
  function ue(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Ee(e) {
    var n = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (n === "checkbox" || n === "radio");
  }
  function Re(e) {
    var n = Ee(e) ? "checked" : "value", i = Object.getOwnPropertyDescriptor(e.constructor.prototype, n), c7 = "" + e[n];
    if (!e.hasOwnProperty(n) && typeof i < "u" && typeof i.get == "function" && typeof i.set == "function") {
      var h = i.get, y = i.set;
      return Object.defineProperty(e, n, { configurable: true, get: function() {
        return h.call(this);
      }, set: function(S) {
        c7 = "" + S, y.call(this, S);
      } }), Object.defineProperty(e, n, { enumerable: i.enumerable }), { getValue: function() {
        return c7;
      }, setValue: function(S) {
        c7 = "" + S;
      }, stopTracking: function() {
        e._valueTracker = null, delete e[n];
      } };
    }
  }
  function Ae(e) {
    e._valueTracker || (e._valueTracker = Re(e));
  }
  function $e(e) {
    if (!e) return false;
    var n = e._valueTracker;
    if (!n) return true;
    var i = n.getValue(), c7 = "";
    return e && (c7 = Ee(e) ? e.checked ? "true" : "false" : e.value), e = c7, e !== i ? (n.setValue(e), true) : false;
  }
  function Je(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function jt(e, n) {
    var i = n.checked;
    return X2({}, n, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: i ?? e._wrapperState.initialChecked });
  }
  function Pr(e, n) {
    var i = n.defaultValue == null ? "" : n.defaultValue, c7 = n.checked != null ? n.checked : n.defaultChecked;
    i = ue(n.value != null ? n.value : i), e._wrapperState = { initialChecked: c7, initialValue: i, controlled: n.type === "checkbox" || n.type === "radio" ? n.checked != null : n.value != null };
  }
  function br(e, n) {
    n = n.checked, n != null && M(e, "checked", n, false);
  }
  function tr(e, n) {
    br(e, n);
    var i = ue(n.value), c7 = n.type;
    if (i != null) c7 === "number" ? (i === 0 && e.value === "" || e.value != i) && (e.value = "" + i) : e.value !== "" + i && (e.value = "" + i);
    else if (c7 === "submit" || c7 === "reset") {
      e.removeAttribute("value");
      return;
    }
    n.hasOwnProperty("value") ? us(e, n.type, i) : n.hasOwnProperty("defaultValue") && us(e, n.type, ue(n.defaultValue)), n.checked == null && n.defaultChecked != null && (e.defaultChecked = !!n.defaultChecked);
  }
  function rd(e, n, i) {
    if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
      var c7 = n.type;
      if (!(c7 !== "submit" && c7 !== "reset" || n.value !== void 0 && n.value !== null)) return;
      n = "" + e._wrapperState.initialValue, i || n === e.value || (e.value = n), e.defaultValue = n;
    }
    i = e.name, i !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, i !== "" && (e.name = i);
  }
  function us(e, n, i) {
    (n !== "number" || Je(e.ownerDocument) !== e) && (i == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + i && (e.defaultValue = "" + i));
  }
  var Co = Array.isArray;
  function Tr(e, n, i, c7) {
    if (e = e.options, n) {
      n = {};
      for (var h = 0; h < i.length; h++) n["$" + i[h]] = true;
      for (i = 0; i < e.length; i++) h = n.hasOwnProperty("$" + e[i].value), e[i].selected !== h && (e[i].selected = h), h && c7 && (e[i].defaultSelected = true);
    } else {
      for (i = "" + ue(i), n = null, h = 0; h < e.length; h++) {
        if (e[h].value === i) {
          e[h].selected = true, c7 && (e[h].defaultSelected = true);
          return;
        }
        n !== null || e[h].disabled || (n = e[h]);
      }
      n !== null && (n.selected = true);
    }
  }
  function fs(e, n) {
    if (n.dangerouslySetInnerHTML != null) throw Error(o(91));
    return X2({}, n, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
  }
  function od(e, n) {
    var i = n.value;
    if (i == null) {
      if (i = n.children, n = n.defaultValue, i != null) {
        if (n != null) throw Error(o(92));
        if (Co(i)) {
          if (1 < i.length) throw Error(o(93));
          i = i[0];
        }
        n = i;
      }
      n == null && (n = ""), i = n;
    }
    e._wrapperState = { initialValue: ue(i) };
  }
  function ad(e, n) {
    var i = ue(n.value), c7 = ue(n.defaultValue);
    i != null && (i = "" + i, i !== e.value && (e.value = i), n.defaultValue == null && e.defaultValue !== i && (e.defaultValue = i)), c7 != null && (e.defaultValue = "" + c7);
  }
  function id(e) {
    var n = e.textContent;
    n === e._wrapperState.initialValue && n !== "" && n !== null && (e.value = n);
  }
  function ld(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function ds(e, n) {
    return e == null || e === "http://www.w3.org/1999/xhtml" ? ld(n) : e === "http://www.w3.org/2000/svg" && n === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
  }
  var Fa, sd = (function(e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(n, i, c7, h) {
      MSApp.execUnsafeLocalFunction(function() {
        return e(n, i, c7, h);
      });
    } : e;
  })(function(e, n) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = n;
    else {
      for (Fa = Fa || document.createElement("div"), Fa.innerHTML = "<svg>" + n.valueOf().toString() + "</svg>", n = Fa.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
      for (; n.firstChild; ) e.appendChild(n.firstChild);
    }
  });
  function ko(e, n) {
    if (n) {
      var i = e.firstChild;
      if (i && i === e.lastChild && i.nodeType === 3) {
        i.nodeValue = n;
        return;
      }
    }
    e.textContent = n;
  }
  var Eo = { animationIterationCount: true, aspectRatio: true, borderImageOutset: true, borderImageSlice: true, borderImageWidth: true, boxFlex: true, boxFlexGroup: true, boxOrdinalGroup: true, columnCount: true, columns: true, flex: true, flexGrow: true, flexPositive: true, flexShrink: true, flexNegative: true, flexOrder: true, gridArea: true, gridRow: true, gridRowEnd: true, gridRowSpan: true, gridRowStart: true, gridColumn: true, gridColumnEnd: true, gridColumnSpan: true, gridColumnStart: true, fontWeight: true, lineClamp: true, lineHeight: true, opacity: true, order: true, orphans: true, tabSize: true, widows: true, zIndex: true, zoom: true, fillOpacity: true, floodOpacity: true, stopOpacity: true, strokeDasharray: true, strokeDashoffset: true, strokeMiterlimit: true, strokeOpacity: true, strokeWidth: true }, r22 = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Eo).forEach(function(e) {
    r22.forEach(function(n) {
      n = n + e.charAt(0).toUpperCase() + e.substring(1), Eo[n] = Eo[e];
    });
  });
  function cd(e, n, i) {
    return n == null || typeof n == "boolean" || n === "" ? "" : i || typeof n != "number" || n === 0 || Eo.hasOwnProperty(e) && Eo[e] ? ("" + n).trim() : n + "px";
  }
  function ud(e, n) {
    e = e.style;
    for (var i in n) if (n.hasOwnProperty(i)) {
      var c7 = i.indexOf("--") === 0, h = cd(i, n[i], c7);
      i === "float" && (i = "cssFloat"), c7 ? e.setProperty(i, h) : e[i] = h;
    }
  }
  var o2 = X2({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
  function ps(e, n) {
    if (n) {
      if (o2[e] && (n.children != null || n.dangerouslySetInnerHTML != null)) throw Error(o(137, e));
      if (n.dangerouslySetInnerHTML != null) {
        if (n.children != null) throw Error(o(60));
        if (typeof n.dangerouslySetInnerHTML != "object" || !("__html" in n.dangerouslySetInnerHTML)) throw Error(o(61));
      }
      if (n.style != null && typeof n.style != "object") throw Error(o(62));
    }
  }
  function hs(e, n) {
    if (e.indexOf("-") === -1) return typeof n.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var ms = null;
  function ys(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var vs = null, Mr = null, Ar = null;
  function fd(e) {
    if (e = qo(e)) {
      if (typeof vs != "function") throw Error(o(280));
      var n = e.stateNode;
      n && (n = li(n), vs(e.stateNode, e.type, n));
    }
  }
  function dd(e) {
    Mr ? Ar ? Ar.push(e) : Ar = [e] : Mr = e;
  }
  function pd() {
    if (Mr) {
      var e = Mr, n = Ar;
      if (Ar = Mr = null, fd(e), n) for (e = 0; e < n.length; e++) fd(n[e]);
    }
  }
  function hd(e, n) {
    return e(n);
  }
  function md() {
  }
  var gs = false;
  function yd(e, n, i) {
    if (gs) return e(n, i);
    gs = true;
    try {
      return hd(e, n, i);
    } finally {
      gs = false, (Mr !== null || Ar !== null) && (md(), pd());
    }
  }
  function Ro(e, n) {
    var i = e.stateNode;
    if (i === null) return null;
    var c7 = li(i);
    if (c7 === null) return null;
    i = c7[n];
    e: switch (n) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (c7 = !c7.disabled) || (e = e.type, c7 = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !c7;
        break e;
      default:
        e = false;
    }
    if (e) return null;
    if (i && typeof i != "function") throw Error(o(231, n, typeof i));
    return i;
  }
  var ws = false;
  if (f) try {
    var Po = {};
    Object.defineProperty(Po, "passive", { get: function() {
      ws = true;
    } }), window.addEventListener("test", Po, Po), window.removeEventListener("test", Po, Po);
  } catch {
    ws = false;
  }
  function a2(e, n, i, c7, h, y, S, T, _) {
    var F = Array.prototype.slice.call(arguments, 3);
    try {
      n.apply(i, F);
    } catch (W) {
      this.onError(W);
    }
  }
  var bo = false, $a = null, za = false, xs = null, i2 = { onError: function(e) {
    bo = true, $a = e;
  } };
  function l2(e, n, i, c7, h, y, S, T, _) {
    bo = false, $a = null, a2.apply(i2, arguments);
  }
  function s2(e, n, i, c7, h, y, S, T, _) {
    if (l2.apply(this, arguments), bo) {
      if (bo) {
        var F = $a;
        bo = false, $a = null;
      } else throw Error(o(198));
      za || (za = true, xs = F);
    }
  }
  function nr(e) {
    var n = e, i = e;
    if (e.alternate) for (; n.return; ) n = n.return;
    else {
      e = n;
      do
        n = e, (n.flags & 4098) !== 0 && (i = n.return), e = n.return;
      while (e);
    }
    return n.tag === 3 ? i : null;
  }
  function vd(e) {
    if (e.tag === 13) {
      var n = e.memoizedState;
      if (n === null && (e = e.alternate, e !== null && (n = e.memoizedState)), n !== null) return n.dehydrated;
    }
    return null;
  }
  function gd(e) {
    if (nr(e) !== e) throw Error(o(188));
  }
  function c2(e) {
    var n = e.alternate;
    if (!n) {
      if (n = nr(e), n === null) throw Error(o(188));
      return n !== e ? null : e;
    }
    for (var i = e, c7 = n; ; ) {
      var h = i.return;
      if (h === null) break;
      var y = h.alternate;
      if (y === null) {
        if (c7 = h.return, c7 !== null) {
          i = c7;
          continue;
        }
        break;
      }
      if (h.child === y.child) {
        for (y = h.child; y; ) {
          if (y === i) return gd(h), e;
          if (y === c7) return gd(h), n;
          y = y.sibling;
        }
        throw Error(o(188));
      }
      if (i.return !== c7.return) i = h, c7 = y;
      else {
        for (var S = false, T = h.child; T; ) {
          if (T === i) {
            S = true, i = h, c7 = y;
            break;
          }
          if (T === c7) {
            S = true, c7 = h, i = y;
            break;
          }
          T = T.sibling;
        }
        if (!S) {
          for (T = y.child; T; ) {
            if (T === i) {
              S = true, i = y, c7 = h;
              break;
            }
            if (T === c7) {
              S = true, c7 = y, i = h;
              break;
            }
            T = T.sibling;
          }
          if (!S) throw Error(o(189));
        }
      }
      if (i.alternate !== c7) throw Error(o(190));
    }
    if (i.tag !== 3) throw Error(o(188));
    return i.stateNode.current === i ? e : n;
  }
  function wd(e) {
    return e = c2(e), e !== null ? xd(e) : null;
  }
  function xd(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var n = xd(e);
      if (n !== null) return n;
      e = e.sibling;
    }
    return null;
  }
  var Sd = r2.unstable_scheduleCallback, Cd = r2.unstable_cancelCallback, u22 = r2.unstable_shouldYield, f2 = r2.unstable_requestPaint, Ve = r2.unstable_now, d2 = r2.unstable_getCurrentPriorityLevel, Ss = r2.unstable_ImmediatePriority, kd = r2.unstable_UserBlockingPriority, Ha = r2.unstable_NormalPriority, p2 = r2.unstable_LowPriority, Ed = r2.unstable_IdlePriority, Ba = null, tn = null;
  function h2(e) {
    if (tn && typeof tn.onCommitFiberRoot == "function") try {
      tn.onCommitFiberRoot(Ba, e, void 0, (e.current.flags & 128) === 128);
    } catch {
    }
  }
  var Ft = Math.clz32 ? Math.clz32 : v2, m2 = Math.log, y2 = Math.LN2;
  function v2(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (m2(e) / y2 | 0) | 0;
  }
  var Va = 64, Ua = 4194304;
  function To(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function Wa(e, n) {
    var i = e.pendingLanes;
    if (i === 0) return 0;
    var c7 = 0, h = e.suspendedLanes, y = e.pingedLanes, S = i & 268435455;
    if (S !== 0) {
      var T = S & ~h;
      T !== 0 ? c7 = To(T) : (y &= S, y !== 0 && (c7 = To(y)));
    } else S = i & ~h, S !== 0 ? c7 = To(S) : y !== 0 && (c7 = To(y));
    if (c7 === 0) return 0;
    if (n !== 0 && n !== c7 && (n & h) === 0 && (h = c7 & -c7, y = n & -n, h >= y || h === 16 && (y & 4194240) !== 0)) return n;
    if ((c7 & 4) !== 0 && (c7 |= i & 16), n = e.entangledLanes, n !== 0) for (e = e.entanglements, n &= c7; 0 < n; ) i = 31 - Ft(n), h = 1 << i, c7 |= e[i], n &= ~h;
    return c7;
  }
  function g2(e, n) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return n + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function w2(e, n) {
    for (var i = e.suspendedLanes, c7 = e.pingedLanes, h = e.expirationTimes, y = e.pendingLanes; 0 < y; ) {
      var S = 31 - Ft(y), T = 1 << S, _ = h[S];
      _ === -1 ? ((T & i) === 0 || (T & c7) !== 0) && (h[S] = g2(T, n)) : _ <= n && (e.expiredLanes |= T), y &= ~T;
    }
  }
  function Cs(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function Rd() {
    var e = Va;
    return Va <<= 1, (Va & 4194240) === 0 && (Va = 64), e;
  }
  function ks(e) {
    for (var n = [], i = 0; 31 > i; i++) n.push(e);
    return n;
  }
  function Mo(e, n, i) {
    e.pendingLanes |= n, n !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, n = 31 - Ft(n), e[n] = i;
  }
  function x2(e, n) {
    var i = e.pendingLanes & ~n;
    e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= n, e.mutableReadLanes &= n, e.entangledLanes &= n, n = e.entanglements;
    var c7 = e.eventTimes;
    for (e = e.expirationTimes; 0 < i; ) {
      var h = 31 - Ft(i), y = 1 << h;
      n[h] = 0, c7[h] = -1, e[h] = -1, i &= ~y;
    }
  }
  function Es(e, n) {
    var i = e.entangledLanes |= n;
    for (e = e.entanglements; i; ) {
      var c7 = 31 - Ft(i), h = 1 << c7;
      h & n | e[c7] & n && (e[c7] |= n), i &= ~h;
    }
  }
  var _e = 0;
  function Pd(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var bd, Rs, Td, Md, Ad, Ps = false, qa = [], bn = null, Tn = null, Mn = null, Ao = /* @__PURE__ */ new Map(), _o = /* @__PURE__ */ new Map(), An = [], S2 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function _d(e, n) {
    switch (e) {
      case "focusin":
      case "focusout":
        bn = null;
        break;
      case "dragenter":
      case "dragleave":
        Tn = null;
        break;
      case "mouseover":
      case "mouseout":
        Mn = null;
        break;
      case "pointerover":
      case "pointerout":
        Ao.delete(n.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        _o.delete(n.pointerId);
    }
  }
  function Oo(e, n, i, c7, h, y) {
    return e === null || e.nativeEvent !== y ? (e = { blockedOn: n, domEventName: i, eventSystemFlags: c7, nativeEvent: y, targetContainers: [h] }, n !== null && (n = qo(n), n !== null && Rs(n)), e) : (e.eventSystemFlags |= c7, n = e.targetContainers, h !== null && n.indexOf(h) === -1 && n.push(h), e);
  }
  function C2(e, n, i, c7, h) {
    switch (n) {
      case "focusin":
        return bn = Oo(bn, e, n, i, c7, h), true;
      case "dragenter":
        return Tn = Oo(Tn, e, n, i, c7, h), true;
      case "mouseover":
        return Mn = Oo(Mn, e, n, i, c7, h), true;
      case "pointerover":
        var y = h.pointerId;
        return Ao.set(y, Oo(Ao.get(y) || null, e, n, i, c7, h)), true;
      case "gotpointercapture":
        return y = h.pointerId, _o.set(y, Oo(_o.get(y) || null, e, n, i, c7, h)), true;
    }
    return false;
  }
  function Od(e) {
    var n = rr(e.target);
    if (n !== null) {
      var i = nr(n);
      if (i !== null) {
        if (n = i.tag, n === 13) {
          if (n = vd(i), n !== null) {
            e.blockedOn = n, Ad(e.priority, function() {
              Td(i);
            });
            return;
          }
        } else if (n === 3 && i.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = i.tag === 3 ? i.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Ka(e) {
    if (e.blockedOn !== null) return false;
    for (var n = e.targetContainers; 0 < n.length; ) {
      var i = Ts(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent);
      if (i === null) {
        i = e.nativeEvent;
        var c7 = new i.constructor(i.type, i);
        ms = c7, i.target.dispatchEvent(c7), ms = null;
      } else return n = qo(i), n !== null && Rs(n), e.blockedOn = i, false;
      n.shift();
    }
    return true;
  }
  function Nd(e, n, i) {
    Ka(e) && i.delete(n);
  }
  function k2() {
    Ps = false, bn !== null && Ka(bn) && (bn = null), Tn !== null && Ka(Tn) && (Tn = null), Mn !== null && Ka(Mn) && (Mn = null), Ao.forEach(Nd), _o.forEach(Nd);
  }
  function No(e, n) {
    e.blockedOn === n && (e.blockedOn = null, Ps || (Ps = true, r2.unstable_scheduleCallback(r2.unstable_NormalPriority, k2)));
  }
  function Io(e) {
    function n(h) {
      return No(h, e);
    }
    if (0 < qa.length) {
      No(qa[0], e);
      for (var i = 1; i < qa.length; i++) {
        var c7 = qa[i];
        c7.blockedOn === e && (c7.blockedOn = null);
      }
    }
    for (bn !== null && No(bn, e), Tn !== null && No(Tn, e), Mn !== null && No(Mn, e), Ao.forEach(n), _o.forEach(n), i = 0; i < An.length; i++) c7 = An[i], c7.blockedOn === e && (c7.blockedOn = null);
    for (; 0 < An.length && (i = An[0], i.blockedOn === null); ) Od(i), i.blockedOn === null && An.shift();
  }
  var _r = N.ReactCurrentBatchConfig, Ga = true;
  function E2(e, n, i, c7) {
    var h = _e, y = _r.transition;
    _r.transition = null;
    try {
      _e = 1, bs(e, n, i, c7);
    } finally {
      _e = h, _r.transition = y;
    }
  }
  function R2(e, n, i, c7) {
    var h = _e, y = _r.transition;
    _r.transition = null;
    try {
      _e = 4, bs(e, n, i, c7);
    } finally {
      _e = h, _r.transition = y;
    }
  }
  function bs(e, n, i, c7) {
    if (Ga) {
      var h = Ts(e, n, i, c7);
      if (h === null) Ws(e, n, c7, Ya, i), _d(e, c7);
      else if (C2(h, e, n, i, c7)) c7.stopPropagation();
      else if (_d(e, c7), n & 4 && -1 < S2.indexOf(e)) {
        for (; h !== null; ) {
          var y = qo(h);
          if (y !== null && bd(y), y = Ts(e, n, i, c7), y === null && Ws(e, n, c7, Ya, i), y === h) break;
          h = y;
        }
        h !== null && c7.stopPropagation();
      } else Ws(e, n, c7, null, i);
    }
  }
  var Ya = null;
  function Ts(e, n, i, c7) {
    if (Ya = null, e = ys(c7), e = rr(e), e !== null) if (n = nr(e), n === null) e = null;
    else if (i = n.tag, i === 13) {
      if (e = vd(n), e !== null) return e;
      e = null;
    } else if (i === 3) {
      if (n.stateNode.current.memoizedState.isDehydrated) return n.tag === 3 ? n.stateNode.containerInfo : null;
      e = null;
    } else n !== e && (e = null);
    return Ya = e, null;
  }
  function Id(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (d2()) {
          case Ss:
            return 1;
          case kd:
            return 4;
          case Ha:
          case p2:
            return 16;
          case Ed:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var _n = null, Ms = null, Xa = null;
  function Dd() {
    if (Xa) return Xa;
    var e, n = Ms, i = n.length, c7, h = "value" in _n ? _n.value : _n.textContent, y = h.length;
    for (e = 0; e < i && n[e] === h[e]; e++) ;
    var S = i - e;
    for (c7 = 1; c7 <= S && n[i - c7] === h[y - c7]; c7++) ;
    return Xa = h.slice(e, 1 < c7 ? 1 - c7 : void 0);
  }
  function Qa(e) {
    var n = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && n === 13 && (e = 13)) : e = n, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Za() {
    return true;
  }
  function Ld() {
    return false;
  }
  function St(e) {
    function n(i, c7, h, y, S) {
      this._reactName = i, this._targetInst = h, this.type = c7, this.nativeEvent = y, this.target = S, this.currentTarget = null;
      for (var T in e) e.hasOwnProperty(T) && (i = e[T], this[T] = i ? i(y) : y[T]);
      return this.isDefaultPrevented = (y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === false) ? Za : Ld, this.isPropagationStopped = Ld, this;
    }
    return X2(n.prototype, { preventDefault: function() {
      this.defaultPrevented = true;
      var i = this.nativeEvent;
      i && (i.preventDefault ? i.preventDefault() : typeof i.returnValue != "unknown" && (i.returnValue = false), this.isDefaultPrevented = Za);
    }, stopPropagation: function() {
      var i = this.nativeEvent;
      i && (i.stopPropagation ? i.stopPropagation() : typeof i.cancelBubble != "unknown" && (i.cancelBubble = true), this.isPropagationStopped = Za);
    }, persist: function() {
    }, isPersistent: Za }), n;
  }
  var Or = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, As = St(Or), Do = X2({}, Or, { view: 0, detail: 0 }), P2 = St(Do), _s, Os, Lo, Ja = X2({}, Do, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Is, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== Lo && (Lo && e.type === "mousemove" ? (_s = e.screenX - Lo.screenX, Os = e.screenY - Lo.screenY) : Os = _s = 0, Lo = e), _s);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : Os;
  } }), jd = St(Ja), b2 = X2({}, Ja, { dataTransfer: 0 }), T2 = St(b2), M2 = X2({}, Do, { relatedTarget: 0 }), Ns = St(M2), A2 = X2({}, Or, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), _2 = St(A2), O2 = X2({}, Or, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), N2 = St(O2), I2 = X2({}, Or, { data: 0 }), Fd = St(I2), D2 = { Esc: "Escape", Spacebar: " ", Left: "ArrowLeft", Up: "ArrowUp", Right: "ArrowRight", Down: "ArrowDown", Del: "Delete", Win: "OS", Menu: "ContextMenu", Apps: "ContextMenu", Scroll: "ScrollLock", MozPrintableKey: "Unidentified" }, L2 = { 8: "Backspace", 9: "Tab", 12: "Clear", 13: "Enter", 16: "Shift", 17: "Control", 18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Escape", 32: " ", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown", 45: "Insert", 46: "Delete", 112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "NumLock", 145: "ScrollLock", 224: "Meta" }, j2 = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function F2(e) {
    var n = this.nativeEvent;
    return n.getModifierState ? n.getModifierState(e) : (e = j2[e]) ? !!n[e] : false;
  }
  function Is() {
    return F2;
  }
  var $2 = X2({}, Do, { key: function(e) {
    if (e.key) {
      var n = D2[e.key] || e.key;
      if (n !== "Unidentified") return n;
    }
    return e.type === "keypress" ? (e = Qa(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? L2[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Is, charCode: function(e) {
    return e.type === "keypress" ? Qa(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? Qa(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), z2 = St($2), H2 = X2({}, Ja, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), $d = St(H2), B2 = X2({}, Do, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Is }), V2 = St(B2), U2 = X2({}, Or, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), W2 = St(U2), q2 = X2({}, Ja, { deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  }, deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  }, deltaZ: 0, deltaMode: 0 }), K2 = St(q2), G2 = [9, 13, 27, 32], Ds = f && "CompositionEvent" in window, jo = null;
  f && "documentMode" in document && (jo = document.documentMode);
  var Y2 = f && "TextEvent" in window && !jo, zd = f && (!Ds || jo && 8 < jo && 11 >= jo), Hd = " ", Bd = false;
  function Vd(e, n) {
    switch (e) {
      case "keyup":
        return G2.indexOf(n.keyCode) !== -1;
      case "keydown":
        return n.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function Ud(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Nr = false;
  function X22(e, n) {
    switch (e) {
      case "compositionend":
        return Ud(n);
      case "keypress":
        return n.which !== 32 ? null : (Bd = true, Hd);
      case "textInput":
        return e = n.data, e === Hd && Bd ? null : e;
      default:
        return null;
    }
  }
  function Q2(e, n) {
    if (Nr) return e === "compositionend" || !Ds && Vd(e, n) ? (e = Dd(), Xa = Ms = _n = null, Nr = false, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(n.ctrlKey || n.altKey || n.metaKey) || n.ctrlKey && n.altKey) {
          if (n.char && 1 < n.char.length) return n.char;
          if (n.which) return String.fromCharCode(n.which);
        }
        return null;
      case "compositionend":
        return zd && n.locale !== "ko" ? null : n.data;
      default:
        return null;
    }
  }
  var Z2 = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
  function Wd(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n === "input" ? !!Z2[e.type] : n === "textarea";
  }
  function qd(e, n, i, c7) {
    dd(c7), n = oi(n, "onChange"), 0 < n.length && (i = new As("onChange", "change", null, i, c7), e.push({ event: i, listeners: n }));
  }
  var Fo = null, $o = null;
  function J2(e) {
    up(e, 0);
  }
  function ei(e) {
    var n = Fr(e);
    if ($e(n)) return e;
  }
  function ew(e, n) {
    if (e === "change") return n;
  }
  var Kd = false;
  if (f) {
    var Ls;
    if (f) {
      var js = "oninput" in document;
      if (!js) {
        var Gd = document.createElement("div");
        Gd.setAttribute("oninput", "return;"), js = typeof Gd.oninput == "function";
      }
      Ls = js;
    } else Ls = false;
    Kd = Ls && (!document.documentMode || 9 < document.documentMode);
  }
  function Yd() {
    Fo && (Fo.detachEvent("onpropertychange", Xd), $o = Fo = null);
  }
  function Xd(e) {
    if (e.propertyName === "value" && ei($o)) {
      var n = [];
      qd(n, $o, e, ys(e)), yd(J2, n);
    }
  }
  function tw(e, n, i) {
    e === "focusin" ? (Yd(), Fo = n, $o = i, Fo.attachEvent("onpropertychange", Xd)) : e === "focusout" && Yd();
  }
  function nw(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return ei($o);
  }
  function rw(e, n) {
    if (e === "click") return ei(n);
  }
  function ow(e, n) {
    if (e === "input" || e === "change") return ei(n);
  }
  function aw(e, n) {
    return e === n && (e !== 0 || 1 / e === 1 / n) || e !== e && n !== n;
  }
  var $t = typeof Object.is == "function" ? Object.is : aw;
  function zo(e, n) {
    if ($t(e, n)) return true;
    if (typeof e != "object" || e === null || typeof n != "object" || n === null) return false;
    var i = Object.keys(e), c7 = Object.keys(n);
    if (i.length !== c7.length) return false;
    for (c7 = 0; c7 < i.length; c7++) {
      var h = i[c7];
      if (!d.call(n, h) || !$t(e[h], n[h])) return false;
    }
    return true;
  }
  function Qd(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Zd(e, n) {
    var i = Qd(e);
    e = 0;
    for (var c7; i; ) {
      if (i.nodeType === 3) {
        if (c7 = e + i.textContent.length, e <= n && c7 >= n) return { node: i, offset: n - e };
        e = c7;
      }
      e: {
        for (; i; ) {
          if (i.nextSibling) {
            i = i.nextSibling;
            break e;
          }
          i = i.parentNode;
        }
        i = void 0;
      }
      i = Qd(i);
    }
  }
  function Jd(e, n) {
    return e && n ? e === n ? true : e && e.nodeType === 3 ? false : n && n.nodeType === 3 ? Jd(e, n.parentNode) : "contains" in e ? e.contains(n) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(n) & 16) : false : false;
  }
  function ep() {
    for (var e = window, n = Je(); n instanceof e.HTMLIFrameElement; ) {
      try {
        var i = typeof n.contentWindow.location.href == "string";
      } catch {
        i = false;
      }
      if (i) e = n.contentWindow;
      else break;
      n = Je(e.document);
    }
    return n;
  }
  function Fs(e) {
    var n = e && e.nodeName && e.nodeName.toLowerCase();
    return n && (n === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || n === "textarea" || e.contentEditable === "true");
  }
  function iw(e) {
    var n = ep(), i = e.focusedElem, c7 = e.selectionRange;
    if (n !== i && i && i.ownerDocument && Jd(i.ownerDocument.documentElement, i)) {
      if (c7 !== null && Fs(i)) {
        if (n = c7.start, e = c7.end, e === void 0 && (e = n), "selectionStart" in i) i.selectionStart = n, i.selectionEnd = Math.min(e, i.value.length);
        else if (e = (n = i.ownerDocument || document) && n.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var h = i.textContent.length, y = Math.min(c7.start, h);
          c7 = c7.end === void 0 ? y : Math.min(c7.end, h), !e.extend && y > c7 && (h = c7, c7 = y, y = h), h = Zd(i, y);
          var S = Zd(i, c7);
          h && S && (e.rangeCount !== 1 || e.anchorNode !== h.node || e.anchorOffset !== h.offset || e.focusNode !== S.node || e.focusOffset !== S.offset) && (n = n.createRange(), n.setStart(h.node, h.offset), e.removeAllRanges(), y > c7 ? (e.addRange(n), e.extend(S.node, S.offset)) : (n.setEnd(S.node, S.offset), e.addRange(n)));
        }
      }
      for (n = [], e = i; e = e.parentNode; ) e.nodeType === 1 && n.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof i.focus == "function" && i.focus(), i = 0; i < n.length; i++) e = n[i], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var lw = f && "documentMode" in document && 11 >= document.documentMode, Ir = null, $s = null, Ho = null, zs = false;
  function tp(e, n, i) {
    var c7 = i.window === i ? i.document : i.nodeType === 9 ? i : i.ownerDocument;
    zs || Ir == null || Ir !== Je(c7) || (c7 = Ir, "selectionStart" in c7 && Fs(c7) ? c7 = { start: c7.selectionStart, end: c7.selectionEnd } : (c7 = (c7.ownerDocument && c7.ownerDocument.defaultView || window).getSelection(), c7 = { anchorNode: c7.anchorNode, anchorOffset: c7.anchorOffset, focusNode: c7.focusNode, focusOffset: c7.focusOffset }), Ho && zo(Ho, c7) || (Ho = c7, c7 = oi($s, "onSelect"), 0 < c7.length && (n = new As("onSelect", "select", null, n, i), e.push({ event: n, listeners: c7 }), n.target = Ir)));
  }
  function ti(e, n) {
    var i = {};
    return i[e.toLowerCase()] = n.toLowerCase(), i["Webkit" + e] = "webkit" + n, i["Moz" + e] = "moz" + n, i;
  }
  var Dr = { animationend: ti("Animation", "AnimationEnd"), animationiteration: ti("Animation", "AnimationIteration"), animationstart: ti("Animation", "AnimationStart"), transitionend: ti("Transition", "TransitionEnd") }, Hs = {}, np = {};
  f && (np = document.createElement("div").style, "AnimationEvent" in window || (delete Dr.animationend.animation, delete Dr.animationiteration.animation, delete Dr.animationstart.animation), "TransitionEvent" in window || delete Dr.transitionend.transition);
  function ni(e) {
    if (Hs[e]) return Hs[e];
    if (!Dr[e]) return e;
    var n = Dr[e], i;
    for (i in n) if (n.hasOwnProperty(i) && i in np) return Hs[e] = n[i];
    return e;
  }
  var rp = ni("animationend"), op = ni("animationiteration"), ap = ni("animationstart"), ip = ni("transitionend"), lp = /* @__PURE__ */ new Map(), sp = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function On(e, n) {
    lp.set(e, n), s(n, [e]);
  }
  for (var Bs = 0; Bs < sp.length; Bs++) {
    var Vs = sp[Bs], sw = Vs.toLowerCase(), cw = Vs[0].toUpperCase() + Vs.slice(1);
    On(sw, "on" + cw);
  }
  On(rp, "onAnimationEnd"), On(op, "onAnimationIteration"), On(ap, "onAnimationStart"), On("dblclick", "onDoubleClick"), On("focusin", "onFocus"), On("focusout", "onBlur"), On(ip, "onTransitionEnd"), u2("onMouseEnter", ["mouseout", "mouseover"]), u2("onMouseLeave", ["mouseout", "mouseover"]), u2("onPointerEnter", ["pointerout", "pointerover"]), u2("onPointerLeave", ["pointerout", "pointerover"]), s("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), s("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), s("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), s("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), s("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), s("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Bo = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), uw = new Set("cancel close invalid load scroll toggle".split(" ").concat(Bo));
  function cp(e, n, i) {
    var c7 = e.type || "unknown-event";
    e.currentTarget = i, s2(c7, n, void 0, e), e.currentTarget = null;
  }
  function up(e, n) {
    n = (n & 4) !== 0;
    for (var i = 0; i < e.length; i++) {
      var c7 = e[i], h = c7.event;
      c7 = c7.listeners;
      e: {
        var y = void 0;
        if (n) for (var S = c7.length - 1; 0 <= S; S--) {
          var T = c7[S], _ = T.instance, F = T.currentTarget;
          if (T = T.listener, _ !== y && h.isPropagationStopped()) break e;
          cp(h, T, F), y = _;
        }
        else for (S = 0; S < c7.length; S++) {
          if (T = c7[S], _ = T.instance, F = T.currentTarget, T = T.listener, _ !== y && h.isPropagationStopped()) break e;
          cp(h, T, F), y = _;
        }
      }
    }
    if (za) throw e = xs, za = false, xs = null, e;
  }
  function Ie(e, n) {
    var i = n[Qs];
    i === void 0 && (i = n[Qs] = /* @__PURE__ */ new Set());
    var c7 = e + "__bubble";
    i.has(c7) || (fp(n, e, 2, false), i.add(c7));
  }
  function Us(e, n, i) {
    var c7 = 0;
    n && (c7 |= 4), fp(i, e, c7, n);
  }
  var ri = "_reactListening" + Math.random().toString(36).slice(2);
  function Vo(e) {
    if (!e[ri]) {
      e[ri] = true, a.forEach(function(i) {
        i !== "selectionchange" && (uw.has(i) || Us(i, false, e), Us(i, true, e));
      });
      var n = e.nodeType === 9 ? e : e.ownerDocument;
      n === null || n[ri] || (n[ri] = true, Us("selectionchange", false, n));
    }
  }
  function fp(e, n, i, c7) {
    switch (Id(n)) {
      case 1:
        var h = E2;
        break;
      case 4:
        h = R2;
        break;
      default:
        h = bs;
    }
    i = h.bind(null, n, i, e), h = void 0, !ws || n !== "touchstart" && n !== "touchmove" && n !== "wheel" || (h = true), c7 ? h !== void 0 ? e.addEventListener(n, i, { capture: true, passive: h }) : e.addEventListener(n, i, true) : h !== void 0 ? e.addEventListener(n, i, { passive: h }) : e.addEventListener(n, i, false);
  }
  function Ws(e, n, i, c7, h) {
    var y = c7;
    if ((n & 1) === 0 && (n & 2) === 0 && c7 !== null) e: for (; ; ) {
      if (c7 === null) return;
      var S = c7.tag;
      if (S === 3 || S === 4) {
        var T = c7.stateNode.containerInfo;
        if (T === h || T.nodeType === 8 && T.parentNode === h) break;
        if (S === 4) for (S = c7.return; S !== null; ) {
          var _ = S.tag;
          if ((_ === 3 || _ === 4) && (_ = S.stateNode.containerInfo, _ === h || _.nodeType === 8 && _.parentNode === h)) return;
          S = S.return;
        }
        for (; T !== null; ) {
          if (S = rr(T), S === null) return;
          if (_ = S.tag, _ === 5 || _ === 6) {
            c7 = y = S;
            continue e;
          }
          T = T.parentNode;
        }
      }
      c7 = c7.return;
    }
    yd(function() {
      var F = y, W = ys(i), q = [];
      e: {
        var U = lp.get(e);
        if (U !== void 0) {
          var te = As, oe = e;
          switch (e) {
            case "keypress":
              if (Qa(i) === 0) break e;
            case "keydown":
            case "keyup":
              te = z2;
              break;
            case "focusin":
              oe = "focus", te = Ns;
              break;
            case "focusout":
              oe = "blur", te = Ns;
              break;
            case "beforeblur":
            case "afterblur":
              te = Ns;
              break;
            case "click":
              if (i.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              te = jd;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              te = T2;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              te = V2;
              break;
            case rp:
            case op:
            case ap:
              te = _2;
              break;
            case ip:
              te = W2;
              break;
            case "scroll":
              te = P2;
              break;
            case "wheel":
              te = K2;
              break;
            case "copy":
            case "cut":
            case "paste":
              te = N2;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              te = $d;
          }
          var ie = (n & 4) !== 0, Ue = !ie && e === "scroll", D = ie ? U !== null ? U + "Capture" : null : U;
          ie = [];
          for (var O = F, L; O !== null; ) {
            L = O;
            var K = L.stateNode;
            if (L.tag === 5 && K !== null && (L = K, D !== null && (K = Ro(O, D), K != null && ie.push(Uo(O, K, L)))), Ue) break;
            O = O.return;
          }
          0 < ie.length && (U = new te(U, oe, null, i, W), q.push({ event: U, listeners: ie }));
        }
      }
      if ((n & 7) === 0) {
        e: {
          if (U = e === "mouseover" || e === "pointerover", te = e === "mouseout" || e === "pointerout", U && i !== ms && (oe = i.relatedTarget || i.fromElement) && (rr(oe) || oe[pn])) break e;
          if ((te || U) && (U = W.window === W ? W : (U = W.ownerDocument) ? U.defaultView || U.parentWindow : window, te ? (oe = i.relatedTarget || i.toElement, te = F, oe = oe ? rr(oe) : null, oe !== null && (Ue = nr(oe), oe !== Ue || oe.tag !== 5 && oe.tag !== 6) && (oe = null)) : (te = null, oe = F), te !== oe)) {
            if (ie = jd, K = "onMouseLeave", D = "onMouseEnter", O = "mouse", (e === "pointerout" || e === "pointerover") && (ie = $d, K = "onPointerLeave", D = "onPointerEnter", O = "pointer"), Ue = te == null ? U : Fr(te), L = oe == null ? U : Fr(oe), U = new ie(K, O + "leave", te, i, W), U.target = Ue, U.relatedTarget = L, K = null, rr(W) === F && (ie = new ie(D, O + "enter", oe, i, W), ie.target = L, ie.relatedTarget = Ue, K = ie), Ue = K, te && oe) t: {
              for (ie = te, D = oe, O = 0, L = ie; L; L = Lr(L)) O++;
              for (L = 0, K = D; K; K = Lr(K)) L++;
              for (; 0 < O - L; ) ie = Lr(ie), O--;
              for (; 0 < L - O; ) D = Lr(D), L--;
              for (; O--; ) {
                if (ie === D || D !== null && ie === D.alternate) break t;
                ie = Lr(ie), D = Lr(D);
              }
              ie = null;
            }
            else ie = null;
            te !== null && dp(q, U, te, ie, false), oe !== null && Ue !== null && dp(q, Ue, oe, ie, true);
          }
        }
        e: {
          if (U = F ? Fr(F) : window, te = U.nodeName && U.nodeName.toLowerCase(), te === "select" || te === "input" && U.type === "file") var se = ew;
          else if (Wd(U)) if (Kd) se = ow;
          else {
            se = nw;
            var he = tw;
          }
          else (te = U.nodeName) && te.toLowerCase() === "input" && (U.type === "checkbox" || U.type === "radio") && (se = rw);
          if (se && (se = se(e, F))) {
            qd(q, se, i, W);
            break e;
          }
          he && he(e, U, F), e === "focusout" && (he = U._wrapperState) && he.controlled && U.type === "number" && us(U, "number", U.value);
        }
        switch (he = F ? Fr(F) : window, e) {
          case "focusin":
            (Wd(he) || he.contentEditable === "true") && (Ir = he, $s = F, Ho = null);
            break;
          case "focusout":
            Ho = $s = Ir = null;
            break;
          case "mousedown":
            zs = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            zs = false, tp(q, i, W);
            break;
          case "selectionchange":
            if (lw) break;
          case "keydown":
          case "keyup":
            tp(q, i, W);
        }
        var me;
        if (Ds) e: {
          switch (e) {
            case "compositionstart":
              var xe = "onCompositionStart";
              break e;
            case "compositionend":
              xe = "onCompositionEnd";
              break e;
            case "compositionupdate":
              xe = "onCompositionUpdate";
              break e;
          }
          xe = void 0;
        }
        else Nr ? Vd(e, i) && (xe = "onCompositionEnd") : e === "keydown" && i.keyCode === 229 && (xe = "onCompositionStart");
        xe && (zd && i.locale !== "ko" && (Nr || xe !== "onCompositionStart" ? xe === "onCompositionEnd" && Nr && (me = Dd()) : (_n = W, Ms = "value" in _n ? _n.value : _n.textContent, Nr = true)), he = oi(F, xe), 0 < he.length && (xe = new Fd(xe, e, null, i, W), q.push({ event: xe, listeners: he }), me ? xe.data = me : (me = Ud(i), me !== null && (xe.data = me)))), (me = Y2 ? X22(e, i) : Q2(e, i)) && (F = oi(F, "onBeforeInput"), 0 < F.length && (W = new Fd("onBeforeInput", "beforeinput", null, i, W), q.push({ event: W, listeners: F }), W.data = me));
      }
      up(q, n);
    });
  }
  function Uo(e, n, i) {
    return { instance: e, listener: n, currentTarget: i };
  }
  function oi(e, n) {
    for (var i = n + "Capture", c7 = []; e !== null; ) {
      var h = e, y = h.stateNode;
      h.tag === 5 && y !== null && (h = y, y = Ro(e, i), y != null && c7.unshift(Uo(e, y, h)), y = Ro(e, n), y != null && c7.push(Uo(e, y, h))), e = e.return;
    }
    return c7;
  }
  function Lr(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function dp(e, n, i, c7, h) {
    for (var y = n._reactName, S = []; i !== null && i !== c7; ) {
      var T = i, _ = T.alternate, F = T.stateNode;
      if (_ !== null && _ === c7) break;
      T.tag === 5 && F !== null && (T = F, h ? (_ = Ro(i, y), _ != null && S.unshift(Uo(i, _, T))) : h || (_ = Ro(i, y), _ != null && S.push(Uo(i, _, T)))), i = i.return;
    }
    S.length !== 0 && e.push({ event: n, listeners: S });
  }
  var fw = /\r\n?/g, dw = /\u0000|\uFFFD/g;
  function pp(e) {
    return (typeof e == "string" ? e : "" + e).replace(fw, `
`).replace(dw, "");
  }
  function ai(e, n, i) {
    if (n = pp(n), pp(e) !== n && i) throw Error(o(425));
  }
  function ii() {
  }
  var qs = null, Ks = null;
  function Gs(e, n) {
    return e === "textarea" || e === "noscript" || typeof n.children == "string" || typeof n.children == "number" || typeof n.dangerouslySetInnerHTML == "object" && n.dangerouslySetInnerHTML !== null && n.dangerouslySetInnerHTML.__html != null;
  }
  var Ys = typeof setTimeout == "function" ? setTimeout : void 0, pw = typeof clearTimeout == "function" ? clearTimeout : void 0, hp = typeof Promise == "function" ? Promise : void 0, hw = typeof queueMicrotask == "function" ? queueMicrotask : typeof hp < "u" ? function(e) {
    return hp.resolve(null).then(e).catch(mw);
  } : Ys;
  function mw(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Xs(e, n) {
    var i = n, c7 = 0;
    do {
      var h = i.nextSibling;
      if (e.removeChild(i), h && h.nodeType === 8) if (i = h.data, i === "/$") {
        if (c7 === 0) {
          e.removeChild(h), Io(n);
          return;
        }
        c7--;
      } else i !== "$" && i !== "$?" && i !== "$!" || c7++;
      i = h;
    } while (i);
    Io(n);
  }
  function Nn(e) {
    for (; e != null; e = e.nextSibling) {
      var n = e.nodeType;
      if (n === 1 || n === 3) break;
      if (n === 8) {
        if (n = e.data, n === "$" || n === "$!" || n === "$?") break;
        if (n === "/$") return null;
      }
    }
    return e;
  }
  function mp(e) {
    e = e.previousSibling;
    for (var n = 0; e; ) {
      if (e.nodeType === 8) {
        var i = e.data;
        if (i === "$" || i === "$!" || i === "$?") {
          if (n === 0) return e;
          n--;
        } else i === "/$" && n++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var jr = Math.random().toString(36).slice(2), nn = "__reactFiber$" + jr, Wo = "__reactProps$" + jr, pn = "__reactContainer$" + jr, Qs = "__reactEvents$" + jr, yw = "__reactListeners$" + jr, vw = "__reactHandles$" + jr;
  function rr(e) {
    var n = e[nn];
    if (n) return n;
    for (var i = e.parentNode; i; ) {
      if (n = i[pn] || i[nn]) {
        if (i = n.alternate, n.child !== null || i !== null && i.child !== null) for (e = mp(e); e !== null; ) {
          if (i = e[nn]) return i;
          e = mp(e);
        }
        return n;
      }
      e = i, i = e.parentNode;
    }
    return null;
  }
  function qo(e) {
    return e = e[nn] || e[pn], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function Fr(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(o(33));
  }
  function li(e) {
    return e[Wo] || null;
  }
  var Zs = [], $r = -1;
  function In(e) {
    return { current: e };
  }
  function De(e) {
    0 > $r || (e.current = Zs[$r], Zs[$r] = null, $r--);
  }
  function Ne(e, n) {
    $r++, Zs[$r] = e.current, e.current = n;
  }
  var Dn = {}, at2 = In(Dn), dt = In(false), or = Dn;
  function zr(e, n) {
    var i = e.type.contextTypes;
    if (!i) return Dn;
    var c7 = e.stateNode;
    if (c7 && c7.__reactInternalMemoizedUnmaskedChildContext === n) return c7.__reactInternalMemoizedMaskedChildContext;
    var h = {}, y;
    for (y in i) h[y] = n[y];
    return c7 && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = n, e.__reactInternalMemoizedMaskedChildContext = h), h;
  }
  function pt(e) {
    return e = e.childContextTypes, e != null;
  }
  function si() {
    De(dt), De(at2);
  }
  function yp(e, n, i) {
    if (at2.current !== Dn) throw Error(o(168));
    Ne(at2, n), Ne(dt, i);
  }
  function vp(e, n, i) {
    var c7 = e.stateNode;
    if (n = n.childContextTypes, typeof c7.getChildContext != "function") return i;
    c7 = c7.getChildContext();
    for (var h in c7) if (!(h in n)) throw Error(o(108, Y(e) || "Unknown", h));
    return X2({}, i, c7);
  }
  function ci(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Dn, or = at2.current, Ne(at2, e), Ne(dt, dt.current), true;
  }
  function gp(e, n, i) {
    var c7 = e.stateNode;
    if (!c7) throw Error(o(169));
    i ? (e = vp(e, n, or), c7.__reactInternalMemoizedMergedChildContext = e, De(dt), De(at2), Ne(at2, e)) : De(dt), Ne(dt, i);
  }
  var hn = null, ui = false, Js = false;
  function wp(e) {
    hn === null ? hn = [e] : hn.push(e);
  }
  function gw(e) {
    ui = true, wp(e);
  }
  function Ln() {
    if (!Js && hn !== null) {
      Js = true;
      var e = 0, n = _e;
      try {
        var i = hn;
        for (_e = 1; e < i.length; e++) {
          var c7 = i[e];
          do
            c7 = c7(true);
          while (c7 !== null);
        }
        hn = null, ui = false;
      } catch (h) {
        throw hn !== null && (hn = hn.slice(e + 1)), Sd(Ss, Ln), h;
      } finally {
        _e = n, Js = false;
      }
    }
    return null;
  }
  var Hr = [], Br = 0, fi = null, di = 0, Tt = [], Mt = 0, ar = null, mn = 1, yn = "";
  function ir(e, n) {
    Hr[Br++] = di, Hr[Br++] = fi, fi = e, di = n;
  }
  function xp(e, n, i) {
    Tt[Mt++] = mn, Tt[Mt++] = yn, Tt[Mt++] = ar, ar = e;
    var c7 = mn;
    e = yn;
    var h = 32 - Ft(c7) - 1;
    c7 &= ~(1 << h), i += 1;
    var y = 32 - Ft(n) + h;
    if (30 < y) {
      var S = h - h % 5;
      y = (c7 & (1 << S) - 1).toString(32), c7 >>= S, h -= S, mn = 1 << 32 - Ft(n) + h | i << h | c7, yn = y + e;
    } else mn = 1 << y | i << h | c7, yn = e;
  }
  function ec(e) {
    e.return !== null && (ir(e, 1), xp(e, 1, 0));
  }
  function tc(e) {
    for (; e === fi; ) fi = Hr[--Br], Hr[Br] = null, di = Hr[--Br], Hr[Br] = null;
    for (; e === ar; ) ar = Tt[--Mt], Tt[Mt] = null, yn = Tt[--Mt], Tt[Mt] = null, mn = Tt[--Mt], Tt[Mt] = null;
  }
  var Ct = null, kt = null, Le = false, zt = null;
  function Sp(e, n) {
    var i = Nt(5, null, null, 0);
    i.elementType = "DELETED", i.stateNode = n, i.return = e, n = e.deletions, n === null ? (e.deletions = [i], e.flags |= 16) : n.push(i);
  }
  function Cp(e, n) {
    switch (e.tag) {
      case 5:
        var i = e.type;
        return n = n.nodeType !== 1 || i.toLowerCase() !== n.nodeName.toLowerCase() ? null : n, n !== null ? (e.stateNode = n, Ct = e, kt = Nn(n.firstChild), true) : false;
      case 6:
        return n = e.pendingProps === "" || n.nodeType !== 3 ? null : n, n !== null ? (e.stateNode = n, Ct = e, kt = null, true) : false;
      case 13:
        return n = n.nodeType !== 8 ? null : n, n !== null ? (i = ar !== null ? { id: mn, overflow: yn } : null, e.memoizedState = { dehydrated: n, treeContext: i, retryLane: 1073741824 }, i = Nt(18, null, null, 0), i.stateNode = n, i.return = e, e.child = i, Ct = e, kt = null, true) : false;
      default:
        return false;
    }
  }
  function nc(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function rc(e) {
    if (Le) {
      var n = kt;
      if (n) {
        var i = n;
        if (!Cp(e, n)) {
          if (nc(e)) throw Error(o(418));
          n = Nn(i.nextSibling);
          var c7 = Ct;
          n && Cp(e, n) ? Sp(c7, i) : (e.flags = e.flags & -4097 | 2, Le = false, Ct = e);
        }
      } else {
        if (nc(e)) throw Error(o(418));
        e.flags = e.flags & -4097 | 2, Le = false, Ct = e;
      }
    }
  }
  function kp(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    Ct = e;
  }
  function pi(e) {
    if (e !== Ct) return false;
    if (!Le) return kp(e), Le = true, false;
    var n;
    if ((n = e.tag !== 3) && !(n = e.tag !== 5) && (n = e.type, n = n !== "head" && n !== "body" && !Gs(e.type, e.memoizedProps)), n && (n = kt)) {
      if (nc(e)) throw Ep(), Error(o(418));
      for (; n; ) Sp(e, n), n = Nn(n.nextSibling);
    }
    if (kp(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(o(317));
      e: {
        for (e = e.nextSibling, n = 0; e; ) {
          if (e.nodeType === 8) {
            var i = e.data;
            if (i === "/$") {
              if (n === 0) {
                kt = Nn(e.nextSibling);
                break e;
              }
              n--;
            } else i !== "$" && i !== "$!" && i !== "$?" || n++;
          }
          e = e.nextSibling;
        }
        kt = null;
      }
    } else kt = Ct ? Nn(e.stateNode.nextSibling) : null;
    return true;
  }
  function Ep() {
    for (var e = kt; e; ) e = Nn(e.nextSibling);
  }
  function Vr() {
    kt = Ct = null, Le = false;
  }
  function oc(e) {
    zt === null ? zt = [e] : zt.push(e);
  }
  var ww = N.ReactCurrentBatchConfig;
  function Ko(e, n, i) {
    if (e = i.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (i._owner) {
        if (i = i._owner, i) {
          if (i.tag !== 1) throw Error(o(309));
          var c7 = i.stateNode;
        }
        if (!c7) throw Error(o(147, e));
        var h = c7, y = "" + e;
        return n !== null && n.ref !== null && typeof n.ref == "function" && n.ref._stringRef === y ? n.ref : (n = function(S) {
          var T = h.refs;
          S === null ? delete T[y] : T[y] = S;
        }, n._stringRef = y, n);
      }
      if (typeof e != "string") throw Error(o(284));
      if (!i._owner) throw Error(o(290, e));
    }
    return e;
  }
  function hi(e, n) {
    throw e = Object.prototype.toString.call(n), Error(o(31, e === "[object Object]" ? "object with keys {" + Object.keys(n).join(", ") + "}" : e));
  }
  function Rp(e) {
    var n = e._init;
    return n(e._payload);
  }
  function Pp(e) {
    function n(D, O) {
      if (e) {
        var L = D.deletions;
        L === null ? (D.deletions = [O], D.flags |= 16) : L.push(O);
      }
    }
    function i(D, O) {
      if (!e) return null;
      for (; O !== null; ) n(D, O), O = O.sibling;
      return null;
    }
    function c7(D, O) {
      for (D = /* @__PURE__ */ new Map(); O !== null; ) O.key !== null ? D.set(O.key, O) : D.set(O.index, O), O = O.sibling;
      return D;
    }
    function h(D, O) {
      return D = Un(D, O), D.index = 0, D.sibling = null, D;
    }
    function y(D, O, L) {
      return D.index = L, e ? (L = D.alternate, L !== null ? (L = L.index, L < O ? (D.flags |= 2, O) : L) : (D.flags |= 2, O)) : (D.flags |= 1048576, O);
    }
    function S(D) {
      return e && D.alternate === null && (D.flags |= 2), D;
    }
    function T(D, O, L, K) {
      return O === null || O.tag !== 6 ? (O = Yc(L, D.mode, K), O.return = D, O) : (O = h(O, L), O.return = D, O);
    }
    function _(D, O, L, K) {
      var se = L.type;
      return se === z ? W(D, O, L.props.children, K, L.key) : O !== null && (O.elementType === se || typeof se == "object" && se !== null && se.$$typeof === re && Rp(se) === O.type) ? (K = h(O, L.props), K.ref = Ko(D, O, L), K.return = D, K) : (K = Fi(L.type, L.key, L.props, null, D.mode, K), K.ref = Ko(D, O, L), K.return = D, K);
    }
    function F(D, O, L, K) {
      return O === null || O.tag !== 4 || O.stateNode.containerInfo !== L.containerInfo || O.stateNode.implementation !== L.implementation ? (O = Xc(L, D.mode, K), O.return = D, O) : (O = h(O, L.children || []), O.return = D, O);
    }
    function W(D, O, L, K, se) {
      return O === null || O.tag !== 7 ? (O = hr(L, D.mode, K, se), O.return = D, O) : (O = h(O, L), O.return = D, O);
    }
    function q(D, O, L) {
      if (typeof O == "string" && O !== "" || typeof O == "number") return O = Yc("" + O, D.mode, L), O.return = D, O;
      if (typeof O == "object" && O !== null) {
        switch (O.$$typeof) {
          case j:
            return L = Fi(O.type, O.key, O.props, null, D.mode, L), L.ref = Ko(D, null, O), L.return = D, L;
          case B:
            return O = Xc(O, D.mode, L), O.return = D, O;
          case re:
            var K = O._init;
            return q(D, K(O._payload), L);
        }
        if (Co(O) || H(O)) return O = hr(O, D.mode, L, null), O.return = D, O;
        hi(D, O);
      }
      return null;
    }
    function U(D, O, L, K) {
      var se = O !== null ? O.key : null;
      if (typeof L == "string" && L !== "" || typeof L == "number") return se !== null ? null : T(D, O, "" + L, K);
      if (typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case j:
            return L.key === se ? _(D, O, L, K) : null;
          case B:
            return L.key === se ? F(D, O, L, K) : null;
          case re:
            return se = L._init, U(D, O, se(L._payload), K);
        }
        if (Co(L) || H(L)) return se !== null ? null : W(D, O, L, K, null);
        hi(D, L);
      }
      return null;
    }
    function te(D, O, L, K, se) {
      if (typeof K == "string" && K !== "" || typeof K == "number") return D = D.get(L) || null, T(O, D, "" + K, se);
      if (typeof K == "object" && K !== null) {
        switch (K.$$typeof) {
          case j:
            return D = D.get(K.key === null ? L : K.key) || null, _(O, D, K, se);
          case B:
            return D = D.get(K.key === null ? L : K.key) || null, F(O, D, K, se);
          case re:
            var he = K._init;
            return te(D, O, L, he(K._payload), se);
        }
        if (Co(K) || H(K)) return D = D.get(L) || null, W(O, D, K, se, null);
        hi(O, K);
      }
      return null;
    }
    function oe(D, O, L, K) {
      for (var se = null, he = null, me = O, xe = O = 0, Qe = null; me !== null && xe < L.length; xe++) {
        me.index > xe ? (Qe = me, me = null) : Qe = me.sibling;
        var Te = U(D, me, L[xe], K);
        if (Te === null) {
          me === null && (me = Qe);
          break;
        }
        e && me && Te.alternate === null && n(D, me), O = y(Te, O, xe), he === null ? se = Te : he.sibling = Te, he = Te, me = Qe;
      }
      if (xe === L.length) return i(D, me), Le && ir(D, xe), se;
      if (me === null) {
        for (; xe < L.length; xe++) me = q(D, L[xe], K), me !== null && (O = y(me, O, xe), he === null ? se = me : he.sibling = me, he = me);
        return Le && ir(D, xe), se;
      }
      for (me = c7(D, me); xe < L.length; xe++) Qe = te(me, D, xe, L[xe], K), Qe !== null && (e && Qe.alternate !== null && me.delete(Qe.key === null ? xe : Qe.key), O = y(Qe, O, xe), he === null ? se = Qe : he.sibling = Qe, he = Qe);
      return e && me.forEach(function(Wn) {
        return n(D, Wn);
      }), Le && ir(D, xe), se;
    }
    function ie(D, O, L, K) {
      var se = H(L);
      if (typeof se != "function") throw Error(o(150));
      if (L = se.call(L), L == null) throw Error(o(151));
      for (var he = se = null, me = O, xe = O = 0, Qe = null, Te = L.next(); me !== null && !Te.done; xe++, Te = L.next()) {
        me.index > xe ? (Qe = me, me = null) : Qe = me.sibling;
        var Wn = U(D, me, Te.value, K);
        if (Wn === null) {
          me === null && (me = Qe);
          break;
        }
        e && me && Wn.alternate === null && n(D, me), O = y(Wn, O, xe), he === null ? se = Wn : he.sibling = Wn, he = Wn, me = Qe;
      }
      if (Te.done) return i(D, me), Le && ir(D, xe), se;
      if (me === null) {
        for (; !Te.done; xe++, Te = L.next()) Te = q(D, Te.value, K), Te !== null && (O = y(Te, O, xe), he === null ? se = Te : he.sibling = Te, he = Te);
        return Le && ir(D, xe), se;
      }
      for (me = c7(D, me); !Te.done; xe++, Te = L.next()) Te = te(me, D, xe, Te.value, K), Te !== null && (e && Te.alternate !== null && me.delete(Te.key === null ? xe : Te.key), O = y(Te, O, xe), he === null ? se = Te : he.sibling = Te, he = Te);
      return e && me.forEach(function(Zw) {
        return n(D, Zw);
      }), Le && ir(D, xe), se;
    }
    function Ue(D, O, L, K) {
      if (typeof L == "object" && L !== null && L.type === z && L.key === null && (L = L.props.children), typeof L == "object" && L !== null) {
        switch (L.$$typeof) {
          case j:
            e: {
              for (var se = L.key, he = O; he !== null; ) {
                if (he.key === se) {
                  if (se = L.type, se === z) {
                    if (he.tag === 7) {
                      i(D, he.sibling), O = h(he, L.props.children), O.return = D, D = O;
                      break e;
                    }
                  } else if (he.elementType === se || typeof se == "object" && se !== null && se.$$typeof === re && Rp(se) === he.type) {
                    i(D, he.sibling), O = h(he, L.props), O.ref = Ko(D, he, L), O.return = D, D = O;
                    break e;
                  }
                  i(D, he);
                  break;
                } else n(D, he);
                he = he.sibling;
              }
              L.type === z ? (O = hr(L.props.children, D.mode, K, L.key), O.return = D, D = O) : (K = Fi(L.type, L.key, L.props, null, D.mode, K), K.ref = Ko(D, O, L), K.return = D, D = K);
            }
            return S(D);
          case B:
            e: {
              for (he = L.key; O !== null; ) {
                if (O.key === he) if (O.tag === 4 && O.stateNode.containerInfo === L.containerInfo && O.stateNode.implementation === L.implementation) {
                  i(D, O.sibling), O = h(O, L.children || []), O.return = D, D = O;
                  break e;
                } else {
                  i(D, O);
                  break;
                }
                else n(D, O);
                O = O.sibling;
              }
              O = Xc(L, D.mode, K), O.return = D, D = O;
            }
            return S(D);
          case re:
            return he = L._init, Ue(D, O, he(L._payload), K);
        }
        if (Co(L)) return oe(D, O, L, K);
        if (H(L)) return ie(D, O, L, K);
        hi(D, L);
      }
      return typeof L == "string" && L !== "" || typeof L == "number" ? (L = "" + L, O !== null && O.tag === 6 ? (i(D, O.sibling), O = h(O, L), O.return = D, D = O) : (i(D, O), O = Yc(L, D.mode, K), O.return = D, D = O), S(D)) : i(D, O);
    }
    return Ue;
  }
  var Ur = Pp(true), bp = Pp(false), mi = In(null), yi = null, Wr = null, ac = null;
  function ic() {
    ac = Wr = yi = null;
  }
  function lc(e) {
    var n = mi.current;
    De(mi), e._currentValue = n;
  }
  function sc(e, n, i) {
    for (; e !== null; ) {
      var c7 = e.alternate;
      if ((e.childLanes & n) !== n ? (e.childLanes |= n, c7 !== null && (c7.childLanes |= n)) : c7 !== null && (c7.childLanes & n) !== n && (c7.childLanes |= n), e === i) break;
      e = e.return;
    }
  }
  function qr(e, n) {
    yi = e, ac = Wr = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & n) !== 0 && (ht = true), e.firstContext = null);
  }
  function At(e) {
    var n = e._currentValue;
    if (ac !== e) if (e = { context: e, memoizedValue: n, next: null }, Wr === null) {
      if (yi === null) throw Error(o(308));
      Wr = e, yi.dependencies = { lanes: 0, firstContext: e };
    } else Wr = Wr.next = e;
    return n;
  }
  var lr = null;
  function cc(e) {
    lr === null ? lr = [e] : lr.push(e);
  }
  function Tp(e, n, i, c7) {
    var h = n.interleaved;
    return h === null ? (i.next = i, cc(n)) : (i.next = h.next, h.next = i), n.interleaved = i, vn(e, c7);
  }
  function vn(e, n) {
    e.lanes |= n;
    var i = e.alternate;
    for (i !== null && (i.lanes |= n), i = e, e = e.return; e !== null; ) e.childLanes |= n, i = e.alternate, i !== null && (i.childLanes |= n), i = e, e = e.return;
    return i.tag === 3 ? i.stateNode : null;
  }
  var jn = false;
  function uc(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Mp(e, n) {
    e = e.updateQueue, n.updateQueue === e && (n.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function gn(e, n) {
    return { eventTime: e, lane: n, tag: 0, payload: null, callback: null, next: null };
  }
  function Fn(e, n, i) {
    var c7 = e.updateQueue;
    if (c7 === null) return null;
    if (c7 = c7.shared, (be & 2) !== 0) {
      var h = c7.pending;
      return h === null ? n.next = n : (n.next = h.next, h.next = n), c7.pending = n, vn(e, i);
    }
    return h = c7.interleaved, h === null ? (n.next = n, cc(c7)) : (n.next = h.next, h.next = n), c7.interleaved = n, vn(e, i);
  }
  function vi(e, n, i) {
    if (n = n.updateQueue, n !== null && (n = n.shared, (i & 4194240) !== 0)) {
      var c7 = n.lanes;
      c7 &= e.pendingLanes, i |= c7, n.lanes = i, Es(e, i);
    }
  }
  function Ap(e, n) {
    var i = e.updateQueue, c7 = e.alternate;
    if (c7 !== null && (c7 = c7.updateQueue, i === c7)) {
      var h = null, y = null;
      if (i = i.firstBaseUpdate, i !== null) {
        do {
          var S = { eventTime: i.eventTime, lane: i.lane, tag: i.tag, payload: i.payload, callback: i.callback, next: null };
          y === null ? h = y = S : y = y.next = S, i = i.next;
        } while (i !== null);
        y === null ? h = y = n : y = y.next = n;
      } else h = y = n;
      i = { baseState: c7.baseState, firstBaseUpdate: h, lastBaseUpdate: y, shared: c7.shared, effects: c7.effects }, e.updateQueue = i;
      return;
    }
    e = i.lastBaseUpdate, e === null ? i.firstBaseUpdate = n : e.next = n, i.lastBaseUpdate = n;
  }
  function gi(e, n, i, c7) {
    var h = e.updateQueue;
    jn = false;
    var y = h.firstBaseUpdate, S = h.lastBaseUpdate, T = h.shared.pending;
    if (T !== null) {
      h.shared.pending = null;
      var _ = T, F = _.next;
      _.next = null, S === null ? y = F : S.next = F, S = _;
      var W = e.alternate;
      W !== null && (W = W.updateQueue, T = W.lastBaseUpdate, T !== S && (T === null ? W.firstBaseUpdate = F : T.next = F, W.lastBaseUpdate = _));
    }
    if (y !== null) {
      var q = h.baseState;
      S = 0, W = F = _ = null, T = y;
      do {
        var U = T.lane, te = T.eventTime;
        if ((c7 & U) === U) {
          W !== null && (W = W.next = { eventTime: te, lane: 0, tag: T.tag, payload: T.payload, callback: T.callback, next: null });
          e: {
            var oe = e, ie = T;
            switch (U = n, te = i, ie.tag) {
              case 1:
                if (oe = ie.payload, typeof oe == "function") {
                  q = oe.call(te, q, U);
                  break e;
                }
                q = oe;
                break e;
              case 3:
                oe.flags = oe.flags & -65537 | 128;
              case 0:
                if (oe = ie.payload, U = typeof oe == "function" ? oe.call(te, q, U) : oe, U == null) break e;
                q = X2({}, q, U);
                break e;
              case 2:
                jn = true;
            }
          }
          T.callback !== null && T.lane !== 0 && (e.flags |= 64, U = h.effects, U === null ? h.effects = [T] : U.push(T));
        } else te = { eventTime: te, lane: U, tag: T.tag, payload: T.payload, callback: T.callback, next: null }, W === null ? (F = W = te, _ = q) : W = W.next = te, S |= U;
        if (T = T.next, T === null) {
          if (T = h.shared.pending, T === null) break;
          U = T, T = U.next, U.next = null, h.lastBaseUpdate = U, h.shared.pending = null;
        }
      } while (true);
      if (W === null && (_ = q), h.baseState = _, h.firstBaseUpdate = F, h.lastBaseUpdate = W, n = h.shared.interleaved, n !== null) {
        h = n;
        do
          S |= h.lane, h = h.next;
        while (h !== n);
      } else y === null && (h.shared.lanes = 0);
      ur |= S, e.lanes = S, e.memoizedState = q;
    }
  }
  function _p(e, n, i) {
    if (e = n.effects, n.effects = null, e !== null) for (n = 0; n < e.length; n++) {
      var c7 = e[n], h = c7.callback;
      if (h !== null) {
        if (c7.callback = null, c7 = i, typeof h != "function") throw Error(o(191, h));
        h.call(c7);
      }
    }
  }
  var Go = {}, rn = In(Go), Yo = In(Go), Xo = In(Go);
  function sr(e) {
    if (e === Go) throw Error(o(174));
    return e;
  }
  function fc(e, n) {
    switch (Ne(Xo, n), Ne(Yo, e), Ne(rn, Go), e = n.nodeType, e) {
      case 9:
      case 11:
        n = (n = n.documentElement) ? n.namespaceURI : ds(null, "");
        break;
      default:
        e = e === 8 ? n.parentNode : n, n = e.namespaceURI || null, e = e.tagName, n = ds(n, e);
    }
    De(rn), Ne(rn, n);
  }
  function Kr() {
    De(rn), De(Yo), De(Xo);
  }
  function Op(e) {
    sr(Xo.current);
    var n = sr(rn.current), i = ds(n, e.type);
    n !== i && (Ne(Yo, e), Ne(rn, i));
  }
  function dc(e) {
    Yo.current === e && (De(rn), De(Yo));
  }
  var ze = In(0);
  function wi(e) {
    for (var n = e; n !== null; ) {
      if (n.tag === 13) {
        var i = n.memoizedState;
        if (i !== null && (i = i.dehydrated, i === null || i.data === "$?" || i.data === "$!")) return n;
      } else if (n.tag === 19 && n.memoizedProps.revealOrder !== void 0) {
        if ((n.flags & 128) !== 0) return n;
      } else if (n.child !== null) {
        n.child.return = n, n = n.child;
        continue;
      }
      if (n === e) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return null;
        n = n.return;
      }
      n.sibling.return = n.return, n = n.sibling;
    }
    return null;
  }
  var pc = [];
  function hc() {
    for (var e = 0; e < pc.length; e++) pc[e]._workInProgressVersionPrimary = null;
    pc.length = 0;
  }
  var xi = N.ReactCurrentDispatcher, mc = N.ReactCurrentBatchConfig, cr = 0, He = null, qe = null, Ye = null, Si = false, Qo = false, Zo = 0, xw = 0;
  function it() {
    throw Error(o(321));
  }
  function yc(e, n) {
    if (n === null) return false;
    for (var i = 0; i < n.length && i < e.length; i++) if (!$t(e[i], n[i])) return false;
    return true;
  }
  function vc(e, n, i, c7, h, y) {
    if (cr = y, He = n, n.memoizedState = null, n.updateQueue = null, n.lanes = 0, xi.current = e === null || e.memoizedState === null ? Ew : Rw, e = i(c7, h), Qo) {
      y = 0;
      do {
        if (Qo = false, Zo = 0, 25 <= y) throw Error(o(301));
        y += 1, Ye = qe = null, n.updateQueue = null, xi.current = Pw, e = i(c7, h);
      } while (Qo);
    }
    if (xi.current = Ei, n = qe !== null && qe.next !== null, cr = 0, Ye = qe = He = null, Si = false, n) throw Error(o(300));
    return e;
  }
  function gc() {
    var e = Zo !== 0;
    return Zo = 0, e;
  }
  function on() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ye === null ? He.memoizedState = Ye = e : Ye = Ye.next = e, Ye;
  }
  function _t() {
    if (qe === null) {
      var e = He.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = qe.next;
    var n = Ye === null ? He.memoizedState : Ye.next;
    if (n !== null) Ye = n, qe = e;
    else {
      if (e === null) throw Error(o(310));
      qe = e, e = { memoizedState: qe.memoizedState, baseState: qe.baseState, baseQueue: qe.baseQueue, queue: qe.queue, next: null }, Ye === null ? He.memoizedState = Ye = e : Ye = Ye.next = e;
    }
    return Ye;
  }
  function Jo(e, n) {
    return typeof n == "function" ? n(e) : n;
  }
  function wc(e) {
    var n = _t(), i = n.queue;
    if (i === null) throw Error(o(311));
    i.lastRenderedReducer = e;
    var c7 = qe, h = c7.baseQueue, y = i.pending;
    if (y !== null) {
      if (h !== null) {
        var S = h.next;
        h.next = y.next, y.next = S;
      }
      c7.baseQueue = h = y, i.pending = null;
    }
    if (h !== null) {
      y = h.next, c7 = c7.baseState;
      var T = S = null, _ = null, F = y;
      do {
        var W = F.lane;
        if ((cr & W) === W) _ !== null && (_ = _.next = { lane: 0, action: F.action, hasEagerState: F.hasEagerState, eagerState: F.eagerState, next: null }), c7 = F.hasEagerState ? F.eagerState : e(c7, F.action);
        else {
          var q = { lane: W, action: F.action, hasEagerState: F.hasEagerState, eagerState: F.eagerState, next: null };
          _ === null ? (T = _ = q, S = c7) : _ = _.next = q, He.lanes |= W, ur |= W;
        }
        F = F.next;
      } while (F !== null && F !== y);
      _ === null ? S = c7 : _.next = T, $t(c7, n.memoizedState) || (ht = true), n.memoizedState = c7, n.baseState = S, n.baseQueue = _, i.lastRenderedState = c7;
    }
    if (e = i.interleaved, e !== null) {
      h = e;
      do
        y = h.lane, He.lanes |= y, ur |= y, h = h.next;
      while (h !== e);
    } else h === null && (i.lanes = 0);
    return [n.memoizedState, i.dispatch];
  }
  function xc(e) {
    var n = _t(), i = n.queue;
    if (i === null) throw Error(o(311));
    i.lastRenderedReducer = e;
    var c7 = i.dispatch, h = i.pending, y = n.memoizedState;
    if (h !== null) {
      i.pending = null;
      var S = h = h.next;
      do
        y = e(y, S.action), S = S.next;
      while (S !== h);
      $t(y, n.memoizedState) || (ht = true), n.memoizedState = y, n.baseQueue === null && (n.baseState = y), i.lastRenderedState = y;
    }
    return [y, c7];
  }
  function Np() {
  }
  function Ip(e, n) {
    var i = He, c7 = _t(), h = n(), y = !$t(c7.memoizedState, h);
    if (y && (c7.memoizedState = h, ht = true), c7 = c7.queue, Sc(jp.bind(null, i, c7, e), [e]), c7.getSnapshot !== n || y || Ye !== null && Ye.memoizedState.tag & 1) {
      if (i.flags |= 2048, ea(9, Lp.bind(null, i, c7, h, n), void 0, null), Xe === null) throw Error(o(349));
      (cr & 30) !== 0 || Dp(i, n, h);
    }
    return h;
  }
  function Dp(e, n, i) {
    e.flags |= 16384, e = { getSnapshot: n, value: i }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.stores = [e]) : (i = n.stores, i === null ? n.stores = [e] : i.push(e));
  }
  function Lp(e, n, i, c7) {
    n.value = i, n.getSnapshot = c7, Fp(n) && $p(e);
  }
  function jp(e, n, i) {
    return i(function() {
      Fp(n) && $p(e);
    });
  }
  function Fp(e) {
    var n = e.getSnapshot;
    e = e.value;
    try {
      var i = n();
      return !$t(e, i);
    } catch {
      return true;
    }
  }
  function $p(e) {
    var n = vn(e, 1);
    n !== null && Ut(n, e, 1, -1);
  }
  function zp(e) {
    var n = on();
    return typeof e == "function" && (e = e()), n.memoizedState = n.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Jo, lastRenderedState: e }, n.queue = e, e = e.dispatch = kw.bind(null, He, e), [n.memoizedState, e];
  }
  function ea(e, n, i, c7) {
    return e = { tag: e, create: n, destroy: i, deps: c7, next: null }, n = He.updateQueue, n === null ? (n = { lastEffect: null, stores: null }, He.updateQueue = n, n.lastEffect = e.next = e) : (i = n.lastEffect, i === null ? n.lastEffect = e.next = e : (c7 = i.next, i.next = e, e.next = c7, n.lastEffect = e)), e;
  }
  function Hp() {
    return _t().memoizedState;
  }
  function Ci(e, n, i, c7) {
    var h = on();
    He.flags |= e, h.memoizedState = ea(1 | n, i, void 0, c7 === void 0 ? null : c7);
  }
  function ki(e, n, i, c7) {
    var h = _t();
    c7 = c7 === void 0 ? null : c7;
    var y = void 0;
    if (qe !== null) {
      var S = qe.memoizedState;
      if (y = S.destroy, c7 !== null && yc(c7, S.deps)) {
        h.memoizedState = ea(n, i, y, c7);
        return;
      }
    }
    He.flags |= e, h.memoizedState = ea(1 | n, i, y, c7);
  }
  function Bp(e, n) {
    return Ci(8390656, 8, e, n);
  }
  function Sc(e, n) {
    return ki(2048, 8, e, n);
  }
  function Vp(e, n) {
    return ki(4, 2, e, n);
  }
  function Up(e, n) {
    return ki(4, 4, e, n);
  }
  function Wp(e, n) {
    if (typeof n == "function") return e = e(), n(e), function() {
      n(null);
    };
    if (n != null) return e = e(), n.current = e, function() {
      n.current = null;
    };
  }
  function qp(e, n, i) {
    return i = i != null ? i.concat([e]) : null, ki(4, 4, Wp.bind(null, n, e), i);
  }
  function Cc() {
  }
  function Kp(e, n) {
    var i = _t();
    n = n === void 0 ? null : n;
    var c7 = i.memoizedState;
    return c7 !== null && n !== null && yc(n, c7[1]) ? c7[0] : (i.memoizedState = [e, n], e);
  }
  function Gp(e, n) {
    var i = _t();
    n = n === void 0 ? null : n;
    var c7 = i.memoizedState;
    return c7 !== null && n !== null && yc(n, c7[1]) ? c7[0] : (e = e(), i.memoizedState = [e, n], e);
  }
  function Yp(e, n, i) {
    return (cr & 21) === 0 ? (e.baseState && (e.baseState = false, ht = true), e.memoizedState = i) : ($t(i, n) || (i = Rd(), He.lanes |= i, ur |= i, e.baseState = true), n);
  }
  function Sw(e, n) {
    var i = _e;
    _e = i !== 0 && 4 > i ? i : 4, e(true);
    var c7 = mc.transition;
    mc.transition = {};
    try {
      e(false), n();
    } finally {
      _e = i, mc.transition = c7;
    }
  }
  function Xp() {
    return _t().memoizedState;
  }
  function Cw(e, n, i) {
    var c7 = Bn(e);
    if (i = { lane: c7, action: i, hasEagerState: false, eagerState: null, next: null }, Qp(e)) Zp(n, i);
    else if (i = Tp(e, n, i, c7), i !== null) {
      var h = ut();
      Ut(i, e, c7, h), Jp(i, n, c7);
    }
  }
  function kw(e, n, i) {
    var c7 = Bn(e), h = { lane: c7, action: i, hasEagerState: false, eagerState: null, next: null };
    if (Qp(e)) Zp(n, h);
    else {
      var y = e.alternate;
      if (e.lanes === 0 && (y === null || y.lanes === 0) && (y = n.lastRenderedReducer, y !== null)) try {
        var S = n.lastRenderedState, T = y(S, i);
        if (h.hasEagerState = true, h.eagerState = T, $t(T, S)) {
          var _ = n.interleaved;
          _ === null ? (h.next = h, cc(n)) : (h.next = _.next, _.next = h), n.interleaved = h;
          return;
        }
      } catch {
      }
      i = Tp(e, n, h, c7), i !== null && (h = ut(), Ut(i, e, c7, h), Jp(i, n, c7));
    }
  }
  function Qp(e) {
    var n = e.alternate;
    return e === He || n !== null && n === He;
  }
  function Zp(e, n) {
    Qo = Si = true;
    var i = e.pending;
    i === null ? n.next = n : (n.next = i.next, i.next = n), e.pending = n;
  }
  function Jp(e, n, i) {
    if ((i & 4194240) !== 0) {
      var c7 = n.lanes;
      c7 &= e.pendingLanes, i |= c7, n.lanes = i, Es(e, i);
    }
  }
  var Ei = { readContext: At, useCallback: it, useContext: it, useEffect: it, useImperativeHandle: it, useInsertionEffect: it, useLayoutEffect: it, useMemo: it, useReducer: it, useRef: it, useState: it, useDebugValue: it, useDeferredValue: it, useTransition: it, useMutableSource: it, useSyncExternalStore: it, useId: it, unstable_isNewReconciler: false }, Ew = { readContext: At, useCallback: function(e, n) {
    return on().memoizedState = [e, n === void 0 ? null : n], e;
  }, useContext: At, useEffect: Bp, useImperativeHandle: function(e, n, i) {
    return i = i != null ? i.concat([e]) : null, Ci(4194308, 4, Wp.bind(null, n, e), i);
  }, useLayoutEffect: function(e, n) {
    return Ci(4194308, 4, e, n);
  }, useInsertionEffect: function(e, n) {
    return Ci(4, 2, e, n);
  }, useMemo: function(e, n) {
    var i = on();
    return n = n === void 0 ? null : n, e = e(), i.memoizedState = [e, n], e;
  }, useReducer: function(e, n, i) {
    var c7 = on();
    return n = i !== void 0 ? i(n) : n, c7.memoizedState = c7.baseState = n, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: n }, c7.queue = e, e = e.dispatch = Cw.bind(null, He, e), [c7.memoizedState, e];
  }, useRef: function(e) {
    var n = on();
    return e = { current: e }, n.memoizedState = e;
  }, useState: zp, useDebugValue: Cc, useDeferredValue: function(e) {
    return on().memoizedState = e;
  }, useTransition: function() {
    var e = zp(false), n = e[0];
    return e = Sw.bind(null, e[1]), on().memoizedState = e, [n, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, n, i) {
    var c7 = He, h = on();
    if (Le) {
      if (i === void 0) throw Error(o(407));
      i = i();
    } else {
      if (i = n(), Xe === null) throw Error(o(349));
      (cr & 30) !== 0 || Dp(c7, n, i);
    }
    h.memoizedState = i;
    var y = { value: i, getSnapshot: n };
    return h.queue = y, Bp(jp.bind(null, c7, y, e), [e]), c7.flags |= 2048, ea(9, Lp.bind(null, c7, y, i, n), void 0, null), i;
  }, useId: function() {
    var e = on(), n = Xe.identifierPrefix;
    if (Le) {
      var i = yn, c7 = mn;
      i = (c7 & ~(1 << 32 - Ft(c7) - 1)).toString(32) + i, n = ":" + n + "R" + i, i = Zo++, 0 < i && (n += "H" + i.toString(32)), n += ":";
    } else i = xw++, n = ":" + n + "r" + i.toString(32) + ":";
    return e.memoizedState = n;
  }, unstable_isNewReconciler: false }, Rw = { readContext: At, useCallback: Kp, useContext: At, useEffect: Sc, useImperativeHandle: qp, useInsertionEffect: Vp, useLayoutEffect: Up, useMemo: Gp, useReducer: wc, useRef: Hp, useState: function() {
    return wc(Jo);
  }, useDebugValue: Cc, useDeferredValue: function(e) {
    var n = _t();
    return Yp(n, qe.memoizedState, e);
  }, useTransition: function() {
    var e = wc(Jo)[0], n = _t().memoizedState;
    return [e, n];
  }, useMutableSource: Np, useSyncExternalStore: Ip, useId: Xp, unstable_isNewReconciler: false }, Pw = { readContext: At, useCallback: Kp, useContext: At, useEffect: Sc, useImperativeHandle: qp, useInsertionEffect: Vp, useLayoutEffect: Up, useMemo: Gp, useReducer: xc, useRef: Hp, useState: function() {
    return xc(Jo);
  }, useDebugValue: Cc, useDeferredValue: function(e) {
    var n = _t();
    return qe === null ? n.memoizedState = e : Yp(n, qe.memoizedState, e);
  }, useTransition: function() {
    var e = xc(Jo)[0], n = _t().memoizedState;
    return [e, n];
  }, useMutableSource: Np, useSyncExternalStore: Ip, useId: Xp, unstable_isNewReconciler: false };
  function Ht(e, n) {
    if (e && e.defaultProps) {
      n = X2({}, n), e = e.defaultProps;
      for (var i in e) n[i] === void 0 && (n[i] = e[i]);
      return n;
    }
    return n;
  }
  function kc(e, n, i, c7) {
    n = e.memoizedState, i = i(c7, n), i = i == null ? n : X2({}, n, i), e.memoizedState = i, e.lanes === 0 && (e.updateQueue.baseState = i);
  }
  var Ri = { isMounted: function(e) {
    return (e = e._reactInternals) ? nr(e) === e : false;
  }, enqueueSetState: function(e, n, i) {
    e = e._reactInternals;
    var c7 = ut(), h = Bn(e), y = gn(c7, h);
    y.payload = n, i != null && (y.callback = i), n = Fn(e, y, h), n !== null && (Ut(n, e, h, c7), vi(n, e, h));
  }, enqueueReplaceState: function(e, n, i) {
    e = e._reactInternals;
    var c7 = ut(), h = Bn(e), y = gn(c7, h);
    y.tag = 1, y.payload = n, i != null && (y.callback = i), n = Fn(e, y, h), n !== null && (Ut(n, e, h, c7), vi(n, e, h));
  }, enqueueForceUpdate: function(e, n) {
    e = e._reactInternals;
    var i = ut(), c7 = Bn(e), h = gn(i, c7);
    h.tag = 2, n != null && (h.callback = n), n = Fn(e, h, c7), n !== null && (Ut(n, e, c7, i), vi(n, e, c7));
  } };
  function eh(e, n, i, c7, h, y, S) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(c7, y, S) : n.prototype && n.prototype.isPureReactComponent ? !zo(i, c7) || !zo(h, y) : true;
  }
  function th(e, n, i) {
    var c7 = false, h = Dn, y = n.contextType;
    return typeof y == "object" && y !== null ? y = At(y) : (h = pt(n) ? or : at2.current, c7 = n.contextTypes, y = (c7 = c7 != null) ? zr(e, h) : Dn), n = new n(i, y), e.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Ri, e.stateNode = n, n._reactInternals = e, c7 && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = h, e.__reactInternalMemoizedMaskedChildContext = y), n;
  }
  function nh(e, n, i, c7) {
    e = n.state, typeof n.componentWillReceiveProps == "function" && n.componentWillReceiveProps(i, c7), typeof n.UNSAFE_componentWillReceiveProps == "function" && n.UNSAFE_componentWillReceiveProps(i, c7), n.state !== e && Ri.enqueueReplaceState(n, n.state, null);
  }
  function Ec(e, n, i, c7) {
    var h = e.stateNode;
    h.props = i, h.state = e.memoizedState, h.refs = {}, uc(e);
    var y = n.contextType;
    typeof y == "object" && y !== null ? h.context = At(y) : (y = pt(n) ? or : at2.current, h.context = zr(e, y)), h.state = e.memoizedState, y = n.getDerivedStateFromProps, typeof y == "function" && (kc(e, n, y, i), h.state = e.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof h.getSnapshotBeforeUpdate == "function" || typeof h.UNSAFE_componentWillMount != "function" && typeof h.componentWillMount != "function" || (n = h.state, typeof h.componentWillMount == "function" && h.componentWillMount(), typeof h.UNSAFE_componentWillMount == "function" && h.UNSAFE_componentWillMount(), n !== h.state && Ri.enqueueReplaceState(h, h.state, null), gi(e, i, h, c7), h.state = e.memoizedState), typeof h.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Gr(e, n) {
    try {
      var i = "", c7 = n;
      do
        i += ke(c7), c7 = c7.return;
      while (c7);
      var h = i;
    } catch (y) {
      h = `
Error generating stack: ` + y.message + `
` + y.stack;
    }
    return { value: e, source: n, stack: h, digest: null };
  }
  function Rc(e, n, i) {
    return { value: e, source: null, stack: i ?? null, digest: n ?? null };
  }
  function Pc(e, n) {
    try {
      console.error(n.value);
    } catch (i) {
      setTimeout(function() {
        throw i;
      });
    }
  }
  var bw = typeof WeakMap == "function" ? WeakMap : Map;
  function rh(e, n, i) {
    i = gn(-1, i), i.tag = 3, i.payload = { element: null };
    var c7 = n.value;
    return i.callback = function() {
      Oi || (Oi = true, Hc = c7), Pc(e, n);
    }, i;
  }
  function oh(e, n, i) {
    i = gn(-1, i), i.tag = 3;
    var c7 = e.type.getDerivedStateFromError;
    if (typeof c7 == "function") {
      var h = n.value;
      i.payload = function() {
        return c7(h);
      }, i.callback = function() {
        Pc(e, n);
      };
    }
    var y = e.stateNode;
    return y !== null && typeof y.componentDidCatch == "function" && (i.callback = function() {
      Pc(e, n), typeof c7 != "function" && (zn === null ? zn = /* @__PURE__ */ new Set([this]) : zn.add(this));
      var S = n.stack;
      this.componentDidCatch(n.value, { componentStack: S !== null ? S : "" });
    }), i;
  }
  function ah(e, n, i) {
    var c7 = e.pingCache;
    if (c7 === null) {
      c7 = e.pingCache = new bw();
      var h = /* @__PURE__ */ new Set();
      c7.set(n, h);
    } else h = c7.get(n), h === void 0 && (h = /* @__PURE__ */ new Set(), c7.set(n, h));
    h.has(i) || (h.add(i), e = Hw.bind(null, e, n, i), n.then(e, e));
  }
  function ih(e) {
    do {
      var n;
      if ((n = e.tag === 13) && (n = e.memoizedState, n = n !== null ? n.dehydrated !== null : true), n) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function lh(e, n, i, c7, h) {
    return (e.mode & 1) === 0 ? (e === n ? e.flags |= 65536 : (e.flags |= 128, i.flags |= 131072, i.flags &= -52805, i.tag === 1 && (i.alternate === null ? i.tag = 17 : (n = gn(-1, 1), n.tag = 2, Fn(i, n, 1))), i.lanes |= 1), e) : (e.flags |= 65536, e.lanes = h, e);
  }
  var Tw = N.ReactCurrentOwner, ht = false;
  function ct(e, n, i, c7) {
    n.child = e === null ? bp(n, null, i, c7) : Ur(n, e.child, i, c7);
  }
  function sh(e, n, i, c7, h) {
    i = i.render;
    var y = n.ref;
    return qr(n, h), c7 = vc(e, n, i, c7, y, h), i = gc(), e !== null && !ht ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~h, wn(e, n, h)) : (Le && i && ec(n), n.flags |= 1, ct(e, n, c7, h), n.child);
  }
  function ch(e, n, i, c7, h) {
    if (e === null) {
      var y = i.type;
      return typeof y == "function" && !Gc(y) && y.defaultProps === void 0 && i.compare === null && i.defaultProps === void 0 ? (n.tag = 15, n.type = y, uh(e, n, y, c7, h)) : (e = Fi(i.type, null, c7, n, n.mode, h), e.ref = n.ref, e.return = n, n.child = e);
    }
    if (y = e.child, (e.lanes & h) === 0) {
      var S = y.memoizedProps;
      if (i = i.compare, i = i !== null ? i : zo, i(S, c7) && e.ref === n.ref) return wn(e, n, h);
    }
    return n.flags |= 1, e = Un(y, c7), e.ref = n.ref, e.return = n, n.child = e;
  }
  function uh(e, n, i, c7, h) {
    if (e !== null) {
      var y = e.memoizedProps;
      if (zo(y, c7) && e.ref === n.ref) if (ht = false, n.pendingProps = c7 = y, (e.lanes & h) !== 0) (e.flags & 131072) !== 0 && (ht = true);
      else return n.lanes = e.lanes, wn(e, n, h);
    }
    return bc(e, n, i, c7, h);
  }
  function fh(e, n, i) {
    var c7 = n.pendingProps, h = c7.children, y = e !== null ? e.memoizedState : null;
    if (c7.mode === "hidden") if ((n.mode & 1) === 0) n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ne(Xr, Et), Et |= i;
    else {
      if ((i & 1073741824) === 0) return e = y !== null ? y.baseLanes | i : i, n.lanes = n.childLanes = 1073741824, n.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, n.updateQueue = null, Ne(Xr, Et), Et |= e, null;
      n.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, c7 = y !== null ? y.baseLanes : i, Ne(Xr, Et), Et |= c7;
    }
    else y !== null ? (c7 = y.baseLanes | i, n.memoizedState = null) : c7 = i, Ne(Xr, Et), Et |= c7;
    return ct(e, n, h, i), n.child;
  }
  function dh(e, n) {
    var i = n.ref;
    (e === null && i !== null || e !== null && e.ref !== i) && (n.flags |= 512, n.flags |= 2097152);
  }
  function bc(e, n, i, c7, h) {
    var y = pt(i) ? or : at2.current;
    return y = zr(n, y), qr(n, h), i = vc(e, n, i, c7, y, h), c7 = gc(), e !== null && !ht ? (n.updateQueue = e.updateQueue, n.flags &= -2053, e.lanes &= ~h, wn(e, n, h)) : (Le && c7 && ec(n), n.flags |= 1, ct(e, n, i, h), n.child);
  }
  function ph(e, n, i, c7, h) {
    if (pt(i)) {
      var y = true;
      ci(n);
    } else y = false;
    if (qr(n, h), n.stateNode === null) bi(e, n), th(n, i, c7), Ec(n, i, c7, h), c7 = true;
    else if (e === null) {
      var S = n.stateNode, T = n.memoizedProps;
      S.props = T;
      var _ = S.context, F = i.contextType;
      typeof F == "object" && F !== null ? F = At(F) : (F = pt(i) ? or : at2.current, F = zr(n, F));
      var W = i.getDerivedStateFromProps, q = typeof W == "function" || typeof S.getSnapshotBeforeUpdate == "function";
      q || typeof S.UNSAFE_componentWillReceiveProps != "function" && typeof S.componentWillReceiveProps != "function" || (T !== c7 || _ !== F) && nh(n, S, c7, F), jn = false;
      var U = n.memoizedState;
      S.state = U, gi(n, c7, S, h), _ = n.memoizedState, T !== c7 || U !== _ || dt.current || jn ? (typeof W == "function" && (kc(n, i, W, c7), _ = n.memoizedState), (T = jn || eh(n, i, T, c7, U, _, F)) ? (q || typeof S.UNSAFE_componentWillMount != "function" && typeof S.componentWillMount != "function" || (typeof S.componentWillMount == "function" && S.componentWillMount(), typeof S.UNSAFE_componentWillMount == "function" && S.UNSAFE_componentWillMount()), typeof S.componentDidMount == "function" && (n.flags |= 4194308)) : (typeof S.componentDidMount == "function" && (n.flags |= 4194308), n.memoizedProps = c7, n.memoizedState = _), S.props = c7, S.state = _, S.context = F, c7 = T) : (typeof S.componentDidMount == "function" && (n.flags |= 4194308), c7 = false);
    } else {
      S = n.stateNode, Mp(e, n), T = n.memoizedProps, F = n.type === n.elementType ? T : Ht(n.type, T), S.props = F, q = n.pendingProps, U = S.context, _ = i.contextType, typeof _ == "object" && _ !== null ? _ = At(_) : (_ = pt(i) ? or : at2.current, _ = zr(n, _));
      var te = i.getDerivedStateFromProps;
      (W = typeof te == "function" || typeof S.getSnapshotBeforeUpdate == "function") || typeof S.UNSAFE_componentWillReceiveProps != "function" && typeof S.componentWillReceiveProps != "function" || (T !== q || U !== _) && nh(n, S, c7, _), jn = false, U = n.memoizedState, S.state = U, gi(n, c7, S, h);
      var oe = n.memoizedState;
      T !== q || U !== oe || dt.current || jn ? (typeof te == "function" && (kc(n, i, te, c7), oe = n.memoizedState), (F = jn || eh(n, i, F, c7, U, oe, _) || false) ? (W || typeof S.UNSAFE_componentWillUpdate != "function" && typeof S.componentWillUpdate != "function" || (typeof S.componentWillUpdate == "function" && S.componentWillUpdate(c7, oe, _), typeof S.UNSAFE_componentWillUpdate == "function" && S.UNSAFE_componentWillUpdate(c7, oe, _)), typeof S.componentDidUpdate == "function" && (n.flags |= 4), typeof S.getSnapshotBeforeUpdate == "function" && (n.flags |= 1024)) : (typeof S.componentDidUpdate != "function" || T === e.memoizedProps && U === e.memoizedState || (n.flags |= 4), typeof S.getSnapshotBeforeUpdate != "function" || T === e.memoizedProps && U === e.memoizedState || (n.flags |= 1024), n.memoizedProps = c7, n.memoizedState = oe), S.props = c7, S.state = oe, S.context = _, c7 = F) : (typeof S.componentDidUpdate != "function" || T === e.memoizedProps && U === e.memoizedState || (n.flags |= 4), typeof S.getSnapshotBeforeUpdate != "function" || T === e.memoizedProps && U === e.memoizedState || (n.flags |= 1024), c7 = false);
    }
    return Tc(e, n, i, c7, y, h);
  }
  function Tc(e, n, i, c7, h, y) {
    dh(e, n);
    var S = (n.flags & 128) !== 0;
    if (!c7 && !S) return h && gp(n, i, false), wn(e, n, y);
    c7 = n.stateNode, Tw.current = n;
    var T = S && typeof i.getDerivedStateFromError != "function" ? null : c7.render();
    return n.flags |= 1, e !== null && S ? (n.child = Ur(n, e.child, null, y), n.child = Ur(n, null, T, y)) : ct(e, n, T, y), n.memoizedState = c7.state, h && gp(n, i, true), n.child;
  }
  function hh(e) {
    var n = e.stateNode;
    n.pendingContext ? yp(e, n.pendingContext, n.pendingContext !== n.context) : n.context && yp(e, n.context, false), fc(e, n.containerInfo);
  }
  function mh(e, n, i, c7, h) {
    return Vr(), oc(h), n.flags |= 256, ct(e, n, i, c7), n.child;
  }
  var Mc = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Ac(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function yh(e, n, i) {
    var c7 = n.pendingProps, h = ze.current, y = false, S = (n.flags & 128) !== 0, T;
    if ((T = S) || (T = e !== null && e.memoizedState === null ? false : (h & 2) !== 0), T ? (y = true, n.flags &= -129) : (e === null || e.memoizedState !== null) && (h |= 1), Ne(ze, h & 1), e === null) return rc(n), e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((n.mode & 1) === 0 ? n.lanes = 1 : e.data === "$!" ? n.lanes = 8 : n.lanes = 1073741824, null) : (S = c7.children, e = c7.fallback, y ? (c7 = n.mode, y = n.child, S = { mode: "hidden", children: S }, (c7 & 1) === 0 && y !== null ? (y.childLanes = 0, y.pendingProps = S) : y = $i(S, c7, 0, null), e = hr(e, c7, i, null), y.return = n, e.return = n, y.sibling = e, n.child = y, n.child.memoizedState = Ac(i), n.memoizedState = Mc, e) : _c(n, S));
    if (h = e.memoizedState, h !== null && (T = h.dehydrated, T !== null)) return Mw(e, n, S, c7, T, h, i);
    if (y) {
      y = c7.fallback, S = n.mode, h = e.child, T = h.sibling;
      var _ = { mode: "hidden", children: c7.children };
      return (S & 1) === 0 && n.child !== h ? (c7 = n.child, c7.childLanes = 0, c7.pendingProps = _, n.deletions = null) : (c7 = Un(h, _), c7.subtreeFlags = h.subtreeFlags & 14680064), T !== null ? y = Un(T, y) : (y = hr(y, S, i, null), y.flags |= 2), y.return = n, c7.return = n, c7.sibling = y, n.child = c7, c7 = y, y = n.child, S = e.child.memoizedState, S = S === null ? Ac(i) : { baseLanes: S.baseLanes | i, cachePool: null, transitions: S.transitions }, y.memoizedState = S, y.childLanes = e.childLanes & ~i, n.memoizedState = Mc, c7;
    }
    return y = e.child, e = y.sibling, c7 = Un(y, { mode: "visible", children: c7.children }), (n.mode & 1) === 0 && (c7.lanes = i), c7.return = n, c7.sibling = null, e !== null && (i = n.deletions, i === null ? (n.deletions = [e], n.flags |= 16) : i.push(e)), n.child = c7, n.memoizedState = null, c7;
  }
  function _c(e, n) {
    return n = $i({ mode: "visible", children: n }, e.mode, 0, null), n.return = e, e.child = n;
  }
  function Pi(e, n, i, c7) {
    return c7 !== null && oc(c7), Ur(n, e.child, null, i), e = _c(n, n.pendingProps.children), e.flags |= 2, n.memoizedState = null, e;
  }
  function Mw(e, n, i, c7, h, y, S) {
    if (i) return n.flags & 256 ? (n.flags &= -257, c7 = Rc(Error(o(422))), Pi(e, n, S, c7)) : n.memoizedState !== null ? (n.child = e.child, n.flags |= 128, null) : (y = c7.fallback, h = n.mode, c7 = $i({ mode: "visible", children: c7.children }, h, 0, null), y = hr(y, h, S, null), y.flags |= 2, c7.return = n, y.return = n, c7.sibling = y, n.child = c7, (n.mode & 1) !== 0 && Ur(n, e.child, null, S), n.child.memoizedState = Ac(S), n.memoizedState = Mc, y);
    if ((n.mode & 1) === 0) return Pi(e, n, S, null);
    if (h.data === "$!") {
      if (c7 = h.nextSibling && h.nextSibling.dataset, c7) var T = c7.dgst;
      return c7 = T, y = Error(o(419)), c7 = Rc(y, c7, void 0), Pi(e, n, S, c7);
    }
    if (T = (S & e.childLanes) !== 0, ht || T) {
      if (c7 = Xe, c7 !== null) {
        switch (S & -S) {
          case 4:
            h = 2;
            break;
          case 16:
            h = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            h = 32;
            break;
          case 536870912:
            h = 268435456;
            break;
          default:
            h = 0;
        }
        h = (h & (c7.suspendedLanes | S)) !== 0 ? 0 : h, h !== 0 && h !== y.retryLane && (y.retryLane = h, vn(e, h), Ut(c7, e, h, -1));
      }
      return Kc(), c7 = Rc(Error(o(421))), Pi(e, n, S, c7);
    }
    return h.data === "$?" ? (n.flags |= 128, n.child = e.child, n = Bw.bind(null, e), h._reactRetry = n, null) : (e = y.treeContext, kt = Nn(h.nextSibling), Ct = n, Le = true, zt = null, e !== null && (Tt[Mt++] = mn, Tt[Mt++] = yn, Tt[Mt++] = ar, mn = e.id, yn = e.overflow, ar = n), n = _c(n, c7.children), n.flags |= 4096, n);
  }
  function vh(e, n, i) {
    e.lanes |= n;
    var c7 = e.alternate;
    c7 !== null && (c7.lanes |= n), sc(e.return, n, i);
  }
  function Oc(e, n, i, c7, h) {
    var y = e.memoizedState;
    y === null ? e.memoizedState = { isBackwards: n, rendering: null, renderingStartTime: 0, last: c7, tail: i, tailMode: h } : (y.isBackwards = n, y.rendering = null, y.renderingStartTime = 0, y.last = c7, y.tail = i, y.tailMode = h);
  }
  function gh(e, n, i) {
    var c7 = n.pendingProps, h = c7.revealOrder, y = c7.tail;
    if (ct(e, n, c7.children, i), c7 = ze.current, (c7 & 2) !== 0) c7 = c7 & 1 | 2, n.flags |= 128;
    else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = n.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && vh(e, i, n);
        else if (e.tag === 19) vh(e, i, n);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === n) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === n) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      c7 &= 1;
    }
    if (Ne(ze, c7), (n.mode & 1) === 0) n.memoizedState = null;
    else switch (h) {
      case "forwards":
        for (i = n.child, h = null; i !== null; ) e = i.alternate, e !== null && wi(e) === null && (h = i), i = i.sibling;
        i = h, i === null ? (h = n.child, n.child = null) : (h = i.sibling, i.sibling = null), Oc(n, false, h, i, y);
        break;
      case "backwards":
        for (i = null, h = n.child, n.child = null; h !== null; ) {
          if (e = h.alternate, e !== null && wi(e) === null) {
            n.child = h;
            break;
          }
          e = h.sibling, h.sibling = i, i = h, h = e;
        }
        Oc(n, true, i, null, y);
        break;
      case "together":
        Oc(n, false, null, null, void 0);
        break;
      default:
        n.memoizedState = null;
    }
    return n.child;
  }
  function bi(e, n) {
    (n.mode & 1) === 0 && e !== null && (e.alternate = null, n.alternate = null, n.flags |= 2);
  }
  function wn(e, n, i) {
    if (e !== null && (n.dependencies = e.dependencies), ur |= n.lanes, (i & n.childLanes) === 0) return null;
    if (e !== null && n.child !== e.child) throw Error(o(153));
    if (n.child !== null) {
      for (e = n.child, i = Un(e, e.pendingProps), n.child = i, i.return = n; e.sibling !== null; ) e = e.sibling, i = i.sibling = Un(e, e.pendingProps), i.return = n;
      i.sibling = null;
    }
    return n.child;
  }
  function Aw(e, n, i) {
    switch (n.tag) {
      case 3:
        hh(n), Vr();
        break;
      case 5:
        Op(n);
        break;
      case 1:
        pt(n.type) && ci(n);
        break;
      case 4:
        fc(n, n.stateNode.containerInfo);
        break;
      case 10:
        var c7 = n.type._context, h = n.memoizedProps.value;
        Ne(mi, c7._currentValue), c7._currentValue = h;
        break;
      case 13:
        if (c7 = n.memoizedState, c7 !== null) return c7.dehydrated !== null ? (Ne(ze, ze.current & 1), n.flags |= 128, null) : (i & n.child.childLanes) !== 0 ? yh(e, n, i) : (Ne(ze, ze.current & 1), e = wn(e, n, i), e !== null ? e.sibling : null);
        Ne(ze, ze.current & 1);
        break;
      case 19:
        if (c7 = (i & n.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (c7) return gh(e, n, i);
          n.flags |= 128;
        }
        if (h = n.memoizedState, h !== null && (h.rendering = null, h.tail = null, h.lastEffect = null), Ne(ze, ze.current), c7) break;
        return null;
      case 22:
      case 23:
        return n.lanes = 0, fh(e, n, i);
    }
    return wn(e, n, i);
  }
  var wh, Nc, xh, Sh;
  wh = function(e, n) {
    for (var i = n.child; i !== null; ) {
      if (i.tag === 5 || i.tag === 6) e.appendChild(i.stateNode);
      else if (i.tag !== 4 && i.child !== null) {
        i.child.return = i, i = i.child;
        continue;
      }
      if (i === n) break;
      for (; i.sibling === null; ) {
        if (i.return === null || i.return === n) return;
        i = i.return;
      }
      i.sibling.return = i.return, i = i.sibling;
    }
  }, Nc = function() {
  }, xh = function(e, n, i, c7) {
    var h = e.memoizedProps;
    if (h !== c7) {
      e = n.stateNode, sr(rn.current);
      var y = null;
      switch (i) {
        case "input":
          h = jt(e, h), c7 = jt(e, c7), y = [];
          break;
        case "select":
          h = X2({}, h, { value: void 0 }), c7 = X2({}, c7, { value: void 0 }), y = [];
          break;
        case "textarea":
          h = fs(e, h), c7 = fs(e, c7), y = [];
          break;
        default:
          typeof h.onClick != "function" && typeof c7.onClick == "function" && (e.onclick = ii);
      }
      ps(i, c7);
      var S;
      i = null;
      for (F in h) if (!c7.hasOwnProperty(F) && h.hasOwnProperty(F) && h[F] != null) if (F === "style") {
        var T = h[F];
        for (S in T) T.hasOwnProperty(S) && (i || (i = {}), i[S] = "");
      } else F !== "dangerouslySetInnerHTML" && F !== "children" && F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && F !== "autoFocus" && (l.hasOwnProperty(F) ? y || (y = []) : (y = y || []).push(F, null));
      for (F in c7) {
        var _ = c7[F];
        if (T = h?.[F], c7.hasOwnProperty(F) && _ !== T && (_ != null || T != null)) if (F === "style") if (T) {
          for (S in T) !T.hasOwnProperty(S) || _ && _.hasOwnProperty(S) || (i || (i = {}), i[S] = "");
          for (S in _) _.hasOwnProperty(S) && T[S] !== _[S] && (i || (i = {}), i[S] = _[S]);
        } else i || (y || (y = []), y.push(F, i)), i = _;
        else F === "dangerouslySetInnerHTML" ? (_ = _ ? _.__html : void 0, T = T ? T.__html : void 0, _ != null && T !== _ && (y = y || []).push(F, _)) : F === "children" ? typeof _ != "string" && typeof _ != "number" || (y = y || []).push(F, "" + _) : F !== "suppressContentEditableWarning" && F !== "suppressHydrationWarning" && (l.hasOwnProperty(F) ? (_ != null && F === "onScroll" && Ie("scroll", e), y || T === _ || (y = [])) : (y = y || []).push(F, _));
      }
      i && (y = y || []).push("style", i);
      var F = y;
      (n.updateQueue = F) && (n.flags |= 4);
    }
  }, Sh = function(e, n, i, c7) {
    i !== c7 && (n.flags |= 4);
  };
  function ta(e, n) {
    if (!Le) switch (e.tailMode) {
      case "hidden":
        n = e.tail;
        for (var i = null; n !== null; ) n.alternate !== null && (i = n), n = n.sibling;
        i === null ? e.tail = null : i.sibling = null;
        break;
      case "collapsed":
        i = e.tail;
        for (var c7 = null; i !== null; ) i.alternate !== null && (c7 = i), i = i.sibling;
        c7 === null ? n || e.tail === null ? e.tail = null : e.tail.sibling = null : c7.sibling = null;
    }
  }
  function lt(e) {
    var n = e.alternate !== null && e.alternate.child === e.child, i = 0, c7 = 0;
    if (n) for (var h = e.child; h !== null; ) i |= h.lanes | h.childLanes, c7 |= h.subtreeFlags & 14680064, c7 |= h.flags & 14680064, h.return = e, h = h.sibling;
    else for (h = e.child; h !== null; ) i |= h.lanes | h.childLanes, c7 |= h.subtreeFlags, c7 |= h.flags, h.return = e, h = h.sibling;
    return e.subtreeFlags |= c7, e.childLanes = i, n;
  }
  function _w(e, n, i) {
    var c7 = n.pendingProps;
    switch (tc(n), n.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return lt(n), null;
      case 1:
        return pt(n.type) && si(), lt(n), null;
      case 3:
        return c7 = n.stateNode, Kr(), De(dt), De(at2), hc(), c7.pendingContext && (c7.context = c7.pendingContext, c7.pendingContext = null), (e === null || e.child === null) && (pi(n) ? n.flags |= 4 : e === null || e.memoizedState.isDehydrated && (n.flags & 256) === 0 || (n.flags |= 1024, zt !== null && (Uc(zt), zt = null))), Nc(e, n), lt(n), null;
      case 5:
        dc(n);
        var h = sr(Xo.current);
        if (i = n.type, e !== null && n.stateNode != null) xh(e, n, i, c7, h), e.ref !== n.ref && (n.flags |= 512, n.flags |= 2097152);
        else {
          if (!c7) {
            if (n.stateNode === null) throw Error(o(166));
            return lt(n), null;
          }
          if (e = sr(rn.current), pi(n)) {
            c7 = n.stateNode, i = n.type;
            var y = n.memoizedProps;
            switch (c7[nn] = n, c7[Wo] = y, e = (n.mode & 1) !== 0, i) {
              case "dialog":
                Ie("cancel", c7), Ie("close", c7);
                break;
              case "iframe":
              case "object":
              case "embed":
                Ie("load", c7);
                break;
              case "video":
              case "audio":
                for (h = 0; h < Bo.length; h++) Ie(Bo[h], c7);
                break;
              case "source":
                Ie("error", c7);
                break;
              case "img":
              case "image":
              case "link":
                Ie("error", c7), Ie("load", c7);
                break;
              case "details":
                Ie("toggle", c7);
                break;
              case "input":
                Pr(c7, y), Ie("invalid", c7);
                break;
              case "select":
                c7._wrapperState = { wasMultiple: !!y.multiple }, Ie("invalid", c7);
                break;
              case "textarea":
                od(c7, y), Ie("invalid", c7);
            }
            ps(i, y), h = null;
            for (var S in y) if (y.hasOwnProperty(S)) {
              var T = y[S];
              S === "children" ? typeof T == "string" ? c7.textContent !== T && (y.suppressHydrationWarning !== true && ai(c7.textContent, T, e), h = ["children", T]) : typeof T == "number" && c7.textContent !== "" + T && (y.suppressHydrationWarning !== true && ai(c7.textContent, T, e), h = ["children", "" + T]) : l.hasOwnProperty(S) && T != null && S === "onScroll" && Ie("scroll", c7);
            }
            switch (i) {
              case "input":
                Ae(c7), rd(c7, y, true);
                break;
              case "textarea":
                Ae(c7), id(c7);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof y.onClick == "function" && (c7.onclick = ii);
            }
            c7 = h, n.updateQueue = c7, c7 !== null && (n.flags |= 4);
          } else {
            S = h.nodeType === 9 ? h : h.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = ld(i)), e === "http://www.w3.org/1999/xhtml" ? i === "script" ? (e = S.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof c7.is == "string" ? e = S.createElement(i, { is: c7.is }) : (e = S.createElement(i), i === "select" && (S = e, c7.multiple ? S.multiple = true : c7.size && (S.size = c7.size))) : e = S.createElementNS(e, i), e[nn] = n, e[Wo] = c7, wh(e, n, false, false), n.stateNode = e;
            e: {
              switch (S = hs(i, c7), i) {
                case "dialog":
                  Ie("cancel", e), Ie("close", e), h = c7;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Ie("load", e), h = c7;
                  break;
                case "video":
                case "audio":
                  for (h = 0; h < Bo.length; h++) Ie(Bo[h], e);
                  h = c7;
                  break;
                case "source":
                  Ie("error", e), h = c7;
                  break;
                case "img":
                case "image":
                case "link":
                  Ie("error", e), Ie("load", e), h = c7;
                  break;
                case "details":
                  Ie("toggle", e), h = c7;
                  break;
                case "input":
                  Pr(e, c7), h = jt(e, c7), Ie("invalid", e);
                  break;
                case "option":
                  h = c7;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!c7.multiple }, h = X2({}, c7, { value: void 0 }), Ie("invalid", e);
                  break;
                case "textarea":
                  od(e, c7), h = fs(e, c7), Ie("invalid", e);
                  break;
                default:
                  h = c7;
              }
              ps(i, h), T = h;
              for (y in T) if (T.hasOwnProperty(y)) {
                var _ = T[y];
                y === "style" ? ud(e, _) : y === "dangerouslySetInnerHTML" ? (_ = _ ? _.__html : void 0, _ != null && sd(e, _)) : y === "children" ? typeof _ == "string" ? (i !== "textarea" || _ !== "") && ko(e, _) : typeof _ == "number" && ko(e, "" + _) : y !== "suppressContentEditableWarning" && y !== "suppressHydrationWarning" && y !== "autoFocus" && (l.hasOwnProperty(y) ? _ != null && y === "onScroll" && Ie("scroll", e) : _ != null && M(e, y, _, S));
              }
              switch (i) {
                case "input":
                  Ae(e), rd(e, c7, false);
                  break;
                case "textarea":
                  Ae(e), id(e);
                  break;
                case "option":
                  c7.value != null && e.setAttribute("value", "" + ue(c7.value));
                  break;
                case "select":
                  e.multiple = !!c7.multiple, y = c7.value, y != null ? Tr(e, !!c7.multiple, y, false) : c7.defaultValue != null && Tr(e, !!c7.multiple, c7.defaultValue, true);
                  break;
                default:
                  typeof h.onClick == "function" && (e.onclick = ii);
              }
              switch (i) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  c7 = !!c7.autoFocus;
                  break e;
                case "img":
                  c7 = true;
                  break e;
                default:
                  c7 = false;
              }
            }
            c7 && (n.flags |= 4);
          }
          n.ref !== null && (n.flags |= 512, n.flags |= 2097152);
        }
        return lt(n), null;
      case 6:
        if (e && n.stateNode != null) Sh(e, n, e.memoizedProps, c7);
        else {
          if (typeof c7 != "string" && n.stateNode === null) throw Error(o(166));
          if (i = sr(Xo.current), sr(rn.current), pi(n)) {
            if (c7 = n.stateNode, i = n.memoizedProps, c7[nn] = n, (y = c7.nodeValue !== i) && (e = Ct, e !== null)) switch (e.tag) {
              case 3:
                ai(c7.nodeValue, i, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== true && ai(c7.nodeValue, i, (e.mode & 1) !== 0);
            }
            y && (n.flags |= 4);
          } else c7 = (i.nodeType === 9 ? i : i.ownerDocument).createTextNode(c7), c7[nn] = n, n.stateNode = c7;
        }
        return lt(n), null;
      case 13:
        if (De(ze), c7 = n.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (Le && kt !== null && (n.mode & 1) !== 0 && (n.flags & 128) === 0) Ep(), Vr(), n.flags |= 98560, y = false;
          else if (y = pi(n), c7 !== null && c7.dehydrated !== null) {
            if (e === null) {
              if (!y) throw Error(o(318));
              if (y = n.memoizedState, y = y !== null ? y.dehydrated : null, !y) throw Error(o(317));
              y[nn] = n;
            } else Vr(), (n.flags & 128) === 0 && (n.memoizedState = null), n.flags |= 4;
            lt(n), y = false;
          } else zt !== null && (Uc(zt), zt = null), y = true;
          if (!y) return n.flags & 65536 ? n : null;
        }
        return (n.flags & 128) !== 0 ? (n.lanes = i, n) : (c7 = c7 !== null, c7 !== (e !== null && e.memoizedState !== null) && c7 && (n.child.flags |= 8192, (n.mode & 1) !== 0 && (e === null || (ze.current & 1) !== 0 ? Ke === 0 && (Ke = 3) : Kc())), n.updateQueue !== null && (n.flags |= 4), lt(n), null);
      case 4:
        return Kr(), Nc(e, n), e === null && Vo(n.stateNode.containerInfo), lt(n), null;
      case 10:
        return lc(n.type._context), lt(n), null;
      case 17:
        return pt(n.type) && si(), lt(n), null;
      case 19:
        if (De(ze), y = n.memoizedState, y === null) return lt(n), null;
        if (c7 = (n.flags & 128) !== 0, S = y.rendering, S === null) if (c7) ta(y, false);
        else {
          if (Ke !== 0 || e !== null && (e.flags & 128) !== 0) for (e = n.child; e !== null; ) {
            if (S = wi(e), S !== null) {
              for (n.flags |= 128, ta(y, false), c7 = S.updateQueue, c7 !== null && (n.updateQueue = c7, n.flags |= 4), n.subtreeFlags = 0, c7 = i, i = n.child; i !== null; ) y = i, e = c7, y.flags &= 14680066, S = y.alternate, S === null ? (y.childLanes = 0, y.lanes = e, y.child = null, y.subtreeFlags = 0, y.memoizedProps = null, y.memoizedState = null, y.updateQueue = null, y.dependencies = null, y.stateNode = null) : (y.childLanes = S.childLanes, y.lanes = S.lanes, y.child = S.child, y.subtreeFlags = 0, y.deletions = null, y.memoizedProps = S.memoizedProps, y.memoizedState = S.memoizedState, y.updateQueue = S.updateQueue, y.type = S.type, e = S.dependencies, y.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), i = i.sibling;
              return Ne(ze, ze.current & 1 | 2), n.child;
            }
            e = e.sibling;
          }
          y.tail !== null && Ve() > Qr && (n.flags |= 128, c7 = true, ta(y, false), n.lanes = 4194304);
        }
        else {
          if (!c7) if (e = wi(S), e !== null) {
            if (n.flags |= 128, c7 = true, i = e.updateQueue, i !== null && (n.updateQueue = i, n.flags |= 4), ta(y, true), y.tail === null && y.tailMode === "hidden" && !S.alternate && !Le) return lt(n), null;
          } else 2 * Ve() - y.renderingStartTime > Qr && i !== 1073741824 && (n.flags |= 128, c7 = true, ta(y, false), n.lanes = 4194304);
          y.isBackwards ? (S.sibling = n.child, n.child = S) : (i = y.last, i !== null ? i.sibling = S : n.child = S, y.last = S);
        }
        return y.tail !== null ? (n = y.tail, y.rendering = n, y.tail = n.sibling, y.renderingStartTime = Ve(), n.sibling = null, i = ze.current, Ne(ze, c7 ? i & 1 | 2 : i & 1), n) : (lt(n), null);
      case 22:
      case 23:
        return qc(), c7 = n.memoizedState !== null, e !== null && e.memoizedState !== null !== c7 && (n.flags |= 8192), c7 && (n.mode & 1) !== 0 ? (Et & 1073741824) !== 0 && (lt(n), n.subtreeFlags & 6 && (n.flags |= 8192)) : lt(n), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(o(156, n.tag));
  }
  function Ow(e, n) {
    switch (tc(n), n.tag) {
      case 1:
        return pt(n.type) && si(), e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 3:
        return Kr(), De(dt), De(at2), hc(), e = n.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (n.flags = e & -65537 | 128, n) : null;
      case 5:
        return dc(n), null;
      case 13:
        if (De(ze), e = n.memoizedState, e !== null && e.dehydrated !== null) {
          if (n.alternate === null) throw Error(o(340));
          Vr();
        }
        return e = n.flags, e & 65536 ? (n.flags = e & -65537 | 128, n) : null;
      case 19:
        return De(ze), null;
      case 4:
        return Kr(), null;
      case 10:
        return lc(n.type._context), null;
      case 22:
      case 23:
        return qc(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Ti = false, st = false, Nw = typeof WeakSet == "function" ? WeakSet : Set, ne = null;
  function Yr(e, n) {
    var i = e.ref;
    if (i !== null) if (typeof i == "function") try {
      i(null);
    } catch (c7) {
      Be(e, n, c7);
    }
    else i.current = null;
  }
  function Ic(e, n, i) {
    try {
      i();
    } catch (c7) {
      Be(e, n, c7);
    }
  }
  var Ch = false;
  function Iw(e, n) {
    if (qs = Ga, e = ep(), Fs(e)) {
      if ("selectionStart" in e) var i = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        i = (i = e.ownerDocument) && i.defaultView || window;
        var c7 = i.getSelection && i.getSelection();
        if (c7 && c7.rangeCount !== 0) {
          i = c7.anchorNode;
          var h = c7.anchorOffset, y = c7.focusNode;
          c7 = c7.focusOffset;
          try {
            i.nodeType, y.nodeType;
          } catch {
            i = null;
            break e;
          }
          var S = 0, T = -1, _ = -1, F = 0, W = 0, q = e, U = null;
          t: for (; ; ) {
            for (var te; q !== i || h !== 0 && q.nodeType !== 3 || (T = S + h), q !== y || c7 !== 0 && q.nodeType !== 3 || (_ = S + c7), q.nodeType === 3 && (S += q.nodeValue.length), (te = q.firstChild) !== null; ) U = q, q = te;
            for (; ; ) {
              if (q === e) break t;
              if (U === i && ++F === h && (T = S), U === y && ++W === c7 && (_ = S), (te = q.nextSibling) !== null) break;
              q = U, U = q.parentNode;
            }
            q = te;
          }
          i = T === -1 || _ === -1 ? null : { start: T, end: _ };
        } else i = null;
      }
      i = i || { start: 0, end: 0 };
    } else i = null;
    for (Ks = { focusedElem: e, selectionRange: i }, Ga = false, ne = n; ne !== null; ) if (n = ne, e = n.child, (n.subtreeFlags & 1028) !== 0 && e !== null) e.return = n, ne = e;
    else for (; ne !== null; ) {
      n = ne;
      try {
        var oe = n.alternate;
        if ((n.flags & 1024) !== 0) switch (n.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (oe !== null) {
              var ie = oe.memoizedProps, Ue = oe.memoizedState, D = n.stateNode, O = D.getSnapshotBeforeUpdate(n.elementType === n.type ? ie : Ht(n.type, ie), Ue);
              D.__reactInternalSnapshotBeforeUpdate = O;
            }
            break;
          case 3:
            var L = n.stateNode.containerInfo;
            L.nodeType === 1 ? L.textContent = "" : L.nodeType === 9 && L.documentElement && L.removeChild(L.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(o(163));
        }
      } catch (K) {
        Be(n, n.return, K);
      }
      if (e = n.sibling, e !== null) {
        e.return = n.return, ne = e;
        break;
      }
      ne = n.return;
    }
    return oe = Ch, Ch = false, oe;
  }
  function na(e, n, i) {
    var c7 = n.updateQueue;
    if (c7 = c7 !== null ? c7.lastEffect : null, c7 !== null) {
      var h = c7 = c7.next;
      do {
        if ((h.tag & e) === e) {
          var y = h.destroy;
          h.destroy = void 0, y !== void 0 && Ic(n, i, y);
        }
        h = h.next;
      } while (h !== c7);
    }
  }
  function Mi(e, n) {
    if (n = n.updateQueue, n = n !== null ? n.lastEffect : null, n !== null) {
      var i = n = n.next;
      do {
        if ((i.tag & e) === e) {
          var c7 = i.create;
          i.destroy = c7();
        }
        i = i.next;
      } while (i !== n);
    }
  }
  function Dc(e) {
    var n = e.ref;
    if (n !== null) {
      var i = e.stateNode;
      e.tag, e = i, typeof n == "function" ? n(e) : n.current = e;
    }
  }
  function kh(e) {
    var n = e.alternate;
    n !== null && (e.alternate = null, kh(n)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (n = e.stateNode, n !== null && (delete n[nn], delete n[Wo], delete n[Qs], delete n[yw], delete n[vw])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Eh(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Rh(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Eh(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function Lc(e, n, i) {
    var c7 = e.tag;
    if (c7 === 5 || c7 === 6) e = e.stateNode, n ? i.nodeType === 8 ? i.parentNode.insertBefore(e, n) : i.insertBefore(e, n) : (i.nodeType === 8 ? (n = i.parentNode, n.insertBefore(e, i)) : (n = i, n.appendChild(e)), i = i._reactRootContainer, i != null || n.onclick !== null || (n.onclick = ii));
    else if (c7 !== 4 && (e = e.child, e !== null)) for (Lc(e, n, i), e = e.sibling; e !== null; ) Lc(e, n, i), e = e.sibling;
  }
  function jc(e, n, i) {
    var c7 = e.tag;
    if (c7 === 5 || c7 === 6) e = e.stateNode, n ? i.insertBefore(e, n) : i.appendChild(e);
    else if (c7 !== 4 && (e = e.child, e !== null)) for (jc(e, n, i), e = e.sibling; e !== null; ) jc(e, n, i), e = e.sibling;
  }
  var et = null, Bt = false;
  function $n(e, n, i) {
    for (i = i.child; i !== null; ) Ph(e, n, i), i = i.sibling;
  }
  function Ph(e, n, i) {
    if (tn && typeof tn.onCommitFiberUnmount == "function") try {
      tn.onCommitFiberUnmount(Ba, i);
    } catch {
    }
    switch (i.tag) {
      case 5:
        st || Yr(i, n);
      case 6:
        var c7 = et, h = Bt;
        et = null, $n(e, n, i), et = c7, Bt = h, et !== null && (Bt ? (e = et, i = i.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(i) : e.removeChild(i)) : et.removeChild(i.stateNode));
        break;
      case 18:
        et !== null && (Bt ? (e = et, i = i.stateNode, e.nodeType === 8 ? Xs(e.parentNode, i) : e.nodeType === 1 && Xs(e, i), Io(e)) : Xs(et, i.stateNode));
        break;
      case 4:
        c7 = et, h = Bt, et = i.stateNode.containerInfo, Bt = true, $n(e, n, i), et = c7, Bt = h;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!st && (c7 = i.updateQueue, c7 !== null && (c7 = c7.lastEffect, c7 !== null))) {
          h = c7 = c7.next;
          do {
            var y = h, S = y.destroy;
            y = y.tag, S !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && Ic(i, n, S), h = h.next;
          } while (h !== c7);
        }
        $n(e, n, i);
        break;
      case 1:
        if (!st && (Yr(i, n), c7 = i.stateNode, typeof c7.componentWillUnmount == "function")) try {
          c7.props = i.memoizedProps, c7.state = i.memoizedState, c7.componentWillUnmount();
        } catch (T) {
          Be(i, n, T);
        }
        $n(e, n, i);
        break;
      case 21:
        $n(e, n, i);
        break;
      case 22:
        i.mode & 1 ? (st = (c7 = st) || i.memoizedState !== null, $n(e, n, i), st = c7) : $n(e, n, i);
        break;
      default:
        $n(e, n, i);
    }
  }
  function bh(e) {
    var n = e.updateQueue;
    if (n !== null) {
      e.updateQueue = null;
      var i = e.stateNode;
      i === null && (i = e.stateNode = new Nw()), n.forEach(function(c7) {
        var h = Vw.bind(null, e, c7);
        i.has(c7) || (i.add(c7), c7.then(h, h));
      });
    }
  }
  function Vt(e, n) {
    var i = n.deletions;
    if (i !== null) for (var c7 = 0; c7 < i.length; c7++) {
      var h = i[c7];
      try {
        var y = e, S = n, T = S;
        e: for (; T !== null; ) {
          switch (T.tag) {
            case 5:
              et = T.stateNode, Bt = false;
              break e;
            case 3:
              et = T.stateNode.containerInfo, Bt = true;
              break e;
            case 4:
              et = T.stateNode.containerInfo, Bt = true;
              break e;
          }
          T = T.return;
        }
        if (et === null) throw Error(o(160));
        Ph(y, S, h), et = null, Bt = false;
        var _ = h.alternate;
        _ !== null && (_.return = null), h.return = null;
      } catch (F) {
        Be(h, n, F);
      }
    }
    if (n.subtreeFlags & 12854) for (n = n.child; n !== null; ) Th(n, e), n = n.sibling;
  }
  function Th(e, n) {
    var i = e.alternate, c7 = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Vt(n, e), an(e), c7 & 4) {
          try {
            na(3, e, e.return), Mi(3, e);
          } catch (ie) {
            Be(e, e.return, ie);
          }
          try {
            na(5, e, e.return);
          } catch (ie) {
            Be(e, e.return, ie);
          }
        }
        break;
      case 1:
        Vt(n, e), an(e), c7 & 512 && i !== null && Yr(i, i.return);
        break;
      case 5:
        if (Vt(n, e), an(e), c7 & 512 && i !== null && Yr(i, i.return), e.flags & 32) {
          var h = e.stateNode;
          try {
            ko(h, "");
          } catch (ie) {
            Be(e, e.return, ie);
          }
        }
        if (c7 & 4 && (h = e.stateNode, h != null)) {
          var y = e.memoizedProps, S = i !== null ? i.memoizedProps : y, T = e.type, _ = e.updateQueue;
          if (e.updateQueue = null, _ !== null) try {
            T === "input" && y.type === "radio" && y.name != null && br(h, y), hs(T, S);
            var F = hs(T, y);
            for (S = 0; S < _.length; S += 2) {
              var W = _[S], q = _[S + 1];
              W === "style" ? ud(h, q) : W === "dangerouslySetInnerHTML" ? sd(h, q) : W === "children" ? ko(h, q) : M(h, W, q, F);
            }
            switch (T) {
              case "input":
                tr(h, y);
                break;
              case "textarea":
                ad(h, y);
                break;
              case "select":
                var U = h._wrapperState.wasMultiple;
                h._wrapperState.wasMultiple = !!y.multiple;
                var te = y.value;
                te != null ? Tr(h, !!y.multiple, te, false) : U !== !!y.multiple && (y.defaultValue != null ? Tr(h, !!y.multiple, y.defaultValue, true) : Tr(h, !!y.multiple, y.multiple ? [] : "", false));
            }
            h[Wo] = y;
          } catch (ie) {
            Be(e, e.return, ie);
          }
        }
        break;
      case 6:
        if (Vt(n, e), an(e), c7 & 4) {
          if (e.stateNode === null) throw Error(o(162));
          h = e.stateNode, y = e.memoizedProps;
          try {
            h.nodeValue = y;
          } catch (ie) {
            Be(e, e.return, ie);
          }
        }
        break;
      case 3:
        if (Vt(n, e), an(e), c7 & 4 && i !== null && i.memoizedState.isDehydrated) try {
          Io(n.containerInfo);
        } catch (ie) {
          Be(e, e.return, ie);
        }
        break;
      case 4:
        Vt(n, e), an(e);
        break;
      case 13:
        Vt(n, e), an(e), h = e.child, h.flags & 8192 && (y = h.memoizedState !== null, h.stateNode.isHidden = y, !y || h.alternate !== null && h.alternate.memoizedState !== null || (zc = Ve())), c7 & 4 && bh(e);
        break;
      case 22:
        if (W = i !== null && i.memoizedState !== null, e.mode & 1 ? (st = (F = st) || W, Vt(n, e), st = F) : Vt(n, e), an(e), c7 & 8192) {
          if (F = e.memoizedState !== null, (e.stateNode.isHidden = F) && !W && (e.mode & 1) !== 0) for (ne = e, W = e.child; W !== null; ) {
            for (q = ne = W; ne !== null; ) {
              switch (U = ne, te = U.child, U.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  na(4, U, U.return);
                  break;
                case 1:
                  Yr(U, U.return);
                  var oe = U.stateNode;
                  if (typeof oe.componentWillUnmount == "function") {
                    c7 = U, i = U.return;
                    try {
                      n = c7, oe.props = n.memoizedProps, oe.state = n.memoizedState, oe.componentWillUnmount();
                    } catch (ie) {
                      Be(c7, i, ie);
                    }
                  }
                  break;
                case 5:
                  Yr(U, U.return);
                  break;
                case 22:
                  if (U.memoizedState !== null) {
                    _h(q);
                    continue;
                  }
              }
              te !== null ? (te.return = U, ne = te) : _h(q);
            }
            W = W.sibling;
          }
          e: for (W = null, q = e; ; ) {
            if (q.tag === 5) {
              if (W === null) {
                W = q;
                try {
                  h = q.stateNode, F ? (y = h.style, typeof y.setProperty == "function" ? y.setProperty("display", "none", "important") : y.display = "none") : (T = q.stateNode, _ = q.memoizedProps.style, S = _ != null && _.hasOwnProperty("display") ? _.display : null, T.style.display = cd("display", S));
                } catch (ie) {
                  Be(e, e.return, ie);
                }
              }
            } else if (q.tag === 6) {
              if (W === null) try {
                q.stateNode.nodeValue = F ? "" : q.memoizedProps;
              } catch (ie) {
                Be(e, e.return, ie);
              }
            } else if ((q.tag !== 22 && q.tag !== 23 || q.memoizedState === null || q === e) && q.child !== null) {
              q.child.return = q, q = q.child;
              continue;
            }
            if (q === e) break e;
            for (; q.sibling === null; ) {
              if (q.return === null || q.return === e) break e;
              W === q && (W = null), q = q.return;
            }
            W === q && (W = null), q.sibling.return = q.return, q = q.sibling;
          }
        }
        break;
      case 19:
        Vt(n, e), an(e), c7 & 4 && bh(e);
        break;
      case 21:
        break;
      default:
        Vt(n, e), an(e);
    }
  }
  function an(e) {
    var n = e.flags;
    if (n & 2) {
      try {
        e: {
          for (var i = e.return; i !== null; ) {
            if (Eh(i)) {
              var c7 = i;
              break e;
            }
            i = i.return;
          }
          throw Error(o(160));
        }
        switch (c7.tag) {
          case 5:
            var h = c7.stateNode;
            c7.flags & 32 && (ko(h, ""), c7.flags &= -33);
            var y = Rh(e);
            jc(e, y, h);
            break;
          case 3:
          case 4:
            var S = c7.stateNode.containerInfo, T = Rh(e);
            Lc(e, T, S);
            break;
          default:
            throw Error(o(161));
        }
      } catch (_) {
        Be(e, e.return, _);
      }
      e.flags &= -3;
    }
    n & 4096 && (e.flags &= -4097);
  }
  function Dw(e, n, i) {
    ne = e, Mh(e);
  }
  function Mh(e, n, i) {
    for (var c7 = (e.mode & 1) !== 0; ne !== null; ) {
      var h = ne, y = h.child;
      if (h.tag === 22 && c7) {
        var S = h.memoizedState !== null || Ti;
        if (!S) {
          var T = h.alternate, _ = T !== null && T.memoizedState !== null || st;
          T = Ti;
          var F = st;
          if (Ti = S, (st = _) && !F) for (ne = h; ne !== null; ) S = ne, _ = S.child, S.tag === 22 && S.memoizedState !== null ? Oh(h) : _ !== null ? (_.return = S, ne = _) : Oh(h);
          for (; y !== null; ) ne = y, Mh(y), y = y.sibling;
          ne = h, Ti = T, st = F;
        }
        Ah(e);
      } else (h.subtreeFlags & 8772) !== 0 && y !== null ? (y.return = h, ne = y) : Ah(e);
    }
  }
  function Ah(e) {
    for (; ne !== null; ) {
      var n = ne;
      if ((n.flags & 8772) !== 0) {
        var i = n.alternate;
        try {
          if ((n.flags & 8772) !== 0) switch (n.tag) {
            case 0:
            case 11:
            case 15:
              st || Mi(5, n);
              break;
            case 1:
              var c7 = n.stateNode;
              if (n.flags & 4 && !st) if (i === null) c7.componentDidMount();
              else {
                var h = n.elementType === n.type ? i.memoizedProps : Ht(n.type, i.memoizedProps);
                c7.componentDidUpdate(h, i.memoizedState, c7.__reactInternalSnapshotBeforeUpdate);
              }
              var y = n.updateQueue;
              y !== null && _p(n, y, c7);
              break;
            case 3:
              var S = n.updateQueue;
              if (S !== null) {
                if (i = null, n.child !== null) switch (n.child.tag) {
                  case 5:
                    i = n.child.stateNode;
                    break;
                  case 1:
                    i = n.child.stateNode;
                }
                _p(n, S, i);
              }
              break;
            case 5:
              var T = n.stateNode;
              if (i === null && n.flags & 4) {
                i = T;
                var _ = n.memoizedProps;
                switch (n.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    _.autoFocus && i.focus();
                    break;
                  case "img":
                    _.src && (i.src = _.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (n.memoizedState === null) {
                var F = n.alternate;
                if (F !== null) {
                  var W = F.memoizedState;
                  if (W !== null) {
                    var q = W.dehydrated;
                    q !== null && Io(q);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(o(163));
          }
          st || n.flags & 512 && Dc(n);
        } catch (U) {
          Be(n, n.return, U);
        }
      }
      if (n === e) {
        ne = null;
        break;
      }
      if (i = n.sibling, i !== null) {
        i.return = n.return, ne = i;
        break;
      }
      ne = n.return;
    }
  }
  function _h(e) {
    for (; ne !== null; ) {
      var n = ne;
      if (n === e) {
        ne = null;
        break;
      }
      var i = n.sibling;
      if (i !== null) {
        i.return = n.return, ne = i;
        break;
      }
      ne = n.return;
    }
  }
  function Oh(e) {
    for (; ne !== null; ) {
      var n = ne;
      try {
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            var i = n.return;
            try {
              Mi(4, n);
            } catch (_) {
              Be(n, i, _);
            }
            break;
          case 1:
            var c7 = n.stateNode;
            if (typeof c7.componentDidMount == "function") {
              var h = n.return;
              try {
                c7.componentDidMount();
              } catch (_) {
                Be(n, h, _);
              }
            }
            var y = n.return;
            try {
              Dc(n);
            } catch (_) {
              Be(n, y, _);
            }
            break;
          case 5:
            var S = n.return;
            try {
              Dc(n);
            } catch (_) {
              Be(n, S, _);
            }
        }
      } catch (_) {
        Be(n, n.return, _);
      }
      if (n === e) {
        ne = null;
        break;
      }
      var T = n.sibling;
      if (T !== null) {
        T.return = n.return, ne = T;
        break;
      }
      ne = n.return;
    }
  }
  var Lw = Math.ceil, Ai = N.ReactCurrentDispatcher, Fc = N.ReactCurrentOwner, Ot = N.ReactCurrentBatchConfig, be = 0, Xe = null, We = null, tt = 0, Et = 0, Xr = In(0), Ke = 0, ra = null, ur = 0, _i = 0, $c = 0, oa = null, mt = null, zc = 0, Qr = 1 / 0, xn = null, Oi = false, Hc = null, zn = null, Ni = false, Hn = null, Ii = 0, aa = 0, Bc = null, Di = -1, Li = 0;
  function ut() {
    return (be & 6) !== 0 ? Ve() : Di !== -1 ? Di : Di = Ve();
  }
  function Bn(e) {
    return (e.mode & 1) === 0 ? 1 : (be & 2) !== 0 && tt !== 0 ? tt & -tt : ww.transition !== null ? (Li === 0 && (Li = Rd()), Li) : (e = _e, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Id(e.type)), e);
  }
  function Ut(e, n, i, c7) {
    if (50 < aa) throw aa = 0, Bc = null, Error(o(185));
    Mo(e, i, c7), ((be & 2) === 0 || e !== Xe) && (e === Xe && ((be & 2) === 0 && (_i |= i), Ke === 4 && Vn(e, tt)), yt(e, c7), i === 1 && be === 0 && (n.mode & 1) === 0 && (Qr = Ve() + 500, ui && Ln()));
  }
  function yt(e, n) {
    var i = e.callbackNode;
    w2(e, n);
    var c7 = Wa(e, e === Xe ? tt : 0);
    if (c7 === 0) i !== null && Cd(i), e.callbackNode = null, e.callbackPriority = 0;
    else if (n = c7 & -c7, e.callbackPriority !== n) {
      if (i != null && Cd(i), n === 1) e.tag === 0 ? gw(Ih.bind(null, e)) : wp(Ih.bind(null, e)), hw(function() {
        (be & 6) === 0 && Ln();
      }), i = null;
      else {
        switch (Pd(c7)) {
          case 1:
            i = Ss;
            break;
          case 4:
            i = kd;
            break;
          case 16:
            i = Ha;
            break;
          case 536870912:
            i = Ed;
            break;
          default:
            i = Ha;
        }
        i = Bh(i, Nh.bind(null, e));
      }
      e.callbackPriority = n, e.callbackNode = i;
    }
  }
  function Nh(e, n) {
    if (Di = -1, Li = 0, (be & 6) !== 0) throw Error(o(327));
    var i = e.callbackNode;
    if (Zr() && e.callbackNode !== i) return null;
    var c7 = Wa(e, e === Xe ? tt : 0);
    if (c7 === 0) return null;
    if ((c7 & 30) !== 0 || (c7 & e.expiredLanes) !== 0 || n) n = ji(e, c7);
    else {
      n = c7;
      var h = be;
      be |= 2;
      var y = Lh();
      (Xe !== e || tt !== n) && (xn = null, Qr = Ve() + 500, dr(e, n));
      do
        try {
          $w();
          break;
        } catch (T) {
          Dh(e, T);
        }
      while (true);
      ic(), Ai.current = y, be = h, We !== null ? n = 0 : (Xe = null, tt = 0, n = Ke);
    }
    if (n !== 0) {
      if (n === 2 && (h = Cs(e), h !== 0 && (c7 = h, n = Vc(e, h))), n === 1) throw i = ra, dr(e, 0), Vn(e, c7), yt(e, Ve()), i;
      if (n === 6) Vn(e, c7);
      else {
        if (h = e.current.alternate, (c7 & 30) === 0 && !jw(h) && (n = ji(e, c7), n === 2 && (y = Cs(e), y !== 0 && (c7 = y, n = Vc(e, y))), n === 1)) throw i = ra, dr(e, 0), Vn(e, c7), yt(e, Ve()), i;
        switch (e.finishedWork = h, e.finishedLanes = c7, n) {
          case 0:
          case 1:
            throw Error(o(345));
          case 2:
            pr(e, mt, xn);
            break;
          case 3:
            if (Vn(e, c7), (c7 & 130023424) === c7 && (n = zc + 500 - Ve(), 10 < n)) {
              if (Wa(e, 0) !== 0) break;
              if (h = e.suspendedLanes, (h & c7) !== c7) {
                ut(), e.pingedLanes |= e.suspendedLanes & h;
                break;
              }
              e.timeoutHandle = Ys(pr.bind(null, e, mt, xn), n);
              break;
            }
            pr(e, mt, xn);
            break;
          case 4:
            if (Vn(e, c7), (c7 & 4194240) === c7) break;
            for (n = e.eventTimes, h = -1; 0 < c7; ) {
              var S = 31 - Ft(c7);
              y = 1 << S, S = n[S], S > h && (h = S), c7 &= ~y;
            }
            if (c7 = h, c7 = Ve() - c7, c7 = (120 > c7 ? 120 : 480 > c7 ? 480 : 1080 > c7 ? 1080 : 1920 > c7 ? 1920 : 3e3 > c7 ? 3e3 : 4320 > c7 ? 4320 : 1960 * Lw(c7 / 1960)) - c7, 10 < c7) {
              e.timeoutHandle = Ys(pr.bind(null, e, mt, xn), c7);
              break;
            }
            pr(e, mt, xn);
            break;
          case 5:
            pr(e, mt, xn);
            break;
          default:
            throw Error(o(329));
        }
      }
    }
    return yt(e, Ve()), e.callbackNode === i ? Nh.bind(null, e) : null;
  }
  function Vc(e, n) {
    var i = oa;
    return e.current.memoizedState.isDehydrated && (dr(e, n).flags |= 256), e = ji(e, n), e !== 2 && (n = mt, mt = i, n !== null && Uc(n)), e;
  }
  function Uc(e) {
    mt === null ? mt = e : mt.push.apply(mt, e);
  }
  function jw(e) {
    for (var n = e; ; ) {
      if (n.flags & 16384) {
        var i = n.updateQueue;
        if (i !== null && (i = i.stores, i !== null)) for (var c7 = 0; c7 < i.length; c7++) {
          var h = i[c7], y = h.getSnapshot;
          h = h.value;
          try {
            if (!$t(y(), h)) return false;
          } catch {
            return false;
          }
        }
      }
      if (i = n.child, n.subtreeFlags & 16384 && i !== null) i.return = n, n = i;
      else {
        if (n === e) break;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === e) return true;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
    }
    return true;
  }
  function Vn(e, n) {
    for (n &= ~$c, n &= ~_i, e.suspendedLanes |= n, e.pingedLanes &= ~n, e = e.expirationTimes; 0 < n; ) {
      var i = 31 - Ft(n), c7 = 1 << i;
      e[i] = -1, n &= ~c7;
    }
  }
  function Ih(e) {
    if ((be & 6) !== 0) throw Error(o(327));
    Zr();
    var n = Wa(e, 0);
    if ((n & 1) === 0) return yt(e, Ve()), null;
    var i = ji(e, n);
    if (e.tag !== 0 && i === 2) {
      var c7 = Cs(e);
      c7 !== 0 && (n = c7, i = Vc(e, c7));
    }
    if (i === 1) throw i = ra, dr(e, 0), Vn(e, n), yt(e, Ve()), i;
    if (i === 6) throw Error(o(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = n, pr(e, mt, xn), yt(e, Ve()), null;
  }
  function Wc(e, n) {
    var i = be;
    be |= 1;
    try {
      return e(n);
    } finally {
      be = i, be === 0 && (Qr = Ve() + 500, ui && Ln());
    }
  }
  function fr(e) {
    Hn !== null && Hn.tag === 0 && (be & 6) === 0 && Zr();
    var n = be;
    be |= 1;
    var i = Ot.transition, c7 = _e;
    try {
      if (Ot.transition = null, _e = 1, e) return e();
    } finally {
      _e = c7, Ot.transition = i, be = n, (be & 6) === 0 && Ln();
    }
  }
  function qc() {
    Et = Xr.current, De(Xr);
  }
  function dr(e, n) {
    e.finishedWork = null, e.finishedLanes = 0;
    var i = e.timeoutHandle;
    if (i !== -1 && (e.timeoutHandle = -1, pw(i)), We !== null) for (i = We.return; i !== null; ) {
      var c7 = i;
      switch (tc(c7), c7.tag) {
        case 1:
          c7 = c7.type.childContextTypes, c7 != null && si();
          break;
        case 3:
          Kr(), De(dt), De(at2), hc();
          break;
        case 5:
          dc(c7);
          break;
        case 4:
          Kr();
          break;
        case 13:
          De(ze);
          break;
        case 19:
          De(ze);
          break;
        case 10:
          lc(c7.type._context);
          break;
        case 22:
        case 23:
          qc();
      }
      i = i.return;
    }
    if (Xe = e, We = e = Un(e.current, null), tt = Et = n, Ke = 0, ra = null, $c = _i = ur = 0, mt = oa = null, lr !== null) {
      for (n = 0; n < lr.length; n++) if (i = lr[n], c7 = i.interleaved, c7 !== null) {
        i.interleaved = null;
        var h = c7.next, y = i.pending;
        if (y !== null) {
          var S = y.next;
          y.next = h, c7.next = S;
        }
        i.pending = c7;
      }
      lr = null;
    }
    return e;
  }
  function Dh(e, n) {
    do {
      var i = We;
      try {
        if (ic(), xi.current = Ei, Si) {
          for (var c7 = He.memoizedState; c7 !== null; ) {
            var h = c7.queue;
            h !== null && (h.pending = null), c7 = c7.next;
          }
          Si = false;
        }
        if (cr = 0, Ye = qe = He = null, Qo = false, Zo = 0, Fc.current = null, i === null || i.return === null) {
          Ke = 1, ra = n, We = null;
          break;
        }
        e: {
          var y = e, S = i.return, T = i, _ = n;
          if (n = tt, T.flags |= 32768, _ !== null && typeof _ == "object" && typeof _.then == "function") {
            var F = _, W = T, q = W.tag;
            if ((W.mode & 1) === 0 && (q === 0 || q === 11 || q === 15)) {
              var U = W.alternate;
              U ? (W.updateQueue = U.updateQueue, W.memoizedState = U.memoizedState, W.lanes = U.lanes) : (W.updateQueue = null, W.memoizedState = null);
            }
            var te = ih(S);
            if (te !== null) {
              te.flags &= -257, lh(te, S, T, y, n), te.mode & 1 && ah(y, F, n), n = te, _ = F;
              var oe = n.updateQueue;
              if (oe === null) {
                var ie = /* @__PURE__ */ new Set();
                ie.add(_), n.updateQueue = ie;
              } else oe.add(_);
              break e;
            } else {
              if ((n & 1) === 0) {
                ah(y, F, n), Kc();
                break e;
              }
              _ = Error(o(426));
            }
          } else if (Le && T.mode & 1) {
            var Ue = ih(S);
            if (Ue !== null) {
              (Ue.flags & 65536) === 0 && (Ue.flags |= 256), lh(Ue, S, T, y, n), oc(Gr(_, T));
              break e;
            }
          }
          y = _ = Gr(_, T), Ke !== 4 && (Ke = 2), oa === null ? oa = [y] : oa.push(y), y = S;
          do {
            switch (y.tag) {
              case 3:
                y.flags |= 65536, n &= -n, y.lanes |= n;
                var D = rh(y, _, n);
                Ap(y, D);
                break e;
              case 1:
                T = _;
                var O = y.type, L = y.stateNode;
                if ((y.flags & 128) === 0 && (typeof O.getDerivedStateFromError == "function" || L !== null && typeof L.componentDidCatch == "function" && (zn === null || !zn.has(L)))) {
                  y.flags |= 65536, n &= -n, y.lanes |= n;
                  var K = oh(y, T, n);
                  Ap(y, K);
                  break e;
                }
            }
            y = y.return;
          } while (y !== null);
        }
        Fh(i);
      } catch (se) {
        n = se, We === i && i !== null && (We = i = i.return);
        continue;
      }
      break;
    } while (true);
  }
  function Lh() {
    var e = Ai.current;
    return Ai.current = Ei, e === null ? Ei : e;
  }
  function Kc() {
    (Ke === 0 || Ke === 3 || Ke === 2) && (Ke = 4), Xe === null || (ur & 268435455) === 0 && (_i & 268435455) === 0 || Vn(Xe, tt);
  }
  function ji(e, n) {
    var i = be;
    be |= 2;
    var c7 = Lh();
    (Xe !== e || tt !== n) && (xn = null, dr(e, n));
    do
      try {
        Fw();
        break;
      } catch (h) {
        Dh(e, h);
      }
    while (true);
    if (ic(), be = i, Ai.current = c7, We !== null) throw Error(o(261));
    return Xe = null, tt = 0, Ke;
  }
  function Fw() {
    for (; We !== null; ) jh(We);
  }
  function $w() {
    for (; We !== null && !u22(); ) jh(We);
  }
  function jh(e) {
    var n = Hh(e.alternate, e, Et);
    e.memoizedProps = e.pendingProps, n === null ? Fh(e) : We = n, Fc.current = null;
  }
  function Fh(e) {
    var n = e;
    do {
      var i = n.alternate;
      if (e = n.return, (n.flags & 32768) === 0) {
        if (i = _w(i, n, Et), i !== null) {
          We = i;
          return;
        }
      } else {
        if (i = Ow(i, n), i !== null) {
          i.flags &= 32767, We = i;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
        else {
          Ke = 6, We = null;
          return;
        }
      }
      if (n = n.sibling, n !== null) {
        We = n;
        return;
      }
      We = n = e;
    } while (n !== null);
    Ke === 0 && (Ke = 5);
  }
  function pr(e, n, i) {
    var c7 = _e, h = Ot.transition;
    try {
      Ot.transition = null, _e = 1, zw(e, n, i, c7);
    } finally {
      Ot.transition = h, _e = c7;
    }
    return null;
  }
  function zw(e, n, i, c7) {
    do
      Zr();
    while (Hn !== null);
    if ((be & 6) !== 0) throw Error(o(327));
    i = e.finishedWork;
    var h = e.finishedLanes;
    if (i === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, i === e.current) throw Error(o(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var y = i.lanes | i.childLanes;
    if (x2(e, y), e === Xe && (We = Xe = null, tt = 0), (i.subtreeFlags & 2064) === 0 && (i.flags & 2064) === 0 || Ni || (Ni = true, Bh(Ha, function() {
      return Zr(), null;
    })), y = (i.flags & 15990) !== 0, (i.subtreeFlags & 15990) !== 0 || y) {
      y = Ot.transition, Ot.transition = null;
      var S = _e;
      _e = 1;
      var T = be;
      be |= 4, Fc.current = null, Iw(e, i), Th(i, e), iw(Ks), Ga = !!qs, Ks = qs = null, e.current = i, Dw(i), f2(), be = T, _e = S, Ot.transition = y;
    } else e.current = i;
    if (Ni && (Ni = false, Hn = e, Ii = h), y = e.pendingLanes, y === 0 && (zn = null), h2(i.stateNode), yt(e, Ve()), n !== null) for (c7 = e.onRecoverableError, i = 0; i < n.length; i++) h = n[i], c7(h.value, { componentStack: h.stack, digest: h.digest });
    if (Oi) throw Oi = false, e = Hc, Hc = null, e;
    return (Ii & 1) !== 0 && e.tag !== 0 && Zr(), y = e.pendingLanes, (y & 1) !== 0 ? e === Bc ? aa++ : (aa = 0, Bc = e) : aa = 0, Ln(), null;
  }
  function Zr() {
    if (Hn !== null) {
      var e = Pd(Ii), n = Ot.transition, i = _e;
      try {
        if (Ot.transition = null, _e = 16 > e ? 16 : e, Hn === null) var c7 = false;
        else {
          if (e = Hn, Hn = null, Ii = 0, (be & 6) !== 0) throw Error(o(331));
          var h = be;
          for (be |= 4, ne = e.current; ne !== null; ) {
            var y = ne, S = y.child;
            if ((ne.flags & 16) !== 0) {
              var T = y.deletions;
              if (T !== null) {
                for (var _ = 0; _ < T.length; _++) {
                  var F = T[_];
                  for (ne = F; ne !== null; ) {
                    var W = ne;
                    switch (W.tag) {
                      case 0:
                      case 11:
                      case 15:
                        na(8, W, y);
                    }
                    var q = W.child;
                    if (q !== null) q.return = W, ne = q;
                    else for (; ne !== null; ) {
                      W = ne;
                      var U = W.sibling, te = W.return;
                      if (kh(W), W === F) {
                        ne = null;
                        break;
                      }
                      if (U !== null) {
                        U.return = te, ne = U;
                        break;
                      }
                      ne = te;
                    }
                  }
                }
                var oe = y.alternate;
                if (oe !== null) {
                  var ie = oe.child;
                  if (ie !== null) {
                    oe.child = null;
                    do {
                      var Ue = ie.sibling;
                      ie.sibling = null, ie = Ue;
                    } while (ie !== null);
                  }
                }
                ne = y;
              }
            }
            if ((y.subtreeFlags & 2064) !== 0 && S !== null) S.return = y, ne = S;
            else e: for (; ne !== null; ) {
              if (y = ne, (y.flags & 2048) !== 0) switch (y.tag) {
                case 0:
                case 11:
                case 15:
                  na(9, y, y.return);
              }
              var D = y.sibling;
              if (D !== null) {
                D.return = y.return, ne = D;
                break e;
              }
              ne = y.return;
            }
          }
          var O = e.current;
          for (ne = O; ne !== null; ) {
            S = ne;
            var L = S.child;
            if ((S.subtreeFlags & 2064) !== 0 && L !== null) L.return = S, ne = L;
            else e: for (S = O; ne !== null; ) {
              if (T = ne, (T.flags & 2048) !== 0) try {
                switch (T.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Mi(9, T);
                }
              } catch (se) {
                Be(T, T.return, se);
              }
              if (T === S) {
                ne = null;
                break e;
              }
              var K = T.sibling;
              if (K !== null) {
                K.return = T.return, ne = K;
                break e;
              }
              ne = T.return;
            }
          }
          if (be = h, Ln(), tn && typeof tn.onPostCommitFiberRoot == "function") try {
            tn.onPostCommitFiberRoot(Ba, e);
          } catch {
          }
          c7 = true;
        }
        return c7;
      } finally {
        _e = i, Ot.transition = n;
      }
    }
    return false;
  }
  function $h(e, n, i) {
    n = Gr(i, n), n = rh(e, n, 1), e = Fn(e, n, 1), n = ut(), e !== null && (Mo(e, 1, n), yt(e, n));
  }
  function Be(e, n, i) {
    if (e.tag === 3) $h(e, e, i);
    else for (; n !== null; ) {
      if (n.tag === 3) {
        $h(n, e, i);
        break;
      } else if (n.tag === 1) {
        var c7 = n.stateNode;
        if (typeof n.type.getDerivedStateFromError == "function" || typeof c7.componentDidCatch == "function" && (zn === null || !zn.has(c7))) {
          e = Gr(i, e), e = oh(n, e, 1), n = Fn(n, e, 1), e = ut(), n !== null && (Mo(n, 1, e), yt(n, e));
          break;
        }
      }
      n = n.return;
    }
  }
  function Hw(e, n, i) {
    var c7 = e.pingCache;
    c7 !== null && c7.delete(n), n = ut(), e.pingedLanes |= e.suspendedLanes & i, Xe === e && (tt & i) === i && (Ke === 4 || Ke === 3 && (tt & 130023424) === tt && 500 > Ve() - zc ? dr(e, 0) : $c |= i), yt(e, n);
  }
  function zh(e, n) {
    n === 0 && ((e.mode & 1) === 0 ? n = 1 : (n = Ua, Ua <<= 1, (Ua & 130023424) === 0 && (Ua = 4194304)));
    var i = ut();
    e = vn(e, n), e !== null && (Mo(e, n, i), yt(e, i));
  }
  function Bw(e) {
    var n = e.memoizedState, i = 0;
    n !== null && (i = n.retryLane), zh(e, i);
  }
  function Vw(e, n) {
    var i = 0;
    switch (e.tag) {
      case 13:
        var c7 = e.stateNode, h = e.memoizedState;
        h !== null && (i = h.retryLane);
        break;
      case 19:
        c7 = e.stateNode;
        break;
      default:
        throw Error(o(314));
    }
    c7 !== null && c7.delete(n), zh(e, i);
  }
  var Hh;
  Hh = function(e, n, i) {
    if (e !== null) if (e.memoizedProps !== n.pendingProps || dt.current) ht = true;
    else {
      if ((e.lanes & i) === 0 && (n.flags & 128) === 0) return ht = false, Aw(e, n, i);
      ht = (e.flags & 131072) !== 0;
    }
    else ht = false, Le && (n.flags & 1048576) !== 0 && xp(n, di, n.index);
    switch (n.lanes = 0, n.tag) {
      case 2:
        var c7 = n.type;
        bi(e, n), e = n.pendingProps;
        var h = zr(n, at2.current);
        qr(n, i), h = vc(null, n, c7, e, h, i);
        var y = gc();
        return n.flags |= 1, typeof h == "object" && h !== null && typeof h.render == "function" && h.$$typeof === void 0 ? (n.tag = 1, n.memoizedState = null, n.updateQueue = null, pt(c7) ? (y = true, ci(n)) : y = false, n.memoizedState = h.state !== null && h.state !== void 0 ? h.state : null, uc(n), h.updater = Ri, n.stateNode = h, h._reactInternals = n, Ec(n, c7, e, i), n = Tc(null, n, c7, true, y, i)) : (n.tag = 0, Le && y && ec(n), ct(null, n, h, i), n = n.child), n;
      case 16:
        c7 = n.elementType;
        e: {
          switch (bi(e, n), e = n.pendingProps, h = c7._init, c7 = h(c7._payload), n.type = c7, h = n.tag = Ww(c7), e = Ht(c7, e), h) {
            case 0:
              n = bc(null, n, c7, e, i);
              break e;
            case 1:
              n = ph(null, n, c7, e, i);
              break e;
            case 11:
              n = sh(null, n, c7, e, i);
              break e;
            case 14:
              n = ch(null, n, c7, Ht(c7.type, e), i);
              break e;
          }
          throw Error(o(306, c7, ""));
        }
        return n;
      case 0:
        return c7 = n.type, h = n.pendingProps, h = n.elementType === c7 ? h : Ht(c7, h), bc(e, n, c7, h, i);
      case 1:
        return c7 = n.type, h = n.pendingProps, h = n.elementType === c7 ? h : Ht(c7, h), ph(e, n, c7, h, i);
      case 3:
        e: {
          if (hh(n), e === null) throw Error(o(387));
          c7 = n.pendingProps, y = n.memoizedState, h = y.element, Mp(e, n), gi(n, c7, null, i);
          var S = n.memoizedState;
          if (c7 = S.element, y.isDehydrated) if (y = { element: c7, isDehydrated: false, cache: S.cache, pendingSuspenseBoundaries: S.pendingSuspenseBoundaries, transitions: S.transitions }, n.updateQueue.baseState = y, n.memoizedState = y, n.flags & 256) {
            h = Gr(Error(o(423)), n), n = mh(e, n, c7, i, h);
            break e;
          } else if (c7 !== h) {
            h = Gr(Error(o(424)), n), n = mh(e, n, c7, i, h);
            break e;
          } else for (kt = Nn(n.stateNode.containerInfo.firstChild), Ct = n, Le = true, zt = null, i = bp(n, null, c7, i), n.child = i; i; ) i.flags = i.flags & -3 | 4096, i = i.sibling;
          else {
            if (Vr(), c7 === h) {
              n = wn(e, n, i);
              break e;
            }
            ct(e, n, c7, i);
          }
          n = n.child;
        }
        return n;
      case 5:
        return Op(n), e === null && rc(n), c7 = n.type, h = n.pendingProps, y = e !== null ? e.memoizedProps : null, S = h.children, Gs(c7, h) ? S = null : y !== null && Gs(c7, y) && (n.flags |= 32), dh(e, n), ct(e, n, S, i), n.child;
      case 6:
        return e === null && rc(n), null;
      case 13:
        return yh(e, n, i);
      case 4:
        return fc(n, n.stateNode.containerInfo), c7 = n.pendingProps, e === null ? n.child = Ur(n, null, c7, i) : ct(e, n, c7, i), n.child;
      case 11:
        return c7 = n.type, h = n.pendingProps, h = n.elementType === c7 ? h : Ht(c7, h), sh(e, n, c7, h, i);
      case 7:
        return ct(e, n, n.pendingProps, i), n.child;
      case 8:
        return ct(e, n, n.pendingProps.children, i), n.child;
      case 12:
        return ct(e, n, n.pendingProps.children, i), n.child;
      case 10:
        e: {
          if (c7 = n.type._context, h = n.pendingProps, y = n.memoizedProps, S = h.value, Ne(mi, c7._currentValue), c7._currentValue = S, y !== null) if ($t(y.value, S)) {
            if (y.children === h.children && !dt.current) {
              n = wn(e, n, i);
              break e;
            }
          } else for (y = n.child, y !== null && (y.return = n); y !== null; ) {
            var T = y.dependencies;
            if (T !== null) {
              S = y.child;
              for (var _ = T.firstContext; _ !== null; ) {
                if (_.context === c7) {
                  if (y.tag === 1) {
                    _ = gn(-1, i & -i), _.tag = 2;
                    var F = y.updateQueue;
                    if (F !== null) {
                      F = F.shared;
                      var W = F.pending;
                      W === null ? _.next = _ : (_.next = W.next, W.next = _), F.pending = _;
                    }
                  }
                  y.lanes |= i, _ = y.alternate, _ !== null && (_.lanes |= i), sc(y.return, i, n), T.lanes |= i;
                  break;
                }
                _ = _.next;
              }
            } else if (y.tag === 10) S = y.type === n.type ? null : y.child;
            else if (y.tag === 18) {
              if (S = y.return, S === null) throw Error(o(341));
              S.lanes |= i, T = S.alternate, T !== null && (T.lanes |= i), sc(S, i, n), S = y.sibling;
            } else S = y.child;
            if (S !== null) S.return = y;
            else for (S = y; S !== null; ) {
              if (S === n) {
                S = null;
                break;
              }
              if (y = S.sibling, y !== null) {
                y.return = S.return, S = y;
                break;
              }
              S = S.return;
            }
            y = S;
          }
          ct(e, n, h.children, i), n = n.child;
        }
        return n;
      case 9:
        return h = n.type, c7 = n.pendingProps.children, qr(n, i), h = At(h), c7 = c7(h), n.flags |= 1, ct(e, n, c7, i), n.child;
      case 14:
        return c7 = n.type, h = Ht(c7, n.pendingProps), h = Ht(c7.type, h), ch(e, n, c7, h, i);
      case 15:
        return uh(e, n, n.type, n.pendingProps, i);
      case 17:
        return c7 = n.type, h = n.pendingProps, h = n.elementType === c7 ? h : Ht(c7, h), bi(e, n), n.tag = 1, pt(c7) ? (e = true, ci(n)) : e = false, qr(n, i), th(n, c7, h), Ec(n, c7, h, i), Tc(null, n, c7, true, e, i);
      case 19:
        return gh(e, n, i);
      case 22:
        return fh(e, n, i);
    }
    throw Error(o(156, n.tag));
  };
  function Bh(e, n) {
    return Sd(e, n);
  }
  function Uw(e, n, i, c7) {
    this.tag = e, this.key = i, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = n, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = c7, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Nt(e, n, i, c7) {
    return new Uw(e, n, i, c7);
  }
  function Gc(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function Ww(e) {
    if (typeof e == "function") return Gc(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === ce) return 11;
      if (e === ye) return 14;
    }
    return 2;
  }
  function Un(e, n) {
    var i = e.alternate;
    return i === null ? (i = Nt(e.tag, n, e.key, e.mode), i.elementType = e.elementType, i.type = e.type, i.stateNode = e.stateNode, i.alternate = e, e.alternate = i) : (i.pendingProps = n, i.type = e.type, i.flags = 0, i.subtreeFlags = 0, i.deletions = null), i.flags = e.flags & 14680064, i.childLanes = e.childLanes, i.lanes = e.lanes, i.child = e.child, i.memoizedProps = e.memoizedProps, i.memoizedState = e.memoizedState, i.updateQueue = e.updateQueue, n = e.dependencies, i.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }, i.sibling = e.sibling, i.index = e.index, i.ref = e.ref, i;
  }
  function Fi(e, n, i, c7, h, y) {
    var S = 2;
    if (c7 = e, typeof e == "function") Gc(e) && (S = 1);
    else if (typeof e == "string") S = 5;
    else e: switch (e) {
      case z:
        return hr(i.children, h, y, n);
      case Q:
        S = 8, h |= 8;
        break;
      case Z:
        return e = Nt(12, i, n, h | 2), e.elementType = Z, e.lanes = y, e;
      case fe:
        return e = Nt(13, i, n, h), e.elementType = fe, e.lanes = y, e;
      case de:
        return e = Nt(19, i, n, h), e.elementType = de, e.lanes = y, e;
      case ae:
        return $i(i, h, y, n);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case J:
            S = 10;
            break e;
          case ee:
            S = 9;
            break e;
          case ce:
            S = 11;
            break e;
          case ye:
            S = 14;
            break e;
          case re:
            S = 16, c7 = null;
            break e;
        }
        throw Error(o(130, e == null ? e : typeof e, ""));
    }
    return n = Nt(S, i, n, h), n.elementType = e, n.type = c7, n.lanes = y, n;
  }
  function hr(e, n, i, c7) {
    return e = Nt(7, e, c7, n), e.lanes = i, e;
  }
  function $i(e, n, i, c7) {
    return e = Nt(22, e, c7, n), e.elementType = ae, e.lanes = i, e.stateNode = { isHidden: false }, e;
  }
  function Yc(e, n, i) {
    return e = Nt(6, e, null, n), e.lanes = i, e;
  }
  function Xc(e, n, i) {
    return n = Nt(4, e.children !== null ? e.children : [], e.key, n), n.lanes = i, n.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, n;
  }
  function qw(e, n, i, c7, h) {
    this.tag = n, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = ks(0), this.expirationTimes = ks(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ks(0), this.identifierPrefix = c7, this.onRecoverableError = h, this.mutableSourceEagerHydrationData = null;
  }
  function Qc(e, n, i, c7, h, y, S, T, _) {
    return e = new qw(e, n, i, T, _), n === 1 ? (n = 1, y === true && (n |= 8)) : n = 0, y = Nt(3, null, null, n), e.current = y, y.stateNode = e, y.memoizedState = { element: c7, isDehydrated: i, cache: null, transitions: null, pendingSuspenseBoundaries: null }, uc(y), e;
  }
  function Kw(e, n, i) {
    var c7 = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: B, key: c7 == null ? null : "" + c7, children: e, containerInfo: n, implementation: i };
  }
  function Vh(e) {
    if (!e) return Dn;
    e = e._reactInternals;
    e: {
      if (nr(e) !== e || e.tag !== 1) throw Error(o(170));
      var n = e;
      do {
        switch (n.tag) {
          case 3:
            n = n.stateNode.context;
            break e;
          case 1:
            if (pt(n.type)) {
              n = n.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        n = n.return;
      } while (n !== null);
      throw Error(o(171));
    }
    if (e.tag === 1) {
      var i = e.type;
      if (pt(i)) return vp(e, i, n);
    }
    return n;
  }
  function Uh(e, n, i, c7, h, y, S, T, _) {
    return e = Qc(i, c7, true, e, h, y, S, T, _), e.context = Vh(null), i = e.current, c7 = ut(), h = Bn(i), y = gn(c7, h), y.callback = n ?? null, Fn(i, y, h), e.current.lanes = h, Mo(e, h, c7), yt(e, c7), e;
  }
  function zi(e, n, i, c7) {
    var h = n.current, y = ut(), S = Bn(h);
    return i = Vh(i), n.context === null ? n.context = i : n.pendingContext = i, n = gn(y, S), n.payload = { element: e }, c7 = c7 === void 0 ? null : c7, c7 !== null && (n.callback = c7), e = Fn(h, n, S), e !== null && (Ut(e, h, S, y), vi(e, h, S)), S;
  }
  function Hi(e) {
    return e = e.current, e.child ? (e.child.tag === 5, e.child.stateNode) : null;
  }
  function Wh(e, n) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var i = e.retryLane;
      e.retryLane = i !== 0 && i < n ? i : n;
    }
  }
  function Zc(e, n) {
    Wh(e, n), (e = e.alternate) && Wh(e, n);
  }
  function Gw() {
    return null;
  }
  var qh = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function Jc(e) {
    this._internalRoot = e;
  }
  Bi.prototype.render = Jc.prototype.render = function(e) {
    var n = this._internalRoot;
    if (n === null) throw Error(o(409));
    zi(e, n, null, null);
  }, Bi.prototype.unmount = Jc.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var n = e.containerInfo;
      fr(function() {
        zi(null, e, null, null);
      }), n[pn] = null;
    }
  };
  function Bi(e) {
    this._internalRoot = e;
  }
  Bi.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var n = Md();
      e = { blockedOn: null, target: e, priority: n };
      for (var i = 0; i < An.length && n !== 0 && n < An[i].priority; i++) ;
      An.splice(i, 0, e), i === 0 && Od(e);
    }
  };
  function eu(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function Vi(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function Kh() {
  }
  function Yw(e, n, i, c7, h) {
    if (h) {
      if (typeof c7 == "function") {
        var y = c7;
        c7 = function() {
          var F = Hi(S);
          y.call(F);
        };
      }
      var S = Uh(n, c7, e, 0, null, false, false, "", Kh);
      return e._reactRootContainer = S, e[pn] = S.current, Vo(e.nodeType === 8 ? e.parentNode : e), fr(), S;
    }
    for (; h = e.lastChild; ) e.removeChild(h);
    if (typeof c7 == "function") {
      var T = c7;
      c7 = function() {
        var F = Hi(_);
        T.call(F);
      };
    }
    var _ = Qc(e, 0, false, null, null, false, false, "", Kh);
    return e._reactRootContainer = _, e[pn] = _.current, Vo(e.nodeType === 8 ? e.parentNode : e), fr(function() {
      zi(n, _, i, c7);
    }), _;
  }
  function Ui(e, n, i, c7, h) {
    var y = i._reactRootContainer;
    if (y) {
      var S = y;
      if (typeof h == "function") {
        var T = h;
        h = function() {
          var _ = Hi(S);
          T.call(_);
        };
      }
      zi(n, S, e, h);
    } else S = Yw(i, n, e, h, c7);
    return Hi(S);
  }
  bd = function(e) {
    switch (e.tag) {
      case 3:
        var n = e.stateNode;
        if (n.current.memoizedState.isDehydrated) {
          var i = To(n.pendingLanes);
          i !== 0 && (Es(n, i | 1), yt(n, Ve()), (be & 6) === 0 && (Qr = Ve() + 500, Ln()));
        }
        break;
      case 13:
        fr(function() {
          var c7 = vn(e, 1);
          if (c7 !== null) {
            var h = ut();
            Ut(c7, e, 1, h);
          }
        }), Zc(e, 1);
    }
  }, Rs = function(e) {
    if (e.tag === 13) {
      var n = vn(e, 134217728);
      if (n !== null) {
        var i = ut();
        Ut(n, e, 134217728, i);
      }
      Zc(e, 134217728);
    }
  }, Td = function(e) {
    if (e.tag === 13) {
      var n = Bn(e), i = vn(e, n);
      if (i !== null) {
        var c7 = ut();
        Ut(i, e, n, c7);
      }
      Zc(e, n);
    }
  }, Md = function() {
    return _e;
  }, Ad = function(e, n) {
    var i = _e;
    try {
      return _e = e, n();
    } finally {
      _e = i;
    }
  }, vs = function(e, n, i) {
    switch (n) {
      case "input":
        if (tr(e, i), n = i.name, i.type === "radio" && n != null) {
          for (i = e; i.parentNode; ) i = i.parentNode;
          for (i = i.querySelectorAll("input[name=" + JSON.stringify("" + n) + '][type="radio"]'), n = 0; n < i.length; n++) {
            var c7 = i[n];
            if (c7 !== e && c7.form === e.form) {
              var h = li(c7);
              if (!h) throw Error(o(90));
              $e(c7), tr(c7, h);
            }
          }
        }
        break;
      case "textarea":
        ad(e, i);
        break;
      case "select":
        n = i.value, n != null && Tr(e, !!i.multiple, n, false);
    }
  }, hd = Wc, md = fr;
  var Xw = { usingClientEntryPoint: false, Events: [qo, Fr, li, dd, pd, Wc] }, ia = { findFiberByHostInstance: rr, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, Qw = { bundleType: ia.bundleType, version: ia.version, rendererPackageName: ia.rendererPackageName, rendererConfig: ia.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: N.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = wd(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: ia.findFiberByHostInstance || Gw, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Wi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Wi.isDisabled && Wi.supportsFiber) try {
      Ba = Wi.inject(Qw), tn = Wi;
    } catch {
    }
  }
  return vt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Xw, vt.createPortal = function(e, n) {
    var i = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!eu(n)) throw Error(o(200));
    return Kw(e, n, null, i);
  }, vt.createRoot = function(e, n) {
    if (!eu(e)) throw Error(o(299));
    var i = false, c7 = "", h = qh;
    return n != null && (n.unstable_strictMode === true && (i = true), n.identifierPrefix !== void 0 && (c7 = n.identifierPrefix), n.onRecoverableError !== void 0 && (h = n.onRecoverableError)), n = Qc(e, 1, false, null, null, i, false, c7, h), e[pn] = n.current, Vo(e.nodeType === 8 ? e.parentNode : e), new Jc(n);
  }, vt.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var n = e._reactInternals;
    if (n === void 0) throw typeof e.render == "function" ? Error(o(188)) : (e = Object.keys(e).join(","), Error(o(268, e)));
    return e = wd(n), e = e === null ? null : e.stateNode, e;
  }, vt.flushSync = function(e) {
    return fr(e);
  }, vt.hydrate = function(e, n, i) {
    if (!Vi(n)) throw Error(o(200));
    return Ui(null, e, n, true, i);
  }, vt.hydrateRoot = function(e, n, i) {
    if (!eu(e)) throw Error(o(405));
    var c7 = i != null && i.hydratedSources || null, h = false, y = "", S = qh;
    if (i != null && (i.unstable_strictMode === true && (h = true), i.identifierPrefix !== void 0 && (y = i.identifierPrefix), i.onRecoverableError !== void 0 && (S = i.onRecoverableError)), n = Uh(n, null, e, 1, i ?? null, h, false, y, S), e[pn] = n.current, Vo(e), c7) for (e = 0; e < c7.length; e++) i = c7[e], h = i._getVersion, h = h(i._source), n.mutableSourceEagerHydrationData == null ? n.mutableSourceEagerHydrationData = [i, h] : n.mutableSourceEagerHydrationData.push(i, h);
    return new Bi(n);
  }, vt.render = function(e, n, i) {
    if (!Vi(n)) throw Error(o(200));
    return Ui(null, e, n, false, i);
  }, vt.unmountComponentAtNode = function(e) {
    if (!Vi(e)) throw Error(o(40));
    return e._reactRootContainer ? (fr(function() {
      Ui(null, null, e, false, function() {
        e._reactRootContainer = null, e[pn] = null;
      });
    }), true) : false;
  }, vt.unstable_batchedUpdates = Wc, vt.unstable_renderSubtreeIntoContainer = function(e, n, i, c7) {
    if (!Vi(i)) throw Error(o(200));
    if (e == null || e._reactInternals === void 0) throw Error(o(38));
    return Ui(e, n, i, false, c7);
  }, vt.version = "18.3.1-next-f1338f8080-20240426", vt;
}
var t1;
function pm() {
  if (t1) return ru.exports;
  t1 = 1;
  function t7() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t7);
    } catch (r2) {
      console.error(r2);
    }
  }
  return t7(), ru.exports = ax(), ru.exports;
}
var n1;
function ix() {
  if (n1) return qi;
  n1 = 1;
  var t7 = pm();
  return qi.createRoot = t7.createRoot, qi.hydrateRoot = t7.hydrateRoot, qi;
}
var lx = ix();
var MA = Sr(lx);
var ff = /^(?:[a-z][a-z0-9+.-]*:|[\\/]{2})/i;
var hm = /^[\\/]{2}/;
function sx(t7, r2) {
  return r2 + t7.replace(/\\/g, "/");
}
function Fe(t7, r2) {
  if (t7 === false || t7 === null || typeof t7 > "u") throw new Error(r2);
}
function Dt(t7, r2) {
  if (!t7) {
    typeof console < "u" && console.warn(r2);
    try {
      throw new Error(r2);
    } catch {
    }
  }
}
function va({ pathname: t7 = "/", search: r2 = "", hash: o = "" }) {
  return r2 && r2 !== "?" && (t7 += r2.charAt(0) === "?" ? r2 : "?" + r2), o && o !== "#" && (t7 += o.charAt(0) === "#" ? o : "#" + o), t7;
}
function po(t7) {
  let r2 = {};
  if (t7) {
    let o = t7.indexOf("#");
    o >= 0 && (r2.hash = t7.substring(o), t7 = t7.substring(0, o));
    let a = t7.indexOf("?");
    a >= 0 && (r2.search = t7.substring(a), t7 = t7.substring(0, a)), t7 && (r2.pathname = t7);
  }
  return r2;
}
function mm(t7, r2, o = "/") {
  return px(t7, r2, o, false);
}
function px(t7, r2, o, a, l) {
  let s = typeof r2 == "string" ? po(r2) : r2, u2 = Cn(s.pathname || "/", o);
  if (u2 == null) return null;
  let f = hx(t7), d = null, m = Rx(u2);
  for (let v = 0; d == null && v < f.length; ++v) d = Ex(f[v], m, a);
  return d;
}
function hx(t7) {
  let r2 = ym(t7);
  return mx(r2), r2;
}
function ym(t7, r2 = [], o = [], a = "", l = false) {
  let s = (u2, f, d = l, m) => {
    let v = { relativePath: m === void 0 ? u2.path || "" : m, caseSensitive: u2.caseSensitive === true, childrenIndex: f, route: u2 };
    if (v.relativePath.startsWith("/")) {
      if (!v.relativePath.startsWith(a) && d) return;
      Fe(v.relativePath.startsWith(a), `Absolute route path "${v.relativePath}" nested under path "${a}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`), v.relativePath = v.relativePath.slice(a.length);
    }
    let g = Gt([a, v.relativePath]), w = o.concat(v);
    u2.children && u2.children.length > 0 && (Fe(u2.index !== true, `Index routes must not have child routes. Please remove all child routes from route path "${g}".`), ym(u2.children, r2, w, g, d)), !(u2.path == null && !u2.index) && r2.push({ path: g, score: Cx(g, u2.index), routesMeta: w.map((k, P) => {
      let [C, x] = wm(k.relativePath, k.caseSensitive, P === w.length - 1);
      return { ...k, matcher: C, compiledParams: x };
    }) });
  };
  return t7.forEach((u2, f) => {
    if (u2.path === "" || !u2.path?.includes("?")) s(u2, f);
    else for (let d of vm(u2.path)) s(u2, f, true, d);
  }), r2;
}
function vm(t7) {
  let r2 = t7.split("/");
  if (r2.length === 0) return [];
  let [o, ...a] = r2, l = o.endsWith("?"), s = o.replace(/\?$/, "");
  if (a.length === 0) return l ? [s, ""] : [s];
  let u2 = vm(a.join("/")), f = [];
  return f.push(...u2.map((d) => d === "" ? s : [s, d].join("/"))), l && f.push(...u2), f.map((d) => t7.startsWith("/") && d === "" ? "/" : d);
}
function mx(t7) {
  t7.sort((r2, o) => r2.score !== o.score ? o.score - r2.score : kx(r2.routesMeta.map((a) => a.childrenIndex), o.routesMeta.map((a) => a.childrenIndex)));
}
var yx = /^:[\w-]+$/;
var vx = 3;
var gx = 2;
var wx = 1;
var xx = 10;
var Sx = -2;
var i1 = (t7) => t7 === "*";
function Cx(t7, r2) {
  let o = t7.split("/"), a = o.length;
  return o.some(i1) && (a += Sx), r2 && (a += gx), o.filter((l) => !i1(l)).reduce((l, s) => l + (yx.test(s) ? vx : s === "" ? wx : xx), a);
}
function kx(t7, r2) {
  return t7.length === r2.length && t7.slice(0, -1).every((a, l) => a === r2[l]) ? t7[t7.length - 1] - r2[r2.length - 1] : 0;
}
function Ex(t7, r2, o = false) {
  let { routesMeta: a } = t7, l = {}, s = "/", u2 = [];
  for (let f = 0; f < a.length; ++f) {
    let d = a[f], m = f === a.length - 1, v = s === "/" ? r2 : r2.slice(s.length) || "/", g = { path: d.relativePath, caseSensitive: d.caseSensitive, end: m }, w = d.matcher && d.compiledParams ? gm(g, v, d.matcher, d.compiledParams) : il(g, v), k = d.route;
    if (!w && m && o && !a[a.length - 1].route.index && (w = il({ path: d.relativePath, caseSensitive: d.caseSensitive, end: false }, v)), !w) return null;
    Object.assign(l, w.params), u2.push({ params: l, pathname: Gt([s, w.pathname]), pathnameBase: Tx(Gt([s, w.pathnameBase])), route: k }), w.pathnameBase !== "/" && (s = Gt([s, w.pathnameBase]));
  }
  return u2;
}
function il(t7, r2) {
  typeof t7 == "string" && (t7 = { path: t7, caseSensitive: false, end: true });
  let [o, a] = wm(t7.path, t7.caseSensitive, t7.end);
  return gm(t7, r2, o, a);
}
function gm(t7, r2, o, a) {
  let l = r2.match(o);
  if (!l) return null;
  let s = l[0], u2 = s.replace(/(.)\/+$/, "$1"), f = l.slice(1);
  return { params: a.reduce((m, { paramName: v, isOptional: g }, w) => {
    if (v === "*") {
      let P = f[w] || "";
      u2 = s.slice(0, s.length - P.length).replace(/(.)\/+$/, "$1");
    }
    const k = f[w];
    return g && !k ? m[v] = void 0 : m[v] = (k || "").replace(/%2F/g, "/"), m;
  }, {}), pathname: s, pathnameBase: u2, pattern: t7 };
}
function wm(t7, r2 = false, o = true) {
  Dt(t7 === "*" || !t7.endsWith("*") || t7.endsWith("/*"), `Route path "${t7}" will be treated as if it were "${t7.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${t7.replace(/\*$/, "/*")}".`);
  let a = [], l = "^" + t7.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (u2, f, d, m, v) => {
    if (a.push({ paramName: f, isOptional: d != null }), d) {
      let g = v.charAt(m + u2.length);
      return g && g !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?";
    }
    return "/([^\\/]+)";
  }).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return t7.endsWith("*") ? (a.push({ paramName: "*" }), l += t7 === "*" || t7 === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : o ? l += "\\/*$" : t7 !== "" && t7 !== "/" && (l += "(?:(?=\\/|$))"), [new RegExp(l, r2 ? void 0 : "i"), a];
}
function Rx(t7) {
  try {
    return t7.split("/").map((r2) => decodeURIComponent(r2).replace(/\//g, "%2F")).join("/");
  } catch (r2) {
    return Dt(false, `The URL path "${t7}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${r2}).`), t7;
  }
}
function Cn(t7, r2) {
  if (r2 === "/") return t7;
  if (!t7.toLowerCase().startsWith(r2.toLowerCase())) return null;
  let o = r2.endsWith("/") ? r2.length - 1 : r2.length, a = t7.charAt(o);
  return a && a !== "/" ? null : t7.slice(o) || "/";
}
function Px(t7, r2 = "/") {
  let { pathname: o, search: a = "", hash: l = "" } = typeof t7 == "string" ? po(t7) : t7, s;
  return o ? (o = xm(o), o.startsWith("/") ? s = l1(o.substring(1), "/") : s = l1(o, r2)) : s = r2, { pathname: s, search: Mx(a), hash: Ax(l) };
}
function l1(t7, r2) {
  let o = ll(r2).split("/");
  return t7.split("/").forEach((l) => {
    l === ".." ? o.length > 1 && o.pop() : l !== "." && o.push(l);
  }), o.length > 1 ? o.join("/") : "/";
}
function iu(t7, r2, o, a) {
  return `Cannot include a '${t7}' character in a manually specified \`to.${r2}\` field [${JSON.stringify(a)}].  Please separate it out to the \`to.${o}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function bx(t7) {
  return t7.filter((r2, o) => o === 0 || r2.route.path && r2.route.path.length > 0);
}
function df(t7) {
  let r2 = bx(t7);
  return r2.map((o, a) => a === r2.length - 1 ? o.pathname : o.pathnameBase);
}
function bl(t7, r2, o, a = false) {
  let l;
  typeof t7 == "string" ? l = po(t7) : (l = { ...t7 }, Fe(!l.pathname || !l.pathname.includes("?"), iu("?", "pathname", "search", l)), Fe(!l.pathname || !l.pathname.includes("#"), iu("#", "pathname", "hash", l)), Fe(!l.search || !l.search.includes("#"), iu("#", "search", "hash", l)));
  let s = t7 === "" || l.pathname === "", u2 = s ? "/" : l.pathname, f;
  if (u2 == null) f = o;
  else {
    let g = r2.length - 1;
    if (!a && u2.startsWith("..")) {
      let w = u2.split("/");
      for (; w[0] === ".."; ) w.shift(), g -= 1;
      l.pathname = w.join("/");
    }
    f = g >= 0 ? r2[g] : "/";
  }
  let d = Px(l, f), m = u2 && u2 !== "/" && u2.endsWith("/"), v = (s || u2 === ".") && o.endsWith("/");
  return !d.pathname.endsWith("/") && (m || v) && (d.pathname += "/"), d;
}
var xm = (t7) => t7.replace(/[\\/]{2,}/g, "/");
var Gt = (t7) => xm(t7.join("/"));
var ll = (t7) => t7.replace(/\/+$/, "");
var Tx = (t7) => ll(t7).replace(/^\/*/, "/");
var Mx = (t7) => !t7 || t7 === "?" ? "" : t7.startsWith("?") ? t7 : "?" + t7;
var Ax = (t7) => !t7 || t7 === "#" ? "" : t7.startsWith("#") ? t7 : "#" + t7;
var _x = class {
  constructor(t7, r2, o, a = false) {
    this.status = t7, this.statusText = r2 || "", this.internal = a, o instanceof Error ? (this.data = o.toString(), this.error = o) : this.data = o;
  }
};
function Ox(t7) {
  return t7 != null && typeof t7.status == "number" && typeof t7.statusText == "string" && typeof t7.internal == "boolean" && "data" in t7;
}
function Nx(t7) {
  let r2 = t7.map((o) => o.route.path).filter(Boolean);
  return Gt(r2) || "/";
}
var Sm = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function Cm(t7, r2) {
  let o = t7;
  if (typeof o != "string" || !ff.test(o)) return { absoluteURL: void 0, isExternal: false, to: o };
  let a = o, l = false;
  if (Sm) try {
    let s = new URL(window.location.href), u2 = hm.test(o) ? new URL(sx(o, s.protocol)) : new URL(o), f = Cn(u2.pathname, r2);
    u2.origin === s.origin && f != null ? o = f + u2.search + u2.hash : l = true;
  } catch {
    Dt(false, `<Link to="${o}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`);
  }
  return { absoluteURL: a, isExternal: l, to: o };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var km = ["POST", "PUT", "PATCH", "DELETE"];
new Set(km);
var Ix = ["GET", ...km];
new Set(Ix);
var Dx = ["about:", "blob:", "chrome:", "chrome-untrusted:", "content:", "data:", "devtools:", "file:", "filesystem:", "javascript:"];
function Lx(t7) {
  try {
    return Dx.includes(new URL(t7).protocol);
  } catch {
    return false;
  }
}
var ho = p.createContext(null);
ho.displayName = "DataRouter";
var Tl = p.createContext(null);
Tl.displayName = "DataRouterState";
var Em = p.createContext(false);
function jx() {
  return p.useContext(Em);
}
var Rm = p.createContext({ isTransitioning: false });
Rm.displayName = "ViewTransition";
var Fx = p.createContext(/* @__PURE__ */ new Map());
Fx.displayName = "Fetchers";
var $x = p.createContext(null);
$x.displayName = "Await";
var bt = p.createContext(null);
bt.displayName = "Navigation";
var Ra = p.createContext(null);
Ra.displayName = "Location";
var Qt = p.createContext({ outlet: null, matches: [], isDataRoute: false });
Qt.displayName = "Route";
var pf = p.createContext(null);
pf.displayName = "RouteError";
var Pm = "REACT_ROUTER_ERROR";
var zx = "REDIRECT";
var Hx = "ROUTE_ERROR_RESPONSE";
function Bx(t7) {
  if (t7.startsWith(`${Pm}:${zx}:{`)) try {
    let r2 = JSON.parse(t7.slice(28));
    if (typeof r2 == "object" && r2 && typeof r2.status == "number" && typeof r2.statusText == "string" && typeof r2.location == "string" && typeof r2.reloadDocument == "boolean" && typeof r2.replace == "boolean") return r2;
  } catch {
  }
}
function Vx(t7) {
  if (t7.startsWith(`${Pm}:${Hx}:{`)) try {
    let r2 = JSON.parse(t7.slice(40));
    if (typeof r2 == "object" && r2 && typeof r2.status == "number" && typeof r2.statusText == "string") return new _x(r2.status, r2.statusText, r2.data);
  } catch {
  }
}
function Ux(t7, { relative: r2 } = {}) {
  Fe(mo(), "useHref() may be used only in the context of a <Router> component.");
  let { basename: o, navigator: a } = p.useContext(bt), { hash: l, pathname: s, search: u2 } = Pa(t7, { relative: r2 }), f = s;
  return o !== "/" && (f = s === "/" ? o : Gt([o, s])), a.createHref({ pathname: f, search: u2, hash: l });
}
function mo() {
  return p.useContext(Ra) != null;
}
function Zt() {
  return Fe(mo(), "useLocation() may be used only in the context of a <Router> component."), p.useContext(Ra).location;
}
var bm = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function Tm(t7) {
  p.useContext(bt).static || p.useLayoutEffect(t7);
}
function hf() {
  let { isDataRoute: t7 } = p.useContext(Qt);
  return t7 ? rS() : Wx();
}
function Wx() {
  Fe(mo(), "useNavigate() may be used only in the context of a <Router> component.");
  let t7 = p.useContext(ho), { basename: r2, navigator: o } = p.useContext(bt), { matches: a } = p.useContext(Qt), { pathname: l } = Zt(), s = JSON.stringify(df(a)), u2 = p.useRef(false);
  return Tm(() => {
    u2.current = true;
  }), p.useCallback((d, m = {}) => {
    if (Dt(u2.current, bm), !u2.current) return;
    if (typeof d == "number") {
      o.go(d);
      return;
    }
    let v = bl(d, JSON.parse(s), l, m.relative === "path");
    t7 == null && r2 !== "/" && (v.pathname = v.pathname === "/" ? r2 : Gt([r2, v.pathname])), (m.replace ? o.replace : o.push)(v, m.state, m);
  }, [r2, o, s, l, t7]);
}
p.createContext(null);
function Pa(t7, { relative: r2 } = {}) {
  let { matches: o } = p.useContext(Qt), { pathname: a } = Zt(), l = JSON.stringify(df(o));
  return p.useMemo(() => bl(t7, JSON.parse(l), a, r2 === "path"), [t7, l, a, r2]);
}
function Mm(t7, r2, o) {
  Fe(mo(), "useRoutes() may be used only in the context of a <Router> component.");
  let { navigator: a } = p.useContext(bt), { matches: l } = p.useContext(Qt), s = l[l.length - 1], u2 = s ? s.params : {}, f = s ? s.pathname : "/", d = s ? s.pathnameBase : "/", m = s && s.route;
  {
    let x = m && m.path || "";
    _m(f, !m || x.endsWith("*") || x.endsWith("*?"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${f}" (under <Route path="${x}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${x}"> to <Route path="${x === "/" ? "*" : `${x}/*`}">.`);
  }
  let v = Zt(), g;
  if (r2) {
    let x = typeof r2 == "string" ? po(r2) : r2;
    Fe(d === "/" || x.pathname?.startsWith(d), `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${d}" but pathname "${x.pathname}" was given in the \`location\` prop.`), g = x;
  } else g = v;
  let w = g.pathname || "/", k = w;
  if (d !== "/") {
    let x = d.replace(/^\//, "").split("/");
    k = "/" + w.replace(/^\//, "").split("/").slice(x.length).join("/");
  }
  let P = o && o.state.matches.length ? o.state.matches.map((x) => Object.assign(x, { route: o.manifest[x.route.id] || x.route })) : mm(t7, { pathname: k });
  Dt(m || P != null, `No routes matched location "${g.pathname}${g.search}${g.hash}" `), Dt(P == null || P[P.length - 1].route.element !== void 0 || P[P.length - 1].route.Component !== void 0 || P[P.length - 1].route.lazy !== void 0, `Matched leaf route at location "${g.pathname}${g.search}${g.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`);
  let C = Qx(P && P.map((x) => Object.assign({}, x, { params: Object.assign({}, u2, x.params), pathname: Gt([d, a.encodeLocation ? a.encodeLocation(x.pathname.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : x.pathname]), pathnameBase: x.pathnameBase === "/" ? d : Gt([d, a.encodeLocation ? a.encodeLocation(x.pathnameBase.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : x.pathnameBase]) })), l, o);
  return r2 && C ? p.createElement(Ra.Provider, { value: { location: { pathname: "/", search: "", hash: "", state: null, key: "default", mask: void 0, ...g }, navigationType: "POP" } }, C) : C;
}
function Kx() {
  let t7 = nS(), r2 = Ox(t7) ? `${t7.status} ${t7.statusText}` : t7 instanceof Error ? t7.message : JSON.stringify(t7), o = t7 instanceof Error ? t7.stack : null, a = "rgba(200,200,200, 0.5)", l = { padding: "0.5rem", backgroundColor: a }, s = { padding: "2px 4px", backgroundColor: a }, u2 = null;
  return console.error("Error handled by React Router default ErrorBoundary:", t7), u2 = p.createElement(p.Fragment, null, p.createElement("p", null, "\u{1F4BF} Hey developer \u{1F44B}"), p.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", p.createElement("code", { style: s }, "ErrorBoundary"), " or", " ", p.createElement("code", { style: s }, "errorElement"), " prop on your route.")), p.createElement(p.Fragment, null, p.createElement("h2", null, "Unexpected Application Error!"), p.createElement("h3", { style: { fontStyle: "italic" } }, r2), o ? p.createElement("pre", { style: l }, o) : null, u2);
}
var Gx = p.createElement(Kx, null);
var Am = class extends p.Component {
  constructor(t7) {
    super(t7), this.state = { location: t7.location, revalidation: t7.revalidation, error: t7.error };
  }
  static getDerivedStateFromError(t7) {
    return { error: t7 };
  }
  static getDerivedStateFromProps(t7, r2) {
    return r2.location !== t7.location || r2.revalidation !== "idle" && t7.revalidation === "idle" ? { error: t7.error, location: t7.location, revalidation: t7.revalidation } : { error: t7.error !== void 0 ? t7.error : r2.error, location: r2.location, revalidation: t7.revalidation || r2.revalidation };
  }
  componentDidCatch(t7, r2) {
    this.props.onError ? this.props.onError(t7, r2) : console.error("React Router caught the following error during render", t7);
  }
  render() {
    let t7 = this.state.error;
    if (this.context && typeof t7 == "object" && t7 && "digest" in t7 && typeof t7.digest == "string") {
      const o = Vx(t7.digest);
      o && (t7 = o);
    }
    let r2 = t7 !== void 0 ? p.createElement(Qt.Provider, { value: this.props.routeContext }, p.createElement(pf.Provider, { value: t7, children: this.props.component })) : this.props.children;
    return this.context ? p.createElement(Yx, { error: t7 }, r2) : r2;
  }
};
Am.contextType = Em;
var lu = /* @__PURE__ */ new WeakMap();
function Yx({ children: t7, error: r2 }) {
  let { basename: o } = p.useContext(bt);
  if (typeof r2 == "object" && r2 && "digest" in r2 && typeof r2.digest == "string") {
    let a = Bx(r2.digest);
    if (a) {
      let l = lu.get(r2);
      if (l) throw l;
      let s = Cm(a.location, o), u2 = s.absoluteURL || s.to;
      if (Lx(u2)) throw new Error("Invalid redirect location");
      if (Sm && !lu.get(r2)) if (s.isExternal || a.reloadDocument) window.location.href = u2;
      else {
        const f = Promise.resolve().then(() => window.__reactRouterDataRouter.navigate(s.to, { replace: a.replace }));
        throw lu.set(r2, f), f;
      }
      return p.createElement("meta", { httpEquiv: "refresh", content: `0;url=${u2}` });
    }
  }
  return t7;
}
function Xx({ routeContext: t7, match: r2, children: o }) {
  let a = p.useContext(ho);
  return a && a.static && a.staticContext && (r2.route.errorElement || r2.route.ErrorBoundary) && (a.staticContext._deepestRenderedBoundaryId = r2.route.id), p.createElement(Qt.Provider, { value: t7 }, o);
}
function Qx(t7, r2 = [], o) {
  let a = o?.state;
  if (t7 == null) {
    if (!a) return null;
    if (a.errors) t7 = a.matches;
    else if (r2.length === 0 && !a.initialized && a.matches.length > 0) t7 = a.matches;
    else return null;
  }
  let l = t7, s = a?.errors;
  if (s != null) {
    let v = l.findIndex((g) => g.route.id && s?.[g.route.id] !== void 0);
    Fe(v >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(s).join(",")}`), l = l.slice(0, Math.min(l.length, v + 1));
  }
  let u2 = false, f = -1;
  if (o && a) {
    u2 = a.renderFallback;
    for (let v = 0; v < l.length; v++) {
      let g = l[v];
      if ((g.route.HydrateFallback || g.route.hydrateFallbackElement) && (f = v), g.route.id) {
        let { loaderData: w, errors: k } = a, P = g.route.loader && !w.hasOwnProperty(g.route.id) && (!k || k[g.route.id] === void 0);
        if (g.route.lazy || P) {
          o.isStatic && (u2 = true), f >= 0 ? l = l.slice(0, f + 1) : l = [l[0]];
          break;
        }
      }
    }
  }
  let d = o?.onError, m = a && d ? (v, g) => {
    d(v, { location: a.location, params: a.matches?.[0]?.params ?? {}, pattern: Nx(a.matches), errorInfo: g });
  } : void 0;
  return l.reduceRight((v, g, w) => {
    let k, P = false, C = null, x = null;
    a && (k = s && g.route.id ? s[g.route.id] : void 0, C = g.route.errorElement || Gx, u2 && (f < 0 && w === 0 ? (_m("route-fallback", false, "No `HydrateFallback` element provided to render during initial hydration"), P = true, x = null) : f === w && (P = true, x = g.route.hydrateFallbackElement || null)));
    let R = r2.concat(l.slice(0, w + 1)), b = () => {
      let M;
      return k ? M = C : P ? M = x : g.route.Component ? M = p.createElement(g.route.Component, null) : g.route.element ? M = g.route.element : M = v, p.createElement(Xx, { match: g, routeContext: { outlet: v, matches: R, isDataRoute: a != null }, children: M });
    };
    return a && (g.route.ErrorBoundary || g.route.errorElement || w === 0) ? p.createElement(Am, { location: a.location, revalidation: a.revalidation, component: C, error: k, children: b(), routeContext: { outlet: null, matches: R, isDataRoute: true }, onError: m }) : b();
  }, null);
}
function mf(t7) {
  return `${t7} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function Zx(t7) {
  let r2 = p.useContext(ho);
  return Fe(r2, mf(t7)), r2;
}
function Jx(t7) {
  let r2 = p.useContext(Tl);
  return Fe(r2, mf(t7)), r2;
}
function eS(t7) {
  let r2 = p.useContext(Qt);
  return Fe(r2, mf(t7)), r2;
}
function yf(t7) {
  let r2 = eS(t7), o = r2.matches[r2.matches.length - 1];
  return Fe(o.route.id, `${t7} can only be used on routes that contain a unique "id"`), o.route.id;
}
function tS() {
  return yf("useRouteId");
}
function nS() {
  let t7 = p.useContext(pf), r2 = Jx("useRouteError"), o = yf("useRouteError");
  return t7 !== void 0 ? t7 : r2.errors?.[o];
}
function rS() {
  let { router: t7 } = Zx("useNavigate"), r2 = yf("useNavigate"), o = p.useRef(false);
  return Tm(() => {
    o.current = true;
  }), p.useCallback(async (l, s = {}) => {
    Dt(o.current, bm), o.current && (typeof l == "number" ? await t7.navigate(l) : await t7.navigate(l, { fromRouteId: r2, ...s }));
  }, [t7, r2]);
}
var s1 = {};
function _m(t7, r2, o) {
  !r2 && !s1[t7] && (s1[t7] = true, Dt(false, o));
}
p.memo(oS);
function oS({ routes: t7, manifest: r2, future: o, state: a, isStatic: l, onError: s }) {
  return Mm(t7, void 0, { manifest: r2, state: a, isStatic: l, onError: s });
}
var tl = "get";
var nl = "application/x-www-form-urlencoded";
function Ml(t7) {
  return typeof HTMLElement < "u" && t7 instanceof HTMLElement;
}
function lS(t7) {
  return Ml(t7) && t7.tagName.toLowerCase() === "button";
}
function sS(t7) {
  return Ml(t7) && t7.tagName.toLowerCase() === "form";
}
function cS(t7) {
  return Ml(t7) && t7.tagName.toLowerCase() === "input";
}
function uS(t7) {
  return !!(t7.metaKey || t7.altKey || t7.ctrlKey || t7.shiftKey);
}
function fS(t7, r2) {
  return t7.button === 0 && (!r2 || r2 === "_self") && !uS(t7);
}
var Ki = null;
function pS() {
  if (Ki === null) try {
    new FormData(document.createElement("form"), 0), Ki = false;
  } catch {
    Ki = true;
  }
  return Ki;
}
var hS = /* @__PURE__ */ new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function su(t7) {
  return t7 != null && !hS.has(t7) ? (Dt(false, `"${t7}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${nl}"`), null) : t7;
}
function mS(t7, r2) {
  let o, a, l, s, u2;
  if (sS(t7)) {
    let f = t7.getAttribute("action");
    a = f ? Cn(f, r2) : null, o = t7.getAttribute("method") || tl, l = su(t7.getAttribute("enctype")) || nl, s = new FormData(t7);
  } else if (lS(t7) || cS(t7) && (t7.type === "submit" || t7.type === "image")) {
    let f = t7.form;
    if (f == null) throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
    let d = t7.getAttribute("formaction") || f.getAttribute("action");
    if (a = d ? Cn(d, r2) : null, o = t7.getAttribute("formmethod") || f.getAttribute("method") || tl, l = su(t7.getAttribute("formenctype")) || su(f.getAttribute("enctype")) || nl, s = new FormData(f, t7), !pS()) {
      let { name: m, type: v, value: g } = t7;
      if (v === "image") {
        let w = m ? `${m}.` : "";
        s.append(`${w}x`, "0"), s.append(`${w}y`, "0");
      } else m && s.append(m, g);
    }
  } else {
    if (Ml(t7)) throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
    o = tl, a = null, l = nl, u2 = t7;
  }
  return s && l === "text/plain" && (u2 = s, s = void 0), { action: a, method: o.toLowerCase(), encType: l, formData: s, body: u2 };
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function vf(t7, r2) {
  if (t7 === false || t7 === null || typeof t7 > "u") throw new Error(r2);
}
function Om(t7, r2, o, a) {
  let l = typeof t7 == "string" ? new URL(t7, typeof window > "u" ? "server://singlefetch/" : window.location.origin) : t7;
  return o ? l.pathname.endsWith("/") ? l.pathname = `${l.pathname}_.${a}` : l.pathname = `${l.pathname}.${a}` : l.pathname === "/" ? l.pathname = `_root.${a}` : r2 && Cn(l.pathname, r2) === "/" ? l.pathname = `${ll(r2)}/_root.${a}` : l.pathname = `${ll(l.pathname)}.${a}`, l;
}
async function yS(t7, r2) {
  if (t7.id in r2) return r2[t7.id];
  try {
    let o = await import(t7.module);
    return r2[t7.id] = o, o;
  } catch (o) {
    return console.error(`Error loading route module \`${t7.module}\`, reloading page...`), console.error(o), window.__reactRouterContext && window.__reactRouterContext.isSpaMode, window.location.reload(), new Promise(() => {
    });
  }
}
function vS(t7) {
  return t7 == null ? false : t7.href == null ? t7.rel === "preload" && typeof t7.imageSrcSet == "string" && typeof t7.imageSizes == "string" : typeof t7.rel == "string" && typeof t7.href == "string";
}
async function gS(t7, r2, o) {
  let a = await Promise.all(t7.map(async (l) => {
    let s = r2.routes[l.route.id];
    if (s) {
      let u2 = await yS(s, o);
      return u2.links ? u2.links() : [];
    }
    return [];
  }));
  return CS(a.flat(1).filter(vS).filter((l) => l.rel === "stylesheet" || l.rel === "preload").map((l) => l.rel === "stylesheet" ? { ...l, rel: "prefetch", as: "style" } : { ...l, rel: "prefetch" }));
}
function c1(t7, r2, o, a, l, s) {
  let u2 = (d, m) => o[m] ? d.route.id !== o[m].route.id : true, f = (d, m) => o[m].pathname !== d.pathname || o[m].route.path?.endsWith("*") && o[m].params["*"] !== d.params["*"];
  return s === "assets" ? r2.filter((d, m) => u2(d, m) || f(d, m)) : s === "data" ? r2.filter((d, m) => {
    let v = a.routes[d.route.id];
    if (!v || !v.hasLoader) return false;
    if (u2(d, m) || f(d, m)) return true;
    if (d.route.shouldRevalidate) {
      let g = d.route.shouldRevalidate({ currentUrl: new URL(l.pathname + l.search + l.hash, window.origin), currentParams: o[0]?.params || {}, nextUrl: new URL(t7, window.origin), nextParams: d.params, defaultShouldRevalidate: true });
      if (typeof g == "boolean") return g;
    }
    return true;
  }) : [];
}
function wS(t7, r2, { includeHydrateFallback: o } = {}) {
  return xS(t7.map((a) => {
    let l = r2.routes[a.route.id];
    if (!l) return [];
    let s = [l.module];
    return l.clientActionModule && (s = s.concat(l.clientActionModule)), l.clientLoaderModule && (s = s.concat(l.clientLoaderModule)), o && l.hydrateFallbackModule && (s = s.concat(l.hydrateFallbackModule)), l.imports && (s = s.concat(l.imports)), s;
  }).flat(1));
}
function xS(t7) {
  return [...new Set(t7)];
}
function SS(t7) {
  let r2 = {}, o = Object.keys(t7).sort();
  for (let a of o) r2[a] = t7[a];
  return r2;
}
function CS(t7, r2) {
  let o = /* @__PURE__ */ new Set();
  return new Set(r2), t7.reduce((a, l) => {
    let s = JSON.stringify(SS(l));
    return o.has(s) || (o.add(s), a.push({ key: s, link: l })), a;
  }, []);
}
function gf() {
  let t7 = p.useContext(ho);
  return vf(t7, "You must render this element inside a <DataRouterContext.Provider> element"), t7;
}
function kS() {
  let t7 = p.useContext(Tl);
  return vf(t7, "You must render this element inside a <DataRouterStateContext.Provider> element"), t7;
}
var wf = p.createContext(void 0);
wf.displayName = "FrameworkContext";
function Al() {
  let t7 = p.useContext(wf);
  return vf(t7, "You must render this element inside a <HydratedRouter> element"), t7;
}
function ES(t7, r2) {
  let o = p.useContext(wf), [a, l] = p.useState(false), [s, u2] = p.useState(false), { onFocus: f, onBlur: d, onMouseEnter: m, onMouseLeave: v, onTouchStart: g } = r2, w = p.useRef(null);
  p.useEffect(() => {
    if (t7 === "render" && u2(true), t7 === "viewport") {
      let C = (R) => {
        R.forEach((b) => {
          u2(b.isIntersecting);
        });
      }, x = new IntersectionObserver(C, { threshold: 0.5 });
      return w.current && x.observe(w.current), () => {
        x.disconnect();
      };
    }
  }, [t7]), p.useEffect(() => {
    if (a) {
      let C = setTimeout(() => {
        u2(true);
      }, 100);
      return () => {
        clearTimeout(C);
      };
    }
  }, [a]);
  let k = () => {
    l(true);
  }, P = () => {
    l(false), u2(false);
  };
  return o ? t7 !== "intent" ? [s, w, {}] : [s, w, { onFocus: sa(f, k), onBlur: sa(d, P), onMouseEnter: sa(m, k), onMouseLeave: sa(v, P), onTouchStart: sa(g, k) }] : [false, w, {}];
}
function sa(t7, r2) {
  return (o) => {
    t7 && t7(o), o.defaultPrevented || r2(o);
  };
}
function RS({ page: t7, ...r2 }) {
  let o = jx(), { nonce: a } = Al(), { router: l } = gf(), s = p.useMemo(() => mm(l.routes, t7, l.basename), [l.routes, t7, l.basename]);
  return s ? (r2.nonce == null && a && (r2 = { ...r2, nonce: a }), o ? p.createElement(bS, { page: t7, matches: s, ...r2 }) : p.createElement(TS, { page: t7, matches: s, ...r2 })) : null;
}
function PS(t7) {
  let { manifest: r2, routeModules: o } = Al(), [a, l] = p.useState([]);
  return p.useEffect(() => {
    let s = false;
    return gS(t7, r2, o).then((u2) => {
      s || l(u2);
    }), () => {
      s = true;
    };
  }, [t7, r2, o]), a;
}
function bS({ page: t7, matches: r2, ...o }) {
  let a = Zt(), { future: l } = Al(), { basename: s } = gf(), u2 = p.useMemo(() => {
    if (t7 === a.pathname + a.search + a.hash) return [];
    let f = Om(t7, s, l.v8_trailingSlashAwareDataRequests, "rsc"), d = false, m = [];
    for (let v of r2) typeof v.route.shouldRevalidate == "function" ? d = true : m.push(v.route.id);
    return d && m.length > 0 && f.searchParams.set("_routes", m.join(",")), [f.pathname + f.search];
  }, [s, l.v8_trailingSlashAwareDataRequests, t7, a, r2]);
  return p.createElement(p.Fragment, null, u2.map((f) => p.createElement("link", { key: f, rel: "prefetch", as: "fetch", href: f, ...o })));
}
function TS({ page: t7, matches: r2, ...o }) {
  let a = Zt(), { future: l, manifest: s, routeModules: u2 } = Al(), { basename: f } = gf(), { loaderData: d, matches: m } = kS(), v = p.useMemo(() => c1(t7, r2, m, s, a, "data"), [t7, r2, m, s, a]), g = p.useMemo(() => c1(t7, r2, m, s, a, "assets"), [t7, r2, m, s, a]), w = p.useMemo(() => {
    if (t7 === a.pathname + a.search + a.hash) return [];
    let C = /* @__PURE__ */ new Set(), x = false;
    if (r2.forEach((b) => {
      let M = s.routes[b.route.id];
      !M || !M.hasLoader || (!v.some((N) => N.route.id === b.route.id) && b.route.id in d && u2[b.route.id]?.shouldRevalidate || M.hasClientLoader ? x = true : C.add(b.route.id));
    }), C.size === 0) return [];
    let R = Om(t7, f, l.v8_trailingSlashAwareDataRequests, "data");
    return x && C.size > 0 && R.searchParams.set("_routes", r2.filter((b) => C.has(b.route.id)).map((b) => b.route.id).join(",")), [R.pathname + R.search];
  }, [f, l.v8_trailingSlashAwareDataRequests, d, a, s, v, r2, t7, u2]), k = p.useMemo(() => wS(g, s), [g, s]), P = PS(g);
  return p.createElement(p.Fragment, null, w.map((C) => p.createElement("link", { key: C, rel: "prefetch", as: "fetch", href: C, ...o })), k.map((C) => p.createElement("link", { key: C, rel: "modulepreload", href: C, ...o })), P.map(({ key: C, link: x }) => p.createElement("link", { key: C, nonce: o.nonce, ...x, crossOrigin: x.crossOrigin ?? o.crossOrigin })));
}
function MS(...t7) {
  return (r2) => {
    t7.forEach((o) => {
      typeof o == "function" ? o(r2) : o != null && (o.current = r2);
    });
  };
}
var AS = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
try {
  AS && (window.__reactRouterVersion = "7.18.1");
} catch {
}
var Nm = p.forwardRef(function({ onClick: r2, discover: o = "render", prefetch: a = "none", relative: l, reloadDocument: s, replace: u2, mask: f, state: d, target: m, to: v, preventScrollReset: g, viewTransition: w, defaultShouldRevalidate: k, ...P }, C) {
  let { basename: x, navigator: R, useTransitions: b } = p.useContext(bt), M = typeof v == "string" && ff.test(v), N = Cm(v, x);
  v = N.to;
  let j = Ux(v, { relative: l }), B = Zt(), z = null;
  if (f) {
    let ye = bl(f, [], B.mask ? B.mask.pathname : "/", true);
    x !== "/" && (ye.pathname = ye.pathname === "/" ? x : Gt([x, ye.pathname])), z = R.createHref(ye);
  }
  let [Q, Z, J] = ES(a, P), ee = IS(v, { replace: u2, mask: f, state: d, target: m, preventScrollReset: g, relative: l, viewTransition: w, defaultShouldRevalidate: k, useTransitions: b });
  function ce(ye) {
    r2 && r2(ye), ye.defaultPrevented || ee(ye);
  }
  let fe = !(N.isExternal || s), de = p.createElement("a", { ...P, ...J, href: (fe ? z : void 0) || N.absoluteURL || j, onClick: fe ? ce : r2, ref: MS(C, Z), target: m, "data-discover": !M && o === "render" ? "true" : void 0 });
  return Q && !M ? p.createElement(p.Fragment, null, de, p.createElement(RS, { page: j })) : de;
});
Nm.displayName = "Link";
var _S = p.forwardRef(function({ "aria-current": r2 = "page", caseSensitive: o = false, className: a = "", end: l = false, style: s, to: u2, viewTransition: f, children: d, ...m }, v) {
  let g = Pa(u2, { relative: m.relative }), w = Zt(), k = p.useContext(Tl), { navigator: P, basename: C } = p.useContext(bt), x = k != null && $S(g) && f === true, R = P.encodeLocation ? P.encodeLocation(g).pathname : g.pathname, b = w.pathname, M = k && k.navigation && k.navigation.location ? k.navigation.location.pathname : null;
  o || (b = b.toLowerCase(), M = M ? M.toLowerCase() : null, R = R.toLowerCase()), M && C && (M = Cn(M, C) || M);
  const N = R !== "/" && R.endsWith("/") ? R.length - 1 : R.length;
  let j = b === R || !l && b.startsWith(R) && b.charAt(N) === "/", B = M != null && (M === R || !l && M.startsWith(R) && M.charAt(R.length) === "/"), z = { isActive: j, isPending: B, isTransitioning: x }, Q = j ? r2 : void 0, Z;
  typeof a == "function" ? Z = a(z) : Z = [a, j ? "active" : null, B ? "pending" : null, x ? "transitioning" : null].filter(Boolean).join(" ");
  let J = typeof s == "function" ? s(z) : s;
  return p.createElement(Nm, { ...m, "aria-current": Q, className: Z, ref: v, style: J, to: u2, viewTransition: f }, typeof d == "function" ? d(z) : d);
});
_S.displayName = "NavLink";
var OS = p.forwardRef(({ discover: t7 = "render", fetcherKey: r2, navigate: o, reloadDocument: a, replace: l, state: s, method: u2 = tl, action: f, onSubmit: d, relative: m, preventScrollReset: v, viewTransition: g, defaultShouldRevalidate: w, ...k }, P) => {
  let { useTransitions: C } = p.useContext(bt), x = jS(), R = FS(f, { relative: m }), b = u2.toLowerCase() === "get" ? "get" : "post", M = typeof f == "string" && ff.test(f), N = (j) => {
    if (d && d(j), j.defaultPrevented) return;
    j.preventDefault();
    let B = j.nativeEvent.submitter, z = B?.getAttribute("formmethod") || u2, Q = () => x(B || j.currentTarget, { fetcherKey: r2, method: z, navigate: o, replace: l, state: s, relative: m, preventScrollReset: v, viewTransition: g, defaultShouldRevalidate: w });
    C && o !== false ? p.startTransition(() => Q()) : Q();
  };
  return p.createElement("form", { ref: P, method: b, action: R, onSubmit: a ? d : N, ...k, "data-discover": !M && t7 === "render" ? "true" : void 0 });
});
OS.displayName = "Form";
function NS(t7) {
  return `${t7} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function Im(t7) {
  let r2 = p.useContext(ho);
  return Fe(r2, NS(t7)), r2;
}
function IS(t7, { target: r2, replace: o, mask: a, state: l, preventScrollReset: s, relative: u2, viewTransition: f, defaultShouldRevalidate: d, useTransitions: m } = {}) {
  let v = hf(), g = Zt(), w = Pa(t7, { relative: u2 });
  return p.useCallback((k) => {
    if (fS(k, r2)) {
      k.preventDefault();
      let P = o !== void 0 ? o : va(g) === va(w), C = () => v(t7, { replace: P, mask: a, state: l, preventScrollReset: s, relative: u2, viewTransition: f, defaultShouldRevalidate: d });
      m ? p.startTransition(() => C()) : C();
    }
  }, [g, v, w, o, a, l, r2, t7, s, u2, f, d, m]);
}
var DS = 0;
var LS = () => `__${String(++DS)}__`;
function jS() {
  let { router: t7 } = Im("useSubmit"), { basename: r2 } = p.useContext(bt), o = tS(), a = t7.fetch, l = t7.navigate;
  return p.useCallback(async (s, u2 = {}) => {
    let { action: f, method: d, encType: m, formData: v, body: g } = mS(s, r2);
    if (u2.navigate === false) {
      let w = u2.fetcherKey || LS();
      await a(w, o, u2.action || f, { defaultShouldRevalidate: u2.defaultShouldRevalidate, preventScrollReset: u2.preventScrollReset, formData: v, body: g, formMethod: u2.method || d, formEncType: u2.encType || m, flushSync: u2.flushSync });
    } else await l(u2.action || f, { defaultShouldRevalidate: u2.defaultShouldRevalidate, preventScrollReset: u2.preventScrollReset, formData: v, body: g, formMethod: u2.method || d, formEncType: u2.encType || m, replace: u2.replace, state: u2.state, fromRouteId: o, flushSync: u2.flushSync, viewTransition: u2.viewTransition });
  }, [a, l, r2, o]);
}
function FS(t7, { relative: r2 } = {}) {
  let { basename: o } = p.useContext(bt), a = p.useContext(Qt);
  Fe(a, "useFormAction must be used inside a RouteContext");
  let [l] = a.matches.slice(-1), s = { ...Pa(t7 || ".", { relative: r2 }) }, u2 = Zt();
  if (t7 == null) {
    s.search = u2.search;
    let f = new URLSearchParams(s.search), d = f.getAll("index");
    if (d.some((v) => v === "")) {
      f.delete("index"), d.filter((g) => g).forEach((g) => f.append("index", g));
      let v = f.toString();
      s.search = v ? `?${v}` : "";
    }
  }
  return (!t7 || t7 === ".") && l.route.index && (s.search = s.search ? s.search.replace(/^\?/, "?index&") : "?index"), o !== "/" && (s.pathname = s.pathname === "/" ? o : Gt([o, s.pathname])), va(s);
}
function $S(t7, { relative: r2 } = {}) {
  let o = p.useContext(Rm);
  Fe(o != null, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
  let { basename: a } = Im("useViewTransitionState"), l = Pa(t7, { relative: r2 });
  if (!o.isTransitioning) return false;
  let s = Cn(o.currentLocation.pathname, a) || o.currentLocation.pathname, u2 = Cn(o.nextLocation.pathname, a) || o.nextLocation.pathname;
  return il(l.pathname, u2) != null || il(l.pathname, s) != null;
}
var ba = pm();
var zS = Sr(ba);
function u1(t7, r2) {
  if (typeof t7 == "function") return t7(r2);
  t7 != null && (t7.current = r2);
}
function un(...t7) {
  return (r2) => {
    let o = false;
    const a = t7.map((l) => {
      const s = u1(l, r2);
      return !o && typeof s == "function" && (o = true), s;
    });
    if (o) return () => {
      for (let l = 0; l < a.length; l++) {
        const s = a[l];
        typeof s == "function" ? s() : u1(t7[l], null);
      }
    };
  };
}
function ve(...t7) {
  return p.useCallback(un(...t7), t7);
}
function HS(t7, r2) {
  const o = p.createContext(r2), a = (s) => {
    const { children: u2, ...f } = s, d = p.useMemo(() => f, Object.values(f));
    return E.jsx(o.Provider, { value: d, children: u2 });
  };
  a.displayName = t7 + "Provider";
  function l(s) {
    const u2 = p.useContext(o);
    if (u2) return u2;
    if (r2 !== void 0) return r2;
    throw new Error(`\`${s}\` must be used within \`${t7}\``);
  }
  return [a, l];
}
function ot(t7, r2 = []) {
  let o = [];
  function a(s, u2) {
    const f = p.createContext(u2), d = o.length;
    o = [...o, u2];
    const m = (g) => {
      const { scope: w, children: k, ...P } = g, C = w?.[t7]?.[d] || f, x = p.useMemo(() => P, Object.values(P));
      return E.jsx(C.Provider, { value: x, children: k });
    };
    m.displayName = s + "Provider";
    function v(g, w) {
      const k = w?.[t7]?.[d] || f, P = p.useContext(k);
      if (P) return P;
      if (u2 !== void 0) return u2;
      throw new Error(`\`${g}\` must be used within \`${s}\``);
    }
    return [m, v];
  }
  const l = () => {
    const s = o.map((u2) => p.createContext(u2));
    return function(f) {
      const d = f?.[t7] || s;
      return p.useMemo(() => ({ [`__scope${t7}`]: { ...f, [t7]: d } }), [f, d]);
    };
  };
  return l.scopeName = t7, [a, BS(l, ...r2)];
}
function BS(...t7) {
  const r2 = t7[0];
  if (t7.length === 1) return r2;
  const o = () => {
    const a = t7.map((l) => ({ useScope: l(), scopeName: l.scopeName }));
    return function(s) {
      const u2 = a.reduce((f, { useScope: d, scopeName: m }) => {
        const g = d(s)[`__scope${m}`];
        return { ...f, ...g };
      }, {});
      return p.useMemo(() => ({ [`__scope${r2.scopeName}`]: u2 }), [u2]);
    };
  };
  return o.scopeName = r2.scopeName, o;
}
var Ze = globalThis?.document ? p.useLayoutEffect : () => {
};
var VS = uf[" useId ".trim().toString()] || (() => {
});
var US = 0;
function wt(t7) {
  const [r2, o] = p.useState(VS());
  return Ze(() => {
    o((a) => a ?? String(US++));
  }, [t7]), r2 ? `radix-${r2}` : "";
}
var WS = uf[" useInsertionEffect ".trim().toString()] || Ze;
function xt({ prop: t7, defaultProp: r2, onChange: o = () => {
}, caller: a }) {
  const [l, s, u2] = qS({ defaultProp: r2, onChange: o }), f = t7 !== void 0, d = f ? t7 : l;
  {
    const v = p.useRef(t7 !== void 0);
    p.useEffect(() => {
      const g = v.current;
      g !== f && console.warn(`${a} is changing from ${g ? "controlled" : "uncontrolled"} to ${f ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`), v.current = f;
    }, [f, a]);
  }
  const m = p.useCallback((v) => {
    if (f) {
      const g = KS(v) ? v(t7) : v;
      g !== t7 && u2.current?.(g);
    } else s(v);
  }, [f, t7, s, u2]);
  return [d, m];
}
function qS({ defaultProp: t7, onChange: r2 }) {
  const [o, a] = p.useState(t7), l = p.useRef(o), s = p.useRef(r2);
  return WS(() => {
    s.current = r2;
  }, [r2]), p.useEffect(() => {
    l.current !== o && (s.current?.(o), l.current = o);
  }, [o, l]), [o, a, s];
}
function KS(t7) {
  return typeof t7 == "function";
}
function GS(t7) {
  const r2 = YS(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(QS);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function YS(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = JS(l), f = ZS(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var XS = /* @__PURE__ */ Symbol("radix.slottable");
function QS(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === XS;
}
function ZS(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function JS(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
var eC = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"];
var le = eC.reduce((t7, r2) => {
  const o = GS(`Primitive.${r2}`), a = p.forwardRef((l, s) => {
    const { asChild: u2, ...f } = l, d = u2 ? o : r2;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = true), E.jsx(d, { ...f, ref: s });
  });
  return a.displayName = `Primitive.${r2}`, { ...t7, [r2]: a };
}, {});
function Dm(t7, r2) {
  t7 && ba.flushSync(() => t7.dispatchEvent(r2));
}
function rt(t7) {
  const r2 = p.useRef(t7);
  return p.useEffect(() => {
    r2.current = t7;
  }), p.useMemo(() => (...o) => r2.current?.(...o), []);
}
function tC(t7, r2 = globalThis?.document) {
  const o = rt(t7);
  p.useEffect(() => {
    const a = (l) => {
      l.key === "Escape" && o(l);
    };
    return r2.addEventListener("keydown", a, { capture: true }), () => r2.removeEventListener("keydown", a, { capture: true });
  }, [o, r2]);
}
var nC = "DismissableLayer";
var Nu = "dismissableLayer.update";
var rC = "dismissableLayer.pointerDownOutside";
var oC = "dismissableLayer.focusOutside";
var f1;
var Lm = p.createContext({ layers: /* @__PURE__ */ new Set(), layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(), branches: /* @__PURE__ */ new Set() });
var yo = p.forwardRef((t7, r2) => {
  const { disableOutsidePointerEvents: o = false, onEscapeKeyDown: a, onPointerDownOutside: l, onFocusOutside: s, onInteractOutside: u2, onDismiss: f, ...d } = t7, m = p.useContext(Lm), [v, g] = p.useState(null), w = v?.ownerDocument ?? globalThis?.document, [, k] = p.useState({}), P = ve(r2, (z) => g(z)), C = Array.from(m.layers), [x] = [...m.layersWithOutsidePointerEventsDisabled].slice(-1), R = C.indexOf(x), b = v ? C.indexOf(v) : -1, M = m.layersWithOutsidePointerEventsDisabled.size > 0, N = b >= R, j = lC((z) => {
    const Q = z.target, Z = [...m.branches].some((J) => J.contains(Q));
    !N || Z || (l?.(z), u2?.(z), z.defaultPrevented || f?.());
  }, w), B = sC((z) => {
    const Q = z.target;
    [...m.branches].some((J) => J.contains(Q)) || (s?.(z), u2?.(z), z.defaultPrevented || f?.());
  }, w);
  return tC((z) => {
    b === m.layers.size - 1 && (a?.(z), !z.defaultPrevented && f && (z.preventDefault(), f()));
  }, w), p.useEffect(() => {
    if (v) return o && (m.layersWithOutsidePointerEventsDisabled.size === 0 && (f1 = w.body.style.pointerEvents, w.body.style.pointerEvents = "none"), m.layersWithOutsidePointerEventsDisabled.add(v)), m.layers.add(v), d1(), () => {
      o && m.layersWithOutsidePointerEventsDisabled.size === 1 && (w.body.style.pointerEvents = f1);
    };
  }, [v, w, o, m]), p.useEffect(() => () => {
    v && (m.layers.delete(v), m.layersWithOutsidePointerEventsDisabled.delete(v), d1());
  }, [v, m]), p.useEffect(() => {
    const z = () => k({});
    return document.addEventListener(Nu, z), () => document.removeEventListener(Nu, z);
  }, []), E.jsx(le.div, { ...d, ref: P, style: { pointerEvents: M ? N ? "auto" : "none" : void 0, ...t7.style }, onFocusCapture: u(t7.onFocusCapture, B.onFocusCapture), onBlurCapture: u(t7.onBlurCapture, B.onBlurCapture), onPointerDownCapture: u(t7.onPointerDownCapture, j.onPointerDownCapture) });
});
yo.displayName = nC;
var aC = "DismissableLayerBranch";
var iC = p.forwardRef((t7, r2) => {
  const o = p.useContext(Lm), a = p.useRef(null), l = ve(r2, a);
  return p.useEffect(() => {
    const s = a.current;
    if (s) return o.branches.add(s), () => {
      o.branches.delete(s);
    };
  }, [o.branches]), E.jsx(le.div, { ...t7, ref: l });
});
iC.displayName = aC;
function lC(t7, r2 = globalThis?.document) {
  const o = rt(t7), a = p.useRef(false), l = p.useRef(() => {
  });
  return p.useEffect(() => {
    const s = (f) => {
      if (f.target && !a.current) {
        let d = function() {
          jm(rC, o, m, { discrete: true });
        };
        const m = { originalEvent: f };
        f.pointerType === "touch" ? (r2.removeEventListener("click", l.current), l.current = d, r2.addEventListener("click", l.current, { once: true })) : d();
      } else r2.removeEventListener("click", l.current);
      a.current = false;
    }, u2 = window.setTimeout(() => {
      r2.addEventListener("pointerdown", s);
    }, 0);
    return () => {
      window.clearTimeout(u2), r2.removeEventListener("pointerdown", s), r2.removeEventListener("click", l.current);
    };
  }, [r2, o]), { onPointerDownCapture: () => a.current = true };
}
function sC(t7, r2 = globalThis?.document) {
  const o = rt(t7), a = p.useRef(false);
  return p.useEffect(() => {
    const l = (s) => {
      s.target && !a.current && jm(oC, o, { originalEvent: s }, { discrete: false });
    };
    return r2.addEventListener("focusin", l), () => r2.removeEventListener("focusin", l);
  }, [r2, o]), { onFocusCapture: () => a.current = true, onBlurCapture: () => a.current = false };
}
function d1() {
  const t7 = new CustomEvent(Nu);
  document.dispatchEvent(t7);
}
function jm(t7, r2, o, { discrete: a }) {
  const l = o.originalEvent.target, s = new CustomEvent(t7, { bubbles: false, cancelable: true, detail: o });
  r2 && l.addEventListener(t7, r2, { once: true }), a ? Dm(l, s) : l.dispatchEvent(s);
}
var cu = "focusScope.autoFocusOnMount";
var uu = "focusScope.autoFocusOnUnmount";
var p1 = { bubbles: false, cancelable: true };
var cC = "FocusScope";
var Ta = p.forwardRef((t7, r2) => {
  const { loop: o = false, trapped: a = false, onMountAutoFocus: l, onUnmountAutoFocus: s, ...u2 } = t7, [f, d] = p.useState(null), m = rt(l), v = rt(s), g = p.useRef(null), w = ve(r2, (C) => d(C)), k = p.useRef({ paused: false, pause() {
    this.paused = true;
  }, resume() {
    this.paused = false;
  } }).current;
  p.useEffect(() => {
    if (a) {
      let C = function(M) {
        if (k.paused || !f) return;
        const N = M.target;
        f.contains(N) ? g.current = N : qn(g.current, { select: true });
      }, x = function(M) {
        if (k.paused || !f) return;
        const N = M.relatedTarget;
        N !== null && (f.contains(N) || qn(g.current, { select: true }));
      }, R = function(M) {
        if (document.activeElement === document.body) for (const j of M) j.removedNodes.length > 0 && qn(f);
      };
      document.addEventListener("focusin", C), document.addEventListener("focusout", x);
      const b = new MutationObserver(R);
      return f && b.observe(f, { childList: true, subtree: true }), () => {
        document.removeEventListener("focusin", C), document.removeEventListener("focusout", x), b.disconnect();
      };
    }
  }, [a, f, k.paused]), p.useEffect(() => {
    if (f) {
      m1.add(k);
      const C = document.activeElement;
      if (!f.contains(C)) {
        const R = new CustomEvent(cu, p1);
        f.addEventListener(cu, m), f.dispatchEvent(R), R.defaultPrevented || (uC(mC(Fm(f)), { select: true }), document.activeElement === C && qn(f));
      }
      return () => {
        f.removeEventListener(cu, m), setTimeout(() => {
          const R = new CustomEvent(uu, p1);
          f.addEventListener(uu, v), f.dispatchEvent(R), R.defaultPrevented || qn(C ?? document.body, { select: true }), f.removeEventListener(uu, v), m1.remove(k);
        }, 0);
      };
    }
  }, [f, m, v, k]);
  const P = p.useCallback((C) => {
    if (!o && !a || k.paused) return;
    const x = C.key === "Tab" && !C.altKey && !C.ctrlKey && !C.metaKey, R = document.activeElement;
    if (x && R) {
      const b = C.currentTarget, [M, N] = fC(b);
      M && N ? !C.shiftKey && R === N ? (C.preventDefault(), o && qn(M, { select: true })) : C.shiftKey && R === M && (C.preventDefault(), o && qn(N, { select: true })) : R === b && C.preventDefault();
    }
  }, [o, a, k.paused]);
  return E.jsx(le.div, { tabIndex: -1, ...u2, ref: w, onKeyDown: P });
});
Ta.displayName = cC;
function uC(t7, { select: r2 = false } = {}) {
  const o = document.activeElement;
  for (const a of t7) if (qn(a, { select: r2 }), document.activeElement !== o) return;
}
function fC(t7) {
  const r2 = Fm(t7), o = h1(r2, t7), a = h1(r2.reverse(), t7);
  return [o, a];
}
function Fm(t7) {
  const r2 = [], o = document.createTreeWalker(t7, NodeFilter.SHOW_ELEMENT, { acceptNode: (a) => {
    const l = a.tagName === "INPUT" && a.type === "hidden";
    return a.disabled || a.hidden || l ? NodeFilter.FILTER_SKIP : a.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  } });
  for (; o.nextNode(); ) r2.push(o.currentNode);
  return r2;
}
function h1(t7, r2) {
  for (const o of t7) if (!dC(o, { upTo: r2 })) return o;
}
function dC(t7, { upTo: r2 }) {
  if (getComputedStyle(t7).visibility === "hidden") return true;
  for (; t7; ) {
    if (r2 !== void 0 && t7 === r2) return false;
    if (getComputedStyle(t7).display === "none") return true;
    t7 = t7.parentElement;
  }
  return false;
}
function pC(t7) {
  return t7 instanceof HTMLInputElement && "select" in t7;
}
function qn(t7, { select: r2 = false } = {}) {
  if (t7 && t7.focus) {
    const o = document.activeElement;
    t7.focus({ preventScroll: true }), t7 !== o && pC(t7) && r2 && t7.select();
  }
}
var m1 = hC();
function hC() {
  let t7 = [];
  return { add(r2) {
    const o = t7[0];
    r2 !== o && o?.pause(), t7 = y1(t7, r2), t7.unshift(r2);
  }, remove(r2) {
    t7 = y1(t7, r2), t7[0]?.resume();
  } };
}
function y1(t7, r2) {
  const o = [...t7], a = o.indexOf(r2);
  return a !== -1 && o.splice(a, 1), o;
}
function mC(t7) {
  return t7.filter((r2) => r2.tagName !== "A");
}
var yC = "Portal";
var vo = p.forwardRef((t7, r2) => {
  const { container: o, ...a } = t7, [l, s] = p.useState(false);
  Ze(() => s(true), []);
  const u2 = o || l && globalThis?.document?.body;
  return u2 ? zS.createPortal(E.jsx(le.div, { ...a, ref: r2 }), u2) : null;
});
vo.displayName = yC;
function vC(t7, r2) {
  return p.useReducer((o, a) => r2[o][a] ?? o, t7);
}
var Ge = (t7) => {
  const { present: r2, children: o } = t7, a = gC(r2), l = typeof o == "function" ? o({ present: a.isPresent }) : p.Children.only(o), s = ve(a.ref, wC(l));
  return typeof o == "function" || a.isPresent ? p.cloneElement(l, { ref: s }) : null;
};
Ge.displayName = "Presence";
function gC(t7) {
  const [r2, o] = p.useState(), a = p.useRef(null), l = p.useRef(t7), s = p.useRef("none"), u2 = t7 ? "mounted" : "unmounted", [f, d] = vC(u2, { mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" }, unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" }, unmounted: { MOUNT: "mounted" } });
  return p.useEffect(() => {
    const m = Gi(a.current);
    s.current = f === "mounted" ? m : "none";
  }, [f]), Ze(() => {
    const m = a.current, v = l.current;
    if (v !== t7) {
      const w = s.current, k = Gi(m);
      t7 ? d("MOUNT") : k === "none" || m?.display === "none" ? d("UNMOUNT") : d(v && w !== k ? "ANIMATION_OUT" : "UNMOUNT"), l.current = t7;
    }
  }, [t7, d]), Ze(() => {
    if (r2) {
      let m;
      const v = r2.ownerDocument.defaultView ?? window, g = (k) => {
        const C = Gi(a.current).includes(CSS.escape(k.animationName));
        if (k.target === r2 && C && (d("ANIMATION_END"), !l.current)) {
          const x = r2.style.animationFillMode;
          r2.style.animationFillMode = "forwards", m = v.setTimeout(() => {
            r2.style.animationFillMode === "forwards" && (r2.style.animationFillMode = x);
          });
        }
      }, w = (k) => {
        k.target === r2 && (s.current = Gi(a.current));
      };
      return r2.addEventListener("animationstart", w), r2.addEventListener("animationcancel", g), r2.addEventListener("animationend", g), () => {
        v.clearTimeout(m), r2.removeEventListener("animationstart", w), r2.removeEventListener("animationcancel", g), r2.removeEventListener("animationend", g);
      };
    } else d("ANIMATION_END");
  }, [r2, d]), { isPresent: ["mounted", "unmountSuspended"].includes(f), ref: p.useCallback((m) => {
    a.current = m ? getComputedStyle(m) : null, o(m);
  }, []) };
}
function Gi(t7) {
  return t7?.animationName || "none";
}
function wC(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
var fu = 0;
function _l() {
  p.useEffect(() => {
    const t7 = document.querySelectorAll("[data-radix-focus-guard]");
    return document.body.insertAdjacentElement("afterbegin", t7[0] ?? v1()), document.body.insertAdjacentElement("beforeend", t7[1] ?? v1()), fu++, () => {
      fu === 1 && document.querySelectorAll("[data-radix-focus-guard]").forEach((r2) => r2.remove()), fu--;
    };
  }, []);
}
function v1() {
  const t7 = document.createElement("span");
  return t7.setAttribute("data-radix-focus-guard", ""), t7.tabIndex = 0, t7.style.outline = "none", t7.style.opacity = "0", t7.style.position = "fixed", t7.style.pointerEvents = "none", t7;
}
var ln = function() {
  return ln = Object.assign || function(r2) {
    for (var o, a = 1, l = arguments.length; a < l; a++) {
      o = arguments[a];
      for (var s in o) Object.prototype.hasOwnProperty.call(o, s) && (r2[s] = o[s]);
    }
    return r2;
  }, ln.apply(this, arguments);
};
function $m(t7, r2) {
  var o = {};
  for (var a in t7) Object.prototype.hasOwnProperty.call(t7, a) && r2.indexOf(a) < 0 && (o[a] = t7[a]);
  if (t7 != null && typeof Object.getOwnPropertySymbols == "function") for (var l = 0, a = Object.getOwnPropertySymbols(t7); l < a.length; l++) r2.indexOf(a[l]) < 0 && Object.prototype.propertyIsEnumerable.call(t7, a[l]) && (o[a[l]] = t7[a[l]]);
  return o;
}
function xC(t7, r2, o) {
  if (o || arguments.length === 2) for (var a = 0, l = r2.length, s; a < l; a++) (s || !(a in r2)) && (s || (s = Array.prototype.slice.call(r2, 0, a)), s[a] = r2[a]);
  return t7.concat(s || Array.prototype.slice.call(r2));
}
var rl = "right-scroll-bar-position";
var ol = "width-before-scroll-bar";
var SC = "with-scroll-bars-hidden";
var CC = "--removed-body-scroll-bar-size";
function du(t7, r2) {
  return typeof t7 == "function" ? t7(r2) : t7 && (t7.current = r2), t7;
}
function kC(t7, r2) {
  var o = p.useState(function() {
    return { value: t7, callback: r2, facade: { get current() {
      return o.value;
    }, set current(a) {
      var l = o.value;
      l !== a && (o.value = a, o.callback(a, l));
    } } };
  })[0];
  return o.callback = r2, o.facade;
}
var EC = typeof window < "u" ? p.useLayoutEffect : p.useEffect;
var g1 = /* @__PURE__ */ new WeakMap();
function RC(t7, r2) {
  var o = kC(null, function(a) {
    return t7.forEach(function(l) {
      return du(l, a);
    });
  });
  return EC(function() {
    var a = g1.get(o);
    if (a) {
      var l = new Set(a), s = new Set(t7), u2 = o.current;
      l.forEach(function(f) {
        s.has(f) || du(f, null);
      }), s.forEach(function(f) {
        l.has(f) || du(f, u2);
      });
    }
    g1.set(o, t7);
  }, [t7]), o;
}
function PC(t7) {
  return t7;
}
function bC(t7, r2) {
  r2 === void 0 && (r2 = PC);
  var o = [], a = false, l = { read: function() {
    if (a) throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
    return o.length ? o[o.length - 1] : t7;
  }, useMedium: function(s) {
    var u2 = r2(s, a);
    return o.push(u2), function() {
      o = o.filter(function(f) {
        return f !== u2;
      });
    };
  }, assignSyncMedium: function(s) {
    for (a = true; o.length; ) {
      var u2 = o;
      o = [], u2.forEach(s);
    }
    o = { push: function(f) {
      return s(f);
    }, filter: function() {
      return o;
    } };
  }, assignMedium: function(s) {
    a = true;
    var u2 = [];
    if (o.length) {
      var f = o;
      o = [], f.forEach(s), u2 = o;
    }
    var d = function() {
      var v = u2;
      u2 = [], v.forEach(s);
    }, m = function() {
      return Promise.resolve().then(d);
    };
    m(), o = { push: function(v) {
      u2.push(v), m();
    }, filter: function(v) {
      return u2 = u2.filter(v), o;
    } };
  } };
  return l;
}
function TC(t7) {
  t7 === void 0 && (t7 = {});
  var r2 = bC(null);
  return r2.options = ln({ async: true, ssr: false }, t7), r2;
}
var zm = function(t7) {
  var r2 = t7.sideCar, o = $m(t7, ["sideCar"]);
  if (!r2) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var a = r2.read();
  if (!a) throw new Error("Sidecar medium not found");
  return p.createElement(a, ln({}, o));
};
zm.isSideCarExport = true;
function MC(t7, r2) {
  return t7.useMedium(r2), zm;
}
var Hm = TC();
var pu = function() {
};
var Ol = p.forwardRef(function(t7, r2) {
  var o = p.useRef(null), a = p.useState({ onScrollCapture: pu, onWheelCapture: pu, onTouchMoveCapture: pu }), l = a[0], s = a[1], u2 = t7.forwardProps, f = t7.children, d = t7.className, m = t7.removeScrollBar, v = t7.enabled, g = t7.shards, w = t7.sideCar, k = t7.noRelative, P = t7.noIsolation, C = t7.inert, x = t7.allowPinchZoom, R = t7.as, b = R === void 0 ? "div" : R, M = t7.gapMode, N = $m(t7, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]), j = w, B = RC([o, r2]), z = ln(ln({}, N), l);
  return p.createElement(p.Fragment, null, v && p.createElement(j, { sideCar: Hm, removeScrollBar: m, shards: g, noRelative: k, noIsolation: P, inert: C, setCallbacks: s, allowPinchZoom: !!x, lockRef: o, gapMode: M }), u2 ? p.cloneElement(p.Children.only(f), ln(ln({}, z), { ref: B })) : p.createElement(b, ln({}, z, { className: d, ref: B }), f));
});
Ol.defaultProps = { enabled: true, removeScrollBar: true, inert: false };
Ol.classNames = { fullWidth: ol, zeroRight: rl };
var AC = function() {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function _C() {
  if (!document) return null;
  var t7 = document.createElement("style");
  t7.type = "text/css";
  var r2 = AC();
  return r2 && t7.setAttribute("nonce", r2), t7;
}
function OC(t7, r2) {
  t7.styleSheet ? t7.styleSheet.cssText = r2 : t7.appendChild(document.createTextNode(r2));
}
function NC(t7) {
  var r2 = document.head || document.getElementsByTagName("head")[0];
  r2.appendChild(t7);
}
var IC = function() {
  var t7 = 0, r2 = null;
  return { add: function(o) {
    t7 == 0 && (r2 = _C()) && (OC(r2, o), NC(r2)), t7++;
  }, remove: function() {
    t7--, !t7 && r2 && (r2.parentNode && r2.parentNode.removeChild(r2), r2 = null);
  } };
};
var DC = function() {
  var t7 = IC();
  return function(r2, o) {
    p.useEffect(function() {
      return t7.add(r2), function() {
        t7.remove();
      };
    }, [r2 && o]);
  };
};
var Bm = function() {
  var t7 = DC(), r2 = function(o) {
    var a = o.styles, l = o.dynamic;
    return t7(a, l), null;
  };
  return r2;
};
var LC = { left: 0, top: 0, right: 0, gap: 0 };
var hu = function(t7) {
  return parseInt(t7 || "", 10) || 0;
};
var jC = function(t7) {
  var r2 = window.getComputedStyle(document.body), o = r2[t7 === "padding" ? "paddingLeft" : "marginLeft"], a = r2[t7 === "padding" ? "paddingTop" : "marginTop"], l = r2[t7 === "padding" ? "paddingRight" : "marginRight"];
  return [hu(o), hu(a), hu(l)];
};
var FC = function(t7) {
  if (t7 === void 0 && (t7 = "margin"), typeof window > "u") return LC;
  var r2 = jC(t7), o = document.documentElement.clientWidth, a = window.innerWidth;
  return { left: r2[0], top: r2[1], right: r2[2], gap: Math.max(0, a - o + r2[2] - r2[0]) };
};
var $C = Bm();
var ro = "data-scroll-locked";
var zC = function(t7, r2, o, a) {
  var l = t7.left, s = t7.top, u2 = t7.right, f = t7.gap;
  return o === void 0 && (o = "margin"), `
  .`.concat(SC, ` {
   overflow: hidden `).concat(a, `;
   padding-right: `).concat(f, "px ").concat(a, `;
  }
  body[`).concat(ro, `] {
    overflow: hidden `).concat(a, `;
    overscroll-behavior: contain;
    `).concat([r2 && "position: relative ".concat(a, ";"), o === "margin" && `
    padding-left: `.concat(l, `px;
    padding-top: `).concat(s, `px;
    padding-right: `).concat(u2, `px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(f, "px ").concat(a, `;
    `), o === "padding" && "padding-right: ".concat(f, "px ").concat(a, ";")].filter(Boolean).join(""), `
  }
  
  .`).concat(rl, ` {
    right: `).concat(f, "px ").concat(a, `;
  }
  
  .`).concat(ol, ` {
    margin-right: `).concat(f, "px ").concat(a, `;
  }
  
  .`).concat(rl, " .").concat(rl, ` {
    right: 0 `).concat(a, `;
  }
  
  .`).concat(ol, " .").concat(ol, ` {
    margin-right: 0 `).concat(a, `;
  }
  
  body[`).concat(ro, `] {
    `).concat(CC, ": ").concat(f, `px;
  }
`);
};
var w1 = function() {
  var t7 = parseInt(document.body.getAttribute(ro) || "0", 10);
  return isFinite(t7) ? t7 : 0;
};
var HC = function() {
  p.useEffect(function() {
    return document.body.setAttribute(ro, (w1() + 1).toString()), function() {
      var t7 = w1() - 1;
      t7 <= 0 ? document.body.removeAttribute(ro) : document.body.setAttribute(ro, t7.toString());
    };
  }, []);
};
var BC = function(t7) {
  var r2 = t7.noRelative, o = t7.noImportant, a = t7.gapMode, l = a === void 0 ? "margin" : a;
  HC();
  var s = p.useMemo(function() {
    return FC(l);
  }, [l]);
  return p.createElement($C, { styles: zC(s, !r2, l, o ? "" : "!important") });
};
var Iu = false;
if (typeof window < "u") try {
  Yi = Object.defineProperty({}, "passive", { get: function() {
    return Iu = true, true;
  } });
  window.addEventListener("test", Yi, Yi), window.removeEventListener("test", Yi, Yi);
} catch {
  Iu = false;
}
var Yi;
var Jr = Iu ? { passive: false } : false;
var VC = function(t7) {
  return t7.tagName === "TEXTAREA";
};
var Vm = function(t7, r2) {
  if (!(t7 instanceof Element)) return false;
  var o = window.getComputedStyle(t7);
  return o[r2] !== "hidden" && !(o.overflowY === o.overflowX && !VC(t7) && o[r2] === "visible");
};
var UC = function(t7) {
  return Vm(t7, "overflowY");
};
var WC = function(t7) {
  return Vm(t7, "overflowX");
};
var x1 = function(t7, r2) {
  var o = r2.ownerDocument, a = r2;
  do {
    typeof ShadowRoot < "u" && a instanceof ShadowRoot && (a = a.host);
    var l = Um(t7, a);
    if (l) {
      var s = Wm(t7, a), u2 = s[1], f = s[2];
      if (u2 > f) return true;
    }
    a = a.parentNode;
  } while (a && a !== o.body);
  return false;
};
var qC = function(t7) {
  var r2 = t7.scrollTop, o = t7.scrollHeight, a = t7.clientHeight;
  return [r2, o, a];
};
var KC = function(t7) {
  var r2 = t7.scrollLeft, o = t7.scrollWidth, a = t7.clientWidth;
  return [r2, o, a];
};
var Um = function(t7, r2) {
  return t7 === "v" ? UC(r2) : WC(r2);
};
var Wm = function(t7, r2) {
  return t7 === "v" ? qC(r2) : KC(r2);
};
var GC = function(t7, r2) {
  return t7 === "h" && r2 === "rtl" ? -1 : 1;
};
var YC = function(t7, r2, o, a, l) {
  var s = GC(t7, window.getComputedStyle(r2).direction), u2 = s * a, f = o.target, d = r2.contains(f), m = false, v = u2 > 0, g = 0, w = 0;
  do {
    if (!f) break;
    var k = Wm(t7, f), P = k[0], C = k[1], x = k[2], R = C - x - s * P;
    (P || R) && Um(t7, f) && (g += R, w += P);
    var b = f.parentNode;
    f = b && b.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? b.host : b;
  } while (!d && f !== document.body || d && (r2.contains(f) || r2 === f));
  return (v && Math.abs(g) < 1 || !v && Math.abs(w) < 1) && (m = true), m;
};
var Xi = function(t7) {
  return "changedTouches" in t7 ? [t7.changedTouches[0].clientX, t7.changedTouches[0].clientY] : [0, 0];
};
var S1 = function(t7) {
  return [t7.deltaX, t7.deltaY];
};
var C1 = function(t7) {
  return t7 && "current" in t7 ? t7.current : t7;
};
var XC = function(t7, r2) {
  return t7[0] === r2[0] && t7[1] === r2[1];
};
var QC = function(t7) {
  return `
  .block-interactivity-`.concat(t7, ` {pointer-events: none;}
  .allow-interactivity-`).concat(t7, ` {pointer-events: all;}
`);
};
var ZC = 0;
var eo = [];
function JC(t7) {
  var r2 = p.useRef([]), o = p.useRef([0, 0]), a = p.useRef(), l = p.useState(ZC++)[0], s = p.useState(Bm)[0], u2 = p.useRef(t7);
  p.useEffect(function() {
    u2.current = t7;
  }, [t7]), p.useEffect(function() {
    if (t7.inert) {
      document.body.classList.add("block-interactivity-".concat(l));
      var C = xC([t7.lockRef.current], (t7.shards || []).map(C1), true).filter(Boolean);
      return C.forEach(function(x) {
        return x.classList.add("allow-interactivity-".concat(l));
      }), function() {
        document.body.classList.remove("block-interactivity-".concat(l)), C.forEach(function(x) {
          return x.classList.remove("allow-interactivity-".concat(l));
        });
      };
    }
  }, [t7.inert, t7.lockRef.current, t7.shards]);
  var f = p.useCallback(function(C, x) {
    if ("touches" in C && C.touches.length === 2 || C.type === "wheel" && C.ctrlKey) return !u2.current.allowPinchZoom;
    var R = Xi(C), b = o.current, M = "deltaX" in C ? C.deltaX : b[0] - R[0], N = "deltaY" in C ? C.deltaY : b[1] - R[1], j, B = C.target, z = Math.abs(M) > Math.abs(N) ? "h" : "v";
    if ("touches" in C && z === "h" && B.type === "range") return false;
    var Q = window.getSelection(), Z = Q && Q.anchorNode, J = Z ? Z === B || Z.contains(B) : false;
    if (J) return false;
    var ee = x1(z, B);
    if (!ee) return true;
    if (ee ? j = z : (j = z === "v" ? "h" : "v", ee = x1(z, B)), !ee) return false;
    if (!a.current && "changedTouches" in C && (M || N) && (a.current = j), !j) return true;
    var ce = a.current || j;
    return YC(ce, x, C, ce === "h" ? M : N);
  }, []), d = p.useCallback(function(C) {
    var x = C;
    if (!(!eo.length || eo[eo.length - 1] !== s)) {
      var R = "deltaY" in x ? S1(x) : Xi(x), b = r2.current.filter(function(j) {
        return j.name === x.type && (j.target === x.target || x.target === j.shadowParent) && XC(j.delta, R);
      })[0];
      if (b && b.should) {
        x.cancelable && x.preventDefault();
        return;
      }
      if (!b) {
        var M = (u2.current.shards || []).map(C1).filter(Boolean).filter(function(j) {
          return j.contains(x.target);
        }), N = M.length > 0 ? f(x, M[0]) : !u2.current.noIsolation;
        N && x.cancelable && x.preventDefault();
      }
    }
  }, []), m = p.useCallback(function(C, x, R, b) {
    var M = { name: C, delta: x, target: R, should: b, shadowParent: ek(R) };
    r2.current.push(M), setTimeout(function() {
      r2.current = r2.current.filter(function(N) {
        return N !== M;
      });
    }, 1);
  }, []), v = p.useCallback(function(C) {
    o.current = Xi(C), a.current = void 0;
  }, []), g = p.useCallback(function(C) {
    m(C.type, S1(C), C.target, f(C, t7.lockRef.current));
  }, []), w = p.useCallback(function(C) {
    m(C.type, Xi(C), C.target, f(C, t7.lockRef.current));
  }, []);
  p.useEffect(function() {
    return eo.push(s), t7.setCallbacks({ onScrollCapture: g, onWheelCapture: g, onTouchMoveCapture: w }), document.addEventListener("wheel", d, Jr), document.addEventListener("touchmove", d, Jr), document.addEventListener("touchstart", v, Jr), function() {
      eo = eo.filter(function(C) {
        return C !== s;
      }), document.removeEventListener("wheel", d, Jr), document.removeEventListener("touchmove", d, Jr), document.removeEventListener("touchstart", v, Jr);
    };
  }, []);
  var k = t7.removeScrollBar, P = t7.inert;
  return p.createElement(p.Fragment, null, P ? p.createElement(s, { styles: QC(l) }) : null, k ? p.createElement(BC, { noRelative: t7.noRelative, gapMode: t7.gapMode }) : null);
}
function ek(t7) {
  for (var r2 = null; t7 !== null; ) t7 instanceof ShadowRoot && (r2 = t7.host, t7 = t7.host), t7 = t7.parentNode;
  return r2;
}
var tk = MC(Hm, JC);
var Ma = p.forwardRef(function(t7, r2) {
  return p.createElement(Ol, ln({}, t7, { ref: r2, sideCar: tk }));
});
Ma.classNames = Ol.classNames;
var nk = function(t7) {
  if (typeof document > "u") return null;
  var r2 = Array.isArray(t7) ? t7[0] : t7;
  return r2.ownerDocument.body;
};
var to = /* @__PURE__ */ new WeakMap();
var Qi = /* @__PURE__ */ new WeakMap();
var Zi = {};
var mu = 0;
var qm = function(t7) {
  return t7 && (t7.host || qm(t7.parentNode));
};
var rk = function(t7, r2) {
  return r2.map(function(o) {
    if (t7.contains(o)) return o;
    var a = qm(o);
    return a && t7.contains(a) ? a : (console.error("aria-hidden", o, "in not contained inside", t7, ". Doing nothing"), null);
  }).filter(function(o) {
    return !!o;
  });
};
var ok = function(t7, r2, o, a) {
  var l = rk(r2, Array.isArray(t7) ? t7 : [t7]);
  Zi[o] || (Zi[o] = /* @__PURE__ */ new WeakMap());
  var s = Zi[o], u2 = [], f = /* @__PURE__ */ new Set(), d = new Set(l), m = function(g) {
    !g || f.has(g) || (f.add(g), m(g.parentNode));
  };
  l.forEach(m);
  var v = function(g) {
    !g || d.has(g) || Array.prototype.forEach.call(g.children, function(w) {
      if (f.has(w)) v(w);
      else try {
        var k = w.getAttribute(a), P = k !== null && k !== "false", C = (to.get(w) || 0) + 1, x = (s.get(w) || 0) + 1;
        to.set(w, C), s.set(w, x), u2.push(w), C === 1 && P && Qi.set(w, true), x === 1 && w.setAttribute(o, "true"), P || w.setAttribute(a, "true");
      } catch (R) {
        console.error("aria-hidden: cannot operate on ", w, R);
      }
    });
  };
  return v(r2), f.clear(), mu++, function() {
    u2.forEach(function(g) {
      var w = to.get(g) - 1, k = s.get(g) - 1;
      to.set(g, w), s.set(g, k), w || (Qi.has(g) || g.removeAttribute(a), Qi.delete(g)), k || g.removeAttribute(o);
    }), mu--, mu || (to = /* @__PURE__ */ new WeakMap(), to = /* @__PURE__ */ new WeakMap(), Qi = /* @__PURE__ */ new WeakMap(), Zi = {});
  };
};
var Nl = function(t7, r2, o) {
  o === void 0 && (o = "data-aria-hidden");
  var a = Array.from(Array.isArray(t7) ? t7 : [t7]), l = nk(t7);
  return l ? (a.push.apply(a, Array.from(l.querySelectorAll("[aria-live], script"))), ok(a, l, o, "aria-hidden")) : function() {
    return null;
  };
};
function ak(t7) {
  const r2 = ik(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(sk);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function ik(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = uk(l), f = ck(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var lk = /* @__PURE__ */ Symbol("radix.slottable");
function sk(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === lk;
}
function ck(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function uk(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
var Il = "Dialog";
var [Km, Gm] = ot(Il);
var [fk, Jt] = Km(Il);
var Ym = (t7) => {
  const { __scopeDialog: r2, children: o, open: a, defaultOpen: l, onOpenChange: s, modal: u2 = true } = t7, f = p.useRef(null), d = p.useRef(null), [m, v] = xt({ prop: a, defaultProp: l ?? false, onChange: s, caller: Il });
  return E.jsx(fk, { scope: r2, triggerRef: f, contentRef: d, contentId: wt(), titleId: wt(), descriptionId: wt(), open: m, onOpenChange: v, onOpenToggle: p.useCallback(() => v((g) => !g), [v]), modal: u2, children: o });
};
Ym.displayName = Il;
var Xm = "DialogTrigger";
var Qm = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, ...a } = t7, l = Jt(Xm, o), s = ve(r2, l.triggerRef);
  return E.jsx(le.button, { type: "button", "aria-haspopup": "dialog", "aria-expanded": l.open, "aria-controls": l.contentId, "data-state": Cf(l.open), ...a, ref: s, onClick: u(t7.onClick, l.onOpenToggle) });
});
Qm.displayName = Xm;
var xf = "DialogPortal";
var [dk, Zm] = Km(xf, { forceMount: void 0 });
var Jm = (t7) => {
  const { __scopeDialog: r2, forceMount: o, children: a, container: l } = t7, s = Jt(xf, r2);
  return E.jsx(dk, { scope: r2, forceMount: o, children: p.Children.map(a, (u2) => E.jsx(Ge, { present: o || s.open, children: E.jsx(vo, { asChild: true, container: l, children: u2 }) })) });
};
Jm.displayName = xf;
var sl = "DialogOverlay";
var ey = p.forwardRef((t7, r2) => {
  const o = Zm(sl, t7.__scopeDialog), { forceMount: a = o.forceMount, ...l } = t7, s = Jt(sl, t7.__scopeDialog);
  return s.modal ? E.jsx(Ge, { present: a || s.open, children: E.jsx(hk, { ...l, ref: r2 }) }) : null;
});
ey.displayName = sl;
var pk = ak("DialogOverlay.RemoveScroll");
var hk = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, ...a } = t7, l = Jt(sl, o);
  return E.jsx(Ma, { as: pk, allowPinchZoom: true, shards: [l.contentRef], children: E.jsx(le.div, { "data-state": Cf(l.open), ...a, ref: r2, style: { pointerEvents: "auto", ...a.style } }) });
});
var vr = "DialogContent";
var ty = p.forwardRef((t7, r2) => {
  const o = Zm(vr, t7.__scopeDialog), { forceMount: a = o.forceMount, ...l } = t7, s = Jt(vr, t7.__scopeDialog);
  return E.jsx(Ge, { present: a || s.open, children: s.modal ? E.jsx(mk, { ...l, ref: r2 }) : E.jsx(yk, { ...l, ref: r2 }) });
});
ty.displayName = vr;
var mk = p.forwardRef((t7, r2) => {
  const o = Jt(vr, t7.__scopeDialog), a = p.useRef(null), l = ve(r2, o.contentRef, a);
  return p.useEffect(() => {
    const s = a.current;
    if (s) return Nl(s);
  }, []), E.jsx(ny, { ...t7, ref: l, trapFocus: o.open, disableOutsidePointerEvents: true, onCloseAutoFocus: u(t7.onCloseAutoFocus, (s) => {
    s.preventDefault(), o.triggerRef.current?.focus();
  }), onPointerDownOutside: u(t7.onPointerDownOutside, (s) => {
    const u2 = s.detail.originalEvent, f = u2.button === 0 && u2.ctrlKey === true;
    (u2.button === 2 || f) && s.preventDefault();
  }), onFocusOutside: u(t7.onFocusOutside, (s) => s.preventDefault()) });
});
var yk = p.forwardRef((t7, r2) => {
  const o = Jt(vr, t7.__scopeDialog), a = p.useRef(false), l = p.useRef(false);
  return E.jsx(ny, { ...t7, ref: r2, trapFocus: false, disableOutsidePointerEvents: false, onCloseAutoFocus: (s) => {
    t7.onCloseAutoFocus?.(s), s.defaultPrevented || (a.current || o.triggerRef.current?.focus(), s.preventDefault()), a.current = false, l.current = false;
  }, onInteractOutside: (s) => {
    t7.onInteractOutside?.(s), s.defaultPrevented || (a.current = true, s.detail.originalEvent.type === "pointerdown" && (l.current = true));
    const u2 = s.target;
    o.triggerRef.current?.contains(u2) && s.preventDefault(), s.detail.originalEvent.type === "focusin" && l.current && s.preventDefault();
  } });
});
var ny = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, trapFocus: a, onOpenAutoFocus: l, onCloseAutoFocus: s, ...u2 } = t7, f = Jt(vr, o), d = p.useRef(null), m = ve(r2, d);
  return _l(), E.jsxs(E.Fragment, { children: [E.jsx(Ta, { asChild: true, loop: true, trapped: a, onMountAutoFocus: l, onUnmountAutoFocus: s, children: E.jsx(yo, { role: "dialog", id: f.contentId, "aria-describedby": f.descriptionId, "aria-labelledby": f.titleId, "data-state": Cf(f.open), ...u2, ref: m, onDismiss: () => f.onOpenChange(false) }) }), E.jsxs(E.Fragment, { children: [E.jsx(gk, { titleId: f.titleId }), E.jsx(xk, { contentRef: d, descriptionId: f.descriptionId })] })] });
});
var Sf = "DialogTitle";
var ry = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, ...a } = t7, l = Jt(Sf, o);
  return E.jsx(le.h2, { id: l.titleId, ...a, ref: r2 });
});
ry.displayName = Sf;
var oy = "DialogDescription";
var ay = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, ...a } = t7, l = Jt(oy, o);
  return E.jsx(le.p, { id: l.descriptionId, ...a, ref: r2 });
});
ay.displayName = oy;
var iy = "DialogClose";
var ly = p.forwardRef((t7, r2) => {
  const { __scopeDialog: o, ...a } = t7, l = Jt(iy, o);
  return E.jsx(le.button, { type: "button", ...a, ref: r2, onClick: u(t7.onClick, () => l.onOpenChange(false)) });
});
ly.displayName = iy;
function Cf(t7) {
  return t7 ? "open" : "closed";
}
var sy = "DialogTitleWarning";
var [vk, cy] = HS(sy, { contentName: vr, titleName: Sf, docsSlug: "dialog" });
var gk = ({ titleId: t7 }) => {
  const r2 = cy(sy), o = `\`${r2.contentName}\` requires a \`${r2.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${r2.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${r2.docsSlug}`;
  return p.useEffect(() => {
    t7 && (document.getElementById(t7) || console.error(o));
  }, [o, t7]), null;
};
var wk = "DialogDescriptionWarning";
var xk = ({ contentRef: t7, descriptionId: r2 }) => {
  const a = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${cy(wk).contentName}}.`;
  return p.useEffect(() => {
    const l = t7.current?.getAttribute("aria-describedby");
    r2 && l && (document.getElementById(r2) || console.warn(a));
  }, [a, t7, r2]), null;
};
var Sk = Ym;
var Ck = Qm;
var kk = Jm;
var Ek = ey;
var Rk = ty;
var Pk = ry;
var bk = ay;
var uy = ly;
var Tk = (t7) => t7.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var fy = (...t7) => t7.filter((r2, o, a) => !!r2 && r2.trim() !== "" && a.indexOf(r2) === o).join(" ").trim();
var Mk = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
var Ak = p.forwardRef(({ color: t7 = "currentColor", size: r2 = 24, strokeWidth: o = 2, absoluteStrokeWidth: a, className: l = "", children: s, iconNode: u2, ...f }, d) => p.createElement("svg", { ref: d, ...Mk, width: r2, height: r2, stroke: t7, strokeWidth: a ? Number(o) * 24 / Number(r2) : o, className: fy("lucide", l), ...f }, [...u2.map(([m, v]) => p.createElement(m, v)), ...Array.isArray(s) ? s : [s]]));
var A = (t7, r2) => {
  const o = p.forwardRef(({ className: a, ...l }, s) => p.createElement(Ak, { ref: s, iconNode: r2, className: fy(`lucide-${Tk(t7)}`, a), ...l }));
  return o.displayName = `${t7}`, o;
};
var DA = A("Activity", [["path", { d: "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2", key: "169zse" }]]);
var LA = A("AlignLeft", [["path", { d: "M15 12H3", key: "6jk70r" }], ["path", { d: "M17 18H3", key: "1amg6g" }], ["path", { d: "M21 6H3", key: "1jwq7v" }]]);
var jA = A("Archive", [["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }], ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }], ["path", { d: "M10 12h4", key: "a56b0p" }]]);
var FA = A("ArrowDownLeft", [["path", { d: "M17 7 7 17", key: "15tmo1" }], ["path", { d: "M17 17H7V7", key: "1org7z" }]]);
var $A = A("ArrowDownRight", [["path", { d: "m7 7 10 10", key: "1fmybs" }], ["path", { d: "M17 7v10H7", key: "6fjiku" }]]);
var zA = A("ArrowDown", [["path", { d: "M12 5v14", key: "s699le" }], ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]]);
var HA = A("ArrowLeft", [["path", { d: "m12 19-7-7 7-7", key: "1l729n" }], ["path", { d: "M19 12H5", key: "x3x0zl" }]]);
var BA = A("ArrowRight", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]]);
var VA = A("ArrowUpDown", [["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }], ["path", { d: "M17 20V4", key: "1ejh1v" }], ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }], ["path", { d: "M7 4v16", key: "1glfcx" }]]);
var UA = A("ArrowUpRight", [["path", { d: "M7 7h10v10", key: "1tivn9" }], ["path", { d: "M7 17 17 7", key: "1vkiza" }]]);
var WA = A("ArrowUp", [["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }], ["path", { d: "M12 19V5", key: "x0mq9r" }]]);
var qA = A("Award", [["path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526", key: "1yiouv" }], ["circle", { cx: "12", cy: "8", r: "6", key: "1vp47v" }]]);
var KA = A("BadgeCheck", [["path", { d: "M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z", key: "3c2336" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]);
var GA = A("Banknote", [["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }], ["path", { d: "M6 12h.01M18 12h.01", key: "113zkx" }]]);
var YA = A("Battery", [["rect", { width: "16", height: "10", x: "2", y: "7", rx: "2", ry: "2", key: "1w10f2" }], ["line", { x1: "22", x2: "22", y1: "11", y2: "13", key: "4dh1rd" }]]);
var XA = A("Bell", [["path", { d: "M10.268 21a2 2 0 0 0 3.464 0", key: "vwvbt9" }], ["path", { d: "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326", key: "11g9vi" }]]);
var QA = A("BookOpen", [["path", { d: "M12 7v14", key: "1akyts" }], ["path", { d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z", key: "ruj8y" }]]);
var ZA = A("Bookmark", [["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z", key: "1fy3hk" }]]);
var JA = A("Box", [["path", { d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z", key: "hh9hay" }], ["path", { d: "m3.3 7 8.7 5 8.7-5", key: "g66t2b" }], ["path", { d: "M12 22V12", key: "d0xqtd" }]]);
var e_ = A("BrainCircuit", [["path", { d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z", key: "l5xja" }], ["path", { d: "M9 13a4.5 4.5 0 0 0 3-4", key: "10igwf" }], ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }], ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }], ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }], ["path", { d: "M12 13h4", key: "1ku699" }], ["path", { d: "M12 18h6a2 2 0 0 1 2 2v1", key: "105ag5" }], ["path", { d: "M12 8h8", key: "1lhi5i" }], ["path", { d: "M16 8V5a2 2 0 0 1 2-2", key: "u6izg6" }], ["circle", { cx: "16", cy: "13", r: ".5", key: "ry7gng" }], ["circle", { cx: "18", cy: "3", r: ".5", key: "1aiba7" }], ["circle", { cx: "20", cy: "21", r: ".5", key: "yhc1fs" }], ["circle", { cx: "20", cy: "8", r: ".5", key: "1e43v0" }]]);
var t_ = A("Briefcase", [["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", key: "jecpp" }], ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2", key: "i6l2r4" }]]);
var n_ = A("Building2", [["path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z", key: "1b4qmf" }], ["path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2", key: "i71pzd" }], ["path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2", key: "10jefs" }], ["path", { d: "M10 6h4", key: "1itunk" }], ["path", { d: "M10 10h4", key: "tcdvrf" }], ["path", { d: "M10 14h4", key: "kelpxr" }], ["path", { d: "M10 18h4", key: "1ulq68" }]]);
var r_ = A("Building", [["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", ry: "2", key: "76otgf" }], ["path", { d: "M9 22v-4h6v4", key: "r93iot" }], ["path", { d: "M8 6h.01", key: "1dz90k" }], ["path", { d: "M16 6h.01", key: "1x0f13" }], ["path", { d: "M12 6h.01", key: "1vi96p" }], ["path", { d: "M12 10h.01", key: "1nrarc" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 10h.01", key: "1m94wz" }], ["path", { d: "M16 14h.01", key: "1gbofw" }], ["path", { d: "M8 10h.01", key: "19clt8" }], ["path", { d: "M8 14h.01", key: "6423bh" }]]);
var o_ = A("Calculator", [["rect", { width: "16", height: "20", x: "4", y: "2", rx: "2", key: "1nb95v" }], ["line", { x1: "8", x2: "16", y1: "6", y2: "6", key: "x4nwl0" }], ["line", { x1: "16", x2: "16", y1: "14", y2: "18", key: "wjye3r" }], ["path", { d: "M16 10h.01", key: "1m94wz" }], ["path", { d: "M12 10h.01", key: "1nrarc" }], ["path", { d: "M8 10h.01", key: "19clt8" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M8 14h.01", key: "6423bh" }], ["path", { d: "M12 18h.01", key: "mhygvu" }], ["path", { d: "M8 18h.01", key: "lrp35t" }]]);
var a_ = A("CalendarCheck", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }]]);
var i_ = A("CalendarClock", [["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M3 10h5", key: "r794hk" }], ["path", { d: "M17.5 17.5 16 16.3V14", key: "akvzfd" }], ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]]);
var l_ = A("CalendarDays", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 14h.01", key: "6423bh" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 14h.01", key: "1gbofw" }], ["path", { d: "M8 18h.01", key: "lrp35t" }], ["path", { d: "M12 18h.01", key: "mhygvu" }], ["path", { d: "M16 18h.01", key: "kzsmim" }]]);
var s_ = A("CalendarRange", [["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M17 14h-6", key: "bkmgh3" }], ["path", { d: "M13 18H7", key: "bb0bb7" }], ["path", { d: "M7 14h.01", key: "1qa3f1" }], ["path", { d: "M17 18h.01", key: "1bdyru" }]]);
var c_ = A("CalendarX", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "m14 14-4 4", key: "rymu2i" }], ["path", { d: "m10 14 4 4", key: "3sz06r" }]]);
var u_ = A("Calendar", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }], ["path", { d: "M3 10h18", key: "8toen8" }]]);
var f_ = A("Camera", [["path", { d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", key: "1tc9qg" }], ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]]);
var d_ = A("Car", [["path", { d: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", key: "5owen" }], ["circle", { cx: "7", cy: "17", r: "2", key: "u2ysq9" }], ["path", { d: "M9 17h6", key: "r8uit2" }], ["circle", { cx: "17", cy: "17", r: "2", key: "axvx0g" }]]);
var p_ = A("ChartColumn", [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }], ["path", { d: "M18 17V9", key: "2bz60n" }], ["path", { d: "M13 17V5", key: "1frdt8" }], ["path", { d: "M8 17v-3", key: "17ska0" }]]);
var h_ = A("ChartLine", [["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }], ["path", { d: "m19 9-5 5-4-4-3 3", key: "2osh9i" }]]);
var m_ = A("ChartNoAxesColumnIncreasing", [["line", { x1: "12", x2: "12", y1: "20", y2: "10", key: "1vz5eb" }], ["line", { x1: "18", x2: "18", y1: "20", y2: "4", key: "cun8e5" }], ["line", { x1: "6", x2: "6", y1: "20", y2: "16", key: "hq0ia6" }]]);
var y_ = A("ChartNoAxesColumn", [["line", { x1: "18", x2: "18", y1: "20", y2: "10", key: "1xfpm4" }], ["line", { x1: "12", x2: "12", y1: "20", y2: "4", key: "be30l9" }], ["line", { x1: "6", x2: "6", y1: "20", y2: "14", key: "1r4le6" }]]);
var v_ = A("ChartPie", [["path", { d: "M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z", key: "pzmjnu" }], ["path", { d: "M21.21 15.89A10 10 0 1 1 8 2.83", key: "k2fpak" }]]);
var g_ = A("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
var w_ = A("ChevronDown", [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]]);
var x_ = A("ChevronLeft", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]);
var S_ = A("ChevronRight", [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]]);
var C_ = A("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
var k_ = A("ChevronsUpDown", [["path", { d: "m7 15 5 5 5-5", key: "1hf1tw" }], ["path", { d: "m7 9 5-5 5 5", key: "sgt6xg" }]]);
var E_ = A("CircleAlert", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }], ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]]);
var R_ = A("CircleCheckBig", [["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]);
var P_ = A("CircleCheck", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]);
var b_ = A("CircleDashed", [["path", { d: "M10.1 2.182a10 10 0 0 1 3.8 0", key: "5ilxe3" }], ["path", { d: "M13.9 21.818a10 10 0 0 1-3.8 0", key: "11zvb9" }], ["path", { d: "M17.609 3.721a10 10 0 0 1 2.69 2.7", key: "1iw5b2" }], ["path", { d: "M2.182 13.9a10 10 0 0 1 0-3.8", key: "c0bmvh" }], ["path", { d: "M20.279 17.609a10 10 0 0 1-2.7 2.69", key: "1ruxm7" }], ["path", { d: "M21.818 10.1a10 10 0 0 1 0 3.8", key: "qkgqxc" }], ["path", { d: "M3.721 6.391a10 10 0 0 1 2.7-2.69", key: "1mcia2" }], ["path", { d: "M6.391 20.279a10 10 0 0 1-2.69-2.7", key: "1fvljs" }]]);
var T_ = A("CircleHelp", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]);
var M_ = A("CircleParking", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M9 17V7h4a3 3 0 0 1 0 6H9", key: "1dfk2c" }]]);
var A_ = A("CirclePlus", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M8 12h8", key: "1wcyev" }], ["path", { d: "M12 8v8", key: "napkw2" }]]);
var __ = A("CircleX", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "m15 9-6 6", key: "1uzhvr" }], ["path", { d: "m9 9 6 6", key: "z0biqf" }]]);
var O_ = A("Circle", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]]);
var N_ = A("ClipboardCheck", [["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" }], ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]]);
var I_ = A("ClipboardList", [["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" }], ["path", { d: "M12 11h4", key: "1jrz19" }], ["path", { d: "M12 16h4", key: "n85exb" }], ["path", { d: "M8 11h.01", key: "1dfujw" }], ["path", { d: "M8 16h.01", key: "18s6g9" }]]);
var D_ = A("ClipboardPlus", [["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }], ["path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", key: "116196" }], ["path", { d: "M9 14h6", key: "159ibu" }], ["path", { d: "M12 17v-6", key: "1y8rbf" }]]);
var L_ = A("Clock3", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16.5 12", key: "1aq6pp" }]]);
var j_ = A("Clock", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]]);
var F_ = A("CloudUpload", [["path", { d: "M12 13v8", key: "1l5pq0" }], ["path", { d: "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242", key: "1pljnt" }], ["path", { d: "m8 17 4-4 4 4", key: "1quai1" }]]);
var $_ = A("Compass", [["path", { d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z", key: "9ktpf1" }], ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]]);
var z_ = A("ContactRound", [["path", { d: "M16 2v2", key: "scm5qe" }], ["path", { d: "M17.915 22a6 6 0 0 0-12 0", key: "suqz9p" }], ["path", { d: "M8 2v2", key: "pbkmx" }], ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }], ["rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", key: "12vinp" }]]);
var H_ = A("Copy", [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]]);
var B_ = A("CornerUpLeft", [["polyline", { points: "9 14 4 9 9 4", key: "881910" }], ["path", { d: "M20 20v-7a4 4 0 0 0-4-4H4", key: "1nkjon" }]]);
var V_ = A("CornerUpRight", [["polyline", { points: "15 14 20 9 15 4", key: "1tbx3s" }], ["path", { d: "M4 20v-7a4 4 0 0 1 4-4h12", key: "1lu4f8" }]]);
var U_ = A("CreditCard", [["rect", { width: "20", height: "14", x: "2", y: "5", rx: "2", key: "ynyp8z" }], ["line", { x1: "2", x2: "22", y1: "10", y2: "10", key: "1b3vmo" }]]);
var W_ = A("Crown", [["path", { d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z", key: "1vdc57" }], ["path", { d: "M5 21h14", key: "11awu3" }]]);
var q_ = A("Database", [["ellipse", { cx: "12", cy: "5", rx: "9", ry: "3", key: "msslwz" }], ["path", { d: "M3 5V19A9 3 0 0 0 21 19V5", key: "1wlel7" }], ["path", { d: "M3 12A9 3 0 0 0 21 12", key: "mv7ke4" }]]);
var K_ = A("Disc", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]]);
var G_ = A("DollarSign", [["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }], ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]]);
var Y_ = A("Download", [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }], ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }], ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }]]);
var X_ = A("Droplet", [["path", { d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z", key: "c7niix" }]]);
var Q_ = A("Droplets", [["path", { d: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z", key: "1ptgy4" }], ["path", { d: "M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97", key: "1sl1rz" }]]);
var Z_ = A("EllipsisVertical", [["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }], ["circle", { cx: "12", cy: "5", r: "1", key: "gxeob9" }], ["circle", { cx: "12", cy: "19", r: "1", key: "lyex9k" }]]);
var J_ = A("Ellipsis", [["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }], ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }], ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]]);
var e3 = A("ExternalLink", [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]]);
var t3 = A("EyeOff", [["path", { d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49", key: "ct8e1f" }], ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }], ["path", { d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143", key: "13bj9a" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]);
var n3 = A("Eye", [["path", { d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0", key: "1nclc0" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]);
var r3 = A("Facebook", [["path", { d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z", key: "1jg4f8" }]]);
var o3 = A("FileBox", [["path", { d: "M14.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "16lz6z" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M3 13.1a2 2 0 0 0-1 1.76v3.24a2 2 0 0 0 .97 1.78L6 21.7a2 2 0 0 0 2.03.01L11 19.9a2 2 0 0 0 1-1.76V14.9a2 2 0 0 0-.97-1.78L8 11.3a2 2 0 0 0-2.03-.01Z", key: "99pj1s" }], ["path", { d: "M7 17v5", key: "1yj1jh" }], ["path", { d: "M11.7 14.2 7 17l-4.7-2.8", key: "1yk8tc" }]]);
var a3 = A("FileCheck", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "m9 15 2 2 4-4", key: "1grp1n" }]]);
var i3 = A("FileImage", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["circle", { cx: "10", cy: "12", r: "2", key: "737tya" }], ["path", { d: "m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22", key: "wt3hpn" }]]);
var l3 = A("FileJson", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1", key: "1oajmo" }], ["path", { d: "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1", key: "mpwhp6" }]]);
var s3 = A("FilePen", [["path", { d: "M12.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v9.5", key: "1couwa" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z", key: "1y4qbx" }]]);
var c3 = A("FilePlus", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M9 15h6", key: "cctwl0" }], ["path", { d: "M12 18v-6", key: "17g6i2" }]]);
var u3 = A("FileQuestion", [["path", { d: "M12 17h.01", key: "p32p05" }], ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", key: "1mlx9k" }], ["path", { d: "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3", key: "mhlwft" }]]);
var f3 = A("FileSpreadsheet", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M8 13h2", key: "yr2amv" }], ["path", { d: "M14 13h2", key: "un5t4a" }], ["path", { d: "M8 17h2", key: "2yhykz" }], ["path", { d: "M14 17h2", key: "10kma7" }]]);
var d3 = A("FileText", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M10 9H8", key: "b1mrlr" }], ["path", { d: "M16 13H8", key: "t4e002" }], ["path", { d: "M16 17H8", key: "z1uh3a" }]]);
var p3 = A("FileUp", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["path", { d: "M12 12v6", key: "3ahymv" }], ["path", { d: "m15 15-3-3-3 3", key: "15xj92" }]]);
var h3 = A("FileWarning", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M12 9v4", key: "juzpu7" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]);
var m3 = A("File", [["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }]]);
var y3 = A("FilterX", [["path", { d: "M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055", key: "1fi1da" }], ["path", { d: "m22 3-5 5", key: "12jva0" }], ["path", { d: "m17 3 5 5", key: "k36vhe" }]]);
var v3 = A("Filter", [["polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3", key: "1yg77f" }]]);
var g3 = A("Fingerprint", [["path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4", key: "1nerag" }], ["path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88", key: "o46ks0" }], ["path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02", key: "ptglia" }], ["path", { d: "M2 12a10 10 0 0 1 18-6", key: "ydlgp0" }], ["path", { d: "M2 16h.01", key: "1gqxmh" }], ["path", { d: "M21.8 16c.2-2 .131-5.354 0-6", key: "drycrb" }], ["path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2", key: "1tidbn" }], ["path", { d: "M8.65 22c.21-.66.45-1.32.57-2", key: "13wd9y" }], ["path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2", key: "1fr1j5" }]]);
var w3 = A("FolderOpen", [["path", { d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2", key: "usdka0" }]]);
var x3 = A("Folder", [["path", { d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z", key: "1kt360" }]]);
var S3 = A("Fuel", [["line", { x1: "3", x2: "15", y1: "22", y2: "22", key: "xegly4" }], ["line", { x1: "4", x2: "14", y1: "9", y2: "9", key: "xcnuvu" }], ["path", { d: "M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18", key: "16j0yd" }], ["path", { d: "M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5", key: "7cu91f" }]]);
var C3 = A("Globe", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }], ["path", { d: "M2 12h20", key: "9i4pu4" }]]);
var k3 = A("Grid3x3", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M3 9h18", key: "1pudct" }], ["path", { d: "M3 15h18", key: "5xshup" }], ["path", { d: "M9 3v18", key: "fh3hqa" }], ["path", { d: "M15 3v18", key: "14nvp0" }]]);
var E3 = A("Hammer", [["path", { d: "m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9", key: "eefl8a" }], ["path", { d: "m18 15 4-4", key: "16gjal" }], ["path", { d: "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5", key: "b7pghm" }]]);
var R3 = A("HandCoins", [["path", { d: "M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17", key: "geh8rc" }], ["path", { d: "m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9", key: "1fto5m" }], ["path", { d: "m2 16 6 6", key: "1pfhp9" }], ["circle", { cx: "16", cy: "9", r: "2.9", key: "1n0dlu" }], ["circle", { cx: "6", cy: "5", r: "3", key: "151irh" }]]);
var P3 = A("Handshake", [["path", { d: "m11 17 2 2a1 1 0 1 0 3-3", key: "efffak" }], ["path", { d: "m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4", key: "9pr0kb" }], ["path", { d: "m21 3 1 11h-2", key: "1tisrp" }], ["path", { d: "M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3", key: "1uvwmv" }], ["path", { d: "M3 4h8", key: "1ep09j" }]]);
var b3 = A("HardDrive", [["line", { x1: "22", x2: "2", y1: "12", y2: "12", key: "1y58io" }], ["path", { d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z", key: "oot6mr" }], ["line", { x1: "6", x2: "6.01", y1: "16", y2: "16", key: "sgf278" }], ["line", { x1: "10", x2: "10.01", y1: "16", y2: "16", key: "1l4acy" }]]);
var T3 = A("Hash", [["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }], ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }], ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }], ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]]);
var M3 = A("Headphones", [["path", { d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3", key: "1xhozi" }]]);
var A3 = A("Heart", [["path", { d: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z", key: "c3ymky" }]]);
var _3 = A("History", [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }], ["path", { d: "M12 7v5l4 2", key: "1fdv2h" }]]);
var O3 = A("Hotel", [["path", { d: "M10 22v-6.57", key: "1wmca3" }], ["path", { d: "M12 11h.01", key: "z322tv" }], ["path", { d: "M12 7h.01", key: "1ivr5q" }], ["path", { d: "M14 15.43V22", key: "1q2vjd" }], ["path", { d: "M15 16a5 5 0 0 0-6 0", key: "o9wqvi" }], ["path", { d: "M16 11h.01", key: "xkw8gn" }], ["path", { d: "M16 7h.01", key: "1kdx03" }], ["path", { d: "M8 11h.01", key: "1dfujw" }], ["path", { d: "M8 7h.01", key: "1vti4s" }], ["rect", { x: "4", y: "2", width: "16", height: "20", rx: "2", key: "1uxh74" }]]);
var N3 = A("House", [["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }], ["path", { d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", key: "1d0kgt" }]]);
var I3 = A("IdCard", [["path", { d: "M16 10h2", key: "8sgtl7" }], ["path", { d: "M16 14h2", key: "epxaof" }], ["path", { d: "M6.17 15a3 3 0 0 1 5.66 0", key: "n6f512" }], ["circle", { cx: "9", cy: "11", r: "2", key: "yxgjnd" }], ["rect", { x: "2", y: "5", width: "20", height: "14", rx: "2", key: "qneu4z" }]]);
var D3 = A("ImageOff", [["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }], ["path", { d: "M10.41 10.41a2 2 0 1 1-2.83-2.83", key: "1bzlo9" }], ["line", { x1: "13.5", x2: "6", y1: "13.5", y2: "21", key: "1q0aeu" }], ["line", { x1: "18", x2: "21", y1: "12", y2: "15", key: "5mozeu" }], ["path", { d: "M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59", key: "mmje98" }], ["path", { d: "M21 15V5a2 2 0 0 0-2-2H9", key: "43el77" }]]);
var L3 = A("ImagePlus", [["path", { d: "M16 5h6", key: "1vod17" }], ["path", { d: "M19 2v6", key: "4bpg5p" }], ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }], ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }], ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]]);
var j3 = A("Image", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }], ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }], ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]]);
var F3 = A("Inbox", [["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }], ["path", { d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z", key: "oot6mr" }]]);
var $3 = A("IndianRupee", [["path", { d: "M6 3h12", key: "ggurg9" }], ["path", { d: "M6 8h12", key: "6g4wlu" }], ["path", { d: "m6 13 8.5 8", key: "u1kupk" }], ["path", { d: "M6 13h3", key: "wdp6ag" }], ["path", { d: "M9 13c6.667 0 6.667-10 0-10", key: "1nkvk2" }]]);
var z3 = A("Info", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["path", { d: "M12 16v-4", key: "1dtifu" }], ["path", { d: "M12 8h.01", key: "e9boi3" }]]);
var H3 = A("Instagram", [["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5", key: "2e1cvw" }], ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" }], ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }]]);
var B3 = A("Kanban", [["path", { d: "M6 5v11", key: "mdvv1e" }], ["path", { d: "M12 5v6", key: "14ar3b" }], ["path", { d: "M18 5v14", key: "7ji314" }]]);
var V3 = A("KeyRound", [["path", { d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z", key: "1s6t7t" }], ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]]);
var U3 = A("Key", [["path", { d: "m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4", key: "g0fldk" }], ["path", { d: "m21 2-9.6 9.6", key: "1j0ho8" }], ["circle", { cx: "7.5", cy: "15.5", r: "5.5", key: "yqb3hr" }]]);
var W3 = A("Landmark", [["line", { x1: "3", x2: "21", y1: "22", y2: "22", key: "j8o0r" }], ["line", { x1: "6", x2: "6", y1: "18", y2: "11", key: "10tf0k" }], ["line", { x1: "10", x2: "10", y1: "18", y2: "11", key: "54lgf6" }], ["line", { x1: "14", x2: "14", y1: "18", y2: "11", key: "380y" }], ["line", { x1: "18", x2: "18", y1: "18", y2: "11", key: "1kevvc" }], ["polygon", { points: "12 2 20 7 4 7", key: "jkujk7" }]]);
var q3 = A("Layers", [["path", { d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z", key: "zw3jo" }], ["path", { d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12", key: "1wduqc" }], ["path", { d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17", key: "kqbvx6" }]]);
var K3 = A("LayoutDashboard", [["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }], ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }], ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }], ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]]);
var G3 = A("LayoutGrid", [["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }], ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }], ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }], ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]]);
var Y3 = A("Lightbulb", [["path", { d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5", key: "1gvzjb" }], ["path", { d: "M9 18h6", key: "x1upvd" }], ["path", { d: "M10 22h4", key: "ceow96" }]]);
var X3 = A("Link2", [["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }], ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }], ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]]);
var Q3 = A("Link", [["path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", key: "1cjeqo" }], ["path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71", key: "19qd67" }]]);
var Z3 = A("Linkedin", [["path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z", key: "c2jq9f" }], ["rect", { width: "4", height: "12", x: "2", y: "9", key: "mk3on5" }], ["circle", { cx: "4", cy: "4", r: "2", key: "bt5ra8" }]]);
var J3 = A("ListFilter", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M7 12h10", key: "b7w52i" }], ["path", { d: "M10 18h4", key: "1ulq68" }]]);
var e5 = A("List", [["path", { d: "M3 12h.01", key: "nlz23k" }], ["path", { d: "M3 18h.01", key: "1tta3j" }], ["path", { d: "M3 6h.01", key: "1rqtza" }], ["path", { d: "M8 12h13", key: "1za7za" }], ["path", { d: "M8 18h13", key: "1lx6n3" }], ["path", { d: "M8 6h13", key: "ik3vkj" }]]);
var t5 = A("LoaderCircle", [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]]);
var n5 = A("Lock", [["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }], ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4", key: "fwvmzm" }]]);
var r5 = A("LogOut", [["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }], ["polyline", { points: "16 17 21 12 16 7", key: "1gabdz" }], ["line", { x1: "21", x2: "9", y1: "12", y2: "12", key: "1uyos4" }]]);
var o5 = A("Mail", [["rect", { width: "20", height: "16", x: "2", y: "4", rx: "2", key: "18n3k1" }], ["path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7", key: "1ocrg3" }]]);
var a5 = A("MapPin", [["path", { d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0", key: "1r0f0z" }], ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]]);
var i5 = A("Map", [["path", { d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z", key: "169xi5" }], ["path", { d: "M15 5.764v15", key: "1pn4in" }], ["path", { d: "M9 3.236v15", key: "1uimfh" }]]);
var l5 = A("Maximize2", [["polyline", { points: "15 3 21 3 21 9", key: "mznyad" }], ["polyline", { points: "9 21 3 21 3 15", key: "1avn1i" }], ["line", { x1: "21", x2: "14", y1: "3", y2: "10", key: "ota7mn" }], ["line", { x1: "3", x2: "10", y1: "21", y2: "14", key: "1atl0r" }]]);
var s5 = A("Menu", [["line", { x1: "4", x2: "20", y1: "12", y2: "12", key: "1e0a9i" }], ["line", { x1: "4", x2: "20", y1: "6", y2: "6", key: "1owob3" }], ["line", { x1: "4", x2: "20", y1: "18", y2: "18", key: "yk5zj1" }]]);
var c5 = A("MessageCircle", [["path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z", key: "vv11sd" }]]);
var u5 = A("MessageSquare", [["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]]);
var f5 = A("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
var d5 = A("Moon", [["path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z", key: "a7tn18" }]]);
var p5 = A("Navigation", [["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]]);
var h5 = A("Package", [["path", { d: "M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z", key: "1a0edw" }], ["path", { d: "M12 22V12", key: "d0xqtd" }], ["path", { d: "m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7", key: "yx3hmr" }], ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }]]);
var m5 = A("Palette", [["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }], ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }], ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }], ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }], ["path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z", key: "12rzf8" }]]);
var y5 = A("PanelsTopLeft", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M3 9h18", key: "1pudct" }], ["path", { d: "M9 21V9", key: "1oto5p" }]]);
var v5 = A("Paperclip", [["path", { d: "M13.234 20.252 21 12.3", key: "1cbrk9" }], ["path", { d: "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486", key: "1pkts6" }]]);
var g5 = A("Pause", [["rect", { x: "14", y: "4", width: "4", height: "16", rx: "1", key: "zuxfzm" }], ["rect", { x: "6", y: "4", width: "4", height: "16", rx: "1", key: "1okwgv" }]]);
var w5 = A("PenLine", [["path", { d: "M12 20h9", key: "t2du7b" }], ["path", { d: "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z", key: "1ykcvy" }]]);
var x5 = A("PenTool", [["path", { d: "M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z", key: "nt11vn" }], ["path", { d: "m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18", key: "15qc1e" }], ["path", { d: "m2.3 2.3 7.286 7.286", key: "1wuzzi" }], ["circle", { cx: "11", cy: "11", r: "2", key: "xmgehs" }]]);
var S5 = A("Pen", [["path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z", key: "1a8usu" }]]);
var C5 = A("Pencil", [["path", { d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z", key: "1a8usu" }], ["path", { d: "m15 5 4 4", key: "1mk7zo" }]]);
var k5 = A("Percent", [["line", { x1: "19", x2: "5", y1: "5", y2: "19", key: "1x9vlm" }], ["circle", { cx: "6.5", cy: "6.5", r: "2.5", key: "4mh3h7" }], ["circle", { cx: "17.5", cy: "17.5", r: "2.5", key: "1mdrzq" }]]);
var E5 = A("PhoneCall", [["path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", key: "foiqr5" }], ["path", { d: "M14.05 2a9 9 0 0 1 8 7.94", key: "vmijpz" }], ["path", { d: "M14.05 6A5 5 0 0 1 18 10", key: "13nbpp" }]]);
var R5 = A("Phone", [["path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", key: "foiqr5" }]]);
var P5 = A("Play", [["polygon", { points: "6 3 20 12 6 21 6 3", key: "1oa8hb" }]]);
var b5 = A("Plus", [["path", { d: "M5 12h14", key: "1ays0h" }], ["path", { d: "M12 5v14", key: "s699le" }]]);
var T5 = A("Printer", [["path", { d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", key: "143wyd" }], ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }], ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]]);
var M5 = A("QrCode", [["rect", { width: "5", height: "5", x: "3", y: "3", rx: "1", key: "1tu5fj" }], ["rect", { width: "5", height: "5", x: "16", y: "3", rx: "1", key: "1v8r4q" }], ["rect", { width: "5", height: "5", x: "3", y: "16", rx: "1", key: "1x03jg" }], ["path", { d: "M21 16h-3a2 2 0 0 0-2 2v3", key: "177gqh" }], ["path", { d: "M21 21v.01", key: "ents32" }], ["path", { d: "M12 7v3a2 2 0 0 1-2 2H7", key: "8crl2c" }], ["path", { d: "M3 12h.01", key: "nlz23k" }], ["path", { d: "M12 3h.01", key: "n36tog" }], ["path", { d: "M12 16v.01", key: "133mhm" }], ["path", { d: "M16 12h1", key: "1slzba" }], ["path", { d: "M21 12v.01", key: "1lwtk9" }], ["path", { d: "M12 21v-1", key: "1880an" }]]);
var A5 = A("Quote", [["path", { d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z", key: "rib7q0" }], ["path", { d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z", key: "1ymkrd" }]]);
var _5 = A("Radio", [["path", { d: "M4.9 19.1C1 15.2 1 8.8 4.9 4.9", key: "1vaf9d" }], ["path", { d: "M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5", key: "u1ii0m" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }], ["path", { d: "M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5", key: "1j5fej" }], ["path", { d: "M19.1 4.9C23 8.8 23 15.1 19.1 19", key: "10b0cb" }]]);
var O5 = A("Receipt", [["path", { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "q3az6g" }], ["path", { d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8", key: "1h4pet" }], ["path", { d: "M12 17.5v-11", key: "1jc1ny" }]]);
var N5 = A("RefreshCcw", [["path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "14sxne" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }], ["path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16", key: "1hlbsb" }], ["path", { d: "M16 16h5v5", key: "ccwih5" }]]);
var I5 = A("RefreshCw", [["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }], ["path", { d: "M21 3v5h-5", key: "1q7to0" }], ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }], ["path", { d: "M8 16H3v5", key: "1cv678" }]]);
var D5 = A("RotateCcw", [["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }], ["path", { d: "M3 3v5h5", key: "1xhq8a" }]]);
var L5 = A("RotateCw", [["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }], ["path", { d: "M21 3v5h-5", key: "1q7to0" }]]);
var j5 = A("Route", [["circle", { cx: "6", cy: "19", r: "3", key: "1kj8tv" }], ["path", { d: "M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15", key: "1d8sl" }], ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }]]);
var F5 = A("Save", [["path", { d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", key: "1c8476" }], ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }], ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]]);
var $5 = A("Scale", [["path", { d: "m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "7g6ntu" }], ["path", { d: "m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z", key: "ijws7r" }], ["path", { d: "M7 21h10", key: "1b0cd5" }], ["path", { d: "M12 3v18", key: "108xh3" }], ["path", { d: "M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2", key: "3gwbw2" }]]);
var z5 = A("Search", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["path", { d: "m21 21-4.3-4.3", key: "1qie3q" }]]);
var H5 = A("Send", [["path", { d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z", key: "1ffxy3" }], ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]]);
var B5 = A("Settings2", [["path", { d: "M20 7h-9", key: "3s1dr2" }], ["path", { d: "M14 17H5", key: "gfn3mx" }], ["circle", { cx: "17", cy: "17", r: "3", key: "18b49y" }], ["circle", { cx: "7", cy: "7", r: "3", key: "dfmy0x" }]]);
var V5 = A("Settings", [["path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", key: "1qme2f" }], ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]]);
var U5 = A("Share2", [["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }], ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }], ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }], ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }], ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]]);
var W5 = A("ShieldAlert", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }], ["path", { d: "M12 8v4", key: "1got3b" }], ["path", { d: "M12 16h.01", key: "1drbdi" }]]);
var q5 = A("ShieldCheck", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }], ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]]);
var K5 = A("Shield", [["path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z", key: "oel41y" }]]);
var G5 = A("ShoppingBag", [["path", { d: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z", key: "hou9p0" }], ["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M16 10a4 4 0 0 1-8 0", key: "1ltviw" }]]);
var Y5 = A("SlidersVertical", [["line", { x1: "4", x2: "4", y1: "21", y2: "14", key: "1p332r" }], ["line", { x1: "4", x2: "4", y1: "10", y2: "3", key: "gb41h5" }], ["line", { x1: "12", x2: "12", y1: "21", y2: "12", key: "hf2csr" }], ["line", { x1: "12", x2: "12", y1: "8", y2: "3", key: "1kfi7u" }], ["line", { x1: "20", x2: "20", y1: "21", y2: "16", key: "1lhrwl" }], ["line", { x1: "20", x2: "20", y1: "12", y2: "3", key: "16vvfq" }], ["line", { x1: "2", x2: "6", y1: "14", y2: "14", key: "1uebub" }], ["line", { x1: "10", x2: "14", y1: "8", y2: "8", key: "1yglbp" }], ["line", { x1: "18", x2: "22", y1: "16", y2: "16", key: "1jxqpz" }]]);
var X5 = A("Smartphone", [["rect", { width: "14", height: "20", x: "5", y: "2", rx: "2", ry: "2", key: "1yt0o3" }], ["path", { d: "M12 18h.01", key: "mhygvu" }]]);
var Q5 = A("Sparkles", [["path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z", key: "4pj2yx" }], ["path", { d: "M20 3v4", key: "1olli1" }], ["path", { d: "M22 5h-4", key: "1gvqau" }], ["path", { d: "M4 17v2", key: "vumght" }], ["path", { d: "M5 18H3", key: "zchphs" }]]);
var Z5 = A("SquareCheckBig", [["path", { d: "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5", key: "1uzm8b" }], ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]]);
var J5 = A("SquarePen", [["path", { d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", key: "1m0v6g" }], ["path", { d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z", key: "ohrbg2" }]]);
var e6 = A("SquareSplitHorizontal", [["path", { d: "M8 19H5c-1 0-2-1-2-2V7c0-1 1-2 2-2h3", key: "lubmu8" }], ["path", { d: "M16 5h3c1 0 2 1 2 2v10c0 1-1 2-2 2h-3", key: "1ag34g" }], ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]]);
var t6 = A("SquareUser", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }], ["path", { d: "M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2", key: "1m6ac2" }]]);
var n6 = A("Square", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]]);
var r6 = A("Star", [["path", { d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z", key: "r04s7s" }]]);
var o6 = A("Store", [["path", { d: "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7", key: "ztvudi" }], ["path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", key: "1b2hhj" }], ["path", { d: "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4", key: "2ebpfo" }], ["path", { d: "M2 7h20", key: "1fcdvo" }], ["path", { d: "M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7", key: "6c3vgh" }]]);
var a6 = A("Table", [["path", { d: "M12 3v18", key: "108xh3" }], ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M3 9h18", key: "1pudct" }], ["path", { d: "M3 15h18", key: "5xshup" }]]);
var i6 = A("Tag", [["path", { d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z", key: "vktsd0" }], ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]]);
var l6 = A("Target", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["circle", { cx: "12", cy: "12", r: "6", key: "1vlfrh" }], ["circle", { cx: "12", cy: "12", r: "2", key: "1c9p78" }]]);
var s6 = A("ThumbsDown", [["path", { d: "M17 14V2", key: "8ymqnk" }], ["path", { d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z", key: "m61m77" }]]);
var c6 = A("ThumbsUp", [["path", { d: "M7 10v12", key: "1qc93n" }], ["path", { d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z", key: "emmmcr" }]]);
var u6 = A("Trash2", [["path", { d: "M3 6h18", key: "d0wm0j" }], ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }], ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }], ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }], ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]]);
var f6 = A("TrendingDown", [["polyline", { points: "22 17 13.5 8.5 8.5 13.5 2 7", key: "1r2t7k" }], ["polyline", { points: "16 17 22 17 22 11", key: "11uiuu" }]]);
var d6 = A("TrendingUp", [["polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17", key: "126l90" }], ["polyline", { points: "16 7 22 7 22 13", key: "kwv8wd" }]]);
var p6 = A("TriangleAlert", [["path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3", key: "wmoenq" }], ["path", { d: "M12 9v4", key: "juzpu7" }], ["path", { d: "M12 17h.01", key: "p32p05" }]]);
var h6 = A("Trophy", [["path", { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6", key: "17hqa7" }], ["path", { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", key: "lmptdp" }], ["path", { d: "M4 22h16", key: "57wxv0" }], ["path", { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", key: "1nw9bq" }], ["path", { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", key: "1np0yb" }], ["path", { d: "M18 2H6v7a6 6 0 0 0 12 0V2Z", key: "u46fv3" }]]);
var m6 = A("Truck", [["path", { d: "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2", key: "wrbu53" }], ["path", { d: "M15 18H9", key: "1lyqi6" }], ["path", { d: "M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14", key: "lysw3i" }], ["circle", { cx: "17", cy: "18", r: "2", key: "332jqn" }], ["circle", { cx: "7", cy: "18", r: "2", key: "19iecd" }]]);
var y6 = A("Twitter", [["path", { d: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z", key: "pff0z6" }]]);
var v6 = A("Upload", [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }], ["polyline", { points: "17 8 12 3 7 8", key: "t8dd8p" }], ["line", { x1: "12", x2: "12", y1: "3", y2: "15", key: "widbto" }]]);
var g6 = A("UserCheck", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["polyline", { points: "16 11 18 13 22 9", key: "1pwet4" }]]);
var w6 = A("UserCog", [["circle", { cx: "18", cy: "15", r: "3", key: "gjjjvw" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M10 15H6a4 4 0 0 0-4 4v2", key: "1nfge6" }], ["path", { d: "m21.7 16.4-.9-.3", key: "12j9ji" }], ["path", { d: "m15.2 13.9-.9-.3", key: "1fdjdi" }], ["path", { d: "m16.6 18.7.3-.9", key: "heedtr" }], ["path", { d: "m19.1 12.2.3-.9", key: "1af3ki" }], ["path", { d: "m19.6 18.7-.4-1", key: "1x9vze" }], ["path", { d: "m16.8 12.3-.4-1", key: "vqeiwj" }], ["path", { d: "m14.3 16.6 1-.4", key: "1qlj63" }], ["path", { d: "m20.7 13.8 1-.4", key: "1v5t8k" }]]);
var x6 = A("UserPlus", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }], ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]]);
var S6 = A("UserX", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }], ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]]);
var C6 = A("User", [["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }], ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]]);
var k6 = A("Users", [["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }], ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }], ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }], ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75", key: "1da9ce" }]]);
var E6 = A("Wallet", [["path", { d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1", key: "18etb6" }], ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]]);
var R6 = A("WifiOff", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }], ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }], ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }], ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }], ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }], ["path", { d: "m2 2 20 20", key: "1ooewy" }]]);
var P6 = A("Wifi", [["path", { d: "M12 20h.01", key: "zekei9" }], ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }], ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }], ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]]);
var b6 = A("Wind", [["path", { d: "M12.8 19.6A2 2 0 1 0 14 16H2", key: "148xed" }], ["path", { d: "M17.5 8a2.5 2.5 0 1 1 2 4H2", key: "1u4tom" }], ["path", { d: "M9.8 4.4A2 2 0 1 1 11 8H2", key: "75valh" }]]);
var T6 = A("Wrench", [["path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z", key: "cbrjhi" }]]);
var M6 = A("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]);
var A6 = A("Zap", [["path", { d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z", key: "1xq2db" }]]);
var _6 = A("ZoomIn", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }], ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]]);
var O6 = A("ZoomOut", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]]);
var _k = /* @__PURE__ */ Symbol.for("react.lazy");
var cl = uf[" use ".trim().toString()];
function Ok(t7) {
  return typeof t7 == "object" && t7 !== null && "then" in t7;
}
function dy(t7) {
  return t7 != null && typeof t7 == "object" && "$$typeof" in t7 && t7.$$typeof === _k && "_payload" in t7 && Ok(t7._payload);
}
function Dl(t7) {
  const r2 = Nk(t7), o = p.forwardRef((a, l) => {
    let { children: s, ...u2 } = a;
    dy(s) && typeof cl == "function" && (s = cl(s._payload));
    const f = p.Children.toArray(s), d = f.find(Dk);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
var N6 = Dl("Slot");
function Nk(t7) {
  const r2 = p.forwardRef((o, a) => {
    let { children: l, ...s } = o;
    if (dy(l) && typeof cl == "function" && (l = cl(l._payload)), p.isValidElement(l)) {
      const u2 = jk(l), f = Lk(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var Ik = /* @__PURE__ */ Symbol("radix.slottable");
function Dk(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === Ik;
}
function Lk(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function jk(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
function k1(t7) {
  const r2 = Fk(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(zk);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function Fk(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = Bk(l), f = Hk(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var $k = /* @__PURE__ */ Symbol("radix.slottable");
function zk(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === $k;
}
function Hk(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function Bk(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
function Aa(t7) {
  const r2 = t7 + "CollectionProvider", [o, a] = ot(r2), [l, s] = o(r2, { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }), u2 = (C) => {
    const { scope: x, children: R } = C, b = Oe.useRef(null), M = Oe.useRef(/* @__PURE__ */ new Map()).current;
    return E.jsx(l, { scope: x, itemMap: M, collectionRef: b, children: R });
  };
  u2.displayName = r2;
  const f = t7 + "CollectionSlot", d = k1(f), m = Oe.forwardRef((C, x) => {
    const { scope: R, children: b } = C, M = s(f, R), N = ve(x, M.collectionRef);
    return E.jsx(d, { ref: N, children: b });
  });
  m.displayName = f;
  const v = t7 + "CollectionItemSlot", g = "data-radix-collection-item", w = k1(v), k = Oe.forwardRef((C, x) => {
    const { scope: R, children: b, ...M } = C, N = Oe.useRef(null), j = ve(x, N), B = s(v, R);
    return Oe.useEffect(() => (B.itemMap.set(N, { ref: N, ...M }), () => {
      B.itemMap.delete(N);
    })), E.jsx(w, { [g]: "", ref: j, children: b });
  });
  k.displayName = v;
  function P(C) {
    const x = s(t7 + "CollectionConsumer", C);
    return Oe.useCallback(() => {
      const b = x.collectionRef.current;
      if (!b) return [];
      const M = Array.from(b.querySelectorAll(`[${g}]`));
      return Array.from(x.itemMap.values()).sort((B, z) => M.indexOf(B.ref.current) - M.indexOf(z.ref.current));
    }, [x.collectionRef, x.itemMap]);
  }
  return [{ Provider: u2, Slot: m, ItemSlot: k }, P, a];
}
var Vk = p.createContext(void 0);
function Cr(t7) {
  const r2 = p.useContext(Vk);
  return t7 || r2 || "ltr";
}
var Uk = ["top", "right", "bottom", "left"];
var Gn = Math.min;
var Rt = Math.max;
var ul = Math.round;
var Ji = Math.floor;
var cn = (t7) => ({ x: t7, y: t7 });
var Wk = { left: "right", right: "left", bottom: "top", top: "bottom" };
function Du(t7, r2, o) {
  return Rt(t7, Gn(r2, o));
}
function kn(t7, r2) {
  return typeof t7 == "function" ? t7(r2) : t7;
}
function En(t7) {
  return t7.split("-")[0];
}
function go(t7) {
  return t7.split("-")[1];
}
function kf(t7) {
  return t7 === "x" ? "y" : "x";
}
function Ef(t7) {
  return t7 === "y" ? "height" : "width";
}
function sn(t7) {
  const r2 = t7[0];
  return r2 === "t" || r2 === "b" ? "y" : "x";
}
function Rf(t7) {
  return kf(sn(t7));
}
function qk(t7, r2, o) {
  o === void 0 && (o = false);
  const a = go(t7), l = Rf(t7), s = Ef(l);
  let u2 = l === "x" ? a === (o ? "end" : "start") ? "right" : "left" : a === "start" ? "bottom" : "top";
  return r2.reference[s] > r2.floating[s] && (u2 = fl(u2)), [u2, fl(u2)];
}
function Kk(t7) {
  const r2 = fl(t7);
  return [Lu(t7), r2, Lu(r2)];
}
function Lu(t7) {
  return t7.includes("start") ? t7.replace("start", "end") : t7.replace("end", "start");
}
var E1 = ["left", "right"];
var R1 = ["right", "left"];
var Gk = ["top", "bottom"];
var Yk = ["bottom", "top"];
function Xk(t7, r2, o) {
  switch (t7) {
    case "top":
    case "bottom":
      return o ? r2 ? R1 : E1 : r2 ? E1 : R1;
    case "left":
    case "right":
      return r2 ? Gk : Yk;
    default:
      return [];
  }
}
function Qk(t7, r2, o, a) {
  const l = go(t7);
  let s = Xk(En(t7), o === "start", a);
  return l && (s = s.map((u2) => u2 + "-" + l), r2 && (s = s.concat(s.map(Lu)))), s;
}
function fl(t7) {
  const r2 = En(t7);
  return Wk[r2] + t7.slice(r2.length);
}
function Zk(t7) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...t7 };
}
function py(t7) {
  return typeof t7 != "number" ? Zk(t7) : { top: t7, right: t7, bottom: t7, left: t7 };
}
function dl(t7) {
  const { x: r2, y: o, width: a, height: l } = t7;
  return { width: a, height: l, top: o, left: r2, right: r2 + a, bottom: o + l, x: r2, y: o };
}
function P1(t7, r2, o) {
  let { reference: a, floating: l } = t7;
  const s = sn(r2), u2 = Rf(r2), f = Ef(u2), d = En(r2), m = s === "y", v = a.x + a.width / 2 - l.width / 2, g = a.y + a.height / 2 - l.height / 2, w = a[f] / 2 - l[f] / 2;
  let k;
  switch (d) {
    case "top":
      k = { x: v, y: a.y - l.height };
      break;
    case "bottom":
      k = { x: v, y: a.y + a.height };
      break;
    case "right":
      k = { x: a.x + a.width, y: g };
      break;
    case "left":
      k = { x: a.x - l.width, y: g };
      break;
    default:
      k = { x: a.x, y: a.y };
  }
  switch (go(r2)) {
    case "start":
      k[u2] -= w * (o && m ? -1 : 1);
      break;
    case "end":
      k[u2] += w * (o && m ? -1 : 1);
      break;
  }
  return k;
}
async function Jk(t7, r2) {
  var o;
  r2 === void 0 && (r2 = {});
  const { x: a, y: l, platform: s, rects: u2, elements: f, strategy: d } = t7, { boundary: m = "clippingAncestors", rootBoundary: v = "viewport", elementContext: g = "floating", altBoundary: w = false, padding: k = 0 } = kn(r2, t7), P = py(k), x = f[w ? g === "floating" ? "reference" : "floating" : g], R = dl(await s.getClippingRect({ element: (o = await (s.isElement == null ? void 0 : s.isElement(x))) == null || o ? x : x.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(f.floating)), boundary: m, rootBoundary: v, strategy: d })), b = g === "floating" ? { x: a, y: l, width: u2.floating.width, height: u2.floating.height } : u2.reference, M = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(f.floating)), N = await (s.isElement == null ? void 0 : s.isElement(M)) ? await (s.getScale == null ? void 0 : s.getScale(M)) || { x: 1, y: 1 } : { x: 1, y: 1 }, j = dl(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({ elements: f, rect: b, offsetParent: M, strategy: d }) : b);
  return { top: (R.top - j.top + P.top) / N.y, bottom: (j.bottom - R.bottom + P.bottom) / N.y, left: (R.left - j.left + P.left) / N.x, right: (j.right - R.right + P.right) / N.x };
}
var eE = 50;
var tE = async (t7, r2, o) => {
  const { placement: a = "bottom", strategy: l = "absolute", middleware: s = [], platform: u2 } = o, f = u2.detectOverflow ? u2 : { ...u2, detectOverflow: Jk }, d = await (u2.isRTL == null ? void 0 : u2.isRTL(r2));
  let m = await u2.getElementRects({ reference: t7, floating: r2, strategy: l }), { x: v, y: g } = P1(m, a, d), w = a, k = 0;
  const P = {};
  for (let C = 0; C < s.length; C++) {
    const x = s[C];
    if (!x) continue;
    const { name: R, fn: b } = x, { x: M, y: N, data: j, reset: B } = await b({ x: v, y: g, initialPlacement: a, placement: w, strategy: l, middlewareData: P, rects: m, platform: f, elements: { reference: t7, floating: r2 } });
    v = M ?? v, g = N ?? g, P[R] = { ...P[R], ...j }, B && k < eE && (k++, typeof B == "object" && (B.placement && (w = B.placement), B.rects && (m = B.rects === true ? await u2.getElementRects({ reference: t7, floating: r2, strategy: l }) : B.rects), { x: v, y: g } = P1(m, w, d)), C = -1);
  }
  return { x: v, y: g, placement: w, strategy: l, middlewareData: P };
};
var nE = (t7) => ({ name: "arrow", options: t7, async fn(r2) {
  const { x: o, y: a, placement: l, rects: s, platform: u2, elements: f, middlewareData: d } = r2, { element: m, padding: v = 0 } = kn(t7, r2) || {};
  if (m == null) return {};
  const g = py(v), w = { x: o, y: a }, k = Rf(l), P = Ef(k), C = await u2.getDimensions(m), x = k === "y", R = x ? "top" : "left", b = x ? "bottom" : "right", M = x ? "clientHeight" : "clientWidth", N = s.reference[P] + s.reference[k] - w[k] - s.floating[P], j = w[k] - s.reference[k], B = await (u2.getOffsetParent == null ? void 0 : u2.getOffsetParent(m));
  let z = B ? B[M] : 0;
  (!z || !await (u2.isElement == null ? void 0 : u2.isElement(B))) && (z = f.floating[M] || s.floating[P]);
  const Q = N / 2 - j / 2, Z = z / 2 - C[P] / 2 - 1, J = Gn(g[R], Z), ee = Gn(g[b], Z), ce = J, fe = z - C[P] - ee, de = z / 2 - C[P] / 2 + Q, ye = Du(ce, de, fe), re = !d.arrow && go(l) != null && de !== ye && s.reference[P] / 2 - (de < ce ? J : ee) - C[P] / 2 < 0, ae = re ? de < ce ? de - ce : de - fe : 0;
  return { [k]: w[k] + ae, data: { [k]: ye, centerOffset: de - ye - ae, ...re && { alignmentOffset: ae } }, reset: re };
} });
var rE = function(t7) {
  return t7 === void 0 && (t7 = {}), { name: "flip", options: t7, async fn(r2) {
    var o, a;
    const { placement: l, middlewareData: s, rects: u2, initialPlacement: f, platform: d, elements: m } = r2, { mainAxis: v = true, crossAxis: g = true, fallbackPlacements: w, fallbackStrategy: k = "bestFit", fallbackAxisSideDirection: P = "none", flipAlignment: C = true, ...x } = kn(t7, r2);
    if ((o = s.arrow) != null && o.alignmentOffset) return {};
    const R = En(l), b = sn(f), M = En(f) === f, N = await (d.isRTL == null ? void 0 : d.isRTL(m.floating)), j = w || (M || !C ? [fl(f)] : Kk(f)), B = P !== "none";
    !w && B && j.push(...Qk(f, C, P, N));
    const z = [f, ...j], Q = await d.detectOverflow(r2, x), Z = [];
    let J = ((a = s.flip) == null ? void 0 : a.overflows) || [];
    if (v && Z.push(Q[R]), g) {
      const de = qk(l, u2, N);
      Z.push(Q[de[0]], Q[de[1]]);
    }
    if (J = [...J, { placement: l, overflows: Z }], !Z.every((de) => de <= 0)) {
      var ee, ce;
      const de = (((ee = s.flip) == null ? void 0 : ee.index) || 0) + 1, ye = z[de];
      if (ye && (!(g === "alignment" ? b !== sn(ye) : false) || J.every(($) => sn($.placement) === b ? $.overflows[0] > 0 : true))) return { data: { index: de, overflows: J }, reset: { placement: ye } };
      let re = (ce = J.filter((ae) => ae.overflows[0] <= 0).sort((ae, $) => ae.overflows[1] - $.overflows[1])[0]) == null ? void 0 : ce.placement;
      if (!re) switch (k) {
        case "bestFit": {
          var fe;
          const ae = (fe = J.filter(($) => {
            if (B) {
              const H = sn($.placement);
              return H === b || H === "y";
            }
            return true;
          }).map(($) => [$.placement, $.overflows.filter((H) => H > 0).reduce((H, X2) => H + X2, 0)]).sort(($, H) => $[1] - H[1])[0]) == null ? void 0 : fe[0];
          ae && (re = ae);
          break;
        }
        case "initialPlacement":
          re = f;
          break;
      }
      if (l !== re) return { reset: { placement: re } };
    }
    return {};
  } };
};
function b1(t7, r2) {
  return { top: t7.top - r2.height, right: t7.right - r2.width, bottom: t7.bottom - r2.height, left: t7.left - r2.width };
}
function T1(t7) {
  return Uk.some((r2) => t7[r2] >= 0);
}
var oE = function(t7) {
  return t7 === void 0 && (t7 = {}), { name: "hide", options: t7, async fn(r2) {
    const { rects: o, platform: a } = r2, { strategy: l = "referenceHidden", ...s } = kn(t7, r2);
    switch (l) {
      case "referenceHidden": {
        const u2 = await a.detectOverflow(r2, { ...s, elementContext: "reference" }), f = b1(u2, o.reference);
        return { data: { referenceHiddenOffsets: f, referenceHidden: T1(f) } };
      }
      case "escaped": {
        const u2 = await a.detectOverflow(r2, { ...s, altBoundary: true }), f = b1(u2, o.floating);
        return { data: { escapedOffsets: f, escaped: T1(f) } };
      }
      default:
        return {};
    }
  } };
};
var hy = /* @__PURE__ */ new Set(["left", "top"]);
async function aE(t7, r2) {
  const { placement: o, platform: a, elements: l } = t7, s = await (a.isRTL == null ? void 0 : a.isRTL(l.floating)), u2 = En(o), f = go(o), d = sn(o) === "y", m = hy.has(u2) ? -1 : 1, v = s && d ? -1 : 1, g = kn(r2, t7);
  let { mainAxis: w, crossAxis: k, alignmentAxis: P } = typeof g == "number" ? { mainAxis: g, crossAxis: 0, alignmentAxis: null } : { mainAxis: g.mainAxis || 0, crossAxis: g.crossAxis || 0, alignmentAxis: g.alignmentAxis };
  return f && typeof P == "number" && (k = f === "end" ? P * -1 : P), d ? { x: k * v, y: w * m } : { x: w * m, y: k * v };
}
var iE = function(t7) {
  return t7 === void 0 && (t7 = 0), { name: "offset", options: t7, async fn(r2) {
    var o, a;
    const { x: l, y: s, placement: u2, middlewareData: f } = r2, d = await aE(r2, t7);
    return u2 === ((o = f.offset) == null ? void 0 : o.placement) && (a = f.arrow) != null && a.alignmentOffset ? {} : { x: l + d.x, y: s + d.y, data: { ...d, placement: u2 } };
  } };
};
var lE = function(t7) {
  return t7 === void 0 && (t7 = {}), { name: "shift", options: t7, async fn(r2) {
    const { x: o, y: a, placement: l, platform: s } = r2, { mainAxis: u2 = true, crossAxis: f = false, limiter: d = { fn: (R) => {
      let { x: b, y: M } = R;
      return { x: b, y: M };
    } }, ...m } = kn(t7, r2), v = { x: o, y: a }, g = await s.detectOverflow(r2, m), w = sn(En(l)), k = kf(w);
    let P = v[k], C = v[w];
    if (u2) {
      const R = k === "y" ? "top" : "left", b = k === "y" ? "bottom" : "right", M = P + g[R], N = P - g[b];
      P = Du(M, P, N);
    }
    if (f) {
      const R = w === "y" ? "top" : "left", b = w === "y" ? "bottom" : "right", M = C + g[R], N = C - g[b];
      C = Du(M, C, N);
    }
    const x = d.fn({ ...r2, [k]: P, [w]: C });
    return { ...x, data: { x: x.x - o, y: x.y - a, enabled: { [k]: u2, [w]: f } } };
  } };
};
var sE = function(t7) {
  return t7 === void 0 && (t7 = {}), { options: t7, fn(r2) {
    const { x: o, y: a, placement: l, rects: s, middlewareData: u2 } = r2, { offset: f = 0, mainAxis: d = true, crossAxis: m = true } = kn(t7, r2), v = { x: o, y: a }, g = sn(l), w = kf(g);
    let k = v[w], P = v[g];
    const C = kn(f, r2), x = typeof C == "number" ? { mainAxis: C, crossAxis: 0 } : { mainAxis: 0, crossAxis: 0, ...C };
    if (d) {
      const M = w === "y" ? "height" : "width", N = s.reference[w] - s.floating[M] + x.mainAxis, j = s.reference[w] + s.reference[M] - x.mainAxis;
      k < N ? k = N : k > j && (k = j);
    }
    if (m) {
      var R, b;
      const M = w === "y" ? "width" : "height", N = hy.has(En(l)), j = s.reference[g] - s.floating[M] + (N && ((R = u2.offset) == null ? void 0 : R[g]) || 0) + (N ? 0 : x.crossAxis), B = s.reference[g] + s.reference[M] + (N ? 0 : ((b = u2.offset) == null ? void 0 : b[g]) || 0) - (N ? x.crossAxis : 0);
      P < j ? P = j : P > B && (P = B);
    }
    return { [w]: k, [g]: P };
  } };
};
var cE = function(t7) {
  return t7 === void 0 && (t7 = {}), { name: "size", options: t7, async fn(r2) {
    var o, a;
    const { placement: l, rects: s, platform: u2, elements: f } = r2, { apply: d = () => {
    }, ...m } = kn(t7, r2), v = await u2.detectOverflow(r2, m), g = En(l), w = go(l), k = sn(l) === "y", { width: P, height: C } = s.floating;
    let x, R;
    g === "top" || g === "bottom" ? (x = g, R = w === (await (u2.isRTL == null ? void 0 : u2.isRTL(f.floating)) ? "start" : "end") ? "left" : "right") : (R = g, x = w === "end" ? "top" : "bottom");
    const b = C - v.top - v.bottom, M = P - v.left - v.right, N = Gn(C - v[x], b), j = Gn(P - v[R], M), B = !r2.middlewareData.shift;
    let z = N, Q = j;
    if ((o = r2.middlewareData.shift) != null && o.enabled.x && (Q = M), (a = r2.middlewareData.shift) != null && a.enabled.y && (z = b), B && !w) {
      const J = Rt(v.left, 0), ee = Rt(v.right, 0), ce = Rt(v.top, 0), fe = Rt(v.bottom, 0);
      k ? Q = P - 2 * (J !== 0 || ee !== 0 ? J + ee : Rt(v.left, v.right)) : z = C - 2 * (ce !== 0 || fe !== 0 ? ce + fe : Rt(v.top, v.bottom));
    }
    await d({ ...r2, availableWidth: Q, availableHeight: z });
    const Z = await u2.getDimensions(f.floating);
    return P !== Z.width || C !== Z.height ? { reset: { rects: true } } : {};
  } };
};
function Ll() {
  return typeof window < "u";
}
function wo(t7) {
  return my(t7) ? (t7.nodeName || "").toLowerCase() : "#document";
}
function Pt(t7) {
  var r2;
  return (t7 == null || (r2 = t7.ownerDocument) == null ? void 0 : r2.defaultView) || window;
}
function fn(t7) {
  var r2;
  return (r2 = (my(t7) ? t7.ownerDocument : t7.document) || window.document) == null ? void 0 : r2.documentElement;
}
function my(t7) {
  return Ll() ? t7 instanceof Node || t7 instanceof Pt(t7).Node : false;
}
function Yt(t7) {
  return Ll() ? t7 instanceof Element || t7 instanceof Pt(t7).Element : false;
}
function Rn(t7) {
  return Ll() ? t7 instanceof HTMLElement || t7 instanceof Pt(t7).HTMLElement : false;
}
function M1(t7) {
  return !Ll() || typeof ShadowRoot > "u" ? false : t7 instanceof ShadowRoot || t7 instanceof Pt(t7).ShadowRoot;
}
function _a(t7) {
  const { overflow: r2, overflowX: o, overflowY: a, display: l } = Xt(t7);
  return /auto|scroll|overlay|hidden|clip/.test(r2 + a + o) && l !== "inline" && l !== "contents";
}
function uE(t7) {
  return /^(table|td|th)$/.test(wo(t7));
}
function jl(t7) {
  try {
    if (t7.matches(":popover-open")) return true;
  } catch {
  }
  try {
    return t7.matches(":modal");
  } catch {
    return false;
  }
}
var fE = /transform|translate|scale|rotate|perspective|filter/;
var dE = /paint|layout|strict|content/;
var mr = (t7) => !!t7 && t7 !== "none";
var yu;
function Pf(t7) {
  const r2 = Yt(t7) ? Xt(t7) : t7;
  return mr(r2.transform) || mr(r2.translate) || mr(r2.scale) || mr(r2.rotate) || mr(r2.perspective) || !bf() && (mr(r2.backdropFilter) || mr(r2.filter)) || fE.test(r2.willChange || "") || dE.test(r2.contain || "");
}
function pE(t7) {
  let r2 = Yn(t7);
  for (; Rn(r2) && !lo(r2); ) {
    if (Pf(r2)) return r2;
    if (jl(r2)) return null;
    r2 = Yn(r2);
  }
  return null;
}
function bf() {
  return yu == null && (yu = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), yu;
}
function lo(t7) {
  return /^(html|body|#document)$/.test(wo(t7));
}
function Xt(t7) {
  return Pt(t7).getComputedStyle(t7);
}
function Fl(t7) {
  return Yt(t7) ? { scrollLeft: t7.scrollLeft, scrollTop: t7.scrollTop } : { scrollLeft: t7.scrollX, scrollTop: t7.scrollY };
}
function Yn(t7) {
  if (wo(t7) === "html") return t7;
  const r2 = t7.assignedSlot || t7.parentNode || M1(t7) && t7.host || fn(t7);
  return M1(r2) ? r2.host : r2;
}
function yy(t7) {
  const r2 = Yn(t7);
  return lo(r2) ? t7.ownerDocument ? t7.ownerDocument.body : t7.body : Rn(r2) && _a(r2) ? r2 : yy(r2);
}
function ga(t7, r2, o) {
  var a;
  r2 === void 0 && (r2 = []), o === void 0 && (o = true);
  const l = yy(t7), s = l === ((a = t7.ownerDocument) == null ? void 0 : a.body), u2 = Pt(l);
  if (s) {
    const f = ju(u2);
    return r2.concat(u2, u2.visualViewport || [], _a(l) ? l : [], f && o ? ga(f) : []);
  } else return r2.concat(l, ga(l, [], o));
}
function ju(t7) {
  return t7.parent && Object.getPrototypeOf(t7.parent) ? t7.frameElement : null;
}
function vy(t7) {
  const r2 = Xt(t7);
  let o = parseFloat(r2.width) || 0, a = parseFloat(r2.height) || 0;
  const l = Rn(t7), s = l ? t7.offsetWidth : o, u2 = l ? t7.offsetHeight : a, f = ul(o) !== s || ul(a) !== u2;
  return f && (o = s, a = u2), { width: o, height: a, $: f };
}
function Tf(t7) {
  return Yt(t7) ? t7 : t7.contextElement;
}
function oo(t7) {
  const r2 = Tf(t7);
  if (!Rn(r2)) return cn(1);
  const o = r2.getBoundingClientRect(), { width: a, height: l, $: s } = vy(r2);
  let u2 = (s ? ul(o.width) : o.width) / a, f = (s ? ul(o.height) : o.height) / l;
  return (!u2 || !Number.isFinite(u2)) && (u2 = 1), (!f || !Number.isFinite(f)) && (f = 1), { x: u2, y: f };
}
var hE = cn(0);
function gy(t7) {
  const r2 = Pt(t7);
  return !bf() || !r2.visualViewport ? hE : { x: r2.visualViewport.offsetLeft, y: r2.visualViewport.offsetTop };
}
function mE(t7, r2, o) {
  return r2 === void 0 && (r2 = false), !o || r2 && o !== Pt(t7) ? false : r2;
}
function gr(t7, r2, o, a) {
  r2 === void 0 && (r2 = false), o === void 0 && (o = false);
  const l = t7.getBoundingClientRect(), s = Tf(t7);
  let u2 = cn(1);
  r2 && (a ? Yt(a) && (u2 = oo(a)) : u2 = oo(t7));
  const f = mE(s, o, a) ? gy(s) : cn(0);
  let d = (l.left + f.x) / u2.x, m = (l.top + f.y) / u2.y, v = l.width / u2.x, g = l.height / u2.y;
  if (s) {
    const w = Pt(s), k = a && Yt(a) ? Pt(a) : a;
    let P = w, C = ju(P);
    for (; C && a && k !== P; ) {
      const x = oo(C), R = C.getBoundingClientRect(), b = Xt(C), M = R.left + (C.clientLeft + parseFloat(b.paddingLeft)) * x.x, N = R.top + (C.clientTop + parseFloat(b.paddingTop)) * x.y;
      d *= x.x, m *= x.y, v *= x.x, g *= x.y, d += M, m += N, P = Pt(C), C = ju(P);
    }
  }
  return dl({ width: v, height: g, x: d, y: m });
}
function $l(t7, r2) {
  const o = Fl(t7).scrollLeft;
  return r2 ? r2.left + o : gr(fn(t7)).left + o;
}
function wy(t7, r2) {
  const o = t7.getBoundingClientRect(), a = o.left + r2.scrollLeft - $l(t7, o), l = o.top + r2.scrollTop;
  return { x: a, y: l };
}
function yE(t7) {
  let { elements: r2, rect: o, offsetParent: a, strategy: l } = t7;
  const s = l === "fixed", u2 = fn(a), f = r2 ? jl(r2.floating) : false;
  if (a === u2 || f && s) return o;
  let d = { scrollLeft: 0, scrollTop: 0 }, m = cn(1);
  const v = cn(0), g = Rn(a);
  if ((g || !g && !s) && ((wo(a) !== "body" || _a(u2)) && (d = Fl(a)), g)) {
    const k = gr(a);
    m = oo(a), v.x = k.x + a.clientLeft, v.y = k.y + a.clientTop;
  }
  const w = u2 && !g && !s ? wy(u2, d) : cn(0);
  return { width: o.width * m.x, height: o.height * m.y, x: o.x * m.x - d.scrollLeft * m.x + v.x + w.x, y: o.y * m.y - d.scrollTop * m.y + v.y + w.y };
}
function vE(t7) {
  return Array.from(t7.getClientRects());
}
function gE(t7) {
  const r2 = fn(t7), o = Fl(t7), a = t7.ownerDocument.body, l = Rt(r2.scrollWidth, r2.clientWidth, a.scrollWidth, a.clientWidth), s = Rt(r2.scrollHeight, r2.clientHeight, a.scrollHeight, a.clientHeight);
  let u2 = -o.scrollLeft + $l(t7);
  const f = -o.scrollTop;
  return Xt(a).direction === "rtl" && (u2 += Rt(r2.clientWidth, a.clientWidth) - l), { width: l, height: s, x: u2, y: f };
}
var A1 = 25;
function wE(t7, r2) {
  const o = Pt(t7), a = fn(t7), l = o.visualViewport;
  let s = a.clientWidth, u2 = a.clientHeight, f = 0, d = 0;
  if (l) {
    s = l.width, u2 = l.height;
    const v = bf();
    (!v || v && r2 === "fixed") && (f = l.offsetLeft, d = l.offsetTop);
  }
  const m = $l(a);
  if (m <= 0) {
    const v = a.ownerDocument, g = v.body, w = getComputedStyle(g), k = v.compatMode === "CSS1Compat" && parseFloat(w.marginLeft) + parseFloat(w.marginRight) || 0, P = Math.abs(a.clientWidth - g.clientWidth - k);
    P <= A1 && (s -= P);
  } else m <= A1 && (s += m);
  return { width: s, height: u2, x: f, y: d };
}
function xE(t7, r2) {
  const o = gr(t7, true, r2 === "fixed"), a = o.top + t7.clientTop, l = o.left + t7.clientLeft, s = Rn(t7) ? oo(t7) : cn(1), u2 = t7.clientWidth * s.x, f = t7.clientHeight * s.y, d = l * s.x, m = a * s.y;
  return { width: u2, height: f, x: d, y: m };
}
function _1(t7, r2, o) {
  let a;
  if (r2 === "viewport") a = wE(t7, o);
  else if (r2 === "document") a = gE(fn(t7));
  else if (Yt(r2)) a = xE(r2, o);
  else {
    const l = gy(t7);
    a = { x: r2.x - l.x, y: r2.y - l.y, width: r2.width, height: r2.height };
  }
  return dl(a);
}
function xy(t7, r2) {
  const o = Yn(t7);
  return o === r2 || !Yt(o) || lo(o) ? false : Xt(o).position === "fixed" || xy(o, r2);
}
function SE(t7, r2) {
  const o = r2.get(t7);
  if (o) return o;
  let a = ga(t7, [], false).filter((f) => Yt(f) && wo(f) !== "body"), l = null;
  const s = Xt(t7).position === "fixed";
  let u2 = s ? Yn(t7) : t7;
  for (; Yt(u2) && !lo(u2); ) {
    const f = Xt(u2), d = Pf(u2);
    !d && f.position === "fixed" && (l = null), (s ? !d && !l : !d && f.position === "static" && !!l && (l.position === "absolute" || l.position === "fixed") || _a(u2) && !d && xy(t7, u2)) ? a = a.filter((v) => v !== u2) : l = f, u2 = Yn(u2);
  }
  return r2.set(t7, a), a;
}
function CE(t7) {
  let { element: r2, boundary: o, rootBoundary: a, strategy: l } = t7;
  const u2 = [...o === "clippingAncestors" ? jl(r2) ? [] : SE(r2, this._c) : [].concat(o), a], f = _1(r2, u2[0], l);
  let d = f.top, m = f.right, v = f.bottom, g = f.left;
  for (let w = 1; w < u2.length; w++) {
    const k = _1(r2, u2[w], l);
    d = Rt(k.top, d), m = Gn(k.right, m), v = Gn(k.bottom, v), g = Rt(k.left, g);
  }
  return { width: m - g, height: v - d, x: g, y: d };
}
function kE(t7) {
  const { width: r2, height: o } = vy(t7);
  return { width: r2, height: o };
}
function EE(t7, r2, o) {
  const a = Rn(r2), l = fn(r2), s = o === "fixed", u2 = gr(t7, true, s, r2);
  let f = { scrollLeft: 0, scrollTop: 0 };
  const d = cn(0);
  function m() {
    d.x = $l(l);
  }
  if (a || !a && !s) if ((wo(r2) !== "body" || _a(l)) && (f = Fl(r2)), a) {
    const k = gr(r2, true, s, r2);
    d.x = k.x + r2.clientLeft, d.y = k.y + r2.clientTop;
  } else l && m();
  s && !a && l && m();
  const v = l && !a && !s ? wy(l, f) : cn(0), g = u2.left + f.scrollLeft - d.x - v.x, w = u2.top + f.scrollTop - d.y - v.y;
  return { x: g, y: w, width: u2.width, height: u2.height };
}
function vu(t7) {
  return Xt(t7).position === "static";
}
function O1(t7, r2) {
  if (!Rn(t7) || Xt(t7).position === "fixed") return null;
  if (r2) return r2(t7);
  let o = t7.offsetParent;
  return fn(t7) === o && (o = o.ownerDocument.body), o;
}
function Sy(t7, r2) {
  const o = Pt(t7);
  if (jl(t7)) return o;
  if (!Rn(t7)) {
    let l = Yn(t7);
    for (; l && !lo(l); ) {
      if (Yt(l) && !vu(l)) return l;
      l = Yn(l);
    }
    return o;
  }
  let a = O1(t7, r2);
  for (; a && uE(a) && vu(a); ) a = O1(a, r2);
  return a && lo(a) && vu(a) && !Pf(a) ? o : a || pE(t7) || o;
}
var RE = async function(t7) {
  const r2 = this.getOffsetParent || Sy, o = this.getDimensions, a = await o(t7.floating);
  return { reference: EE(t7.reference, await r2(t7.floating), t7.strategy), floating: { x: 0, y: 0, width: a.width, height: a.height } };
};
function PE(t7) {
  return Xt(t7).direction === "rtl";
}
var bE = { convertOffsetParentRelativeRectToViewportRelativeRect: yE, getDocumentElement: fn, getClippingRect: CE, getOffsetParent: Sy, getElementRects: RE, getClientRects: vE, getDimensions: kE, getScale: oo, isElement: Yt, isRTL: PE };
function Cy(t7, r2) {
  return t7.x === r2.x && t7.y === r2.y && t7.width === r2.width && t7.height === r2.height;
}
function TE(t7, r2) {
  let o = null, a;
  const l = fn(t7);
  function s() {
    var f;
    clearTimeout(a), (f = o) == null || f.disconnect(), o = null;
  }
  function u2(f, d) {
    f === void 0 && (f = false), d === void 0 && (d = 1), s();
    const m = t7.getBoundingClientRect(), { left: v, top: g, width: w, height: k } = m;
    if (f || r2(), !w || !k) return;
    const P = Ji(g), C = Ji(l.clientWidth - (v + w)), x = Ji(l.clientHeight - (g + k)), R = Ji(v), M = { rootMargin: -P + "px " + -C + "px " + -x + "px " + -R + "px", threshold: Rt(0, Gn(1, d)) || 1 };
    let N = true;
    function j(B) {
      const z = B[0].intersectionRatio;
      if (z !== d) {
        if (!N) return u2();
        z ? u2(false, z) : a = setTimeout(() => {
          u2(false, 1e-7);
        }, 1e3);
      }
      z === 1 && !Cy(m, t7.getBoundingClientRect()) && u2(), N = false;
    }
    try {
      o = new IntersectionObserver(j, { ...M, root: l.ownerDocument });
    } catch {
      o = new IntersectionObserver(j, M);
    }
    o.observe(t7);
  }
  return u2(true), s;
}
function ME(t7, r2, o, a) {
  a === void 0 && (a = {});
  const { ancestorScroll: l = true, ancestorResize: s = true, elementResize: u2 = typeof ResizeObserver == "function", layoutShift: f = typeof IntersectionObserver == "function", animationFrame: d = false } = a, m = Tf(t7), v = l || s ? [...m ? ga(m) : [], ...r2 ? ga(r2) : []] : [];
  v.forEach((R) => {
    l && R.addEventListener("scroll", o, { passive: true }), s && R.addEventListener("resize", o);
  });
  const g = m && f ? TE(m, o) : null;
  let w = -1, k = null;
  u2 && (k = new ResizeObserver((R) => {
    let [b] = R;
    b && b.target === m && k && r2 && (k.unobserve(r2), cancelAnimationFrame(w), w = requestAnimationFrame(() => {
      var M;
      (M = k) == null || M.observe(r2);
    })), o();
  }), m && !d && k.observe(m), r2 && k.observe(r2));
  let P, C = d ? gr(t7) : null;
  d && x();
  function x() {
    const R = gr(t7);
    C && !Cy(C, R) && o(), C = R, P = requestAnimationFrame(x);
  }
  return o(), () => {
    var R;
    v.forEach((b) => {
      l && b.removeEventListener("scroll", o), s && b.removeEventListener("resize", o);
    }), g?.(), (R = k) == null || R.disconnect(), k = null, d && cancelAnimationFrame(P);
  };
}
var AE = iE;
var _E = lE;
var OE = rE;
var NE = cE;
var IE = oE;
var N1 = nE;
var DE = sE;
var LE = (t7, r2, o) => {
  const a = /* @__PURE__ */ new Map(), l = { platform: bE, ...o }, s = { ...l.platform, _c: a };
  return tE(t7, r2, { ...l, platform: s });
};
var jE = typeof document < "u";
var FE = function() {
};
var al = jE ? p.useLayoutEffect : FE;
function pl(t7, r2) {
  if (t7 === r2) return true;
  if (typeof t7 != typeof r2) return false;
  if (typeof t7 == "function" && t7.toString() === r2.toString()) return true;
  let o, a, l;
  if (t7 && r2 && typeof t7 == "object") {
    if (Array.isArray(t7)) {
      if (o = t7.length, o !== r2.length) return false;
      for (a = o; a-- !== 0; ) if (!pl(t7[a], r2[a])) return false;
      return true;
    }
    if (l = Object.keys(t7), o = l.length, o !== Object.keys(r2).length) return false;
    for (a = o; a-- !== 0; ) if (!{}.hasOwnProperty.call(r2, l[a])) return false;
    for (a = o; a-- !== 0; ) {
      const s = l[a];
      if (!(s === "_owner" && t7.$$typeof) && !pl(t7[s], r2[s])) return false;
    }
    return true;
  }
  return t7 !== t7 && r2 !== r2;
}
function ky(t7) {
  return typeof window > "u" ? 1 : (t7.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function I1(t7, r2) {
  const o = ky(t7);
  return Math.round(r2 * o) / o;
}
function gu(t7) {
  const r2 = p.useRef(t7);
  return al(() => {
    r2.current = t7;
  }), r2;
}
function $E(t7) {
  t7 === void 0 && (t7 = {});
  const { placement: r2 = "bottom", strategy: o = "absolute", middleware: a = [], platform: l, elements: { reference: s, floating: u2 } = {}, transform: f = true, whileElementsMounted: d, open: m } = t7, [v, g] = p.useState({ x: 0, y: 0, strategy: o, placement: r2, middlewareData: {}, isPositioned: false }), [w, k] = p.useState(a);
  pl(w, a) || k(a);
  const [P, C] = p.useState(null), [x, R] = p.useState(null), b = p.useCallback(($) => {
    $ !== B.current && (B.current = $, C($));
  }, []), M = p.useCallback(($) => {
    $ !== z.current && (z.current = $, R($));
  }, []), N = s || P, j = u2 || x, B = p.useRef(null), z = p.useRef(null), Q = p.useRef(v), Z = d != null, J = gu(d), ee = gu(l), ce = gu(m), fe = p.useCallback(() => {
    if (!B.current || !z.current) return;
    const $ = { placement: r2, strategy: o, middleware: w };
    ee.current && ($.platform = ee.current), LE(B.current, z.current, $).then((H) => {
      const X2 = { ...H, isPositioned: ce.current !== false };
      de.current && !pl(Q.current, X2) && (Q.current = X2, ba.flushSync(() => {
        g(X2);
      }));
    });
  }, [w, r2, o, ee, ce]);
  al(() => {
    m === false && Q.current.isPositioned && (Q.current.isPositioned = false, g(($) => ({ ...$, isPositioned: false })));
  }, [m]);
  const de = p.useRef(false);
  al(() => (de.current = true, () => {
    de.current = false;
  }), []), al(() => {
    if (N && (B.current = N), j && (z.current = j), N && j) {
      if (J.current) return J.current(N, j, fe);
      fe();
    }
  }, [N, j, fe, J, Z]);
  const ye = p.useMemo(() => ({ reference: B, floating: z, setReference: b, setFloating: M }), [b, M]), re = p.useMemo(() => ({ reference: N, floating: j }), [N, j]), ae = p.useMemo(() => {
    const $ = { position: o, left: 0, top: 0 };
    if (!re.floating) return $;
    const H = I1(re.floating, v.x), X2 = I1(re.floating, v.y);
    return f ? { ...$, transform: "translate(" + H + "px, " + X2 + "px)", ...ky(re.floating) >= 1.5 && { willChange: "transform" } } : { position: o, left: H, top: X2 };
  }, [o, f, re.floating, v.x, v.y]);
  return p.useMemo(() => ({ ...v, update: fe, refs: ye, elements: re, floatingStyles: ae }), [v, fe, ye, re, ae]);
}
var zE = (t7) => {
  function r2(o) {
    return {}.hasOwnProperty.call(o, "current");
  }
  return { name: "arrow", options: t7, fn(o) {
    const { element: a, padding: l } = typeof t7 == "function" ? t7(o) : t7;
    return a && r2(a) ? a.current != null ? N1({ element: a.current, padding: l }).fn(o) : {} : a ? N1({ element: a, padding: l }).fn(o) : {};
  } };
};
var HE = (t7, r2) => {
  const o = AE(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var BE = (t7, r2) => {
  const o = _E(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var VE = (t7, r2) => ({ fn: DE(t7).fn, options: [t7, r2] });
var UE = (t7, r2) => {
  const o = OE(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var WE = (t7, r2) => {
  const o = NE(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var qE = (t7, r2) => {
  const o = IE(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var KE = (t7, r2) => {
  const o = zE(t7);
  return { name: o.name, fn: o.fn, options: [t7, r2] };
};
var GE = "Arrow";
var Ey = p.forwardRef((t7, r2) => {
  const { children: o, width: a = 10, height: l = 5, ...s } = t7;
  return E.jsx(le.svg, { ...s, ref: r2, width: a, height: l, viewBox: "0 0 30 10", preserveAspectRatio: "none", children: t7.asChild ? o : E.jsx("polygon", { points: "0,0 30,0 15,10" }) });
});
Ey.displayName = GE;
var YE = Ey;
function zl(t7) {
  const [r2, o] = p.useState(void 0);
  return Ze(() => {
    if (t7) {
      o({ width: t7.offsetWidth, height: t7.offsetHeight });
      const a = new ResizeObserver((l) => {
        if (!Array.isArray(l) || !l.length) return;
        const s = l[0];
        let u2, f;
        if ("borderBoxSize" in s) {
          const d = s.borderBoxSize, m = Array.isArray(d) ? d[0] : d;
          u2 = m.inlineSize, f = m.blockSize;
        } else u2 = t7.offsetWidth, f = t7.offsetHeight;
        o({ width: u2, height: f });
      });
      return a.observe(t7, { box: "border-box" }), () => a.unobserve(t7);
    } else o(void 0);
  }, [t7]), r2;
}
var Mf = "Popper";
var [Ry, Xn] = ot(Mf);
var [XE, Py] = Ry(Mf);
var by = (t7) => {
  const { __scopePopper: r2, children: o } = t7, [a, l] = p.useState(null);
  return E.jsx(XE, { scope: r2, anchor: a, onAnchorChange: l, children: o });
};
by.displayName = Mf;
var Ty = "PopperAnchor";
var My = p.forwardRef((t7, r2) => {
  const { __scopePopper: o, virtualRef: a, ...l } = t7, s = Py(Ty, o), u2 = p.useRef(null), f = ve(r2, u2), d = p.useRef(null);
  return p.useEffect(() => {
    const m = d.current;
    d.current = a?.current || u2.current, m !== d.current && s.onAnchorChange(d.current);
  }), a ? null : E.jsx(le.div, { ...l, ref: f });
});
My.displayName = Ty;
var Af = "PopperContent";
var [QE, ZE] = Ry(Af);
var Ay = p.forwardRef((t7, r2) => {
  const { __scopePopper: o, side: a = "bottom", sideOffset: l = 0, align: s = "center", alignOffset: u2 = 0, arrowPadding: f = 0, avoidCollisions: d = true, collisionBoundary: m = [], collisionPadding: v = 0, sticky: g = "partial", hideWhenDetached: w = false, updatePositionStrategy: k = "optimized", onPlaced: P, ...C } = t7, x = Py(Af, o), [R, b] = p.useState(null), M = ve(r2, (Y) => b(Y)), [N, j] = p.useState(null), B = zl(N), z = B?.width ?? 0, Q = B?.height ?? 0, Z = a + (s !== "center" ? "-" + s : ""), J = typeof v == "number" ? v : { top: 0, right: 0, bottom: 0, left: 0, ...v }, ee = Array.isArray(m) ? m : [m], ce = ee.length > 0, fe = { padding: J, boundary: ee.filter(eR), altBoundary: ce }, { refs: de, floatingStyles: ye, placement: re, isPositioned: ae, middlewareData: $ } = $E({ strategy: "fixed", placement: Z, whileElementsMounted: (...Y) => ME(...Y, { animationFrame: k === "always" }), elements: { reference: x.anchor }, middleware: [HE({ mainAxis: l + Q, alignmentAxis: u2 }), d && BE({ mainAxis: true, crossAxis: false, limiter: g === "partial" ? VE() : void 0, ...fe }), d && UE({ ...fe }), WE({ ...fe, apply: ({ elements: Y, rects: ue, availableWidth: Ee, availableHeight: Re }) => {
    const { width: Ae, height: $e } = ue.reference, Je = Y.floating.style;
    Je.setProperty("--radix-popper-available-width", `${Ee}px`), Je.setProperty("--radix-popper-available-height", `${Re}px`), Je.setProperty("--radix-popper-anchor-width", `${Ae}px`), Je.setProperty("--radix-popper-anchor-height", `${$e}px`);
  } }), N && KE({ element: N, padding: f }), tR({ arrowWidth: z, arrowHeight: Q }), w && qE({ strategy: "referenceHidden", ...fe })] }), [H, X2] = Ny(re), I = rt(P);
  Ze(() => {
    ae && I?.();
  }, [ae, I]);
  const V = $.arrow?.x, we = $.arrow?.y, ge = $.arrow?.centerOffset !== 0, [ke, Se] = p.useState();
  return Ze(() => {
    R && Se(window.getComputedStyle(R).zIndex);
  }, [R]), E.jsx("div", { ref: de.setFloating, "data-radix-popper-content-wrapper": "", style: { ...ye, transform: ae ? ye.transform : "translate(0, -200%)", minWidth: "max-content", zIndex: ke, "--radix-popper-transform-origin": [$.transformOrigin?.x, $.transformOrigin?.y].join(" "), ...$.hide?.referenceHidden && { visibility: "hidden", pointerEvents: "none" } }, dir: t7.dir, children: E.jsx(QE, { scope: o, placedSide: H, onArrowChange: j, arrowX: V, arrowY: we, shouldHideArrow: ge, children: E.jsx(le.div, { "data-side": H, "data-align": X2, ...C, ref: M, style: { ...C.style, animation: ae ? void 0 : "none" } }) }) });
});
Ay.displayName = Af;
var _y = "PopperArrow";
var JE = { top: "bottom", right: "left", bottom: "top", left: "right" };
var Oy = p.forwardRef(function(r2, o) {
  const { __scopePopper: a, ...l } = r2, s = ZE(_y, a), u2 = JE[s.placedSide];
  return E.jsx("span", { ref: s.onArrowChange, style: { position: "absolute", left: s.arrowX, top: s.arrowY, [u2]: 0, transformOrigin: { top: "", right: "0 0", bottom: "center 0", left: "100% 0" }[s.placedSide], transform: { top: "translateY(100%)", right: "translateY(50%) rotate(90deg) translateX(-50%)", bottom: "rotate(180deg)", left: "translateY(50%) rotate(-90deg) translateX(50%)" }[s.placedSide], visibility: s.shouldHideArrow ? "hidden" : void 0 }, children: E.jsx(YE, { ...l, ref: o, style: { ...l.style, display: "block" } }) });
});
Oy.displayName = _y;
function eR(t7) {
  return t7 !== null;
}
var tR = (t7) => ({ name: "transformOrigin", options: t7, fn(r2) {
  const { placement: o, rects: a, middlewareData: l } = r2, u2 = l.arrow?.centerOffset !== 0, f = u2 ? 0 : t7.arrowWidth, d = u2 ? 0 : t7.arrowHeight, [m, v] = Ny(o), g = { start: "0%", center: "50%", end: "100%" }[v], w = (l.arrow?.x ?? 0) + f / 2, k = (l.arrow?.y ?? 0) + d / 2;
  let P = "", C = "";
  return m === "bottom" ? (P = u2 ? g : `${w}px`, C = `${-d}px`) : m === "top" ? (P = u2 ? g : `${w}px`, C = `${a.floating.height + d}px`) : m === "right" ? (P = `${-d}px`, C = u2 ? g : `${k}px`) : m === "left" && (P = `${a.floating.width + d}px`, C = u2 ? g : `${k}px`), { data: { x: P, y: C } };
} });
function Ny(t7) {
  const [r2, o = "center"] = t7.split("-");
  return [r2, o];
}
var Hl = by;
var Oa = My;
var Bl = Ay;
var Vl = Oy;
var wu = "rovingFocusGroup.onEntryFocus";
var nR = { bubbles: false, cancelable: true };
var Na = "RovingFocusGroup";
var [Fu, Iy, rR] = Aa(Na);
var [oR, Ul] = ot(Na, [rR]);
var [aR, iR] = oR(Na);
var Dy = p.forwardRef((t7, r2) => E.jsx(Fu.Provider, { scope: t7.__scopeRovingFocusGroup, children: E.jsx(Fu.Slot, { scope: t7.__scopeRovingFocusGroup, children: E.jsx(lR, { ...t7, ref: r2 }) }) }));
Dy.displayName = Na;
var lR = p.forwardRef((t7, r2) => {
  const { __scopeRovingFocusGroup: o, orientation: a, loop: l = false, dir: s, currentTabStopId: u2, defaultCurrentTabStopId: f, onCurrentTabStopIdChange: d, onEntryFocus: m, preventScrollOnEntryFocus: v = false, ...g } = t7, w = p.useRef(null), k = ve(r2, w), P = Cr(s), [C, x] = xt({ prop: u2, defaultProp: f ?? null, onChange: d, caller: Na }), [R, b] = p.useState(false), M = rt(m), N = Iy(o), j = p.useRef(false), [B, z] = p.useState(0);
  return p.useEffect(() => {
    const Q = w.current;
    if (Q) return Q.addEventListener(wu, M), () => Q.removeEventListener(wu, M);
  }, [M]), E.jsx(aR, { scope: o, orientation: a, dir: P, loop: l, currentTabStopId: C, onItemFocus: p.useCallback((Q) => x(Q), [x]), onItemShiftTab: p.useCallback(() => b(true), []), onFocusableItemAdd: p.useCallback(() => z((Q) => Q + 1), []), onFocusableItemRemove: p.useCallback(() => z((Q) => Q - 1), []), children: E.jsx(le.div, { tabIndex: R || B === 0 ? -1 : 0, "data-orientation": a, ...g, ref: k, style: { outline: "none", ...t7.style }, onMouseDown: u(t7.onMouseDown, () => {
    j.current = true;
  }), onFocus: u(t7.onFocus, (Q) => {
    const Z = !j.current;
    if (Q.target === Q.currentTarget && Z && !R) {
      const J = new CustomEvent(wu, nR);
      if (Q.currentTarget.dispatchEvent(J), !J.defaultPrevented) {
        const ee = N().filter((re) => re.focusable), ce = ee.find((re) => re.active), fe = ee.find((re) => re.id === C), ye = [ce, fe, ...ee].filter(Boolean).map((re) => re.ref.current);
        Fy(ye, v);
      }
    }
    j.current = false;
  }), onBlur: u(t7.onBlur, () => b(false)) }) });
});
var Ly = "RovingFocusGroupItem";
var jy = p.forwardRef((t7, r2) => {
  const { __scopeRovingFocusGroup: o, focusable: a = true, active: l = false, tabStopId: s, children: u2, ...f } = t7, d = wt(), m = s || d, v = iR(Ly, o), g = v.currentTabStopId === m, w = Iy(o), { onFocusableItemAdd: k, onFocusableItemRemove: P, currentTabStopId: C } = v;
  return p.useEffect(() => {
    if (a) return k(), () => P();
  }, [a, k, P]), E.jsx(Fu.ItemSlot, { scope: o, id: m, focusable: a, active: l, children: E.jsx(le.span, { tabIndex: g ? 0 : -1, "data-orientation": v.orientation, ...f, ref: r2, onMouseDown: u(t7.onMouseDown, (x) => {
    a ? v.onItemFocus(m) : x.preventDefault();
  }), onFocus: u(t7.onFocus, () => v.onItemFocus(m)), onKeyDown: u(t7.onKeyDown, (x) => {
    if (x.key === "Tab" && x.shiftKey) {
      v.onItemShiftTab();
      return;
    }
    if (x.target !== x.currentTarget) return;
    const R = uR(x, v.orientation, v.dir);
    if (R !== void 0) {
      if (x.metaKey || x.ctrlKey || x.altKey || x.shiftKey) return;
      x.preventDefault();
      let M = w().filter((N) => N.focusable).map((N) => N.ref.current);
      if (R === "last") M.reverse();
      else if (R === "prev" || R === "next") {
        R === "prev" && M.reverse();
        const N = M.indexOf(x.currentTarget);
        M = v.loop ? fR(M, N + 1) : M.slice(N + 1);
      }
      setTimeout(() => Fy(M));
    }
  }), children: typeof u2 == "function" ? u2({ isCurrentTabStop: g, hasTabStop: C != null }) : u2 }) });
});
jy.displayName = Ly;
var sR = { ArrowLeft: "prev", ArrowUp: "prev", ArrowRight: "next", ArrowDown: "next", PageUp: "first", Home: "first", PageDown: "last", End: "last" };
function cR(t7, r2) {
  return r2 !== "rtl" ? t7 : t7 === "ArrowLeft" ? "ArrowRight" : t7 === "ArrowRight" ? "ArrowLeft" : t7;
}
function uR(t7, r2, o) {
  const a = cR(t7.key, o);
  if (!(r2 === "vertical" && ["ArrowLeft", "ArrowRight"].includes(a)) && !(r2 === "horizontal" && ["ArrowUp", "ArrowDown"].includes(a))) return sR[a];
}
function Fy(t7, r2 = false) {
  const o = document.activeElement;
  for (const a of t7) if (a === o || (a.focus({ preventScroll: r2 }), document.activeElement !== o)) return;
}
function fR(t7, r2) {
  return t7.map((o, a) => t7[(r2 + a) % t7.length]);
}
var $y = Dy;
var zy = jy;
function dR(t7) {
  const r2 = pR(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(mR);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function pR(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = vR(l), f = yR(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var hR = /* @__PURE__ */ Symbol("radix.slottable");
function mR(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === hR;
}
function yR(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function vR(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
var $u = ["Enter", " "];
var gR = ["ArrowDown", "PageUp", "Home"];
var Hy = ["ArrowUp", "PageDown", "End"];
var wR = [...gR, ...Hy];
var xR = { ltr: [...$u, "ArrowRight"], rtl: [...$u, "ArrowLeft"] };
var SR = { ltr: ["ArrowLeft"], rtl: ["ArrowRight"] };
var Ia = "Menu";
var [wa, CR, kR] = Aa(Ia);
var [kr, By] = ot(Ia, [kR, Xn, Ul]);
var Wl = Xn();
var Vy = Ul();
var [ER, Er] = kr(Ia);
var [RR, Da] = kr(Ia);
var Uy = (t7) => {
  const { __scopeMenu: r2, open: o = false, children: a, dir: l, onOpenChange: s, modal: u2 = true } = t7, f = Wl(r2), [d, m] = p.useState(null), v = p.useRef(false), g = rt(s), w = Cr(l);
  return p.useEffect(() => {
    const k = () => {
      v.current = true, document.addEventListener("pointerdown", P, { capture: true, once: true }), document.addEventListener("pointermove", P, { capture: true, once: true });
    }, P = () => v.current = false;
    return document.addEventListener("keydown", k, { capture: true }), () => {
      document.removeEventListener("keydown", k, { capture: true }), document.removeEventListener("pointerdown", P, { capture: true }), document.removeEventListener("pointermove", P, { capture: true });
    };
  }, []), E.jsx(Hl, { ...f, children: E.jsx(ER, { scope: r2, open: o, onOpenChange: g, content: d, onContentChange: m, children: E.jsx(RR, { scope: r2, onClose: p.useCallback(() => g(false), [g]), isUsingKeyboardRef: v, dir: w, modal: u2, children: a }) }) });
};
Uy.displayName = Ia;
var PR = "MenuAnchor";
var _f = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, ...a } = t7, l = Wl(o);
  return E.jsx(Oa, { ...l, ...a, ref: r2 });
});
_f.displayName = PR;
var Of = "MenuPortal";
var [bR, Wy] = kr(Of, { forceMount: void 0 });
var qy = (t7) => {
  const { __scopeMenu: r2, forceMount: o, children: a, container: l } = t7, s = Er(Of, r2);
  return E.jsx(bR, { scope: r2, forceMount: o, children: E.jsx(Ge, { present: o || s.open, children: E.jsx(vo, { asChild: true, container: l, children: a }) }) });
};
qy.displayName = Of;
var It = "MenuContent";
var [TR, Nf] = kr(It);
var Ky = p.forwardRef((t7, r2) => {
  const o = Wy(It, t7.__scopeMenu), { forceMount: a = o.forceMount, ...l } = t7, s = Er(It, t7.__scopeMenu), u2 = Da(It, t7.__scopeMenu);
  return E.jsx(wa.Provider, { scope: t7.__scopeMenu, children: E.jsx(Ge, { present: a || s.open, children: E.jsx(wa.Slot, { scope: t7.__scopeMenu, children: u2.modal ? E.jsx(MR, { ...l, ref: r2 }) : E.jsx(AR, { ...l, ref: r2 }) }) }) });
});
var MR = p.forwardRef((t7, r2) => {
  const o = Er(It, t7.__scopeMenu), a = p.useRef(null), l = ve(r2, a);
  return p.useEffect(() => {
    const s = a.current;
    if (s) return Nl(s);
  }, []), E.jsx(If, { ...t7, ref: l, trapFocus: o.open, disableOutsidePointerEvents: o.open, disableOutsideScroll: true, onFocusOutside: u(t7.onFocusOutside, (s) => s.preventDefault(), { checkForDefaultPrevented: false }), onDismiss: () => o.onOpenChange(false) });
});
var AR = p.forwardRef((t7, r2) => {
  const o = Er(It, t7.__scopeMenu);
  return E.jsx(If, { ...t7, ref: r2, trapFocus: false, disableOutsidePointerEvents: false, disableOutsideScroll: false, onDismiss: () => o.onOpenChange(false) });
});
var _R = dR("MenuContent.ScrollLock");
var If = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, loop: a = false, trapFocus: l, onOpenAutoFocus: s, onCloseAutoFocus: u2, disableOutsidePointerEvents: f, onEntryFocus: d, onEscapeKeyDown: m, onPointerDownOutside: v, onFocusOutside: g, onInteractOutside: w, onDismiss: k, disableOutsideScroll: P, ...C } = t7, x = Er(It, o), R = Da(It, o), b = Wl(o), M = Vy(o), N = CR(o), [j, B] = p.useState(null), z = p.useRef(null), Q = ve(r2, z, x.onContentChange), Z = p.useRef(0), J = p.useRef(""), ee = p.useRef(0), ce = p.useRef(null), fe = p.useRef("right"), de = p.useRef(0), ye = P ? Ma : p.Fragment, re = P ? { as: _R, allowPinchZoom: true } : void 0, ae = (H) => {
    const X2 = J.current + H, I = N().filter((Y) => !Y.disabled), V = document.activeElement, we = I.find((Y) => Y.ref.current === V)?.textValue, ge = I.map((Y) => Y.textValue), ke = VR(ge, X2, we), Se = I.find((Y) => Y.textValue === ke)?.ref.current;
    (function Y(ue) {
      J.current = ue, window.clearTimeout(Z.current), ue !== "" && (Z.current = window.setTimeout(() => Y(""), 1e3));
    })(X2), Se && setTimeout(() => Se.focus());
  };
  p.useEffect(() => () => window.clearTimeout(Z.current), []), _l();
  const $ = p.useCallback((H) => fe.current === ce.current?.side && WR(H, ce.current?.area), []);
  return E.jsx(TR, { scope: o, searchRef: J, onItemEnter: p.useCallback((H) => {
    $(H) && H.preventDefault();
  }, [$]), onItemLeave: p.useCallback((H) => {
    $(H) || (z.current?.focus(), B(null));
  }, [$]), onTriggerLeave: p.useCallback((H) => {
    $(H) && H.preventDefault();
  }, [$]), pointerGraceTimerRef: ee, onPointerGraceIntentChange: p.useCallback((H) => {
    ce.current = H;
  }, []), children: E.jsx(ye, { ...re, children: E.jsx(Ta, { asChild: true, trapped: l, onMountAutoFocus: u(s, (H) => {
    H.preventDefault(), z.current?.focus({ preventScroll: true });
  }), onUnmountAutoFocus: u2, children: E.jsx(yo, { asChild: true, disableOutsidePointerEvents: f, onEscapeKeyDown: m, onPointerDownOutside: v, onFocusOutside: g, onInteractOutside: w, onDismiss: k, children: E.jsx($y, { asChild: true, ...M, dir: R.dir, orientation: "vertical", loop: a, currentTabStopId: j, onCurrentTabStopIdChange: B, onEntryFocus: u(d, (H) => {
    R.isUsingKeyboardRef.current || H.preventDefault();
  }), preventScrollOnEntryFocus: true, children: E.jsx(Bl, { role: "menu", "aria-orientation": "vertical", "data-state": cv(x.open), "data-radix-menu-content": "", dir: R.dir, ...b, ...C, ref: Q, style: { outline: "none", ...C.style }, onKeyDown: u(C.onKeyDown, (H) => {
    const I = H.target.closest("[data-radix-menu-content]") === H.currentTarget, V = H.ctrlKey || H.altKey || H.metaKey, we = H.key.length === 1;
    I && (H.key === "Tab" && H.preventDefault(), !V && we && ae(H.key));
    const ge = z.current;
    if (H.target !== ge || !wR.includes(H.key)) return;
    H.preventDefault();
    const Se = N().filter((Y) => !Y.disabled).map((Y) => Y.ref.current);
    Hy.includes(H.key) && Se.reverse(), HR(Se);
  }), onBlur: u(t7.onBlur, (H) => {
    H.currentTarget.contains(H.target) || (window.clearTimeout(Z.current), J.current = "");
  }), onPointerMove: u(t7.onPointerMove, xa((H) => {
    const X2 = H.target, I = de.current !== H.clientX;
    if (H.currentTarget.contains(X2) && I) {
      const V = H.clientX > de.current ? "right" : "left";
      fe.current = V, de.current = H.clientX;
    }
  })) }) }) }) }) }) });
});
Ky.displayName = It;
var OR = "MenuGroup";
var Df = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, ...a } = t7;
  return E.jsx(le.div, { role: "group", ...a, ref: r2 });
});
Df.displayName = OR;
var NR = "MenuLabel";
var Gy = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, ...a } = t7;
  return E.jsx(le.div, { ...a, ref: r2 });
});
Gy.displayName = NR;
var hl = "MenuItem";
var D1 = "menu.itemSelect";
var ql = p.forwardRef((t7, r2) => {
  const { disabled: o = false, onSelect: a, ...l } = t7, s = p.useRef(null), u2 = Da(hl, t7.__scopeMenu), f = Nf(hl, t7.__scopeMenu), d = ve(r2, s), m = p.useRef(false), v = () => {
    const g = s.current;
    if (!o && g) {
      const w = new CustomEvent(D1, { bubbles: true, cancelable: true });
      g.addEventListener(D1, (k) => a?.(k), { once: true }), Dm(g, w), w.defaultPrevented ? m.current = false : u2.onClose();
    }
  };
  return E.jsx(Yy, { ...l, ref: d, disabled: o, onClick: u(t7.onClick, v), onPointerDown: (g) => {
    t7.onPointerDown?.(g), m.current = true;
  }, onPointerUp: u(t7.onPointerUp, (g) => {
    m.current || g.currentTarget?.click();
  }), onKeyDown: u(t7.onKeyDown, (g) => {
    const w = f.searchRef.current !== "";
    o || w && g.key === " " || $u.includes(g.key) && (g.currentTarget.click(), g.preventDefault());
  }) });
});
ql.displayName = hl;
var Yy = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, disabled: a = false, textValue: l, ...s } = t7, u2 = Nf(hl, o), f = Vy(o), d = p.useRef(null), m = ve(r2, d), [v, g] = p.useState(false), [w, k] = p.useState("");
  return p.useEffect(() => {
    const P = d.current;
    P && k((P.textContent ?? "").trim());
  }, [s.children]), E.jsx(wa.ItemSlot, { scope: o, disabled: a, textValue: l ?? w, children: E.jsx(zy, { asChild: true, ...f, focusable: !a, children: E.jsx(le.div, { role: "menuitem", "data-highlighted": v ? "" : void 0, "aria-disabled": a || void 0, "data-disabled": a ? "" : void 0, ...s, ref: m, onPointerMove: u(t7.onPointerMove, xa((P) => {
    a ? u2.onItemLeave(P) : (u2.onItemEnter(P), P.defaultPrevented || P.currentTarget.focus({ preventScroll: true }));
  })), onPointerLeave: u(t7.onPointerLeave, xa((P) => u2.onItemLeave(P))), onFocus: u(t7.onFocus, () => g(true)), onBlur: u(t7.onBlur, () => g(false)) }) }) });
});
var IR = "MenuCheckboxItem";
var Xy = p.forwardRef((t7, r2) => {
  const { checked: o = false, onCheckedChange: a, ...l } = t7;
  return E.jsx(tv, { scope: t7.__scopeMenu, checked: o, children: E.jsx(ql, { role: "menuitemcheckbox", "aria-checked": ml(o) ? "mixed" : o, ...l, ref: r2, "data-state": jf(o), onSelect: u(l.onSelect, () => a?.(ml(o) ? true : !o), { checkForDefaultPrevented: false }) }) });
});
Xy.displayName = IR;
var Qy = "MenuRadioGroup";
var [DR, LR] = kr(Qy, { value: void 0, onValueChange: () => {
} });
var Zy = p.forwardRef((t7, r2) => {
  const { value: o, onValueChange: a, ...l } = t7, s = rt(a);
  return E.jsx(DR, { scope: t7.__scopeMenu, value: o, onValueChange: s, children: E.jsx(Df, { ...l, ref: r2 }) });
});
Zy.displayName = Qy;
var Jy = "MenuRadioItem";
var ev = p.forwardRef((t7, r2) => {
  const { value: o, ...a } = t7, l = LR(Jy, t7.__scopeMenu), s = o === l.value;
  return E.jsx(tv, { scope: t7.__scopeMenu, checked: s, children: E.jsx(ql, { role: "menuitemradio", "aria-checked": s, ...a, ref: r2, "data-state": jf(s), onSelect: u(a.onSelect, () => l.onValueChange?.(o), { checkForDefaultPrevented: false }) }) });
});
ev.displayName = Jy;
var Lf = "MenuItemIndicator";
var [tv, jR] = kr(Lf, { checked: false });
var nv = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, forceMount: a, ...l } = t7, s = jR(Lf, o);
  return E.jsx(Ge, { present: a || ml(s.checked) || s.checked === true, children: E.jsx(le.span, { ...l, ref: r2, "data-state": jf(s.checked) }) });
});
nv.displayName = Lf;
var FR = "MenuSeparator";
var rv = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, ...a } = t7;
  return E.jsx(le.div, { role: "separator", "aria-orientation": "horizontal", ...a, ref: r2 });
});
rv.displayName = FR;
var $R = "MenuArrow";
var ov = p.forwardRef((t7, r2) => {
  const { __scopeMenu: o, ...a } = t7, l = Wl(o);
  return E.jsx(Vl, { ...l, ...a, ref: r2 });
});
ov.displayName = $R;
var zR = "MenuSub";
var [I6, av] = kr(zR);
var da = "MenuSubTrigger";
var iv = p.forwardRef((t7, r2) => {
  const o = Er(da, t7.__scopeMenu), a = Da(da, t7.__scopeMenu), l = av(da, t7.__scopeMenu), s = Nf(da, t7.__scopeMenu), u2 = p.useRef(null), { pointerGraceTimerRef: f, onPointerGraceIntentChange: d } = s, m = { __scopeMenu: t7.__scopeMenu }, v = p.useCallback(() => {
    u2.current && window.clearTimeout(u2.current), u2.current = null;
  }, []);
  return p.useEffect(() => v, [v]), p.useEffect(() => {
    const g = f.current;
    return () => {
      window.clearTimeout(g), d(null);
    };
  }, [f, d]), E.jsx(_f, { asChild: true, ...m, children: E.jsx(Yy, { id: l.triggerId, "aria-haspopup": "menu", "aria-expanded": o.open, "aria-controls": l.contentId, "data-state": cv(o.open), ...t7, ref: un(r2, l.onTriggerChange), onClick: (g) => {
    t7.onClick?.(g), !(t7.disabled || g.defaultPrevented) && (g.currentTarget.focus(), o.open || o.onOpenChange(true));
  }, onPointerMove: u(t7.onPointerMove, xa((g) => {
    s.onItemEnter(g), !g.defaultPrevented && !t7.disabled && !o.open && !u2.current && (s.onPointerGraceIntentChange(null), u2.current = window.setTimeout(() => {
      o.onOpenChange(true), v();
    }, 100));
  })), onPointerLeave: u(t7.onPointerLeave, xa((g) => {
    v();
    const w = o.content?.getBoundingClientRect();
    if (w) {
      const k = o.content?.dataset.side, P = k === "right", C = P ? -5 : 5, x = w[P ? "left" : "right"], R = w[P ? "right" : "left"];
      s.onPointerGraceIntentChange({ area: [{ x: g.clientX + C, y: g.clientY }, { x, y: w.top }, { x: R, y: w.top }, { x: R, y: w.bottom }, { x, y: w.bottom }], side: k }), window.clearTimeout(f.current), f.current = window.setTimeout(() => s.onPointerGraceIntentChange(null), 300);
    } else {
      if (s.onTriggerLeave(g), g.defaultPrevented) return;
      s.onPointerGraceIntentChange(null);
    }
  })), onKeyDown: u(t7.onKeyDown, (g) => {
    const w = s.searchRef.current !== "";
    t7.disabled || w && g.key === " " || xR[a.dir].includes(g.key) && (o.onOpenChange(true), o.content?.focus(), g.preventDefault());
  }) }) });
});
iv.displayName = da;
var lv = "MenuSubContent";
var sv = p.forwardRef((t7, r2) => {
  const o = Wy(It, t7.__scopeMenu), { forceMount: a = o.forceMount, ...l } = t7, s = Er(It, t7.__scopeMenu), u2 = Da(It, t7.__scopeMenu), f = av(lv, t7.__scopeMenu), d = p.useRef(null), m = ve(r2, d);
  return E.jsx(wa.Provider, { scope: t7.__scopeMenu, children: E.jsx(Ge, { present: a || s.open, children: E.jsx(wa.Slot, { scope: t7.__scopeMenu, children: E.jsx(If, { id: f.contentId, "aria-labelledby": f.triggerId, ...l, ref: m, align: "start", side: u2.dir === "rtl" ? "left" : "right", disableOutsidePointerEvents: false, disableOutsideScroll: false, trapFocus: false, onOpenAutoFocus: (v) => {
    u2.isUsingKeyboardRef.current && d.current?.focus(), v.preventDefault();
  }, onCloseAutoFocus: (v) => v.preventDefault(), onFocusOutside: u(t7.onFocusOutside, (v) => {
    v.target !== f.trigger && s.onOpenChange(false);
  }), onEscapeKeyDown: u(t7.onEscapeKeyDown, (v) => {
    u2.onClose(), v.preventDefault();
  }), onKeyDown: u(t7.onKeyDown, (v) => {
    const g = v.currentTarget.contains(v.target), w = SR[u2.dir].includes(v.key);
    g && w && (s.onOpenChange(false), f.trigger?.focus(), v.preventDefault());
  }) }) }) }) });
});
sv.displayName = lv;
function cv(t7) {
  return t7 ? "open" : "closed";
}
function ml(t7) {
  return t7 === "indeterminate";
}
function jf(t7) {
  return ml(t7) ? "indeterminate" : t7 ? "checked" : "unchecked";
}
function HR(t7) {
  const r2 = document.activeElement;
  for (const o of t7) if (o === r2 || (o.focus(), document.activeElement !== r2)) return;
}
function BR(t7, r2) {
  return t7.map((o, a) => t7[(r2 + a) % t7.length]);
}
function VR(t7, r2, o) {
  const l = r2.length > 1 && Array.from(r2).every((m) => m === r2[0]) ? r2[0] : r2, s = o ? t7.indexOf(o) : -1;
  let u2 = BR(t7, Math.max(s, 0));
  l.length === 1 && (u2 = u2.filter((m) => m !== o));
  const d = u2.find((m) => m.toLowerCase().startsWith(l.toLowerCase()));
  return d !== o ? d : void 0;
}
function UR(t7, r2) {
  const { x: o, y: a } = t7;
  let l = false;
  for (let s = 0, u2 = r2.length - 1; s < r2.length; u2 = s++) {
    const f = r2[s], d = r2[u2], m = f.x, v = f.y, g = d.x, w = d.y;
    v > a != w > a && o < (g - m) * (a - v) / (w - v) + m && (l = !l);
  }
  return l;
}
function WR(t7, r2) {
  if (!r2) return false;
  const o = { x: t7.clientX, y: t7.clientY };
  return UR(o, r2);
}
function xa(t7) {
  return (r2) => r2.pointerType === "mouse" ? t7(r2) : void 0;
}
var qR = Uy;
var KR = _f;
var GR = qy;
var YR = Ky;
var XR = Df;
var QR = Gy;
var ZR = ql;
var JR = Xy;
var eP = Zy;
var tP = ev;
var nP = nv;
var rP = rv;
var oP = ov;
var aP = iv;
var iP = sv;
var Kl = "DropdownMenu";
var [lP] = ot(Kl, [By]);
var ft = By();
var [sP, uv] = lP(Kl);
var fv = (t7) => {
  const { __scopeDropdownMenu: r2, children: o, dir: a, open: l, defaultOpen: s, onOpenChange: u2, modal: f = true } = t7, d = ft(r2), m = p.useRef(null), [v, g] = xt({ prop: l, defaultProp: s ?? false, onChange: u2, caller: Kl });
  return E.jsx(sP, { scope: r2, triggerId: wt(), triggerRef: m, contentId: wt(), open: v, onOpenChange: g, onOpenToggle: p.useCallback(() => g((w) => !w), [g]), modal: f, children: E.jsx(qR, { ...d, open: v, onOpenChange: g, dir: a, modal: f, children: o }) });
};
fv.displayName = Kl;
var dv = "DropdownMenuTrigger";
var pv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, disabled: a = false, ...l } = t7, s = uv(dv, o), u2 = ft(o);
  return E.jsx(KR, { asChild: true, ...u2, children: E.jsx(le.button, { type: "button", id: s.triggerId, "aria-haspopup": "menu", "aria-expanded": s.open, "aria-controls": s.open ? s.contentId : void 0, "data-state": s.open ? "open" : "closed", "data-disabled": a ? "" : void 0, disabled: a, ...l, ref: un(r2, s.triggerRef), onPointerDown: u(t7.onPointerDown, (f) => {
    !a && f.button === 0 && f.ctrlKey === false && (s.onOpenToggle(), s.open || f.preventDefault());
  }), onKeyDown: u(t7.onKeyDown, (f) => {
    a || (["Enter", " "].includes(f.key) && s.onOpenToggle(), f.key === "ArrowDown" && s.onOpenChange(true), ["Enter", " ", "ArrowDown"].includes(f.key) && f.preventDefault());
  }) }) });
});
pv.displayName = dv;
var cP = "DropdownMenuPortal";
var hv = (t7) => {
  const { __scopeDropdownMenu: r2, ...o } = t7, a = ft(r2);
  return E.jsx(GR, { ...a, ...o });
};
hv.displayName = cP;
var mv = "DropdownMenuContent";
var yv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = uv(mv, o), s = ft(o), u2 = p.useRef(false);
  return E.jsx(YR, { id: l.contentId, "aria-labelledby": l.triggerId, ...s, ...a, ref: r2, onCloseAutoFocus: u(t7.onCloseAutoFocus, (f) => {
    u2.current || l.triggerRef.current?.focus(), u2.current = false, f.preventDefault();
  }), onInteractOutside: u(t7.onInteractOutside, (f) => {
    const d = f.detail.originalEvent, m = d.button === 0 && d.ctrlKey === true, v = d.button === 2 || m;
    (!l.modal || v) && (u2.current = true);
  }), style: { ...t7.style, "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)", "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)", "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)", "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)", "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)" } });
});
yv.displayName = mv;
var uP = "DropdownMenuGroup";
var fP = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(XR, { ...l, ...a, ref: r2 });
});
fP.displayName = uP;
var dP = "DropdownMenuLabel";
var vv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(QR, { ...l, ...a, ref: r2 });
});
vv.displayName = dP;
var pP = "DropdownMenuItem";
var gv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(ZR, { ...l, ...a, ref: r2 });
});
gv.displayName = pP;
var hP = "DropdownMenuCheckboxItem";
var wv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(JR, { ...l, ...a, ref: r2 });
});
wv.displayName = hP;
var mP = "DropdownMenuRadioGroup";
var yP = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(eP, { ...l, ...a, ref: r2 });
});
yP.displayName = mP;
var vP = "DropdownMenuRadioItem";
var xv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(tP, { ...l, ...a, ref: r2 });
});
xv.displayName = vP;
var gP = "DropdownMenuItemIndicator";
var Sv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(nP, { ...l, ...a, ref: r2 });
});
Sv.displayName = gP;
var wP = "DropdownMenuSeparator";
var Cv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(rP, { ...l, ...a, ref: r2 });
});
Cv.displayName = wP;
var xP = "DropdownMenuArrow";
var SP = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(oP, { ...l, ...a, ref: r2 });
});
SP.displayName = xP;
var CP = "DropdownMenuSubTrigger";
var kv = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(aP, { ...l, ...a, ref: r2 });
});
kv.displayName = CP;
var kP = "DropdownMenuSubContent";
var Ev = p.forwardRef((t7, r2) => {
  const { __scopeDropdownMenu: o, ...a } = t7, l = ft(o);
  return E.jsx(iP, { ...l, ...a, ref: r2, style: { ...t7.style, "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)", "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)", "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)", "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)", "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)" } });
});
Ev.displayName = kP;
var EP = /* @__PURE__ */ Symbol("radix.slottable");
function RP(t7) {
  const r2 = ({ children: o }) => E.jsx(E.Fragment, { children: o });
  return r2.displayName = `${t7}.Slottable`, r2.__radixId = EP, r2;
}
var Rv = Object.freeze({ position: "absolute", border: 0, width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", wordWrap: "normal" });
var PP = "VisuallyHidden";
var Pv = p.forwardRef((t7, r2) => E.jsx(le.span, { ...t7, ref: r2, style: { ...Rv, ...t7.style } }));
Pv.displayName = PP;
var bP = Pv;
var [Gl] = ot("Tooltip", [Xn]);
var Yl = Xn();
var bv = "TooltipProvider";
var TP = 700;
var zu = "tooltip.open";
var [MP, Ff] = Gl(bv);
var Tv = (t7) => {
  const { __scopeTooltip: r2, delayDuration: o = TP, skipDelayDuration: a = 300, disableHoverableContent: l = false, children: s } = t7, u2 = p.useRef(true), f = p.useRef(false), d = p.useRef(0);
  return p.useEffect(() => {
    const m = d.current;
    return () => window.clearTimeout(m);
  }, []), E.jsx(MP, { scope: r2, isOpenDelayedRef: u2, delayDuration: o, onOpen: p.useCallback(() => {
    window.clearTimeout(d.current), u2.current = false;
  }, []), onClose: p.useCallback(() => {
    window.clearTimeout(d.current), d.current = window.setTimeout(() => u2.current = true, a);
  }, [a]), isPointerInTransitRef: f, onPointerInTransitChange: p.useCallback((m) => {
    f.current = m;
  }, []), disableHoverableContent: l, children: s });
};
Tv.displayName = bv;
var Sa = "Tooltip";
var [AP, La] = Gl(Sa);
var Mv = (t7) => {
  const { __scopeTooltip: r2, children: o, open: a, defaultOpen: l, onOpenChange: s, disableHoverableContent: u2, delayDuration: f } = t7, d = Ff(Sa, t7.__scopeTooltip), m = Yl(r2), [v, g] = p.useState(null), w = wt(), k = p.useRef(0), P = u2 ?? d.disableHoverableContent, C = f ?? d.delayDuration, x = p.useRef(false), [R, b] = xt({ prop: a, defaultProp: l ?? false, onChange: (z) => {
    z ? (d.onOpen(), document.dispatchEvent(new CustomEvent(zu))) : d.onClose(), s?.(z);
  }, caller: Sa }), M = p.useMemo(() => R ? x.current ? "delayed-open" : "instant-open" : "closed", [R]), N = p.useCallback(() => {
    window.clearTimeout(k.current), k.current = 0, x.current = false, b(true);
  }, [b]), j = p.useCallback(() => {
    window.clearTimeout(k.current), k.current = 0, b(false);
  }, [b]), B = p.useCallback(() => {
    window.clearTimeout(k.current), k.current = window.setTimeout(() => {
      x.current = true, b(true), k.current = 0;
    }, C);
  }, [C, b]);
  return p.useEffect(() => () => {
    k.current && (window.clearTimeout(k.current), k.current = 0);
  }, []), E.jsx(Hl, { ...m, children: E.jsx(AP, { scope: r2, contentId: w, open: R, stateAttribute: M, trigger: v, onTriggerChange: g, onTriggerEnter: p.useCallback(() => {
    d.isOpenDelayedRef.current ? B() : N();
  }, [d.isOpenDelayedRef, B, N]), onTriggerLeave: p.useCallback(() => {
    P ? j() : (window.clearTimeout(k.current), k.current = 0);
  }, [j, P]), onOpen: N, onClose: j, disableHoverableContent: P, children: o }) });
};
Mv.displayName = Sa;
var Hu = "TooltipTrigger";
var Av = p.forwardRef((t7, r2) => {
  const { __scopeTooltip: o, ...a } = t7, l = La(Hu, o), s = Ff(Hu, o), u2 = Yl(o), f = p.useRef(null), d = ve(r2, f, l.onTriggerChange), m = p.useRef(false), v = p.useRef(false), g = p.useCallback(() => m.current = false, []);
  return p.useEffect(() => () => document.removeEventListener("pointerup", g), [g]), E.jsx(Oa, { asChild: true, ...u2, children: E.jsx(le.button, { "aria-describedby": l.open ? l.contentId : void 0, "data-state": l.stateAttribute, ...a, ref: d, onPointerMove: u(t7.onPointerMove, (w) => {
    w.pointerType !== "touch" && !v.current && !s.isPointerInTransitRef.current && (l.onTriggerEnter(), v.current = true);
  }), onPointerLeave: u(t7.onPointerLeave, () => {
    l.onTriggerLeave(), v.current = false;
  }), onPointerDown: u(t7.onPointerDown, () => {
    l.open && l.onClose(), m.current = true, document.addEventListener("pointerup", g, { once: true });
  }), onFocus: u(t7.onFocus, () => {
    m.current || l.onOpen();
  }), onBlur: u(t7.onBlur, l.onClose), onClick: u(t7.onClick, l.onClose) }) });
});
Av.displayName = Hu;
var $f = "TooltipPortal";
var [_P, OP] = Gl($f, { forceMount: void 0 });
var _v = (t7) => {
  const { __scopeTooltip: r2, forceMount: o, children: a, container: l } = t7, s = La($f, r2);
  return E.jsx(_P, { scope: r2, forceMount: o, children: E.jsx(Ge, { present: o || s.open, children: E.jsx(vo, { asChild: true, container: l, children: a }) }) });
};
_v.displayName = $f;
var so = "TooltipContent";
var Ov = p.forwardRef((t7, r2) => {
  const o = OP(so, t7.__scopeTooltip), { forceMount: a = o.forceMount, side: l = "top", ...s } = t7, u2 = La(so, t7.__scopeTooltip);
  return E.jsx(Ge, { present: a || u2.open, children: u2.disableHoverableContent ? E.jsx(Nv, { side: l, ...s, ref: r2 }) : E.jsx(NP, { side: l, ...s, ref: r2 }) });
});
var NP = p.forwardRef((t7, r2) => {
  const o = La(so, t7.__scopeTooltip), a = Ff(so, t7.__scopeTooltip), l = p.useRef(null), s = ve(r2, l), [u2, f] = p.useState(null), { trigger: d, onClose: m } = o, v = l.current, { onPointerInTransitChange: g } = a, w = p.useCallback(() => {
    f(null), g(false);
  }, [g]), k = p.useCallback((P, C) => {
    const x = P.currentTarget, R = { x: P.clientX, y: P.clientY }, b = FP(R, x.getBoundingClientRect()), M = $P(R, b), N = zP(C.getBoundingClientRect()), j = BP([...M, ...N]);
    f(j), g(true);
  }, [g]);
  return p.useEffect(() => () => w(), [w]), p.useEffect(() => {
    if (d && v) {
      const P = (x) => k(x, v), C = (x) => k(x, d);
      return d.addEventListener("pointerleave", P), v.addEventListener("pointerleave", C), () => {
        d.removeEventListener("pointerleave", P), v.removeEventListener("pointerleave", C);
      };
    }
  }, [d, v, k, w]), p.useEffect(() => {
    if (u2) {
      const P = (C) => {
        const x = C.target, R = { x: C.clientX, y: C.clientY }, b = d?.contains(x) || v?.contains(x), M = !HP(R, u2);
        b ? w() : M && (w(), m());
      };
      return document.addEventListener("pointermove", P), () => document.removeEventListener("pointermove", P);
    }
  }, [d, v, u2, m, w]), E.jsx(Nv, { ...t7, ref: s });
});
var [IP, DP] = Gl(Sa, { isInside: false });
var LP = RP("TooltipContent");
var Nv = p.forwardRef((t7, r2) => {
  const { __scopeTooltip: o, children: a, "aria-label": l, onEscapeKeyDown: s, onPointerDownOutside: u2, ...f } = t7, d = La(so, o), m = Yl(o), { onClose: v } = d;
  return p.useEffect(() => (document.addEventListener(zu, v), () => document.removeEventListener(zu, v)), [v]), p.useEffect(() => {
    if (d.trigger) {
      const g = (w) => {
        w.target?.contains(d.trigger) && v();
      };
      return window.addEventListener("scroll", g, { capture: true }), () => window.removeEventListener("scroll", g, { capture: true });
    }
  }, [d.trigger, v]), E.jsx(yo, { asChild: true, disableOutsidePointerEvents: false, onEscapeKeyDown: s, onPointerDownOutside: u2, onFocusOutside: (g) => g.preventDefault(), onDismiss: v, children: E.jsxs(Bl, { "data-state": d.stateAttribute, ...m, ...f, ref: r2, style: { ...f.style, "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)", "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)", "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)", "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)", "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)" }, children: [E.jsx(LP, { children: a }), E.jsx(IP, { scope: o, isInside: true, children: E.jsx(bP, { id: d.contentId, role: "tooltip", children: l || a }) })] }) });
});
Ov.displayName = so;
var Iv = "TooltipArrow";
var jP = p.forwardRef((t7, r2) => {
  const { __scopeTooltip: o, ...a } = t7, l = Yl(o);
  return DP(Iv, o).isInside ? null : E.jsx(Vl, { ...l, ...a, ref: r2 });
});
jP.displayName = Iv;
function FP(t7, r2) {
  const o = Math.abs(r2.top - t7.y), a = Math.abs(r2.bottom - t7.y), l = Math.abs(r2.right - t7.x), s = Math.abs(r2.left - t7.x);
  switch (Math.min(o, a, l, s)) {
    case s:
      return "left";
    case l:
      return "right";
    case o:
      return "top";
    case a:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function $P(t7, r2, o = 5) {
  const a = [];
  switch (r2) {
    case "top":
      a.push({ x: t7.x - o, y: t7.y + o }, { x: t7.x + o, y: t7.y + o });
      break;
    case "bottom":
      a.push({ x: t7.x - o, y: t7.y - o }, { x: t7.x + o, y: t7.y - o });
      break;
    case "left":
      a.push({ x: t7.x + o, y: t7.y - o }, { x: t7.x + o, y: t7.y + o });
      break;
    case "right":
      a.push({ x: t7.x - o, y: t7.y - o }, { x: t7.x - o, y: t7.y + o });
      break;
  }
  return a;
}
function zP(t7) {
  const { top: r2, right: o, bottom: a, left: l } = t7;
  return [{ x: l, y: r2 }, { x: o, y: r2 }, { x: o, y: a }, { x: l, y: a }];
}
function HP(t7, r2) {
  const { x: o, y: a } = t7;
  let l = false;
  for (let s = 0, u2 = r2.length - 1; s < r2.length; u2 = s++) {
    const f = r2[s], d = r2[u2], m = f.x, v = f.y, g = d.x, w = d.y;
    v > a != w > a && o < (g - m) * (a - v) / (w - v) + m && (l = !l);
  }
  return l;
}
function BP(t7) {
  const r2 = t7.slice();
  return r2.sort((o, a) => o.x < a.x ? -1 : o.x > a.x ? 1 : o.y < a.y ? -1 : o.y > a.y ? 1 : 0), VP(r2);
}
function VP(t7) {
  if (t7.length <= 1) return t7.slice();
  const r2 = [];
  for (let a = 0; a < t7.length; a++) {
    const l = t7[a];
    for (; r2.length >= 2; ) {
      const s = r2[r2.length - 1], u2 = r2[r2.length - 2];
      if ((s.x - u2.x) * (l.y - u2.y) >= (s.y - u2.y) * (l.x - u2.x)) r2.pop();
      else break;
    }
    r2.push(l);
  }
  r2.pop();
  const o = [];
  for (let a = t7.length - 1; a >= 0; a--) {
    const l = t7[a];
    for (; o.length >= 2; ) {
      const s = o[o.length - 1], u2 = o[o.length - 2];
      if ((s.x - u2.x) * (l.y - u2.y) >= (s.y - u2.y) * (l.x - u2.x)) o.pop();
      else break;
    }
    o.push(l);
  }
  return o.pop(), r2.length === 1 && o.length === 1 && r2[0].x === o[0].x && r2[0].y === o[0].y ? r2 : r2.concat(o);
}
function UP(t7) {
  const r2 = WP(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(KP);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function WP(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = YP(l), f = GP(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var qP = /* @__PURE__ */ Symbol("radix.slottable");
function KP(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === qP;
}
function GP(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function YP(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
function Xl(t7) {
  const r2 = p.useRef({ value: t7, previous: t7 });
  return p.useMemo(() => (r2.current.value !== t7 && (r2.current.previous = r2.current.value, r2.current.value = t7), r2.current.previous), [t7]);
}
var XP = [" ", "Enter", "ArrowUp", "ArrowDown"];
var QP = [" ", "Enter"];
var wr = "Select";
var [Ql, Zl, ZP] = Aa(wr);
var [xo] = ot(wr, [ZP, Xn]);
var Jl = Xn();
var [JP, Qn] = xo(wr);
var [eb, tb] = xo(wr);
var Dv = (t7) => {
  const { __scopeSelect: r2, children: o, open: a, defaultOpen: l, onOpenChange: s, value: u2, defaultValue: f, onValueChange: d, dir: m, name: v, autoComplete: g, disabled: w, required: k, form: P } = t7, C = Jl(r2), [x, R] = p.useState(null), [b, M] = p.useState(null), [N, j] = p.useState(false), B = Cr(m), [z, Q] = xt({ prop: a, defaultProp: l ?? false, onChange: s, caller: wr }), [Z, J] = xt({ prop: u2, defaultProp: f, onChange: d, caller: wr }), ee = p.useRef(null), ce = x ? P || !!x.closest("form") : true, [fe, de] = p.useState(/* @__PURE__ */ new Set()), ye = Array.from(fe).map((re) => re.props.value).join(";");
  return E.jsx(Hl, { ...C, children: E.jsxs(JP, { required: k, scope: r2, trigger: x, onTriggerChange: R, valueNode: b, onValueNodeChange: M, valueNodeHasChildren: N, onValueNodeHasChildrenChange: j, contentId: wt(), value: Z, onValueChange: J, open: z, onOpenChange: Q, dir: B, triggerPointerDownPosRef: ee, disabled: w, children: [E.jsx(Ql.Provider, { scope: r2, children: E.jsx(eb, { scope: t7.__scopeSelect, onNativeOptionAdd: p.useCallback((re) => {
    de((ae) => new Set(ae).add(re));
  }, []), onNativeOptionRemove: p.useCallback((re) => {
    de((ae) => {
      const $ = new Set(ae);
      return $.delete(re), $;
    });
  }, []), children: o }) }), ce ? E.jsxs(a0, { "aria-hidden": true, required: k, tabIndex: -1, name: v, autoComplete: g, value: Z, onChange: (re) => J(re.target.value), disabled: w, form: P, children: [Z === void 0 ? E.jsx("option", { value: "" }) : null, Array.from(fe)] }, ye) : null] }) });
};
Dv.displayName = wr;
var Lv = "SelectTrigger";
var jv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, disabled: a = false, ...l } = t7, s = Jl(o), u2 = Qn(Lv, o), f = u2.disabled || a, d = ve(r2, u2.onTriggerChange), m = Zl(o), v = p.useRef("touch"), [g, w, k] = l0((C) => {
    const x = m().filter((M) => !M.disabled), R = x.find((M) => M.value === u2.value), b = s0(x, C, R);
    b !== void 0 && u2.onValueChange(b.value);
  }), P = (C) => {
    f || (u2.onOpenChange(true), k()), C && (u2.triggerPointerDownPosRef.current = { x: Math.round(C.pageX), y: Math.round(C.pageY) });
  };
  return E.jsx(Oa, { asChild: true, ...s, children: E.jsx(le.button, { type: "button", role: "combobox", "aria-controls": u2.contentId, "aria-expanded": u2.open, "aria-required": u2.required, "aria-autocomplete": "none", dir: u2.dir, "data-state": u2.open ? "open" : "closed", disabled: f, "data-disabled": f ? "" : void 0, "data-placeholder": i0(u2.value) ? "" : void 0, ...l, ref: d, onClick: u(l.onClick, (C) => {
    C.currentTarget.focus(), v.current !== "mouse" && P(C);
  }), onPointerDown: u(l.onPointerDown, (C) => {
    v.current = C.pointerType;
    const x = C.target;
    x.hasPointerCapture(C.pointerId) && x.releasePointerCapture(C.pointerId), C.button === 0 && C.ctrlKey === false && C.pointerType === "mouse" && (P(C), C.preventDefault());
  }), onKeyDown: u(l.onKeyDown, (C) => {
    const x = g.current !== "";
    !(C.ctrlKey || C.altKey || C.metaKey) && C.key.length === 1 && w(C.key), !(x && C.key === " ") && XP.includes(C.key) && (P(), C.preventDefault());
  }) }) });
});
jv.displayName = Lv;
var Fv = "SelectValue";
var $v = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, className: a, style: l, children: s, placeholder: u2 = "", ...f } = t7, d = Qn(Fv, o), { onValueNodeHasChildrenChange: m } = d, v = s !== void 0, g = ve(r2, d.onValueNodeChange);
  return Ze(() => {
    m(v);
  }, [m, v]), E.jsx(le.span, { ...f, ref: g, style: { pointerEvents: "none" }, children: i0(d.value) ? E.jsx(E.Fragment, { children: u2 }) : s });
});
$v.displayName = Fv;
var nb = "SelectIcon";
var zv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, children: a, ...l } = t7;
  return E.jsx(le.span, { "aria-hidden": true, ...l, ref: r2, children: a || "\u25BC" });
});
zv.displayName = nb;
var rb = "SelectPortal";
var Hv = (t7) => E.jsx(vo, { asChild: true, ...t7 });
Hv.displayName = rb;
var xr = "SelectContent";
var Bv = p.forwardRef((t7, r2) => {
  const o = Qn(xr, t7.__scopeSelect), [a, l] = p.useState();
  if (Ze(() => {
    l(new DocumentFragment());
  }, []), !o.open) {
    const s = a;
    return s ? ba.createPortal(E.jsx(Vv, { scope: t7.__scopeSelect, children: E.jsx(Ql.Slot, { scope: t7.__scopeSelect, children: E.jsx("div", { children: t7.children }) }) }), s) : null;
  }
  return E.jsx(Uv, { ...t7, ref: r2 });
});
Bv.displayName = xr;
var qt = 10;
var [Vv, Zn] = xo(xr);
var ob = "SelectContentImpl";
var ab = UP("SelectContent.RemoveScroll");
var Uv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, position: a = "item-aligned", onCloseAutoFocus: l, onEscapeKeyDown: s, onPointerDownOutside: u2, side: f, sideOffset: d, align: m, alignOffset: v, arrowPadding: g, collisionBoundary: w, collisionPadding: k, sticky: P, hideWhenDetached: C, avoidCollisions: x, ...R } = t7, b = Qn(xr, o), [M, N] = p.useState(null), [j, B] = p.useState(null), z = ve(r2, (Y) => N(Y)), [Q, Z] = p.useState(null), [J, ee] = p.useState(null), ce = Zl(o), [fe, de] = p.useState(false), ye = p.useRef(false);
  p.useEffect(() => {
    if (M) return Nl(M);
  }, [M]), _l();
  const re = p.useCallback((Y) => {
    const [ue, ...Ee] = ce().map(($e) => $e.ref.current), [Re] = Ee.slice(-1), Ae = document.activeElement;
    for (const $e of Y) if ($e === Ae || ($e?.scrollIntoView({ block: "nearest" }), $e === ue && j && (j.scrollTop = 0), $e === Re && j && (j.scrollTop = j.scrollHeight), $e?.focus(), document.activeElement !== Ae)) return;
  }, [ce, j]), ae = p.useCallback(() => re([Q, M]), [re, Q, M]);
  p.useEffect(() => {
    fe && ae();
  }, [fe, ae]);
  const { onOpenChange: $, triggerPointerDownPosRef: H } = b;
  p.useEffect(() => {
    if (M) {
      let Y = { x: 0, y: 0 };
      const ue = (Re) => {
        Y = { x: Math.abs(Math.round(Re.pageX) - (H.current?.x ?? 0)), y: Math.abs(Math.round(Re.pageY) - (H.current?.y ?? 0)) };
      }, Ee = (Re) => {
        Y.x <= 10 && Y.y <= 10 ? Re.preventDefault() : M.contains(Re.target) || $(false), document.removeEventListener("pointermove", ue), H.current = null;
      };
      return H.current !== null && (document.addEventListener("pointermove", ue), document.addEventListener("pointerup", Ee, { capture: true, once: true })), () => {
        document.removeEventListener("pointermove", ue), document.removeEventListener("pointerup", Ee, { capture: true });
      };
    }
  }, [M, $, H]), p.useEffect(() => {
    const Y = () => $(false);
    return window.addEventListener("blur", Y), window.addEventListener("resize", Y), () => {
      window.removeEventListener("blur", Y), window.removeEventListener("resize", Y);
    };
  }, [$]);
  const [X2, I] = l0((Y) => {
    const ue = ce().filter((Ae) => !Ae.disabled), Ee = ue.find((Ae) => Ae.ref.current === document.activeElement), Re = s0(ue, Y, Ee);
    Re && setTimeout(() => Re.ref.current.focus());
  }), V = p.useCallback((Y, ue, Ee) => {
    const Re = !ye.current && !Ee;
    (b.value !== void 0 && b.value === ue || Re) && (Z(Y), Re && (ye.current = true));
  }, [b.value]), we = p.useCallback(() => M?.focus(), [M]), ge = p.useCallback((Y, ue, Ee) => {
    const Re = !ye.current && !Ee;
    (b.value !== void 0 && b.value === ue || Re) && ee(Y);
  }, [b.value]), ke = a === "popper" ? Bu : Wv, Se = ke === Bu ? { side: f, sideOffset: d, align: m, alignOffset: v, arrowPadding: g, collisionBoundary: w, collisionPadding: k, sticky: P, hideWhenDetached: C, avoidCollisions: x } : {};
  return E.jsx(Vv, { scope: o, content: M, viewport: j, onViewportChange: B, itemRefCallback: V, selectedItem: Q, onItemLeave: we, itemTextRefCallback: ge, focusSelectedItem: ae, selectedItemText: J, position: a, isPositioned: fe, searchRef: X2, children: E.jsx(Ma, { as: ab, allowPinchZoom: true, children: E.jsx(Ta, { asChild: true, trapped: b.open, onMountAutoFocus: (Y) => {
    Y.preventDefault();
  }, onUnmountAutoFocus: u(l, (Y) => {
    b.trigger?.focus({ preventScroll: true }), Y.preventDefault();
  }), children: E.jsx(yo, { asChild: true, disableOutsidePointerEvents: true, onEscapeKeyDown: s, onPointerDownOutside: u2, onFocusOutside: (Y) => Y.preventDefault(), onDismiss: () => b.onOpenChange(false), children: E.jsx(ke, { role: "listbox", id: b.contentId, "data-state": b.open ? "open" : "closed", dir: b.dir, onContextMenu: (Y) => Y.preventDefault(), ...R, ...Se, onPlaced: () => de(true), ref: z, style: { display: "flex", flexDirection: "column", outline: "none", ...R.style }, onKeyDown: u(R.onKeyDown, (Y) => {
    const ue = Y.ctrlKey || Y.altKey || Y.metaKey;
    if (Y.key === "Tab" && Y.preventDefault(), !ue && Y.key.length === 1 && I(Y.key), ["ArrowUp", "ArrowDown", "Home", "End"].includes(Y.key)) {
      let Re = ce().filter((Ae) => !Ae.disabled).map((Ae) => Ae.ref.current);
      if (["ArrowUp", "End"].includes(Y.key) && (Re = Re.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(Y.key)) {
        const Ae = Y.target, $e = Re.indexOf(Ae);
        Re = Re.slice($e + 1);
      }
      setTimeout(() => re(Re)), Y.preventDefault();
    }
  }) }) }) }) }) });
});
Uv.displayName = ob;
var ib = "SelectItemAlignedPosition";
var Wv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, onPlaced: a, ...l } = t7, s = Qn(xr, o), u2 = Zn(xr, o), [f, d] = p.useState(null), [m, v] = p.useState(null), g = ve(r2, (z) => v(z)), w = Zl(o), k = p.useRef(false), P = p.useRef(true), { viewport: C, selectedItem: x, selectedItemText: R, focusSelectedItem: b } = u2, M = p.useCallback(() => {
    if (s.trigger && s.valueNode && f && m && C && x && R) {
      const z = s.trigger.getBoundingClientRect(), Q = m.getBoundingClientRect(), Z = s.valueNode.getBoundingClientRect(), J = R.getBoundingClientRect();
      if (s.dir !== "rtl") {
        const Ae = J.left - Q.left, $e = Z.left - Ae, Je = z.left - $e, jt = z.width + Je, Pr = Math.max(jt, Q.width), br = window.innerWidth - qt, tr = c($e, [qt, Math.max(qt, br - Pr)]);
        f.style.minWidth = jt + "px", f.style.left = tr + "px";
      } else {
        const Ae = Q.right - J.right, $e = window.innerWidth - Z.right - Ae, Je = window.innerWidth - z.right - $e, jt = z.width + Je, Pr = Math.max(jt, Q.width), br = window.innerWidth - qt, tr = c($e, [qt, Math.max(qt, br - Pr)]);
        f.style.minWidth = jt + "px", f.style.right = tr + "px";
      }
      const ee = w(), ce = window.innerHeight - qt * 2, fe = C.scrollHeight, de = window.getComputedStyle(m), ye = parseInt(de.borderTopWidth, 10), re = parseInt(de.paddingTop, 10), ae = parseInt(de.borderBottomWidth, 10), $ = parseInt(de.paddingBottom, 10), H = ye + re + fe + $ + ae, X2 = Math.min(x.offsetHeight * 5, H), I = window.getComputedStyle(C), V = parseInt(I.paddingTop, 10), we = parseInt(I.paddingBottom, 10), ge = z.top + z.height / 2 - qt, ke = ce - ge, Se = x.offsetHeight / 2, Y = x.offsetTop + Se, ue = ye + re + Y, Ee = H - ue;
      if (ue <= ge) {
        const Ae = ee.length > 0 && x === ee[ee.length - 1].ref.current;
        f.style.bottom = "0px";
        const $e = m.clientHeight - C.offsetTop - C.offsetHeight, Je = Math.max(ke, Se + (Ae ? we : 0) + $e + ae), jt = ue + Je;
        f.style.height = jt + "px";
      } else {
        const Ae = ee.length > 0 && x === ee[0].ref.current;
        f.style.top = "0px";
        const Je = Math.max(ge, ye + C.offsetTop + (Ae ? V : 0) + Se) + Ee;
        f.style.height = Je + "px", C.scrollTop = ue - ge + C.offsetTop;
      }
      f.style.margin = `${qt}px 0`, f.style.minHeight = X2 + "px", f.style.maxHeight = ce + "px", a?.(), requestAnimationFrame(() => k.current = true);
    }
  }, [w, s.trigger, s.valueNode, f, m, C, x, R, s.dir, a]);
  Ze(() => M(), [M]);
  const [N, j] = p.useState();
  Ze(() => {
    m && j(window.getComputedStyle(m).zIndex);
  }, [m]);
  const B = p.useCallback((z) => {
    z && P.current === true && (M(), b?.(), P.current = false);
  }, [M, b]);
  return E.jsx(sb, { scope: o, contentWrapper: f, shouldExpandOnScrollRef: k, onScrollButtonChange: B, children: E.jsx("div", { ref: d, style: { display: "flex", flexDirection: "column", position: "fixed", zIndex: N }, children: E.jsx(le.div, { ...l, ref: g, style: { boxSizing: "border-box", maxHeight: "100%", ...l.style } }) }) });
});
Wv.displayName = ib;
var lb = "SelectPopperPosition";
var Bu = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, align: a = "start", collisionPadding: l = qt, ...s } = t7, u2 = Jl(o);
  return E.jsx(Bl, { ...u2, ...s, ref: r2, align: a, collisionPadding: l, style: { boxSizing: "border-box", ...s.style, "--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)", "--radix-select-content-available-width": "var(--radix-popper-available-width)", "--radix-select-content-available-height": "var(--radix-popper-available-height)", "--radix-select-trigger-width": "var(--radix-popper-anchor-width)", "--radix-select-trigger-height": "var(--radix-popper-anchor-height)" } });
});
Bu.displayName = lb;
var [sb, zf] = xo(xr, {});
var Vu = "SelectViewport";
var qv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, nonce: a, ...l } = t7, s = Zn(Vu, o), u2 = zf(Vu, o), f = ve(r2, s.onViewportChange), d = p.useRef(0);
  return E.jsxs(E.Fragment, { children: [E.jsx("style", { dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" }, nonce: a }), E.jsx(Ql.Slot, { scope: o, children: E.jsx(le.div, { "data-radix-select-viewport": "", role: "presentation", ...l, ref: f, style: { position: "relative", flex: 1, overflow: "hidden auto", ...l.style }, onScroll: u(l.onScroll, (m) => {
    const v = m.currentTarget, { contentWrapper: g, shouldExpandOnScrollRef: w } = u2;
    if (w?.current && g) {
      const k = Math.abs(d.current - v.scrollTop);
      if (k > 0) {
        const P = window.innerHeight - qt * 2, C = parseFloat(g.style.minHeight), x = parseFloat(g.style.height), R = Math.max(C, x);
        if (R < P) {
          const b = R + k, M = Math.min(P, b), N = b - M;
          g.style.height = M + "px", g.style.bottom === "0px" && (v.scrollTop = N > 0 ? N : 0, g.style.justifyContent = "flex-end");
        }
      }
    }
    d.current = v.scrollTop;
  }) }) })] });
});
qv.displayName = Vu;
var Kv = "SelectGroup";
var [cb, ub] = xo(Kv);
var fb = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, ...a } = t7, l = wt();
  return E.jsx(cb, { scope: o, id: l, children: E.jsx(le.div, { role: "group", "aria-labelledby": l, ...a, ref: r2 }) });
});
fb.displayName = Kv;
var Gv = "SelectLabel";
var Yv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, ...a } = t7, l = ub(Gv, o);
  return E.jsx(le.div, { id: l.id, ...a, ref: r2 });
});
Yv.displayName = Gv;
var yl = "SelectItem";
var [db, Xv] = xo(yl);
var Qv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, value: a, disabled: l = false, textValue: s, ...u2 } = t7, f = Qn(yl, o), d = Zn(yl, o), m = f.value === a, [v, g] = p.useState(s ?? ""), [w, k] = p.useState(false), P = ve(r2, (b) => d.itemRefCallback?.(b, a, l)), C = wt(), x = p.useRef("touch"), R = () => {
    l || (f.onValueChange(a), f.onOpenChange(false));
  };
  if (a === "") throw new Error("A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.");
  return E.jsx(db, { scope: o, value: a, disabled: l, textId: C, isSelected: m, onItemTextChange: p.useCallback((b) => {
    g((M) => M || (b?.textContent ?? "").trim());
  }, []), children: E.jsx(Ql.ItemSlot, { scope: o, value: a, disabled: l, textValue: v, children: E.jsx(le.div, { role: "option", "aria-labelledby": C, "data-highlighted": w ? "" : void 0, "aria-selected": m && w, "data-state": m ? "checked" : "unchecked", "aria-disabled": l || void 0, "data-disabled": l ? "" : void 0, tabIndex: l ? void 0 : -1, ...u2, ref: P, onFocus: u(u2.onFocus, () => k(true)), onBlur: u(u2.onBlur, () => k(false)), onClick: u(u2.onClick, () => {
    x.current !== "mouse" && R();
  }), onPointerUp: u(u2.onPointerUp, () => {
    x.current === "mouse" && R();
  }), onPointerDown: u(u2.onPointerDown, (b) => {
    x.current = b.pointerType;
  }), onPointerMove: u(u2.onPointerMove, (b) => {
    x.current = b.pointerType, l ? d.onItemLeave?.() : x.current === "mouse" && b.currentTarget.focus({ preventScroll: true });
  }), onPointerLeave: u(u2.onPointerLeave, (b) => {
    b.currentTarget === document.activeElement && d.onItemLeave?.();
  }), onKeyDown: u(u2.onKeyDown, (b) => {
    d.searchRef?.current !== "" && b.key === " " || (QP.includes(b.key) && R(), b.key === " " && b.preventDefault());
  }) }) }) });
});
Qv.displayName = yl;
var pa = "SelectItemText";
var Zv = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, className: a, style: l, ...s } = t7, u2 = Qn(pa, o), f = Zn(pa, o), d = Xv(pa, o), m = tb(pa, o), [v, g] = p.useState(null), w = ve(r2, (R) => g(R), d.onItemTextChange, (R) => f.itemTextRefCallback?.(R, d.value, d.disabled)), k = v?.textContent, P = p.useMemo(() => E.jsx("option", { value: d.value, disabled: d.disabled, children: k }, d.value), [d.disabled, d.value, k]), { onNativeOptionAdd: C, onNativeOptionRemove: x } = m;
  return Ze(() => (C(P), () => x(P)), [C, x, P]), E.jsxs(E.Fragment, { children: [E.jsx(le.span, { id: d.textId, ...s, ref: w }), d.isSelected && u2.valueNode && !u2.valueNodeHasChildren ? ba.createPortal(s.children, u2.valueNode) : null] });
});
Zv.displayName = pa;
var Jv = "SelectItemIndicator";
var e0 = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, ...a } = t7;
  return Xv(Jv, o).isSelected ? E.jsx(le.span, { "aria-hidden": true, ...a, ref: r2 }) : null;
});
e0.displayName = Jv;
var Uu = "SelectScrollUpButton";
var t0 = p.forwardRef((t7, r2) => {
  const o = Zn(Uu, t7.__scopeSelect), a = zf(Uu, t7.__scopeSelect), [l, s] = p.useState(false), u2 = ve(r2, a.onScrollButtonChange);
  return Ze(() => {
    if (o.viewport && o.isPositioned) {
      let f = function() {
        const m = d.scrollTop > 0;
        s(m);
      };
      const d = o.viewport;
      return f(), d.addEventListener("scroll", f), () => d.removeEventListener("scroll", f);
    }
  }, [o.viewport, o.isPositioned]), l ? E.jsx(r0, { ...t7, ref: u2, onAutoScroll: () => {
    const { viewport: f, selectedItem: d } = o;
    f && d && (f.scrollTop = f.scrollTop - d.offsetHeight);
  } }) : null;
});
t0.displayName = Uu;
var Wu = "SelectScrollDownButton";
var n0 = p.forwardRef((t7, r2) => {
  const o = Zn(Wu, t7.__scopeSelect), a = zf(Wu, t7.__scopeSelect), [l, s] = p.useState(false), u2 = ve(r2, a.onScrollButtonChange);
  return Ze(() => {
    if (o.viewport && o.isPositioned) {
      let f = function() {
        const m = d.scrollHeight - d.clientHeight, v = Math.ceil(d.scrollTop) < m;
        s(v);
      };
      const d = o.viewport;
      return f(), d.addEventListener("scroll", f), () => d.removeEventListener("scroll", f);
    }
  }, [o.viewport, o.isPositioned]), l ? E.jsx(r0, { ...t7, ref: u2, onAutoScroll: () => {
    const { viewport: f, selectedItem: d } = o;
    f && d && (f.scrollTop = f.scrollTop + d.offsetHeight);
  } }) : null;
});
n0.displayName = Wu;
var r0 = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, onAutoScroll: a, ...l } = t7, s = Zn("SelectScrollButton", o), u2 = p.useRef(null), f = Zl(o), d = p.useCallback(() => {
    u2.current !== null && (window.clearInterval(u2.current), u2.current = null);
  }, []);
  return p.useEffect(() => () => d(), [d]), Ze(() => {
    f().find((v) => v.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
  }, [f]), E.jsx(le.div, { "aria-hidden": true, ...l, ref: r2, style: { flexShrink: 0, ...l.style }, onPointerDown: u(l.onPointerDown, () => {
    u2.current === null && (u2.current = window.setInterval(a, 50));
  }), onPointerMove: u(l.onPointerMove, () => {
    s.onItemLeave?.(), u2.current === null && (u2.current = window.setInterval(a, 50));
  }), onPointerLeave: u(l.onPointerLeave, () => {
    d();
  }) });
});
var pb = "SelectSeparator";
var o0 = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, ...a } = t7;
  return E.jsx(le.div, { "aria-hidden": true, ...a, ref: r2 });
});
o0.displayName = pb;
var qu = "SelectArrow";
var hb = p.forwardRef((t7, r2) => {
  const { __scopeSelect: o, ...a } = t7, l = Jl(o), s = Qn(qu, o), u2 = Zn(qu, o);
  return s.open && u2.position === "popper" ? E.jsx(Vl, { ...l, ...a, ref: r2 }) : null;
});
hb.displayName = qu;
var mb = "SelectBubbleInput";
var a0 = p.forwardRef(({ __scopeSelect: t7, value: r2, ...o }, a) => {
  const l = p.useRef(null), s = ve(a, l), u2 = Xl(r2);
  return p.useEffect(() => {
    const f = l.current;
    if (!f) return;
    const d = window.HTMLSelectElement.prototype, v = Object.getOwnPropertyDescriptor(d, "value").set;
    if (u2 !== r2 && v) {
      const g = new Event("change", { bubbles: true });
      v.call(f, r2), f.dispatchEvent(g);
    }
  }, [u2, r2]), E.jsx(le.select, { ...o, style: { ...Rv, ...o.style }, ref: s, defaultValue: r2 });
});
a0.displayName = mb;
function i0(t7) {
  return t7 === "" || t7 === void 0;
}
function l0(t7) {
  const r2 = rt(t7), o = p.useRef(""), a = p.useRef(0), l = p.useCallback((u2) => {
    const f = o.current + u2;
    r2(f), (function d(m) {
      o.current = m, window.clearTimeout(a.current), m !== "" && (a.current = window.setTimeout(() => d(""), 1e3));
    })(f);
  }, [r2]), s = p.useCallback(() => {
    o.current = "", window.clearTimeout(a.current);
  }, []);
  return p.useEffect(() => () => window.clearTimeout(a.current), []), [o, l, s];
}
function s0(t7, r2, o) {
  const l = r2.length > 1 && Array.from(r2).every((m) => m === r2[0]) ? r2[0] : r2, s = o ? t7.indexOf(o) : -1;
  let u2 = yb(t7, Math.max(s, 0));
  l.length === 1 && (u2 = u2.filter((m) => m !== o));
  const d = u2.find((m) => m.textValue.toLowerCase().startsWith(l.toLowerCase()));
  return d !== o ? d : void 0;
}
function yb(t7, r2) {
  return t7.map((o, a) => t7[(r2 + a) % t7.length]);
}
var vb = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"];
var gb = vb.reduce((t7, r2) => {
  const o = Dl(`Primitive.${r2}`), a = p.forwardRef((l, s) => {
    const { asChild: u2, ...f } = l, d = u2 ? o : r2;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = true), E.jsx(d, { ...f, ref: s });
  });
  return a.displayName = `Primitive.${r2}`, { ...t7, [r2]: a };
}, {});
var wb = "Label";
var c0 = p.forwardRef((t7, r2) => E.jsx(gb.label, { ...t7, ref: r2, onMouseDown: (o) => {
  o.target.closest("button, input, select, textarea") || (t7.onMouseDown?.(o), !o.defaultPrevented && o.detail > 1 && o.preventDefault());
} }));
c0.displayName = wb;
var es = "Switch";
var [xb] = ot(es);
var [Sb, Cb] = xb(es);
var u0 = p.forwardRef((t7, r2) => {
  const { __scopeSwitch: o, name: a, checked: l, defaultChecked: s, required: u2, disabled: f, value: d = "on", onCheckedChange: m, form: v, ...g } = t7, [w, k] = p.useState(null), P = ve(r2, (M) => k(M)), C = p.useRef(false), x = w ? v || !!w.closest("form") : true, [R, b] = xt({ prop: l, defaultProp: s ?? false, onChange: m, caller: es });
  return E.jsxs(Sb, { scope: o, checked: R, disabled: f, children: [E.jsx(le.button, { type: "button", role: "switch", "aria-checked": R, "aria-required": u2, "data-state": h0(R), "data-disabled": f ? "" : void 0, disabled: f, value: d, ...g, ref: P, onClick: u(t7.onClick, (M) => {
    b((N) => !N), x && (C.current = M.isPropagationStopped(), C.current || M.stopPropagation());
  }) }), x && E.jsx(p0, { control: w, bubbles: !C.current, name: a, value: d, checked: R, required: u2, disabled: f, form: v, style: { transform: "translateX(-100%)" } })] });
});
u0.displayName = es;
var f0 = "SwitchThumb";
var d0 = p.forwardRef((t7, r2) => {
  const { __scopeSwitch: o, ...a } = t7, l = Cb(f0, o);
  return E.jsx(le.span, { "data-state": h0(l.checked), "data-disabled": l.disabled ? "" : void 0, ...a, ref: r2 });
});
d0.displayName = f0;
var kb = "SwitchBubbleInput";
var p0 = p.forwardRef(({ __scopeSwitch: t7, control: r2, checked: o, bubbles: a = true, ...l }, s) => {
  const u2 = p.useRef(null), f = ve(u2, s), d = Xl(o), m = zl(r2);
  return p.useEffect(() => {
    const v = u2.current;
    if (!v) return;
    const g = window.HTMLInputElement.prototype, k = Object.getOwnPropertyDescriptor(g, "checked").set;
    if (d !== o && k) {
      const P = new Event("click", { bubbles: a });
      k.call(v, o), v.dispatchEvent(P);
    }
  }, [d, o, a]), E.jsx("input", { type: "checkbox", "aria-hidden": true, defaultChecked: o, ...l, tabIndex: -1, ref: f, style: { ...l.style, ...m, position: "absolute", pointerEvents: "none", opacity: 0, margin: 0 } });
});
p0.displayName = kb;
function h0(t7) {
  return t7 ? "checked" : "unchecked";
}
var xu = { exports: {} };
var Su;
var L1;
function Eb() {
  if (L1) return Su;
  L1 = 1;
  var t7 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Su = t7, Su;
}
var Cu;
var j1;
function Rb() {
  if (j1) return Cu;
  j1 = 1;
  var t7 = Eb();
  function r2() {
  }
  function o() {
  }
  return o.resetWarningCache = r2, Cu = function() {
    function a(u2, f, d, m, v, g) {
      if (g !== t7) {
        var w = new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
        throw w.name = "Invariant Violation", w;
      }
    }
    a.isRequired = a;
    function l() {
      return a;
    }
    var s = { array: a, bigint: a, bool: a, func: a, number: a, object: a, string: a, symbol: a, any: a, arrayOf: l, element: a, elementType: a, instanceOf: l, node: a, objectOf: l, oneOf: l, oneOfType: l, shape: l, exact: l, checkPropTypes: o, resetWarningCache: r2 };
    return s.PropTypes = s, s;
  }, Cu;
}
var F1;
function Pb() {
  return F1 || (F1 = 1, xu.exports = Rb()()), xu.exports;
}
var bb = Pb();
var pe = Sr(bb);
var ku;
var $1;
function Tb() {
  if ($1) return ku;
  $1 = 1;
  function t7(f) {
    return f && typeof f == "object" && "default" in f ? f.default : f;
  }
  var r2 = Pl(), o = t7(r2);
  function a(f, d, m) {
    return d in f ? Object.defineProperty(f, d, { value: m, enumerable: true, configurable: true, writable: true }) : f[d] = m, f;
  }
  function l(f, d) {
    f.prototype = Object.create(d.prototype), f.prototype.constructor = f, f.__proto__ = d;
  }
  var s = !!(typeof window < "u" && window.document && window.document.createElement);
  function u2(f, d, m) {
    if (typeof f != "function") throw new Error("Expected reducePropsToState to be a function.");
    if (typeof d != "function") throw new Error("Expected handleStateChangeOnClient to be a function.");
    if (typeof m < "u" && typeof m != "function") throw new Error("Expected mapStateOnServer to either be undefined or a function.");
    function v(g) {
      return g.displayName || g.name || "Component";
    }
    return function(w) {
      if (typeof w != "function") throw new Error("Expected WrappedComponent to be a React component.");
      var k = [], P;
      function C() {
        P = f(k.map(function(R) {
          return R.props;
        })), x.canUseDOM ? d(P) : m && (P = m(P));
      }
      var x = (function(R) {
        l(b, R);
        function b() {
          return R.apply(this, arguments) || this;
        }
        b.peek = function() {
          return P;
        }, b.rewind = function() {
          if (b.canUseDOM) throw new Error("You may only call rewind() on the server. Call peek() to read the current state.");
          var j = P;
          return P = void 0, k = [], j;
        };
        var M = b.prototype;
        return M.UNSAFE_componentWillMount = function() {
          k.push(this), C();
        }, M.componentDidUpdate = function() {
          C();
        }, M.componentWillUnmount = function() {
          var j = k.indexOf(this);
          k.splice(j, 1), C();
        }, M.render = function() {
          return o.createElement(w, this.props);
        }, b;
      })(r2.PureComponent);
      return a(x, "displayName", "SideEffect(" + v(w) + ")"), a(x, "canUseDOM", s), x;
    };
  }
  return ku = u2, ku;
}
var Mb = Tb();
var Ab = Sr(Mb);
var Eu;
var z1;
function _b() {
  if (z1) return Eu;
  z1 = 1;
  var t7 = typeof Element < "u", r2 = typeof Map == "function", o = typeof Set == "function", a = typeof ArrayBuffer == "function" && !!ArrayBuffer.isView;
  function l(s, u2) {
    if (s === u2) return true;
    if (s && u2 && typeof s == "object" && typeof u2 == "object") {
      if (s.constructor !== u2.constructor) return false;
      var f, d, m;
      if (Array.isArray(s)) {
        if (f = s.length, f != u2.length) return false;
        for (d = f; d-- !== 0; ) if (!l(s[d], u2[d])) return false;
        return true;
      }
      var v;
      if (r2 && s instanceof Map && u2 instanceof Map) {
        if (s.size !== u2.size) return false;
        for (v = s.entries(); !(d = v.next()).done; ) if (!u2.has(d.value[0])) return false;
        for (v = s.entries(); !(d = v.next()).done; ) if (!l(d.value[1], u2.get(d.value[0]))) return false;
        return true;
      }
      if (o && s instanceof Set && u2 instanceof Set) {
        if (s.size !== u2.size) return false;
        for (v = s.entries(); !(d = v.next()).done; ) if (!u2.has(d.value[0])) return false;
        return true;
      }
      if (a && ArrayBuffer.isView(s) && ArrayBuffer.isView(u2)) {
        if (f = s.length, f != u2.length) return false;
        for (d = f; d-- !== 0; ) if (s[d] !== u2[d]) return false;
        return true;
      }
      if (s.constructor === RegExp) return s.source === u2.source && s.flags === u2.flags;
      if (s.valueOf !== Object.prototype.valueOf && typeof s.valueOf == "function" && typeof u2.valueOf == "function") return s.valueOf() === u2.valueOf();
      if (s.toString !== Object.prototype.toString && typeof s.toString == "function" && typeof u2.toString == "function") return s.toString() === u2.toString();
      if (m = Object.keys(s), f = m.length, f !== Object.keys(u2).length) return false;
      for (d = f; d-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(u2, m[d])) return false;
      if (t7 && s instanceof Element) return false;
      for (d = f; d-- !== 0; ) if (!((m[d] === "_owner" || m[d] === "__v" || m[d] === "__o") && s.$$typeof) && !l(s[m[d]], u2[m[d]])) return false;
      return true;
    }
    return s !== s && u2 !== u2;
  }
  return Eu = function(u2, f) {
    try {
      return l(u2, f);
    } catch (d) {
      if ((d.message || "").match(/stack|recursion/i)) return console.warn("react-fast-compare cannot handle circular refs"), false;
      throw d;
    }
  }, Eu;
}
var Ob = _b();
var Nb = Sr(Ob);
var Ru;
var H1;
function Ib() {
  if (H1) return Ru;
  H1 = 1;
  var t7 = Object.getOwnPropertySymbols, r2 = Object.prototype.hasOwnProperty, o = Object.prototype.propertyIsEnumerable;
  function a(s) {
    if (s == null) throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(s);
  }
  function l() {
    try {
      if (!Object.assign) return false;
      var s = new String("abc");
      if (s[5] = "de", Object.getOwnPropertyNames(s)[0] === "5") return false;
      for (var u2 = {}, f = 0; f < 10; f++) u2["_" + String.fromCharCode(f)] = f;
      var d = Object.getOwnPropertyNames(u2).map(function(v) {
        return u2[v];
      });
      if (d.join("") !== "0123456789") return false;
      var m = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(v) {
        m[v] = v;
      }), Object.keys(Object.assign({}, m)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return false;
    }
  }
  return Ru = l() ? Object.assign : function(s, u2) {
    for (var f, d = a(s), m, v = 1; v < arguments.length; v++) {
      f = Object(arguments[v]);
      for (var g in f) r2.call(f, g) && (d[g] = f[g]);
      if (t7) {
        m = t7(f);
        for (var w = 0; w < m.length; w++) o.call(f, m[w]) && (d[m[w]] = f[m[w]]);
      }
    }
    return d;
  }, Ru;
}
var Db = Ib();
var Lb = Sr(Db);
var yr = { BODY: "bodyAttributes", HTML: "htmlAttributes", TITLE: "titleAttributes" };
var Ce = { BASE: "base", BODY: "body", HEAD: "head", HTML: "html", LINK: "link", META: "meta", NOSCRIPT: "noscript", SCRIPT: "script", STYLE: "style", TITLE: "title" };
Object.keys(Ce).map(function(t7) {
  return Ce[t7];
});
var je = { CHARSET: "charset", CSS_TEXT: "cssText", HREF: "href", HTTPEQUIV: "http-equiv", INNER_HTML: "innerHTML", ITEM_PROP: "itemprop", NAME: "name", PROPERTY: "property", REL: "rel", SRC: "src", TARGET: "target" };
var vl = { accesskey: "accessKey", charset: "charSet", class: "className", contenteditable: "contentEditable", contextmenu: "contextMenu", "http-equiv": "httpEquiv", itemprop: "itemProp", tabindex: "tabIndex" };
var Ca = { DEFAULT_TITLE: "defaultTitle", DEFER: "defer", ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters", ON_CHANGE_CLIENT_STATE: "onChangeClientState", TITLE_TEMPLATE: "titleTemplate" };
var jb = Object.keys(vl).reduce(function(t7, r2) {
  return t7[vl[r2]] = r2, t7;
}, {});
var Fb = [Ce.NOSCRIPT, Ce.SCRIPT, Ce.STYLE];
var Kt = "data-react-helmet";
var $b = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t7) {
  return typeof t7;
} : function(t7) {
  return t7 && typeof Symbol == "function" && t7.constructor === Symbol && t7 !== Symbol.prototype ? "symbol" : typeof t7;
};
var zb = function(t7, r2) {
  if (!(t7 instanceof r2)) throw new TypeError("Cannot call a class as a function");
};
var Hb = /* @__PURE__ */ (function() {
  function t7(r2, o) {
    for (var a = 0; a < o.length; a++) {
      var l = o[a];
      l.enumerable = l.enumerable || false, l.configurable = true, "value" in l && (l.writable = true), Object.defineProperty(r2, l.key, l);
    }
  }
  return function(r2, o, a) {
    return o && t7(r2.prototype, o), a && t7(r2, a), r2;
  };
})();
var gt = Object.assign || function(t7) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var o = arguments[r2];
    for (var a in o) Object.prototype.hasOwnProperty.call(o, a) && (t7[a] = o[a]);
  }
  return t7;
};
var Bb = function(t7, r2) {
  if (typeof r2 != "function" && r2 !== null) throw new TypeError("Super expression must either be null or a function, not " + typeof r2);
  t7.prototype = Object.create(r2 && r2.prototype, { constructor: { value: t7, enumerable: false, writable: true, configurable: true } }), r2 && (Object.setPrototypeOf ? Object.setPrototypeOf(t7, r2) : t7.__proto__ = r2);
};
var B1 = function(t7, r2) {
  var o = {};
  for (var a in t7) r2.indexOf(a) >= 0 || Object.prototype.hasOwnProperty.call(t7, a) && (o[a] = t7[a]);
  return o;
};
var Vb = function(t7, r2) {
  if (!t7) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return r2 && (typeof r2 == "object" || typeof r2 == "function") ? r2 : t7;
};
var Ku = function(r2) {
  var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
  return o === false ? String(r2) : String(r2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
var Ub = function(r2) {
  var o = ao(r2, Ce.TITLE), a = ao(r2, Ca.TITLE_TEMPLATE);
  if (a && o) return a.replace(/%s/g, function() {
    return Array.isArray(o) ? o.join("") : o;
  });
  var l = ao(r2, Ca.DEFAULT_TITLE);
  return o || l || void 0;
};
var Wb = function(r2) {
  return ao(r2, Ca.ON_CHANGE_CLIENT_STATE) || function() {
  };
};
var Pu = function(r2, o) {
  return o.filter(function(a) {
    return typeof a[r2] < "u";
  }).map(function(a) {
    return a[r2];
  }).reduce(function(a, l) {
    return gt({}, a, l);
  }, {});
};
var qb = function(r2, o) {
  return o.filter(function(a) {
    return typeof a[Ce.BASE] < "u";
  }).map(function(a) {
    return a[Ce.BASE];
  }).reverse().reduce(function(a, l) {
    if (!a.length) for (var s = Object.keys(l), u2 = 0; u2 < s.length; u2++) {
      var f = s[u2], d = f.toLowerCase();
      if (r2.indexOf(d) !== -1 && l[d]) return a.concat(l);
    }
    return a;
  }, []);
};
var ca = function(r2, o, a) {
  var l = {};
  return a.filter(function(s) {
    return Array.isArray(s[r2]) ? true : (typeof s[r2] < "u" && Xb("Helmet: " + r2 + ' should be of type "Array". Instead found type "' + $b(s[r2]) + '"'), false);
  }).map(function(s) {
    return s[r2];
  }).reverse().reduce(function(s, u2) {
    var f = {};
    u2.filter(function(w) {
      for (var k = void 0, P = Object.keys(w), C = 0; C < P.length; C++) {
        var x = P[C], R = x.toLowerCase();
        o.indexOf(R) !== -1 && !(k === je.REL && w[k].toLowerCase() === "canonical") && !(R === je.REL && w[R].toLowerCase() === "stylesheet") && (k = R), o.indexOf(x) !== -1 && (x === je.INNER_HTML || x === je.CSS_TEXT || x === je.ITEM_PROP) && (k = x);
      }
      if (!k || !w[k]) return false;
      var b = w[k].toLowerCase();
      return l[k] || (l[k] = {}), f[k] || (f[k] = {}), l[k][b] ? false : (f[k][b] = true, true);
    }).reverse().forEach(function(w) {
      return s.push(w);
    });
    for (var d = Object.keys(f), m = 0; m < d.length; m++) {
      var v = d[m], g = Lb({}, l[v], f[v]);
      l[v] = g;
    }
    return s;
  }, []).reverse();
};
var ao = function(r2, o) {
  for (var a = r2.length - 1; a >= 0; a--) {
    var l = r2[a];
    if (l.hasOwnProperty(o)) return l[o];
  }
  return null;
};
var Kb = function(r2) {
  return { baseTag: qb([je.HREF, je.TARGET], r2), bodyAttributes: Pu(yr.BODY, r2), defer: ao(r2, Ca.DEFER), encode: ao(r2, Ca.ENCODE_SPECIAL_CHARACTERS), htmlAttributes: Pu(yr.HTML, r2), linkTags: ca(Ce.LINK, [je.REL, je.HREF], r2), metaTags: ca(Ce.META, [je.NAME, je.CHARSET, je.HTTPEQUIV, je.PROPERTY, je.ITEM_PROP], r2), noscriptTags: ca(Ce.NOSCRIPT, [je.INNER_HTML], r2), onChangeClientState: Wb(r2), scriptTags: ca(Ce.SCRIPT, [je.SRC, je.INNER_HTML], r2), styleTags: ca(Ce.STYLE, [je.CSS_TEXT], r2), title: Ub(r2), titleAttributes: Pu(yr.TITLE, r2) };
};
var Gu = (function() {
  var t7 = Date.now();
  return function(r2) {
    var o = Date.now();
    o - t7 > 16 ? (t7 = o, r2(o)) : setTimeout(function() {
      Gu(r2);
    }, 0);
  };
})();
var V1 = function(r2) {
  return clearTimeout(r2);
};
var Gb = typeof window < "u" ? window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || Gu : global.requestAnimationFrame || Gu;
var Yb = typeof window < "u" ? window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || V1 : global.cancelAnimationFrame || V1;
var Xb = function(r2) {
  return console && typeof console.warn == "function" && console.warn(r2);
};
var ua = null;
var Qb = function(r2) {
  ua && Yb(ua), r2.defer ? ua = Gb(function() {
    U1(r2, function() {
      ua = null;
    });
  }) : (U1(r2), ua = null);
};
var U1 = function(r2, o) {
  var a = r2.baseTag, l = r2.bodyAttributes, s = r2.htmlAttributes, u2 = r2.linkTags, f = r2.metaTags, d = r2.noscriptTags, m = r2.onChangeClientState, v = r2.scriptTags, g = r2.styleTags, w = r2.title, k = r2.titleAttributes;
  Yu(Ce.BODY, l), Yu(Ce.HTML, s), Zb(w, k);
  var P = { baseTag: no(Ce.BASE, a), linkTags: no(Ce.LINK, u2), metaTags: no(Ce.META, f), noscriptTags: no(Ce.NOSCRIPT, d), scriptTags: no(Ce.SCRIPT, v), styleTags: no(Ce.STYLE, g) }, C = {}, x = {};
  Object.keys(P).forEach(function(R) {
    var b = P[R], M = b.newTags, N = b.oldTags;
    M.length && (C[R] = M), N.length && (x[R] = P[R].oldTags);
  }), o && o(), m(r2, C, x);
};
var m0 = function(r2) {
  return Array.isArray(r2) ? r2.join("") : r2;
};
var Zb = function(r2, o) {
  typeof r2 < "u" && document.title !== r2 && (document.title = m0(r2)), Yu(Ce.TITLE, o);
};
var Yu = function(r2, o) {
  var a = document.getElementsByTagName(r2)[0];
  if (a) {
    for (var l = a.getAttribute(Kt), s = l ? l.split(",") : [], u2 = [].concat(s), f = Object.keys(o), d = 0; d < f.length; d++) {
      var m = f[d], v = o[m] || "";
      a.getAttribute(m) !== v && a.setAttribute(m, v), s.indexOf(m) === -1 && s.push(m);
      var g = u2.indexOf(m);
      g !== -1 && u2.splice(g, 1);
    }
    for (var w = u2.length - 1; w >= 0; w--) a.removeAttribute(u2[w]);
    s.length === u2.length ? a.removeAttribute(Kt) : a.getAttribute(Kt) !== f.join(",") && a.setAttribute(Kt, f.join(","));
  }
};
var no = function(r2, o) {
  var a = document.head || document.querySelector(Ce.HEAD), l = a.querySelectorAll(r2 + "[" + Kt + "]"), s = Array.prototype.slice.call(l), u2 = [], f = void 0;
  return o && o.length && o.forEach(function(d) {
    var m = document.createElement(r2);
    for (var v in d) if (d.hasOwnProperty(v)) if (v === je.INNER_HTML) m.innerHTML = d.innerHTML;
    else if (v === je.CSS_TEXT) m.styleSheet ? m.styleSheet.cssText = d.cssText : m.appendChild(document.createTextNode(d.cssText));
    else {
      var g = typeof d[v] > "u" ? "" : d[v];
      m.setAttribute(v, g);
    }
    m.setAttribute(Kt, "true"), s.some(function(w, k) {
      return f = k, m.isEqualNode(w);
    }) ? s.splice(f, 1) : u2.push(m);
  }), s.forEach(function(d) {
    return d.parentNode.removeChild(d);
  }), u2.forEach(function(d) {
    return a.appendChild(d);
  }), { oldTags: s, newTags: u2 };
};
var y0 = function(r2) {
  return Object.keys(r2).reduce(function(o, a) {
    var l = typeof r2[a] < "u" ? a + '="' + r2[a] + '"' : "" + a;
    return o ? o + " " + l : l;
  }, "");
};
var Jb = function(r2, o, a, l) {
  var s = y0(a), u2 = m0(o);
  return s ? "<" + r2 + " " + Kt + '="true" ' + s + ">" + Ku(u2, l) + "</" + r2 + ">" : "<" + r2 + " " + Kt + '="true">' + Ku(u2, l) + "</" + r2 + ">";
};
var eT = function(r2, o, a) {
  return o.reduce(function(l, s) {
    var u2 = Object.keys(s).filter(function(m) {
      return !(m === je.INNER_HTML || m === je.CSS_TEXT);
    }).reduce(function(m, v) {
      var g = typeof s[v] > "u" ? v : v + '="' + Ku(s[v], a) + '"';
      return m ? m + " " + g : g;
    }, ""), f = s.innerHTML || s.cssText || "", d = Fb.indexOf(r2) === -1;
    return l + "<" + r2 + " " + Kt + '="true" ' + u2 + (d ? "/>" : ">" + f + "</" + r2 + ">");
  }, "");
};
var v0 = function(r2) {
  var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return Object.keys(r2).reduce(function(a, l) {
    return a[vl[l] || l] = r2[l], a;
  }, o);
};
var tT = function(r2) {
  var o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return Object.keys(r2).reduce(function(a, l) {
    return a[jb[l] || l] = r2[l], a;
  }, o);
};
var nT = function(r2, o, a) {
  var l, s = (l = { key: o }, l[Kt] = true, l), u2 = v0(a, s);
  return [Oe.createElement(Ce.TITLE, u2, o)];
};
var rT = function(r2, o) {
  return o.map(function(a, l) {
    var s, u2 = (s = { key: l }, s[Kt] = true, s);
    return Object.keys(a).forEach(function(f) {
      var d = vl[f] || f;
      if (d === je.INNER_HTML || d === je.CSS_TEXT) {
        var m = a.innerHTML || a.cssText;
        u2.dangerouslySetInnerHTML = { __html: m };
      } else u2[d] = a[f];
    }), Oe.createElement(r2, u2);
  });
};
var Sn = function(r2, o, a) {
  switch (r2) {
    case Ce.TITLE:
      return { toComponent: function() {
        return nT(r2, o.title, o.titleAttributes);
      }, toString: function() {
        return Jb(r2, o.title, o.titleAttributes, a);
      } };
    case yr.BODY:
    case yr.HTML:
      return { toComponent: function() {
        return v0(o);
      }, toString: function() {
        return y0(o);
      } };
    default:
      return { toComponent: function() {
        return rT(r2, o);
      }, toString: function() {
        return eT(r2, o, a);
      } };
  }
};
var g0 = function(r2) {
  var o = r2.baseTag, a = r2.bodyAttributes, l = r2.encode, s = r2.htmlAttributes, u2 = r2.linkTags, f = r2.metaTags, d = r2.noscriptTags, m = r2.scriptTags, v = r2.styleTags, g = r2.title, w = g === void 0 ? "" : g, k = r2.titleAttributes;
  return { base: Sn(Ce.BASE, o, l), bodyAttributes: Sn(yr.BODY, a, l), htmlAttributes: Sn(yr.HTML, s, l), link: Sn(Ce.LINK, u2, l), meta: Sn(Ce.META, f, l), noscript: Sn(Ce.NOSCRIPT, d, l), script: Sn(Ce.SCRIPT, m, l), style: Sn(Ce.STYLE, v, l), title: Sn(Ce.TITLE, { title: w, titleAttributes: k }, l) };
};
var oT = function(r2) {
  var o, a;
  return a = o = (function(l) {
    Bb(s, l);
    function s() {
      return zb(this, s), Vb(this, l.apply(this, arguments));
    }
    return s.prototype.shouldComponentUpdate = function(f) {
      return !Nb(this.props, f);
    }, s.prototype.mapNestedChildrenToProps = function(f, d) {
      if (!d) return null;
      switch (f.type) {
        case Ce.SCRIPT:
        case Ce.NOSCRIPT:
          return { innerHTML: d };
        case Ce.STYLE:
          return { cssText: d };
      }
      throw new Error("<" + f.type + " /> elements are self-closing and can not contain children. Refer to our API for more information.");
    }, s.prototype.flattenArrayTypeChildren = function(f) {
      var d, m = f.child, v = f.arrayTypeChildren, g = f.newChildProps, w = f.nestedChildren;
      return gt({}, v, (d = {}, d[m.type] = [].concat(v[m.type] || [], [gt({}, g, this.mapNestedChildrenToProps(m, w))]), d));
    }, s.prototype.mapObjectTypeChildren = function(f) {
      var d, m, v = f.child, g = f.newProps, w = f.newChildProps, k = f.nestedChildren;
      switch (v.type) {
        case Ce.TITLE:
          return gt({}, g, (d = {}, d[v.type] = k, d.titleAttributes = gt({}, w), d));
        case Ce.BODY:
          return gt({}, g, { bodyAttributes: gt({}, w) });
        case Ce.HTML:
          return gt({}, g, { htmlAttributes: gt({}, w) });
      }
      return gt({}, g, (m = {}, m[v.type] = gt({}, w), m));
    }, s.prototype.mapArrayTypeChildrenToProps = function(f, d) {
      var m = gt({}, d);
      return Object.keys(f).forEach(function(v) {
        var g;
        m = gt({}, m, (g = {}, g[v] = f[v], g));
      }), m;
    }, s.prototype.warnOnInvalidChildren = function(f, d) {
      return true;
    }, s.prototype.mapChildrenToProps = function(f, d) {
      var m = this, v = {};
      return Oe.Children.forEach(f, function(g) {
        if (!(!g || !g.props)) {
          var w = g.props, k = w.children, P = B1(w, ["children"]), C = tT(P);
          switch (m.warnOnInvalidChildren(g, k), g.type) {
            case Ce.LINK:
            case Ce.META:
            case Ce.NOSCRIPT:
            case Ce.SCRIPT:
            case Ce.STYLE:
              v = m.flattenArrayTypeChildren({ child: g, arrayTypeChildren: v, newChildProps: C, nestedChildren: k });
              break;
            default:
              d = m.mapObjectTypeChildren({ child: g, newProps: d, newChildProps: C, nestedChildren: k });
              break;
          }
        }
      }), d = this.mapArrayTypeChildrenToProps(v, d), d;
    }, s.prototype.render = function() {
      var f = this.props, d = f.children, m = B1(f, ["children"]), v = gt({}, m);
      return d && (v = this.mapChildrenToProps(d, v)), Oe.createElement(r2, v);
    }, Hb(s, null, [{ key: "canUseDOM", set: function(f) {
      r2.canUseDOM = f;
    } }]), s;
  })(Oe.Component), o.propTypes = { base: pe.object, bodyAttributes: pe.object, children: pe.oneOfType([pe.arrayOf(pe.node), pe.node]), defaultTitle: pe.string, defer: pe.bool, encodeSpecialCharacters: pe.bool, htmlAttributes: pe.object, link: pe.arrayOf(pe.object), meta: pe.arrayOf(pe.object), noscript: pe.arrayOf(pe.object), onChangeClientState: pe.func, script: pe.arrayOf(pe.object), style: pe.arrayOf(pe.object), title: pe.string, titleAttributes: pe.object, titleTemplate: pe.string }, o.defaultProps = { defer: true, encodeSpecialCharacters: true }, o.peek = r2.peek, o.rewind = function() {
    var l = r2.rewind();
    return l || (l = g0({ baseTag: [], bodyAttributes: {}, htmlAttributes: {}, linkTags: [], metaTags: [], noscriptTags: [], scriptTags: [], styleTags: [], title: "", titleAttributes: {} })), l;
  }, a;
};
var aT = function() {
  return null;
};
var iT = Ab(Kb, Qb, g0)(aT);
var W1 = oT(iT);
W1.renderStatic = W1.rewind;
var ts = "Checkbox";
var [lT] = ot(ts);
var [sT, Hf] = lT(ts);
function cT(t7) {
  const { __scopeCheckbox: r2, checked: o, children: a, defaultChecked: l, disabled: s, form: u2, name: f, onCheckedChange: d, required: m, value: v = "on", internal_do_not_use_render: g } = t7, [w, k] = xt({ prop: o, defaultProp: l ?? false, onChange: d, caller: ts }), [P, C] = p.useState(null), [x, R] = p.useState(null), b = p.useRef(false), M = P ? !!u2 || !!P.closest("form") : true, N = { checked: w, disabled: s, setChecked: k, control: P, setControl: C, name: f, form: u2, value: v, hasConsumerStoppedPropagationRef: b, required: m, defaultChecked: Kn(l) ? false : l, isFormControl: M, bubbleInput: x, setBubbleInput: R };
  return E.jsx(sT, { scope: r2, ...N, children: dT(g) ? g(N) : a });
}
var w0 = "CheckboxTrigger";
var x0 = p.forwardRef(({ __scopeCheckbox: t7, onKeyDown: r2, onClick: o, ...a }, l) => {
  const { control: s, value: u2, disabled: f, checked: d, required: m, setControl: v, setChecked: g, hasConsumerStoppedPropagationRef: w, isFormControl: k, bubbleInput: P } = Hf(w0, t7), C = ve(l, v), x = p.useRef(d);
  return p.useEffect(() => {
    const R = s?.form;
    if (R) {
      const b = () => g(x.current);
      return R.addEventListener("reset", b), () => R.removeEventListener("reset", b);
    }
  }, [s, g]), E.jsx(le.button, { type: "button", role: "checkbox", "aria-checked": Kn(d) ? "mixed" : d, "aria-required": m, "data-state": E0(d), "data-disabled": f ? "" : void 0, disabled: f, value: u2, ...a, ref: C, onKeyDown: u(r2, (R) => {
    R.key === "Enter" && R.preventDefault();
  }), onClick: u(o, (R) => {
    g((b) => Kn(b) ? true : !b), P && k && (w.current = R.isPropagationStopped(), w.current || R.stopPropagation());
  }) });
});
x0.displayName = w0;
var uT = p.forwardRef((t7, r2) => {
  const { __scopeCheckbox: o, name: a, checked: l, defaultChecked: s, required: u2, disabled: f, value: d, onCheckedChange: m, form: v, ...g } = t7;
  return E.jsx(cT, { __scopeCheckbox: o, checked: l, defaultChecked: s, disabled: f, required: u2, onCheckedChange: m, name: a, form: v, value: d, internal_do_not_use_render: ({ isFormControl: w }) => E.jsxs(E.Fragment, { children: [E.jsx(x0, { ...g, ref: r2, __scopeCheckbox: o }), w && E.jsx(k0, { __scopeCheckbox: o })] }) });
});
uT.displayName = ts;
var S0 = "CheckboxIndicator";
var fT = p.forwardRef((t7, r2) => {
  const { __scopeCheckbox: o, forceMount: a, ...l } = t7, s = Hf(S0, o);
  return E.jsx(Ge, { present: a || Kn(s.checked) || s.checked === true, children: E.jsx(le.span, { "data-state": E0(s.checked), "data-disabled": s.disabled ? "" : void 0, ...l, ref: r2, style: { pointerEvents: "none", ...t7.style } }) });
});
fT.displayName = S0;
var C0 = "CheckboxBubbleInput";
var k0 = p.forwardRef(({ __scopeCheckbox: t7, ...r2 }, o) => {
  const { control: a, hasConsumerStoppedPropagationRef: l, checked: s, defaultChecked: u2, required: f, disabled: d, name: m, value: v, form: g, bubbleInput: w, setBubbleInput: k } = Hf(C0, t7), P = ve(o, k), C = Xl(s), x = zl(a);
  p.useEffect(() => {
    const b = w;
    if (!b) return;
    const M = window.HTMLInputElement.prototype, j = Object.getOwnPropertyDescriptor(M, "checked").set, B = !l.current;
    if (C !== s && j) {
      const z = new Event("click", { bubbles: B });
      b.indeterminate = Kn(s), j.call(b, Kn(s) ? false : s), b.dispatchEvent(z);
    }
  }, [w, C, s, l]);
  const R = p.useRef(Kn(s) ? false : s);
  return E.jsx(le.input, { type: "checkbox", "aria-hidden": true, defaultChecked: u2 ?? R.current, required: f, disabled: d, name: m, value: v, form: g, ...r2, tabIndex: -1, ref: P, style: { ...r2.style, ...x, position: "absolute", pointerEvents: "none", opacity: 0, margin: 0, transform: "translateX(-100%)" } });
});
k0.displayName = C0;
function dT(t7) {
  return typeof t7 == "function";
}
function Kn(t7) {
  return t7 === "indeterminate";
}
function E0(t7) {
  return Kn(t7) ? "indeterminate" : t7 ? "checked" : "unchecked";
}
var ns = "Collapsible";
var [pT, R0] = ot(ns);
var [hT, Bf] = pT(ns);
var P0 = p.forwardRef((t7, r2) => {
  const { __scopeCollapsible: o, open: a, defaultOpen: l, disabled: s, onOpenChange: u2, ...f } = t7, [d, m] = xt({ prop: a, defaultProp: l ?? false, onChange: u2, caller: ns });
  return E.jsx(hT, { scope: o, disabled: s, contentId: wt(), open: d, onOpenToggle: p.useCallback(() => m((v) => !v), [m]), children: E.jsx(le.div, { "data-state": Uf(d), "data-disabled": s ? "" : void 0, ...f, ref: r2 }) });
});
P0.displayName = ns;
var b0 = "CollapsibleTrigger";
var T0 = p.forwardRef((t7, r2) => {
  const { __scopeCollapsible: o, ...a } = t7, l = Bf(b0, o);
  return E.jsx(le.button, { type: "button", "aria-controls": l.contentId, "aria-expanded": l.open || false, "data-state": Uf(l.open), "data-disabled": l.disabled ? "" : void 0, disabled: l.disabled, ...a, ref: r2, onClick: u(t7.onClick, l.onOpenToggle) });
});
T0.displayName = b0;
var Vf = "CollapsibleContent";
var M0 = p.forwardRef((t7, r2) => {
  const { forceMount: o, ...a } = t7, l = Bf(Vf, t7.__scopeCollapsible);
  return E.jsx(Ge, { present: o || l.open, children: ({ present: s }) => E.jsx(mT, { ...a, ref: r2, present: s }) });
});
M0.displayName = Vf;
var mT = p.forwardRef((t7, r2) => {
  const { __scopeCollapsible: o, present: a, children: l, ...s } = t7, u2 = Bf(Vf, o), [f, d] = p.useState(a), m = p.useRef(null), v = ve(r2, m), g = p.useRef(0), w = g.current, k = p.useRef(0), P = k.current, C = u2.open || f, x = p.useRef(C), R = p.useRef(void 0);
  return p.useEffect(() => {
    const b = requestAnimationFrame(() => x.current = false);
    return () => cancelAnimationFrame(b);
  }, []), Ze(() => {
    const b = m.current;
    if (b) {
      R.current = R.current || { transitionDuration: b.style.transitionDuration, animationName: b.style.animationName }, b.style.transitionDuration = "0s", b.style.animationName = "none";
      const M = b.getBoundingClientRect();
      g.current = M.height, k.current = M.width, x.current || (b.style.transitionDuration = R.current.transitionDuration, b.style.animationName = R.current.animationName), d(a);
    }
  }, [u2.open, a]), E.jsx(le.div, { "data-state": Uf(u2.open), "data-disabled": u2.disabled ? "" : void 0, id: u2.contentId, hidden: !C, ...s, ref: v, style: { "--radix-collapsible-content-height": w ? `${w}px` : void 0, "--radix-collapsible-content-width": P ? `${P}px` : void 0, ...t7.style }, children: C && l });
});
function Uf(t7) {
  return t7 ? "open" : "closed";
}
var yT = P0;
var vT = T0;
var gT = M0;
var en = "Accordion";
var wT = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Wf, xT, ST] = Aa(en);
var [rs] = ot(en, [ST, R0]);
var qf = R0();
var A0 = Oe.forwardRef((t7, r2) => {
  const { type: o, ...a } = t7, l = a, s = a;
  return E.jsx(Wf.Provider, { scope: t7.__scopeAccordion, children: o === "multiple" ? E.jsx(RT, { ...s, ref: r2 }) : E.jsx(ET, { ...l, ref: r2 }) });
});
A0.displayName = en;
var [_0, CT] = rs(en);
var [O0, kT] = rs(en, { collapsible: false });
var ET = Oe.forwardRef((t7, r2) => {
  const { value: o, defaultValue: a, onValueChange: l = () => {
  }, collapsible: s = false, ...u2 } = t7, [f, d] = xt({ prop: o, defaultProp: a ?? "", onChange: l, caller: en });
  return E.jsx(_0, { scope: t7.__scopeAccordion, value: Oe.useMemo(() => f ? [f] : [], [f]), onItemOpen: d, onItemClose: Oe.useCallback(() => s && d(""), [s, d]), children: E.jsx(O0, { scope: t7.__scopeAccordion, collapsible: s, children: E.jsx(N0, { ...u2, ref: r2 }) }) });
});
var RT = Oe.forwardRef((t7, r2) => {
  const { value: o, defaultValue: a, onValueChange: l = () => {
  }, ...s } = t7, [u2, f] = xt({ prop: o, defaultProp: a ?? [], onChange: l, caller: en }), d = Oe.useCallback((v) => f((g = []) => [...g, v]), [f]), m = Oe.useCallback((v) => f((g = []) => g.filter((w) => w !== v)), [f]);
  return E.jsx(_0, { scope: t7.__scopeAccordion, value: u2, onItemOpen: d, onItemClose: m, children: E.jsx(O0, { scope: t7.__scopeAccordion, collapsible: true, children: E.jsx(N0, { ...s, ref: r2 }) }) });
});
var [PT, os] = rs(en);
var N0 = Oe.forwardRef((t7, r2) => {
  const { __scopeAccordion: o, disabled: a, dir: l, orientation: s = "vertical", ...u2 } = t7, f = Oe.useRef(null), d = ve(f, r2), m = xT(o), g = Cr(l) === "ltr", w = u(t7.onKeyDown, (k) => {
    if (!wT.includes(k.key)) return;
    const P = k.target, C = m().filter((Q) => !Q.ref.current?.disabled), x = C.findIndex((Q) => Q.ref.current === P), R = C.length;
    if (x === -1) return;
    k.preventDefault();
    let b = x;
    const M = 0, N = R - 1, j = () => {
      b = x + 1, b > N && (b = M);
    }, B = () => {
      b = x - 1, b < M && (b = N);
    };
    switch (k.key) {
      case "Home":
        b = M;
        break;
      case "End":
        b = N;
        break;
      case "ArrowRight":
        s === "horizontal" && (g ? j() : B());
        break;
      case "ArrowDown":
        s === "vertical" && j();
        break;
      case "ArrowLeft":
        s === "horizontal" && (g ? B() : j());
        break;
      case "ArrowUp":
        s === "vertical" && B();
        break;
    }
    const z = b % R;
    C[z].ref.current?.focus();
  });
  return E.jsx(PT, { scope: o, disabled: a, direction: l, orientation: s, children: E.jsx(Wf.Slot, { scope: o, children: E.jsx(le.div, { ...u2, "data-orientation": s, ref: d, onKeyDown: a ? void 0 : w }) }) });
});
var gl = "AccordionItem";
var [bT, Kf] = rs(gl);
var I0 = Oe.forwardRef((t7, r2) => {
  const { __scopeAccordion: o, value: a, ...l } = t7, s = os(gl, o), u2 = CT(gl, o), f = qf(o), d = wt(), m = a && u2.value.includes(a) || false, v = s.disabled || t7.disabled;
  return E.jsx(bT, { scope: o, open: m, disabled: v, triggerId: d, children: E.jsx(yT, { "data-orientation": s.orientation, "data-state": z0(m), ...f, ...l, ref: r2, disabled: v, open: m, onOpenChange: (g) => {
    g ? u2.onItemOpen(a) : u2.onItemClose(a);
  } }) });
});
I0.displayName = gl;
var D0 = "AccordionHeader";
var L0 = Oe.forwardRef((t7, r2) => {
  const { __scopeAccordion: o, ...a } = t7, l = os(en, o), s = Kf(D0, o);
  return E.jsx(le.h3, { "data-orientation": l.orientation, "data-state": z0(s.open), "data-disabled": s.disabled ? "" : void 0, ...a, ref: r2 });
});
L0.displayName = D0;
var Xu = "AccordionTrigger";
var j0 = Oe.forwardRef((t7, r2) => {
  const { __scopeAccordion: o, ...a } = t7, l = os(en, o), s = Kf(Xu, o), u2 = kT(Xu, o), f = qf(o);
  return E.jsx(Wf.ItemSlot, { scope: o, children: E.jsx(vT, { "aria-disabled": s.open && !u2.collapsible || void 0, "data-orientation": l.orientation, id: s.triggerId, ...f, ...a, ref: r2 }) });
});
j0.displayName = Xu;
var F0 = "AccordionContent";
var $0 = Oe.forwardRef((t7, r2) => {
  const { __scopeAccordion: o, ...a } = t7, l = os(en, o), s = Kf(F0, o), u2 = qf(o);
  return E.jsx(gT, { role: "region", "aria-labelledby": s.triggerId, "data-orientation": l.orientation, ...u2, ...a, ref: r2, style: { "--radix-accordion-content-height": "var(--radix-collapsible-content-height)", "--radix-accordion-content-width": "var(--radix-collapsible-content-width)", ...t7.style } });
});
$0.displayName = F0;
function z0(t7) {
  return t7 ? "open" : "closed";
}
var as = "Tabs";
var [TT] = ot(as, [Ul]);
var H0 = Ul();
var [MT, Gf] = TT(as);
var B0 = p.forwardRef((t7, r2) => {
  const { __scopeTabs: o, value: a, onValueChange: l, defaultValue: s, orientation: u2 = "horizontal", dir: f, activationMode: d = "automatic", ...m } = t7, v = Cr(f), [g, w] = xt({ prop: a, onChange: l, defaultProp: s ?? "", caller: as });
  return E.jsx(MT, { scope: o, baseId: wt(), value: g, onValueChange: w, orientation: u2, dir: v, activationMode: d, children: E.jsx(le.div, { dir: v, "data-orientation": u2, ...m, ref: r2 }) });
});
B0.displayName = as;
var V0 = "TabsList";
var U0 = p.forwardRef((t7, r2) => {
  const { __scopeTabs: o, loop: a = true, ...l } = t7, s = Gf(V0, o), u2 = H0(o);
  return E.jsx($y, { asChild: true, ...u2, orientation: s.orientation, dir: s.dir, loop: a, children: E.jsx(le.div, { role: "tablist", "aria-orientation": s.orientation, ...l, ref: r2 }) });
});
U0.displayName = V0;
var W0 = "TabsTrigger";
var q0 = p.forwardRef((t7, r2) => {
  const { __scopeTabs: o, value: a, disabled: l = false, ...s } = t7, u2 = Gf(W0, o), f = H0(o), d = Y0(u2.baseId, a), m = X0(u2.baseId, a), v = a === u2.value;
  return E.jsx(zy, { asChild: true, ...f, focusable: !l, active: v, children: E.jsx(le.button, { type: "button", role: "tab", "aria-selected": v, "aria-controls": m, "data-state": v ? "active" : "inactive", "data-disabled": l ? "" : void 0, disabled: l, id: d, ...s, ref: r2, onMouseDown: u(t7.onMouseDown, (g) => {
    !l && g.button === 0 && g.ctrlKey === false ? u2.onValueChange(a) : g.preventDefault();
  }), onKeyDown: u(t7.onKeyDown, (g) => {
    [" ", "Enter"].includes(g.key) && u2.onValueChange(a);
  }), onFocus: u(t7.onFocus, () => {
    const g = u2.activationMode !== "manual";
    !v && !l && g && u2.onValueChange(a);
  }) }) });
});
q0.displayName = W0;
var K0 = "TabsContent";
var G0 = p.forwardRef((t7, r2) => {
  const { __scopeTabs: o, value: a, forceMount: l, children: s, ...u2 } = t7, f = Gf(K0, o), d = Y0(f.baseId, a), m = X0(f.baseId, a), v = a === f.value, g = p.useRef(v);
  return p.useEffect(() => {
    const w = requestAnimationFrame(() => g.current = false);
    return () => cancelAnimationFrame(w);
  }, []), E.jsx(Ge, { present: l || v, children: ({ present: w }) => E.jsx(le.div, { "data-state": v ? "active" : "inactive", "data-orientation": f.orientation, role: "tabpanel", "aria-labelledby": d, hidden: !w, id: m, tabIndex: 0, ...u2, ref: r2, style: { ...t7.style, animationDuration: g.current ? "0s" : void 0 }, children: w && s }) });
});
G0.displayName = K0;
function Y0(t7, r2) {
  return `${t7}-trigger-${r2}`;
}
function X0(t7, r2) {
  return `${t7}-content-${r2}`;
}
function AT(t7, r2 = []) {
  let o = [];
  function a(s, u2) {
    const f = p.createContext(u2);
    f.displayName = s + "Context";
    const d = o.length;
    o = [...o, u2];
    const m = (g) => {
      const { scope: w, children: k, ...P } = g, C = w?.[t7]?.[d] || f, x = p.useMemo(() => P, Object.values(P));
      return E.jsx(C.Provider, { value: x, children: k });
    };
    m.displayName = s + "Provider";
    function v(g, w) {
      const k = w?.[t7]?.[d] || f, P = p.useContext(k);
      if (P) return P;
      if (u2 !== void 0) return u2;
      throw new Error(`\`${g}\` must be used within \`${s}\``);
    }
    return [m, v];
  }
  const l = () => {
    const s = o.map((u2) => p.createContext(u2));
    return function(f) {
      const d = f?.[t7] || s;
      return p.useMemo(() => ({ [`__scope${t7}`]: { ...f, [t7]: d } }), [f, d]);
    };
  };
  return l.scopeName = t7, [a, _T(l, ...r2)];
}
function _T(...t7) {
  const r2 = t7[0];
  if (t7.length === 1) return r2;
  const o = () => {
    const a = t7.map((l) => ({ useScope: l(), scopeName: l.scopeName }));
    return function(s) {
      const u2 = a.reduce((f, { useScope: d, scopeName: m }) => {
        const g = d(s)[`__scope${m}`];
        return { ...f, ...g };
      }, {});
      return p.useMemo(() => ({ [`__scope${r2.scopeName}`]: u2 }), [u2]);
    };
  };
  return o.scopeName = r2.scopeName, o;
}
var OT = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"];
var Q0 = OT.reduce((t7, r2) => {
  const o = Dl(`Primitive.${r2}`), a = p.forwardRef((l, s) => {
    const { asChild: u2, ...f } = l, d = u2 ? o : r2;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = true), E.jsx(d, { ...f, ref: s });
  });
  return a.displayName = `Primitive.${r2}`, { ...t7, [r2]: a };
}, {});
var Yf = "Progress";
var Xf = 100;
var [NT] = AT(Yf);
var [IT, DT] = NT(Yf);
var Z0 = p.forwardRef((t7, r2) => {
  const { __scopeProgress: o, value: a = null, max: l, getValueLabel: s = LT, ...u2 } = t7;
  (l || l === 0) && !q1(l) && console.error(jT(`${l}`, "Progress"));
  const f = q1(l) ? l : Xf;
  a !== null && !K1(a, f) && console.error(FT(`${a}`, "Progress"));
  const d = K1(a, f) ? a : null, m = wl(d) ? s(d, f) : void 0;
  return E.jsx(IT, { scope: o, value: d, max: f, children: E.jsx(Q0.div, { "aria-valuemax": f, "aria-valuemin": 0, "aria-valuenow": wl(d) ? d : void 0, "aria-valuetext": m, role: "progressbar", "data-state": tg(d, f), "data-value": d ?? void 0, "data-max": f, ...u2, ref: r2 }) });
});
Z0.displayName = Yf;
var J0 = "ProgressIndicator";
var eg = p.forwardRef((t7, r2) => {
  const { __scopeProgress: o, ...a } = t7, l = DT(J0, o);
  return E.jsx(Q0.div, { "data-state": tg(l.value, l.max), "data-value": l.value ?? void 0, "data-max": l.max, ...a, ref: r2 });
});
eg.displayName = J0;
function LT(t7, r2) {
  return `${Math.round(t7 / r2 * 100)}%`;
}
function tg(t7, r2) {
  return t7 == null ? "indeterminate" : t7 === r2 ? "complete" : "loading";
}
function wl(t7) {
  return typeof t7 == "number";
}
function q1(t7) {
  return wl(t7) && !isNaN(t7) && t7 > 0;
}
function K1(t7, r2) {
  return wl(t7) && !isNaN(t7) && t7 <= r2 && t7 >= 0;
}
function jT(t7, r2) {
  return `Invalid prop \`max\` of value \`${t7}\` supplied to \`${r2}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${Xf}\`.`;
}
function FT(t7, r2) {
  return `Invalid prop \`value\` of value \`${t7}\` supplied to \`${r2}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${Xf} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
function $T(t7) {
  const r2 = zT(t7), o = p.forwardRef((a, l) => {
    const { children: s, ...u2 } = a, f = p.Children.toArray(s), d = f.find(BT);
    if (d) {
      const m = d.props.children, v = f.map((g) => g === d ? p.Children.count(m) > 1 ? p.Children.only(null) : p.isValidElement(m) ? m.props.children : null : g);
      return E.jsx(r2, { ...u2, ref: l, children: p.isValidElement(m) ? p.cloneElement(m, void 0, v) : null });
    }
    return E.jsx(r2, { ...u2, ref: l, children: s });
  });
  return o.displayName = `${t7}.Slot`, o;
}
function zT(t7) {
  const r2 = p.forwardRef((o, a) => {
    const { children: l, ...s } = o;
    if (p.isValidElement(l)) {
      const u2 = UT(l), f = VT(s, l.props);
      return l.type !== p.Fragment && (f.ref = a ? un(a, u2) : u2), p.cloneElement(l, f);
    }
    return p.Children.count(l) > 1 ? p.Children.only(null) : null;
  });
  return r2.displayName = `${t7}.SlotClone`, r2;
}
var HT = /* @__PURE__ */ Symbol("radix.slottable");
function BT(t7) {
  return p.isValidElement(t7) && typeof t7.type == "function" && "__radixId" in t7.type && t7.type.__radixId === HT;
}
function VT(t7, r2) {
  const o = { ...r2 };
  for (const a in r2) {
    const l = t7[a], s = r2[a];
    /^on[A-Z]/.test(a) ? l && s ? o[a] = (...f) => {
      const d = s(...f);
      return l(...f), d;
    } : l && (o[a] = l) : a === "style" ? o[a] = { ...l, ...s } : a === "className" && (o[a] = [l, s].filter(Boolean).join(" "));
  }
  return { ...t7, ...o };
}
function UT(t7) {
  let r2 = Object.getOwnPropertyDescriptor(t7.props, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning;
  return o ? t7.ref : (r2 = Object.getOwnPropertyDescriptor(t7, "ref")?.get, o = r2 && "isReactWarning" in r2 && r2.isReactWarning, o ? t7.props.ref : t7.props.ref || t7.ref);
}
var is = "Popover";
var [ng] = ot(is, [Xn]);
var ja = Xn();
var [WT, Jn] = ng(is);
var rg = (t7) => {
  const { __scopePopover: r2, children: o, open: a, defaultOpen: l, onOpenChange: s, modal: u2 = false } = t7, f = ja(r2), d = p.useRef(null), [m, v] = p.useState(false), [g, w] = xt({ prop: a, defaultProp: l ?? false, onChange: s, caller: is });
  return E.jsx(Hl, { ...f, children: E.jsx(WT, { scope: r2, contentId: wt(), triggerRef: d, open: g, onOpenChange: w, onOpenToggle: p.useCallback(() => w((k) => !k), [w]), hasCustomAnchor: m, onCustomAnchorAdd: p.useCallback(() => v(true), []), onCustomAnchorRemove: p.useCallback(() => v(false), []), modal: u2, children: o }) });
};
rg.displayName = is;
var og = "PopoverAnchor";
var qT = p.forwardRef((t7, r2) => {
  const { __scopePopover: o, ...a } = t7, l = Jn(og, o), s = ja(o), { onCustomAnchorAdd: u2, onCustomAnchorRemove: f } = l;
  return p.useEffect(() => (u2(), () => f()), [u2, f]), E.jsx(Oa, { ...s, ...a, ref: r2 });
});
qT.displayName = og;
var ag = "PopoverTrigger";
var ig = p.forwardRef((t7, r2) => {
  const { __scopePopover: o, ...a } = t7, l = Jn(ag, o), s = ja(o), u2 = ve(r2, l.triggerRef), f = E.jsx(le.button, { type: "button", "aria-haspopup": "dialog", "aria-expanded": l.open, "aria-controls": l.contentId, "data-state": fg(l.open), ...a, ref: u2, onClick: u(t7.onClick, l.onOpenToggle) });
  return l.hasCustomAnchor ? f : E.jsx(Oa, { asChild: true, ...s, children: f });
});
ig.displayName = ag;
var Qf = "PopoverPortal";
var [KT, GT] = ng(Qf, { forceMount: void 0 });
var lg = (t7) => {
  const { __scopePopover: r2, forceMount: o, children: a, container: l } = t7, s = Jn(Qf, r2);
  return E.jsx(KT, { scope: r2, forceMount: o, children: E.jsx(Ge, { present: o || s.open, children: E.jsx(vo, { asChild: true, container: l, children: a }) }) });
};
lg.displayName = Qf;
var co = "PopoverContent";
var sg = p.forwardRef((t7, r2) => {
  const o = GT(co, t7.__scopePopover), { forceMount: a = o.forceMount, ...l } = t7, s = Jn(co, t7.__scopePopover);
  return E.jsx(Ge, { present: a || s.open, children: s.modal ? E.jsx(XT, { ...l, ref: r2 }) : E.jsx(QT, { ...l, ref: r2 }) });
});
sg.displayName = co;
var YT = $T("PopoverContent.RemoveScroll");
var XT = p.forwardRef((t7, r2) => {
  const o = Jn(co, t7.__scopePopover), a = p.useRef(null), l = ve(r2, a), s = p.useRef(false);
  return p.useEffect(() => {
    const u2 = a.current;
    if (u2) return Nl(u2);
  }, []), E.jsx(Ma, { as: YT, allowPinchZoom: true, children: E.jsx(cg, { ...t7, ref: l, trapFocus: o.open, disableOutsidePointerEvents: true, onCloseAutoFocus: u(t7.onCloseAutoFocus, (u2) => {
    u2.preventDefault(), s.current || o.triggerRef.current?.focus();
  }), onPointerDownOutside: u(t7.onPointerDownOutside, (u2) => {
    const f = u2.detail.originalEvent, d = f.button === 0 && f.ctrlKey === true, m = f.button === 2 || d;
    s.current = m;
  }, { checkForDefaultPrevented: false }), onFocusOutside: u(t7.onFocusOutside, (u2) => u2.preventDefault(), { checkForDefaultPrevented: false }) }) });
});
var QT = p.forwardRef((t7, r2) => {
  const o = Jn(co, t7.__scopePopover), a = p.useRef(false), l = p.useRef(false);
  return E.jsx(cg, { ...t7, ref: r2, trapFocus: false, disableOutsidePointerEvents: false, onCloseAutoFocus: (s) => {
    t7.onCloseAutoFocus?.(s), s.defaultPrevented || (a.current || o.triggerRef.current?.focus(), s.preventDefault()), a.current = false, l.current = false;
  }, onInteractOutside: (s) => {
    t7.onInteractOutside?.(s), s.defaultPrevented || (a.current = true, s.detail.originalEvent.type === "pointerdown" && (l.current = true));
    const u2 = s.target;
    o.triggerRef.current?.contains(u2) && s.preventDefault(), s.detail.originalEvent.type === "focusin" && l.current && s.preventDefault();
  } });
});
var cg = p.forwardRef((t7, r2) => {
  const { __scopePopover: o, trapFocus: a, onOpenAutoFocus: l, onCloseAutoFocus: s, disableOutsidePointerEvents: u2, onEscapeKeyDown: f, onPointerDownOutside: d, onFocusOutside: m, onInteractOutside: v, ...g } = t7, w = Jn(co, o), k = ja(o);
  return _l(), E.jsx(Ta, { asChild: true, loop: true, trapped: a, onMountAutoFocus: l, onUnmountAutoFocus: s, children: E.jsx(yo, { asChild: true, disableOutsidePointerEvents: u2, onInteractOutside: v, onEscapeKeyDown: f, onPointerDownOutside: d, onFocusOutside: m, onDismiss: () => w.onOpenChange(false), children: E.jsx(Bl, { "data-state": fg(w.open), role: "dialog", id: w.contentId, ...k, ...g, ref: r2, style: { ...g.style, "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)", "--radix-popover-content-available-width": "var(--radix-popper-available-width)", "--radix-popover-content-available-height": "var(--radix-popper-available-height)", "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)", "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)" } }) }) });
});
var ug = "PopoverClose";
var ZT = p.forwardRef((t7, r2) => {
  const { __scopePopover: o, ...a } = t7, l = Jn(ug, o);
  return E.jsx(le.button, { type: "button", ...a, ref: r2, onClick: u(t7.onClick, () => l.onOpenChange(false)) });
});
ZT.displayName = ug;
var JT = "PopoverArrow";
var eM = p.forwardRef((t7, r2) => {
  const { __scopePopover: o, ...a } = t7, l = ja(o);
  return E.jsx(Vl, { ...l, ...a, ref: r2 });
});
eM.displayName = JT;
function fg(t7) {
  return t7 ? "open" : "closed";
}
var bu = { exports: {} };
var Me = {};
var G1;
function tM() {
  if (G1) return Me;
  G1 = 1;
  var t7 = /* @__PURE__ */ Symbol.for("react.element"), r2 = /* @__PURE__ */ Symbol.for("react.portal"), o = /* @__PURE__ */ Symbol.for("react.fragment"), a = /* @__PURE__ */ Symbol.for("react.strict_mode"), l = /* @__PURE__ */ Symbol.for("react.profiler"), s = /* @__PURE__ */ Symbol.for("react.provider"), u2 = /* @__PURE__ */ Symbol.for("react.context"), f = /* @__PURE__ */ Symbol.for("react.server_context"), d = /* @__PURE__ */ Symbol.for("react.forward_ref"), m = /* @__PURE__ */ Symbol.for("react.suspense"), v = /* @__PURE__ */ Symbol.for("react.suspense_list"), g = /* @__PURE__ */ Symbol.for("react.memo"), w = /* @__PURE__ */ Symbol.for("react.lazy"), k = /* @__PURE__ */ Symbol.for("react.offscreen"), P;
  P = /* @__PURE__ */ Symbol.for("react.module.reference");
  function C(x) {
    if (typeof x == "object" && x !== null) {
      var R = x.$$typeof;
      switch (R) {
        case t7:
          switch (x = x.type, x) {
            case o:
            case l:
            case a:
            case m:
            case v:
              return x;
            default:
              switch (x = x && x.$$typeof, x) {
                case f:
                case u2:
                case d:
                case w:
                case g:
                case s:
                  return x;
                default:
                  return R;
              }
          }
        case r2:
          return R;
      }
    }
  }
  return Me.ContextConsumer = u2, Me.ContextProvider = s, Me.Element = t7, Me.ForwardRef = d, Me.Fragment = o, Me.Lazy = w, Me.Memo = g, Me.Portal = r2, Me.Profiler = l, Me.StrictMode = a, Me.Suspense = m, Me.SuspenseList = v, Me.isAsyncMode = function() {
    return false;
  }, Me.isConcurrentMode = function() {
    return false;
  }, Me.isContextConsumer = function(x) {
    return C(x) === u2;
  }, Me.isContextProvider = function(x) {
    return C(x) === s;
  }, Me.isElement = function(x) {
    return typeof x == "object" && x !== null && x.$$typeof === t7;
  }, Me.isForwardRef = function(x) {
    return C(x) === d;
  }, Me.isFragment = function(x) {
    return C(x) === o;
  }, Me.isLazy = function(x) {
    return C(x) === w;
  }, Me.isMemo = function(x) {
    return C(x) === g;
  }, Me.isPortal = function(x) {
    return C(x) === r2;
  }, Me.isProfiler = function(x) {
    return C(x) === l;
  }, Me.isStrictMode = function(x) {
    return C(x) === a;
  }, Me.isSuspense = function(x) {
    return C(x) === m;
  }, Me.isSuspenseList = function(x) {
    return C(x) === v;
  }, Me.isValidElementType = function(x) {
    return typeof x == "string" || typeof x == "function" || x === o || x === l || x === a || x === m || x === v || x === k || typeof x == "object" && x !== null && (x.$$typeof === w || x.$$typeof === g || x.$$typeof === s || x.$$typeof === u2 || x.$$typeof === d || x.$$typeof === P || x.getModuleId !== void 0);
  }, Me.typeOf = C, Me;
}
var Y1;
function nM() {
  return Y1 || (Y1 = 1, bu.exports = tM()), bu.exports;
}
var AO = nM();
var { getOwnPropertyNames: rM, getOwnPropertySymbols: oM } = Object;
var { hasOwnProperty: aM } = Object.prototype;
function Tu(t7, r2) {
  return function(a, l, s) {
    return t7(a, l, s) && r2(a, l, s);
  };
}
function el(t7) {
  return function(o, a, l) {
    if (!o || !a || typeof o != "object" || typeof a != "object") return t7(o, a, l);
    const { cache: s } = l, u2 = s.get(o), f = s.get(a);
    if (u2 && f) return u2 === a && f === o;
    s.set(o, a), s.set(a, o);
    const d = t7(o, a, l);
    return s.delete(o), s.delete(a), d;
  };
}
function iM(t7) {
  return t7?.[Symbol.toStringTag];
}
function X1(t7) {
  return rM(t7).concat(oM(t7));
}
var lM = Object.hasOwn || ((t7, r2) => aM.call(t7, r2));
function Rr(t7, r2) {
  return t7 === r2 || !t7 && !r2 && t7 !== t7 && r2 !== r2;
}
var sM = "__v";
var cM = "__o";
var uM = "_owner";
var { getOwnPropertyDescriptor: Q1, keys: Z1 } = Object;
function fM(t7, r2) {
  return t7.byteLength === r2.byteLength && xl(new Uint8Array(t7), new Uint8Array(r2));
}
function dM(t7, r2, o) {
  let a = t7.length;
  if (r2.length !== a) return false;
  for (; a-- > 0; ) if (!o.equals(t7[a], r2[a], a, a, t7, r2, o)) return false;
  return true;
}
function pM(t7, r2) {
  return t7.byteLength === r2.byteLength && xl(new Uint8Array(t7.buffer, t7.byteOffset, t7.byteLength), new Uint8Array(r2.buffer, r2.byteOffset, r2.byteLength));
}
function hM(t7, r2) {
  return Rr(t7.getTime(), r2.getTime());
}
function mM(t7, r2) {
  return t7.name === r2.name && t7.message === r2.message && t7.cause === r2.cause && t7.stack === r2.stack;
}
function yM(t7, r2) {
  return t7 === r2;
}
function J1(t7, r2, o) {
  const a = t7.size;
  if (a !== r2.size) return false;
  if (!a) return true;
  const l = new Array(a), s = t7.entries();
  let u2, f, d = 0;
  for (; (u2 = s.next()) && !u2.done; ) {
    const m = r2.entries();
    let v = false, g = 0;
    for (; (f = m.next()) && !f.done; ) {
      if (l[g]) {
        g++;
        continue;
      }
      const w = u2.value, k = f.value;
      if (o.equals(w[0], k[0], d, g, t7, r2, o) && o.equals(w[1], k[1], w[0], k[0], t7, r2, o)) {
        v = l[g] = true;
        break;
      }
      g++;
    }
    if (!v) return false;
    d++;
  }
  return true;
}
var vM = Rr;
function gM(t7, r2, o) {
  const a = Z1(t7);
  let l = a.length;
  if (Z1(r2).length !== l) return false;
  for (; l-- > 0; ) if (!dg(t7, r2, o, a[l])) return false;
  return true;
}
function fa(t7, r2, o) {
  const a = X1(t7);
  let l = a.length;
  if (X1(r2).length !== l) return false;
  let s, u2, f;
  for (; l-- > 0; ) if (s = a[l], !dg(t7, r2, o, s) || (u2 = Q1(t7, s), f = Q1(r2, s), (u2 || f) && (!u2 || !f || u2.configurable !== f.configurable || u2.enumerable !== f.enumerable || u2.writable !== f.writable))) return false;
  return true;
}
function wM(t7, r2) {
  return Rr(t7.valueOf(), r2.valueOf());
}
function xM(t7, r2) {
  return t7.source === r2.source && t7.flags === r2.flags;
}
function em(t7, r2, o) {
  const a = t7.size;
  if (a !== r2.size) return false;
  if (!a) return true;
  const l = new Array(a), s = t7.values();
  let u2, f;
  for (; (u2 = s.next()) && !u2.done; ) {
    const d = r2.values();
    let m = false, v = 0;
    for (; (f = d.next()) && !f.done; ) {
      if (!l[v] && o.equals(u2.value, f.value, u2.value, f.value, t7, r2, o)) {
        m = l[v] = true;
        break;
      }
      v++;
    }
    if (!m) return false;
  }
  return true;
}
function xl(t7, r2) {
  let o = t7.byteLength;
  if (r2.byteLength !== o || t7.byteOffset !== r2.byteOffset) return false;
  for (; o-- > 0; ) if (t7[o] !== r2[o]) return false;
  return true;
}
function SM(t7, r2) {
  return t7.hostname === r2.hostname && t7.pathname === r2.pathname && t7.protocol === r2.protocol && t7.port === r2.port && t7.hash === r2.hash && t7.username === r2.username && t7.password === r2.password;
}
function dg(t7, r2, o, a) {
  return (a === uM || a === cM || a === sM) && (t7.$$typeof || r2.$$typeof) ? true : lM(r2, a) && o.equals(t7[a], r2[a], a, a, t7, r2, o);
}
var CM = "[object ArrayBuffer]";
var kM = "[object Arguments]";
var EM = "[object Boolean]";
var RM = "[object DataView]";
var PM = "[object Date]";
var bM = "[object Error]";
var TM = "[object Map]";
var MM = "[object Number]";
var AM = "[object Object]";
var _M = "[object RegExp]";
var OM = "[object Set]";
var NM = "[object String]";
var IM = { "[object Int8Array]": true, "[object Uint8Array]": true, "[object Uint8ClampedArray]": true, "[object Int16Array]": true, "[object Uint16Array]": true, "[object Int32Array]": true, "[object Uint32Array]": true, "[object Float16Array]": true, "[object Float32Array]": true, "[object Float64Array]": true, "[object BigInt64Array]": true, "[object BigUint64Array]": true };
var DM = "[object URL]";
var LM = Object.prototype.toString;
function jM({ areArrayBuffersEqual: t7, areArraysEqual: r2, areDataViewsEqual: o, areDatesEqual: a, areErrorsEqual: l, areFunctionsEqual: s, areMapsEqual: u2, areNumbersEqual: f, areObjectsEqual: d, arePrimitiveWrappersEqual: m, areRegExpsEqual: v, areSetsEqual: g, areTypedArraysEqual: w, areUrlsEqual: k, unknownTagComparators: P }) {
  return function(x, R, b) {
    if (x === R) return true;
    if (x == null || R == null) return false;
    const M = typeof x;
    if (M !== typeof R) return false;
    if (M !== "object") return M === "number" ? f(x, R, b) : M === "function" ? s(x, R, b) : false;
    const N = x.constructor;
    if (N !== R.constructor) return false;
    if (N === Object) return d(x, R, b);
    if (Array.isArray(x)) return r2(x, R, b);
    if (N === Date) return a(x, R, b);
    if (N === RegExp) return v(x, R, b);
    if (N === Map) return u2(x, R, b);
    if (N === Set) return g(x, R, b);
    const j = LM.call(x);
    if (j === PM) return a(x, R, b);
    if (j === _M) return v(x, R, b);
    if (j === TM) return u2(x, R, b);
    if (j === OM) return g(x, R, b);
    if (j === AM) return typeof x.then != "function" && typeof R.then != "function" && d(x, R, b);
    if (j === DM) return k(x, R, b);
    if (j === bM) return l(x, R, b);
    if (j === kM) return d(x, R, b);
    if (IM[j]) return w(x, R, b);
    if (j === CM) return t7(x, R, b);
    if (j === RM) return o(x, R, b);
    if (j === EM || j === MM || j === NM) return m(x, R, b);
    if (P) {
      let B = P[j];
      if (!B) {
        const z = iM(x);
        z && (B = P[z]);
      }
      if (B) return B(x, R, b);
    }
    return false;
  };
}
function FM({ circular: t7, createCustomConfig: r2, strict: o }) {
  let a = { areArrayBuffersEqual: fM, areArraysEqual: o ? fa : dM, areDataViewsEqual: pM, areDatesEqual: hM, areErrorsEqual: mM, areFunctionsEqual: yM, areMapsEqual: o ? Tu(J1, fa) : J1, areNumbersEqual: vM, areObjectsEqual: o ? fa : gM, arePrimitiveWrappersEqual: wM, areRegExpsEqual: xM, areSetsEqual: o ? Tu(em, fa) : em, areTypedArraysEqual: o ? Tu(xl, fa) : xl, areUrlsEqual: SM, unknownTagComparators: void 0 };
  if (r2 && (a = Object.assign({}, a, r2(a))), t7) {
    const l = el(a.areArraysEqual), s = el(a.areMapsEqual), u2 = el(a.areObjectsEqual), f = el(a.areSetsEqual);
    a = Object.assign({}, a, { areArraysEqual: l, areMapsEqual: s, areObjectsEqual: u2, areSetsEqual: f });
  }
  return a;
}
function $M(t7) {
  return function(r2, o, a, l, s, u2, f) {
    return t7(r2, o, f);
  };
}
function zM({ circular: t7, comparator: r2, createState: o, equals: a, strict: l }) {
  if (o) return function(f, d) {
    const { cache: m = t7 ? /* @__PURE__ */ new WeakMap() : void 0, meta: v } = o();
    return r2(f, d, { cache: m, equals: a, meta: v, strict: l });
  };
  if (t7) return function(f, d) {
    return r2(f, d, { cache: /* @__PURE__ */ new WeakMap(), equals: a, meta: void 0, strict: l });
  };
  const s = { cache: void 0, equals: a, meta: void 0, strict: l };
  return function(f, d) {
    return r2(f, d, s);
  };
}
var HM = er();
er({ strict: true });
er({ circular: true });
er({ circular: true, strict: true });
er({ createInternalComparator: () => Rr });
er({ strict: true, createInternalComparator: () => Rr });
er({ circular: true, createInternalComparator: () => Rr });
er({ circular: true, createInternalComparator: () => Rr, strict: true });
function er(t7 = {}) {
  const { circular: r2 = false, createInternalComparator: o, createState: a, strict: l = false } = t7, s = FM(t7), u2 = jM(s), f = o ? o(u2) : $M(u2);
  return zM({ circular: r2, comparator: u2, createState: a, equals: f, strict: l });
}
function BM(t7) {
  typeof requestAnimationFrame < "u" && requestAnimationFrame(t7);
}
function tm(t7) {
  var r2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, o = -1, a = function l(s) {
    o < 0 && (o = s), s - o > r2 ? (t7(s), o = -1) : BM(l);
  };
  requestAnimationFrame(a);
}
function Qu(t7) {
  "@babel/helpers - typeof";
  return Qu = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r2) {
    return typeof r2;
  } : function(r2) {
    return r2 && typeof Symbol == "function" && r2.constructor === Symbol && r2 !== Symbol.prototype ? "symbol" : typeof r2;
  }, Qu(t7);
}
function VM(t7) {
  return KM(t7) || qM(t7) || WM(t7) || UM();
}
function UM() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function WM(t7, r2) {
  if (t7) {
    if (typeof t7 == "string") return nm(t7, r2);
    var o = Object.prototype.toString.call(t7).slice(8, -1);
    if (o === "Object" && t7.constructor && (o = t7.constructor.name), o === "Map" || o === "Set") return Array.from(t7);
    if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)) return nm(t7, r2);
  }
}
function nm(t7, r2) {
  (r2 == null || r2 > t7.length) && (r2 = t7.length);
  for (var o = 0, a = new Array(r2); o < r2; o++) a[o] = t7[o];
  return a;
}
function qM(t7) {
  if (typeof Symbol < "u" && t7[Symbol.iterator] != null || t7["@@iterator"] != null) return Array.from(t7);
}
function KM(t7) {
  if (Array.isArray(t7)) return t7;
}
function GM() {
  var t7 = {}, r2 = function() {
    return null;
  }, o = false, a = function l(s) {
    if (!o) {
      if (Array.isArray(s)) {
        if (!s.length) return;
        var u2 = s, f = VM(u2), d = f[0], m = f.slice(1);
        if (typeof d == "number") {
          tm(l.bind(null, m), d);
          return;
        }
        l(d), tm(l.bind(null, m));
        return;
      }
      Qu(s) === "object" && (t7 = s, r2(t7)), typeof s == "function" && s();
    }
  };
  return { stop: function() {
    o = true;
  }, start: function(s) {
    o = false, a(s);
  }, subscribe: function(s) {
    return r2 = s, function() {
      r2 = function() {
        return null;
      };
    };
  } };
}
function ka(t7) {
  "@babel/helpers - typeof";
  return ka = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r2) {
    return typeof r2;
  } : function(r2) {
    return r2 && typeof Symbol == "function" && r2.constructor === Symbol && r2 !== Symbol.prototype ? "symbol" : typeof r2;
  }, ka(t7);
}
function rm(t7, r2) {
  var o = Object.keys(t7);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(t7);
    r2 && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t7, l).enumerable;
    })), o.push.apply(o, a);
  }
  return o;
}
function om(t7) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var o = arguments[r2] != null ? arguments[r2] : {};
    r2 % 2 ? rm(Object(o), true).forEach(function(a) {
      pg(t7, a, o[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t7, Object.getOwnPropertyDescriptors(o)) : rm(Object(o)).forEach(function(a) {
      Object.defineProperty(t7, a, Object.getOwnPropertyDescriptor(o, a));
    });
  }
  return t7;
}
function pg(t7, r2, o) {
  return r2 = YM(r2), r2 in t7 ? Object.defineProperty(t7, r2, { value: o, enumerable: true, configurable: true, writable: true }) : t7[r2] = o, t7;
}
function YM(t7) {
  var r2 = XM(t7, "string");
  return ka(r2) === "symbol" ? r2 : String(r2);
}
function XM(t7, r2) {
  if (ka(t7) !== "object" || t7 === null) return t7;
  var o = t7[Symbol.toPrimitive];
  if (o !== void 0) {
    var a = o.call(t7, r2);
    if (ka(a) !== "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r2 === "string" ? String : Number)(t7);
}
var QM = function(r2, o) {
  return [Object.keys(r2), Object.keys(o)].reduce(function(a, l) {
    return a.filter(function(s) {
      return l.includes(s);
    });
  });
};
var ZM = function(r2) {
  return r2;
};
var JM = function(r2) {
  return r2.replace(/([A-Z])/g, function(o) {
    return "-".concat(o.toLowerCase());
  });
};
var ma = function(r2, o) {
  return Object.keys(o).reduce(function(a, l) {
    return om(om({}, a), {}, pg({}, l, r2(l, o[l])));
  }, {});
};
var am = function(r2, o, a) {
  return r2.map(function(l) {
    return "".concat(JM(l), " ").concat(o, "ms ").concat(a);
  }).join(",");
};
function e4(t7, r2) {
  return r4(t7) || n4(t7, r2) || hg(t7, r2) || t4();
}
function t4() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function n4(t7, r2) {
  var o = t7 == null ? null : typeof Symbol < "u" && t7[Symbol.iterator] || t7["@@iterator"];
  if (o != null) {
    var a, l, s, u2, f = [], d = true, m = false;
    try {
      if (s = (o = o.call(t7)).next, r2 !== 0) for (; !(d = (a = s.call(o)).done) && (f.push(a.value), f.length !== r2); d = true) ;
    } catch (v) {
      m = true, l = v;
    } finally {
      try {
        if (!d && o.return != null && (u2 = o.return(), Object(u2) !== u2)) return;
      } finally {
        if (m) throw l;
      }
    }
    return f;
  }
}
function r4(t7) {
  if (Array.isArray(t7)) return t7;
}
function o4(t7) {
  return l4(t7) || i4(t7) || hg(t7) || a4();
}
function a4() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function hg(t7, r2) {
  if (t7) {
    if (typeof t7 == "string") return Zu(t7, r2);
    var o = Object.prototype.toString.call(t7).slice(8, -1);
    if (o === "Object" && t7.constructor && (o = t7.constructor.name), o === "Map" || o === "Set") return Array.from(t7);
    if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)) return Zu(t7, r2);
  }
}
function i4(t7) {
  if (typeof Symbol < "u" && t7[Symbol.iterator] != null || t7["@@iterator"] != null) return Array.from(t7);
}
function l4(t7) {
  if (Array.isArray(t7)) return Zu(t7);
}
function Zu(t7, r2) {
  (r2 == null || r2 > t7.length) && (r2 = t7.length);
  for (var o = 0, a = new Array(r2); o < r2; o++) a[o] = t7[o];
  return a;
}
var Sl = 1e-4;
var mg = function(r2, o) {
  return [0, 3 * r2, 3 * o - 6 * r2, 3 * r2 - 3 * o + 1];
};
var yg = function(r2, o) {
  return r2.map(function(a, l) {
    return a * Math.pow(o, l);
  }).reduce(function(a, l) {
    return a + l;
  });
};
var im = function(r2, o) {
  return function(a) {
    var l = mg(r2, o);
    return yg(l, a);
  };
};
var s4 = function(r2, o) {
  return function(a) {
    var l = mg(r2, o), s = [].concat(o4(l.map(function(u2, f) {
      return u2 * f;
    }).slice(1)), [0]);
    return yg(s, a);
  };
};
var lm = function() {
  for (var r2 = arguments.length, o = new Array(r2), a = 0; a < r2; a++) o[a] = arguments[a];
  var l = o[0], s = o[1], u2 = o[2], f = o[3];
  if (o.length === 1) switch (o[0]) {
    case "linear":
      l = 0, s = 0, u2 = 1, f = 1;
      break;
    case "ease":
      l = 0.25, s = 0.1, u2 = 0.25, f = 1;
      break;
    case "ease-in":
      l = 0.42, s = 0, u2 = 1, f = 1;
      break;
    case "ease-out":
      l = 0.42, s = 0, u2 = 0.58, f = 1;
      break;
    case "ease-in-out":
      l = 0, s = 0, u2 = 0.58, f = 1;
      break;
    default: {
      var d = o[0].split("(");
      if (d[0] === "cubic-bezier" && d[1].split(")")[0].split(",").length === 4) {
        var m = d[1].split(")")[0].split(",").map(function(x) {
          return parseFloat(x);
        }), v = e4(m, 4);
        l = v[0], s = v[1], u2 = v[2], f = v[3];
      }
    }
  }
  var g = im(l, u2), w = im(s, f), k = s4(l, u2), P = function(R) {
    return R > 1 ? 1 : R < 0 ? 0 : R;
  }, C = function(R) {
    for (var b = R > 1 ? 1 : R, M = b, N = 0; N < 8; ++N) {
      var j = g(M) - b, B = k(M);
      if (Math.abs(j - b) < Sl || B < Sl) return w(M);
      M = P(M - j / B);
    }
    return w(M);
  };
  return C.isStepper = false, C;
};
var c4 = function() {
  var r2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, o = r2.stiff, a = o === void 0 ? 100 : o, l = r2.damping, s = l === void 0 ? 8 : l, u2 = r2.dt, f = u2 === void 0 ? 17 : u2, d = function(v, g, w) {
    var k = -(v - g) * a, P = w * s, C = w + (k - P) * f / 1e3, x = w * f / 1e3 + v;
    return Math.abs(x - g) < Sl && Math.abs(C) < Sl ? [g, 0] : [x, C];
  };
  return d.isStepper = true, d.dt = f, d;
};
var u4 = function() {
  for (var r2 = arguments.length, o = new Array(r2), a = 0; a < r2; a++) o[a] = arguments[a];
  var l = o[0];
  if (typeof l == "string") switch (l) {
    case "ease":
    case "ease-in-out":
    case "ease-out":
    case "ease-in":
    case "linear":
      return lm(l);
    case "spring":
      return c4();
    default:
      if (l.split("(")[0] === "cubic-bezier") return lm(l);
  }
  return typeof l == "function" ? l : null;
};
function Ea(t7) {
  "@babel/helpers - typeof";
  return Ea = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r2) {
    return typeof r2;
  } : function(r2) {
    return r2 && typeof Symbol == "function" && r2.constructor === Symbol && r2 !== Symbol.prototype ? "symbol" : typeof r2;
  }, Ea(t7);
}
function sm(t7) {
  return p4(t7) || d4(t7) || vg(t7) || f4();
}
function f4() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function d4(t7) {
  if (typeof Symbol < "u" && t7[Symbol.iterator] != null || t7["@@iterator"] != null) return Array.from(t7);
}
function p4(t7) {
  if (Array.isArray(t7)) return ef(t7);
}
function cm(t7, r2) {
  var o = Object.keys(t7);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(t7);
    r2 && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t7, l).enumerable;
    })), o.push.apply(o, a);
  }
  return o;
}
function nt(t7) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var o = arguments[r2] != null ? arguments[r2] : {};
    r2 % 2 ? cm(Object(o), true).forEach(function(a) {
      Ju(t7, a, o[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t7, Object.getOwnPropertyDescriptors(o)) : cm(Object(o)).forEach(function(a) {
      Object.defineProperty(t7, a, Object.getOwnPropertyDescriptor(o, a));
    });
  }
  return t7;
}
function Ju(t7, r2, o) {
  return r2 = h4(r2), r2 in t7 ? Object.defineProperty(t7, r2, { value: o, enumerable: true, configurable: true, writable: true }) : t7[r2] = o, t7;
}
function h4(t7) {
  var r2 = m4(t7, "string");
  return Ea(r2) === "symbol" ? r2 : String(r2);
}
function m4(t7, r2) {
  if (Ea(t7) !== "object" || t7 === null) return t7;
  var o = t7[Symbol.toPrimitive];
  if (o !== void 0) {
    var a = o.call(t7, r2);
    if (Ea(a) !== "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r2 === "string" ? String : Number)(t7);
}
function y4(t7, r2) {
  return w4(t7) || g4(t7, r2) || vg(t7, r2) || v4();
}
function v4() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function vg(t7, r2) {
  if (t7) {
    if (typeof t7 == "string") return ef(t7, r2);
    var o = Object.prototype.toString.call(t7).slice(8, -1);
    if (o === "Object" && t7.constructor && (o = t7.constructor.name), o === "Map" || o === "Set") return Array.from(t7);
    if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)) return ef(t7, r2);
  }
}
function ef(t7, r2) {
  (r2 == null || r2 > t7.length) && (r2 = t7.length);
  for (var o = 0, a = new Array(r2); o < r2; o++) a[o] = t7[o];
  return a;
}
function g4(t7, r2) {
  var o = t7 == null ? null : typeof Symbol < "u" && t7[Symbol.iterator] || t7["@@iterator"];
  if (o != null) {
    var a, l, s, u2, f = [], d = true, m = false;
    try {
      if (s = (o = o.call(t7)).next, r2 !== 0) for (; !(d = (a = s.call(o)).done) && (f.push(a.value), f.length !== r2); d = true) ;
    } catch (v) {
      m = true, l = v;
    } finally {
      try {
        if (!d && o.return != null && (u2 = o.return(), Object(u2) !== u2)) return;
      } finally {
        if (m) throw l;
      }
    }
    return f;
  }
}
function w4(t7) {
  if (Array.isArray(t7)) return t7;
}
var Cl = function(r2, o, a) {
  return r2 + (o - r2) * a;
};
var tf = function(r2) {
  var o = r2.from, a = r2.to;
  return o !== a;
};
var x4 = function t(r2, o, a) {
  var l = ma(function(s, u2) {
    if (tf(u2)) {
      var f = r2(u2.from, u2.to, u2.velocity), d = y4(f, 2), m = d[0], v = d[1];
      return nt(nt({}, u2), {}, { from: m, velocity: v });
    }
    return u2;
  }, o);
  return a < 1 ? ma(function(s, u2) {
    return tf(u2) ? nt(nt({}, u2), {}, { velocity: Cl(u2.velocity, l[s].velocity, a), from: Cl(u2.from, l[s].from, a) }) : u2;
  }, o) : t(r2, l, a - 1);
};
var S4 = (function(t7, r2, o, a, l) {
  var s = QM(t7, r2), u2 = s.reduce(function(x, R) {
    return nt(nt({}, x), {}, Ju({}, R, [t7[R], r2[R]]));
  }, {}), f = s.reduce(function(x, R) {
    return nt(nt({}, x), {}, Ju({}, R, { from: t7[R], velocity: 0, to: r2[R] }));
  }, {}), d = -1, m, v, g = function() {
    return null;
  }, w = function() {
    return ma(function(R, b) {
      return b.from;
    }, f);
  }, k = function() {
    return !Object.values(f).filter(tf).length;
  }, P = function(R) {
    m || (m = R);
    var b = R - m, M = b / o.dt;
    f = x4(o, f, M), l(nt(nt(nt({}, t7), r2), w())), m = R, k() || (d = requestAnimationFrame(g));
  }, C = function(R) {
    v || (v = R);
    var b = (R - v) / a, M = ma(function(j, B) {
      return Cl.apply(void 0, sm(B).concat([o(b)]));
    }, u2);
    if (l(nt(nt(nt({}, t7), r2), M)), b < 1) d = requestAnimationFrame(g);
    else {
      var N = ma(function(j, B) {
        return Cl.apply(void 0, sm(B).concat([o(1)]));
      }, u2);
      l(nt(nt(nt({}, t7), r2), N));
    }
  };
  return g = o.isStepper ? P : C, function() {
    return requestAnimationFrame(g), function() {
      cancelAnimationFrame(d);
    };
  };
});
function uo(t7) {
  "@babel/helpers - typeof";
  return uo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r2) {
    return typeof r2;
  } : function(r2) {
    return r2 && typeof Symbol == "function" && r2.constructor === Symbol && r2 !== Symbol.prototype ? "symbol" : typeof r2;
  }, uo(t7);
}
var C4 = ["children", "begin", "duration", "attributeName", "easing", "isActive", "steps", "from", "to", "canBegin", "onAnimationEnd", "shouldReAnimate", "onAnimationReStart"];
function k4(t7, r2) {
  if (t7 == null) return {};
  var o = E4(t7, r2), a, l;
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(t7);
    for (l = 0; l < s.length; l++) a = s[l], !(r2.indexOf(a) >= 0) && Object.prototype.propertyIsEnumerable.call(t7, a) && (o[a] = t7[a]);
  }
  return o;
}
function E4(t7, r2) {
  if (t7 == null) return {};
  var o = {}, a = Object.keys(t7), l, s;
  for (s = 0; s < a.length; s++) l = a[s], !(r2.indexOf(l) >= 0) && (o[l] = t7[l]);
  return o;
}
function Mu(t7) {
  return T4(t7) || b4(t7) || P4(t7) || R4();
}
function R4() {
  throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function P4(t7, r2) {
  if (t7) {
    if (typeof t7 == "string") return nf(t7, r2);
    var o = Object.prototype.toString.call(t7).slice(8, -1);
    if (o === "Object" && t7.constructor && (o = t7.constructor.name), o === "Map" || o === "Set") return Array.from(t7);
    if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)) return nf(t7, r2);
  }
}
function b4(t7) {
  if (typeof Symbol < "u" && t7[Symbol.iterator] != null || t7["@@iterator"] != null) return Array.from(t7);
}
function T4(t7) {
  if (Array.isArray(t7)) return nf(t7);
}
function nf(t7, r2) {
  (r2 == null || r2 > t7.length) && (r2 = t7.length);
  for (var o = 0, a = new Array(r2); o < r2; o++) a[o] = t7[o];
  return a;
}
function um(t7, r2) {
  var o = Object.keys(t7);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(t7);
    r2 && (a = a.filter(function(l) {
      return Object.getOwnPropertyDescriptor(t7, l).enumerable;
    })), o.push.apply(o, a);
  }
  return o;
}
function Wt(t7) {
  for (var r2 = 1; r2 < arguments.length; r2++) {
    var o = arguments[r2] != null ? arguments[r2] : {};
    r2 % 2 ? um(Object(o), true).forEach(function(a) {
      ha(t7, a, o[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t7, Object.getOwnPropertyDescriptors(o)) : um(Object(o)).forEach(function(a) {
      Object.defineProperty(t7, a, Object.getOwnPropertyDescriptor(o, a));
    });
  }
  return t7;
}
function ha(t7, r2, o) {
  return r2 = gg(r2), r2 in t7 ? Object.defineProperty(t7, r2, { value: o, enumerable: true, configurable: true, writable: true }) : t7[r2] = o, t7;
}
function M4(t7, r2) {
  if (!(t7 instanceof r2)) throw new TypeError("Cannot call a class as a function");
}
function A4(t7, r2) {
  for (var o = 0; o < r2.length; o++) {
    var a = r2[o];
    a.enumerable = a.enumerable || false, a.configurable = true, "value" in a && (a.writable = true), Object.defineProperty(t7, gg(a.key), a);
  }
}
function _4(t7, r2, o) {
  return r2 && A4(t7.prototype, r2), Object.defineProperty(t7, "prototype", { writable: false }), t7;
}
function gg(t7) {
  var r2 = O4(t7, "string");
  return uo(r2) === "symbol" ? r2 : String(r2);
}
function O4(t7, r2) {
  if (uo(t7) !== "object" || t7 === null) return t7;
  var o = t7[Symbol.toPrimitive];
  if (o !== void 0) {
    var a = o.call(t7, r2);
    if (uo(a) !== "object") return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r2 === "string" ? String : Number)(t7);
}
function N4(t7, r2) {
  if (typeof r2 != "function" && r2 !== null) throw new TypeError("Super expression must either be null or a function");
  t7.prototype = Object.create(r2 && r2.prototype, { constructor: { value: t7, writable: true, configurable: true } }), Object.defineProperty(t7, "prototype", { writable: false }), r2 && rf(t7, r2);
}
function rf(t7, r2) {
  return rf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(a, l) {
    return a.__proto__ = l, a;
  }, rf(t7, r2);
}
function I4(t7) {
  var r2 = D4();
  return function() {
    var a = kl(t7), l;
    if (r2) {
      var s = kl(this).constructor;
      l = Reflect.construct(a, arguments, s);
    } else l = a.apply(this, arguments);
    return of(this, l);
  };
}
function of(t7, r2) {
  if (r2 && (uo(r2) === "object" || typeof r2 == "function")) return r2;
  if (r2 !== void 0) throw new TypeError("Derived constructors may only return object or undefined");
  return af(t7);
}
function af(t7) {
  if (t7 === void 0) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return t7;
}
function D4() {
  if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham) return false;
  if (typeof Proxy == "function") return true;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    })), true;
  } catch {
    return false;
  }
}
function kl(t7) {
  return kl = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  }, kl(t7);
}
var Zf = (function(t7) {
  N4(o, t7);
  var r2 = I4(o);
  function o(a, l) {
    var s;
    M4(this, o), s = r2.call(this, a, l);
    var u2 = s.props, f = u2.isActive, d = u2.attributeName, m = u2.from, v = u2.to, g = u2.steps, w = u2.children, k = u2.duration;
    if (s.handleStyleChange = s.handleStyleChange.bind(af(s)), s.changeStyle = s.changeStyle.bind(af(s)), !f || k <= 0) return s.state = { style: {} }, typeof w == "function" && (s.state = { style: v }), of(s);
    if (g && g.length) s.state = { style: g[0].style };
    else if (m) {
      if (typeof w == "function") return s.state = { style: m }, of(s);
      s.state = { style: d ? ha({}, d, m) : m };
    } else s.state = { style: {} };
    return s;
  }
  return _4(o, [{ key: "componentDidMount", value: function() {
    var l = this.props, s = l.isActive, u2 = l.canBegin;
    this.mounted = true, !(!s || !u2) && this.runAnimation(this.props);
  } }, { key: "componentDidUpdate", value: function(l) {
    var s = this.props, u2 = s.isActive, f = s.canBegin, d = s.attributeName, m = s.shouldReAnimate, v = s.to, g = s.from, w = this.state.style;
    if (f) {
      if (!u2) {
        var k = { style: d ? ha({}, d, v) : v };
        this.state && w && (d && w[d] !== v || !d && w !== v) && this.setState(k);
        return;
      }
      if (!(HM(l.to, v) && l.canBegin && l.isActive)) {
        var P = !l.canBegin || !l.isActive;
        this.manager && this.manager.stop(), this.stopJSAnimation && this.stopJSAnimation();
        var C = P || m ? g : l.to;
        if (this.state && w) {
          var x = { style: d ? ha({}, d, C) : C };
          (d && w[d] !== C || !d && w !== C) && this.setState(x);
        }
        this.runAnimation(Wt(Wt({}, this.props), {}, { from: C, begin: 0 }));
      }
    }
  } }, { key: "componentWillUnmount", value: function() {
    this.mounted = false;
    var l = this.props.onAnimationEnd;
    this.unSubscribe && this.unSubscribe(), this.manager && (this.manager.stop(), this.manager = null), this.stopJSAnimation && this.stopJSAnimation(), l && l();
  } }, { key: "handleStyleChange", value: function(l) {
    this.changeStyle(l);
  } }, { key: "changeStyle", value: function(l) {
    this.mounted && this.setState({ style: l });
  } }, { key: "runJSAnimation", value: function(l) {
    var s = this, u2 = l.from, f = l.to, d = l.duration, m = l.easing, v = l.begin, g = l.onAnimationEnd, w = l.onAnimationStart, k = S4(u2, f, u4(m), d, this.changeStyle), P = function() {
      s.stopJSAnimation = k();
    };
    this.manager.start([w, v, P, d, g]);
  } }, { key: "runStepAnimation", value: function(l) {
    var s = this, u2 = l.steps, f = l.begin, d = l.onAnimationStart, m = u2[0], v = m.style, g = m.duration, w = g === void 0 ? 0 : g, k = function(C, x, R) {
      if (R === 0) return C;
      var b = x.duration, M = x.easing, N = M === void 0 ? "ease" : M, j = x.style, B = x.properties, z = x.onAnimationEnd, Q = R > 0 ? u2[R - 1] : x, Z = B || Object.keys(j);
      if (typeof N == "function" || N === "spring") return [].concat(Mu(C), [s.runJSAnimation.bind(s, { from: Q.style, to: j, duration: b, easing: N }), b]);
      var J = am(Z, b, N), ee = Wt(Wt(Wt({}, Q.style), j), {}, { transition: J });
      return [].concat(Mu(C), [ee, b, z]).filter(ZM);
    };
    return this.manager.start([d].concat(Mu(u2.reduce(k, [v, Math.max(w, f)])), [l.onAnimationEnd]));
  } }, { key: "runAnimation", value: function(l) {
    this.manager || (this.manager = GM());
    var s = l.begin, u2 = l.duration, f = l.attributeName, d = l.to, m = l.easing, v = l.onAnimationStart, g = l.onAnimationEnd, w = l.steps, k = l.children, P = this.manager;
    if (this.unSubscribe = P.subscribe(this.handleStyleChange), typeof m == "function" || typeof k == "function" || m === "spring") {
      this.runJSAnimation(l);
      return;
    }
    if (w.length > 1) {
      this.runStepAnimation(l);
      return;
    }
    var C = f ? ha({}, f, d) : d, x = am(Object.keys(C), u2, m);
    P.start([v, s, Wt(Wt({}, C), {}, { transition: x }), u2, g]);
  } }, { key: "render", value: function() {
    var l = this.props, s = l.children;
    l.begin;
    var u2 = l.duration;
    l.attributeName, l.easing;
    var f = l.isActive;
    l.steps, l.from, l.to, l.canBegin, l.onAnimationEnd, l.shouldReAnimate, l.onAnimationReStart;
    var d = k4(l, C4), m = p.Children.count(s), v = this.state.style;
    if (typeof s == "function") return s(v);
    if (!f || m === 0 || u2 <= 0) return s;
    var g = function(k) {
      var P = k.props, C = P.style, x = C === void 0 ? {} : C, R = P.className, b = p.cloneElement(k, Wt(Wt({}, d), {}, { style: Wt(Wt({}, x), v), className: R }));
      return b;
    };
    return m === 1 ? g(p.Children.only(s)) : Oe.createElement("div", null, p.Children.map(s, function(w) {
      return g(w);
    }));
  } }]), o;
})(p.PureComponent);
Zf.displayName = "Animate";
Zf.defaultProps = { begin: 0, duration: 1e3, from: "", to: "", attributeName: "", easing: "ease", isActive: true, canBegin: true, steps: [], onAnimationEnd: function() {
}, onAnimationStart: function() {
} };
Zf.propTypes = { from: pe.oneOfType([pe.object, pe.string]), to: pe.oneOfType([pe.object, pe.string]), attributeName: pe.string, duration: pe.number, begin: pe.number, easing: pe.oneOfType([pe.string, pe.func]), steps: pe.arrayOf(pe.shape({ duration: pe.number.isRequired, style: pe.object.isRequired, easing: pe.oneOfType([pe.oneOf(["ease", "ease-in", "ease-out", "ease-in-out", "linear"]), pe.func]), properties: pe.arrayOf("string"), onAnimationEnd: pe.func })), children: pe.oneOfType([pe.node, pe.func]), isActive: pe.bool, canBegin: pe.bool, onAnimationEnd: pe.func, shouldReAnimate: pe.bool, onAnimationStart: pe.func, onAnimationReStart: pe.func };
var L4 = /* @__PURE__ */ Symbol("radix.slottable");
function j4(t7) {
  const r2 = ({ children: o }) => E.jsx(E.Fragment, { children: o });
  return r2.displayName = `${t7}.Slottable`, r2.__radixId = L4, r2;
}
var wg = "AlertDialog";
var [F4] = ot(wg, [Gm]);
var Pn = Gm();
var xg = (t7) => {
  const { __scopeAlertDialog: r2, ...o } = t7, a = Pn(r2);
  return E.jsx(Sk, { ...a, ...o, modal: true });
};
xg.displayName = wg;
var $4 = "AlertDialogTrigger";
var z4 = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, l = Pn(o);
  return E.jsx(Ck, { ...l, ...a, ref: r2 });
});
z4.displayName = $4;
var H4 = "AlertDialogPortal";
var Sg = (t7) => {
  const { __scopeAlertDialog: r2, ...o } = t7, a = Pn(r2);
  return E.jsx(kk, { ...a, ...o });
};
Sg.displayName = H4;
var B4 = "AlertDialogOverlay";
var Cg = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, l = Pn(o);
  return E.jsx(Ek, { ...l, ...a, ref: r2 });
});
Cg.displayName = B4;
var io = "AlertDialogContent";
var [V4, U4] = F4(io);
var W4 = j4("AlertDialogContent");
var kg = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, children: a, ...l } = t7, s = Pn(o), u2 = p.useRef(null), f = ve(r2, u2), d = p.useRef(null);
  return E.jsx(vk, { contentName: io, titleName: Eg, docsSlug: "alert-dialog", children: E.jsx(V4, { scope: o, cancelRef: d, children: E.jsxs(Rk, { role: "alertdialog", ...s, ...l, ref: f, onOpenAutoFocus: u(l.onOpenAutoFocus, (m) => {
    m.preventDefault(), d.current?.focus({ preventScroll: true });
  }), onPointerDownOutside: (m) => m.preventDefault(), onInteractOutside: (m) => m.preventDefault(), children: [E.jsx(W4, { children: a }), E.jsx(K4, { contentRef: u2 })] }) }) });
});
kg.displayName = io;
var Eg = "AlertDialogTitle";
var Rg = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, l = Pn(o);
  return E.jsx(Pk, { ...l, ...a, ref: r2 });
});
Rg.displayName = Eg;
var Pg = "AlertDialogDescription";
var bg = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, l = Pn(o);
  return E.jsx(bk, { ...l, ...a, ref: r2 });
});
bg.displayName = Pg;
var q4 = "AlertDialogAction";
var Tg = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, l = Pn(o);
  return E.jsx(uy, { ...l, ...a, ref: r2 });
});
Tg.displayName = q4;
var Mg = "AlertDialogCancel";
var Ag = p.forwardRef((t7, r2) => {
  const { __scopeAlertDialog: o, ...a } = t7, { cancelRef: l } = U4(Mg, o), s = Pn(o), u2 = ve(r2, l);
  return E.jsx(uy, { ...s, ...a, ref: u2 });
});
Ag.displayName = Mg;
var K4 = ({ contentRef: t7 }) => {
  const r2 = `\`${io}\` requires a description for the component to be accessible for screen reader users.

You can add a description to the \`${io}\` by passing a \`${Pg}\` component as a child, which also benefits sighted users by adding visible context to the dialog.

Alternatively, you can use your own component as a description by assigning it an \`id\` and passing the same value to the \`aria-describedby\` prop in \`${io}\`. If the description is confusing or duplicative for sighted users, you can use the \`@radix-ui/react-visually-hidden\` primitive as a wrapper around your description component.

For more information, see https://radix-ui.com/primitives/docs/components/alert-dialog`;
  return p.useEffect(() => {
    document.getElementById(t7.current?.getAttribute("aria-describedby")) || console.warn(r2);
  }, [r2, t7]), null;
};
function G4(t7, r2) {
  return p.useReducer((o, a) => r2[o][a] ?? o, t7);
}
var Jf = "ScrollArea";
var [_g] = ot(Jf);
var [Y4, Lt] = _g(Jf);
var Og = p.forwardRef((t7, r2) => {
  const { __scopeScrollArea: o, type: a = "hover", dir: l, scrollHideDelay: s = 600, ...u2 } = t7, [f, d] = p.useState(null), [m, v] = p.useState(null), [g, w] = p.useState(null), [k, P] = p.useState(null), [C, x] = p.useState(null), [R, b] = p.useState(0), [M, N] = p.useState(0), [j, B] = p.useState(false), [z, Q] = p.useState(false), Z = ve(r2, (ee) => d(ee)), J = Cr(l);
  return E.jsx(Y4, { scope: o, type: a, dir: J, scrollHideDelay: s, scrollArea: f, viewport: m, onViewportChange: v, content: g, onContentChange: w, scrollbarX: k, onScrollbarXChange: P, scrollbarXEnabled: j, onScrollbarXEnabledChange: B, scrollbarY: C, onScrollbarYChange: x, scrollbarYEnabled: z, onScrollbarYEnabledChange: Q, onCornerWidthChange: b, onCornerHeightChange: N, children: E.jsx(le.div, { dir: J, ...u2, ref: Z, style: { position: "relative", "--radix-scroll-area-corner-width": R + "px", "--radix-scroll-area-corner-height": M + "px", ...t7.style } }) });
});
Og.displayName = Jf;
var Ng = "ScrollAreaViewport";
var Ig = p.forwardRef((t7, r2) => {
  const { __scopeScrollArea: o, children: a, nonce: l, ...s } = t7, u2 = Lt(Ng, o), f = p.useRef(null), d = ve(r2, f, u2.onViewportChange);
  return E.jsxs(E.Fragment, { children: [E.jsx("style", { dangerouslySetInnerHTML: { __html: "[data-radix-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-scroll-area-viewport]::-webkit-scrollbar{display:none}" }, nonce: l }), E.jsx(le.div, { "data-radix-scroll-area-viewport": "", ...s, ref: d, style: { overflowX: u2.scrollbarXEnabled ? "scroll" : "hidden", overflowY: u2.scrollbarYEnabled ? "scroll" : "hidden", ...t7.style }, children: E.jsx("div", { ref: u2.onContentChange, style: { minWidth: "100%", display: "table" }, children: a }) })] });
});
Ig.displayName = Ng;
var dn = "ScrollAreaScrollbar";
var X4 = p.forwardRef((t7, r2) => {
  const { forceMount: o, ...a } = t7, l = Lt(dn, t7.__scopeScrollArea), { onScrollbarXEnabledChange: s, onScrollbarYEnabledChange: u2 } = l, f = t7.orientation === "horizontal";
  return p.useEffect(() => (f ? s(true) : u2(true), () => {
    f ? s(false) : u2(false);
  }), [f, s, u2]), l.type === "hover" ? E.jsx(Q4, { ...a, ref: r2, forceMount: o }) : l.type === "scroll" ? E.jsx(Z4, { ...a, ref: r2, forceMount: o }) : l.type === "auto" ? E.jsx(Dg, { ...a, ref: r2, forceMount: o }) : l.type === "always" ? E.jsx(ed, { ...a, ref: r2 }) : null;
});
X4.displayName = dn;
var Q4 = p.forwardRef((t7, r2) => {
  const { forceMount: o, ...a } = t7, l = Lt(dn, t7.__scopeScrollArea), [s, u2] = p.useState(false);
  return p.useEffect(() => {
    const f = l.scrollArea;
    let d = 0;
    if (f) {
      const m = () => {
        window.clearTimeout(d), u2(true);
      }, v = () => {
        d = window.setTimeout(() => u2(false), l.scrollHideDelay);
      };
      return f.addEventListener("pointerenter", m), f.addEventListener("pointerleave", v), () => {
        window.clearTimeout(d), f.removeEventListener("pointerenter", m), f.removeEventListener("pointerleave", v);
      };
    }
  }, [l.scrollArea, l.scrollHideDelay]), E.jsx(Ge, { present: o || s, children: E.jsx(Dg, { "data-state": s ? "visible" : "hidden", ...a, ref: r2 }) });
});
var Z4 = p.forwardRef((t7, r2) => {
  const { forceMount: o, ...a } = t7, l = Lt(dn, t7.__scopeScrollArea), s = t7.orientation === "horizontal", u2 = ss(() => d("SCROLL_END"), 100), [f, d] = G4("hidden", { hidden: { SCROLL: "scrolling" }, scrolling: { SCROLL_END: "idle", POINTER_ENTER: "interacting" }, interacting: { SCROLL: "interacting", POINTER_LEAVE: "idle" }, idle: { HIDE: "hidden", SCROLL: "scrolling", POINTER_ENTER: "interacting" } });
  return p.useEffect(() => {
    if (f === "idle") {
      const m = window.setTimeout(() => d("HIDE"), l.scrollHideDelay);
      return () => window.clearTimeout(m);
    }
  }, [f, l.scrollHideDelay, d]), p.useEffect(() => {
    const m = l.viewport, v = s ? "scrollLeft" : "scrollTop";
    if (m) {
      let g = m[v];
      const w = () => {
        const k = m[v];
        g !== k && (d("SCROLL"), u2()), g = k;
      };
      return m.addEventListener("scroll", w), () => m.removeEventListener("scroll", w);
    }
  }, [l.viewport, s, d, u2]), E.jsx(Ge, { present: o || f !== "hidden", children: E.jsx(ed, { "data-state": f === "hidden" ? "hidden" : "visible", ...a, ref: r2, onPointerEnter: u(t7.onPointerEnter, () => d("POINTER_ENTER")), onPointerLeave: u(t7.onPointerLeave, () => d("POINTER_LEAVE")) }) });
});
var Dg = p.forwardRef((t7, r2) => {
  const o = Lt(dn, t7.__scopeScrollArea), { forceMount: a, ...l } = t7, [s, u2] = p.useState(false), f = t7.orientation === "horizontal", d = ss(() => {
    if (o.viewport) {
      const m = o.viewport.offsetWidth < o.viewport.scrollWidth, v = o.viewport.offsetHeight < o.viewport.scrollHeight;
      u2(f ? m : v);
    }
  }, 10);
  return fo(o.viewport, d), fo(o.content, d), E.jsx(Ge, { present: a || s, children: E.jsx(ed, { "data-state": s ? "visible" : "hidden", ...l, ref: r2 }) });
});
var ed = p.forwardRef((t7, r2) => {
  const { orientation: o = "vertical", ...a } = t7, l = Lt(dn, t7.__scopeScrollArea), s = p.useRef(null), u2 = p.useRef(0), [f, d] = p.useState({ content: 0, viewport: 0, scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 } }), m = $g(f.viewport, f.content), v = { ...a, sizes: f, onSizesChange: d, hasThumb: m > 0 && m < 1, onThumbChange: (w) => s.current = w, onThumbPointerUp: () => u2.current = 0, onThumbPointerDown: (w) => u2.current = w };
  function g(w, k) {
    return aA(w, u2.current, f, k);
  }
  return o === "horizontal" ? E.jsx(J4, { ...v, ref: r2, onThumbPositionChange: () => {
    if (l.viewport && s.current) {
      const w = l.viewport.scrollLeft, k = fm(w, f, l.dir);
      s.current.style.transform = `translate3d(${k}px, 0, 0)`;
    }
  }, onWheelScroll: (w) => {
    l.viewport && (l.viewport.scrollLeft = w);
  }, onDragScroll: (w) => {
    l.viewport && (l.viewport.scrollLeft = g(w, l.dir));
  } }) : o === "vertical" ? E.jsx(eA, { ...v, ref: r2, onThumbPositionChange: () => {
    if (l.viewport && s.current) {
      const w = l.viewport.scrollTop, k = fm(w, f);
      s.current.style.transform = `translate3d(0, ${k}px, 0)`;
    }
  }, onWheelScroll: (w) => {
    l.viewport && (l.viewport.scrollTop = w);
  }, onDragScroll: (w) => {
    l.viewport && (l.viewport.scrollTop = g(w));
  } }) : null;
});
var J4 = p.forwardRef((t7, r2) => {
  const { sizes: o, onSizesChange: a, ...l } = t7, s = Lt(dn, t7.__scopeScrollArea), [u2, f] = p.useState(), d = p.useRef(null), m = ve(r2, d, s.onScrollbarXChange);
  return p.useEffect(() => {
    d.current && f(getComputedStyle(d.current));
  }, [d]), E.jsx(jg, { "data-orientation": "horizontal", ...l, ref: m, sizes: o, style: { bottom: 0, left: s.dir === "rtl" ? "var(--radix-scroll-area-corner-width)" : 0, right: s.dir === "ltr" ? "var(--radix-scroll-area-corner-width)" : 0, "--radix-scroll-area-thumb-width": ls(o) + "px", ...t7.style }, onThumbPointerDown: (v) => t7.onThumbPointerDown(v.x), onDragScroll: (v) => t7.onDragScroll(v.x), onWheelScroll: (v, g) => {
    if (s.viewport) {
      const w = s.viewport.scrollLeft + v.deltaX;
      t7.onWheelScroll(w), Hg(w, g) && v.preventDefault();
    }
  }, onResize: () => {
    d.current && s.viewport && u2 && a({ content: s.viewport.scrollWidth, viewport: s.viewport.offsetWidth, scrollbar: { size: d.current.clientWidth, paddingStart: Rl(u2.paddingLeft), paddingEnd: Rl(u2.paddingRight) } });
  } });
});
var eA = p.forwardRef((t7, r2) => {
  const { sizes: o, onSizesChange: a, ...l } = t7, s = Lt(dn, t7.__scopeScrollArea), [u2, f] = p.useState(), d = p.useRef(null), m = ve(r2, d, s.onScrollbarYChange);
  return p.useEffect(() => {
    d.current && f(getComputedStyle(d.current));
  }, [d]), E.jsx(jg, { "data-orientation": "vertical", ...l, ref: m, sizes: o, style: { top: 0, right: s.dir === "ltr" ? 0 : void 0, left: s.dir === "rtl" ? 0 : void 0, bottom: "var(--radix-scroll-area-corner-height)", "--radix-scroll-area-thumb-height": ls(o) + "px", ...t7.style }, onThumbPointerDown: (v) => t7.onThumbPointerDown(v.y), onDragScroll: (v) => t7.onDragScroll(v.y), onWheelScroll: (v, g) => {
    if (s.viewport) {
      const w = s.viewport.scrollTop + v.deltaY;
      t7.onWheelScroll(w), Hg(w, g) && v.preventDefault();
    }
  }, onResize: () => {
    d.current && s.viewport && u2 && a({ content: s.viewport.scrollHeight, viewport: s.viewport.offsetHeight, scrollbar: { size: d.current.clientHeight, paddingStart: Rl(u2.paddingTop), paddingEnd: Rl(u2.paddingBottom) } });
  } });
});
var [tA, Lg] = _g(dn);
var jg = p.forwardRef((t7, r2) => {
  const { __scopeScrollArea: o, sizes: a, hasThumb: l, onThumbChange: s, onThumbPointerUp: u2, onThumbPointerDown: f, onThumbPositionChange: d, onDragScroll: m, onWheelScroll: v, onResize: g, ...w } = t7, k = Lt(dn, o), [P, C] = p.useState(null), x = ve(r2, (Z) => C(Z)), R = p.useRef(null), b = p.useRef(""), M = k.viewport, N = a.content - a.viewport, j = rt(v), B = rt(d), z = ss(g, 10);
  function Q(Z) {
    if (R.current) {
      const J = Z.clientX - R.current.left, ee = Z.clientY - R.current.top;
      m({ x: J, y: ee });
    }
  }
  return p.useEffect(() => {
    const Z = (J) => {
      const ee = J.target;
      P?.contains(ee) && j(J, N);
    };
    return document.addEventListener("wheel", Z, { passive: false }), () => document.removeEventListener("wheel", Z, { passive: false });
  }, [M, P, N, j]), p.useEffect(B, [a, B]), fo(P, z), fo(k.content, z), E.jsx(tA, { scope: o, scrollbar: P, hasThumb: l, onThumbChange: rt(s), onThumbPointerUp: rt(u2), onThumbPositionChange: B, onThumbPointerDown: rt(f), children: E.jsx(le.div, { ...w, ref: x, style: { position: "absolute", ...w.style }, onPointerDown: u(t7.onPointerDown, (Z) => {
    Z.button === 0 && (Z.target.setPointerCapture(Z.pointerId), R.current = P.getBoundingClientRect(), b.current = document.body.style.webkitUserSelect, document.body.style.webkitUserSelect = "none", k.viewport && (k.viewport.style.scrollBehavior = "auto"), Q(Z));
  }), onPointerMove: u(t7.onPointerMove, Q), onPointerUp: u(t7.onPointerUp, (Z) => {
    const J = Z.target;
    J.hasPointerCapture(Z.pointerId) && J.releasePointerCapture(Z.pointerId), document.body.style.webkitUserSelect = b.current, k.viewport && (k.viewport.style.scrollBehavior = ""), R.current = null;
  }) }) });
});
var El = "ScrollAreaThumb";
var nA = p.forwardRef((t7, r2) => {
  const { forceMount: o, ...a } = t7, l = Lg(El, t7.__scopeScrollArea);
  return E.jsx(Ge, { present: o || l.hasThumb, children: E.jsx(rA, { ref: r2, ...a }) });
});
var rA = p.forwardRef((t7, r2) => {
  const { __scopeScrollArea: o, style: a, ...l } = t7, s = Lt(El, o), u2 = Lg(El, o), { onThumbPositionChange: f } = u2, d = ve(r2, (g) => u2.onThumbChange(g)), m = p.useRef(void 0), v = ss(() => {
    m.current && (m.current(), m.current = void 0);
  }, 100);
  return p.useEffect(() => {
    const g = s.viewport;
    if (g) {
      const w = () => {
        if (v(), !m.current) {
          const k = iA(g, f);
          m.current = k, f();
        }
      };
      return f(), g.addEventListener("scroll", w), () => g.removeEventListener("scroll", w);
    }
  }, [s.viewport, v, f]), E.jsx(le.div, { "data-state": u2.hasThumb ? "visible" : "hidden", ...l, ref: d, style: { width: "var(--radix-scroll-area-thumb-width)", height: "var(--radix-scroll-area-thumb-height)", ...a }, onPointerDownCapture: u(t7.onPointerDownCapture, (g) => {
    const k = g.target.getBoundingClientRect(), P = g.clientX - k.left, C = g.clientY - k.top;
    u2.onThumbPointerDown({ x: P, y: C });
  }), onPointerUp: u(t7.onPointerUp, u2.onThumbPointerUp) });
});
nA.displayName = El;
var td = "ScrollAreaCorner";
var Fg = p.forwardRef((t7, r2) => {
  const o = Lt(td, t7.__scopeScrollArea), a = !!(o.scrollbarX && o.scrollbarY);
  return o.type !== "scroll" && a ? E.jsx(oA, { ...t7, ref: r2 }) : null;
});
Fg.displayName = td;
var oA = p.forwardRef((t7, r2) => {
  const { __scopeScrollArea: o, ...a } = t7, l = Lt(td, o), [s, u2] = p.useState(0), [f, d] = p.useState(0), m = !!(s && f);
  return fo(l.scrollbarX, () => {
    const v = l.scrollbarX?.offsetHeight || 0;
    l.onCornerHeightChange(v), d(v);
  }), fo(l.scrollbarY, () => {
    const v = l.scrollbarY?.offsetWidth || 0;
    l.onCornerWidthChange(v), u2(v);
  }), m ? E.jsx(le.div, { ...a, ref: r2, style: { width: s, height: f, position: "absolute", right: l.dir === "ltr" ? 0 : void 0, left: l.dir === "rtl" ? 0 : void 0, bottom: 0, ...t7.style } }) : null;
});
function Rl(t7) {
  return t7 ? parseInt(t7, 10) : 0;
}
function $g(t7, r2) {
  const o = t7 / r2;
  return isNaN(o) ? 0 : o;
}
function ls(t7) {
  const r2 = $g(t7.viewport, t7.content), o = t7.scrollbar.paddingStart + t7.scrollbar.paddingEnd, a = (t7.scrollbar.size - o) * r2;
  return Math.max(a, 18);
}
function aA(t7, r2, o, a = "ltr") {
  const l = ls(o), s = l / 2, u2 = r2 || s, f = l - u2, d = o.scrollbar.paddingStart + u2, m = o.scrollbar.size - o.scrollbar.paddingEnd - f, v = o.content - o.viewport, g = a === "ltr" ? [0, v] : [v * -1, 0];
  return zg([d, m], g)(t7);
}
function fm(t7, r2, o = "ltr") {
  const a = ls(r2), l = r2.scrollbar.paddingStart + r2.scrollbar.paddingEnd, s = r2.scrollbar.size - l, u2 = r2.content - r2.viewport, f = s - a, d = o === "ltr" ? [0, u2] : [u2 * -1, 0], m = c(t7, d);
  return zg([0, u2], [0, f])(m);
}
function zg(t7, r2) {
  return (o) => {
    if (t7[0] === t7[1] || r2[0] === r2[1]) return r2[0];
    const a = (r2[1] - r2[0]) / (t7[1] - t7[0]);
    return r2[0] + a * (o - t7[0]);
  };
}
function Hg(t7, r2) {
  return t7 > 0 && t7 < r2;
}
var iA = (t7, r2 = () => {
}) => {
  let o = { left: t7.scrollLeft, top: t7.scrollTop }, a = 0;
  return (function l() {
    const s = { left: t7.scrollLeft, top: t7.scrollTop }, u2 = o.left !== s.left, f = o.top !== s.top;
    (u2 || f) && r2(), o = s, a = window.requestAnimationFrame(l);
  })(), () => window.cancelAnimationFrame(a);
};
function ss(t7, r2) {
  const o = rt(t7), a = p.useRef(0);
  return p.useEffect(() => () => window.clearTimeout(a.current), []), p.useCallback(() => {
    window.clearTimeout(a.current), a.current = window.setTimeout(o, r2);
  }, [o, r2]);
}
function fo(t7, r2) {
  const o = rt(r2);
  Ze(() => {
    let a = 0;
    if (t7) {
      const l = new ResizeObserver(() => {
        cancelAnimationFrame(a), a = window.requestAnimationFrame(o);
      });
      return l.observe(t7), () => {
        window.cancelAnimationFrame(a), l.unobserve(t7);
      };
    }
  }, [t7, o]);
}
var Bg = ["PageUp", "PageDown"];
var Vg = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var Ug = { "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"], "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"], "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"], "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"] };
var So = "Slider";
var [lf, lA, sA] = Aa(So);
var [Wg] = ot(So, [sA]);
var [cA, cs] = Wg(So);
var qg = p.forwardRef((t7, r2) => {
  const { name: o, min: a = 0, max: l = 100, step: s = 1, orientation: u2 = "horizontal", disabled: f = false, minStepsBetweenThumbs: d = 0, defaultValue: m = [a], value: v, onValueChange: g = () => {
  }, onValueCommit: w = () => {
  }, inverted: k = false, form: P, ...C } = t7, x = p.useRef(/* @__PURE__ */ new Set()), R = p.useRef(0), M = u2 === "horizontal" ? uA : fA, [N = [], j] = xt({ prop: v, defaultProp: m, onChange: (ee) => {
    [...x.current][R.current]?.focus(), g(ee);
  } }), B = p.useRef(N);
  function z(ee) {
    const ce = yA(N, ee);
    J(ee, ce);
  }
  function Q(ee) {
    J(ee, R.current);
  }
  function Z() {
    const ee = B.current[R.current];
    N[R.current] !== ee && w(N);
  }
  function J(ee, ce, { commit: fe } = { commit: false }) {
    const de = xA(s), ye = SA(Math.round((ee - a) / s) * s + a, de), re = c(ye, [a, l]);
    j((ae = []) => {
      const $ = hA(ae, re, ce);
      if (wA($, d * s)) {
        R.current = $.indexOf(re);
        const H = String($) !== String(ae);
        return H && fe && w($), H ? $ : ae;
      } else return ae;
    });
  }
  return E.jsx(cA, { scope: t7.__scopeSlider, name: o, disabled: f, min: a, max: l, valueIndexToChangeRef: R, thumbs: x.current, values: N, orientation: u2, form: P, children: E.jsx(lf.Provider, { scope: t7.__scopeSlider, children: E.jsx(lf.Slot, { scope: t7.__scopeSlider, children: E.jsx(M, { "aria-disabled": f, "data-disabled": f ? "" : void 0, ...C, ref: r2, onPointerDown: u(C.onPointerDown, () => {
    f || (B.current = N);
  }), min: a, max: l, inverted: k, onSlideStart: f ? void 0 : z, onSlideMove: f ? void 0 : Q, onSlideEnd: f ? void 0 : Z, onHomeKeyDown: () => !f && J(a, 0, { commit: true }), onEndKeyDown: () => !f && J(l, N.length - 1, { commit: true }), onStepKeyDown: ({ event: ee, direction: ce }) => {
    if (!f) {
      const ye = Bg.includes(ee.key) || ee.shiftKey && Vg.includes(ee.key) ? 10 : 1, re = R.current, ae = N[re], $ = s * ye * ce;
      J(ae + $, re, { commit: true });
    }
  } }) }) }) });
});
qg.displayName = So;
var [Kg, Gg] = Wg(So, { startEdge: "left", endEdge: "right", size: "width", direction: 1 });
var uA = p.forwardRef((t7, r2) => {
  const { min: o, max: a, dir: l, inverted: s, onSlideStart: u2, onSlideMove: f, onSlideEnd: d, onStepKeyDown: m, ...v } = t7, [g, w] = p.useState(null), k = ve(r2, (M) => w(M)), P = p.useRef(void 0), C = Cr(l), x = C === "ltr", R = x && !s || !x && s;
  function b(M) {
    const N = P.current || g.getBoundingClientRect(), j = [0, N.width], z = nd(j, R ? [o, a] : [a, o]);
    return P.current = N, z(M - N.left);
  }
  return E.jsx(Kg, { scope: t7.__scopeSlider, startEdge: R ? "left" : "right", endEdge: R ? "right" : "left", direction: R ? 1 : -1, size: "width", children: E.jsx(Yg, { dir: C, "data-orientation": "horizontal", ...v, ref: k, style: { ...v.style, "--radix-slider-thumb-transform": "translateX(-50%)" }, onSlideStart: (M) => {
    const N = b(M.clientX);
    u2?.(N);
  }, onSlideMove: (M) => {
    const N = b(M.clientX);
    f?.(N);
  }, onSlideEnd: () => {
    P.current = void 0, d?.();
  }, onStepKeyDown: (M) => {
    const j = Ug[R ? "from-left" : "from-right"].includes(M.key);
    m?.({ event: M, direction: j ? -1 : 1 });
  } }) });
});
var fA = p.forwardRef((t7, r2) => {
  const { min: o, max: a, inverted: l, onSlideStart: s, onSlideMove: u2, onSlideEnd: f, onStepKeyDown: d, ...m } = t7, v = p.useRef(null), g = ve(r2, v), w = p.useRef(void 0), k = !l;
  function P(C) {
    const x = w.current || v.current.getBoundingClientRect(), R = [0, x.height], M = nd(R, k ? [a, o] : [o, a]);
    return w.current = x, M(C - x.top);
  }
  return E.jsx(Kg, { scope: t7.__scopeSlider, startEdge: k ? "bottom" : "top", endEdge: k ? "top" : "bottom", size: "height", direction: k ? 1 : -1, children: E.jsx(Yg, { "data-orientation": "vertical", ...m, ref: g, style: { ...m.style, "--radix-slider-thumb-transform": "translateY(50%)" }, onSlideStart: (C) => {
    const x = P(C.clientY);
    s?.(x);
  }, onSlideMove: (C) => {
    const x = P(C.clientY);
    u2?.(x);
  }, onSlideEnd: () => {
    w.current = void 0, f?.();
  }, onStepKeyDown: (C) => {
    const R = Ug[k ? "from-bottom" : "from-top"].includes(C.key);
    d?.({ event: C, direction: R ? -1 : 1 });
  } }) });
});
var Yg = p.forwardRef((t7, r2) => {
  const { __scopeSlider: o, onSlideStart: a, onSlideMove: l, onSlideEnd: s, onHomeKeyDown: u2, onEndKeyDown: f, onStepKeyDown: d, ...m } = t7, v = cs(So, o);
  return E.jsx(le.span, { ...m, ref: r2, onKeyDown: u(t7.onKeyDown, (g) => {
    g.key === "Home" ? (u2(g), g.preventDefault()) : g.key === "End" ? (f(g), g.preventDefault()) : Bg.concat(Vg).includes(g.key) && (d(g), g.preventDefault());
  }), onPointerDown: u(t7.onPointerDown, (g) => {
    const w = g.target;
    w.setPointerCapture(g.pointerId), g.preventDefault(), v.thumbs.has(w) ? w.focus() : a(g);
  }), onPointerMove: u(t7.onPointerMove, (g) => {
    g.target.hasPointerCapture(g.pointerId) && l(g);
  }), onPointerUp: u(t7.onPointerUp, (g) => {
    const w = g.target;
    w.hasPointerCapture(g.pointerId) && (w.releasePointerCapture(g.pointerId), s(g));
  }) });
});
var Xg = "SliderTrack";
var Qg = p.forwardRef((t7, r2) => {
  const { __scopeSlider: o, ...a } = t7, l = cs(Xg, o);
  return E.jsx(le.span, { "data-disabled": l.disabled ? "" : void 0, "data-orientation": l.orientation, ...a, ref: r2 });
});
Qg.displayName = Xg;
var sf = "SliderRange";
var Zg = p.forwardRef((t7, r2) => {
  const { __scopeSlider: o, ...a } = t7, l = cs(sf, o), s = Gg(sf, o), u2 = p.useRef(null), f = ve(r2, u2), d = l.values.length, m = l.values.map((w) => t2(w, l.min, l.max)), v = d > 1 ? Math.min(...m) : 0, g = 100 - Math.max(...m);
  return E.jsx(le.span, { "data-orientation": l.orientation, "data-disabled": l.disabled ? "" : void 0, ...a, ref: f, style: { ...t7.style, [s.startEdge]: v + "%", [s.endEdge]: g + "%" } });
});
Zg.displayName = sf;
var cf = "SliderThumb";
var Jg = p.forwardRef((t7, r2) => {
  const o = lA(t7.__scopeSlider), [a, l] = p.useState(null), s = ve(r2, (f) => l(f)), u2 = p.useMemo(() => a ? o().findIndex((f) => f.ref.current === a) : -1, [o, a]);
  return E.jsx(dA, { ...t7, ref: s, index: u2 });
});
var dA = p.forwardRef((t7, r2) => {
  const { __scopeSlider: o, index: a, name: l, ...s } = t7, u2 = cs(cf, o), f = Gg(cf, o), [d, m] = p.useState(null), v = ve(r2, (b) => m(b)), g = d ? u2.form || !!d.closest("form") : true, w = zl(d), k = u2.values[a], P = k === void 0 ? 0 : t2(k, u2.min, u2.max), C = mA(a, u2.values.length), x = w?.[f.size], R = x ? vA(x, P, f.direction) : 0;
  return p.useEffect(() => {
    if (d) return u2.thumbs.add(d), () => {
      u2.thumbs.delete(d);
    };
  }, [d, u2.thumbs]), E.jsxs("span", { style: { transform: "var(--radix-slider-thumb-transform)", position: "absolute", [f.startEdge]: `calc(${P}% + ${R}px)` }, children: [E.jsx(lf.ItemSlot, { scope: t7.__scopeSlider, children: E.jsx(le.span, { role: "slider", "aria-label": t7["aria-label"] || C, "aria-valuemin": u2.min, "aria-valuenow": k, "aria-valuemax": u2.max, "aria-orientation": u2.orientation, "data-orientation": u2.orientation, "data-disabled": u2.disabled ? "" : void 0, tabIndex: u2.disabled ? void 0 : 0, ...s, ref: v, style: k === void 0 ? { display: "none" } : t7.style, onFocus: u(t7.onFocus, () => {
    u2.valueIndexToChangeRef.current = a;
  }) }) }), g && E.jsx(e2, { name: l ?? (u2.name ? u2.name + (u2.values.length > 1 ? "[]" : "") : void 0), form: u2.form, value: k }, a)] });
});
Jg.displayName = cf;
var pA = "RadioBubbleInput";
var e2 = p.forwardRef(({ __scopeSlider: t7, value: r2, ...o }, a) => {
  const l = p.useRef(null), s = ve(l, a), u2 = Xl(r2);
  return p.useEffect(() => {
    const f = l.current;
    if (!f) return;
    const d = window.HTMLInputElement.prototype, v = Object.getOwnPropertyDescriptor(d, "value").set;
    if (u2 !== r2 && v) {
      const g = new Event("input", { bubbles: true });
      v.call(f, r2), f.dispatchEvent(g);
    }
  }, [u2, r2]), E.jsx(le.input, { style: { display: "none" }, ...o, ref: s, defaultValue: r2 });
});
e2.displayName = pA;
function hA(t7 = [], r2, o) {
  const a = [...t7];
  return a[o] = r2, a.sort((l, s) => l - s);
}
function t2(t7, r2, o) {
  const s = 100 / (o - r2) * (t7 - r2);
  return c(s, [0, 100]);
}
function mA(t7, r2) {
  return r2 > 2 ? `Value ${t7 + 1} of ${r2}` : r2 === 2 ? ["Minimum", "Maximum"][t7] : void 0;
}
function yA(t7, r2) {
  if (t7.length === 1) return 0;
  const o = t7.map((l) => Math.abs(l - r2)), a = Math.min(...o);
  return o.indexOf(a);
}
function vA(t7, r2, o) {
  const a = t7 / 2, s = nd([0, 50], [0, a]);
  return (a - s(r2) * o) * o;
}
function gA(t7) {
  return t7.slice(0, -1).map((r2, o) => t7[o + 1] - r2);
}
function wA(t7, r2) {
  if (r2 > 0) {
    const o = gA(t7);
    return Math.min(...o) >= r2;
  }
  return true;
}
function nd(t7, r2) {
  return (o) => {
    if (t7[0] === t7[1] || r2[0] === r2[1]) return r2[0];
    const a = (r2[1] - r2[0]) / (t7[1] - t7[0]);
    return r2[0] + a * (o - t7[0]);
  };
}
function xA(t7) {
  return (String(t7).split(".")[1] || "").length;
}
function SA(t7, r2) {
  const o = Math.pow(10, r2);
  return Math.round(t7 * o) / o;
}
var CA = ["a", "button", "div", "form", "h2", "h3", "img", "input", "label", "li", "nav", "ol", "p", "select", "span", "svg", "ul"];
var kA = CA.reduce((t7, r2) => {
  const o = Dl(`Primitive.${r2}`), a = p.forwardRef((l, s) => {
    const { asChild: u2, ...f } = l, d = u2 ? o : r2;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = true), E.jsx(d, { ...f, ref: s });
  });
  return a.displayName = `Primitive.${r2}`, { ...t7, [r2]: a };
}, {});
var EA = "Separator";
var dm = "horizontal";
var RA = ["horizontal", "vertical"];
var n2 = p.forwardRef((t7, r2) => {
  const { decorative: o, orientation: a = dm, ...l } = t7, s = PA(a) ? a : dm, f = o ? { role: "none" } : { "aria-orientation": s === "vertical" ? s : void 0, role: "separator" };
  return E.jsx(kA.div, { "data-orientation": s, ...f, ...l, ref: r2 });
});
n2.displayName = EA;
function PA(t7) {
  return RA.includes(t7);
}

// virtual:virtual-react
var virtual_react_default = p;
var jsx = p.createElement;
var jsxs = p.createElement;
var jsxDEV = p.createElement;
var Fragment = p.Fragment;
var {
  Children,
  Component,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  act,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version
} = p;

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
  const Component2 = forwardRef(
    ({ className, ...props }, ref) => createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(`lucide-${toKebabCase(iconName)}`, className),
      ...props
    })
  );
  Component2.displayName = `${iconName}`;
  return Component2;
};

// apps/web/node_modules/lucide-react/dist/esm/icons/arrow-up-right.js
var ArrowUpRight = createLucideIcon("ArrowUpRight", [
  ["path", { d: "M7 7h10v10", key: "1tivn9" }],
  ["path", { d: "M7 17 17 7", key: "1vkiza" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/check-check.js
var CheckCheck = createLucideIcon("CheckCheck", [
  ["path", { d: "M18 6 7 17l-5-5", key: "116fxf" }],
  ["path", { d: "m22 10-7.5 7.5L13 16", key: "ke71qq" }]
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

// apps/web/node_modules/lucide-react/dist/esm/icons/clock.js
var Clock = createLucideIcon("Clock", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/dollar-sign.js
var DollarSign = createLucideIcon("DollarSign", [
  ["line", { x1: "12", x2: "12", y1: "2", y2: "22", key: "7eqyqh" }],
  ["path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", key: "1b0p4s" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/inbox.js
var Inbox = createLucideIcon("Inbox", [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/message-square.js
var MessageSquare = createLucideIcon("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);

// apps/web/node_modules/lucide-react/dist/esm/icons/refresh-cw.js
var RefreshCw = createLucideIcon("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
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

// apps/web/node_modules/lucide-react/dist/esm/icons/x.js
var X = createLucideIcon("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);

// node_modules/clsx/dist/clsx.mjs
function r(e) {
  var t7, f, n = "";
  if ("string" == typeof e || "number" == typeof e) n += e;
  else if ("object" == typeof e) if (Array.isArray(e)) {
    var o = e.length;
    for (t7 = 0; t7 < o; t7++) e[t7] && (f = r(e[t7])) && (n && (n += " "), n += f);
  } else for (f in e) e[f] && (n && (n += " "), n += f);
  return n;
}
function clsx() {
  for (var e, t7, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t7 = r(e)) && (n && (n += " "), n += t7);
  return n;
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
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
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
function cn2(...inputs) {
  return twMerge(clsx(inputs));
}

// apps/web/src/components/ui/card.jsx
var Card = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn2("rounded-xl border bg-card text-card-foreground shadow", className),
    ...props
  }
));
Card.displayName = "Card";
var CardHeader = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn2("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
var CardTitle = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn2("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
var CardDescription = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn2("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
var CardContent = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement("div", { ref, className: cn2("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
var CardFooter = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  "div",
  {
    ref,
    className: cn2("flex items-center p-6 pt-0", className),
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
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup == "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
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
var use = virtual_react_exports[" use ".trim().toString()];

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
      className: cn2(buttonVariants({ variant, size, className })),
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
  return /* @__PURE__ */ createElement("div", { className: cn2(badgeVariants({ variant }), className), ...props });
}

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

// node_modules/@radix-ui/react-collection/dist/index.mjs
var __defProp6 = Object.defineProperty;
var __name5 = (target, value) => __defProp6(target, "name", { value, configurable: true });
// @__NO_SIDE_EFFECTS__
function createCollection(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionProviderImpl, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  );
  const CollectionProvider = /* @__PURE__ */ __name5((props) => {
    const { scope, children } = props;
    const ref = useRef(null);
    const itemMap = useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ jsx(CollectionProviderImpl, { scope, itemMap, collectionRef: ref, children });
  }, "CollectionProvider");
  CollectionProvider.displayName = PROVIDER_NAME;
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = useRef(null);
      const composedRefs = useComposedRefs(forwardedRef, ref);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      useEffect(() => {
        context.itemMap.set(ref, { ref, ...itemData });
        return () => void context.itemMap.delete(ref);
      });
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useCollection2(scope) {
    const context = useCollectionContext(name + "CollectionConsumer", scope);
    const getItems = useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];
      const orderedNodes = Array.from(collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`));
      const items = Array.from(context.itemMap.values());
      const orderedItems = items.sort(
        (a, b) => orderedNodes.indexOf(a.ref.current) - orderedNodes.indexOf(b.ref.current)
      );
      return orderedItems;
    }, [context.collectionRef, context.itemMap]);
    return getItems;
  }
  __name5(useCollection2, "useCollection");
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    useCollection2,
    createCollectionScope2
  ];
}
__name5(createCollection, "createCollection");
var __instanciated = /* @__PURE__ */ new WeakMap();
var OrderedDict = class _OrderedDict extends Map {
  static {
    __name5(this, "OrderedDict");
  }
  #keys;
  constructor(entries) {
    super(entries);
    this.#keys = [...super.keys()];
    __instanciated.set(this, true);
  }
  set(key, value) {
    if (__instanciated.get(this)) {
      if (this.has(key)) {
        this.#keys[this.#keys.indexOf(key)] = key;
      } else {
        this.#keys.push(key);
      }
    }
    super.set(key, value);
    return this;
  }
  insert(index, key, value) {
    const has = this.has(key);
    const length = this.#keys.length;
    const relativeIndex = toSafeInteger(index);
    let actualIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
    const safeIndex = actualIndex < 0 || actualIndex >= length ? -1 : actualIndex;
    if (safeIndex === this.size || has && safeIndex === this.size - 1 || safeIndex === -1) {
      this.set(key, value);
      return this;
    }
    const size = this.size + (has ? 0 : 1);
    if (relativeIndex < 0) {
      actualIndex++;
    }
    const keys = [...this.#keys];
    let nextValue;
    let shouldSkip = false;
    for (let i = actualIndex; i < size; i++) {
      if (actualIndex === i) {
        let nextKey = keys[i];
        if (keys[i] === key) {
          nextKey = keys[i + 1];
        }
        if (has) {
          this.delete(key);
        }
        nextValue = this.get(nextKey);
        this.set(key, value);
      } else {
        if (!shouldSkip && keys[i - 1] === key) {
          shouldSkip = true;
        }
        const currentKey = keys[shouldSkip ? i : i - 1];
        const currentValue = nextValue;
        nextValue = this.get(currentKey);
        this.delete(currentKey);
        this.set(currentKey, currentValue);
      }
    }
    return this;
  }
  with(index, key, value) {
    const copy = new _OrderedDict(this);
    copy.insert(index, key, value);
    return copy;
  }
  before(key) {
    const index = this.#keys.indexOf(key) - 1;
    if (index < 0) {
      return void 0;
    }
    return this.entryAt(index);
  }
  /**
   * Sets a new key-value pair at the position before the given key.
   */
  setBefore(key, newKey, value) {
    const index = this.#keys.indexOf(key);
    if (index === -1) {
      return this;
    }
    return this.insert(index, newKey, value);
  }
  after(key) {
    let index = this.#keys.indexOf(key);
    index = index === -1 || index === this.size - 1 ? -1 : index + 1;
    if (index === -1) {
      return void 0;
    }
    return this.entryAt(index);
  }
  /**
   * Sets a new key-value pair at the position after the given key.
   */
  setAfter(key, newKey, value) {
    const index = this.#keys.indexOf(key);
    if (index === -1) {
      return this;
    }
    return this.insert(index + 1, newKey, value);
  }
  first() {
    return this.entryAt(0);
  }
  last() {
    return this.entryAt(-1);
  }
  clear() {
    this.#keys = [];
    return super.clear();
  }
  delete(key) {
    const deleted = super.delete(key);
    if (deleted) {
      this.#keys.splice(this.#keys.indexOf(key), 1);
    }
    return deleted;
  }
  deleteAt(index) {
    const key = this.keyAt(index);
    if (key !== void 0) {
      return this.delete(key);
    }
    return false;
  }
  at(index) {
    const key = at(this.#keys, index);
    if (key !== void 0) {
      return this.get(key);
    }
  }
  entryAt(index) {
    const key = at(this.#keys, index);
    if (key !== void 0) {
      return [key, this.get(key)];
    }
  }
  indexOf(key) {
    return this.#keys.indexOf(key);
  }
  keyAt(index) {
    return at(this.#keys, index);
  }
  from(key, offset) {
    const index = this.indexOf(key);
    if (index === -1) {
      return void 0;
    }
    let dest = index + offset;
    if (dest < 0) dest = 0;
    if (dest >= this.size) dest = this.size - 1;
    return this.at(dest);
  }
  keyFrom(key, offset) {
    const index = this.indexOf(key);
    if (index === -1) {
      return void 0;
    }
    let dest = index + offset;
    if (dest < 0) dest = 0;
    if (dest >= this.size) dest = this.size - 1;
    return this.keyAt(dest);
  }
  find(predicate, thisArg) {
    let index = 0;
    for (const entry of this) {
      if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
        return entry;
      }
      index++;
    }
    return void 0;
  }
  findIndex(predicate, thisArg) {
    let index = 0;
    for (const entry of this) {
      if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
        return index;
      }
      index++;
    }
    return -1;
  }
  filter(predicate, thisArg) {
    const entries = [];
    let index = 0;
    for (const entry of this) {
      if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
        entries.push(entry);
      }
      index++;
    }
    return new _OrderedDict(entries);
  }
  map(callbackfn, thisArg) {
    const entries = [];
    let index = 0;
    for (const entry of this) {
      entries.push([entry[0], Reflect.apply(callbackfn, thisArg, [entry, index, this])]);
      index++;
    }
    return new _OrderedDict(entries);
  }
  reduce(...args) {
    const [callbackfn, initialValue] = args;
    let index = 0;
    let accumulator = initialValue ?? this.at(0);
    for (const entry of this) {
      if (index === 0 && args.length === 1) {
        accumulator = entry;
      } else {
        accumulator = Reflect.apply(callbackfn, this, [accumulator, entry, index, this]);
      }
      index++;
    }
    return accumulator;
  }
  reduceRight(...args) {
    const [callbackfn, initialValue] = args;
    let accumulator = initialValue ?? this.at(-1);
    for (let index = this.size - 1; index >= 0; index--) {
      const entry = this.at(index);
      if (index === this.size - 1 && args.length === 1) {
        accumulator = entry;
      } else {
        accumulator = Reflect.apply(callbackfn, this, [accumulator, entry, index, this]);
      }
    }
    return accumulator;
  }
  toSorted(compareFn) {
    const entries = [...this.entries()].sort(compareFn);
    return new _OrderedDict(entries);
  }
  toReversed() {
    const reversed = new _OrderedDict();
    for (let index = this.size - 1; index >= 0; index--) {
      const key = this.keyAt(index);
      const element = this.get(key);
      reversed.set(key, element);
    }
    return reversed;
  }
  toSpliced(...args) {
    const entries = [...this.entries()];
    entries.splice(...args);
    return new _OrderedDict(entries);
  }
  slice(start, end) {
    const result = new _OrderedDict();
    let stop = this.size - 1;
    if (start === void 0) {
      return result;
    }
    if (start < 0) {
      start = start + this.size;
    }
    if (end !== void 0 && end > 0) {
      stop = end - 1;
    }
    for (let index = start; index <= stop; index++) {
      const key = this.keyAt(index);
      const element = this.get(key);
      result.set(key, element);
    }
    return result;
  }
  every(predicate, thisArg) {
    let index = 0;
    for (const entry of this) {
      if (!Reflect.apply(predicate, thisArg, [entry, index, this])) {
        return false;
      }
      index++;
    }
    return true;
  }
  some(predicate, thisArg) {
    let index = 0;
    for (const entry of this) {
      if (Reflect.apply(predicate, thisArg, [entry, index, this])) {
        return true;
      }
      index++;
    }
    return false;
  }
};
function at(array, index) {
  if ("at" in Array.prototype) {
    return Array.prototype.at.call(array, index);
  }
  const actualIndex = toSafeIndex(array, index);
  return actualIndex === -1 ? void 0 : array[actualIndex];
}
__name5(at, "at");
function toSafeIndex(array, index) {
  const length = array.length;
  const relativeIndex = toSafeInteger(index);
  const actualIndex = relativeIndex >= 0 ? relativeIndex : length + relativeIndex;
  return actualIndex < 0 || actualIndex >= length ? -1 : actualIndex;
}
__name5(toSafeIndex, "toSafeIndex");
function toSafeInteger(number) {
  return number !== number || number === 0 ? 0 : Math.trunc(number);
}
__name5(toSafeInteger, "toSafeInteger");
// @__NO_SIDE_EFFECTS__
function createCollection2(name) {
  const PROVIDER_NAME = name + "CollectionProvider";
  const [createCollectionContext, createCollectionScope2] = createContextScope(PROVIDER_NAME);
  const [CollectionContextProvider, useCollectionContext] = createCollectionContext(
    PROVIDER_NAME,
    {
      collectionElement: null,
      collectionRef: { current: null },
      collectionRefObject: { current: null },
      itemMap: new OrderedDict(),
      setItemMap: /* @__PURE__ */ __name5(() => void 0, "setItemMap")
    }
  );
  const CollectionProvider = /* @__PURE__ */ __name5(({ state, ...props }) => {
    return state ? /* @__PURE__ */ jsx(CollectionProviderImpl, { ...props, state }) : /* @__PURE__ */ jsx(CollectionInit, { ...props });
  }, "CollectionProvider");
  CollectionProvider.displayName = PROVIDER_NAME;
  const CollectionInit = /* @__PURE__ */ __name5((props) => {
    const state = useInitCollection();
    return /* @__PURE__ */ jsx(CollectionProviderImpl, { ...props, state });
  }, "CollectionInit");
  CollectionInit.displayName = PROVIDER_NAME + "Init";
  const CollectionProviderImpl = /* @__PURE__ */ __name5((props) => {
    const { scope, children, state } = props;
    const ref = useRef(null);
    const [collectionElement, setCollectionElement] = useState(
      null
    );
    const composeRefs2 = useComposedRefs(ref, setCollectionElement);
    const [itemMap, setItemMap] = state;
    useEffect(() => {
      if (!collectionElement) return;
      const observer = getChildListObserver(() => {
      });
      observer.observe(collectionElement, {
        childList: true,
        subtree: true
      });
      return () => {
        observer.disconnect();
      };
    }, [collectionElement]);
    return /* @__PURE__ */ jsx(
      CollectionContextProvider,
      {
        scope,
        itemMap,
        setItemMap,
        collectionRef: composeRefs2,
        collectionRefObject: ref,
        collectionElement,
        children
      }
    );
  }, "CollectionProviderImpl");
  CollectionProviderImpl.displayName = PROVIDER_NAME + "Impl";
  const COLLECTION_SLOT_NAME = name + "CollectionSlot";
  const CollectionSlotImpl = createSlot(COLLECTION_SLOT_NAME);
  const CollectionSlot = forwardRef(
    (props, forwardedRef) => {
      const { scope, children } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME, scope);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);
      return /* @__PURE__ */ jsx(CollectionSlotImpl, { ref: composedRefs, children });
    }
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;
  const ITEM_SLOT_NAME = name + "CollectionItemSlot";
  const ITEM_DATA_ATTR = "data-radix-collection-item";
  const CollectionItemSlotImpl = createSlot(ITEM_SLOT_NAME);
  const CollectionItemSlot = forwardRef(
    (props, forwardedRef) => {
      const { scope, children, ...itemData } = props;
      const ref = useRef(null);
      const [element, setElement] = useState(null);
      const composedRefs = useComposedRefs(forwardedRef, ref, setElement);
      const context = useCollectionContext(ITEM_SLOT_NAME, scope);
      const { setItemMap } = context;
      const itemDataRef = useRef(itemData);
      if (!shallowEqual(itemDataRef.current, itemData)) {
        itemDataRef.current = itemData;
      }
      const memoizedItemData = itemDataRef.current;
      useEffect(() => {
        const itemData2 = memoizedItemData;
        setItemMap((map) => {
          if (!element) {
            return map;
          }
          if (!map.has(element)) {
            map.set(element, { ...itemData2, element });
            return map.toSorted(sortByDocumentPosition);
          }
          return map.set(element, { ...itemData2, element }).toSorted(sortByDocumentPosition);
        });
        return () => {
          setItemMap((map) => {
            if (!element || !map.has(element)) {
              return map;
            }
            map.delete(element);
            return new OrderedDict(map);
          });
        };
      }, [element, memoizedItemData, setItemMap]);
      return /* @__PURE__ */ jsx(CollectionItemSlotImpl, { ...{ [ITEM_DATA_ATTR]: "" }, ref: composedRefs, children });
    }
  );
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;
  function useInitCollection() {
    return useState(new OrderedDict());
  }
  __name5(useInitCollection, "useInitCollection");
  function useCollection2(scope) {
    const { itemMap } = useCollectionContext(name + "CollectionConsumer", scope);
    return itemMap;
  }
  __name5(useCollection2, "useCollection");
  const functions = {
    createCollectionScope: createCollectionScope2,
    useCollection: useCollection2,
    useInitCollection
  };
  return [
    { Provider: CollectionProvider, Slot: CollectionSlot, ItemSlot: CollectionItemSlot },
    functions
  ];
}
__name5(createCollection2, "createCollection");
function shallowEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object") return false;
  if (a == null || b == null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
}
__name5(shallowEqual, "shallowEqual");
function isElementPreceding(a, b) {
  return !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING);
}
__name5(isElementPreceding, "isElementPreceding");
function sortByDocumentPosition(a, b) {
  return !a[1].element || !b[1].element ? 0 : isElementPreceding(a[1].element, b[1].element) ? -1 : 1;
}
__name5(sortByDocumentPosition, "sortByDocumentPosition");
function getChildListObserver(callback) {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        callback();
        return;
      }
    }
  });
  return observer;
}
__name5(getChildListObserver, "getChildListObserver");

// node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var useLayoutEffect2 = globalThis?.document ? useLayoutEffect : () => {
};

// node_modules/@radix-ui/react-id/dist/index.mjs
var __defProp7 = Object.defineProperty;
var __name6 = (target, value) => __defProp7(target, "name", { value, configurable: true });
var useReactId = virtual_react_exports[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId2(deterministicId) {
  const [id, setId] = useState(useReactId());
  useLayoutEffect2(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `radix-${id}` : "");
}
__name6(useId2, "useId");

// node_modules/@radix-ui/react-primitive/dist/index.mjs
var __defProp8 = Object.defineProperty;
var __name7 = (target, value) => __defProp8(target, "name", { value, configurable: true });
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
__name7(dispatchDiscreteCustomEvent, "dispatchDiscreteCustomEvent");

// node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var __defProp9 = Object.defineProperty;
var __name8 = (target, value) => __defProp9(target, "name", { value, configurable: true });
function useCallbackRef(callback) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });
  return useMemo(() => ((...args) => callbackRef.current?.(...args)), []);
}
__name8(useCallbackRef, "useCallbackRef");

// node_modules/@radix-ui/primitive/dist/internal/is-development.false.mjs
var IS_DEVELOPMENT = false;

// node_modules/@radix-ui/react-use-effect-event/dist/index.mjs
var __defProp10 = Object.defineProperty;
var __name9 = (target, value) => __defProp10(target, "name", { value, configurable: true });
var useReactEffectEvent = virtual_react_exports[" useEffectEvent ".trim().toString()];
var useReactInsertionEffect = virtual_react_exports[" useInsertionEffect ".trim().toString()];
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
__name9(useEffectEvent, "useEffectEvent");

// node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
var __defProp11 = Object.defineProperty;
var __name10 = (target, value) => __defProp11(target, "name", { value, configurable: true });
var useInsertionEffect2 = virtual_react_exports[" useInsertionEffect ".trim().toString()] || useLayoutEffect2;
function useControllableState({
  prop,
  defaultProp,
  onChange = /* @__PURE__ */ __name10(() => {
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
        const to2 = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to2}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
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
__name10(useControllableState, "useControllableState");
function useUncontrolledState({
  defaultProp,
  onChange
}) {
  const [value, setValue] = useState(defaultProp);
  const prevValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useInsertionEffect2(() => {
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
__name10(useUncontrolledState, "useUncontrolledState");
function isFunction(value) {
  return typeof value === "function";
}
__name10(isFunction, "isFunction");
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
        const to2 = isControlled ? "controlled" : "uncontrolled";
        console.warn(
          `${caller} is changing from ${from} to ${to2}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
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
__name10(useControllableStateReducer, "useControllableStateReducer");

// node_modules/@radix-ui/react-direction/dist/index.mjs
var __defProp12 = Object.defineProperty;
var __name11 = (target, value) => __defProp12(target, "name", { value, configurable: true });
var DirectionContext = createContext(void 0);
function useDirection(localDir) {
  const globalDir = useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}
__name11(useDirection, "useDirection");

// node_modules/@radix-ui/react-use-is-hydrated/dist/index.mjs
var __defProp13 = Object.defineProperty;
var __name12 = (target, value) => __defProp13(target, "name", { value, configurable: true });
var _isHydrated = false;
function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(_isHydrated);
  useEffect(() => {
    if (!_isHydrated) {
      _isHydrated = true;
      setIsHydrated(true);
    }
  }, []);
  return isHydrated;
}
__name12(useIsHydrated, "useIsHydrated");
var useReactSyncExternalStore = virtual_react_exports[" useSyncExternalStore ".trim().toString()];
function subscribe() {
  return () => {
  };
}
__name12(subscribe, "subscribe");
function useIsHydratedModern() {
  return useReactSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
__name12(useIsHydratedModern, "useIsHydratedModern");
var useIsHydrated2 = typeof useReactSyncExternalStore === "function" ? useIsHydratedModern : useIsHydrated;

// node_modules/@radix-ui/react-roving-focus/dist/index.mjs
var __defProp14 = Object.defineProperty;
var __name13 = (target, value) => __defProp14(target, "name", { value, configurable: true });
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name13(function RovingFocusGroup2(props, forwardedRef) {
    return /* @__PURE__ */ jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }, "RovingFocusGroup")
);
var RovingFocusGroupImpl = /* @__PURE__ */ forwardRef(/* @__PURE__ */ __name13(function RovingFocusGroupImpl2(props, forwardedRef) {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
}, "RovingFocusGroupImpl"));
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name13(function RovingFocusGroupItem2(props, forwardedRef) {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId2();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    const isHydrated = useIsHydrated2();
    useLayoutEffect2(() => {
      if (!isHydrated || !focusable) {
        return;
      }
      onFocusableItemAdd();
      return () => onFocusableItemRemove();
    }, [isHydrated, focusable, onFocusableItemAdd, onFocusableItemRemove]);
    useEffect(() => {
      if (isHydrated || !focusable) {
        return;
      }
      onFocusableItemAdd();
      return () => onFocusableItemRemove();
    }, [isHydrated, focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }, "RovingFocusGroupItem")
);
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
__name13(getDirectionAwareKey, "getDirectionAwareKey");
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
__name13(getFocusIntent, "getFocusIntent");
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
__name13(focusFirst, "focusFirst");
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
__name13(wrapArray, "wrapArray");
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;

// node_modules/@radix-ui/react-presence/dist/index.mjs
var __defProp15 = Object.defineProperty;
var __name14 = (target, value) => __defProp15(target, "name", { value, configurable: true });
function useStateMachine(initialState, machine) {
  return useReducer((state, event) => {
    const nextState = machine[state][event];
    return nextState ?? state;
  }, initialState);
}
__name14(useStateMachine, "useStateMachine");
var Presence = /* @__PURE__ */ __name14((props) => {
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
      const handleAnimationEnd = /* @__PURE__ */ __name14((event) => {
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
      const handleAnimationStart = /* @__PURE__ */ __name14((event) => {
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
__name14(usePresence, "usePresence");
function setRef2(ref, value) {
  if (typeof ref === "function") {
    return ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
__name14(setRef2, "setRef");
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
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef2(currentRefs[i], null);
          }
        }
      };
    }
  }, []);
}
__name14(useStableComposedRefs, "useStableComposedRefs");
function getAnimationName(styles) {
  return styles?.animationName || "none";
}
__name14(getAnimationName, "getAnimationName");
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
__name14(getElementRef2, "getElementRef");

// node_modules/@radix-ui/react-tabs/dist/index.mjs
var __defProp16 = Object.defineProperty;
var __name15 = (target, value) => __defProp16(target, "name", { value, configurable: true });
var TABS_NAME = "Tabs";
var [createTabsContext, createTabsScope] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function Tabs2(props, forwardedRef) {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId2(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }, "Tabs")
);
var TAB_LIST_NAME = "TabsList";
var TabsList = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name15(function TabsList2(props, forwardedRef) {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }, "TabsList")
);
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function TabsTrigger2(props, forwardedRef) {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (disabled || event.target !== event.currentTarget) {
                return;
              }
              if ([" ", "Enter"].includes(event.key)) {
                context.onValueChange(value);
              }
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }, "TabsTrigger")
);
var CONTENT_NAME = "TabsContent";
var TabsContent = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name15(function TabsContent2(props, forwardedRef) {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = useRef(isSelected);
    useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }, "TabsContent")
);
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
__name15(makeTriggerId, "makeTriggerId");
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
__name15(makeContentId, "makeContentId");
var Root2 = Tabs;
var List = TabsList;
var Trigger = TabsTrigger;
var Content = TabsContent;

// apps/web/src/components/ui/tabs.jsx
var Tabs3 = Root2;
var TabsList3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  List,
  {
    ref,
    className: cn2(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList3.displayName = List.displayName;
var TabsTrigger3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  Trigger,
  {
    ref,
    className: cn2(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger3.displayName = Trigger.displayName;
var TabsContent3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  Content,
  {
    ref,
    className: cn2(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent3.displayName = Content.displayName;

// apps/web/src/components/ui/input.jsx
var Input = forwardRef(({ className, type, ...props }, ref) => {
  return /* @__PURE__ */ createElement(
    "input",
    {
      type,
      className: cn2(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Input.displayName = "Input";

// node_modules/@radix-ui/react-label/dist/index.mjs
var __defProp17 = Object.defineProperty;
var __name16 = (target, value) => __defProp17(target, "name", { value, configurable: true });
var Label = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name16(function Label2(props, forwardedRef) {
    return /* @__PURE__ */ jsx(
      Primitive.label,
      {
        ...props,
        ref: forwardedRef,
        onMouseDown: (event) => {
          const target = event.target;
          if (target.closest("button, input, select, textarea")) return;
          props.onMouseDown?.(event);
          if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
        }
      }
    );
  }, "Label")
);
var Root3 = Label;

// apps/web/src/components/ui/label.jsx
var labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
var Label3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(Root3, { ref, className: cn2(labelVariants(), className), ...props }));
Label3.displayName = Root3.displayName;

// apps/web/src/components/ui/textarea.jsx
var Textarea = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ createElement(
    "textarea",
    {
      className: cn2(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";

// node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var __defProp18 = Object.defineProperty;
var __name17 = (target, value) => __defProp18(target, "name", { value, configurable: true });
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
  /* @__PURE__ */ __name17(function DismissableLayer2(props, forwardedRef) {
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
      const handleUpdate = /* @__PURE__ */ __name17(() => force({}), "handleUpdate");
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
__name17(useDismissableLayerSurface, "useDismissableLayerSurface");
var IS_TRUE = /* @__PURE__ */ __name17(() => true, "IS_TRUE");
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
    __name17(resetOutsideInteraction, "resetOutsideInteraction");
    function isOutsideInteractionIntercepted() {
      return Array.from(interceptedOutsideInteractionEventsRef.current.values()).some(Boolean);
    }
    __name17(isOutsideInteractionIntercepted, "isOutsideInteractionIntercepted");
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
    __name17(handleInteractionCapture, "handleInteractionCapture");
    function handleInteractionBubble(event) {
      if (isPointerDownOutsideRef.current) {
        interceptedOutsideInteractionEventsRef.current.set(event.type, false);
      }
    }
    __name17(handleInteractionBubble, "handleInteractionBubble");
    const handlePointerDown = /* @__PURE__ */ __name17((event) => {
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
        __name17(handleAndDispatchPointerDownOutsideEvent2, "handleAndDispatchPointerDownOutsideEvent");
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
    onPointerDownCapture: /* @__PURE__ */ __name17(() => isPointerInsideReactTreeRef.current = true, "onPointerDownCapture")
  };
}
__name17(usePointerDownOutside, "usePointerDownOutside");
function useFocusOutside(onFocusOutside, ownerDocument = globalThis?.document) {
  const handleFocusOutside = useCallbackRef(onFocusOutside);
  const isFocusInsideReactTreeRef = useRef(false);
  useEffect(() => {
    const handleFocus = /* @__PURE__ */ __name17((event) => {
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
    onFocusCapture: /* @__PURE__ */ __name17(() => isFocusInsideReactTreeRef.current = true, "onFocusCapture"),
    onBlurCapture: /* @__PURE__ */ __name17(() => isFocusInsideReactTreeRef.current = false, "onBlurCapture")
  };
}
__name17(useFocusOutside, "useFocusOutside");
function dispatchUpdate() {
  const event = new CustomEvent(CONTEXT_UPDATE);
  document.dispatchEvent(event);
}
__name17(dispatchUpdate, "dispatchUpdate");
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
__name17(handleAndDispatchCustomEvent, "handleAndDispatchCustomEvent");

// node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var __defProp19 = Object.defineProperty;
var __name18 = (target, value) => __defProp19(target, "name", { value, configurable: true });
var AUTOFOCUS_ON_MOUNT = "focusScope.autoFocusOnMount";
var AUTOFOCUS_ON_UNMOUNT = "focusScope.autoFocusOnUnmount";
var EVENT_OPTIONS2 = { bubbles: false, cancelable: true };
var FocusScope = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name18(function FocusScope2(props, forwardedRef) {
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
        __name18(handleFocusIn2, "handleFocusIn");
        __name18(handleFocusOut2, "handleFocusOut");
        __name18(handleMutations2, "handleMutations");
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
          const mountEvent = new CustomEvent(AUTOFOCUS_ON_MOUNT, EVENT_OPTIONS2);
          container.addEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          container.dispatchEvent(mountEvent);
          if (!mountEvent.defaultPrevented) {
            focusFirst2(removeLinks(getTabbableCandidates(container)), { select: true });
            if (document.activeElement === previouslyFocusedElement) {
              focus(container);
            }
          }
        }
        return () => {
          container.removeEventListener(AUTOFOCUS_ON_MOUNT, onMountAutoFocus);
          setTimeout(() => {
            const unmountEvent = new CustomEvent(AUTOFOCUS_ON_UNMOUNT, EVENT_OPTIONS2);
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
function focusFirst2(candidates, { select = false } = {}) {
  const previouslyFocusedElement = document.activeElement;
  for (const candidate of candidates) {
    focus(candidate, { select });
    if (document.activeElement !== previouslyFocusedElement) return;
  }
}
__name18(focusFirst2, "focusFirst");
function getTabbableEdges(container) {
  const candidates = getTabbableCandidates(container);
  const first = findVisible(candidates, container);
  const last = findVisible(candidates.reverse(), container);
  return [first, last];
}
__name18(getTabbableEdges, "getTabbableEdges");
function getTabbableCandidates(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: /* @__PURE__ */ __name18((node) => {
      const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
      if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }, "acceptNode")
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
__name18(getTabbableCandidates, "getTabbableCandidates");
function findVisible(elements, container) {
  const canUseCheckVisibility = typeof container.checkVisibility === "function" && container.checkVisibility({ checkVisibilityCSS: true });
  for (const element of elements) {
    const hidden = canUseCheckVisibility ? !element.checkVisibility({ checkVisibilityCSS: true }) : isHidden(element, { upTo: container });
    if (!hidden) {
      return element;
    }
  }
}
__name18(findVisible, "findVisible");
function isHidden(node, { upTo }) {
  if (getComputedStyle(node).visibility === "hidden") return true;
  while (node) {
    if (upTo !== void 0 && node === upTo) return false;
    if (getComputedStyle(node).display === "none") return true;
    node = node.parentElement;
  }
  return false;
}
__name18(isHidden, "isHidden");
function isSelectableInput(element) {
  return element instanceof HTMLInputElement && "select" in element;
}
__name18(isSelectableInput, "isSelectableInput");
function focus(element, { select = false } = {}) {
  if (element && element.focus) {
    const previouslyFocusedElement = document.activeElement;
    element.focus({ preventScroll: true });
    if (element !== previouslyFocusedElement && isSelectableInput(element) && select)
      element.select();
  }
}
__name18(focus, "focus");
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
__name18(createFocusScopesStack, "createFocusScopesStack");
function arrayRemove(array, item) {
  const updatedArray = [...array];
  const index = updatedArray.indexOf(item);
  if (index !== -1) {
    updatedArray.splice(index, 1);
  }
  return updatedArray;
}
__name18(arrayRemove, "arrayRemove");
function removeLinks(items) {
  return items.filter((item) => item.tagName !== "A");
}
__name18(removeLinks, "removeLinks");

// node_modules/@radix-ui/react-portal/dist/index.mjs
var __defProp20 = Object.defineProperty;
var __name19 = (target, value) => __defProp20(target, "name", { value, configurable: true });
var Portal = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name19(function Portal2(props, forwardedRef) {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = useState(false);
    useLayoutEffect2(() => setMounted(true), []);
    const container = containerProp || mounted && globalThis?.document?.body;
    return container ? (void 0)(/* @__PURE__ */ jsx(Primitive.div, { ...portalProps, ref: forwardedRef }), container) : null;
  }, "Portal")
);

// node_modules/@radix-ui/react-focus-guards/dist/index.mjs
var __defProp21 = Object.defineProperty;
var __name20 = (target, value) => __defProp21(target, "name", { value, configurable: true });
var count2 = 0;
var guards = null;
function FocusGuards(props) {
  useFocusGuards();
  return props.children;
}
__name20(FocusGuards, "FocusGuards");
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
__name20(useFocusGuards, "useFocusGuards");
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
__name20(createFocusGuard, "createFocusGuard");

// node_modules/tslib/tslib.es6.mjs
var __assign = function() {
  __assign = Object.assign || function __assign2(t7) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p2 in s) if (Object.prototype.hasOwnProperty.call(s, p2)) t7[p2] = s[p2];
    }
    return t7;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t7 = {};
  for (var p2 in s) if (Object.prototype.hasOwnProperty.call(s, p2) && e.indexOf(p2) < 0)
    t7[p2] = s[p2];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p2 = Object.getOwnPropertySymbols(s); i < p2.length; i++) {
      if (e.indexOf(p2[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p2[i]))
        t7[p2[i]] = s[p2[i]];
    }
  return t7;
}
function __spreadArray(to2, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to2.concat(ar || Array.prototype.slice.call(from));
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
    assignSyncMedium: function(cb2) {
      assigned = true;
      while (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb2);
      }
      buffer = {
        push: function(x) {
          return cb2(x);
        },
        filter: function() {
          return buffer;
        }
      };
    },
    assignMedium: function(cb2) {
      assigned = true;
      var pendingQueue = [];
      if (buffer.length) {
        var cbs = buffer;
        buffer = [];
        cbs.forEach(cb2);
        pendingQueue = buffer;
      }
      var executeQueue = function() {
        var cbs2 = pendingQueue;
        pendingQueue = [];
        cbs2.forEach(cb2);
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
var SideCar = function(_a2) {
  var sideCar = _a2.sideCar, rest = __rest(_a2, ["sideCar"]);
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
  var _a2 = useState({
    onScrollCapture: nothing,
    onWheelCapture: nothing,
    onTouchMoveCapture: nothing
  }), callbacks = _a2[0], setCallbacks = _a2[1];
  var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar = props.sideCar, noRelative = props.noRelative, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b2 = props.as, Container = _b2 === void 0 ? "div" : _b2, gapMode = props.gapMode, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noRelative", "noIsolation", "inert", "allowPinchZoom", "as", "gapMode"]);
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
  var Sheet = function(_a2) {
    var styles = _a2.styles, dynamic = _a2.dynamic;
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
  var cs2 = window.getComputedStyle(document.body);
  var left = cs2[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
  var top = cs2[gapMode === "padding" ? "paddingTop" : "marginTop"];
  var right = cs2[gapMode === "padding" ? "paddingRight" : "marginRight"];
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
var getStyles = function(_a2, allowRelative, gapMode, important) {
  var left = _a2.left, top = _a2.top, right = _a2.right, gap = _a2.gap;
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
var RemoveScrollBar = function(_a2) {
  var noRelative = _a2.noRelative, noImportant = _a2.noImportant, _b2 = _a2.gapMode, gapMode = _b2 === void 0 ? "margin" : _b2;
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
      var _a2 = getScrollVariables(axis, current), scrollHeight = _a2[1], clientHeight = _a2[2];
      if (scrollHeight > clientHeight) {
        return true;
      }
    }
    current = current.parentNode;
  } while (current && current !== ownerDocument.body);
  return false;
};
var getVScrollVariables = function(_a2) {
  var scrollTop = _a2.scrollTop, scrollHeight = _a2.scrollHeight, clientHeight = _a2.clientHeight;
  return [
    scrollTop,
    scrollHeight,
    clientHeight
  ];
};
var getHScrollVariables = function(_a2) {
  var scrollLeft = _a2.scrollLeft, scrollWidth = _a2.scrollWidth, clientWidth = _a2.clientWidth;
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
    var _a2 = getScrollVariables(axis, target), position = _a2[0], scroll_1 = _a2[1], capacity = _a2[2];
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
      allow_1.forEach(function(el2) {
        return el2.classList.add("allow-interactivity-".concat(id));
      });
      return function() {
        document.body.classList.remove("block-interactivity-".concat(id));
        allow_1.forEach(function(el2) {
          return el2.classList.remove("allow-interactivity-".concat(id));
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
    var sourceEvent = shouldPreventQueue.current.filter(function(e) {
      return e.name === event.type && (e.target === event.target || event.target === e.shadowParent) && deltaCompare(e.delta, delta);
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
      shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e) {
        return e !== event;
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
  var keep = function(el2) {
    if (!el2 || elementsToKeep.has(el2)) {
      return;
    }
    elementsToKeep.add(el2);
    keep(el2.parentNode);
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
        } catch (e) {
          console.error("aria-hidden: cannot operate on ", node, e);
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
var __defProp22 = Object.defineProperty;
var __name21 = (target, value) => __defProp22(target, "name", { value, configurable: true });
var DIALOG_NAME = "Dialog";
var [createDialogContext, createDialogScope] = createContextScope(DIALOG_NAME);
var [DialogProvider, useDialogContext] = createDialogContext(DIALOG_NAME);
var Dialog = /* @__PURE__ */ __name21((props) => {
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
var DialogPortal = /* @__PURE__ */ __name21((props) => {
  const { __scopeDialog, forceMount, children, container } = props;
  const context = useDialogContext(PORTAL_NAME, __scopeDialog);
  return /* @__PURE__ */ jsx(PortalProvider, { scope: __scopeDialog, forceMount, children: Children.map(children, (child) => /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(Portal, { asChild: true, container, children: child }) })) });
}, "DialogPortal");
var OVERLAY_NAME = "DialogOverlay";
var DialogOverlay = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name21(function DialogOverlay2(props, forwardedRef) {
    const portalContext = usePortalContext(OVERLAY_NAME, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...overlayProps } = props;
    const context = useDialogContext(OVERLAY_NAME, props.__scopeDialog);
    return context.modal ? /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsx(DialogOverlayImpl, { ...overlayProps, ref: forwardedRef }) }) : null;
  }, "DialogOverlay")
);
var Slot2 = createSlot("DialogOverlay.RemoveScroll");
var DialogOverlayImpl = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name21(function DialogOverlayImpl2(props, forwardedRef) {
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
var CONTENT_NAME2 = "DialogContent";
var DialogContent = /* @__PURE__ */ forwardRef(
  /* @__PURE__ */ __name21(function DialogContent2(props, forwardedRef) {
    const portalContext = usePortalContext(CONTENT_NAME2, props.__scopeDialog);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME2, props.__scopeDialog);
    return /* @__PURE__ */ jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsx(DialogContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsx(DialogContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }, "DialogContent")
);
var DialogContentModal = /* @__PURE__ */ forwardRef(
  // blank line to reduce diff noise
  /* @__PURE__ */ __name21(function DialogContentModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME2, props.__scopeDialog);
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
  /* @__PURE__ */ __name21(function DialogContentNonModal2(props, forwardedRef) {
    const context = useDialogContext(CONTENT_NAME2, props.__scopeDialog);
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
  /* @__PURE__ */ __name21(function DialogContentImpl2(props, forwardedRef) {
    const { __scopeDialog, trapFocus, onOpenAutoFocus, onCloseAutoFocus, ...contentProps } = props;
    const context = useDialogContext(CONTENT_NAME2, __scopeDialog);
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
  /* @__PURE__ */ __name21(function DialogTitle2(props, forwardedRef) {
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
  /* @__PURE__ */ __name21(function DialogDescription2(props, forwardedRef) {
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
  /* @__PURE__ */ __name21(function DialogClose2(props, forwardedRef) {
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
__name21(getState, "getState");

// apps/web/src/components/ui/dialog.jsx
var Dialog2 = Dialog;
var DialogPortal2 = DialogPortal;
var DialogOverlay3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogOverlay,
  {
    ref,
    className: cn2(
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
      className: cn2(
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
    className: cn2("flex flex-col space-y-1.5 text-center sm:text-left", className),
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
    className: cn2("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogTitle,
  {
    ref,
    className: cn2("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle3.displayName = DialogTitle.displayName;
var DialogDescription3 = forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ createElement(
  DialogDescription,
  {
    ref,
    className: cn2("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription3.displayName = DialogDescription.displayName;

// node_modules/sonner/dist/index.mjs
function __insertCSS(code) {
  if (!code || typeof document == "undefined") return;
  let head = document.head || document.getElementsByTagName("head")[0];
  let style = document.createElement("style");
  style.type = "text/css";
  head.appendChild(style);
  style.styleSheet ? style.styleSheet.cssText = code : style.appendChild(document.createTextNode(code));
}
var bars = Array(12).fill(0);
var toastsCounter = 1;
var MAX_HISTORY_SIZE = 100;
var getToastId = (data) => {
  var _data_id;
  return typeof (data == null ? void 0 : data.id) === "number" || (data == null ? void 0 : (_data_id = data.id) == null ? void 0 : _data_id.length) > 0 ? data.id : toastsCounter++;
};
var Observer = class {
  constructor() {
    this.subscribe = (subscriber) => {
      this.subscribers.push(subscriber);
      this.getActiveToasts().forEach((toast2) => subscriber(toast2));
      return () => {
        const index = this.subscribers.indexOf(subscriber);
        this.subscribers.splice(index, 1);
      };
    };
    this.publish = (data) => {
      this.subscribers.forEach((subscriber) => subscriber(data));
    };
    this.addToast = (data) => {
      this.publish(data);
      this.toasts = [
        ...this.toasts,
        data
      ];
      this.trimHistory();
    };
    this.trimHistory = () => {
      let toRemove = this.toasts.length - MAX_HISTORY_SIZE;
      if (toRemove <= 0) return;
      this.toasts = this.toasts.filter((toast2) => {
        if (toRemove > 0 && this.dismissedToasts.has(toast2.id)) {
          this.dismissedToasts.delete(toast2.id);
          toRemove--;
          return false;
        }
        return true;
      });
    };
    this.create = (data) => {
      const { message, ...rest } = data;
      const id = getToastId(data);
      const pendingDismissal = this.pendingDismissals.get(id);
      if (pendingDismissal !== void 0) {
        cancelAnimationFrame(pendingDismissal);
        this.pendingDismissals.delete(id);
        this.dismissedToasts.delete(id);
      }
      const wasDismissed = this.dismissedToasts.has(id);
      const dismissible = data.dismissible === void 0 ? true : data.dismissible;
      if (wasDismissed) {
        this.dismissedToasts.delete(id);
        this.toasts = this.toasts.filter((toast2) => toast2.id !== id);
      }
      const alreadyExists = wasDismissed ? void 0 : this.toasts.find((toast2) => {
        return toast2.id === id;
      });
      if (alreadyExists) {
        this.toasts = this.toasts.map((toast2) => {
          if (toast2.id === id) {
            this.publish({
              ...toast2,
              ...data,
              id,
              title: message
            });
            return {
              ...toast2,
              ...data,
              id,
              dismissible,
              title: message
            };
          }
          return toast2;
        });
      } else {
        this.addToast({
          title: message,
          ...rest,
          dismissible,
          id
        });
      }
      return id;
    };
    this.dismiss = (id) => {
      if (id === void 0 || id === null) {
        this.getActiveToasts().forEach((toast2) => {
          this.dismissedToasts.add(toast2.id);
          this.subscribers.forEach((subscriber) => subscriber({
            id: toast2.id,
            dismiss: true
          }));
        });
        return id;
      }
      this.dismissedToasts.add(id);
      const alreadyPending = this.pendingDismissals.get(id);
      if (alreadyPending !== void 0) {
        cancelAnimationFrame(alreadyPending);
      }
      this.pendingDismissals.set(id, requestAnimationFrame(() => {
        this.pendingDismissals.delete(id);
        this.subscribers.forEach((subscriber) => subscriber({
          id,
          dismiss: true
        }));
      }));
      return id;
    };
    this.message = (message, data) => {
      return this.create({
        ...data,
        message,
        type: void 0
      });
    };
    this.error = (message, data) => {
      return this.create({
        ...data,
        message,
        type: "error"
      });
    };
    this.success = (message, data) => {
      return this.create({
        ...data,
        type: "success",
        message
      });
    };
    this.info = (message, data) => {
      return this.create({
        ...data,
        type: "info",
        message
      });
    };
    this.warning = (message, data) => {
      return this.create({
        ...data,
        type: "warning",
        message
      });
    };
    this.loading = (message, data) => {
      return this.create({
        ...data,
        type: "loading",
        message
      });
    };
    this.promise = (promise, data) => {
      if (!data) {
        return;
      }
      let id = void 0;
      if (data.loading !== void 0) {
        id = this.create({
          ...data,
          promise,
          type: "loading",
          message: data.loading,
          description: typeof data.description !== "function" ? data.description : void 0
        });
      }
      const p2 = Promise.resolve(promise instanceof Function ? promise() : promise);
      let shouldDismiss = id !== void 0;
      let result;
      const originalPromise = p2.then(async (response) => {
        result = [
          "resolve",
          response
        ];
        const isReactElementResponse = virtual_react_default.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({
            id,
            type: "default",
            message: response
          });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(`HTTP error! status: ${response.status}`) : data.error;
          const description = typeof data.description === "function" ? await data.description(`HTTP error! status: ${response.status}`) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !virtual_react_default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (response instanceof Error) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(response) : data.error;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !virtual_react_default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        } else if (data.success !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.success === "function" ? await data.success(response) : data.success;
          const description = typeof data.description === "function" ? await data.description(response) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !virtual_react_default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "success",
            description,
            ...toastSettings
          });
        }
      }).catch(async (error) => {
        result = [
          "reject",
          error
        ];
        if (data.error !== void 0) {
          shouldDismiss = false;
          const promiseData = typeof data.error === "function" ? await data.error(error) : data.error;
          const description = typeof data.description === "function" ? await data.description(error) : data.description;
          const isExtendedResult = typeof promiseData === "object" && !virtual_react_default.isValidElement(promiseData);
          const toastSettings = isExtendedResult ? promiseData : {
            message: promiseData
          };
          this.create({
            id,
            type: "error",
            description,
            ...toastSettings
          });
        }
      }).finally(() => {
        if (shouldDismiss) {
          this.dismiss(id);
          id = void 0;
        }
        data.finally == null ? void 0 : data.finally.call(data);
      });
      const unwrap = () => new Promise((resolve, reject) => originalPromise.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
      if (typeof id !== "string" && typeof id !== "number") {
        return {
          unwrap
        };
      } else {
        return Object.assign(id, {
          unwrap
        });
      }
    };
    this.custom = (jsx2, data) => {
      const id = getToastId(data);
      this.create({
        ...data,
        jsx: jsx2(id),
        id,
        type: void 0
      });
      return id;
    };
    this.getActiveToasts = () => {
      return this.toasts.filter((toast2) => !this.dismissedToasts.has(toast2.id));
    };
    this.subscribers = [];
    this.toasts = [];
    this.dismissedToasts = /* @__PURE__ */ new Set();
    this.pendingDismissals = /* @__PURE__ */ new Map();
  }
};
var ToastState = new Observer();
var toastFunction = (message, data) => {
  return ToastState.message(message, data);
};
var isHttpResponse = (data) => {
  return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
var basicToast = toastFunction;
var getHistory = () => ToastState.toasts;
var getToasts = () => ToastState.getActiveToasts();
var toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading
}, {
  getHistory,
  getToasts
});
__insertCSS("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--normal-text);background:var(--normal-bg);border:1px solid var(--normal-border);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{-webkit-user-select:none;user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");

// temp_OwnerInboxPage-CoE82K9d.js.jsx
var Helmet = ({ children }) => null;
function OwnerInboxPage() {
  const navigate = (url) => {
    window.history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
  const [feed, setFeed] = useState({
    approvals: [],
    exceptions: [],
    decisions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectDialogItem, setRejectDialogItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingActionId, setProcessingActionId] = useState(null);
  const fetchFeed = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch("/api/owner-inbox/feed");
      const data = await res.json();
      if (data.success) {
        setFeed({
          approvals: data.approvals || [],
          exceptions: data.exceptions || [],
          decisions: data.decisions || []
        });
      } else {
        throw new Error(data.error || "Failed to fetch Owner Inbox feed");
      }
    } catch (err) {
      console.error("Owner inbox fetch error:", err);
      if (!isSilent) toast.error("Failed to load owner inbox items.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchFeed();
    const interval = setInterval(() => {
      fetchFeed(true);
    }, 3e4);
    return () => clearInterval(interval);
  }, [fetchFeed]);
  const handleExecuteAction = async (item, actionType, notes = "") => {
    setProcessingActionId(item.id);
    try {
      const payload = {
        action: actionType,
        // 'APPROVE_WORKFLOW', 'REJECT_WORKFLOW', 'RESOLVE_EXCEPTION'
        itemId: item.id,
        itemType: item.type,
        // 'workflow', 'trip_delay', 'breakdown', 'quote'
        notes
      };
      const res = await fetch("/api/owner-inbox/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server failed to execute inbox action");
      }
      toast.success(data.message || `Action ${actionType} recorded successfully!`);
      if (rejectDialogItem) {
        setRejectDialogItem(null);
        setRejectReason("");
      }
      fetchFeed(true);
    } catch (err) {
      console.error("Action error:", err);
      toast.error(err.message || "Failed to process inbox action.");
    } finally {
      setProcessingActionId(null);
    }
  };
  const handleOpenWhatsApp = (phone, text) => {
    if (!phone) {
      toast.error("No contact phone registered for this item.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const target = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;
    const url = `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };
  const totalApprovalsCount = feed.approvals.length;
  const totalApprovalsValue = feed.approvals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalExceptionsCount = feed.exceptions.length;
  const totalDecisionsCount = feed.decisions.length;
  const totalInboxItems = totalApprovalsCount + totalExceptionsCount + totalDecisionsCount;
  const allItems = [
    ...feed.approvals.map((a) => ({ ...a, categoryGroup: "approval" })),
    ...feed.exceptions.map((e) => ({ ...e, categoryGroup: "exception" })),
    ...feed.decisions.map((d) => ({ ...d, categoryGroup: "decision" }))
  ];
  const filteredItems = allItems.filter((item) => {
    if (activeTab === "approvals" && item.categoryGroup !== "approval") return false;
    if (activeTab === "exceptions" && item.categoryGroup !== "exception") return false;
    if (activeTab === "decisions" && item.categoryGroup !== "decision") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (item.title || item.rule_name || item.route || item.customer_name || "").toLowerCase();
      const desc = (item.description || item.reason || item.notes || "").toLowerCase();
      const truck = (item.truck_number || "").toLowerCase();
      const driver = (item.driver_name || item.requester_name || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || truck.includes(q) || driver.includes(q);
    }
    return true;
  });
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300", children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("title", { children: "Owner Inbox & Executive Command Center | Jai Bhavani Cargo" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-xs", children: /* @__PURE__ */ jsx(Inbox, { className: "w-7 h-7" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-3", children: [
            "Owner Inbox",
            totalInboxItems > 0 && /* @__PURE__ */ jsxs(Badge, { className: "bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs animate-pulse", children: [
              totalInboxItems,
              " PENDING"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-0.5 text-xs sm:text-sm", children: "Consolidated executive feed for financial approvals, operational exceptions, and high-value decisions." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => fetchFeed(false),
          disabled: refreshing,
          className: "rounded-xl border-border/60 hover:bg-muted/30 font-medium text-xs gap-1.5 h-10 px-4",
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}` }),
            "Refresh"
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-amber-950/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(DollarSign, { className: "w-3.5 h-3.5" }),
            " Pending Approvals"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-black font-mono text-foreground", children: totalApprovalsCount }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-muted-foreground", children: [
              "(\u20B9",
              totalApprovalsValue.toLocaleString("en-IN"),
              ")"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20", children: /* @__PURE__ */ jsx(CircleCheck, { className: "w-6 h-6" }) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-rose-950/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(TriangleAlert, { className: "w-3.5 h-3.5" }),
            " Fleet Exceptions"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-black font-mono text-foreground", children: totalExceptionsCount }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-rose-400", children: "Delays & Breakdowns" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "w-6 h-6" }) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border border-border/50 rounded-3xl overflow-hidden shadow-soft bg-gradient-to-br from-card via-card to-cyan-950/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
            " Pending Quotations"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-2xl sm:text-3xl font-black font-mono text-foreground", children: totalDecisionsCount }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-cyan-400", children: "Ready to Convert" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20", children: /* @__PURE__ */ jsx(Truck, { className: "w-6 h-6" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(Tabs3, { value: activeTab, onValueChange: setActiveTab, className: "w-full sm:w-auto", children: /* @__PURE__ */ jsxs(TabsList3, { className: "bg-muted/60 p-1 rounded-2xl grid grid-cols-4 sm:flex gap-1", children: [
        /* @__PURE__ */ jsxs(TabsTrigger3, { value: "all", className: "rounded-xl font-bold text-xs", children: [
          "All (",
          totalInboxItems,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger3, { value: "approvals", className: "rounded-xl font-bold text-xs", children: [
          "Approvals (",
          totalApprovalsCount,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger3, { value: "exceptions", className: "rounded-xl font-bold text-xs", children: [
          "Exceptions (",
          totalExceptionsCount,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger3, { value: "decisions", className: "rounded-xl font-bold text-xs", children: [
          "Quotes (",
          totalDecisionsCount,
          ")"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "relative w-full sm:w-72", children: /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Search truck, driver, route...",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "h-10 bg-background border-border rounded-xl text-xs pl-3"
        }
      ) })
    ] }),
    loading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[40vh] gap-3", children: [
      /* @__PURE__ */ jsx(RefreshCw, { className: "w-8 h-8 animate-spin text-amber-500" }),
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm font-medium", children: "Scanning live approvals & fleet exceptions..." })
    ] }) : filteredItems.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "border border-border/50 rounded-3xl p-12 text-center bg-card shadow-soft", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs", children: /* @__PURE__ */ jsx(CheckCheck, { className: "w-8 h-8" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-heading font-extrabold text-foreground mt-4", children: "All Clear! No Pending Items" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm max-w-md mx-auto mt-1", children: "Every approval rule has been resolved, fleet shipments are running on schedule, and all high-value decisions are up to date." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredItems.map((item) => {
      const isProcessing = processingActionId === item.id;
      if (item.categoryGroup === "approval") {
        return /* @__PURE__ */ jsx(
          Card,
          {
            className: "border border-amber-500/30 rounded-3xl overflow-hidden shadow-soft bg-card hover:border-amber-500/50 transition-all",
            children: /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold text-xs uppercase", children: "APPROVAL REQUIRED" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs font-mono", children: item.rule_name || item.category || "Expense Approval" }),
                  item.truck_number && /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs font-bold gap-1", children: [
                    /* @__PURE__ */ jsx(Truck, { className: "w-3 h-3 text-cyan-400" }),
                    " ",
                    item.truck_number
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold text-foreground flex items-center gap-2", children: item.title || item.reason || "Financial Disbursement Sign-Off" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-muted-foreground", children: [
                  "Requested by ",
                  /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: item.requester_name || item.driver_name || "Fleet Operator" }),
                  item.route ? ` for Route: ${item.route}` : "",
                  item.notes ? ` \u2014 "${item.notes}"` : ""
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground pt-1", children: [
                  /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
                    new Date(item.created || item.timestamp || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                  ] }),
                  item.threshold && /* @__PURE__ */ jsxs("span", { children: [
                    "Rule Threshold: \u20B9",
                    Number(item.threshold).toLocaleString("en-IN")
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/40", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-left sm:text-right", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-muted-foreground uppercase tracking-wider block", children: "Requested Amount" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-2xl font-black font-mono text-amber-400", children: [
                    "\u20B9",
                    Number(item.amount || 0).toLocaleString("en-IN")
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto", children: [
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      disabled: isProcessing,
                      onClick: () => handleExecuteAction(item, "APPROVE_WORKFLOW", "Approved via Owner Inbox"),
                      className: "h-10 px-5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-1.5 flex-1 sm:flex-none",
                      children: [
                        /* @__PURE__ */ jsx(CircleCheck, { className: "w-4 h-4" }),
                        " Approve"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      disabled: isProcessing,
                      onClick: () => {
                        setRejectDialogItem(item);
                        setRejectReason("");
                      },
                      className: "h-10 px-4 rounded-xl font-bold border-rose-500/40 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 gap-1.5 flex-1 sm:flex-none",
                      children: [
                        /* @__PURE__ */ jsx(CircleX, { className: "w-4 h-4" }),
                        " Reject"
                      ]
                    }
                  ),
                  item.requester_phone && /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      onClick: () => handleOpenWhatsApp(item.requester_phone, `Hello, regarding your request of \u20B9${item.amount} for ${item.truck_number || "Fleet"}: `),
                      className: "h-10 w-10 p-0 rounded-xl border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",
                      title: "Chat on WhatsApp",
                      children: /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] })
            ] })
          },
          item.id
        );
      }
      if (item.categoryGroup === "exception") {
        const isBreakdown = item.type === "breakdown";
        return /* @__PURE__ */ jsx(
          Card,
          {
            className: `border ${isBreakdown ? "border-rose-500/40" : "border-amber-500/40"} rounded-3xl overflow-hidden shadow-soft bg-card`,
            children: /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Badge, { className: `${isBreakdown ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"} font-bold text-xs uppercase`, children: isBreakdown ? "VEHICLE BREAKDOWN" : "TRANSIT DELAY > 45 MIN" }),
                  /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs font-bold gap-1", children: [
                    /* @__PURE__ */ jsx(Truck, { className: "w-3 h-3 text-cyan-400" }),
                    " ",
                    item.truck_number
                  ] }),
                  item.delay_minutes && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs text-rose-400 border-rose-500/30 font-bold", children: [
                    "Delayed by ",
                    item.delay_minutes,
                    " mins"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("h4", { className: "text-lg font-bold text-foreground", children: item.route ? `Shipment Route: ${item.route}` : item.title }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-muted-foreground", children: [
                  "Assigned Driver: ",
                  /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: item.driver_name || "Driver" }),
                  " (",
                  item.driver_phone || "No direct phone",
                  ")",
                  item.location ? ` \u2022 Current Loc: ${item.location}` : ""
                ] }),
                item.delay_reason && /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-400/90 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/20", children: [
                  "Reported Cause: ",
                  item.delay_reason
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/40", children: [
                item.driver_phone && /* @__PURE__ */ jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    onClick: () => handleOpenWhatsApp(item.driver_phone, `Urgent: Jai Bhavani Cargo Fleet HQ checking on status of truck ${item.truck_number} on ${item.route || "active trip"}. Please update location.`),
                    className: "h-10 px-4 rounded-xl font-bold border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-1.5",
                    children: [
                      /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
                      " WhatsApp Driver"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    size: "sm",
                    disabled: isProcessing,
                    onClick: () => handleExecuteAction(item, "RESOLVE_EXCEPTION", "Acknowledged and escalated to roadside ops"),
                    className: "h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5",
                    children: [
                      /* @__PURE__ */ jsx(CheckCheck, { className: "w-4 h-4" }),
                      " Acknowledge"
                    ]
                  }
                )
              ] })
            ] })
          },
          item.id
        );
      }
      if (item.categoryGroup === "decision") {
        return /* @__PURE__ */ jsx(
          Card,
          {
            className: "border border-cyan-500/30 rounded-3xl overflow-hidden shadow-soft bg-card hover:border-cyan-500/50 transition-all",
            children: /* @__PURE__ */ jsxs("div", { className: "p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Badge, { className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-bold text-xs uppercase", children: "CUSTOMER QUOTATION" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs font-mono", children: item.quote_number || "QUOTE" }),
                  item.truck_size && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs font-bold", children: item.truck_size })
                ] }),
                /* @__PURE__ */ jsxs("h4", { className: "text-lg font-bold text-foreground", children: [
                  item.customer_name || "Corporate Shipper",
                  " \u2014 ",
                  item.origin,
                  " \u2794 ",
                  item.destination
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs sm:text-sm text-muted-foreground", children: [
                  "Estimated Freight: ",
                  /* @__PURE__ */ jsxs("strong", { className: "text-cyan-400", children: [
                    "\u20B9",
                    Number(item.amount || item.total_amount || 0).toLocaleString("en-IN")
                  ] }),
                  item.kms ? ` (${item.kms} KMs)` : "",
                  " \u2022 Status: ",
                  item.status || "Pending"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/40", children: /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => navigate(`/quotes-manager?quoteNumber=${item.quote_number || ""}`),
                  className: "h-10 px-5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs gap-1.5",
                  children: [
                    "Open Quote & Convert ",
                    /* @__PURE__ */ jsx(ArrowUpRight, { className: "w-4 h-4" })
                  ]
                }
              ) })
            ] })
          },
          item.id
        );
      }
      return null;
    }) }),
    /* @__PURE__ */ jsx(Dialog2, { open: !!rejectDialogItem, onOpenChange: (open) => !open && setRejectDialogItem(null), children: /* @__PURE__ */ jsxs(DialogContent3, { className: "rounded-3xl border border-border bg-card p-6 max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle3, { className: "text-xl flex items-center gap-2 text-rose-400", children: [
          /* @__PURE__ */ jsx(CircleX, { className: "w-5 h-5" }),
          " Reject Approval Request"
        ] }),
        /* @__PURE__ */ jsx(DialogDescription3, { children: "Please enter the operational reason for rejecting this disbursement. The requester and driver will be notified." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-2xl bg-muted/30 border border-border/40", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground uppercase font-bold", children: "Item Details:" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-foreground mt-0.5", children: [
            rejectDialogItem?.title || rejectDialogItem?.rule_name,
            " (\u20B9",
            rejectDialogItem?.amount,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label3, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground", children: "Reason for Rejection *" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              placeholder: "e.g. Rate exceeds sanctioned depot rates, duplicate fuel bill, requires inspection...",
              value: rejectReason,
              onChange: (e) => setRejectReason(e.target.value),
              rows: 3,
              className: "bg-background border-border rounded-xl text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => setRejectDialogItem(null),
            className: "rounded-xl border-border",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            disabled: !rejectReason.trim() || processingActionId === rejectDialogItem?.id,
            onClick: () => handleExecuteAction(rejectDialogItem, "REJECT_WORKFLOW", rejectReason),
            className: "rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1.5",
            children: "Confirm Rejection"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  OwnerInboxPage as default
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/arrow-up-right.js:
lucide-react/dist/esm/icons/check-check.js:
lucide-react/dist/esm/icons/circle-check.js:
lucide-react/dist/esm/icons/circle-x.js:
lucide-react/dist/esm/icons/clock.js:
lucide-react/dist/esm/icons/dollar-sign.js:
lucide-react/dist/esm/icons/inbox.js:
lucide-react/dist/esm/icons/message-square.js:
lucide-react/dist/esm/icons/refresh-cw.js:
lucide-react/dist/esm/icons/shield-alert.js:
lucide-react/dist/esm/icons/sparkles.js:
lucide-react/dist/esm/icons/triangle-alert.js:
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
