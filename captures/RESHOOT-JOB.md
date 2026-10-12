# PRE-198 (website screenshots and videos): reshoot job

Same rules, setup, capture settings and hand-back as `captures/CAPTURE-JOB.md` on this branch. Read that file first. Differences:

- `fresca_backend`: pull `claude/project-thread-ygt98i` to **6c0196e or later**. The showcase seed now sets its own nutrition goals (1,570 kcal, 158 g protein) and seeds 88 days of weigh-ins, so the reset prints `PASS showcase weigh-ins=27`. Put that reset output line in RESULTS.md: this run also verifies backend PR #288.
- Hand back in a **new** secret gist with the same file names, plus RESULTS.md. Only the files below are needed.
- Showcase shots must run between 18:45 and 23:59 London. Batches C and D can run at any time.

## Batch A: `showcase-full-account`

Reset, restart the app, hide Get started. Do the stills first, then 18, then 08 and 21 (they change the account). Reset again before 21.

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 1 | Home | Home, today. Before capturing, scroll a few points so the floating **Ask Nutritionist** pill sits over empty space or a group header, not a food row. Check Calories shows "On track" and no macro is red | Still, light + dark | `01-home-{light,dark}.png` |
| 2 | Chat chart | As before (scroll so "Can you show me my protein for the last week?" and the chart fill the screen). The dashed line should now read 158g | Still, light + dark | `02-chat-chart-{light,dark}.png` |
| 6 | Signal detail | Home → Energy ring, then Satiety ring, as before. If the floating pill covers a card's text, scroll a little so it doesn't | Still, light + dark | `06-signal-energy-*`, `06b-signal-satiety-*` |
| 11 | Check-in report | As before ("Your steadiest week yet"). Targets now read 1,570 kcal and 158 g | Still, light + dark | `11-check-in-report-{light,dark}.png` |
| 19 | Body Composition | As before. Then the Weight chart screen on **7 Days**, then on **90 Days** (it should be one smooth downward line, about 83.6 kg to 79.2 kg) | Still, light + dark | `19-body-composition-*`, `19b-weight-chart-7d-*`, `19c-weight-chart-90d-*` |
| 18 | Offline, waiting to send | Go offline: `touch "$(xcrun simctl get_app_container <UDID> app.tryprepit.app data)/Documents/debug_offline"`, then pull to refresh or wait for the "You're offline" banner on Home. Tap the water card → **+250 ml** (the row reads `250 millilitres, logged at …, waiting to send`) → capture the Water screen. Back on Home, `Add` → `Log Weight` → 79.0 kg → save. Tap the offline banner to open the waiting list (`250 ml, waiting to send`, `79.0 kg, waiting to send`) → capture. Then `rm` the file and capture Home again once the banner is gone | Still, light + dark | `18-offline-water-*`, `18b-offline-waiting-list-*`, `18c-back-online-*` |
| 08 | Ask, reply arrives | In the chat, type "What's a good high-protein breakfast for tomorrow?" → `Send message` → **tap the message list once to close the keyboard** → keep recording until the whole reply is in. Start recording just before you tap Send | Video | `08-chat-ask.mp4` |
| 21 | Walkthrough | Reset first. One take, moving straight from step to step: Home (pause 2 s) → `Add` → `Log Meal` → type "a clementine" (it keeps today under target; the yogurt last time pushed the card to Over) → review → save → Home rings and calories update (pause 2 s) → `Ask Nutritionist` → "How am I doing today?" → `Send message` → close the keyboard → reply arrives → close chat → `Plan` → open the plan → scroll. Long model waits are fine; we cut them out | Video | `21-walkthrough.mp4` |

## Batch C: `primary-conversation-voice-notes`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 10 | Voice notes | `Ask Nutritionist` → **scroll up** until the user's own voice note (waveform plus the grey transcript "I just had a chicken burrito bowl…") is at the top, with the nutritionist's spoken reply and its Log it card below it | Still, light + dark | `10-voice-note-{light,dark}.png` |

## Batch F: `achievements-ready-to-celebrate`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 17 | Milestone sheet | ("Milestone unlocked" is the app's real wording, which is fine.) Start `./scripts/sim-run.sh record build/sim-captures/17-achievement.mp4` **before** the app launches (reset, then start recording, then `HIDE_DEBUG_BANNER=1 ./scripts/sim-run.sh`), and stop about 3 s after the sheet appears, so the confetti is caught. Light only. Then also a still once it settles, light and dark (dark needs a second reset and relaunch) | Video + still | `17-achievement.mp4`, `17-achievement-{light,dark}.png` |

Nothing else needs reshooting. The cloud thread trims the long videos and blurs the profile photo in the Home avatar.
