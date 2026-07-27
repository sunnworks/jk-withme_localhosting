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

            // 4) 입력 UX: 안내문구를 placeholder 로 바꿔 클릭 시 자동으로 비워지게
            var DEFAULTS = { 'text_2': '성함/Name', 'text_4': '연락처/SNS ID' };
            for (var key in DEFAULTS) {
                var box = f.querySelector('input[name="' + key + '"]');
                if (box && (box.value === DEFAULTS[key] || box.value === '')) {
                    box.placeholder = DEFAULTS[key];
                    box.value = '';
                }
            }
            // 셀렉트 첫 항목(빈 값) 안내문구를 "선택해주세요" 로
            var sels = f.querySelectorAll('select');
            for (var s = 0; s < sels.length; s++) {
                var opt0 = sels[s].querySelector('option[value=""]');
                if (opt0 && /선택/.test(opt0.textContent)) {
                    opt0.textContent = '선택해주세요';
                }
            }
        }
    }

    // 4) 사이트 검색 연결: name="s" 검색 입력을 자체 검색페이지(/search.html)로 라우팅
    function wireSearch() {
        var inputs = document.querySelectorAll('input[name="s"], input[type="search"]');
        for (var i = 0; i < inputs.length; i++) {
            var inp = inputs[i];
            if (inp.getAttribute('data-jkw-search')) continue;
            inp.setAttribute('data-jkw-search', '1');
            // 소속 form이 있으면 form 제출을 가로채고, 없으면 Enter 키 처리
            var form = inp.closest ? inp.closest('form') : null;
            if (form) {
                form.addEventListener('submit', function (e) {
                    var box = this.querySelector('input[name="s"], input[type="search"]');
                    var q = box ? box.value.trim() : '';
                    e.preventDefault();
                    location.href = '/search.html' + (q ? '?s=' + encodeURIComponent(q) : '');
                });
            } else {
                inp.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        var q = this.value.trim();
                        location.href = '/search.html' + (q ? '?s=' + encodeURIComponent(q) : '');
                    }
                });
            }
        }
    }

    // 5) 배너 "상담 예약 및 문의하기" 버튼(#forms 앵커) 클릭 시
    //    상담신청 폼까지 부드럽게 스크롤하고 첫 입력칸에 포커스를 줍니다.
    //    (기본 앵커 점프는 애니메이션(fade-up)으로 아직 안 보이는 영역에
    //     멈춰 "조금만 스크롤되고 마는" 것처럼 보이는 문제가 있었음)
    function wireInquiryButtons() {
        var links = document.querySelectorAll('a[href="#forms"], a[href$="#forms"]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            if (a.getAttribute('data-jkw-forms')) continue;
            a.setAttribute('data-jkw-forms', '1');
            a.addEventListener('click', function (e) {
                var target = document.getElementById('forms');
                if (!target) return; // 대상이 없으면 기본 동작에 맡김
                e.preventDefault();
                // fade-up 애니메이션으로 숨겨진 대상을 즉시 표시(레이아웃 확정)
                var hidden = target.querySelectorAll('.fl-animation:not(.fl-animated)');
                for (var h = 0; h < hidden.length; h++) {
                    hidden[h].classList.add('fl-animated');
                    hidden[h].style.opacity = '1';
                }
                try {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } catch (err) {
                    target.scrollIntoView();
                }
                // 스크롤이 어느 정도 진행된 뒤 첫 입력칸에 포커스
                setTimeout(function () {
                    var first = target.querySelector(
                        'input[name="text_2"], input[type="text"], select, textarea'
                    );
                    if (first) {
                        try { first.focus({ preventScroll: true }); }
                        catch (err2) { first.focus(); }
                    }
                }, 600);
            });
        }
    }

    function boot() { apply(); wireSearch(); wireInquiryButtons(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
