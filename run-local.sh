#!/usr/bin/env bash
# JK위드미 로컬 실행 (Mac / Linux)
# 사용법: 터미널에서  ./run-local.sh   (또는  bash run-local.sh)
cd "$(dirname "$0")" || exit 1

if ! command -v php >/dev/null 2>&1; then
  echo "PHP가 설치되어 있지 않습니다. PHP 7.4 이상을 먼저 설치하세요."
  exit 1
fi

php setup-local.php || exit 1

echo ""
echo "======================================================"
echo "  홈페이지 :  http://localhost:8000"
echo "  관리자   :  http://localhost:8000/backend/admin/"
echo "             아이디 admin  /  비밀번호 jkwithme!2026"
echo "  (종료: Ctrl + C)"
echo "======================================================"
echo ""

php -S localhost:8000 -t site
