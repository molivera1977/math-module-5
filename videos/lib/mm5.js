'use strict';
/* ═══════════════════════════════════════════════════════
   Mr. O's Math Module 5 videos — the SHARED DRAWING KIT (every chapter loads it after lib/engine.js).
   A copy of Math Module 4's kit (11/13) with HIS MODULE 5 BOARD added at the end (the short way, the partial-product
   stack, area-model boxes and grids, base-ten groups, stories with the question underlined, his numbered steps).
   Read-only for chapter work: a chapter that needs more asks for it here, so every video gets it.
   His choices (11/11–11/13): gray board, colour that teaches, kid-size text, Ava's voice, reminders and hints;
   11/13: the videos use only what he taught, his steps and his words.
   Colours: TEAL = the basic fact · ORANGE = the zeros that come along · RED = a mistake · BLUE = the problem.
   Each equal group has its own colour (GROUP / GROUP_BG), and things take their group's colour as they land.
═══════════════════════════════════════════════════════ */
const TEAL = '#1f7a6c', ORANGE = '#c8501e', RED = '#c62828', BLUE = '#1d3f8f', INK = '#16211f';
const ROD = '#7fb2ec', ROD_EDGE = '#1b4f9c', CUBE = '#f2b84b', CUBE_EDGE = '#9a6a12', FLAT = '#9cc4f2', FLAT_EDGE = '#1b4f9c';
// (no orange, teal or red among them: those colours mean zeros, the fact and a mistake)
const GROUP = ['#2f74e0', '#16a34a', '#9333ea', '#e0457b', '#4338ca', '#65a30d', '#0284c7', '#c026d3', '#475569'];
const GROUP_BG = ['#e3eeff', '#dcf5e5', '#f1e4fd', '#fde4ef', '#e3e1fb', '#e8f5d3', '#dcf0fb', '#f8e1fb', '#e5e9ee'];
const TEAL_BG = '#dcf3ee', ORANGE_BG = '#fdeadf', BLUE_BG = '#e6efff', RED_BG = '#fde3e3', SUN_BG = '#fff3cf';
const NOTE = '#ffd966', NOTE_EDGE = '#c99a06';     // the sticky note that covers the zeros

/* one line of maths made of pieces, some coloured; hidden until t0. Returns its group; .row = the pieces
   (each piece has _px = its centre x and _w = its width, so other things can be placed on it). */
const dLine = (p, items, x, y, t0, { size = 64, anchor = 'middle', card = null } = {}) => {
  const g = G(p, { o: 0 });
  const row = tokens(g, items, { x, y, size, anchor });
  if (card) {                                       // a soft coloured card behind the line, drawn under it
    const w = row.w + size * 1.1, left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - row.w - size * .55 : x - size * .55;
    const r = mk('rect', { x: left, y: y - size * .98, width: w, height: size * 1.36, rx: size * .38, fill: card }, g);
    g.insertBefore(r, g.firstChild);
    g._card = { x: left, y: y - size * .98, w, h: size * 1.36 };
  }
  show(g, t0, .5);
  return Object.assign(g, { row });
};
// a soft coloured strip (behind several lines)
const dCard = (p, x, y, w, h, fill, t0) => {
  const r = mk('rect', { x, y, width: w, height: h, rx: 22, fill }, p);
  put(r, { o: 0 }); show(r, t0, .5);
  return r;
};
const dText = (p, str, x, y, t0, { size = 34, fill = COL.chalk, anchor = 'middle', weight = 600 } = {}) => {
  const e = T(p, str, { x, y, size, fill, anchor, weight, o: 0 });
  show(e, t0);
  return e;
};
// "Watch out!" — the red heading on a mistake beat
const dWatchOut = (p, t0, x = 800, y = 110) => dText(p, '⚠ Watch out!', x, y, t0, { size: 46, fill: RED, weight: 800 });

/* base-ten blocks, each drawn around its own centre (place with x/y, recolour through ._r's c_fill) */
const dCube = (p, x, y, s = 28) => {
  const g = G(p, { x, y, o: 0 });
  g._r = mk('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 4, fill: CUBE, stroke: CUBE_EDGE, 'stroke-width': 2 }, g);
  put(g._r, { c_fill: CUBE });
  return g;
};
const dRod = (p, x, y, h = 120) => {                // a ten: ten cubes in a column
  const g = G(p, { x, y, o: 0 }), w = h * .15, c = h / 10;
  g._r = mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 3, fill: ROD, stroke: ROD_EDGE, 'stroke-width': 2 }, g);
  put(g._r, { c_fill: ROD });
  let d = '';
  for (let j = 1; j < 10; j++) d += `M${-w / 2} ${-h / 2 + j * c}H${w / 2}`;
  path(g, d, { stroke: ROD_EDGE, 'stroke-width': 1.2, fill: 'none' });
  return g;
};
const dFlat = (p, x, y, s = 70) => {                // a hundred: a ten-by-ten square
  const g = G(p, { x, y, o: 0 }), c = s / 10;
  g._r = mk('rect', { x: -s / 2, y: -s / 2, width: s, height: s, rx: 3, fill: FLAT, stroke: FLAT_EDGE, 'stroke-width': 2 }, g);
  put(g._r, { c_fill: FLAT });
  let d = '';
  for (let j = 1; j < 10; j++) d += `M${-s / 2} ${-s / 2 + j * c}H${s / 2}M${-s / 2 + j * c} ${-s / 2}V${s / 2}`;
  path(g, d, { stroke: FLAT_EDGE, 'stroke-width': .8, fill: 'none', 'stroke-opacity': .55 });
  return g;
};
// a coloured box for one equal group (i = which group), drawn BEHIND what lands in it
const dGroupBox = (p, cx, cy, w, h, t0, i) => {
  const r = mk('rect', { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 18, fill: GROUP_BG[i % GROUP.length],
    stroke: GROUP[i % GROUP.length], 'stroke-width': 3.5 }, p);
  p.insertBefore(r, p.firstChild);
  put(r, { o: 0 });
  show(r, t0, .5);
  return r;
};
// deal things into equal groups one at a time, like sharing: thing k goes to group k % n, landing at slot(g, j)
// (j = its place in that group) and taking the group's colour. Returns when the last one lands.
const dDeal = (things, n, slot, t0, { gap = .06, dur = .5 } = {}) => {
  things.forEach((c, k) => {
    const g = k % n, j = Math.floor(k / n), t = t0 + k * gap, [x, y] = slot(g, j);
    tw(c, { x, y }, t, dur);
    if (c._r) tw(c._r, { c_fill: GROUP[g % GROUP.length] }, t + dur * .6, .4);
  });
  return t0 + (things.length - 1) * gap + dur;
};
// a short pop to point at something already on screen
const dNudge = (e, t0) => { tw(e, { s: 1.22 }, t0, .3, out); tw(e, { s: 1 }, t0 + .3, .35, io); };

/* THE STICKY NOTE that covers zeros: over pieces i..j of a dLine's row. It drops on at t0 and lifts off at t1
   (t1 optional). Kids see the zeros hidden, do the fact, then see the zeros come back. */
const dCover = (line, i, j, t0, t1) => {
  const row = line.row, size = row.size;
  const left = row[i]._px - row[i]._w / 2 - size * .12, right = row[j]._px + row[j]._w / 2 + size * .12;
  // drawn around its own centre, so a dNudge pops it in place (11/13: drawn from the stage corner it jumped ~170 px)
  const cx = (left + right) / 2, cy = row.y - size * .31, w = right - left, h = size * 1.22;
  const g = G(line, { o: 0, x: cx, y: cy - 40 });
  mk('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 10, fill: NOTE, stroke: NOTE_EDGE, 'stroke-width': 3 }, g);
  path(g, `M${w / 2 - 26} ${h / 2}l26 -26v26z`, { fill: NOTE_EDGE, 'fill-opacity': .35 });   // a turned corner
  g._cy = cy;
  tw(g, { o: 1, y: cy }, t0, .45, out);
  if (t1 != null) dLift(g, t1);
  return g;
};
// lift a sticky note off (the zeros come back): up and away
const dLift = (note, t0) => tw(note, { o: 0, y: (note._cy != null ? note._cy : 0) - 70 }, t0, .5, io);
// fly a line's pieces in from somewhere else (e.g. zeros from the problem to the answer): pieces k of line,
// starting at (x, y) and landing in their own place
const dFly = (line, ks, from, t0, dur = .8) => {
  ks.forEach((k, n) => {
    const e = line.row[k], [x, y] = typeof from === 'function' ? from(n) : from;
    put(e, { x, y });
    tw(e, { x: e._px, y: line.row.y }, t0 + n * .12, dur, io);
  });
};
// a red strike through a line (a mistake), drawn on at t0 — through pieces i..j only when given (the Video Director
// 11/13: strike only the wrong number, keep the problem in ink: "450 ÷ 9 = ~~500~~")
const dStrike = (line, t0, color = RED, [i, j] = [0, line.row.length - 1]) => {
  const row = line.row, a = row[i]._px - row[i]._w / 2 - 8, b = row[j]._px + row[j]._w / 2 + 8;
  // through the upper half of the digits, above the bars of + and = (at the middle it ran along them: "2 + 6 + 50 = 58"
  // read as bars, ch09 11/13)
  const s = path(line, `M${a} ${row.y - row.size * .5}L${b} ${row.y - row.size * .5}`, { stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, { d: 0 });
  draw(s, t0, .4);
  return s;
};
// a mistake: a red card with the wrong thing, struck through, and a short red note under it.
// strike: [i, j] = strike only pieces i..j (the wrong number; give those pieces fill RED and the rest ink).
// THE SERIES RULE (Video Director 11/13): the note is Ava's own words or nothing; the right answer is on screen too
// (dRight, on a spoken line); the finished mistake holds at least 2.5 s (minDur on the beat).
const dMistake = (p, items, x, y, t0, note, { size = 64, noteSize = 36, strike = null } = {}) => {
  const line = dLine(p, items.map(it => typeof it === 'string' ? { t: it, fill: strike ? INK : RED } : it), x, y, t0, { size, card: RED_BG });
  dStrike(line, t0 + .5, RED, strike || undefined);
  if (note) dText(p, note, x, y + size * .95 + noteSize * .6, t0 + .8, { size: noteSize, fill: RED });
  return line;
};
// the right answer beside a mistake: an orange answer card with a green ✓ after it
const dRight = (p, items, x, y, t0, { size = 64, anchor = 'middle' } = {}) => {
  const line = dLine(p, items, x, y, t0, { size, card: ORANGE_BG, anchor });
  const right = line._card ? line._card.x + line._card.w : x;
  dTick(p, right + 44, y - size * .3, t0 + .4);
  return line;
};
// a check mark beside something right
const dTick = (p, x, y, t0, color = '#2e7d32') => {
  const t = path(p, `M${x - 22} ${y}l16 18l32 -38`, { stroke: color, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, { d: 0 });
  draw(t, t0, .4);
  return t;
};

/* A NUMBER LINE from `from` to `to` drawn between x0 and x1 at y. ticks: values with a tick; labels: values with a
   number under them. Returns { g, xOf(v), dot(v, t0, opts), mark(v, t0, opts) }. */
const dNumberLine = (p, { x0 = 260, x1 = 1340, y = 420, from, to, ticks = [], labels = [], t0 = 0, size = 40, color = INK } = {}) => {
  const g = G(p, {});
  const xOf = v => x0 + (v - from) / (to - from) * (x1 - x0);
  const axis = path(g, `M${x0 - 40} ${y}H${x1 + 40}`, { stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }, { d: 0 });
  draw(axis, t0, .6);
  ticks.forEach((v, k) => { const tk = path(g, `M${xOf(v)} ${y - 18}V${y + 18}`, { stroke: color, 'stroke-width': 4, fill: 'none' }, { d: 0 }); draw(tk, t0 + .3 + k * .05, .25); });
  labels.forEach(v => dText(g, Number(v).toLocaleString('en-US'), xOf(v), y + 18 + size * 1.1, t0 + .4, { size, fill: color, weight: 700 }));
  const dot = (v, t, { fill = BLUE, r = 16, label = null, labelY = -44, labelSize = 40 } = {}) => {
    const d = G(g, { x: xOf(v), y, o: 0, s: .3 });
    mk('circle', { cx: 0, cy: 0, r, fill, stroke: '#fff', 'stroke-width': 4 }, d);
    if (label != null) T(d, String(label), { x: 0, y: labelY, size: labelSize, fill, anchor: 'middle', weight: 800 });
    tw(d, { o: 1, s: 1 }, t, .45, back);
    return d;
  };
  // a coloured band along the line from a to b (an "in here" zone)
  const zone = (a, b, t, fill = SUN_BG) => {
    const r = mk('rect', { x: xOf(a), y: y - 26, width: xOf(b) - xOf(a), height: 52, rx: 14, fill }, g);
    g.insertBefore(r, g.firstChild); put(r, { o: 0 }); show(r, t, .5);
    return r;
  };
  return { g, xOf, dot, zone };
};
// a curved jump arrow from (x1, y1) to (x2, y2), bulging up by `lift`, drawn on at t0
const dJump = (p, x1, y1, x2, y2, t0, { color = ORANGE, lift = 90, dur = .7 } = {}) => {
  const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - lift;
  const a = path(p, `M${x1} ${y1}Q${mx} ${my} ${x2} ${y2}`, { stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, { d: 0 });
  draw(a, t0, dur);
  const ang = Math.atan2(y2 - my, x2 - mx), L = 22;
  const head = path(p, `M${x2} ${y2}L${x2 - L * Math.cos(ang - .45)} ${y2 - L * Math.sin(ang - .45)}M${x2} ${y2}L${x2 - L * Math.cos(ang + .45)} ${y2 - L * Math.sin(ang + .45)}`,
    { stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, { d: 0 });
  draw(head, t0 + dur * .9, .2);
  return a;
};

/* THE TITLE CARD every video opens with (beat 'intro': "<title>. [[sub]]<subtitle>.") */
const titleBeat = (lesson, title, sub) => (m) => {
  // on its own panel, with no fade at the end: the next beat's cut takes it away (Video Director 11/13 — the subtitle
  // faded out while Ava was still reading it, then the board stood empty)
  const g = G(panel(0), { o: 0, y: 24 });
  mk('rect', { x: 230, y: 210, width: 1140, height: 300, rx: 40, fill: SUN_BG }, g);
  T(g, `Math Module 5 · ${lesson}`, { x: 800, y: 290, size: 34, fill: '#8a5a00', anchor: 'middle', weight: 700 });
  T(g, title, { x: 800, y: 410, size: title.length > 22 ? 70 : title.length > 18 ? 80 : 96, weight: 800, anchor: 'middle', fill: BLUE });   // 11/20: 'Area model: the boxes' at 96 ran edge to edge
  GROUP.slice(0, 4).forEach((c, i) => mk('circle', { cx: 680 + i * 80, cy: 466, r: 16, fill: c }, g));
  tw(g, { o: 1, y: 0 }, .2, 1.1, out);
  dText(g.parentNode, sub, 800, 580, m('sub'), { size: 40, fill: COL.dim });
};
/* THE "REMEMBER" CARD every video ends with: numbered steps at their marks, then "Now you try." at [[end]]
   (lines = [['Cover the zeros.', 'w1'], …]; none for a video that ends on "Now you try." alone)
   rows = which GROUP colours the rows take (11/23 Video Director, video 12: row 3 was purple, the colour that video
   gives its 2 jars of 44; the default keeps every other video as it was) */
const rememberBeat = (lines = [], { rows = [0, 1, 2, 3, 4, 5, 6, 7, 8] } = {}) => (m) => {
  const p = panel(0);
  const top = lines.length ? 250 : 380;
  if (lines.length) dText(p, 'Remember', 800, 120, .3, { size: 52, fill: BLUE, weight: 800 });
  lines.forEach(([str, mark], i) => {
    const g = G(p, { x: -16, y: top + i * 132, o: 0 });
    mk('rect', { x: 250, y: -70, width: 1100, height: 108, rx: 26, fill: GROUP_BG[rows[i]] }, g);
    mk('circle', { cx: 300, cy: -16, r: 30, fill: GROUP[rows[i]] }, g);
    T(g, String(i + 1), { x: 300, y: -4, size: 34, fill: '#ffffff', weight: 700, anchor: 'middle' });
    T(g, str, { x: 370, y: 0, size: 44, weight: 600 });
    tw(g, { o: 1, x: 0 }, m(mark), .6);
  });
  const y = top + lines.length * 132 + 40;
  const g = G(p, { o: 0, s: .8, x: 800, y });
  T(g, '✏️ Now you try.', { x: 0, y: 8, size: 64, weight: 800, anchor: 'middle', fill: BLUE });
  tw(g, { o: 1, s: 1 }, m('end'), .5, back);
};

/* ═══════════════════════════════════════════════════════
   HIS MODULE 5 BOARD (Lessons 5.1–5.7: his board notes, his Notebook ink 11/16–11/19, last year's Test Review)
   His marks: the 1-digit number circled in BLUE, the answer ringed in RED, regrouped numbers small on top (ORANGE,
   "Put 4 on top."), numbered steps in teal circles ("1 Multiply first: …"), the question of a story underlined.
═══════════════════════════════════════════════════════ */
const GREEN = '#2e9d4f';          // his green line under each group of blocks (Test Review)
const PEN_BLUE = '#1d4fd8';       // his blue pen: the circled 1-digit number
const FONT_STORY = '"Avenir Next", Arial, sans-serif';

// a hand-drawn ring (an ellipse drawn on) around a box: centre cx, cy; size w × h
const dRing = (p, cx, cy, w, h, t0, color = RED, { width = 5, dur = .6 } = {}) => {
  const rx = w / 2, ry = h / 2;
  const e = path(p, `M${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx - .1} ${cy - 6}`, { stroke: color, 'stroke-width': width, fill: 'none' }, { d: 0 });
  draw(e, t0, dur);
  return e;
};

// his numbered step: a teal circle with the number, popping in at t0 (centre x, y)
const dBadge = (p, n, x, y, t0, { r = 30 } = {}) => {
  const g = G(p, { x, y, o: 0, s: .6 });
  mk('circle', { cx: 0, cy: 0, r, fill: TEAL }, g);
  T(g, String(n), { x: 0, y: r * .4, size: r * 1.2, fill: '#ffffff', weight: 700, anchor: 'middle' });
  tw(g, { o: 1, s: 1 }, t0, .45, back);
  return g;
};
// a numbered line of his board: the badge at x, the line's pieces starting at x + 56 (baseline y)
const dStepLine = (p, n, items, x, y, t0, { size = 60, card = null } = {}) => {
  dBadge(p, n, x, y - size * .34, t0, { r: size * .48 });
  return dLine(p, items, x + size * .48 + 34, y, t0 + .15, { size, anchor: 'start', card });
};
// show pieces ks of a line only at t (a number arrives when the voice says it)
const dLater = (line, ks, t) => ks.forEach(k => { put(line.row[k], { o: 0 }); show(line.row[k], t, .4); });

/* THE SHORT WAY, written up and down (Lessons 5.5–5.6). x = the centre of the ONES column, y = the big number's
   baseline. Returns { n: digit els by place from the right (0 = ones), a: the 1-digit number (in its blue circle),
   top(i, d, t): a regrouped number small over place i; ans(i, str, t): writes str under the line ending at place i
   (a 2-digit last step "10" fills places i and i + 1); ring(places, t): the red ring around the answer;
   hl(i, t): pops the digit at place i and the circled number together ("multiply these"); col, rowY }. */
const dVMult = (p, a, n, x, y, t0, { size = 96, col = 80, ansPlaces = null, circleT = null } = {}) => {
  const g = G(p, { o: 0 });
  show(g, t0, .5);
  const ds = String(n).split(''), L = ds.length;
  const cx = i => x - i * col;
  const nEl = ds.map((d, k) => T(g, d, { x: cx(L - 1 - k), y, size, anchor: 'middle', weight: 600, font: MATH })).reverse();
  const y2 = y + size * 1.2, y3 = y2 + size * 1.4;
  const wide = Math.max(L + 1, ansPlaces || 0);
  T(g, '×', { x: cx(wide) + col * .25, y: y2, size: size * .9, anchor: 'middle', weight: 600, font: MATH });
  const aG = G(g, { x: cx(0), y: y2 - size * .34 });
  // his blue circle round the 1-digit number, drawn on when the voice says "Circle the …" (circleT), else at once
  const R = size * .52, circ = path(aG, `M${R} 0A${R} ${R} 0 1 1 ${R - .1} -4`, { stroke: PEN_BLUE, 'stroke-width': 5, fill: 'none' }, { d: 0 });
  draw(circ, circleT != null ? circleT : t0, .5);
  T(aG, String(a), { x: 0, y: size * .34, size, anchor: 'middle', weight: 600, font: MATH });
  path(g, `M${cx(wide) - col * .2} ${y2 + size * .42}H${cx(0) + col * .62}`, { stroke: INK, 'stroke-width': 5, fill: 'none' });
  const ansEls = {};
  const top = (i, d, t) => {
    const e = T(p, String(d), { x: cx(i), y: y - size * 1.0, size: size * .58, anchor: 'middle', weight: 800, fill: ORANGE, font: MATH, o: 0 });
    put(e, { s: .5 }); tw(e, { o: 1, s: 1 }, t, .45, back);
    return e;
  };
  const ans = (i, str, t) => {
    const cs = String(str).split('');
    return cs.map((c, k) => {
      const place = i + (cs.length - 1 - k);
      const e = T(p, c, { x: cx(place), y: y3, size, anchor: 'middle', weight: 700, font: MATH, o: 0 });
      ansEls[place] = e;
      show(e, t + k * .12, .4);
      return e;
    });
  };
  // the ring sits clear of the line under the × (11/20: at size × 1.25 its top touched the line)
  const ring = (places, t) => dRing(p, x - (places - 1) * col / 2, y3 - size * .3, places * col + size * .6, size * 1.1, t, RED);
  const hl = (i, t) => { dNudge(nEl[i], t); dNudge(aG, t + .05); };
  return { g, n: nEl, a: aG, top, ans, ring, hl, col, cx, rowY: [y, y2, y3], size, ansEls };
};

/* PARTIAL PRODUCTS, stacked (Lesson 5.4 board notes "Start with the ones."): the big number on top, × the 1-digit
   number (blue circle), a line, then one partial product a row, ones first, each with its "← 4 × 7" in the margin, a
   + on the last, a line and the sum ringed. x = the ones column's centre, y = the top number's baseline.
   row(k, str, label, t): row k (0 = the first under the line); sum(str, rows, t): the line and the sum. */
const dPartial = (p, a, n, x, y, t0, { size = 84, col = 70, rows = 2, places = 3 } = {}) => {
  const g = G(p, { o: 0 });
  show(g, t0, .5);
  const ds = String(n).split(''), L = ds.length;
  const cx = i => x - i * col;
  const nEl = ds.map((d, k) => T(g, d, { x: cx(L - 1 - k), y, size, anchor: 'middle', weight: 600, font: MATH })).reverse();
  const y2 = y + size * 1.15, gap = size * 1.18, ry = k => y2 + size * 1.3 + k * gap;
  T(g, '×', { x: cx(places) + col * .2, y: y2, size: size * .9, anchor: 'middle', weight: 600, font: MATH });
  const aG = G(g, { x: cx(0), y: y2 - size * .34 });
  mk('circle', { cx: 0, cy: 0, r: size * .52, fill: 'none', stroke: PEN_BLUE, 'stroke-width': 5 }, aG);
  T(aG, String(a), { x: 0, y: size * .34, size, anchor: 'middle', weight: 600, font: MATH });
  path(g, `M${cx(places) - col * .3} ${y2 + size * .4}H${cx(0) + col * .62}`, { stroke: INK, 'stroke-width': 5, fill: 'none' });
  const rowEls = [];
  const row = (k, str, label, t, { fill = INK, last = false } = {}) => {
    const cs = String(str).split(''), els = [];
    cs.forEach((c, j) => { const e = T(p, c, { x: cx(cs.length - 1 - j), y: ry(k), size, anchor: 'middle', weight: 700, fill, font: MATH, o: 0 }); show(e, t + j * .1, .4); els.push(e); });
    if (last) { const pl = T(p, '+', { x: cx(places) + col * .2, y: ry(k), size: size * .9, anchor: 'middle', weight: 600, font: MATH, o: 0 }); show(pl, t, .4); }
    if (label) { const lb = T(p, label, { x: cx(0) + col * .9, y: ry(k) - size * .08, size: size * .5, anchor: 'start', weight: 600, fill: COL.dim, font: MATH, o: 0 }); show(lb, t + .3, .4); els.label = lb; }
    rowEls[k] = els;
    return els;
  };
  const sum = (str, rowsN, t) => {
    const yl = ry(rowsN - 1) + size * .4;
    const l = path(p, `M${cx(places) - col * .3} ${yl}H${cx(0) + col * .62}`, { stroke: INK, 'stroke-width': 5, fill: 'none' }, { d: 0 });
    draw(l, t, .4);
    const ys = yl + size * 1.15, cs = String(str).split('');
    const els = cs.map((c, j) => { const e = T(p, c, { x: cx(cs.length - 1 - j), y: ys, size, anchor: 'middle', weight: 700, font: MATH, o: 0 }); show(e, t + .3 + j * .1, .4); return e; });
    dRing(p, x - (cs.length - 1) * col / 2, ys - size * .34, cs.length * col + size * .6, size * 1.25, t + .5 + cs.length * .1, RED);
    return els;
  };
  return { g, n: nEl, a: aG, row, sum, rowEls, cx, ry, size };
};

/* THE AREA MODEL, his boxes (Lessons 5.2–5.3 board notes + his ink 11/16): one box a part, side by side; the side
   number on the left, each part's number on top, and inside each box his two lines: "4 × 10" (small, blue) over its
   product. x, y = the boxes' top-left; widths = each box's width; h = their height.
   top(i, str, t, fill): the part's number over box i · inside(i, expr, prod, t): his two lines in box i ·
   fill(i, color, t): box i fills with a soft colour · side: the side number's element · boxX(i), w, h */
const dArea = (p, side, widths, x, y, t0, { h = 220, size = 64, sideFill = INK } = {}) => {
  const g = G(p, { o: 0 });
  show(g, t0, .5);
  const xs = widths.reduce((a, w, i) => (a.push(i ? a[i - 1] + widths[i - 1] : x), a), []);
  const fills = widths.map((w, i) => { const r = mk('rect', { x: xs[i], y, width: w, height: h, fill: '#ffffff', 'fill-opacity': 0 }, g); return r; });
  widths.forEach((w, i) => mk('rect', { x: xs[i], y, width: w, height: h, fill: 'none', stroke: INK, 'stroke-width': 5 }, g));
  const sideEl = T(g, String(side), { x: x - 30, y: y + h / 2 + size * .34, size, anchor: 'end', weight: 700, fill: sideFill, font: MATH });
  const top = (i, str, t, fill = RED) => { const e = T(p, String(str), { x: xs[i] + widths[i] / 2, y: y - 26, size, anchor: 'middle', weight: 700, fill, font: MATH, o: 0 }); show(e, t, .4); return e; };
  const inside = (i, expr, prod, t, { tProd = null, fill = INK } = {}) => {
    const cx = xs[i] + widths[i] / 2, out = {};
    if (expr) { out.expr = T(p, expr, { x: cx, y: y + h * .38, size: size * .62, anchor: 'middle', weight: 700, fill: PEN_BLUE, font: MATH, o: 0 }); show(out.expr, t, .4); }
    if (prod != null) { out.prod = T(p, String(prod), { x: cx, y: y + h * .78, size: size * .95, anchor: 'middle', weight: 800, fill, font: MATH, o: 0 }); show(out.prod, tProd != null ? tProd : t + .6, .4); }
    return out;
  };
  const fill = (i, color, t) => { put(fills[i], { c_fill: color }); fills[i].setAttribute('fill-opacity', 1); put(fills[i], { o: 0 }); show(fills[i], t, .5); };
  return { g, side: sideEl, top, inside, fill, boxX: i => xs[i], w: widths, h, x, y };
};

/* THE AREA MODEL ON A GRID (the test's picture, item 1 kind): rows × cols unit squares, the parts shaded two grays
   that turn to colour, a bracket and number over each part, a bracket and number at the left side.
   parts = [10, 4]; returns { color(i, fill, t), label els: tops[], side, cell, x, y, w, h } */
const dAreaGrid = (p, rows, parts, x, y, t0, { cell = 44, size = 58 } = {}) => {
  const g = G(p, { o: 0 });
  show(g, t0, .5);
  const cols = parts.reduce((a, b) => a + b, 0), W = cols * cell, H = rows * cell;
  const grays = ['#b9c0c7', '#8e979f', '#c9ced3'];
  let px = x;
  const shades = parts.map((pp, i) => { const r = mk('rect', { x: px, y, width: pp * cell, height: H, fill: grays[i % 3] }, g); put(r, { c_fill: grays[i % 3] }); px += pp * cell; return r; });
  let d = '';
  for (let c = 1; c < cols; c++) d += `M${x + c * cell} ${y}v${H}`;
  for (let r = 1; r < rows; r++) d += `M${x} ${y + r * cell}h${W}`;
  path(g, d, { stroke: '#ffffff', 'stroke-width': 1.5, 'stroke-opacity': .75 });
  mk('rect', { x, y, width: W, height: H, fill: 'none', stroke: INK, 'stroke-width': 4 }, g);
  px = x;
  const tops = parts.map((pp, i) => {
    const w = pp * cell;
    path(g, `M${px + 4} ${y - 8}v-14H${px + w - 4}v14`, { stroke: INK, 'stroke-width': 3, fill: 'none' });
    const e = T(g, String(pp), { x: px + w / 2, y: y - 36, size, anchor: 'middle', weight: 700, font: MATH });
    if (i < parts.length - 1) path(g, `M${px + w} ${y}v${H}`, { stroke: INK, 'stroke-width': 4 });
    px += w;
    return e;
  });
  path(g, `M${x - 8} ${y + 4}h-14V${y + H - 4}h14`, { stroke: INK, 'stroke-width': 3, fill: 'none' });
  const side = T(g, String(rows), { x: x - 36, y: y + H / 2 + size * .34, size, anchor: 'end', weight: 700, font: MATH });
  const color = (i, fill, t) => tw(shades[i], { c_fill: fill }, t, .6);
  return { g, tops, side, color, cell, x, y, w: W, h: H, shades };
};

/* ONE GROUP OF BASE-TEN BLOCKS in a row (flats, then rods, then cubes, like the test's picture), drawn around
   (x, y) = the row's left end, middle height. Each block pops in at t0 + k·gap. Returns { all, flats, rods, cubes,
   w (the row's width), labelAll(t, fill): his numbers written on the blocks ("100", "10", "1") }. */
const dBlockRow = (p, h, tn, o, x, y, t0, { flat = 96, gap = .08, rodGap = 16 } = {}) => {
  const els = { flats: [], rods: [], cubes: [], all: [] };
  let cx = x, k = 0;
  const pop1 = e => { put(e, { s: .6 }); tw(e, { o: 1, s: 1 }, t0 + k++ * gap, .35, back); els.all.push(e); };
  for (let i = 0; i < h; i++) { const e = dFlat(p, cx + flat / 2, y, flat); pop1(e); e._lab = [cx + flat / 2, y, '100']; els.flats.push(e); cx += flat + 12; }
  if (h) cx += 10;
  const rodW = flat * .15;
  for (let i = 0; i < tn; i++) { const e = dRod(p, cx + rodW / 2, y, flat); pop1(e); e._lab = [cx + rodW / 2, y - flat / 2 - 12, '10']; els.rods.push(e); cx += rodW + rodGap; }
  if (tn) cx += 10;
  const cs = flat * .15;
  for (let i = 0; i < o; i++) { const e = dCube(p, cx + cs / 2, y + flat / 2 - cs / 2, cs); pop1(e); e._lab = [cx + cs / 2, y + flat / 2 - cs - 12, '1']; els.cubes.push(e); cx += cs + 12; }
  els.w = cx - x;
  // his numbers on the blocks (Test Review: "100", "10", "10", "1" written in blue)
  els.labelAll = (t, fill = PEN_BLUE, step = .35) => [...els.flats, ...els.rods, ...els.cubes].map((e, j) => {
    const [lx, ly, s] = e._lab;
    const e2 = T(p, s, { x: lx, y: ly + (s === '100' ? 12 : 0), size: s === '100' ? 34 : 26, anchor: 'middle', weight: 800, fill, font: MATH, o: 0 });
    show(e2, t + j * step, .3);
    return e2;
  });
  return els;
};
// his green line under a group (Test Review), drawn on at t0
const dGroupLine = (p, x1, x2, y, t0) => { const l = path(p, `M${x1} ${y}H${x2}`, { stroke: GREEN, 'stroke-width': 6, fill: 'none' }, { d: 0 }); draw(l, t0, .5); return l; };

/* A STORY on the board, his way (Lesson 5.7: "Underline the question."): the text wrapped in a width, the question
   (the last sentence, or q = its first words) underlined in red at tU. Returns { g, lines, bottom, underline(t),
   word(str): the element of a word (to pop it) }. */
const storyW = (str, size) => { ctx2d.font = `500 ${size}px ${FONT_STORY}`; return ctx2d.measureText(str).width; };
const dStory = (p, text, x, y, t0, { w = 1300, size = 46, lead = 1.32, q = null } = {}) => {
  const g = G(p, { o: 0 });
  show(g, t0, .5);
  const words = text.split(' ');
  const qStart = q ? text.indexOf(q) : text.search(/[^.?!]*\?$/);
  let line = 0, cx = x, pos = 0;
  const sp = storyW(' ', size), out = [];
  words.forEach(wd => {
    const ww = storyW(wd, size);
    if (cx + ww > x + w && cx > x) { line++; cx = x; }
    const e = T(g, wd, { x: cx, y: y + line * size * lead, size, font: FONT_STORY, weight: 500, fill: INK });
    out.push({ e, wd, x: cx, w: ww, line, inQ: qStart >= 0 && pos >= qStart });
    cx += ww + sp; pos += wd.length + 1;
  });
  const underline = t => {
    const byLine = {};
    out.filter(o => o.inQ).forEach(o => { const b = byLine[o.line] || (byLine[o.line] = [o.x, o.x + o.w]); b[0] = Math.min(b[0], o.x); b[1] = Math.max(b[1], o.x + o.w); });
    Object.entries(byLine).forEach(([ln, [a, b]], k) => {
      const yy = y + (+ln) * size * lead + size * .22;
      const u = path(g, `M${a} ${yy}H${b}`, { stroke: RED, 'stroke-width': 5, fill: 'none' }, { d: 0 });
      draw(u, t + k * .35, .4);
    });
  };
  const word = str => (out.find(o => o.wd.replace(/[.,?!]/g, '') === str) || {}).e;
  return { g, lines: line + 1, bottom: y + line * size * lead, underline, word, words: out };
};

// his red arrow pointing left over the work ("Start with the ones." — his Notebook 11/17: ← over each Try it)
const dLeftArrow = (p, x1, x2, y, t0, color = RED) => {
  const a = path(p, `M${x2} ${y}H${x1}`, { stroke: color, 'stroke-width': 6, fill: 'none' }, { d: 0 });
  draw(a, t0, .5);
  const h = path(p, `M${x1 + 22} ${y - 16}L${x1} ${y}L${x1 + 22} ${y + 16}`, { stroke: color, 'stroke-width': 6, fill: 'none' }, { d: 0 });
  draw(h, t0 + .45, .2);
  return a;
};

/* 11/20 (Video Director): THE SERIES' MISTAKE MARKS
   · dSlash — a red diagonal slash through one short thing (a digit, a small number): a level strike through a single
     digit sat on its own bars and read as nothing at half size. (cx, cy) = its centre, w × h = its box.
   · dNote — the red note under a mistake: Ava's own words, 44 px bold, the same in every video.
   · On the mistake beat the RIGHT answer comes first (left, or on top) with a green ✓ and no red ring; red is only for
     the heading, the struck mistake and the note. */
const dSlash = (p, cx, cy, w, h, t0, color = RED) => {
  const s = path(p, `M${cx - w / 2} ${cy + h / 2}L${cx + w / 2} ${cy - h / 2}`, { stroke: color, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none' }, { d: 0 });
  draw(s, t0, .35);
  return s;
};
const dNote = (p, str, x, y, t0, { anchor = 'middle' } = {}) => dText(p, str, x, y, t0, { size: 44, fill: RED, weight: 700, anchor });
