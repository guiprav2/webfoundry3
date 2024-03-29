import ActionHandler from '../other/ActionHandler.js';
import DesignerToolbar from './DesignerToolbar.js';
import MagicGloves from '../other/MagicGloves.js';
import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class Designer {
  constructor(props) {
    this.props = props;
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
  }

  get path() { return this.props.path }
  get editorWindow() { return this.iframe.contentWindow }
  get editorDocument() { return this.iframe.contentDocument }
  onAttach = () => this.post('designer.setActionHandler', new ActionHandler(this));
  onDetach = () => { this.gloves && this.gloves.destroy(); this.post('designer.reset') };

  onLoad = () => {
    this.gloves?.destroy?.();
    if (this.state.app.mode === 'preview') { return }
    this.gloves = new MagicGloves(this.iframe);

    if (!this.editorDocument.querySelector('meta[name="viewport"]')) {
      this.editorDocument.head.prepend(d.html`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`);
    }

    this.editorDocument.body.classList.add('min-h-screen');

    if (!this.editorDocument.querySelector('.wf-preflight')) {
      let stylesheet = d.html`<link rel="stylesheet" class="wf-preflight">`;
      stylesheet.href = `${location.pathname}other/preflight.css`;
      this.editorDocument.head.prepend(stylesheet);
      let script = this.editorDocument.createElement('script');
      script.className = 'wf-windy';
      script.src = `${location.pathname}other/windy.js`;
      script.onload = () => this.iframe.classList.remove('hidden');
      this.editorDocument.head.append(script);
    } else {
      this.iframe.classList.remove('hidden');
    }

    let mutobs = new MutationObserver(() => this.post('app.saveFile', this.path, `<!doctype html>\n${this.editorDocument.documentElement.outerHTML}`));
    mutobs.observe(this.editorDocument.documentElement, { attributes: true, childList: true, subtree: true, characterData: true });
  };

  resizeStart = ev => {
    ev.target.setPointerCapture(ev.pointerId);
    ev.target.addEventListener('pointermove', this.resize);
  };

  resizeEnd = ev => {
    ev.target.releasePointerCapture(ev.pointerId);
    ev.target.removeEventListener('pointermove', this.resize);
  };

  resize = ev => {
    let r = this.leftPadding.getBoundingClientRect();
    let l = this.resizeBtn.getBoundingClientRect();
    let w = Math.max(400, ev.clientX - r.right);
    if (w >= l.left - 320) { this.content.style.maxWidth = '' }
    else { this.content.style.maxWidth = `${w}px` }
  };

  render = () => d.html`
    <div class="flex-1 flex">
      ${this.leftPadding = d.html`<div class="flex-1"></div>`}
      ${this.content = d.html`
        <div class="flex-1 basis-[100%] flex">
          ${d.el(DesignerToolbar, { designer: this })}
          ${this.iframe = d.html`
            <iframe class="hidden flex-1 bg-white" ${{
              onAttach: this.onAttach, onDetach: this.onDetach,
              src: () => `${this.state.app.mode}/${this.state.app.currentSite}/${this.path}`, onLoad: this.onLoad,
            }}>
          `}
        </div>
      `}
      ${this.resizeBtn = d.html`
        <button ${{
          class: ['block flex-1 px-2', () => !this.content && 'hidden'],
          onPointerDown: this.resizeStart, onPointerUp: this.resizeEnd,
        }}>
          <div class="w-1 h-16 self-center rounded-full bg-neutral-400"></div>
        </button>
      `}
    </div>
  `;
}

export default Designer;
