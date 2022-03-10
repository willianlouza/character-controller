type vector2 = {
  x: number;
  y: number;
};
type sceneOptions = {
  width: number;
  height: number;
  backgroundColor: string;
};

export class Scene {
  objects: CCObject[];
  domElement: HTMLElement;
  sceneOptions: sceneOptions;
  loop: any = undefined;
  constructor(
    domElement: HTMLElement,
    sceneOptions?: sceneOptions,
    objects?: CCObject[]
  ) {
    this.objects = objects || [];
    this.domElement = domElement;

    this.sceneOptions = sceneOptions || {
      width: 300,
      height: 300,
      backgroundColor: "rgba(0,0,0,1)",
    };

    this.init();
  }

  add(object: CCObject): void {
    this.objects.push(object);
  }
  addGroup(objects: CCObject[]): void {
    objects.forEach((object) => this.objects.push(object));
  }

  init() {
    this.domElement.style.position = "relative";
    this.domElement.style.overflow = "hidden";
    this.domElement.style.backgroundColor = this.sceneOptions.backgroundColor;
    this.domElement.style.width = this.sceneOptions.width + "px";
    this.domElement.style.height = this.sceneOptions.height + "px";
  }

  beginLoop(rate: number): void {
    this.loop = setInterval(() => {
      this.render();
      this.checkCollision();
    }, rate);
  }
  stopLoop(): void {
    clearInterval(this.loop);
  }
  render(): void {
    this.objects.forEach((object) => {
      this.domElement.appendChild(object.domElement);
      object.render();
    });
  }
  isCollide(a: HTMLElement, b: HTMLElement): boolean {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }
  onCollide(
    colliderA: HTMLElement,
    colliderB: HTMLElement,
    callback: Function
  ): void {
    if (!this.isCollide(colliderA, colliderB)) {
      return;
    }
    callback();
  }
  checkCollision(): void {
    for (let i = 0; i < this.objects.length; i++) {
      let a = this.objects[i].domElement;

      for (let j = i + 1; j < this.objects.length; j++) {
        let b = this.objects[j].domElement;

        this.onCollide(a, b, () => {
          console.log(`Colliding`);
        });
      }
    }
  }
}

export class Transform {
  position: vector2 = { x: 0, y: 0 };
  rotation: number = 0;
  scale: vector2 = { x: 1, y: 1 };

  setPosition(x: number, y: number) {
    this.position = { x: x, y: y };
  }
  movePosition(x: number, y: number) {
    this.position.x += x;
    this.position.y += y;
  }
  setRotation(angle: number) {
    this.rotation = angle;
  }
  rotate(angle: number) {
    this.rotation += angle;
  }
  setScale(x: number, y: number) {
    this.scale = { x: x, y: y };
  }
}

export class CCObject extends Transform {
  domElement: HTMLElement;
  isVisible: boolean;
  spriteRenderer: SpriteRenderer;
  constructor(spriteRenderer: SpriteRenderer) {
    super();
    this.isVisible = true;
    this.domElement = document.createElement("div");
    this.spriteRenderer = spriteRenderer;
    this.domElement.style.position = "absolute";
    this.domElement.style.backgroundImage = `url(${this.spriteRenderer.sheetURL})`;
  }

  render(): void {
    if (!this.isVisible) {
      this.domElement.style.display = "none";
    } else {
      this.domElement.style.display = "block";
    }

    this.domElement.style.backgroundPosition = `${this.spriteRenderer.coordinate.x}px ${this.spriteRenderer.coordinate.y}px`;

    this.domElement.style.width = this.spriteRenderer.spriteSize.x + "px";
    this.domElement.style.height = this.spriteRenderer.spriteSize.y + "px";

    this.domElement.style.left = this.position.x + "px";
    this.domElement.style.top = this.position.y + "px";
    this.domElement.style.transform = `rotate(${this.rotation}deg)`;
    this.domElement.style.transform = `scale(${this.scale.x}, ${this.scale.y})`;

    //Animar
  }

  playAnimation(title: string, rate: number): void {
    this.spriteRenderer.playAnimation(title, rate);
  }

  stopAnimation(): void {
    this.spriteRenderer.stopAnimation();
  }
  debugColision(border: number, color: string): void {
    this.domElement.style.border = `${border}px solid ${color}`;
  }
}

export class SpriteRenderer {
  sheetURL: string;
  sheetSize: vector2 = { x: 256, y: 256 };
  spriteSize: vector2 = { x: 64, y: 64 };
  columns: number;
  rows: number;

  coordinate: vector2;

  spriteMap: vector2[] = [];

  animations: Animation[] = [];
  currentAnimationIndex: number = 0;
  animationLoop: any = undefined;

  constructor(
    sheetURL: string,
    sheetSize: vector2,
    spriteSize: vector2,
    initialCoordinate?: vector2
  ) {
    this.sheetURL = sheetURL;
    this.sheetSize = sheetSize;
    this.spriteSize = spriteSize;
    this.coordinate = initialCoordinate || { x: 0, y: 0 };

    this.columns = Math.round(this.sheetSize.x / this.spriteSize.x);
    this.rows = Math.round(this.sheetSize.y / this.spriteSize.y);

    this.initSpriteMap();
  }

  initSpriteMap(): void {
    let x = 0,
      y = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.spriteMap.push({ x: x, y: y });
        x += this.spriteSize.x;
      }
      x = 0;
      y += this.spriteSize.y;
    }

    this.setCoodinate(this.spriteMap[0].x, this.spriteMap[0].y);
  }

  setCoodinate(x: number, y: number): void {
    this.coordinate = { x: x, y: y };
  }

  play(animation: Animation, rate: number): void {
    clearInterval(this.animationLoop);
    this.animationLoop = setInterval(() => {
      animation.next((index: number) => {
        this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
      });
    }, rate);
  }
  addAnimation(animation: Animation): void {
    this.animations.push(animation);
  }
  addAnimations(animations: Animation[]): void {
    animations.forEach((animation) => {
      this.animations.push(animation);
    });
  }
  playAnimation(title: string, rate: number): void {
    if (this.animations.length <= 0) return;

    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i].title === title) {
        this.play(this.animations[i], rate);
        this.currentAnimationIndex = i;

        console.log(this.animations[i].title);
        console.log(this.coordinate);
      }
    }
  }

  stopAnimation(): void {
    this.animations[this.currentAnimationIndex].reset((index: number) => {
      this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
    });
    clearInterval(this.animationLoop);
  }
}

export class Animation {
  title: string;
  start: number;
  end: number;
  current: number;
  constructor(title: string, start: number, end: number) {
    this.title = title;
    this.start = start;
    this.end = end;
    this.current = start;
  }

  next(callback: Function): void {
    if (this.current >= this.end) {
      this.current = this.start;
    } else {
      this.current++;
    }
    callback(this.current);
  }

  reset(callback: Function): void {
    this.current = this.start;
    callback(this.current);
  }
}
