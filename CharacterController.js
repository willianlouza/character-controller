export class Scene {
  constructor(domElement, sceneOptions, objects) {
    this.objects = objects || [];
    this.domElement = domElement;
    this.sceneOptions = sceneOptions || {
      width: 300,
      height: 300,
      backgroundColor: "rgba(0,0,0,1)",
    };
    this.init();
  }
  add(object) {
    this.objects.push(object);
  }
  addGroup(objects) {
    objects.forEach((object) => this.objects.push(object));
  }
  init() {
    this.domElement.style.position = "relative";
    this.domElement.style.overflow = "hidden";
    this.domElement.style.backgroundColor = this.sceneOptions.backgroundColor;
    this.domElement.style.width = this.sceneOptions.width + "px";
    this.domElement.style.height = this.sceneOptions.height + "px";
  }
  render() {
    this.objects.forEach((object) => {
      this.domElement.appendChild(object.domElement);
      object.render();
    });
  }
  isColliding(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }
  onCollide(colliderA, colliderB, callback) {
    if (!this.isColliding(colliderA, colliderB)) {
      return;
    }
    callback();
  }
  debugCollision(size, color) {
    this.objects.forEach((object) => {
      object.debugCollision(size, color);
    });
  }
  destroy(object) {
    for (let i = 0; i < this.objects.length; i++) {
      if (object === this.objects[i]) {
        this.objects[i].domElement.remove();
        this.objects.splice(i, 1);
      }
    }
  }
}
export class Transform {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.rotation = 0;
    this.scale = { x: 1, y: 1 };
  }
  setPosition(x, y) {
    this.position = { x: x, y: y };
  }
  movePosition(x, y) {
    this.position.x += x;
    this.position.y += y;
  }
  setRotation(angle) {
    this.rotation = angle;
  }
  rotate(angle) {
    this.rotation += angle;
  }
  setScale(x, y) {
    this.scale = { x: x, y: y };
  }
}
export class CCObject extends Transform {
  constructor(spriteRenderer) {
    super();
    this.isVisible = true;
    this.domElement = document.createElement("div");
    this.spriteRenderer = spriteRenderer;
    this.domElement.style.position = "absolute";
    this.domElement.style.backgroundImage = `url(${this.spriteRenderer.options.source})`;
  }
  render() {
    if (!this.isVisible) {
      this.domElement.style.display = "none";
      return;
    } else {
      this.domElement.style.display = "block";
    }
    this.domElement.style.backgroundPosition = `${this.spriteRenderer.coordinate.x}px ${this.spriteRenderer.coordinate.y}px`;
    this.domElement.style.width =
      this.spriteRenderer.options.spriteSize.x + "px";
    this.domElement.style.height =
      this.spriteRenderer.options.spriteSize.y + "px";
    this.domElement.style.left = this.position.x + "px";
    this.domElement.style.top = this.position.y + "px";
    this.domElement.style.transform = `rotate(${this.rotation}deg)`;
    this.domElement.style.transform = `scale(${this.scale.x}, ${this.scale.y})`;
  }
  playAnimation(title) {
    this.spriteRenderer.playAnimation(title);
  }
  stopAnimation() {
    this.spriteRenderer.stopAnimation();
  }
  debugCollision(strokeSize, color) {
    this.domElement.style.outline = `${strokeSize}px solid ${color}`;
  }
}
export class SpriteRenderer {
  constructor(options, initialCoordinate) {
    this.spriteMap = [];
    this.animations = [];
    this.currentAnimationIndex = 0;
    this.options = options;
    this.coordinate = initialCoordinate || { x: 0, y: 0 };
    this.columns = Math.round(
      this.options.textureSize.x / this.options.spriteSize.x
    );
    this.rows = Math.round(
      this.options.textureSize.y / this.options.spriteSize.y
    );
    this.initSpriteMap();
  }
  initSpriteMap() {
    let x = 0,
      y = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.spriteMap.push({ x: x, y: y });
        x += this.options.spriteSize.x;
      }
      x = 0;
      y += this.options.spriteSize.y;
    }
    this.setCoodinate(this.spriteMap[0].x, this.spriteMap[0].y);
  }
  setCoodinate(x, y) {
    this.coordinate = { x: x, y: y };
  }
  play(animation) {
    animation.next((index) => {
      this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
    });
  }
  addAnimation(animation) {
    this.animations.push(animation);
  }
  addAnimations(animations) {
    animations.forEach((animation) => {
      this.animations.push(animation);
    });
  }
  playAnimation(title) {
    if (this.animations.length <= 0) return;

    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i].title === title) {
        this.play(this.animations[i]);
        this.currentAnimationIndex = i;
      }
    }
  }
  stopAnimation() {
    this.animations[this.currentAnimationIndex].reset((index) => {
      this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
    });
  }
}
export class Animation {
  constructor(title, start, end) {
    this.title = title;
    this.start = start;
    this.end = end;
    this.current = start;
  }
  next(callback) {
    if (this.current >= this.end) {
      this.current = this.start;
    } else {
      this.current++;
    }
    callback(this.current);
  }
  reset(callback) {
    this.current = this.start;
    callback(this.current);
  }
}
