---
slug: bjtu-touhou-booth-film
title: "A 140-Second Booth Film for Baixiao Tianze, Every Frame Drawn in Code"
authors: [xinxian]
tags: [Touhou Project, Tech, Circle]
date: 2026-09-24
---

# A booth film that plays like a walk through a gallery

On September 27, at Baixiao Tianze, the Beijing Jiaotong University Touhou booth will have a 27-inch 4K monitor looping a silent 140-second film all day. I made it, and Sukima Moonlight's four Giclée prints get a segment of their own.

![Contact sheet of the seven segments](/img/blog/bjtu-booth-film-preview.webp)

The woodcut ink blocks, scratched white lines, handwritten type and camera moves are all drawn frame by frame by JavaScript on a Canvas. No image-generation models were used. The only photographic material is product photos, covers, avatars and QR codes. The code and the finished film are open source at [fish2lab/bjtu-touhou-booth](https://github.com/fish2lab/bjtu-touhou-booth).

<!-- truncate -->

## Passers-by watch for a few seconds, so every segment has to stand alone

People walking past a booth at a convention usually watch for a few seconds, maybe a few dozen. So the film doesn't tell one continuous story. It is structured like Mussorgsky's *Pictures at an Exhibition*: every item and activity at the booth is its own "picture", each with a different drawing style and rhythm, joined by transitions and looped end to start. Someone who only catches one segment still knows what is being sold or what they can do there.

| # | Segment | Length | What it shows |
|---|---|---|---|
| 1 | Sanyan no Genren (novel) | 28s | A drop of ink becomes the third eye and grows by eating books; sale info and cover |
| 2 | Sukima Moonlight | 28s | Four masterpiece × Touhou prints on a gallery wall; a gap sweeps each original into its Touhou version |
| 3 | Patchouli's Alchemy Workshop | 16s | Mixing drinks on site and guessing which characters they came from |
| 4 | Hina Matsuri | 19s | Make a Hina doll, write a wish on it, put it on the stand, send it down the river |
| 5 | The Winner | 12s | A silent-film gag in black-and-white manga panels; acrylic charms |
| 6 | Touhou Fan-Work Red/Black Board | 12s | Rating fan works with little red and black stickers |
| 7 | BJTU Touhou Joke Collection | 24s | A WASTED knockout round; the eye closes, the ink returns to the pen, back to segment 1 |

One set of rules ties the seven together: only warm paper white and near-black ink, plus at most one muted colour per segment; block edges rough like a woodcut knife; every piece of on-screen text in the handwritten LXGW WenKai, prices and jokes included; lines re-drawn eight times a second for that hand-animated "boil".

The hand-offs are designed too. At the end of segment 1 the closed eyelid stretches into a gap that splits open onto the Sukima Moonlight gallery wall. The leftover potion from the alchemy bar runs off the counter and becomes the Hina Matsuri stream. The white-on-black "win" shrinks to a dot, the camera pulls back, and it is a black sticker on the red/black board. At the very end the third eye closes, the black screen gathers back into a blot of ink on the desk, the pen sucks it up, and we are at the empty desk the film opened on.

## The Sukima Moonlight segment: a gap in a gallery

Segment 2 is a gallery wall. The camera trucks along it and stops at a painting. A flat gap tears open along the top edge, eyes inside, and sweeps down the canvas: wherever it passes, the original has already become its Touhou version. Vermeer's *Girl with a Pearl Earring* becomes Yukari; Spitzweg's *The Bookworm* becomes Patchouli. A label flips out beside it and writes the title, the original, the artist, the size and the price by hand. A final full-screen gap opens onto our QQ group QR code and all four prices.

This is what Sukima Moonlight has always been about, where classic art meets Touhou, and this time it moves on screen.

## About a day of work, most of the code written by Claude Code

The film went from first commit on the afternoon of September 23 to a 4K render by noon on the 24th. Most of the code was written with [Claude Code](https://claude.com/claude-code); I set the purpose, the style and the trade-offs.

1. **The first version was scrapped.** It started as a colourful cut-paper film of a tram visiting nine stops, plus a little danmaku game. Once built, the style was inconsistent, too childish, and a tram couldn't carry the film. It was archived and we started over.
2. **One segment first, as the style reference.** Segment 1 was finished first, fixing the look: black-and-white woodcut, low saturation, handwritten type, eight boils a second. That went into a construction document.
3. **Then parallel construction.** The remaining segments were split by file, one git worktree and one agent each, all running at once. The hand-off frames between segments were written first by the main session, so each segment only had to meet its own start and end. Some agents were rate-limited and stopped mid-way in the first round; MiMo picked up and finished them.
4. **Review and revise.** Every segment was sampled frame by frame into a review report: the eye barely grew for the first five seconds, the Sukima Moonlight segment hard-cut between artworks, the Hina dolls' heads were a third of their shoulder width and looked like buttons… Fixes were split into five parallel packages again, and after merging, the seven hand-off frames were compared pixel by pixel.
5. **Render.** Playwright opens the page and captures every frame, and ffmpeg encodes chunks in parallel into a 3840×2160, 24fps MP4.

What took the most thought wasn't code but trade-offs, each one giving up X for Y. The physical red/black board is a highly saturated colour poster; opening on it would make the segment feel like it belonged to another film, so it is redrawn as a woodcut table first and the real photo only appears at the end. The WASTED stamp doesn't use GTA's Pricedown font, because its licence doesn't allow embedding it in a web page, and the offline fallback player is a web page.

## Come see it at the booth

September 27, Baixiao Tianze, the Beijing Jiaotong University booth. Baozi, author of *Sanyan no Genren*, will be signing in Koishi cosplay; you can taste potions, make a Hina doll, put red and black dots on fan works, and stand in front of the screen for 140 seconds.

If you can't make it:

- **The 4K film** is in the repository's [Releases](https://github.com/fish2lab/bjtu-touhou-booth/releases).
- **In a browser:** clone the repository and open `animation/index.html`; add `?booth` to the address for a full-screen loop that needs no network.
- The code is MIT-licensed. Artwork belongs to its respective creators and is not covered by the MIT licence.

Touhou Project characters and setting © Team Shanghai Alice (ZUN). This film is a fan work.

---

Sincerely,

**Silas Su (苏心贤)**  
PhD Student, Beijing Jiaotong University
