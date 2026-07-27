<?php
/**
 * 누락 미디어 자동 보충 스크립트
 * -----------------------------------------------------------------
 *  HTTrack이 못 받은 이미지·영상을, 아직 살아있는 원본 사이트에서
 *  내려받아 site/ 폴더를 완성합니다.
 *
 *  사용법(인터넷 되는 PC에서, 저장소 루트에서 실행):
 *      php tools/download-missing.php            (실제 다운로드)
 *      php tools/download-missing.php --dry-run  (뭘 받을지 목록만 출력)
 *
 *  원본 사이트 주소가 바뀌면 아래 $LIVE 를 수정하세요.
 * -----------------------------------------------------------------
 */

declare(strict_types=1);

$LIVE = 'https://www.jk-withme.com';
$root = realpath(__DIR__ . '/../site');
$dry  = in_array('--dry-run', $argv, true);

if ($root === false) {
    exit("site 폴더를 찾을 수 없습니다. 저장소 루트에서 실행하세요.\n");
}

$exts = ['jpg','jpeg','png','webp','gif','mp4','webm','svg','ico'];
$extRe = implode('|', $exts);

/** HTML 하나에서 자산 참조 경로 추출 → [파일시스템 절대경로 => 웹경로] */
function extract_assets(string $html, string $baseDir, string $root, string $extRe): array
{
    $out = [];
    // src / data-src / data-mp4 / data-webm / href
    if (preg_match_all('/(?:src|data-src|data-mp4|data-webm|href)="([^"]+)"/i', $html, $m)) {
        foreach ($m[1] as $u) { add_asset($u, $baseDir, $root, $extRe, $out); }
    }
    // srcset (쉼표 목록, "url 2x")
    if (preg_match_all('/srcset="([^"]+)"/i', $html, $m)) {
        foreach ($m[1] as $set) {
            foreach (explode(',', $set) as $part) {
                $u = trim(explode(' ', trim($part))[0]);
                add_asset($u, $baseDir, $root, $extRe, $out);
            }
        }
    }
    return $out;
}

function add_asset(string $u, string $baseDir, string $root, string $extRe, array &$out): void
{
    $u = trim($u);
    if ($u === '' || preg_match('~^(https?:|//|data:|#|mailto:|tel:|javascript:)~i', $u)) return;
    $path = parse_url($u, PHP_URL_PATH);
    if ($path === null || $path === false) return;
    if (!preg_match('/\.(' . $extRe . ')$/i', $path)) return;
    // 웹경로(인코딩 유지) 와 파일경로(디코딩) 분리
    $decoded = rawurldecode($path);
    if (strpos($decoded, '/') === 0) {
        $fs = $root . $decoded;                       // 루트기준
    } else {
        $fs = $baseDir . '/' . $decoded;              // 페이지기준
    }
    $fs = normalize($fs);
    if (strpos($fs, $root) !== 0) return;             // 루트 밖은 제외
    // site/ 이후의 상대 웹경로(디코딩) 계산
    $rel = ltrim(substr($fs, strlen($root)), '/');
    // wp-content 등 사이트 자체 미디어만 대상(로컬화된 cdn 등 제외)
    if (strpos($rel, 'wp-content/') !== 0) return;
    $out[$fs] = $rel;
}

function normalize(string $p): string
{
    $parts = [];
    foreach (explode('/', str_replace('\\', '/', $p)) as $seg) {
        if ($seg === '' || $seg === '.') { if ($parts === []) $parts[] = ''; continue; }
        if ($seg === '..') { array_pop($parts); continue; }
        $parts[] = $seg;
    }
    return implode('/', $parts);
}

// --- 전체 HTML 스캔 ---
$missing = [];   // rel(디코딩) => true
$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
foreach ($rii as $f) {
    if (!$f->isFile() || strtolower($f->getExtension()) !== 'html') continue;
    $html = file_get_contents($f->getPathname());
    foreach (extract_assets($html, $f->getPath(), $root, $extRe) as $fs => $rel) {
        if (!is_file($fs)) $missing[$rel] = true;
    }
}
$missing = array_keys($missing);
sort($missing);

echo "누락 자산: " . count($missing) . "개\n";
if ($dry) {
    foreach ($missing as $r) echo "  " . $r . "\n";
    echo "\n(--dry-run: 실제 다운로드는 안 함)\n";
    exit;
}

// --- 다운로드 ---
$ok = 0; $fail = 0;
foreach ($missing as $rel) {
    // 웹 URL: 경로 세그먼트별 인코딩
    $url = $GLOBALS['LIVE'] . '/' . implode('/', array_map('rawurlencode', explode('/', $rel)));
    $dest = $root . '/' . $rel;
    @mkdir(dirname($dest), 0777, true);
    $data = fetch($url);
    if ($data !== null && strlen($data) > 0) {
        file_put_contents($dest, $data);
        $ok++;
        echo "  ✅ " . $rel . "\n";
    } else {
        $fail++;
        echo "  ❌ 실패(404 등): " . $rel . "\n";
    }
}
echo "\n완료: 성공 {$ok}개 / 실패 {$fail}개\n";
if ($fail) echo "실패분은 원본 사이트에도 없거나 경로가 바뀐 파일입니다.\n";

function fetch(string $url): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_USERAGENT => 'Mozilla/5.0 (asset-fetch)',
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $d = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($code >= 200 && $code < 300 && $d !== false) ? $d : null;
    }
    // curl 없으면 fallback
    $ctx = stream_context_create(['http' => ['timeout' => 30, 'user_agent' => 'asset-fetch']]);
    $d = @file_get_contents($url, false, $ctx);
    return $d === false ? null : $d;
}
