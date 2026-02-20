# Drusniel — Arcane Paradox A.I.

A fantasy world-building and storytelling site built with [Gatsby 5](https://www.gatsbyjs.com/) using the ElegantStack FlexiBlog theme, structured as a Yarn/npm monorepo with Lerna.

## Prerequisites

- **Node.js ≥ 20** (see `engines` in `package.json`)
- **npm** (ships with Node.js)

## Project Structure

```
drusniel/
├── packages/          # Shared blog packages (theme, core, helpers, plugins)
│   ├── blog/
│   │   ├── gatsby-blog-core/       # GraphQL schema, page creation, templates
│   │   ├── gatsby-blog-helpers/    # React hooks (useBlogAuthors, etc.)
│   │   └── gatsby-blog-pages/     # Page components (authors, gods, secondary-characters, etc.)
│   └── plugins/                   # Custom Gatsby plugins
├── site/              # Main Gatsby site
│   ├── content/       # Content (posts, authors, categories, assets)
│   ├── gatsby-config.js
│   ├── package.json
│   └── src/           # Theme shadowing overrides
└── package.json       # Root monorepo config (workspaces)
```

## Getting Started

### 1. Install Dependencies

From the **repository root**:

```bash
npm install
```

This installs dependencies for all workspaces (root, `packages/**`, and `site`).

### 2. Local Development

```bash
cd site
npm run develop
```

The site will be available at `http://localhost:8000`. GraphiQL is available at `http://localhost:8000/___graphql`.

### 3. Production Build

```bash
cd site
npm run clean && npm run build
```

This is the same command Netlify runs (`cd site && npm run clean && npm run build`). The static output is generated in `site/public/`.

### 4. Preview the Production Build Locally

After building:

```bash
cd site
npm run serve
```

The production site will be served at `http://localhost:9000`.

## Deploying to GitHub Pages (with Custom Domain)

Everything is built locally, nothing runs in the cloud. GitHub Pages hosting is **free**.

### Build & Test Locally

```bash
cd site
npm run clean && npm run build
npm run serve
# → Preview at http://localhost:9000 — verify everything works
```

### Deploy

```bash
cd site
npx gh-pages -d public
```

This pushes `site/public/` to the `gh-pages` branch on GitHub, which GitHub Pages serves automatically.

### One-Time GitHub Setup

1. Go to **github.com/danielsobrado/drusniel** → **Settings** → **Pages**
2. **Source**: "Deploy from a branch"
3. **Branch**: `gh-pages` / `/ (root)`
4. **Custom domain**: `www.drusniel.com` → Save
5. Tick **Enforce HTTPS** (once DNS propagates)

### One-Time DNS Setup (IONOS)

Update only these records at your domain registrar. **Keep all MX/TXT/autodiscover records for mail.**

**Delete** the existing A record (`@ → 75.2.60.5`) and add these 4 GitHub Pages IPs:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

**Update** the existing CNAME for `www`:

| Type | Host | Old Value | New Value |
|------|------|-----------|-----------|
| CNAME | `www` | `jolly-daffodil-d99669.netlify.app` | `danielsobrado.github.io` |

> **Note:** The `site/static/CNAME` file contains `www.drusniel.com` and is automatically copied into every build. This tells GitHub Pages which custom domain to use.

## Available Scripts (from `site/`)

| Script          | Command                | Description                          |
|-----------------|------------------------|--------------------------------------|
| `npm run develop` | `gatsby develop`     | Start dev server with hot reload     |
| `npm run build`   | `gatsby build`       | Production build → `site/public/`    |
| `npm run clean`   | `gatsby clean`       | Clear `.cache` and `public` dirs     |
| `npm run serve`   | `gatsby serve`       | Serve production build locally       |
| `npm start`       | `gatsby develop`     | Alias for develop                    |

## Content Management

- **Posts**: `site/content/posts/{en,es}/{region}/` — MDX files with frontmatter
- **Characters (Authors)**: `site/content/authors/*.json` — Character data with face images
  - `"god": true` → appears on the Gods page (`/gods`)
  - `"secondary": true` → appears on the Secondary Characters page (`/secondary-characters`)
  - Neither flag → appears on the Main Characters page (`/authors`)
- **Categories**: `site/content/categories/*.json`

## Contributing

All comments are welcome. Open an issue or send a pull request if you find any bugs or have recommendations for improvement.

## License

This project is licensed under: Attribution-NonCommercial-NoDerivatives (BY-NC-ND) license See: https://creativecommons.org/licenses/by-nc-nd/4.0/deed.en
