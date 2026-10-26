#!/usr/bin/env python3
"""Фото и видео для сайтов каталога (владелец, 24.10: «ищи видео, фото, если не находишь — генерируй через
Cloudflare Workers AI или другие бесплатные сервисы»).

Источники по порядку:
  * видео — Mixkit (Mixkit Stock Video Free License: можно в коммерческих сайтах, без подписи автора);
  * фото — Openverse, только CC0 / Public Domain (подпись не нужна), лучшие — rawpixel и Wikimedia;
  * генерация — FLUX.2 [dev] на Workers AI нашего аккаунта (CLOUDFLARE_API_TOKEN).

Файлы ложатся в R2 `atlas-media` под именем <slug>-<sha1[:20]>.<ext> и отдаются конструктором по /media/<имя>
(с Range — видео играет и в Safari). В JSON сайта пишется `/media/<имя>`.

  python3 scripts/media.py search  "<english query>" [--video] [--n 12]   кандидаты + контактный лист в OUT
  python3 scripts/media.py put     <slug> <файл|url> [--w 1600]            сжать и выложить → /media/…
  python3 scripts/media.py gen     <slug> "<prompt>" [--w 1536 --h 1024]  сгенерировать и выложить → /media/…
  python3 scripts/media.py video   <slug> <mixkit mp4 url>                 видео 720p + постер → /media/…

OUT — папка для кандидатов (по умолчанию ./.media-work, в git не идёт). Нужны PIL и ffmpeg (FFMPEG=путь).
"""
import base64, hashlib, io, json, os, re, subprocess, sys, urllib.parse, urllib.request

ACCOUNT = os.environ.get('CLOUDFLARE_ACCOUNT_ID', 'b19fb6e4449b69192095103413f15b31')
TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN', '')
OUT = os.environ.get('OUT', os.path.join(os.getcwd(), '.media-work'))
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36'}
BUCKET = 'atlas-media'


def fetch(url, data=None, headers=None, timeout=60):
    req = urllib.request.Request(url, data=data, headers={**UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name)
        return sys.argv[i + 1]
    return default


def sheet(paths, out, label=True):
    from PIL import Image, ImageDraw
    ims = []
    for p in paths:
        try:
            im = Image.open(p).convert('RGB')
            im.thumbnail((420, 300))
            ims.append((os.path.basename(p), im))
        except Exception:
            pass
    if not ims:
        return
    cols = 4
    s = Image.new('RGB', (cols * 424, ((len(ims) + cols - 1) // cols) * 324), 'white')
    d = ImageDraw.Draw(s)
    for i, (n, im) in enumerate(ims):
        x, y = (i % cols) * 424, (i // cols) * 324
        s.paste(im, (x, y))
        if label:
            d.rectangle([x, y, x + 120, y + 18], fill='black')
            d.text((x + 4, y + 3), n[:18], fill='white')
    s.save(out, quality=82)


def search(query, video=False, n=12):
    os.makedirs(OUT, exist_ok=True)
    slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')[:40]
    d = os.path.join(OUT, ('v-' if video else 'p-') + slug)
    os.makedirs(d, exist_ok=True)
    found = []
    if video:
        html = fetch('https://mixkit.co/free-stock-video/' + urllib.parse.quote(slug) + '/').decode('utf8', 'ignore')
        ids = []
        for m in re.finditer(r'https://assets\.mixkit\.co/videos/(\d+)/\1-(\d+)\.mp4', html):
            if m.group(1) not in ids:
                ids.append(m.group(1))
        for vid in ids[:n]:
            thumb = f'https://assets.mixkit.co/videos/{vid}/{vid}-thumb-720-0.jpg'
            try:
                open(os.path.join(d, f'{vid}.jpg'), 'wb').write(fetch(thumb))
            except Exception:
                pass
            found.append({'id': vid, 'mp4': f'https://assets.mixkit.co/videos/{vid}/{vid}-720.mp4', 'hd': f'https://assets.mixkit.co/videos/{vid}/{vid}-1080.mp4'})
    else:
        q = urllib.parse.urlencode({'q': query, 'license': 'cc0,pdm', 'page_size': 20, 'mature': 'false'})
        res = json.loads(fetch('https://api.openverse.org/v1/images/?' + q))['results']
        # Wikimedia с адресов песочницы и общих прокси отвечает 429 — берём остальные источники
        res = [r for r in res if (r.get('width') or 0) >= 1400 and r.get('source') != 'wikimedia']
        for i, r in enumerate(res[:n]):
            url = r['url']
            if 'upload.wikimedia.org' in url and '/thumb/' not in url:
                # оригиналы Wikimedia отдают 429 — берём превью 1920 px (разрешённые размеры — w.wiki/GHai)
                p = url.split('/wikipedia/commons/')[1]
                fn = p.split('/')[-1]
                url = f'https://upload.wikimedia.org/wikipedia/commons/thumb/{p}/1920px-{fn}'
            f = os.path.join(d, f'{i:02d}.jpg')
            try:
                # Wikimedia пускает ботов только с описательным User-Agent и без спешки (w.wiki/4wJS)
                wm = 'wikimedia.org' in url
                if wm:
                    import time; time.sleep(1.2)
                open(f, 'wb').write(fetch(url, headers={'User-Agent': 'AtlasCatalogMedia/1.0 (https://point.cero.uz; site catalog stock picker)'} if wm else None))
                found.append({'file': f, 'url': url, 'source': r['source'], 'license': r['license'], 'title': r.get('title'), 'w': r['width'], 'h': r['height']})
            except Exception as e:
                print('skip', url[:80], e, file=sys.stderr)
    json.dump(found, open(os.path.join(d, 'found.json'), 'w'), indent=1)
    sheet(sorted(os.path.join(d, f) for f in os.listdir(d) if f.endswith('.jpg')), d + '.jpg')
    print(json.dumps({'dir': d, 'sheet': d + '.jpg', 'n': len(found)}))


def r2_put(name, path, mime):
    cmd = ['npx', 'wrangler', 'r2', 'object', 'put', f'{BUCKET}/{name}', '--file', path, '--content-type', mime, '--remote']
    env = {**os.environ, 'CLOUDFLARE_ACCOUNT_ID': ACCOUNT}
    r = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if r.returncode:
        raise SystemExit(r.stderr[-800:])
    # локальная копия — для next start без R2
    local = os.path.join(os.environ.get('DATA_DIR', os.path.join(os.getcwd(), 'data')), 'media')
    os.makedirs(local, exist_ok=True)
    with open(path, 'rb') as a, open(os.path.join(local, name), 'wb') as b:
        b.write(a.read())


def put_image(slug, src, w=1600, q=80):
    from PIL import Image, ImageOps
    raw = fetch(src) if src.startswith('http') else open(src, 'rb').read()
    im = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, 'WEBP', quality=q, method=6)
    data = buf.getvalue()
    name = f'{slug}-{hashlib.sha1(data).hexdigest()[:20]}.webp'
    tmp = os.path.join(OUT, name)
    os.makedirs(OUT, exist_ok=True)
    open(tmp, 'wb').write(data)
    r2_put(name, tmp, 'image/webp')
    return f'/media/{name}', im.width, im.height


def gen(slug, prompt, w=1536, h=1024):
    # Владелец, 26.10: генерация через Cloudflare Workers AI запрещена — она платная и выставила большой счёт.
    raise SystemExit('Генерация через Cloudflare Workers AI отключена владельцем (платно). Брать фото со стоков.')
    if not TOKEN:
        raise SystemExit('нет CLOUDFLARE_API_TOKEN')
    boundary = '----atlas' + hashlib.sha1(prompt.encode()).hexdigest()[:12]
    parts = []
    for k, v in (('prompt', prompt), ('width', str(w)), ('height', str(h))):
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n')
    body = (''.join(parts) + f'--{boundary}--\r\n').encode()
    url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/ai/run/@cf/black-forest-labs/flux-2-dev'
    res = json.loads(fetch(url, data=body, headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': f'multipart/form-data; boundary={boundary}'}, timeout=180))
    if not res.get('success'):
        raise SystemExit(json.dumps(res.get('errors')))
    os.makedirs(OUT, exist_ok=True)
    f = os.path.join(OUT, f'gen-{hashlib.sha1(prompt.encode()).hexdigest()[:10]}.jpg')
    open(f, 'wb').write(base64.b64decode(res['result']['image']))
    return put_image(slug, f, w=max(w, 1600))


def video(slug, url):
    ff = os.environ.get('FFMPEG', 'ffmpeg')
    os.makedirs(OUT, exist_ok=True)
    src = os.path.join(OUT, 'src-' + hashlib.sha1(url.encode()).hexdigest()[:10] + '.mp4')
    open(src, 'wb').write(fetch(url, timeout=180))
    out = src.replace('src-', 'enc-')
    # 1280 по ширине, без звука, faststart — начинает играть до полной загрузки; ~2–4 МБ на 10–20 с
    subprocess.run([ff, '-y', '-loglevel', 'error', '-i', src, '-an', '-vf', 'scale=1280:-2:flags=lanczos,fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], check=True)
    data = open(out, 'rb').read()
    name = f'{slug}-{hashlib.sha1(data).hexdigest()[:20]}.mp4'
    r2_put(name, out, 'video/mp4')
    poster = out.replace('.mp4', '.jpg')
    subprocess.run([ff, '-y', '-loglevel', 'error', '-ss', '0.2', '-i', out, '-frames:v', '1', '-q:v', '3', poster], check=True)
    p, _, _ = put_image(slug, poster)
    return f'/media/{name}', p


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    if cmd == 'search':
        search(sys.argv[2], video='--video' in sys.argv, n=int(arg('--n', 12)))
    elif cmd == 'put':
        print(json.dumps(put_image(sys.argv[2], sys.argv[3], w=int(arg('--w', 1600)))))
    elif cmd == 'gen':
        print(json.dumps(gen(sys.argv[2], sys.argv[3], int(arg('--w', 1536)), int(arg('--h', 1024)))))
    elif cmd == 'video':
        print(json.dumps(video(sys.argv[2], sys.argv[3])))
    else:
        print(__doc__)
