(function(root){
  var Pillar = root.Pillar = (root.Pillar || {});

  var options = Pillar.options = {
    setCustom: function(optionsHash) {
      this.xGridSize = optionsHash.xGridSize;
      this.yGridSize = optionsHash.yGridSize;
      this.gameSpeed = optionsHash.gameSpeed;
      this.maxGameSpeed = optionsHash.maxGameSpeed;
      this.gameSpeedGain = optionsHash.gameSpeedGain;
    },
    setDefaults: function() { // Assuming no UI plugged in
      this.xGridSize = 12,
      this.yGridSize = 12,
      this.gameSpeed = 150,
      this.maxGameSpeed = 80,
      this.gameSpeedGain = 5
    }
  };

  options.setDefaults();

  var board = Pillar.board = {
    initialize: function() {
      this.hasApple = false;
      this.roundScore = 0;
      this.roundBonus = 0;
      var newBoard = new Array(options.yGridSize);

      for (var i = 0; i < newBoard.length; i++) {
        newBoard[i] = new Array(options.xGridSize);
        for (var j = 0; j < newBoard[0].length; j++) {
          newBoard[i][j] = 0;
          // 0 = empty; 1 = apple; any higher than 1 = pillar's colors
        }
      }
      this.layout = newBoard;
    },

    update: function() {
      for (var i = 0; i < this.layout.length; i++) {
        for (var j = 0; j < this.layout[0].length; j++) {
          if (this.layout[i][j] > 1) {
            this.layout[i][j] = 0;
          }
        }
      }

      var that = this;
      var colorOffset = -1;
      player.spaces.forEach(function(space) {
        var currentY = space[0];
        var currentX = space[1];
        var currentColor = player.spaces.length - colorOffset;

        if (that.layout[currentY][currentX] == 1) {
          if (options.gameSpeed > options.maxGameSpeed) {
            options.gameSpeed -= options.gameSpeedGain;
            if (options.gameSpeed < options.maxGameSpeed){
              options.gameSpeed = options.maxGameSpeed;
            }
          }
          that.hasApple = false;
          player.growing += 1;
          that.roundScore += 10 + that.roundBonus;
          that.roundBonus++;
        }
        
        that.layout[currentY][currentX] = currentColor;
        colorOffset++;
      });

      if (!this.hasApple) {
        this.spawnApple();
      }
    },

    spawnApple: function() {
      var y = Math.floor((options.yGridSize) * Math.random());
      var x = Math.floor((options.xGridSize) * Math.random());

      if (this.layout[y][x] !== undefined && this.layout[y][x] < 2) {
        this.layout[y][x] = 1;
        this.hasApple = true;
      }
      // Explicit undefined check necessary because 0 is falsy
      // And there is the rare case of random inclusion
    },

    display: function(callback) {
      var that = this;
      callback || (function() {
        for (var i = 0; i < that.layout.length; i++) {
          for (var j = 0; j < that.layout[0].length; j++) {
            console.log(that.layout[j][i]);
          }
          console.log("\n");
        }
      })();
      callback && callback(that.layout, that.roundScore);
    },

    // Display takes an external module callback and calls it with the board
    // as an argument.

    roundScore: 0,
    roundBonus: 0
  }

  var player = Pillar.player = {
    initialize: function() {
      this.direction = "right";
      this.spaces = [
        [
          Math.floor(options.yGridSize/2) - 1,
          Math.floor(options.xGridSize/2) - 1
        ]
      ];
      this.scrunched = 1;
      this.mode = "moving"; // "scrunching"
      this.growing = 0;
    },

    head: function() {
      return this.spaces[this.size() - 1];
    },
    size: function() {
      return this.spaces.length;
    },

    setDirection: function(dir) {
      if (this.spaces[this.size() - 2] !== undefined) {
        var behindY = this.head()[0] - this.spaces[this.size() - 2][0];
        var behindX = this.head()[1] - this.spaces[this.size() - 2][1];
        if (behindY == 1 && dir !== "up") {
          this.direction = dir;
        } else if (behindY == -1 && dir !== "down") {
          this.direction = dir;
        } else if (behindX == 1 && dir !== "left") {
          this.direction = dir;
        } else if (behindX == -1 && dir !== "right") {
          this.direction = dir;
        }
      } else {
        this.direction = dir;
      }
    },

    chooseMode: function() {
      if (this.mode == "moving") {
        if (this.scrunched == 0) {
          this.mode = "scrunching";
        }
      } else { // if mode is scrunching
        if (this.scrunched == 5 || this.scrunched - this.growing >= Math.floor(this.size()/2)) {
          this.mode = "moving";
          // if half or more scrunched, or 3, whichever first, start moving
        }
      }
    },
    move: function() {
      var newSpace = new Array(this.head()[0], this.head()[1]);
      switch(this.direction) {
        case "right":
          newSpace[1] += 1;
          break;
        case "up":
          newSpace[0] -= 1;
          break;
        case "down":
          newSpace[0] += 1;
          break;
        case "left":
          newSpace[1] -= 1;
          break;
      }
      this.spaces.push(newSpace),
      this.scrunched -= 1;
    },
    scrunch: function() {
      if (this.growing <= 0) {
        this.growing = 0;
        this.spaces.shift();
      } else {
        this.growing -= 1;
      }
      this.scrunched += 1;
    },
    update: function() {
      if (this.mode == "scrunching") {
        this.scrunch();
      } else {
        this.move();
      }
      this.chooseMode();
    }
  };

  var isGameOver = Pillar.isGameOver = function() {
    var headY = player.head()[0]
    var headX = player.head()[1]

    // Out of bounds
    if (player.head()[0] < 0 || player.head()[1] < 0) {
      return true;
    } else if (player.head()[0] >= options.yGridSize) {
      return true;
    } else if (player.head()[1] >= options.xGridSize) {
      return true;
    }
    
    // Self-collision
    for (var i = 0; i < player.size() - 2; i++) {
      if (player.spaces[i][0] == headY && player.spaces[i][1] == headX) { 
        return true;
      }
    }

    return false;
  };

  var gameOver = Pillar.gameOver = function() {
    done = true;
  };

  var done = Pillar.done = false;

  var gameTick = Pillar.gameTick = function(displayCallback) {
    player.update();
    if (isGameOver()) {
      gameOver();
      return;
    }
    board.update();
    board.display(displayCallback);
  };

  var UICallbacks = Pillar.UICallbacks = {};

  var startGame = Pillar.startGame = function(callBackHash, optionsHash) {
    // Callbacks are interface methods: Display board; victory; failure; reset
    // Options set in UI; otherwise, default
    var that = this;
    this.UICallbacks = callBackHash;
    optionsHash ? options.setCustom(optionsHash) : options.setDefaults();
    player.initialize();
    board.initialize();
    root.gameLoop = Pillar.gameLoop = function() {
      if (!done) {
        gameTick(that.UICallbacks.displayCallback);
        window.setTimeout(that.gameLoop, options.gameSpeed);
      } else {
        that.reset(that.UICallbacks.resetCallback);
      }
    }
    gameLoop();
  };

  var reset = Pillar.reset = function(resetCallback) {
    done = false;
    player.initialize();
    board.initialize();
    resetCallback();
  };
})(this);