
var path = require('path'),
	rootPath = path.normalize(__dirname + '/..'), //sets root path
	config,
	sharedConfig;

var sharedConfig = {
	root: rootPath,
	db : {
		path: {}
	},
	twitter: {
		consumer_key: process.env.TWITTER_CONSUMER_KEY,
		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN,
		access_token_secret: process.env.TWITTER_ACCESS_SECRET
	}
};

config = {
	local: {
		mode:	'local',
		port:	3003,
		app: {
			name: 'Twitter vote counter - local'
		},
		url:	'',
		global:	sharedConfig
	},

	dev: {
		mode:	'dev',
		port:	3003,
		app: {
			name: 'Twitter vote counter - Dev'
		},
		global:	sharedConfig
	},

	prod: {
		mode:	'prod',
		port:	3003,
		app: {
			name: 'Twitter vote counter - Prod'
		},
		global:	sharedConfig
	},

	hosts: [
		{
			domain: 'twitter-wall.local',
			target: ['localhost:3003']
		}
	]
};


// Export config
module.exports = config;