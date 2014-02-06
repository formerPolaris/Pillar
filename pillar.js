(function(root){
  var Pillar = root.Pillar = (root.Pillar || {});

  var options = Pillar.options = {
    reset: function() {
      this.xGridSize = 10,
      this.yGridSize = 10,
      this.gameSpeed = 200,
      this.maxGameSpeed = 80,
      this.sound = "on"
    },
    xGridSize: 10,
    yGridSize: 10,
    gameSpeed: 200,
    maxGameSpeed: 80,
    sound: "on"
  };

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
          // 0 = empty; 1 = dark pillar; 2 = light pillar; 3 = apple
        }
      }
      this.layout = newBoard;
    },

    update: function() {
      for (var i = 0; i < this.layout.length; i++) {
        for (var j = 0; j < this.layout[0].length; j++) {
          if (this.layout[i][j] == 1 || this.layout[i][j] == 2) {
            this.layout[i][j] = 0;
          }
        }
      }

      var that = this;

      player.spaces.forEach(function(space) {
        var currentY = space[0];
        var currentX = space[1];
        var currentColor = space[2];

        if (that.layout[currentY][currentX] == 3) {
          if(options.gameSpeed > options.maxGameSpeed) {
            options.gameSpeed -= 5;
          }
          that.hasApple = false;
          player.growing += 1;
          that.roundScore += 10 + that.roundBonus;
          that.roundBonus++;
        }
        
        that.layout[currentY][currentX] = currentColor;
      });

      if(!this.hasApple) {
        this.spawnApple();
      }
    },

    spawnApple: function() {
      var y = Math.floor((options.yGridSize - 1) * Math.random());
      var x = Math.floor((options.xGridSize - 1) * Math.random());

      if (this.layout[y][x] != 1 && this.layout[y][x] != 2) {
        this.layout[y][x] = 3;
        this.hasApple = true;
      }
    },

    display: function(callback) {
      var that = this;
      callback(that.layout, that.roundScore);
    },

    // Display takes an external module callback and calls it with the board
    // as an argument.

    roundScore: 0,
    roundBonus: 0,
  }

  var player = Pillar.player = {
    initialize: function() {
      this.nextColor = 2;
      this.direction = "right";
      this.spaces = [
        [
          Math.floor(options.yGridSize/2),
          Math.floor(options.xGridSize/2),
          2 //color
        ]
      ];
      this.scrunched = 1;
      this.mode = "moving"; // "scrunching"
      this.growing = 0;
    },

    toggleSpaceColor: function(space) {
      if(space[2] == 2) {
        space[2] = 1;
      } else {
        space[2] = 2;
      }
    },
    swapColors: function() {
      var that = this;
      this.spaces.forEach(function(space) {
        that.toggleSpaceColor(space);
      });
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

    head: function() {
      return this.spaces[this.size() - 1];
    },
    size: function() {
      return this.spaces.length;
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
      var newSpace = new Array(this.head()[0], this.head()[1], this.head()[2]);
      this.swapColors();
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

    if (player.head()[0] < 0 || player.head()[1] < 0) {
      return true;
    } else if (player.head()[0] >= options.yGridSize) {
      return true;
    } else if (player.head()[1] >= options.xGridSize) {
      return true;
    }

    for (var i = 0; i < player.size() - 2; i++) {
      if (player.spaces[i][0] == headY && player.spaces[i][1] == headX) {
        return true;
      }
    }

    return false;
  };

  var gameOver = Pillar.gameOver = function() {
    done = true;
    alert("You're all out of adventures :(");
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

  var startGame = Pillar.startGame = function(callBackHash) {
    // Callbacks are interface methods: Display board; victory; failure; reset
    var that = this;
    this.UICallbacks = callBackHash;
    options.reset();
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
    options.reset();
    player.initialize();
    board.initialize();
    resetCallback();
  };
})(this);