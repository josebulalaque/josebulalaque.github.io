# josebulalaque.github.io

Personal site: profile, projects, writing and CV. Built with [Astro](https://astro.build) and deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # type-check and build to dist/
npm run preview  # serve the built site
```

## Where things live

| To change | Edit |
| --- | --- |
| Name, role, description, social links | `src/data/site.ts` |
| About and "Off the clock" text | `src/pages/index.astro` |
| CV | `src/data/cv.ts` |
| Blog posts | `src/content/blog/*.md` |
| Projects | `src/content/projects/*.md` |
| Colours and fonts | `src/styles/global.css` |

### Write a post

Add `src/content/blog/my-post.md`. It is published at `/blog/my-post/`.

```md
---
title: My post
description: One sentence for the list page, RSS and link previews.
date: 2026-10-05
tags: [ansible, networking]
draft: false
---

Post body in Markdown.
```

Posts with `draft: true` appear in `npm run dev` but are left out of the built site and the RSS feed.

### Add a project

The Projects page shows "In progress" until the first project exists. Add `src/content/projects/my-project.md`:

```md
---
title: Config backup pipeline
summary: What it is and the problem it solves, in one or two sentences.
date: 2026-10-05
tags: [ansible, ci]
repo: https://github.com/josebulalaque/my-project
url: https://example.com
---

Optional longer write-up.
```

`repo` and `url` are both optional.

## Deploying

The workflow in `.github/workflows/deploy.yml` builds and publishes the site. It needs one setting, made once: in the repository on GitHub go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
