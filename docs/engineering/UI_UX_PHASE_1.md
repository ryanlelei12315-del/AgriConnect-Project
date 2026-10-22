# UI/UX phase 1 — shared experience

## Completed

- Unified the web light/dark theme control. It now binds after navigation exists, persists via local storage, and updates accessible pressed, title, and label states.
- Removed the dashboard sidebar's competing theme mutation; it now uses the shared control.
- Applied shared visual refinements to marketplace filtering, cards, authentication, tables, and narrow-screen layouts using existing CSS tokens.
- Replaced non-semantic clickable role tiles on the landing page with real links.
- Fixed the mobile produce-card image base URL to use the configured API endpoint instead of a hard-coded Android emulator host.
- Improved mobile empty/error feedback and retry touch target.
- Removed unmounted dashboard destinations and added the working Buyer Demand shortcut for buyer accounts.
- Added live active-listing usage to the farmer dashboard, derived from the server-side entitlement service.

## Design direction

The current stacks remain unchanged: EJS on web and React Native/Expo on mobile. The visual system uses the existing emerald, warm neutral, and KES-marketplace language with larger touch targets and clearer content hierarchy.

## Next slices

1. Move the remaining inline sidebar and landing styles into tokenized components.
2. Add browser screenshot smoke coverage for navigation, theme persistence, forms, tables, and mobile breakpoints.
3. Add role-specific empty-state onboarding and paid-plan upgrade guidance when a verified billing flow exists.
