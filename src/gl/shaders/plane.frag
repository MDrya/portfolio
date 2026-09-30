precision highp float;

uniform sampler2D uTexture;
uniform vec2 uImageSize; // natural image size, px
uniform vec2 uPlaneSize; // plane size on screen, px
uniform float uZoom;     // 1 = exact cover fit; >1 zooms in around the centre
uniform float uParallax;  // -1..1, horizontal shift as a fraction of the available room
uniform float uParallaxY; // -1..1, vertical shift (project hero while scrolling)
uniform float uAlpha;

varying vec2 vUv;

void main() {
  // "object-fit: cover": scale UVs so the image fills the plane without stretching,
  // cropping whichever axis overflows, centred.
  vec2 ratio = vec2(
    min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.0),
    min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.0)
  );

  vec2 uv = (vUv - 0.5) * ratio / uZoom + 0.5;

  // Inner parallax. `room` is how far the visible window can slide before reaching the
  // image edge, so |uParallax| <= 1 never shows an edge.
  vec2 room = (1.0 - ratio / uZoom) * 0.5;
  uv += vec2(uParallax, uParallaxY) * room;

  gl_FragColor = texture2D(uTexture, uv) * vec4(1.0, 1.0, 1.0, uAlpha);
}
