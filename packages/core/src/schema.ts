/**
 * 工作台本地库 schema（平台级表）。
 *
 * 业务表（task / tag / site 等）不在这里：它们由子插件的 migrations 创建/演进，
 * 壳本身不感知任何具体业务。这样「任务记录」才能真正装/卸。
 */
export const SCHEMA_SQL = `
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY, v TEXT NOT NULL
);

-- 通用变更日志：写事务内追加；未推送尾部即待同步队列
CREATE TABLE IF NOT EXISTS sync_change_log (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT,
  origin TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- 冲突展示（LWW 输方的版本留档，绝不静默吞数据）
CREATE TABLE IF NOT EXISTS conflict_shadow (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'pull',
  resolution TEXT NOT NULL DEFAULT 'server',
  local_payload TEXT,
  server_payload TEXT,
  server_updated_at INTEGER,
  local_updated_at INTEGER,
  resolved_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_conflict_resolved ON conflict_shadow(resolved_at);

-- 单行/单表连续失败的死信；不阻塞其他表同步
CREATE TABLE IF NOT EXISTS sync_dead_letter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  row_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT,
  error TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dead_letter_table ON sync_dead_letter(table_name, row_id);

-- 同步水位/账号绑定/时钟/最后状态。v 用 TEXT 存储，兼容旧库的 INTEGER 亲和性。
CREATE TABLE IF NOT EXISTS sync_state (
  k TEXT PRIMARY KEY, v TEXT NOT NULL
);

-- 会话只保存所选工作台角色，状态仅在本机生效。
CREATE TABLE IF NOT EXISTS user_role (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  definition TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_role (
  session_id TEXT PRIMARY KEY,
  role_id TEXT,
  role_version TEXT,
  updated_at INTEGER NOT NULL
);

-- 命令选定的角色仅适用于对应消息，排队消息在进程恢复后仍可核对。
CREATE TABLE IF NOT EXISTS session_message_role (
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  role_version TEXT NOT NULL,
  PRIMARY KEY(session_id, message_id)
);

-- 宿主事件队列：push 方只写一行就返回，订阅方的消费 action 由后台 drain 异步分发。
-- 三张表都是平台表，业务插件不建、也不参与云同步。
CREATE TABLE IF NOT EXISTS host_event (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload TEXT,
  -- 投递方式：broadcast=按订阅登记表推送；targeted=按发布方点名的收件人直投
  mode TEXT NOT NULL DEFAULT 'broadcast',
  status TEXT NOT NULL DEFAULT 'queued',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_host_event_status ON host_event(status, created_at);

CREATE TABLE IF NOT EXISTS host_event_delivery (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_at INTEGER NOT NULL,
  started_at INTEGER,
  last_error TEXT,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_host_event_delivery_pending ON host_event_delivery(status, next_at);

CREATE TABLE IF NOT EXISTS host_event_subscription (
  domain TEXT NOT NULL,
  type TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (domain, type, action)
);

-- 自动化规则：触发条件 + 已启用的 action（execMode=action）或提示词（execMode=agent）。
CREATE TABLE IF NOT EXISTS automation_rule (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  trigger_type TEXT NOT NULL,
  trigger_config TEXT NOT NULL DEFAULT '{}',
  condition TEXT NOT NULL DEFAULT '',
  action_name TEXT NOT NULL,
  action_args TEXT NOT NULL DEFAULT '{}',
  next_run_at INTEGER,
  last_run_at INTEGER,
  last_status TEXT NOT NULL DEFAULT 'never',
  run_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  rev INTEGER NOT NULL DEFAULT 1,
  -- execMode=action 时调 action；execMode=agent 时把提示词交给宿主「自动化任务」投递。
  exec_mode TEXT NOT NULL DEFAULT 'action',
  agent_json TEXT NOT NULL DEFAULT '',
  schedule_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_automation_rule_due ON automation_rule(enabled, next_run_at);
CREATE INDEX IF NOT EXISTS idx_automation_rule_schedule ON automation_rule(schedule_id);

-- 运行记录只在本机，不参与云同步；rule_id 指向 automation_rule。
CREATE TABLE IF NOT EXISTS automation_run (
  id TEXT PRIMARY KEY,
  rule_id TEXT NOT NULL,
  trigger TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  result TEXT NOT NULL DEFAULT '',
  error TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_automation_run_rule ON automation_run(rule_id, started_at);

-- 本机配置：允许调用的 action 清单等。
CREATE TABLE IF NOT EXISTS automation_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
