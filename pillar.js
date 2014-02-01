(function (root){
  var Pillar = root.Pillar = (root.Pillar || {});

  var options = Pillar.options = {
    xGridSize: 10,
    yGridSize: 10,
    initialGameSpeed: 250,
    gameSpeed: (function () {
      return this.initialGameSpeed;
    })(),
    maxGameSpeed: 100,
  };

  var board = Pillar.board = {
    initialize: function () {
      var newBoard = new Array(options.yGridSize);

      for (var i = 0; i < newBoard.length; i++) {
        newBoard[i] = new Array(options.xGridSize);
        for (var j = 0; j < newBoard[0].length; j++) {
          newBoard[i][j] = 0;
          // 0 = empty; 1 = snake; 3 = apple
        }
      }
      this.layout = newBoard;
    },

    update: function () {
      for (var i = 0; i < this.layout.length; i++) {
        for (var j = 0; j < this.layout[0].length; j++) {
          if (this.layout[i][j] == 1) {
            this.layout[i][j] = 0;
          }
        }
      }

      var that = this;

      player.spaces.forEach(function(space) {
        var currentY = space[0];
        var currentX = space[1];

        if (that.layout[currentY][currentX] == 3) {
          that.hasApple = false;
          player.growing += 1;
          console.log("Delicious!")
        }
        
        that.layout[currentY][currentX] = 1;
      });

      if(!this.hasApple) {
        this.spawnApple();
      }
    },

    spawnApple: function () {
      var y = Math.floor((options.yGridSize - 1) * Math.random());
      var x = Math.floor((options.xGridSize - 1) * Math.random());

      if (this.layout[y][x] != 1) {
        this.layout[y][x] = 3;
        this.hasApple = true;
      }
    },

    hasApple: false,

    display: function (callback) {
      var that = this;
      callback(that.layout);
    }

    // Display takes an external module callback and calls it with the board
    // as an argument.
  }

  var player = Pillar.player = {
    nextColor: "light",
    toggleColor: function () {
      if(this.nextColor == "light") {
        this.nextColor = "dark";
      } else {
        this.nextColor = "light";
      }
    },
    returnColorNumber: function () {
      switch (this.nextColor) {
        case "dark":
          return 1;
          break;
        case "light":
          return 2;
          break;
      }
    },

    direction: "right", // "left" "up" "down"
    setDirection: function (dir) {
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
      //TOOD: Refactor to prevent 180

      console.log("method called");
    },

    spaces: [
      [
        Math.floor(options.yGridSize/2),
        Math.floor(options.xGridSize/2)
      ]
    ],
    head: function () {
      return this.spaces[this.size() - 1];
    },
    size: function () {
      return this.spaces.length;
    },

    scrunched: 1,
    mode: "moving", // "scrunching"
    growing: 0,
    chooseMode: function () {
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

    move: function () {
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
    scrunch: function () {
      if (this.growing <= 0) {
        this.growing = 0;
        this.spaces.shift();
      } else {
        this.growing -= 1;
      }
      this.scrunched += 1;
    },
    update: function () {
      if (this.mode == "scrunching") {
        this.scrunch();
      } else {
        this.move();
      }
      this.chooseMode();
    }
  };

  var isGameOver = Pillar.isGameOver = function () {
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

  var gameOver = Pillar.gameOver = function () {
    window.clearInterval(Pillar.gameLoop);
    alert("You're all out of adventures :(");
  };

  var gameTick = Pillar.gameTick = function (displayCallback) {
    if (isGameOver()) {
      gameOver();
    }
    player.update();
    board.update();
    board.display(displayCallback);
  };

  var startGame = Pillar.startGame = function (displayCallback) {
    board.initialize();
    var container = function () {
      gameTick(displayCallback);
    };
    root.gameLoop = Pillar.gameLoop = window.setInterval(container, options.initialGameSpeed);
  };
})(this);