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
        $('.fl-node-xdi2hcunm5qt .pp-heading-separator, .fl-node-xdi2hcunm5qt .pp-heading').removeClass('pp-left');
        $('.fl-node-xdi2hcunm5qt .pp-heading-separator, .fl-node-xdi2hcunm5qt .pp-heading').addClass('pp-tablet-');
    }

    if( $(window).width() <= 480 ) {
        $('.fl-node-xdi2hcunm5qt .pp-heading-separator, .fl-node-xdi2hcunm5qt .pp-heading').removeClass('pp-left');
        $('.fl-node-xdi2hcunm5qt .pp-heading-separator, .fl-node-xdi2hcunm5qt .pp-heading').addClass('pp-mobile-');
    }

})(jQuery);

;(function($) {
	window.onLoadPPReCaptcha = function () {
		var reCaptchaFields = $('.pp-grecaptcha'),
			widgetID;

		if (reCaptchaFields.length > 0) {
			reCaptchaFields.each(function (i) {
				var self = $(this),
					attrWidget = self.attr('data-widgetid'),
					newID = $(this).attr('id'); // + '-' + i;
				// Avoid re-rendering as it's throwing API error
				if ((typeof attrWidget !== typeof undefined && attrWidget !== false)) {
					return;
				}
				else {
					// Increment ID to avoid conflict with the same form.
					self.attr('id', newID);

					widgetID = grecaptcha.render(newID, {
						sitekey	: self.data('sitekey'),
						theme	: self.data('theme'),
						size	: self.data('validate'),
						callback: function (response) {
							if ( response != '' ) {
								self.attr('data-pp-grecaptcha-response', response);

								// Re-submitting the form after a successful invisible validation.
								if ('invisible' == self.data('validate')) {
									self.closest('.fl-module').find('.pp-submit-button').trigger('click');
								}
							}
						}
					});

					self.attr('data-widgetid', widgetID);
				}
			});
		}
	};

	window.onLoadPPHCaptcha = function() {
		var hCaptchaFields = $('.h-captcha'),
			widgetID;

		if (hCaptchaFields.length > 0) {
			hCaptchaFields.each(function (i) {
				var self = $(this),
					frame = $(this).find('iframe'),
					attrWidget = frame.attr('data-hcaptcha-widget-id'),
					newID = $(this).attr('id') + '-' + i;

				// Avoid re-rendering as it's throwing API error
				if ((typeof attrWidget !== typeof undefined && attrWidget !== false)) {
					return;
				}
				else {
					// Increment ID to avoid conflict with the same form.
					self.attr('id', newID);

					widgetID = hcaptcha.render(newID, {
						sitekey: self.data('sitekey'),
						callback: function (response) {
							if (response != '') {
								self.attr('data-pp-hcaptcha-response', response);
							}
						}
					});

					self.attr('data-hcaptcha-widget-id', widgetID);
				}
			});
		}
	};

	window.onLoadGoogleSignIn = function( response ) {
		$(document).trigger( 'pp_lf_google_signin', [ response ] );
	};

	PPLoginForm = function( settings ) {
		this.id			= settings.id;
		this.node 		= $('.fl-node-' + this.id);
		this.messages	= settings.messages;
		this.settings 	= settings;

		this._init();
	};

	PPLoginForm.prototype = {
		settings: {},
		isGoogleLoginClicked: false,

		_init: function() {
			if ( this.settings.facebook_login ) {
				this._initFacebookLogin();
			}
			if ( this.settings.google_login ) {
				this._initGoogleLogin();
			}

			if ( this.node.find( '.pp-lf-toggle-pw' ).length ) {
				this._initPasswordToggle();
			}

			if ( this.node.find( '#pp-form-' + this.id ).length > 0 ) {
				this.node.find( '#pp-form-' + this.id ).on( 'submit', this._loginFormSubmit.bind( this ) );
			}

			if ( this.node.find( '.pp-login-form--lost-pass' ).length > 0 ) {
				this.node.find( '.pp-login-form--lost-pass' ).on( 'submit', this._lostPassFormSubmit.bind( this ) );
			}

			if ( this.node.find( '.pp-login-form--reset-pass' ).length > 0 ) {
				this.node.find( '.pp-login-form--reset-pass' ).on( 'submit', this._resetPassFormSubmit.bind( this ) );
			}
		},

		_initFacebookLogin: function() {
			if ( '' === this.settings.facebook_app_id ) {
				return;
			}
			if ( this.node.find( '.pp-fb-login-button' ).length > 0 ) {
				this._initFacebookSDK();
			
				this.node.find( '.pp-fb-login-button' ).on( 'click', this._facebookLoginClick.bind( this ) );
			}
		},

		_initFacebookSDK: function() {
			var self = this;

			if ( $( '#fb-root' ).length === 0 ) {
				$('body').prepend('<div id="fb-root"></div>');
			}
			// Load the SDK asynchronously.
			var d = document, s = 'script', id = 'facebook-jssdk';
			var js, fjs = d.getElementsByTagName(s)[0];
			
			if (d.getElementById(id)) return;
			
			js = d.createElement(s); js.id = id;
			js.src = this.settings.facebook_sdk_url;
			fjs.parentNode.insertBefore(js, fjs);

			window.fbAsyncInit = function() {
			    // Init.
			    FB.init({
			      appId      : self.settings.facebook_app_id, // App ID.
			      cookie     : true,  // Enable cookies to allow the server to access the session.
			      xfbml      : true,  // Parse social plugins on this webpage.
			      version    : 'v2.12' // Use this Graph API version for this call.
				});
			};
		},

		_facebookLoginClick: function() {
			var self = this,
				theForm = this.node.find( '.pp-login-form' ),
				redirect = theForm.find( 'input[name="redirect_to"]' );

			var args = {
				action: 'pp_lf_process_social_login',
				provider: 'facebook',
				page_url: self.settings.page_url,
				nonce: self._getNonce(),
			};

			if ( redirect.length > 0 && '' !== redirect.val() ) {
				args['redirect'] = redirect.val();
			}

			this._disableForm();

			FB.login( function( response ) {
				if ( 'connected' === response.status ) {
					FB.api( '/me', { fields: 'id, email, name, first_name, last_name' }, function( response ) {
						var authResponse = FB.getAuthResponse();
						args['user_data'] = response;
						args['auth_response'] = authResponse;
						self._ajax( args, function( response ) {
							if ( ! response.success ) {
								if ( 'undefined' !== typeof response.data.code ) {
									theForm.find( '.pp-lf-error' ).remove();
									$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data.message );
								} else {
									console.error( response.data );
								}
								self._enableForm();
							} else {
								if ( response.data.redirect_url ) {
									window.location.href = response.data.redirect_url;
								} else {
									window.location.reload();
								}
							}
						} );
					} );
				} else {
					if ( response.authResponse ) {
						console.error( 'PP Login Form: Unable to connect Facebook account.' );
					}
					self._enableForm();
				}
			}, {
				scope: 'email',
				return_scopes: true
			} );
		},

		_initGoogleLogin: function() {
			if ( '' === this.settings.google_client_id ) {
				return;
			}
			if ( this.node.find( '#g_id_onload' ).length > 0 ) {
				$(document).on( 'pp_lf_google_signin', this._initGoogleApi.bind( this ) );

				this.node.find( '.pp-google-login-button' ).on( 'click', this._googleLoginClick.bind( this ) );
			}
		},

		_initGoogleApi: function( e, googleSignInResponse ) {
			var self = this,
				theForm = this.node.find( '.pp-login-form' ),
				redirect = theForm.find( 'input[name="redirect_to"]' );

			if ( '' === self.settings.google_client_id ) {
				return;
			}

			var args = {
				action: 'pp_lf_process_social_login',
				provider: 'google',
				page_url: self.settings.page_url,
				hash: googleSignInResponse.credential,
				nonce: self._getNonce(),
			};

			if ( redirect.length > 0 && '' !== redirect.val() ) {
				args['redirect'] = redirect.val();
			}

			self._ajax( args, function( response ) {
				if ( ! response.success ) {
					if ( 'undefined' !== typeof response.data.code ) {
						theForm.find( '.pp-lf-error' ).remove();
						$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data.message );
					} else {
						console.error( response.data );
					}
					self._enableForm();
				} else {
					if ( response.data.redirect_url ) {
						var hostUrl = location.protocol + '//' + location.host;
						var redirectUrl = '';

						if ( '' === response.data.redirect_url.split( hostUrl )[0] ) {
							redirectUrl = response.data.redirect_url.split( hostUrl )[1];
						} else {
							redirectUrl = response.data.redirect_url.split( hostUrl )[0];
						}

						if ( redirectUrl === location.href.split( hostUrl )[1] ) {
							window.location.reload();
						} else {
							window.location.href = response.data.redirect_url;
						}
					} else {
						window.location.reload();
					}
				}

				self.isGoogleLoginClicked = false;
			} );
		},

		_googleLoginClick: function() {
			this.isGoogleLoginClicked = true;
			this._disableForm();
		},

		_initPasswordToggle: function() {
			this.node.find( '.pp-lf-toggle-pw' ).on( 'click', function(e) {
				e.preventDefault();

				if ( $(this).hasClass( 'pwd-toggled' ) ) {
					$(this).removeClass( 'pwd-toggled' );
					$(this).parent().find('[type="text"]').attr('type', 'password');
					$(this).attr( 'aria-label', 'Show password' );
				} else {
					$(this).addClass( 'pwd-toggled' );
					$(this).parent().find('[type="password"]').attr('type', 'text');
					$(this).attr( 'aria-label', 'Hide password' );
				}
			} );
		},

		_loginFormSubmit: function(e) {
			e.preventDefault();

			var theForm 		= $(e.target),
				username 		= theForm.find( 'input[name="log"]' ),
				password 		= theForm.find( 'input[name="pwd"]' ),
				remember 		= theForm.find( 'input[name="rememberme"]' ),
				redirect 		= theForm.find( 'input[name="redirect_to"]' ),
				reauth 			= theForm.find( 'input[name="reauth"]' ),
				reCaptchaField 	= theForm.find( '.pp-grecaptcha' ),
				reCaptchaValue 	= reCaptchaField.attr( 'data-pp-grecaptcha-response' ),
				hCaptchaField 	= theForm.find( '.pp-hcaptcha' ),
				hCaptchaValue 	= hCaptchaField.find('iframe').attr('data-hcaptcha-response'),
				self 			= this;
		
			username.parents('.pp-login-form-field').find( '.pp-lf-error' ).remove();
			password.parents('.pp-login-form-field').find( '.pp-lf-error' ).remove();
			reCaptchaField.parent().find( '.pp-lf-error' ).remove();
			hCaptchaField.parent().find( '.pp-lf-error' ).remove();

			// Validate username.
			if ( '' === username.val().trim() ) {
				$('<span class="pp-lf-error">').insertAfter( username.parent() ).html( this.messages.empty_username );
				return;
			}

			// Validate password.
			if ( '' === password.val() ) {
				$('<span class="pp-lf-error">').insertAfter( password.parent() ).html( this.messages.empty_password );
				return;
			}

			// Validate reCAPTCHA.
			if ( reCaptchaField.length > 0 ) {
				if ( 'undefined' === typeof reCaptchaValue || reCaptchaValue === false ) {
					if ( 'normal' == reCaptchaField.data( 'validate' ) ) {
						$('<span class="pp-lf-error">').insertAfter( reCaptchaField ).html( this.messages.empty_recaptcha );
						return;
					} else if ( 'invisible' == reCaptchaField.data( 'validate' ) ) {
						// Invoke the reCAPTCHA check.
						if ( 'undefined' !== typeof reCaptchaField.data( 'action' ) ) {
							// V3
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ), {action: reCaptchaField.data( 'action' )} );
						}
						else {
							// V2
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ) );
						}
					}
				}
			}

			// Validate if hCaptcha is enabled and checked
			if ( hCaptchaField.length > 0 ) { 
				if ( 'undefined' === typeof hCaptchaValue || hCaptchaValue === false || hCaptchaValue === '' ) {
					$('<span class="pp-lf-error">').insertAfter( hCaptchaField ).html( this.messages.empty_recaptcha );
					return;
				}
			}

			var formData = new FormData( theForm[0] );

			formData.append( 'action', 'pp_lf_process_login' );
			formData.append( 'page_url', this.settings.page_url );
			formData.append( 'username', username.val() );
			formData.append( 'password', password.val() );

			if ( redirect.length > 0 && '' !== redirect.val() ) {
				formData.append( 'redirect', redirect.val() );
			}

			if ( reauth.length > 0 && '' !== reauth.val() ) {
				formData.append( 'reauth', 1 );
			}

			if ( remember.length > 0 && remember.is(':checked') ) {
				formData.append( 'remember', '1' );
			}

			if ( reCaptchaField.length > 0 ) {
				formData.append( 'recaptcha', true );
				formData.append( 'recaptcha_validate', reCaptchaField.data( 'validate' ) );
				if ( reCaptchaField.data( 'invisible' ) ) {
					formData.append( 'recaptcha_invisible', true );
				}
			}
			if ( reCaptchaValue ) {
				formData.append( 'recaptcha_response', reCaptchaValue );
			}

			if ( hCaptchaField.length > 0 ) {
				formData.append( 'hcaptcha', true );
			}
			if ( 'undefined' !== typeof hCaptchaValue || hCaptchaValue !== false ) {
				formData.append( 'hcaptcha_response', hCaptchaValue );
			}

			// Wordfence 2FA.
			if ( self.node.find( 'input[name="wfls-token"]' ).length > 0 ) {
				formData.append( 'wfls-token', self.node.find( 'input[name="wfls-token"]' ).val().toString() );
			}

			this._disableForm();

			this._ajax( formData, function( response ) {
				if ( ! response.success ) {
					self._enableForm();
					theForm.find( '.pp-lf-error' ).remove();
					$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data );
				} else {
					if ( response.data.wordfence_2fa ) {
						self._enableForm();

						// Remove captcha fields as we already have verified.
						self.node.find( '.pp-field-type-recaptcha' ).remove();
						self.node.find( '.pp-field-type-hcaptcha' ).remove();

						self.node.find( '.pp-login-form-wrap' ).addClass( 'wordfence-2fa' );
						$('<p>' + response.data.field_desc + '</p>').insertBefore( self.node.find( '.pp-login-form-fields' ) );
						var authField = '<div class="pp-login-form-field pp-field-group wordfence_2fa">\
							<label for="wfls-token">'+ response.data.field_label +'</label>\
							<div class="pp-field-inner">\
								<input type="text" name="wfls-token" id="wfls-token" class="pp-login-form--input" value="" size="6" autocomplete="one-time-code">\
							</div>\
						</div>';
						$( authField ).insertBefore(
							self.node.find( '.pp-field-type-submit' )
						);
						return;
					}
					var reload = function() {
						if ( 'URLSearchParams' in window ) {
							var query = new URLSearchParams( location.search );
							query.delete( 'reset_success' );

							window.location.href = '' !== query.toString() ? window.location.pathname + '?' + query.toString() : window.location.pathname;
						} else {
							window.location.reload();
						}
					};

					if ( response.data.redirect_url ) {
						var hostUrl = location.protocol + '//' + location.host;
						var redirectUrl = '';

						if ( '' === response.data.redirect_url.split( hostUrl )[0] ) {
							redirectUrl = response.data.redirect_url.split( hostUrl )[1];
						} else {
							redirectUrl = response.data.redirect_url.split( hostUrl )[0];
						}

						if ( redirectUrl === location.href.split( hostUrl )[1] ) {
							reload();
						} else {
							window.location.href = response.data.redirect_url;
						}
					} else {
						reload();
					}
				}
			} );
		},

		_lostPassFormSubmit: function(e) {
			e.preventDefault();

			var theForm = $(e.target),
				username = theForm.find( 'input[name="user_login"]' ),
				reCaptchaField 	= theForm.find( '.pp-grecaptcha' ),
				reCaptchaValue 	= reCaptchaField.attr( 'data-pp-grecaptcha-response' ),
				hCaptchaField 	= theForm.find( '.pp-hcaptcha' ),
				hCaptchaValue 	= hCaptchaField.find('iframe').attr('data-hcaptcha-response'),
				self = this;

			username.parent().find( '.pp-lf-error' ).remove();
			reCaptchaField.parent().find( '.pp-lf-error' ).remove();
			hCaptchaField.parent().find( '.pp-lf-error' ).remove();

			if ( '' === username.val().trim() ) {
				$('<span class="pp-lf-error">').insertAfter( username ).html( this.messages.empty_username );
				return;
			}

			// Validate reCAPTCHA.
			if ( reCaptchaField.length > 0 ) {
				if ( 'undefined' === typeof reCaptchaValue || reCaptchaValue === false ) {
					if ( 'normal' == reCaptchaField.data( 'validate' ) ) {
						$('<span class="pp-lf-error">').insertAfter( reCaptchaField ).html( this.messages.empty_recaptcha );
						return;
					} else if ( 'invisible' == reCaptchaField.data( 'validate' ) ) {
						// Invoke the reCAPTCHA check.
						if ( 'undefined' !== typeof reCaptchaField.data( 'action' ) ) {
							// V3
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ), {action: reCaptchaField.data( 'action' )} );
						}
						else {
							// V2
							grecaptcha.execute( reCaptchaField.data( 'widgetid' ) );
						}
					}
				}
			}

			// Validate if hCaptcha is enabled and checked
			if ( hCaptchaField.length > 0 ) { 
				if ( 'undefined' === typeof hCaptchaValue || hCaptchaValue === false || hCaptchaValue === '' ) {
					$('<span class="pp-lf-error">').insertAfter( hCaptchaField ).html( this.messages.empty_recaptcha );
					return;
				}
			}

			var formData = new FormData( theForm[0] );

			formData.append( 'action', 'pp_lf_process_lost_pass' );
			formData.append( 'page_url', this.settings.page_url );

			if ( reCaptchaField.length > 0 ) {
				formData.append( 'recaptcha', true );
				formData.append( 'recaptcha_validate', reCaptchaField.data( 'validate' ) );
				if ( reCaptchaField.data( 'invisible' ) ) {
					formData.append( 'recaptcha_invisible', true );
				}
			}
			if ( reCaptchaValue ) {
				formData.append( 'recaptcha_response', reCaptchaValue );
			}

			if ( hCaptchaField.length > 0 ) {
				formData.append( 'hcaptcha', true );
			}
			if ( 'undefined' !== typeof hCaptchaValue || hCaptchaValue !== false ) {
				formData.append( 'hcaptcha_response', hCaptchaValue );
			}

			this._disableForm();

			this._ajax( formData, function( response ) {
				self._enableForm();
				if ( ! response.success ) {
					username.parent().find( '.pp-lf-error' ).remove();
					$('<span class="pp-lf-error">').insertAfter( username ).html( response.data );
				} else {
					$('<p class="pp-lf-success">').insertAfter( theForm ).html( self.messages.email_sent );
					theForm.hide();
				}
			} );
		},

		_resetPassFormSubmit: function(e) {
			e.preventDefault();

			var theForm = $(e.target),
				password_1 = theForm.find( 'input[name="password_1"]' ),
				password_2 = theForm.find( 'input[name="password_2"]' ),
				self	= this;

			password_1.parent().find( '.pp-lf-error' ).remove();
			password_2.parent().find( '.pp-lf-error' ).remove();

			if ( '' === password_1.val() ) {
				$('<span class="pp-lf-error">').insertAfter( password_1 ).html( this.messages.empty_password_1 );
				return;
			}

			if ( '' === password_2.val() ) {
				$('<span class="pp-lf-error">').insertAfter( password_2 ).html( this.messages.empty_password_2 );
				return;
			}

			var formData = new FormData( theForm[0] );

			formData.append( 'action', 'pp_lf_process_reset_pass' );
			formData.append( 'page_url', this.settings.page_url );

			this._disableForm();

			this._ajax( formData, function( response ) {
				self._enableForm();
				if ( ! response.success ) {
					theForm.find( '.pp-lf-error' ).remove();
					$('<span class="pp-lf-error">').appendTo( theForm ).html( response.data );
				} else {
					if ( 'URLSearchParams' in window ) {
						var query = new URLSearchParams( location.search );
						query.delete( 'reset_pass' );
						query.delete( 'key' );
						query.delete( 'id' );
						query.append( 'reset_success', '1' );

						window.location.href = window.location.pathname + '?' + query.toString();
					} else {
						$('<p class="pp-lf-success">').insertAfter( theForm ).html( self.messages.reset_success );
						theForm.hide();
					}
				}
			} );
		},

		_enableForm: function() {
			this.node.find( '.pp-login-form-wrap' ).removeClass( 'pp-event-disabled' );
		},

		_disableForm: function() {
			this.node.find( '.pp-login-form-wrap' ).addClass( 'pp-event-disabled' );
		},

		_getNonce: function() {
			return this.node.find( '.pp-login-form input[name="pp-lf-login-nonce"]' ).val();
		},

		_ajax: function( data, callback ) {
			var ajaxArgs = {
				type: 'POST',
				url: bb_powerpack.getAjaxUrl(),
				data: data,
				dataType: 'json',
				success: function( response ) {
					if ( 'function' === typeof callback ) {
						callback( response );
					}
				}
			};

			if ( 'undefined' === typeof data.provider ) {
				ajaxArgs.processData = false,
				ajaxArgs.contentType = false;
			}

			$.ajax( ajaxArgs ).fail( function( jqXhr ) {
				if ( 503 === jqXhr.status ) {
					if ( null !== jqXhr.responseText.match( /<!DOCTYPE|<!doctype/ ) ) {
						document.write( jqXhr.responseText );
					}
				}
			} );
		},
	};

})(jQuery);(function($) {

	new PPLoginForm({
		id: 'ksi6rf58nzt2',
		messages: {"empty_username":"\uc0ac\uc6a9\uc790 \uc774\ub984\uc774\ub098 \uc774\uba54\uc77c \uc8fc\uc18c\ub97c \uc785\ub825\ud558\uc138\uc694.","empty_password":"\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694.","empty_password_1":"\ube44\ubc00\ubc88\ud638\ub97c \uc785\ub825\ud558\uc138\uc694.","empty_password_2":"\ube44\ubc00\ubc88\ud638\ub97c \ub2e4\uc2dc \uc785\ub825\ud558\uc138\uc694.","empty_recaptcha":"\ub85c\ubd07\uc774 \uc544\ub2d8\uc744 \ud655\uc778\ud558\ub824\uba74 \ucea1\ucc28\ub97c \ud655\uc778\ud558\uc138\uc694.","email_sent":"\uacc4\uc815\uc758 \uc774\uba54\uc77c \uc8fc\uc18c\ub85c \ube44\ubc00\ubc88\ud638 \uc7ac\uc124\uc815 \uc774\uba54\uc77c\uc774 \ubc1c\uc1a1\ub418\uc5c8\uc9c0\ub9cc, \ubc1b\uc740 \ud3b8\uc9c0\ud568\uc5d0 \ub3c4\ucc29\ud558\ub294 \ub370 \uba87 \ubd84 \uc815\ub3c4 \uc18c\uc694\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ucd5c\uc18c 10\ubd84 \uc815\ub3c4 \uae30\ub2e4\ub9b0 \ud6c4 \ub2e4\uc2dc \uc7ac\uc124\uc815\uc744 \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.","reset_success":"\ube44\ubc00\ubc88\ud638\uac00 \uc131\uacf5\uc801\uc73c\ub85c \uc7ac\uc124\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4."},
		page_url: 'https://www.jk-withme.com/login/',
		facebook_login: false,
		facebook_app_id: '',
		facebook_sdk_url: 'https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v11.0',
		google_login: false,
		google_client_id: '',
		ajaxurl: 'https://www.jk-withme.com/wp-admin/admin-ajax.php'
	});

})(jQuery);jQuery(function($) {
	
		$(function() {
		$( '.fl-node-fks8v034h7oj .fl-photo-img' )
			.on( 'mouseenter', function( e ) {
				$( this ).data( 'title', $( this ).attr( 'title' ) ).removeAttr( 'title' );
			} )
			.on( 'mouseleave', function( e ){
				$( this ).attr( 'title', $( this ).data( 'title' ) ).data( 'title', null );
			} );
	});
		window._fl_string_to_slug_regex = 'a-zA-Z0-9';
});

/* Start Global Node Custom JS */

/* End Global Node Custom JS */


/* Start Layout Custom JS */

/* End Layout Custom JS */

