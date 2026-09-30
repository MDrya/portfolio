#define PI 3.1415926535897932384626433832795

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uVelocity; // bend amount, in fractions of the plane height

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;
  pos.y += sin(uv.x * PI) * uVelocity; // bows the plane while the slider moves

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
