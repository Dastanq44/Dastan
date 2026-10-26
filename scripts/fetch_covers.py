"""Download game and album covers into assets/covers/ (run by the covers workflow).

Games come from the Steam CDN, music from the iTunes Search API with Deezer as
a fallback. Existing files are kept unless --force is given. A report of what
matched is written to assets/covers/REPORT.md so wrong matches are easy to spot.
"""
import io, json, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "covers"
SIZE = 600
UA = {"User-Agent": "Mozilla/5.0 (cover fetcher for a personal site)"}


def get(url, as_json=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        data = r.read()
    return json.loads(data) if as_json else data


def norm(s):
    s = unicodedata.normalize("NFKD", s).lower()
    return "".join(c for c in s if c.isalnum())


def save_square(raw, path, focus_y=0.5):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = int((h - side) * focus_y)
    im = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)
    im.save(path, quality=84, optimize=True, progressive=True)


def steam(appid):
    for url in (
        f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900_2x.jpg",
        f"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/{appid}/library_600x900.jpg",
        f"https://cdn.cloudflare.steamstatic.com/steam/apps/{appid}/library_600x900.jpg",
    ):
        try:
            return get(url), url
        except Exception:
            continue
    raise RuntimeError("no Steam cover found")


def itunes(artist, title):
    q = urllib.parse.urlencode({"term": f"{artist} {title}", "entity": "song", "limit": 15})
    res = get(f"https://itunes.apple.com/search?{q}", True)["results"]
    a, t = norm(artist), norm(title)
    best = None
    for r in res:
        ra, rt = norm(r.get("artistName", "")), norm(r.get("trackName", ""))
        score = (a in ra or ra in a) * 2 + (t in rt or rt in t)
        if score >= 2 and (best is None or score > best[0]):
            best = (score, r)
    if not best:
        raise RuntimeError("no iTunes match")
    r = best[1]
    url = r["artworkUrl100"].replace("100x100bb", "1000x1000bb")
    return get(url), f"iTunes: {r['artistName']} - {r['trackName']} ({r.get('collectionName', '')})"


def deezer(artist, title):
    q = urllib.parse.urlencode({"q": f'artist:"{artist}" track:"{title}"'})
    res = get(f"https://api.deezer.com/search?{q}", True).get("data", [])
    if not res:
        res = get("https://api.deezer.com/search?" + urllib.parse.urlencode({"q": f"{artist} {title}"}), True).get("data", [])
    a = norm(artist)
    for r in res:
        if a in norm(r["artist"]["name"]) or norm(r["artist"]["name"]) in a:
            return get(r["album"]["cover_xl"]), f"Deezer: {r['artist']['name']} - {r['title']} ({r['album']['title']})"
    raise RuntimeError("no Deezer match")


def main():
    force = "--force" in sys.argv
    cfg = json.loads((ROOT / "data" / "covers.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    report = ["# Cover fetch report", "", "| id | source |", "|---|---|"]

    for g in cfg["games"]:
        path = OUT / f"{g['id']}.jpg"
        if path.exists() and not force:
            report.append(f"| {g['id']} | kept existing |"); continue
        try:
            raw, src = steam(g["appid"])
            save_square(raw, path, focus_y=0.3)
            report.append(f"| {g['id']} | {src} |")
        except Exception as e:
            report.append(f"| {g['id']} | FAILED: {e} |")

    for m in cfg["music"]:
        path = OUT / f"{m['id']}.jpg"
        if path.exists() and not force:
            report.append(f"| {m['id']} | kept existing |"); continue
        for fn in (itunes, deezer):
            try:
                raw, src = fn(m["artist"], m["title"])
                save_square(raw, path)
                report.append(f"| {m['id']} | {src} |")
                break
            except Exception as e:
                err = e
            finally:
                time.sleep(0.4)
        else:
            report.append(f"| {m['id']} | FAILED: {err} |")

    (OUT / "REPORT.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("\n".join(report))


if __name__ == "__main__":
    main()
