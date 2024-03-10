import Boo from './boo.js';
import d from './dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class MagicGloves {
  constructor(iframe) {
    Object.assign(this, { iframe });
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });
    iframe.contentDocument.body.addEventListener('click', this.onClick, true);
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
    ev.stopPropagation();
    this.post('designer.select', ev.target);
  };

  onKeyDown = ev => {
    if (ev.key !== 'Escape' && this.iframe.contentDocument.activeElement.tagName === 'INPUT') { return }
    if (!this.state.designer.hasActionHandler(ev.key)) { return }
    ev.preventDefault();
    this.post('designer.command', ev.key);
  };

  destroy() { this.sov.disable() }
}

class MagicOverlay {
  constructor(props) { this.props = props }
  get s() { return d.resolve(this.props.s) }

  get slots() {
    if (this.s) {
      if (this.s.getAttribute('wf-if')) { return ['then', 'else'] }
      if (this.s.getAttribute('wf-dataloader')) { return ['loading', 'ready', 'error'] }
    }
    return [];
  }

  get activeSlot() { return [...this.s.children].find(x => x.getAttribute('wf-slot') && !x.hidden)?.getAttribute?.('wf-slot') }

  onActiveSlotChange = ev => {
    let name = ev.target.value;
    let target = [...this.s.children].find(x => x.getAttribute('wf-slot') === name);
    for (let x of this.s.children) {
      if (!x.getAttribute('wf-slot')) { continue }
      x.hidden = x !== target;
    }
    if (!target) { this.s.append(d.html`<div ${{ 'wf-slot': name }}><div class="Placeholder"></div></div>`) }
  };

  get color() {
    if (this.s) {
      if (this.s.getAttribute('wf-if') || this.s.getAttribute('wf-map') || this.s.getAttribute('wf-dataloader')) { return 'yellow-500' }
      if (this.s.getAttribute('wf-slot')) { return 'red-500' }
    }
    return 'blue-500';
  }

  render = () => d.html`
    <div ${{ class: ['rounded border opacity-1 z-10 pointer-events-none', () => `border-${this.color}`] }}>
      <span ${{ class: ['absolute right-0 bottom-0 -mr-1 -mb-2 rounded-lg px-2 py-0.5 empty:hidden whitespace-nowrap font-2xs text-white', () => `bg-${this.color}/90`] }}>
        <i class="nf nf-md-vector_square"></i>
        ${d.text(() => {
          if (!this.s || this.s.nodeType !== Node.ELEMENT_NODE) { return }
          if (this.s.getAttribute('wf-if')) { return 'if' }
          if (this.s.getAttribute('wf-map')) { return 'map' }
          if (this.s.getAttribute('wf-dataloader')) { return 'DataLoader' }
          let slotName = this.s.getAttribute('wf-slot');
          if (slotName) { return `slot: ${slotName}` }
          let txt = this.s.classList[0];
          if (/^[A-Z]/.test(txt)) { return txt }
          return this.s.tagName.toLowerCase();
        })}
      </span>
      ${d.if(() => this.slots.length, d.html`
        <span ${{ class: ['absolute left-0 top-0 -ml-1 -mt-2 rounded-lg px-2 py-0.5 empty:hidden whitespace-nowrap font-2xs text-white pointer-events-auto', () => `bg-${this.color}/90`] }}>
          <select class="bg-transparent" ${{ onChange: this.onActiveSlotChange }}>
            ${d.usePlaceholderTag('option', d.map(() => this.slots, x => d.html`<option ${{ name: x, selected: () => this.activeSlot === x }}>${x}</option>`))}
          </select>
        </span>
      `)}
    </div>
  `;
}

export default MagicGloves;
