PHONEGAP TWITTER APP
This project serves as an example of how to create a twitter application or functionality within Phonegap using ChildBrowser.

This app will remember your Twitter authentication and allow you to tweet from your app.

SET UP:
1. Go to https://dev.twitter.com/apps and create a new app.
2. Be sure to put in a callback URL ( doesn't have to be live )
3. once set up go to "settings"
4. Change the access to "Read-Write"
5. put your in callback url

HOW TO SEE EXAMPLE:
1. Download the GIT project
2. Open the init.js file ( twitter/www/js/init.js )
3. change lines 18,19,20 and 79
4. open the xCode project and run! 

HOW TO USE:
1. Download the project from GIT
2. The JS files in the "plugging" folder are what you will need.
3. Grab the following files - 
	- ChildBrowserCommand.m
	- ChildBrowserCommand.h
	- ChildBrowserViewController.m
	- ChildBrowserViewController.h
4. Drag those into your xcode project into the plugins folder.
5. Drag "ChildBrowser.bundle" and "ChildBrowserViewController.xib" into the resources folder.
6. In your PhoneGap.plist create a new external host and set the value to *
7. add a new Plugin 
KEY: ChildBrowserCommand
VALUE: ChildBrowserCommand
8. save!

ready to go!

I am working on a full blog post to support this in better detail!

enjoy!