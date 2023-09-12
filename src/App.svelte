<script lang="ts">
  import { onMount } from "svelte";
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "/images/character.png";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  let width = 800;
  let height = 600;
  let zoom = 1.0;

  // current image pos in viewport
  let viewportX = 0;
  let viewportY = 0;
  // current cursor pos
  let cursorX = 0;
  let cursorY = 0;

  // Panning function
  // cursor pos when mouse start panning
  let startX = 0;
  let startY = 0;
  let isHoldSpace = false;
  let isPanning = false;
  // image pos in viewport when start panning
  let startViewportX = 0;
  let startViewportY = 0;

  $: debugText = { cursorX, cursorY, startX, startY, viewportX, viewportY };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      img,
      viewportX,
      viewportY,
      img.width * zoom,
      img.height * zoom
    );
  };

  onMount(() => {
    const context = canvas.getContext("2d");
    if (context) ctx = context;
    ctx.imageSmoothingEnabled = false;
    img.addEventListener("load", () => {
      // set deafault pos to centered at start
      viewportX = width / 2 - img.width / 2;
      viewportY = height / 2 - img.height / 2;
      draw();
    });

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        isHoldSpace = true;
      }
    });

    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") {
        isHoldSpace = false;
      }
    });

    canvas.addEventListener("mousedown", (event) => {
      if (isHoldSpace && !isPanning) {
        isPanning = true;
        startX = event.x;
        startY = event.y;
        startViewportX = viewportX;
        startViewportY = viewportY;
      }
    });

    canvas.addEventListener("mouseup", (event) => {
      isPanning = false;
    });

    canvas.addEventListener("mousemove", (event) => {
      // console.log(event);
      cursorX = event.x;
      cursorY = event.y;

      if (isPanning) {
        let deltaX = cursorX - startX;
        let deltaY = cursorY - startY;
        viewportX = startViewportX + deltaX;
        viewportY = startViewportY + deltaY;
        draw();
      }
    });

    canvas.addEventListener("wheel", (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        if (event.deltaY > 0) {
          zoom -= 0.1;
        } else {
          zoom += 0.1;
        }
        draw();
      }
    });
  });
</script>

<canvas class="canvas" bind:this={canvas} {width} {height} />

<div class="text">
  <p>
    {img.width}x{img.height}
  </p>
  <code>{JSON.stringify(debugText)}</code>
</div>

<style>
  .canvas {
    border: 1px solid #222;
  }
  .text {
    color: #555;
  }
</style>
