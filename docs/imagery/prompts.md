# Lifestyle imagery (PRE-199)

Every lifestyle photo on the site is listed here with its prompt, model, reference images and seed, so a scene can be regenerated after an app update.

The phone screen is part of the generated photo: the real app capture is passed to the image model as a reference image and the model renders the phone showing it, with the scene's light and reflections (Prabodh, 13 Oct). Nothing is pasted over the photo afterwards.

## Style guide (pasted into every prompt)

> Editorial lifestyle photograph, shot on a 35 mm lens at f/2, natural light, warm and low-key: deep warm shadows, honey and amber highlights, cream and walnut tones, no cool blue cast. Real, lived-in places (a neighbourhood cafe, a home kitchen, a sofa at dusk), everyday food that looks home-made or cafe-made, not styled for an advert. Soft 35 mm film grain, gentle vignette. People appear only as hands, forearms, a shoulder or an out-of-focus figure in the background: no faces in focus. Any phone in the shot is a modern iPhone held or propped so its screen faces the camera almost square on, and its screen shows exactly the app screenshot from the reference image: same layout, text, numbers and colours, nothing added, nothing removed, readable at a glance. No logos, no brand names, no text anywhere. Leave calm, darker space where the page text will sit.

The palette is chosen to sit on the site's page colour `#110f0c` under the left-hand photo scrim, with the amber annotation colour `#f5cc77` reading clearly on top.

## Shot list (homepage, design D3)

| # | Scene | Section | Screen reference image | Annotations (real values) |
| -- | -- | -- | -- | -- |
| 1 | Cafe lunch: hand holding a phone over a chicken, hummus and salad wrap on a wooden cafe table, flat white beside it | Hero, full width under the headline | `public/app/01b-home-log-dark` (the wrap at 12:30 PM in today's log) | 462 kcal, Chicken wrap with hummus and salad; 61 g protein; 150 g chicken breast; 60 g wholemeal tortilla |
| 2 | Evening sofa: phone in hand, a bowl of Greek yogurt with raspberries on the arm of the sofa, cup of tea, warm lamp light | Ask anything (5), full bleed, text on the left | `public/app/02-chat-chart-dark` (protein chart in chat) | 168 kcal, Greek yogurt with raspberries; 13 g protein |
| 3 | Kitchen shop: groceries just unpacked on a worktop (salmon fillet in paper, quinoa, cherry tomatoes, cucumber, red onion, oats), phone propped against a jar | Plans (10), full bleed, text on the left | `public/app/13-grocery-list-dark` | 130 g salmon fillet; 100 g quinoa; 454 kcal, Mediterranean salmon bowl with quinoa |

Annotation values (and the screens the phone shows) come from the `showcase-full-account` seed in `fresca_backend` (`src/dev/resetTestAccount/seeds.ts`, `SHOWCASE_WRAP`, `SHOWCASE_MED_SALMON` and the Greek yogurt snack), which is the account the PRE-198 captures were taken on, so the numbers on the photo match the numbers on the phone.

The other scenes in the ticket (gym bench, desk with widgets, plan flat-lays, gradient textures, clips, walkthrough voiceover) follow once these three are picked, so the whole set is one shoot.

## Prompts

Each prompt is the style guide above followed by the scene line, with the scene's capture attached as a reference image (the 2x dark WebP from `public/app/`). One generation per scene, four variations each, on an image model that takes reference images (Nano Banana or GPT Image; picked once the full connector shows which this workspace can run).

## Screen fidelity check

Every variation is checked against its reference capture before it goes in front of Prabodh:

1. Crop the phone screen from the variation, flatten it to the capture's aspect ratio, and place it side by side with the capture at the same size.
2. Read every line of text and every number on the generated screen. Any wrong, missing, invented or garbled character fails the variation: the annotation values next to the phone must match what the phone shows.
3. Layout, icons, ring and chart shapes and colours must match the capture; an extra or missing element fails it.
4. The screen must read as a real phone screen (no warped edges, no doubled status bar, notch and Dynamic Island in the right place).

Failed variations are dropped, with the reason noted in the Generations table. If a scene has no passing variation, it is regenerated with a tighter prompt (closer framing on the phone, screen larger in frame) rather than patched. The contact sheet Prabodh picks from shows each passing variation beside its side-by-side screen check.

### 1. Cafe lunch (hero)

> Wide 16:9 photograph across a small wooden table in a warm neighbourhood cafe at lunchtime, late autumn daylight from a window on the right. In the centre-right, a chicken, hummus, spinach and cucumber wrap cut in half on a simple ceramic plate, one half turned to show the filling. A flat white in a cream cup beside it. On the right third, a hand holds an iPhone upright just above the table edge, screen facing the camera almost square on. The left half of the frame is darker cafe interior, softly out of focus, with an out-of-focus figure in the background. Shallow depth of field, the wrap and the phone sharp.

### 2. Evening sofa (Ask anything)

> Wide 16:9 photograph on a deep linen sofa in the evening, lit by a single warm table lamp off frame on the right, the rest of the room in deep shadow. On the right third, a hand rests an iPhone on a knee wrapped in a soft knit blanket, screen facing the camera almost square on. On the sofa arm beside it, a small bowl of thick Greek yogurt topped with fresh raspberries, and a cup of tea with steam. The left half of the frame is dark, quiet shadow. Shallow depth of field.

### 3. Kitchen shop (Plans)

> Wide 16:9 photograph of a home kitchen worktop just after a grocery shop, soft early evening daylight from a window on the right. On the right half, groceries laid out loosely: a salmon fillet in butcher's paper, a bag of quinoa, a punnet of cherry tomatoes, a cucumber, a red onion, a bag of rolled oats, a paper shopping bag behind them. An iPhone is propped upright against a glass jar among them, screen facing the camera almost square on. The left half of the frame is darker worktop and kitchen wall, softly out of focus. A hand reaching for the tomatoes at the edge of the frame.

## Output files

All files go in `public/lifestyle/`. Paths are fixed, so pages can reference them before the photos land.

| Scene | Desktop (16:9) | Phone crop (4:5, the phone in the hand) |
| -- | -- | -- |
| Cafe lunch | `hero-cafe@1x.{avif,webp}` 1440 x 810, `hero-cafe@2x.{avif,webp}` 2880 x 1620 | `hero-cafe-mobile@1x.{avif,webp}` 640 x 800, `hero-cafe-mobile@2x.{avif,webp}` 1280 x 1600 |
| Evening sofa | `nutritionist-evening@1x/@2x` (same sizes) | `nutritionist-evening-mobile@1x/@2x` |
| Kitchen shop | `plans-kitchen@1x/@2x` (same sizes) | `plans-kitchen-mobile@1x/@2x` |

Each file is under 400 KB. Annotation positions (percent of the desktop photo), text and alt text will live in `src/content/lifestyle.ts`, added with the photos.

## Generations

| Scene | Model | Reference images | Seed | Variations passed / generated | Picked | Licence check |
| -- | -- | -- | -- | -- | -- | -- |
| (filled in as each scene is generated) | | | | | | |
