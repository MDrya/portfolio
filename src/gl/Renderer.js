// One WebGL context for the whole site, drawn into the fixed canvas#gl behind the DOM.
//
// The orthographic camera is sized to the viewport in CSS pixels, so 1 GL unit = 1 CSS px
// with the origin at the screen centre. Planes convert DOM rects (top-left origin) with
// Plane.setRect, which makes DOM ↔ GL alignment exact.

import { Renderer as OGLRenderer, Camera, Transform, Texture } from 'ogl';
import { raf } from '../lib/raf.js';
import { images, loadImage } from '../lib/loader.js';
import { gl as glConfig } from '../config.js';

const dpr = () => Math.min(window.devicePixelRatio || 1, glConfig.maxDpr);

const PLANE_STATE = 11; // numbers recorded per plane in takeSnapshot()

export class Renderer {
  constructor(canvas) {
    this.renderer = new OGLRenderer({
      canvas,
      dpr: dpr(),
      alpha: false, // opaque: planes fade against --bg, not the page behind
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0x14 / 255, 0x14 / 255, 0x14 / 255, 1); // --bg

    this.camera = new Camera(this.gl, { near: 1, far: 100, left: -1, right: 1, top: 1, bottom: -1 });
    this.camera.position.z = 10;

    this.scene = new Transform();
    this.textures = new Map(); // url → shared texture entry
    this.planes = new Set(); // every live Plane, for change detection

    // Render-on-change: each frame we snapshot what the visible planes look like and only
    // draw when that differs from the last drawn frame. A still page costs no GPU work.
    this.snapshot = new Float64Array(64);
    this.drawn = new Float64Array(64);
    this.drawnLength = -1;
    this.needsRender = true;
    this.viewport = { width: 0, height: 0 };
    this.resizeListeners = new Set();

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();

    raf.render(() => this.render());
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.dpr = dpr(); // changes when the window moves to another screen
    this.renderer.setSize(width, height);
    this.camera.orthographic({ left: -width / 2, right: width / 2, bottom: -height / 2, top: height / 2 });
    this.viewport = { width, height };
    this.needsRender = true; // resizing clears the canvas

    this.resizeListeners.forEach((fn) => fn(this.viewport));
  }

  /**
   * One GPU texture per image URL, shared by every plane that shows it. This is what makes
   * the Home → Project hand-off seamless: the project hero reuses the cover texture the
   * slider already uploaded. Entries live for the session.
   * @returns {{ texture: Texture, size: [number, number], ready: boolean }}
   */
  texture(url) {
    let entry = this.textures.get(url);
    if (entry) return entry;

    const { gl } = this;
    entry = {
      texture: new Texture(gl, { wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE }),
      size: [1, 1],
      ready: false,
      waiting: [],
    };
    this.textures.set(url, entry);

    const apply = (img) => {
      if (!img) return;
      entry.texture.image = img;
      entry.size = [img.naturalWidth, img.naturalHeight];
      entry.ready = true;
      entry.waiting.splice(0).forEach((fn) => fn(entry));
    };

    // preloaded images apply synchronously, so a plane is drawable in the frame it's created
    if (images.has(url)) apply(images.get(url));
    else loadImage(url).then(apply);

    return entry;
  }

  /** Runs fn(viewport) after the renderer has resized. Returns an unsubscribe function. */
  onResize(fn) {
    this.resizeListeners.add(fn);
    return () => this.resizeListeners.delete(fn);
  }

  /** Writes the visible planes' state into `snapshot`; returns how many numbers were written. */
  takeSnapshot() {
    const needed = this.planes.size * PLANE_STATE;
    if (this.snapshot.length < needed) {
      this.snapshot = new Float64Array(needed * 2);
      this.drawn = new Float64Array(needed * 2);
      this.drawnLength = -1;
    }

    const s = this.snapshot;
    let i = 0;
    for (const plane of this.planes) {
      if (!plane.visible || plane.alpha === 0) continue;
      const { rect, uniforms: u } = plane;
      s[i++] = plane.id;
      s[i++] = plane.version; // bumps when its image changes or finishes loading
      s[i++] = rect.x;
      s[i++] = rect.y;
      s[i++] = rect.width;
      s[i++] = rect.height;
      s[i++] = u.uZoom.value;
      s[i++] = u.uParallax.value;
      s[i++] = u.uParallaxY.value;
      s[i++] = u.uVelocity.value;
      s[i++] = u.uAlpha.value;
    }
    return i;
  }

  render() {
    const length = this.takeSnapshot();

    let changed = this.needsRender || length !== this.drawnLength;
    for (let i = 0; !changed && i < length; i++) changed = this.snapshot[i] !== this.drawn[i];
    if (!changed) return;

    this.renderer.render({ scene: this.scene, camera: this.camera });

    [this.snapshot, this.drawn] = [this.drawn, this.snapshot];
    this.drawnLength = length;
    this.needsRender = false;
  }
}
