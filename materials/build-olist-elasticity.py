#!/usr/bin/env python3
"""Rebuild every Olist number quoted in learn-economics-with-phoebe, and the bench panel.

Internal build script. Not linked from any audience-facing page.

Usage
-----
  python3 materials/build-olist-elasticity.py <dir-with-olist-csvs> [--write-sample]

The directory must hold the Kaggle CSVs (Brazilian E-Commerce Public Dataset by Olist,
CC BY-NC-SA 4.0): olist_order_items_dataset.csv, olist_orders_dataset.csv,
olist_products_dataset.csv, product_category_name_translation.csv.

Decisions, stated once (deep-dive session 1 teaches all of them):
  rows        one order item = one unit sold at one price
  orders      delivered only, purchased before 2018-09-01 (the first day after the last
              complete month; the RFM course found the same ragged edge)
  price       the item price paid, excluding freight (a freight-inclusive variant is reported)
  panel       product x calendar month; units = items sold, price = mean item price that month
  eligible    products with >= 30 delivered items, >= 6 months with a sale, >= 3 distinct prices
  ladder      (1) cross-section across products within a category
              (2) pooled panel, no controls
              (3) product fixed effects (within-product)
              (4) product + month fixed effects (two-way)
              (5) placebo: prices shuffled within product, 200 draws
  all slopes  OLS of log units on log price; elasticity = the slope

--write-sample writes assets/econ-sample.js: the full eligible panel (every product-month row
for every eligible product), integer-coded, so the bench (assets/econ-live.js) recomputes the
whole ladder in the browser. The node check must agree with this script to three decimals
before any page quotes a bench number:

  cd assets && node -e 'global.window={};require("./econ-sample.js");
    const L=require("./econ-live.js");console.log(L.ladder(window.ECON_PANEL))'
"""
import json
import os
import sys

import numpy as np
import pandas as pd

SNAPSHOT = pd.Timestamp("2018-09-01")
MIN_ITEMS, MIN_MONTHS, MIN_PRICES = 30, 6, 3
SEED = 20180901
PLACEBO_DRAWS = 200


def slope(x, y, w=None):
    """OLS slope of y on x (optionally weighted) and its conventional standard error."""
    x = np.asarray(x, float); y = np.asarray(y, float)
    w = np.ones_like(x) if w is None else np.asarray(w, float)
    xm = np.average(x, weights=w); ym = np.average(y, weights=w)
    sxx = np.sum(w * (x - xm) ** 2); sxy = np.sum(w * (x - xm) * (y - ym))
    b = sxy / sxx
    resid = y - ym - b * (x - xm)
    n = len(x)
    se = np.sqrt(np.sum(w * resid ** 2) / (n - 2) / sxx)
    return b, se


def demean(df, col, by):
    return df[col] - df.groupby(by)[col].transform("mean")


def twoway_demean(df, col, a, b, iters=50):
    """Alternating projections: remove product means and month means until stable."""
    v = df[col].astype(float).copy()
    for _ in range(iters):
        v = v - v.groupby(df[a]).transform("mean")
        v = v - v.groupby(df[b]).transform("mean")
    return v


def build(d):
    it = pd.read_csv(os.path.join(d, "olist_order_items_dataset.csv"))
    o = pd.read_csv(os.path.join(d, "olist_orders_dataset.csv"), parse_dates=["order_purchase_timestamp"])
    pr = pd.read_csv(os.path.join(d, "olist_products_dataset.csv"))
    tr = pd.read_csv(os.path.join(d, "product_category_name_translation.csv"))
    x = it.merge(o[["order_id", "order_purchase_timestamp", "order_status"]], on="order_id")
    x = x[(x.order_status == "delivered") & (x.order_purchase_timestamp < SNAPSHOT)]
    x = x.merge(pr[["product_id", "product_category_name"]], on="product_id", how="left")
    x = x.merge(tr, on="product_category_name", how="left")
    x["cat"] = x.product_category_name_english.fillna("unknown")
    x["month"] = x.order_purchase_timestamp.dt.to_period("M")
    print(f"items {len(it)}  delivered before snapshot {len(x)}  products {x.product_id.nunique()}")
    return x


def eligible(x):
    g = x.groupby("product_id").agg(n=("order_id", "size"), np_=("price", "nunique"), months=("month", "nunique"),
                                   pmin=("price", "min"), pmax=("price", "max"), cat=("cat", "first"))
    e = g[(g.n >= MIN_ITEMS) & (g.months >= MIN_MONTHS) & (g.np_ >= MIN_PRICES)]
    print(f"\neligible products {len(e)} of {len(g)}  (>= {MIN_ITEMS} items, >= {MIN_MONTHS} months, >= {MIN_PRICES} prices)")
    print(f"they carry {e.n.sum()} items = {e.n.sum() / g.n.sum():.4f} of all delivered items")
    print(f"price range within product: median max/min {(e.pmax / e.pmin).median():.3f}, "
          f"share with max/min >= 1.2: {((e.pmax / e.pmin) >= 1.2).mean():.3f}")
    print("top categories among eligible:", e.cat.value_counts().head(6).to_dict())
    return e


def panel(x, e):
    p = x[x.product_id.isin(e.index)].groupby(["product_id", "month"]).agg(
        units=("order_id", "size"), price=("price", "mean"), freight=("freight_value", "mean")).reset_index()
    p["cat"] = p.product_id.map(e.cat)
    p["lp"] = np.log(p.price); p["lq"] = np.log(p.units)
    p["m"] = p.month.astype(str)
    print(f"\npanel rows {len(p)}  products {p.product_id.nunique()}  months {p.m.nunique()}")
    print(f"rows with 1 unit: {(p.units == 1).mean():.3f}   median units per row {p.units.median():.0f}")
    return p


def ladder(x, e, p):
    out = {}
    # (1) cross-section across products within a category, products with >= 5 units
    cs = x.groupby(["cat", "product_id"]).agg(units=("order_id", "size"), price=("price", "mean")).reset_index()
    cs = cs[cs.units >= 5]
    rows = []
    for cat, sub in cs.groupby("cat"):
        if len(sub) < 40:
            continue
        b, se = slope(np.log(sub.price), np.log(sub.units))
        rows.append((cat, len(sub), b, se))
    cst = pd.DataFrame(rows, columns=["cat", "n", "slope", "se"]).sort_values("n", ascending=False)
    print("\n(1) cross-section, slope of log units on log price ACROSS products, by category:")
    print(cst.head(8).round(3).to_string(index=False))
    b, se = slope(np.log(cs.price), np.log(cs.units))
    out["cross_all"] = (b, se, len(cs))
    print(f"    all categories pooled: {b:.3f} (se {se:.3f}), {len(cs)} products")
    # (1b) cross-section over the 203 eligible products only (what the bench can recompute)
    cs2 = p.groupby("product_id").agg(units=("units", "sum"), price=("price", "mean"))
    b, se = slope(np.log(cs2.price), np.log(cs2.units)); out["cross_eligible"] = (b, se, len(cs2))
    print(f"    eligible 203 only (the bench's rung 1): {b:.3f} (se {se:.3f})")
    # (2) pooled panel
    b, se = slope(p.lp, p.lq); out["pooled"] = (b, se)
    print(f"\n(2) pooled panel, no controls: {b:.3f} (se {se:.3f})")
    # (3) product FE
    b, se = slope(demean(p, "lp", "product_id"), demean(p, "lq", "product_id")); out["fe_product"] = (b, se)
    print(f"(3) product fixed effects:     {b:.3f} (se {se:.3f})")
    # (4) two-way FE
    b, se = slope(twoway_demean(p, "lp", "product_id", "m"), twoway_demean(p, "lq", "product_id", "m")); out["fe_twoway"] = (b, se)
    print(f"(4) product + month effects:   {b:.3f} (se {se:.3f})")
    # weighted by units (3)
    b, se = slope(demean(p, "lp", "product_id"), demean(p, "lq", "product_id"), w=p.units); out["fe_product_w"] = (b, se)
    print(f"    (3) weighted by units:     {b:.3f} (se {se:.3f})")
    # freight-inclusive price (3)
    p2 = p.assign(lpf=np.log(p.price + p.freight))
    b, se = slope(demean(p2, "lpf", "product_id"), demean(p2, "lq", "product_id")); out["fe_product_freight"] = (b, se)
    print(f"    (3) price incl. freight:   {b:.3f} (se {se:.3f})")
    # drop single-unit months (3)
    p3 = p[p.units >= 2]
    b, se = slope(demean(p3, "lp", "product_id"), demean(p3, "lq", "product_id")); out["fe_product_min2"] = (b, se, len(p3))
    print(f"    (3) months with >= 2 units: {b:.3f} (se {se:.3f}), {len(p3)} rows")
    # (5) placebo: shuffle log price within product
    rng = np.random.default_rng(SEED)
    lq_d = demean(p, "lq", "product_id").values
    bs = []
    for _ in range(PLACEBO_DRAWS):
        sh = p.groupby("product_id")["lp"].transform(lambda s: pd.Series(rng.permutation(s.values), index=s.index))
        lp_d = (sh - sh.groupby(p.product_id).transform("mean")).values
        bs.append(slope(lp_d, lq_d)[0])
    bs = np.array(bs); out["placebo"] = (bs.mean(), bs.std(), np.abs(bs).max())
    print(f"(5) placebo, {PLACEBO_DRAWS} within-product shuffles: mean {bs.mean():.3f}, sd {bs.std():.3f}, max |b| {np.abs(bs).max():.3f}")
    # product FE within each of the six biggest categories (the bench's category filter)
    print("    (3) within one category:")
    for cat in e.cat.value_counts().head(6).index:
        q = p[p.cat == cat]
        b, se = slope(demean(q, "lp", "product_id"), demean(q, "lq", "product_id"))
        print(f"        {cat:24s} {b:7.3f} (se {se:.3f}), {q.product_id.nunique()} products, {len(q)} rows")
    # per-product slopes
    rows = []
    for pid, sub in p.groupby("product_id"):
        if sub.lp.std() < 1e-9:
            continue
        b, se = slope(sub.lp, sub.lq)
        rows.append((pid, len(sub), int(sub.units.sum()), b, se))
    pp = pd.DataFrame(rows, columns=["pid", "months", "units", "b", "se"])
    print(f"\nper-product slopes: n {len(pp)}, median {pp.b.median():.2f}, share negative {(pp.b < 0).mean():.3f}, "
          f"share below -1 {(pp.b < -1).mean():.3f}, IQR {pp.b.quantile(.25):.2f} to {pp.b.quantile(.75):.2f}")
    print(f"    share with |b| > 5 (noise): {(pp.b.abs() > 5).mean():.3f}")
    # the revenue arithmetic for a 10 percent rise under each slope
    for k in ["pooled", "fe_product", "fe_twoway"]:
        b = out[k][0]
        print(f"    +10% price under {k} ({b:.2f}): units {(1.1 ** b - 1) * 100:+.1f}%, revenue {(1.1 ** (1 + b) - 1) * 100:+.1f}%")
    # the headline product
    top = e.sort_values("n", ascending=False).index[0]
    sub = p[p.product_id == top][["m", "units", "price"]]
    print(f"\nheadline product {top[:8]} ({e.loc[top, 'cat']}), {e.loc[top, 'n']} items:")
    print(sub.to_string(index=False))
    b, se = slope(sub.price.pipe(np.log), sub.units.pipe(np.log))
    print(f"    its own slope {b:.2f} (se {se:.2f})")
    return out


def write_sample(p, e, path):
    prods = sorted(p.product_id.unique())
    pidx = {k: i for i, k in enumerate(prods)}
    months = sorted(p.m.unique())
    midx = {k: i for i, k in enumerate(months)}
    cats = sorted(e.cat.unique())
    cidx = {k: i for i, k in enumerate(cats)}
    js = ("/* econ-sample.js - the elasticity panel from the public Olist dataset.\n"
          f" * {len(p)} product-month rows for {len(prods)} products (>= {MIN_ITEMS} delivered items, >= {MIN_MONTHS} months,\n"
          f" * >= {MIN_PRICES} distinct prices), delivered orders before {SNAPSHOT.date()}. Every row is real:\n"
          " * units = items sold that month, pc = mean item price that month in centavos (BRL), fc = mean freight.\n"
          " * Source: Brazilian E-Commerce Public Dataset by Olist (CC BY-NC-SA 4.0), Kaggle. */\n"
          "window.ECON_PANEL = {\n"
          f'  snapshot: "{SNAPSHOT.date()}", currency: "BRL",\n'
          f"  months: {json.dumps(months)},\n"
          f"  cats: {json.dumps(cats)},\n"
          f"  prodCat: {json.dumps([cidx[e.loc[k, 'cat']] for k in prods])},\n"
          f"  prodId: {json.dumps([k[:8] for k in prods])},\n"
          f"  p: {json.dumps([pidx[k] for k in p.product_id])},\n"
          f"  m: {json.dumps([midx[k] for k in p.m])},\n"
          f"  units: {json.dumps(p.units.astype(int).tolist())},\n"
          f"  pc: {json.dumps([int(round(v * 100)) for v in p.price])},\n"
          f"  fc: {json.dumps([int(round(v * 100)) for v in p.freight])}\n"
          "};\n")
    with open(path, "w") as f:
        f.write(js)
    print(f"\nwrote {path} ({len(js)} bytes)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    x = build(sys.argv[1])
    e = eligible(x)
    p = panel(x, e)
    ladder(x, e, p)
    if "--write-sample" in sys.argv:
        here = os.path.dirname(os.path.abspath(__file__))
        write_sample(p, e, os.path.join(here, "..", "assets", "econ-sample.js"))
