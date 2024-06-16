import d from '../other/dominant.js';

class IconsSidebar {
  constructor(props) { this.props = props }

  render = () => d.html`
    <div class="IconsSidebar flex flex-col border-r border-black/50 select-none" ${{ 'wf-disabled': () => this.props.tourDisable.has('IconsSidebar') }}>
      <div class="border-b border-black/50 transition-all text-xl gfont-[Pacifico] flex justify-center items-center select-none w-16 h-16">wf</div>
      ${this.renderButton('sites', 'nf-fa-sitemap')}
      ${this.renderButton('files', 'nf-fa-folder')}
      ${this.renderButton('styles', 'nf-fa-paint_brush')}
      ${this.renderButton('play', 'nf-fa-play')}
      ${this.renderButton('pause', 'nf-fa-pause')}
    </div>
  `;

  renderButton = (id, icon) => d.if(() => d.resolve(this.props.enabledIcons[id]), d.html`
    <button class="outline-none nf border-b border-black/50 transition-all text-xl hover:bg-black/70 w-16 h-16" ${{
      class: [`IconsSidebar-${id}Btn`, icon, () => id === this.props.currentPanel && 'bg-black/70'],
      onClick: () => this.props.onSelect(id),
    }}></button>
  `);
}

export default IconsSidebar;
