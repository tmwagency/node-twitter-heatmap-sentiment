
/**
 * Handles the db setup - adds the questions to the database if not there already
 * and handles the db connection
 */

var express = require('express')
	, io = require('socket.io') //socket.io - used for our websocket connection
	, client = require('socket.io-client')
	, twitter = require('twitter') //ntwitter - allows easy JS access to twitter API's - https://github.com/AvianFlu/ntwitter
	, _ = require('underscore')
	, sentiment = require('sentiment')

	, pkg = require('../package.json'),

	backoffTimer = 60000,

	BACKOFF_INCREMENT = 60000; //increments of a minute




module.exports = function (app, server, config) {

	//Start a Socket.IO listen
	var socketServer = io.listen(server);
	socketServer.set('log level', 1); //don't log all emits etc


	//  ==================
	//  === ON CONNECT ===
	//  ==================

	//If a client connects, give them the current data that the server has tracked
	//so here that would be how many tweets of each type we have stored
	socketServer.sockets.on('connection', function(socket) {
		console.log('twitter.js: New connection logged');

		socketServer.sockets.emit('data', t.globalState);
	});

	//  ============================
	//  === SERVER ERROR LOGGING ===
	//  ============================

	socketServer.sockets.on('close', function(socket) {
		console.log('twitter.js: socketServer has closed');
	});

	//  ====================================
	//  === TWITTER CONNECTION TO STREAM ===
	//  ====================================

	//Instantiate the twitter component
	var t = new twitter(config.twitter);

	//  ===============================
	//  === State related function  ===
	//  ===============================
	t.globalState = {
		tags : ['']
	}

	t.openStream = function () {

		console.log('twitter.js: Opening Stream');
		t.createStream();

	};
	t.createStream = function () {

		var tweet,
			tweetText;

		//Tell the twitter API to filter on the watchSymbols
		t.stream('statuses/filter', {
			//track: t.globalState.tags,
			locations: '-13.413930,49.162090,1.768960,60.854691',
			language: 'en'
		}, function(stream) {

			//We have a connection. Now watch the 'data' event for incomming tweets.
			stream.on('data', t.emitTweet);
			//catch any errors from the streaming API
			stream.on('error', function(error) {
				console.log("twitter.js: My error: ", error);
			});
			stream.on('end', function (response) {
				// Handle a disconnection
				console.log("twitter.js: Disconnection: ", response.statusCode);
				console.log(response);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					t.openStream();
				}, backoffTimer);

				if (response.statusCode === '402') {
					backoffTimer += BACKOFF_INCREMENT; //exponential backoff
				}

			});
			stream.on('destroy', function (response) {
				// Handle a 'silent' disconnection from Twitter, no end/error event fired
				console.log("twitter.js: Destroyed: ", response);

				//try reconnecting to twitter in 30 seconds
				setTimeout(function () {
					t.openStream();
				}, backoffTimer);
			});
		});

	};

	//this function is called any time we receive some data from the twitter stream
	//we go through the tags, work out which one was mentioned, and then update the GlobalState
	t.emitTweet = function (data) {
		//console.log('twitter.js: receiving');

		//Make sure it was a valid tweet
		if (data.text !== undefined) {

			//We're going to do some indexOf comparisons and we want it to be case agnostic
			tweet = data;

			tweet.sentiment = t.analyseSentiment(data.text);

			socketServer.sockets.emit('tweet', tweet);
		}
	};

	t.analyseSentiment = function (tweet) {

		//analyse our tweet for sentiment
		var sentimentScore = sentiment(tweet);

		return sentimentScore;

	};

	t.openStream();

	return t;

};


