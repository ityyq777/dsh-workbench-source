// The source test harnesses intentionally supply React; bundle the real icon dependency around it.
import { buildSync } from "esbuild";
import { runInNewContext } from "node:vm";
let code;
export function loadLucideReact(react) {
  code ||= buildSync({ stdin: { contents: 'module.exports = require("lucide-react");',
    resolveDir: process.cwd() }, bundle: true, write: false, format: "cjs", platform: "browser",
    external: ["react"], logLevel: "silent" }).outputFiles[0].text;
  Object.assign(react, { forwardRef: fn => p => fn(p, null), createContext: value => ({ value }),
    useContext: c => c.value, useMemo: fn => fn() });
  const module = { exports: {} };
  runInNewContext(code, { module, exports: module.exports, require: () => react });
  return module.exports;
}
