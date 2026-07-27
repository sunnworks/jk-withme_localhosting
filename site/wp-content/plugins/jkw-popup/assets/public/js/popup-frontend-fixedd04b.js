(function($) {
    'use strict';
    
    var JK위드미Popup = {
        breakpoint: 992,
        currentQueue: [],
        currentIndex: 0,
        activePopups: {},
        slideIntervals: {},
        generalItemQueue: [],
        debugMode: true,
        
        init: function() {
            this.debugLog('초기화 시작');
            
            if (typeof window.jkwPopupData === 'undefined') {
                console.error('[JK위드미Popup] window.jkwPopupData가 정의되지 않음');
                return;
            }
            
            this.debugLog('jkwPopupData:', window.jkwPopupData);
            this.breakpoint = window.jkw_popup.breakpoint || 992;
            
            this.bindEvents();
            this.processPopups();
        },
        
        debugLog: function(message, data) {
            if (this.debugMode && console && console.log) {
                console.log('[JK위드미Popup] ' + message, data || '');
            }
        },
        
        processPopups: function() {
            var self = this;
            var screenWidth = $(window).width();
            var isDesktop = screenWidth >= this.breakpoint;
            var hasActivePopup = false;
            
            this.debugLog('팝업 처리 시작 - 디바이스: ' + (isDesktop ? 'PC' : '모바일'));
            
            // 모든 팝업 처리
            $('.jkw-popup').each(function() {
                var $popup = $(this);
                var popupId = $popup.data('popup-id');
                var isPCPopup = $popup.hasClass('jkw-pc-popup');
                var isMobilePopup = $popup.hasClass('jkw-mobile-popup');
                
                // 디바이스 체크
                if ((isDesktop && !isPCPopup) || (!isDesktop && !isMobilePopup)) {
                    $popup.hide();
                    return true; // continue
                }
                
                // 전체 팝업 쿠키 체크 (슬라이드형을 위해)
                if (self.getCookie('jkw_popup_' + popupId) === 'closed') {
                    self.debugLog('팝업 ' + popupId + '는 전체 쿠키로 숨김');
                    $popup.hide();
                    return true; // continue
                }
                
                // 일반형 팝업 처리
                if ($popup.hasClass('jkw-popup-general')) {
                    var hasVisibleItems = self.processGeneralPopupItems($popup, popupId, isDesktop);
                    
                    if (hasVisibleItems) {
                        $popup.show();
                        hasActivePopup = true;
                        self.debugLog('일반형 팝업 ' + popupId + ' 표시');
                    } else {
                        $popup.hide();
                        self.debugLog('일반형 팝업 ' + popupId + '는 표시할 아이템이 없음');
                    }
                } else {
                    // 슬라이드형 팝업
                    $popup.show();
                    hasActivePopup = true;
                    self.initSlidePopup($popup, {id: popupId, style: 'slide'});
                }
            });
            
            // 오버레이 표시
            if (hasActivePopup) {
                $('#jkw-popup-overlay').fadeIn(300);
            }
        },
        
        processGeneralPopupItems: function($popup, popupId, isDesktop) {
            var self = this;
            var $items = $popup.find('.jkw-general-item');
            var visibleItems = [];
            
            this.debugLog('일반형 팝업 ' + popupId + ' 처리 - 아이템 수: ' + $items.length);
            
            // 각 아이템별 쿠키 체크
            $items.each(function(index) {
                var $item = $(this);
                var cookieName = 'jkw_popup_' + popupId + '_item_' + index;
                var cookieValue = self.getCookie(cookieName);
                var hasCookie = (cookieValue === 'closed');
                
                self.debugLog('아이템 ' + index + ' 쿠키 체크:', {
                    'cookieName': cookieName,
                    'cookieValue': cookieValue,
                    'hasCookie': hasCookie
                });
                
                // 아이템에 인덱스 저장 (중요!)
                $item.attr('data-item-index', index);
                $item.find('.jkw-popup-today').attr('data-index', index);
                $item.find('.jkw-popup-close').attr('data-index', index);
                
                if (hasCookie) {
                    // 쿠키가 있는 아이템은 숨김
                    $item.hide();
                    $item.data('has-cookie', true);
                } else {
                    // 쿠키가 없는 아이템은 표시
                    visibleItems.push($item);
                    $item.data('has-cookie', false);
                    $item.data('item-index', index);
                    
                    if (isDesktop) {
                        // PC에서는 모두 표시
                        $item.show();
                    }
                }
            });
            
            // 모바일에서 순차 표시 설정
            if (!isDesktop && visibleItems.length > 0) {
                // 모든 표시 가능한 아이템 숨기고
                $.each(visibleItems, function(i, $item) {
                    $item.removeClass('active').hide();
                });
                // 첫 번째만 표시
                visibleItems[0].addClass('active').show();
                
                // 큐 생성
                this.generalItemQueue = visibleItems.map(function($item) {
                    return {
                        element: $item,
                        index: $item.data('item-index'),
                        popupId: popupId
                    };
                });
            }
            
            return visibleItems.length > 0;
        },
        
        bindEvents: function() {
            var self = this;
            
            // 팝업 닫기
            $(document).on('click', '.jkw-popup-close', function(e) {
                e.preventDefault();
                self.handleCloseClick($(this));
            });
            
            // 오늘 하루 보지 않기
            $(document).on('click', '.jkw-popup-today', function(e) {
                e.preventDefault();
                self.handleTodayClick($(this));
            });
            
            // 슬라이드 버튼
            $(document).on('click', '.jkw-slide-button', function(e) {
                e.preventDefault();
                self.handleSlideButtonClick($(this));
            });
            
            // 오버레이 클릭
            $(document).on('click', '#jkw-popup-overlay', function(e) {
                if (e.target === this) {
                    self.handleOverlayClick();
                }
            });
        },
        
        handleCloseClick: function($button) {
            var self = this;
            var $popup = $button.closest('.jkw-popup');
            var popupId = $button.data('popup-id');
            var index = $button.data('index');
            var screenWidth = $(window).width();
            
            this.debugLog('닫기 클릭 - 팝업: ' + popupId + ', 인덱스: ' + index);
            
            if ($popup.hasClass('jkw-popup-general')) {
                // 일반형 팝업
                var $item = $button.closest('.jkw-general-item');
                
                if (screenWidth < this.breakpoint) {
                    // 모바일: 다음 아이템 표시
                    this.showNextGeneralItem($popup, $item);
                } else {
                    // PC: 해당 아이템만 숨김
                    $item.fadeOut(200, function() {
                        // 아이템이 숨겨진 후 확인
                        var visibleCount = $popup.find('.jkw-general-item:visible').length;
                        self.debugLog('PC 아이템 닫기 - 남은 아이템: ' + visibleCount);
                        
                        if (visibleCount === 0) {
                            // 모든 아이템이 숨겨졌으면 팝업 닫기
                            $popup.fadeOut(200, function() {
                                self.checkAllPopupsClosed();
                            });
                        } else {
                            // 아직 보이는 아이템이 있어도 다른 팝업이 모두 닫혔는지 확인
                            self.checkAllPopupsClosed();
                        }
                    });
                }
            } else {
                // 슬라이드형 팝업: 전체 닫기
                this.closeSlidePopup($popup, popupId);
            }
        },
        
        handleTodayClick: function($button) {
            var popupId = $button.data('popup-id');
            var index = $button.data('index');
            var $popup = $button.closest('.jkw-popup');
            
            // 디버깅: 버튼 데이터 확인
            this.debugLog('하루 보지 않기 버튼 데이터:', {
                'popup-id': popupId,
                'index': index,
                'item-id': $button.data('item-id'),
                'button-html': $button[0].outerHTML
            });
            
            if ($popup.hasClass('jkw-popup-general') && index !== null && index !== undefined && index !== 'undefined') {
                // 일반형 팝업의 개별 아이템
                var cookieName = 'jkw_popup_' + popupId + '_item_' + index;
                this.setCookie(cookieName, 'closed', 1);
                this.debugLog('개별 아이템 쿠키 설정: ' + cookieName);
                
                // 해당 아이템에 쿠키 플래그 설정
                var $item = $button.closest('.jkw-general-item');
                $item.data('has-cookie', true);
            } else {
                // 슬라이드형 팝업 전체
                this.setCookie('jkw_popup_' + popupId, 'closed', 1);
                this.debugLog('전체 팝업 쿠키 설정: jkw_popup_' + popupId);
            }
            
            // 닫기 처리
            this.handleCloseClick($button);
        },
        
        showNextGeneralItem: function($popup, $currentItem) {
            var self = this;
            var $items = $popup.find('.jkw-general-item');
            var $visibleItems = $items.filter(function() {
                return !$(this).data('has-cookie');
            });
            
            var currentIndex = $visibleItems.index($currentItem);
            var nextIndex = currentIndex + 1;
            
            $currentItem.fadeOut(200, function() {
                $currentItem.removeClass('active');
                
                if (nextIndex < $visibleItems.length) {
                    // 다음 아이템 표시
                    var $nextItem = $visibleItems.eq(nextIndex);
                    $nextItem.addClass('active').fadeIn(200);
                } else {
                    // 모든 아이템 표시 완료
                    $popup.fadeOut(200, function() { // 300ms -> 200ms로 단축
                        self.checkAllPopupsClosed();
                    });
                }
            });
        },
        
        closeSlidePopup: function($popup, popupId) {
            var self = this;
            
            if (this.slideIntervals[popupId]) {
                clearInterval(this.slideIntervals[popupId]);
                delete this.slideIntervals[popupId];
            }
            
            $popup.fadeOut(200, function() { // 300ms -> 200ms로 단축
                self.checkAllPopupsClosed();
            });
        },
        
        checkAllPopupsClosed: function() {
            var self = this;
            // 즉시 확인 후 추가 확인
            var visiblePopups = $('.jkw-popup:visible').length;
            self.debugLog('즉시 체크 - 보이는 팝업: ' + visiblePopups);
            
            if (visiblePopups === 0) {
                self.debugLog('모든 팝업이 닫혔음 - 오버레이 즉시 숨김');
                $('#jkw-popup-overlay').stop(true, true).fadeOut(150);
            } else {
                // 짧은 지연 후 재확인 (애니메이션 완료 대기)
                setTimeout(function() {
                    var visiblePopupsAfter = $('.jkw-popup:visible').length;
                    self.debugLog('지연 체크 - 보이는 팝업: ' + visiblePopupsAfter);
                    if (visiblePopupsAfter === 0) {
                        self.debugLog('모든 팝업이 닫혔음 - 오버레이 숨김');
                        $('#jkw-popup-overlay').stop(true, true).fadeOut(150);
                    }
                }, 50);
            }
        },
        
        handleOverlayClick: function() {
            var self = this;
            // 현재 보이는 모든 팝업 찾기
            var $visiblePopups = $('.jkw-popup:visible');
            
            this.debugLog('오버레이 클릭 - 보이는 팝업 수: ' + $visiblePopups.length);
            
            if ($visiblePopups.length > 0) {
                // 마지막 팝업부터 닫기 (가장 위에 있는 팝업)
                var $lastPopup = $visiblePopups.last();
                var $closeBtn = $lastPopup.find('.jkw-popup-close:visible').first();
                
                if ($closeBtn.length) {
                    this.debugLog('닫기 버튼 클릭: ' + $lastPopup.attr('id'));
                    $closeBtn.click();
                } else {
                    // 닫기 버튼이 없으면 직접 닫기
                    this.debugLog('닫기 버튼 없음 - 직접 닫기');
                    var popupId = $lastPopup.data('popup-id');
                    $lastPopup.fadeOut(200, function() { // 300ms -> 200ms로 단축
                        self.checkAllPopupsClosed();
                    });
                }
            } else {
                // 보이는 팝업이 없으면 오버레이만 숨김
                this.debugLog('보이는 팝업 없음 - 오버레이만 숨김');
                $('#jkw-popup-overlay').fadeOut(300);
            }
        },
        
        initSlidePopup: function($popup, popupInfo) {
            var self = this;
            var popupId = popupInfo.id;
            var $slides = $popup.find('.jkw-slide');
            var currentSlide = 0;
            
            if ($slides.length > 1) {
                this.slideIntervals[popupId] = setInterval(function() {
                    currentSlide = (currentSlide + 1) % $slides.length;
                    self.showSlide($popup, currentSlide);
                }, 3500);
            }
        },
        
        showSlide: function($popup, index) {
            var $slides = $popup.find('.jkw-slide');
            var $buttons = $popup.find('.jkw-slide-button');
            
            $slides.hide().eq(index).fadeIn(300);
            $buttons.removeClass('active').eq(index).addClass('active');
        },
        
        handleSlideButtonClick: function($button) {
            var popupId = $button.closest('.jkw-popup').data('popup-id');
            var slideIndex = $button.data('slide');
            var $popup = $button.closest('.jkw-popup');
            
            // 슬라이드쇼 재시작
            if (this.slideIntervals[popupId]) {
                clearInterval(this.slideIntervals[popupId]);
            }
            
            this.showSlide($popup, slideIndex);
            
            // 슬라이드쇼 재개
            var self = this;
            var $slides = $popup.find('.jkw-slide');
            if ($slides.length > 1) {
                this.slideIntervals[popupId] = setInterval(function() {
                    slideIndex = (slideIndex + 1) % $slides.length;
                    self.showSlide($popup, slideIndex);
                }, 3500);
            }
        },
        
        getCookie: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        
        setCookie: function(name, value, days) {
            // 세션 쿠키로 설정 (expires 없이)
            // 브라우저를 닫으면 사라짐
            document.cookie = name + "=" + (value || "") + "; path=/";
            this.debugLog('세션 쿠키 설정: ' + name + ' = ' + value);
        }
    };
    
    // DOM Ready
    $(document).ready(function() {
        console.log('[JK위드미Popup] DOM Ready - Fixed Version');
        JK위드미Popup.init();
    });
    
})(jQuery);