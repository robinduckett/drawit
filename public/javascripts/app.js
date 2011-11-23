/* Foundation v2.1 http://foundation.zurb.com */
$(document).ready(function() {

  /* Use this js doc for all application specific JS */

  /* TABS --------------------------------- */
  /* Remove if you don't need :) */
  
  var tabs = $('dl.tabs');
    tabsContent = $('ul.tabs-content')
  
  tabs.each(function(i) {
    //Get all tabs
    var tab = $(this).children('dd').children('a');
    tab.click(function(e) {
      
      //Get Location of tab's content
      var contentLocation = $(this).attr("href")
      contentLocation = contentLocation + "Tab";
      
      //Let go if not a hashed one
      if(contentLocation.charAt(0)=="#") {
      
        e.preventDefault();
      
        //Make Tab Active
        tab.removeClass('active');
        $(this).addClass('active');
        
        //Show Tab Content
        $(contentLocation).parent('.tabs-content').children('li').css({"display":"none"});
        $(contentLocation).css({"display":"block"});
        
      } 
    });
  });
  
  
  /* PLACEHOLDER FOR FORMS ------------- */
  /* Remove this and jquery.placeholder.min.js if you don't need :) */
  
  $('input, textarea').placeholder();
  
  
  /* DISABLED BUTTONS ------------- */
  /* Gives elements with a class of 'disabled' a return: false; */
});

var undohistory = [];
var redohistory = [];
var canvas;

$(document).ready(function() {
  $('#main').attr({
    width: 724,
    height: 300
  });

  canvas = new fabric.Canvas('main');
  canvas.isDrawingMode = true;
  canvas.freeDrawingLineWidth = 3;

  canvas.observe('path:created', function(e) {
    redohistory = [];
    undohistory.push(e.memo.path);

    if ($('#gameid').val() > -1) {
      var gameid = $('#gameid').val();
      if (window.socket) {
        console.log('emitting:', {game: gameid, data: canvas.toJSON()})
        socket.emit('path', {game: gameid, data: canvas.toDataURL()});
      }
    }
  });

  $('#undo').click(function() {
    if (undohistory.length > 0) {
      var path = undohistory.pop();
      redohistory.push(path);
      canvas.remove(path);
      socket.emit('path', {game: gameid, data: canvas.toDataURL()});
    }
  });

  $('#redo').click(function() {
    if (redohistory.length > 0) {
      var path = redohistory.pop();
      undohistory.push(path);
      canvas.add(path);
      socket.emit('path', {game: gameid, data: canvas.toDataURL()});
    }
  });

  $('#exit').click(function() {
    var gameid = $('#gameid').val();
    socket.emit('exit', {game: gameid});
    $.gritter.add({
      title: 'Sorry to see you go!',
      text: 'Taking you back to the Game Lobby'
    });

    setTimeout(function() {
      location.href = "/";
    }, 3000);
  });

  $('#finish').click(function() {
    var gameid = $('#gameid').val();
    socket.emit('path', {game: gameid, data: canvas.toDataURL()});
    socket.emit('finish', {game: gameid});
    $.gritter.add({
      title: 'Finish!',
      text: 'Please wait for a result from the referee!'
    });
  });

  $('#redo').bind('selectionend', function() {
    return false;
  });

  $('#undo').bind('selectionend', function() {
    return false;
  });

  var error = get(document.location.search)['error'];
  $('#errors .' + error).slideDown();
});

function get(qs) {
    qs = qs.split("+").join(" ");
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}