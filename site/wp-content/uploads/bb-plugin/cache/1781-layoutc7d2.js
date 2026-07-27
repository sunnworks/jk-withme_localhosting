var wpAjaxUrl = 'https://www.jk-withme.com/wp-admin/admin-ajax.php';var flBuilderUrl = 'https://www.jk-withme.com/wp-content/plugins/bb-plugin/';var FLBuilderLayoutConfig = {
	anchorLinkAnimations : {
		duration 	: 1000,
		easing		: 'swing',
		offset 		: 100
	},
	paths : {
		pluginUrl : 'https://www.jk-withme.com/wp-content/plugins/bb-plugin/',
		wpAjaxUrl : 'https://www.jk-withme.com/wp-admin/admin-ajax.php'
	},
	breakpoints : {
		small  : 768,
		medium : 992,
		large : 1200	},
	waypoint: {
		offset: 80
	},
	emptyColWidth: '0%'
};
(function($){

	if(typeof FLBuilderLayout != 'undefined') {
		return;
	}

	/**
	 * Helper class with generic logic for a builder layout.
	 *
	 * @class FLBuilderLayout
	 * @since 1.0
	 */
	FLBuilderLayout = {

		/**
		 * Initializes a builder layout.
		 *
		 * @since 1.0
		 * @method init
		 */
		init: function()
		{
			// Destroy existing layout events.
			FLBuilderLayout._destroy();

			// Init CSS classes.
			FLBuilderLayout._initClasses();

			// Init backgrounds.
			FLBuilderLayout._initBackgrounds();

			// Init buttons.
			FLBuilderLayout._initButtons();

			// Init row shape layer height.
			FLBuilderLayout._initRowShapeLayerHeight();

			// Only init if the builder isn't active.
			if ( 0 === $('.fl-builder-edit').length ) {

				// Init anchor links.
				FLBuilderLayout._initAnchorLinks();

				// Init the browser hash.
				FLBuilderLayout._initHash();

				// Init forms.
				FLBuilderLayout._initForms();

				FLBuilderLayout._reorderMenu();
			}
			else {
				FLBuilderLayout._initNestedColsWidth();
			}
			$('body').removeClass( 'fl-no-js' );
		},

		/**
		 * Public method for refreshing Wookmark or MosaicFlow galleries
		 * within an element.
		 *
		 * @since 1.7.4
		 * @method refreshGalleries
		 */
		refreshGalleries: function( element )
		{
			var $element  = 'undefined' == typeof element ? $( 'body' ) : $( element ),
				mfContent = $element.find( '.fl-mosaicflow-content' ),
				wmContent = $element.find( '.fl-gallery' ),
				mfObject  = null;

			if ( mfContent ) {

				mfObject = mfContent.data( 'mosaicflow' );

				if ( mfObject ) {
					mfObject.columns = $( [] );
					mfObject.columnsHeights = [];
					mfContent.data( 'mosaicflow', mfObject );
					mfContent.mosaicflow( 'refill' );
				}
			}
			if ( wmContent ) {
				wmContent.trigger( 'refreshWookmark' );
			}
		},

		/**
		 * Public method for refreshing Masonry within an element
		 *
		 * @since 1.8.1
		 * @method refreshGridLayout
		 */
		refreshGridLayout: function( element )
		{
			var $element 		= 'undefined' == typeof element ? $( 'body' ) : $( element ),
				msnryContent	= $element.find('.masonry');

			if ( msnryContent.length )	{
				msnryContent.masonry('layout');
			}
		},

		/**
		 * Public method for reloading BxSlider within an element
		 *
		 * @since 1.8.1
		 * @method reloadSlider
		 */
		reloadSlider: function( content )
		{
			var $content = 'undefined' == typeof content ? $('body') : $(content);

			// reload sliders.
			if ($content.find('.bx-viewport > div').length > 0) {
				$.each($content.find('.bx-viewport > div'), function (key, slider) {
					setTimeout(function () {
						$(slider).data('bxSlider').reloadSlider();
					}, 100);
				});
			}
		},

		/**
		 * Public method for resizing WP audio player
		 *
		 * @since 1.8.2
		 * @method resizeAudio
		 */
		resizeAudio: function( element )
		{
			var $element 	 	= 'undefined' == typeof element ? $( 'body' ) : $( element ),
				audioPlayers 	= $element.find('.wp-audio-shortcode.mejs-audio'),
				player 		 	= null,
				mejsPlayer 	 	= null,
				rail 			= null,
				railWidth 		= 400;

			if ( audioPlayers.length && typeof mejs !== 'undefined' ) {
            	audioPlayers.each(function(){
	            	player 		= $(this);
	            	mejsPlayer 	= mejs.players[player.attr('id')];
	            	rail 		= player.find('.mejs-controls .mejs-time-rail');
	            	var innerMejs = player.find('.mejs-inner'),
	            		total 	  = player.find('.mejs-controls .mejs-time-total');

	            	if ( typeof mejsPlayer !== 'undefined' ) {
	            		railWidth = Math.ceil(player.width() * 0.8);

	            		if ( innerMejs.length ) {

		            		rail.css('width', railWidth +'px!important');
		            		//total.width(rail.width() - 10);

		            		mejsPlayer.options.autosizeProgress = true;

		            		// webkit has trouble doing this without a delay
							setTimeout(function () {
								mejsPlayer.setControlsSize();
							}, 50);

			            	player.find('.mejs-inner').css({
			            		visibility: 'visible',
			            		height: 'inherit'
			            	});
		            	}
		           	}
	            });
	        }
		},

		/**
		 * Public method for preloading WP audio player when it's inside the hidden element
		 *
		 * @since 1.8.2
		 * @method preloadAudio
		 */
		preloadAudio: function(element)
		{
			var $element 	 = 'undefined' == typeof element ? $( 'body' ) : $( element ),
				contentWrap  = $element.closest('.fl-accordion-item'),
				audioPlayers = $element.find('.wp-audio-shortcode.mejs-audio');

			if ( ! contentWrap.hasClass('fl-accordion-item-active') && audioPlayers.find('.mejs-inner').length ) {
				audioPlayers.find('.mejs-inner').css({
					visibility : 'hidden',
					height: 0
				});
			}
		},

		/**
		 * Public method for resizing slideshow momdule within the tab
		 *
		 * @since 1.10.5
		 * @method resizeSlideshow
		 */
		resizeSlideshow: function(){
			if(typeof YUI !== 'undefined') {
				YUI().use('node-event-simulate', function(Y) {
					Y.one(window).simulate("resize");
				});
			}
		},

		/**
		 * Public method for reloading an embedded Google Map within the tabs or hidden element.
		 *
		 * @since 2.2
		 * @method reloadGoogleMap
		 */
		reloadGoogleMap: function(element){
			var $element  = 'undefined' == typeof element ? $( 'body' ) : $( element ),
			    googleMap = $element.find( 'iframe[src*="google.com/maps"]' );

			if ( googleMap.length ) {
			    googleMap.attr( 'src', function(i, val) {
			        return val;
			    });
			}
		},

		/**
		 * Unbinds builder layout events.
		 *
		 * @since 1.0
		 * @access private
		 * @method _destroy
		 */
		_destroy: function()
		{
			var win = $(window);

			win.off('scroll.fl-bg-parallax');
			win.off('resize.fl-bg-video');
		},

		/**
		 * Checks to see if the current device has touch enabled.
		 *
		 * @since 1.0
		 * @access private
		 * @method _isTouch
		 * @return {Boolean}
		 */
		_isTouch: function()
		{
			if(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
				return true;
			}

			return false;
		},

		/**
		 * Checks to see if the current device is mobile.
		 *
		 * @since 1.7
		 * @access private
		 * @method _isMobile
		 * @return {Boolean}
		 */
		_isMobile: function()
		{
			return /Mobile|Android|Silk\/|Kindle|BlackBerry|Opera Mini|Opera Mobi|webOS/i.test( navigator.userAgent );
		},

		/**
		 * Initializes builder body classes.
		 *
		 * @since 1.0
		 * @access private
		 * @method _initClasses
		 */
		_initClasses: function()
		{
			var body = $( 'body' ),
				ua   = navigator.userAgent;

			// Add the builder body class (skip on block-only frontend to avoid layout break).
			if ( ! body.hasClass( 'fl-builder-blocks-only' ) && ! body.hasClass( 'archive' ) && $( '.fl-builder-content-primary' ).length > 0 ) {
				body.addClass('fl-builder');
			}

			// Add the builder touch body class.
			if(FLBuilderLayout._isTouch()) {
				body.addClass('fl-builder-touch');
			}

			// Add the builder mobile body class.
			if(FLBuilderLayout._isMobile()) {
				body.addClass('fl-builder-mobile');
			}

			if ( $(window).width() < FLBuilderLayoutConfig.breakpoints.small ) {
				body.addClass( 'fl-builder-breakpoint-small' );
			}

			if ( $(window).width() > FLBuilderLayoutConfig.breakpoints.small && $(window).width() < FLBuilderLayoutConfig.breakpoints.medium ) {
				body.addClass( 'fl-builder-breakpoint-medium' );
			}

			if ( $(window).width() > FLBuilderLayoutConfig.breakpoints.medium && $(window).width() < FLBuilderLayoutConfig.breakpoints.large ) {
				body.addClass( 'fl-builder-breakpoint-large' );
			}

			if ( $(window).width() > FLBuilderLayoutConfig.breakpoints.large ) {
				body.addClass( 'fl-builder-breakpoint-default' );
			}

			// IE11 body class.
			if ( ua.indexOf( 'Trident/7.0' ) > -1 && ua.indexOf( 'rv:11.0' ) > -1 ) {
				body.addClass( 'fl-builder-ie-11' );
			}
		},

		/**
		 * Initializes builder node backgrounds that require
		 * additional JavaScript logic such as parallax.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _initBackgrounds
		 */
		_initBackgrounds: function()
		{
			var win = $(window);

			// Init parallax backgrounds.
			if($('.fl-row-bg-parallax').length > 0 && !FLBuilderLayout._isMobile()) {
				FLBuilderLayout._scrollParallaxBackgrounds();
				FLBuilderLayout._initParallaxBackgrounds();
				win.on('resize.fl-bg-parallax', FLBuilderLayout._initParallaxBackgrounds);
				win.on('scroll.fl-bg-parallax', FLBuilderLayout._scrollParallaxBackgrounds);
			}

			// Init video backgrounds.
			if($('.fl-bg-video').length > 0) {
				FLBuilderLayout._initBgVideos();
				FLBuilderLayout._resizeBgVideos();

				// Ensure FLBuilderLayout._resizeBgVideos() is only called once on window resize.
				var resizeBGTimer = null;
				win.on('resize.fl-bg-video', function(e){
					clearTimeout( resizeBGTimer );
					resizeBGTimer = setTimeout(function() {
						FLBuilderLayout._resizeBgVideos(e);
					}, 100 );
				});
			}
		},

		/**
		 * Initializes all buttons in a layout.
		 *
		 * @since 2.10
		 * @access private
		 * @method _initButtons
		 */
		_initButtons: function()
		{
			// Trigger click event on Enter or Space key press for deprecated button markup.
			$('a.fl-button[role="button"]').on('keydown', function(event) {
				if (event.key === 'Enter' || event.key === ' ') {
					// Necessary to prevent the default behavior of the space key from scrolling the page
					event.preventDefault();
					$(this).trigger('click');
				}
			});
		},

		/**
		 * Initializes all parallax backgrounds in a layout.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _initParallaxBackgrounds
		 */
		_initParallaxBackgrounds: function()
		{
			$('.fl-row-bg-parallax').each(FLBuilderLayout._initParallaxBackground);
		},

		/**
		 * Initializes a single parallax background.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _initParallaxBackgrounds
		 */
		_initParallaxBackground: function()
		{
			var row     = $(this),
				content = row.find('> .fl-row-content-wrap'),
				winWidth = $(window).width(),
				screenSize = '',
				imageSrc = {
					default: '',
					medium: '',
					responsive: '',
				};

			imageSrc.default = row.data('parallax-image') || '';
			imageSrc.medium = row.data('parallax-image-medium') || imageSrc.default;
			imageSrc.responsive = row.data('parallax-image-responsive') || imageSrc.medium;

			if (winWidth > FLBuilderLayoutConfig.breakpoints.medium) {
				screenSize = 'default';
			} else if (winWidth > FLBuilderLayoutConfig.breakpoints.small && winWidth <= FLBuilderLayoutConfig.breakpoints.medium ) {
				screenSize = 'medium';
			} else if (winWidth <= FLBuilderLayoutConfig.breakpoints.small) {
				screenSize = 'responsive';
			}

			content.css('background-image', 'url(' + imageSrc[screenSize] + ')');
			row.data('current-image-loaded', screenSize );

		},

		/**
		 * Fires when the window is scrolled to adjust
		 * parallax backgrounds.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _scrollParallaxBackgrounds
		 */
		_scrollParallaxBackgrounds: function()
		{
			$('.fl-row-bg-parallax').each(FLBuilderLayout._scrollParallaxBackground);
		},

		/**
		 * Fires when the window is scrolled to adjust
		 * a single parallax background.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _scrollParallaxBackground
		 */
		_scrollParallaxBackground: function()
		{
			var win     	  = $(window),
				row     	  = $(this),
				content 	  = row.find('> .fl-row-content-wrap'),
				speed   	  = row.data('parallax-speed'),
				offset  	  = content.offset(),
				yPos		  = -((win.scrollTop() - offset.top) / speed),
				initialOffset = ( row.data('parallax-offset') != null ) ? row.data('parallax-offset') : 0,
				totalOffset   = yPos - initialOffset;

			content.css('background-position', 'center ' + totalOffset + 'px');
		},

		/**
		 * Initializes all video backgrounds.
		 *
		 * @since 1.6.3.3
		 * @access private
		 * @method _initBgVideos
		 */
		_initBgVideos: function()
		{
			$('.fl-bg-video').each(FLBuilderLayout._initBgVideo);
		},

		/**
		 * Initializes a video background.
		 *
		 * @since 1.6.3.3
		 * @access private
		 * @method _initBgVideo
		 */
		_initBgVideo: function()
		{
			var wrap   = $( this ),
				width       = wrap.data( 'width' ),
				height      = wrap.data( 'height' ),
				mp4         = wrap.data( 'mp4' ),
				youtube     = wrap.data( 'youtube'),
				vimeo       = wrap.data( 'vimeo'),
				mp4Type     = wrap.data( 'mp4-type' ),
				webm        = wrap.data( 'webm' ),
				webmType    = wrap.data( 'webm-type' ),
				fallback    = wrap.data( 'fallback' ),
				loaded      = wrap.data( 'loaded' ),
				videoMobile = wrap.data( 'video-mobile' ),
				playPauseButton = wrap.find('.fl-bg-video-play-pause-control'),
				fallbackTag = '',
				videoTag    = null,
				mp4Tag      = null,
				webmTag     = null;

			// Return if the video has been loaded for this row.
			if ( loaded ) {
				return;
			}

			videoTag  = $( '<video autoplay loop muted playsinline></video>' );

			/**
			 * Add poster image (fallback image)
			 */
			if( 'undefined' != typeof fallback && '' != fallback ) {
				videoTag.attr( 'poster', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' )
				videoTag.css({
					backgroundImage: 'url("' + fallback + '")',
					backgroundColor: 'transparent',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
					backgroundPosition: 'center center',
				})
			}

			// MP4 Source Tag
			if ( 'undefined' != typeof mp4 && '' != mp4 ) {

				mp4Tag = $( '<source />' );
				mp4Tag.attr( 'src', mp4 );
				mp4Tag.attr( 'type', mp4Type );

				videoTag.append( mp4Tag );
			}
			// WebM Source Tag
			if ( 'undefined' != typeof webm && '' != webm ) {

				webmTag = $( '<source />' );
				webmTag.attr( 'src', webm );
				webmTag.attr( 'type', webmType );

				videoTag.append( webmTag );
			}

			// This is either desktop, or mobile is enabled.
			if ( ! FLBuilderLayout._isMobile() || ( FLBuilderLayout._isMobile() && "yes" == videoMobile ) ) {
				if ( 'undefined' != typeof youtube ) {
					FLBuilderLayout._initYoutubeBgVideo.apply( this );
				}
				else if ( 'undefined' != typeof vimeo ) {
					FLBuilderLayout._initVimeoBgVideo.apply( this );
				}
				else {
					wrap.append( videoTag );

					if ( playPauseButton.length > 0 ) {
						var video = videoTag[0];

						playPauseButton.on( 'click', { video: video }, function(e) {
							var video = e.data.video;

							if ( video.paused ) {
								video.play();
							} else {
								video.pause();
							}
						} );

						$( video ).on( 'play playing', function () {
							playPauseButton.removeClass( 'fa-play' ).addClass( 'fa-pause' );
						} );
						
						$( video ).on( 'pause ended waiting', function () {
							playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
						} );
					}
				}
			}
			else {
				// if we are here, it means we are on mobile and NO is set so remove video src and use fallback
				videoTag.attr('src', '')
				wrap.append( videoTag );
			}

			// Mark this video as loaded.
			wrap.data('loaded', true);
		},

		/**
		 * Initializes Youtube video background
		 *
		 * @since 1.9
		 * @access private
		 * @method _initYoutubeBgVideo
		 */
		_initYoutubeBgVideo: function()
		{
			var playerWrap  = $(this),
				videoId     = playerWrap.data('video-id'),
				videoPlayer = playerWrap.find('.fl-bg-video-player'),
				enableAudio = playerWrap.data('enable-audio'),
				audioButton = playerWrap.find('.fl-bg-video-audio'),
				playPauseButton = playerWrap.find('.fl-bg-video-play-pause-control'),
				startTime   = 'undefined' !== typeof playerWrap.data('start') ? playerWrap.data('start') : 0,
				startTime   = 'undefined' !== typeof playerWrap.data('t') && startTime === 0 ? playerWrap.data('t') : startTime,
				endTime     = 'undefined' !== typeof playerWrap.data('end') ? playerWrap.data('end') : 0,
				loop        = 'undefined' !== typeof playerWrap.data('loop') ? playerWrap.data('loop') : 1,
				stateCount  = 0,
				player,fallback_showing;

			if ( videoId ) {
				fallback = playerWrap.data('fallback') || false
				if( fallback ) {
					playerWrap.find('iframe').remove()
					fallbackTag = $( '<div></div>' );
					fallbackTag.addClass( 'fl-bg-video-fallback' );
					fallbackTag.css( 'background-image', 'url(' + playerWrap.data('fallback') + ')' );
					fallbackTag.css( 'background-size', 'cover' );
					fallbackTag.css( 'transition', 'background-image 1s')
					playerWrap.append( fallbackTag );
					fallback_showing = true;
				}
				FLBuilderLayout._onYoutubeApiReady( function( YT ) {
					setTimeout( function() {

						player = new YT.Player( videoPlayer[0], {
							videoId: videoId,
							events: {
								onReady: function(event) {
									if ( "no" === enableAudio || FLBuilderLayout._isMobile() ) {
										event.target.mute();
									}
									else if ( "yes" === enableAudio && event.target.isMuted ) {
										event.target.unMute();
									}

									// Store an instance to a parent
									playerWrap.data('YTPlayer', player);
									FLBuilderLayout._resizeYoutubeBgVideo.apply(playerWrap);

									// Queue the video.
									event.target.playVideo();

									if ( audioButton.length > 0 && ! FLBuilderLayout._isMobile() ) {
										audioButton.on( 'click', {button: audioButton, player: player}, FLBuilderLayout._toggleBgVideoAudio );
									}

									if ( playPauseButton.length > 0 ) {
										playPauseButton.on( 'click', {player: player}, function(e) {
											var player = e.data.player;
			
											if ( 1 === player.getPlayerState() ) {
												player.pauseVideo();
											} else {
												player.playVideo();
											}
										});
									}
								},
								onStateChange: function( event ) {

									if ( event.data === 1 ) {
										if ( fallback_showing ) {
											$( '.fl-bg-video-fallback' ).css( 'background-image', 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)' )
										}
									}
									// Manual check if video is not playable in some browsers.
									// StateChange order: [-1, 3, -1]
									if ( stateCount < 4 ) {
										stateCount++;
									}

									// Comply with the audio policy in some browsers like Chrome and Safari.
									if ( stateCount > 1 && -1 === event.data && "yes" === enableAudio ) {
										player.mute();
										player.playVideo();
										audioButton.show();
									}

									if ( event.data === YT.PlayerState.ENDED && 1 === loop ) {
										if ( startTime > 0 ) {
											player.seekTo( startTime );
										}
										else {
											player.playVideo();
										}
									}

									if ( event.data === YT.PlayerState.PLAYING ) {
										playPauseButton.removeClass( 'fa-play' ).addClass( 'fa-pause' );
									} else if ( event.data === YT.PlayerState.PAUSED ) {
										playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
									} else if ( event.data === YT.PlayerState.BUFFERING ) {
										playPauseButton.removeClass( 'fa-play' ).addClass( 'fa-pause' );
									} else if ( event.data === YT.PlayerState.CUED ) {
										playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
									} else if ( event.data === YT.PlayerState.ENDED ) {
										playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
									}
								},
								onError: function(event) {
									console.info('YT Error: ' + event.data)
									FLBuilderLayout._onErrorYoutubeVimeo(playerWrap)
								}
							},
							playerVars: {
								playsinline: FLBuilderLayout._isMobile() ? 1 : 0,
								controls: 0,
								showinfo: 0,
								rel : 0,
								start: startTime,
								end: endTime,
							}
						} );
					}, 1 );
				} );
			}
		},

		/**
		 * On youtube or vimeo error show the fallback image if available.
		 * @since 2.0.7
		 */
		_onErrorYoutubeVimeo: function(playerWrap) {

			fallback = playerWrap.data('fallback') || false
			if( ! fallback ) {
				return false;
			}
			playerWrap.find('iframe').remove()
			fallbackTag = $( '<div></div>' );
			fallbackTag.addClass( 'fl-bg-video-fallback' );
			fallbackTag.css( 'background-image', 'url(' + playerWrap.data('fallback') + ')' );
			playerWrap.append( fallbackTag );
		},

		/**
		 * Check if Youtube API has been downloaded
		 *
		 * @since 1.9
		 * @access private
		 * @method _onYoutubeApiReady
		 * @param  {Function} callback Method to call when YT API has been loaded
		 */
		_onYoutubeApiReady: function( callback ) {
			if ( window.YT && YT.loaded ) {
				callback( YT );
			} else {
				// If not ready check again by timeout..
				setTimeout( function() {
					FLBuilderLayout._onYoutubeApiReady( callback );
				}, 350 );
			}
		},

		/**
		 * Initializes Vimeo video background
		 *
		 * @since 1.9
		 * @access private
		 * @method _initVimeoBgVideo
		 */
		_initVimeoBgVideo: function()
		{
			var playerWrap	= $(this),
				videoId 	= playerWrap.data('video-id'),
				videoHash 	= playerWrap.data('video-hash'),
				videoPlayer = playerWrap.find('.fl-bg-video-player'),
				enableAudio = playerWrap.data('enable-audio'),
				audioButton = playerWrap.find('.fl-bg-video-audio'),
				playPauseButton = playerWrap.find('.fl-bg-video-play-pause-control'),
				playerState = '',
				player,
				width = playerWrap.outerWidth(),
				ua    = navigator.userAgent;

			if ( typeof Vimeo !== 'undefined' && videoId )	{
				
				const vimOptions = {
					loop       : true,
					title      : false,
					portrait   : false,
					background : true,
					autopause  : false,
					muted      : true,
				};

				if ( videoHash.length ) {
					vimOptions.url = `https://player.vimeo.com/video/${ videoId }?h=${ videoHash }`;
				} else {
					vimOptions.id = videoId;
				}

				player = new Vimeo.Player(videoPlayer[0], vimOptions );
				playerWrap.data('VMPlayer', player);
				if ( "no" === enableAudio ) {
					player.setVolume(0);
				}
				else if ("yes" === enableAudio ) {
					// Chrome, Safari, Firefox have audio policy restrictions for autoplay videos.
					if ( ua.indexOf("Safari") > -1 || ua.indexOf("Chrome") > -1 || ua.indexOf("Firefox") > -1 ) {
						player.setVolume(0);
						audioButton.show();
					}
					else {
						player.setVolume(1);
					}
				}

				player.play().catch(function(error) {
					FLBuilderLayout._onErrorYoutubeVimeo(playerWrap)
				});

				if ( audioButton.length > 0 ) {
					audioButton.on( 'click', {button: audioButton, player: player}, FLBuilderLayout._toggleBgVideoAudio );
				}

				player.on( 'play', function() {
					playerState = 'play';
					playPauseButton.removeClass( 'fa-play' ).addClass( 'fa-pause' );
				} );
				player.on( 'pause', function() {
					playerState = 'pause';
					playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
				} );
				player.on( 'ended', function() {
					playerState = 'ended';
					playPauseButton.removeClass( 'fa-pause' ).addClass( 'fa-play' );
				} );
				player.on( 'bufferstart', function() {
					playerState = 'bufferstart';
					playPauseButton.removeClass( 'fa-play' ).addClass( 'fa-pause' );
				} );

				if ( playPauseButton.length > 0 ) {
					playPauseButton.on( 'click', { player: player }, function( e ) {
						var player = e.data.player;

						if ( playerState === 'play' ) {
							player.pause();
						} else {
							player.play();
						}
					} );
				}
			}
		},

		/**
		 * Mute / unmute audio on row's video background.
		 * It works for both Youtube and Vimeo.
		 *
		 * @since 2.1.3
		 * @access private
		 * @method _toggleBgVideoAudio
		 * @param {Object} e Method arguments
		 */
		_toggleBgVideoAudio: function( e ) {
			var player  = e.data.player,
			    control = e.data.button.find('.fl-audio-control');

			if ( control.hasClass( 'fa-volume-off' ) ) {
				// Unmute
				control
					.removeClass( 'fa-volume-off' )
					.addClass( 'fa-volume-up' );
				e.data.button.find( '.fa-times' ).hide();

				if ( 'function' === typeof player.unMute ) {
					player.unMute();
				}
				else {
					player.setVolume( 1 );
				}
			}
			else {
				// Mute
				control
					.removeClass( 'fa-volume-up' )
					.addClass( 'fa-volume-off' );
				e.data.button.find( '.fa-times' ).show();

				if ( 'function' === typeof player.unMute ) {
					player.mute();
				}
				else {
					player.setVolume( 0 );
				}
			}
		},

		/**
		 * Fires when there is an error loading a video
		 * background source and shows the fallback.
		 *
		 * @since 1.6.3.3
		 * @access private
		 * @method _videoBgSourceError
		 * @param {Object} e An event object
		 * @deprecated 2.0.3
		 */
		_videoBgSourceError: function( e )
		{
			var source 		= $( e.target ),
				wrap   		= source.closest( '.fl-bg-video' ),
				vid		    = wrap.find( 'video' ),
				fallback  	= wrap.data( 'fallback' ),
				fallbackTag = '';
			source.remove();

			if ( vid.find( 'source' ).length ) {
				// Don't show the fallback if we still have other sources to check.
				return;
			} else if ( '' !== fallback ) {
				fallbackTag = $( '<div></div>' );
				fallbackTag.addClass( 'fl-bg-video-fallback' );
				fallbackTag.css( 'background-image', 'url(' + fallback + ')' );
				wrap.append( fallbackTag );
				vid.remove();
			}
		},

		/**
		 * Fires when the window is resized to resize
		 * all video backgrounds.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _resizeBgVideos
		 */
		_resizeBgVideos: function()
		{
			$('.fl-bg-video').each( function() {

				FLBuilderLayout._resizeBgVideo.apply( this );

				if ( $( this ).parent().find( 'img' ).length > 0 ) {
					$( this ).parent().imagesLoaded( $.proxy( FLBuilderLayout._resizeBgVideo, this ) );
				}
			} );
		},

		/**
		 * Fires when the window is resized to resize
		 * a single video background.
		 *
		 * @since 1.1.4
		 * @access private
		 * @method _resizeBgVideo
		 */
		_resizeBgVideo: function()
		{
			if ( 0 === $( this ).find( 'video' ).length && 0 === $( this ).find( 'iframe' ).length ) {
				return;
			}

			var wrap        = $(this),
				wrapHeight  = wrap.outerHeight(),
				wrapWidth   = wrap.outerWidth(),
				vid         = wrap.find('video'),
				vidHeight   = wrap.data('height'),
				vidWidth    = wrap.data('width'),
				newWidth    = wrapWidth,
				newHeight   = Math.round(vidHeight * wrapWidth/vidWidth),
				newLeft     = 0,
				newTop      = 0,
				iframe 		= wrap.find('iframe'),
				isRowFullHeight = $(this).closest('.fl-row-bg-video').hasClass('fl-row-full-height'),
				vidCSS          = {
					top:       '50%',
					left:      '50%',
					transform: 'translate(-50%,-50%)',
				};

			if ( vid.length ) {
				if(vidHeight === '' || typeof vidHeight === 'undefined' || vidWidth === '' || typeof vidWidth === 'undefined') {
					vid.css({
						'left'      : '0px',
						'top'       : '0px',
						'width'     : newWidth + 'px'
					});

					// Try to set the actual video dimension on 'loadedmetadata' when using URL as video source
					vid.on('loadedmetadata', FLBuilderLayout._resizeOnLoadedMeta);

					return;
				}

				if ( ! isRowFullHeight ) {
					if ( newHeight < wrapHeight ) {
						newHeight = wrapHeight;
						newLeft   = -((newWidth - wrapWidth) / 2);
						newWidth  = vidHeight ? Math.round(vidWidth * wrapHeight/vidHeight) : newWidth;
					}
					else {
						newTop = -((newHeight - wrapHeight)/2);
					}
					vidCSS = {
						left   : newLeft + 'px',
						top    : newTop + 'px',
						height : newHeight + 'px',
						width  : newWidth + 'px',
					}
				}

				vid.css( vidCSS );

			}
			else if ( iframe.length ) {

				// Resize Youtube video player within iframe tag
				if ( typeof wrap.data('youtube') !== 'undefined' ) {
					FLBuilderLayout._resizeYoutubeBgVideo.apply(this);
				}
			}
		},

		/**
		 * Fires when video meta has been loaded.
		 * This will be Triggered when width/height attributes were not specified during video background resizing.
		 *
		 * @since 1.8.5
		 * @access private
		 * @method _resizeOnLoadedMeta
		 */
		_resizeOnLoadedMeta: function(){
			var video 		= $(this),
				wrapHeight 	= video.parent().outerHeight(),
				wrapWidth 	= video.parent().outerWidth(),
				vidWidth 	= video[0].videoWidth,
				vidHeight 	= video[0].videoHeight,
				newHeight   = Math.round(vidHeight * wrapWidth/vidWidth),
				newWidth    = wrapWidth,
				newLeft     = 0,
				newTop 		= 0;

			if(newHeight < wrapHeight) {
				newHeight   = wrapHeight;
				newWidth    = Math.round(vidWidth * wrapHeight/vidHeight);
				newLeft     = -((newWidth - wrapWidth)/2);
			}
			else {
				newTop      = -((newHeight - wrapHeight)/2);
			}

			video.parent().data('width', vidWidth);
			video.parent().data('height', vidHeight);

			video.css({
				'left'      : newLeft + 'px',
				'top'       : newTop + 'px',
				'width'     : newWidth + 'px',
				'height' 	: newHeight + 'px'
			});
		},

		/**
		 * Fires when the window is resized to resize
		 * a single Youtube video background.
		 *
		 * @since 1.9
		 * @access private
		 * @method _resizeYoutubeBgVideo
		 */
		_resizeYoutubeBgVideo: function()
		{
			var wrap				= $(this),
				wrapWidth 			= wrap.outerWidth(),
				wrapHeight 			= wrap.outerHeight(),
				player 				= wrap.data('YTPlayer'),
				video 				= player ? player.getIframe() : null,
				aspectRatioSetting 	= '16:9', // Medium
				aspectRatioArray 	= aspectRatioSetting.split( ':' ),
				aspectRatio 		= aspectRatioArray[0] / aspectRatioArray[1],
				ratioWidth 			= wrapWidth / aspectRatio,
				ratioHeight 		= wrapHeight * aspectRatio,
				isWidthFixed 		= wrapWidth / wrapHeight > aspectRatio,
				width 				= isWidthFixed ? wrapWidth : ratioHeight,
				height 				= isWidthFixed ? ratioWidth : wrapHeight;

			if ( video ) {
				$(video).width( width ).height( height );
			}
		},

		/**
		 * Opens a tab or accordion item if the browser hash is set
		 * to the ID of one on the page.
		 *
		 * @since 1.6.0
		 * @access private
		 * @method _initHash
		 */
		_initHash: function()
		{
			var hash 			= window.location.hash.replace( '#', '' ).split( '/' ).shift(),
				element 		= null,
				tabs			= null,
				responsiveLabel	= null,
				tabIndex		= null,
				label			= null;

			if ( '' !== hash ) {

				try {

					element = $( '#' + hash );

					if ( element.length > 0 ) {

						if ( element.hasClass( 'fl-accordion-item' ) ) {
							setTimeout( function() {
								element.find( '.fl-accordion-button' ).trigger( 'click' );
							}, 100 );
						}
						if ( element.hasClass( 'fl-tabs-panel' ) ) {
							setTimeout( function() {
								tabs 			= element.closest( '.fl-tabs' );
								responsiveLabel = element.find( '.fl-tabs-panel-label' );
								tabIndex 		= responsiveLabel.data( 'index' );
								label 			= tabs.find( '.fl-tabs-labels .fl-tabs-label[data-index=' + tabIndex + ']' );

								label[0].click();
								FLBuilderLayout._scrollToElement(element);
							}, 100 );
						}
					}
				}
				catch( e ) {}
			}
		},

		/**
		 * Initializes all anchor links on the page for smooth scrolling.
		 *
		 * @since 1.4.9
		 * @access private
		 * @method _initAnchorLinks
		 */
		_initAnchorLinks: function()
		{
			$( 'a, [role="link"]' ).each( FLBuilderLayout._initAnchorLink );
		},

		/**
		 * Initializes a single anchor link for smooth scrolling.
		 *
		 * @since 1.4.9
		 * @access private
		 * @method _initAnchorLink
		 */
		_initAnchorLink: function()
		{
			var link    = $( this ),
				href    = link.data( 'url' ) ? link.data( 'url' ) : link.attr( 'href' ),
				target  = link.data( 'url' ) ? new URL( href, window.location.href ) : this,
				loc     = window.location,
				id      = null,
				element = null,
				flNode  = false;

			if ( 'undefined' != typeof href && href.indexOf( '#' ) > -1 && link.closest('svg').length < 1 ) {

				if ( loc.pathname.replace( /^\//, '' ) == target.pathname.replace( /^\//, '' ) && loc.hostname == target.hostname ) {

					try {

						id      = href.split( '#' ).pop();
						// If there is no ID then we have nowhere to look
						// Fixes a quirk in jQuery and FireFox
						if( ! id ) {
							return;
						}
						element = $( '#' + id );

						if ( element.length > 0 ) {
							flNode = element.hasClass( 'fl-row' ) || element.hasClass( 'fl-col' ) || element.hasClass( 'fl-module' );
							if ( !element.hasClass( 'fl-no-scroll' ) && ( link.hasClass( 'fl-scroll-link' ) || flNode ) ) {
								$( link ).on( 'click', FLBuilderLayout._scrollToElementOnLinkClick );
							}
							if ( element.hasClass( 'fl-accordion-item' ) ) {
								$( link ).on( 'click', FLBuilderLayout._scrollToAccordionOnLinkClick );
							}
							if ( element.hasClass( 'fl-tabs-panel' ) ) {
								$( link ).on( 'click', FLBuilderLayout._scrollToTabOnLinkClick );
							}
						}
					}
					catch( e ) {}
				}
			}
		},

		/**
		 * Scrolls to an element when an anchor link is clicked.
		 *
		 * @since 1.4.9
		 * @access private
		 * @method _scrollToElementOnLinkClick
		 * @param {Object} e An event object.
		 * @param {Function} callback A function to call when the scroll is complete.
		 */
		_scrollToElementOnLinkClick: function( e, callback )
		{
			var attribute = $( this ).data( 'url' ) ? $( this ).data( 'url' ) : $( this ).attr( 'href' );
			var element = $( '#' + attribute.split( '#' ).pop() );

			FLBuilderLayout._scrollToElement( element, callback );

			e.preventDefault();
		},

		/**
		 * Scrolls to an element.
		 *
		 * @since 1.6.4.5
		 * @access private
		 * @method _scrollToElement
		 * @param {Object} element The element to scroll to.
		 * @param {Function} callback A function to call when the scroll is complete.
		 */
		_scrollToElement: function( element, callback )
		{
			var config  = FLBuilderLayoutConfig.anchorLinkAnimations,
				dest    = 0,
				win     = $( window ),
				doc     = $( document );

			if ( element.length > 0 ) {

				if ( 'fixed' === element.css('position') || 'fixed' === element.parent().css('position') ) {
					dest = element.position().top;
				}
				else if ( element.offset().top > doc.height() - win.height() ) {
					dest = doc.height() - win.height();
				}
				else {
					dest = element.offset().top - config.offset;
				}

				$( 'html, body' ).stop( true ).animate( { scrollTop: dest }, config.duration, config.easing, function() {

					if ( 'undefined' != typeof callback ) {
						callback();
					}

					if ( undefined != element.attr( 'id' ) && window.location.hash !== '#' + element.attr( 'id' ) ) {

						var firefox_version = window.navigator.userAgent.match( /Firefox\/(\d+)\./ ),
							firefox_version = firefox_version ? parseInt( firefox_version[1], 10 ) : null;

						if ( firefox_version !== null && firefox_version < 135 ) {
							window.location.hash = element.attr( 'id' );
						} else {
							if ( history.pushState ) {
								history.pushState( null, null, '#' + element.attr( 'id' ) );
							} else {
								window.location.hash = element.attr( 'id' );
							}
						}
					}
				} );
			}
		},

		/**
		 * Scrolls to an accordion item when a link is clicked.
		 *
		 * @since 1.5.9
		 * @access private
		 * @method _scrollToAccordionOnLinkClick
		 * @param {Object} e An event object.
		 */
		_scrollToAccordionOnLinkClick: function( e )
		{
			var element = $( '#' + $( this ).attr( 'href' ).split( '#' ).pop() );

			if ( element.length > 0 ) {

				var callback = function() {
					if ( element ) {
						element.find( '.fl-accordion-button' ).trigger( 'click' );
						element = false;
					}
				};

				FLBuilderLayout._scrollToElementOnLinkClick.call( this, e, callback );
			}
		},

		/**
		 * Scrolls to a tab panel when a link is clicked.
		 *
		 * @since 1.5.9
		 * @access private
		 * @method _scrollToTabOnLinkClick
		 * @param {Object} e An event object.
		 */
		_scrollToTabOnLinkClick: function( e )
		{
			var element 		= $( '#' + $( this ).attr( 'href' ).split( '#' ).pop() ),
				tabs			= null,
				label   		= null,
				responsiveLabel = null;

			if ( element.length > 0 ) {

				tabs 			= element.closest( '.fl-tabs' );
				responsiveLabel = element.find( '.fl-tabs-panel-label' );
				tabIndex 		= responsiveLabel.data( 'index' );
				label 			= tabs.find( '.fl-tabs-labels .fl-tabs-label[data-index=' + tabIndex + ']' );

				if ( responsiveLabel.is( ':visible' ) ) {

					var callback = function() {
						if ( element ) {
							responsiveLabel.trigger( $.Event( 'click', { which: 1 } ) );
						}
					};

					FLBuilderLayout._scrollToElementOnLinkClick.call( this, e, callback );
				}
				else {
					label[0].click();
					FLBuilderLayout._scrollToElement( element );
				}

				e.preventDefault();
			}
		},

		/**
		 * Initializes all builder forms on a page.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _initForms
		 */
		_initForms: function()
		{
			if ( ! FLBuilderLayout._hasPlaceholderSupport ) {
				$( '.fl-form-field input' ).each( FLBuilderLayout._initFormFieldPlaceholderFallback );
			}

			$( '.fl-form-field input' ).on( 'focus', FLBuilderLayout._clearFormFieldError );
		},

		/**
		 * Checks to see if the current device has HTML5
		 * placeholder support.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _hasPlaceholderSupport
		 * @return {Boolean}
		 */
		_hasPlaceholderSupport: function()
		{
			var input = document.createElement( 'input' );

			return 'undefined' != input.placeholder;
		},

		/**
		 * Initializes the fallback for when placeholders aren't supported.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _initFormFieldPlaceholderFallback
		 */
		_initFormFieldPlaceholderFallback: function()
		{
			var field       = $( this ),
				val         = field.val(),
				placeholder = field.attr( 'placeholder' );

			if ( 'undefined' != placeholder && '' === val ) {
				field.val( placeholder );
				field.on( 'focus', FLBuilderLayout._hideFormFieldPlaceholderFallback );
				field.on( 'blur', FLBuilderLayout._showFormFieldPlaceholderFallback );
			}
		},

		/**
		 * Hides a fallback placeholder on focus.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _hideFormFieldPlaceholderFallback
		 */
		_hideFormFieldPlaceholderFallback: function()
		{
			var field       = $( this ),
				val         = field.val(),
				placeholder = field.attr( 'placeholder' );

			if ( val == placeholder ) {
				field.val( '' );
			}
		},

		/**
		 * Shows a fallback placeholder on blur.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _showFormFieldPlaceholderFallback
		 */
		_showFormFieldPlaceholderFallback: function()
		{
			var field       = $( this ),
				val         = field.val(),
				placeholder = field.attr( 'placeholder' );

			if ( '' === val ) {
				field.val( placeholder );
			}
		},

		/**
		 * Clears a form field error message.
		 *
		 * @since 1.5.4
		 * @access private
		 * @method _clearFormFieldError
		 */
		_clearFormFieldError: function()
		{
			var field = $( this );

			field.removeAttr( 'aria-invalid' );
			field.removeClass( 'fl-form-error' );
			const message = field.attr('aria-describedby');
			message ? $( '#' + message ).hide() : field.siblings( '.fl-form-error-message' ).hide();
		},

		/**
		 * Init Row Shape Layer's height.
		 *
		 * @since 2.5.3
		 * @access private
		 * @method _initRowShapeLayerHeight
		 */
		_initRowShapeLayerHeight: function () {
			FLBuilderLayout._adjustRowShapeLayerHeight();
			$( window ).on( 'resize', FLBuilderLayout._adjustRowShapeLayerHeight );
		},

		/**
		 * Set parent column width of nested columns when it's zero or blank.
		 *
		 * @since 2.7.4
		 * @access private
		 * @method _initNestedColsWidth
		 */
		_initNestedColsWidth: function()
		{
			var nestedCols = $( '.fl-col-has-cols' );

			if ( nestedCols.length <= 0 ) {
				return;
			}

			$( nestedCols ).each( function(index, col ){
				if ( $( col ).width() <= 0 ) {
					$( col ).css( 'width', FLBuilderLayoutConfig.emptyColWidth );
				}
			});
		},

		/**
		 * Adjust Row Shape Layer's height to fix to remove the fine line that appears on certain screen sizes.
		 *
		 * @since 2.5.3
		 * @access private
		 * @method _adjustRowShapeLayerHeight
		 */
		_adjustRowShapeLayerHeight: function() {
			var rowShapeLayers = $('.fl-builder-shape-layer');

			$( rowShapeLayers ).each(function (index) {
				var rowShapeLayer = $(this),
					shape = $(rowShapeLayer).find('svg'),
					height = shape.height(),
					excludeShapes = '.fl-builder-shape-circle, .fl-builder-shape-dot-cluster, .fl-builder-shape-topography, .fl-builder-shape-rect';

				if ( ! rowShapeLayer.is( excludeShapes ) ) {
					$(shape).css('height', Math.ceil( height ) );
				}
			});
		},
		_string_to_slug: function( str ) {
			str = str.replace(/^\s+|\s+$/g, ''); // trim
			if ( 'undefined' == typeof window._fl_string_to_slug_regex ) {
				regex = new RegExp('[^a-zA-Z0-9\'":() !.,-_|]', 'g');
			} else {
				regex = new RegExp('[^' + window._fl_string_to_slug_regex + '\'":\(\) !.,-_|\\\p{Letter}]', 'ug');
			}
			str = str.replace(regex, '') // remove invalid chars
				.replace(/\s+/g, ' '); // collapse whitespace and replace by a space
			return str;
		},
		_reorderMenu: function() {
			if ( $('#wp-admin-bar-fl-builder-frontend-edit-link-default li').length > 1 ) {
					$( '#wp-admin-bar-fl-builder-frontend-duplicate-link' )
					.appendTo('#wp-admin-bar-fl-builder-frontend-edit-link-default')
					.css( 'padding-top', '5px' )
					.css( 'border-top', '2px solid #1D2125' )
					.css( 'margin-top', '5px' )
				}
		}
	};

	/* Initializes the builder layout. */
	$(function(){
		FLBuilderLayout.init();
	});

})(jQuery);
(function($){

	if(typeof FLBuilderLayoutModules !== 'undefined') {
		return;
	}

	/**
	 * Helper class with generic logic for builder modules.
	 * If generic module code needs to work in both the block
	 * editor and builder, it should go here. Otherwise, it
	 * should go on FLBuilderLayout.
	 *
	 * @since 2.9
	 */
	FLBuilderLayoutModules = {

		/**
		 * Initializes builder module logic.
		 *
		 * @since 2.9
		 * @method init
		 */
		init: function()
		{
			// Only init if the builder isn't active.
			if ( 0 === $('.fl-builder-edit').length ) {

				// Init module animations.
				FLBuilderLayoutModules._initModuleAnimations();
			}
		},

		/**
		 * Initializes module animations.
		 *
		 * @since 1.1.9
		 * @access private
		 * @method _initModuleAnimations
		 */
		_initModuleAnimations: function()
		{
			if(typeof jQuery.fn.waypoint !== 'undefined') {
				$('.fl-animation').each( function() {
					var node = $( this ),
						nodeTop = node.offset().top,
						winHeight = $( window ).height(),
						bodyHeight = $( 'body' ).height(),
						waypoint = FLBuilderLayoutConfig.waypoint,
						offset = '80%';

					if ( typeof waypoint.offset !== undefined ) {
						offset = FLBuilderLayoutConfig.waypoint.offset + '%';
					}

					if ( bodyHeight - nodeTop < winHeight * 0.2 ) {
						offset = '100%';
					}

					node.waypoint({
						offset: offset,
						handler: FLBuilderLayoutModules._doModuleAnimation
					});
				} );
			}
		},

		/**
		 * Runs a module animation.
		 *
		 * @since 1.1.9
		 * @access private
		 * @method _doModuleAnimation
		 */
		_doModuleAnimation: function()
		{
			var module = 'undefined' == typeof this.element ? $(this) : $(this.element),
				delay = parseFloat(module.data('animation-delay')),
				duration = parseFloat(module.data('animation-duration'));

			if ( ! isNaN( duration ) ) {
				module.css( 'animation-duration', duration + 's' );
			}

			if(!isNaN(delay) && delay > 0) {
				setTimeout(function(){
					module.addClass('fl-animated');
				}, delay * 1000);
			} else {
				setTimeout(function(){
					module.addClass('fl-animated');
				}, 1);
			}
		}
	};

	/* Initializes builder module logic. */
	$(function(){
		FLBuilderLayoutModules.init();
	});

})(jQuery);

/* Start Global JS */

/* End Global JS */


;/**
 * This file should contain frontend logic for 
 * all module instances.
 */(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-abiozxv0gl84 .pp-heading-separator, .fl-node-abiozxv0gl84 .pp-heading').removeClass('pp-center');
        $('.fl-node-abiozxv0gl84 .pp-heading-separator, .fl-node-abiozxv0gl84 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-abiozxv0gl84 .pp-heading-separator, .fl-node-abiozxv0gl84 .pp-heading').removeClass('pp-center');
        $('.fl-node-abiozxv0gl84 .pp-heading-separator, .fl-node-abiozxv0gl84 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($){
	})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-a07jm1vlfzbx .pp-heading-separator, .fl-node-a07jm1vlfzbx .pp-heading').removeClass('pp-center');
        $('.fl-node-a07jm1vlfzbx .pp-heading-separator, .fl-node-a07jm1vlfzbx .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-a07jm1vlfzbx .pp-heading-separator, .fl-node-a07jm1vlfzbx .pp-heading').removeClass('pp-center');
        $('.fl-node-a07jm1vlfzbx .pp-heading-separator, .fl-node-a07jm1vlfzbx .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-uncz6rvt9kqj .pp-heading-separator, .fl-node-uncz6rvt9kqj .pp-heading').removeClass('pp-left');
        $('.fl-node-uncz6rvt9kqj .pp-heading-separator, .fl-node-uncz6rvt9kqj .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-uncz6rvt9kqj .pp-heading-separator, .fl-node-uncz6rvt9kqj .pp-heading').removeClass('pp-left');
        $('.fl-node-uncz6rvt9kqj .pp-heading-separator, .fl-node-uncz6rvt9kqj .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-395elfohiszk .pp-heading-separator, .fl-node-395elfohiszk .pp-heading').removeClass('pp-left');
        $('.fl-node-395elfohiszk .pp-heading-separator, .fl-node-395elfohiszk .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-395elfohiszk .pp-heading-separator, .fl-node-395elfohiszk .pp-heading').removeClass('pp-left');
        $('.fl-node-395elfohiszk .pp-heading-separator, .fl-node-395elfohiszk .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-aeu1sqb35nhi .pp-heading-separator, .fl-node-aeu1sqb35nhi .pp-heading').removeClass('pp-left');
        $('.fl-node-aeu1sqb35nhi .pp-heading-separator, .fl-node-aeu1sqb35nhi .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-aeu1sqb35nhi .pp-heading-separator, .fl-node-aeu1sqb35nhi .pp-heading').removeClass('pp-left');
        $('.fl-node-aeu1sqb35nhi .pp-heading-separator, .fl-node-aeu1sqb35nhi .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

;(function($) {

	PPAnimatedHeadlines = function( settings ) {
		if ( $( '.fl-node-' + settings.id ).length === 0 ) {
			return;
		}

		this.settings           = settings;
		this.nodeClass          = '.fl-node-' + settings.id;
		this.headline			= this.nodeClass + ' .pp-headline';
		this.headlineText 		= $( this.nodeClass + ' .pp-animated-headlines' ).attr( 'data-text' );
		this.headlineText 		= this.headlineText.replaceAll( "\\'", "'" );
		this.dynamicWrapper		= this.nodeClass + ' .pp-headline-dynamic-wrapper';
		this.animationDelay     = settings.durations.animationDelay;
		// letters effect
		this.lettersDelay		= settings.durations.lettersDelay;
		// typing effect
		this.typeLettersDelay	= settings.durations.typeLettersDelay;
		this.selectionDuration	= settings.durations.selectionDuration;
		// clip effect
		this.revealDuration		= settings.durations.revealDuration,
		this.revealAnimationDelay = settings.durations.revealAnimationDelay;

		this.typeAnimationDelay = this.selectionDuration + 800;

		this.highlightAnimationDuration = settings.durations.highlightAnimationDuration;
		this.highlightAnimationDelay = settings.durations.highlightAnimationDelay;

		this.classes			= {
			dynamicText: 'pp-headline-dynamic-text',
			dynamicLetter: 'pp-headline-dynamic-letter',
			textActive: 'pp-headline-text-active',
			textInactive: 'pp-headline-text-inactive',
			letters: 'pp-headline-letters',
			animationIn: 'pp-headline-animation-in',
			typeSelected: 'pp-headline-typing-selected',
			activateHighlight: 'pp-headline-animated',
      		hideHighlight: 'pp-headline-hide-highlight'
		};

		this.elements			= {};
		this.isInitialized 		= false;
		this.observer 			= null;

		this._destroy();

		$( window ).on( 'load', this._activateScrollListener.bind( this ) );
	};

  	PPAnimatedHeadlines.prototype = {
	    settings        		: {},
	    nodeClass       		: '',
	    headline				: '',
		dynamicWrapper			: '',
		animationDelay			: 2500,
		lettersDelay			: 50,
		typeLettersDelay		: 150,
		selectionDuration		: 500,
		revealDuration			: 600,
		revealAnimationDelay	: 1500,
		highlightAnimationDuration: 2500,
		highlightAnimationDelay: 8000,

		svgPaths: {
			circle: [ 'M325,18C228.7-8.3,118.5,8.3,78,21C22.4,38.4,4.6,54.6,5.6,77.6c1.4,32.4,52.2,54,142.6,63.7 c66.2,7.1,212.2,7.5,273.5-8.3c64.4-16.6,104.3-57.6,33.8-98.2C386.7-4.9,179.4-1.4,126.3,20.7' ],
			curly: [ 'M3,146.1c17.1-8.8,33.5-17.8,51.4-17.8c15.6,0,17.1,18.1,30.2,18.1c22.9,0,36-18.6,53.9-18.6 c17.1,0,21.3,18.5,37.5,18.5c21.3,0,31.8-18.6,49-18.6c22.1,0,18.8,18.8,36.8,18.8c18.8,0,37.5-18.6,49-18.6c20.4,0,17.1,19,36.8,19 c22.9,0,36.8-20.6,54.7-18.6c17.7,1.4,7.1,19.5,33.5,18.8c17.1,0,47.2-6.5,61.1-15.6' ],
			strikethrough: ['M3,75h493.5'],
			underline: [ 'M7.7,145.6C109,125,299.9,116.2,401,121.3c42.1,2.2,87.6,11.8,87.3,25.7' ],
			underline_zigzag: [ 'M9.3,127.3c49.3-3,150.7-7.6,199.7-7.4c121.9,0.4,189.9,0.4,282.3,7.2C380.1,129.6,181.2,130.6,70,139 c82.6-2.9,254.2-1,335.9,1.3c-56,1.4-137.2-0.3-197.1,9' ],
			diagonal: ['M13.5,15.5c131,13.7,289.3,55.5,475,125.5'],
			double: ['M8.4,143.1c14.2-8,97.6-8.8,200.6-9.2c122.3-0.4,287.5,7.2,287.5,7.2', 'M8,19.4c72.3-5.3,162-7.8,216-7.8c54,0,136.2,0,267,7.8'],
			double_underline: ['M5,125.4c30.5-3.8,137.9-7.6,177.3-7.6c117.2,0,252.2,4.7,312.7,7.6', 'M26.9,143.8c55.1-6.1,126-6.3,162.2-6.1c46.5,0.2,203.9,3.2,268.9,6.4'],
			x: ['M497.4,23.9C301.6,40,155.9,80.6,4,144.4', 'M14.1,27.6c204.5,20.3,393.8,74,467.3,111.7']
		},

		_initHeadlines: function() {
			this._fillWords();

			if ( 'rotate' === this.settings.headline_style && ! this.isInitialized ) {
				this._rotateHeadline();
			}

			this.isInitialized = true;
		},

		_fillWords: function() {
			var classes 		= this.classes,
				dynamicWrapper 	= $(this.dynamicWrapper),
				settings		= this.settings;

			if ( 'rotate' == this.settings.headline_style ) {
				dynamicWrapper.html( '' );

				var rotatingText = this.headlineText.split('|');

				rotatingText.forEach( function( word, index ) {
					var dynamicText = $('<span>', { 'class': classes.dynamicText, 'data-index': index }).html( word.replace( / /g, '&nbsp;' ) );

					if ( ! index ) {
						dynamicText.addClass( classes.textActive );
					}

					dynamicWrapper.append( dynamicText );
				} );
			} else {
				this._addHighlight();
				this._activateHighlightAnimation();
			}

			this.elements.dynamicText = dynamicWrapper.children( '.' + classes.dynamicText );
		},

		_addHighlight: function() {
			var svg = $('<svg>', {
				xmlns: 'http://www.w3.org/2000/svg',
				viewBox: '0 0 500 150',
				preserveAspectRatio: 'none',
				'aria-hidden': true
			}).html(this._getSvgPaths( this.settings.headline_shape ));

			if ( $(this.dynamicWrapper).find('.' + this.classes.dynamicText).length > 0 ) {
				$(this.dynamicWrapper).append( svg[0].outerHTML );
			}
		},

		_activateHighlightAnimation: function() {
			var $headline = $(this.headline);
			$headline.removeClass( this.classes.hideHighlight ).addClass( this.classes.activateHighlight );
			if ( ! this.settings.loop ) {
				return;
			}
			// remove animation class and hide highlight after animation is done,
			// then re-activate animation after a delay to create a loop effect.
			setTimeout(function() {
				$headline.removeClass( this.classes.activateHighlight ).addClass( this.classes.hideHighlight );
			}.bind(this), this.highlightAnimationDuration + this.highlightAnimationDelay * .8);
			setTimeout(function() {
				this._activateHighlightAnimation();
			}.bind(this), this.highlightAnimationDuration + this.highlightAnimationDelay);
		},

		_rotateHeadline: function() {
			//insert <span> element for each letter of a changing word
			if ( $(this.headline).hasClass( this.classes.letters ) ) {
				this._singleLetters();
			}

			//initialise headline animation
			this._animateHeadline();
		},

		_singleLetters: function() {
			var classes = this.classes;

			this.elements.dynamicText.each( function() {
				var $word = $( this ),
					letters = $word.text().split( '' ),
					isActive = $word.hasClass( classes.textActive );

				$word.empty();

				letters.forEach( function( letter ) {
					var $letter = jQuery( '<span>', { 'class': classes.dynamicLetter } ).text( letter );

					if ( isActive ) {
						$letter.addClass( classes.animationIn );
					}

					$word.append( $letter );
				} );

				$word.css( 'opacity', 1 );
			} );
		},

		_animateHeadline: function() {
			var self 			= this,
				animationType 	= self.settings.animation_type,
				dynamicWrapper 	= $(self.dynamicWrapper);

			if ( 'clip' === animationType ) {
				dynamicWrapper.width( dynamicWrapper.width() + 10 );
			} else if ( 'typing' !== animationType ) {
				//assign to .pp-headline-dynamic-wrapper the width of its longest word
				self._setWidth();
			}

			//trigger animation
			setTimeout( function() {
				self._hideWord( self.elements.dynamicText.eq( 0 ) );
			}, self.animationDelay );
		},

		_showLetter: function( $letter, $word, bool, duration ) {
			var self 			= this,
				classes 		= self.classes,
				animationType 	= self.settings.animation_type;

			$letter.addClass( classes.animationIn );

			if ( ! $letter.is( ':last-child' ) ) {
				setTimeout( function() {
					self._showLetter( $letter.next(), $word, bool, duration );
				}, duration );
			} else {
				if ( ! bool ) {
					setTimeout( function() {
						self._hideWord( $word );
					}, self.animationDelay );
				}
			}
		},

		_hideLetter: function( $letter, $word, bool, duration ) {
			var self = this;

			$letter.removeClass( self.classes.animationIn );

			if ( ! $letter.is( ':last-child' ) ) {
				setTimeout( function() {
					self._hideLetter( $letter.next(), $word, bool, duration );
				}, duration );
			} else if ( bool ) {
				setTimeout( function() {
					self._hideWord( self._getNextWord( $word ) );
				}, self.animationDelay );
			}
		},

		_showWord: function( $word, duration ) {
			var self 			= this,
				animationType 	= self.settings.animation_type;

			if ( 'typing' === animationType ) {
				self._showLetter( $word.find( '.' + self.classes.dynamicLetter ).eq( 0 ), $word, false, duration );

				$word
					.addClass( self.classes.textActive )
					.removeClass( self.classes.textInactive );
			} else if ( 'clip' === animationType ) {
				$(self.dynamicWrapper).animate( { 'width': $word.width() + 10 }, self.revealDuration, function() {
					setTimeout( function() {
						self._hideWord( $word );
					}, self.revealAnimationDelay );
				} );
			}

			if ( $(self.nodeClass).hasClass( 'no-loop' ) && $word.hasClass( self.classes.textActive ) ) {
				if ( $word.attr('data-index') == self.elements.dynamicText.length - 1 ) {
					self.isLast = true;
				}
			}
		},

		_hideWord: function( $word ) {
			var self 			= this,
				classes 		= self.classes,
				letterSelector 	= '.' + classes.dynamicLetter,
				animationType 	= self.settings.animation_type,
				nextWord 		= self._getNextWord( $word );
			
			if ( self.isLast ) {
				$(self.dynamicWrapper).addClass( 'has-stopped' ).removeAttr('style');
				return;
			}

			if ( 'typing' === animationType ) {
				$(self.dynamicWrapper).addClass( classes.typeSelected );

				setTimeout( function() {
					$(self.dynamicWrapper).removeClass( classes.typeSelected );

					$word
						.addClass( classes.textInactive )
						.removeClass( classes.textActive )
						.children( letterSelector )
						.removeClass( classes.animationIn );
				}, self.selectionDuration );
				setTimeout( function() {
					self._showWord( nextWord, self.typeLettersDelay );
				}, self.typeAnimationDelay );

			} else if ( $(self.headline).hasClass( classes.letters ) ) {
				var bool = $word.children( letterSelector ).length >= nextWord.children( letterSelector ).length;

				self._hideLetter( $word.find( letterSelector ).eq( 0 ), $word, bool, self.lettersDelay );

				$word.removeClass( classes.textActive );

				self._showLetter( nextWord.find( letterSelector ).eq( 0 ), nextWord, bool, self.lettersDelay );

				nextWord.addClass( classes.textActive );

				setTimeout( function() {
					$(self.dynamicWrapper).css( { width: nextWord.width() } );
				}, 200 );

			} else if ( 'clip' === animationType ) {
				$(self.dynamicWrapper).animate( { width: '2px' }, self.revealDuration, function() {
					self._switchWord( $word, nextWord );
					self._showWord( nextWord );
				} );
			} else {
				self._switchWord( $word, nextWord );

				setTimeout( function() {
					self._hideWord( nextWord );
					//$(self.dynamicWrapper).removeAttr('style').css( { width: nextWord.width() } );
				}, self.animationDelay );
			}
		},

		_getNextWord: function( $word ) {
			return $word.is( ':last-child' ) ? $word.parent().children().eq( 0 ) : $word.next();
		},

		_switchWord: function( $oldWord, $newWord ) {
			$oldWord
				.removeClass( 'pp-headline-text-active' )
				.addClass( 'pp-headline-text-inactive' );

			$newWord
				.removeClass( 'pp-headline-text-inactive' )
				.addClass( 'pp-headline-text-active' );

			this._setDynamicWrapperWidth( $newWord );
		},

		_getSvgPaths: function( pathName ) {
			var pathsInfo = this.svgPaths[ pathName ],
				$paths = jQuery();

			pathsInfo.forEach( function( pathInfo ) {
				$paths = $paths.add( $( '<path>', { d: pathInfo } ) );
			} );

			return $paths;
		},

		_setDynamicWrapperWidth: function( $newWord ) {
			var animationType = this.settings.animation_type;

			if ('clip' !== animationType && 'typing' !== animationType) {
				$(this.dynamicWrapper).css('width', $newWord.width());
			}
		},

		_setWidth: function() {
			var self = this;
			var width = $(self.dynamicWrapper).width();

			$(self.elements.dynamicText).each( function() {
				var wordWidth = $( this ).width();

				if ( wordWidth > width ) {
					width = wordWidth;
				}
			} );

			$(self.dynamicWrapper).removeAttr('style').css( 'width', width );
		},

		_destroy: function() {
			if ( 'rotate' == this.settings.headline_style ) {
				$(this.dynamicWrapper).removeClass( 'has-stopped' ).html('').removeAttr('style');
				this.isInitialized = false;
			}
		},

		_quoteString: function (str) {
			if (str.match(escape)) {
				return '"' + str.replace(escape, function (a) {
					var c = meta[a];
					if (typeof c === 'string') {
						return c;
					}
					c = a.charCodeAt();
					return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				}) + '"';
			}
			return '"' + str + '"';
		},

		_isInViewport: function( element, offset ) {
			// Default offset to 50 if not provided
			var offset = typeof offset !== 'undefined' ? offset : 50;

			var elementTop = $(element).offset().top;
			var elementBottom = elementTop + $(element).outerHeight();
			
			var viewportTop = $(window).scrollTop() + offset; // Apply offset to the top of the viewport
			var viewportBottom = viewportTop + $(window).height() - (offset * 2); // Adjust bottom boundary accordingly

			// Check if any part of the element is within the offset boundaries
			return elementBottom > viewportTop && elementTop < viewportBottom;
		},

		_scrollObserver: function(obj) {
			var lastScrollY = 0;

			// Generating thresholds points along the animation height
			// More thresholds points = more trigger points of the callback
			var buildThresholds = function() {
				var sensitivityPercentage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
				var thresholds = [];
				if (sensitivityPercentage > 0 && sensitivityPercentage <= 100) {
					var increment = 100 / sensitivityPercentage;
					for (var i = 0; i <= 100; i += increment) {
						thresholds.push(i / 100);
					}
				} else {
					thresholds.push(0);
				}
				return thresholds;
			};
			var options = {
				root: obj.root || null,
				rootMargin: obj.offset || '0px',
				threshold: buildThresholds(obj.sensitivity)
			};
			function handleIntersect(entries) {
				var currentScrollY = entries[0].boundingClientRect.y,
					isInViewport = entries[0].isIntersecting,
					intersectionScrollDirection = currentScrollY < lastScrollY ? 'down' : 'up',
					scrollPercentage = Math.abs(parseFloat((entries[0].intersectionRatio * 100).toFixed(2)));
				obj.callback({
					sensitivity: obj.sensitivity,
					isInViewport: isInViewport,
					scrollPercentage: scrollPercentage,
					intersectionScrollDirection: intersectionScrollDirection
				});
				lastScrollY = currentScrollY;
			}
			return new IntersectionObserver(handleIntersect, options);
		},

		_activateScrollListener: function() {
			var scrollBuffer = -100;
			this.observer = this._scrollObserver({
				offset: `0px 0px ${scrollBuffer}px`,
				callback: event => {
					if (event.isInViewport) {
						this._initHeadlines();
					} else {
						this._destroy();
					}
				}
			});
			this.observer.observe($(this.headline)[0]);
		},

		_deactivateScrollListener: function() {
			if (this.observer) {
				this.observer.unobserve($(this.headline)[0]);
			}
		}
	
  	};

})(jQuery);
if ( 'object' !== typeof pp_animated_headlines ) {
	var pp_animated_headlines = {};
}

;(function($) {

	pp_animated_headlines['cb87o9jzrh6d'] = new PPAnimatedHeadlines({
        id: 'cb87o9jzrh6d',
        headline_style: 'rotate',
        headline_shape: 'strikethrough',
        animation_type: 'slide-down',
		loop: true,
		durations: {"animationDelay":2000,"lettersDelay":300,"typeLettersDelay":3000,"selectionDuration":500,"revealDuration":3000,"revealAnimationDelay":1500,"highlightAnimationDuration":2500,"highlightAnimationDelay":8000},
		isBuilderActive: ''
    });

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-xb8o4pnzhkec .pp-heading-separator, .fl-node-xb8o4pnzhkec .pp-heading').removeClass('pp-right');
        $('.fl-node-xb8o4pnzhkec .pp-heading-separator, .fl-node-xb8o4pnzhkec .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-xb8o4pnzhkec .pp-heading-separator, .fl-node-xb8o4pnzhkec .pp-heading').removeClass('pp-right');
        $('.fl-node-xb8o4pnzhkec .pp-heading-separator, .fl-node-xb8o4pnzhkec .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-p5hbom0t1ra4 .pp-heading-separator, .fl-node-p5hbom0t1ra4 .pp-heading').removeClass('pp-right');
        $('.fl-node-p5hbom0t1ra4 .pp-heading-separator, .fl-node-p5hbom0t1ra4 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-p5hbom0t1ra4 .pp-heading-separator, .fl-node-p5hbom0t1ra4 .pp-heading').removeClass('pp-right');
        $('.fl-node-p5hbom0t1ra4 .pp-heading-separator, .fl-node-p5hbom0t1ra4 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-2n0rq7fcm683 .pp-heading-separator, .fl-node-2n0rq7fcm683 .pp-heading').removeClass('pp-left');
        $('.fl-node-2n0rq7fcm683 .pp-heading-separator, .fl-node-2n0rq7fcm683 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-2n0rq7fcm683 .pp-heading-separator, .fl-node-2n0rq7fcm683 .pp-heading').removeClass('pp-left');
        $('.fl-node-2n0rq7fcm683 .pp-heading-separator, .fl-node-2n0rq7fcm683 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-tiw1exz93quv .pp-heading-separator, .fl-node-tiw1exz93quv .pp-heading').removeClass('pp-left');
        $('.fl-node-tiw1exz93quv .pp-heading-separator, .fl-node-tiw1exz93quv .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-tiw1exz93quv .pp-heading-separator, .fl-node-tiw1exz93quv .pp-heading').removeClass('pp-left');
        $('.fl-node-tiw1exz93quv .pp-heading-separator, .fl-node-tiw1exz93quv .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-7m9z34shldyr .pp-heading-separator, .fl-node-7m9z34shldyr .pp-heading').removeClass('pp-left');
        $('.fl-node-7m9z34shldyr .pp-heading-separator, .fl-node-7m9z34shldyr .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-7m9z34shldyr .pp-heading-separator, .fl-node-7m9z34shldyr .pp-heading').removeClass('pp-left');
        $('.fl-node-7m9z34shldyr .pp-heading-separator, .fl-node-7m9z34shldyr .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
jQuery(function($) {
	
		$(function() {
		$( '.fl-node-4tkvu0zmsy6f .fl-photo-img' )
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

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-5c312t4f8nme .pp-heading-separator, .fl-node-5c312t4f8nme .pp-heading').removeClass('pp-center');
        $('.fl-node-5c312t4f8nme .pp-heading-separator, .fl-node-5c312t4f8nme .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-5c312t4f8nme .pp-heading-separator, .fl-node-5c312t4f8nme .pp-heading').removeClass('pp-center');
        $('.fl-node-5c312t4f8nme .pp-heading-separator, .fl-node-5c312t4f8nme .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-08gufr2wcx1p .pp-heading-separator, .fl-node-08gufr2wcx1p .pp-heading').removeClass('pp-left');
        $('.fl-node-08gufr2wcx1p .pp-heading-separator, .fl-node-08gufr2wcx1p .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-08gufr2wcx1p .pp-heading-separator, .fl-node-08gufr2wcx1p .pp-heading').removeClass('pp-left');
        $('.fl-node-08gufr2wcx1p .pp-heading-separator, .fl-node-08gufr2wcx1p .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-xu34rjksew0p .pp-heading-separator, .fl-node-xu34rjksew0p .pp-heading').removeClass('pp-left');
        $('.fl-node-xu34rjksew0p .pp-heading-separator, .fl-node-xu34rjksew0p .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-xu34rjksew0p .pp-heading-separator, .fl-node-xu34rjksew0p .pp-heading').removeClass('pp-left');
        $('.fl-node-xu34rjksew0p .pp-heading-separator, .fl-node-xu34rjksew0p .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-4r09it8adfwv .pp-heading-separator, .fl-node-4r09it8adfwv .pp-heading').removeClass('pp-left');
        $('.fl-node-4r09it8adfwv .pp-heading-separator, .fl-node-4r09it8adfwv .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-4r09it8adfwv .pp-heading-separator, .fl-node-4r09it8adfwv .pp-heading').removeClass('pp-left');
        $('.fl-node-4r09it8adfwv .pp-heading-separator, .fl-node-4r09it8adfwv .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-foj4vp62eq31 .pp-heading-separator, .fl-node-foj4vp62eq31 .pp-heading').removeClass('pp-left');
        $('.fl-node-foj4vp62eq31 .pp-heading-separator, .fl-node-foj4vp62eq31 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-foj4vp62eq31 .pp-heading-separator, .fl-node-foj4vp62eq31 .pp-heading').removeClass('pp-left');
        $('.fl-node-foj4vp62eq31 .pp-heading-separator, .fl-node-foj4vp62eq31 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($){
	})(jQuery);

/* Start Global Node Custom JS */

/* End Global Node Custom JS */


/* Start Layout Custom JS */

/* End Layout Custom JS */


;// -----------------------------------------------------------------
// 마우스 상태 관리 스크립트 (발발거림 방지 + 지연 효과 추가)
// -----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    // ID가 'column1'인 요소를 찾습니다. HTML에서 이 ID를 사용해야 합니다.
    const column = document.getElementById('column1');
    
    // 축소 지연 타이머를 관리할 변수입니다.
    let shrinkTimer = null; 
    
    // 요소가 존재할 때만 이벤트 리스너를 등록합니다.
    if (column) {
        // 'mouseenter' 이벤트: 마우스가 원래 영역에 진입하면 축소 상태로 전환 준비
        column.addEventListener('mouseenter', function() {
            // 이전에 설정된 타이머가 있다면 취소하여 중복 실행을 방지합니다.
            clearTimeout(shrinkTimer); 
            
            // 100ms(0.1초)의 짧은 지연 후 축소 상태로 전환합니다.
            // 이 지연이 '재미 요소'와 '의도된 동작' 느낌을 더해줍니다.
            shrinkTimer = setTimeout(() => { 
                column.classList.add('is-shrunk');
            }, 100); 
        });

        // 'mouseleave' 이벤트: 마우스가 원래 영역을 완전히 벗어났을 때
        column.addEventListener('mouseleave', function() {
            // 1. 축소 지연 타이머가 작동 중이었다면 즉시 취소합니다. 
            //    (마우스가 빠르게 지나갈 경우 불필요한 축소 방지)
            clearTimeout(shrinkTimer); 
            
            // 2. 클래스를 제거하여 확장 상태로 복귀합니다. 
            //    (확장 애니메이션은 CSS의 transition에 따라 부드럽게 진행됩니다.)
            column.classList.remove('is-shrunk');
        });
    } else {
        console.error("Column element with ID 'column1' not found. Animation will not work.");
    }
});
;jQuery(document).ready(function($) {

  setTimeout(function () {

    var slider = new Swiper(".center-slider", {
      loop: true,
      centeredSlides: true,
      slidesPerView: "auto",
      spaceBetween: 30,
      speed: 2000,
      autoplay: {
        delay: 3500,
        disableOnInteraction: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      /* 🔥 비버 숏코드용 안정화 옵션 */
      observer: true,
      observeParents: true,
      watchSlidesProgress: true,
    });

  }, 400); // 비버 빌더 DOM이 완성되는 시간 확보

});
