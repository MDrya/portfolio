// A textured plane positioned in DOM pixel coordinates, with cover-fit UVs (see plane.frag).

import { Mesh, Plane as PlaneGeometry, Program, Texture } from 'ogl';
import vertex from './shaders/plane.vert?raw';
import fragment from './shaders/plane.frag?raw';

export class Plane {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {{ image?: HTMLImageElement, segments?: number }} opts
   *   segments: horizontal subdivisions, needed for the velocity bend
   */
  constructor(renderer, { image, segments = 32 } = {}) {
    const { gl } = renderer;
    this.renderer = renderer;
    this.gl = gl;

    this.texture = new Texture(gl, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });

    this.uniforms = {
      uTexture: { value: this.texture },
      uImageSize: { value: [1, 1] },
      uPlaneSize: { value: [1, 1] },
      uZoom: { value: 1 },
      uParallax: { value: 0 },
      uVelocity: { value: 0 },
      uAlpha: { value: 0 }, // hidden until an image is set
    };

    // flat planes in one 2D layer: draw order decides overlap, not depth
    this.program = new Program(gl, { vertex, fragment, uniforms: this.uniforms, transparent: true, depthTest: false });
    this.geometry = new PlaneGeometry(gl, { widthSegments: segments, heightSegments: 1 });
    this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });
    this.mesh.setParent(renderer.scene);

    this.rect = { x: 0, y: 0, width: 1, height: 1 };
    if (image) this.setImage(image);
  }

  get alpha() {
    return this.uniforms.uAlpha.value;
  }

  set alpha(v) {
    this.uniforms.uAlpha.value = v;
  }

  get visible() {
    return this.mesh.visible;
  }

  set visible(v) {
    this.mesh.visible = v;
  }

  setImage(image, { alpha = 1 } = {}) {
    this.texture.image = image;
    this.uniforms.uImageSize.value = [image.naturalWidth, image.naturalHeight];
    this.alpha = alpha;
  }

  /** Position/size in CSS pixels, top-left origin — same numbers as getBoundingClientRect(). */
  setRect(x, y, width, height) {
    const { viewport } = this.renderer;
    this.rect = { x, y, width, height };

    this.mesh.scale.set(width, height, 1);
    this.mesh.position.set(x + width / 2 - viewport.width / 2, viewport.height / 2 - (y + height / 2), 0);
    this.uniforms.uPlaneSize.value = [width, height];
  }

  destroy() {
    this.mesh.setParent(null);
    this.geometry.remove();
    this.program.remove();
    this.gl.deleteTexture(this.texture.texture);
  }
}
