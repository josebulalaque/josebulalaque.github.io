# josebulalaque.github.io

Personal site of Jose Bulalaque, systems engineer and server administrator. It's a retro terminal (TUI) portfolio with an interactive CLI and a GUI dashboard, built with Astro and Tailwind CSS. It is based on the [Retro TUI Portfolio](https://github.com/nivinvysakh/astro-tui-portfolio) template by Nivin (MIT licensed, see `LICENSE.MD`).

Live at https://josebulalaque.github.io. Every push to `main` deploys through GitHub Actions.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # build to dist/
npm run preview  # serve the built site
```

## Editing content

Almost everything on the site comes from `src/data/portfolio.ts`:

| Field | Shown in |
| --- | --- |
| `developer` (name, title, bio, quote, location, links) | `about`, `contact`, `links`, GUI header and sidebar |
| `developer.specs`, `asciiBanner`, `palette` | `neofetch` and the GUI system card |
| `skills` | `skills` and the GUI skill meters |
| `collabs` | `collabs` and the GUI projects panel |
| `commands` | `help` |

Lines marked `TODO` are placeholders. Leave `linkedin` or `twitter` empty to hide them. The GitHub stats and `repos` output are fetched live from your public GitHub profile, set by `developer.github`.

Other settings live in `src/config/`: colour themes (`themeConfig.ts`), CRT effects (`crtConfig.ts`), the radio playlist (`radioConfig.ts`), and the optional Spotify and game-activity widgets (`spotifyConfig.ts`, `gamesConfig.ts`). The Spotify and game-activity widgets are off by default.
