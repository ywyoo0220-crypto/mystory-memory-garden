<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Question-list back navigation uses router history when available and a mode-specific fallback on direct entry, so Home and recording entry flows retain their origins.
- Records live in localStorage via src/lib/store.ts (useSyncExternalStore); no backend yet — keeps the app login-free.
- Large-text mode scales the root font-size, so sizes must use rem, not px.
- Category colors come from src/data/themes.json via lib/theme.ts; light-list controls use the derived list-accent token (dark age background, otherwise pill), so inverted dark-age pills remain legible outside cards.
- Photos are blobs in IndexedDB (src/lib/media.ts, records keep "idb:" refs); voice blobs are in IndexedDB "ms-audio" keyed recordId:step (src/lib/audio.ts) and records keep only `voices` metadata — localStorage is too small for media; still no backend.
- MY screens each have their own route under /my/* (usability testing); profile, settings, shares and the hashed lock PIN live in localStorage via src/lib/prefs.ts, separate from records.
- Text size uses two steps (normal/large); normalize legacy larger values to large so settings and floating controls stay consistent.
- Example records require explicit settings opt-in; startup removes legacy auto-seeded examples but preserves personal records, and explicit imports remain intact.
- First-run onboarding lives at /onboarding/$n (one route per screen for Maze); root redirects there after the lock while localStorage "ms.onb" is unset, and hides AppNav on it.
- Onboarding uses a fixed flex shell with an independently scrolling middle and an opaque footer; examples cannot slide underneath actions.
- Onboarding carries help replay in the validated `mode=help` search parameter and shared step helpers; replay ends at screen 3, first-run skips legacy screen 4 to screen 5, preserving existing first-question return URLs.
- Book assembly uses lib/book.ts for fixed topic-then-period ordering and cover eligibility; optional photoSteps aligns photo refs to answers, with legacy photos at step zero.
- Cover choice and one resized uploaded cover live in the local profile and travel with backups; profile edits preserve these fields.
- Book preview and browser print share one document, with zero horizontal page margins and content-side padding to avoid Chromium clipping.

- Launch uses a root-shell overlay and a sessionStorage flag; underlying lock/onboarding mounts immediately and storage is checked only after hydration.
- Shared error screens subscribe to the text-size store and serve root/router defaults so direct missing URLs honor the saved text size.
- Keep the legacy backup app discriminator and PIN salt unchanged when updating display branding, to preserve existing backups and locks.
- Exhibition persona icons: ?p=A|B|C swaps manifest/apple-touch-icon links client-side via lib/persona.ts, remembered in sessionStorage; defaults untouched.
- Type uses only text-title/body/caption tokens with font-medium or font-normal; --spacing is 4px so spacing stays fixed in large-text mode (book preview and launch screen excluded).
