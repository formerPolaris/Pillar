(function(root) {
  var PillarUI = root.PillarUI = (root.PillarUI || {});
  var nextTabIndex = PillarUI.nextTabIndex = 0;
  var setTabIndex = PillarUI.setTabIndex = function() {
    nextTabIndex++;
    return nextTabIndex - 1;
  };

  var currentView = PillarUI.currentView = null;
  var swapView = PillarUI.swapView = function(view, showCallbacks, hideCallbacks) {
    PillarUI.currentView && PillarUI.currentView.hideView(hideCallbacks); // also unbinds event listeners
    PillarUI.currentView = view;
    view.showView(showCallbacks);
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
  var makeSelection = PillarUI.makeSelection = function() {
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
  };

  PillarUI.rescaleImage = function(element, scale) {
    element.css({
      "-webkit-transform": "scale(" + scale + ")",
         "-moz-transform": "scale(" + scale + ")",
          "-ms-transform": "scale(" + scale + ")",
           "-o-transform": "scale(" + scale + ")",
              "transform": "scale(" + scale + ")"
    });
  };

  // General structure:
  // Element constructor/recycler
  // Control binder
  // Event binder
  // Will probably separate these into multiple files

  var initializeLoadingView = PillarUI.initializeLoadingView = function() {
    if(PillarUI.loadingView === undefined) {
      $loader = jQuery("<div/>", {
        class: "pillar-loading-container"
      });

      PillarUI.$gameContainer.css({
        height: $loader.height(),
        width: $loader.width()
      });

      var loadingView = PillarUI.loadingView = new CView({
        parent: $loader,
        target: PillarUI.$gameContainer,
        transitionTime: 1000,
        visible: true
      });

      var $loadingText = jQuery("<div/>", {
        class: "pillar-loading-text"
      });
      $loadingText.text("Loading")

      var $tealEllipsis1 = jQuery("<div/>", {
        class: "pillar-ellipsis teal-ellipsis-one"
      });
      var $tealEllipsis2 = jQuery("<div/>", {
        class: "pillar-ellipsis teal-ellipsis-two"
      });
      var $greenEllipsis1 = jQuery("<div/>", {
        class: "pillar-ellipsis green-ellipsis-one"
      });
      var $greenEllipsis2 = jQuery("<div/>", {
        class: "pillar-ellipsis green-ellipsis-two"
      });

      loadingView.loadElement($loadingText);

      loadingView.loadElement($tealEllipsis1);
      loadingView.loadElement($tealEllipsis2);
      loadingView.loadElement($greenEllipsis1);
      loadingView.loadElement($greenEllipsis2);

      loadingView.ellipses = [
        $tealEllipsis1,
        $greenEllipsis1,
        $tealEllipsis2,
        $greenEllipsis2
      ];

      loadingView.animateLoad = function(ellipsisIndex) {
        if (ellipsisIndex >= PillarUI.loadingView.ellipses.length &&
          loadingView.visible) {
          PillarUI.loadingView.repeatAnimateLoad();
        } else if (PillarUI.loadingView.visible) {
          PillarUI.loadingView.ellipses[ellipsisIndex].css({
              "-webkit-transform": "scale(1.2)",
                 "-moz-transform": "scale(1.2)",
                  "-ms-transform": "scale(1.2)",
                   "-o-transform": "scale(1.2)",
                      "transform": "scale(1.2)"
          });
          window.setTimeout(function() {
            PillarUI.rescaleImage(PillarUI.loadingView.ellipses[ellipsisIndex], 1);
          }, 375);
          window.setTimeout(function() {
            PillarUI.loadingView.animateLoad(ellipsisIndex + 1);
          }, 250);
        }
      };

      loadingView.repeatAnimateLoad = function() {
        PillarUI.loadingView.animationTimeOut = window.setTimeout(function() {
          PillarUI.loadingView.animateLoad(0);
        }, 750);
      };

      loadingView.stopAnimateLoad = function() {
        var that = this;
        clearTimeout(PillarUI.loadingView.animationTimeOut);
        PillarUI.loadingView.ellipses.forEach(function (element) {
          PillarUI.rescaleImage(element, 1);
        });
      };

      loadingView.hideView = function() { // Override prototype hideview to call special animation stops
        CView.prototype.hideView.call(this, (this, [
          this.stopAnimateLoad
        ]));
      };
    }
    PillarUI.swapView(PillarUI.loadingView, [
      function() { PillarUI.loadingView.animateLoad(0) }
    ]);
  };

  var initializeMenu = PillarUI.initializeMenu = function() {
    if (PillarUI.mainMenuView === undefined) {
      var $mainMenuDiv = jQuery("<div/>", {
        class: "main-menu-div",
        tabIndex: setTabIndex()
      });

      var mainMenuView = PillarUI.mainMenuView = new CView({
        parent: $mainMenuDiv,
        target: PillarUI.$gameContainer,
        transitionTime: 1000,
        visible: false
      });

      var images = PillarUI.imagesHash;

      mainMenuView.$mainMenuImg = mainMenuView.loadElement(images.$mainMenuImg);

      mainMenuView.$apostropheImg = mainMenuView.loadElement(images.$apostropheImg);
      mainMenuView.$pImg = mainMenuView.loadElement(images.$pImg);
      mainMenuView.$iImg = mainMenuView.loadElement(images.$iImg);
      mainMenuView.$l1Img = mainMenuView.loadElement(images.$l1Img);
      mainMenuView.$l2Img = mainMenuView.loadElement(images.$l2Img);
      mainMenuView.$aImg = mainMenuView.loadElement(images.$aImg);
      mainMenuView.$rImg = mainMenuView.loadElement(images.$rImg);
      mainMenuView.$appleImg = mainMenuView.loadElement(images.$appleImg);

      mainMenuView.resize = function(callback) {
        this.parent.css({
          "display": "block",
          "height": 0,
          "width": 0
        });
        var imageH = PillarUI.mainMenuView.$mainMenuImg.height();
        var imageW = PillarUI.mainMenuView.$mainMenuImg.width();
        this.parent.css({
          "height": imageH,
          "width": imageW,
          "display": "none"
        });
        PillarUI.$gameContainer.css({
          "height": imageH,
          "width": imageW
        });
        callback();
      };

      mainMenuView.spawnLinksAndMotifs = function() {
        mainMenuSelectables.forEach(function(name) {
          $currentLink = mainMenuView.loadElement(jQuery("<div/>", {
            class: name + "-motif select-motif"
          }));

          var images = PillarUI.imagesHash;
          images.$leftLeafImg.clone().appendTo($currentLink);
          images.$rightLeafImg.clone().appendTo($currentLink);
          var $currentElement = mainMenuView.createLink(name).addClass("pillar-link");
        });
      };

      mainMenuView.logoArray = [
        mainMenuView.$apostropheImg,
        mainMenuView.$pImg,
        mainMenuView.$iImg,
        mainMenuView.$l1Img,
        mainMenuView.$l2Img,
        mainMenuView.$aImg,
        mainMenuView.$rImg
      ];

      mainMenuView.appleEaten = false;

      mainMenuView.eatApple = function () {
        if (!PillarUI.mainMenuView.appleEaten) {
          soundManager.play("applebite1");
          PillarUI.mainMenuView.$appleImg.attr("src", "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo-apple-eaten.png");
          PillarUI.mainMenuView.appleEaten = true;
        }
      };

      mainMenuView.resetApple = function () {
        if (PillarUI.mainMenuView.appleEaten) {
          PillarUI.mainMenuView.$appleImg.attr("src", "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo-apple-whole.png");
          PillarUI.mainMenuView.appleEaten = false;
        }
      };

      mainMenuView.startLogoAnimate = function(letterIndex) {
        if (letterIndex >= PillarUI.mainMenuView.logoArray.length &&
          PillarUI.mainMenuView.visible) {
          PillarUI.mainMenuView.repeatLogoAnimate();
        } else if (PillarUI.mainMenuView.visible) {
          PillarUI.mainMenuView.logoArray[letterIndex].css({
              "-webkit-transform": "scale(.65)",
                 "-moz-transform": "scale(.65)",
                  "-ms-transform": "scale(.65)",
                   "-o-transform": "scale(.65)",
                      "transform": "scale(.65)"
          });
          window.setTimeout(function() {
            if (letterIndex == PillarUI.mainMenuView.logoArray.length - 1 &&
              PillarUI.mainMenuView.visible) {
              PillarUI.mainMenuView.eatApple();
            }
            PillarUI.rescaleImage(PillarUI.mainMenuView.logoArray[letterIndex], .5);
          }, 375);
          window.setTimeout(function() {
            PillarUI.mainMenuView.startLogoAnimate(letterIndex + 1);
          }, 250);
        }
      };

      mainMenuView.repeatLogoAnimate = function() {
        PillarUI.mainMenuView.animationTimeOut = window.setTimeout(function() {
          PillarUI.mainMenuView.startLogoAnimate(0);
        }, 5000);
      };

      mainMenuView.stopLogoAnimate = function() {
        var that = this;
        clearTimeout(PillarUI.mainMenuView.animationTimeOut);
        PillarUI.mainMenuView.logoArray.forEach(function (element) {
          PillarUI.rescaleImage(element, .5);
        });
      };

      mainMenuView.hideView = function() { // Override prototype hideview to call special animation stops
        CView.prototype.hideView.call(this, (this, [
          this.stopLogoAnimate, 
          this.resetApple
        ]));
      };

      PillarUI.mainMenuView.resize(function() {
        PillarUI.swapView(PillarUI.mainMenuView, [
          PillarUI.mainMenuView.spawnLinksAndMotifs,
          PillarUI.initMenuControls, 
          PillarUI.bindMenuEvents,
          function () { 
            PillarUI.mainMenuView.startLogoAnimate(0);
            PillarUI.mainMenuView.parent.focus();
          }
        ]);
      });
    } else {
      PillarUI.swapView(
        PillarUI.mainMenuView, [
        PillarUI.initMenuControls,
        PillarUI.bindMenuEvents,
        function () { 
          PillarUI.mainMenuView.startLogoAnimate(0);
          PillarUI.mainMenuView.parent.focus();
        }
      ]);
    }
  };

  var initMenuControls = PillarUI.initMenuControls = function() {
    PillarUI.mainMenuView.parent.keydown(function(e) {
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
    xGridSize: 12,
    yGridSize: 12,
    gameSpeed: 150,
    gameSpeedGain: 5,
    maxGameSpeed: 80,
    volume: 100,
    pillarType: "luna",
    pillarColorNumber: function() {
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
    if (PillarUI.optionsMenuView === undefined) {
      var $optionsMenuDiv = PillarUI.$optionsMenuDiv = jQuery("<div/>", {
        class: "options-menu-div",
        tabIndex: setTabIndex()
      });

      $optionsMenuDiv.css({
        height: PillarUI.$gameContainer.height(),
        width: PillarUI.$gameContainer.width()
      })

      var optionsMenuView = PillarUI.optionsMenuView = new CView({
        parent: $optionsMenuDiv,
        target: PillarUI.$gameContainer,
        transitionTime: 1000,
        visible: false
      });

      var images = PillarUI.imagesHash;
      optionsMenuView.$optionsMenuImg = optionsMenuView.loadElement(images.$optionsMenuImg);

      optionsMenuView.$difficultyImg = images.$difficultyImg;
      optionsMenuView.loadElement(optionsMenuView.$difficultyImg);

      optionsMenuView.$swallowtailDiv = jQuery("<div/>", {
        class: "options-swallowtail-div difficulty-div"
      });
      optionsMenuView.$lunaDiv = jQuery("<div/>", {
        class: "options-luna-div difficulty-div"
      });
      optionsMenuView.$monarchDiv = jQuery("<div/>", {
        class: "options-monarch-div difficulty-div"
      });

      [
        optionsMenuView.$swallowtailDiv,
        optionsMenuView.$lunaDiv,
        optionsMenuView.$monarchDiv
      ].forEach(function(div) {
        optionsMenuView.loadElement(div);
      });
      
      optionsMenuView.displayDifficulty = function(div) {
        $(".difficulty-div").removeClass("selected-difficulty");
        div.addClass("selected-difficulty");
      };

      optionsMenuView.createLink("options-menu-back").addClass("pillar-link");

      var $volumeSlider = jQuery("<div/>", {
        class: "options-menu-volume-slider pillar-slider"
      });
      var $startSpeedSlider = jQuery("<div/>", {
        class: "options-menu-start-speed-slider pillar-slider"
      });
      var $speedGainSlider = jQuery("<div/>", {
        class: "options-menu-speed-gain-slider pillar-slider"
      });
      var $gridSizeSlider = jQuery("<div/>", {
        class: "options-menu-grid-size-slider pillar-slider"
      });

      var $volumeSliderDisplay = jQuery("<div/>", {
        class: "options-menu-slider-display opts-volume-display"
      });
      var $startSpeedSliderDisplay = jQuery("<div/>", {
        class: "options-menu-slider-display opts-start-speed-display"
      });
      var $speedGainSliderDisplay = jQuery("<div/>", {
        class: "options-menu-slider-display opts-speed-gain-display"
      });
      var $gridSizeSliderDisplay = jQuery("<div/>", {
        class: "options-menu-slider-display opts-grid-size-display"
      });

      $volumeSliderDisplay.text(options.volume);
      $startSpeedSliderDisplay.text(options.gameSpeed + " ms");
      $speedGainSliderDisplay.text(options.gameSpeedGain + " ms");
      $gridSizeSliderDisplay.text(options.xGridSize + "x" + options.xGridSize);

      optionsMenuView.resetVolumeSlider = function() {
        $volumeSlider.hasClass("ui-slider") && $volumeSlider.slider("destroy");
        $volumeSlider.slider({
          range: "min",
          value: PillarUI.options.volume,
          min: 0,
          max: 100,
          slide: function(event, ui) {
            $volumeSliderDisplay.text(ui.value);
          },
          stop: function(event, ui) {
            PillarUI.options.volume = ui.value;
            PillarUI.soundsArray.forEach(function(sound) {
              soundManager.setVolume(sound.id, PillarUI.options.volume);
            });
            soundManager.play("applebite1");
          }
        });
      };

      optionsMenuView.resetStartSpeedSlider = function() {
        $startSpeedSlider.hasClass("ui-slider") && $startSpeedSlider.slider("destroy");
        $startSpeedSlider.slider({
          range: "min",
          value: PillarUI.options.gameSpeed,
          min: 100,
          max: 200,
          slide: function(event, ui) {
            $startSpeedSliderDisplay.text(ui.value + " ms");
          },
          change: function(event, ui) {
            $startSpeedSliderDisplay.text(ui.value + " ms");
            PillarUI.options.gameSpeed = ui.value;
            optionsMenuView.changeDifficulty();
          }
        })
      };

      optionsMenuView.resetSpeedGainSlider = function() {
        $speedGainSlider.hasClass("ui-slider") && $speedGainSlider.slider("destroy");
        $speedGainSlider.slider({
          range: "min",
          value: PillarUI.options.gameSpeedGain,
          min: 3,
          max: 10,
          slide: function(event, ui) {
            $speedGainSliderDisplay.text(ui.value + " ms");
          },
          change: function(event, ui) {
            $speedGainSliderDisplay.text(ui.value + " ms");
            PillarUI.options.gameSpeedGain = ui.value;
            optionsMenuView.changeDifficulty();
          }
        })
      };

      optionsMenuView.resetGridSizeSlider = function() {
        $gridSizeSlider.hasClass("ui-slider") && $gridSizeSlider.slider("destroy");
        $gridSizeSlider.slider({
          range: "min",
          value: PillarUI.options.xGridSize,
          min: 8,
          max: 15,
          slide: function(event, ui) {
            $gridSizeSliderDisplay.text(ui.value + "x" + ui.value);
          },
          change: function(event, ui) {
            $gridSizeSliderDisplay.text(ui.value + "x" + ui.value);
            PillarUI.options.xGridSize = ui.value;
            PillarUI.options.yGridSize = ui.value;
            optionsMenuView.changeDifficulty();
          }
        })
      };

      optionsMenuView.resetAllSliders = function() {
        optionsMenuView.resetVolumeSlider();
        optionsMenuView.resetStartSpeedSlider();
        optionsMenuView.resetSpeedGainSlider();
        optionsMenuView.resetGridSizeSlider();
      };

      optionsMenuView.$volumeSlider = optionsMenuView.loadElement($volumeSlider);
      optionsMenuView.$startSpeedSlider = optionsMenuView.loadElement($startSpeedSlider);
      optionsMenuView.$speedGainSlider = optionsMenuView.loadElement($speedGainSlider);
      optionsMenuView.$gridSizeSlider = optionsMenuView.loadElement($gridSizeSlider);

      optionsMenuView.loadElement($volumeSliderDisplay);
      optionsMenuView.loadElement($startSpeedSliderDisplay);
      optionsMenuView.loadElement($speedGainSliderDisplay);
      optionsMenuView.loadElement($gridSizeSliderDisplay);

      optionsMenuView.calculateDifficulty = function(gridSize, speed, speedGain) {
        a = 352 / Math.pow(gridSize, 2); // gridsize is 55% of score
        b = 30000 / Math.pow(speed, 2); // initial speed 30%
        c = 3/20 * speedGain;            // gain per apple 15% 
        PillarUI.difficultyScore =  a + b + c;
      };

      optionsMenuView.changeDifficulty = function() {
        var gridSize = PillarUI.options.xGridSize;
        var speed = PillarUI.options.gameSpeed;
        var speedGain = PillarUI.options.gameSpeedGain;
        optionsMenuView.calculateDifficulty(gridSize, speed, speedGain);
        if (PillarUI.difficultyScore >= 7) {
          PillarUI.options.pillarType = "monarch";
          optionsMenuView.displayDifficulty(optionsMenuView.$monarchDiv);
        } else if (PillarUI.difficultyScore < 7 && PillarUI.difficultyScore >= 4.3) {
          PillarUI.options.pillarType = "luna";
          optionsMenuView.displayDifficulty(optionsMenuView.$lunaDiv);
        } else {
          PillarUI.options.pillarType = "swallowtail";
          optionsMenuView.displayDifficulty(optionsMenuView.$swallowtailDiv);
        }
      };
    }
    PillarUI.swapView(PillarUI.optionsMenuView, [
      bindEscToBack,
      bindOptionsMenuEvents,
      PillarUI.optionsMenuView.resetAllSliders,
      PillarUI.optionsMenuView.changeDifficulty,
      function () { 
        PillarUI.optionsMenuView.parent.focus();
      }
    ]);
  };
  
  var bindOptionsMenuEvents = PillarUI.bindOptionsMenuEvents = function() {
    $(".options-menu-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
    $(".difficulty-div").click(function (event) {
      var view = PillarUI.optionsMenuView;
      if ($(event.target).hasClass("options-monarch-div")) {
        view.$startSpeedSlider.slider("value", 135);
        view.$speedGainSlider.slider("value", 7);
        view.$gridSizeSlider.slider("value", 9);
        view.changeDifficulty();
      } else if ($(event.target).hasClass("options-luna-div")) {
        view.$startSpeedSlider.slider("value", 150);
        view.$speedGainSlider.slider("value", 5);
        view.$gridSizeSlider.slider("value", 12);
        view.changeDifficulty();
      } else if ($(event.target).hasClass("options-swallowtail-div")) {
        view.$startSpeedSlider.slider("value", 170);
        view.$speedGainSlider.slider("value", 3);
        view.$gridSizeSlider.slider("value", 14);
        view.changeDifficulty();
      }
    })
  };

  var initializeAbout = PillarUI.initializeAbout = function() {
    if (PillarUI.aboutView === undefined) {
      var $aboutDiv = PillarUI.$aboutDiv = jQuery("<div/>", {
        class: "about-div",
        tabIndex: setTabIndex()
      });

      $aboutDiv.css({
        height: PillarUI.$gameContainer.height(),
        width: PillarUI.$gameContainer.width()
      })

      var aboutView = PillarUI.aboutView = new CView({
        parent: $aboutDiv,
        target: PillarUI.$gameContainer,
        visible: false,
        transitionTime: 1000
      });

      var images = PillarUI.imagesHash;
      aboutView.$aboutImg = aboutView.loadElement(images.$aboutImg);

      aboutView.createLink("about-back").addClass("pillar-link");
      aboutView.createLink("polaris").addClass("pillar-link");

      aboutView.flashLink = function() {
        $(".polaris-link").css({
          "background-color": "blue",
          "opacity": .5
        }).animate({
          "opacity": 0
        });
      };
    }
    PillarUI.swapView(PillarUI.aboutView, [
      bindEscToBack,
      bindAboutEvents,
      PillarUI.aboutView.flashLink,
      function () { 
        PillarUI.aboutView.parent.focus();
      }
    ]);
  };

  var bindAboutEvents = PillarUI.bindAboutEvents = function() {
    $(".about-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
    $(".polaris-link").click(function(event) {
      event.preventDefault();
      window.open("https://github.com/Polaris");
    });
  };

  var initializeHelp = PillarUI.initializeHelp = function() {
    if (PillarUI.helpView === undefined) {
      var $helpDiv = PillarUI.$helpDiv = jQuery("<div/>", {
        class: "help-div",
        tabIndex: setTabIndex()
      });

      $helpDiv.css({
        height: PillarUI.$gameContainer.height(),
        width: PillarUI.$gameContainer.width()
      })

      var helpView = PillarUI.helpView = new CView({
        parent: $helpDiv,
        target: PillarUI.$gameContainer,
        visible: false,
        transitionTime: 1000
      });

      var images = PillarUI.imagesHash;
      helpView.$helpImg = helpView.loadElement(images.$helpImg);

      helpView.createLink("help-back").addClass("pillar-link");
    }
    PillarUI.swapView(PillarUI.helpView, [
      bindEscToBack,
      bindHelpEvents,
      function () { 
        PillarUI.helpView.parent.focus();
      }
    ]);
  };

  var bindHelpEvents = PillarUI.bindHelpEvents = function() {
    $(".help-back-link").click(function(event) {
      event.preventDefault();
      PillarUI.initializeMenu();
    });
  };
  var displayedScore = PillarUI.displayedScore = 0;

  var bindEscToBack = PillarUI.bindEscToBack = function() {
    PillarUI.currentView.parent.keydown(function(e) {
      e.preventDefault();
      if (e.keyCode == 27) {
        PillarUI.initializeMenu();
      }
    });
  };

  var initializeBoard = PillarUI.initializeBoard = function() {
    var moduleHeight = PillarUI.mainMenuView.parent.height();
    var moduleWidth = PillarUI.mainMenuView.parent.width();
    var $gameBoard = jQuery("<table/>", {
      class: "game-board" + " " + PillarUI.options.pillarType,
      tabIndex: setTabIndex()
    });
    var spacing = 0;

    var images = PillarUI.imagesHash;

    $gameBoard.css({
      "border-spacing": spacing,
      height: moduleHeight,
      width: moduleWidth,
      "background-image": "url(" + images.$background.attr("src") + ")",
      "background-size": "100%"
    });

    var boardView = PillarUI.boardView = new CView({
      parent: $gameBoard,
      target: PillarUI.$gameContainer,
      visible: false,
      transitionTime: 1000
    });

    boardView.$foreground = boardView.loadElement(images.$foreground);

    var xGrid = PillarUI.options.xGridSize;
    var yGrid = PillarUI.options.yGridSize;
    var xImageScale = .5 * xGrid/10
    var yImageScale = .5 * yGrid/10

    PillarUI.elementGrid = new Array();
    PillarUI.$score = jQuery("<div/>", {
      class: "score-holder"
    });

    PillarUI.$score.text("Score: " + PillarUI.displayedScore);
    PillarUI.boardView.loadElement(PillarUI.$score);

    for (var y = 0; y < yGrid; y++) {
      var $newRow = jQuery("<tr>", {
        class: "grid-row"
      });
      $newRow.css({
        "height": moduleHeight/yGrid,
        "width": moduleWidth
      });
      PillarUI.elementGrid.push(new Array());
      for (var x = 0; x < xGrid; x++) {
        var $currentSquare = jQuery("<td/>", {
           class: "gridspace"
        }).appendTo($newRow);
        $currentSquare.css({
           "width": moduleWidth/xGrid - spacing,
           "height": moduleHeight/yGrid - spacing
        });
        PillarUI.elementGrid[y].push($currentSquare);
      }
      PillarUI.boardView.loadElement($newRow);
    }
    PillarUI.canPause = true;
    PillarUI.boardView.$foreground.css({"opacity": .5});
    PillarUI.swapView(PillarUI.boardView, [
      initGameControls,
      beginUpdates
    ]);
    soundManager.play("bgm");
  };

  PillarUI.canPause = true;

  var initGameControls = PillarUI.initGameControls = function() {
    PillarUI.boardView.parent.keydown(function(e) {
      e.preventDefault();
      e.stopPropagation();
      switch(e.which) {
        case 13:
          if (PillarUI.canPause) {
            PillarUI.canPause = false;
            alert("Game Paused (=)(=)(=)(=)(:3)");
            setTimeout(function(){
              PillarUI.canPause = true;
            }, 3000);
          }
          break;
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
      for (var x = 0; x < board[0].length; x++) {
        var currentElement = PillarUI.elementGrid[y][x];
        currentElement.attr("class", "gridspace");
        var num;
        var colorNumber = options.pillarColorNumber();
        if (board[y][x] > 1) {
          num = (board[y][x] - 2) % colorNumber + 2;
        } else {
          num = board[y][x];
        }
        var determiner = num > 1 ? "color" : num;
        switch(determiner) {
          case 1:
            currentElement.addClass("apple");
          case "color":
            currentElement.addClass("color" + (num - 1) + " player-pillar");
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
        "color": "white"
      });
      PillarUI.$score.text("Score: " + PillarUI.displayedScore);
      var soundNumber = Math.floor(Math.random() * 3) + 1;
      soundManager.play("applebite" + soundNumber);
    }
  };

  var reset = PillarUI.reset = function() {
    alert("You're all out of adventures :(");
    PillarUI.displayedScore = 0;
    PillarUI.boardView.$foreground.css({"opacity": 1});
    PillarUI.boardView.destroy();
    soundManager.stopAll();
    PillarUI.initializeMenu();
  }
})(this);