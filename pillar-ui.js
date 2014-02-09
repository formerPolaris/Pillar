(function(root) {
  var PillarUI = root.PillarUI = (root.PillarUI || {});

  var currentView = PillarUI.currentView = null;
  var swapView = PillarUI.swapView = function(view, callbacks) {
    $(document).off(); // unbind key listeners
    currentView && currentView.hideView(); // also unbinds event listeners
    currentView = view;
    view.showView(callbacks);
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
  var makeSelection = PillarUI.makeSelection = function () {
    switch (PillarUI.mainMenuSelection) {
      case "new-game":
        PillarUI.initializeBoard();
        break;
      case "options":
        PillarUI.initializeOptionsMenu();
        break;
      case "help":
        PillarUI.initializeHelp();
        break;
      case "about":
        PillarUI.initializeAbout();
        break;
      default:
        return;
    }
  }

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
          var $currentElement = mainMenuView.createLink(name).addClass("pillar-link");
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
        PillarUI.setMainMenuSelection(
          PillarUI.mainMenuSelectables[getNewIndex()],
          PillarUI.displaySelection
        );
      }
      switch(e.which) {
        case 13:
          PillarUI.makeSelection();
          break;
        case 0:
          PillarUI.makeSelection();
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

  var options = PillarUI.options = {
    xGridSize: 10,
    yGridSize: 10,
    gameSpeed: 200,
    maxGameSpeed: 80,
    volume: 100,
    pillarType: "luna",
    pillarColorNumber: function () {
      switch(this.pillarType) {
        case "swallowtail":
          return 2;
        case "luna":
          return 2;
        case "monarch":
          return 5;
      }
    }
  };

  var initializeOptionsMenu = PillarUI.initializeOptionsMenu = function() {
    if(PillarUI.optionsMenuView === undefined) {
      var $optionsMenuDiv = PillarUI.$optionsMenuDiv = jQuery("<div/>", {
        class: "options-menu-div"
      });

      $optionsMenuDiv.css({
        "height": PillarUI.$gameContainer.height(),
        "width": PillarUI.$gameContainer.width()
      })

      var optionsMenuView = PillarUI.optionsMenuView = new CView(
        $optionsMenuDiv,
        PillarUI.$gameContainer,
        false
      );

      optionsMenuView.loadElement(jQuery("<img/>",{
        class: "options-menu-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-options-menu.png"
      }));

      optionsMenuView.createLink("options-menu-back").addClass("pillar-link");

      var $volumeSlider = jQuery("<div/>", {
        class: "options-menu-volume-slider"
      });
      var resetVolumeSlider = function () {
        $volumeSlider.slider({
          range: "min",
          value: PillarUI.options.volume,
          min: 0,
          max: 100
        })
      };
      resetVolumeSlider();

      optionsMenuView.loadElement($volumeSlider);
    }
    PillarUI.swapView(PillarUI.optionsMenuView, [bindEscToBack, bindOptionsMenuEvents]);
  };
  
  var bindOptionsMenuEvents = PillarUI.bindOptionsMenuEvents = function () {
    $(".options-menu-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
  };

  var initializeAbout = PillarUI.initializeAbout = function() {
    if(PillarUI.aboutView === undefined) {
      var $aboutDiv = PillarUI.$aboutDiv = jQuery("<div/>", {
        class: "about-div"
      });

      $aboutDiv.css({
        "height": PillarUI.$gameContainer.height(),
        "width": PillarUI.$gameContainer.width()
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

      aboutView.createLink("about-back").addClass("pillar-link");
      aboutView.createLink("polaris").addClass("pillar-link");
    }
    PillarUI.swapView(PillarUI.aboutView, [bindEscToBack, bindAboutEvents]);
  };

  var bindAboutEvents = PillarUI.bindAboutEvents = function () {
    $(".about-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
    $(".polaris-link").click(function(event) {
      event.preventDefault();
      window.open('https://github.com/Polaris');
    });
  };

  var initializeHelp = PillarUI.initializeHelp = function() {
    if(PillarUI.helpView === undefined) {
      var $helpDiv = PillarUI.$helpDiv = jQuery("<div/>", {
        class: "help-div"
      });

      $helpDiv.css({
        "height": PillarUI.$gameContainer.height(),
        "width": PillarUI.$gameContainer.width()
      })

      var helpView = PillarUI.helpView = new CView(
        $helpDiv,
        PillarUI.$gameContainer,
        false
      );

      helpView.loadElement(jQuery("<img/>",{
        class: "help-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-help.png"
      }));

      helpView.createLink("help-back").addClass("pillar-link");
    }
    PillarUI.swapView(PillarUI.helpView, [bindEscToBack, bindHelpEvents]);
  };

  var bindHelpEvents = PillarUI.bindHelpEvents = function () {
    $(".help-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
  };
  var displayedScore = PillarUI.displayedScore = 0;

  var bindEscToBack = PillarUI.bindEscToBack = function () {
    $(document).keydown(function(e) {
      e.preventDefault();
      if (e.keyCode == 27) {
        PillarUI.initializeMenu();
      }
    });
  };

  var initializeBoard = PillarUI.initializeBoard = function() {
    var $gameBoard = jQuery("<table/>", {
      class: "game-board" + " " + PillarUI.options.pillarType
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

    var minXSquares = PillarUI.options.xGridSize;
    var minYSquares = PillarUI.options.yGridSize;

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
    Pillar.startGame({
      "displayCallback": updateBoard,
      "resetCallback": reset
    }, PillarUI.options);
  };

  var updateBoard = PillarUI.updateBoard = function(board, gameScore) {
    for (var y = 0; y < board.length; y++) {
      for(var x = 0; x < board[0].length; x++) {
        var currentElement = PillarUI.elementGrid[y][x];
        currentElement.attr("class", "gridspace");
        var num;
        if (board[y][x] > 1) {
          num = board[y][x] % options.pillarColorNumber() + 2;
        } else {
          num = board[y][x];
        }
        var determiner = num > 1 ? "color" : num;
        switch(determiner) {
          case 1:
            currentElement.addClass("apple");
          case "color":
            currentElement.addClass("color" + (num - 1));
            break;
          default:
            currentElement.addClass("clear");
            break;
        }
      }
    }
    if (PillarUI.displayedScore < gameScore) {
      PillarUI.displayedScore = gameScore;
      PillarUI.$score.css({
        "color": "blue"
      });
      PillarUI.$score.animate({
        "color": "black"
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
    soundManager.stopAll();
    PillarUI.initializeMenu();
  }
})(this);

$(document).ready(function() {
  PillarUI.soundsArray = new Array;
  soundManager.setup({
    url: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/soundmanager2.swf",
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
          soundManager.onPosition("bgm", 60574, function() {
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
        onstop: function () {
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