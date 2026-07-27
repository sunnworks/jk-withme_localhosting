(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-yvdiosb76tw4 .pp-heading-separator, .fl-node-yvdiosb76tw4 .pp-heading').removeClass('pp-left');
        $('.fl-node-yvdiosb76tw4 .pp-heading-separator, .fl-node-yvdiosb76tw4 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-yvdiosb76tw4 .pp-heading-separator, .fl-node-yvdiosb76tw4 .pp-heading').removeClass('pp-left');
        $('.fl-node-yvdiosb76tw4 .pp-heading-separator, .fl-node-yvdiosb76tw4 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

(function($) {

	function equalheight() {

		if( window.navigator.userAgent.indexOf( 'MSIE ' ) > 0 ) {
			return;
		}

		var maxHeight = 0;
		$('.fl-node-gir07vfkp25b .pp-logos-wrapper .pp-logo').each(function(index) {
			if(($(this).find('.logo-image').outerHeight() + 0) > maxHeight) {
				maxHeight = $(this).find('.logo-image').outerHeight() + 0;
			}
		});
		$('.fl-node-gir07vfkp25b .pp-logos-wrapper .pp-logo').css('height', maxHeight + 'px');

				return maxHeight;
	}

	$('.fl-node-gir07vfkp25b .pp-logos-wrapper').imagesLoaded(function() {
	
			});

})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */

