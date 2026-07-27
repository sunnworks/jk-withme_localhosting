/**
 * JK위드미팩 전후사진 프론트엔드 JavaScript
 * 카테고리 필터링, 이미지 전환, 로그인 리다이렉트
 */

(function($) {
    'use strict';

    $(document).ready(function() {

        // 방향 전환 탭 클릭 (다중 이미지만)
        $('.ba-dir-tab').on('click', function() {
            var $btn = $(this);
            var direction = $btn.data('direction');
            var $item = $btn.closest('.ba-gallery-item');
            var $beforeImg = $item.find('.ba-before .ba-img');
            var $afterImg = $item.find('.ba-after .ba-img');

            // 버튼 활성화 상태 변경
            $btn.siblings().removeClass('active');
            $btn.addClass('active');

            // 이미지 URL 변경
            var beforeSrc = $beforeImg.data(direction);
            var afterSrc = $afterImg.data(direction);

            if (beforeSrc) {
                $beforeImg.fadeOut(200, function() {
                    $(this).attr('src', beforeSrc).fadeIn(200);
                });
            }

            if (afterSrc) {
                $afterImg.fadeOut(200, function() {
                    $(this).attr('src', afterSrc).fadeIn(200);
                });
            }
        });

        // 최상위 카테고리 ID 저장 (계층형 필터링용)
        var topLevelCategory = 0;

        // 카테고리 필터 클릭
        $('.ba-cat-btn').on('click', function() {
            var $btn = $(this);
            var categoryId = $btn.data('category');
            var parentId = $btn.data('parent');

            console.log('Category clicked:', categoryId);

            // 활성화 상태 변경
            $btn.siblings().removeClass('active');
            $btn.addClass('active');

            // 최상위 카테고리 저장
            topLevelCategory = categoryId;

            // 2차 카테고리 로드
            if (categoryId > 0 && typeof baCategories !== 'undefined' && Array.isArray(baCategories)) {
                loadSubcategories(categoryId);
            } else {
                hideSubcategories();
            }

            // AJAX로 필터링된 컨텐츠 로드
            // categoryId가 0이면 전체, 0보다 크면 해당 카테고리와 하위 모두
            console.log('Calling loadFilteredContent with categoryId:', categoryId);
            loadFilteredContent(categoryId, 0);
        });

        // 2차/3차/4차 카테고리 로드 함수 (계층형)
        function loadSubcategories(parentId) {
            var subcategories = baCategories.filter(function(cat) {
                return cat.parent === parentId;
            });

            if (subcategories.length > 0) {
                var html = '<button class="ba-subcat-btn active" data-subcategory="0" data-parent="' + parentId + '">전체</button>';

                subcategories.forEach(function(cat) {
                    // 하위 카테고리가 있는지 확인
                    var hasChildren = baCategories.some(function(c) {
                        return c.parent === cat.id;
                    });

                    var childIndicator = hasChildren ? ' ▼' : '';
                    html += '<button class="ba-subcat-btn" data-subcategory="' + cat.id + '" data-parent="' + parentId + '" data-has-children="' + (hasChildren ? '1' : '0') + '">' + cat.name + childIndicator + '</button>';
                });

                $('.ba-subcategory-filter').html(html).slideDown(300);

                // 2차 카테고리 클릭 이벤트
                $('.ba-subcat-btn').on('click', function() {
                    var $btn = $(this);
                    var subcategoryId = $btn.data('subcategory');
                    var currentParent = $btn.data('parent');
                    var hasChildren = $btn.data('has-children');

                    $btn.siblings().removeClass('active');
                    $btn.addClass('active');

                    // 하위 카테고리가 있으면 추가로 로드
                    if (subcategoryId > 0 && hasChildren) {
                        loadThirdLevelCategories(subcategoryId, currentParent);
                    } else {
                        // 하위 카테고리 필터 숨기기
                        $('.ba-third-level-filter, .ba-fourth-level-filter').slideUp(300);
                    }

                    // 필터링 적용
                    // "전체" 클릭 시: topLevelCategory → 1차 카테고리의 모든 하위 포함
                    // 2차 클릭 시: subcategoryId → 특정 2차 카테고리만
                    var filterCat = subcategoryId > 0 ? subcategoryId : topLevelCategory;
                    loadFilteredContent(filterCat, 0);
                });
            } else {
                hideSubcategories();
            }
        }

        // 3차 카테고리 로드 함수
        function loadThirdLevelCategories(parentId, topParent) {
            var thirdLevel = baCategories.filter(function(cat) {
                return cat.parent === parentId;
            });

            if (thirdLevel.length > 0) {
                var html = '<button class="ba-third-btn active" data-third="0" data-parent="' + parentId + '">전체</button>';

                thirdLevel.forEach(function(cat) {
                    var hasChildren = baCategories.some(function(c) {
                        return c.parent === cat.id;
                    });

                    var childIndicator = hasChildren ? ' ▼' : '';
                    html += '<button class="ba-third-btn" data-third="' + cat.id + '" data-parent="' + parentId + '" data-has-children="' + (hasChildren ? '1' : '0') + '">' + cat.name + childIndicator + '</button>';
                });

                // 3차 필터 컨테이너가 없으면 생성
                if ($('.ba-third-level-filter').length === 0) {
                    $('.ba-subcategory-filter').after('<div class="ba-third-level-filter ba-subcategory-filter" style="display: none; background: #f1f5f9;"></div>');
                }

                $('.ba-third-level-filter').html(html).slideDown(300);

                // 3차 카테고리 클릭 이벤트
                $('.ba-third-btn').on('click', function() {
                    var $btn = $(this);
                    var thirdId = $btn.data('third');
                    var currentParent = $btn.data('parent');
                    var hasChildren = $btn.data('has-children');

                    $btn.siblings().removeClass('active');
                    $btn.addClass('active');

                    // 하위 카테고리가 있으면 4차 로드
                    if (thirdId > 0 && hasChildren) {
                        loadFourthLevelCategories(thirdId, currentParent);
                    } else {
                        $('.ba-fourth-level-filter').slideUp(300);
                    }

                    // 필터링 적용
                    // "전체" 클릭 시: currentParent → 2차 카테고리의 모든 하위 포함
                    // 3차 클릭 시: thirdId → 특정 3차 카테고리만
                    var filterCat = thirdId > 0 ? thirdId : currentParent;
                    loadFilteredContent(filterCat, 0);
                });
            } else {
                $('.ba-third-level-filter, .ba-fourth-level-filter').slideUp(300);
            }
        }

        // 4차 카테고리 로드 함수
        function loadFourthLevelCategories(parentId, topParent) {
            var fourthLevel = baCategories.filter(function(cat) {
                return cat.parent === parentId;
            });

            if (fourthLevel.length > 0) {
                var html = '<button class="ba-fourth-btn active" data-fourth="0" data-parent="' + parentId + '">전체</button>';

                fourthLevel.forEach(function(cat) {
                    html += '<button class="ba-fourth-btn" data-fourth="' + cat.id + '" data-parent="' + parentId + '">' + cat.name + '</button>';
                });

                // 4차 필터 컨테이너가 없으면 생성
                if ($('.ba-fourth-level-filter').length === 0) {
                    $('.ba-third-level-filter').after('<div class="ba-fourth-level-filter ba-subcategory-filter" style="display: none; background: #e2e8f0;"></div>');
                }

                $('.ba-fourth-level-filter').html(html).slideDown(300);

                // 4차 카테고리 클릭 이벤트
                $('.ba-fourth-btn').on('click', function() {
                    var $btn = $(this);
                    var fourthId = $btn.data('fourth');
                    var currentParent = $btn.data('parent');

                    $btn.siblings().removeClass('active');
                    $btn.addClass('active');

                    // 필터링 적용
                    // "전체" 클릭 시: currentParent → 3차 카테고리의 모든 하위 포함
                    // 4차 클릭 시: fourthId → 특정 4차 카테고리만
                    var filterCat = fourthId > 0 ? fourthId : currentParent;
                    loadFilteredContent(filterCat, 0);
                });
            } else {
                $('.ba-fourth-level-filter').slideUp(300);
            }
        }

        // 모든 하위 카테고리 숨기기
        function hideSubcategories() {
            $('.ba-subcategory-filter, .ba-third-level-filter, .ba-fourth-level-filter').slideUp(300);
        }

        // 필터링된 컨텐츠 로드
        function loadFilteredContent(categoryId, subcategoryId, page) {
            page = page || 1;
            var $container = $('.jkw-ba-gallery-container');
            var $grid = $('.ba-gallery-grid');
            var perPage = $container.data('per-page') || 9;

            console.log('loadFilteredContent called:', {
                categoryId: categoryId,
                subcategoryId: subcategoryId,
                page: page,
                perPage: perPage,
                ajaxurl: jkwBA.ajaxurl
            });

            // 로딩 표시
            $grid.css('opacity', '0.5');

            // AJAX 요청
            $.ajax({
                url: jkwBA.ajaxurl,
                type: 'POST',
                data: {
                    action: 'jkw_ba_filter',
                    category: categoryId,
                    subcategory: subcategoryId,
                    per_page: perPage,
                    paged: page,
                    nonce: jkwBA.nonce || ''
                },
                success: function(response) {
                    console.log('AJAX success:', response);
                    if (response.success) {
                        $grid.html(response.data.html).css('opacity', '1');

                        // 이벤트 재등록
                        reinitializeEvents();

                        // 페이지네이션 업데이트
                        if (response.data.pagination) {
                            $('.ba-pagination').html(response.data.pagination);
                        }
                    } else {
                        console.error('Response not successful:', response);
                    }
                },
                error: function(xhr, status, error) {
                    console.error('AJAX error:', {xhr: xhr, status: status, error: error});
                    $grid.css('opacity', '1');
                    alert('컨텐츠를 불러오는데 실패했습니다.');
                }
            });
        }

        // 이벤트 재등록
        function reinitializeEvents() {
            // 방향 전환 탭
            $('.ba-dir-tab').off('click').on('click', function() {
                var $btn = $(this);
                var direction = $btn.data('direction');
                var $item = $btn.closest('.ba-gallery-item');
                var $beforeImg = $item.find('.ba-before .ba-img');
                var $afterImg = $item.find('.ba-after .ba-img');

                $btn.siblings().removeClass('active');
                $btn.addClass('active');

                var beforeSrc = $beforeImg.data(direction);
                var afterSrc = $afterImg.data(direction);

                if (beforeSrc) {
                    $beforeImg.fadeOut(200, function() {
                        $(this).attr('src', beforeSrc).fadeIn(200);
                    });
                }

                if (afterSrc) {
                    $afterImg.fadeOut(200, function() {
                        $(this).attr('src', afterSrc).fadeIn(200);
                    });
                }
            });
        }

        // 로그인 버튼 클릭 시 현재 페이지로 리다이렉트
        $('.ba-login-btn').on('click', function(e) {
            var href = $(this).attr('href');
            var currentUrl = window.location.href;

            // 이미 redirect 파라미터가 있는지 확인
            if (href.indexOf('redirect=') === -1) {
                e.preventDefault();
                window.location.href = jkwBA.loginUrl + '?redirect=' + encodeURIComponent(currentUrl);
            }
        });

        // 이미지 지연 로딩 (Intersection Observer)
        if ('IntersectionObserver' in window) {
            var imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            delete img.dataset.src;
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('.ba-img[data-src]').forEach(function(img) {
                imageObserver.observe(img);
            });
        }

        // 키보드 네비게이션 (접근성) - 다중 이미지만
        $('.ba-gallery-item').on('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                var $firstTab = $(this).find('.ba-dir-tab').first();
                if ($firstTab.length) {
                    e.preventDefault();
                    $firstTab.trigger('click');
                }
            }
        });

        // 터치 스와이프 지원 (모바일) - 다중 이미지만
        var touchStartX = 0;
        var touchEndX = 0;

        $('.ba-images').on('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        });

        $('.ba-images').on('touchend', function(e) {
            touchEndX = e.changedTouches[0].clientX;
            handleSwipe($(this));
        });

        function handleSwipe($element) {
            var swipeThreshold = 50;
            var diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                var $item = $element.closest('.ba-gallery-item');
                var $tabs = $item.find('.ba-dir-tab');
                var $active = $tabs.filter('.active');
                var currentIndex = $tabs.index($active);

                if (diff > 0 && currentIndex < $tabs.length - 1) {
                    // 왼쪽 스와이프 - 다음
                    $tabs.eq(currentIndex + 1).trigger('click');
                } else if (diff < 0 && currentIndex > 0) {
                    // 오른쪽 스와이프 - 이전
                    $tabs.eq(currentIndex - 1).trigger('click');
                }
            }
        }

        // 애니메이션 효과
        $('.ba-gallery-item').each(function(index) {
            $(this).css({
                'animation-delay': (index * 0.05) + 's'
            });
        });

        // 페이지네이션 클릭 처리 (AJAX)
        $(document).on('click', '.ba-pagination a', function(e) {
            e.preventDefault();

            var href = $(this).attr('href');
            if (!href) return;

            // URL에서 페이지 번호 추출
            var match = href.match(/paged=(\d+)/);
            var page = match ? parseInt(match[1]) : 1;

            // 현재 활성 카테고리 가져오기 (계층형)
            var categoryId = 0;

            // 4차 카테고리 확인
            if ($('.ba-fourth-btn.active').length && $('.ba-fourth-btn.active').data('fourth') > 0) {
                categoryId = $('.ba-fourth-btn.active').data('fourth');
            }
            // 3차 카테고리 확인
            else if ($('.ba-third-btn.active').length && $('.ba-third-btn.active').data('third') > 0) {
                categoryId = $('.ba-third-btn.active').data('third');
            }
            // 2차 카테고리 확인
            else if ($('.ba-subcat-btn.active').length && $('.ba-subcat-btn.active').data('subcategory') > 0) {
                categoryId = $('.ba-subcat-btn.active').data('subcategory');
            }
            // 1차 카테고리 확인
            else {
                categoryId = $('.ba-cat-btn.active').data('category') || 0;
            }

            // 필터링된 컨텐츠 로드
            loadFilteredContent(categoryId, 0, page);

            // 스크롤을 갤러리 상단으로 이동
            $('html, body').animate({
                scrollTop: $('.jkw-ba-gallery-container').offset().top - 100
            }, 300);
        });

    });

})(jQuery);
