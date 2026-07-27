
;/**
 * This file should contain frontend logic for 
 * all module instances.
 */
; (function ($) {

	PPOffcanvasContent = function (settings) {
		this.id 				= settings.id;
		this.node 				= $('.fl-node-' + this.id);
		this.wrap 				= this.node.find('.pp-offcanvas-content-wrap');
		this.content 			= this.node.find('.pp-offcanvas-content');
		this.button 			= this.node.find('.pp-offcanvas-toggle');
		this.direction			= settings.direction,
		this.contentTransition	= settings.contentTransition,
		this.closeButton		= settings.closeButton,
		this.escClose			= settings.escClose,
		this.closeButton		= settings.closeButton,
		this.bodyClickClose		= settings.bodyClickClose,
		this.toggleSource		= settings.toggleSource,
		this.toggle_class		= settings.toggle_class,
		this.toggle_id			= settings.toggle_id,
		this.innerWrapper		= settings.innerWrapper,
		this.size				= settings.size,
		this.duration			= 500,
		this.isBuilderActive 	= settings.isBuilderActive,
		this._active = false;
		this._previous = false;

		this._destroy();
		this._init();
	};

	PPOffcanvasContent.prototype = {
		animations: [
			'slide',
			'slide-along',
			'reveal',
			'push',
		],

		_active: false,
		_previous: false,

		_init: function () {
			if (!this.wrap.length) {
				return;
			}

			if ( this.isBuilderActive ) {
				return;
			}

			$('html').addClass('pp-offcanvas-content-widget');

			if ( this.innerWrapper ) {
				if ($('.pp-offcanvas-container').length === 0) {
					$('body').wrapInner('<div class="pp-offcanvas-container" />');
					this.content.insertBefore('.pp-offcanvas-container');
				}
			} else {
				$('body').addClass('pp-offcanvas-container');
				//this.content.prependTo( 'body' );
			}

			if (this.wrap.find('.pp-offcanvas-content').length > 0) {
				if ($('.pp-offcanvas-container > .pp-offcanvas-content-' + this.id).length > 0) {
					$('.pp-offcanvas-container > .pp-offcanvas-content-' + this.id).remove();
				}
				if ($('body > .pp-offcanvas-content-' + this.id).length > 0) {
					$('body > .pp-offcanvas-content-' + this.id).remove();
				}
				$('body').prepend(this.wrap.find('.pp-offcanvas-content'));
			}

			this._setSize();
			this._bindEvents();

			$(document).trigger( 'pp_offcanvas_after_init', [ $('.pp-offcanvas-content-' + this.id) ] );
		},

		_setSize: function() {
			if ( '' !== this.size ) {
				return;
			}
			if ( 'top' !== this.direction || 'bottom' !== this.direction ) {
				return;
			}
			var offCanvasContent = $('.pp-offcanvas-content-' + this.id),
				offCanvasBody = offCanvasContent.find( '.pp-offcanvas-body' );

			offCanvasContent.css( {
				'height': offCanvasBody.outerHeight() + 'px',
				'max-height': ( window.innerHeight ) + 'px'
			} );
		},

		_destroy: function () {
			this._close();

			this.animations.forEach(function (animation) {
				if ($('html').hasClass('pp-offcanvas-content-' + animation)) {
					$('html').removeClass('pp-offcanvas-content-' + animation)
				}
			});
		},
		
		_getTrigger: function () {
			var trigger = false;

			if (this.toggleSource == 'id' && this.toggle_id != '') {
				var toggleId = this.toggle_id.replace('#', '');
				trigger = '#' + toggleId;
			} else if (this.toggleSource == 'class' && this.toggle_class != '') {
				var toggleClass = this.toggle_class.replace('#', '');
				trigger = '.' + toggleClass;
			} else {
				trigger = '.fl-node-' + this.id + ' .pp-offcanvas-toggle';
			}

			return trigger;
		},

		_bindEvents: function () {
			var self = this;
			var trigger = this._getTrigger();
			var scrollPos = $(window).scrollTop();

			if (trigger) {
				$('body').on( 'click', trigger, this._toggleContent.bind( this ) );
			}

			// BB theme uses pushState for smooth scrolling to anchors. To ensure the off-canvas content opens when the anchor link is clicked, we need to listen to pushState event.
			const originalPushState = history.pushState;
			history.pushState = function() {
				originalPushState.apply(this, arguments);
				window.dispatchEvent(new Event('pushstate'));
				window.dispatchEvent(new Event('locationchange'));
			};

			this._onHashChange();

			$(window).on('hashchange', function(e) {
				e.preventDefault();
				window['pp_offcanvas_' + self.id]._onHashChange();
			});

			$('body').on( 'click keyup', '.pp-offcanvas-content .pp-offcanvas-close', function(e) {
				if (e.which == 1 || e.which == 13 || e.which == 32 || e.which == undefined) {
					this._close();
				}
			}.bind( this ) );

			$('body').on( 'click keyup', '.pp-offcanvas-' + this.id + '-close', function(e) {
				e.preventDefault();
				window['pp_offcanvas_' + self.id]._close();
			} );

			// Close the off-canvas panel on clicking on inner links start with hash.
			$('body').on( 'click', '.pp-offcanvas-content .pp-offcanvas-body a[href*="#"]:not([href="#"])', this._close.bind( this ) );

			// BB 2.10.x and above prevent event propagation for menu item click. So if off-canvas trigger is inside BB's menu module, we won't be able to trigger the off-canvas.
			// To fix this, we will listen to hashchange event as well which will be triggered on menu item click.
			$('body, .fl-menu').on( 'click', 'a[href*="#"]:not([href="#"])', function(e) {
				var hash = '#' + $(this).attr('href').split('#')[1];

				if ( $(hash).length > 0 && $(hash).hasClass( 'fl-node-' + self.id ) ) {
					e.stopPropagation();
					if ( ! $('html').hasClass('pp-offcanvas-content-open') ) {
						self._show();
					}
				}
			} );

			if (this.escClose === 'yes') {
				this._closeESC();
			}
			if (this.bodyClickClose === 'yes') {
				this._closeClick();
			}

			$(window).on( 'resize', this._setSize.bind( this ) );
		},

		_onHashChange: function() {
			var hash = location.hash.split('/')[0].replace('!', '');
			var self = this;

			if ( $(hash).length > 0 && $(hash).hasClass( 'fl-node-' + this.id ) ) {
				setTimeout(function() {
					if ( ! $('html').hasClass('pp-offcanvas-content-open') ) {
						self._show();
					}
				}, 200);
			}
		},

		_toggleContent: function (e) {
			e.preventDefault();

			if (!$('html').hasClass('pp-offcanvas-content-open')) {
				this._show();
			} else {
				this._close();
			}
		},

		_show: function () {
			$(document).trigger( 'pp_offcanvas_before_reveal', [ $('.pp-offcanvas-content-' + this.id) ] );

			this._previous = this._active;
			var self = this;

			// init animation class.
			$('html').addClass('pp-offcanvas-content-' + this.contentTransition);
			$('html').addClass('pp-offcanvas-content-' + this.direction);
			$('html').addClass('pp-offcanvas-content-open');
			$('html').addClass('pp-offcanvas-content-' + this.id + '-open');
			$('html').addClass('pp-offcanvas-content-reset');

			setTimeout(function() {
				$('.pp-offcanvas-content-' + self.id).addClass('pp-offcanvas-content-visible').attr('tabindex', '0');
				$('.pp-offcanvas-content-' + self.id).trigger( 'focus' );
			}, 250);

			this.button.addClass('pp-is-active');

			this._active = {
				id: this.id,
				contentTransition: this.contentTransition,
				direction: this.direction,
				$button: this.button
			};

			$(document).trigger( 'pp_offcanvas_after_reveal', [ $('.pp-offcanvas-content-' + this.id) ] );
		},

		_close: function () {
			$(document).trigger( 'pp_offcanvas_before_close', [ $('.pp-offcanvas-content-' + this.id) ] );

			var hash = location.hash.split('/')[0].replace('!', '');
			var self = this;

			$('html').removeClass('pp-offcanvas-content-open');
			$('html').removeClass('pp-offcanvas-content-' + this.id + '-open');
			setTimeout( function () {
				$('html').removeClass('pp-offcanvas-content-reset');
				$('html').removeClass('pp-offcanvas-content-' + this.contentTransition);
				$('html').removeClass('pp-offcanvas-content-' + this.direction);
				$('.pp-offcanvas-content-' + this.id).removeClass('pp-offcanvas-content-visible');
				$('.pp-offcanvas-content-' + this.id).trigger('blur');

				if ( $(hash).length > 0 && $(hash).hasClass( 'fl-node-' + this.id ) ) {
					if ( ! $('html').hasClass('pp-offcanvas-content-open') ) {
						var scrollPos = $(window).scrollTop();
						location.href = location.href.split('#')[0] + '#';
						window.scrollTo(0, scrollPos);
					}
				}
			}.bind( this ), 500);

			setTimeout( function() {
				$('.pp-offcanvas-content-' + self.id).addClass('pp-offcanvas-content-visible').attr( 'tabindex', '-1' );
			}, 250 );

			this.button.removeClass('pp-is-active');
			this._active = false;

			$(document).trigger( 'pp_offcanvas_after_close', [ $('.pp-offcanvas-content-' + this.id) ] );
		},

		_closeESC: function () {
			var self = this;

			if ('no' === self.escClose) {
				return;
			}

			// menu close on ESC key
			$(document).on('keydown', function (e) {
				if (e.keyCode === 27) { // ESC
					self._close();
				}
			});
		},

		_closeClick: function () {
			var self = this;

			if (this.toggleSource == 'id' && this.toggle_id != '') {
				$trigger = '#' + this.toggle_id;
			} else if (this.toggleSource == 'class' && this.toggle_class != '') {
				$trigger = '.' + this.toggle_class;
			} else {
				$trigger = '.pp-offcanvas-toggle';
			}

			$(document).on('click', function (e) {
				if ( $(e.target).is('.pp-offcanvas-content') || 
					$(e.target).parents('.pp-offcanvas-content').length > 0 || 
					$(e.target).is('.pp-offcanvas-toggle') || 
					$(e.target).parents('.pp-offcanvas-toggle').length > 0 || 
					$(e.target).is($trigger) || 
					$(e.target).parents($trigger).length > 0 || 
					! $(e.target).is('.pp-offcanvas-container') ) {
					return;
				} else {
					self._close();
				}
			});
		}
	};
}) (jQuery);
var pp_offcanvas_4aelkd3o69cv = '';
;(function($){

	$(function() {
		pp_offcanvas_4aelkd3o69cv = new PPOffcanvasContent({
			id:                '4aelkd3o69cv',
			direction:         'top',
			contentTransition: 'slide',
			closeButton:       'yes',
			escClose:          'yes',
			closeButton:       'yes',
			bodyClickClose:    'yes',
			toggleSource:      'hamburger',
			toggle_class:      '',
			toggle_id:         '',
			size: 			   '967',
			isBuilderActive:    false,
			innerWrapper:       true		});
	});

})(jQuery);
jQuery(function($) {
	
		$(function() {
		$( '.fl-node-vhl6buis9rjc .fl-photo-img' )
			.on( 'mouseenter', function( e ) {
				$( this ).data( 'title', $( this ).attr( 'title' ) ).removeAttr( 'title' );
			} )
			.on( 'mouseleave', function( e ){
				$( this ).attr( 'title', $( this ).data( 'title' ) ).data( 'title', null );
			} );
	});
		window._fl_string_to_slug_regex = 'a-zA-Z0-9';
});

/* Start Layout Custom JS */

/* End Layout Custom JS */

(function($){

	/**
	 * Helper class for header layout logic.
	 *
	 * @since 1.0
	 * @class FLThemeBuilderHeaderLayout
	 */
	FLThemeBuilderHeaderLayout = {

		/**
		 * A reference to the window object for this page.
		 *
		 * @since 1.0
		 * @property {Object} win
		 */
		win : null,

		/**
		 * A reference to the body object for this page.
		 *
		 * @since 1.0
		 * @property {Object} body
		 */
		body : null,

		/**
		 * A reference to the header object for this page.
		 *
		 * @since 1.0
		 * @property {Object} header
		 */
		header : null,

		/**
		 * Whether this header overlays the content or not.
		 *
		 * @since 1.0
		 * @property {Boolean} overlay
		 */
		overlay : false,

		/**
		 * Whether the page has the WP admin bar or not.
		 *
		 * @since 1.0
		 * @property {Boolean} hasAdminBar
		 */
		hasAdminBar : false,

		/**
		 * Breakpoint for when the sticky header should apply.
		 *
		 * @since 1.4
		 * @property {String} stickyOn
		 */
		stickyOn: '',

		/**
		 * A reference of the sticky and shrink header breakpoint.
		 *
		 * @since 1.2.5
		 * @property {Number} breakpointWidth
		 */
		breakpointWidth: 0,

		/**
		 * Initializes header layout logic.
		 *
		 * @since 1.0
		 * @method init
		 */
		init: function()
		{
			var editing          = $( 'html.fl-builder-edit' ).length,
				header           = $( '.fl-builder-content[data-type=header]' ),
				menuModule       = header.find( '.fl-module-menu' ),
				breakpoint       = null;

			if ( ! editing && header.length ) {

				header.imagesLoaded( $.proxy( function() {

					this.win         = $( window );
					this.body        = $( 'body' );
					this.header      = header.eq( 0 );
					this.overlay     = !! Number( header.attr( 'data-overlay' ) );
					this.hasAdminBar = !! $( 'body.admin-bar' ).length;
					this.stickyOn    = this.header.data( 'sticky-on' );
					breakpoint       = this.header.data( 'sticky-breakpoint' );

					if ( '' == this.stickyOn ) {
						if ( typeof FLBuilderLayoutConfig.breakpoints[ breakpoint ] !== undefined ) {
							this.breakpointWidth = FLBuilderLayoutConfig.breakpoints[ breakpoint ];
						}
						else {
							this.breakpointWidth = FLBuilderLayoutConfig.breakpoints.medium;
						}
					}

					if ( Number( header.attr( 'data-sticky' ) ) ) {

						this.header.data( 'original-top', this.header.offset().top );
						this.win.on( 'resize', $.throttle( 500, $.proxy( this._initSticky, this ) ) );
						this._initSticky();

					}

				}, this ) );
			}
		},

		/**
		 * Initializes sticky logic for a header.
		 *
		 * @since 1.0
		 * @access private
		 * @method _initSticky
		 */
		_initSticky: function( e )
		{
			var header     = $('.fl-builder-content[data-type=header]'),
				windowSize = this.win.width(),
				makeSticky = false;

			makeSticky = this._makeWindowSticky( windowSize );
			if ( makeSticky || ( this.breakpointWidth > 0 && windowSize >= this.breakpointWidth ) ) {
				this.win.on( 'scroll.fl-theme-builder-header-sticky', $.proxy( this._doSticky, this ) );
				//
				// Check if Event Type is 'resize' then invoke this._doSticky()
				// only if the 'fl-theme-builder-header-sticky' class is already present.
				//
				if ( e && 'resize' === e.type ) {
					if ( this.header.hasClass( 'fl-theme-builder-header-sticky' ) ) {
						this._doSticky( e );
					}
					this._adjustStickyHeaderWidth();
				}

				if ( Number( header.attr( 'data-shrink' ) ) ) {
					this.header.data( 'original-height', this.header.outerHeight() );
					this.win.on( 'resize', $.throttle( 500, $.proxy( this._initShrink, this ) ) );
					this._initShrink();
				}

				this._initFlyoutMenuFix( e );
			} else {
				this.win.off( 'scroll.fl-theme-builder-header-sticky' );
				this.win.off( 'resize.fl-theme-builder-header-sticky' );

				this.header.removeClass( 'fl-theme-builder-header-sticky' );
				this.header.removeAttr( 'style' );
				this.header.parent().css( 'padding-top', '0' );
			}
		},

		/**
		 * Check if Header should be sticky at a particular Window size.
		 *
		 * @since 1.4
		 * @access private
		 * @param  widowSize
		 * @method _makeWindowSticky
		 */
		_makeWindowSticky: function ( windowSize )
		{
			var makeSticky = false;

			switch (this.stickyOn) {
				case 'xl':
					makeSticky = windowSize > FLBuilderLayoutConfig.breakpoints['large'];
					break;
				case '': // Default
				case 'desktop':
					makeSticky = windowSize >= FLBuilderLayoutConfig.breakpoints['medium'];
					break;
				case 'desktop-medium':
					makeSticky = windowSize > FLBuilderLayoutConfig.breakpoints['small'];
					break;
				case 'large':
					makeSticky = windowSize > FLBuilderLayoutConfig.breakpoints['medium'] && windowSize <= FLBuilderLayoutConfig.breakpoints['large'];
					break;
				case 'large-medium':
					makeSticky = windowSize > FLBuilderLayoutConfig.breakpoints['small'] && windowSize <= FLBuilderLayoutConfig.breakpoints['large'];
					break;
				case 'medium':
					makeSticky = ( windowSize <= FLBuilderLayoutConfig.breakpoints['medium'] && windowSize > FLBuilderLayoutConfig.breakpoints['small'] );
					break;
				case 'medium-mobile':
					makeSticky = (windowSize <= FLBuilderLayoutConfig.breakpoints['medium']);
					break;
				case 'mobile':
					makeSticky = (windowSize <= FLBuilderLayoutConfig.breakpoints['small']);
					break;
				case 'all':
					makeSticky = true;
					break;
			}

			return makeSticky;
		},

		/**
		 * Sticks the header when the page is scrolled.
		 *
		 * @since 1.0
		 * @access private
		 * @method _doSticky
		 */
		_doSticky: function( e )
		{
			var winTop    		  = Math.floor( this.win.scrollTop() ),
				headerTop 		  = Math.floor( this.header.data( 'original-top' ) ),
				hasStickyClass    = this.header.hasClass( 'fl-theme-builder-header-sticky' ),
				hasScrolledClass  = this.header.hasClass( 'fl-theme-builder-header-scrolled' ),
				beforeHeader      = this.header.prevAll( '.fl-builder-content' ),
				bodyTopPadding    = parseInt( jQuery('body').css('padding-top') ),
				winBarHeight      = $('#wpadminbar').length ? $('#wpadminbar').outerHeight() : 0,
				headerHeight      = 0;

			if ( isNaN( bodyTopPadding ) ) {
				bodyTopPadding = 0;
			}

			if ( this.hasAdminBar && this.win.width() > 600 ) {
				winTop += Math.floor( winBarHeight );
			}

			if ( winTop > headerTop ) {
				if ( ! hasStickyClass ) {
					if ( e && ( 'scroll' === e.type || 'smartscroll' === e.type ) ) {
					 	this.header.addClass( 'fl-theme-builder-header-sticky' );
						if ( this.overlay && beforeHeader.length ) {
							this.header.css( 'top', winBarHeight);
						}
					}

					if ( ! this.overlay ) {
						this._adjustHeaderHeight();
					}
				}
			}
			else if ( hasStickyClass ) {
				this.header.removeClass( 'fl-theme-builder-header-sticky' );
				this.header.removeAttr( 'style' );
				this.header.parent().css( 'padding-top', '0' );
			}

			this._adjustStickyHeaderWidth();

			if ( winTop > headerTop ) {
				if ( ! hasScrolledClass ) {
					this.header.addClass( 'fl-theme-builder-header-scrolled' );
				}
			} else if ( hasScrolledClass ) {
				this.header.removeClass( 'fl-theme-builder-header-scrolled' );
			}

			this._flyoutMenuFix( e );
		},

		/**
		 * Initializes flyout menu fixes on sticky header.
		 *
		 * @since 1.4.1
		 * @method _initFlyoutMenuFix
		 */
		_initFlyoutMenuFix: function( e ) {
			var header       = this.header,
				menuModule   = header.closest( '.fl-menu' ),
				flyoutMenu   = menuModule.find( '.fl-menu-mobile-flyout' ),
				isPushMenu   = menuModule.hasClass( 'fl-menu-responsive-flyout-push' ) || menuModule.hasClass( 'fl-menu-responsive-flyout-push-opacity' ),
				isOverlay    = menuModule.hasClass( 'fl-menu-responsive-flyout-overlay' ),
				flyoutPos    = menuModule.hasClass( 'fl-flyout-right' ) ? 'right' : 'left',
				flyoutParent = header.parent().is( 'header' ) ? header.parent().parent() : header.parent();
				isFullWidth  = this.win.width() === header.width(),
				flyoutLayout = '',
				activePos    = 250,
				headerPos    = 0;

			if ( ! flyoutMenu.length ) {
				return;
			}

			if ( this.win.width() > header.parent().width() ) {
				headerPos = ( this.win.width() - header.width() ) / 2;
			}

			if ( isOverlay ) {
				activePos = headerPos;
			}
			else if ( isPushMenu ) {
				activePos = activePos + headerPos;
			}
			flyoutMenu.data( 'activePos', activePos );

			if ( isPushMenu ) {
				flyoutLayout = 'push-' + flyoutPos;
			}
			else if ( isOverlay ) {
				flyoutLayout = 'overlay-' + flyoutPos;
			}

			if ( isPushMenu && ! $( 'html' ).hasClass( 'fl-theme-builder-has-flyout-menu' ) ) {
				$( 'html' ).addClass( 'fl-theme-builder-has-flyout-menu' );
			}

			if ( ! flyoutParent.hasClass( 'fl-theme-builder-flyout-menu-' + flyoutLayout ) ) {
				flyoutParent.addClass( 'fl-theme-builder-flyout-menu-' + flyoutLayout );
			}

			if ( ! header.hasClass( 'fl-theme-builder-flyout-menu-overlay' ) && isOverlay ) {
				header.addClass( 'fl-theme-builder-flyout-menu-overlay' );
			}

			if ( ! header.hasClass( 'fl-theme-builder-header-full-width' ) && isFullWidth ) {
			   header.addClass( 'fl-theme-builder-header-full-width' );
		    }
			else if ( ! isFullWidth ) {
				header.removeClass( 'fl-theme-builder-header-full-width' );
			}

			menuModule.on( 'click', '.fl-menu-mobile-toggle', $.proxy( function( event ){
				if ( menuModule.find( '.fl-menu-mobile-toggle.fl-active' ).length ) {
					$( 'html' ).addClass( 'fl-theme-builder-flyout-menu-active' );
					event.stopImmediatePropagation();
				}
				else {
					$( 'html' ).removeClass( 'fl-theme-builder-flyout-menu-active' );
				}

				this._flyoutMenuFix( event );
			}, this ) );
		},

		/**
		 * Fix flyout menu inside the sticky header.
		 *
		 * @since 1.4.1
		 * @method _flyoutMenuFix
		 */
		_flyoutMenuFix: function( e ){
			var header      = this.header,
			    menuModule  = $( e.target ).closest( '.fl-menu' ),
				flyoutMenu  = menuModule.find( '.fl-menu-mobile-flyout' ),
				flyoutPos   = menuModule.hasClass( 'fl-flyout-right' ) ? 'right' : 'left',
				menuOpacity = menuModule.find( '.fl-menu-mobile-opacity' ),
				isScroll    = 'undefined' !== typeof e && 'scroll' === e.handleObj.type,
				activePos   = 'undefined' !== typeof flyoutMenu.data( 'activePos' ) ? flyoutMenu.data( 'activePos' ) : 0,
				headerPos   = ( this.win.width() - header.width() ) / 2,
				inactivePos = headerPos > 0 ? activePos + 4 : 254;

			if ( ! flyoutMenu.length ) {
				return;
			}

			if ( this.overlay ) {
				return;
			}

			if( $( '.fl-theme-builder-flyout-menu-active' ).length ) {

				if ( isScroll && ! flyoutMenu.hasClass( 'fl-menu-disable-transition' ) ) {
					flyoutMenu.addClass( 'fl-menu-disable-transition' );
				}

				if ( header.hasClass( 'fl-theme-builder-header-sticky' ) ) {
					if ( ! isScroll ) {
						setTimeout( $.proxy( function(){
							flyoutMenu.css( flyoutPos, '-' + activePos + 'px' );
						}, this ), 1 );
					}
					else {
						flyoutMenu.css( flyoutPos, '-' + activePos + 'px' );
					}
				}
				else {
					flyoutMenu.css( flyoutPos, '0px' );
				}
			}
			else {
				if ( flyoutMenu.hasClass( 'fl-menu-disable-transition' ) ) {
					flyoutMenu.removeClass( 'fl-menu-disable-transition' );
				}

				if ( header.hasClass( 'fl-theme-builder-flyout-menu-overlay' ) && headerPos > 0 && headerPos < 250 ) {
					if ( header.hasClass( 'fl-theme-builder-header-sticky' ) ) {
						inactivePos = headerPos + 254;
					}
					else {
						inactivePos = 254;
					}
				}

				if ( e && e.type === 'resize' ) {
					inactivePos = headerPos + 254;
				}

				flyoutMenu.css( flyoutPos, '-' + inactivePos + 'px' );
			}

			if ( e && menuModule.is('.fl-menu-responsive-flyout-overlay') && $.infinitescroll ) {
				e.stopImmediatePropagation();
			}

			if( menuOpacity.length ) {
				if ( header.hasClass( 'fl-theme-builder-header-sticky' ) ) {
					if ( '0px' === menuOpacity.css( 'left' ) ) {
						menuOpacity.css( 'left', '-' + headerPos + 'px' );
					}
				}
				else {
					menuOpacity.css( 'left', '' );
				}
			}
		},

		/**
		 * Adjust sticky header width if BB Theme Boxed Layout is used.
		 *
		 * @since 1.4
		 * @access private
		 * @method _adjustStickyHeaderWidth
		 */
		_adjustStickyHeaderWidth: function () {
			if ( $('body').hasClass( 'fl-fixed-width' ) ) {
				var parentWidth = this.header.parent().width();

				// Better if this is set in the stylesheet file.
				if ( this.win.width() >= 992 ) {
					this.header.css({
						'margin': '0 auto',
						'max-width': parentWidth,
					});
				}
				else {
					this.header.css({
						'margin': '',
						'max-width': '',
					});
				}
			}
		},

		/**
		 * Adjust Sticky Header Height
		 *
		 * @since 1.4
		 * @access private
		 * @method _adjustHeaderHeight
		 */
		_adjustHeaderHeight: function () {
			var beforeHeader = this.header.prevAll('.fl-builder-content'),
				beforeHeaderHeight = 0,
				beforeHeaderFix = 0,
				headerHeight = Math.floor( this.header.outerHeight() ),
				bodyTopPadding = parseInt( $( 'body' ).css( 'padding-top' ) ),
				wpAdminBarHeight = 0,
				totalHeaderHeight = 0;

			if ( isNaN( bodyTopPadding ) ) {
				bodyTopPadding = 0;
			}

			if ( beforeHeader.length ) {
				$.each( beforeHeader, function() {
					beforeHeaderHeight += Math.floor( $(this).outerHeight() );
				});
				// Subtract this value from the header parent's top padding.
				beforeHeaderFix = 2;
			}

			if ( this.hasAdminBar && this.win.width() <= 600 ) {
				wpAdminBarHeight = Math.floor( $('#wpadminbar').outerHeight() );
			}

			totalHeaderHeight = Math.floor( beforeHeaderHeight + headerHeight);

			if ( headerHeight > 0 ) {
				var headerParent = this.header.parent(),
					headerParentTopPadding = 0;

				// If the header's parent container is the BODY tag ignore its top padding.
				if ( $( headerParent ).is('body') ) {
					headerParentTopPadding = Math.floor( headerHeight - wpAdminBarHeight );
				} else {
					headerParentTopPadding = Math.floor( headerHeight - bodyTopPadding - wpAdminBarHeight );
				}

				$( headerParent ).css( 'padding-top',  ( headerParentTopPadding - beforeHeaderFix ) + 'px' );

				this.header.css({
					'-webkit-transform': 'translate(0px, -' + totalHeaderHeight + 'px)',
					'-ms-transform': 'translate(0px, -' + totalHeaderHeight + 'px)',
					'transform': 'translate(0px, -' + totalHeaderHeight + 'px)'
				});

			}

		},

		/**
		 * Initializes shrink logic for a header.
		 *
		 * @since 1.0
		 * @access private
		 * @method _initShrink
		 */
		_initShrink: function( e )
		{
			if ( this.win.width() >= this.breakpointWidth ) {
				this.win.on( 'scroll.fl-theme-builder-header-shrink', $.proxy( this._doShrink, this ) );
				this._setImageMaxHeight();

				if ( this.win.scrollTop() > 0 ){
					this._doShrink();
				}

			} else {
				this.header.parent().css( 'padding-top', '0' );
				this.win.off( 'scroll.fl-theme-builder-header-shrink' );
				this._removeShrink();
				this._removeImageMaxHeight();
			}
		},

		/**
		 * Shrinks the header when the page is scrolled.
		 *
		 * @since 1.0
		 * @access private
		 * @method _doShrink
		 */
		_doShrink: function( e )
		{
			var winTop 			  = this.win.scrollTop(),
				headerTop 		  = this.header.data('original-top'),
				headerHeight 	  = this.header.data('original-height'),
				shrinkImageHeight = this.header.data('shrink-image-height'),
				windowSize   	  = this.win.width(),
				makeSticky   	  = this._makeWindowSticky( windowSize ),
				hasClass     	  = this.header.hasClass( 'fl-theme-builder-header-shrink' );


			if ( this.hasAdminBar ) {
				winTop += 32;
			}

			if ( makeSticky && ( winTop > headerTop + headerHeight ) ) {
				if ( ! hasClass ) {

					this.header.addClass( 'fl-theme-builder-header-shrink' );

					// Shrink images but don't include lightbox and menu images.
					this.header.find('img').each( function( i ) {
						var image           = $( this ),
							maxMegaMenu     = image.closest( '.max-mega-menu' ).length,
							imageInLightbox = image.closest( '.fl-button-lightbox-content' ).length,
							imageInNavMenu  = image.closest( 'li.menu-item' ).length;

						if ( ! ( imageInLightbox || imageInNavMenu || maxMegaMenu ) ) {
							image.css( 'max-height', shrinkImageHeight );
						}

					});

					this.header.find( '.fl-row-content-wrap' ).each( function() {

						var row = $( this );

						if ( parseInt( row.css( 'padding-bottom' ) ) > 5 ) {
							row.addClass( 'fl-theme-builder-header-shrink-row-bottom' );
						}

						if ( parseInt( row.css( 'padding-top' ) ) > 5 ) {
							row.addClass( 'fl-theme-builder-header-shrink-row-top' );
						}
					} );

					this.header.find( '.fl-module' ).each( function() {

						var module = $( this ).find( '.fl-module-content' ).length ? $( this ).find( '.fl-module-content' ) : $( this );

						if ( parseInt( module.css( 'margin-bottom' ) ) > 5 ) {
							module.addClass( 'fl-theme-builder-header-shrink-module-bottom' );
						}

						if ( parseInt( module.css( 'margin-top' ) ) > 5 ) {
							module.addClass( 'fl-theme-builder-header-shrink-module-top' );
						}
					} );
				}
			} else if (hasClass) {
				this.header.find( 'img' ).css( 'max-height', '' );
				this._removeShrink();
			}

			// Fixes Shrink header issue with BB Theme when window is scrolled then resized and back.
			if ( 'undefined' === typeof( e ) && $('body').hasClass( 'fl-fixed-width' ) ) {
				if ( ! this.overlay ) {
					this._adjustHeaderHeight();
				}
			}

		},

		/**
		 * Removes the header shrink effect.
		 *
		 * @since 1.0
		 * @access private
		 * @method _removeShrink
		 */
		_removeShrink: function()
		{
			var rows    = this.header.find( '.fl-row-content-wrap' ),
				modules = this.header.find('.fl-module, .fl-module-content');

			rows.removeClass( 'fl-theme-builder-header-shrink-row-bottom' );
			rows.removeClass( 'fl-theme-builder-header-shrink-row-top' );
			modules.removeClass( 'fl-theme-builder-header-shrink-module-bottom' );
			modules.removeClass( 'fl-theme-builder-header-shrink-module-top' );
			this.header.removeClass( 'fl-theme-builder-header-shrink' );
		},

		/**
		 * Adds max height to images in modules for smooth scrolling.
		 *
		 * @since 1.1.1
		 * @access private
		 * @method _setImageMaxHeight
		 */
		_setImageMaxHeight: function()
		{
			var head = $( 'head' ),
				stylesId = 'fl-header-styles-' + this.header.data( 'post-id' ),
				styles = '',
				images = this.header.find( '.fl-module img' );

			if ( $( '#' + stylesId ).length ) {
				return;
			}

			images.each( function( i ) {
				var image           = $( this ),
					height          = image.height(),
					node            = image.closest( '.fl-module' ).data( 'node' ),
					className       = 'fl-node-' + node + '-img-' + i,
					maxMegaMenu     = image.closest( '.max-mega-menu' ).length,
					imageInLightbox = image.closest( '.fl-button-lightbox-content' ).length,
					imageInNavMenu  = image.closest( 'li.menu-item' ).length;

				if ( ! ( imageInLightbox || imageInNavMenu || maxMegaMenu  ) ) {
					image.addClass( className );
					styles += '.' + className + ' { max-height: ' + ( height ? height : image[0].height )  + 'px }';
				}

			} );

			if ( '' !== styles ) {
				head.append( '<style id="' + stylesId + '">' + styles + '</style>' );
			}
		},

		/**
		 * Removes max height on images in modules for smooth scrolling.
		 *
		 * @since 1.1.1
		 * @access private
		 * @method _removeImageMaxHeight
		 */
		_removeImageMaxHeight: function()
		{
			$( '#fl-header-styles-' + this.header.data( 'post-id' ) ).remove();
		},
	};

	$( function() { FLThemeBuilderHeaderLayout.init(); } );

})(jQuery);

jQuery(function($) {
	
		$(function() {
		$( '.fl-node-y0cq79iw3g4r .fl-photo-img' )
			.on( 'mouseenter', function( e ) {
				$( this ).data( 'title', $( this ).attr( 'title' ) ).removeAttr( 'title' );
			} )
			.on( 'mouseleave', function( e ){
				$( this ).attr( 'title', $( this ).data( 'title' ) ).data( 'title', null );
			} );
	});
		window._fl_string_to_slug_regex = 'a-zA-Z0-9';
});
(function($) {
	if ( $('.fl-node-9a5r08elz7h1 .pp-photo-rollover').length > 0 ) {
		$('body').on( 'mouseenter.pp-rollover', '.fl-node-9a5r08elz7h1 .pp-photo-rollover .pp-photo-content', function() {
			$(this).addClass( 'is-hover' );
		} ).on( 'mouseleave.pp-rollover', '.fl-node-9a5r08elz7h1 .pp-photo-rollover .pp-photo-content', function() {
			$(this).removeClass( 'is-hover' );
		} );
	}
})(jQuery);(function($){
	})(jQuery);
(function($){
	})(jQuery);

/* Start Layout Custom JS */

/* End Layout Custom JS */


