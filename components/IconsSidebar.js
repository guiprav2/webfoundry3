import d from '../other/dominant.js';

class IconsSidebar {
  render = () => d.html`
    <div class="IconsSidebar flex flex-col border-r border-black/50 select-none" ${{ 'wf-disabled': () => state.app.tourDisable.has('IconsSidebar') }}>
      ${this.renderWfButton()}
      ${this.renderButton('sites', 'nf-fa-sitemap')}
      ${this.renderButton('files', 'nf-fa-folder')}
      ${this.renderButton('actions', 'nf-md-dots_vertical_circle')}
      ${this.renderButton('styles', 'nf-fa-paint_brush')}
      ${this.renderButton('play', 'nf-fa-play')}
      ${this.renderButton('pause', 'nf-fa-pause')}
    </div>
  `;

  renderWfButton = () => d.if(() => d.resolve(state.app.enabledSidebarIcons.wf), d.html`
    <button class="outline-none nf border-b border-black/50 transition-all text-xl hover:bg-black/70 w-16 h-16 gfont-[Pacifico]" ${{
      class: ['IconsSidebar-wfBtn', () => state.app.currentPanel === 'wf' && 'bg-black/70'],
      onClick: () => post('app.selectIcon', 'wf'),
    }}>wf</button>
  `);

  renderButton = (id, icon) => d.if(() => d.resolve(state.app.enabledSidebarIcons[id]), d.html`
    <button class="outline-none nf border-b border-black/50 transition-all text-xl hover:bg-black/70 w-16 h-16" ${{
      class: [`IconsSidebar-${id}Btn`, icon, () => id === state.app.currentPanel && 'bg-black/70'],
      onClick: () => post('app.selectIcon', id),
    }}></button>
  `);
}

export default IconsSidebar;
