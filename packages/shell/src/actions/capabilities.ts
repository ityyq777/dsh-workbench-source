import { renderTaskTarget } from "./task-targets.js";
import type { RegisteredDomain } from "../types/host-types.js";
export function createCapabilities({ domains, SHELL_VERSION, actionEntry, taskTargets, agentVisible }: any) {
  function findDomain(raw: string): RegisteredDomain | null {
    const key = String(raw ?? "").trim();
    if (!key) return null;
    for (const rec of domains.values()) {
      if (
        rec.def.id === key ||
        rec.def.id === "wb-addon-" + key ||
        rec.def.id.replace(/^wb-addon-/, "") === key
      ) {
        return rec;
      }
    }
    return null;
  }

  /** 归一化能力依赖：声明了 requires 却没装对应域时，能力清单必须说出来，否则 agent 会照描述传参。 */
  function normalizeRequires(declared: any, warnings: string[]): { requires: string[]; missing: string[] } {
    const requires: string[] = [];
    for (const raw of Array.isArray(declared?.requires) ? declared.requires : []) {
      const id = String(raw ?? "").trim();
      if (!id) continue;
      if (requires.indexOf(id) >= 0) continue;
      requires.push(id);
    }
    const missing = requires.filter((id) => !domains.has(id) && !domains.has("wb-addon-" + id));
    if (missing.length) {
      warnings.push(
        "依赖未安装：" + missing.join("、") + "；相关参数（如 tagIds/tags）会报错，其余功能正常",
      );
    }
    return { requires, missing };
  }

  /**
   * 插槽声明报告：谁贡献、谁提供落点。
   * 贡献方声明了插槽但没有任何已启用域提供该落点时，必须明确说出来——否则用户装了一半插件
   * 只会看到「按钮没出现」，而无从判断是没装、没启用还是坏了。
   */
  function slotInfo(rec: RegisteredDomain) {
    const uniq = (list: any): string[] => {
      const out: string[] = [];
      for (const raw of Array.isArray(list) ? list : []) {
        const id = String(raw ?? "").trim();
        if (id && out.indexOf(id) < 0) out.push(id);
      }
      return out;
    };
    const renders = uniq(rec.def.slotHosts);
    const contributes = uniq(rec.def.slots).map((slot) => {
      const hosts: string[] = [];
      for (const other of domains.values()) {
        if (other.error !== null) continue;
        if (uniq(other.def.slotHosts).indexOf(slot) >= 0) hosts.push(other.def.id);
      }
      return { slot, hosts, missingHost: hosts.length === 0 };
    });
    return { contributes, renders };
  }

  /** 取业务域的能力清单；未声明时回退到域描述，保留 action 列表供 agent 自行判断。 */
  function capabilityOf(rec: RegisteredDomain, origin: string) {
    const declared = rec.def.capability;
    if (!declared) {
      return {
        summary: rec.def.description ?? rec.def.title,
        records: [] as any[],
        notFor: [] as string[],
        notes: [] as string[],
        fields: [] as any[],
        requires: [] as string[],
        missingRequires: [] as string[],
        source: "fallback" as const,
        warnings: [] as string[],
      };
    }

    const warnings: string[] = [];
    const seen = new Set<string>();
    const records: any[] = [];
    for (const raw of Array.isArray(declared.records) ? declared.records : []) {
      if (!raw || typeof raw !== "object") continue;
      const kind = String((raw as any).kind ?? "").trim();
      if (!kind) {
        warnings.push("存在缺少 kind 的记录声明，已忽略");
        continue;
      }
      if (seen.has(kind)) {
        warnings.push("记录类型重复：" + kind + "（只保留第一条）");
        continue;
      }
      seen.add(kind);
      const primaryAction = String((raw as any).primaryAction ?? "").trim();
      if (!primaryAction) {
        warnings.push(kind + "：缺少 primaryAction");
      } else if (!rec.actions.has(primaryAction)) {
        warnings.push(kind + "：primaryAction 未注册：" + primaryAction);
      }
      if (origin === "agent" && (!rec.actions.has(primaryAction) || !agentVisible(primaryAction, rec.actions.get(primaryAction)))) continue;
      records.push({
        kind,
        title: String((raw as any).title ?? kind),
        description: String((raw as any).description ?? ""),
        when: Array.isArray((raw as any).when)
          ? (raw as any).when.filter((x: unknown) => typeof x === "string" && x.trim())
          : [],
        notFor: Array.isArray((raw as any).notFor) ? (raw as any).notFor : [],
        primaryAction,
        keyArgs: Array.isArray((raw as any).keyArgs) ? (raw as any).keyArgs : [],
        dedupe: String((raw as any).dedupe ?? ""),
        relations: Array.isArray((raw as any).relations) ? (raw as any).relations : [],
        examples: Array.isArray((raw as any).examples) ? (raw as any).examples : [],
      });
    }

    // 字段字典：agent 最容易踩的坑是「方向/枚举/默认值」看不见（例如把 priority 当成越小越紧急）。
    const fields: any[] = [];
    const fieldNames = new Set<string>();
    for (const raw of Array.isArray((declared as any).fields) ? (declared as any).fields : []) {
      if (!raw || typeof raw !== "object") continue;
      const name = String((raw as any).name ?? "").trim();
      if (!name) {
        warnings.push("存在缺少 name 的字段声明，已忽略");
        continue;
      }
      if (fieldNames.has(name)) {
        warnings.push("字段重复：" + name + "（只保留第一条）");
        continue;
      }
      fieldNames.add(name);
      fields.push({
        name,
        type: String((raw as any).type ?? ""),
        description: String((raw as any).description ?? ""),
      });
    }
    if (!fields.length) {
      warnings.push("未声明字段字典（capability.fields）；agent 只能看到字段名，容易误解方向与枚举");
    }

    const deps = normalizeRequires(declared, warnings);

    return {
      summary: String(declared.summary ?? "").trim() || rec.def.description || rec.def.title,
      records,
      notFor: Array.isArray(declared.notFor) ? declared.notFor : [],
      notes: Array.isArray(declared.notes) ? declared.notes : [],
      fields,
      requires: deps.requires,
      missingRequires: deps.missing,
      source: "declared" as const,
      warnings,
    };
  }

  /**
   * 宿主内置能力目录：自动化内化为宿主能力后不再有独立业务域，但 agent 仍要在
   * capabilities.list 里看见它记什么、首选哪个 action。记录结构与业务域保持同形。
   */
  function hostCapability() {
    return {
      id: "wb-shell",
      title: "宿主内置能力",
      version: SHELL_VERSION,
      builtin: true,
      summary:
        "宿主自己提供、不需要安装子插件的能力：事件队列（广播/定向投递）与自动化规则（定时或域事件触发白名单 action，或把提示词交给宿主「自动化任务」由 AI 执行）。",
      records: [
        {
          kind: "automation-rule",
          title: "自动化规则（action）",
          description: "一条「触发条件 + 已启用 action + 参数模板」的规则，由宿主内置引擎按时间或域事件驱动。",
          primaryAction: "automation.ruleCreate",
          when: ["每天固定时间汇总或提醒", "某个域事件发生后调用另一个域的 action", "需要保留每次运行的成败与错误"],
          notFor: ["不要用它执行 vault、audit、automation 或删除/备份类 action", "不要用它替代任务管理"],
          keyArgs: ["name", "execMode", "triggerConfig", "actionName", "actionArgs"],
        },
        {
          kind: "automation-agent-rule",
          title: "自动化规则（交给 AI）",
          description: "execMode=agent：把提示词登记到宿主「自动化任务」，按时投递到会话，由 agent 自己决定怎么执行。",
          primaryAction: "automation.ruleCreate",
          when: ["需要理解、判断或多步操作，无法用固定 action 参数表达", "结果要回到某个会话里继续对话"],
          notFor: ["不要用它做高频轮询：每次投递都会产生一次模型请求", "不支持域事件触发，只有时间触发"],
          keyArgs: ["name", "execMode", "agent"],
        },
      ],
      notFor: ["不允许调用 vault.*、automation.*、audit.* 或 delete/backup 类 action（硬底线，不可配置）"],
      notes: [
        "允许调用的 action 在宿主「自动化」页的「设置」里勾选，默认空；只对本机生效。",
        "规则随备份迁移；运行记录只在本机，不参与云同步。",
        "自动化所需的三张表（automation_rule / automation_run / automation_meta）是宿主平台表，可在「数据」页查看。",
        "事件队列的两种投递语义见 wb.eventDomains：广播按订阅表投递，定向按发布方白名单点名投递。",
      ],
      actions: ["automation.ruleCreate", "automation.ruleList", "automation.ruleRun", "automation.runList", "automation.configSet"],
    };
  }

  /** capabilities.list：聚合各插件“记录什么、首选哪个 action”，给 agent 做统一发现。 */
  async function capabilityListMeta(args: Record<string, unknown>, origin: string = "ui") {
    const kind = args.kind === undefined || args.kind === null ? "" : String(args.kind).trim();
    const out: any[] = [];
    for (const rec of domains.values()) {
      const cap = capabilityOf(rec, origin);
      if (kind && !cap.records.some((r: any) => r.kind === kind)) continue;
      const slots = slotInfo(rec);
      for (const row of slots.contributes) {
        if (row.missingHost) {
          cap.warnings.push(
            "插槽 " + row.slot + " 暂无落点：没有已启用的插件提供该界面，这个贡献不会显示",
          );
        }
      }
      out.push({
        id: rec.def.id,
        title: rec.def.title,
        version: rec.def.version,
        enabled: rec.error === null,
        error: rec.error,
        summary: cap.summary,
        source: cap.source,
        actionCount:
          origin === "agent"
            ? [...rec.actions].filter(([action, def]) => agentVisible(action, def)).length
            : rec.actions.size,
        requires: (cap as any).requires ?? [],
        missingRequires: (cap as any).missingRequires ?? [],
        records: cap.records.map((r: any) => ({
          kind: r.kind,
          title: r.title,
          description: r.description,
          primaryAction: r.primaryAction,
        })),
        taskOwnership: await taskTargets.get(rec, origin),
        slots,
        warnings: cap.warnings,
      });
    }
    return { shellVersion: SHELL_VERSION, kind, domains: out, builtin: [hostCapability()] };
  }

  /** 插槽明细的文字渲染：贡献方写明落点属主，落点方写明自己在渲染哪些插槽。 */
  function renderSlotLine(slots: any): string[] {
    if (!slots) return [];
    const lines: string[] = [];
    if (Array.isArray(slots.renders) && slots.renders.length) {
      lines.push("  提供落点：" + slots.renders.join("、"));
    }
    if (Array.isArray(slots.contributes) && slots.contributes.length) {
      const parts = slots.contributes.map((row: any) =>
        row.hosts && row.hosts.length ? row.slot + " → " + row.hosts.join("、") : row.slot + "（暂无落点）",
      );
      lines.push("  贡献插槽：" + parts.join("；"));
    }
    return lines;
  }

  function renderCapabilityList(meta: any): string {
    const lines = [
      "工作台 " + meta.shellVersion + " · " + meta.domains.length + " 个域" + (meta.kind ? "（kind=" + meta.kind + "）" : ""),
    ];
    for (const d of meta.domains) {
      lines.push("", "[" + d.id + "] " + d.title + " v" + d.version + (d.enabled ? "" : "（未启用：" + d.error + "）"));
      lines.push("  " + d.summary);
      if (d.taskOwnership) lines.push(renderTaskTarget(d.taskOwnership));
      lines.push(...renderSlotLine(d.slots));
      if (!d.records.length) {
        lines.push("  （未声明能力清单；可用 action 见 actions.list）");
      } else {
        for (const r of d.records) {
          lines.push("  " + r.kind + " → " + r.primaryAction + "：" + r.description);
        }
      }
      for (const w of d.warnings ?? []) lines.push("  ⚠ " + w);
    }
    for (const b of meta.builtin ?? []) {
      lines.push("", "[" + b.id + "] " + b.title + " v" + b.version);
      lines.push("  " + b.summary);
      for (const r of b.records) {
        lines.push("  " + r.kind + " → " + r.primaryAction + "：" + r.description);
      }
      if (b.actions.length) lines.push("  相关 action：" + b.actions.join("、"));
      for (const w of b.notFor ?? []) lines.push("  ✗ " + w);
    }
    lines.push(
      "",
      '查看单个域的完整能力与 action 列表：Workbench({ action: "capabilities.get", args: { domain: "tasks" } })',
    );
    return lines.join("\n");
  }

  /** capabilities.get：单个业务域的完整能力清单 + action 摘要（字段细节仍走 actions.help）。 */
  async function capabilityGetMeta(args: Record<string, unknown>, origin: string = "ui") {
    const name = String(args.domain ?? args.id ?? "").trim();
    if (!name) throw new Error("缺少 domain；先用 capabilities.list 查看可用业务域");
    if (name === "wb-shell" || name === "builtin" || name === "host") {
      // 宿主内置能力不是业务域（没有 action 注册表），单独回一层结构，字段与业务域同形。
      const b = hostCapability();
      return {
        shellVersion: SHELL_VERSION,
        domain: { id: b.id, title: b.title, description: b.summary, version: b.version, enabled: true, error: null },
        capability: {
          summary: b.summary,
          taskOwnership: null,
          records: b.records,
          notFor: b.notFor,
          notes: b.notes,
          fields: [],
          requires: [],
          missingRequires: [],
          slots: { renders: [], contributes: [] },
        },
        source: "builtin",
        // 这里只回名字与所属域：入参细节由 actions.help（走真实注册表）给，避免宿主自建一份影子 schema。
        actions: b.actions.map((action: string) => ({ name: action, domain: "wb-shell" })),
        warnings: [],
      };
    }
    const rec = findDomain(name);
    if (!rec) throw new Error("没有该业务域：" + name + "；先用 capabilities.list 查看");
    const cap = capabilityOf(rec, origin);
    return {
      shellVersion: SHELL_VERSION,
      domain: {
        id: rec.def.id,
        title: rec.def.title,
        description: rec.def.description ?? "",
        version: rec.def.version,
        enabled: rec.error === null,
        error: rec.error,
      },
      capability: {
        summary: cap.summary,
        taskOwnership: await taskTargets.get(rec, origin),
        records: cap.records,
        notFor: cap.notFor,
        notes: cap.notes,
        fields: (cap as any).fields ?? [],
        requires: (cap as any).requires ?? [],
        missingRequires: (cap as any).missingRequires ?? [],
        slots: slotInfo(rec),
      },
      source: cap.source,
      // capabilities.get 也是 agent 的发现入口：被本机关闭的 action 不列给它（ui 仍看全量）。
      actions: [...rec.actions]
        .filter(([action, def]) => origin !== "agent" || agentVisible(action, def))
        .map(([action, def]) => actionEntry(action, rec.def.id, def)),
      warnings: cap.warnings,
    };
  }

  function renderCapability(meta: any): string {
    const d = meta.domain;
    const cap = meta.capability;
    const lines = [
      "[" + d.id + "] " + d.title + " v" + d.version + (d.enabled ? "" : "（未启用：" + d.error + "）"),
      cap.summary,
    ];
    if (cap.taskOwnership) lines.push(renderTaskTarget(cap.taskOwnership));
    if (Array.isArray(cap.requires) && cap.requires.length) {
      const missing: string[] = Array.isArray(cap.missingRequires) ? cap.missingRequires : [];
      lines.push(
        "依赖：" +
          cap.requires
            .map((id: string) => id + (missing.indexOf(id) >= 0 ? "（未安装）" : ""))
            .join("、"),
      );
    }
    lines.push(...renderSlotLine(cap.slots));
    if (meta.source === "fallback") {
      lines.push("", "该域未声明能力清单；以下 action 仍可直接调用。");
    }
    if (!cap.records.length) {
      lines.push("", "记录类型：未声明");
    } else {
      lines.push("", "记录类型：");
      for (const r of cap.records) {
        lines.push("- " + r.kind + " · " + r.title + " → " + r.primaryAction);
        if (r.description) lines.push("  " + r.description);
        if (r.when.length) {
          lines.push("  何时记录：");
          for (const w of r.when) lines.push("    - " + w);
        }
        if (r.notFor.length) {
          lines.push("  不要记录：");
          for (const w of r.notFor) lines.push("    - " + w);
        }
        if (r.keyArgs.length) lines.push("  常用参数：" + r.keyArgs.join(", "));
        if (r.dedupe) lines.push("  去重：" + r.dedupe);
        if (r.relations.length) {
          lines.push("  关系：");
          for (const rel of r.relations) {
            lines.push("    - " + rel.kind + " via " + rel.via + "：" + rel.description);
          }
        }
        if (r.examples.length) {
          lines.push("  示例：");
          for (const ex of r.examples) {
            const example = JSON.stringify({ action: r.primaryAction, args: ex.args ?? ex });
            lines.push("    Workbench(" + example + ")" + (ex.purpose ? " // " + ex.purpose : ""));
          }
        }
      }
    }
    if (cap.notFor.length) {
      lines.push("", "这个域不适合：");
      for (const w of cap.notFor) lines.push("  - " + w);
    }
    if (cap.notes.length) {
      lines.push("", "约束：");
      for (const w of cap.notes) lines.push("  - " + w);
    }
    const capFields = (cap as any).fields ?? [];
    if (capFields.length) {
      lines.push("", "字段字典（方向/范围/默认值以此为准）：");
      for (const f of capFields) {
        lines.push("  " + f.name + (f.type ? " · " + f.type : "") + (f.description ? " — " + f.description : ""));
      }
    }
    lines.push("", "可用 action（" + meta.actions.length + "）：");
    for (const a of meta.actions) lines.push("  " + a.name + (a.description ? " — " + a.description : ""));
    lines.push("", '字段细节：Workbench({ action: "actions.help", args: { action: "<name>" } })');
    if (meta.warnings.length) {
      lines.push("", "⚠ 校验提示：");
      for (const w of meta.warnings) lines.push("  - " + w);
    }
    return lines.join("\n");
  }
return { capabilityListMeta, renderCapabilityList, capabilityGetMeta, renderCapability };
}
