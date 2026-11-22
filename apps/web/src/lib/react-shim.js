import { r as _React, a as _ReactDOM } from './vendor-react-Bs5V2qFE.js';

const React = _React || (typeof window !== 'undefined' ? window.React : {});
const ReactDOM = _ReactDOM || (typeof window !== 'undefined' ? window.ReactDOM : {});

export const useState = (...args) => React.useState(...args);
export const useEffect = (...args) => React.useEffect(...args);
export const useLayoutEffect = (...args) => (React.useLayoutEffect || React.useEffect)(...args);
export const useContext = (...args) => React.useContext(...args);
export const createContext = (...args) => React.createContext(...args);
export const useMemo = (...args) => React.useMemo(...args);
export const useCallback = (...args) => React.useCallback(...args);
export const useRef = (...args) => React.useRef(...args);
export const useId = (...args) => (React.useId ? React.useId(...args) : Math.random().toString(36).slice(2));
export const useReducer = (...args) => React.useReducer(...args);
export const useImperativeHandle = (...args) => (React.useImperativeHandle ? React.useImperativeHandle(...args) : undefined);
export const forwardRef = (...args) => React.forwardRef(...args);
export const createElement = (...args) => React.createElement(...args);
export const cloneElement = (...args) => React.cloneElement(...args);
export const Children = React.Children;
export const Fragment = React.Fragment;
export const isValidElement = (...args) => React.isValidElement(...args);
export const Component = React.Component || class Component { constructor(props) { this.props = props; } };
export const PureComponent = React.PureComponent || class PureComponent extends (React.Component || Object) {};

export const createPortal = (children, container) => {
  try {
    if (ReactDOM && typeof ReactDOM.createPortal === 'function') {
      return ReactDOM.createPortal(children, container || (typeof document !== 'undefined' ? document.body : null));
    }
    if (typeof window !== 'undefined' && window.ReactDOM && typeof window.ReactDOM.createPortal === 'function') {
      return window.ReactDOM.createPortal(children, container || (typeof document !== 'undefined' ? document.body : null));
    }
  } catch (e) {}
  return children;
};

export { ReactDOM };

export const jsx = (type, props, key) => {
  if (!props) return React.createElement(type, key !== undefined ? { key } : null);
  const { children, ...rest } = props;
  const p = key !== undefined ? { ...rest, key } : rest;
  if (children === undefined) return React.createElement(type, p);
  return Array.isArray(children)
    ? React.createElement(type, p, ...children)
    : React.createElement(type, p, children);
};
export const jsxs = jsx;

export default React;
