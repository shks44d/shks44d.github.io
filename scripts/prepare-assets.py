"""Copy and optimize supplied showcase assets without modifying originals."""
from pathlib import Path
from PIL import Image
import re
import urllib.request

root = Path(__file__).resolve().parents[1] / 'public' / 'assets'
documents = Path('C:/Users/shksa/OneDrive/Documents')
images = {
    'sentinel-overview': documents / 'Sentinal AI Showcase/assets/detail.png',
    'sentinel-alerts': documents / 'Sentinal AI Showcase/assets/alerts.png',
    'sentinel-insights': documents / 'Sentinal AI Showcase/assets/insights.png',
    'contract-home': documents / 'Contract-Radar-showcase/home.png',
    'contract-report': documents / 'Contract-Radar-showcase/report.png',
    'contract-filtered': documents / 'Contract-Radar-showcase/filtered.png',
    'safescan-results': documents / 'SafeScan-showcase/preview-0765.jpg',
}
for name, source in images.items():
    image = Image.open(source).convert('RGB')
    if image.height > image.width * 3:
        image = image.crop((0, 0, image.width, min(image.height, 1400)))
    image.thumbnail((1440, 1400))
    image.save(root / 'projects' / (name + '.webp'), 'WEBP', quality=88, method=6)

font_css=[]
for family in ['Inter', 'Manrope']:
    url=f'https://fonts.googleapis.com/css2?family={family}:wght@400;500;600;700;800&display=swap'
    req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
    css=urllib.request.urlopen(req, timeout=30).read().decode()
    blocks=re.findall(r'/\* latin \*/\s*(@font-face\s*\{[^}]+\})',css)
    if not blocks:
        blocks=re.findall(r'@font-face\s*\{[^}]+\}',css)
    for index,block in enumerate(blocks):
        remote=re.search(r'url\(([^)]+)\)',block).group(1)
        filename=f'{family.lower()}-{index}.woff2'
        (root / filename).write_bytes(urllib.request.urlopen(remote, timeout=30).read())
        font_css.append(block.replace(remote, '/assets/'+filename))
(root / 'fonts.css').write_text('\n'.join(font_css),encoding='utf-8')
print(f'Optimized {len(images)} screenshots and self-hosted {len(font_css)} font faces.')
