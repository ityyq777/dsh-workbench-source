/**
 * 桌面弹幕渲染：只负责把宿主发来的 play 消息变成一条横向飞过的胶囊。
 * 排队、泳道、节奏都在宿主调度器里定，这里不做任何业务判断。
 */

"use strict";

(function () {
  var stage = document.getElementById("stage");
  var cfg = { lanes: 6, band: "upper", fontSize: 16, speed: 90, opacity: 0.92, motion: "auto" };
  var ready = false;

  function px(value) {
    return Math.round(value) + "px";
  }

  function applyTheme(theme) {
    if (!theme || typeof theme !== "object") return;
    var root = document.documentElement.style;
    if (theme.bg) root.setProperty("--dm-bg", theme.bg);
    if (theme.fg) root.setProperty("--dm-fg", theme.fg);
    if (theme.border) root.setProperty("--dm-border", theme.border);
    if (theme.accent) root.setProperty("--dm-accent", theme.accent);
    if (theme.ok) root.setProperty("--dm-ok", theme.ok);
    if (theme.warn) root.setProperty("--dm-warn", theme.warn);
    if (theme.danger) root.setProperty("--dm-danger", theme.danger);
    root.setProperty("--dm-scheme", theme.dark ? "dark" : "light");
  }

  function bandRect() {
    var height = window.innerHeight;
    if (cfg.band === "top") return { top: height * 0.03, height: height * 0.22 };
    if (cfg.band === "full") return { top: height * 0.06, height: height * 0.88 };
    return { top: height * 0.08, height: height * 0.42 };
  }

  function laneTop(lane) {
    var band = bandRect();
    var lanes = Math.max(1, Number(cfg.lanes) || 1);
    var laneHeight = band.height / lanes;
    return band.top + (Math.max(0, Number(lane) || 0) % lanes) * laneHeight;
  }

  function reduceMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
      return false;
    }
  }

  function removeChip(chip) {
    if (chip && chip.parentNode) chip.parentNode.removeChild(chip);
  }

  function spawnStatic(chip, width) {
    var viewWidth = window.innerWidth;
    var left = Math.max(24, viewWidth / 2 - width / 2);
    chip.style.left = px(left);
    chip.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: Number(chip.dataset.opacity) || cfg.opacity, transform: "translateY(0)" },
      ],
      { duration: 220, fill: "forwards", easing: "ease-out" },
    );
    var hold = setTimeout(function () {
      var anim = chip.animate(
        [{ opacity: chip.style.opacity || cfg.opacity }, { opacity: 0 }],
        { duration: 420, fill: "forwards", easing: "ease-in" },
      );
      anim.onfinish = function () {
        removeChip(chip);
      };
    }, 3200);
    chip.addEventListener("remove", function () {
      clearTimeout(hold);
    });
  }

  function spawn(message) {
    if (!message || message.type !== "play" || !message.body) return;
    var late = Date.now() - (Number(message.at) || 0);
    if (!message.preview && late > 2000) return;
    var chip = document.createElement("div");
    chip.className = "dm-chip tone-" + String(message.tone || "normal");
    chip.textContent = String(message.body).slice(0, 200);
    chip.dataset.opacity = String(message.opacity || cfg.opacity);
    chip.style.top = px(laneTop(message.lane));
    chip.style.fontSize = px(message.fontSize || cfg.fontSize);
    chip.style.opacity = chip.dataset.opacity;
    stage.appendChild(chip);
    var width = Math.ceil(chip.getBoundingClientRect().width) || 220;
    var staticMode = cfg.motion === "static" || reduceMotion();
    if (staticMode) {
      spawnStatic(chip, width);
      return;
    }
    var viewWidth = window.innerWidth;
    var speed = Math.max(20, Number(message.speed) || cfg.speed);
    var duration = ((viewWidth + width) / speed) * 1000;
    chip.style.left = "0";
    chip.style.transform = "translateX(" + viewWidth + "px)";
    var anim = chip.animate(
      [
        { transform: "translateX(" + viewWidth + "px)" },
        { transform: "translateX(" + -width + "px)" },
      ],
      { duration: duration, easing: "linear", fill: "forwards" },
    );
    anim.onfinish = function () {
      removeChip(chip);
    };
    anim.oncancel = function () {
      removeChip(chip);
    };
  }

  function applyInit(payload) {
    if (!payload) return;
    if (payload.config) cfg = Object.assign({}, cfg, payload.config);
    if (payload.theme) applyTheme(payload.theme);
    ready = true;
  }

  window.dm.onInit(applyInit);
  window.dm.onTheme(applyTheme);
  window.dm.onPlay(spawn);
  window.dm.onState(function (state) {
    if (state && state.paused) document.body.classList.add("dm-paused");
    else document.body.classList.remove("dm-paused");
  });

  window.addEventListener("resize", function () {
    if (!ready) return;
    // 已有弹幕按原动画继续，只让后续弹幕使用新的高度。
  });
})();
