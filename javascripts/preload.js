$(document).ready(function() {
  PillarUI.$gameContainer = $(".pillar-game");
  if(PillarUI.$gameContainer.attr("class") !== undefined) {
    PillarUI.initializeLoadingView();
    
    PillarUI.imagesHash = {
      // menu view
      $mainMenuImg: jQuery("<img/>", {
        class: "main-menu-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-main-menu.png"
      }),
      $apostropheImg: jQuery("<img/>", {
        class: "apostrophe-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/apostrophe.png"
      }),
      $pImg: jQuery("<img/>", {
        class: "p-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/p.png"
      }),
      $iImg: jQuery("<img/>", {
        class: "i-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/i.png"
      }),
      $l1Img: jQuery("<img/>", {
        class: "l1-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/l1.png"
      }),
      $l2Img: jQuery("<img/>", {
        class: "l2-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/l2.png"
      }),
      $aImg: jQuery("<img/>", {
        class: "a-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/a.png"
      }),
      $rImg: jQuery("<img/>", {
        class: "r-img pillar-logo-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo/r.png"
      }),
      //appleImg used twice to cache both states
      $appleImg: jQuery("<img/>", {
        class: "apple-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo-apple-eaten.png"
      }),
      $appleImg: jQuery("<img/>", {
        class: "apple-img",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/logo-apple-whole.png"
      }),
      $leftLeafImg: jQuery("<img/>", {
        class: "left",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/moddedleaf.png"
      }),
      $rightLeafImg: jQuery("<img/>", {
        class: "right",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/moddedleaf.png"
      }),

      // options view
      $optionsMenuImg: jQuery("<img/>",{
        class: "options-menu-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-options-menu.png"
      }),
      $difficultyImg: jQuery("<img/>",{
        class: "options-menu-difficulties",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/difficulties.png"
      }),

      // about view
      $aboutImg: jQuery("<img/>",{
        class: "about-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-about.png"
      }),

      // help view
      $helpImg: jQuery("<img/>",{
        class: "help-image",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/pillar-help.png"
      }),

      // cache game background/foreground
      $background: jQuery("<img/>",{
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/leaflitter.png"
      }),
      $foreground: jQuery("<img/>",{
        class: "pillar-game-foreground",
        src: "https://s3-us-west-1.amazonaws.com/polaris-pillar-main/game-foreground.png"
      })
    };

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
          },
          onplay: function() {
            this.numberPlays += 1;
            var that = this;
            soundManager.onPosition("bgm", 60574, function() {
              if (that.numberPlays < 2) {
                soundManager.play("bgm");
              }
            });
          },
          onfinish: function() {
            this.numberPlays -= 1;
          },
          onstop: function() {
            this.numberPlays -= 1;
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
      var imagesLoaded = function() {
        var loaded = true;
        $.each(PillarUI.imagesHash, function(index,value) {
          if(!value.get()[0].complete) {
            loaded = false;
            return;
          }
        });
        return loaded;
      } 
      if(imagesLoaded() && PillarUI.soundsArray.length == 4) {
        PillarUI.initializeMenu();
      } else {
        setTimeout(function() {
          tryLoad();
        }, 1000);
      }
    }
    tryLoad();
  }
});