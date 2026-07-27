<?php
/**
 * 상담신청(문의) 폼 접수 처리
 * --------------------------------------------------------------
 *  정적 사이트의 상담신청 폼(action="/backend/submit.php", method=post)이
 *  이 파일로 데이터를 전송합니다.
 *  원본 JK위드미 폼 필드명을 그대로 사용:
 *      text_2   = 성함
 *      text_4   = 연락처/SNS ID
 *      select_5 = 문의내용(상담부위)
 *  추가:
 *      message  = 추가 문의내용(선택, 폼에 없으면 무시)
 *      website  = 허니팟(사람은 비워둠 / 봇이 채우면 스팸으로 폐기)
 */

declare(strict_types=1);

require __DIR__ . '/db.php';
require __DIR__ . '/mailer.php';

$config = jk_config();

/** 허용된 문의내용(상담부위) 목록 — 원본 select 옵션과 동일 */
const ALLOWED_CATEGORIES = [
    '눈성형', '코성형', '안면윤곽', '동안성형', '가슴성형', '지방흡입',
    '보톡스/필러', '기미/주근깨/홍조', '여드름/여드름흉터', '모공/흉터',
    '주름/리프팅', '제모/문신제거', '피부질환', '비만',
    '두피/탈모/모발이식', '메디컬 에스테틱', '기타 피부', '기타 성형',
];

/** 응답 헬퍼: AJAX면 JSON, 일반 폼전송이면 리다이렉트 */
function respond(bool $ok, string $message, array $config): void
{
    $isAjax = (
        (isset($_SERVER['HTTP_X_REQUESTED_WITH'])
            && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
        || (isset($_SERVER['HTTP_ACCEPT'])
            && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)
    );

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        // 'data' 키는 원본 JK위드미 프론트 JS(res.data) 호환용, 'message' 는 범용
        echo json_encode(
            ['success' => $ok, 'data' => $message, 'message' => $message],
            JSON_UNESCAPED_UNICODE
        );
        exit;
    }

    if ($ok) {
        // 완료 알림 후 지정 페이지로 이동
        $redirect = $config['site']['redirect_after_submit'] ?? '/';
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8">'
           . '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . ');'
           . 'location.href=' . json_encode($redirect) . ';</script>';
    } else {
        http_response_code(400);
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><meta charset="utf-8">'
           . '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . ');history.back();</script>';
    }
    exit;
}

// --- POST 요청만 허용 ---
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(false, '잘못된 접근입니다.', $config);
}

// --- 허니팟(봇 차단): 숨김 필드가 채워져 있으면 스팸 처리(성공한 척 폐기) ---
if (!empty($_POST['website'])) {
    respond(true, '상담신청이 접수되었습니다.', $config);
}

// --- 입력값 정리 ---
$name     = trim((string)($_POST['text_2'] ?? ''));
$contact  = trim((string)($_POST['text_4'] ?? ''));
$category = trim((string)($_POST['select_5'] ?? ''));
$message  = trim((string)($_POST['message'] ?? ''));

// 원본 폼은 value에 안내문("성함/Name" 등)이 기본으로 들어있음 → 안내문 그대로면 미입력 처리
foreach (['성함/Name' => &$name, '연락처/SNS ID' => &$contact] as $placeholder => &$field) {
    if ($field === $placeholder) {
        $field = '';
    }
}
unset($field);

// --- 검증 ---
$errors = [];
if ($name === '' || mb_strlen($name) > 100) {
    $errors[] = '성함을 확인해 주세요.';
}
if ($contact === '' || mb_strlen($contact) > 100) {
    $errors[] = '연락처를 확인해 주세요.';
}
if ($category === '' || !in_array($category, ALLOWED_CATEGORIES, true)) {
    $errors[] = '문의내용을 선택해 주세요.';
}
if (mb_strlen($message) > 2000) {
    $errors[] = '문의내용이 너무 깁니다.';
}
if ($errors) {
    respond(false, implode("\n", $errors), $config);
}

// --- 저장 ---
try {
    $pdo = jk_pdo();
    // created_at 은 테이블 기본값(CURRENT_TIMESTAMP)에 맡김 → DB 종류에 무관하게 동작
    $stmt = $pdo->prepare(
        'INSERT INTO inquiries
            (name, contact, category, message, source_page, ip, user_agent, status)
         VALUES
            (:name, :contact, :category, :message, :source_page, :ip, :user_agent, \'new\')'
    );
    $stmt->execute([
        ':name'        => $name,
        ':contact'     => $contact,
        ':category'    => $category,
        ':message'     => ($message !== '' ? $message : null),
        ':source_page' => mb_substr((string)($_POST['inquiry_page'] ?? ($_SERVER['HTTP_REFERER'] ?? '')), 0, 255),
        ':ip'          => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent'  => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    ]);
} catch (PDOException $e) {
    error_log('[JK] inquiry insert failed: ' . $e->getMessage());
    respond(false, '접수 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', $config);
}

// --- 관리자 이메일 알림 (실패해도 접수 자체는 성공 처리) ---
try {
    jkw_notify_new_inquiry([
        'name'        => $name,
        'contact'     => $contact,
        'category'    => $category,
        'message'     => $message,
        'source_page' => (string)($_POST['inquiry_page'] ?? ($_SERVER['HTTP_REFERER'] ?? '')),
        'created_at'  => date('Y-m-d H:i:s'),
    ]);
} catch (Throwable $e) {
    error_log('[JK] notify failed: ' . $e->getMessage());
}

respond(true, '상담신청이 정상적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.', $config);
