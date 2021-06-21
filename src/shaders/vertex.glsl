#version 300 es

in vec2 in_position;
in vec2 in_startPos;
in vec2 in_endPos;
in vec2 in_prevPos;
in vec2 in_nextPos;
in vec4 in_cp;
in float in_type;
in vec4 in_color;

out vec2 v_startPos;
out vec2 v_endPos;
out vec2 v_startMiterVec;
out vec2 v_endMiterVec;
out float v_lineWidth;
out vec4 v_cp;
out float v_type;
out vec4 v_color;

uniform vec2 u_resolution;
uniform float u_lineWidth;

// https://stackoverflow.com/a/9246451
float distToLine(vec2 pt1, vec2 pt2, vec2 testPt) {
  vec2 lineDir = pt2 - pt1;
  vec2 perpDir = vec2(lineDir.y, -lineDir.x);
  vec2 dirToPt1 = pt1 - testPt;
  return abs(dot(normalize(perpDir), dirToPt1));
}

mat3 getTransformMatrix(vec2 startPos, vec2 endPos, float lineWidth) {
  vec2 centerPos = (startPos + endPos) / 2.;
  vec2 delta = endPos - startPos;
  float len = length(delta);
  float phi = atan(delta.y / delta.x);

  mat3 scale = mat3(len, 0, 0, 0, lineWidth, 0, 0, 0, 1);

  mat3 rotate = mat3(cos(phi), sin(phi), 0, -sin(phi), cos(phi), 0, 0, 0, 1);

  mat3 translate = mat3(1, 0, 0, 0, 1, 0, centerPos.x, centerPos.y, 1);

  return translate * rotate * scale;
}

vec2 getOffsetVec(vec2 pos, vec2 prev, vec2 next) {
  if (pos == prev || pos == next) {
    return vec2(0., 0.);
  }
  vec2 line1 = pos - prev;
  vec2 normal1 = normalize(vec2(-line1.y, line1.x));
  vec2 line2 = next - pos;
  vec2 normal2 = normalize(vec2(-line2.y, line2.x));
  vec2 normal = normalize(normal1 + normal2);
  vec2 vec = normal * 1. / abs(dot(normal, normal1));
  return -vec; // 逆时针向外的向量
}

void main() {
  vec2 prev = in_prevPos;
  vec2 next = in_endPos;
  if (in_type == 1.) {
    next = in_cp.xy;
  }
  // TODO: 二次曲线的端点向量计算，需要比较大调整，要把坐标变换的逻辑放到vertex
  // shader中
  vec2 v1 = getOffsetVec(in_startPos, prev, next) * u_lineWidth / 2.;

  prev = in_startPos;
  next = in_nextPos;
  if (in_type == 1.) {
    prev = in_cp.xy;
  }
  vec2 v2 = getOffsetVec(in_endPos, prev, next) * u_lineWidth / 2.;
  vec2 dir = normalize(in_endPos - in_startPos);
  vec2 startOffset =
      (v1 == vec2(0., 0.) ? -u_lineWidth / 2. : dot(v1, dir)) * dir;
  vec2 endOffset = (v2 == vec2(0., 0.) ? u_lineWidth / 2. : dot(v2, dir)) * dir;
  float width = u_lineWidth;

  // TODO:
  // 曲线的width其实可以减半，有效率提升，但是逻辑会更加复杂，需要判断方向和调整transform
  if (in_type == 1.) {
    // curve, larger width
    // 考虑控制点，设定空间（会影响效率）
    startOffset =
        (min(0., dot(vec2(in_cp.xy - in_startPos), dir)) - width / 2.) * dir;
    endOffset =
        (max(0., dot(vec2(in_cp.xy - in_endPos), dir)) + width / 2.) * dir;
    width = u_lineWidth + 2. * distToLine(in_startPos, in_endPos, in_cp.xy);
  } else if (in_type == 2.) {
    // arc, larger width
    width = max(in_cp.x, in_cp.y) * 4.;
    startOffset = -width / 2. * dir;
    endOffset = width / 2. * dir;
  }
  mat3 transformMatrix = getTransformMatrix(in_startPos + startOffset,
                                            in_endPos + endOffset, width);
  vec2 pos = (transformMatrix * vec3(in_position, 1.)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = pos.xy / u_resolution;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);

  v_startPos = in_startPos;
  v_endPos = in_endPos;
  v_startMiterVec = v1;
  v_endMiterVec = v2;
  v_lineWidth = u_lineWidth;
  v_cp = in_cp;
  v_type = in_type;
  v_color = in_color;
}