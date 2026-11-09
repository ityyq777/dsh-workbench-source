// React IDs survive rerenders and avoid collisions across repeated record views.
var nextId = 0;
module.exports = function useBodyId(React) {
  return typeof React.useId === "function" ? React.useId() : React.useState("wb-body-" + (++nextId))[0];
};
