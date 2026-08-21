import urllib.request
import re

url = 'https://www.instagram.com/reel/Db3O6ZNySym/embed/'
req = urllib.request.Request(
    url,
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
)

try:
    with urllib.request.urlopen(req, timeout=5) as res:
        html = res.read().decode('utf-8', errors='ignore')
        # Find images or poster
        matches = re.findall(r'https://[^\s"\'<>\)]+(?:cdninstagram|fbcdn)[^\s"\'<>\)]+', html)
        print("Matches count:", len(matches))
        for m in matches[:5]:
            clean = m.replace('\\u0026', '&').replace('&amp;', '&')
            print("Extracted URL:", clean[:120])
except Exception as e:
    print("Error:", e)
