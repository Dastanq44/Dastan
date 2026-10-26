# Dastan's personal site (skeleton)

Plain HTML/CSS/JS, no build step. Open `index.html` in a browser to preview.

## Structure
One page (`index.html`): photo + info, then a Music section with three players.
- Header: **Links** drop-down (Spotify, GitHub, Instagram, LinkedIn logos) and a light/dark switch. Light is the default; the choice is remembered.
- `css/style.css` all styles. Theme colors are variables at the top (`:root` = light, `[data-theme="dark"]` = dark).
- `js/main.js` theme switch, links drop-down, audio players.
- `assets/img/dastan.jpg` photo, `assets/music/*.mp3` tracks.

## Adding a track
Copy a `<li class="player">` block in `index.html`, change `data-src`, the title, the note and the duration.

## Hosting (all free for a static site)
| Host | Good at | Watch out for |
|---|---|---|
| **GitHub Pages** | Simplest if code lives on GitHub; `username.github.io` URL; ties nicely to a dev portfolio | No server functions; 1 GB site / 100 GB-month bandwidth soft limits |
| **Cloudflare Pages** | Unlimited bandwidth, very fast CDN, free custom domain + SSL, deploys from GitHub | Dashboard is a bit busier |
| **Netlify** | Easy drag-and-drop deploys, built-in forms (contact form) | Free tier 100 GB/month bandwidth |
| **Vercel** | Great if you later move to Next.js/Astro | Free tier is "hobby / non-commercial" only |

Recommendation: start on **GitHub Pages** (it doubles as a showcase on your GitHub), or **Cloudflare Pages** if you'll host large audio files and want unlimited bandwidth. A custom domain (~$10/yr) works with any of them.
