import * as CC from "./CharacterController.js";
const root = document.getElementById("root");
const debugCheck = document.getElementById("debugCollision");
const coinsText = document.getElementById("coinsText");
const spritePath = "./assets/Character.png";

let start = false;
let scene;
let characterSprite;
let character;

let coinSprite,
  coinObjects = [];
let totalCoins = 0;

let directionKey;
let directions = {
  up: false,
  left: false,
  down: false,
  right: false,
};
let speed = 2;
let frame = 0;

init();
update();

function init() {
  scene = new CC.Scene(root, {
    width: 600,
    height: 600,
    backgroundColor: "rgb(0,0,0)",
  });
  characterSprite = new CC.SpriteRenderer({
    source: spritePath,
    textureSize: { x: 256, y: 256 },
    spriteSize: { x: 64, y: 64 },
  });
  characterSprite.addAnimations([
    new CC.Animation("Front Walk", 0, 3),
    new CC.Animation("Back Walk", 4, 7),
    new CC.Animation("Right Walk", 8, 11),
    new CC.Animation("Left Walk", 12, 15),
  ]);
  character = new CC.CCObject(characterSprite);
  character.setPosition(
    scene.sceneOptions.width / 2 -
      character.spriteRenderer.options.spriteSize.x / 2,
    scene.sceneOptions.height / 2 -
      character.spriteRenderer.options.spriteSize.y / 2
  );
  scene.add(character);
  createCoins();
  scene.render();
}
function update() {
  requestAnimationFrame(update);
  if (!start && frame < 1) {
    start = true;
    return;
  }
  frame++;
  clampCharacter();
  moveCharacter();
  coinObjects.forEach((coin) => {
    scene.onCollide(character.domElement, coin.domElement, () => {
      scene.destroy(coin);
      totalCoins++;
      coinsText.innerHTML = totalCoins;
    });
  });
  scene.render();
  //Animation update
  if (frame <= 5) return;
  frame = 0;
  animeCharacter();
  coinObjects[0].playAnimation("Coin");
  scene.render();
}
function createCoins() {
  coinSprite = new CC.SpriteRenderer({
    source: "./assets/coin.png",
    textureSize: { x: 64, y: 16 },
    spriteSize: { x: 16, y: 16 },
  });
  coinSprite.addAnimation(new CC.Animation("Coin", 0, 3));

  const nCol = 9;
  const nRow = 10;

  let pos = [0, 0];

  for (let i = 0; i < nRow; i++) {
    pos[0] = 0;
    pos[1] += 53;
    if (i == 4 || i == 5) continue;
    for (let j = 0; j < nCol; j++) {
      pos[0] += 60;
      const coin = new CC.CCObject(coinSprite);
      coin.setPosition(pos[0], pos[1]);
      coin.setScale(2.5, 2.5);
      coinObjects.push(coin);
    }
  }
  scene.addGroup(coinObjects);
}
function clampCharacter() {
  const sceneRect = scene.domElement.getBoundingClientRect();
  const playerRect = character.domElement.getBoundingClientRect();

  if (playerRect.left < sceneRect.left) {
    character.setPosition(0, character.position.y);
  } else if (
    playerRect.left + playerRect.width >
    sceneRect.left + sceneRect.width
  ) {
    character.setPosition(
      scene.domElement.clientWidth - playerRect.width,
      character.position.y
    );
  } else if (playerRect.top < sceneRect.top) {
    character.setPosition(character.position.x, 0);
  } else if (
    playerRect.top + playerRect.height >
    sceneRect.top + sceneRect.height
  ) {
    character.setPosition(
      character.position.x,
      scene.domElement.clientHeight - playerRect.height
    );
  }
}
function moveCharacter() {
  if (directions.down) {
    character.movePosition(0, speed);
  } else if (directions.up) {
    character.movePosition(0, -speed);
  } else if (directions.left) {
    character.movePosition(-speed, 0);
  } else if (directions.right) {
    character.movePosition(speed, 0);
  }
}
function animeCharacter() {
  if (directions.down) {
    character.playAnimation("Front Walk");
  } else if (directions.up) {
    character.playAnimation("Back Walk");
  } else if (directions.left) {
    character.playAnimation("Left Walk");
  } else if (directions.right) {
    character.playAnimation("Right Walk");
  } else {
    character.stopAnimation();
  }
}
window.addEventListener("keydown", (_) => {
  if (_.repeat) return;

  switch (_.key) {
    case "w":
      directionKey = _.key;
      directions.up = true;
      directions.left = false;
      directions.down = false;
      directions.right = false;
      break;

    case "a":
      directionKey = _.key;
      directions.left = true;
      directions.up = false;
      directions.down = false;
      directions.right = false;
      break;

    case "s":
      directionKey = _.key;
      directions.down = true;
      directions.left = false;
      directions.up = false;
      directions.right = false;
      break;

    case "d":
      directionKey = _.key;
      directions.right = true;
      directions.up = false;
      directions.down = false;
      directions.left = false;
      break;
  }
});
window.addEventListener("keyup", (_) => {
  if (_.repeat) return;
  if (_.key === directionKey) {
    if ((directionKey = "w")) {
      directions.up = false;
    }
    if ((directionKey = "a")) {
      directions.left = false;
    }
    if ((directionKey = "s")) {
      directions.down = false;
    }
    if ((directionKey = "d")) {
      directions.right = false;
    }
  }
});
debugCheck.addEventListener("change", (_) => {
  if (_.target.checked) {
    scene.debugCollision(1, "green");
  } else {
    scene.debugCollision(0, "");
  }
});
