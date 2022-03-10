import * as CC from "./dist/NuggetCC.js";

const root = document.getElementById("root");

const spritePath = "./assets/Character.png";

var scene = new CC.Scene(root, {
  width: 600,
  height: 600,
  backgroundColor: "rgb(0,0,0)",
});
scene.beginLoop(60);

var pokemonSprite = new CC.SpriteRenderer(
  spritePath,
  { x: 256, y: 256 },
  { x: 64, y: 64 }
);
var pokeChar = new CC.CCObject(pokemonSprite);
pokeChar.debugColision(2, "red");
scene.add(pokeChar);

var frontWalk = new CC.Animation("Front Walk", 0, 3);
var backWalk = new CC.Animation("Back Walk", 4, 7);
var rightWalk = new CC.Animation("Right Walk", 8, 11);
var leftWalk = new CC.Animation("Left Walk", 12, 15);

pokemonSprite.addAnimations([frontWalk, leftWalk, rightWalk, backWalk]);

var walkLoop;
window.addEventListener("keydown", (_) => {
  if (_.repeat) {
    return;
  }

  switch (_.key) {
    case "w":
      clearInterval(walkLoop);
      pokeChar.playAnimation("Back Walk", 100);
      walkLoop = setInterval(() => {
        pokeChar.movePosition(0, -5);
      }, 50);
      break;

    case "a":
      clearInterval(walkLoop);
      pokeChar.playAnimation("Left Walk", 100);
      walkLoop = setInterval(() => {
        pokeChar.movePosition(-5, 0);
      }, 50);
      break;

    case "s":
      clearInterval(walkLoop);
      pokeChar.playAnimation("Front Walk", 100);
      walkLoop = setInterval(() => {
        pokeChar.movePosition(0, 5);
      }, 50);
      break;

    case "d":
      clearInterval(walkLoop);
      pokeChar.playAnimation("Right Walk", 100);
      walkLoop = setInterval(() => {
        pokeChar.movePosition(5, 0);
      }, 50);
      break;
  }
});

window.addEventListener("keyup", (_) => {
  if (_.repeat) {
    return;
  }
  pokeChar.stopAnimation();
  clearInterval(walkLoop);
});
