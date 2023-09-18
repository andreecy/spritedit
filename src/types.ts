export type Pos = {
  x: number;
  y: number;
};

export type MousePos = Pos & {
  window: Pos;
  canvas: Pos;
};
