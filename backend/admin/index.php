<?php
/** 문의 목록 (검색·상태필터·페이징) */
declare(strict_types=1);
require __DIR__ . '/auth.php';
require_login();

$pdo = jk_pdo();

// --- 필터 파라미터 ---
$status = (string)($_GET['status'] ?? '');
$q      = trim((string)($_GET['q'] ?? ''));
$page   = max(1, (int)($_GET['p'] ?? 1));
$perPage = 20;
$offset = ($page - 1) * $perPage;

$statusMap = ['new' => '신규', 'doing' => '처리중', 'done' => '완료'];

// --- WHERE 절 동적 구성 (prepared) ---
$where = [];
$params = [];
if (isset($statusMap[$status])) {
    $where[] = 'status = :status';
    $params[':status'] = $status;
}
if ($q !== '') {
    $where[] = '(name LIKE :q OR contact LIKE :q OR category LIKE :q)';
    $params[':q'] = '%' . $q . '%';
}
$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// --- 총 개수 ---
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM inquiries $whereSql");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($total / $perPage));

// --- 목록 조회 (LIMIT/OFFSET는 정수 캐스팅 후 직접 삽입) ---
$listSql = "SELECT id, name, contact, category, status, created_at
            FROM inquiries $whereSql
            ORDER BY created_at DESC, id DESC
            LIMIT $perPage OFFSET $offset";
$listStmt = $pdo->prepare($listSql);
$listStmt->execute($params);
$rows = $listStmt->fetchAll();

// --- 상태별 카운트(상단 요약) ---
$summary = ['all' => 0, 'new' => 0, 'doing' => 0, 'done' => 0];
foreach ($pdo->query("SELECT status, COUNT(*) c FROM inquiries GROUP BY status") as $r) {
    $summary[$r['status']] = (int)$r['c'];
    $summary['all'] += (int)$r['c'];
}

/** 현재 필터를 유지한 링크 생성 */
function link_with(array $override): string
{
    $base = ['status' => $_GET['status'] ?? '', 'q' => $_GET['q'] ?? ''];
    $merged = array_merge($base, $override);
    $merged = array_filter($merged, fn($v) => $v !== '' && $v !== null);
    return 'index.php' . ($merged ? '?' . http_build_query($merged) : '');
}

$__title = '문의 목록';
require __DIR__ . '/header.php';
?>
<div class="card">
  <h1>상담신청 목록 <span class="muted" style="font-size:14px;">(총 <?= number_format($total) ?>건)</span></h1>

  <div style="margin-bottom:16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
    <a class="btn <?= $status===''?'btn-primary':'' ?>" href="<?= h(link_with(['status'=>'','p'=>1])) ?>">전체 <?= $summary['all'] ?></a>
    <a class="btn <?= $status==='new'?'btn-primary':'' ?>" href="<?= h(link_with(['status'=>'new','p'=>1])) ?>">신규 <?= $summary['new'] ?></a>
    <a class="btn <?= $status==='doing'?'btn-primary':'' ?>" href="<?= h(link_with(['status'=>'doing','p'=>1])) ?>">처리중 <?= $summary['doing'] ?></a>
    <a class="btn <?= $status==='done'?'btn-primary':'' ?>" href="<?= h(link_with(['status'=>'done','p'=>1])) ?>">완료 <?= $summary['done'] ?></a>

    <form method="get" style="margin-left:auto; display:flex; gap:6px;">
      <?php if ($status !== ''): ?><input type="hidden" name="status" value="<?= h($status) ?>"><?php endif; ?>
      <input type="text" name="q" value="<?= h($q) ?>" placeholder="이름·연락처·부위 검색" style="width:220px;">
      <button class="btn" type="submit">검색</button>
    </form>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:60px;">번호</th>
        <th style="width:110px;">성함</th>
        <th>연락처</th>
        <th style="width:150px;">문의내용</th>
        <th style="width:80px;">상태</th>
        <th style="width:150px;">접수일시</th>
        <th style="width:70px;"></th>
      </tr>
    </thead>
    <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="7" style="text-align:center; padding:40px 0;" class="muted">접수된 문의가 없습니다.</td></tr>
      <?php else: foreach ($rows as $row): ?>
        <tr>
          <td><?= (int)$row['id'] ?></td>
          <td><?= h($row['name']) ?></td>
          <td><?= h($row['contact']) ?></td>
          <td><?= h($row['category']) ?></td>
          <td><span class="badge <?= h($row['status']) ?>"><?= h($statusMap[$row['status']] ?? $row['status']) ?></span></td>
          <td class="muted"><?= h(date('Y-m-d H:i', strtotime($row['created_at']))) ?></td>
          <td><a class="btn" href="view.php?id=<?= (int)$row['id'] ?>">보기</a></td>
        </tr>
      <?php endforeach; endif; ?>
    </tbody>
  </table>

  <?php if ($totalPages > 1): ?>
  <div style="margin-top:18px; text-align:center;">
    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
      <?php if ($i === $page): ?>
        <span class="btn btn-primary"><?= $i ?></span>
      <?php else: ?>
        <a class="btn" href="<?= h(link_with(['p'=>$i])) ?>"><?= $i ?></a>
      <?php endif; ?>
    <?php endfor; ?>
  </div>
  <?php endif; ?>
</div>
<?php require __DIR__ . '/footer.php'; ?>
