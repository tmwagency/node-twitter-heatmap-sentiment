Node Twitter Location Heatmap
====================

This builds on the initial demos - the [Node Basic Structure demo](https://github.com/tmwagency/node-basic-setup) and the [Node Twitter Wall demo](https://github.com/tmwagency/node-twitter-wall).

This demo shows how to hook into the Twitter streaming API to display a heatmap of where in the UK tweets are currently being sent.

Building on the basic app's structure, it uses Desmond Morris' node-twitter library to connect to Twitter.

Note, that you will need to add your own Twitter API keys for this demo to work when run – see the documentation for how to create one and where this needs to be added into the app.

## Creating your API Key

To do this go to the [Twitter developer site](https://dev.twitter.com/), Sign in, and from the menu in the top right corner click on the 'My applications' option.

<img src="http://i.imgur.com/qPwQdoi.jpg" alt="Image to show the My applications option on the Twitter Devs site" />

Then click on create a new application in the top right of the screen, and fill out the 'Create an application' form.  Once this is done, scroll to the bottom of the page to 'Your access token' and click on the 'Create my access token' button.

<img src="http://i.imgur.com/uyAiZ86.jpg" alt="Image to show how to create Your Access tokens from the Twitter Dev site" />

The access token takes a few moments to be created, so give it a minute or so, refresh the page and you should see that Twitter has assigned your app an Access token.

There are then 4 values you need to make a note of on this page and add into the demo config.

- Consumer key
- Consumer secret
- Access token
- Access token secret

An example private config is located at `config/exampleconfig-twitter.js`.  Open this file in your text editor of choice and look for the following block of code

	local : {
		consumer_key: 'INSERT_CONSUMER_KEY_HERE',
		consumer_secret: 'INSERT_CONSUMER_SECRET_HERE',
		access_token_key: 'INSERT_ACCESS_TOKEN_KEY_HERE',
		access_token_secret: 'INSERT_ACCESS_TOKEN_SECRET_HERE'
	}

Replace the variables in CAPS with the values from your own created app.

Save and rename the file as privconfig-twitter.js and run the node application in the usual way, running `node index.js`.