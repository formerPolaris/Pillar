(function(root) {
  var PillarUI = root.PillarUI = (root.PillarUI || {});

  var currentView = PillarUI.currentView = null;
  var swapView = PillarUI.swapView = function(view, callbacks) {
    $(document).off(); // unbind key listeners
    currentView && currentView.hide(); // also unbinds event listeners
    currentView = view;
    view.show(callbacks);
  };

  var mainMenuSelectables = PillarUI.mainMenuSelectables = [
    "new-game",
    "options",
    "help",
    "about"
  ];
  var mainMenuSelection = PillarUI.mainMenuSelection = null;
  var setMainMenuSelection = PillarUI.setMainMenuSelection = function(selection, callback) {
    PillarUI.mainMenuSelection = selection;
    callback && callback();
  };
  var displaySelection = PillarUI.displaySelection = function() {
    if ($(".main-menu-image").css("opacity") == 1) {
      PillarUI.mainMenuSelectables.forEach(function(name) {
        if (name !== PillarUI.mainMenuSelection) {
          $("." + name + "-motif").removeClass("active");
        }
      });
      $("." + PillarUI.mainMenuSelection + "-motif").addClass("active");
    }
  };

  // General structure:
  // Element constructor/recycler
  // Control binder
  // Event binder
  // Will probably separate these into multiple files

  var initializeMenu = PillarUI.initializeMenu = function() {
    if (PillarUI.mainMenuView === undefined) {
      PillarUI.$gameContainer = $(".pillar-game");
      var $mainMenuDiv = jQuery("<div/>", {
        class: "main-menu-div"
      });

      var mainMenuView = PillarUI.mainMenuView = new CView(
        $mainMenuDiv,
        this.$gameContainer,
        false
      );

      mainMenuView.loadElement(jQuery("<img/>", {
        class: "main-menu-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-main-menu.png"
      }));

      mainMenuView.resize = function(callback) {
        this.parent.css({
          "display": "block",
          "height": 0,
          "width": 0
        });
        var imageH = $("img.main-menu-image").height();
        var imageW = $("img.main-menu-image").width();
        this.parent.css({
          "height": imageH,
          "width": imageW,
          "display": "none"
        });
        PillarUI.$gameContainer.css({
          "height": imageH,
          "width": imageW,
          "background-color": "#ffff8b"
        });
        callback();
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
          PillarUI.mainMenuView.resize(function () {
            PillarUI.swapView(PillarUI.mainMenuView, [
              PillarUI.mainMenuView.spawnLinksAndMotifs,
              PillarUI.initMenuControls, 
              PillarUI.bindMenuEvents
            ]);
          });
        } else {
          setTimeout(function() {
            tryLoad();
          }, 1000);
        }
      }
      tryLoad();
    } else {
      PillarUI.swapView(
        PillarUI.mainMenuView, [
        PillarUI.initMenuControls,
        PillarUI.bindMenuEvents
      ]);
    }
  };

  var initMenuControls = PillarUI.initMenuControls = function() {
    var that = this;
    $(document).keydown(function(e) {
      e.preventDefault();
      var currentIndex = that.mainMenuSelectables.indexOf(that.mainMenuSelection);
      var selectablesLength = that.mainMenuSelectables.length;
      var getNewIndex = function() {
        if (currentIndex < 0) {
          currentIndex = selectablesLength - (Math.abs(currentIndex) % selectablesLength);
        } else {
          currentIndex = currentIndex % selectablesLength;
        }
        return currentIndex;
      }
      var set = function() {
        PillarUI.setMainMenuSelection(
          PillarUI.mainMenuSelectables[getNewIndex()],
          PillarUI.displaySelection
        );
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

  var initializeAbout = PillarUI.initializeAbout = function() {
    if(PillarUI.aboutView === undefined) {
      var $aboutDiv = PillarUI.$aboutDiv = jQuery("<div/>", {
        class: "about-div"
      });

      $aboutDiv.css({
        "height": PillarUI.mainMenuView.parent.height(),
        "width": PillarUI.mainMenuView.parent.width()
      })

      var aboutView = PillarUI.aboutView = new CView(
        $aboutDiv,
        PillarUI.$gameContainer,
        false
      );

      aboutView.loadElement(jQuery("<img/>",{
        class: "about-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-about.png"
      }));

      aboutView.createLink("back");
      aboutView.createLink("polaris");

    }
    PillarUI.swapView(PillarUI.aboutView, [initAboutControls, bindAboutEvents]);
  };

  var initAboutControls = PillarUI.bindAboutEvents = function () {
    $(document).keydown(function(e) {
      e.preventDefault();
      if (e.which == 37) {
        PillarUI.initializeMenu();
      }
    });
  };

  var bindAboutEvents = PillarUI.bindAboutEvents = function () {
    $(".back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
    $(".polaris-link").click(function(event) {
      event.preventDefault();
      window.open('https://github.com/Polaris');
    });
  };

  var displayedScore = PillarUI.displayedScore = 0;

  var initializeBoard = PillarUI.initializeBoard = function() {
    var $gameBoard = jQuery("<table/>", {
      class: "game-board"
    });
    var spacing = 0;

    $gameBoard.css({
      "border-spacing": spacing,
      "height": PillarUI.mainMenuView.parent.height(),
      "width": PillarUI.mainMenuView.parent.width()
    });

    PillarUI.boardView = new CView($gameBoard, PillarUI.$gameContainer, true);

    var arenaY = PillarUI.mainMenuView.parentHeight;
    var arenaX = PillarUI.mainMenuView.parentWidth;

    var minXSquares = Pillar.options.xGridSize;
    var minYSquares = Pillar.options.yGridSize;

    var givenXSquares = minXSquares;
    var givenYSquares = minYSquares;

    PillarUI.elementGrid = new Array();
    PillarUI.$score = jQuery("<div/>", {
      class: "score-holder"
    });

    PillarUI.$score.text("Score: " + PillarUI.displayedScore);
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
    PillarUI.swapView(PillarUI.boardView, [initGameControls, beginUpdates]);
    soundManager.play("bgm");
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
    if (PillarUI.displayedScore < gameScore) {
      PillarUI.displayedScore = gameScore;
      PillarUI.$score.css({
        "color": "red"
      });
      PillarUI.$score.animate({
        "color": "teal"
      });
      PillarUI.$score.text("Score: " + PillarUI.displayedScore);
      var soundNumber = Math.floor(Math.random() * 3) + 1;
      soundManager.play("applebite" + soundNumber);
    }
  };

  var reset = PillarUI.reset = function() {
    alert("You're all out of adventures :(");
    PillarUI.displayedScore = 0;
    PillarUI.boardView.destroy();
    soundManager.stop("bgm");
    PillarUI.initializeMenu();
  }
})(this);

$(document).ready(function() {
  PillarUI.soundsArray = new Array;
  soundManager.setup({
    url: "./soundmanager/soundmanager2.swf",
    flashVersion: 8,
    onready: function() {
      soundManager.createSound({
        id: "bgm",
        url: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/ambience.mp3",
        autoLoad: true,
        autoPlay: false,
        stream: false,
        onload: function() {
          this.numberPlays = 0;
          PillarUI.soundsArray.push(this);
          console.log(this.numberPlays);
        },
        onplay: function() {
          this.numberPlays += 1;
          var that = this;
          soundManager.onPosition("bgm", 60498, function() {
            if (that.numberPlays < 2) {
              soundManager.play("bgm");
            }
          });
          console.log(this.numberPlays);
        },
        onfinish: function () {
          this.numberPlays -= 1;
          console.log(this.numberPlays);
        },
        volume: 100
      });

      soundManager.createSound({
        id: "applebite1",
        url: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/applebite1.mp3",
        autoLoad: true,
        autoPlay: false,
        stream: false,
        onload: function() {
          PillarUI.soundsArray.push(this);
        },
        volume: 100
      });

      soundManager.createSound({
        id: "applebite2",
        url: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/applebite2.mp3",
        autoLoad: true,
        autoPlay: false,
        stream: false,
        onload: function() {
          PillarUI.soundsArray.push(this);
        },
        volume: 100
      });

      soundManager.createSound({
        id: "applebite3",
        url: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/applebite3.mp3",
        autoLoad: true,
        autoPlay: false,
        stream: false,
        onload: function() {
          PillarUI.soundsArray.push(this);
        },
        volume: 100
      });
    }
  });

  var tryLoad = function() {
    if (PillarUI.soundsArray.length == 4) {
      PillarUI.initializeMenu();
    } else {
      setTimeout(function() {
        tryLoad();
      }, 1000);
    }
  }
  tryLoad();
});