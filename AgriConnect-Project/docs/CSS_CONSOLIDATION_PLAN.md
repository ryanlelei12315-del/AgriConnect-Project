# Slice 2 CSS consolidation plan

## Findings

- `public/css/style.css` has two `:root` declarations: the original literal palette and an appended partial semantic system.
- Shared buttons, tables, badges, states, and responsive rules are defined more than once. Later declarations win inconsistently.
- Layout rules depend extensively on the original token names (`--emerald`, `--cream`, and similar), while newer shared patterns use a separate token vocabulary.
- EJS templates still contain many one-off inline layouts. These should be migrated page-by-page, not through a broad unsafe rewrite.

## Safe migration approach

1. Make the first `:root` the single authoritative source. Keep legacy aliases temporarily so existing templates and layout CSS continue to render.
2. Remove the second token declaration, preserving its useful component selectors.
3. Consolidate shared button, card, form, badge, alert, table, loading, and state rules under the semantic token system.
4. Standardize three responsive bands: desktop (default), tablet (`<= 1024px`), and mobile (`<= 640px`). Existing page-specific media rules remain until their pages are migrated.
5. Migrate repeated patterns in touched templates only. Dynamic inline values remain inline when they are data-dependent.

## Slice 2 implementation

- `style.css` now contains the sole token declaration, including semantic light and dark values plus compatibility aliases for unmigrated legacy layout rules.
- `foundation.css` contains shared component behavior and is loaded after the legacy stylesheet to provide stable canonical button, card, form, badge, alert, state, loading, and table patterns.
- `views/partials/alert.ejs` and `views/partials/state.ejs` provide small, reusable server-rendered primitives for future workflow migration.

## Non-goals for this slice

- No landing-page, dashboard, marketplace, or profile redesign.
- No broad deletion of page-specific CSS without visual verification.
