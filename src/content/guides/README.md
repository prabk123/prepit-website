# Guides

Each `.mdx` file here is one page at `/guides/<file name>`. Adding a file adds the page, its card on `/guides`, its Open Graph image and its sitemap entry.

Guides are rewritten for the web from the app's Tips and tricks (`fresca_app` `lib/tips/tips_guides.dart`) and the backend help docs (`fresca_backend` `docs/product-help/`). Keep them true to the current app, and use the public name PrepIt only.

## Frontmatter

All values are quoted strings except `order`.

- `title`, `description` (meta and link previews, about 150 characters), `summary` (one line for the card)
- `section`: `set-up`, `logging` or `more`, the same groups as Tips and tricks
- `order`: position within the section
- `hero` and `heroAlt`: a capture name from `public/app` (a still such as `13-grocery-list`, or a clip such as `03-log-typed`) for the header
- `thumb` (optional): a still for the card, when the hero is a clip or its top isn't telling
- `updated`: `YYYY-MM-DD`, when the steps were last checked against the app

## Blocks

Plain Markdown, plus these (see `src/components/guides/GuideBlocks.tsx`). An unknown capture name fails the build.

- Numbered lists render as steps.
- `<Shots>` holds one to three `<Shot name="…" alt="…" caption="…" />` (a phone) or `<Widget name="15-widget-…" alt="…" caption="…" />`.
- `<Tips title="…">` holds `<Tip title="…">One line of text.</Tip>`. Keep each tip on one line, so MDX doesn't wrap it in a paragraph.
- `<Examples>` holds `<Example title vague vagueNote specific specificNote />`.
- `<Note>` for an aside, such as an iOS version requirement.

Every guide ends with the download section, and its App Store taps are sent as `guide-<slug>`.
