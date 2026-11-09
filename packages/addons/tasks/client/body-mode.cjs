module.exports = function (React) {
  var h = React.createElement, preference = require('../../lib/body-mode.cjs');
  return function BodyMode(props) {
    var mode = preference.useMode(React), pending = React.useState(false), requestLock = React.useRef(false);
    React.useEffect(function () {
      if (props.value === 'markdown' || props.value === 'text') preference.set(props.value);
    }, [props.value]);
    function change(value) {
      if (requestLock.current) return;
      requestLock.current = true;
      preference.set(value); pending[1](true);
      Promise.resolve().then(function () { return props.api.call('tasks.configSet', { values: { 'ui.bodyMode': value } }); })
        .then(function (r) { if (r && r.ok === false) throw new Error(r.error || 'save failed'); })
        .catch(function (e) { if (props.toast) props.toast(props.t.bodyModeLocal + ' ' + String(e.message || e)); })
        .finally(function () { requestLock.current = false; pending[1](false); });
    }
    return h('span', { className: 'wb-body-modes', role: 'group', 'aria-label': props.t.bodyMode },
      ['markdown', 'text'].map(function (value) { return h('button', {
        key: value, type: 'button', className: 'wbt-btn', disabled: pending[0],
        title: props.t[value === 'text' ? 'plainText' : 'markdown'], 'aria-label': props.t[value === 'text' ? 'plainText' : 'markdown'],
        'aria-pressed': mode === value, onClick: function () { change(value); }
      }, value === 'text' ? 'T' : 'M'); }));
  };
};
