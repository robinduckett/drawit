/*
 * GET home page.
 */
 
exports.index = function(req, res){
  if (!req.session.logged_in) {
    res.render('index', { title: 'Drawit' })
  } else {
    res.redirect('/gamelist');
  }
};

exports.index_post = function(req, res) {
  if (req.body.name) {
    if (req.body.name.length <= 3) {res.redirect('/?error=name'); return;}
    if (users.indexOf(req.body.name) > -1) {res.redirect('/?error=exists'); return;}
    req.session.logged_in = true;
    req.session.name = req.body.name;

    for (var user in user_data) {
      if (user_data[user].name == req.body.name) {
        req.session.wins = user_data[user].wins;
        req.session.losses = user_data[user].losses;
      }
    }

    if (!req.session.wins) {
      req.session.wins = 0;
      req.session.losses = 0;
    }

    res.redirect('/gamelist');

    users.push(req.body.name);
  } else {
    res.redirect('/?error=missing');
  }
};

exports.gamelist = function(req, res) {
  if (!req.session.logged_in) {
    res.redirect('/');
  } else {
    res.render('gamelist', { title: 'Drawit - Game List', games: games });
  }
};

exports.create = function(req, res) {
  if (!req.session.logged_in) {
    res.redirect('/');
  } else {
    res.render('create', { title: 'Drawit - Create'});
  }
};

exports.create_post = function(req, res) {
  if (!req.session.logged_in) {
    res.redirect('/');
  } else {
    if (req.body.name) {
      if (req.body.name.length <= 3) {res.redirect('/create?error=name'); return;}
      for (var game in games) {
        if (games[game].name == req.body.name) {
          res.redirect('/create?error=exists');
          return;
        }
      }

      if (req.body.image.length < 3) {
        res.redirect('/create?error=image'); return;
      }

      games.push({image: req.body.image, name: req.body.name, owner: req.session.name, players: 1, played: 0, sessions: [], playing: [req.session.name]});

      for (var i = 0; i < games.length; i++) {
        games[i].id = i;
        if (games[i].name == req.body.name) {
          var game = games[i];
        }
      }

      res.redirect('/game/' + game.id);
    } else {
      res.redirect('/create?error=missing');
    }
  }
};

exports.game = function(req, res){
  if (!req.session.logged_in) {
    res.redirect('/');
    return;
  }

  var game = games[req.params.gameid];

  if (req.session.name == game.owner) {
    res.render('game-it', {
      title: 'Drawit - ' + game.name,
      players: game.playing,
      game: game
    });
  } else {
    res.render('game', {
      title: 'Drawit - ' + game.name,
      game: game
    });
  }
};