(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-bl0twxvr4dmc .pp-heading-separator, .fl-node-bl0twxvr4dmc .pp-heading').removeClass('pp-left');
        $('.fl-node-bl0twxvr4dmc .pp-heading-separator, .fl-node-bl0twxvr4dmc .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-bl0twxvr4dmc .pp-heading-separator, .fl-node-bl0twxvr4dmc .pp-heading').removeClass('pp-left');
        $('.fl-node-bl0twxvr4dmc .pp-heading-separator, .fl-node-bl0twxvr4dmc .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */

