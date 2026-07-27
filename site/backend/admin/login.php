<?php
/** 관리자 로그인 */
declare(strict_types=1);
require __DIR__ . '/auth.php';

// 이미 로그인 상태면 목록으로
if (is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    check_csrf();
    $username = trim((string)($_POST['username'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        $error = '아이디와 비밀번호를 입력하세요.';
    } else {
        $pdo = jk_pdo();
        $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE username = :u LIMIT 1');
        $stmt->execute([':u' => $username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // 세션 고정 공격 방지
            session_regenerate_id(true);
            $_SESSION['admin_id']   = (int)$user['id'];
            $_SESSION['admin_name'] = $user['display_name'] ?: $user['username'];
            header('Location: index.php');
            exit;
        }
        $error = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
}

$__title = '로그인';
require __DIR__ . '/header.php';
?>
<div class="card" style="max-width:380px; margin:8vh auto;">
  <h1 style="text-align:center;">JK위드미 관리자</h1>
  <?php if ($error): ?><div class="flash err"><?= h($error) ?></div><?php endif; ?>
  <form method="post" autocomplete="off">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <div class="field">
      <label>아이디</label>
      <input type="text" name="username" autofocus required>
    </div>
    <div class="field">
      <label>비밀번호</label>
      <input type="password" name="password" required>
    </div>
    <button type="submit" class="btn btn-primary" style="width:100%; padding:11px;">로그인</button>
  </form>
</div>
<?php require __DIR__ . '/footer.php'; ?>
