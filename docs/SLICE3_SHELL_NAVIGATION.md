# Slice 3 — Application shell + navigation (in progress)

## Completed in this pass

### Slice 2 loose ends
- Removed the broken `/css/pages/produce.css` stylesheet link from `views/partials/header.ejs` (the file never existed; every page 404'd on it). Produce page styles live in `style.css`.
- `public/js/` confirmed empty with no template references — no dangling script tags.
- `.sidebar-guest-links` (previously inline-styled) now has real CSS.

### Active-route semantics (bug fix)
- `marketplaceController` and `orderController` were passing the **pagination number** as `currentPage`, so sidebar checks like `currentPage === 'marketplace'` could never match. Introduced a dedicated `activeNav` local:
  - `activeNav` is now passed by marketplace, orders, services, market-prices, and why-us renders.
  - `navbar.ejs` and `sidebar.ejs` resolve the current section as `activeNav || (string) currentPage` and render `.active` + `aria-current="page"`.

### Public navbar (mobile navigation added)
- Hamburger toggle (`.nav-toggle`, 44px target) shown ≤ 860px; `.nav-center` links move into a `.nav-drawer` panel.
- Drawer: Escape closes (focus returns to toggle), outside click closes, link click closes, closes on resize past breakpoint, `aria-expanded`/`aria-controls` on the toggle, 44px touch targets.
- At ≤ 480px the user chip name hides to prevent nav overflow.

### Sidebar
- Mobile drawer: `aria-expanded`/`aria-controls` on the toggle, Escape closes (user menu first, then drawer) with focus return, overlay click returns focus.
- Desktop collapse state persists via `localStorage` key `agriSidebarCollapsed`.
- Duplicate `id="themeToggle"` between navbar and topbar fixed: theme toggles now bind via `[data-theme-toggle]` in `header.ejs`.
- Sidebar mobile toggle bumped to a 44px touch target.

### Styles
- Slice 3 shell styles appended to the end of `style.css` using semantic tokens (`nav-toggle`, `nav-drawer`, active states, guest links) — no new token layer.

## Not yet done (remaining Slice 3 / later slices)
- Page-header/breadcrumb consistency across views (`topbar.ejs` exists but most views don't pass `breadcrumb`).
- `sidebarPanels.ejs` appears unused — verify and remove or integrate.
- Desktop collapse button behavior on viewports where the sidebar overlays content.
- Full keyboard focus trap for the mobile drawer (currently focus returns on close, but Tab is not trapped while open).
- Dashboard redesign (Slice 4) and beyond.

## Validation
- `node --check` on changed controllers + `server.js`: passed.
- EJS compile of all 40 templates: 0 failures.
- `style.css` brace balance: 827/827.
- `git diff --check` whitespace: clean.
- Mobile typecheck not re-run (no mobile changes).