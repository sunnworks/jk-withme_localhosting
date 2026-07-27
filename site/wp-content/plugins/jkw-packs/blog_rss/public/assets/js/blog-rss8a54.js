/**
 * JK위드미 RSS Feed - Public JavaScript
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // 이미지 lazy loading 강화
        if ('loading' in HTMLImageElement.prototype) {
            // 브라우저 네이티브 lazy loading 지원
            $('.jkw-rss-feed img').attr('loading', 'lazy');
        } else {
            // Intersection Observer 폴리필
            initLazyLoad();
        }

        // 외부 링크 새 탭 열기
        $('.jkw-rss-feed a[href^="http"]').attr('target', '_blank').attr('rel', 'noopener noreferrer');
    });

    /**
     * Lazy Loading 초기화 (IE 대응)
     */
    function initLazyLoad() {
        const images = document.querySelectorAll('.jkw-rss-feed img');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // Fallback: 모든 이미지 즉시 로드
            images.forEach(function(img) {
                img.src = img.dataset.src || img.src;
            });
        }
    }

})(jQuery);
