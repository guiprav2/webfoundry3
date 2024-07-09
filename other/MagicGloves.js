import Boo from './boo.js';
import d from './dominant.js';

class MagicGloves {
  constructor(iframe) {
    Object.assign(this, { iframe });
    iframe.contentDocument.addEventListener('mousedown', this.onMouseDown, true);
    iframe.contentDocument.addEventListener('mousemove', this.onMouseMove, true);
    iframe.contentDocument.addEventListener('click', this.onClick, true);
    iframe.contentDocument.addEventListener('dblclick', this.onDblClick, true);
    iframe.contentDocument.addEventListener('contextmenu', this.onContextMenu, true);
    iframe.contentWindow.addEventListener('keydown', this.onKeyDown, true);
    iframe.contentWindow.addEventListener('keyup', this.onKeyUp, true);
    iframe.contentWindow.addEventListener('change', this.onChange, true);

    this.sov = new Boo(
      d.el(MagicOverlay, { s: () => state.app.s instanceof Set ? null : state.app.s }),
      () => state.app.s instanceof Set ? [...state.app.s][0] : state.app.s,
      { origin: iframe, transitionClass: 'transition-all' },
    );

    d.effect(() => state.app.s instanceof Set ? [...state.app.s] : [state.app.s], s => {
      this.sovs ??= [];
      if (this.sovs.length >= s.length - 1) { for (let i = s.length - 1; i < this.sovs.length; i++) { this.sovs[i].disable(); this.sovs[i] = null } }
      this.sovs.length = s.length - 1;
      for (let i = 0; i < this.sovs.length; i++) {
        if (this.sovs[i]) { continue }
        this.sovs[i] = new Boo(d.el(MagicOverlay, { s: () => s[i + 1] }), () => s[i + 1], { origin: iframe, transitionClass: 'transition-all' });
      }
    });
  }

  get isComponent() { return this.iframe.contentWindow.location.pathname.split('/')[3] === 'components' }

  onMouseDown = ev => {
    (ev.shiftKey || ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') && ev.preventDefault();
  };

  onMouseMove = ev => {
    let tmap = ev.target.closest('.tilemap');
    if (!tmap) { return }
    let rect = tmap.getBoundingClientRect();
    this.tx = Math.floor((ev.clientX - rect.left) / 32);
    this.ty = Math.floor((ev.clientY - rect.top) / 32);
    if (!ev.shiftKey || !this.floatingTile) { return }
    for (let [k, v] of Object.entries({ '--x': this.tx, '--y': this.ty })) { this.floatingTile.style.setProperty(k, v) }
  };

  onClick = async ev => {
    if (ev.shiftKey && state.app.currentPanel === 'tiles') { return }
    if (ev.ctrlKey) { return }
    if (!state.app.tourDisable.has('gloves.preventDefault')) { ev.preventDefault(); ev.stopPropagation() }
    let target = ev.target;
    if (!this.iframe.contentDocument.body.contains(target)) { target = this.iframe.contentDocument.body }
    let componentRoot = this.isComponent && this.iframe.contentDocument.body.firstElementChild;
    if (componentRoot && !componentRoot.contains(target)) { post('app.changeSelected', componentRoot); return }
    let closestComponentRoot = target.closest('[wf-component]');
    let closestSvgRoot = target.closest('svg');
    await post(!ev.shiftKey ? 'app.changeSelected' : 'app.addSelection', closestComponentRoot || closestSvgRoot || target);

    if (!ev.shiftKey && ev.target.closest('.wf-view-html')) {
      await post('app.changeSelected', ev.target.closest('.wf-view-html'));
      await post('app.editorAction', 'ArrowUp');
      await post('app.editorAction', 'm');
      return;
    }
  };

  onDblClick = ev => (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') && ev.target.focus();

  onContextMenu = async ev => {
    if (ev.ctrlKey) { return }
    ev.preventDefault();
    ev.stopPropagation();
    if (!state.app.s) { this.onClick(ev) }
    parent.postMessage({ type: 'action', action: 'app.contextMenu', args: [{ x: ev.clientX, y: ev.clientY }] }, '*');
  };

  onKeyDown = ev => {
    if (ev.key === 'Shift' && state.app.currentPanel === 'tiles') {
      let tmap = state.app.s.closest('.tilemap');
      if (!tmap) { return }
      let tile = d.el('div', { class: 'floating tile' });
      tile.style.backgroundImage = tmap.style.backgroundImage;
      tmap.append(tile);
      let pi = [...tmap.childNodes].indexOf(tile);
      tile.outerHTML = tile.outerHTML;
      tile = tmap.childNodes[pi];
      this.floatingTile = tile;
      tile.addEventListener('click', () => tmap.append(tile.cloneNode()));
      return;
    }

    if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') {
      ev.key === 'Escape' && ev.target.blur();
      return;
    }

    let key = ev.key;
    if (ev.ctrlKey) { key = 'Ctrl-' + key }
    if (ev.altKey) { key = 'Alt-' + key }
    if (!state.app.hasActionHandler(key)) { return }
    ev.preventDefault();
    ev.stopPropagation();
    post('app.editorAction', key);
  };

  onKeyUp = ev => {
    if (ev.key !== 'Shift' || !this.floatingTile) { return }
    this.floatingTile.remove();
    this.floatingTile = null;
  };

  onChange = ev => {
    if (ev.target.tagName === 'TEXTAREA') { ev.target.textContent = ev.target.value; return }
    ev.target.setAttribute('value', ev.target.value);
  };

  destroy() { this.sov?.disable?.(); this.sovs?.forEach?.(x => x.disable()) }
}

class MagicOverlay {
  constructor(props) { this.props = props }
  get s() { return d.resolve(this.props.s) }

  render = () => d.html`
    <div class="rounded border border-blue-400 opacity-1 z-10 pointer-events-none">
      <span class="absolute right-0 bottom-0 -mr-1 -mb-2 rounded-lg px-2 py-0.5 empty:hidden whitespace-nowrap font-xs text-white bg-blue-400/90">
        <i class="nf nf-md-vector_square"></i>
        ${d.text(() => {
          if (!this.s || this.s.nodeType !== Node.ELEMENT_NODE) { return }
          let txt = this.s.classList[0];
          if (/^[A-Z]/.test(txt)) { return txt }
          return this.s.tagName.toLowerCase();
        })}
      </span>
    </div>
  `;
}

export default MagicGloves;
