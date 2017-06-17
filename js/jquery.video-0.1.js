/*
 * Bootstrap video player
 * A customizable HTML5 video player using jQuery and based on bootstrap UI
 * version: 0.1
 * Author: anrodse@hotmail.com
 * 2017 © anrodse.tk
 */

(function($){
	$.fn.videoUI = function(options) {

		var settings = $.extend({
			'autoHide':true,
			'autoPlay':false,
			'progressMedia' : true,
			'playMedia'  : true,
			'timerMedia': true,
			'volumeMediaPercent':70,
			'subtitleMedia':true,
			'audioMedia':true,
			'videoMedia':true,
			'fullscreenMedia':true,
		}, options);

		var video = document.getElementById(this.attr('id'));
		var controllerClass = this.attr('id');
		var pControllerClass = ' .'+controllerClass;
		var controlBtnClass = 'pnControl';
		var pControlBtnClass = ' .'+controlBtnClass;
		var duration = currentTime = timer = seekx = seekPos = buffered = timerBuffer = 0;

		this.after('<div class="video-control '+controllerClass+'"></div></div>');

		/***** Progress bar *****/
		video.addEventListener("loadedmetadata", function() {
			duration = video.duration;

			var timerBuffer = setInterval(function(){
				buffered = video.buffered.end(0)+video.buffered.start(0);

				if (video.currentTime == buffered){ clearInterval(timerBuffer); }
				else{ var prog = Math.min(buffered/duration*100,100); $(pControllerClass+' .vid-progress .bufferBar').width(prog+'%'); }
			},500);
		});

		/**
		 * Progress bar
		 */
		if(settings.progressMedia){
			var bufferBar = '<div class="vbar bufferBar" style="width:0%;"></div>';
			var progressBar = '<div class="vbar progressBar" style="width:0%;"></div>';
			$(pControllerClass).append('<div class="vid-progress" style="cursor:pointer">' + bufferBar  + progressBar + '</div>');

			this.on('play',function(){
				timer = setInterval(function(){
					currentTime = video.currentTime;
					var width = Math.min((video.currentTime/video.duration)*100,100)+'%';
					$(pControllerClass+' .vid-progress .progressBar').width(width);
				},100);
			});

			this.on('suspend',function(){ $(pControllerClass+' .vid-progress').addClass('progress-striped active'); });
			this.on('timeupdate',function(){ $(pControllerClass+' .vid-progress').removeClass('progress-striped active'); })

			$(pControllerClass+' .vid-progress').mousemove(function(e){ seekx = e.pageX - $(this).offset().left; });

			$(pControllerClass+' .vid-progress').on('click',function(e){
				seekPos = seekx/$(this).width()*100;
				video.currentTime = video.duration*seekPos/100;
				//video.play();

				return false;
			});
		}

		// Controls
		$(pControllerClass).append('<div class="'+controlBtnClass+'">');

		/***** Left Controls *****/		
		if(settings.autoPlay){ video.play(); }

		/**
		 * Play button
		 */
		if (settings.playMedia){
			var container = pControllerClass+pControlBtnClass;
			$(container).append('<span class="playMedia player-btn glyphicon glyphicon-play"></span>');

			$(container+' .playMedia').on('click',function(e){
				(video.paused)?  video.play() : video.pause();
				return false;
			});

			this.on('play',function(){
				$(container+' .playMedia').addClass('glyphicon-pause').removeClass('glyphicon-play');
			});

			this.on('pause',function(){
				clearInterval(timer);
				$(container+' .playMedia').addClass('glyphicon-play').removeClass('glyphicon-pause');
			});

			this.on('ended', function() {
				clearInterval(timer);
				$(container+' .playMedia').addClass('glyphicon-play').removeClass('glyphicon-pause');
			});
		}
		
		/**
		 * Click video screen
		 */
		this.on('click',function(e){
			(video.paused)?  video.play() : video.pause();
			return false;
		});

		/**
		 * Volume control
		 */
		if (settings.volumeMediaPercent){
			var container = pControllerClass+pControlBtnClass;
			var volume = settings.volumeMediaPercent;

			// -- Volume button
			$(container).append('<span class="mute player-btn glyphicon glyphicon-volume-off" style="margin-right:5px;"></span>');

			// -- Volume control
			$(container).append('<div class="player-btn volumeSlider" style="margin:0;"><div class="volumeBar"><div class="volumeValue"></div></div></div>');
			
			function mute(){
				if (video.volume > 0){
					video.volume = 0;
					$(container+ ' .mute').addClass('glyphicon-volume-off').removeClass('glyphicon-volume-down').removeClass('glyphicon-volume-up');
					$(container + ' .volumeValue').width(video.volume*100 + '%');
				}
				else  setVolume(volume);
			}
			
			function setVolume(v){
				volume = Math.min(Math.max(v,2),100);	// Volume € [2,100]
				video.volume = volume/100;
					
				$(container + ' .volumeValue').width(volume + '%');
				if (volume < 50 ) $(container+ ' .mute').addClass('glyphicon-volume-down').removeClass('glyphicon-volume-up').removeClass('glyphicon-volume-off');
				else $(container+ ' .mute').addClass('glyphicon-volume-up').removeClass('glyphicon-volume-down').removeClass('glyphicon-volume-off');
			}

			$(container+ ' .mute').on('click', mute);
			$(container + ' .volumeBar').mousemove(function(e){ seekVol = e.pageX - $(this).offset().left; });
			$(container + ' .volumeBar').on('click',function(e){
				setVolume(seekVol/$(this).width()*100);

				return false;
			});

			setVolume(volume);
		}

		/**
		 * Timer
		 */
		if (settings.timerMedia){
			var container = pControllerClass+pControlBtnClass;

			$(container).append('<p class="player-btn timer">00:00</p>');
			var timerProgress = setInterval(function(){
				var durtime = video.duration;
				var curtime = video.currentTime;

				if (durtime && curtime) $(container+' .timer').html(seg2hhmmss(curtime) + ' / ' + seg2hhmmss(durtime));
				else if (curtime) $(container+' .timer').html(seg2hhmmss(curtime));
				else $(container+' .timer').html('00:00 / 00:00');
			},1000);
		}

		/***** Right Controls *****/

		/**
		 * Full screen
		 */
		if (settings.fullscreenMedia){
			var container = pControllerClass+pControlBtnClass;

			$(container).append('<p class="fullscreen player-btn glyphicon glyphicon-fullscreen"></p>');

			$(container+ ' .fullscreen').on('click',function(e){ fullscreenMode(video); });
		}

		this.on('dblclick',function(){
			fullscreenMode(video);

			return false;
		});

		/**
		 * Video tracks
		 */
		if (settings.videoMedia){
			if (video.videoTracks) {
				var container = pControllerClass+pControlBtnClass;

				var mediaContent = "";
				for (var i=0; i<video.videoTracks.length; i++){
					mediaContent += "<a class='video-"+i+"'><span class='glyphicon glyphicon-menu-right'></span> "+video.videoTracks[i].label+"</a><br />";
				}

				//var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover"';
				var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover" data-trigger="focus"';
				$(container).append('<label tabindex="-1" class="video player-btn glyphicon glyphicon-film" title="Video" '+popover+'></label>');

				$(container + ' .subtitles').popover().on('shown.bs.popover', function(e) {
					var $popup = $('#' + $(e.target).attr('aria-describedby'));
					
					for (var i=0; i<video.videoTracks.length; i++){
						if (video.videoTracks[i].mode == "showing"){
							$popup.find('.video-'+i + ' span').removeClass(' glyphicon-menu-right').addClass(' glyphicon-triangle-right');
							$popup.find('.video-'+i).css({"color":"ForestGreen"});
						}
						$popup.find('.video-'+i).on('click',{n: i},function(e) { setVideo(e.data.n, this); });
					}
				});
				
				function setVideo(n){
					for (var i=0; i<video.videoTracks.length; i++){
						video.videoTracks[i].selected = false;
					}
					video.videoTracks[n].selected = true;
				}
			}
		}

		/**
		 * Audio tracks
		 */
		if (settings.audioMedia){
			if (video.audioTracks) {
				var container = pControllerClass+pControlBtnClass;

				var mediaContent = "";
				for (var i=0; i<video.audioTracks.length; i++){
					mediaContent += "<a class='audio-"+i+"'><span class='glyphicon glyphicon-menu-right'></span> "+video.audioTracks[i].label+"</a><br />";
				}

				//var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover"';
				var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover" data-trigger="focus"';
				$(container).append('<label tabindex="-1" class="audio player-btn glyphicon glyphicon-sound-dolby" title="Audio" '+popover+'></label>');

				$(container + ' .subtitles').popover().on('shown.bs.popover', function (e) {
					var $popup = $('#' + $(e.target).attr('aria-describedby'));
					
					for (var i=0; i<video.audioTracks.length; i++){
						if (video.audioTracks[i].mode == "showing"){
							$popup.find('.audio-'+i + ' span').removeClass(' glyphicon-menu-right').addClass(' glyphicon-triangle-right');
							$popup.find('.audio-'+i).css({"color":"ForestGreen"});
						}
						$popup.find('.audio-'+i).on('click',{n: i},function (e) { setAudio(e.data.n, this); });
					}
				});
				
				function setAudio(n){
					for (var i=0; i<video.audioTracks.length; i++){
						video.audioTracks[i].enabled = false;
					}
					video.audioTracks[n].enabled = true;
				}
			}
		}

		/**
		 * Subtitle tracks
		 */
		if (settings.subtitleMedia){
			if (video.textTracks){
				var container = pControllerClass+pControlBtnClass;

				var mediaContent = "<a class='none'><span class='glyphicon glyphicon-ban-circle'></span> Desactivar</a><hr style='margin:2px 0;' />";
				for (var i=0; i<video.textTracks.length; i++){
					mediaContent += "<a class='subt-"+i+"'><span class='glyphicon glyphicon-menu-right'></span> "+video.textTracks[i].label+"</a><br />";
				}

				//var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover"';
				var popover = 'data-content="'+mediaContent+'" data-html="true" data-placement="top" data-toggle="popover" data-trigger="focus"';
				$(container).append('<label tabindex="-1" class="subtitles player-btn glyphicon glyphicon-subtitles" title="Subtitulos" '+popover+'></label>');

				$(container + ' .subtitles').popover().on('shown.bs.popover', function (e) {
					var $popup = $('#' + $(e.target).attr('aria-describedby'));
					
					var fSelected = false;
					for (var i=0; i<video.textTracks.length; i++){
						if (video.textTracks[i].mode == "showing"){
							$popup.find('.subt-'+i + ' span').removeClass(' glyphicon-menu-right').addClass(' glyphicon-triangle-right');
							$popup.find('.subt-'+i).css({"color":"ForestGreen"});
							fSelected = true;
						}
						$popup.find('.subt-'+i).on('click',{n: i},function (e) { setSub(e.data.n); });
					}
					if (!fSelected) { $popup.find('.none span').addClass(' glyphicon-ban-circle');  $popup.find('.none').css({"color":"green"});}
					$popup.find(' .none').on('click', function (e) { setSub(-1); });
				});
				
				function setSub(n){
					for (var i=0; i<video.textTracks.length; i++){
						video.textTracks[i].mode = "disabled";
					}
					if (n>=0) { video.textTracks[n].mode = "showing"; }
				}
			}
		}

		/***** Full screen mode *****/
		function fullscreenMode(element) {
			if(!this.isFullscreen) {
				if(element.requestFullScreen){ element.requestFullScreen(); }
				else if(element.mozRequestFullScreen){ element.mozRequestFullScreen(); }
				else if(element.webkitRequestFullScreen) { element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT); }
				else { alert('Does Not Support Full Screen Mode'); }
			}
			else {
				if(document.cancelFullscreen){ document.cancelFullscreen(); }
				else if(document.exitFullscreen){ document.exitFullscreen(); }
				else if(document.mozCancelFullScreen){ document.mozCancelFullScreen(); }
				else if(document.webkitCancelFullScreen){ document.webkitCancelFullScreen(); }
			}
		}

		/***** Autohide *****/
		if (settings.autoHide){
			var container = pControllerClass;

			$(container).fadeOut('linear');
			this.parents('.videoWrapper').mouseleave(function(e) {
				if (!$(container).is(':visible')){ e.stopPropagation(); }
				else $(container).delay(100).slideUp();
			});
			this.parents('.videoWrapper').mouseover(function(e) {
				if ($(container).is(':visible')) { e.stopPropagation(); }
				else $(container).delay(100).slideDown();
			});
		}

		/***** Extra methods *****/
		// Avanzar / rebobinar (skip(10), skip(-10))
		
		function seg2hhmmss(t){ var tiempo = new Date(t*1000).toTimeString(); return tiempo.replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").replace(/.*0{2}:(\d{2}:\d{2}).*/, "$1"); }
	};
})( jQuery );
