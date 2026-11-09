/** Cold multiline parsing: deterministic copy budget plus a generous timing smoke check. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { performance } from "node:perf_hooks";

const source = readFileSync(new URL("../packages/addons/lib/markdown.cjs", import.meta.url), "utf8");
function freshParser() {
  const context = createContext({ module: { exports: {} } });
  // Count cumulative copying independently of host speed/JIT/GC. This catches the
  // original concat-per-line O(n²) implementation even on a very fast machine.
  runInContext(
    "var copiedSlots = 0; var concat = Array.prototype.concat;" +
    "Array.prototype.concat = function () { copiedSlots += this.length; return concat.apply(this, arguments); };",
    context,
  );
  runInContext(source, context);
  return { parse: context.module.exports.parse, copies: () => context.copiedSlots };
}

const small = freshParser();
assert.deepEqual(JSON.parse(JSON.stringify(small.parse("alpha **bold**\nbeta *italic*\ngamma", "markdown"))), [{
  tag: "p", props: {}, children: [
    "alpha ", { tag: "strong", children: ["bold"], props: {} }, { tag: "br", children: [], props: {} },
    "beta ", { tag: "em", children: ["italic"], props: {} }, { tag: "br", children: [], props: {} }, "gamma",
  ],
}]);

const measurements = [];
for (const count of [5000, 10000, 20000, 40000]) {
  const { parse, copies } = freshParser(); // A fresh module ensures no cache hit.
  const input = Array.from({ length: count }, (_, i) => "line " + i).join("\n");
  const start = performance.now();
  const ast = parse(input, "markdown");
  const ms = performance.now() - start;
  assert.equal(ast.length, 1);
  assert.equal(ast[0].tag, "p");
  const children = ast[0].children;
  assert.equal(children.length, 2 * count - 1);
  for (let i = 0; i < count; i++) {
    assert.equal(children[2 * i], "line " + i, "each line retains its order and text");
    if (i) assert.equal(children[2 * i - 1].tag, "br", "exactly one hard break between lines");
  }
  assert(copies() <= 4 * children.length, "paragraph assembly must not copy a growing prefix for every line");
  // Complexity is enforced above; this is only a loose protection against hangs.
  assert(ms < 10000, "cold multiline parse exceeded the generous 10s smoke budget");
  measurements.push({ lines: count, ms: Math.round(ms * 10) / 10, copiedSlots: copies() });
}
console.log("MARKDOWN PERFORMANCE PASS", JSON.stringify(measurements));
