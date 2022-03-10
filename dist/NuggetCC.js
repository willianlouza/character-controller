export class Scene {
    constructor(domElement, sceneOptions, objects) {
        this.loop = undefined;
        this.objects = [];
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
    beginLoop(rate) {
        this.loop = setInterval(() => {
            this.render();
            this.checkCollision();
        }, rate);
    }
    stopLoop() {
        this.loop = null;
    }
    render() {
        this.objects.forEach((object) => {
            this.domElement.appendChild(object.domElement);
            object.render();
        });
    }
    isCollide(a, b) {
        let aRect = a.getBoundingClientRect();
        let bRect = b.getBoundingClientRect();
        return !(aRect.top + aRect.height < bRect.top ||
            aRect.top > bRect.top + bRect.height ||
            aRect.left + aRect.width < bRect.left ||
            aRect.left > bRect.left + bRect.width);
    }
    onCollide(colliderA, colliderB, callback) {
        if (!this.isCollide(colliderA, colliderB)) {
            return;
        }
        callback();
    }
    checkCollision() {
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
        this.domElement.style.backgroundImage = `url(${this.spriteRenderer.sheetURL})`;
    }
    render() {
        if (!this.isVisible) {
            this.domElement.style.display = "none";
        }
        else {
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
    playAnimation(title, rate) {
        this.spriteRenderer.playAnimation(title, rate);
    }
    stopAnimation() {
        this.spriteRenderer.stopAnimation();
    }
    debugColision(border, color) {
        this.domElement.style.border = `${border}px solid ${color}`;
    }
}
export class SpriteRenderer {
    constructor(sheetURL, sheetSize, spriteSize, initialCoordinate) {
        this.sheetSize = { x: 256, y: 256 };
        this.spriteSize = { x: 64, y: 64 };
        this.spriteMap = [];
        this.animations = [];
        this.currentAnimationIndex = 0;
        this.animationLoop = undefined;
        this.sheetURL = sheetURL;
        this.sheetSize = sheetSize;
        this.spriteSize = spriteSize;
        this.coordinate = initialCoordinate || { x: 0, y: 0 };
        this.columns = Math.round(this.sheetSize.x / this.spriteSize.x);
        this.rows = Math.round(this.sheetSize.y / this.spriteSize.y);
        this.initSpriteMap();
    }
    initSpriteMap() {
        let x = 0, y = 0;
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
    setCoodinate(x, y) {
        this.coordinate = { x: x, y: y };
    }
    play(animation, rate) {
        clearInterval(this.animationLoop);
        this.animationLoop = setInterval(() => {
            animation.next((index) => {
                this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
            });
        }, rate);
    }
    addAnimation(animation) {
        this.animations.push(animation);
    }
    addAnimations(animations) {
        animations.forEach((animation) => {
            this.animations.push(animation);
        });
    }
    playAnimation(title, rate) {
        if (this.animations.length <= 0)
            return;
        for (let i = 0; i < this.animations.length; i++) {
            if (this.animations[i].title === title) {
                this.play(this.animations[i], rate);
                this.currentAnimationIndex = i;
                console.log(this.animations[i].title);
                console.log(this.coordinate);
            }
        }
    }
    stopAnimation() {
        this.animations[this.currentAnimationIndex].reset((index) => {
            this.setCoodinate(this.spriteMap[index].x, this.spriteMap[index].y);
        });
        clearInterval(this.animationLoop);
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
        }
        else {
            this.current++;
        }
        callback(this.current);
    }
    reset(callback) {
        this.current = this.start;
        callback(this.current);
    }
}
