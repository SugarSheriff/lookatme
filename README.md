# lookatme

Personal portfolio site for Liam Hulsey — software developer specializing in integration engineering.

**[Live site →](https://sugarsheriff.github.io/lookatme/)**

## What this is

A single-page portfolio built to give recruiters and hiring managers concrete proof of technical depth, not just a list of buzzwords. It covers work history, a stack breakdown, credentials, and a set of standalone interactive projects that each demonstrate a different facet of enterprise integration work — the kind of thing that's hard to show in a resume bullet.

## Sections

- **Hero** — an animated SVG pipeline visual (SAP B1 → Wrike → SQL Server → DAM/EDI → "your stack") that sets up the integration-engineer framing before any text does
- **Experience** — role history from Tier I support through current integration development work
- **Projects** — four linked showcase repos, each a live interactive demo plus real production-pattern code samples:
  - [**Sync Hub**](https://github.com/SugarSheriff/sync-hub) — SAP Business One ↔ Wrike integration pipeline
  - [**Tape Read**](https://github.com/SugarSheriff/edi-pipeline) — EDI X12 850 purchase order parsing and validation
  - [**FlickFinder**](https://github.com/SugarSheriff/FlickFinder) — decision-tree movie/TV picker against the live TMDB API
  - [**AssetRoute**](https://github.com/SugarSheriff/dam-sync) — DAM asset sync pipeline with metadata validation and multi-system distribution
- **Stack** — languages, databases/reporting tools, and cloud/integration tooling used day to day
- **About** — background and credentials
- **Contact** — email, phone, GitHub, LinkedIn
- **A small game** — because scrolling to the bottom of a portfolio should be rewarded

## Stack

Vanilla HTML/CSS/JS, no build step, deployed via GitHub Pages. Space Grotesk for display type, IBM Plex Mono for labels and monospace accents — the same design language carried through every linked project repo for a cohesive look across the whole portfolio.

## Files

```
lookatme/
├── index.html
├── style.css
├── script.js
├── favicon.png
├── og-image.png
├── Liam-Hulsey-Resume.pdf
└── README.md
```

## Local development

No build tooling required — open `index.html` directly in a browser, or serve the folder with any static file server. All project links point to their own independently deployed GitHub Pages sites.

---

Built and maintained by [Liam Hulsey](https://www.linkedin.com/in/liam-hulsey/) · [GitHub](https://github.com/SugarSheriff)
