import vertexShaderSource from "../shaders/vertex.glsl";
import fragmentShaderSource from "../shaders/fragment.glsl";
import {
  createBuffer,
  createIndexBuffer,
  createProgram,
  setBufferData,
} from "./utils";

const LINE_CAPS = {
  none: 0,
  butt: 1,
  round: 2,
};

const LINE_JOINS = {
  miter: 0,
  round: 1,
  bevel: 2,
};

const PATH_TYPE = {
  line: 0,
  quadratic: 1,
  arc: 2,
};

export class Renderer {
  public canvas: HTMLCanvasElement;
  public gl: WebGL2RenderingContext;
  public program: WebGLProgram;
  public uniformLocations: any;
  public attributeLocations: any;

  public vao: WebGLVertexArrayObject;
  public ebo: WebGLBuffer;
  public shapePosBuffer: WebGLBuffer;

  public instanceLimit = 1e7; // TODO: configurable
  public instanceCnt = 0;
  public startPosBuffer: WebGLBuffer;
  public endPosBuffer: WebGLBuffer;
  public prevPosBuffer: WebGLBuffer;
  public nextPosBuffer: WebGLBuffer;
  public typeBuffer: WebGLBuffer;
  public cpBuffer: WebGLBuffer;
  public colorBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;
    this.program = createProgram(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource
    );
    this.uniformLocations = {
      resolution: this.gl.getUniformLocation(this.program, "u_resolution"),
      lineJoin: this.gl.getUniformLocation(this.program, "u_lineJoin"),
      lineCap: this.gl.getUniformLocation(this.program, "u_lineCap"),
      lineWidth: this.gl.getUniformLocation(this.program, "u_lineWidth"),
    };

    this.attributeLocations = {
      position: this.gl.getAttribLocation(this.program, "in_position"),
      startPos: this.gl.getAttribLocation(this.program, "in_startPos"),
      endPos: this.gl.getAttribLocation(this.program, "in_endPos"),
      prevPos: this.gl.getAttribLocation(this.program, "in_prevPos"),
      nextPos: this.gl.getAttribLocation(this.program, "in_nextPos"),
      cp: this.gl.getAttribLocation(this.program, "in_cp"),
      color: this.gl.getAttribLocation(this.program, "in_color"),
      type: this.gl.getAttribLocation(this.program, "in_type"),
      lineWidth: this.gl.getAttribLocation(this.program, "in_lineWidth"),
    };

    this.startPosBuffer = createBuffer(this.gl, []);
    this.endPosBuffer = createBuffer(this.gl, []);
    this.prevPosBuffer = createBuffer(this.gl, []);
    this.nextPosBuffer = createBuffer(this.gl, []);
    this.typeBuffer = createBuffer(this.gl, []);
    this.cpBuffer = createBuffer(this.gl, []);
    this.colorBuffer = createBuffer(this.gl, []);

    const shapeData = {
      positions: [-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5],
      indices: [0, 1, 2, 1, 3, 2],
    };

    this.shapePosBuffer = createBuffer(this.gl, shapeData.positions);
    this.ebo = createIndexBuffer(this.gl, shapeData.indices);
    this.vao = this._setVAO();
  }

  public setData(data) {
    this.instanceCnt = data.startPos.length;
    setBufferData(this.gl, this.startPosBuffer, data.startPos.flat());
    setBufferData(this.gl, this.endPosBuffer, data.endPos.flat());
    setBufferData(this.gl, this.prevPosBuffer, data.prevPos.flat());
    setBufferData(this.gl, this.nextPosBuffer, data.nextPos.flat());
    setBufferData(this.gl, this.typeBuffer, data.type.flat());
    setBufferData(this.gl, this.cpBuffer, data.cp.flat());
    setBufferData(this.gl, this.colorBuffer, data.color.flat());
  }

  public draw() {
    const lineCap = LINE_CAPS.butt;
    const lineJoin = LINE_JOINS.miter;
    const lineWidth = 20;

    const width = this.canvas.width;
    const height = this.canvas.height;
    // clear
    this.gl.clearColor(1, 1, 1, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // use program
    this.gl.useProgram(this.program);

    // bind VAO
    this.gl.bindVertexArray(this.vao);

    {
      // connect uniforms
      this.gl.uniform2f(this.uniformLocations.resolution, width, height);
      this.gl.uniform1f(this.uniformLocations.lineJoin, lineJoin);
      this.gl.uniform1f(this.uniformLocations.lineCap, lineCap);
      this.gl.uniform1f(this.uniformLocations.lineWidth, lineWidth);
    }

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    // draw
    const offset = 0;
    const vertexCount = 6;
    const indexType = this.gl.UNSIGNED_SHORT;
    const instanceCount = this.instanceCnt;
    this.gl.drawElementsInstanced(
      this.gl.TRIANGLES,
      vertexCount,
      indexType,
      offset,
      instanceCount
    );
  }

  private _setVAO() {
    const vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(vao);
    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shapePosBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.position,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.position);
    }

    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.startPosBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.startPos,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.startPos);
      this.gl.vertexAttribDivisor(this.attributeLocations.startPos, 1);
    }

    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.endPosBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.endPos,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.endPos);
      this.gl.vertexAttribDivisor(this.attributeLocations.endPos, 1);
    }
    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.prevPosBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.prevPos,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.prevPos);
      this.gl.vertexAttribDivisor(this.attributeLocations.prevPos, 1);
    }

    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nextPosBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.nextPos,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.nextPos);
      this.gl.vertexAttribDivisor(this.attributeLocations.nextPos, 1);
    }

    {
      // connect buffers and attributes
      const numComponents = 4;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cpBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.cp,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.cp);
      this.gl.vertexAttribDivisor(this.attributeLocations.cp, 1);
    }
    {
      // connect buffers and attributes
      const numComponents = 1;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.typeBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.type,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.type);
      this.gl.vertexAttribDivisor(this.attributeLocations.type, 1);
    }
    {
      // connect buffers and attributes
      const numComponents = 4;
      const type = this.gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
      this.gl.vertexAttribPointer(
        this.attributeLocations.color,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      this.gl.enableVertexAttribArray(this.attributeLocations.color);
      this.gl.vertexAttribDivisor(this.attributeLocations.color, 1);
    }

    {
      // EBO
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    }

    return vao;
  }
}
