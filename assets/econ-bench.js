/* econ-bench.js - the elasticity bench UI. Renders into #econ-bench on deep-dive session 10.
 * Every number shown is computed by econ-live.js on the real Olist panel at the moment the
 * control changes; nothing is stored. Reads window.ECON (econ-live.js) and window.ECON_PANEL. */
(function () {
  "use strict";
  var rootEl, P, L, state, els = {};

  var RUNGS = [
    { id: "cross",  name: "1 · Across products", note: "One dot per product: its mean price against its total units. The slope everybody computes first.",
      kind: "measured" },
    { id: "pooled", name: "2 · Pooled rows", note: "All 2,216 product-months in one cloud, no controls. Looks like a small elasticity.", kind: "measured" },
    { id: "fe",     name: "3 · Each product with itself", note: "Product fixed effects: subtract each product's own mean price and mean units, then fit.", kind: "measured" },
    { id: "twoway", name: "4 · Product and month", note: "Also subtract each month's mean, so the marketplace growing is taken out too.", kind: "measured" },
    { id: "anti",   name: "Use the market-wide number", anti: true,
      note: "The anti-lever. Take rung 2's slope, the one from all rows with no controls, and price on it. Watch the revenue line.", kind: "measured" }
  ];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function f3(x) { return (x >= 0 ? "+" : "") + x.toFixed(3); }
  function f2(x) { return (x >= 0 ? "+" : "") + x.toFixed(2); }
  function pct(x) { return (x >= 0 ? "+" : "") + x.toFixed(1) + "%"; }

  function opts() {
    return { minUnits: state.min2 ? 2 : 0, freight: state.freight, cat: state.cat === "all" ? null : parseInt(state.cat, 10), skipPlacebo: true };
  }

  function currentFit(lad) {
    switch (state.rung) {
      case "cross": return lad.cross;
      case "pooled": return lad.pooled;
      case "fe": return state.weighted ? lad.feWeighted : lad.feProduct;
      case "twoway": return lad.feTwoway;
      case "anti": return lad.pooled;
    }
    return lad.feProduct;
  }

  function verdict(fit, lad, pl) {
    var b = fit.b, within = lad.feProduct.b;
    if (state.broken) return { cls: "is-bad", text: "Prices shuffled within every product: slope " + f3(b) + ". No signal left, which is what a real signal must lose when its cause is removed." };
    if (state.rung === "cross") return { cls: "is-ok", text: "Slope " + f3(b) + " across products. Cheap products are not popular products. Price says nothing here." };
    if (state.rung === "pooled") return { cls: "is-ok", text: "Slope " + f3(b) + " pooled. A number that looks like a small elasticity and is not one." };
    if (state.rung === "anti") return { cls: "is-bad", text: "Pricing on " + f3(b) + ". The within-product fit on the same rows says " + f3(within) + ". Same rows, opposite sign for the decision." };
    var sds = pl ? Math.abs(b) / pl.sd : null;
    return { cls: "is-good", text: "Slope " + f3(b) + ", each product compared with itself" + (state.rung === "twoway" ? " and with its month" : "") +
      (sds ? ". That is " + sds.toFixed(0) + " placebo standard deviations from zero." : ".") };
  }

  function render() {
    var lad, fit, pl = state.placebo;
    if (state.broken) {
      var R = L.rows(P, opts());
      var sh = state.brokenLp;
      fit = L.slope(L.demean(sh, R.prod, R.nProd), L.demean(R.lq, R.prod, R.nProd));
      lad = state.lad;
    } else {
      lad = L.ladder(P, opts());
      state.lad = lad;
      fit = currentFit(lad);
    }
    var v = verdict(fit, lad, pl);
    els.verdict.className = "mb-verdict " + v.cls;
    els.verdict.textContent = v.text;

    var rev = L.revenue(fit.b, state.pct);
    var revWithin = L.revenue(lad.feProduct.b, state.pct);
    setMetric("slope", f3(fit.b), "log units on log price", "measured");
    setMetric("se", fit.se.toFixed(3), "naive standard error", "measured");
    setMetric("rows", lad.rows.toLocaleString() + " rows", lad.products + " products in the panel", "measured");
    setMetric("placebo", pl ? pl.sd.toFixed(3) : "...", pl ? "placebo sd, " + pl.draws + " within-product shuffles" : "computing", "measured");
    setMetric("units", pct(rev.units), "units, if every price moves " + pct(state.pct), "heuristic");
    setMetric("revenue", pct(rev.revenue), "revenue, constant elasticity " + f2(fit.b), "heuristic");
    els.compare.textContent = state.rung === "anti" || state.rung === "pooled" || state.rung === "cross"
      ? "Under the within-product slope (" + f2(lad.feProduct.b) + ") the same price move gives revenue " + pct(revWithin.revenue) + "."
      : "Under the pooled slope (" + f2(lad.pooled.b) + ") the same price move would read revenue " + pct(L.revenue(lad.pooled.b, state.pct).revenue) + ". That is the number a first analysis reports.";
    drawStage(fit, lad);
  }

  function setMetric(id, value, label, kind) {
    var m = els.metrics[id];
    m.value.textContent = value; m.label.textContent = label;
    m.kind.textContent = kind === "measured" ? "computed" : "modelled";
    m.kind.className = "mb-mkind " + (kind === "measured" ? "is-measured" : "is-heuristic");
  }

  /* the stage: the cloud the current rung fits, and its line */
  function drawStage(fit, lad) {
    var R = L.rows(P, opts()), xs = [], ys = [], i;
    if (state.rung === "cross") {
      var u = new Array(R.nProd), ps = new Array(R.nProd), c = new Array(R.nProd);
      for (i = 0; i < R.nProd; i++) { u[i] = 0; ps[i] = 0; c[i] = 0; }
      for (i = 0; i < R.lp.length; i++) { u[R.prod[i]] += R.units[i]; ps[R.prod[i]] += Math.exp(R.lp[i]); c[R.prod[i]] += 1; }
      for (i = 0; i < R.nProd; i++) if (c[i] > 0) { xs.push(Math.log(ps[i] / c[i])); ys.push(Math.log(u[i])); }
    } else if (state.rung === "pooled" || state.rung === "anti") {
      xs = R.lp; ys = R.lq;
    } else if (state.rung === "twoway") {
      xs = L.twoway(R.lp, R.prod, R.nProd, R.mon, R.nMon); ys = L.twoway(R.lq, R.prod, R.nProd, R.mon, R.nMon);
    } else {
      xs = L.demean(state.broken ? state.brokenLp : R.lp, R.prod, R.nProd); ys = L.demean(R.lq, R.prod, R.nProd);
    }
    var W = 880, H = 300, padL = 60, padR = 20, padT = 24, padB = 44;
    var xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    for (i = 0; i < xs.length; i++) { if (xs[i] < xmin) xmin = xs[i]; if (xs[i] > xmax) xmax = xs[i]; if (ys[i] < ymin) ymin = ys[i]; if (ys[i] > ymax) ymax = ys[i]; }
    var sx = function (x) { return padL + (x - xmin) / (xmax - xmin) * (W - padL - padR); };
    var sy = function (y) { return H - padB - (y - ymin) / (ymax - ymin) * (H - padT - padB); };
    var xm = 0, ym = 0; for (i = 0; i < xs.length; i++) { xm += xs[i]; ym += ys[i]; } xm /= xs.length; ym /= ys.length;
    var x0 = xmin, x1 = xmax, y0 = ym + fit.b * (x0 - xm), y1 = ym + fit.b * (x1 - xm);
    var demeaned = state.rung === "fe" || state.rung === "twoway";
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Scatter of the rows the current rung fits, with the fitted line. Slope ' + fit.b.toFixed(3) + '.">';
    s += '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="#C9D2E2" stroke-width="1.5"/>';
    s += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (H - padB) + '" stroke="#C9D2E2" stroke-width="1.5"/>';
    if (demeaned) {
      s += '<line x1="' + sx(0) + '" y1="' + padT + '" x2="' + sx(0) + '" y2="' + (H - padB) + '" stroke="#DCE3EE" stroke-dasharray="4 4"/>';
      s += '<line x1="' + padL + '" y1="' + sy(0) + '" x2="' + (W - padR) + '" y2="' + sy(0) + '" stroke="#DCE3EE" stroke-dasharray="4 4"/>';
    }
    for (i = 0; i < xs.length; i++) s += '<circle cx="' + sx(xs[i]).toFixed(1) + '" cy="' + sy(ys[i]).toFixed(1) + '" r="2.4" fill="#1F3A5F" fill-opacity="0.35"/>';
    s += '<line x1="' + sx(x0) + '" y1="' + sy(y0) + '" x2="' + sx(x1) + '" y2="' + sy(y1) + '" stroke="' + (state.broken || state.rung === "anti" ? "#991B1B" : "#A8570B") + '" stroke-width="3" stroke-linecap="round"/>';
    s += '<text x="' + (W - padR) + '" y="' + (H - 14) + '" text-anchor="end" class="mb-lab" fill="#4E5A75">' + (demeaned ? "log price, minus the product's own mean" : "log price") + '</text>';
    s += '<text x="' + (padL + 6) + '" y="' + (padT + 4) + '" class="mb-lab" fill="#4E5A75">' + (demeaned ? "log units, minus the product's own mean" : "log units") + '</text>';
    s += '<text x="' + (padL + 6) + '" y="' + (H - padB - 10) + '" class="mb-lab" fill="' + (state.broken || state.rung === "anti" ? "#991B1B" : "#8A4409") + '" font-weight="800">slope ' + f3(fit.b) + ' · ' + xs.length.toLocaleString() + ' dots</text>';
    s += "</svg>";
    els.stage.innerHTML = s;
  }

  function breakIt() {
    if (state.broken) { state.broken = false; els.breakBtn.textContent = "Break it: shuffle prices within every product"; render(); return; }
    var R = L.rows(P, opts());
    var pl = L.placebo(R, 1, Math.floor(Math.random() * 1e9));
    state.brokenLp = pl.last; state.broken = true; state.rung = "fe"; syncRungs();
    els.breakBtn.textContent = "Put the prices back";
    render();
  }

  function syncRungs() {
    els.rungInputs.forEach(function (inp) { inp.checked = inp.value === state.rung; inp.parentNode.classList.toggle("is-on", inp.checked); });
  }

  function build() {
    rootEl.innerHTML = "";
    var wrap = el("div", "mb-wrap");
    wrap.appendChild(el("h4", null, "The elasticity ladder, on 203 real products"));
    wrap.appendChild(el("p", "mb-intro", "Pick a rung. The bench refits the same 2,216 product-month rows from the public Olist dataset and draws what it fitted. Then move every price and read what each slope predicts for revenue."));

    var presets = el("div", "mb-presets"); els.rungInputs = [];
    RUNGS.forEach(function (r) {
      var lab = el("label", "mb-preset" + (r.anti ? " is-anti" : ""));
      var inp = document.createElement("input"); inp.type = "radio"; inp.name = "econ-rung"; inp.value = r.id;
      lab.appendChild(inp);
      var name = el("span", "mb-pname", r.name); lab.appendChild(name);
      if (r.anti) name.appendChild(el("em", "mb-anti", " · anti-lever"));
      lab.appendChild(el("span", "mb-pnote", r.note));
      inp.addEventListener("change", function () { state.rung = r.id; state.broken = false; els.breakBtn.textContent = "Break it: shuffle prices within every product"; syncRungs(); render(); });
      presets.appendChild(lab); els.rungInputs.push(inp);
    });
    wrap.appendChild(presets);

    var ctls = el("div", "mb-ctls");
    function check(id, text, key) {
      var lab = el("label", "mb-ctl"); var inp = document.createElement("input"); inp.type = "checkbox"; inp.id = id;
      inp.addEventListener("change", function () { state[key] = inp.checked; state.placebo = null; render(); computePlacebo(); });
      lab.appendChild(inp); lab.appendChild(document.createTextNode(" " + text)); ctls.appendChild(lab); return inp;
    }
    check("eb-weighted", "Weight months by units (rung 3)", "weighted");
    check("eb-freight", "Price includes freight", "freight");
    check("eb-min2", "Drop single-unit months", "min2");
    var sel = document.createElement("select"); sel.id = "eb-cat";
    var o = document.createElement("option"); o.value = "all"; o.textContent = "All 203 products"; sel.appendChild(o);
    P.cats.forEach(function (c, i) {
      var n = 0; for (var k = 0; k < P.prodCat.length; k++) if (P.prodCat[k] === i) n++;
      if (n >= 10) { var op = document.createElement("option"); op.value = String(i); op.textContent = c.replace(/_/g, " ") + " (" + n + ")"; sel.appendChild(op); }
    });
    sel.addEventListener("change", function () { state.cat = sel.value; state.placebo = null; render(); computePlacebo(); });
    var selLab = el("label", "mb-ctl", "Category "); selLab.appendChild(sel); ctls.appendChild(selLab);
    wrap.appendChild(ctls);

    var slider = el("div", "mb-ctls");
    var sl = el("label", "mb-ctl mb-range", "Move every price by "); var out = el("b", null, "+10%");
    var rng = document.createElement("input"); rng.type = "range"; rng.min = "-20"; rng.max = "20"; rng.step = "1"; rng.value = "10";
    rng.addEventListener("input", function () { state.pct = parseInt(rng.value, 10); out.textContent = pct(state.pct); render(); });
    sl.appendChild(rng); sl.appendChild(out); slider.appendChild(sl);
    els.breakBtn = el("button", "mb-break", "Break it: shuffle prices within every product"); els.breakBtn.type = "button";
    els.breakBtn.addEventListener("click", breakIt); slider.appendChild(els.breakBtn);
    wrap.appendChild(slider);

    els.verdict = el("div", "mb-verdict is-ok", ""); wrap.appendChild(els.verdict);

    var metrics = el("div", "mb-metrics"); els.metrics = {};
    ["slope", "se", "rows", "placebo", "units", "revenue"].forEach(function (id) {
      var m = el("div", "mb-metric"); var label = el("span", "mb-mlabel", ""); var value = el("span", "mb-mvalue", ""); var kind = el("span", "mb-mkind", "");
      m.appendChild(value); m.appendChild(label); m.appendChild(kind); metrics.appendChild(m);
      els.metrics[id] = { value: value, label: label, kind: kind };
    });
    wrap.appendChild(metrics);
    els.compare = el("p", "mb-hint", ""); wrap.appendChild(els.compare);
    els.stage = el("div", "mb-stage"); wrap.appendChild(els.stage);
    rootEl.appendChild(wrap);
  }

  function computePlacebo() {
    setTimeout(function () {
      var R = L.rows(P, opts());
      state.placebo = L.placebo(R, 200, 20180901);
      render();
    }, 30);
  }

  function init() {
    rootEl = document.getElementById("econ-bench");
    if (!rootEl || !window.ECON || !window.ECON_PANEL) return;
    P = window.ECON_PANEL; L = window.ECON;
    state = { rung: "fe", weighted: false, freight: false, min2: false, cat: "all", pct: 10, broken: false, placebo: null };
    build(); syncRungs(); render(); computePlacebo();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
