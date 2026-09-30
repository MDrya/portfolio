precision highp float;

uniform sampler2D uTexture;
uniform vec2 uImageSize; // natural image size, px
uniform vec2 uPlaneSize; // plane size on screen, px
uniform float uParallax; // horizontal UV shift inside the frame
uniform float uAlpha;

varying vec2 vUv;

void main() {
  // "object-fit: cover": scale UVs so the image fills the plane without stretching,
  // cropping whichever axis overflows, centred.
  vec2 ratio = vec2(
    min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
    min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  uv.x += uParallax;

  gl_FragColor = texture2D(uTexture, uv) * vec4(1.0, 1.0, 1.0, uAlpha);
}
