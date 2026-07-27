(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-vd7oxrz0h1pw .pp-heading-separator, .fl-node-vd7oxrz0h1pw .pp-heading').removeClass('pp-left');
        $('.fl-node-vd7oxrz0h1pw .pp-heading-separator, .fl-node-vd7oxrz0h1pw .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-vd7oxrz0h1pw .pp-heading-separator, .fl-node-vd7oxrz0h1pw .pp-heading').removeClass('pp-left');
        $('.fl-node-vd7oxrz0h1pw .pp-heading-separator, .fl-node-vd7oxrz0h1pw .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

;/**
 * This file should contain frontend logic for 
 * all module instances.
 */
(function($) {

	function equalheight() {

		if( window.navigator.userAgent.indexOf( 'MSIE ' ) > 0 ) {
			return;
		}

		var maxHeight = 0;
		$('.fl-node-sgztwpa4ndh6 .pp-logos-wrapper .pp-logo').each(function(index) {
			if(($(this).find('.logo-image').outerHeight() + 0) > maxHeight) {
				maxHeight = $(this).find('.logo-image').outerHeight() + 0;
			}
		});
		$('.fl-node-sgztwpa4ndh6 .pp-logos-wrapper .pp-logo').css('height', maxHeight + 'px');

				return maxHeight;
	}

	$('.fl-node-sgztwpa4ndh6 .pp-logos-wrapper').imagesLoaded(function() {
	
			});

})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */

