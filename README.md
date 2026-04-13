# md2form Playground

A Next.js application that lets you write form definitions in Markdown and preview the rendered form UI live. The app uses the `md2form` parser to convert Markdown into form structures so you can prototype short/long text, choice fields, ratings, uploads, signatures, and more — all interactively.

## Key features

- Two-pane layout: Markdown editor on the left and live form preview on the right
- Autocomplete and templates focused around `#type` directives
- Debounced, near-real-time parsing of Markdown edits
- Multi-page form preview with progress display
- Inspect submission payload as JSON in a modal/dialog
- Light and Dark theme toggle

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- `md2form` (Markdown → Form conversion)
- `next-themes`, `sonner`, `react-syntax-highlighter`

## Quick start (using Bun)

Install dependencies and start the development server using Bun:

```bash
bun install
bun run dev
```

By default the app runs at `http://localhost:3000`. The playground is available at `http://localhost:3000/playground`.

### Notes about Bun

- The repository's scripts (see below) are runnable through Bun by prefixing with `bun run <script>`.
- If your environment or project tooling requires `node` / `npm`/`pnpm`/`yarn`, you can still use those tools, but the examples here use Bun commands.

## Supabase and Stripe environment variables

To enable form management, published responses, or paid-plan (Stripe) features, copy `.env.example` to `.env.local` and set the following environment variables:

Required for management/public routes (`/forms`, `/f/[slug]`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Required for Stripe / paid plan features:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`

Example:

```bash
cp .env.example .env.local
# then edit .env.local and set the values above
```

If you only intend to use the local playground, these variables are not required. For paid-plan features, create the Price object and a webhook endpoint in the Stripe Dashboard before populating the Stripe environment variables.

## Scripts (run with Bun)

Use Bun to run the scripts listed in `package.json`:

- `bun run dev` — Start the development server
- `bun run build` — Build for production
- `bun run start` — Start the production server
- `bun run lint` — Run ESLint

(You can still run these with other package managers if you prefer, but the recommended commands here use Bun.)

## Basic Markdown format for forms

The playground expects a top-level YAML frontmatter followed by question sections. Frontmatter configures global form options. Below is an example:

```md
---
collectEmail: true
allowMultipleResponses: false
limitResponses: 500
showProgressBar: true
shuffleQuestions: false
responseReceipt: whenRequested
themeColor: "#2563EB"
backgroundImage: mountain
font: "Noto Sans JP, sans-serif"
---

# Form Title

A short description for the form.

### Full name

#type short_text
#placeholder "Taro Yamada"
#required true
#maxLength 60

---

### Technologies of interest

#type checkbox
#options "TypeScript","React","Node.js"
#required true
#minSelected 1
```

- Frontmatter keys modify overall form behavior (email collection, progress bar, limits, theme).
- Each question is written as a Markdown heading with following `#type` and optional configuration keys.
- Pages are separated with `---`.

## Supported `#type` values

- Text & numeric: `short_text`, `long_text`, `email`, `phone`, `number`
- Choice: `dropdown`, `radio`, `checkbox`, `boolean`
- Date/time: `date`, `time`
- Scales: `rating`, `likert`, `matrix`, `scale`
- Files & signatures: `file_upload`, `signature`
- Media & structure: `image`, `video`, `section_header`

Refer to the component implementations under `components/form-elements/*` for details on each field's supported options.

## Project layout (important files)

- `app/page.tsx` — Top-level landing page
- `app/playground/page.tsx` — Playground UI and page container
- `components/markdown-editor.tsx` — Markdown editor with autocomplete & templates
- `components/form-renderer.tsx` — Form renderer and submission handling
- `components/form-elements/*` — Per-field UI implementations
- `lib/md2form-autocomplete.ts` — Autocomplete suggestions and templates
- `lib/CONFIG.ts` — Default frontmatter and configuration values

## Integration notes

This repository is intended as a playground to experiment quickly with `md2form`. If you adopt this for production use, consider the following additions:

- Stronger server-side and client-side validation
- Persistent storage for forms and responses (e.g., Supabase or another database)
- Authentication and authorization for form management
- Rate limiting and abuse protection for public forms
- Proper handling of file uploads (size limits, virus scanning, storage lifecycle)
- Production-ready Stripe webhook handling and billing flows (if enabling paid plans)

## Contributing

If you want to contribute improvements (new field types, parser improvements, UI polish):

1. Open an issue describing the enhancement or bug.
2. Create a branch from the main branch and submit a pull request with tests where appropriate.
3. Keep changes focused and update documentation when behavior changes.

## License and copyright

Refer to the repository root for license information. This project is a playground and example implementation for `md2form` — reuse and adapt it as needed under the applicable license.

## Contact / Feedback

If you find bugs or have suggestions for improvements, open an issue or submit a pull request. When reporting issues, include a minimal reproduction (Markdown input + observed behavior) so it's easier to debug.
