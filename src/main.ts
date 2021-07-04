import { Renderer } from "./renderer/renderer";
import vertShader from "./shaders/vertex.glsl";

export default class PathRenderer {
  public renderer: Renderer;
  public data = {
    startPos: [],
    endPos: [],
    prevPos: [],
    nextPos: [],
    type: [],
    cp: [],
  };
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
  }

  public setData(data: []) {
    this.renderer.setData(data);
  }

  public draw() {
    this.renderer.draw();
  }
}
