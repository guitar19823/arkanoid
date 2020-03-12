const game = {
  width: 1366,
  height: 768,
  ctx: undefined,
  canvasStyles: undefined,
  cols: 17,
  rows: 2,
  blocks: [],
  balls: 1,
  speed: 27,
  running: true,
  score: 0,
  live: 5,
  blockLives: 0,
  level: 1,
  levels: 7,
  draw: false,
  volumeSoundTrack: 0.1,
  volumeEffects: 0.5,
  sprites: {
    background: undefined,
    mouse: undefined,
    start: undefined,
    next: undefined,
    platform: undefined,
    ball: undefined,
    block_black: undefined,
    block_red: undefined,
    block_blue: undefined,
    block_green: undefined,
    block_yellow: undefined,
    block_violet: undefined,
    heart: undefined,
    pause: undefined,
    win: undefined,
    over: undefined
  },
  sounds: {
    bump: undefined,
    block: undefined,
    soundTrack: undefined,
    live: undefined,
    complete: undefined,
    out: undefined
  },
  init() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.font = "25px Arial";
    this.ctx.fillStyle = "#ffff";

    window.addEventListener("keydown", e => {
      if (game.draw) {
        e.keyCode === 37 && (game.platform.dx = -game.platform.velocity);
        e.keyCode === 39 && (game.platform.dx = game.platform.velocity);
        e.keyCode === 32 && game.blockLives && game.platform.releaseBall();
        e.keyCode === 27 && game.pause.paused();
      }
    });

    window.addEventListener("keyup", e => {
      e.keyCode === 37 && game.draw && game.platform.stop();
      e.keyCode === 39 && game.draw && game.platform.stop();
    });

    this.canvasStyles = window.getComputedStyle(this.canvas);

    window.addEventListener("resize", () => {
      this.canvasStyles = window.getComputedStyle(this.canvas);
    });
    
    this.canvas.addEventListener("click", e => {
      if (!this.draw) {
        const canvasWidth = parseInt(this.canvasStyles.width);
        const canvasHeight = parseInt(this.canvasStyles.height);
        const x = this.running ? canvasWidth / 2.61185 : canvasWidth / 3.38958;
        const y = this.running ? canvasHeight / 2.4 : canvasHeight / 5.73134;

        if (e.offsetX >= x && e.offsetX <= canvasWidth - x &&
          e.offsetY >= y && e.offsetY <= canvasHeight - y) {
          if (this.level <= this.levels) {
            if (this.live) {
              this.startButton.pressed ? this.nextButton.next() : this.startButton.start();
            } else {
              this.over.reloadGame();
            }
          } else {
            if (this.live) {
              this.win.reloadGame();
            } else {
              this.over.reloadGame();
            }
          }
        }
      }
    });
  },
  load() {
    for (let key in this.sprites) {
      this.sprites[key] = new Image();
      this.sprites[key].src = `img/${key}.png`;
    }

    for (let key in this.sounds) {
      this.sounds[key] = document.createElement("audio");
      this.sounds[key].src = `sound/${key}.mp3`;
    }

    this.sounds.soundTrack.loop = true;
  },
  create() {
    this.blocks = [];

    for (let row = 0; row < this.level + 1; row++) {
      for (let col = 0; col < this.cols - row; col++) {
        let live = 1,
            rand = Math.random() * this.level,
            specialBlock = Math.random() < 0.03 ? "increase" : Math.random() > 0.97 ? "addingLife" : undefined;
            
        this.level === 1 && (live = rand < 0.2 ? 2 : 1);
        this.level === 2 && (live = rand < 1 ? 1 : 2);
        this.level === 3 && (live = rand < 1 ? 1 : rand > 2 ? 3 : 2);
        this.level === 4 && (live = rand < 2 ? 2 : rand > 3 ? 3 : 4);
        this.level === 5 && (live = rand < 1 ? 2 : rand > 3 ? 3 : 4);
        this.level === 6 && (live = rand < 1 ? 2 : rand > 3 ? 4 : 3);
        this.level === 7 && (live = rand < 1 ? 2 : rand > 2 ? 4 : 3);

        this.blockLives += live;

        this.blocks.push({
          x: 74 * col + 91 + 37 * (row - 1),
          y: 29 * row + 83,
          width: 70,
          height: 20,
          live,
          specialBlock
        });
      }
    }
  },
  start() {
    this.init();
    this.load();
    this.create();
    this.run();
  },
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.drawImage(this.sprites.background, 0, 0, this.width, this.height);

    if (this.draw) {
      this.canvas.style.cursor = "none";
      this.platform.draw();
      this.ball.draw();
      
      this.blocks.forEach(function(element) {
        switch (element.live) {
          case 4: element.specialBlock || this.ctx.drawImage(this.sprites.block_black, element.x, element.y); break;
          case 3: element.specialBlock || this.ctx.drawImage(this.sprites.block_red, element.x, element.y); break;
          case 2: element.specialBlock || this.ctx.drawImage(this.sprites.block_blue, element.x, element.y); break;
          case 1: element.specialBlock || this.ctx.drawImage(this.sprites.block_green, element.x, element.y); break;
        }

        if (element.live) {
          switch (element.specialBlock) {
            case "increase": this.ctx.drawImage(this.sprites.block_yellow, element.x, element.y); break;
            case "addingLife": this.ctx.drawImage(this.sprites.block_violet, element.x, element.y); break;
          }
        }
      }, this);

      this.ctx.fillText(`LEVEL: ${this.level}`, this.width / 2 - 50, 50);
      this.ctx.fillText(`SCORE: ${this.score}`, 30, 50);
      this.ctx.fillText(`LIVE:`, this.width - 250, 50);
      this.ctx.fillText(`BLOCKS: ${this.blockLives}`, this.width - 250, this.height - 15);
      
      for (let live = 0; live < this.live; live++) {
        this.heart.draw(live);
      }

      this.pause.pressed && this.pause.draw();
    } else {
      this.canvas.style.cursor = `url("img/mouse.png"), auto`;

      if (this.level <= this.levels) {
        if (this.live) {
          game.startButton.pressed ? this.nextButton.draw() : this.startButton.draw()
        }else {
          this.over.draw();
        }
      } else {
        if (this.live) {
          this.win.draw();
        } else {
          this.over.draw();
        }
      }
    }
  },
  update() {
    const lastBlock = this.blocks[this.blocks.length - 1];

    game.platform.dx && this.platform.move();

    if (game.ball.dx || game.ball.dy) {
      this.ball.move();
    }

    if (lastBlock.y + lastBlock.height + game.ball.velocity * 1.5 > game.ball.y) {
      this.blocks.forEach(function(element) {
        if(element.live) {
          if (this.ball.collide(element)) {
            this.ball.bumpBlock(element);
          }
        }
      }, this);
    }

    if (game.platform.y - game.ball.velocity * 1.5 > game.ball.y) {
      if (this.ball.collide(this.platform)) {
        this.ball.bumpPlatform(this.platform);
      }
    }

    this.ball.checkBounds();
  },
  run() {
    this.update();
    this.render();

    if (this.running) {
      window.requestAnimationFrame(() => {
        game.run();
      });
    }
  },
  nextLevel() {
    ++this.level;
    this.draw = false;

    if (this.level > this.levels) {
      if (game.live) {
        game.win.animate();
      } else {
        game.over.animate();
      }
    } else {
      if (game.live) {
        this.live = 5;
        this.create();
        game.sound.play(game.sounds.complete, game.volumeEffects);
      } else {
        game.over.animate();
      }
    }
  }
};

game.sound = {
  soundPlay: false,
  play(track, volume = 1.0) {
    const playPromise = track.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        track.play();
        this.soundPlay = true;
        game.sound.volume(track, volume);
      })
      .catch(e => {
        console.log(e);
      });
    }
  },
  stop(track) {
    if (this.soundPlay) {
      this.soundPlay = false;
      track.pause();
      track.currentTime = 0.0;
    }
  },
  rePlay(track, volume = 1.0) {
    this.stop(track);
    this.play(track);
    this.volume(track, volume);
  },
  volume(track, volume) {
    track.volume = volume;
  }
};

game.startButton = {
  x: 523,
  y: 320,
  width: 320,
  height: 128,
  pressed: false,
  draw() {
    game.ctx.drawImage(game.sprites.start, this.x, this.y, this.width, this.height);
  },
  start() {
    this.pressed = true;
    game.draw = true;
    game.sound.play(game.sounds.soundTrack, game.volumeSoundTrack);
  }
};

game.pause = {
  x: 523,
  y: 320,
  width: 320,
  height: 128,
  pressed: false,
  draw() {
    game.ctx.drawImage(game.sprites.pause, this.x, this.y, this.width, this.height);
  },
  paused() {
    game.running = !game.running;
    if (game.running) {
      game.run();
      this.pressed = false;
    } else {
      this.pressed = true;
    }
  }
}

game.nextButton = {
  x: 523,
  y: 320,
  width: 320,
  height: 128,
  draw() {
    game.ctx.drawImage(game.sprites.next, this.x, this.y, this.width, this.height);
  },
  next() {
    game.draw = true;
  }
};

game.win = {
  x: 683,
  y: 384,
  width: 0,
  height: 0,
  draw() {
    game.ctx.drawImage(game.sprites.win, this.x, this.y, this.width, this.height);
    game.sound.play(game.sounds.complete, game.volumeEffects);
  },
  reloadGame() {
    game.running || window.location.reload();
  },
  animate() {
    const interval = setInterval(() => {
      if (game.win.width >= 560) {
        game.running = false;
        clearInterval(interval);
      } else {
        game.win.width += 44.8;
        game.win.height += 40;
        game.win.x -= 22.4;
        game.win.y -= 20;
      }
    }, 17);
  }
};

game.over = {
  x: 683,
  y: 384,
  width: 0,
  height: 0,
  draw() {
    game.ctx.drawImage(game.sprites.over, this.x, this.y, this.width, this.height);
    game.sound.play(game.sounds.complete, game.volumeEffects);
  },
  reloadGame() {
    game.running || window.location.reload();
  },
  animate() {
    const interval = setInterval(() => {
      if (game.over.width >= 560) {
        game.running = false;
        clearInterval(interval);
      } else {
        game.over.width += 44.8;
        game.over.height += 40;
        game.over.x -= 22.4;
        game.over.y -= 20;
      }
    }, 17);
  }
};

game.heart = {
  x: (game.width - 180),
  y: 28,
  width: 25,
  height: 25,
  draw(live) {
    game.ctx.drawImage(game.sprites.heart, this.x + 30 * live, this.y, this.width, this.height);
  }
};

game.ball = {
  x: 670.5,
  y: 680,
  width: 20,
  height: 20,
  frame: 0,
  interval: undefined,
  dx: 0,
  dy: 0,
  velocity: game.speed / 3,
  draw() {
    game.ctx.drawImage(game.sprites.ball, this.width * this.frame, 0, this.width, this.height, this.x, this.y, this.width, this.height);
  },
  jump() {
    this.dx = 0;
    this.dy = -this.velocity;
    this.animate();
  },
  animate() {
    this.interval = setInterval(() => {
      ++game.ball.frame;

      game.ball.frame > 23 && (game.ball.frame = 0);
    }, 30);
  },
  move() {
    this.x += this.dx;
    this.y += this.dy;
  },
  collide(element) {
    const nextX = this.x + this.dx;
    const nextY = this.y + this.dy;

    if (nextX + this.width > element.x &&
      nextX < element.x + element.width &&
      nextY + this.height > element.y &&
      nextY < element.y + element.height) {
      return true;
    }
    return false;
  },
  sideOfCollide (element) {
    const nextX = this.x + this.dx;
    const nextY = this.y + this.dy;
    const rightX = element.x + element.width;
    const bottomY = element.y + element.height;

    if (nextX + this.width >= element.x && this.x + this.width < element.x ||
      nextX <= rightX && this.x > rightX) {
      this.dx *= -1;
    } else if (nextY + this.height >= element.y && this.y + this.height < element.y ||
      nextY <= bottomY && this.y > bottomY) {
      this.dy *= -1;
    }
  },
  bumpBlock(block) {
    game.sound.rePlay(game.sounds.block, game.volumeEffects);

    this.sideOfCollide(block);

    --block.live;
    --game.blockLives;
    ++game.score;

    if (block.specialBlock === "addingLife" || game.score % 150 === 0) {
      if (game.live < 5) {
        setTimeout(() => {
          ++game.live;
          game.sound.play(game.sounds.live, game.volumeEffects);
        }, 100)
      }
    }
    
    if (block.specialBlock === "increase") {
      block.specialBlock == undefined;

      game.platform.increasePlatform();
    }

    if (block.live) {
      block.specialBlock = Math.random() < 0.03 ? "increase" : Math.random() > 0.97 ? "addingLife" : undefined
    }

    if (!game.blockLives) {

      setTimeout(() => {
        game.ball.ballGoToPlatform();
      }, 500);
      setTimeout(() => {
        game.nextLevel();
      }, 1000);
    }
  },
  bumpPlatform(platform) {
    game.sound.rePlay(game.sounds.bump, game.volumeEffects);

    if (this.y + this.dy + this.height >= platform.y && this.y < platform.y) {
      const angle = this.angleOfReflection(platform);

      this.dx = this.velocity * angle;
      this.dy = -this.velocity * Math.cos(Math.asin(angle));
    } else if (this.x + this.dx + this.width >= platform.x && this.x < platform.x ||
      this.x + this.dx <= platform.x + platform.width && this.x > platform.x + platform.width) {
      this.dx *= -1;
    }
  },
  angleOfReflection(platform) {
    return ((this.x + this.width / 2) - (platform.x + platform.width / 2)) / (platform.width / 1.5);
  },
  checkBounds() {
    const x = this.x + this.dx;
    const y = this.y + this.dy;

    if (x < 0) {
      game.sound.rePlay(game.sounds.bump, game.volumeEffects);
      
      this.x = 0;
      this.dx *= -1;
    } else if (x + this.width > game.width) {
      game.sound.rePlay(game.sounds.bump, game.volumeEffects);
      
      this.x = game.width - this.width;
      this.dx *= -1;
    } else if (y < 0) {
      game.sound.rePlay(game.sounds.bump, game.volumeEffects);
      
      this.y = 0;
      this.dy *= -1;
    } else if (y + this.height > game.height) {
      --game.live;
      game.sound.play(game.sounds.out, game.volumeEffects);

      game.live || setTimeout(() => {
        game.nextLevel();
      }, 1000);

      this.ballGoToPlatform();
    }
  },
  ballGoToPlatform () {
    clearInterval(this.interval);
      this.dx = 0;
      this.dy = 0;
      this.x = game.platform.x + (game.platform.width - this.width) / 2;
      this.y = 680;

      game.platform.ball = this;
  }
};

game.platform = {
  x: 624,
  y: 700,
  width: 110,
  height: 20,
  velocity: game.speed,
  acceleration: 0,
  dx: 0,
  ball: game.ball,
  timeout: undefined,
  draw() {
    game.ctx.drawImage(game.sprites.platform, this.x, this.y, this.width, this.height);
  },
  move() {
    this.acceleration < 1 && (this.acceleration += 0.03);

    const x = this.x + this.dx * this.acceleration;
    const dx = this.dx * this.acceleration;

    if (x < 0) {
      this.x = 0;
      this.stop();
    } else if (x + this.width > game.width) {
      this.x = game.width - this.width;
      this.stop();
    } else {
      this.x += dx;

      if (this.ball) {
        this.ball.x += dx;
      }
    }
  },
  stop() {
    this.acceleration = 0;
    this.dx = 0;

    if (this.ball) {
      this.ball.x = this.x + (this.width - this.ball.width) / 2;
    }
  },
  releaseBall() {
    if (this.ball) {
      this.ball.jump();
      this.ball = false;
    }
  },
  increasePlatform() {
    const interval = setInterval(() => {
      if (game.platform.width >= 150) {
        clearInterval(interval);
      } else {
        ++game.platform.width;
        game.platform.x -= 0.5;
      }
    }, 10);

    this.timeout !== undefined && clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (game.platform.width <= 110) {
          clearInterval(interval);
        } else {
          --game.platform.width;
          game.platform.x += 0.5;
        }
      }, 17);
    }, 30000);
  }
};

const preloader = {
  element: document.createElement("div"),
  create() {
    this.element.id = "preloader";
    document.body.appendChild(this.element);
  },
  delete() {
    this.element.remove();
  }
};

window.addEventListener("DOMContentLoaded", () => {
  preloader.create();
});


window.addEventListener("load", () => {
  setTimeout(() => {
    console.log(document.readyState);
    game.start();
    preloader.delete();
  }, Math.random() * 2000);
});
