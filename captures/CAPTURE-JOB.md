# PRE-198 (website screenshots and videos): simulator capture job

Raw captures for the website revamp. They come back as a secret gist (the same way simulator proof is shared on PRs); the cloud thread optimises them and opens the real PR into `website-revamp`. This file and the food photo live on the `prepit-website` branch `claude/project-thread-ygt98i`.

## Rules

- Simulator only: the existing signed-in `iPhone 17 Pro`. Never sign in, create accounts, or create or erase simulators. On `blocked: test sign-in expired`, stop and report.
- Agent folder checkouts only (`/Users/prabodhkakodkar/Documents/GitHub/agents/prepit`).
- Test account only; nothing from a real user on screen. If a name, email or anything test-looking ("test", "agent", "John", lorem) shows on a shot, note it in RESULTS.md.
- No debug banner, no odd status bar, no keyboard left open on stills, no red error toasts.

## One-time setup

1. `fresca_backend`: `git fetch origin && git checkout claude/project-thread-ygt98i && git pull` (backend PR #288 adds the chart and weigh-ins to `showcase-full-account`; once #288 is merged, `main` is fine). Run `yarn install` if the lockfile changed.
2. `fresca_app`: `git fetch origin && git checkout main && git pull`, then `scripts/flutter_setup.sh` if needed.
3. `prepit-website`: clone if missing (`git clone https://github.com/prabk123/prepit-website` in the agent folder), then `git fetch origin && git checkout claude/project-thread-ygt98i && git pull` (read only: just this job file and the food photo).
4. Add the food photo for shot 4 to the simulator's Photos once: `xcrun simctl addmedia <UDID> ../prepit-website/captures/inputs/burrito-bowl.jpg`.
5. In the app, Profile (avatar, top right of Home), then Settings: the app theme must follow the system. Switch themes with `xcrun simctl ui <UDID> appearance light` / `dark`.
6. Status bar before capturing: `xcrun simctl status_bar <UDID> override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3`. Clear it at the end with `xcrun simctl status_bar <UDID> clear`.

## Per seed

For each seed below: `./scripts/dev-up.sh --reset --seed <seed>` in `fresca_backend`, then `HIDE_DEBUG_BANNER=1 ./scripts/sim-run.sh` in `fresca_app` (restart the app after each reset so it reloads). After every reset, if a **Get started** card shows at the top of Home, tap `Hide Get started` before capturing (the next reset brings it back).

Stills: `./scripts/sim-run.sh screenshot build/sim-captures/<file>.png`, once in light and once in dark (switch with `simctl ui appearance`, wait a second for the redraw). Videos: `./scripts/sim-run.sh record build/sim-captures/<file>.mp4`, light only, slow deliberate taps, Ctrl-C to stop.

### Batch A: `showcase-full-account` (must run between 18:45 and 23:59 London; otherwise do the other batches first)

The rings only count meals whose time has passed, so after 18:45 every ring is filled. Do the stills first: shots 9, 8 and 21 change the account.

| # | Shot | How to reach it | Type | Files |
|---|------|-----------------|------|-------|
| 1 | Home: rings, macros, today's Log | Home tab, today, scrolled to the top (rings and macros visible, Log section starting below). If the whole story doesn't fit, take a second still scrolled to the Log section | Still, light + dark | `01-home-{light,dark}.png` (+ `01b-home-log-{light,dark}.png`) |
| 5 | Meal detail with items, confidence and notes | Home → Log → tap `Protein overnight oats with apple and cinnamon` | Still, light + dark | `05-meal-detail-{light,dark}.png` |
| 6 | Energy, Satiety and Mood detail with signal cards | Home → tap the Energy ring (detail screen with the signal cards). Also Satiety | Still, light + dark | `06-signal-energy-{light,dark}.png`, `06b-signal-satiety-{light,dark}.png` |
| 7 | What your food did | `Progress` tab → What your food did | Still, light + dark | `07-food-analysis-{light,dark}.png` |
| 11 | Weekly check-in report | `Progress` → the week-in-review row → **See your full report** ("Your steadiest week yet") | Still, light + dark | `11-check-in-report-{light,dark}.png` |
| 19 | Body Composition weight chart | `Progress` → `Weight` (Body Composition). Then tap the Weight card for its chart screen | Still, light + dark | `19-body-composition-{light,dark}.png`, `19b-weight-chart-{light,dark}.png` |
| 12 | Meal plan week, then a meal's detail | `Plan` tab → the plan card (7 days from tomorrow) → scroll the week slowly → tap a dinner → its detail | Video, 5 to 8 s | `12-plan-week.mp4` |
| 13 | Grocery list with price estimate | In that plan → `Grocery list` (price estimate banner visible at the top) | Still, light + dark | `13-grocery-list-{light,dark}.png` |
| 2 | Chat reply with a chart card | `Ask Nutritionist` → scroll so "Can you show me my protein for the last week?" and the protein chart reply fill the screen | Still, light + dark | `02-chat-chart-{light,dark}.png` |
| 9 | Log it card, tapped and logged | In the chat, scroll to the bottom (burrito bowl card) → tap `Log it` → hold on the logged state for 2 s | Video, 4 to 6 s | `09-chat-log-it.mp4` |
| 8 | Ask a question, the reply arrives | In the chat, type "What's a good high-protein breakfast for tomorrow?" → `Send message` → keep recording until the whole reply has arrived (real model on the dev backend) | Video, up to 15 s (we trim) | `08-chat-ask.mp4` |
| 21 | Walkthrough | Reset this seed again first (`--reset --seed showcase-full-account`, restart app, hide Get started). Then one take: Home (pause 2 s) → `Add` → `Log Meal` → type "Greek yogurt with honey and walnuts" → review sheet → save → back on Home, the rings and calories update (pause 2 s) → `Ask Nutritionist` → type "How am I doing today?" → `Send message` → reply arrives → close chat → `Plan` tab → open the plan → scroll | Video, 20 to 30 s | `21-walkthrough.mp4` |

### Batch B: `clean`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 3 | Type a meal, review, save | Home → `Add` → `Log Meal` → type "chicken wrap, an apple and a flat white" → wait for the review sheet → save → Home shows it | Video, 6 to 12 s | `03-log-typed.mp4` |
| 4 | Log a meal photo, see the reviewed meal | Home → `Add` → `Log Meal` → photo from the library (the simulator has no camera) → pick the burrito bowl added in setup → review → save | Video, 6 to 12 s | `04-log-photo.mp4` |

### Batch C: `primary-conversation-voice-notes`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 10 | Voice note bubble with transcript | `Ask Nutritionist` → the user voice note (transcript in grey under it) and the spoken reply with its card in view | Still, light + dark | `10-voice-note-{light,dark}.png` |

### Batch D: `calorie-banking-on`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 14 | Weekly calorie pattern | Profile (avatar, top right of Home) → Nutrition & Goals → the `Weekly pattern` section in view | Still, light + dark | `14-weekly-pattern-{light,dark}.png` |

### Batch E: `supplements-with-missed-days`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 16 | Supplements checklist | Home → scroll to the Supplements card (today's checklist). Then open the Supplements screen from it | Still, light + dark | `16-supplements-card-{light,dark}.png`, `16b-supplements-screen-{light,dark}.png` |

### Batch F: `achievements-ready-to-celebrate`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 17 | Achievement unlocked sheet | Opening the app shows `Achievement unlocked, On a Roll`. Wait about 1 s so confetti is mid-air, capture. Do dark on a second reset + relaunch (the sheet shows once) | Still, light + dark | `17-achievement-{light,dark}.png` |

### Batch G: `logged-day-with-meals`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 18 | Offline log, "Waiting to send" | Go offline: `touch "$(xcrun simctl get_app_container <UDID> app.tryprepit.app data)/Documents/debug_offline"`. Open the Greek yogurt with berries → **Add to Log** → today, now → back on Home the new row shows `Waiting to send`. Capture, then `rm` the file | Still, light + dark | `18-offline-waiting-{light,dark}.png` |

### Batch H: `consultation-session2-three-focus-options`

| # | Shot | How | Type | Files |
|---|------|-----|------|-------|
| 20 | Consultation focus picker | `Ask Nutritionist` → answer the Session 2 opener with the chips until the focus picker card shows (Front-load protein at breakfast, Even out the day, Make snacks work harder); capture with the card fully in view, before picking | Still, light + dark | `20-focus-picker-{light,dark}.png` |

### Widgets (no seed)

| # | Shot | How | Files |
|---|------|-----|-------|
| 15 | Home Screen widgets | `./scripts/widget-snapshots.sh build/widget-snapshots` (renders headlessly, light and dark). Copy the 6.1" Water, Streak, Signals and Today's plan renders (small and medium where both exist) | `15-widget-<name>-<size>-{light,dark}.png` |

Not possible on the simulator (skip, don't try): Siri, the Action button, Lock Screen and Control Center controls, real widget taps.

## Handing back

1. Gather every capture, with the file names above, in one folder.
2. Write `RESULTS.md` there: one line per shot with pass/fail and anything odd (wrong data, a nudge or banner in the way, a test-looking name, a reshoot needed).
3. Put them in one secret gist, as for PR proof: `gh gist create RESULTS.md`, `git clone` the gist, copy the PNGs and MP4s in, commit, push. A file over 90 MB is refused: re-record it shorter rather than skipping it. Don't commit captures to any repo.
4. Clean up with `./scripts/dev-down.sh`, clear the status bar override, set appearance back to light, and tell the coordinator the slot is free, with the gist link.
