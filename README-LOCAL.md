# JK위드미 홈페이지 — 로컬 테스트용 (SQLite)

이 저장소는 **MySQL 설치 없이 PHP만으로** JK위드미 홈페이지 전체(문의 접수 + 관리자)를
로컬 PC에서 바로 테스트해보기 위한 버전입니다.

> 실제 웹호스팅 배포는 이 저장소가 아니라 **`jk-withme`**(MySQL 버전)을 사용하세요.

---

## ⚠️ 이미지·영상이 안 보이면 (꼭 읽으세요)

두 가지만 하면 됩니다. **PHP 설치 없이도 됩니다.**

### 1) 누락된 이미지·영상 채우기 (PHP 불필요)

원본 캡처(HTTrack)가 못 받은 자산(메인/모바일 영상 2개 + 반응형 축소 이미지 일부)이 있습니다.
인터넷 되는 PC에서:

- **윈도우**: `tools/download-missing-WINDOWS.bat` **더블클릭**
- **맥**: `tools/download-missing-MAC.command` 더블클릭
  (처음엔 "확인되지 않은 개발자" 뜨면 우클릭 > 열기)
- (PHP 있으면) `php tools/download-missing.php` 도 가능

→ 원본 사이트(`www.jk-withme.com`)에서 빠진 파일만 자동으로 받아 채웁니다.

### 2) 화면 열어보기

- **간단히 보기(PHP 없이)**: `site/index.html` **더블클릭** → 이미지가 상대경로라 그냥 열려도 보입니다.
  (단, 문의 폼 전송·관리자 기능은 서버가 필요해 동작하지 않음)
- **전체 기능까지(PHP 필요)**: `run-local` 실행 후 `http://localhost:8000`
  → 문의 접수·관리자 로그인까지 실제로 동작합니다.

> 즉, **디자인·이미지 미리보기**만 원하면 PHP 없이 더블클릭으로 충분하고,
> **문의/관리자 기능 테스트**까지 하려면 PHP(run-local)가 필요합니다.

---

## 필요한 것

- **PHP 7.4 이상** 하나만 있으면 됩니다. (SQLite는 PHP에 기본 포함)
  - 설치 확인: 터미널/명령프롬프트에서 `php -v`
  - 없으면: Windows는 [XAMPP](https://www.apachefriends.org) 설치(안에 PHP 포함),
    Mac은 기본 내장되어 있거나 `brew install php`

---

## 실행 방법 (한 번에)

**Windows**
- `run-local.bat` 더블클릭

**Mac / Linux**
```bash
bash run-local.sh
```

그러면:
1. 로컬 데이터베이스(SQLite)가 자동 생성되고
2. 웹서버가 뜹니다.

브라우저에서 열기:
- **홈페이지**: http://localhost:8000
- **관리자**: http://localhost:8000/backend/admin/

---

## 관리자 로그인

| 항목 | 값 |
|------|-----|
| 아이디 | `admin` |
| 비밀번호 | `jkwithme!2026` |

---

## 테스트 순서 추천

1. 홈페이지(http://localhost:8000)에서 **상담신청 폼** 작성 → 전송
2. 관리자(http://localhost:8000/backend/admin/) 로그인
3. **문의 목록**에 방금 넣은 문의가 뜨는지 확인 → 상세보기 → 상태변경/메모 저장
4. **이메일 알림** 메뉴에서 수신자 설정 확인

---

## 참고 / 주의

- **이메일 실제 발송은 로컬에서는 안 됩니다.** (메일 서버가 없어서 그렇습니다. 접수·저장·관리자 확인은 정상 동작합니다.)
  실제 이메일 발송은 웹호스팅 + SMTP 설정에서 동작합니다.
- **지도·네이버 톡톡·카카오 채널** 등 외부 연동도 로컬에서는 일부만 보일 수 있습니다. (실제 도메인에 올리면 정상 동작)
- 데이터를 초기화하려면: `php setup-local.php --reset`
- 로컬 DB 파일 위치: `site/backend/data/jkwithme.sqlite`

---

## 데이터를 처음부터 다시

```bash
php setup-local.php --reset
```
