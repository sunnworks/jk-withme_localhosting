#!/usr/bin/env bash
# 누락 미디어 자동 보충 (Mac) - 이 파일을 더블클릭하세요. PHP 불필요(curl 사용).
cd "$(dirname "$0")/.." || exit 1
LIVE="https://www.jk-withme.com"
LIST="tools/missing-assets.txt"
[ -f "$LIST" ] || { echo "목록 파일 없음: $LIST"; exit 1; }

# URL 인코딩 함수 (경로 세그먼트별)
enc_path() {
  python3 - "$1" <<'PY' 2>/dev/null || printf '%s' "$1"
import sys,urllib.parse
print('/'.join(urllib.parse.quote(s) for s in sys.argv[1].split('/')))
PY
}

ok=0; fail=0
while IFS= read -r rel; do
  [ -z "$rel" ] && continue
  dest="site/$rel"
  mkdir -p "$(dirname "$dest")"
  encoded="$(enc_path "$rel")"
  if curl -fsSL --max-time 40 "$LIVE/$encoded" -o "$dest" 2>/dev/null; then
    ok=$((ok+1)); echo "  OK   $rel"
  else
    fail=$((fail+1)); echo "  실패 $rel"
  fi
done < "$LIST"
echo ""
echo "완료: 성공 ${ok}개 / 실패 ${fail}개"
[ "$fail" -gt 0 ] && echo "실패분은 원본 사이트에도 없거나 경로가 바뀐 파일입니다."
echo "창을 닫아도 됩니다."
