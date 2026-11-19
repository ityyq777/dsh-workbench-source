#!/usr/bin/env bash
# 手工发布流程：先重建发布树，再 dry-run，最后正式发布。
# 只跑 publish:npm 不会重新打包，dist/release 里是什么版本就发什么版本。
set -euo pipefail
cd /Users/yyq/code/dsh-workbench

# 1. 先确认源码版本号已经改过（package.json 的 version、client.src.cjs 的 registerAddon
#    version、docs 里的版本引用），版本没动过即使重新 stage 也会被 npm「已存在…跳过」。
git log --oneline -1

# 2. 重建发布树：宿主与全部插件的产物、dist/release、release.json 都在这一步更新。
pnpm build && pnpm dist:shell && pnpm stage:release

# 3. 登录官方 registry（本机默认 npmmirror，不能用来发布）。
npm login --registry=https://registry.npmjs.org

# 4. dry-run 先看：脚本会比对发布树与源码版本，不一致直接退出码 3。
pnpm publish:npm

# 5. 正式发布；有 2FA 时加 --otp=123456。
pnpm publish:npm -- --publish
