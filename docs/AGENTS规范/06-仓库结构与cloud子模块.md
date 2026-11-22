# 仓库结构与 cloud 子模块

> 从根 `AGENTS.md` 拆出的仓库结构与 cloud 子模块规范。

本仓库是宿主源码仓库，云端分两种，各自一个子模块：

| 子模块           | 云端类型 | 技术栈                          | 仓库                                                             |
| ---------------- | -------- | ------------------------------- | ---------------------------------------------------------------- |
| `cloud/`         | 共享云端 | Java 21 + Spring Boot +  PostgreSQL | https://github.com/ityyq777/dsh-workbench-cloud                  |
| `cloud-private/` | 私人云端 | Node.js + node:sqlite + 本地文件 | https://github.com/ityyq777/dsh-workbench-private-cloud          |

宿主插件在「账号与同步」页选择云端类型（仅本机 / 私人云端 / 共享云端）。私人云端由
本机填写服务端地址与访问密钥，凭据不落 cloud-creds.json；共享云端仍走账号登录。
两种云端实现同一套协议 v2（`/v1/auth/*` 之外的 `/v1/sync/*` 与 `/v1/files/*` 语义一致），
切换云端会清空本机同步游标并重新全量同步，业务数据不动。

共享云端：Java 服务通过 `cloud/` 子模块引用，指向
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
- 私人云端在 `cloud-private/` 内开发：本地起服务 `pnpm cloud-private:start`（需
  `WB_PRIVATE_SECRET` 等环境变量，见该仓库 README），测试 `pnpm cloud-private:test`。
  改动同样先在 `cloud-private/` 提交推送，再回宿主提交 gitlink。

