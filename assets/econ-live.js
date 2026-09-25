/* econ-live.js - the elasticity ladder, computed in the browser on the real Olist panel.
 *
 * Reads window.ECON_PANEL (assets/econ-sample.js): 2,216 real product-month rows for 203
 * products. Every number the bench shows is computed here from those rows, nothing is stored.
 * Node check (must agree with materials/build-olist-elasticity.py to three decimals on the
 * deterministic rungs; the placebo is a distribution and agrees to about two):
 *   node -e 'global.window={};require("./econ-sample.js");const L=require("./econ-live.js");
 *            console.log(JSON.stringify(L.ladder(window.ECON_PANEL),null,1))'
 */
(function (root) {
  "use strict";

  /* ---------- small numeric kit ---------- */
  function slope(x, y, w) {
    var n = x.length, i, sw = 0, xm = 0, ym = 0;
    if (!w) { w = new Array(n); for (i = 0; i < n; i++) w[i] = 1; }
    for (i = 0; i < n; i++) { sw += w[i]; xm += w[i] * x[i]; ym += w[i] * y[i]; }
    xm /= sw; ym /= sw;
    var sxx = 0, sxy = 0;
    for (i = 0; i < n; i++) { sxx += w[i] * (x[i] - xm) * (x[i] - xm); sxy += w[i] * (x[i] - xm) * (y[i] - ym); }
    var b = sxy / sxx, rss = 0;
    for (i = 0; i < n; i++) { var r = y[i] - ym - b * (x[i] - xm); rss += w[i] * r * r; }
    return { b: b, se: Math.sqrt(rss / (n - 2) / sxx), n: n };
  }

  function demean(v, g, ng) {
    var sum = new Array(ng), cnt = new Array(ng), i;
    for (i = 0; i < ng; i++) { sum[i] = 0; cnt[i] = 0; }
    for (i = 0; i < v.length; i++) { sum[g[i]] += v[i]; cnt[g[i]] += 1; }
    var out = new Array(v.length);
    for (i = 0; i < v.length; i++) out[i] = v[i] - sum[g[i]] / cnt[g[i]];
    return out;
  }

  function twoway(v, g1, n1, g2, n2, iters) {
    var out = v.slice(), k;
    for (k = 0; k < (iters || 50); k++) { out = demean(out, g1, n1); out = demean(out, g2, n2); }
    return out;
  }

  /* mulberry32: a seeded generator so the placebo is the same on every load */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- the panel as arrays ---------- */
  function rows(P, opt) {
    opt = opt || {};
    var i, keep = [], lp = [], lq = [], prod = [], mon = [], units = [], cat = [];
    for (i = 0; i < P.units.length; i++) {
      if (opt.minUnits && P.units[i] < opt.minUnits) continue;
      if (opt.cat !== undefined && opt.cat !== null && P.prodCat[P.p[i]] !== opt.cat) continue;
      var price = P.pc[i] / 100 + (opt.freight ? P.fc[i] / 100 : 0);
      keep.push(i);
      lp.push(Math.log(price)); lq.push(Math.log(P.units[i]));
      prod.push(P.p[i]); mon.push(P.m[i]); units.push(P.units[i]); cat.push(P.prodCat[P.p[i]]);
    }
    return { idx: keep, lp: lp, lq: lq, prod: prod, mon: mon, units: units, cat: cat,
             nProd: P.prodId.length, nMon: P.months.length };
  }

  /* ---------- the ladder ---------- */
  function crossSection(R) {
    var i, u = new Array(R.nProd), ps = new Array(R.nProd), c = new Array(R.nProd);
    for (i = 0; i < R.nProd; i++) { u[i] = 0; ps[i] = 0; c[i] = 0; }
    for (i = 0; i < R.lp.length; i++) { u[R.prod[i]] += R.units[i]; ps[R.prod[i]] += Math.exp(R.lp[i]); c[R.prod[i]] += 1; }
    var x = [], y = [];
    for (i = 0; i < R.nProd; i++) if (c[i] > 0) { x.push(Math.log(ps[i] / c[i])); y.push(Math.log(u[i])); }
    return slope(x, y);
  }

  function pooled(R) { return slope(R.lp, R.lq); }

  function feProduct(R, weighted) {
    return slope(demean(R.lp, R.prod, R.nProd), demean(R.lq, R.prod, R.nProd), weighted ? R.units : null);
  }

  function feTwoway(R) {
    return slope(twoway(R.lp, R.prod, R.nProd, R.mon, R.nMon), twoway(R.lq, R.prod, R.nProd, R.mon, R.nMon));
  }

  /* shuffle log price WITHIN each product, refit the product-FE slope; repeat */
  function placebo(R, draws, seed) {
    draws = draws || 200;
    var rand = rng(seed || 20180901);
    var byProd = [], i, j;
    for (i = 0; i < R.nProd; i++) byProd.push([]);
    for (i = 0; i < R.lp.length; i++) byProd[R.prod[i]].push(i);
    var lqd = demean(R.lq, R.prod, R.nProd), bs = [];
    for (j = 0; j < draws; j++) {
      var sh = R.lp.slice();
      for (i = 0; i < R.nProd; i++) {
        var ix = byProd[i], k;
        for (k = ix.length - 1; k > 0; k--) {
          var r = Math.floor(rand() * (k + 1)), t = sh[ix[k]]; sh[ix[k]] = sh[ix[r]]; sh[ix[r]] = t;
        }
      }
      bs.push(slope(demean(sh, R.prod, R.nProd), lqd).b);
    }
    var m = 0, s = 0, mx = 0;
    for (i = 0; i < bs.length; i++) m += bs[i];
    m /= bs.length;
    for (i = 0; i < bs.length; i++) { s += (bs[i] - m) * (bs[i] - m); if (Math.abs(bs[i]) > mx) mx = Math.abs(bs[i]); }
    return { mean: m, sd: Math.sqrt(s / bs.length), max: mx, draws: bs.length, last: sh };
  }

  function perProduct(P) {
    var R = rows(P), out = [], i, byProd = [];
    for (i = 0; i < R.nProd; i++) byProd.push([]);
    for (i = 0; i < R.lp.length; i++) byProd[R.prod[i]].push(i);
    for (i = 0; i < R.nProd; i++) {
      var ix = byProd[i], x = [], y = [], u = 0, k;
      for (k = 0; k < ix.length; k++) { x.push(R.lp[ix[k]]); y.push(R.lq[ix[k]]); u += R.units[ix[k]]; }
      var sd = 0, xm = 0;
      for (k = 0; k < x.length; k++) xm += x[k];
      xm /= x.length;
      for (k = 0; k < x.length; k++) sd += (x[k] - xm) * (x[k] - xm);
      if (sd < 1e-12 || x.length < 3) continue;
      var f = slope(x, y);
      out.push({ i: i, id: P.prodId[i], cat: P.cats[P.prodCat[i]], months: x.length, units: u, b: f.b, se: f.se });
    }
    return out;
  }

  /* constant-elasticity arithmetic: a price change of pct under elasticity b */
  function revenue(b, pct) {
    var f = 1 + pct / 100;
    return { units: (Math.pow(f, b) - 1) * 100, revenue: (Math.pow(f, 1 + b) - 1) * 100 };
  }

  function ladder(P, opt) {
    var R = rows(P, opt);
    var out = {
      rows: R.lp.length,
      products: R.nProd,
      cross: crossSection(R),
      pooled: pooled(R),
      feProduct: feProduct(R, false),
      feTwoway: feTwoway(R),
      feWeighted: feProduct(R, true)
    };
    if (!opt || !opt.skipPlacebo) out.placebo = placebo(R, (opt && opt.draws) || 200);
    return out;
  }

  function summary(P) {
    var pp = perProduct(P), i, neg = 0, below = 0, noisy = 0, bs = [];
    for (i = 0; i < pp.length; i++) { bs.push(pp[i].b); if (pp[i].b < 0) neg++; if (pp[i].b < -1) below++; if (Math.abs(pp[i].b) > 5) noisy++; }
    bs.sort(function (a, b) { return a - b; });
    return { n: pp.length, median: bs[Math.floor(bs.length / 2)], negShare: neg / pp.length,
             belowMinus1Share: below / pp.length, noisyShare: noisy / pp.length, products: pp };
  }

  var api = { slope: slope, demean: demean, twoway: twoway, rows: rows, crossSection: crossSection,
              pooled: pooled, feProduct: feProduct, feTwoway: feTwoway, placebo: placebo,
              perProduct: perProduct, revenue: revenue, ladder: ladder, summary: summary, rng: rng };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.ECON = api;
})(typeof window !== "undefined" ? window : this);
