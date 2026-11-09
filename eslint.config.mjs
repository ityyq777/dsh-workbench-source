// TypeScript 解析器同时支持 JS、TS 和 TSX；不需要启动类型检查或加载 tsconfig。
import tsParser from "@typescript-eslint/parser";
// 插件借助 @typescript-eslint/eslint-plugin 分析变量引用，提供 import 的自动修复。
import unusedImports from "eslint-plugin-unused-imports";

/**
 * ESLint flat config：按数组顺序合并匹配文件的配置。
 * pnpm lint：检查未使用的 import，发现问题时返回非零退出码。
 * pnpm lint:fix：删除未使用的导入成员；整条导入都未使用时删除整条语句。
 * 单文件清理：pnpm exec eslint 路径 --fix。
 *
 * 格式排版由 Prettier 负责，这里只启用 import 清理规则。
 * 本配置不检查普通未使用变量，也不会自动清理 CommonJS require()。
 * 显式副作用导入（如 import "./setup.js"）会保留；如果初始化模块需要执行，
 * 应明确使用这种写法，不要依赖一个从未引用的导入变量来触发初始化。
 */
export default [
  {
    // 独立的 ignores 对象是全局排除规则，可直接跳过整个目录。
    // ESLint 不会自动继承 .gitignore，构建目录需要在这里明确列出。
    ignores: [
      "**/node_modules/**", // 所有工作区依赖，包括嵌套安装目录。
      // 这三个包的 lib 是 TypeScript 构建产物。
      "packages/core/lib/**",
      "packages/sdk/lib/**",
      "packages/shell/lib/**",
      // addon 的 lib 中大部分是手写运行源码，必须检查；只排除客户端 bundle。
      "packages/addons/*/lib/client.js",
      "packages/shell/client/client.js",
      "packages/shell-dist/**", // 宿主分发产物。
      "dist/**", // 发布镜像及打包产物。
      "_archive/**", // 历史项目，不属于当前维护范围。
      "cloud/**", // 独立的云端 Java 子模块，由其自身工具链管理。
      ".pnpm-store/**", // 本地包缓存。
      ".tmp*/**", // 根目录临时安装或验证工作区。
    ],
  },
  {
    // 覆盖构建/测试脚本和各包源码；TS/TSX 需显式匹配才能被目录扫描发现。
    files: ["eslint.config.mjs", "scripts/**/*.{js,mjs,cjs,ts,tsx}", "packages/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      // 允许 JS 中出现 JSX；TSX 由文件扩展名识别。
      parserOptions: { ecmaFeatures: { jsx: true } },
      // 不覆盖 sourceType：保留 ESLint 对 .cjs 的 CommonJS 默认识别。
    },
    // 注册规则命名空间，并非启用插件提供的所有规则。
    plugins: { "unused-imports": unusedImports },
    rules: {
      // error 使检查失败，--fix 执行自动清理；类型导入同样参与引用分析。
      // 不额外开启 no-unused-vars，避免重复报告同一个 import。
      "unused-imports/no-unused-imports": "error",
    },
  },
];
