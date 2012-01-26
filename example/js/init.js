// PROJECT: Phonegap Twitter with ChildBrowser
// AUTHOR: Drew Dahlman ( www.drewdahlman.com )
// DATE: 1.25.2012

/* 
NOTES:
We will use the ChildBrowser to get a user to sign in to Twitter.
We will store this information in our localStorage and be able to reuse this when we need!

You can read into this more, but storing these keys like this is VERY dangerous!!
So make sure you don't share your source code until you've removed your keys and secrets!
*/

// GLOBAL VARS
var oauth; // Holds out oAuth request
var requestParams; // Specific request params
var options = { 
            consumerKey: 'XXXXXXXXXXXXXXXXXX', // REPLACE WITH YOUR CONSUMER_KEY
            consumerSecret: 'XXXXXXXXXXXXXXXXXXXXX', // REPLACE WITH YOUR CONSUMER_SECRET
            callbackUrl: "http://www.example.com" }; // YOUR URL 
			
var cb = ChildBrowser.install(); // install our ChildBrowser ( cb )
var twitterKey = "twttrKey"; // what we will store our twitter user information in



var Twitter = {
    init:function(){
		
		// our storedAccessData and Raw Data
        var storedAccessData, rawData = localStorage.getItem(twitterKey);
		
		// First thing we need to do is check to see if we already have the user saved!
		if(localStorage.getItem(twitterKey) !== null){
			
			// If we already have them
			storedAccessData = JSON.parse(rawData); // Parse our JSON object
			options.accessTokenKey = storedAccessData.accessTokenKey; // This is saved when they first sign in
			options.accessTokenSecret = storedAccessData.accessTokenSecret; // this is saved when they first sign in
			
			// jsOAuth takes care of everything for us we just need to provide the options
			oauth = OAuth(options);
			oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
					function(data) {
						var entry = JSON.parse(data.text);
						console.log("USERNAME: " + entry.screen_name);
					}
			);
		}
		else {
			
			// We don't have a user saved yet
			oauth = OAuth(options);
			oauth.get('https://api.twitter.com/oauth/request_token',
				function(data) {
					requestParams = data.text;
					cb.showWebPage('https://api.twitter.com/oauth/authorize?'+data.text); // This opens the Twitter authorization / sign in page     
					cb.onLocationChange = function(loc){ Twitter.success(loc); }; // When the ChildBrowser URL changes we need to track that
				},
				function(data) { 
					console.log("ERROR: "+data);
				}
			);
		}
    },
	
	/*
	When The ChildBrowser URL changes we will track it here.
	We will also determine if the request was a success or not here
	*/
	success:function(loc){
		
		// The supplied oauth_callback_url for this session is being loaded
		
		/*
		We will check to see if the childBrowser's new URL matches our callBackURL
		*/
		if (loc.indexOf("http://www.example.com/?") >= 0) {
			
			// Parse the returned URL
			var index, verifier = '';            
			var params = loc.substr(loc.indexOf('?') + 1);
			
			params = params.split('&');
			for (var i = 0; i < params.length; i++) {
				var y = params[i].split('=');
				if(y[0] === 'oauth_verifier') {
					verifier = y[1];
				}
			}
			
			// Exchange request token for access token
			
			/*
			Once a user has given us permissions we need to exchange that request token for an access token
			we will populate our localStorage here.
			*/
			oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,
					function(data) {               
						var accessParams = {};
						var qvars_tmp = data.text.split('&');
						for (var i = 0; i < qvars_tmp.length; i++) {
							var y = qvars_tmp[i].split('=');
							accessParams[y[0]] = decodeURIComponent(y[1]);
						}
						
						$('#oauthStatus').html('<span style="color:green;">Success!</span>');
						$('#stage-auth').hide();
						$('#stage-data').show();
						oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
						
						// Save access token/key in localStorage
						var accessData = {};
						accessData.accessTokenKey = accessParams.oauth_token;
						accessData.accessTokenSecret = accessParams.oauth_token_secret;
						
						// SETTING OUR LOCAL STORAGE
						console.log("TWITTER: Storing token key/secret in localStorage");
						localStorage.setItem(twitterKey, JSON.stringify(accessData));
						
						oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
								function(data) {
									var entry = JSON.parse(data.text);
									console.log("TWITTER USER: "+entry.screen_name);
									
									// FOR EXAMPLE ONLY
									app.init();
								},
								function(data) {
									console.log("ERROR: " + data); 
								}
						);
						
						// Since everything went well we can close our childBrowser!                             
						window.plugins.childBrowser.close();
				},
				function(data) { 
					console.log(data);
				   
				}
			);
		}
		else {
			// do nothing	
		}
	},
	tweet:function(){
		var storedAccessData, rawData = localStorage.getItem(twitterKey);
		
			storedAccessData = JSON.parse(rawData); // Parse our JSON object
			options.accessTokenKey = storedAccessData.accessTokenKey; // This is saved when they first sign in
			options.accessTokenSecret = storedAccessData.accessTokenSecret; // this is saved when they first sign in
			
			// jsOAuth takes care of everything for us we just need to provide the options
			oauth = OAuth(options);
			oauth.get('https://api.twitter.com/1/account/verify_credentials.json?skip_status=true',
					function(data) {
						var entry = JSON.parse(data.text);
						Twitter.post();
					}
			);
	},
	/*
	Now that we have the information we can Tweet!
	*/
	post:function(){
		var theTweet = $("#tweet").val(); // Change this out for what ever you want!
		
		oauth.post('https://api.twitter.com/1/statuses/update.json',
                    { 'status' : theTweet,  // jsOAuth encodes for us
                      'trim_user' : 'true' },
                    function(data) {
                        var entry = JSON.parse(data.text);
						console.log(entry);
						
						// FOR THE EXAMPLE
						app.done();
                    },
                    function(data) { 
						console.log(data);
                    }
            );		
	}
};

var app = {
	bodyLoad:function(){
		document.addEventListener("deviceready", app.deviceReady, false);
	},
	deviceReady:function(){
		app.init();
	},
	init:function(){
		
		// Lets start by checking if we have a twitter account or not...
		if(!localStorage.getItem(twitterKey)){
			$("#loginArea").fadeIn();
			$("#login").click(function(){
				Twitter.init();
			});
		}
		else {
			$("#loginArea").fadeOut();
			$("#tweetArea").fadeIn();
			
			$("#statusHold").hide();
			$("#tweetBTN").click(function(){
				if($("#tweet").val() == ""){
					alert("make sure you've filled out the text area!");
				}
				else {
					$("#statusHold").show();
					$("#tweet").hide();
					$("#tweetBTN").hide();
					Twitter.tweet();
				}
			});
		}
	},
	done:function(){
		$("#statusHold").hide();
		$("#tweet").val('');
		$("#tweet").show();
		$("#tweetBTN").show();
	}
};