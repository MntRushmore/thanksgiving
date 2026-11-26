# The Long Table

An interactive Thanksgiving in five courses: the history, the food, the chaos of the
family table, and what gratitude actually is.

You start in the dark and strike a match. Your cursor is the candle for the rest of the
night: the page is dark, and wherever you point is lit. That's the whole idea of the
piece. **Gratitude is a kind of attention. It's where you choose to hold the light.**

| Course | | |
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

Opening `index.html` straight from disk works too. Chapters are deep-linkable:
`#record`, `#spread`, `#table`, `#grace`, `#leftovers`.

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
js/core/              util, audio, music, fx (particles + candle-light), candle,
                      family (the cast, drawn in SVG), app (router, veil, menu,
                      toasts, secrets, state), eggs (global secrets), boot
js/chapters/          prelude, menu, record, spread, table, grace, leftovers
docs/DESIGN.md        the design brief and runtime API
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
