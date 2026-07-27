(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-4bxqjzfhgrc6 .pp-heading-separator, .fl-node-4bxqjzfhgrc6 .pp-heading').removeClass('pp-left');
        $('.fl-node-4bxqjzfhgrc6 .pp-heading-separator, .fl-node-4bxqjzfhgrc6 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-4bxqjzfhgrc6 .pp-heading-separator, .fl-node-4bxqjzfhgrc6 .pp-heading').removeClass('pp-left');
        $('.fl-node-4bxqjzfhgrc6 .pp-heading-separator, .fl-node-4bxqjzfhgrc6 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

(function($) {

	function equalheight() {

		if( window.navigator.userAgent.indexOf( 'MSIE ' ) > 0 ) {
			return;
		}

		var maxHeight = 0;
		$('.fl-node-2n1qpuyexsw0 .pp-logos-wrapper .pp-logo').each(function(index) {
			if(($(this).find('.logo-image').outerHeight() + 0) > maxHeight) {
				maxHeight = $(this).find('.logo-image').outerHeight() + 0;
			}
		});
		$('.fl-node-2n1qpuyexsw0 .pp-logos-wrapper .pp-logo').css('height', maxHeight + 'px');

				return maxHeight;
	}

	$('.fl-node-2n1qpuyexsw0 .pp-logos-wrapper').imagesLoaded(function() {
			// Clear the controls in case they were already created.
		//$('.fl-node-2n1qpuyexsw0 .logo-slider-next').empty();
		//$('.fl-node-2n1qpuyexsw0 .logo-slider-prev').empty();

		var getMinSlides = function() {
			var minSlides = ( $( window ).width() <= 768 ) ? parseInt( $( '.fl-node-2n1qpuyexsw0' ).width() / 270) : 3;

						if ( window.innerWidth <= 1200 ) {
				minSlides = 2;
			}
									if ( window.innerWidth <= 992 ) {
				minSlides = 2;
			}
									if ( window.innerWidth <= 768 ) {
				minSlides = 2;
			}
			
			minSlides = (minSlides === 0) ? 1 : minSlides;

			return minSlides;
		}

		var minSlides = getMinSlides();

		var maxSlides = minSlides;
		var moveSlides = maxSlides;

					moveSlides = 1;
		
		var totalSlides = minSlides - 1;

		$(window).on('resize', function() {
			minSlides = getMinSlides();
			maxSlides = minSlides;
			moveSlides = maxSlides;

						moveSlides = 1;
			
			totalSlides = minSlides - 1;
		});

		
				//equalheight();
		
		var totalSlides = $('.fl-node-2n1qpuyexsw0 .pp-logo:not(.bx-clone)').length;

		var options = {
							slideWidth: 250,
						moveSlides: moveSlides,
			slideMargin: 10,
			minSlides: minSlides,
			maxSlides: maxSlides,
			autoStart : 1,
			auto : true,
			autoHover: false,
			adaptiveHeight: false,
			pause : 4000,
			mode : 'horizontal',
			speed : 500,
			infiniteLoop: true,
			pager : 0,
			controls: false,
			ariaLive: false,
			onSliderLoad: function() {
				$('.fl-node-2n1qpuyexsw0 .pp-logos-wrapper').addClass('pp-logos-wrapper-loaded');
				$('.fl-node-2n1qpuyexsw0 .pp-logo').attr('role', 'group');

				var visibleCount = 0;
				$('.fl-node-2n1qpuyexsw0 .pp-logo').each(function() {
					if ( ! $(this).hasClass( 'bx-clone' ) ) {
						visibleCount++;
						$(this).attr('aria-label', 'Slide ' + visibleCount + ' of ' + totalSlides );
					}
				});

				setTimeout( function() {
					$(window).trigger('resize');
				}, 200 );

				// Fix keyboard navigation
				var hasItemFocus = false;
				$('.fl-node-2n1qpuyexsw0').off('keyup').on('keyup', function(e) {
					e.stopPropagation();
					if ( $(e.target).hasClass('pp-logos-wrapper') || $(e.target).closest('.pp-logos-wrapper').length ) {
						hasItemFocus = true;
					}
					if ( hasItemFocus && $(e.target).hasClass('logo-slider-nav') ) {
						$(this).find('.pp-logos-wrapper').data('bxSlider').reloadSlider();
						hasItemFocus = false;
					}
				});

				$(document).trigger( 'pp_logos_on_slider_load', [ $('.fl-node-2n1qpuyexsw0') ] );
			},
			onSlideBefore: function( ele, oldIndex, newIndex ) {
				this.stopAuto( true );
				$('.fl-node-2n1qpuyexsw0 .logo-slider-nav').addClass('disabled');
				$('.fl-node-2n1qpuyexsw0 .bx-controls .bx-pager-link').addClass('disabled');
								this.startAuto( true );
				
				var visibleCount = 0;
				$('.fl-node-2n1qpuyexsw0 .pp-logo').each(function() {
					if ( ! $(this).hasClass( 'bx-clone' ) ) {
						visibleCount++;
						$(this).attr('aria-label', 'Slide ' + visibleCount + ' of ' + totalSlides );
					}
				});
			},
			onSlideAfter: function( ele, oldIndex, newIndex ) {
				$('.fl-node-2n1qpuyexsw0 .logo-slider-nav').removeClass('disabled');
				$('.fl-node-2n1qpuyexsw0 .bx-controls .bx-pager-link').removeClass('disabled');
			}
		};

		options.onSliderResize = function(currentIndex) {
			options.working = false;
			options.minSlides = minSlides;
			options.maxSlides = maxSlides;
			options.moveSlides = moveSlides;

			this.reloadSlider( options );
		};

		// Create the slider.
		var slider = $('.fl-node-2n1qpuyexsw0 .pp-logos-wrapper').bxSlider( options );

		// Store a reference to the slider.
		slider.data('bxSlider', slider);


		
		
	
			});

})(jQuery);

(function($) {

	function equalheight() {

		if( window.navigator.userAgent.indexOf( 'MSIE ' ) > 0 ) {
			return;
		}

		var maxHeight = 0;
		$('.fl-node-nki7ybzl01c6 .pp-logos-wrapper .pp-logo').each(function(index) {
			if(($(this).find('.logo-image').outerHeight() + 0) > maxHeight) {
				maxHeight = $(this).find('.logo-image').outerHeight() + 0;
			}
		});
		$('.fl-node-nki7ybzl01c6 .pp-logos-wrapper .pp-logo').css('height', maxHeight + 'px');

				return maxHeight;
	}

	$('.fl-node-nki7ybzl01c6 .pp-logos-wrapper').imagesLoaded(function() {
	
			});

})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */

