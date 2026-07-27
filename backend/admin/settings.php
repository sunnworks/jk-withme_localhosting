<?php
/** 이메일 알림 설정 (수신자 다중, 발송방식/SMTP) */
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/../mailer.php';
require_login();

$pdo = jk_pdo();
$flash = '';
$flashType = 'ok';

// 저장 대상 키 목록
$KEYS = ['notify_enabled', 'notify_emails', 'mail_method', 'from_name', 'from_email',
         'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass'];

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    check_csrf();
    $up = $pdo->prepare('INSERT INTO settings (skey, svalue) VALUES (:k, :v)
                         ON DUPLICATE KEY UPDATE svalue = :v2');
    foreach ($KEYS as $k) {
        if ($k === 'notify_enabled') {
            $v = isset($_POST['notify_enabled']) ? '1' : '0';
        } else {
            $v = trim((string)($_POST[$k] ?? ''));
        }
        // smtp_pass 는 빈 값이면 기존 값 유지(별표만 보고 저장 시 지워지지 않게)
        if ($k === 'smtp_pass' && $v === '') {
            continue;
        }
        $up->execute([':k' => $k, ':v' => $v, ':v2' => $v]);
    }
    $flash = '설정이 저장되었습니다.';
    // 캐시 초기화 위해 재조회
    header('Location: settings.php?saved=1');
    exit;
}

if (isset($_GET['saved'])) {
    $flash = '설정이 저장되었습니다.';
}

// 테스트 메일 발송
if (isset($_GET['test'])) {
    $ok = jkw_notify_new_inquiry([
        'name' => '테스트 발송', 'contact' => '010-0000-0000', 'category' => '눈성형',
        'message' => '이메일 알림 테스트입니다.', 'source_page' => '(관리자 테스트)',
        'created_at' => date('Y-m-d H:i:s'),
    ]);
    $flash = $ok ? '테스트 메일을 발송했습니다. 수신함을 확인하세요.'
                 : '테스트 메일 발송에 실패했습니다. 설정/서버로그를 확인하세요.';
    $flashType = $ok ? 'ok' : 'err';
}

// 현재 값 로드
$cur = [];
foreach ($pdo->query('SELECT skey, svalue FROM settings') as $r) {
    $cur[$r['skey']] = $r['svalue'];
}
$g = fn($k, $d = '') => h($cur[$k] ?? $d);

$__title = '이메일 알림 설정';
require __DIR__ . '/header.php';
?>
<div class="card" style="max-width:640px;">
  <h1>이메일 알림 설정</h1>
  <?php if ($flash): ?><div class="flash <?= h($flashType) ?>"><?= h($flash) ?></div><?php endif; ?>

  <form method="post">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">

    <div class="field">
      <label><input type="checkbox" name="notify_enabled" value="1" <?= ($cur['notify_enabled'] ?? '1')==='1'?'checked':'' ?>> 새 문의 접수 시 이메일 알림 보내기</label>
    </div>

    <div class="field">
      <label>수신 이메일 (여러 명은 쉼표 또는 줄바꿈으로 구분)</label>
      <textarea name="notify_emails" rows="3" placeholder="admin1@example.com, admin2@example.com"><?= $g('notify_emails') ?></textarea>
    </div>

    <div class="field">
      <label>발신자 이름</label>
      <input type="text" name="from_name" value="<?= $g('from_name','JK위드미 홈페이지') ?>">
    </div>
    <div class="field">
      <label>발신 이메일 (비우면 no-reply@도메인 자동 사용)</label>
      <input type="text" name="from_email" value="<?= $g('from_email') ?>" placeholder="no-reply@jk-withme.com">
    </div>

    <hr style="margin:20px 0; border:none; border-top:1px solid #eef0f2;">

    <div class="field">
      <label>발송 방식</label>
      <select name="mail_method">
        <option value="mail" <?= ($cur['mail_method'] ?? 'mail')==='mail'?'selected':'' ?>>호스팅 기본 (PHP mail) — 설정 불필요, 간편</option>
        <option value="smtp" <?= ($cur['mail_method'] ?? '')==='smtp'?'selected':'' ?>>SMTP 중계 — 지메일/네이버 도달률 높음(권장)</option>
      </select>
      <p class="muted" style="margin:6px 0 0; font-size:12px;">지메일·네이버로 확실히 받으려면 SMTP 방식 + 아래 계정 입력을 권장합니다.</p>
    </div>

    <fieldset style="border:1px solid #e5e7eb; border-radius:8px; padding:14px;">
      <legend style="font-weight:600; color:#555; padding:0 6px;">SMTP 설정 (SMTP 방식일 때만)</legend>
      <div class="field">
        <label>SMTP 서버</label>
        <input type="text" name="smtp_host" value="<?= $g('smtp_host') ?>" placeholder="예) smtp.naver.com / smtp.gmail.com">
      </div>
      <div style="display:flex; gap:10px;">
        <div class="field" style="flex:1;">
          <label>포트</label>
          <input type="text" name="smtp_port" value="<?= $g('smtp_port','465') ?>" placeholder="465 또는 587">
        </div>
        <div class="field" style="flex:1;">
          <label>보안</label>
          <select name="smtp_secure">
            <option value="ssl" <?= ($cur['smtp_secure'] ?? 'ssl')==='ssl'?'selected':'' ?>>SSL (465)</option>
            <option value="tls" <?= ($cur['smtp_secure'] ?? '')==='tls'?'selected':'' ?>>TLS (587)</option>
            <option value="" <?= ($cur['smtp_secure'] ?? '')===''?'selected':'' ?>>없음</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>SMTP 아이디</label>
        <input type="text" name="smtp_user" value="<?= $g('smtp_user') ?>" placeholder="메일 계정(아이디)" autocomplete="off">
      </div>
      <div class="field">
        <label>SMTP 비밀번호 / 앱 비밀번호 <span class="muted">(변경 시에만 입력)</span></label>
        <input type="password" name="smtp_pass" value="" placeholder="<?= ($cur['smtp_pass'] ?? '')!=='' ? '●●● 저장됨 (변경 시 입력)' : '앱 비밀번호 권장' ?>" autocomplete="new-password">
      </div>
    </fieldset>

    <div style="margin-top:18px; display:flex; gap:8px;">
      <button type="submit" class="btn btn-primary">저장</button>
      <a class="btn" href="settings.php?test=1" onclick="return confirm('현재 설정으로 테스트 메일을 발송할까요?');">테스트 메일 보내기</a>
    </div>
  </form>
</div>
<?php require __DIR__ . '/footer.php'; ?>
