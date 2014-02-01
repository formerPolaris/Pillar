(function (root) {
  var PillarUI = root.PillarUI = (root.PillarUI || {});

  var initUI = PillarUI.initUI = function () {
    $(".start-game").click(function (event) {
      event.preventDefault();
      this.initBoard();
    });
  };

  var initControls = PillarUI.initControls = function() {
    $(document).keydown(function(e) {
      e.preventDefault();
      switch(e.which) {
        case 37:
          Pillar.player.setDirection("left");
          break;
        case 38:
          Pillar.player.setDirection("up");
          break;
        case 39:
          Pillar.player.setDirection("right");
          break;
        case 40:
          Pillar.player.setDirection("down");
          break;
        default:
          return;
      }
    });
  };

  var initBoard = PillarUI.initBoard = function () {
    var spacing = 4;
    $(".game-container").css({"border-spacing": spacing, "overflow": "hidden"});

    var arenaY = $("img").height();
    var arenaX = $("img").width();

    var maxXSquares = Math.floor(arenaX/20 + spacing);
    var maxYSquares = Math.floor(arenaY/20 + spacing);

    var minXSquares = Pillar.options.xGridSize;
    var minYSquares = Pillar.options.yGridSize;

    var givenXSquares = minXSquares;
    var givenYSquares = minYSquares;

    $("img").remove();
    $("a").remove();

    PillarUI.elementGrid = new Array();

    for (var y = 0; y < givenYSquares; y++) {
      var newRow = jQuery('<tr>', {
        class: 'grid-row'
      });
      PillarUI.elementGrid.push(new Array());
      for (var x = 0; x < givenXSquares; x++) {
        var currentSquare = jQuery('<td/>', {
           class: 'gridspace',
           height: (Math.floor(arenaY/givenYSquares) - spacing),
           width: (Math.floor(arenaX/givenXSquares) - spacing)
        }).appendTo(newRow);
        PillarUI.elementGrid[y].push(currentSquare);
      }
      newRow.appendTo(".game-container");
    }

    $(".game-container").css({"opacity": 1});

    initControls();
    beginUpdates();
  };

  var updateBoard = PillarUI.updateBoard = function (board) {
    for (var y = 0; y < board.length; y++) {
      for(var x = 0; x < board[0].length; x++) {
        var currentElement = PillarUI.elementGrid[y][x]
        switch(board[y][x]) {
          case 0:
            currentElement.removeClass("light-pillar");
            currentElement.removeClass("dark-pillar");
            currentElement.removeClass("apple");
            break;
          case 1:
            currentElement.removeClass("light-pillar");
            currentElement.addClass("dark-pillar");
            currentElement.removeClass("apple");
            break;
          case 2:
            currentElement.addClass("light-pillar");
            currentElement.removeClass("dark-pillar");
            currentElement.removeClass("apple");
            break;
          case 3:
            currentElement.removeClass("light-pillar");
            currentElement.removeClass("dark-pillar");
            currentElement.addClass("apple");
            break;
        }
      }
    }
  };

  var beginUpdates = PillarUI.beginUpdates = function () {
    Pillar.startGame(updateBoard);
  };
})(this);

window.PillarUI.initUI();