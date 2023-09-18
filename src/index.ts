import type { MousePos, Pos } from "./types";

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
let zoom = 3.0;

// current image / canvas position in viewport
let imagePos: Pos = { x: 0, y: 0 };

let mousePos: MousePos = {
  x: 0,
  y: 0,
  canvas: { x: 0, y: 0 },
  window: { x: 0, y: 0 },
};

const pointToCanvas = (pos: Pos) => {
  let canvasPos: Pos = { x: 0, y: 0 };
  canvasPos.x = pos.x * zoom + imagePos.x;
  canvasPos.y = pos.y * zoom + imagePos.y;
  return canvasPos;
};

// Panning function
let panPos = {
  mouseStart: { x: 0, y: 0 },
  imageStart: { x: 0, y: 0 },
};

let isHoldSpace = false;
let isPanning = false;

const bgImg = new Image();
bgImg.src = "/images/bg.png";

const img = new Image();
img.src = "/images/character.png";

const setupBrush = (size: number) => {
  const brush = new ImageData(size * zoom, size * zoom);
  for (let i = 0; i < brush.data.length; i += 4) {
    brush.data[i] = 255; // R
    brush.data[i + 1] = 255; // G
    brush.data[i + 2] = 255; // B
    brush.data[i + 3] = 255; // A
  }

  return brush;
};

const clear = () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
};

const update = () => {
  if (!ctx) return;
  // transparent bg
  const pattern = ctx.createPattern(bgImg, "repeat");
  if (pattern) ctx.fillStyle = pattern;
  ctx.fillRect(imagePos.x, imagePos.y, img.width * zoom, img.height * zoom);

  // image being edit
  ctx.drawImage(
    img,
    imagePos.x,
    imagePos.y,
    img.width * zoom,
    img.height * zoom,
  );

  let brush = setupBrush(1);
  const brusPos = pointToCanvas({ x: mousePos.x, y: mousePos.y });
  ctx.putImageData(brush, brusPos.x, brusPos.y);

  // debug
  let debugInfo = {
    width: img.width,
    height: img.height,
    mousePos,
    zoom,
  };
  if (debugText) debugText.innerHTML = JSON.stringify(debugInfo);
};

// game ticks
setInterval(() => {
  clear();
  update();
}, 20);

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
    panPos.mouseStart.x = mousePos.canvas.x;
    panPos.mouseStart.y = mousePos.canvas.y;
    panPos.imageStart.x = imagePos.x;
    panPos.imageStart.y = imagePos.y;
  }
});

canvas.addEventListener("mouseup", (event) => {
  isPanning = false;
});

canvas.addEventListener("mousemove", (event) => {
  // console.log(event);
  mousePos.window.x = event.clientX;
  mousePos.window.y = event.clientY;

  let rect = canvas?.getBoundingClientRect();
  if (rect) {
    mousePos.canvas.x = mousePos.window.x - rect?.left;
    mousePos.canvas.y = mousePos.window.y - rect?.top;
  }

  mousePos.x = Math.round((mousePos.canvas.x - imagePos.x) / zoom);
  mousePos.y = Math.round((mousePos.canvas.y - imagePos.y) / zoom);

  if (isPanning) {
    let deltaX = mousePos.canvas.x - panPos.mouseStart.x;
    let deltaY = mousePos.canvas.y - panPos.mouseStart.y;
    imagePos.x = panPos.imageStart.x + deltaX;
    imagePos.y = panPos.imageStart.y + deltaY;
  }
});

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  if (event.deltaY > 0) {
    zoom = zoom - 0.2;
  } else {
    zoom = zoom + 0.2;
  }
});
