# Task ownership real-profile verification — 2026-11-09

Scope: real DSH browser + full installed backend, isolated profile task-ownership-20261109, WB_HOME=/tmp/dsh-task-ownership-20261109/workbench, port55931. No source edits, commits, main50120/3080 or desktop DB operations.

## Results
- PASS ordinary/restart/timeline creation target initially empty and create disabled. Source context is suggestion only. Options include full paths and descriptions; two 共享名称 tables distinguishable by parent path; only tables offered.
- PASS missing node responsibilities/confirmation disable submit. Fully filled new-path draft cancelled: tasks.capabilities total tables4 before/after; no new path.
- PASS middle-table path 归属验收甲/共享名称/非法子表 shows type conflict, disables submit, keeps title/body.
- PASS one injected browser fetch HTTP500 for tasks.create (not forwarded) keeps all task text/path/descriptions and table count4. This tests frontend failure handling, not backend transaction rollback.
- PASS retry of same draft creates exactly one observed successful task event, 2 createdNodes (group/table), responsibilities match. Task01a1bf0f-7d61-73eb-93e5-676ace626d52 belongs 新建职责组/新建职责表; body重要正文必须保留.
- PASS delaying capabilities preflight2s: Escape, close× and cancel cannot dismiss; buttons×/取消/… disabled. Successful result closes dialog.
- PASS correction editor changes source task01a1bf07-3c6e-739d-b3eb-172ba3b85c46 from甲/共享名称 to甲/纠正目标; title/body/review/P7/status/dates/restartKey/timelineKey remain unchanged by API readback.
- PASS selected乙/共享名称 deleted through actual isolated backend before submit: target reset empty, submit disabled, body intact; TABLE_NOT_FOUND plus nextActions rendered. No first-table fallback.
- PASS final tasks full reinstall, import, restart and actual task page load. Persisted created/corrected tasks retain paths. Final console empty.

## Final install evidence
Full packages were installed from source build directories, not a separate staging tree:
/Users/yyq/code/dsh-workbench/packages/shell-dist
/Users/yyq/code/dsh-workbench/packages/addons/{tasks,tags,sites,storage}
Command pattern: dsh plugin --profile task-ownership-20261109 add file:/Users/yyq/code/dsh-workbench/packages/addons/tasks --force
Final tasks install at14:49 exits0; source=installed hashes:
- lib/sync.js 4b72613c7f162d5888c0cf213cedbb66cc497a2b22c9df3a8336cc7bdff78b3a
- lib/client.js 3bfc986a0f4195cde863327fa26a23bf790ced5b387f91f83991788484adfa80
- package.json 8b5044d39eb8f19bb6edd55a06d5079115eeed1609b02981222b158d926a5948
Capabilities host0.6.0/tasks3.0.0(45)/tags1.6.8(17)/sites1.9.1(40)/storage1.3.2(16), every warnings[]/missingRequires[].

## Evidence and limitations
ui-final-results.json contains browser DOM observations and real action readback; final-capabilities.json contains final runtime capability list. path-conflict.png and correction-editor.png were visually inspected. Browser screenshot tool returned earlier frames, so images are named by actual content and do not claim to depict later injected500/invalid-target states; those have DOM/API evidence.
Not verified here: full successful restart/time-line chain creation (only target gating), mobile viewport, old-bundle upgrade notice, independent live-tree-refresh target clearing (submit preflight deletion tested), backend rollback/concurrency/sync semantics (parent testing), production/profile migration.

## Parent-reported desktop installation
Parent reported at14:52: desktop five-package full installation completed from fresh staging /Users/yyq/.dsh/workbench/local-packages/ownership-3.0.0-final; each CLI install exited0,93 runtime files source/profile byte-identical, all five entry imports PASS. Main instance was not restarted. Feature commit462cb7b pushed. These desktop facts were reported by parent, not independently executed or inspected by this verification agent.

## Cleanup
Managed jobs bash-f2754eeccc964524, bash-c24a130936464b23 and final bash-213a84c9e9124ffa killed and outputs collected. Own browser tab closed. Temporary profile and isolated DB retained as reproducible evidence.
