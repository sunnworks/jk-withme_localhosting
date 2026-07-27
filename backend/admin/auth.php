<?php
/**
 * 관리자 인증 공통 모듈
 *  - 세션 시작
 *  - 로그인 요구 / 확인
 *  - CSRF 토큰 발급·검증
 */

declare(strict_types=1);

require __DIR__ . '/../db.php';

$__cfg = jk_config();
$__lifetime = (int)($__cfg['site']['session_lifetime'] ?? 10800);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => $__lifetime,
        'path'     => '/',
        'httponly' => true,
        'samesite' => 'Lax',
        // HTTPS 접속이면 secure 쿠키
        'secure'   => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    ]);
    session_name('JK_ADMIN');
    session_start();
}

// 관리자 화면은 캐시 금지(뒤로가기 등으로 내용 노출 방지)
if (!headers_sent()) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
}

/** 로그인 여부 */
function is_logged_in(): bool
{
    return !empty($_SESSION['admin_id']);
}

/** 로그인 필수 페이지 보호 */
function require_login(): void
{
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

/** CSRF 토큰 (없으면 생성) */
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

/** CSRF 검증 */
function check_csrf(): void
{
    $token = $_POST['csrf'] ?? '';
    if (!is_string($token) || $token === '' || empty($_SESSION['csrf'])
        || !hash_equals($_SESSION['csrf'], $token)) {
        http_response_code(400);
        exit('잘못된 요청입니다. (CSRF)');
    }
}

/** HTML 이스케이프 단축 함수 */
function h($v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}
