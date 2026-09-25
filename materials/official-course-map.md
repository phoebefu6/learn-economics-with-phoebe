# Official course map - learn-economics-with-phoebe

Internal build document. Not linked from any audience-facing page. Every number quoted on any
page comes from here, with its verification tier. If a fact is not here, the page teaches the
uncertainty instead of inventing a number.

Built 2026-09-25. Scope approved by Phoebe the same day: **Economics Fundamentals, data and AI
angle, generic intro + data/AI deep dive.** Two tracks: Foundations (6) and Data and AI deep-dive
(10). Signature bench: price elasticity on real Olist rows, computed in the browser.

## Verification tiers

| Tier | Meaning |
|------|---------|
| **computed** | Recomputed in this build from the public Olist dataset by `materials/build-olist-elasticity.py`; the bench (`assets/econ-live.js`) reproduces the deterministic rungs to three decimals in node (checked 2026-09-25: all seven agree; the placebo uses a different random generator and agreed to mean -0.003 vs -0.002, sd 0.170 vs 0.159) |
| **modelled** | Arithmetic on a computed number under a stated assumption (constant elasticity); the page says "under a constant-elasticity assumption" |
| **primary** | Read in the primary source (paper, book, official page) during this build, or confirmed by the source-checker agent with the source text |
| **secondary** | Widely reported, not opened at source in this build; the page says "reported" or names the summarising source |
| **constructed** | Invented for teaching; the page says so |
| **not claimed** | Circulates without a source; the page teaches the uncertainty |

Citation verdicts from the source-checker run are recorded in the appendix at the end. Until a
claim there reads **confirmed**, treat it as **secondary** on the page.

---

## The running data: Olist, and the decisions inside the panel

Brazilian E-Commerce Public Dataset by Olist (Kaggle, `olistbr/brazilian-ecommerce`),
CC BY-NC-SA 4.0. Same dataset as `learn-rfm-modeling-with-phoebe`, which found the ragged edge
(September and October 2018 hold 20 undelivered stragglers) and set the snapshot at 2018-09-01.

| Decision | Choice | Why |
|---|---|---|
| Row | one order item = one unit sold at one price | the items table carries `price` per line |
| Orders | delivered only, purchased before 2018-09-01 | the RFM course's snapshot rule; 110,197 items survive of 112,650 |
| Price | item price paid, excluding freight | freight is set by distance, not by the seller; a freight-inclusive variant is reported |
| Panel | product x calendar month; units = items sold, price = mean item price | monthly is the finest grain at which most products have more than one sale |
| Eligible | >= 30 delivered items, >= 6 months with a sale, >= 3 distinct prices | a product with one price has no elasticity to measure |
| Slope | OLS of log units on log price | the slope of a log-log line is the elasticity |

**Counts (computed):**
- 112,650 order items; 110,197 delivered before the snapshot; 32,216 distinct products.
- 60,881 product-month rows exist before the sieves (2,453 items are dropped by the delivered-before-snapshot filter).
- 376 products have >= 30 delivered items; of those, 226 have >= 3 distinct prices; 203 also have >= 6 months with a sale.
- Eligible products: **203 of 32,216**. They carry 16,452 items, **14.9 percent** of all delivered items.
- Panel: **2,216 product-month rows**, 203 products, 21 months (2016-10 to 2018-08 with gaps).
- 16.5 percent of panel rows are a single unit; median units per row is 4.
- Within an eligible product, the median max/min price ratio is **1.294**; 70.0 percent of eligible products moved price by 20 percent or more.
- Top categories among the 203: bed_bath_table 22, health_beauty 18, watches_gifts 17, computers_accessories 16, garden_tools 13, cool_stuff 13.

## The ladder (the course's spine) - all computed

Same rows, five ways to fit a line. Standard errors are conventional OLS, unclustered; the page
calls them "naive standard errors" and says so.

| Rung | What it compares | Slope | se | Reading |
|---|---|---|---|---|
| 1 | Cross-section ACROSS products, all categories, products with >= 5 units (4,731 products) | **+0.008** | 0.011 | price tells you nothing across different products |
| 1 (by category) | bed_bath_table +0.022 · sports_leisure -0.013 · health_beauty -0.026 · furniture_decor -0.028 · housewares +0.089 · computers_accessories +0.066 · telephony -0.009 · watches_gifts -0.035 | | | none of the eight is below -0.04 |
| 1 (bench) | Cross-section across the 203 eligible products only (what the browser can recompute) | **-0.001** | 0.058 | same answer on the bench's own rows |
| 2 | Pooled panel, no controls, 2,216 rows | **-0.108** | 0.028 | a number that looks like a small elasticity and is not one |
| 3 | Product fixed effects (each product compared with itself) | **-1.788** | 0.149 | the within-product answer |
| 4 | Product + month fixed effects (two-way) | **-1.854** | 0.150 | month effects move it a little, not a lot |
| 3, weighted by units | | -2.216 | 0.143 | big-selling months count more |
| 3, price incl. freight | | -1.881 | 0.154 | robust to the freight decision |
| 3, months with >= 2 units only (1,850 rows) | | -1.480 | 0.142 | the single-unit months pull it more negative |
| 5 | Placebo: log price shuffled WITHIN product, 200 draws, seed 20180901 | mean **-0.002**, sd 0.159, max abs 0.444 | | the rung-3 answer is more than 11 placebo standard deviations from zero |

**The two-scope statement for every page:** on these rows the within-product elasticity is
**between -1.5 and -2.2 depending on the weighting and the row filter, and about -1.8 at the
default.** It is not -0.1 and it is not zero. Publish the range, not one decimal.

**Within one category (rung 3 restricted):** bed_bath_table -3.883 (se 0.811, 22 products, 241
rows) · health_beauty -1.694 (0.760, 18, 204) · watches_gifts -2.599 (0.333, 17, 188) ·
computers_accessories -1.795 (0.481, 16, 169) · garden_tools -1.283 (0.670, 13, 188) ·
cool_stuff -1.902 (0.671, 13, 144). Categories differ, and the standard errors say most of the
differences are not distinguishable from each other with 13 to 22 products.

**Per-product slopes (203 fits):** median **-2.03**; **70.0 percent negative**; 59.6 percent
below -1; interquartile range -5.09 to +0.70; **33.5 percent have an absolute slope above 5**,
which is noise, not economics. One product at a time is too little data; the panel is the unit.

**The headline product** `aca2eb7d` (furniture_decor, 520 items, the most-sold eligible
product): price R$ 75.00 through 2017, cut to R$ 69.90 in January 2018 with units going 45 to
121 that month, held near 70 through May at 43 to 90 units, then raised to R$ 89.90 in June and
R$ 103 in August with 2, 2 and 3 units. Its own slope is **-10.17** (se 2.20). That number is
not an elasticity: the last three months look like a stock-out or a delisting, and a slope of
-10 would mean a 10 percent rise loses 62 percent of units. The page teaches it as "the slope
that is too good", and says the truthful reading is "we cannot tell demand from supply here".

**Revenue arithmetic for a 10 percent price rise (modelled, constant elasticity):**

| Elasticity used | Units | Revenue |
|---|---|---|
| rung 2, -0.108 | -1.0 percent | **+8.9 percent** |
| rung 3, -1.788 | -15.7 percent | **-7.2 percent** |
| rung 4, -1.854 | -16.2 percent | -7.8 percent |

The anti-lever on the bench: **"Use the market-wide number"** (rung 1 or 2) predicts that
raising every price 10 percent raises revenue about 9 percent. The within-product number
predicts it loses about 7. Same rows, opposite sign, and the difference is whether a product was
compared with itself or with other products.

**The break button on the bench:** shuffle prices within product and refit. The slope collapses
to about zero (the placebo). The bench is therefore tested against its failing state as well as
its passing one.

**What the Olist number cannot say (teach, do not resolve):** the panel is observational. A
seller cuts price when stock is high or a competitor moves; a price rise in the last months of a
product's life coincides with it going out of stock. Product fixed effects remove "this product
is cheap and popular", month effects remove "the marketplace grew", and neither removes "the
seller chose the price after seeing demand". The estimate is a within-product association with a
placebo behind it, not a causal elasticity. The causal ladder is taught in
`learn-causal-inference-with-phoebe`; the experiment that would settle it in
`learn-experimentation-with-phoebe`.

---

## Named cases and figures used on Foundations pages

| Fact | Tier | Where used |
|---|---|---|
| Hayek 1945, "The Use of Knowledge in Society", AER 35(4) 519-530: prices carry dispersed knowledge | primary (checker: confirmed) | a1 |
| Marshall formalised "elasticity of demand" in Principles of Economics, Book III ch. IV (1890); say "formalised" or "popularised", never "coined" (earlier uses exist) | primary (checker read the chapter) | a2 |
| Gasoline demand meta-analysis, Havranek, Irsova and Janda 2012, Energy Economics 34(1) 201-207: publication-bias-corrected short-run about -0.09, long-run about -0.31 | secondary (abstract via ScienceDirect and RePEc; full text paywalled) | a2, p3 |
| Food price elasticities, Andreyeva, Long and Brownell 2010, AJPH 100(2): food away from home 0.81, soft drinks 0.79, eggs 0.27 (absolute values as the paper reports them) | primary (checker: confirmed) | a2 |
| Akerlof 1970, "The Market for Lemons", QJE 84(3) 488-500: adverse selection | primary (checker: confirmed) | a4, p8 |
| Coase 1937, "The Nature of the Firm", Economica 4(16) 386-405: transaction costs decide the boundary of the firm | primary (checker: confirmed) | a3 (opportunity cost of coordinating), p9 |
| Vickrey 1961, J. Finance 16(1): second-price sealed bid, truthful bidding dominant | primary (checker: confirmed) | a6, p6 |
| Edelman, Ostrovsky, Schwarz 2007, AER 97(1): GSP is not truthful | primary (checker: confirmed) | p6 |
| Briscoe, Odlyzko, Tilly 2006, IEEE Spectrum, "Metcalfe's Law is Wrong": n log n | primary (checker: confirmed) | a6, p5 |
| Shapiro and Varian 1998, Information Rules: versioning, near-zero marginal cost of information goods | primary (checker: confirmed) | a3, p3, p4 |
| Solow 1987, NYT Book Review, 12 July 1987, p. 36, review titled "We'd better watch out": "You can see the computer age everywhere but in the productivity statistics" | secondary (standupeconomist.com definitive citation; the microfilm was not opened) | a5, p7 |
| Goodhart's law: the popular phrasing is Strathern 1997, European Review 5(3), not Goodhart 1975 | primary (checker: confirmed) | a4, p8 |
| Acemoglu and Restrepo 2019, "Automation and New Tasks: How Technology Displaces and Reinstates Labor", Journal of Economic Perspectives 33(2) 3-30: displacement effect and reinstatement effect. NOT the 2018 AER "Race between Man and Machine" paper | primary (checker read the AEA abstract) | p7 |
| Brynjolfsson, Li, Raymond, "Generative AI at Work": about 14 percent more issues resolved per hour, largest for the least experienced | primary (checker: confirmed) | p7 |
| Noy and Zhang 2023, Science 381(6654): writing tasks about 40 percent faster, quality up about 18 percent | secondary (Science paywalled; abstract wording reproduced by PubMed 37440646) | p7 |
| Dell'Acqua et al. 2023, HBS WP 24-013: 12.2 percent more tasks, 25.1 percent faster, 40 percent higher quality inside the frontier; 19 points less likely correct outside it | primary (checker: confirmed) | p7 |
| Anthropic API list prices, cached 2026-06-24 by the claude-api reference: Opus 5 $5 in / $25 out per million tokens; Sonnet 5 $2 / $10; Haiku 4.5 $1 / $5; cache reads about a tenth of input | vendor list, dated (pending checker for the live page) | p4 |
| Olist licence CC BY-NC-SA 4.0 | primary (Kaggle API and page JSON-LD read 2026-09-25) | every page that cites the data |

Rules for the pages: state each as "reported by" until the appendix says confirmed. If the
checker returns **wrong** or **could not verify**, the page drops the number and keeps the
mechanism.

## Constructed cases (say "constructed" on the page)

- **Marchmont Instruments** is NOT reused here; it belongs to the Finance course. This course's
  constructed firm is **Beira Goods**, a small Brazilian marketplace seller with 40 products, used
  in a1 to a6 wherever a worked example needs a firm that is not Olist itself. Every Beira number
  is invented and labelled.
- **The inference cost model (p4):** a constructed workload of 2 million requests a month, 1,200
  input tokens and 300 output tokens each, priced at the list prices above; the self-hosted
  alternative is a constructed fixed cost, labelled as such, and the page varies it rather than
  asserting one figure. No GPU price is claimed.
- **The second-price auction (p6):** constructed bidders with constructed values; the point is
  the mechanism, and the page says the values are invented.

## Not claimed

- Any specific elasticity for "e-commerce in general" or "Brazil". The panel is 203 products on
  one marketplace in 2017-2018.
- Any causal reading of the Olist slope. See "What the Olist number cannot say".
- Any GPU hourly price, any specific self-hosting cost. The page uses a slider.
- That AI raises or lowers total employment. The evidence is contested; p7 teaches the
  disagreement (displacement vs reinstatement; the task-level productivity studies measure tasks,
  not jobs).
- Metcalfe's law as a fact. It is taught as a claim with a published rebuttal.
- "Prices are set by supply and demand" as a mechanism on a marketplace: sellers set prices; the
  page says supply and demand describe where a price settles, not who types it in.

---

## Seams (checked against the live hub 2026-09-25, before the first page)

| Neighbour | It owns | This course does NOT |
|---|---|---|
| `learn-finance-with-phoebe` (biz, d3) | the three statements, working capital, cash vs profit, funding gaps | read a P&L; a5 stays at money, inflation and interest as prices |
| `learn-prescriptive-analytics-with-phoebe` (ds, d4) | linear programming, shadow prices, the feasible region | solve an optimisation; p9 names the make-or-buy question and links |
| `learn-causal-inference-with-phoebe` (ds) | the causal ladder, confounding, DAGs | prove causation; p2 says "association with a placebo", links |
| `learn-experimentation-with-phoebe` (ds) | A/B tests, the price test that would settle it | design the experiment; p3 links |
| `learn-decision-intelligence-with-phoebe` (ds) | forecasting, decision under uncertainty | forecast |
| `learn-marketing-attribution-with-phoebe` (aiap) | attribution | touch attribution |
| `learn-ai-finance-with-phoebe` (aiap) | AI inside a finance function | |
| `learn-rfm-modeling-with-phoebe` (data, d2) | the Olist customer table, the snapshot rule | rebuild RFM; p1 reuses the snapshot date and says where it came from |
| `learn-customer-retention-with-phoebe` (data) | CAC, LTV, unit economics of a customer (CAC in 10 live pages, LTV in 10) | teach CAC or LTV; p3 mentions "the retention course owns LTV" |
| `learn-data-warehouse-with-phoebe` a4 "buy landscape" | the warehouse buy-vs-build landscape | list vendors; p9 is the economics of the choice, not the market |
| `learn-value-investing-with-phoebe` (planned) | valuation | value anything |

Heading collisions grepped 2026-09-25 across every live `courses/*.html`: no h1/h2 on any live
page contains "elastic", "supply and demand", "opportunity cost", "marginal", "auction",
"network effect", "price discrimination", "inflation", "game theory" or "moat". Titles below
are clear.

---

## Session coverage

Format: Live = in the 45 minutes; Self-study = full depth after class.

### Foundations track (6 x 45 min, no code, "Economics for everyone, with a data habit")

| # | File | Title | Live concepts | Self-study | Figures (mechanism) | Olist / data tie |
|---|---|---|---|---|---|---|
| a1 | a1-prices-are-information.html | Prices are information | supply and demand as a description of where a price settles; a price as a signal (Hayek); surplus; what a marketplace price actually is (a seller typed it) | equilibrium is a tendency not a state; price ceilings and floors; why shortages appear when a price is held | 1 the S-D cross with the message a price carries; 2 the seller typing a price and the market answering; 3 what shifts a curve vs moves along it; 4 (build-along) Olist: 32,216 products, 203 you can learn from | the 203-of-32,216 count: most prices on a marketplace never move, so most carry no information about response |
| a2 | a2-incentives-and-elasticity.html | Incentives and elasticity | elasticity as "how much do people respond"; elastic vs inelastic; the revenue rule (elastic: a rise loses revenue); who pays a tax depends on elasticities | cross-price and income elasticity; published ranges (gasoline, food) as reported; Marshall 1890 | 1 two demand curves, same price rise, different revenue; 2 the tax wedge and who bears it; 3 the log-log line with a slope; 4 (build-along) the Olist rung 3 number read as an elasticity, the range -1.5 to -2.2 | rung 3, the two-scope statement, the revenue arithmetic |
| a3 | a3-marginal-thinking.html | Marginal thinking and opportunity cost | decisions at the margin; sunk costs; opportunity cost as the next best use; comparative advantage; fixed vs marginal cost and why software and information goods are different (Shapiro and Varian) | diminishing returns; economies of scale; Coase on why firms exist | 1 the marginal cost curve for a physical good vs an information good; 2 the sunk cost and the fork; 3 comparative advantage as two people two tasks; 4 (build-along) the marginal cost of one more prediction vs one more unit shipped, Beira Goods (constructed) | the p4 inference model previewed in words |
| a4 | a4-when-markets-fail.html | When markets fail | externalities; public goods; information asymmetry (Akerlof's lemons); adverse selection and moral hazard; Goodhart (Strathern phrasing) | why regulation exists; the tragedy of the commons; signalling | 1 the lemons spiral; 2 the externality: private cost vs social cost; 3 the metric that became a target; 4 (build-along) a data market's lemons problem, in prose on a real mechanism (a dataset's quality is unobservable before purchase) | p8 previewed |
| a5 | a5-money-inflation-and-interest.html | Money, inflation and interest | money as a unit of account, medium of exchange, store of value; inflation as a change in the price of money; interest as the price of time; real vs nominal; discounting | central banks in one page; the productivity paradox (Solow) and why measured productivity lags a technology | 1 nominal vs real over time; 2 the discount curve; 3 the price of time as a rate; 4 (build-along) deflating Olist's 2017 and 2018 prices in words: why a price rise of 5 percent across a year is not 5 percent | Olist prices are nominal BRL; the page says what would be needed to make them real and does not do it |
| a6 | a6-games-and-moats.html | Games and moats | strategic interaction; prisoner's dilemma; dominant strategy; network effects as a claim (Metcalfe, and the n log n rebuttal); switching costs; winner-take-most and its limits | Vickrey's auction in one page; commitment and credibility; when a data advantage compounds and when it does not | 1 the 2x2 game; 2 a network at n and at 2n under two laws; 3 switching costs as a wall with a door; 4 (build-along) an Olist seller's pricing game against a rival, constructed | p5 and p6 previewed |

### Data and AI deep-dive track (10 x 45 min, Python)

| # | File | Title | Live | Self-study | Figures | Bench / code |
|---|---|---|---|---|---|---|
| p1 | p1-demand-from-data.html | Demand from data | the panel: one row = one product-month; the eligibility rule; log-log OLS; the per-product fit and why it is noise (33.5 percent above 5 in absolute value) | the snapshot rule inherited from RFM; why freight is excluded; why the row is an item | 1 items to panel pipeline; 2 the log-log line; 3 the per-product slope histogram (median -2.03, 70 percent negative); 4 (build-along) the headline product's 13 months | build-along: pandas from raw items to the panel to a per-product fit; every printed number is in this map |
| p2 | p2-why-the-naive-number-lies.html | Why the naive number lies | rung 1 (+0.008): cheap products are not popular products; rung 2 (-0.108); rung 3 (-1.788): the same rows compared within product; what a fixed effect removes | month effects (rung 4, -1.854); the placebo (mean -0.002, sd 0.159); what none of it removes (the seller chose the price); link to the causal ladder | 1 the three rungs as three lines through the same cloud; 2 what demeaning does to a product's rows; 3 the placebo distribution with the real slope marked; 4 (build-along) rungs 1 to 5 in pandas | build-along: demean and fit; the placebo loop |
| p3 | p3-pricing-with-the-number.html | Pricing with the number | the revenue rule with the real number (+8.9 vs -7.2 percent); price discrimination first, second, third degree; versioning (Shapiro and Varian); freemium as second-degree discrimination | willingness to pay and why it is unobservable; the price test the experimentation course designs; where LTV lives (retention course) | 1 the revenue arithmetic under two elasticities; 2 the three degrees of discrimination; 3 versioning as a menu that sorts customers; 4 (build-along) the revenue table under -0.108, -1.5, -1.8, -2.2 | build-along: the constant-elasticity revenue function; the range, not a point |
| p4 | p4-the-economics-of-a-prediction.html | The economics of a prediction | fixed vs marginal cost of inference; per-token pricing as a pure marginal cost (Anthropic list prices, dated); the constructed 2M-request workload; utilisation; the break-even volume between rent (API) and own (fixed cost) | the zero-marginal-cost story and why inference breaks it; caching as a marginal-cost cut (cache reads about a tenth of input); latency as a cost | 1 two cost curves crossing at a break-even volume; 2 a request as tokens with a price each; 3 utilisation: a fixed cost spread over more or fewer requests; 4 (build-along) the break-even calculator with a slider for the fixed cost | build-along: a cost function in Python; the page asserts no GPU price |
| p5 | p5-network-effects-and-data-moats.html | Network effects and data moats | direct vs indirect network effects; Metcalfe as a claim and the n log n rebuttal; data network effects: when more data compounds and when it plateaus (learning curves flatten); switching costs | multi-homing; why "we have the data" is often not a moat; the marketplace as a two-sided network (Olist has 3,095 sellers and 96,096 customers, RFM course counts) | 1 n squared vs n log n at n and 10n; 2 the learning curve that flattens; 3 two-sided platform with both sides; 4 (build-along) fit a learning curve to constructed data and read where it flattens (constructed, labelled) | build-along: constructed, labelled |
| p6 | p6-auctions.html | Auctions: how ads and compute are priced | why auctions exist (unknown values); first-price vs second-price; Vickrey: truthful bidding dominant; GSP for ads (Edelman et al.): not truthful; spot markets for compute as auctions in disguise | VCG in a paragraph; reserve prices; winner's curse | 1 the second-price mechanism with three bidders; 2 the GSP ladder of positions; 3 the winner's curse; 4 (build-along) a second-price auction in 20 lines, constructed bidders, and the check that shading loses | build-along: constructed, the mechanism is the point |
| p7 | p7-labour-economics-of-ai.html | Labour economics of AI | tasks vs jobs; substitution vs complementarity; Acemoglu-Restrepo displacement and reinstatement; the three task-level studies (Brynjolfsson et al. about 14 percent; Noy and Zhang about 40 percent time; Dell'Acqua et al. inside vs outside the frontier) | the productivity paradox (Solow) and measurement lag; wage effects are contested; what a task study cannot say about employment | 1 a job as a bundle of tasks with some automated; 2 displacement and reinstatement as two arrows; 3 the jagged frontier: inside vs outside; 4 (build-along) a task inventory for one real role, in prose, scored for exposure | teach the disagreement; no employment claim |
| p8 | p8-information-economics-of-models.html | Information economics of models | adverse selection in data and model markets (quality unobservable before purchase); signalling (benchmarks, evals, audits); principal-agent inside an ML team; Goodhart on any metric that becomes a target | screening vs signalling; why a public benchmark decays; the eval as a contract | 1 the lemons spiral for datasets; 2 the benchmark that became a target; 3 principal and agent with a metric between them; 4 (build-along) reading a model card as a signal, in prose | links to AI evals course for the mechanics |
| p9 | p9-build-buy-or-rent.html | Build, buy or rent a data platform | make-or-buy as Coase; fixed vs variable; total cost of ownership over a horizon; the option value of renting; where the shadow price of a constraint lives (prescriptive course) | switching costs as the hidden line; vendor lock-in as a moat from the other side; the warehouse buy landscape (data warehouse course) | 1 build vs buy vs rent cost lines over 36 months; 2 transaction costs as friction on the boundary; 3 the switching cost line the vendor did not draw; 4 (build-along) a TCO table in Python with constructed inputs | constructed, labelled |
| p10 | p10-the-elasticity-bench.html | The elasticity bench, and defending a number | the bench: rungs 1 to 5 on the real panel, every slope computed live; the anti-lever "use the market-wide number"; the break button (shuffle within product); the filters (category, weight, freight, single-unit months); the two-scope statement; how to say the number out loud | the honest sentence for a leader; the final scorecard | 1 the bench schematic; 2 the anti-lever's opposite sign; 3 the placebo with the real slope | `assets/econ-live.js` on `assets/econ-sample.js`; final scorecard with `data-msgs` |

**Build-along rule:** code boxes print real numbers only where this map states them. Constructed
data prints "your numbers will differ".

## Sources covered rows (the estate-standard heading on every session page is exactly
"What this session teaches, and where it came from")

Each session lists its rows with ✓ (taught) or ◐ (named, not taught), against: the Olist
computation (this map), the named papers above, and "standard textbook economics" for the
mechanics that have no single source (supply and demand, marginal cost, comparative advantage).
Textbook mechanics are labelled "standard economics, no single source".

## Not covered by design

- Macroeconomic policy beyond one page (a5); no GDP accounting, no trade theory.
- Personal finance and investing (the planned value-investing course).
- Corporate finance (the Finance course).
- Optimisation (Prescriptive Analytics), causal identification (Causal Inference), experiment
  design (Experimentation), CAC and LTV (Retention).
- Any live vendor price beyond the dated Anthropic list; no GPU prices.

## Build log (what changed and why, for the field notes)

- 2026-09-25: scope grill approved (6 + 10, Olist elasticity bench, graphite navy + amber
  `#1F3A5F` + `#A8570B`, AA checked 18 pairs; amber darkened from `#B7620F` (4.40) to
  `#A8570B` (5.21 on white, 4.55 on the tint) before any page).
- Olist raw CSVs were not on disk; RFM's build script took a path argument and the data lived in
  a session scratchpad. `kagglehub.dataset_download("olistbr/brazilian-ecommerce")` fetches the
  public dataset with no credentials; cached under `~/.cache/kagglehub/`.
- The first exploration fit per-product slopes and found a third of them above 5 in absolute
  value. The panel with fixed effects is the unit of analysis, not the product.

## Appendix: source-checker verdicts (run 2026-09-25, 18 claims, 45 tool uses)

| # | Claim | Verdict | How read |
|---|---|---|---|
| 1 | Hayek 1945 AER 35(4) 519-530 | confirmed | bibliographic data solid; scanned PDF not OCR'd, argument taken as well known |
| 2 | Akerlof 1970 QJE 84(3) 488-500 | confirmed | citation matches |
| 3 | Coase 1937 Economica 4(16) 386-405 | confirmed | Wiley record |
| 4 | Vickrey 1961 J. Finance 16(1) 8-37 | confirmed | Wiley abstract, RePEc |
| 5 | Edelman, Ostrovsky, Schwarz 2007 AER 97(1) 242-259; GSP not truthful | confirmed, primary | AEA abstract verbatim: "truth-telling is not an equilibrium of GSP" |
| 6 | Briscoe, Odlyzko, Tilly 2006 IEEE Spectrum, n log n | confirmed, primary | article read: "grows in proportion to n log(n)" |
| 7 | Acemoglu and Restrepo displacement/reinstatement | confirmed; cite the 2019 JEP paper 33(2) 3-30, not 2018 AER | AEA abstract |
| 8 | Brynjolfsson, Li, Raymond, Generative AI at Work, 14 percent; 34 percent for novices; minimal for experienced | confirmed, primary | NBER WP 31161 abstract; also published QJE 2025, cite the WP number |
| 9 | Noy and Zhang 2023 Science, 40 percent time, 18 percent quality | partly; secondary | Science 403'd; PubMed abstract reproduction |
| 10 | Dell'Acqua et al. 2023 HBS WP 24-013: 12.2 / 25.1 / 40 percent; 19 percentage POINTS outside the frontier | confirmed, primary | working paper PDF read; "percentage points" is the correct unit |
| 11 | Havranek et al. 2012, -0.09 short run, -0.31 long run | confirmed; secondary | ScienceDirect and RePEc abstracts |
| 12 | Andreyeva et al. 2010 AJPH: 0.81 food away from home, 0.79 soft drinks, 0.76 juice, 0.27 eggs | confirmed, primary | PMC2804646 Table 1 |
| 13 | Solow 12 July 1987 quote | confirmed; secondary | definitive citation page, not the microfilm |
| 14 | Strathern 1997 European Review 5(3) 305-321 wording of Goodhart | confirmed | original PDF located |
| 15 | Shapiro and Varian 1998 Information Rules, HBS Press | confirmed; secondary | publisher record; chapter text not read |
| 16 | Olist licence | UNRESOLVED by the checker: CC BY-NC 4.0 vs CC BY-NC-SA 4.0 conflict | resolved by direct read below |
| 17 | Anthropic prices Opus 5 $5/$25, Sonnet 5 $2/$10, Haiku 4.5 $1/$5 | confirmed, primary, read live 2026-09-25 at platform.claude.com pricing page; Sonnet 5's price was introductory and is now standard | the page lists more models; the course names only these three and says so |
| 18 | Marshall "coined" elasticity | partly: Book III ch. IV read; use "formalised" | marxists.org transcription |

**Licence, read directly on 2026-09-25:** the Kaggle dataset API (`/api/v1/datasets/view/olistbr/brazilian-ecommerce`) returns `licenseNameNullable: "CC BY-NC-SA 4.0"` and the dataset page's JSON-LD carries `"name":"CC BY-NC-SA 4.0"` with the creativecommons by-nc-sa/4.0 URL. **CC BY-NC-SA 4.0 is correct**; the conflicting secondary sources were wrong. Tier: primary.
