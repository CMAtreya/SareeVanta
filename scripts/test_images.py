import os
import re
import urllib.request

def check_all_images():
    urls = set()
    root_dirs = ['app', 'components', 'lib', 'public']
    
    for r in root_dirs:
        for root, dirs, files in os.walk(r):
            for file in files:
                if file.endswith(('.ts', '.tsx', '.json', '.js', '.mjs')):
                    # Skip instagram-reels.json / Instagram component if needed or check it
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        text = f.read()
                        matches = re.findall(r'https://images\.unsplash\.com/[^\s\'"\`<>]+', text)
                        for m in matches:
                            # clean trailing chars
                            cleaned = m.rstrip('),;"]')
                            urls.add(cleaned)

    print(f"Found {len(urls)} unique image URLs to test.")
    
    failed = []
    for u in sorted(urls):
        try:
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}, method='HEAD')
            with urllib.request.urlopen(req, timeout=5) as res:
                if res.status == 200:
                    print(f"[OK 200] {u[:65]}")
                else:
                    print(f"[{res.status}] {u}")
                    failed.append((u, res.status))
        except Exception as e:
            print(f"[FAILED] {e} {u}")
            failed.append((u, str(e)))

    print(f"\nSummary: {len(urls) - len(failed)} OK, {len(failed)} FAILED")
    return failed

if __name__ == "__main__":
    check_all_images()
