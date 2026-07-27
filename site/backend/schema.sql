-- =====================================================================
--  JK위드미 홈페이지 - 문의(상담신청) 백엔드 DB 스키마
--  MySQL 5.7+ / MariaDB 10.2+
--
--  사용법(호스팅 phpMyAdmin 기준):
--   1) 호스팅에서 발급받은 DB에 접속
--   2) 아래 내용을 SQL 탭에 붙여넣고 실행(Import)
--   ※ CREATE DATABASE 줄은 호스팅이 DB를 이미 만들어 준 경우 지워도 됩니다.
-- =====================================================================

-- 필요시 주석 해제하여 DB 직접 생성 (호스팅이 DB를 미리 만들어주면 생략)
-- CREATE DATABASE IF NOT EXISTS jkwithme
--   DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE jkwithme;

-- ---------------------------------------------------------------------
-- 문의(상담신청) 접수 테이블
--   원본 JK위드미 폼(form_id=3) 필드와 1:1 대응
--     성함           -> name
--     연락처/SNS ID  -> contact
--     문의내용(부위) -> category
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100)  NOT NULL COMMENT '성함',
  `contact`     VARCHAR(100)  NOT NULL COMMENT '연락처/SNS ID',
  `category`    VARCHAR(50)   NOT NULL COMMENT '문의내용(상담부위)',
  `message`     TEXT          NULL     COMMENT '추가 문의내용(선택)',
  `source_page` VARCHAR(255)  NULL     COMMENT '접수된 페이지 URL',
  `ip`          VARCHAR(45)   NULL     COMMENT '접수 IP',
  `user_agent`  VARCHAR(255)  NULL     COMMENT '브라우저 정보',
  `status`      ENUM('new','doing','done') NOT NULL DEFAULT 'new' COMMENT '처리상태',
  `admin_memo`  TEXT          NULL     COMMENT '관리자 메모',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '접수일시',
  PRIMARY KEY (`id`),
  KEY `idx_status`     (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='상담신청 접수 내역';

-- ---------------------------------------------------------------------
-- 사이트 설정 테이블 (key-value)
--   이메일 알림 수신자, 발송 방식(SMTP/mail) 등을 관리자페이지에서 변경
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `skey`   VARCHAR(50)  NOT NULL COMMENT '설정 키',
  `svalue` TEXT         NULL     COMMENT '설정 값',
  PRIMARY KEY (`skey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='사이트 설정';

-- 이메일 알림 기본값
--   notify_emails : 문의 알림을 받을 관리자 이메일(줄바꿈 또는 쉼표로 여러 명)
INSERT INTO `settings` (`skey`, `svalue`) VALUES
  ('notify_enabled', '1'),
  ('notify_emails',  'famdeju06@gmail.com, famdeju02@naver.com'),
  ('mail_method',    'mail'),          -- 'mail'(호스팅 기본) 또는 'smtp'
  ('from_name',      'JK위드미 홈페이지'),
  ('from_email',     ''),              -- 발신 이메일(비우면 no-reply@도메인 자동)
  ('smtp_host',      ''),
  ('smtp_port',      '465'),
  ('smtp_secure',    'ssl'),           -- 'ssl'(465) 또는 'tls'(587) 또는 ''(없음)
  ('smtp_user',      ''),
  ('smtp_pass',      '')
ON DUPLICATE KEY UPDATE `skey` = `skey`;

-- ---------------------------------------------------------------------
-- 관리자 계정 테이블
--   비밀번호는 PHP password_hash()로 저장(평문 저장 금지)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(50)  NOT NULL COMMENT '관리자 아이디',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '해시된 비밀번호',
  `display_name`  VARCHAR(100) NULL     COMMENT '표시 이름',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='관리자 계정';

-- ---------------------------------------------------------------------
-- 기본 관리자 계정 1개 생성
--   아이디: admin
--   비밀번호: jkwithme!2026   (반드시 로그인 후 변경하세요)
--   ※ 아래 해시는 password_hash('jkwithme!2026', PASSWORD_DEFAULT) 결과입니다.
-- ---------------------------------------------------------------------
INSERT INTO `admin_users` (`username`, `password_hash`, `display_name`)
VALUES (
  'admin',
  '$2y$12$IvrY3/hpmhFYEdy4QKJP/.YcbljlqIqFC.InI12HnwfWeqJMpE17u',
  '관리자'
)
ON DUPLICATE KEY UPDATE `username` = `username`;
