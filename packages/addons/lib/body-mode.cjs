// Same-origin preference shared across independently bundled addons; no tasks dependency.
var KEY = 'wb.bodyMode', EVENT = 'wb-body-mode';
function normalize(value) { return value === 'text' ? 'text' : 'markdown'; }
function get() { try { return normalize(window.localStorage.getItem(KEY)); } catch (_) { return 'markdown'; } }
function set(value) {
  value = normalize(value);
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(KEY, value); } catch (_) {}
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  }
  return value;
}
function useMode(React) {
  var state = React.useState(get());
  React.useEffect(function () {
    if (typeof window === 'undefined') return;
    function changed(e) { state[1](e.type === EVENT ? normalize(e.detail) : get()); }
    window.addEventListener(EVENT, changed); window.addEventListener('storage', changed);
    state[1](get());
    return function () { window.removeEventListener(EVENT, changed); window.removeEventListener('storage', changed); };
  }, []);
  return state[0];
}
module.exports = { get: get, set: set, useMode: useMode };
