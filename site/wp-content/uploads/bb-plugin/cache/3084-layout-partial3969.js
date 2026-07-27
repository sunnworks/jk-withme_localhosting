(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-4cmxkltzjrn9 .pp-heading-separator, .fl-node-4cmxkltzjrn9 .pp-heading').removeClass('pp-left');
        $('.fl-node-4cmxkltzjrn9 .pp-heading-separator, .fl-node-4cmxkltzjrn9 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-4cmxkltzjrn9 .pp-heading-separator, .fl-node-4cmxkltzjrn9 .pp-heading').removeClass('pp-left');
        $('.fl-node-4cmxkltzjrn9 .pp-heading-separator, .fl-node-4cmxkltzjrn9 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */

