var React = require("react"), lucide = require("lucide-react");
var ICONS = { box: lucide.Box, plus: lucide.Plus, search: lucide.Search, refresh: lucide.RefreshCw,
  pencil: lucide.Pencil, trash: lucide.Trash2, sort: lucide.ArrowUpDown, image: lucide.Image,
  clock: lucide.Clock, tag: lucide.Tag, stock: lucide.Package, chart: lucide.ChartColumn,
  list: lucide.List, settings: lucide.Settings, database: lucide.Database, download: lucide.Download,
  empty: lucide.PackageOpen, brand: lucide.Factory, unit: lucide.Ruler, check: lucide.CheckSquare,
  close: lucide.X, table: lucide.Table, reset: lucide.RotateCcw };
function Icon(props) {
  var size = props.name === "empty" && props.size === 48 ? 48 : [11,14,16].includes(props.size) ? props.size : 14;
  return React.createElement(ICONS[props.name] || ICONS.box, { size: size, strokeWidth: 2,
    "aria-hidden": true, focusable: false, className: "wbi-svg" });
}
module.exports = { ICONS: ICONS, Icon: Icon };
