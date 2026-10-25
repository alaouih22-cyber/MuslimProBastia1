const getR = () => (typeof window !== 'undefined' ? (window.React?.default || window.React || window._) : null);

export const useState = (...args) => getR().useState(...args);
export const useEffect = (...args) => getR().useEffect(...args);
export const useRef = (...args) => getR().useRef(...args);
export const useMemo = (...args) => getR().useMemo(...args);
export const useCallback = (...args) => getR().useCallback(...args);
export const useContext = (...args) => getR().useContext(...args);
export const createContext = (...args) => getR().createContext(...args);
export const createElement = (...args) => getR().createElement(...args);
export const Fragment = Symbol.for('react.fragment');

const ReactProxy = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'Fragment') return Symbol.for('react.fragment');
    const R = getR();
    return R ? R[prop] : undefined;
  }
});

export default ReactProxy;
