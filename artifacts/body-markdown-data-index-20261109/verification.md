# Final real-profile browser acceptance — 2026-11-09 15:48

## Scope and installation
Final requirement: title/description/reflection displays are read-only; edit original values only in unified task panel. No source changes or commits in this delegation. Main instances50120/3080 and desktop database untouched.

Temporary profile body-markdown-data-index-20261109; isolated WB_HOME=/tmp/dsh-body-markdown-data-index-20261109/workbench; port50963. Fully reinstalled host/tasks/tags/sites/storage after final15:37build. Install job bash-d66e00c20fd14f08 completed exit0. All5entry imports succeeded; four business client hashes match source. unified-final-hashes.json records tasks3.1.0/tags1.6.9/sites1.9.2/storage1.4.0. Final tasks SHA2565670ce1a169b8aeef52eb64b625720f9383267ab7b55f391acd58c9bf5dc8387. unified-capabilities.json records actual loaded manifest. Earlier final-hashes.json predates void fix; do not use it as final identity.

## Passed
- Original blocking failure: React#137 args[]=br was captured before fix in react-crash.json. After void fix the real task view rendered659br/2hr across fixtures without main unmount; final console empty.
- Rich syntax: both task fields render h1-h6, hard-newline br, paragraphs,strong/em,inlinecode,nested ul/ol,blockquote,hr,pre/code. Escaped raw HTML and unsupported/unclosed syntax stay literal; no script/img injected; javascript/data links not anchors. https/mailto anchors target_blank rel=noopener noreferrer nofollow. markdown-dom.json records DOM.
- Final display-only behavior:14 title/body/label targets doubleclicked;0textareas and0wb-body-edit controls. Repeated after switching Cards with same counts. Task operation pencil opens unified editor. Both description/reflection textareas contain original headings,stars,backticks,newlines. No saving/mutation needed for this inspection.
- Toolbar M/T affects both fields; text mode uses monospace and pre-wrap; server ui.bodyMode and localStorage agree after successful save.
- Config race: injected900ms delay, two immediate dropdown changes → exactly1configSet request; final select/server/local all markdown. Earlier pre-unified build test; shared preference implementation unchanged in final build.
- Save failure: nonforwardedHTTP500 leaves local text usable, server remains markdown; toast captured verbatim: 已在当前浏览器切换，配置保存失败： Injected mode save failure. Fetch restored.
- Cross-tab/domain: source task M→destination storage2markdown roots; source T→destination storage0markdown/2plain roots. Full destination page refresh, reopen workbench+storage records→text persists with2plain roots.
- Search HighlightProbe-style test used HeadingProbe: literal source mode marks both fields; Markdown mode marks are children of H1, preserving structure. Search requires its search button; filling input alone is not submit.
- Bilingual labels: zh 描述/感受 and en Description/Reflection observed as actual span text, ::before none. English invoked via temporary documentElement.lang getter then host remount; getter deleted afterwards. Font11px/600/letterspacing.66px/radius4px/padding1px4px.
- Contrast measured from computed colors: description8.348:1; reflection light8.171:1, body[data-ds-dark-theme] test state9.624:1. Theme attribute restored. See label-themes.json; full app theme-menu switching not tested.
- Four-domain index views: task3real tables, tag2, site5,storage1 in left sidebar; Row/Index tabs on right. Task11indexes; dep4;tag4;site4;storage3. Unique uk_task_dep one row ordered task_id,depends_on_id; idx_task_open status,target_date. Type/source distinguish unique/ordinary/PK and explicit/automatic; row count belongs to table. Evidence task-index-fixed.json/task-dep-index-fixed.json/tags-index-verified.txt/sites-index.txt/storage-index.txt. These independent index checks used preceding15:20build; final15:37build changed task display editing.

## Verified screenshots
- task-dependency-index.png: real task_dep page, composite unique index and3other rows. Captured15:24on void-fixed build.
- storage-text-final.png: final15:37build storage records after text preference refresh, two descriptions and stock1~2.
Both read back visually. Browser screenshot API sometimes returned old frames; other Downloads files with index/storage names are NOT trusted evidence and were excluded.

## Not verified / limitations
- Did not create long-index-name, zero-index, or PK-only table fixtures; no mobile/top-level responsive pass this final cycle.
- Unified editor raw values inspected, but no final save/reopen round trip; title/body/label doubleclick targets counted together, not every possible descendant/link.
- No fresh browser profile preference migration/default absence test. Process restarted into final build, but no extra post-switch process restart; browser refresh/cross-tab tested.
- English used host language getter override, not application settings menu. Dark attribute exercised computed styles, not OS/browser color-scheme or full theme menu; no claim of exhaustive theme verification.
-20KB fixture rendered without crash, but no rigorous timing/cache instrumentation, click-through external-link navigation, or cache-hit claims.
- Did not retest every shared index case after final display-only build; exact prior UI evidence preserved.

## Cleanup
Final managed runtime bash-00074353287944cc explicitly job_kill then job_output collected status=killed, finished1794210479790. Both owned browser tabs closed. Earlier runtime bash-acc92a9e7b2e437b was removed by environment reset: job_list=[]/browserabout:blank/lsof50963exit1 observed; explicit kill/collect could not be claimed for that job. Temporary profile and isolated fixture DB retained for reproduction; no running test process intentionally retained.
