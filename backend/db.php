<?php
/**
 * DB 연결 (PDO) + 설정 로더
 * 모든 백엔드 파일은 이 파일을 require 해서 $pdo 를 사용합니다.
 */

declare(strict_types=1);

/** 설정 로드 (config.php 없으면 안내 후 종료) */
function jk_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    // 테스트/특수 환경에서 설정 파일 경로를 지정할 수 있음 (운영에선 미사용)
    $path = getenv('JK_CONFIG_PATH') ?: (__DIR__ . '/config.php');
    if (!is_file($path)) {
        http_response_code(500);
        exit('설정 파일(config.php)이 없습니다. config.sample.php 를 복사해 설정하세요.');
    }
    $config = require $path;
    return $config;
}

/** PDO 인스턴스 반환 (싱글턴) */
function jk_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $c = jk_config()['db'];
    // driver 기본은 mysql. (테스트 목적으로 sqlite 지정 가능 — 운영 config 에는 넣지 않음)
    $driver = $c['driver'] ?? 'mysql';
    if ($driver === 'sqlite') {
        $dsn = 'sqlite:' . $c['path'];
        $user = null;
        $pass = null;
    } else {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $c['host'],
            $c['port'] ?? 3306,
            $c['name'],
            $c['charset'] ?? 'utf8mb4'
        );
        $user = $c['user'];
        $pass = $c['pass'];
    }
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        // 상세 오류는 화면에 노출하지 않음(보안). 서버 로그로만 남김.
        error_log('[JK] DB connect failed: ' . $e->getMessage());
        exit('데이터베이스 연결에 실패했습니다. 관리자에게 문의하세요.');
    }
    return $pdo;
}
