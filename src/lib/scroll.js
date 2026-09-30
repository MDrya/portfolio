// Virtual smooth scroll. The page content is moved with translate3d; there is no native
// scrollbar. Input (wheel, touch, keys) moves `target`, and every frame `current`
// eases toward it:  current += (target - current) * factor.
//
// The owner calls update(dt) from its frame loop, so the order of per-frame work is explicit.

import { motion } from '../config.js';
import { clamp, lerpFactor } from './math.js';

const LINE_HEIGHT = 16; // px per "line" for wheel events reported in lines (Firefox)

const isTyping = (el) => el.closest?.('input, textarea, select, button, [contenteditable]');

export class VirtualScroll {
  /**
   * @param {HTMLElement} content element that moves
   * @param {HTMLElement} wrapper clipping container (#app); it must never scroll natively
   */
  constructor(content, { wrapper = document.getElementById('app'), factor = motion.lerp } = {}) {
    this.content = content;
    this.wrapper = wrapper;
    this.factor = factor;

    this.target = 0;
    this.current = 0;
    this.velocity = 0;
    this.limit = 0;
    this.enabled = true;
    this.touch = null;

    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onKey = this.onKey.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onNativeScroll = this.onNativeScroll.bind(this);
    this.resize = this.resize.bind(this);

    window.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('resize', this.resize);
    wrapper.addEventListener('focusin', this.onFocus);
    wrapper.addEventListener('scroll', this.onNativeScroll);

    // Content height changes when images load or text re-wraps.
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(content);
    this.resize();
  }

  get progress() {
    return this.limit ? this.current / this.limit : 0;
  }

  resize() {
    this.limit = Math.max(0, this.content.offsetHeight - window.innerHeight);
    this.target = clamp(this.target, 0, this.limit);
  }

  scrollTo(y, { immediate = false } = {}) {
    this.target = clamp(y, 0, this.limit);
    if (immediate) {
      this.current = this.target;
      this.apply();
    }
  }

  scrollBy(dy) {
    this.scrollTo(this.target + dy);
  }

  update(dt) {
    const prev = this.current;
    this.current += (this.target - this.current) * lerpFactor(this.factor, dt);
    if (Math.abs(this.target - this.current) < 0.05) this.current = this.target;
    this.velocity = this.current - prev;
    if (this.velocity !== 0) this.apply();
  }

  apply() {
    this.content.style.transform = `translate3d(0, ${-this.current}px, 0)`;
  }

  // --- input -------------------------------------------------------------

  onWheel(e) {
    if (!this.enabled || e.ctrlKey) return; // ctrl+wheel = pinch zoom, leave it alone
    const scale = e.deltaMode === 1 ? LINE_HEIGHT : e.deltaMode === 2 ? window.innerHeight : 1;
    this.scrollBy(e.deltaY * scale);
  }

  onTouchStart(e) {
    const t = e.touches[0];
    this.touch = { y: t.clientY, time: performance.now(), v: 0 };
  }

  onTouchMove(e) {
    if (!this.enabled || !this.touch) return;
    const t = e.touches[0];
    const now = performance.now();
    const dy = this.touch.y - t.clientY;
    this.touch.v = dy / Math.max(now - this.touch.time, 1); // px/ms
    this.touch.y = t.clientY;
    this.touch.time = now;
    this.scrollBy(dy);
  }

  onTouchEnd() {
    if (this.touch && this.enabled) this.scrollBy(this.touch.v * 250); // flick momentum
    this.touch = null;
  }

  onKey(e) {
    if (!this.enabled || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    const page = window.innerHeight * 0.9;
    const moves = {
      ArrowDown: 100,
      ArrowUp: -100,
      PageDown: page,
      PageUp: -page,
      ' ': e.shiftKey ? -page : page,
    };
    if (e.key in moves) {
      e.preventDefault();
      this.scrollBy(moves[e.key]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      this.scrollTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      this.scrollTo(this.limit);
    }
  }

  // Keyboard focus on something off-screen: bring it into view with the virtual scroll.
  onFocus(e) {
    if (!this.content.contains(e.target)) return;
    const rect = e.target.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      this.scrollTo(this.current + rect.top - window.innerHeight / 3);
    }
  }

  // The browser may natively scroll the overflow:hidden wrapper when focusing; undo it.
  onNativeScroll() {
    this.wrapper.scrollTop = 0;
    this.wrapper.scrollLeft = 0;
  }

  destroy() {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('resize', this.resize);
    this.wrapper.removeEventListener('focusin', this.onFocus);
    this.wrapper.removeEventListener('scroll', this.onNativeScroll);
    this.observer.disconnect();
  }
}
