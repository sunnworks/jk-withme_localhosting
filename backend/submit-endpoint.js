/**
 * JK위드미 - 상담신청 폼 → 백엔드 연결 스크립트
 * -----------------------------------------------------------------
 *  원본은 워드프레스 JK위드미 플러그인이 폼을 wp-admin/admin-ajax.php 로
 *  전송했지만, 정적 사이트에는 그 주소가 없습니다.
 *  이 스크립트는 전송 대상 주소만 우리 백엔드(/backend/submit.php)로
 *  바꿔줍니다. 폼 마크업·디자인·검증 UI 는 원본 그대로 유지됩니다.
 *
 *  적용: 모든 페이지의 </body> 앞에 아래 한 줄만 넣으면 됩니다.
 *    <script src="/backend/submit-endpoint.js"></script>
 *  (integrate 스크립트가 자동으로 넣어줍니다)
 * -----------------------------------------------------------------
 */
(function () {
    'use strict';

    // 백엔드 접수 주소 (사이트 루트 기준)
    var ENDPOINT = '/backend/submit.php';

    function apply() {
        // 1) JK위드미 전역 객체의 전송 주소를 우리 백엔드로 교체
        if (window.jkwf_ajax_obj) {
            window.jkwf_ajax_obj.ajax_url = ENDPOINT;
        }

        // 2) 각 상담 폼에 스팸 방지용 허니팟 필드 추가(사람 눈엔 안 보임)
        var forms = document.querySelectorAll('form.jkwf-form');
        for (var i = 0; i < forms.length; i++) {
            var f = forms[i];
            if (f.querySelector('input[name="website"]')) {
                continue;
            }
            var hp = document.createElement('input');
            hp.type = 'text';
            hp.name = 'website';
            hp.tabIndex = -1;
            hp.autocomplete = 'off';
            hp.setAttribute('aria-hidden', 'true');
            hp.style.cssText =
                'position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0;';
            f.appendChild(hp);

            // 3) 만약 JK위드미 JS 가 로드되지 않은 페이지라면(비상용) 순수 POST 로 폴백
            if (!window.jQuery || !window.jkwf_ajax_obj) {
                f.setAttribute('action', ENDPOINT);
                f.setAttribute('method', 'post');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', apply);
    } else {
        apply();
    }
})();
