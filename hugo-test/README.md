# jmeow Hugo test project

This is a separate test conversion of the supplied website, not a replacement for the live repository. The root HTML page is now a Hugo home template in `layouts/home.html`; other existing HTML pages and all original assets are copied into `static/` without changing their public URL paths.

## Deploy to a separate Cloudflare Pages project

1. Create a **new private GitHub repository** for this test and upload the contents of this directory to the repository root. Do not overwrite the existing `jamicat.github.io` repository.
2. In Cloudflare, open **Workers & Pages**, create a **new Pages** project, and connect the new GitHub repository.
3. Use **Framework preset: Hugo**, **Build command: `npm run build`**, **Build output directory: `public`**, and leave the root directory empty. The project does **not** require a custom domain.
4. Set the production environment variable **`HUGO_VERSION` = `0.169.0`**. If the dashboard provides preview environment variables separately, set it there too.
5. Deploy. Check the build logs for successful Tailwind, esbuild and Hugo output. Open the temporary `*.pages.dev` URL.
6. Compare layout and themes first. Then test chat, playlists, guestbook, watch party, image remixing, letter maker, subpages and drag behaviour. Some live API, login, cookie or origin-restricted features may not work on a new `pages.dev` domain without deliberate backend configuration; **do not modify the production Worker just for this test**.
7. Keep the existing `jmeow.co.uk` project as-is unless you explicitly choose to migrate later.

## Local build

Install Node.js and Hugo version 0.169.0. Run `npm install`, followed by `npm run build`. The build creates the complete website in `public/`. To preview locally after building, run `hugo server`.

## Editing

Edit the homepage in `layouts/home.html`. Edit scripts, styles, images and other static files under `static/`. The build runs Tailwind, produces the same three separately minified JavaScript files as Phase 3, writes their content-hashed URLs into Hugo's data directory, and then renders the homepage. The source JavaScript is not bundled, so existing script order and global dependencies remain unchanged.

No Cloudflare Workers or D1 databases are included in this test project. The hosted Worker services remain separate from Hugo.
