# Browser acceptance interim results — 2026-11-09 15:33

Scope changed: user now requires display-only description/reflection areas; all source editing belongs in unified task editor. Prior area-edit checks are superseded. Await new build. No source edits. Protected ports50120/3080 and desktop profile.

Environment: profile body-markdown-data-index-20261109, WB_HOME=/tmp/dsh-body-markdown-data-index-20261109/workbench, port50963. Five full packages reinstalled after 15:20 void-node fix, install job bash-f59ce771864e4a5e completed exit0; runtime job bash-acc92a9e7b2e437b. At 15:33 job_list=[] browser=about:blank, lsof port50963 exit1(no listener). Runtime reset removed job; cannot claim explicit kill/collect.

PASS after void fix: original Markdown sample containing hard newline and horizontal rule stable in real React; DOM659 br and2 hr across fixtures, console empty. Before fix actual React #137 args[]=br crashed main; react-crash.json records error/stack.

PASS syntax on both task fields: h1-h6, paragraph+br, strong/em/inlinecode, nested ul/ol, blockquote,hr,pre/code. Code keeps literal ** and script text. Safe https/mailto links have target=_blank rel=noopener noreferrer nofollow. javascript/data remain plain text; raw script/img escaped, rendered roots contain no script/img. Unsupported image and unclosed markers stay literal. Full DOM saved markdown-dom.json (includes large sample).

PASS mode: toolbar T changes both fields, removes all wb-markdown roots, server tasks.configGet ui.bodyMode=text, localStorage wb.bodyMode=text, M=false/T=true. Plain style ui-monospace,SFMono-Regular,Menlo,monospace and white-space:pre-wrap. Config dropdown with 900ms delayed configSet and two immediate change events sends only first markdown save; select/server/local all markdown after settlement. Toolbar injected nonforwarded HTTP500 changes local to text while server remains markdown and immediately displays 已在当前浏览器切换，配置保存失败： Injected mode save failure. Fetch restored.

PASS labels: actual span.wb-body-label Chinese 描述/感受, computed11px weight600 letterspacing0.66px radius4px padding1px4px; ::before content none. Description color35,71,131 bg color(srgb .948549 .959843 .987137); Reflection21,77,67 bg(.924706 .925333 .926588). Theme contrast/English still pending. Storage records have2 real Description labels and2 markdown roots following current markdown preference; no independent storage M/T control.

PASS indexes: tasks left3 real tables task/task_dep/task_node; tags2 tag/tag_mapping; sites5 site/site_node/site_node_mapping/site_account/site_account_external; storage1 storage. Each right side Row/Index tabs with current table. task11 indexes incl10explicit and PK; idx_task_open ordered status,target_date; task_dep4 incl unique uk_task_dep ordered task_id,depends_on_id one row; tag4/site4/storage3. Header row/column/index counts correspond. Exact evidence task-index-fixed.json,task-dep-index-fixed.json,tags-index-verified.txt,sites-index.txt,storage-index.txt.

Screenshot validity: /Users/yyq/Downloads/body-task-dep-index-fixed.png read_image confirms actual task_dep index page. body-task-index-fixed.png actually task records/20KB view; body-task-index-verified.png is duplicate dep index; body-storage-markdown.png actually dashboard. Screenshot tool returns old frames; never count mislabeled images as evidence.

Pending on new final build: display-only no local/doubleclick editor + unified editor raw source; final hashes/import/caps; mode refresh/restart/cross-tab/storage text follow; English+dark/light contrast; search-highlight leaves; valid task index and useful visual captures; performance observation not cache claim; final report and cleanup. Long index/PK-only-empty fixture not yet exercised.
