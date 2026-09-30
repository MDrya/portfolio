// History-API router. It only deals with URLs: intercepting link clicks, pushState,
// popstate, and queueing navigations so transitions never overlap. What happens on a
// route change (page swap, transition) is the `onNavigate` callback's job.
//
// Every history entry carries a unique `key`, so the app can remember per-entry state
// (e.g. scroll position) and restore it on back/forward.

let keyCount = 0;
const newKey = () => `${Date.now().toString(36)}-${keyCount++}`;

export class Router {
  /**
   * @param {object} opts
   * @param {(path: string) => {name: string, params: object}} opts.resolve
   * @param {(route, info: {initial, pop, key, fromKey}) => Promise} opts.onNavigate
   */
  constructor({ resolve, onNavigate }) {
    this.resolve = resolve;
    this.onNavigate = onNavigate;
    this.busy = false;
    this.pending = null;
    this.key = null;

    this.onClick = this.onClick.bind(this);
    this.onPop = this.onPop.bind(this);
  }

  start() {
    history.scrollRestoration = 'manual';
    this.key = history.state?.key ?? newKey();
    history.replaceState({ ...history.state, key: this.key }, '');

    document.addEventListener('click', this.onClick);
    window.addEventListener('popstate', this.onPop);

    return this.run(location.pathname, { initial: true, pop: false });
  }

  navigate(path, { replace = false } = {}) {
    if (path === location.pathname) return;
    const key = newKey();
    history[replace ? 'replaceState' : 'pushState']({ key }, '', path);
    this.run(path, { initial: false, pop: false, key });
  }

  onPop(e) {
    this.run(location.pathname, { initial: false, pop: true, key: e.state?.key ?? newKey() });
  }

  onClick(e) {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // open in new tab etc.
    if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;

    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return; // external, mailto:, tel:

    e.preventDefault();
    this.navigate(url.pathname);
  }

  // Navigations requested mid-transition are queued; only the latest one runs.
  async run(path, info) {
    if (this.busy) {
      this.pending = { path, info };
      return;
    }
    this.busy = true;

    const fromKey = this.key;
    this.key = info.key ?? this.key;
    await this.onNavigate(this.resolve(path), { ...info, key: this.key, fromKey });

    this.path = path;
    this.busy = false;

    const next = this.pending;
    this.pending = null;
    if (!next) return;
    if (next.path !== this.path) this.run(next.path, next.info);
    else if (next.info.key) this.key = next.info.key; // same page, just a different history entry
  }
}
