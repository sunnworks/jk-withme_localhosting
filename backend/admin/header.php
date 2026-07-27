<?php
/** 관리자 공통 헤더 */
if (!function_exists('is_logged_in')) {
    require __DIR__ . '/auth.php';
}
$__title = $__title ?? '관리자';
?>
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= h($__title) ?> - JK위드미 관리자</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; font-family:"Noto Sans KR",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
         background:#f4f5f7; color:#222; font-size:14px; }
  a { color:#2b7bb9; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .topbar { background:#1f2937; color:#fff; padding:0 20px; height:56px; display:flex;
            align-items:center; justify-content:space-between; }
  .topbar .brand { font-weight:700; font-size:16px; color:#fff; }
  .topbar .brand span { color:#7ec8ff; }
  .topbar nav a { color:#cbd5e1; margin-left:18px; }
  .topbar nav a:hover { color:#fff; }
  .wrap { max-width:1100px; margin:24px auto; padding:0 16px; }
  .card { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:20px;
          box-shadow:0 1px 2px rgba(0,0,0,.04); }
  h1 { font-size:20px; margin:0 0 16px; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:11px 10px; border-bottom:1px solid #eef0f2; text-align:left; vertical-align:middle; }
  th { background:#fafbfc; font-weight:600; color:#555; font-size:13px; }
  tr:hover td { background:#fafcff; }
  .btn { display:inline-block; padding:8px 14px; border-radius:7px; border:1px solid #d1d5db;
         background:#fff; color:#333; cursor:pointer; font-size:13px; }
  .btn-primary { background:#2b7bb9; border-color:#2b7bb9; color:#fff; }
  .btn-danger { background:#e05656; border-color:#e05656; color:#fff; }
  .badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:12px; font-weight:600; }
  .badge.new   { background:#fde8e8; color:#c0392b; }
  .badge.doing { background:#fff4d6; color:#b7791f; }
  .badge.done  { background:#e3f6e8; color:#2f855a; }
  .muted { color:#8a94a6; }
  input[type=text], input[type=password], select, textarea {
      width:100%; padding:9px 11px; border:1px solid #d1d5db; border-radius:7px; font-size:14px;
      font-family:inherit; }
  .field { margin-bottom:14px; }
  .field label { display:block; margin-bottom:5px; font-weight:600; color:#555; }
  .flash { padding:11px 14px; border-radius:7px; margin-bottom:16px; font-size:13px; }
  .flash.ok  { background:#e3f6e8; color:#2f855a; border:1px solid #b7e4c4; }
  .flash.err { background:#fde8e8; color:#c0392b; border:1px solid #f5c2c2; }
</style>
</head>
<body>
<?php if (is_logged_in()): ?>
<div class="topbar">
  <div class="brand">JK<span>위드미</span> 관리자</div>
  <nav>
    <a href="index.php">문의 목록</a>
    <a href="settings.php">이메일 알림</a>
    <a href="password.php">비밀번호 변경</a>
    <a href="logout.php">로그아웃</a>
  </nav>
</div>
<?php endif; ?>
<div class="wrap">
