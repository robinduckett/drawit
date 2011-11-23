
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , MemoryStore = express.session.MemoryStore
  , sessionStore = new MemoryStore()
  , io = require('socket.io');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({store: sessionStore, secret: "ocelot cat", key: 'express.sid' }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.dynamicHelpers({
  session: function(req, res){
    return req.session;
  }
});

global.games = [
  
];

global.users = [];

global.user_data = [
  {name: 'Robin', wins: 100, losses: 12}
];


// Routes

app.get('/', routes.index);
app.get('/gamelist', routes.gamelist);
app.get('/game/:gameid', routes.game);
app.get('/create', routes.create);

app.post('/', routes.index_post);
app.post('/create', routes.create_post)

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

sio = io.listen(app);

var Session = require('connect').middleware.session.Session;
var parseCookie = require('connect').utils.parseCookie;

sio.set('authorization', function (data, accept) {
  if (data.headers.cookie) {
    data.cookie = parseCookie(data.headers.cookie);
    data.sessionID = data.cookie['express.sid'];
    // save the session store to the data object 
    // (as required by the Session constructor)
    data.sessionStore = sessionStore;
    sessionStore.get(data.sessionID, function (err, session) {
      if (err || !session) {
        accept('Error', false);
      } else {
        // create a session object, passing data as request and our
        // just acquired session data
        data.session = new Session(data, session);
        accept(null, true);
      }
    });
  } else {
   return accept('No cookie transmitted.', false);
  }
});

sio.sockets.on('connection', function (socket) {
  socket.on('join', function(data) {
    var name = this.handshake.session.name;

    var game = games[new Number(data.game)];

    if (game.playing.indexOf(name) < 0) {
      game.playing.push(name);
      game.sessions.push({name: name, session: socket.id});
    }

    if (game.owner == name) {
      game.owner_session = socket.id;
    }

    global.games[new Number(data.game)] = game;

    socket.join('game' + data.game);
    socket.broadcast.to('game' + data.game).emit('joined', {name: name});
  });

  socket.on('path', function(data) {
    var name = this.handshake.session.name;

    for (var g in games) {
      game = games[g];

      if (game.id == data.game) {
        var owner_session = game.owner_session;
      }
    }

    if (owner_session) {
      sio.sockets.sockets[owner_session].emit('path', {user: name, data: data});
    }
  });

  socket.on('exit', function(data) {
    var name = this.handshake.session.name;
    var game = games[new Number(data.game)];

    if (game.playing.indexOf(name) > -1) {
      game.playing.splice(game.playing.indexOf(name), 1);
      game.players--;
    }

    sio.sockets.sockets[game.owner_session].emit('parted', {user: name});

    games[new Number(data.game)] = game;
  });

  socket.on('vote', function(data) {
    var name = this.handshake.session.name;
    var game = games[new Number(data.game)];
    if (name == game.owner) {
      for (var gs in game.sessions) {
        if (game.sessions[gs].name == data.name.trim()) {
          sio.sockets.sockets[game.sessions[gs].session].emit('win');
        } else {
          if (game.sessions[gs]) {
            if (game.sessions[gs].session) {
              sio.sockets.sockets[game.sessions[gs].session].emit('lose');
            }
          }
        }
      }
    }

    game.playing.splice(game.playing.indexOf(data.name.trim()), 1);
    game.players--;
    game.played++;

    games[new Number(data.game)] = game;
    sio.sockets.sockets[game.owner_session].emit('parted', {user: name});
  });

  socket.on('finish', function(data) {
    var name = this.handshake.session.name;
    var game = games[new Number(data.game)];

    sio.sockets.sockets[game.owner_session].emit('finished', {user: name, name: name});
  });

  var hs = socket.handshake;
  console.log('A socket with sessionID ' + hs.sessionID 
      + ' connected!');
  // setup an inteval that will keep our session fresh
  var intervalID = setInterval(function () {
    // reload the session (just in case something changed,
    // we don't want to override anything, but the age)
    // reloading will also ensure we keep an up2date copy
    // of the session with our connection.
    hs.session.reload( function () { 
        // "touch" it (resetting maxAge and lastAccess)
        // and save it back again.
        hs.session.touch().save();
    });
  }, 60 * 1000);
  socket.on('disconnect', function () {
    console.log('A socket with sessionID ' + hs.sessionID 
        + ' disconnected!');
    // clear the socket interval to stop refreshing the session
    clearInterval(intervalID);
  });
});
