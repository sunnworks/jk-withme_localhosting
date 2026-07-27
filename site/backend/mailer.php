<?php
/**
 * JK위드미 자체 메일러
 * -----------------------------------------------------------------
 *  외부 라이브러리 없이 직접 구현한 이메일 발송 모듈.
 *   - 방식1: PHP mail()  (호스팅 기본 메일, 설정 불필요)
 *   - 방식2: SMTP 중계    (네이버/지메일/호스팅 SMTP 계정 경유 → 도달률↑)
 *  설정값은 settings 테이블에서 읽으며 관리자페이지에서 변경한다.
 * -----------------------------------------------------------------
 */

declare(strict_types=1);

require_once __DIR__ . '/db.php';

/** settings 테이블을 [key=>value] 로 로드 (1회 캐시) */
function jkw_settings(): array
{
    static $s = null;
    if ($s !== null) {
        return $s;
    }
    $s = [];
    try {
        foreach (jk_pdo()->query('SELECT skey, svalue FROM settings') as $row) {
            $s[$row['skey']] = $row['svalue'];
        }
    } catch (Throwable $e) {
        error_log('[JK] settings load failed: ' . $e->getMessage());
    }
    return $s;
}

/** 설정값 단축 조회 */
function jkw_setting(string $key, string $default = ''): string
{
    $s = jkw_settings();
    return isset($s[$key]) && $s[$key] !== null ? (string)$s[$key] : $default;
}

/** "a@x.com, b@y.com\n c@z.com" → 유효 이메일 배열 */
function jkw_parse_emails(string $raw): array
{
    $parts = preg_split('/[\s,;]+/', $raw, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $out = [];
    foreach ($parts as $p) {
        $p = trim($p);
        if ($p !== '' && filter_var($p, FILTER_VALIDATE_EMAIL)) {
            $out[] = $p;
        }
    }
    return array_values(array_unique($out));
}

/**
 * 새 문의 접수 알림 발송.
 * @param array $inq  ['name','contact','category','message','source_page','created_at']
 * @return bool 한 명이라도 발송 성공하면 true
 */
function jkw_notify_new_inquiry(array $inq): bool
{
    if (jkw_setting('notify_enabled', '1') !== '1') {
        return false;
    }
    $recipients = jkw_parse_emails(jkw_setting('notify_emails'));
    if (!$recipients) {
        return false;
    }

    $fromName  = jkw_setting('from_name', 'JK위드미 홈페이지');
    $fromEmail = jkw_setting('from_email');
    if ($fromEmail === '' || !filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $host = preg_replace('/[^a-zA-Z0-9.\-]/', '', $host);
        $fromEmail = 'no-reply@' . $host;
    }

    $subject = '[JK위드미] 새 상담신청 - ' . ($inq['name'] ?? '') . ' / ' . ($inq['category'] ?? '');
    $body = jkw_build_inquiry_email($inq);

    $method = jkw_setting('mail_method', 'mail');
    $ok = false;
    if ($method === 'smtp') {
        foreach ($recipients as $to) {
            $ok = jkw_smtp_send($to, $subject, $body, $fromEmail, $fromName) || $ok;
        }
    } else {
        $ok = jkw_php_mail($recipients, $subject, $body, $fromEmail, $fromName);
    }
    return $ok;
}

/** 알림 메일 본문(HTML) 구성 */
function jkw_build_inquiry_email(array $inq): string
{
    $e = fn($v) => htmlspecialchars((string)($v ?? ''), ENT_QUOTES, 'UTF-8');
    $rows = [
        ['성함', $inq['name'] ?? ''],
        ['연락처/SNS', $inq['contact'] ?? ''],
        ['문의내용', $inq['category'] ?? ''],
        ['추가내용', $inq['message'] ?? ''],
        ['접수페이지', $inq['source_page'] ?? ''],
        ['접수일시', $inq['created_at'] ?? date('Y-m-d H:i:s')],
    ];
    $tr = '';
    foreach ($rows as [$k, $v]) {
        if ($k === '추가내용' && ($v === '' || $v === null)) {
            continue;
        }
        $tr .= '<tr><th style="text-align:left;padding:8px 12px;background:#f5f6f8;'
             . 'border:1px solid #e5e7eb;width:110px;">' . $e($k) . '</th>'
             . '<td style="padding:8px 12px;border:1px solid #e5e7eb;">' . nl2br($e($v)) . '</td></tr>';
    }
    return '<div style="font-family:sans-serif;max-width:560px;">'
         . '<h2 style="color:#2b7bb9;">새 상담신청이 접수되었습니다</h2>'
         . '<table style="border-collapse:collapse;width:100%;">' . $tr . '</table>'
         . '<p style="color:#888;font-size:12px;margin-top:16px;">'
         . '이 메일은 JK위드미 홈페이지 상담신청 폼에서 자동 발송되었습니다.</p></div>';
}

/** PHP mail() 로 발송 (여러 수신자 To 한 번에) */
function jkw_php_mail(array $recipients, string $subject, string $htmlBody, string $fromEmail, string $fromName): bool
{
    $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encFrom = '=?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromEmail . '>';
    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: ' . $encFrom,
        'Reply-To: ' . $fromEmail,
    ];
    return @mail(implode(', ', $recipients), $encSubject, $htmlBody, implode("\r\n", $headers));
}

/**
 * 자체 SMTP 클라이언트로 1명에게 발송.
 * settings: smtp_host, smtp_port, smtp_secure(ssl|tls|''), smtp_user, smtp_pass
 */
function jkw_smtp_send(string $to, string $subject, string $htmlBody, string $fromEmail, string $fromName): bool
{
    $host = jkw_setting('smtp_host');
    $port = (int)(jkw_setting('smtp_port', '465'));
    $secure = jkw_setting('smtp_secure', 'ssl');   // ssl | tls | ''
    $user = jkw_setting('smtp_user');
    $pass = jkw_setting('smtp_pass');
    if ($host === '') {
        error_log('[JK] SMTP host not set');
        return false;
    }

    $remote = ($secure === 'ssl' ? 'ssl://' : '') . $host . ':' . $port;
    $errno = 0; $errstr = '';
    $fp = @stream_socket_client($remote, $errno, $errstr, 15,
        STREAM_CLIENT_CONNECT, stream_context_create([
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true, 'SNI_enabled' => true],
        ]));
    if (!$fp) {
        error_log("[JK] SMTP connect failed: $errstr ($errno)");
        return false;
    }
    stream_set_timeout($fp, 15);

    // 서버 응답 한 줄(멀티라인 포함) 읽기
    $read = function () use ($fp): array {
        $data = '';
        while (($line = fgets($fp, 515)) !== false) {
            $data .= $line;
            // "250-" 는 계속, "250 " 는 종료
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return [(int)substr($data, 0, 3), $data];
    };
    $cmd = function (string $c) use ($fp, $read): array {
        fwrite($fp, $c . "\r\n");
        return $read();
    };

    try {
        [$code] = $read();                       // 220 greeting
        if ($code !== 220) throw new RuntimeException('greeting');

        $ehloHost = preg_replace('/[^a-zA-Z0-9.\-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost');
        [$code, $resp] = $cmd('EHLO ' . ($ehloHost ?: 'localhost'));
        if ($code !== 250) throw new RuntimeException('EHLO');

        // STARTTLS (tls 모드)
        if ($secure === 'tls') {
            [$code] = $cmd('STARTTLS');
            if ($code !== 220) throw new RuntimeException('STARTTLS');
            if (!stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('TLS negotiate');
            }
            [$code] = $cmd('EHLO ' . ($ehloHost ?: 'localhost'));
            if ($code !== 250) throw new RuntimeException('EHLO2');
        }

        // AUTH LOGIN (계정 있을 때만)
        if ($user !== '') {
            [$code] = $cmd('AUTH LOGIN');
            if ($code !== 334) throw new RuntimeException('AUTH');
            [$code] = $cmd(base64_encode($user));
            if ($code !== 334) throw new RuntimeException('AUTH user');
            [$code] = $cmd(base64_encode($pass));
            if ($code !== 235) throw new RuntimeException('AUTH pass');
        }

        [$code] = $cmd('MAIL FROM:<' . $fromEmail . '>');
        if ($code !== 250) throw new RuntimeException('MAIL FROM');
        [$code] = $cmd('RCPT TO:<' . $to . '>');
        if ($code !== 250 && $code !== 251) throw new RuntimeException('RCPT TO');
        [$code] = $cmd('DATA');
        if ($code !== 354) throw new RuntimeException('DATA');

        $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encFrom = '=?UTF-8?B?' . base64_encode($fromName) . '?= <' . $fromEmail . '>';
        $headers =
            'From: ' . $encFrom . "\r\n" .
            'To: <' . $to . ">\r\n" .
            'Subject: ' . $encSubject . "\r\n" .
            'MIME-Version: 1.0' . "\r\n" .
            'Content-Type: text/html; charset=UTF-8' . "\r\n" .
            'Content-Transfer-Encoding: base64' . "\r\n\r\n";
        // 본문 dot-stuffing 회피 위해 base64 인코딩
        $payload = $headers . chunk_split(base64_encode($htmlBody));
        fwrite($fp, $payload . "\r\n.\r\n");
        [$code] = $read();
        if ($code !== 250) throw new RuntimeException('send');

        $cmd('QUIT');
        fclose($fp);
        return true;
    } catch (Throwable $e) {
        error_log('[JK] SMTP send failed at: ' . $e->getMessage());
        @fclose($fp);
        return false;
    }
}
