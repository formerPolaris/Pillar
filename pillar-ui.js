(function(root) {
  var PillarUI = root.PillarUI = (root.PillarUI || {});

  var currentView = PillarUI.currentView = null;
  var swapView = PillarUI.swapView = function(view) {
    $(document).off();
    currentView && currentView.hide();
    currentView = view;
    view.show();
  };

  var mainMenuSelectables = PillarUI.mainMenuSelectables = ["new-game", "options", "help", "about"];
  var mainMenuSelection = PillarUI.mainMenuSelection = null;
  var setMainMenuSelection = PillarUI.setMainMenuSelection = function(selection, callback) {
    PillarUI.mainMenuSelection = selection;
    callback && callback();
  };
  var displaySelection = PillarUI.displaySelection = function() {
    PillarUI.mainMenuSelectables.forEach(function(name) {
      if (name !== PillarUI.mainMenuSelection) {
        $("." + name + "-motif").removeClass("active");
      }
    });
    $("." + PillarUI.mainMenuSelection + "-motif").addClass("active");
  };

  var initializeMenu = PillarUI.initializeMenu = function() {
    if (PillarUI.mainMenuView === undefined) {
      PillarUI.$gameContainer = $(".pillar-game");
      var $mainMenuDiv = jQuery("<div/>", {
        class: "main-menu-div"
      }).css({
        "position": "relative",
        "width": 0,
        "height": 0
      });

      var mainMenuView = PillarUI.mainMenuView = new CView($mainMenuDiv, this.$gameContainer, true);

      mainMenuView.loadElement(jQuery("<img/>", {
        class: "main-menu-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-main-menu.png"
      }));

      mainMenuView.resize = function() {
        this.parent.css({
          "height": $("img.main-menu-image").height(),
          "width": $("img.main-menu-image").width()
        });
      };

      mainMenuView.spawnLinksAndMotifs = function() {
        mainMenuSelectables.forEach(function(name) {
          $currentLink = mainMenuView.loadElement(jQuery("<div/>", {
            class: name + "-motif select-motif"
          }));

          jQuery("<img/>", {
            class: "left",
            src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/moddedleaf.png"
          }).appendTo($currentLink);

          jQuery("<img/>", {
            class: "right",
            src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/moddedleaf.png"
          }).appendTo($currentLink);
          var $currentElement = mainMenuView.createLink(name);
        });
      };

      var tryLoad = function() {
        if (document.getElementsByClassName("main-menu-image")[0].complete) {
          PillarUI.swapView(mainMenuView);
          PillarUI.mainMenuView.resize();
          PillarUI.mainMenuView.spawnLinksAndMotifs();
          PillarUI.initMenuControls();
          PillarUI.bindMenuEvents();
        } else {
          setTimeout(function() {
            tryLoad();
          }, 0);
        }
      }
      tryLoad();
    } else {
      PillarUI.swapView(PillarUI.mainMenuView);
      initMenuControls();
    }
    window.setTimeout(function() {
      $(".main-menu-image").css({"opacity": 1});
    }, 1000);
  };

  var bindMenuEvents = PillarUI.bindMenuEvents = function() {
    PillarUI.mainMenuSelectables.forEach(function(name) {
      $("." + name + "-link").hover(function() {
        PillarUI.setMainMenuSelection(name, PillarUI.displaySelection)
      });
    });
    $(".new-game-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeBoard();
    });
    $(".options-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeOptionsMenu();
    });
    $(".help-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeHelp();
    });
    $(".about-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeAbout();
    });
  }

  var initializeOptionsMenu = PillarUI.initializeOptionsMenu = function() {

  };

  var initializeHelp = PillarUI.initializeHelp = function() {

  };

  var initializeAbout = PillarUI.initializeHelp = function() {

  };

  var initMenuControls = PillarUI.initMenuControls = function() {
    $(document).keydown(function(e) {
      e.preventDefault();
      var currentIndex = PillarUI.mainMenuSelectables.indexOf(PillarUI.mainMenuSelection);
      var selectablesLength = PillarUI.mainMenuSelectables.length;
      var getNewIndex = function() {
        if (currentIndex < 0) {
          currentIndex = selectablesLength - (Math.abs(currentIndex) % selectablesLength);
        } else {
          currentIndex = currentIndex % selectablesLength;
        }
        return currentIndex;
      }
      var set = function() {
        PillarUI.setMainMenuSelection(PillarUI.mainMenuSelectables[getNewIndex()], PillarUI.displaySelection);
      }
      switch(e.which) {
        case 13:

          break;
        case 0:

          break;
        case 37:
          currentIndex -= 1;
          set();
          break;
        case 38:
          currentIndex -= 1;
          set();
          break;
        case 39:
          currentIndex += 1;
          set();
          break;
        case 40:
          currentIndex += 1;
          set();
          break;
        default:
          return;
      }
    });
  };

  var initializeBoard = PillarUI.initializeBoard = function() {
    if(PillarUI.boardView === undefined) {
      var $gameBoard = jQuery("<table/>", {
        class: "game-board"
      });
      var spacing = 0;

      PillarUI.boardView = new CView($gameBoard, PillarUI.$gameContainer, true);

      $gameBoard.css({"border-spacing": spacing});

      var arenaY = PillarUI.mainMenuView.parent.height();
      var arenaX = PillarUI.mainMenuView.parent.width();

      var minXSquares = Pillar.options.xGridSize;
      var minYSquares = Pillar.options.yGridSize;

      var givenXSquares = minXSquares;
      var givenYSquares = minYSquares;

      PillarUI.elementGrid = new Array();
      PillarUI.$score = jQuery("<div/>", {
        class: "score-holder"
      });

      PillarUI.$score.text("Score: 0");
      PillarUI.boardView.loadElement(PillarUI.$score);

      for (var y = 0; y < givenYSquares; y++) {
        var $newRow = jQuery("<tr>", {
          class: "grid-row"
        });
        PillarUI.elementGrid.push(new Array());
        for (var x = 0; x < givenXSquares; x++) {
          var $currentSquare = jQuery("<td/>", {
             class: "gridspace",
             height: (Math.floor(arenaY/givenYSquares) - spacing - 2),
             width: (Math.floor(arenaX/givenXSquares) - spacing - 2)
          }).appendTo($newRow);
          PillarUI.elementGrid[y].push($currentSquare);
        }
        PillarUI.boardView.loadElement($newRow);
      }
      
    } else {
      // Play loaded bgm
    }
    PillarUI.swapView(PillarUI.boardView);
    initGameControls();
    beginUpdates();
  };

  var initGameControls = PillarUI.initGameControls = function() {
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

  var beginUpdates = PillarUI.beginUpdates = function() {
    window.setTimeout(function() {
      Pillar.startGame({
        "displayCallback": updateBoard,
        "resetCallback": reset
      })
    }, 1000);
  };

  var updateBoard = PillarUI.updateBoard = function(board, gameScore) {
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
    PillarUI.$score.text("Score: " + gameScore);
  };

  var reset = PillarUI.reset = function() {
    initializeMenu();
  }
})(this);

$(document).ready(function() {
  PillarUI.initializeMenu();
});