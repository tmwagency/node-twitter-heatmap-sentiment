var TMW = window.TMW || {};

TMW.TwitterHeatMap = {
	socket : null,

	heatMap : null,

	tweetCircles : [],

	mapOptions : {
		center: new google.maps.LatLng(54.559322, -4.174804),
		zoom: 5,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
		scaleControl: true
	},

	ANIMATON_DURATION : 60, //assuming 60 frames per second, our animation should last a second (60 frames)
	FILL_OPACITY : 0.35,


	init : function () {

		this.heatMap = new google.maps.Map(document.getElementById("heatmap"), this.mapOptions);

		this.makeSocketConnection();

		this.EventListeners.onPageStart();

		//call the animation loop, which controls animation on the page
		//at the moment this is the animation of the circles drawn on the google map
		this.animationLoop();

	},

	makeSocketConnection : function () {

		log('script.js :: making connection');

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},


	setupScreen : function (state) {

		log('script.js :: setupScreen');

		//add tags to the screen so we can see what's being tracked
		//TMW.TwitterHeatMap.heatmap

		TMW.TwitterHeatMap.EventListeners.onTweet();

	},

	reactToTweet : function (data) {

		var coords = TMW.TwitterHeatMap.getCoords(data, TMW.TwitterHeatMap.renderTweetToMap);

		//TMW.TwitterHeatMap.renderTweetToMap(coords);

		$('#last-update').innerHTML = new Date().toTimeString();

	},


	//gets a set of coordinates from a data object (which is the tweet returned by twitter)
	getCoords : function (data, cb) {

		//if we have coordinates, great – means we don't have to look up ourselves
		if (data.coordinates !== null) {
			var coords = data.coordinates.coordinates;
			cb (coords);

		//if not, we need to check the 'place' attribute, and do the coord lookup ourself using the Maps API
		} else {
			var place = data.place;

			TMW.TwitterHeatMap.lookupCoordsFromPlace(place, function (coords) {
				cb (coords);
			});
		}

	},


	//looks up the coordinates using the Maps API from the place details that we were sent by twitter
	lookupCoordsFromPlace : function (place, cb) {

		var geocoder = new google.maps.Geocoder(),
			address = place.full_name + ', ' + place.country;

		geocoder.geocode( { 'address': address}, function(results, status) {

			var coords = [];
			//if we have a good result, then return it
			if (results !== null && status === 'OK') {
				coords[0] = results[0].geometry.location['A'];
				coords[1] = results[0].geometry.location['k'];
				cb (coords);
			}

		});

	},


	renderTweetToMap : function (coords, trackedOn) {

		//position: myLatlng,
		if (coords[0] !== null && coords[1] !== null) {

			//work out the radius we should use based on the zoom level
			//TMW.TwitterHeatMap.heatMap.get(zoom);
			//20000

			var pointLatlng = new google.maps.LatLng(coords[1], coords[0]),
				pointOptions = {
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 1,
					fillColor: '#FF0000',
					fillOpacity: TMW.TwitterHeatMap.FILL_OPACITY,
					map: TMW.TwitterHeatMap.heatMap,
					center: pointLatlng,
					radius: 20000
				};

			var pointCircle = new google.maps.Circle(pointOptions);

			TMW.TwitterHeatMap.tweetCircles.push(pointCircle);
		}

	},

	animationLoop : function () {

		TMW.TwitterHeatMap.animateCircles();

		requestAnimFrame(TMW.TwitterHeatMap.animationLoop);

	},

	animateCircles : function () {

		var i = 0,
			numberOfCircles = TMW.TwitterHeatMap.tweetCircles.length,
			point,
			fillOpacity,
			fillDecrement,
			strokeOpacity,
			strokeDecrement;

		for (i, numberOfCircles; i < numberOfCircles; i++) {

			point = TMW.TwitterHeatMap.tweetCircles[i];

			fillOpacity = point.get("fillOpacity");
			fillDecrement = (fillOpacity*3) / 100;


			if (fillDecrement < 0.005) {
				fillDecrement = 0.005;
			}

			//reduce opacity
			fillOpacity = fillOpacity - fillDecrement;

			//check that the opacity hasn't passed past 0
			if (fillOpacity < 0) {
				fillOpacity = 0;
			}

			if (fillOpacity > 0) {

				strokeOpacity = point.get("strokeOpacity");
				strokeDecrement = (strokeOpacity*3.5) / 100;

				if (strokeDecrement < 0.02) {
					strokeDecrement = 0.02;
				}


				strokeOpacity = strokeOpacity - strokeDecrement;

				if (strokeOpacity < 0) {
					strokeOpacity = 0;
				}

				radius = point.get("radius");
				radius += 450;

				point.setOptions({
					fillOpacity: fillOpacity,
					strokeOpacity: strokeOpacity,
					radius: radius
				});

			} else {

				//remove our circle as it's now invisible to the canvas
				point.setMap(null);

			}
		}

	},


	EventListeners : {
		onPageStart : function () {

			log('script.js :: event :: onPageStart');

			//will receive this event when a connection is made
			TMW.TwitterHeatMap.socket.on('data', TMW.TwitterHeatMap.setupScreen);


		},
		onTweet : function () {

			var newListElement;

			//this handles the tweets we receive from our server
			TMW.TwitterHeatMap.socket.on('tweet', TMW.TwitterHeatMap.reactToTweet);

		}
	},


	makeVotesReadable : function (votes) {

		return addCommas(votes);

	},

};


/**
 * Add commas to
 * @param {[type]} nStr [description]
 */
		function addCommas(nStr){
		  nStr += '';
		  x = nStr.split('.');
		  x1 = x[0];
		  x2 = x.length > 1 ? '.' + x[1] : '';
		  var rgx = /(\d+)(\d{3})/;
		  while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		  }
		  return x1 + x2;
		}


//  ================
//  === EASY LOG ===
//  ================
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
		window.log = function f() {
				log.history = log.history || [];
				log.history.push(arguments);
				if (this.console) {
						var args = arguments,
								newarr;
						try {
								args.callee = f.caller;
						} catch (e) {}
						newarr = [].slice.call(args);
						if (typeof console.log === 'object')  {
							log.apply.call(console.log, console, newarr);
						} else {
							console.log.apply(console, newarr);
						}
				}
		};

//  ========================
//  === Prepend function ===
//  ========================

Element.prototype.prependChild = function(child) { this.insertBefore(child, this.firstChild); };

//  ===========================
//  === Allow bind for IE9< ===
//  ===========================
		if(!function(){}.bind){
		  Function.prototype.bind = function(){
			var me = this
			, shift = [].shift
			, he = shift.apply(arguments)
			, ar = arguments
			return function(){
			  return me.apply(he, ar);
			}
		  }
		}

//  ============================================
//  === getElementsByClassName for everyone! ===
//  ============================================
		if (typeof document.getElementsByClassName!='function') {
			document.getElementsByClassName = function() {
				var elms = document.getElementsByTagName('*');
				var ei = new Array();
				for (i=0;i<elms.length;i++) {
					if (elms[i].getAttribute('class')) {
						ecl = elms[i].getAttribute('class').split(' ');
						for (j=0;j<ecl.length;j++) {
							if (ecl[j].toLowerCase() == arguments[0].toLowerCase()) {
								ei.push(elms[i]);
							}
						}
					} else if (elms[i].className) {
						ecl = elms[i].className.split(' ');
						for (j=0;j<ecl.length;j++) {
							if (ecl[j].toLowerCase() == arguments[0].toLowerCase()) {
								ei.push(elms[i]);
							}
						}
					}
				}
				return ei;
			}
		}


/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

	window.matchMedia || (window.matchMedia = function() {
		"use strict";

		// For browsers that support matchMedium api such as IE 9 and webkit
		var styleMedia = (window.styleMedia || window.media);

		// For those that don't support matchMedium
		if (!styleMedia) {
			var style       = document.createElement('style'),
				script      = document.getElementsByTagName('script')[0],
				info        = null;

			style.type  = 'text/css';
			style.id    = 'matchmediajs-test';

			script.parentNode.insertBefore(style, script);

			// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
			info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

			styleMedia = {
				matchMedium: function(media) {
					var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

					// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
					if (style.styleSheet) {
						style.styleSheet.cssText = text;
					} else {
						style.textContent = text;
					}

					// Test if media query is true or false
					return info.width === '1px';
				}
			};
		}

		return function(media) {
			return {
				matches: styleMedia.matchMedium(media || 'all'),
				media: media || 'all'
			};
		};
	}());

//  =============================================
//  === shim layer for requestAnimationFrame  ===
//  === with setTimeout fallback              ===
//  =============================================

	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
			  window.webkitRequestAnimationFrame ||
			  window.mozRequestAnimationFrame    ||
			  function( callback ){
				window.setTimeout(callback, 1000 / 60);
			  };
	})();

//  ===========================================
//  === globals Element:true, NodeList:true ===
//  ===========================================

		$ = (function (document, $) {
			var element = Element.prototype,
				nodeList = NodeList.prototype,
				forEach = 'forEach',
				trigger = 'trigger',
				each = [][forEach],

				dummyEl = document.createElement('div');

			nodeList[forEach] = each;

			element.on = function (event, fn) {
				this.addEventListener(event, fn, false);
				return this;
			};

			nodeList.on = function (event, fn) {
				each.call(this, function (el) {
					el.on(event, fn);
				});
				return this;
			};

			element.trigger = function (type, data) {
				var event = document.createEvent('HTMLEvents');
				event.initEvent(type, true, true);
				event.data = data || {};
				event.eventName = type;
				event.target = this;
				this.dispatchEvent(event);
				return this;
			};

			nodeList.trigger = function (event) {
				each.call(this, function (el) {
					el[trigger](event);
				});
				return this;
			};

			$ = function (s) {
				var r = document.querySelectorAll(s || '☺'),
					length = r.length;
				return length == 1 ? r[0] : !length ? nodeList : r;
			};

			$.on = element.on.bind(dummyEl);
			$.trigger = element[trigger].bind(dummyEl);

			return $;
		})(document);



TMW.TwitterHeatMap.init();