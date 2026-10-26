# Dastan's personal site (skeleton)

Plain HTML/CSS/JS, no build step. Open `index.html` in a browser to preview.

## Structure
- `index.html` hub: name, intro, and two "doors" (Code / Personal) so each visitor picks their path in one click.
- `dev.html` Code section (cyan): About, Stack, Projects (filterable), GitHub, Contact.
- `personal.html` Personal section (red): Music player, Games/Films/Albums shelf, Links.
- `css/style.css` all styles. Colors and sizes are variables at the top.
- `js/main.js` small extras (boot screen, filters, tabs, audio). Site works without it.

The top nav on every page always shows Home / Code / Personal, and each section page ends with a link to the other one.
The whole site sits in a centered "box" on desktop; the sides show only the background. On phones the box goes full width.

## Adding music
Put files in `assets/music/` and set `data-src="assets/music/track.mp3"` on each `<li class="track">` in `personal.html`.

## Hosting (all free for a static site)
| Host | Good at | Watch out for |
|---|---|---|
| **GitHub Pages** | Simplest if code lives on GitHub; `username.github.io` URL; ties nicely to a dev portfolio | No server functions; 1 GB site / 100 GB-month bandwidth soft limits |
| **Cloudflare Pages** | Unlimited bandwidth, very fast CDN, free custom domain + SSL, deploys from GitHub | Dashboard is a bit busier |
| **Netlify** | Easy drag-and-drop deploys, built-in forms (contact form) | Free tier 100 GB/month bandwidth |
| **Vercel** | Great if you later move to Next.js/Astro | Free tier is "hobby / non-commercial" only |

Recommendation: start on **GitHub Pages** (it doubles as a showcase on your GitHub), or **Cloudflare Pages** if you'll host large audio files and want unlimited bandwidth. A custom domain (~$10/yr) works with any of them.
