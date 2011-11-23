# INSTALL

    npm install .
    node app.js

# How to play

Sign in, create a game, wait for friends to join, they have to guess what you have drawn. When everyone is finished, the closest match is selected by the owner of the game!

# Todo

* Scoring
* Better handling of mid match exiting / joining
* Needs more fun

# Notes

Most of the code is in `app.js` and `routes/index.js` and the frontend code is in `public/javascripts/app.js` and `views/`

Canvases on owner view are updated in real time threw WebSockets

# Screenshots

[![Login](http://i.imgur.com/nRtHBl.png)](http://i.imgur.com/nRtHB.png "Login")

[![Game Start](http://i.imgur.com/eGUYLl.png)](http://i.imgur.com/eGUYL.png "Game Start / Owner View")

[![Game Lobby](http://i.imgur.com/EZBm5l.png)](http://i.imgur.com/EZBm5.png "Game Lobby")

[![Player View](http://i.imgur.com/hF4ohl.png)](http://i.imgur.com/hF4oh.png "Player View")

[![Player View](http://i.imgur.com/eLpw7l.png)](http://i.imgur.com/eLpw7.png "Player View with visible Finish Popup")

[![Declare Winner](http://i.imgur.com/m5NQal.png)](http://i.imgur.com/m5NQa.png "Declare Winner on Owner View")