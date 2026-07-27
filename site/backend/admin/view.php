<?php
/** 문의 상세 보기 + 상태/메모 수정 + 삭제 */
declare(strict_types=1);
require __DIR__ . '/auth.php';
require_login();

$pdo = jk_pdo();
$id = (int)($_GET['id'] ?? 0);
$flash = '';
$flashType = 'ok';
$statusMap = ['new' => '신규', 'doing' => '처리중', 'done' => '완료'];

// --- 처리(상태변경/메모저장/삭제) ---
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') {
    check_csrf();
    $action = (string)($_POST['do'] ?? '');

    if ($action === 'delete') {
        $del = $pdo->prepare('DELETE FROM inquiries WHERE id = :id');
        $del->execute([':id' => $id]);
        header('Location: index.php');
        exit;
    }

    if ($action === 'update') {
        $newStatus = (string)($_POST['status'] ?? 'new');
        if (!isset($statusMap[$newStatus])) {
            $newStatus = 'new';
        }
        $memo = trim((string)($_POST['admin_memo'] ?? ''));
        if (mb_strlen($memo) > 5000) {
            $memo = mb_substr($memo, 0, 5000);
        }
        $upd = $pdo->prepare('UPDATE inquiries SET status = :s, admin_memo = :m WHERE id = :id');
        $upd->execute([':s' => $newStatus, ':m' => ($memo !== '' ? $memo : null), ':id' => $id]);
        $flash = '저장되었습니다.';
    }
}

// --- 조회 ---
$stmt = $pdo->prepare('SELECT * FROM inquiries WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $id]);
$row = $stmt->fetch();

$__title = '문의 상세';
require __DIR__ . '/header.php';

if (!$row) {
    echo '<div class="card"><p>존재하지 않는 문의입니다.</p><a class="btn" href="index.php">목록으로</a></div>';
    require __DIR__ . '/footer.php';
    exit;
}
?>
<div class="card">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
    <h1 style="margin:0;">문의 상세 #<?= (int)$row['id'] ?></h1>
    <a class="btn" href="index.php">← 목록</a>
  </div>

  <?php if ($flash): ?><div class="flash <?= h($flashType) ?>"><?= h($flash) ?></div><?php endif; ?>

  <table style="margin-bottom:24px;">
    <tr><th style="width:130px;">성함</th><td><?= h($row['name']) ?></td></tr>
    <tr><th>연락처/SNS</th><td><?= h($row['contact']) ?></td></tr>
    <tr><th>문의내용</th><td><?= h($row['category']) ?></td></tr>
    <?php if (!empty($row['message'])): ?>
    <tr><th>추가 내용</th><td style="white-space:pre-wrap;"><?= h($row['message']) ?></td></tr>
    <?php endif; ?>
    <tr><th>접수일시</th><td><?= h($row['created_at']) ?></td></tr>
    <tr><th>접수 페이지</th><td class="muted"><?= h($row['source_page'] ?: '-') ?></td></tr>
    <tr><th>IP</th><td class="muted"><?= h($row['ip'] ?: '-') ?></td></tr>
  </table>

  <form method="post">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="hidden" name="do" value="update">
    <div class="field" style="max-width:220px;">
      <label>처리 상태</label>
      <select name="status">
        <?php foreach ($statusMap as $k => $label): ?>
          <option value="<?= h($k) ?>" <?= $row['status']===$k?'selected':'' ?>><?= h($label) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="field">
      <label>관리자 메모</label>
      <textarea name="admin_memo" rows="4" placeholder="상담 진행 내용 등 내부 메모"><?= h($row['admin_memo']) ?></textarea>
    </div>
    <button type="submit" class="btn btn-primary">저장</button>
  </form>

  <hr style="margin:24px 0; border:none; border-top:1px solid #eef0f2;">
  <form method="post" onsubmit="return confirm('이 문의를 삭제할까요? 되돌릴 수 없습니다.');">
    <input type="hidden" name="csrf" value="<?= h(csrf_token()) ?>">
    <input type="hidden" name="do" value="delete">
    <button type="submit" class="btn btn-danger">삭제</button>
  </form>
</div>
<?php require __DIR__ . '/footer.php'; ?>
