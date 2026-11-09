# PI220 COMMUNICATIONS v1.2 — Security & Interface

## Included
- Supabase email/password registration, sign-in, session persistence, sign-out and password recovery.
- Public room directory and channel search.
- Last 100 messages per selected room.
- Realtime INSERT subscription for the selected room.
- Profile display names for message authors.
- Database rejection feedback for duplicate-message and rate-limit errors.
- Message composer preserves text when the database rejects a submission.
- Independent message-history scrolling with conditional follow-to-latest behaviour.
- New-message indicator when the reader has scrolled away from the bottom.
- Responsive layout using CSS size container queries so the interface adapts to the actual embedded/resized app area.

## Configuration
Open `js/config.js` and paste the existing Supabase **publishable key** (or legacy anon public key) into `SUPABASE_PUBLISHABLE_KEY`.

Never put a Supabase `service_role` key or secret key in browser code.

The project URL is already configured for the PI220 COMMUNICATIONS Supabase project.

## Run locally
Use VS Code with Live Server and open the served `index.html`, for example:
`http://127.0.0.1:5500/index.html`

Do not open the file directly with `file://`.

## Important deployment notes
- This is a frontend application. Supabase RLS, grants, constraints and database triggers remain the enforcement boundary.
- The frontend displays friendly feedback for known database rejection messages; it does not replace server-side enforcement.
- The app currently lists public rooms. Private-room membership administration is not implemented in this version.
- Before GitHub Pages deployment, configure the exact production URL in Supabase Authentication URL Configuration while retaining the local development redirect URL.
- Test in the actual PI220 parent window/iframe dimensions before embedding the production build.
