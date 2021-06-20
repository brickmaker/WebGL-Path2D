export function compileShader(gl, shaderStr, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderStr);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
  }

  return shader;
}

export function createProgram(gl, vertShaderStr, fragShaderStr) {
  const vertShader = compileShader(gl, vertShaderStr, gl.VERTEX_SHADER);
  const fragShader = compileShader(gl, fragShaderStr, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Could not link shaders: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

export function createBuffer(gl, data = []) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

export function setBufferData(gl, buffer, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

export function createIndexBuffer(gl, indices) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );
  return buffer;
}
