import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class StylesTab {
  constructor() {
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });

    d.effect(() => state.designer.replacingClass, x => {
      if (!this.classInput) { return }
      this.classInput.value = x || '';
      this.classInput.select();
    });
  }

  get s() { return this.state.designer.s }
  get styles() { return this.s ? [...this.s.classList] : [] }
  rmClass(x) { this.s.classList.remove(x) }

  onKeyDown = ev => {
    if (ev.key === 'Escape' && this.state.designer.replacingClass) { this.post('designer.replaceClass', null) }
    if (ev.key !== 'Enter') { return }
    let value = ev.target.value.trim();

    if (!this.state.designer.replacingClass) {
      if (!value) { return }
      this.s.classList.add(value);
    } else {
      if (!value) { this.post('designer.replaceClass', null); return }
      this.s.classList.remove(this.state.designer.replacingClass);
      this.s.classList.add(value);
      this.post('designer.replaceClass', null);
    }

    ev.target.value = '';
  };

  render = () => d.html`
    <div class="flex-1 overflow-auto">
      <div class="flex flex-col gap-1 p-3 text-sm">
        ${d.if(() => !this.s, d.html`
          <div class="px-3 py-1 italic">Select an element to change its styles.</div>
        `)}
        ${d.map(() => this.styles, x => d.html`
          <a href="#" class="" ${{
            class: ['flex gap-2 justify-between items-center rounded px-3 py-1', () => this.state.designer.replacingClass === x && 'text-neutral-300 bg-black/25'],
            onClick: ev => !ev.target.closest('button') && this.post('designer.replaceClass', x),
          }}>
            <div class="flex gap-2 items-center">
              <i class="nf nf-fa-paint_brush"></i>
              <span>${x}</span>
            </div>
            <div class="relative top-[-1px] flex gap-2">
              <button class="nf nf-fa-trash outline-none" ${{ onClick: () => this.rmClass(x) }}></button>
            </div>
          </a>
        `)}
        ${d.if(() => this.s, d.html`
          <div class="flex gap-2 justify-between items-center rounded px-3 py-1">
            <div class="flex gap-2 items-center">
              <i ${{ class: ['nf', () => this.state.designer.replacingClass ? 'nf-cod-replace' : 'nf-fa-plus'] }}></i>
              ${this.classInput = d.html`<input class="outline-none bg-transparent" placeholder="add class" ${{ onKeyDown: this.onKeyDown }}>`}
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
}

export default StylesTab;