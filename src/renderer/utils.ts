export function compileShader(
  gl: WebGL2RenderingContext,
  shaderStr: string,
  shaderType: number
) {
  const shader = gl.createShader(shaderType) as WebGLShader;
  gl.shaderSource(shader, shaderStr);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertShaderStr: string,
  fragShaderStr: string
) {
  const vertShader = compileShader(gl, vertShaderStr, gl.VERTEX_SHADER);
  const fragShader = compileShader(gl, fragShaderStr, gl.FRAGMENT_SHADER);

  const program = gl.createProgram() as WebGLProgram;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Could not link shaders: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

export function createBuffer(gl: WebGL2RenderingContext, data: number[] = []) {
  const buffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

export function setBufferData(
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer,
  data: []
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

export function createIndexBuffer(
  gl: WebGL2RenderingContext,
  indices: number[]
) {
  const buffer = gl.createBuffer() as WebGLBuffer;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  return buffer;
}

export function createRenderContainer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  // create to render to
  const targetTextureWidth = width;
  const targetTextureHeight = height;
  const targetTexture = gl.createTexture() as WebGLTexture;
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);

  {
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      targetTextureWidth,
      targetTextureHeight,
      border,
      format,
      type,
      data
    );

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    targetTexture,
    level
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    texture: targetTexture,
    frameBuffer: fb,
  };
}
