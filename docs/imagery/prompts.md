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
| 3 | Kitchen shop: the groceries on the phone's list just unpacked on a worktop (wholemeal tortillas, eggs, feta, Greek yogurt, apples, avocados), phone propped against a jar | Plans (10), full bleed, text on the left | `public/app/13-grocery-list-dark` | 850 g Greek yogurt; 200 g eggs; 120 g wholemeal tortilla; Est. £48–£66 for the week |

The groceries in shot 3 are the items visible on the phone's list, so the photo and the screen agree. Annotation values (and the screens the phone shows) come from the `showcase-full-account` seed in `fresca_backend` (`src/dev/resetTestAccount/seeds.ts`, `SHOWCASE_WRAP`, `SHOWCASE_MED_SALMON` and the Greek yogurt snack), which is the account the PRE-198 captures were taken on, so the numbers on the photo match the numbers on the phone.

The other scenes in the ticket (gym bench, desk with widgets, plan flat-lays, gradient textures, clips, walkthrough voiceover) follow once these three are picked, so the whole set is one shoot.

## Prompts

Each prompt is the style guide above, the scene line, and a closing line naming the screen's key text and telling the model to reproduce the screenshot exactly, with the scene's capture attached as a reference image (the 2x dark WebP from `public/app/`). One generation per scene, four variations each, on gpt-image-2 through ElevenLabs, which takes the capture as a reference image.

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

> Wide 16:9 photograph of a home kitchen worktop just after a grocery shop, soft early evening daylight from a window on the right. On the right half, the shop laid out loosely: a pack of wholemeal tortillas, a box of six eggs, a block of feta, a large plain tub of Greek yogurt, a few red apples and two avocados, a paper shopping bag behind them. An iPhone is propped upright against a glass jar among them, screen facing the camera almost square on. The left half of the frame is darker worktop and kitchen wall, softly out of focus. A hand reaching for the tomatoes at the edge of the frame.

## Output files

All files go in `public/lifestyle/`. Paths are fixed, so pages can reference them before the photos land.

| Scene | Desktop (16:9) | Phone crop (4:5, the phone in the hand) |
| -- | -- | -- |
| Cafe lunch | `hero-cafe@1x.{avif,webp}` 1440 x 810, `hero-cafe@2x.{avif,webp}` 2048 x 1152 | `hero-cafe-mobile@1x.{avif,webp}` 640 x 800, `hero-cafe-mobile@2x.{avif,webp}` 920 x 1150 |
| Evening sofa | `nutritionist-evening@1x/@2x` (same sizes) | `nutritionist-evening-mobile@1x/@2x` |
| Kitchen shop | `plans-kitchen@1x/@2x` (same sizes) | `plans-kitchen-mobile@1x/@2x` |

The model renders at 2048 x 1152, so @2x is the full generated size rather than an upscale to 2880 x 1620, and the phone crop @2x is the full-height 922 x 1152 crop. Every file is under 120 KB (AVIF quality 52, WebP quality 76, made with sharp). Annotation anchors (percent of the desktop photo), their text, alt text, and which side the page text sits on are in `src/content/lifestyle.ts`.

The kitchen photo has the phone on the left, so the Plans section puts its text on the right (`textSide: "end"`) with the mirrored scrim (`scrim: "end"` on the photo, token `--scrim-photo-end`). Its annotations sit low on the right, under the groceries, so the text block there belongs in the upper half.

## Generations

| Scene | Model | Reference image | Seed | Variations passed / generated | Picked | Licence check |
| -- | -- | -- | -- | -- | -- | -- |
| Cafe lunch | gpt-image-2 (ElevenLabs), 16:9, 2K, high | `public/app/01b-home-log-dark@2x.webp` at 0b935d8 | Not exposed by the model | 4 / 4 | 2 (generation `jotJjOLKcGI49OoGQevd`) | Generated on PrepIt's ElevenLabs workspace with paid credits (ElevenLabs grants commercial use on paid plans). No real people, brands or text beyond the app screen. |
| Evening sofa | gpt-image-2, same settings | `public/app/02-chat-chart-dark@2x.webp` at 0b935d8 | Not exposed | 4 / 4 (all reproduce every word and number; the chart bars are shaped slightly differently from the capture, with no value labels on them) | 2 (`TjPqRlBc39Nt2mi3chOa`) | As above |
| Kitchen shop | gpt-image-2, same settings | `public/app/13-grocery-list-dark@2x.webp` at 0b935d8 | Not exposed | 3 / 4 (variation 4 failed: the handset had an earpiece slot and camera dot, not a modern iPhone) | 2 (`RQN7u3H6TXqqctCBMfAS`) | As above |

All 12 variations with their screen checks: [contact sheet](https://claude.ai/artifact/Ccqc5PkZZBRax3kMQtPPoT). Full-size originals are kept outside the repo. ElevenLabs flow `088lf68ZQahQ3mm7eg5x`.
