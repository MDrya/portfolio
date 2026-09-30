// One WebGL context for the whole site, drawn into the fixed canvas#gl behind the DOM.
//
// The orthographic camera is sized to the viewport in CSS pixels, so 1 GL unit = 1 CSS px
// with the origin at the screen centre. Planes convert DOM rects (top-left origin) with
// Plane.setRect, which makes DOM ↔ GL alignment exact.

import { Renderer as OGLRenderer, Camera, Transform } from 'ogl';
import { raf } from '../lib/raf.js';
import { gl as glConfig } from '../config.js';

const dpr = () => Math.min(window.devicePixelRatio || 1, glConfig.maxDpr);

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

    this.resizeListeners.forEach((fn) => fn(this.viewport));
  }

  /** Runs fn(viewport) after the renderer has resized. Returns an unsubscribe function. */
  onResize(fn) {
    this.resizeListeners.add(fn);
    return () => this.resizeListeners.delete(fn);
  }

  render() {
    this.renderer.render({ scene: this.scene, camera: this.camera });
  }
}
