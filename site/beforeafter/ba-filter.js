/**
 * JK위드미 전후사진 클라이언트 필터
 * -----------------------------------------------------------------
 *  원본은 워드프레스 서버(ajax)가 카테고리 필터/페이지네이션을 처리했으나,
 *  정적 사이트에선 서버가 없으므로 브라우저에서 처리한다.
 *  - 46개 아이템은 빌드 시점에 모두 이 페이지 그리드에 통합됨(data-cat 태깅)
 *  - 카테고리 버튼 클릭 → 해당 data-cat 아이템만 표시 + 더보기 페이지네이션
 *  (전후 비교 슬라이더는 기존 스크립트가 그대로 담당)
 * -----------------------------------------------------------------
 */
(function () {
    'use strict';

    function init() {
        var grid = document.querySelector('.ba-gallery-grid');
        if (!grid) return;

        var PER = 9;
        var curCat = '0';
        var shown = PER;
        var items = [].slice.call(grid.querySelectorAll('.ba-gallery-item'));

        // 원본 버튼의 ajax 핸들러 제거를 위해 복제로 교체
        var bar = document.querySelector('.ba-category-filter') || document;
        var oldBtns = [].slice.call(bar.querySelectorAll('.ba-cat-btn'));
        oldBtns.forEach(function (b) {
            var clone = b.cloneNode(true);
            b.parentNode.replaceChild(clone, b);
        });

        // 사용하지 않는 하위카테고리 UI 숨김(서버 데이터 없음)
        ['.ba-subcategory-filter', '.ba-third-level-filter', '.ba-fourth-level-filter']
            .forEach(function (sel) {
                document.querySelectorAll(sel).forEach(function (e) { e.style.display = 'none'; });
            });

        // 더보기 버튼
        var more = document.createElement('button');
        more.type = 'button';
        more.textContent = '더보기 +';
        more.style.cssText = 'display:block;margin:28px auto 8px;padding:12px 44px;border:1px solid #e5602f;' +
            'background:#fff;color:#e5602f;border-radius:26px;font-size:15px;font-weight:600;cursor:pointer;';
        grid.parentNode.insertBefore(more, grid.nextSibling);

        function apply() {
            var count = 0;
            items.forEach(function (it) {
                var cat = it.getAttribute('data-cat') || '';
                var match = (curCat === '0' || cat === curCat);
                if (match) {
                    count++;
                    it.style.display = (count <= shown) ? '' : 'none';
                } else {
                    it.style.display = 'none';
                }
            });
            more.style.display = (count > shown) ? 'block' : 'none';
        }

        document.querySelectorAll('.ba-cat-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelectorAll('.ba-cat-btn').forEach(function (x) { x.classList.remove('active'); });
                this.classList.add('active');
                curCat = this.getAttribute('data-category') || '0';
                shown = PER;
                apply();
                // 전후 슬라이더 재초기화(있으면)
                if (window.jQuery && typeof window.initBASliders === 'function') { try { window.initBASliders(); } catch (x) {} }
            });
        });

        more.addEventListener('click', function () { shown += PER; apply(); });

        apply();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
