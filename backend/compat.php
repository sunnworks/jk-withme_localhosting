<?php
/**
 * 확장모듈 폴백(호환) 함수
 * --------------------------------------------------------------
 *  일부 PHP 환경(특히 php.ini 없이 실행하는 로컬 윈도우 PHP)에는
 *  mbstring 확장이 켜져 있지 않습니다. 그 경우 mb_strlen()/mb_substr()
 *  같은 함수가 없어 "Call to undefined function" 치명오류(HTTP 500)가
 *  발생하고, 프론트는 "서버와 통신 중 오류가 발생했습니다"를 띄웁니다.
 *
 *  아래 폴백은 mbstring 이 없을 때만(=함수가 정의돼 있지 않을 때만)
 *  UTF-8 기준으로 동작하는 최소 구현을 제공합니다. mbstring 이 있으면
 *  이 폴백은 무시되고 원래 확장 함수가 그대로 사용됩니다.
 * --------------------------------------------------------------
 */

declare(strict_types=1);

if (!function_exists('mb_strlen')) {
    /** UTF-8 문자 수 반환 (mbstring 없을 때의 폴백) */
    function mb_strlen($string, $encoding = null): int
    {
        $string = (string)$string;
        if ($string === '') {
            return 0;
        }
        $n = preg_match_all('/./us', $string);
        return $n === false ? strlen($string) : $n;
    }
}

if (!function_exists('mb_substr')) {
    /** UTF-8 부분 문자열 반환 (mbstring 없을 때의 폴백) */
    function mb_substr($string, $start, $length = null, $encoding = null): string
    {
        $string = (string)$string;
        if ($string === '') {
            return '';
        }
        if (preg_match_all('/./us', $string, $m) === false) {
            // 정규식 실패 시 바이트 기준 폴백
            return $length === null
                ? (string)substr($string, (int)$start)
                : (string)substr($string, (int)$start, (int)$length);
        }
        $chars = $m[0];
        $slice = ($length === null)
            ? array_slice($chars, (int)$start)
            : array_slice($chars, (int)$start, (int)$length);
        return implode('', $slice);
    }
}

if (!function_exists('mb_strtolower')) {
    /** 소문자 변환 폴백(ASCII 안전 + 멀티바이트는 원문 유지) */
    function mb_strtolower($string, $encoding = null): string
    {
        return strtolower((string)$string);
    }
}
