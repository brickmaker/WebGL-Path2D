import { createBuffer, createProgram } from "../renderer/utils";
import vertexShaderSource from "./shaders/vertex.glsl";
import fragmentShaderSource from "./shaders/fragment.glsl";

class ShaderProcessor {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  attributeLocations: {
    position: number;
    texCoord: number;
  };
  uniformLocations: {
    sampler: WebGLUniformLocation;
  };

  constructor(gl: WebGL2RenderingContext, fragmentShader: string) {
    this.gl = gl;

    const fragShader = fragmentShader ? fragmentShader : fragmentShaderSource;

    const positionBuffer = createBuffer(
      gl,
      [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    );

    const texCoordBuffer = createBuffer(
      gl,
      [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]
    );
    this.program = createProgram(gl, vertexShaderSource, fragShader);

    this.attributeLocations = {
      position: gl.getAttribLocation(this.program, "in_position"),
      texCoord: gl.getAttribLocation(this.program, "in_texCoord"),
    };
    this.uniformLocations = {
      sampler: gl.getUniformLocation(
        this.program,
        "u_sampler"
      ) as WebGLUniformLocation,
    };

    this.vao = gl.createVertexArray() as WebGLVertexArrayObject;
    gl.bindVertexArray(this.vao);
    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        this.attributeLocations.position,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.attributeLocations.position);
    }

    {
      // connect buffers and attributes
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(
        this.attributeLocations.texCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.attributeLocations.texCoord);
    }
  }
  process(texture: WebGLTexture) {
    const gl = this.gl;
    // use program
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // clear
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    {
      // bind textures
      const textureUnit = 0;
      // Bind the texture to texture unit 0
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(this.uniformLocations.sampler, textureUnit);
    }

    // draw
    const offset = 0;
    const vertexCount = 6;
    // gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
  }
}

export { ShaderProcessor };
