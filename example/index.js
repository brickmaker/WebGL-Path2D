const canvas = document.querySelector("#main");
canvas.width = 800;
canvas.height = 800;
const renderer = new PathRenderer(canvas);
const data = {
  // 两个是可以复用的
  startPos: [
    [200, 500],
    [200, 300],
    [600, 300],
    [100, 100],
    [100, 100],
  ],
  endPos: [
    [200, 300],
    [600, 300],
    [600, 500],
    [300, 100],
    [300, 100],
  ],
  prevPos: [
    [200, 500],
    [200, 500],
    [400, 200],
    [100, 100],
    [100, 100],
  ],
  nextPos: [
    [400, 200],
    [600, 500],
    [600, 500],
    [300, 100],
    [300, 100],
  ],
  type: [0, 1, 0, 0, 2],
  cp: [
    [0, 0, 0, 0],
    [400, 200, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [120, 100, Math.PI / 3, 0b10], // arc的参数，rx，ry，phi，两个flag（用两个bit表示）
  ],
  color: [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 1],
    [1, 0, 1, 1],
    [0, 1, 1, 1],
  ],
};

renderer.setData(data);
renderer.draw();
