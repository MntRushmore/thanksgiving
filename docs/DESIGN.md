# The Long Table — design brief

An interactive Thanksgiving in five courses: the history, the food, the chaos of the
family table, and what gratitude actually is. Static site, no build step, no external
assets except Google Fonts. Every sound is synthesized with Web Audio; every image is
drawn with SVG or canvas.

## The idea

**Gratitude is a kind of attention. It's where you choose to hold the light.**

The whole experience is art-directed as a *living Dutch Golden Age still life*: an
umber-black ground, chiaroscuro light, pewter, a half-peeled lemon, an overturned glass.
That's not arbitrary. The Pilgrims lived in Leiden, Holland, from 1609 to 1620. William
Brewster and Edward Winslow (who later wrote the only eyewitness account of the 1621
harvest feast) ran a printing press there. And the still-life genre of that exact moment
was about abundance *and* its passing (vanitas), which is what gratitude is about.

The signature mechanic: **your cursor is a candle.** The page is dark; the pointer casts a
warm, flickering pool of light (`LT.light`). Each course sets how dark the room is.

- Prelude: pitch dark. Strike a match, light the candle, the title appears.
- I. The Record (history): you illuminate what actually happened.
- II. The Spread (food): the dishes glow as you reach for them.
- III. The Table (chaos): someone flips on the overhead kitchen light. Garish. Loud.
- IV. Grace (gratitude): back to one candle. You light other people's.
- V. Leftovers (coda): you blow the candle out.

## Tone

Wild where it's funny, honest where it's heavy, never saccharine, never preachy. Write
plainly, like a good friend who reads a lot of history. Short sentences. Specific over
clever. No emoji. No "it's worth noting". Let the facts do the emotional work. When a
fact is uncertain or legendary, say so in the copy ("as the story goes", "historians
think"). Never invent a statistic.

## Courses (chapter ids are the URL hashes)

| # | id | Course | Title | Music scene | Owner file |
|---|----|--------|-------|-------------|------------|
| 0 | `prelude` | — | Strike a match | `prelude` | js/chapters/prelude.js |
| ½ | `menu` | — | Bill of Fare | `menu` | js/chapters/menu.js |
| 1 | `record` | First Course | The Record | `record` | js/chapters/record.js + css/record.css |
| 2 | `spread` | Second Course | The Spread | `spread` | js/chapters/spread.js + css/spread.css |
| 3 | `table` | Third Course | The Table | `table` | js/chapters/table.js + css/table.css |
| 4 | `grace` | Fourth Course | Grace | `grace` | js/chapters/grace.js + css/grace.css |
| 5 | `leftovers` | Dessert | Leftovers | `leftovers` | js/chapters/leftovers.js + css/leftovers.css |

### I. The Record — what actually happened in 1621, and in the 405 years after
Open with "The Postcard": the myth image (buckled hats, a neat table, the Pilgrims
hosting grateful natives) drawn as a garish vintage greeting card. Drag a lens (the
candle) over it to reveal the record underneath, annotated in ink. Then a scroll-driven
reel of years with a giant rolling year counter. Stops (all verified):
- Before: the Wampanoag ("People of the First Light") had lived there ~12,000 years.
  Giving thanks was woven through the year; the Aquinnah Wampanoag still hold Cranberry Day.
- 1614: Tisquantum (Squanto) kidnapped by Thomas Hunt, sold in Málaga, Spain; reached
  England; came home in 1619 to find his village, Patuxet, empty.
- 1616–1619: epidemic killed most of the coastal peoples (estimates often 75–90% in some
  communities). Visualize as 100 figures/lights going out. Heavy; earn it; keep it brief.
- 1620: Mayflower, 102 passengers, 66 days. They took corn from Native storage pits on Cape
  Cod. Built Plymouth on the site of Patuxet. About half died the first winter.
- March 1621: Samoset walks in and greets them in English. Then Tisquantum. Mutual-defense
  alliance with Massasoit (Ousamequin), whose people were weakened by disease and threatened
  by the Narragansett. Strategic on both sides.
- Autumn 1621: Winslow's letter (public domain): "our harvest being gotten in, our governor
  sent four men on fowling, that so we might after a special manner rejoice together..."
  About 90 Wampanoag men with Massasoit, about 50 English. Three days. The Wampanoag brought
  five deer. Of 18 adult English women, 4 survived the winter; historians think they did
  much of the cooking for ~140 people. It wasn't called Thanksgiving.
- 1637: colonies proclaimed days of thanksgiving for harvests, and for military victories,
  including over the Pequot.
- 1675–76: King Philip's War. Metacom, Massasoit's son, vs. the colonies. One of the
  deadliest wars per capita in American history. Fifty-four years after the feast.
- 1789: Washington proclaims a national day of thanksgiving for Thursday, November 26.
  (Today is Thursday, November 26, 2026 — the same date.)
- 1827–1863: Sarah Josepha Hale (yes, "Mary Had a Little Lamb") campaigns for 36 years,
  writing to five presidents. Lincoln proclaims it in October 1863, mid–Civil War, asking
  for thanks *and* care for "all those who have become widows, orphans, mourners or
  sufferers in the lamentable civil strife."
- 1924: first Macy's parade (with animals from the Central Park Zoo). 1928: balloons
  released into the sky.
- 1939: "Franksgiving." FDR moves it up a week for the shopping season; about half the
  states refuse, Texas takes both. 1941: Congress fixes the fourth Thursday.
- 1970: National Day of Mourning. Wamsutta Frank James (Aquinnah Wampanoag) is invited to
  speak at the 350th anniversary; his speech is suppressed; he gives it on Cole's Hill.
  People gather there every Thanksgiving since.
- Now: "Both things are true at once. A holiday can hold more than one story. So can a family."

### II. The Spread — the strange true stories of the food
A dark still-life table of dishes. Hover lights them; click opens each dish as a scene with
a hands-on toy and its story. Candidates: turkey (Franklin's 1784 letter calling it "a
much more respectable bird" than the bald eagle; domesticated in Mexico ~2,000 years ago),
the cranberry bounce test (fresh berries have air pockets, they bounce and float; the
legend of "Peg-Leg" John Webb and his stairs), jellied sauce from the can (ridges and all),
green bean casserole (Dorcas Reilly, Campbell's test kitchen, 1955; her recipe card is in
the National Inventors Hall of Fame), marshmallow sweet potatoes (a 1917 Angelus
Marshmallows recipe booklet by Janet McKenzie Hill), pumpkin pie (Amelia Simmons, "American
Cookery", 1796; most canned pumpkin is Dickinson squash, much of it from Morton, Illinois),
mac and cheese (James Hemings, enslaved chef trained in Paris, Jefferson's table), the
turkey fryer (frozen bird + hot oil = fireball; Thanksgiving is the peak day for home
cooking fires), the 1621 plate vs. today's plate (venison, wildfowl, corn, eels, mussels,
squash; no potatoes, no pie, no forks), the wishbone, "there is never enough gravy".

### III. The Table — survive dinner
The comedy chapter. Overhead light snaps on. The family (see `LT.family`) around a long
table. Conversational landmines appear as speech bubbles with burning fuses; tap to defuse
with a deflection ("Pass the potatoes!"). Incidents (dog, peas, gravy, smoke alarm, phone)
need quick taps. The tension meter is a meat thermometer heading for 165°F; when it pops,
TOTAL CHAOS. Polka music speeds up with tension (`LT.music.param('tension', 0..1)`).
Family Bingo card fills as things happen. Either way it ends the same: record scratch,
silence, Grandma taps her glass: "Before pie... let's go around and say what we're
thankful for." Then Grace.

### IV. Grace — what gratitude actually is
Go around the table: each family member says what they're thankful for, revealing hidden
depth. Grandma sets a place every year for Grandpa Joe. The empty chair: the visitor may
write the name of someone not at the table this year (stored in `LT.state.chair`). Your
turn: what are you thankful for (`LT.state.thanks`). Then the ideas, each with a hands-on
moment: "thank" and "think" come from the same Old English root (þanc: thought,
remembrance); "Thanks a Thousand" (A.J. Jacobs thanked a thousand people for one cup of
coffee) as an exploding web of hands behind one thing on your plate, zooming out until it
becomes stars: "You have never eaten a meal alone"; gratitude isn't "everything is fine"
(Lincoln's 1863 proclamation held thanks and mourning together); the research (Emmons &
McCullough 2003; Seligman et al. 2005 gratitude visit; Kumar & Epley 2018: people
underestimate how good their thanks make others feel and overestimate the awkwardness).
End with a letter composer: one person you never properly thanked, one specific thing.
Copy it. Send it.

### V. Leftovers — for later
The Leftovers Report (stats + secrets found, as labeled containers in the fridge), the
porch at night, stars, the Haudenosaunee Thanksgiving Address honored (not performed) as
the closing pointer — "the words that come before all else", with its refrain "now our
minds are one" — and the candle blown out.

## Visual system

Tokens live in `css/core.css`. Use them; never hard-code a color that fights them.

- Ground: `--ground` umber-black, `--ground-2`, `--ground-3`.
- Linen (text on dark): `--linen`, `--linen-2`, `--linen-3`.
- Accent: `--lemon` (the still-life lemon, candle flame). Use with restraint.
- Supporting: `--flame`, `--ember`, `--wine`, `--cran`, `--olive`, `--sage`, `--pewter`.
- Paper (cards, menus, letters): `--paper`, `--paper-2`, ink `--ink`, `--ink-2`.
- Type: `--f-display` IM Fell Double Pica (17th-c. Dutch-cut type; titles, years, big
  numbers), `--f-sc` IM Fell English SC (labels/eyebrows), `--f-body` Alegreya (reading),
  `--f-ui` Alegreya Sans (HUD, buttons when small), `--f-hand` Caveat (annotations,
  speech bubbles), `--f-script` Homemade Apple (place cards, Grandma's hand, letters).
- Type scale: `--step--1` … `--step-5`.
- Shared classes: `.lt-btn`, `.lt-btn--ghost`, `.lt-eyebrow`, `.lt-display`, `.lt-prose`,
  `.lt-hand`, `.lt-script`, `.lt-card` (paper), `.lt-cite`, `.lt-next` (built by
  `api.nextButton()`), `.lt-center` (full-viewport centered flex column).

Motion: deliberate, eased (`--ease-out`), physical. Respect `LT.util.reducedMotion`
(skip shakes, cut particle counts, shorten transitions). Everything must work at 390px
wide with touch. Never scroll the body horizontally.

## Runtime API (all globals under `window.LT`)

Load order: util → audio → music → fx → candle → family → app → chapters → eggs → boot.

### Registering a chapter
```js
LT.chapter({
  id: 'record', index: 1, numeral: 'I', course: 'First Course',
  title: 'The Record', blurb: 'What actually happened in 1621, and in the 405 years after.',
  music: 'record',                     // LT.music scene started on enter
  light: { darkness: 0.55, radius: 460 }, // candle cursor for this chapter
  transition: 'candle',                // how we arrive: 'candle' | 'cloth' | 'smoke' | 'cut'
  mount(root, api) {                   // root = <section class="chapter chapter--record">
    // build DOM inside root. root is position:absolute; inset:0; overflow:hidden.
    // add class 'scrolls' to root for internal vertical scrolling.
    return () => { /* optional extra cleanup */ };
  }
});
```
`api` (everything registered through it is cleaned up automatically on leave):
- `api.on(target, type, fn, opts)`, `api.timeout(fn, ms)`, `api.interval(fn, ms)`
- `api.frame(fn)` → fn(dt, t) every animation frame while mounted
- `api.next()` go to the next course; `api.go(id)`
- `api.nextButton(label?)` → `<button class="lt-next">` wired to next course
- `api.sound(handle)` register a looping sfx handle so it's stopped on leave
- `api.root`, `api.def`

### Audio — `LT.audio`
`LT.audio.sfx(name, opts)` names: `match, clink, ting, pop, bounce{p:0..1}, pluck{n:midi},
whoosh, thud, splat, crack, boom, scratch, gobble, chime, tick, paper, pour, spray,
crunch, squish, bark, cheer, blow, snuff, swell, bell{n:midi}, heartbeat, ding, type,
sizzle*, fire*, murmur*, alarm*, torch*, wind*, ringtone*` (* = loop; returns a handle with
`.stop()` and `.set(v)`; pass it to `api.sound(h)`). Low-level: `LT.audio.tone({...})`,
`LT.audio.noise({...})`, `LT.audio.ctx`, `LT.audio.sfxBus`. Never call before the first
user gesture; `LT.audio.ready` tells you (calls are no-ops when not ready or muted).

### Music — `LT.music`
`LT.music.play(scene)`, `LT.music.param(name, value)` (e.g. `tension` 0..1 for `table`,
`swell` 0..1 for `grace`, `night` 0..1 for `leftovers`, `level` 0..1 for any),
`LT.music.duck(level, seconds)`, `LT.music.stop(fade)`.

### FX — `LT.fx` (viewport CSS pixel coordinates)
`burst(x,y,opts)`, `confetti(x,y,opts)`, `leaves(rate)`, `embers(rate)`, `sparks(x,y,n)`,
`smoke(x,y,opts)`, `float(x,y,text,opts)`, `shake(amount, seconds)`, `flash(color, s)`,
`splat(x,y,{color,size})`, `clear()`.

### Light — `LT.light`
`LT.light.set({darkness, radius, warmth})` (tweened), `LT.light.follow(bool)`,
`LT.light.moveTo(x,y)`, `LT.light.pulse()`. Darkness 0 = lights on.

### Candle — `LT.candle(canvas, opts)`
Reusable canvas candle with flicker and wind; `.light()`, `.out()`, `.wind(v)`, `.destroy()`.

### Family — `LT.family`
`LT.family.cast` (array of character defs), `LT.family.get(id)`,
`LT.family.figure(id, {scale, mood})` → `{el (SVG <g>), talk(on), blink(), mood(m), lookAt(dx), destroy()}`.
Coordinate system: origin at seat (bottom center), adult head top ≈ y -230.

### App services
`LT.go(id)`, `LT.toast(text, {title, ms})`, `LT.egg(id, title, note)` (secret found),
`LT.stats.inc(key, n)`, `LT.stats.get(key)`, `LT.state` (persisted: `thanks`, `chair`,
`letterTo`, `tableOutcome`, `bingo`, `visited`), `LT.save()`, `LT.onWord(word, fn)`,
`LT.bus.on/off/emit`, `LT.util.*` (el, svg, clamp, lerp, rand, pick, ease, tween, wait,
store, copy, esc, reducedMotion, isTouch, noise).
