#!/usr/bin/env python3
"""
외부 추적/광고 스크립트 제거기
 - <script> 블록 중 아래 추적 호스트/함수를 포함한 것만 통째로 제거
 - 추적 호스트로의 dns-prefetch / preconnect <link> 제거
정상 기능(폼, 슬라이더, 지도 등)은 건드리지 않는다.
"""
import re, sys, os

# 추적으로 확실히 판별되는 토큰(이게 들어간 <script>만 제거)
TRACKER_TOKENS = [
    'googletagmanager.com', 'gtag(', "gtag('js'", 'dataLayer',
    'wcs.pstatic.net', 'wcs_do', 'wcs_add', '_nasa',
    'dynamic.criteo.com', 'criteo_q', 'window.criteo',
    'log1.toup.net',
]
# dns-prefetch/preconnect 제거 대상 호스트(추적류만)
LINK_HOSTS = ['googletagmanager.com', 'wcs.pstatic.net', 'dynamic.criteo.com', 'log1.toup.net',
              'google-analytics.com', 'criteo.com', 'toup.net']

SCRIPT_RE = re.compile(r'<script\b[^>]*>.*?</script\s*>', re.S | re.I)
LINK_RE = re.compile(r'<link\b[^>]*>', re.I)

def is_tracker_script(block: str) -> bool:
    low = block.lower()
    return any(tok.lower() in low for tok in TRACKER_TOKENS)

def is_tracker_link(tag: str) -> bool:
    low = tag.lower()
    if 'dns-prefetch' not in low and 'preconnect' not in low and 'preload' not in low:
        return False
    return any(h in low for h in LINK_HOSTS)

def process(html: str):
    removed = 0
    def sub_script(m):
        nonlocal removed
        if is_tracker_script(m.group(0)):
            removed += 1
            return ''
        return m.group(0)
    html = SCRIPT_RE.sub(sub_script, html)
    def sub_link(m):
        nonlocal removed
        if is_tracker_link(m.group(0)):
            removed += 1
            return ''
        return m.group(0)
    html = LINK_RE.sub(sub_link, html)
    return html, removed

def main():
    root = sys.argv[1]
    total_files = 0
    total_removed = 0
    for dirpath, _, files in os.walk(root):
        for fn in files:
            if not fn.lower().endswith(('.html', '.htm')):
                continue
            p = os.path.join(dirpath, fn)
            with open(p, encoding='utf-8', errors='ignore') as f:
                html = f.read()
            new, removed = process(html)
            if removed:
                with open(p, 'w', encoding='utf-8') as f:
                    f.write(new)
                total_files += 1
                total_removed += removed
    print(f'처리 파일: {total_files}개, 제거된 추적 태그: {total_removed}개')

if __name__ == '__main__':
    main()
