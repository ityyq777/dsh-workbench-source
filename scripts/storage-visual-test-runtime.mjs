// The source test harnesses intentionally supply React; bundle the real icon dependency around it.
import { buildSync } from "esbuild";
import { runInNewContext } from "node:vm";
const codes = new Map();
export function loadLucideReact(react, name) {
  if (!/^lucide-react\/icons\/[a-z0-9-]+$/.test(name)) throw new Error("Expected public per-icon subpath: " + name);
  let code = codes.get(name);
  if (!code) code = buildSync({ stdin: { contents: "module.exports = require(" + JSON.stringify(name) + ");",
    resolveDir: process.cwd() }, bundle: true, write: false, format: "cjs", platform: "browser",
    external: ["react"], logLevel: "silent" }).outputFiles[0].text;
  codes.set(name, code);
  Object.assign(react, { forwardRef: fn => p => fn(p, null), createContext: value => ({ value }),
    useContext: c => c.value, useMemo: fn => fn() });
  const module = { exports: {} };
  runInNewContext(code, { module, exports: module.exports, require: () => react });
  return module.exports;
}
