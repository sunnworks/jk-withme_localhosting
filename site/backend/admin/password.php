<?php
/** 관리자 비밀번호 변경 */
declare(strict_types=1);
require __DIR__ . '/auth.php';
require_login();

$pdo = jk_pdo();
$flash = '';
$flashType = 'err';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    check_csrf();
    $current = (string)($_POST['current'] ?? '');
    $new1    = (string)($_POST['new1'] ?? '');
    $new2    = (string)($_POST['new2'] ?? '');

    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => (int)$_SESSION['admin_id']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($current, $user['password_hash'])) {
        $flash = '현재 비밀번호가 올바르지 않습니다.';
    } elseif (mb_strlen($new1) < 8) {
        $flash = '새 비밀번호는 8자 이상이어야 합니다.';
    } elseif ($new1 !== $new2) {
        $flash = '새 비밀번호가 서로 일치하지 않습니다.';
    } else {
        $hash = password_hash($new1, PASSWORD_DEFAULT);
        $upd = $pdo->prepare('UPDATE admin_users SET password_hash = :h WHERE id = :id');
        $upd->execute([':h' => $hash, ':id' => (int)$_SESSION['admin_id']]);
        $flash = '비밀번호가 변경되었습니다.';
        $flashType = 'ok';
    }
}

$__title = '비밀번호 변경';
require __DIR__ . '/header.php';
?>
<div class="card" style="max-width:420px;">
  <h1>비밀번호 변경</h1>
  <?php if ($flash): ?><div class="flash <?= h($flashType) ?>"><?= h($flash) ?></div><?php endif; ?>
  <form method="post" autocomplete="off">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <div class="field">
      <label>현재 비밀번호</label>
      <input type="password" name="current" required>
    </div>
    <div class="field">
      <label>새 비밀번호 (8자 이상)</label>
      <input type="password" name="new1" required>
    </div>
    <div class="field">
      <label>새 비밀번호 확인</label>
      <input type="password" name="new2" required>
    </div>
    <button type="submit" class="btn btn-primary">변경</button>
  </form>
</div>
<?php require __DIR__ . '/footer.php'; ?>
