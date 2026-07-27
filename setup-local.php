<?php
/**
 * 로컬 테스트용 SQLite DB 초기화 스크립트
 * -----------------------------------------------------------------
 *  실행: php setup-local.php          (없으면 생성, 있으면 유지)
 *        php setup-local.php --reset  (기존 DB 삭제 후 새로 생성)
 *
 *  MySQL 설치 없이 사이트 전체를 로컬에서 돌리기 위한 데모 DB를 만든다.
 *  운영(호스팅)에서는 이 스크립트 대신 backend/schema.sql(MySQL)을 쓴다.
 * -----------------------------------------------------------------
 */

declare(strict_types=1);

$dbPath = __DIR__ . '/site/backend/data/jkwithme.sqlite';
$reset  = in_array('--reset', $argv, true);

@mkdir(dirname($dbPath), 0777, true);

if ($reset && is_file($dbPath)) {
    unlink($dbPath);
    echo "기존 DB 삭제됨.\n";
}

$fresh = !is_file($dbPath);
$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// --- 테이블 생성 (SQLite 문법, MySQL schema.sql 과 동등) ---
$db->exec("CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    category TEXT NOT NULL,
    message TEXT,
    source_page TEXT,
    ip TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    admin_memo TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)");

$db->exec("CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)");

$db->exec("CREATE TABLE IF NOT EXISTS settings (
    skey TEXT PRIMARY KEY,
    svalue TEXT
)");

// --- 관리자 계정 시드 (없을 때만) ---
$has = (int)$db->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
if ($has === 0) {
    $hash = password_hash('jkwithme!2026', PASSWORD_DEFAULT);
    $st = $db->prepare("INSERT INTO admin_users(username, password_hash, display_name) VALUES(?,?,?)");
    $st->execute(['admin', $hash, '관리자']);
    echo "관리자 계정 생성: admin / jkwithme!2026\n";
}

// --- 설정 시드 (없을 때만) ---
$hasS = (int)$db->query("SELECT COUNT(*) FROM settings")->fetchColumn();
if ($hasS === 0) {
    $defaults = [
        'notify_enabled' => '1',
        'notify_emails'  => 'famdeju06@gmail.com, famdeju02@naver.com',
        'mail_method'    => 'mail',
        'from_name'      => 'JK위드미 홈페이지',
        'from_email'     => '',
        'smtp_host'      => '',
        'smtp_port'      => '465',
        'smtp_secure'    => 'ssl',
        'smtp_user'      => '',
        'smtp_pass'      => '',
    ];
    $st = $db->prepare("INSERT INTO settings(skey, svalue) VALUES(?,?)");
    foreach ($defaults as $k => $v) {
        $st->execute([$k, $v]);
    }
    echo "기본 설정 생성 완료.\n";
}

echo ($fresh ? "새 DB 생성 완료: " : "기존 DB 사용: ") . $dbPath . "\n";
echo "준비 완료. 이제 run-local 스크립트로 서버를 실행하세요.\n";
