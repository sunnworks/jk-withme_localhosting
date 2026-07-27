<?php
/**
 * 정적 사이트 통합 스크립트
 * =================================================================
 *  HTTrack 으로 받은 정적 사이트에 백엔드를 연결합니다.
 *  하는 일:
 *    1) 상담 폼이 있는 모든 HTML 페이지의 </body> 앞에
 *       <script src="/backend/submit-endpoint.js"></script> 삽입
 *    2) 절대경로(https://www.jk-withme.com/...)를 루트상대경로(/...)로
 *       바꿔 새 도메인/로컬에서도 링크·이미지가 깨지지 않도록 정리(선택)
 *
 *  사용법:
 *    php tools/integrate.php  <정적사이트_루트폴더>  [--rewrite-domain]
 *
 *  예)
 *    php tools/integrate.php ./www.jk-withme.com
 *    php tools/integrate.php ./www.jk-withme.com --rewrite-domain
 * =================================================================
 */

declare(strict_types=1);

$root = $argv[1] ?? '';
$rewriteDomain = in_array('--rewrite-domain', $argv, true);

if ($root === '' || !is_dir($root)) {
    fwrite(STDERR, "사용법: php tools/integrate.php <정적사이트_루트폴더> [--rewrite-domain]\n");
    exit(1);
}
$root = rtrim($root, '/');

const SCRIPT_TAG = '<script src="/backend/submit-endpoint.js"></script>';
const DOMAINS = [
    'https://www.jk-withme.com',
    'http://www.jk-withme.com',
    'https://jk-withme.com',
    'http://jk-withme.com',
];

$rii = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

$injected = 0;
$rewritten = 0;
$scanned = 0;

foreach ($rii as $file) {
    if (!$file->isFile()) {
        continue;
    }
    $ext = strtolower($file->getExtension());
    if (!in_array($ext, ['html', 'htm'], true)) {
        continue;
    }
    $path = $file->getPathname();
    if (strpos($path, 'hts-cache') !== false) {
        continue; // HTTrack 내부 캐시 폴더 건너뜀
    }
    $scanned++;
    $html = file_get_contents($path);
    $orig = $html;

    // 1) 상담 폼이 있는 페이지에만 스크립트 삽입 (중복 방지)
    if (strpos($html, 'hdbc-form') !== false && strpos($html, 'submit-endpoint.js') === false) {
        if (stripos($html, '</body>') !== false) {
            $html = preg_replace('#</body>#i', SCRIPT_TAG . "\n</body>", $html, 1);
        } else {
            $html .= "\n" . SCRIPT_TAG . "\n";
        }
        $injected++;
    }

    // 2) (선택) 절대 도메인 → 루트 상대경로
    if ($rewriteDomain) {
        $before = $html;
        foreach (DOMAINS as $d) {
            $html = str_replace($d . '/', '/', $html);
            $html = str_replace($d, '/', $html);
        }
        if ($html !== $before) {
            $rewritten++;
        }
    }

    if ($html !== $orig) {
        file_put_contents($path, $html);
    }
}

echo "스캔한 HTML: {$scanned}개\n";
echo "스크립트 삽입: {$injected}개 페이지\n";
if ($rewriteDomain) {
    echo "도메인 경로 정리: {$rewritten}개 페이지\n";
}
echo "완료.\n";
echo "\n다음: 이 정적 사이트 폴더 안에 backend/ 폴더를 그대로 복사해 넣으세요.\n";
