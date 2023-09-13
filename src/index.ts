let canvas = document.getElementById("canvas");
let debugText = document.getElementById("debugText");
if (!canvas) {
  throw Error("Canvas not found");
}

let ctx = (canvas as HTMLCanvasElement).getContext("2d");
if (!ctx) {
  throw Error("cannot get rendering context");
}
// render pixelated
ctx.imageSmoothingEnabled = false;

let width = 800;
let height = 600;
let zoom = 1.0;

// current image / canvas position in viewport
let canvasPosX = 0;
let canvasPosY = 0;
// current cursor pos, relative to viewport
let cursorViewX = 0;
let cursorViewY = 0;
// current cursor pos, relative to canvas / image
let cursorX = 0;
let cursorY = 0;

// Panning function
// cursor pos when mouse start panning
let panStartCursorX = 0;
let panStartCursorY = 0;
// image position in the viewport when start panning
let panStartCanvasPosX = 0;
let panStartCanvasPosY = 0;

let isHoldSpace = false;
let isPanning = false;

const bgImg = new Image();
bgImg.src = "/images/bg.png";

const img = new Image();
img.src = "/images/character.png";

const draw = () => {
  if (ctx) {
    ctx.clearRect(0, 0, width, height);
    const pattern = ctx.createPattern(bgImg, "repeat");
    if (pattern) ctx.fillStyle = pattern;
    ctx.fillRect(canvasPosX, canvasPosY, img.width * zoom, img.height * zoom);

    ctx.drawImage(
      img,
      canvasPosX,
      canvasPosY,
      img.width * zoom,
      img.height * zoom,
    );
  }

  let debugInfo = {
    x: cursorViewX - canvasPosX,
    y: cursorViewY - canvasPosY,
    width: img.width,
    height: img.height,
  };
  if (debugText) debugText.innerHTML = JSON.stringify(debugInfo);
};

img.addEventListener("load", () => {
  // set deafault pos to centered at start
  canvasPosX = width / 2 - img.width / 2;
  canvasPosY = height / 2 - img.height / 2;
  draw();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    isHoldSpace = true;
    if (canvas) canvas.style.cursor = "pointer";
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    isHoldSpace = false;
    if (canvas) canvas.style.cursor = "default";
  }
});

canvas.addEventListener("mousedown", (event) => {
  if (isHoldSpace && !isPanning) {
    isPanning = true;
    panStartCursorX = event.x;
    panStartCursorY = event.y;
    panStartCanvasPosX = canvasPosX;
    panStartCanvasPosY = canvasPosY;
  }
});

canvas.addEventListener("mouseup", (event) => {
  isPanning = false;
});

canvas.addEventListener("mousemove", (event) => {
  // console.log(event);
  cursorViewX = event.x;
  cursorViewY = event.y;
  cursorX = cursorViewX - canvasPosX;
  cursorY = cursorViewY - canvasPosY;

  if (isPanning) {
    let deltaX = cursorViewX - panStartCursorX;
    let deltaY = cursorViewY - panStartCursorY;
    canvasPosX = panStartCanvasPosX + deltaX;
    canvasPosY = panStartCanvasPosY + deltaY;
  }
  draw();
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  if (event.deltaY > 0) {
    zoom -= 0.1;
  } else {
    zoom += 0.1;
  }
  draw();
});
