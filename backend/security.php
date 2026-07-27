<?php
/**
 * 보안 유틸 (입력 검증 + 레이트리밋)
 * -----------------------------------------------------------------
 *  submit.php 등 공개 엔드포인트에서 사용.
 *  - 공개 폼으로 들어오는 값을 엄격히 검증(HTML/스크립트/URL/이상값 차단)
 *  - IP별 요청 제한으로 스팸/과다요청(DDoS성) 완화
 * -----------------------------------------------------------------
 */

declare(strict_types=1);

/** 신뢰 가능한 클라이언트 IP (프록시 헤더는 위조 가능하므로 REMOTE_ADDR 사용) */
function jkw_client_ip(): string
{
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}

/** 제어문자 제거 + 트림 (태그는 제거하지 않고 검증에서 '거부'한다) */
function jkw_clean(string $v): string
{
    // 제어문자(개행/탭 제외) 제거
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return trim($v);
}

/** HTML 꺾쇠 포함 여부 */
function jkw_has_html(string $v): bool
{
    return (bool)preg_match('/[<>]/', $v);
}

/** URL/링크 포함 여부(스팸 차단) */
function jkw_has_url(string $v): bool
{
    return (bool)preg_match('#(https?://|www\.|\.[a-z]{2,}/)#i', $v);
}

/**
 * 상담 문의 입력 검증.
 * @return string[] 오류 메시지 배열(비어 있으면 통과)
 */
function jkw_validate_inquiry(string $name, string $contact, string $category, string $message, array $allowedCategories): array
{
    $errors = [];

    // 공통: HTML/스크립트/URL 차단 (인젝션·스팸)
    foreach (['성함' => $name, '연락처' => $contact, '문의내용' => $message] as $label => $val) {
        if ($val !== '' && jkw_has_html($val)) {
            $errors[] = $label . '에 사용할 수 없는 문자(<, >)가 있습니다.';
        }
    }
    if (($name !== '' && jkw_has_url($name)) || ($contact !== '' && jkw_has_url($contact)) || ($message !== '' && jkw_has_url($message))) {
        $errors[] = '링크(URL)는 입력할 수 없습니다.';
    }

    // 성함: 1~40자, 문자 1개 이상 포함
    if ($name === '' || mb_strlen($name) > 40) {
        $errors[] = '성함을 1~40자로 입력해 주세요.';
    } elseif (!preg_match('/\p{L}/u', $name)) {
        $errors[] = '성함을 정확히 입력해 주세요.';
    }

    // 연락처: 1~50자, 영문/숫자/한글 중 하나 이상 포함(순수 기호 차단)
    if ($contact === '' || mb_strlen($contact) > 50) {
        $errors[] = '연락처를 1~50자로 입력해 주세요.';
    } elseif (!preg_match('/[\p{L}\p{N}]/u', $contact)) {
        $errors[] = '연락처를 정확히 입력해 주세요.';
    }

    // 문의내용(부위): 허용 목록만
    if ($category === '' || !in_array($category, $allowedCategories, true)) {
        $errors[] = '문의내용을 목록에서 선택해 주세요.';
    }

    // 추가 메시지: 길이 제한
    if (mb_strlen($message) > 1000) {
        $errors[] = '문의내용이 너무 깁니다. (1000자 이내)';
    }

    return $errors;
}

/**
 * IP별 레이트리밋.
 * 윈도우(초) 안에 limit 회 이상이면 false(차단).
 * rate_limits(ip, ts[unix]) 테이블 사용 — DB/타임존 무관.
 */
function jkw_rate_limit_ok(PDO $pdo, string $ip, int $limit = 5, int $windowSec = 600): bool
{
    $now = time();
    $cut = $now - $windowSec;
    try {
        // 오래된 기록 청소(가끔)
        $pdo->prepare('DELETE FROM rate_limits WHERE ts < :cut')->execute([':cut' => $cut - 3600]);

        $st = $pdo->prepare('SELECT COUNT(*) FROM rate_limits WHERE ip = :ip AND ts >= :cut');
        $st->execute([':ip' => $ip, ':cut' => $cut]);
        $count = (int)$st->fetchColumn();

        if ($count >= $limit) {
            return false;
        }
        $pdo->prepare('INSERT INTO rate_limits (ip, ts) VALUES (:ip, :ts)')
            ->execute([':ip' => $ip, ':ts' => $now]);
        return true;
    } catch (Throwable $e) {
        // 레이트리밋 테이블 문제 시 접수는 막지 않음(가용성 우선), 로그만.
        error_log('[JK] rate limit check failed: ' . $e->getMessage());
        return true;
    }
}
