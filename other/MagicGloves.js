import Boo from './boo.js';
import d from './dominant.js';

class MagicGloves {
  constructor(iframe) {
    Object.assign(this, { iframe });
    iframe.contentDocument.addEventListener('mousedown', this.onMouseDown, true);
    iframe.contentDocument.addEventListener('click', this.onClick, true);
    iframe.contentDocument.addEventListener('dblclick', this.onDblClick, true);
    iframe.contentDocument.addEventListener('contextmenu', this.onContextMenu, true);
    iframe.contentWindow.addEventListener('keydown', this.onKeyDown, true);
    addEventListener('keydown', this.onKeyDown, true);
    iframe.contentWindow.addEventListener('change', this.onChange, true);

    this.sov = new Boo(
      d.el(MagicOverlay, { s: () => state.editor.s instanceof Set ? null : state.editor.s }),
      () => state.editor.s instanceof Set ? [...state.editor.s][0] : state.editor.s,
      { origin: iframe, transitionClass: 'transition-all' },
    );

    d.effect(() => state.editor.s instanceof Set ? [...state.editor.s] : [state.editor.s], s => {
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

  onClick = async (ev, dbl = false) => {
    if (ev.ctrlKey) { return }
    if (!state.app.tourDisable.has('gloves.preventDefault')) { ev.preventDefault(); ev.stopPropagation() }
    let target = ev.target;
    if (!this.iframe.contentDocument.body.contains(target)) { target = this.iframe.contentDocument.body }
    let componentRoot = this.isComponent && this.iframe.contentDocument.body.firstElementChild;
    if (componentRoot && !componentRoot.contains(target)) { post('editor.changeSelected', componentRoot); return }
    let closestComponentRoot = target.closest('[wf-component]');
    let closestSvgRoot = target.closest('svg');
    await post(!ev.shiftKey ? 'editor.changeSelected' : 'editor.addSelection', closestComponentRoot || closestSvgRoot || target);

    if (!ev.shiftKey && ev.target.closest('.wf-view-html')) {
      await post('editor.changeSelected', ev.target.closest('.wf-view-html'));
      await post('editor.kbdAction', 'ArrowUp');
      await post('editor.kbdAction', 'm');
      return;
    }
  };

  onDblClick = ev => (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') && ev.target.focus();

  onContextMenu = async ev => {
    if (ev.ctrlKey) { return }
    ev.preventDefault();
    ev.stopPropagation();
    if (!state.editor.s) { this.onClick(ev) }
    parent.postMessage({ type: 'action', action: 'editor.contextMenu', args: [{ x: ev.clientX, y: ev.clientY }] }, '*');
  };

  onKeyDown = ev => {
    if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA') {
      ev.key === 'Escape' && ev.target.blur();
      return;
    }

    let key = ev.key;
    if (ev.ctrlKey) { key = 'Ctrl-' + key }
    if (ev.altKey) { key = 'Alt-' + key }
    if (!state.editor.hasActionHandler(key)) { return }
    ev.preventDefault();
    ev.stopPropagation();
    post('editor.kbdAction', key);
  };

  onChange = ev => {
    if (ev.target.tagName === 'TEXTAREA') { ev.target.textContent = ev.target.value; return }
    ev.target.setAttribute('value', ev.target.value);
  };

  destroy() {
    removeEventListener('keydown', this.onKeyDown, true);
    this.sov?.disable?.();
    this.sovs?.forEach?.(x => x.disable());
  }
}

class MagicOverlay {
  constructor(props) { this.props = props }
  get s() { return d.resolve(this.props.s) }

  get isSmall() { return !this.s || this.s.offsetWidth < 16 || this.s.offsetHeight < 16 }
  get isHorizontal() { return !this.s || this.s.tagName === 'SPAN' || this.s.tagName === 'INPUT' || this.s.matches('.inline, .inline-block') || this.s.parentElement.matches('.flex:not(.flex-col), .grid') }

  onClickAdd(ev, where) {
    if (ev.shiftKey || this.s.tagName === 'BODY') {
      switch (where) {
        case 'before': post('editor.create', 'afterbegin'); break;
        case 'after': post('editor.create', 'beforeend'); break;
      }
    } else {
      switch (where) {
        case 'before': post('editor.create', 'beforebegin'); break;
        case 'after': post('editor.create', 'afterend'); break;
      }
    }
  }

  render = () => d.html`
    <div class="rounded border border-blue-400 opacity-1 z-10 pointer-events-none">
      ${d.if(() => !this.isSmall, d.html`
        <button class="absolute flex justify-center items-center p-3 group pointer-events-auto" ${{
          class: () => this.isHorizontal ? '-left-6 top-1/2 -translate-y-1/2' : 'left-1/2 -top-6 -translate-x-1/2',
          onClick: ev => this.onClickAdd(ev, 'before'),
        }}>
          <div class="size-6 flex justify-center items-center rounded-full text-sm text-white bg-blue-400/25 group-hover:bg-blue-400">
            <div class="scale-75 nf nf-fa-plus"></div>
          </div>
        </button>
        <button class="absolute flex justify-center items-center p-3 group pointer-events-auto" ${{
          class: () => this.isHorizontal ? '-right-6 top-1/2 -translate-y-1/2' : 'left-1/2 -bottom-6 -translate-x-1/2',
          onClick: ev => this.onClickAdd(ev, 'after'),
        }}>
          <div class="size-6 flex justify-center items-center rounded-full text-sm text-white bg-blue-400/25 group-hover:bg-blue-400">
            <div class="scale-75 nf nf-fa-plus"></div>
          </div>
        </button>
      `)}
    </div>
  `;
}

export default MagicGloves;
