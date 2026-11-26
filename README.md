# The Long Table

An interactive Thanksgiving in five courses: the history, the food, the chaos of the
family table, and what gratitude actually is.

It opens on a gloriously tacky Thanksgiving e-card. It gets about two seconds before it
catches fire and burns away, and you are in the dark with a matchbox.

Strike it, and a real candle lights in a real 3D room. The camera pulls back as every
candle down a table that never ends catches, one after another, into the dark. Then you
walk it. **The long table is time: every seat is a year.** Your end is tonight. Far enough
down, the walls fall away and it is 1621; past the end of the table is the land before.
You ride back up through 405 years, sit down with the family, go around the table, and at
the end of the night you blow out your candle and your breath runs the whole length of it.

The idea under all of it: **gratitude is a kind of attention. It's where you choose to hold
the light.** Your cursor carries a light across the table the whole way.

It plays like a talk: press Next (or the arrow keys, or swipe) through about fifty beats in
five acts. Each of the five original courses is still here as a full interactive chapter,
reachable from the journey as a side door ("second helpings") or from the bill of fare.

| The five courses, as side doors | | |
|---|---|---|
| Prelude | *Strike a match* | Light the candle; the title appears. |
| Bill of Fare | | The menu. Every course is a link; you can eat in any order. |
| I. The Record | history | Drag the light over the myth postcard to find the record underneath, then scroll through 405 years, from Patuxet to the National Day of Mourning. |
| II. The Spread | food | The strange true stories behind the dishes, each one a toy: bounce cranberries, fry a frozen turkey (don't), toast marshmallows, pull the wishbone. |
| III. The Table | chaos | Survive dinner. Defuse conversational landmines before the meat thermometer hits 165°F. The polka speeds up as things get worse. |
| IV. Grace | gratitude | Go around the table. Light a candle for someone who isn't there. What gratitude is, what the research says, and a letter you should actually send. |
| V. Leftovers | dessert | The fridge holds everything you did tonight. The porch, the stars, the words that come before all else, and the last candle. |

## Run it

No build step and no dependencies. Serve the folder and open `index.html`:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from disk works too. Deep links: `#journey`, and the single
courses `#record`, `#spread`, `#table`, `#grace`, `#leftovers`.

The 3D journey needs WebGL on a real GPU. On a software renderer, or if WebGL is missing,
it hands you the 2D courses instead, which run anywhere.

To make one self-contained HTML file (everything inlined except Google Fonts):

```sh
node tools/build.mjs
# dist/the-long-table.html  (standalone page)
# dist/artifact.html        (the same, without the document skeleton)
```

## How it's made

- **No assets.** Every sound is synthesized live with the Web Audio API
  (`js/core/audio.js`): the match strike, glass clinks, gobbles, a smoke alarm, a crowd
  murmuring, a fireball. Every course has its own generative score
  (`js/core/music.js`): a lament in D minor for the history, a swing for the food, a
  polka whose tempo is tied to family tension, rolling piano and a choir for grace, a
  music-box lullaby for the leftovers.
- **The room is built from code too** (`js/core/world.js`, on Three.js r128): a 45-metre
  table with a draped linen cloth, 110 place settings, pewter candlesticks, a roast turkey,
  pumpkins and a half-peeled lemon whose rind hangs over the edge, all procedural geometry
  and canvas-drawn textures. Candle flames are shader sprites; light pools, dust in the
  light, real shadows from the light you carry, and a custom HDR bloom, grain and
  vignette pass. It scales its resolution to your device, pauses when a course covers
  it, and if WebGL isn't available the whole piece falls back to its 2D version.
- **Every picture is drawn in code**: SVG for the family and the props, canvas for the
  candle flame, particles, the night sky.
- **The look** is a Dutch Golden Age still life (umber dark, chiaroscuro, pewter, a lemon
  yellow accent). The Pilgrims lived in Leiden from 1609 to 1620, and the still-life
  painters of that moment were painting abundance and its passing.
- Type: IM Fell Double Pica and IM Fell English SC (17th-century Dutch-cut types),
  Alegreya and Alegreya Sans, Caveat, Homemade Apple.

```
index.html            entry point (loads everything in order)
css/core.css          tokens, chrome, transitions, shared components
css/<course>.css      one stylesheet per course
js/core/              util, audio, music, fx (particles + candle-light), candle, world (the 3D room),
                      family (the cast, drawn in SVG), app (router, veil, menu,
                      toasts, secrets, state), eggs (global secrets), boot
js/chapters/          prelude, menu, record, spread, table, grace, leftovers
js/acts/              the five acts of the journey (act1-record … act5-night)
docs/DESIGN.md        the design brief and runtime API
docs/JOURNEY.md       the journey: act API, space, and the script
tools/build.mjs       inline everything into a single file
```

Progress, secrets found, and what you wrote are kept only in your own browser's
`localStorage`. Nothing is sent anywhere.

## There are secrets

Some are in the courses. Some work anywhere. The fridge keeps count.

## Sources

Edward Winslow's letter of December 1621 (in *Mourt's Relation*, 1622); William
Bradford, *Of Plymouth Plantation*; Plimoth Patuxet Museums; the National Museum of
the American Indian; Wamsutta Frank James's suppressed 1970 speech; George Washington's
1789 and Abraham Lincoln's 1863 Thanksgiving proclamations; Sarah Josepha Hale in
*Godey's Lady's Book*; Benjamin Franklin to Sarah Bache (1784); Amelia Simmons,
*American Cookery* (1796); Emmons & McCullough (2003); Seligman, Steen, Park & Peterson
(2005); Kumar & Epley (2018); A.J. Jacobs, *Thanks a Thousand* (2018).

The closing sequence follows the order of the Haudenosaunee Thanksgiving Address,
*Ohén:ton Karihwatéhkwen*, as a pointer to it, not a recitation of it. Read the full
address in the words of the Haudenosaunee educators who share it.
