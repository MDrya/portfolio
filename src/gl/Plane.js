// A textured plane positioned in DOM pixel coordinates, with cover-fit UVs (see plane.frag).
// Textures come from the renderer's shared cache, so planes showing the same image share
// one GPU texture and destroying a plane never deletes it.

import { Mesh, Plane as PlaneGeometry, Program } from 'ogl';
import vertex from './shaders/plane.vert?raw';
import fragment from './shaders/plane.frag?raw';

let planeCount = 0;

export class Plane {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {{ src?: string, segments?: number }} opts
   *   src: image URL; segments: horizontal subdivisions, needed for the velocity bend
   */
  constructor(renderer, { src, segments = 32 } = {}) {
    const { gl } = renderer;
    this.renderer = renderer;
    this.gl = gl;
    this.id = ++planeCount;
    this.version = 0; // bumped whenever the image it shows changes (see Renderer.takeSnapshot)

    this.uniforms = {
      uTexture: { value: null },
      uImageSize: { value: [1, 1] },
      uPlaneSize: { value: [1, 1] },
      uZoom: { value: 1 },
      uParallax: { value: 0 },
      uParallaxY: { value: 0 },
      uVelocity: { value: 0 },
      uAlpha: { value: 0 }, // hidden until the image is ready
    };

    // flat planes in one 2D layer: draw order decides overlap, not depth
    this.program = new Program(gl, { vertex, fragment, uniforms: this.uniforms, transparent: true, depthTest: false });
    this.geometry = new PlaneGeometry(gl, { widthSegments: segments, heightSegments: 1 });
    this.mesh = new Mesh(gl, { geometry: this.geometry, program: this.program });
    this.mesh.setParent(renderer.scene);

    this.rect = { x: 0, y: 0, width: 1, height: 1 };
    this.setSource(src);
    renderer.planes.add(this);
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

  setSource(src, { alpha = 1 } = {}) {
    if (!src) return;
    const entry = this.renderer.texture(src);
    this.uniforms.uTexture.value = entry.texture;

    const apply = () => {
      if (this.uniforms.uTexture.value !== entry.texture) return; // source changed meanwhile
      this.uniforms.uImageSize.value = entry.size;
      this.alpha = alpha;
      this.version++;
    };
    if (entry.ready) apply();
    else entry.waiting.push(apply);
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
    this.renderer.planes.delete(this);
    this.mesh.setParent(null);
    this.geometry.remove();
    this.program.remove();
  }
}
