# BASIC SYSTEMS — Company Website

Static, dependency-free website for **BASIC SYSTEMS** (HTML + CSS + vanilla JavaScript).
No build step, no server, no database. It deploys free on **Cloudflare Pages** or **GitHub Pages**.

## Project structure

```
MY WEBSITE/
├── public/                      ← the website (this folder is what gets deployed)
│   ├── index.html               ← single-page site: Home, Solutions, Services, Why, About, Process, Contact
│   ├── 404.html                 ← "page not found" page
│   ├── _headers                 ← Cloudflare Pages security + caching headers
│   ├── robots.txt
│   ├── assets/favicon.svg
│   ├── css/styles.css           ← all styling (brand colours are CSS variables at the top)
│   └── js/
│       ├── config.js            ← ★ the ONLY file you need to edit: form endpoint + contact details
│       ├── main.js              ← mobile menu, active nav, scroll animations
│       └── contact.js           ← form validation and sending
├── backend-examples/
│   └── cloudflare-pages-function/contact.js   ← optional free email backend (not active)
├── scripts/
│   ├── serve.mjs                ← local preview server (no dependencies)
│   └── check.mjs                ← pre-deploy checks (links, files, SEO tags, placeholder text)
├── .github/workflows/github-pages.yml          ← optional GitHub Pages deployment
├── package.json
└── README.md
```

## 1. Run locally

Requires [Node.js](https://nodejs.org) 18 or newer (only for the preview server; the site itself needs nothing).

```bash
npm run dev       # open http://localhost:8080
npm run check     # run the pre-deployment checks
```

No `npm install` needed; there are no dependencies.

## 2. Create a GitHub repository

1. Install Git from <https://git-scm.com/download/win> (if not already installed).
2. Sign in to <https://github.com> → **New repository** → name it e.g. `basic-systems-website` → **Create repository** (leave "Add a README" unticked).

## 3. Upload the project

In a terminal opened in this folder:

```bash
git init
git add .
git commit -m "BASIC SYSTEMS website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/basic-systems-website.git
git push -u origin main
```

*(No Git? On the new GitHub repo page choose **"uploading an existing file"** and drag in the folder contents.)*

## 4. Deploy to Cloudflare Pages (free)

1. Create a free account at <https://dash.cloudflare.com>.
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → authorise GitHub → pick the repository.
3. Build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | **None** |
   | Build command | *(leave empty)* |
   | Build output directory | **`public`** |
4. **Save and Deploy**.

Every later `git push` to `main` redeploys automatically.

**Alternative without GitHub:** Workers & Pages → Create → Pages → **Upload assets** → drag in the `public` folder.

## 5. Get the public URL

When the deploy finishes, Cloudflare shows the URL, e.g. **`https://basic-systems-website.pages.dev`** (the name comes from your project name). You can add your own domain later under **Custom domains**.

After you know the final URL:
- uncomment the `<link rel="canonical">` line in `public/index.html` and set the URL;
- optionally add a sitemap line to `public/robots.txt`.

### Optional: GitHub Pages instead

Repo → **Settings → Pages → Source: GitHub Actions**. The included workflow publishes the `public` folder on every push to `main`.
Note: on a project URL like `username.github.io/repo/`, the custom 404 page's styles won't load (it uses root paths). Everything else works. A custom domain avoids this.

---

## Contact form

The form is **frontend-ready but not connected**. Until an endpoint is set, it validates input and then clearly tells the visitor that **the inquiry was not sent**. It never pretends to send.

To receive inquiries, edit **`public/js/config.js`** → `contactForm` and pick one free option:

| Option | Cost | Setup |
|---|---|---|
| **Web3Forms** | Free tier | Get an access key at web3forms.com → `endpoint: "https://api.web3forms.com/submit"`, `extraFields: { access_key: "…" }` |
| **Formspree** | Free tier | Create a form at formspree.io → `endpoint: "https://formspree.io/f/…"` |
| **Cloudflare Pages Function + Resend** | Free tiers | Copy `backend-examples/cloudflare-pages-function/contact.js` to `functions/api/contact.js`, set the env variables listed in that file, set `endpoint: "/api/contact"` |

Free-tier limits change. Check the provider's current terms.

## Contact details (email / phone / address)

None are shown yet, because none were provided. Fill in `siteContact` in **`public/js/config.js`**; they then appear automatically in the Contact section and footer. Blank entries stay hidden.

## Editing content and colours

- Text: edit `public/index.html` (sections are clearly commented).
- Colours: CSS variables at the top of `public/css/styles.css` (`--blue`, `--navy`, `--orange`, …).
