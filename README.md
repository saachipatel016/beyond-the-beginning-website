# Beyond the Beginning — Website Redesign

This is a clean, static redesign for Beyond the Beginning, built for Cloudflare Pages.

## What's included
- Responsive HTML and CSS pages
- Existing NICU photographs from the supplied project
- NICU family care package initiative page
- Hospital partnership information
- Family support and external resource pages
- Privacy and medical disclaimer pages

## Removed
- AI chatbot and AI-related pages
- AI chatbot and AI-related scripts
- Supabase client, configuration, and database integrations
- Supabase client, configuration, and database integrations
- Legacy Beyond the Bullying pages and branding

## Important before publishing
1. Add the official public contact email to `contact.html` and update the hospital partnerships page. The supplied project did not contain a Beyond the Beginning contact email.
2. Review all content and resource links before publishing.
3. Ask each receiving hospital to approve package contents, packaging, and delivery arrangements.
4. Have a qualified neonatal professional review any medical or clinical educational content before describing it as clinically reviewed.
5. Do not claim 501(c)(3) status, tax deductibility, hospital endorsement, or confirmed partnerships unless those are formally established.

## Deploy to Cloudflare Pages
Upload the contents of this folder to the existing Cloudflare Pages project using the same deployment method you already use. No build command is required; this is a static site. The output directory is the project root.

Keep the old deployment available until you have tested the redesigned site on the new deployment URL.

## File structure
- `index.html` — home
- `about.html` — our story
- `resources.html` — external NICU resources
- `family-support.html` — family support prompts
- `care-packages.html` — care package initiative
- `hospital-partnerships.html` — hospital collaboration
- `get-involved.html` — volunteering and community involvement
- `contact.html` — contact details placeholder
- `privacy.html` — privacy notice
- `medical-disclaimer.html` — educational limitations
- `styles.css` — all site styling

The public site uses a small `site.js` script to read page availability and the resource catalog. JavaScript is also used in the private dashboard; there is no AI chatbot or AI integration.

## Private admin dashboard (`/admin`)

This version includes a GitHub-authenticated content manager at `/admin/`. The public site uses a small script for page availability and resource catalog rendering; the admin interface and Cloudflare Pages Functions also use JavaScript.

The dashboard is a lightweight content manager. It includes a visual page editor (click and edit text in the page preview), page publishing states (Published, Coming soon, Hidden), page creation from a starter template, resource management, custom resource categories, and image uploads. Resource entries are stored in `site-content.json` and rendered on the public Resources page. Images are committed under `/assets/`. Changes are committed to GitHub and deployed by Cloudflare Pages.

**Editing note:** The visual page editor edits text directly in a page preview. To change an image, select it, upload a replacement or enter its image path, and update its caption/alt text. This is not a full drag-and-drop design tool; advanced layout changes still require code. The dashboard manages the page content, resources, categories, image files, and page availability.

### One-time setup required

1. **Create a GitHub OAuth App** in GitHub: Settings → Developer settings → OAuth Apps → New OAuth App.
   - Application name: `Beyond the Beginning Admin`
   - Homepage URL: your Cloudflare Pages website URL
   - Authorization callback URL: `https://YOUR-SITE.pages.dev/api/auth/callback` (replace with your actual site URL)
   - Create the app and keep its Client ID and Client Secret private.
2. In **Cloudflare Dashboard → Workers & Pages → your Pages project → Settings → Variables and Secrets**, add these values for the Production environment:
   - `GITHUB_CLIENT_ID` — OAuth app Client ID
   - `GITHUB_CLIENT_SECRET` — OAuth app Client Secret (mark as secret)
   - `GITHUB_OWNER` — GitHub account or organization that owns the repository
   - `GITHUB_REPO` — repository name, without `.git`
   - `GITHUB_BRANCH` — deployment branch, usually `main`
   - `ADMIN_GITHUB_USERNAME` — the exact GitHub username allowed to sign in
   - `SESSION_SECRET` — a long, random secret (at least 32 random characters; keep it private)
3. Make sure the OAuth app's GitHub account has write access to the configured repository.
4. Deploy the full project to Cloudflare Pages, including the `functions/` folder. If using a Git-connected Pages project, commit and push these files to the configured branch. If using a direct upload workflow, use a deployment method that supports Pages Functions; a plain static-assets-only upload will not run the admin API.
5. Visit `/admin/` and sign in using the authorized GitHub account.

### Security notes

- The admin URL is not the security boundary. GitHub OAuth plus the `ADMIN_GITHUB_USERNAME` allowlist protects access.
- The GitHub access token is encrypted in an HttpOnly, Secure, SameSite cookie and expires after eight hours.
- Never publish the OAuth Client Secret or `SESSION_SECRET` in website files or commit them to GitHub. Store them only as Cloudflare secrets.
- The OAuth app requests the `repo` scope so it can write website files. Use a dedicated GitHub account with access only to this website repository where practical.
- The CMS API permits only website HTML pages, `site-content.json`, and safe image filenames under `assets/`; it does not expose arbitrary repository paths.
- The dashboard does not offer unrestricted drag-and-drop layout editing. It provides visual text editing and dedicated content forms; advanced layout/styling changes still require code. New pages start from an existing page template.
