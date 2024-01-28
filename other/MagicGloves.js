import Boo from './boo.js';
import d from './dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class MagicGloves {
  constructor(iframe) {
    Object.assign(this, { iframe });
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
    iframe.contentDocument.body.addEventListener('click', this.onClick);
    iframe.contentWindow.addEventListener('keydown', this.onKeyDown);
    this.sov = new Boo(
      d.el(MagicOverlay, { s: () => this.state.designer.s }),
      () => this.state.designer.s,
      { origin: iframe, transitionClass: 'transition-all' },
    );
  }

  onClick = ev => {
    if (ev.ctrlKey) { return }
    ev.preventDefault();
    this.post('designer.select', ev.target);
  };

  onKeyDown = ev => {
    if (ev.key !== 'Escape' && this.iframe.contentDocument.activeElement.tagName !== 'BODY') { return }
    if (!this.state.designer.hasActionHandler(ev.key)) { return }
    ev.preventDefault();
    this.post('designer.command', ev.key);
  };

  destroy() { this.sov.disable() }
}

class MagicOverlay {
  constructor(props) { this.props = props }
  get s() { return d.resolve(this.props.s) }

  render = () => d.html`
    <div class="rounded border border-blue-400 opacity-1 z-10 pointer-events-none">
      <span class="absolute right-0 bottom-0 -mr-1 -mb-2 rounded-lg px-2 py-0.5 empty:hidden whitespace-nowrap font-2xs text-white bg-blue-400/90">
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
