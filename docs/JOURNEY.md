# The Long Table — the journey

The piece is now **one continuous walk through one 3D world**, beat by beat, like a talk you
press Next through. The 2D courses (`js/chapters/record|spread|table|grace|leftovers.js`) stay as
optional **side doors** ("second helpings") reachable from beats via `ctx.sideDoor()`.

The structural idea: **the long table is time.** Every seat is one year. The head of the table
is tonight, 2026; seat `i` is the year `2026 - i`, alternating sides, two seats per 0.78 m row.
`W.yearPos(year)` → `{x, z, side}`; `W.zOfYear(year)`. The dressed table (linen, place settings,
candles every 1.56 m) runs to about 1640 (`W.FAR_END` ≈ -150.2). Act I builds 1640→1621 and
everything beyond it.

Flow: e-card cold open (it burns) → strike a match → the table lights itself to the horizon →
**Act I The Record → Act II The Spread → Act III The Table → Act IV Grace → Act V The Night**
(Act V is done: blow out the candle, the breath runs back through the years, the sky, the
Haudenosaunee Thanksgiving Address constellations, "Now go find your people", credits).

Tone: as in DESIGN.md. Captions are SHORT (≤ ~10 words, use `\n` for the line break, `*text*`
for gold italics). Notes are 1–3 plain sentences. Every number is a fact we can stand behind,
and legend is labeled as legend. The visual should make the fact physical: scale, counts,
distance, light. One big idea per beat.

## Files and rules for an act builder
- Your files: `js/acts/actN-<id>.js` and `css/actN.css`. Nothing else. No git commands.
- Do not edit `js/core/*` (world, journey, app…). If you need something, build it inside your act
  with `W.T` (THREE r128) and the helpers below, and list the wish in your report.
- Put meshes in the `group` you get in `build(group, W)`; the engine shows it only while your act
  is current. **Do not put lights in your group** (toggling light count recompiles every shader
  and hitches). If you need a light, add it to `W.scene` in `build` with intensity 0 and animate
  intensity in your beats; set it back to 0 in `exit`.
- Every beat must be **re-enterable from either direction** (Back exists): `enter` sets up the
  full state that beat needs; per-beat things go through `ctx` (auto-cleaned on exit). Act-level
  state you change on `W` (sky, fog, floor, candles, aftermath, mood) must be restored in the
  act's `exit(W, nextAct)`.
- Performance: instancing for anything repeated; no per-frame allocations in hot loops; keep
  draw calls modest. It must still run on a phone. Respect `LT.util.reducedMotion`.
- Test: `require('playwright')`, `chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] })`,
  `page.addInitScript(() => { window.LT_FORCE_WORLD = true; })` (otherwise the software renderer
  gets the 2D fallback), go to `http://localhost:8765/index.html#journey`, click `.skip`, wait,
  then `LT.journey.go(LT.journey.actStart('<actId>'))` and `LT.journey.next()`. SwiftShader runs at
  a few fps: wait generously (tweens are wall-clock). Screenshot 1100x680 and iPhone 13. Check the
  console. If the server on :8765 is down, start `python3 -m http.server 8765` in the repo root.

## Act API
```js
LT.journey.act({
  id: 'record', order: 1, numeral: 'I', course: 'First Course', title: 'The Record', music: 'record',
  layout: '',                 // default caption layout: '' (bottom-left) | 'center' | 'top'
  build(group, W) {},         // once, at journey start: make meshes (hidden until your act)
  enter(W, prevAct) {},       // when the act becomes current
  exit(W, nextAct) {},        // restore anything you changed on W
  beats: [ { ... } ],
});
```
Beat:
```js
{ id: 'unique-id', caption: 'Every seat\nis a *year.*', note: '…', cite: 'Source, year',
  shot: 'menu' | { pos: [x,y,z], look: [x,y,z], fov: 34 },  dur: 2.6, ease: 'inOutCubic', lift: 0.2,
  mood: { dim: 1, soft: 0, cursor: 0.4, moon: 0 },  // world look (eased)
  layout: 'center', lock: 'hint text' | true,  auto: 6000,
  enter(ctx, dir) {}, exit(ctx, dir) {} }
```
`ctx`: `W, T, group, act, beat, dir, alive`, `later(fn, ms)`, `wait(ms)` (never resolves after
exit), `frame(fn(dt, t, raw))`, `on(target, type, fn)`, `sound(loopHandle)`, `cleanup(fn)`,
`lock(hint)` / `unlock()` (gate Next until the visitor does the thing), `next()`,
`caption(text)`, `note(text)`, `hint(text)`, `button(label, fn, {ghost})`, `input({id, label,
placeholder, submit, onSubmit})`, `overlay(cls)` → a DOM layer (add class `jr-interactive` to
anything clickable), `label(pos | () => pos, text, {cls: ''|'glow'|'year', dx, dy})` → a DOM tag
pinned to a world point, `sideDoor(label, chapterId)`, `shot(s, o)`.

World `W` (see `js/core/world.js`): `T` (THREE), `scene`, `camera`, `TOP` (0.76), `HALF`, `SEAT`,
`NEAR_END`, `FAR_END`, `LOW` (phone), `rnd` (seeded), `mats` (linen, runner, pewter, china, gold,
glass, roemer, wine, wax, wood, floor, turkey, cran, pumpkin, lemon, grape, bread, pie, crust,
napkin, stem, leaf, frill, herb), `lathe(points, segs)`, `merge(geos)`, `box(w,h,d,x,y,z)`,
`instanced(geo, mat, [{p, r, s, c}], castShadow)`, `canvasTex(w, h, draw, repeat)`,
`cardTex(name)`, `yearPos(y)`, `zOfYear(y)`, `shot(name|obj, {dur, ease, lift})`,
`fly({points, looks, dur, fov, ease, onUpdate})` (Catmull-Rom camera flight), `camState()`,
`onFrame(fn)` → off, `project(v3)` → `{x, y, on}`, `cursorHit()`, `cursorRay()`,
`mood({dim, soft, cursor, moon})`, `sky(0..1)` (stars), `fog(density)` (default 0.09),
`floor(bool)`, `post({exposure, bloom})`, `candles` (table candles: `{pos, lit, target}`),
`ignite({from, gap, quiet})`, `extinguish({gap, farFirst})`, `setCandles(v)`, `hero` (the
candle at the head: `light() out() blow(v) burn(v) worldPos() screenPos()`), `addFlame(pos,
{size})` → `{light(), out(), move(p)}`, `makeCandle(parent, pos, {height, scale})` →
`{group, flame}`, `setCard(i, name)` (family place cards, seats 0–9), `setChair(name)`,
`setYourCard(name)`, `aftermath(bool)`, `SHOTS` (named camera shots).

Seats: `W.yearPos(2026)` is the head-of-table seat on the left. The family place cards
(Grandma Ruth, Uncle Dale, Aunt Linda, Mom, Dad, Grandpa Joe, Tyler, Skye, Maya, Benji) are on
seats 0–9 near the head; the hero candle is at (-0.24, TOP, 0.42); the feast (turkey on a
pewter platter at (0.12, TOP, -0.2), cranberry bowl, pie, rolls, a half-peeled lemon, grapes, a
roemer glass) is at the head too.

## Space
- **Act I** owns the length of the table (year markers, era props along it) and everything past
  the far end: the outdoor 1621 harvest (z < -150), the land before (z < -170), the sea.
- **Acts II, III, IV** share the head of the table (z from +1 to about -4); each hides with its
  group. Act II's fryer lives "on the driveway": in the dark off to the side, around x = +7, z = +3.
- **Act IV** may use the air above the table (y 2–80) for the web of hands.
- **Act V** (done) uses the whole table and the sky.

## The script (build these; improve them where your eye says so)

### Act I · The Record (`record`, music `record`) — about 12 beats
1. *Every seat at this table is a year.* Camera low at the head; year labels on the nearest
   places (2026, 2025, 2024…). Note: this end is tonight; far enough down is 1621.
2. *Let's walk back.* A long camera flight down the table with a big rolling year counter
   (DOM overlay); era props pass by on the table (phones near the head, 2007 and after; a TV
   dinner tray around 1953 is legend-ish, skip it unless labeled; a green bean casserole at
   1955; gas-lamp era; then only candles); key years glow as you pass.
3. *1621.* The walls fall away (`W.floor(false)`, `W.sky(1)`, `W.fog(0.02)`): rough plank
   trestle tables outdoors, a fire, the night. Note with Winslow's words (public domain):
   "our harvest being gotten in, our governor sent four men on fowling, that so we might after
   a special manner rejoice together…" — Edward Winslow, December 1621.
4. *About 90 Wampanoag men came, with Massasoit. About 50 English were left.* 140 figures,
   abstract and dignified (warm light-figures, never caricature), the 90 arriving from the dark.
   They brought five deer. Three days.
5. *Of 18 English women, 4 survived the first winter.* Four figures; about 140 plates appear
   beside them: historians think they did much of the cooking, for ~140 people, three days.
6. *Nobody called it Thanksgiving.* Fowl and five deer; corn; likely shellfish and eels; no pie
   (no ovens, little flour), no forks.
7. *Go further back.* Past the end of the table, the land: *People of the First Light.* The
   Wampanoag had lived here about 12,000 years. Hundreds of village lights in the dark.
8. *1616–1619.* An epidemic, likely brought by European sailors, swept the coast. In some
   communities nine of every ten people died. The lights go out until about one in ten remain.
   The music thins to almost nothing (`LT.music.param('level', …)`). Brief. Restrained.
9. *Tisquantum.* One light: kidnapped in 1614 by Thomas Hunt, taken across the sea to Málaga,
   Spain; reached England; came home in 1619 to find his village, Patuxet, empty. In 1620 the
   English built Plymouth on it. (A light crossing a dark sea and back.)
10. *Fifty-four years later, their sons were at war.* 1675–76, King Philip's War: Metacom,
   Massasoit's son, against the colonies; one of the deadliest wars per capita in American
   history. The table splits apart at 1676.
11. *Then it became a holiday.* Ride back up the table toward tonight, stopping briefly:
   1789 (Washington: Thursday, November 26; today's date match via `LT.util.today()`), 1863
   (Sarah Josepha Hale's 36-year campaign; letters to five presidents; Lincoln said yes, in the
   middle of the Civil War: "…all those who have become widows, orphans, mourners or sufferers
   in the lamentable civil strife"), 1924/1928 (Macy's; the balloons let go), 1939
   (Franksgiving: about half the states refused, Texas took both days), 1941 (Congress: the
   fourth Thursday), 1970 (Wamsutta Frank James's suppressed speech; the National Day of
   Mourning on Cole's Hill every year since — a single candle apart from the table).
12. *Both things are true at once.* Back at the head. A harvest shared by wary allies, and the
   beginning of a catastrophe. A holiday can hold more than one story. So can a family.
   Side door: `ctx.sideDoor('Read the full record', 'record')`.
Secret: something in 1939 (e.g. the calendars) → `LT.egg('franksgiving', …)` (already declared).

### Act II · The Spread (`spread`, music `spread`) — about 8 beats
1. *Now, the food.* Fly over the feast; pinned labels on dishes.
2. *Cranberries float.* The head of the table floods into a bog: thousands of instanced berries
   bob on dark water; the camera skims it. Each berry has small air pockets inside, so growers
   flood the bog and the harvest floats up. Tap the water to splash/drop berries (bounce: fresh
   ones bounce, the legend of "Peg-Leg" John Webb and his stairs).
3. *Benjamin Franklin preferred the turkey.* 1784 letter to his daughter: "a much more
   respectable bird" than the bald eagle, "a bird of courage". Turkey spotlit, turning.
4. *Uncle Dale has a fryer.* On the driveway: a pot of oil, a frozen turkey on a hook. Button:
   lower it. FIREBALL (3D fire, flash, light, shake, `LT.audio.sfx('boom')`). Then: Thanksgiving
   is the peak day for home cooking fires. Thaw it in the fridge (about a day per 4–5 pounds),
   dry it, fry outside, far from the house. Stat `fryerFires`.
5. *1955: green bean casserole.* Dorcas Reilly, Campbell's test kitchen; her recipe card is in
   the National Inventors Hall of Fame. Crispy onions rain down.
6. *1796: the first American cookbook.* Amelia Simmons, "American Cookery", with a pumpkin pie
   ("pompkin" pudding baked in a crust). Most canned pumpkin is Dickinson squash.
7. *Macaroni and cheese* — James Hemings, enslaved, trained as a chef in Paris, cooked at
   Jefferson's table. With dignity.
8. *Is there enough gravy?* The gravy boat pours; the table floods with gravy. *No. There is
   never enough gravy.* Side door: `ctx.sideDoor('Play with your food', 'spread')`.

### Act III · The Table (`table`, music `table`, `LT.music.param('tension', 0..1)`) — about 6 beats
1. *Everyone's here.* The family as paper cut-outs standing at their seats (render
   `LT.family.figure(id)` SVG to a canvas texture, or draw your own flat figures; Biscuit the dog
   too); name cards already exist. Overhead kitchen light snaps on (a light added to W.scene at
   build, intensity 0).
2. *It begins.* Speech bubbles (DOM, pinned with `ctx.label` or your own overlay) pop over
   heads with lines in each voice (see `js/chapters/table.js` for the cast's voices); a meat
   thermometer / pop-up timer in the turkey creeps toward 165°F; polka speeds up.
3. *(Optional mini-game)* Tap bubbles to change the subject for ~30 s; or "just watch".
4. *TOTAL CHAOS.* Everything at once: dog on the table, splats on the lens (`LT.fx.splat`),
   alarm, shake; then `LT.audio.sfx('scratch')`, freeze-frame, *Yep. That's us.*
5. *Grandma taps her glass.* Lights down to candlelight; `sfx('ting')` ×3. "Before pie… let's
   go around the table." Side door: `ctx.sideDoor('Survive dinner (the full game)', 'table')`.
   Set `LT.state.tableOutcome` if the visitor played.

### Act IV · Grace (`grace`, music `grace`, `LT.music.param('swell', 0..1)`) — about 9 beats
1. *Let's go around the table.* Each family member's line (reuse the voices in
   `js/chapters/grace.js`), each lighting a small candle at their seat (`W.makeCandle`). Short.
2. Grandma last: Grandpa Joe's place (seat 5's card says Grandpa Joe); "It's not sad. Well. It's
   a little sad. Pass the rolls."
3. *Is someone missing from your table this year?* Optional input → `LT.state.chair`,
   `W.setChair(name)`, a candle lights at that place. Skippable.
4. *What are you thankful for?* Input → `LT.state.thanks`; write it on your card
   (`W.setYourCard`) or a new card at the head. `LT.save()`.
5. *Thank and think are the same word.* Old English þanc: thought, remembrance.
6. *Pick one thing on your plate.* A cranberry. Threads of light run out to the hands behind it
   (grower, bees renting out to bogs, the glacier that carved the kettle bog, truck driver,
   shelf stocker, cashier, the Wampanoag who ate sasumuneash for millennia, rain, sun…), each
   spawning more, the camera pulling up until the web is a galaxy over the table: *You have
   never eaten a meal alone.* (A.J. Jacobs, Thanks a Thousand.) Stat `handsThanked`.
7. *Gratitude isn't "everything is fine".* Lincoln's 1863 proclamation held thanks and mourning
   together. Two candles: for what you have, for what you miss.
8. *People underestimate what a thank-you does.* Kumar & Epley (2018): writers underestimate
   how good it makes the other person feel and overestimate the awkwardness. Side door:
   `ctx.sideDoor('Write the letter', 'grace')`. (Emmons & McCullough 2003; Seligman et al. 2005.)
9. *Gratitude is a kind of attention.* It's where you choose to hold the light.
