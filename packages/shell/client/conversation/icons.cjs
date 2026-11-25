// 会话角色相关界面的图标表：lucide 图标按需 require，渲染统一走共享 lib/icons.cjs 工厂。
//
// 共享层不放总图标表（每个图标都会随宿主 client.js 打包），所以图标清单留在本目录；
// 渲染逻辑（尺寸、aria-hidden、兜底）仍由共享工厂提供，别处不要再自己拼 svg。
"use strict";

var iconsLib = require("../../../addons/lib/icons.cjs");

module.exports = iconsLib.create("wb-role", {
  "check": require("lucide-react/icons/check").default,
  "bot": require("lucide-react/icons/bot").default,
  "user": require("lucide-react/icons/user").default,
  "x-circle": require("lucide-react/icons/x-circle").default,
  "plus": require("lucide-react/icons/plus").default,
  "copy": require("lucide-react/icons/copy").default,
  "pencil": require("lucide-react/icons/pencil").default,
  "trash-2": require("lucide-react/icons/trash-2").default,
  "eye": require("lucide-react/icons/eye").default,
  "refresh-cw": require("lucide-react/icons/refresh-cw").default,
  "arrow-left": require("lucide-react/icons/arrow-left").default,
  "arrow-right": require("lucide-react/icons/arrow-right").default,
  "x": require("lucide-react/icons/x").default,
  "code-2": require("lucide-react/icons/code-2").default,
  "pilcrow": require("lucide-react/icons/pilcrow").default,
}, { fallback: "bot", classNameAppend: true });
