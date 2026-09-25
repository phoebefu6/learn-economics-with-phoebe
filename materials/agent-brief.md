# Agent brief - shared by every fan-out page of learn-economics-with-phoebe

Internal build document. Not linked from any audience-facing page.

You are writing ONE static HTML session page. No servers, no npm. Write the file, return its path
and one line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup EXACTLY:
   - Foundations track (a-pages, no code, worksheets in the build-along):
     `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-economics-with-phoebe/courses/a1-prices-are-information.html`
   - Data and AI deep-dive track (p-pages, Python code in the build-along):
     `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-economics-with-phoebe/courses/p1-demand-from-data.html`
2. The source map, which holds every verified number, its evidence tier, the per-session
   coverage table and the seams. Use ONLY numbers from it. Never invent a statistic. If a fact is
   not in the map, teach the uncertainty instead:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-economics-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-economics-with-phoebe/assets/style.css`

## Page skeleton (from the template, keep every component)

toolbar (crumb EXACTLY "Foundations session N of 6" or "Deep-dive session N of 10", #toggle-all,
#zoom-toggle) · masthead (eyebrow "Learn Economics with Phoebe · Foundations session N of 6" or
"... · Deep-dive session N of 10", h1 with one `<span class="accent">`, .sub, .chip-row with the
level chip (`🟢 Foundations` on a-pages, `🟡 Core` on p-pages, `🔴 Bench night` on p10 which is
not yours), .agenda a1-a4) · main.wrap · section#intro (Part 0: kicker, .lede, .legend pills,
.callout.win "★ What you walk out with tonight") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
hand-drawn figure, `details.card` accordions (summary with `.mode.live` or `.mode.self`, title,
`.mini`, `.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" somewhere
on the page · section#demo-1 Build-along (kicker with `.tag.demo "★ 22 min · everyone builds"`
on p-pages or "★ 22 min · everyone works it through" on a-pages, .lede, ONE figure,
`.steps > .step` each with a `.prompt-box.good` carrying a `span.label`; on a-pages the box holds
a plain-text worksheet, on p-pages Python) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"` with `p.qtext`, FOUR `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score` after the last) · section#official Sources covered, h2 EXACTLY
"What this session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ /
light ◐ + name + note), then the `.mono` line EXACTLY: "Every fact on this page, and its
verification tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3
"Foundations session N cheat sheet <span>· pin this</span>" or "Deep-dive session N cheat sheet
...", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" ·
footer.pagefoot (prev/next chain) · `<script src="../assets/app.js?v=1">`.

Head: the social meta block as in the template with this page's own title/description/url,
`<title>Foundations session N · [name] - learn economics with phoebe</title>` (or Deep-dive),
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other card is. Sentence case headings.
Warm practitioner voice, concrete, never dry. Escape `&` as `&amp;`, `<` as `&lt;` and `>` as
`&gt;` inside prompt-boxes. 450 to 650 lines: guidance about depth, never a target to minify
toward. Never collapse whitespace, never dissolve a list into a paragraph, never drop a
component to fit.

## HARD RULES (a violation is rework)

- NEVER an em dash or en dash anywhere, in prose, code, aria-labels or comments. Hyphen only.
- No meta or course-instruction text. Never "this course", "in this course", "the course
  teaches", "banned here". State the professional norm directly, as domain knowledge with its
  reason. The two estate-standard phrases above ("What this session teaches..." heading and the
  `.mono` line) are the ONLY allowed self-references. "Foundations session 2", "deep-dive
  session 5" cross-references are fine and encouraged.
- Attribution is "by Phoebe Fu". Never "built with", never a tool name as author.
- Every number on the page comes from the source map or is explicitly labelled constructed.
  Code boxes may print real Olist numbers ONLY where the map states them; for constructed data,
  print "your numbers will differ" rather than invented outputs.
- Where the evidence is contested or missing, teach the disagreement. Do not resolve what the
  literature has not resolved. p7 in particular makes NO claim about total employment.
- Every citation uses the exact form in the map's appendix (year, journal, volume). Marshall
  "formalised", never "coined". Acemoglu and Restrepo is the 2019 JEP paper. Dell'Acqua's 19 is
  percentage POINTS. Noy and Zhang, Havranek, Solow and Shapiro-Varian are "reported" (secondary).
- Colours in figures: ONLY these hexes, nothing else, including no invented greys:
  `#1F3A5F` navy · `#142944` navy-deep · `#2C4F7C` navy-mid · `#C5D3E6` navy-soft ·
  `#EEF2F8` navy-50 · `#16213A` ink · `#4E5A75` muted · `#C9D2E2` faint · `#DCE3EE` hairline ·
  `#A8570B` amber · `#8A4409` amber-ink · `#FBEEDC` amber-50 · `#FFFFFF` white ·
  `#991B1B` `#FEF2F2` `#FCA5A5` universal reds (only for a wrong-way panel).
- NEVER the word "lottery" or "lotteries". Say what happens: "decided by row order",
  "arbitrary", "a random draw". Phoebe's rule for every course, 2026-09-24.
- Chinese terms: default to the English word. When the Chinese is genuinely the name, write
  `中文 (English)` with the translation in brackets after it, on EVERY occurrence. Grep
  `[一-鿿]` before you finish; the gate does not check this. Phoebe's rule, 2026-09-24.
- Do not use the word "session" in a kicker klabel other than as "Part N · covers ...".
- Titles and widget ids must not collide with sibling courses: do not use `id="rfm-bench"`,
  `id="fin-bench"`, or title anything "The three statements", "Shadow prices" or "The causal ladder".

## The hand-drawn figure grammar (every figure, no exceptions)

Study the four figures in your template and reproduce the register. Each figure:

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns=... role="img" aria-label="describes
  the data, not the shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom -
  one-line takeaway</figcaption>`. Never widen past 880; grow H.
- `<defs>` holds THREE things with a prefix unique to this figure. Foundations page aN uses
  `sNa`, `sNb`, `sNc`, `sNd` (a2: `s2a`...); deep-dive page pN uses `dNa`... (p3: `d3a`...; p10:
  `d10a`...): a wobble filter `id="s2aSk"` (`feTurbulence type="fractalNoise" baseFrequency="0.02"
  numOctaves="2" seed="<any int>"` + `feDisplacementMap scale="2.4" xChannelSelector="R"
  yChannelSelector="G"`, with `x="-3%" y="-3%" width="106%" height="106%"`), a hachure pattern
  `id="s2aHc"` (7x7 userSpaceOnUse, rotate(-38), one navy `#1F3A5F` line, opacity .5), and an open
  arrowhead marker `id="s2aAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke 1.6).
- ALL shapes (rects, circles, paths, arrows) go inside ONE `<g filter="url(#s2aSk)" fill="none"
  stroke="#16213A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`. Rects carry a
  tiny rotation (`transform="rotate(-0.6 cx cy)"`, between -4 and 4 degrees for "hand-placed"
  items, under 1 degree for panels). Fills: white, `#EEF2F8`, the hachure `url(#s2aHc)` for "the
  pile" or "the data", and solid `#A8570B` or `#FBEEDC` with an amber stroke ONLY for the one
  thing the figure is about. One doodle anchor per figure (a person, a price tag, a clock, a
  funnel, a sieve, a magnifier, a megaphone, two people, a dial, a wall with a door): simple
  strokes, never a mascot.
- ALL `<text>` sits OUTSIDE the filtered group, in the sans stack, using classes like the
  template's (`.s2aH` 800 12px ink heading · `.s2aL` 600 12px ink label · `.s2aS` 400 11px muted
  · `.s2aB` 800 11px amber-ink · `.s2aV` 800 16-20px navy-deep value · `.s2aW` 800 12px white on
  a navy or amber fill · `.s2aA` 700 11px navy axis caption · `.s2aN` 400 12px muted bottom note).
  Never below 10.5px.
- Text must fit its box AND the viewBox. Budget 7px per character at 12px (6.4 at 11px): a 150px
  box holds about 18 characters, 240px about 33, a full-width note line under 110. Labels beside a
  corner or a dot: keep 40px between neighbouring labels. When in doubt, shorten. Text over a
  rect's edge, or two labels within 12px vertically at the same x, is a gate failure.
- Bottom note at least 22px below the last content row, H clears it by 8px.
- Floor: one figure per Part plus one in the build-along, so 4 per page. Illustrate the
  MECHANISM (which curve moved, what a fixed effect removes, where the break-even sits, which
  bidder wins and pays what), never a metaphor literally and never decoration.

## Voice and honesty

Real world callouts sell the concept; every Part gets at least one story grounded in the map's
cases. Where a case is constructed (Beira Goods, the inference workload, the auction bidders)
say "constructed" or "invented" on the page. Where a figure is from a paper, name it in the
form the map gives and say "reported" if its tier is secondary. Never state a GPU price, a
general e-commerce elasticity, or an employment effect of AI as fact.

## Cross-links (absolute URLs, audience-facing)

- Causal Inference: https://phoebefu6.github.io/learn-causal-inference-with-phoebe/
- Experimentation: https://phoebefu6.github.io/learn-experimentation-with-phoebe/
- Prescriptive Analytics: https://phoebefu6.github.io/learn-prescriptive-analytics-with-phoebe/
- Finance: https://phoebefu6.github.io/learn-finance-with-phoebe/
- RFM Modeling (the snapshot rule): https://phoebefu6.github.io/learn-rfm-modeling-with-phoebe/
- Customer Retention (CAC, LTV): https://phoebefu6.github.io/learn-customer-retention-with-phoebe/
- AI Evals: https://phoebefu6.github.io/learn-ai-evals-with-phoebe/
- Data Warehouse (buy landscape): https://phoebefu6.github.io/learn-data-warehouse-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chains

Foundations: a1-prices-are-information.html → a2-incentives-and-elasticity.html →
a3-marginal-thinking.html → a4-when-markets-fail.html → a5-money-inflation-and-interest.html →
a6-games-and-moats.html
Footer left: "Foundations session N of 6 · learn-economics-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →" (a6: "← Prev" and "Course home").

Deep-dive: p1-demand-from-data.html → p2-why-the-naive-number-lies.html →
p3-pricing-with-the-number.html → p4-the-economics-of-a-prediction.html →
p5-network-effects-and-data-moats.html → p6-auctions.html → p7-labour-economics-of-ai.html →
p8-information-economics-of-models.html → p9-build-buy-or-rent.html → p10-the-elasticity-bench.html
Footer left: "Deep-dive session N of 10 · learn-economics-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href=...>Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →".

Session titles (use exactly, sentence case in h1 with one accent span):
a2 Incentives and elasticity · a3 Marginal thinking and opportunity cost · a4 When markets fail ·
a5 Money, inflation and interest · a6 Games and moats ·
p2 Why the naive number lies · p3 Pricing with the number · p4 The economics of a prediction ·
p5 Network effects and data moats · p6 Auctions: how ads and compute are priced ·
p7 Labour economics of AI · p8 Information economics of models · p9 Build, buy or rent a data platform ·
p10 The elasticity bench, and defending a number
