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

(function($){
	})(jQuery);

;/**
 * This file should contain frontend logic for 
 * all module instances.
 */(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-gxqlt280j1em .pp-heading-separator, .fl-node-gxqlt280j1em .pp-heading').removeClass('pp-left');
        $('.fl-node-gxqlt280j1em .pp-heading-separator, .fl-node-gxqlt280j1em .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-gxqlt280j1em .pp-heading-separator, .fl-node-gxqlt280j1em .pp-heading').removeClass('pp-left');
        $('.fl-node-gxqlt280j1em .pp-heading-separator, .fl-node-gxqlt280j1em .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
jQuery(function($) {
	
		$(function() {
		$( '.fl-node-hk1xoce70pym .fl-photo-img' )
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
        $('.fl-node-yksofrm6jnax .pp-heading-separator, .fl-node-yksofrm6jnax .pp-heading').removeClass('pp-left');
        $('.fl-node-yksofrm6jnax .pp-heading-separator, .fl-node-yksofrm6jnax .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-yksofrm6jnax .pp-heading-separator, .fl-node-yksofrm6jnax .pp-heading').removeClass('pp-left');
        $('.fl-node-yksofrm6jnax .pp-heading-separator, .fl-node-yksofrm6jnax .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

;(function($) {

	PPAccordion = function( settings ) {
		this.id 		= settings.id;
		this.settings 	= settings;
		this.nodeClass  = '.fl-node-' + settings.id;
		this.accordion	= $( this.nodeClass + ' > .fl-module-content > .pp-accordion' );
		this.clicked 	     = false;
		this.nestedToggle    = false;
		this.defaultOpened   = false;
		this.offsetTop       = settings.scrollOffsetTop;
		this.isBuilderActive = settings.isBuilderActive;

		this._init();
	};

	PPAccordion.prototype = {

		settings	: {},
		nodeClass   : '',
		clicked		: false,
		offsetTop   : 120,

		_init: function() {
			if ( this.accordion.hasClass( 'pp-accordion-initialized' ) ) {
				return;
			}

			var button = this.accordion.find( '> .pp-accordion-item > .pp-accordion-button' );

			//button.css('height', button.outerHeight() + 'px');
			button.off('click').on('click', this._buttonClick.bind( this ) );
			button.on('keypress', this._buttonClick.bind( this ) );
			button.on('mouseup', this._mouseEvent.bind( this ) );
			button.on('focus', this._focusIn.bind( this ) );
			button.on('focusout', this._focusOut.bind( this ) );

			this._responsiveCollapse();

			this._hashChange();

			$(window).on('hashchange', this._hashChange.bind( this ));
			this.accordion.addClass('pp-accordion-initialized');
		},

		_hashChange: function() {
			var scrollPos = $(window).scrollTop();
			$(window).on('scroll', function() {
				scrollPos = $(window).scrollTop();
			});
			var hash = location.hash.split('/')[0].replace('!', '');
			if( hash && $(hash).length > 0 ) {
				var self = this;
				var element = $(hash + '.pp-accordion-item');
				if ( element && element.length > 0 ) {
					$('html, body').animate({
						scrollTop: element.offset().top - self.offsetTop
					}, 0, function() {
						location.href = '#';
						// Fix scroll after hash change.
						window.scrollTo(0, scrollPos);
						// Open accordion item.
						setTimeout(function() {
							if ( ! element.hasClass('pp-accordion-item-active') ) {
								element.find('> .pp-accordion-button').trigger('click');
							}
						}, 100);
						// Nested accordion logic.
						var parentModules = element.parents('.fl-module');
						var elementNodeId = element.closest('.fl-module').data('node');
						parentModules.each(function() {
							if ( $(this).data('node') !== elementNodeId ) {
								var parentNodeId = $(this).data('node');
								if ( 'undefined' !== typeof window['pp_accordion_' + parentNodeId] ) {
									var parentItem = $(this).find('.fl-node-' + elementNodeId).parents('.pp-accordion-item');
									if ( ! parentItem.hasClass('pp-accordion-item-active') ) {
										parentItem.find('> .pp-accordion-button').trigger('click');
										self.nestedToggle = true;
										setTimeout(function() {
											window.scrollTo(0, element.offset().top - self.offsetTop);
										}, 800);
									}
								}
							}
						});
					});
				}
			}
		},

		_mouseEvent: function() {
			this.clicked = true;
		},

		_buttonClick: function( e ) {
			e.preventDefault();
			e.stopPropagation();

			var button      = $( e.target ).closest('.pp-accordion-button'),
				accordion   = button.closest('.pp-accordion'),
				item	    = button.closest('.pp-accordion-item'),
				allContent  = accordion.find('> .pp-accordion-item > .pp-accordion-content'),
				content     = button.siblings('.pp-accordion-content'),
				self		= this;
			
			// Click or keyboard (enter or spacebar) input?
			if ( ! this._validClick(e) ) {
				return;
			}

			// Prevent scrolling when the spacebar is pressed
			e.preventDefault();

			if ( accordion.hasClass('pp-accordion-collapse') ) {
				accordion.find( '> .pp-accordion-item-active .pp-accordion-button' ).attr('aria-expanded', 'false');
				accordion.find( '> .pp-accordion-item-active .pp-accordion-content' ).attr('aria-hidden', 'true');
				accordion.find( '> .pp-accordion-item-active' ).removeClass( 'pp-accordion-item-active' );
				button.attr('aria-expanded', 'false');
				allContent.slideUp('normal');
			}

			if ( content.is(':hidden') ) {
				button.attr('aria-expanded', 'true');
				item.addClass( 'pp-accordion-item-active' );
				if ( this.defaultOpened ) {
					var speed = 0;
				} else {
					var speed = 'normal';
				}
				content.slideDown(speed, function() {
					self._slideDownComplete(this);
					$(this).attr( 'aria-hidden', false );
				});
			}
			else {
				button.attr('aria-expanded', 'false');
				item.removeClass( 'pp-accordion-item-active' );
				content.slideUp('normal', function() {
					self._slideUpComplete(this);
					$(this).attr( 'aria-hidden', true );
				});
			}
		},

		_focusIn: function( e ) {
			var button = $( e.target ).closest('.pp-accordion-button');

			button.attr('aria-selected', 'true');
		},

		_focusOut: function( e ) {
			var button = $( e.target ).closest('.pp-accordion-button');

			button.attr('aria-selected', 'false');
		},

		_slideUpComplete: function(target) {
			var content 	= $( target ),
				accordion 	= content.closest( '.pp-accordion' );

			accordion.trigger( 'fl-builder.pp-accordion-toggle-complete' );
		},

		_slideDownComplete: function(target) {
			var content 	= $( target ),
				accordion 	= content.closest( '.pp-accordion' ),
				item 		= content.parent(),
				win  		= $( window );

			// Gallery module support.
			FLBuilderLayout.refreshGalleries( content );

			// Grid layout support (uses Masonry)
			FLBuilderLayout.refreshGridLayout( content );

			// Post Carousel support (uses BxSlider)
			FLBuilderLayout.reloadSlider( content );

			// WP audio shortcode support
			FLBuilderLayout.resizeAudio( content );

			// Prevent row slideshow from getting stopped
			// when an item is set to expand by default.
			if ( ! this.defaultOpened ) {
				// Slideshow module support.
				FLBuilderLayout.resizeSlideshow();
			} else {
				this.defaultOpened = false;
			}

			// Content Grid module support.
			if ( 'undefined' !== typeof $.fn.isotope ) {
				var highestBox = 0;
				var contentHeight = 0;

	            content.find('.pp-equal-height .pp-content-post').css('height', '').each(function(){
	                if($(this).height() > highestBox) {
	                	highestBox = $(this).height();
	                	contentHeight = $(this).find('.pp-content-post-data').outerHeight();
	                }
	            });

				content.find('.pp-equal-height .pp-content-post').height(highestBox);
				content.find('.pp-content-post-grid').isotope('layout');
			}

			if ( ! this.nestedToggle ) {
				if ( item.offset().top < win.scrollTop() + 100 ) {
					if ( ! this.isBuilderActive && ( ! this.clicked || this.settings.scrollAnimation ) ) {
						$( 'html, body' ).animate({
							scrollTop: item.offset().top - this.offsetTop
						}, 500, 'swing');
					}
				}
			}

			this.clicked = false;
			this.nestedToggle = false;

			accordion.trigger( 'fl-builder.pp-accordion-toggle-complete' );
			$(document).trigger( 'pp-accordion-toggle-complete', [ accordion, item ] );
		},

		_responsiveCollapse: function() {
			if ( this.settings.responsiveCollapse && window.innerWidth <= 768 ) {
				this.accordion.find( '> .pp-accordion-item' ).removeClass('pp-accordion-item-active').find('> .pp-accordion-content').hide();
				return;
			}
		},

		_validClick: function(e) {
			return (e.which == 1 || e.which == 13 || e.which == 32 || e.which == undefined) ? true : false;
		}
	};

})(jQuery);

(function($) {

	$(function() {

		window['pp_accordion_lhcy03qordbf'] = new PPAccordion({
			id: 'lhcy03qordbf',
			defaultItem: 1,
			responsiveCollapse: true,
			scrollAnimation: true,
			scrollOffsetTop: 120,
			isBuilderActive: false		});
	});

})(jQuery);

;(function ($) {

	PPAdvancedTabs = function (settings) {
		this.settings = settings;
		this.nodeClass = '.fl-node-' + settings.id;
		this._init();
	};

	PPAdvancedTabs.prototype = {

		settings: {},
		nodeClass: '',

		_init: function () {
			$( this.nodeClass + ' .pp-tabs-labels .pp-tabs-label' ).on( 'click keyup', this._labelClick.bind( this ) );
			$( this.nodeClass + ' .pp-tabs-panels .pp-tabs-label' ).on( 'click', this._responsiveLabelClick.bind( this ) );

			$( this.nodeClass + ' .pp-tabs-labels .pp-tabs-label.pp-tab-active' ).attr( 'tabindex', '0' );

			this._responsiveCollapsed();

			this._bindEvents();
		},

		_bindEvents: function() {
			var layout = this.settings.layout,
				tabs = $( this.nodeClass + ' .pp-tabs-labels .pp-tabs-label' );

			// Enable arrow navigation between tabs in the tab list
  			var tabFocus = 0;

			$( this.nodeClass + ' .pp-tabs-labels' ).on( 'keydown', function(e) {
				var keyCode = e.keyCode || e.which;

				if ( 'vertical' === layout ) {
					if ( 38 === keyCode || 40 === keyCode ) {
						e.preventDefault();
						tabs[tabFocus].setAttribute('tabindex', -1);
						// Move down.
						if ( 40 === keyCode ) {
							tabFocus++;
							// If we're at the end, go to the start.
							if (tabFocus >= tabs.length) {
								tabFocus = 0;
							}
						} else if ( 38 === keyCode ) {
							// Move up.
							tabFocus--;
							// If we're at the start, move to the end.
							if (tabFocus < 0) {
								tabFocus = tabs.length - 1;
							}
						}
					}
				} else {
					if ( 37 === keyCode || 39 === keyCode ) {
						e.preventDefault();
						tabs[tabFocus].setAttribute('tabindex', -1);
						// Move right.
						if ( 39 === keyCode ) {
							tabFocus++;
							// If we're at the end, go to the start.
							if (tabFocus >= tabs.length) {
								tabFocus = 0;
							}
						} else if ( 37 === keyCode ) {
							// Move left.
							tabFocus--;
							// If we're at the start, move to the end.
							if (tabFocus < 0) {
								tabFocus = tabs.length - 1;
							}
						}
					}
				}
				tabs[tabFocus].setAttribute('tabindex', 0);
				tabs[tabFocus].focus();
			});
			  
			if ($( this.nodeClass + ' .pp-tabs-vertical' ).length > 0) {
				this._resize();
				$( window ).off( 'resize' + this.nodeClass );
				$( window ).on( 'resize' + this.nodeClass, this._resize.bind( this ) );
			}

			this._hashChange();

			$( window ).on( 'hashchange', this._hashChange.bind( this ) );
		},

		_hashChange: function () {
			var hash = location.hash.split('/')[0].replace('!', '');
			if (hash && $( hash ).length > 0) {
				var element = $( hash + '.pp-tabs-label' );
				if (element && element.length > 0) {
					var header = $( '.fl-theme-builder-header-sticky' );
					var offset = header.length > 0 ? header.height() + 32 : 120;
					location.href = '#';
					$( 'html, body' ).animate({
						scrollTop: element.parents( '.pp-tabs' ).offset().top - offset
						}, 50, function () {
							if ( ! element.hasClass( 'pp-tab-active' )) {
								element.trigger( 'click' );
							}
						});
				}
			}
		},

		_labelClick: function (e) {
			var label = $( e.target ).closest( '.pp-tabs-label' ),
				index = label.data( 'index' ),
				wrap = label.closest( '.pp-tabs' );
				// allIcons = wrap.find('.pp-tabs-label .fa'),
				// icon = wrap.find('.pp-tabs-label[data-index="' + index + '"] .fa');
			// Toggle the responsive icons.
			// allIcons.addClass('fa-plus');
			// icon.removeClass('fa-plus');
			var showContent = 'click' === e.type || ('keyup' === e.type && (13 === e.keyCode || 13 === e.which))
			if ( ! showContent) {
				return;
			}

			label.siblings().attr( 'aria-selected', false ).attr( 'tabindex', '-1' );
			label.attr( 'aria-selected', true ).attr( 'tabindex', '0' ).trigger( 'focus' );

			if (wrap.hasClass( 'pp-tabs-vertical' ) && this.settings.scrollAnimate) {
				var header = $( '.fl-theme-builder-header-sticky' );
				var offset = header.length > 0 ? header.height() + 32 : 120;
				$( 'html, body' ).animate({
					scrollTop: wrap.offset().top - offset
				}, 500);
			}

			// Toggle the tabs.
			wrap.find( '.pp-tabs-labels:first > .pp-tab-active' ).removeClass( 'pp-tab-active' );
			wrap.find( '.pp-tabs-panels:first > .pp-tabs-panel > .pp-tab-active' ).removeClass( 'pp-tab-active' );
			wrap.find( '.pp-tabs-panels:first > .pp-tabs-panel > .pp-tabs-label' ).removeClass( 'pp-tab-active' );

			wrap.find( '.pp-tabs-labels:first > .pp-tabs-label[data-index="' + index + '"]' ).addClass( 'pp-tab-active' );
			wrap.find( '.pp-tabs-panels:first > .pp-tabs-panel > .pp-tabs-panel-content[data-index="' + index + '"]' ).addClass( 'pp-tab-active' );
			wrap.find( '.pp-tabs-panels:first > .pp-tabs-panel > .pp-tabs-label[data-index="' + index + '"]' ).addClass( 'pp-tab-active' );

			// Gallery module support.
			FLBuilderLayout.refreshGalleries( wrap.find( '.pp-tabs-panel-content[data-index="' + index + '"]' ) );

			// Grid layout support (uses Masonry)
			FLBuilderLayout.refreshGridLayout( wrap.find('.pp-tabs-panel-content[data-index="' + index + '"]') );

			// Post Carousel support (uses BxSlider)
			FLBuilderLayout.reloadSlider( wrap.find('.pp-tabs-panel-content[data-index="' + index + '"]') );

			// WP audio shortcode support
			FLBuilderLayout.resizeAudio( wrap.find('.pp-tabs-panel-content[data-index="' + index + '"]') );

			// Slideshow module support.
			FLBuilderLayout.resizeSlideshow();

			$( document ).trigger( 'pp-tabs-switched', [wrap.find( '.pp-tabs-panel-content[data-index="' + index + '"]' )] );
		},

		_responsiveLabelClick: function (e) {
			var label = $( e.target ).closest( '.pp-tabs-label' ),
				wrap = label.closest( '.pp-tabs' ),
				index = label.data( 'index' ),
				content = label.siblings( '.pp-tabs-panel-content' ),
				activeContent = wrap.find( '.pp-tabs-panel-content.pp-tab-active' ),
				activeIndex = activeContent.data( 'index' ),
				allIcons = wrap.find( '.pp-tabs-label .fa' ),
				icon = label.find( '.fa' );

			// Should we proceed?
			if (index == activeIndex) {
				activeContent.slideUp( 'normal' );
				activeContent.removeClass( 'pp-tab-active' );
				$( this.nodeClass + ' .pp-tabs-panels .pp-tabs-label' ).removeClass( 'pp-tab-active' );
				wrap.removeClass( 'pp-tabs-animation' );
				return;
			}
			if (wrap.hasClass( 'pp-tabs-animation' )) {
				return;
			}

			// Toggle the icons.
			// allIcons.addClass('fa-plus');
			// icon.removeClass('fa-plus');
			// Run the animations.
			wrap.addClass( 'pp-tabs-animation' );
			activeContent.slideUp( 'normal' );

			content.slideDown('normal', function () {

				wrap.find( '.pp-tab-active' ).removeClass( 'pp-tab-active' );
				wrap.find( '.pp-tabs-label[data-index="' + index + '"]' ).addClass( 'pp-tab-active' );
				content.addClass( 'pp-tab-active' );
				wrap.removeClass( 'pp-tabs-animation' );

				// Gallery module support.
				FLBuilderLayout.refreshGalleries( content );

				// WP audio shortcode support
				FLBuilderLayout.resizeAudio( wrap.find('.pp-tabs-panel-content[data-index="' + index + '"]') );

				// Slideshow module support.
				FLBuilderLayout.resizeSlideshow();

				// Content Grid module support.
				if ('undefined' !== typeof $.fn.isotope) {
					content.find( '.pp-content-post-grid' ).isotope( 'layout' );
				}

				if (label.offset().top < $( window ).scrollTop() + 100 && ! wrap.hasClass('pp-tabs-no-scroll')) {
					$( 'html, body' ).animate( { scrollTop: label.offset().top - 100 }, 500, 'swing' );
				}

				$( document ).trigger( 'pp-tabs-switched', [content] );
			});
		},

		_resize: function () {
			$( this.nodeClass + ' .pp-tabs-vertical' ).each( this._resizeVertical.bind( this ) );
		},

		_resizeVertical: function (e) {
			var wrap = $( this.nodeClass + ' .pp-tabs-vertical' ),
				labels = wrap.find( '.pp-tabs-labels' ),
				panels = wrap.find( '.pp-tabs-panels' );

			panels.css( 'min-height', labels.height() + 'px' );
		},

		_responsiveCollapsed: function () {
			if ($( window ).innerWidth() < 769 && ! this.settings.isBuilderActive) {
				if (this.settings.responsiveClosed) {
					$( this.nodeClass + ' .pp-tabs-panels .pp-tabs-label.pp-tab-active' ).trigger( 'click' );
				}
				$( this.nodeClass + ' .pp-tabs-panels' ).css( 'visibility', 'visible' );
			}
		}
	};

})(jQuery);
(function($) {

	$(function() {

		
		new PPAdvancedTabs({
			id: 'c5y13mrv4t27',
			layout: 'horizontal',
			responsiveClosed: false,
			scrollAnimate: true,
			isBuilderActive: false		});

		$('.fl-node-c5y13mrv4t27 .pp-tabs-style-2 .pp-tabs-label.pp-tab-active').prev().addClass('pp-no-border');
		$('.fl-node-c5y13mrv4t27 .pp-tabs-style-2 .pp-tabs-label').on('click', function() {
			$('.fl-node-c5y13mrv4t27 .pp-tabs-style-2 .pp-tabs-label').removeClass('pp-no-border');
			$('.fl-node-c5y13mrv4t27 .pp-tabs-style-2 .pp-tabs-label.pp-tab-active').prev().addClass('pp-no-border');
		});

		if($(window).width() > 768) {
			$('.fl-node-c5y13mrv4t27 .pp-tabs-vertical .pp-tabs-panel-content').css('min-height', $('.fl-node-c5y13mrv4t27 .pp-tabs-vertical .pp-tabs-labels').outerHeight() + 'px');
		}

		if( $(window).width() <= 768 ) {
			$('.fl-node-c5y13mrv4t27 .pp-tabs-label .pp-tab-close').on('click', function() {
				$(this).parents('.pp-tabs-label').removeClass('pp-tab-active');
			});
		}
	});

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-bnq2jocs7gr5 .pp-heading-separator, .fl-node-bnq2jocs7gr5 .pp-heading').removeClass('pp-center');
        $('.fl-node-bnq2jocs7gr5 .pp-heading-separator, .fl-node-bnq2jocs7gr5 .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-bnq2jocs7gr5 .pp-heading-separator, .fl-node-bnq2jocs7gr5 .pp-heading').removeClass('pp-center');
        $('.fl-node-bnq2jocs7gr5 .pp-heading-separator, .fl-node-bnq2jocs7gr5 .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-mwlhr38y491j .pp-heading-separator, .fl-node-mwlhr38y491j .pp-heading').removeClass('pp-left');
        $('.fl-node-mwlhr38y491j .pp-heading-separator, .fl-node-mwlhr38y491j .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-mwlhr38y491j .pp-heading-separator, .fl-node-mwlhr38y491j .pp-heading').removeClass('pp-left');
        $('.fl-node-mwlhr38y491j .pp-heading-separator, .fl-node-mwlhr38y491j .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-nq4lyk7z6jub .pp-heading-separator, .fl-node-nq4lyk7z6jub .pp-heading').removeClass('pp-left');
        $('.fl-node-nq4lyk7z6jub .pp-heading-separator, .fl-node-nq4lyk7z6jub .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-nq4lyk7z6jub .pp-heading-separator, .fl-node-nq4lyk7z6jub .pp-heading').removeClass('pp-left');
        $('.fl-node-nq4lyk7z6jub .pp-heading-separator, .fl-node-nq4lyk7z6jub .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-rzo2iwn3g65e .pp-heading-separator, .fl-node-rzo2iwn3g65e .pp-heading').removeClass('pp-center');
        $('.fl-node-rzo2iwn3g65e .pp-heading-separator, .fl-node-rzo2iwn3g65e .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-rzo2iwn3g65e .pp-heading-separator, .fl-node-rzo2iwn3g65e .pp-heading').removeClass('pp-center');
        $('.fl-node-rzo2iwn3g65e .pp-heading-separator, .fl-node-rzo2iwn3g65e .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
(function($) {

    if($(window).width() <= 768 && $(window).width() >= 481 ) {
        $('.fl-node-iw1zc0poj6vb .pp-heading-separator, .fl-node-iw1zc0poj6vb .pp-heading').removeClass('pp-center');
        $('.fl-node-iw1zc0poj6vb .pp-heading-separator, .fl-node-iw1zc0poj6vb .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-iw1zc0poj6vb .pp-heading-separator, .fl-node-iw1zc0poj6vb .pp-heading').removeClass('pp-center');
        $('.fl-node-iw1zc0poj6vb .pp-heading-separator, .fl-node-iw1zc0poj6vb .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);
jQuery(function($) {
	
		$(function() {
		$( '.fl-node-a1j5e973hylx .fl-photo-img' )
			.on( 'mouseenter', function( e ) {
				$( this ).data( 'title', $( this ).attr( 'title' ) ).removeAttr( 'title' );
			} )
			.on( 'mouseleave', function( e ){
				$( this ).attr( 'title', $( this ).data( 'title' ) ).data( 'title', null );
			} );
	});
		window._fl_string_to_slug_regex = 'a-zA-Z0-9';
});
jQuery(function($) {
	
		$(function() {
		$( '.fl-node-w56urfn109m7 .fl-photo-img' )
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
        $('.fl-node-u8yoctmaji9q .pp-heading-separator, .fl-node-u8yoctmaji9q .pp-heading').removeClass('pp-center');
        $('.fl-node-u8yoctmaji9q .pp-heading-separator, .fl-node-u8yoctmaji9q .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-u8yoctmaji9q .pp-heading-separator, .fl-node-u8yoctmaji9q .pp-heading').removeClass('pp-center');
        $('.fl-node-u8yoctmaji9q .pp-heading-separator, .fl-node-u8yoctmaji9q .pp-heading').addClass('pp-mobile-');
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
		$('.fl-node-9bzxys7aoiu8 .pp-logos-wrapper .pp-logo').each(function(index) {
			if(($(this).find('.logo-image').outerHeight() + 0) > maxHeight) {
				maxHeight = $(this).find('.logo-image').outerHeight() + 0;
			}
		});
		$('.fl-node-9bzxys7aoiu8 .pp-logos-wrapper .pp-logo').css('height', maxHeight + 'px');

				return maxHeight;
	}

	$('.fl-node-9bzxys7aoiu8 .pp-logos-wrapper').imagesLoaded(function() {
			// Clear the controls in case they were already created.
		//$('.fl-node-9bzxys7aoiu8 .logo-slider-next').empty();
		//$('.fl-node-9bzxys7aoiu8 .logo-slider-prev').empty();

		var getMinSlides = function() {
			var minSlides = ( $( window ).width() <= 768 ) ? parseInt( $( '.fl-node-9bzxys7aoiu8' ).width() / 410) : 5;

						if ( window.innerWidth <= 1200 ) {
				minSlides = 4;
			}
									if ( window.innerWidth <= 992 ) {
				minSlides = 4;
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
		
		var totalSlides = $('.fl-node-9bzxys7aoiu8 .pp-logo:not(.bx-clone)').length;

		var options = {
							slideWidth: 330,
						moveSlides: moveSlides,
			slideMargin: 20,
			minSlides: minSlides,
			maxSlides: maxSlides,
			autoStart : 1,
			auto : true,
			autoHover: true,
			adaptiveHeight: false,
			pause : 2000,
			mode : 'horizontal',
			speed : 1000,
			infiniteLoop: true,
			pager : 0,
			controls: false,
			ariaLive: false,
			onSliderLoad: function() {
				$('.fl-node-9bzxys7aoiu8 .pp-logos-wrapper').addClass('pp-logos-wrapper-loaded');
				$('.fl-node-9bzxys7aoiu8 .pp-logo').attr('role', 'group');

				var visibleCount = 0;
				$('.fl-node-9bzxys7aoiu8 .pp-logo').each(function() {
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
				$('.fl-node-9bzxys7aoiu8').off('keyup').on('keyup', function(e) {
					e.stopPropagation();
					if ( $(e.target).hasClass('pp-logos-wrapper') || $(e.target).closest('.pp-logos-wrapper').length ) {
						hasItemFocus = true;
					}
					if ( hasItemFocus && $(e.target).hasClass('logo-slider-nav') ) {
						$(this).find('.pp-logos-wrapper').data('bxSlider').reloadSlider();
						hasItemFocus = false;
					}
				});

				$(document).trigger( 'pp_logos_on_slider_load', [ $('.fl-node-9bzxys7aoiu8') ] );
			},
			onSlideBefore: function( ele, oldIndex, newIndex ) {
				this.stopAuto( true );
				$('.fl-node-9bzxys7aoiu8 .logo-slider-nav').addClass('disabled');
				$('.fl-node-9bzxys7aoiu8 .bx-controls .bx-pager-link').addClass('disabled');
								this.startAuto( true );
				
				var visibleCount = 0;
				$('.fl-node-9bzxys7aoiu8 .pp-logo').each(function() {
					if ( ! $(this).hasClass( 'bx-clone' ) ) {
						visibleCount++;
						$(this).attr('aria-label', 'Slide ' + visibleCount + ' of ' + totalSlides );
					}
				});
			},
			onSlideAfter: function( ele, oldIndex, newIndex ) {
				$('.fl-node-9bzxys7aoiu8 .logo-slider-nav').removeClass('disabled');
				$('.fl-node-9bzxys7aoiu8 .bx-controls .bx-pager-link').removeClass('disabled');
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
		var slider = $('.fl-node-9bzxys7aoiu8 .pp-logos-wrapper').bxSlider( options );

		// Store a reference to the slider.
		slider.data('bxSlider', slider);


		
		
	
			});

})(jQuery);

/* Start Global Node Custom JS */

/* End Global Node Custom JS */


/* Start Layout Custom JS */

/* End Layout Custom JS */


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
