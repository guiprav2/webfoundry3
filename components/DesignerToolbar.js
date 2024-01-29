import d from '../other/dominant.js';
import useCtrl from '../controllers/useCtrl.js';

class DesignerToolbar {
  constructor(props) {
    this.props = props;
    let [state, post] = useCtrl();
    Object.assign(this, { state, post });

    this.items = [
      ['btn', 'nf-md-menu_open', ','],
      ['btn', 'nf-fa-bars', '.'],
      ['sep'],
      ['sp-btn', 'nf-oct-x', 'Esc', () => this.post('designer.command', 'Escape')],
      ['s-btn', 'nf-md-arrow_right_bottom', 'l'],
      ['s-btn', 'nf-cod-chevron_left', 'k'],
      ['s-btn', 'nf-cod-chevron_right', 'j'],
      ['s-btn', 'nf-md-arrow_left_top', 'h'],
      ['h-sep'],
      ['s-btn', 'nf-md-alpha_a_box', 'a'],
      ['s-btn', 'nf-md-alpha_a', 'A'],
      ['s-btn', 'nf-md-alpha_i_box', 'i'],
      ['s-btn', 'nf-md-alpha_i', 'I'],
      ['s-btn', 'nf-md-eraser_variant', 'd'],
      ['h-sep'],
      ['s-btn', 'nf-cod-copy', 'c'],
      ['s-btn', 'nf-fa-paste', 'p'],
      ['s-btn', 'nf-md-alpha_p', 'P'],
      ['s-btn', 'nf-md-alpha_o_box', 'o'],
      ['s-btn', 'nf-md-alpha_o', 'O'],
      ['h-sep'],
      ['s-btn', 'nf-fa-paragraph', 'v'],
      ['h-sep'],
      ['s-btn', 'nf-fa-picture_o', 's'],
      ['s-btn', 'nf-fa-file_picture_o', 'S'],
      ['s-btn', 'nf-md-alpha_b_box', 'b'],
      ['s-btn', 'nf-md-alpha_b', 'B'],
      ['sep'],
      ['btn', 'nf-fa-paint_brush', '', () => this.post('app.changeTab', 'styles')],
      ['btn', 'nf-fa-print', '', () => this.designer.editorWindow.print()],
    ];
  }

  get designer() { return this.props.designer }
  get s() { return this.state.designer.s }
  get sPrev() { return this.state.designer.sPrev }

  moveStart = ev => {
    ev.target.setPointerCapture(ev.pointerId);
    addEventListener('pointermove', this.move);
    addEventListener('pointerup', this.moveEnd);
    this.draggable = ev.target.closest('.draggable');
    let rect = this.draggable.getBoundingClientRect();
    this.moveOffset = { x: ev.clientX - rect.left, y: ev.clientY - rect.top, w: rect.width };
  };

  moveEnd = ev => {
    removeEventListener('pointermove', this.move);
    removeEventListener('pointerup', this.moveEnd);
  };

  move = ev => {
    this.draggable.style.left = `${ev.clientX - this.moveOffset.x + (this.moveOffset.w / 2)}px`;
    this.draggable.style.top = `${ev.clientY - this.moveOffset.y}px`;
  };

  render = () => d.html`
    <div ${{ class: [
      'draggable absolute top-12 -translate-x-[50%] grid-cols-8 gap-2 w-[300px] md:w-auto rounded-lg py-2 px-3 backdrop-blur-md bg-neutral-800/80 text-neutral-300 mono gap-3 shadow-xl z-1000',
      () => !this.state.app.sidebarCollapsed ? 'left-[calc(50%_+_148px)]' : 'left-[50%]',
      () => !this.state.designer.toolbarCollapsed ? 'grid md:flex' : 'hidden',
    ]}}>
      <button class="w-5 h-5 nf nf-md-drag_vertical" ${{ onPointerDown: this.moveStart }}></button>
      ${d.map(() => this.items, x => d.html`
        ${d.if(() => x[0] === 'btn', d.html`
          <button ${{ class: () => ['shrink-0 w-6 h-6 flex relative top-[2px] nf', x[1]], onClick: () => x[3] ? x[3]() : this.post('designer.command', x[2]) }}>
            <div class="font-2xs relative top-[14px]">${x[2]}</div>
          </button>
        `)}
        ${d.if(() => x[0] === 's-btn', d.html`
          <button ${{
            class: ['shrink-0 w-6 h-6 flex relative top-[2px] nf', x[1], () => !this.s && 'opacity-50'],
            disabled: () => !this.s, onClick: () => x[3] ? x[3]() : this.post('designer.command', x[2]),
          }}>
            <div class="font-2xs relative top-[14px]">${x[2]}</div>
          </button>
        `)}
        ${d.if(() => x[0] === 'sp-btn', d.html`
          <button ${{
            class: ['shrink-0 w-6 h-6 flex relative top-[2px] nf', x[1], () => !this.s && !this.sPrev && 'opacity-50'],
            disabled: () => !this.s && !this.sPrev, onClick: () => x[3] ? x[3]() : this.post('designer.command', x[2]),
          }}>
            <div class="font-2xs relative top-[14px]">${x[2]}</div>
          </button>
        `)}
        ${d.if(() => x[0] === 'sep', d.html`
          <div class="col-span-8 border-b border-l border-neutral-400/50"></div>
        `)}
        ${d.if(() => x[0] === 'h-sep', d.html`
          <div class="hidden md:block border-l border-neutral-400/50"></div>
        `)}
      `)}
      <div class="md:hidden col-span-5"></div>
      <button class="w-5 h-5 nf nf-md-drag_vertical" ${{ onPointerDown: this.moveStart }}></button>
    </div>
  `;
}

export default DesignerToolbar;