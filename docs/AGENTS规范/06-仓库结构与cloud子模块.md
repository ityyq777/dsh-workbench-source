# 仓库结构与 cloud 子模块

> 从根 `AGENTS.md` 拆出的仓库结构与 cloud 子模块规范。

本仓库是宿主源码仓库；云端 Java 服务通过 `cloud/` 子模块引用，指向
`https://gitee.com/yang7it/dsh-workbench-cloud.git`（GitHub 镜像：
`https://github.com/ityyq777/dsh-workbench-cloud`），分支 `main`。

- 不要在本仓库复制云端源码，也不要再单独 clone 一个云端工作区。
- 新 clone 用 `git clone --recurse-submodules`；已有工作区用
  `git submodule update --init --recursive cloud` 初始化。
- 更新子模块：`pnpm cloud:update`；构建云端：`pnpm cloud:build`。
- 改云端代码：先在 `cloud/` 内提交并推送云端仓库，再回宿主提交 `cloud` 的
  gitlink（`git add cloud && git commit`）。只提交云端不提交宿主，宿主会继续指向旧 commit。
- 服务器部署可以单独 clone 云端仓库，也可以 clone 宿主后初始化子模块；两种方式产物相同。
- `cloud/target/` 是构建产物，不要提交；由云端仓库自己的 `.gitignore` 忽略。

